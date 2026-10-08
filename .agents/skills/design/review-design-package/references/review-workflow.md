# Review Workflow

Folded from `model-2-sdlc-skills/solution-package/solution-review/references/solution-review-workflow.md`.

Run formal review only after the design package has been assembled by `create-design-package`. Each review produces findings and a verdict.

## Sequential execution rule

Run reviews strictly in the order below. Do not skip ahead and do not run reviews in parallel. After each review, present findings and verdict to the user. A NO-GO or blocking finding halts the sequence until resolved.

| Order | Review | Reference (in source skill) | What it validates |
|---|---|---|---|
| 1 | review-architecture | `review-architecture.md` | Structural soundness, scalability, resilience, maintainability |
| 2 | review-security-posture | `review-security-posture.md` | Security vulnerabilities, authn/authz, data protection, compliance posture |
| 3 | review-adversarial-pass | `references/review-patterns/adversarial-wrapper-pattern.md` | Invokes `meta/review-adversarial --stage=design` |
| 4 | review-edge-cases | `references/review-patterns/adversarial-wrapper-pattern.md` | Invokes `meta/review-edge-case-hunter --stage=design` |
| 5 | review-solution-readiness | `review-solution-readiness.md` | Final GO / CONDITIONAL GO / NO-GO gate for planning handoff |

## Adversarial wrapper sub-reviews (3 and 4)

Reviews 3 and 4 follow the shared dispatcher pattern in
`references/review-patterns/adversarial-wrapper-pattern.md`, run against the assembled
design package, and write into the same `review/` directory as the other sub-reviews:

```
meta/review-adversarial \
  --target={paths.design_package}/<feature-id>/<feature-id>-design.md \
  --stage=design \
  --output-path={paths.design_package}/<feature-id>/review/adversarial-findings.md
```

```
meta/review-edge-case-hunter \
  --target={paths.design_package}/<feature-id>/<feature-id>-design.md \
  --stage=design \
  --output-path={paths.design_package}/<feature-id>/review/edge-case-findings.md
```

They carry more weight here than in most stages, because a design package is where
unsupported claims are cheapest to make and most expensive to discover later — "the queue
handles backpressure", "this scales horizontally", "the cache is invalidated on write" are
all assertions a checklist review passes and a skeptic does not.

Sub-review verdicts use `PASS / PASS WITH OBSERVATIONS / FAIL` per
`references/review-patterns/review-verdict-mapping.md` — the `GO / CONDITIONAL GO / NO-GO`
vocabulary belongs to review 5 only, which aggregates:

| `worst_severity` | Verdict |
|---|---|
| `critical` | FAIL |
| `high` | PASS WITH OBSERVATIONS |
| `medium` | PASS WITH OBSERVATIONS |
| `low` | PASS |
| `none` | PASS |

If `triage_counts.must-fix > 0` AND `worst_severity == high`, MAY upgrade to FAIL. Each
wrapper writes its own verdict file (`review-adversarial-pass.md`, `review-edge-cases.md`)
citing the findings path.

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
