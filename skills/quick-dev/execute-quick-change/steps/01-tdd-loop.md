---
slug: tdd-loop
sequence: 1
depends-on-prior: false
---

# Step 1 — TDD per task

For every task inside an increment, run RED–GREEN–REFACTOR. The iron rule:
**no production code without a failing test first.** Code written ahead of
tests must be deleted and redone.

## RED — write a failing test

1. Pick the smallest behavior that moves the increment forward.
2. Write a single test asserting that behavior.
3. Run the test. Confirm it fails for the **expected reason** (not for an
   import error or a typo). Capture the failure message in the same turn.

## GREEN — make it pass

1. Write the minimum code that makes the test pass.
2. Run the test. Confirm it passes — re-run, do not rely on memory.
3. Run the rest of the affected test file. Existing tests stay green.

## REFACTOR — clean up

1. Improve naming, structure, and removal of duplication without changing behavior.
2. Run the tests again. Same green status.
3. If a refactor introduces a behavior change, that is no longer a refactor —
   write a new RED test first.

## Verification cadence

Every step that ends in "run the test" runs the test for real, in the same
turn, before moving on. Never claim a test passes "from the last run". The
verification window is now.

## When the loop breaks

If a test fails unexpectedly mid-loop, stop the loop and run systematic
debugging (4-phase RCA: reproduce, isolate, root cause, fix). Patches without
root causes are rejected — the bug returns disguised.

## When the increment closes

The increment closes only when:

- All planned tasks have a green RED → GREEN → REFACTOR triple
- The full affected test suite is green
- Lint is green
- The increment's AI Gate test commands pass
- The user has explicitly approved the diff
