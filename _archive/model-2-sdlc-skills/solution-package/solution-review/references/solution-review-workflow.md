# Solution Review Workflow

Run formal solution review only after `docs/<feature>/solutions-package/solution-package.md` has been assembled by the solution design phase. Each review produces findings and a verdict.

## Sequential Execution Rule

Run reviews strictly in the order below. Do not skip ahead and do not run reviews in parallel. After each review, present the findings and verdict to the user. Blocking findings must be resolved or explicitly accepted before the next review starts.

| Order | Reference | What it validates |
|-------|-----------|-------------------|
| 1 | [review-architecture.md](review-architecture.md) | Structural soundness, scalability, resilience, maintainability |
| 2 | [review-security-posture.md](review-security-posture.md) | Security vulnerabilities, authentication, authorization, data protection, and compliance posture |
| 3 | [review-solution-readiness.md](review-solution-readiness.md) | Final GO / CONDITIONAL GO / NO-GO gate for implementation handoff |

## Fail Recovery

When a review returns NO-GO or blocking findings:

1. Stop the sequence.
2. Present the findings and the affected package sections.
3. Help the user resolve the findings if asked.
4. Re-run the failed review from the beginning.
5. If the fix changes content checked by an earlier passed review, explicitly assess whether that earlier verdict is still valid. Re-run that earlier review only when its checked content was materially changed.

## Readiness Gate

`review-solution-readiness.md` runs last. A GO or user-accepted CONDITIONAL GO is required before implementation handoff. A NO-GO blocks handoff.

## Phase Handoff

After readiness returns GO or user-accepted CONDITIONAL GO, ask the user:

> Solution review is approved for implementation planning. Are you ready to proceed with implementation package handoff?

If yes, summarize the approved solution package, accepted risks, open assumptions, open questions, and implementation handoff notes. If no, stop and summarize the approved state and the remaining handoff step.
