# Review Workflow

Run formal review only after `quality-package.md` has been assembled by
`create-quality-package`. Each review produces findings and a PASS / PASS WITH
OBSERVATIONS / FAIL verdict.

## Sequential execution rule

Run reviews strictly in the order below. Do not skip ahead and do not run
reviews in parallel. After each review, present findings and verdict to the
user. A FAIL verdict halts the sequence until resolved.

| Order | Review | What it checks |
|---|---|---|
| 1 | review-coverage | Every acceptance criterion, NFR, and `INC-XXX` increment is covered by at least one test case or carries an explicit, user-accepted exception |
| 2 | review-test-design-quality | Cases are concrete, deterministic, independently runnable; each states preconditions, action, and expected result; the smallest sufficient test level is used |
| 3 | review-quality-engineering | Automation tools and versions are pinned; CI/CD gate placement is feasible; test data uses no production secrets; environments are defined |
| 4 | review-metrics-and-gates | Release gates are measurable and binary; quality metrics are defined; each release gate maps to a concrete CI check |
| 5 | review-traceability | Every test traces to an AC / FR / NFR / increment; no orphan or speculative cases; traceability matrix is internally consistent |
| 6 | review-test-case-increment-shape *(conditional)* | When the `test-case-increment` block is in the active composition, every `TC-XXX.md` conforms to the canonical test-case-increment shape: typed (scaffolding vs test-case), dependencies declared and resolvable, artifact-plan present, verification steps stated, addressable from `test-case-status.md`, and category folder consistent with the plan overview. **If the block is not in the composition, this review is skipped and recorded as `N/A` in the verdict file.** |
| 7 | review-quality-readiness | Final go/no-go gate for execution handoff |

## Verdicts

- PASS — no findings; proceed to next review.
- PASS WITH OBSERVATIONS — findings are non-blocking; user must explicitly accept
  them and the skill records that acceptance in the verdict file.
- FAIL — halt the sequence; resolve before continuing.

## Fail recovery

When a review returns FAIL:
1. Stop the sequence.
2. Present findings and the affected package sections.
3. Help the user resolve the findings if asked (bracketed fix-then-re-validate
   cycle), deferring authoring to `create-quality-package`.
4. Re-run the failed review from the beginning.
5. If the fix changes content checked by an earlier passed review, explicitly
   re-assess that earlier verdict and re-run if its checked content materially
   changed.
6. Append a `Review finding` row to `change-tracker.md` for every item modified.

## Conditional review: test-case-increment-shape
This sixth review runs only when the active composition includes the
`templates/blocks/quality/test-case-increment.md` block (composition gate
`project.elicitation.uses_test_case_increments = true`). For each
`TC-XXX.md` under the test-case plan:
- **Type declared.** Frontmatter / header identifies the increment as
  `scaffolding` or `test-case`.
- **Dependencies resolvable.** Every ID listed in Dependencies exists in
  `test-case-status.md` and is reachable in the plan's dependency graph
  (no cycles, no orphan references).
- **Artifact plan present.** Each test-case increment has an Artifact Plan
  with target paths, content descriptions, and references to scaffolding
  utilities. Each scaffolding increment has an Implementation Plan with
  imperative instructions.
- **Verification stated.** Each increment lists at least one verification
  check that can produce fresh evidence in the current turn.
- **Tracker addressable.** Every plan increment appears as a row in
  `test-case-status.md` with status `not-started` (for a fresh package)
  or a valid progressed state.
- **Category placement consistent.** If the plan uses categories,
  `TC-XXX.md` lives in the correct category folder and the category
  matches the plan overview.
A FAIL here means `execute-quality-increments` would either hit ambiguity
during step 1 (load) or write artifacts to wrong paths during step 2
(implement). Fix in `create-quality-package` (the test-design step that
populates `02b-test-case-increments`), then re-run this review.
When the `test-case-increment` block is not in the composition, write
`Skipped (N/A) - composition does not include test-case-increment block`
into the verdict file and proceed to readiness.
## Readiness gate

`review-quality-readiness` runs last. Verdicts:
- GO — all reviews PASS or PASS WITH OBSERVATIONS (accepted), all gates met.
  Execution handoff is permitted.
- CONDITIONAL GO — GO with one or more documented conditions execution must
  observe (e.g. "performance suite deferred to INC-006; run before release").
  User must accept conditions explicitly; they are recorded in the verdict file
  and surfaced in the handoff summary.
- NO-GO — one or more reviews returned FAIL that could not be resolved within
  this pass; execution handoff is blocked.

## Stage handoff

After readiness returns GO or CONDITIONAL GO, ask the user:

> Quality review is GO. Are you ready to proceed with execution?

If the team uses the TC-XXX test-case increment flow (the
`test-case-increment` block was in the composition), recommend
`execute-quality-increments` for the test artifacts and
`execute-increments` for the application code. The two can run
interleaved per the quality package's automation-and-cicd cadence.

Otherwise recommend `execute-increments`; tests fold inline into the
application TDD loop.

In both cases, summarise the approved package, accepted observations,
conditional notes, accepted coverage exceptions, and the release gates
execution must meet. Then invoke the appropriate executor (or recommend
that invocation if the orchestrator does not auto-route).

If no, stop and summarise the approved state and the remaining handoff step.

## Composition awareness

Honor `decision-gates` from the active composition. Reviews of gated blocks
(e.g. `quality/nonfunctional-quality` when no NFRs are in scope) are skipped with
a note in the verdict file. The change tracker should record these as `N/A`; if
not, flag as an inconsistency in review-coverage.
