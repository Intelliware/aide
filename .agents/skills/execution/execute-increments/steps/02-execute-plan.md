---
slug: 02-execute-plan
sequence: 2
depends-on-prior: true
---

# Step 2 — Execute Plan with TDD

## Purpose

Implement the increment's Plan items. TDD is mandatory: no production code
without a failing test first.

## Iron rules

1. **No production code without a failing test first.** Code written before
   the failing test must be deleted and redone.
2. **One Plan item at a time.** Do not merge Plan items into one
   implementation pass.
3. **Verify each item before proceeding.** Run tests after each Plan item;
   fresh evidence in the current turn. A failing test for the next Plan
   item does not count as verification of the prior one.
4. **For genuinely test-inapplicable steps** (config files, scaffolding,
   data seed setup), **document why TDD does not apply** before executing.

## TDD cycle (per Plan item)

```
RED ─► VERIFY-FAIL ─► GREEN ─► VERIFY-PASS ─► REFACTOR ─► RE-VERIFY ─► next
```

| Phase | What you do |
|---|---|
| RED | Write the smallest test that captures the next behavior the Plan item requires |
| VERIFY-FAIL | Run the test. Confirm it fails for the expected reason. Cite the failure output |
| GREEN | Write the minimum production code that makes the test pass |
| VERIFY-PASS | Run the test. Confirm it passes. Cite the pass output |
| REFACTOR | Clean up without changing behavior |
| RE-VERIFY | Re-run the test. Confirm still passing. Cite the output |

## Three verification dimensions

When verifying a Plan item, check all three before moving on:

| Dimension | What it checks |
|---|---|
| Completeness | All acceptance criteria implemented; all spec scenarios have code + tests |
| Correctness | Implementation matches design intent; edge cases handled; error states match spec |
| Coherence | Naming, patterns, and conventions consistent with codebase + project-context |

## Logging bugs surfaced during execution

If you discover a bug or missed requirement that is **out of scope for this
increment**, do not fix it inline. Invoke `manage-bugs` (separate skill) to
log it. Continue executing the current increment's Plan.

If the bug **blocks completion of this increment**, stop and surface it.
Recommend running `manage-bugs` to log, then either fix here (if scope
permits) or pause this increment.

## Pre-implementation gates (one-time check)

Before writing the first failing test for the increment, verify:

- **Simplicity gate** — no Plan item does more than one logical thing; no
  speculative tasks
- **Clarity gate** — no `[NEEDS CLARIFICATION]` markers anywhere in the
  increment file
- **Integration-first gate** — contracts and test boundaries are specified;
  existing test suite passes

If any gate fails, halt — recommend re-running `review-implementation-package`.

## Acknowledgement checkpoint

Before proceeding to `steps/03-ai-gate.md`:

1. Summarize what each Plan item produced — files changed, tests added, behavior added — in chat.
2. Ask: "Plan items complete — ready to run the AI Gate?"
3. Wait for explicit confirmation. The AI Gate then re-verifies with fresh evidence; this checkpoint is the human "implementation looks right" pre-check.

## Output of this step

- Working code in the target codebase, with test coverage from TDD
- All Plan items executed and individually verified in the current turn
- Any out-of-scope bugs logged via `manage-bugs`
- Working tree dirty with the increment's diff (commits happen later via
  `create-pr`)
