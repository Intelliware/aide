# Overview — execute-quick-change

## Purpose

`execute-quick-change` is the third and final skill in the quick-dev flow. It
implements the plan's increments with TDD, verifies each one along three
dimensions (Completeness / Correctness / Coherence), runs adversarial PR
review with four lenses, creates atomic commits after explicit user
approval, and closes by handing off to `update-knowledge-base
--scope=catalog-only` so the KB catalog reflects the new behavior.

The skill anchors the legacy `expedited-implementation-package`'s execute +
deliver phases. The iron rules are non-negotiable: (1) no production code
without a failing test first; (2) no success claim without fresh
verification in the same turn — not from memory; (3) never commit without
explicit user approval; (4) zero findings in adversarial review is a
re-analysis trigger, not a pass.

The catalog-only KB hand-off is deliberate. Quick-dev changes are usually
component-local, so a full KB re-synthesis is overkill — the catalog update
re-indexes the touched component(s) and refreshes their
`last_verified_against_commit` without re-running architecture-level
synthesis. If the change turned out to affect cross-cutting concerns,
the user can always invoke `update-knowledge-base` without the scope flag
later.

## When to use

- Plan exists and has been approved
- Tests pass — clean starting state
- Codebase is accessible

## When NOT to use

- No plan yet — `plan-quick-change` first
- Plan failed clarity gate — back to `plan-quick-change`
- Elaborate flow — use `execute-increments` (task #6 NEW)
- Only need a PR for an existing diff — use `create-pr` directly

## Position in workflow

Last of three quick-dev skills. Followed by `update-knowledge-base
--scope=catalog-only`, which closes the quick-dev loop. The flow composition
`templates/compositions/quick-dev-spec.yaml` orchestrates the three quick-dev
skills end-to-end.
