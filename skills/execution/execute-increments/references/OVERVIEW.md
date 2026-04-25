# execute-increments — Overview

## Purpose

This skill executes an approved implementation package one increment at a
time. It is the execution-stage spine: the place where the Canonical
Increment Shape becomes working code. For each `INC-XXX`, it runs the Plan
items with TDD discipline, validates the Automated Verification (AI Gate),
surfaces the Human Verification (Human Gate) for sign-off, confirms the
Success Criteria, and updates `increment-status.md`.

Two iron rules drive this skill:

1. **No production code without a failing test first.** TDD is mandatory.
   For genuinely test-inapplicable steps (config, scaffolding), document
   why TDD does not apply before executing.
2. **No completion claim without fresh verification in the same turn.** The
   skill must run the proof commands inside the current turn and cite the
   output. Stale evidence, remembered runs, or subagent reports alone do
   not count.

The skill works on one increment at a time so the failure surface is
bounded — a problem in INC-007 cannot leak into INC-008 because INC-008
hasn't started.

## When to use

- The implementation package has been reviewed (`review-implementation-package`
  returned GO)
- The user authorizes execution
- The codebase is in a clean state (existing tests pass)

## When NOT to use

- The package has not been reviewed — run `review-implementation-package`
  first; a NO-GO blocks this skill
- Bug logging / triage / closure — use `manage-bugs` (independently
  invocable; this skill invokes it as needed but does not duplicate it)
- PR / commit packaging — use `create-pr` after the increments in scope are
  complete
- One-off small changes — use `quick-dev/execute-quick-change`

## Position in workflow

```
planning/review-implementation-package
    └─► (GO)
        └─► execution/execute-increments      ◄── this skill
            ├─► execution/manage-bugs (invoked when bugs surface)
            ├─► knowledge-base/update-knowledge-base (closing handoff per increment)
            └─► execution/create-pr (when increments in scope are complete)
```

## Per-increment loop

For each increment:

```
1. Load increment        ── steps/01-load-increment.md
2. Execute Plan (TDD)    ── steps/02-execute-plan.md
3. Run AI Gate           ── steps/03-ai-gate.md
4. Run Human Gate        ── steps/04-human-gate.md
5. Verify Success Criteria ── steps/05-success-criteria.md
6. Update status + KB    ── steps/06-status-update.md
```

Stop conditions inside the loop:

- AI Gate fails → debug and fix; do not proceed
- Human Gate has unresolved findings → wait for user
- Success Criteria not all met → return to step 2
- Bug surfaces → invoke `manage-bugs`, then resume

After step 6, either move to the next increment or stop at the user's
checkpoint.
