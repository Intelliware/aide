---
slug: emit-claude-md
sequence: 7
depends-on-prior: true
---

# Step 7 — Emit root CLAUDE.md

## Goal

Write the agent-facing navigation document at `<kb>/CLAUDE.md`. This file
is the AI agent's first read after opening the KB; it is short, imperative,
and tells the agent how to traverse the rest.

## Inputs

- The completed KB skeleton from steps 2–6.

## Required content

`<kb>/CLAUDE.md` MUST contain, in order:

1. **One-line orientation.** "This is the knowledge base for `<project_name>`.
   Every framework skill that needs grounding reads this file first."

2. **Read-order block.**

   ```
   1. ARCHITECTURE.md (sections 1–4) for system shape and capability index.
   2. graph.json for blast radius walks.
   3. components/<repo>/<id>.md for the specific components in scope.
   4. shared/entities/<id>.md for cross-component data semantics.
   ```

3. **Selection rule.** "Never read the whole KB. Use
   `navigate-knowledge-base` (or its inline equivalent: capability lookup
   in ARCHITECTURE.md § 4 + one-hop graph expansion) to choose the
   minimal component set. Default cap: 7 components."

4. **Freshness rule.** "If `last_verified_against_commit` on a component
   does not match its repo's current HEAD AND the changed files overlap
   the component's `paths:`, treat the component body as suggestive and
   verify against source."

5. **Update rule.** "When you finish a feature, do not edit this KB by
   hand. Invoke `update-knowledge-base` with the implementation
   increment, the git diff, and the feature ID."

6. **Repo cross-link.** "Each repo has its own CLAUDE.md at
   `repos/<code>/CLAUDE.md` — read that when narrowing into a single
   repo."

7. **Schema reference.** "Component frontmatter schema:
   `config/SCHEMAS.md` § 3.2 in theframework. graph.json schema: § 3.3.
   Edits MUST conform; `verify-knowledge-base-coverage` will reject
   non-conformant changes."

## Per-repo CLAUDE.md (sanity check)

Step 2 created skeleton `repos/<code>/CLAUDE.md` files. Re-confirm each one
contains:

1. The repo's role and primary tech.
2. A one-line "When the user's task touches this repo, …" navigator
   pointing at `components/<code>/`.
3. A pointer to the per-repo `README.md` for ownership and tech stack.

Re-write any per-repo CLAUDE.md that is missing these three items.

## Acceptance

- `<kb>/CLAUDE.md` exists and contains all 7 required sections.
- Every `<kb>/repos/<code>/CLAUDE.md` exists and contains the 3 required
  items.

## Hand-off

`steps/08-validate-coverage.md`.
