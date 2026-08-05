---
slug: emit-navigate-md
sequence: 7
depends-on-prior: true
---

# Step 7 — Emit root NAVIGATE.md

## Goal

Write the agent-facing navigation document at `<kb>/NAVIGATE.md`. This file
is the AI agent's first read after opening the KB; it is short, imperative,
and tells the agent how to traverse the rest.

> **Legacy compatibility.** KBs built before this version emit the same
> file as `CLAUDE.md` at the same path. Readers (`navigate-knowledge-base`
> and downstream stage skills) resolve `NAVIGATE.md` first and fall back
> to `CLAUDE.md` if it is absent, so legacy KBs continue to work
> unmodified. New builds emit only `NAVIGATE.md`.

## Inputs

- The completed KB skeleton from steps 2–6.

## Required content

`<kb>/NAVIGATE.md` MUST contain, in order:

1. **One-line orientation.** "This is the knowledge base for `<project_name>`.
   Every framework skill that needs grounding reads this file first."

2. **Read-order block.**

   ```
   1. ARCHITECTURE.md (sections 0–4) for system shape, the solution-level
      pointers (§ 0), and the capability index (§ 4).
   2. shared/solution-context/* for project-scoped intent (mission, personas,
      goals, constraints, integrations, ownership). Cheap to grep by trigger
      keyword; never read all six leaves blindly.
   3. shared/ai-rules/project-context.md when about to write or modify code in
      any repo. This is the contract for tech stack, language conventions,
      testing discipline, and architectural must-nots.
   4. shared/operations/* when the work touches deployment, secrets, SLOs, or
      on-call concerns.
   5. graph.json for blast radius walks.
   6. components/<repo>/<id>.md for the specific components in scope.
   7. shared/entities/<id>.md for cross-component data semantics.
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

6. **Repo cross-link.** "Each repo has its own NAVIGATE.md at
   `repos/<code>/NAVIGATE.md` (legacy KBs: `CLAUDE.md`) — read that when
   narrowing into a single repo."

7. **Schema reference.** "Component frontmatter schema:
   `config/SCHEMAS.md` § 3.2 in A.I.D.E. graph.json schema: § 3.3.
   Edits MUST conform; `verify-knowledge-base-coverage` will reject
   non-conformant changes."

## Per-repo NAVIGATE.md (sanity check)

Step 2 created skeleton `repos/<code>/NAVIGATE.md` files. Re-confirm each
one contains:

1. The repo's role and primary tech.
2. A one-line "When the user's task touches this repo, …" navigator
   pointing at `components/<code>/`.
3. A pointer to the per-repo `README.md` for ownership and tech stack.

Re-write any per-repo NAVIGATE.md that is missing these three items.

For legacy KBs that carry `repos/<code>/CLAUDE.md` instead of
`NAVIGATE.md`, leave the existing file in place — the resolver pattern in
`navigate-knowledge-base` keeps it readable. Do not silently delete or
duplicate. If the user explicitly requests migration, rename
`CLAUDE.md` → `NAVIGATE.md` per-repo and at the root in a single pass.

## Acceptance

- `<kb>/NAVIGATE.md` exists and contains all 7 required sections.
- Every `<kb>/repos/<code>/NAVIGATE.md` exists and contains the 3 required
  items.
- Legacy `CLAUDE.md` files (root and/or per-repo) are tolerated for
  pre-existing KBs and are not overwritten unless migration is explicitly
  requested.

## Hand-off

`steps/08-validate-coverage.md`.
