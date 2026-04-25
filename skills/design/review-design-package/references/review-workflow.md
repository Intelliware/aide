# Review Workflow

Folded from `model-2-sdlc-skills/solution-package/solution-review/references/solution-review-workflow.md`.

Run formal review only after the design package has been assembled by `create-design-package`. Each review produces findings and a verdict.

## Sequential execution rule

Run reviews strictly in the order below. Do not skip ahead and do not run reviews in parallel. After each review, present findings and verdict to the user. A NO-GO or blocking finding halts the sequence until resolved.

| Order | Review | Reference (in source skill) | What it validates |
|---|---|---|---|
| 1 | review-architecture | `review-architecture.md` | Structural soundness, scalability, resilience, maintainability |
| 2 | review-security-posture | `review-security-posture.md` | Security vulnerabilities, authn/authz, data protection, compliance posture |
| 3 | review-solution-readiness | `review-solution-readiness.md` | Final GO / CONDITIONAL GO / NO-GO gate for planning handoff |

The deeper per-review checklists live in `model-2-sdlc-skills/solution-package/solution-review/references/<review>.md` for now and will be lifted to `templates/blocks/design/review-*.md` in a later migration task. Until then, this skill points authors to those legacy files for the detailed checklists.

## Verdicts

- PASS — no findings; proceed to next review.
- PASS WITH OBSERVATIONS — findings non-blocking; user must explicitly accept.
- FAIL — halt the sequence; resolve before continuing.
- (Readiness only) GO — all reviews PASS or PASS WITH OBSERVATIONS (accepted); planning handoff permitted.
- (Readiness only) CONDITIONAL GO — APPROVED with one or more documented conditions the planning phase must observe (e.g., "monitor partner-API rate limits during increment 2"). User must accept conditions; planning handoff permitted with the conditions recorded.
- (Readiness only) NO-GO — one or more reviews returned FAIL that could not be resolved within this pass; planning handoff is blocked.

## Fail recovery

When a review returns FAIL or blocking finding:
1. Stop the sequence.
2. Present findings and the affected package sections.
3. Help the user resolve the findings if asked (bracketed fix-then-re-validate cycle).
4. Re-run the failed review from the beginning.
5. If the fix changes content checked by an earlier passed review, explicitly re-assess that earlier verdict and re-run if its checked content materially changed.
6. Append a `Review finding` row to the design `change-tracker.md` for every item modified.

## Readiness gate

`review-solution-readiness` runs last. A GO or user-accepted CONDITIONAL GO is required before planning handoff. A NO-GO blocks handoff.

The readiness gate also confirms:
- Requirements readiness verdict is APPROVED or accepted CONDITIONAL.
- The design's recorded requirements-package version matches the current version in the requirements `change-tracker.md` (per the Requirements Version Tracking protocol).
- All ADR IDs referenced from the design resolve to actual ADR files.
- The completeness tracker shows every applicable block as `Complete` or `N/A` with gate.

## Phase handoff

After readiness returns GO or accepted CONDITIONAL GO, ask the user:

> Solution review is approved for implementation planning. Are you ready to proceed with implementation package handoff?

If yes, summarize the approved design package, accepted observations, conditional notes, accepted risks, open assumptions, open questions, and implementation handoff notes. Then invoke `create-implementation-package` (or recommend that invocation).

If no, stop and summarize the approved state and the remaining handoff step.

## Composition awareness

Honor `decision-gates` from the active composition. Reviews of gated blocks (e.g., `design/integration-design` when `has_external_integrations == false`) are skipped with a note in the verdict file. The completeness tracker in the design change tracker should already record these as `N/A`; if not, flag as an inconsistency in review-architecture.
