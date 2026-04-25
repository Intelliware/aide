# Review Workflow

Run formal review only after `docs/<feature>/requirements-package/requirements-package.md` has been assembled by the requirements writing phase. Each review produces findings and a PASS, PASS WITH OBSERVATIONS, or FAIL verdict.

## Sequential Execution Rule

Run reviews strictly in the order below. Do not skip ahead and do not run reviews in parallel. After each review, present the findings and verdict to the user. A FAIL verdict must be resolved before the next review starts.

| Order | Reference | What it checks |
|-------|-----------|----------------|
| 1 | [review-scope.md](review-scope.md) | Scope is well-defined, bounded, and free of creep |
| 2 | [review-completeness.md](review-completeness.md) | No missing requirements, undefined edge cases, or coverage gaps |
| 3 | [review-consistency.md](review-consistency.md) | No contradictions, ambiguity, or duplicates within or across artifacts |
| 4 | [review-measurability.md](review-measurability.md) | All requirements use quantifiable language and SMART scoring |
| 5 | [review-testability.md](review-testability.md) | Every requirement has verifiable acceptance criteria |
| 6 | [review-implementation-leakage.md](review-implementation-leakage.md) | Specifications describe what, not how |
| 7 | [review-data-completeness.md](review-data-completeness.md) | Data dictionary and data impacts are fully specified |
| 8 | [review-traceability.md](review-traceability.md) | Requirements trace forward to acceptance criteria and backward to needs |
| 9 | [review-feasibility.md](review-feasibility.md) | No structurally infeasible or constraint-violating requirements |
| 10 | [review-requirements-readiness.md](review-requirements-readiness.md) | Final go/no-go gate for architect handoff |

## Fail Recovery

When a review returns FAIL:

1. Stop the sequence.
2. Present the findings and the affected package sections.
3. Help the user resolve the findings if asked.
4. Re-run the failed review from the beginning.
5. If the fix changes content checked by an earlier passed review, explicitly assess whether that earlier verdict is still valid. Re-run that earlier review only when its checked content was materially changed.

## Readiness Gate

`review-requirements-readiness.md` runs last. An APPROVED verdict is the only condition that permits architect handoff.

## Phase Handoff

After readiness returns APPROVED, ask the user:

> Requirements review is approved. Are you ready to proceed with architect handoff?

If yes, summarize the approved package, accepted risks, open assumptions, open questions, and points of contact for the architect. If no, stop and summarize the approved state and the remaining handoff step.
