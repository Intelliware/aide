# Review Workflow

Folded from `model-2-sdlc-skills/requirement-package/requirements-review/references/review-workflow.md`.

Run formal review only after `requirements-package.md` has been assembled by `create-requirements-package`. Each review produces findings and a PASS / PASS WITH OBSERVATIONS / FAIL verdict.

## Sequential execution rule

Run reviews strictly in the order below. Do not skip ahead and do not run reviews in parallel. After each review, present findings and verdict to the user. A FAIL verdict halts the sequence until resolved.

**MANDATORY — Create artifact files on disk after each review:**

1. After presenting a review's findings and the user accepts the verdict, **immediately write** `review/<review-name>.md` to disk (at the output path declared in `INPUTS-OUTPUTS.md`). Create the `review/` directory if it does not already exist.
2. After Review 10 (`review-requirements-readiness`) is complete and the user accepts the final verdict, **immediately write** `review/readiness-verdict.md` to disk with the APPROVED / CONDITIONAL / BLOCKED verdict and summary.
3. Do NOT defer file creation to "after all reviews complete". Each file is written incrementally as the review progresses.
4. Presenting findings only in chat without writing the corresponding file to disk is a **skill violation**.

| Order | Review | Reference (in source skill) | What it checks |
|---|---|---|---|
| 1 | review-scope | `review-scope.md` | Scope is well-defined, bounded, free of creep |
| 2 | review-completeness | `review-completeness.md` | No missing requirements, undefined edge cases, coverage gaps |
| 3 | review-consistency | `review-consistency.md` | No contradictions, ambiguity, duplicates within or across artifacts |
| 4 | review-measurability | `review-measurability.md` | All requirements use quantifiable language and SMART scoring |
| 5 | review-testability | `review-testability.md` | Every requirement has verifiable acceptance criteria |
| 6 | review-implementation-leakage | `review-implementation-leakage.md` | Specifications describe what, not how |
| 7 | review-data-completeness | `review-data-completeness.md` | Data dictionary and data impacts fully specified |
| 8 | review-traceability | `review-traceability.md` | Requirements trace forward to acceptance criteria and backward to needs |
| 9 | review-feasibility | `review-feasibility.md` | No structurally infeasible or constraint-violating requirements |
| 10 | review-requirements-readiness | `review-requirements-readiness.md` | Final go/no-go gate for design handoff |

The deeper per-review checklists live in `model-2-sdlc-skills/requirement-package/requirements-review/references/<review>.md` for now and will be lifted to `templates/blocks/requirements/review-*.md` in a later migration task. Until then, this skill points authors to those legacy files for the detailed checklists.

## Verdicts

- PASS — no findings; proceed to next review.
- PASS WITH OBSERVATIONS — findings are non-blocking; user must explicitly accept them and the skill records that acceptance in the verdict file.
- FAIL — halt the sequence; resolve before continuing.

## Fail recovery

When a review returns FAIL:
1. Stop the sequence.
2. Present findings and the affected package sections.
3. Help the user resolve the findings if asked (bracketed fix-then-re-validate cycle).
4. Re-run the failed review from the beginning.
5. If the fix changes content checked by an earlier passed review, explicitly re-assess that earlier verdict and re-run if its checked content materially changed.
6. Append a `Review finding` row to `change-tracker.md` for every item modified.

## Readiness gate

`review-requirements-readiness` runs last. Verdicts:
- APPROVED — all reviews PASS or PASS WITH OBSERVATIONS (accepted), all gates met. Design handoff is permitted.
- CONDITIONAL — APPROVED with one or more documented conditions the design phase must observe (e.g., "monitor partner-API rate limits during design"). User must accept conditions explicitly. Design handoff is permitted with the conditions recorded in the verdict file and surfaced in the handoff summary.
- BLOCKED — one or more reviews returned FAIL that could not be resolved within this pass; design handoff is blocked.

## Phase handoff

After readiness returns APPROVED or CONDITIONAL, ask the user:

> Requirements review is approved. Are you ready to proceed with architect handoff?

If yes, summarize the approved package, accepted observations, conditional notes, accepted risks, open assumptions, open questions, and points of contact for the architect. Then invoke `create-design-package` (or recommend that invocation if the orchestrator does not auto-route).

If no, stop and summarize the approved state and the remaining handoff step.

## Composition awareness

Honor `decision-gates` from the active composition. Reviews of gated blocks (e.g., `requirements/permissions-access-control` when `has_authn_authz == false`) are skipped with a note in the verdict file. The completeness tracker should already record these as `N/A`; if not, flag as an inconsistency in review-completeness.
