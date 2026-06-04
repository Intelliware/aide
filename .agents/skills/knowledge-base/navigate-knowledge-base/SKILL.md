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

## Common mistakes

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
