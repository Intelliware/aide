# Overview — execute-quick-change

## Purpose

`execute-quick-change` is the third and final skill in the quick-dev flow. It
implements the plan's increments with TDD, verifies each one along three
dimensions (Completeness / Correctness / Coherence), runs adversarial PR
review with four lenses, creates atomic commits after explicit user
approval, halts at the Completion Confirmation Gate until the user
confirms the change works in their environment, and only then hands off to
`update-knowledge-base --scope=catalog-only` so the KB catalog reflects
the new behavior.

The skill anchors the legacy `expedited-implementation-package`'s execute +
deliver phases. The iron rules are non-negotiable:

1. No production code without a failing test first.
2. No success claim without fresh verification in the same turn — not from memory.
3. Never commit without explicit user approval.
4. Zero findings in adversarial review is a re-analysis trigger, not a pass.
5. **Solution Pivot Gate** — a failed verification that calls for a different approach is a hard halt: present one alternative with rationale and tradeoffs, wait for explicit user approval, then restart. No silent iteration.
6. **Solution constraints survive pivots** — the spec's §12.2a constraints (no regex, no new dependencies, etc.) must be honored on every iteration, including after a pivot.
7. **Completion Confirmation Gate** — the change is not done until the user confirms it works in their environment. The skill cannot self-close.

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
