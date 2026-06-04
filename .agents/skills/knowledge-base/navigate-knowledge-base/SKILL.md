---
name: navigate-knowledge-base
description: "Use when any stage skill (requirements, design, planning, execution, quick-dev) needs to load grounding context from the KB before starting work, or when a feature description / change scope arrives and only a minimal component subset must be selected to read. Returns the ranked component file list for the agent to load — the agent must NOT read the whole KB."
---

# Navigate Knowledge Base

Selective component lookup. Given a feature description (free text or a list
of triggers / keywords), returns the **minimal component set** the calling
agent should load. This is the load-time selector for the entire framework —
every stage's skills call it before grounding.

## Overview

The KB is markdown-first and traversed by agentic search; reading the whole
thing is wasteful and pushes the agent into context-pressure failure modes.
This skill performs the read pattern the root `NAVIGATE.md` instructs
(legacy KBs: `CLAUDE.md` — see the navigation-file resolver below):

0. **Resolve the navigation file.** Read `<knowledge_base_path>/NAVIGATE.md`
   if it exists; otherwise read `<knowledge_base_path>/CLAUDE.md`. The same
   fallback applies to per-repo navigation files under `repos/<code>/`.
   This keeps KBs built before the `CLAUDE.md` → `NAVIGATE.md` rename
   fully compatible without any per-KB migration step.
1. Read `ARCHITECTURE.md` (§ 1–4) — cheap, always.
2. Hit the Capability Index → narrow to a small set of `component_id`s.
3. Walk `graph.json` one hop on `depends_on` / `consumed_by`.
4. Return the resolved file paths plus a one-line "why this was selected"
   reason for each.

The output is a list — the calling skill decides how to consume it (read all,
read top-N, read frontmatter only, etc.).

## When to use

- Any stage skill (requirements, design, planning, execution, quick-dev) is
  about to start work and needs the KB-grounded context.
- The user has described a feature, bug, or change and you need to know
  which components are in scope.
- An agent in execute-increments needs to confirm the components touched
  by an increment before opening source files.
- A refactor / impact analysis needs the blast radius of a known component
  (uses `--seed-component-id` as input rather than free text).

## When NOT to use

- The KB does not yet exist → run `build-knowledge-base` first.
- The agent needs to update the KB after a feature ships → use
  `update-knowledge-base`.
- The user is asking "is the KB up to date?" → use
  `detect-knowledge-base-drift` or `verify-knowledge-base-coverage`.
- The query is broad enough that the whole `ARCHITECTURE.md` is the right
  answer (a literal "show me what this system does" question — read
  `ARCHITECTURE.md` directly without invoking this skill).

## Inputs

| Input | Source | Required |
|---|---|---|
| Feature description (free text or trigger list) | Caller | Yes (or `--seed-component-id`) |
| `--seed-component-id` | Caller | Yes (or feature description) |
| `knowledge_base_path` | `project.toml` `[project.paths]` | Yes |
| `--max-components` (default 7) | Caller | No |
| `--include-cross-cutting` (bool, default true) | Caller | No |
| `--depth` (one-hop / two-hop, default one-hop) | Caller | No |
| `--profile` (`default` / `test-suite`, default `default`) | Caller | No — when `test-suite`, biases ranking toward `kind: test-suite` components produced by `reverse-engineer-test-suite`; consumed by the merged quality stage's skills (`create-quality-package`, `execute-quality-increments`, `audit-quality-coverage`, `review-test-failures`) |
| `--profile-subkind` (one of `runner` / `shared-utilities` / `fixtures` / `marker-vocabulary` / `feature-inventory` / `environment-matrix` / `ci-surface` / `ownership`, repeatable) | Caller | No — restricts a `--profile=test-suite` query to the named subkind(s); used by e.g. `review-test-failures` to fetch `shared-utilities` only for locator lookup |

See `references/INPUTS-OUTPUTS.md`.

## Workflow

This skill is single-shot — no `steps/` folder. The flow is:

1. **Read `ARCHITECTURE.md`** at `<knowledge_base_path>/ARCHITECTURE.md`.
2. **Capability lookup.** Match feature description / triggers against the
   Capability Index (§ 4). Strategy:
   - Tokenise the feature description; lemmatise verbs and nouns.
   - For each capability row, score by token overlap with the capability
     string and by overlap with each contributing component's
     `triggers` (read just the frontmatter via grep to avoid loading
     bodies).
   - Keep components with score ≥ a threshold; tie-break by repo
     primary-status.
3. **Graph expansion.** For each candidate component, read
   `<knowledge_base_path>/graph.json` and walk:
   - One hop along `depends_on` (outgoing).
   - One hop along `consumed_by` (incoming, derived from `depends_on`
     inverses).
   - With `--depth=two-hop`, repeat once more.
