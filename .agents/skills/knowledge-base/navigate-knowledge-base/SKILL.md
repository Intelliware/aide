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
| `--include-solution-context` (bool, default true) | Caller | No — when true, surfaces matching `shared/{solution-context,ai-rules,operations}/` leaves as their own tiers, ranked below component matches and exempt from `--max-components` |
| `--depth` (one-hop / two-hop, default one-hop) | Caller | No |
| `--profile` (`default` / `test-suite`, default `default`) | Caller | No — when `test-suite`, biases ranking toward `kind: test-suite` components produced by `reverse-engineer-test-suite`; consumed by the merged quality stage's skills (`create-quality-package`, `execute-quality-increments`, `audit-quality-coverage`, `review-test-failures`) |
| `--profile-subkind` (one of `runner` / `shared-utilities` / `fixtures` / `marker-vocabulary` / `feature-inventory` / `environment-matrix` / `ci-surface` / `ownership`, repeatable) | Caller | No — restricts a `--profile=test-suite` query to the named subkind(s); used by e.g. `review-test-failures` to fetch `shared-utilities` only for locator lookup |

See `references/INPUTS-OUTPUTS.md`.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

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
5. **Solution-context injection.** If `--include-solution-context` (default
   true), grep frontmatter `triggers:` lists in:
   - `<knowledge_base_path>/shared/solution-context/*.md`
   - `<knowledge_base_path>/shared/ai-rules/*.md`
   - `<knowledge_base_path>/shared/operations/*.md` (and
     `shared/operations/runbooks/*.md` when present)

   Append each match as a `solution-context` / `ai-rules` / `operations` tier
   entry. These tiers rank **below** primary component matches on purpose: the
   calling skill should load components first and reach for the human-grounded
   leaves when the feature is project-scoped — an architecture, compliance, or
   ownership question — rather than a single-component change.
6. **Cap and rank.** Apply `--max-components` cap. Ranking:
   primary-match > one-hop neighbour > two-hop neighbour > cross-cutting >
   solution-context > ai-rules > operations. Within a tier, rank by
   trigger-overlap score.

   **The cap applies to components only.** Solution-context, ai-rules, and
   operations entries are returned alongside the capped component list without
   competing for slots — those leaves are small and cheap, and letting them
   displace a component would trade the answer for its context.
7. **Return.** Output is a JSON-or-markdown list of:
   - `path` (relative to KB root, ready for read).
   - `tier` (`primary` / `one-hop` / `two-hop` / `cross-cutting` /
     `solution-context` / `ai-rules` / `operations`).
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

A **profile** is a named query bias the caller selects with `--profile`. It does not
change the workflow steps; it changes how step 2 (capability lookup) and step 6 (cap and
rank) weight components. `default` applies the behaviour described above with no
frontmatter filtering.

The `test-suite` profile and the `--profile-subkind` filter are documented in
`references/OVERVIEW.md` § Profiles — including the per-step weighting and the
empty-primary-set case when the KB has not yet ingested a `reverse-engineer-test-suite`
output.
