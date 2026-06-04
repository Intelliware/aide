# Review Workflow — review-qe-package

Run formal review only after the QE package has been assembled by `create-qe-package`. Each review produces findings and a verdict.

## Sequential execution rule

Run reviews strictly in the order below. Do not skip ahead and do not run reviews in parallel. After each review, present findings and verdict to the user. A FAIL or blocking finding halts the sequence until resolved.

| Order | Review | What it validates |
|---|---|---|
| 1 | review-completeness | Coverage and traceability |
| 2 | review-consistency | Structural integrity |
| 3 | review-execution-readiness | Execution strategy and prerequisites |
| 4 | readiness-verdict | Final gate for execution handoff |

## Review 1 — Completeness

Validates that the QE package provides adequate test coverage and traceability:

- The **traceability matrix** in `qe-package.md` exists and maps every FR/NFR to test cases.
- Every functional requirement (FR) in the requirements package is traced to by at least one test case increment. No FR has Coverage = None without explicit justification.
- Every non-functional requirement (NFR) that is testable at the QE level is traced to by at least one test case increment.
- No test case increment has an empty or missing traceability section (section 2 of the TC-XXX shape).
- Every test case increment traces back to at least one FR/NFR, design section, or implementation increment.
- Scaffolding increments exist for all infrastructure work identified during creation (dependencies, runners, utilities, config profiles).
- The test type selection (E2E, Integration, etc.) from creation is reflected in the actual test case inventory — no selected type is unrepresented.
- Edge cases and negative scenarios are represented (not just happy paths).
- The **change tracker** (`change-tracker.md`) exists, follows the canonical format from `templates/blocks/shared/change-log.md`, has proper Parts Affected vocabulary, and contains `Initial Extraction` rows for every generated document.

## Review 2 — Consistency

Validates structural integrity of the package:

- Test case organization (flat vs. categorized) matches what was declared during creation.
- If categorized, every test case is in its correct category sub-folder.
- No orphaned files exist outside the declared structure.
- All TC IDs are unique and follow the declared naming convention.
- Dependency references between increments resolve (no dangling TC-XXX references).
- All test case increments depend on the scaffolding increments.
- The test case status tracker lists every increment (scaffolding + test cases) with no missing entries.
- The QE plan overview matches the actual files on disk.

## Review 3 — Execution Readiness

Validates that the execution strategy is actionable:

- `execution-strategy.md` exists and covers all three environment tiers (local, lower, upper).
- Prerequisites are documented for each environment.
- Tag-based filtering is explained with concrete examples.
- The tech stack declared in the QE package matches the embedding strategy (e.g., if Cucumber is the runner, the scaffolding includes Cucumber dependencies).
- Artifact target paths in test case increments are valid relative to the declared embedding location in the codebase.
- Reporting strategy is documented.

## Review 4 — Readiness Verdict

The final gate. Produces PASS / PASS WITH OBSERVATIONS / FAIL based on the outcomes of reviews 1–3:

- **PASS** — all three reviews passed with no findings; execution handoff permitted.
- **PASS WITH OBSERVATIONS** — all reviews passed but with non-blocking observations; user must explicitly accept. Execution handoff permitted with observations recorded.
- **FAIL** — one or more reviews returned FAIL; execution handoff is blocked until findings are resolved.

The readiness verdict also confirms:
- The QE package's recorded requirements/design versions are current (via change trackers).
- The implementation package shows all increments as `completed`.

## Verdicts

- PASS — no findings; proceed to next review.
- PASS WITH OBSERVATIONS — non-blocking findings; user must explicitly accept.
- FAIL — halt the sequence; resolve before continuing.

## Fail recovery

When a review returns FAIL or a blocking finding:
1. Stop the sequence.
2. Present findings and the affected package sections.
3. Help the user resolve the findings if asked (bracketed fix-then-re-validate cycle).
4. Re-run the failed review from the beginning.
5. If the fix changes content checked by an earlier passed review, re-assess that earlier verdict and re-run if its checked content materially changed.
6. Append a `Review finding` row to the QE `change-tracker.md` for every item modified, following the canonical format: Change Type = `Correction`, Parts Affected = (relevant part), Description = finding + resolution. This ensures the change tracker maintains a complete audit trail across create → review → fix → re-review cycles.

## Execution handoff

After readiness returns PASS or accepted PASS WITH OBSERVATIONS, ask the user:

> QE review is approved for execution. Are you ready to proceed with executing QE test increments?

If yes, summarize the approved QE package, accepted observations, and any notes. Then hand off by name to `execute-qe-increments`.

If no, stop and summarize the approved state and the remaining handoff step.