4. **Cross-cutting injection.** If `--include-cross-cutting` (default), and
   the feature description matches any cross-cutting concern keyword
   (auth, log, error, security, performance, version), append the
   `shared/cross-cutting/<concern>.md` pointer.
5. **Cap and rank.** Apply `--max-components` cap. Ranking:
   primary-match > one-hop neighbour > two-hop neighbour. Within a tier,
   rank by trigger-overlap score.
6. **Return.** Output is a JSON-or-markdown list of:
   - `path` (relative to KB root, ready for read).
   - `tier` (`primary` / `one-hop` / `two-hop` / `cross-cutting`).
   - `why` (one sentence — which trigger / capability / edge selected it).

## Output

A ranked component list (the skill writes nothing to disk). Example:

```
1. components/api-orders/order-checkout-flow.md   [primary]
   why: matches capability "place order"; trigger "submit cart" in feature description.
2. components/api-billing/billing-payment-authorization.md   [one-hop]
   why: order-checkout-flow depends_on this (calls).
3. components/web-portal/web-portal-checkout-page.md   [one-hop]
   why: order-checkout-flow consumed_by this (calls).
4. shared/cross-cutting/auth.md   [cross-cutting]
   why: feature description mentions "authenticated buyer".
```

## Next skill
none — returns context to caller.

## Profiles

A **profile** is a named query bias the caller selects with `--profile`.
It does not change the workflow steps; it changes how step 2 (capability
lookup) and step 5 (cap and rank) weight components.

### `default` profile

The behaviour described above. No frontmatter filtering; all components
in the capability index are eligible.

### `test-suite` profile

Used by the merged quality stage to ground in test-suite documentation
rather than application code.

- **Step 2 (capability lookup):** filter the capability index to
  components whose frontmatter declares `kind: test-suite` (produced
  by `reverse-engineer-test-suite`). Score and shortlist as usual,
  but draw the candidate pool from that filtered set.
- **Step 3 (graph expansion):** walk one hop on `depends_on` /
  `consumed_by` as usual; do **not** filter the expansion — the
  expansion correctly pulls in the application components the test
  suite tests (recorded in `tests:` frontmatter), which the caller
  typically wants to see alongside the suite components.
- **Step 5 (cap and rank):** within tiers, prefer `kind: test-suite`
  components over application components. The fan-out of one suite
  query to application components is expected and useful — but
  applications should never out-rank the suite components for a
  test-suite-profile query.
- **`--profile-subkind` filter (optional):** restrict the primary
  selection to the named subkind(s). Example:
  `--profile=test-suite --profile-subkind=shared-utilities` returns
  only `shared-utilities.md` components plus their one-hop
  expansion. Useful for `review-test-failures`'s locator lookup.

If no components carry `kind: test-suite` (the KB has not yet ingested
a `reverse-engineer-test-suite` output), the profile returns an empty
primary set and the caller is told:

> No test-suite components found in the KB. Run
> `/reverse-engineer-test-suite` against the suite repo, then
> `/build-knowledge-base` or `/update-knowledge-base` to fold the
> components in. Falling back to the `default` profile would return
> application components, which is not what a test-grounded query
> needs.

The caller (typically a quality-stage skill) then decides whether to
abort or proceed with a clearly-flagged "no KB grounding available"
note.



- **Returning more than `--max-components`.** The default cap exists for
  good reason; raise it consciously, not by default.
- **Reading component bodies during selection.** Bodies are expensive;
  selection reads frontmatter only (via grep against the YAML block).
- **Forgetting `consumed_by` (incoming edges).** A feature touching A
  often impacts everyone who calls A; one-hop must include both
  directions.
- **Greedy two-hop expansion.** Two-hop can balloon to 20+ components;
  use `--depth=two-hop` only on explicit caller request.
- **Skipping the capability index in favour of pure trigger grep.**
  Capability is the curated routing layer; it disambiguates trigger
  collisions (e.g. `pay` matches both checkout and refund flows).
- **Stale-component blindness.** This skill does NOT verify freshness.
  It returns components with their stated `last_verified_against_commit`
  and lets the caller decide. If freshness matters, the caller should
  run `detect-knowledge-base-drift --mode=gate` first.
- **Falling back to the `default` profile when `test-suite` returns
  empty.** A quality-stage caller that needs test-suite grounding
  should never silently substitute application components — that
  produces correct-looking but wrong results. Always surface the
  empty-profile case to the caller and let it decide.
- **Using `--profile=test-suite` for application-feature queries.**
  Profiles are not free filters — `test-suite` is for quality-stage
  callers grounding in test artefacts. A requirements or design skill
  should always use the `default` profile.
