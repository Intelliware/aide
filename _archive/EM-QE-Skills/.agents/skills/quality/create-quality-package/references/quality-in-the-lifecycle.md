# Quality across the lifecycle

Quality in A.I.D.E. is not confined to the quality stage. The dedicated stage is
where quality is consolidated and gated, but quality activities are woven into
every stage. This map shows where each discipline shows up and which existing
skill or artifact carries it.

## Stage-by-stage touchpoints

| Stage | Quality activity | Discipline | Carried by |
|---|---|---|---|
| requirements | Acceptance criteria are testable; ambiguity and non-measurable language flagged | QA analysis | `review-requirements-package` (review-testability, review-measurability) |
| design | Testing strategy and verifiable NFRs are part of the blueprint; security posture reviewed | QA analysis + QE | `create-design-package` (design/testing-strategy, NFR blocks), `review-design-package` (review-security-posture) |
| planning | Each increment carries an Automated Verification (AI Gate) and Human Verification (Human Gate); coverage of FRs checked | Software testing | `create-implementation-package`, `review-implementation-package` |
| quality (this stage) | Consolidated quality strategy, concrete test design traced to ACs/NFRs/increments, automation + CI gates + test data, release gates and metrics | All three | `create-quality-package`, `review-quality-package` |
| execution | TDD loop implements the test design; AI/Human gates enforce it; defects logged and triaged | Software testing + QE | `execute-increments`, `manage-bugs` |
| knowledge-base | Coverage, suites, and quality signals recorded so future work is grounded in real quality history | QE | `update-knowledge-base`, `navigate-knowledge-base` |

## How the quality stage relates to the rest

- It does not replace the per-stage quality controls above — it operationalizes
  them. The design states the testing strategy at a high level; this stage turns
  it into concrete cases, data, automation, and measurable gates.
- It does not replace TDD in execution — it feeds it. The test design authored
  here is what `execute-increments` writes tests against, increment by
  increment.
- The release gates defined here become the feature's exit criteria, checked at
  the end of execution and surfaced to the PR via `create-pr`.

## Quick-dev

For the lightweight quick-dev flow the dedicated quality stage is bypassed (like
`review-requirements-package` and `review-design-package` are). Quality folds
inline into the quick-dev spec and plan: the spec states how the change is
verified, and `execute-quick-change` runs TDD with the same 3-dimension
verification. Use the full quality stage only when the change warrants full
requirements + design + planning packages.
