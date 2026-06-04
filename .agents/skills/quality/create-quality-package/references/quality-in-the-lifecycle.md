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
| execution | TDD loop implements the test design; AI/Human gates enforce it; defects logged and triaged; failed runs triaged | Software testing + QE | `execute-increments`, `manage-bugs`, `review-test-failures` |
| knowledge-base | Coverage, suites, and quality signals recorded so future work is grounded in real quality history; periodic coverage gap checks | QE | `update-knowledge-base`, `navigate-knowledge-base`, `audit-quality-coverage` |
| quick-dev (bypass flow) | Per-AC "How will this be proven?" notes; §12.2a quality constraints (test framework, coverage floor, lint rules, prohibited patterns); TDD + 3-dimension verification; 4-lens adversarial PR review; Completion Confirmation Gate as the release gate; `--scope=catalog-only` KB update | All three (compressed) | `document-quick-change`, `execute-quick-change`, `manage-bugs`, `update-knowledge-base` |

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
inline into the quick-dev spec and plan: the spec states how each AC is
verified (the per-AC "How will this be proven?" note authored in
`document-quick-change` step 5) and what quality constraints govern the work
(§12.2a quality-constraints subsection — test framework, coverage floor, lint
rules, prohibited patterns). `execute-quick-change` then runs TDD with
3-dimension verification and 4-lens adversarial review, and treats the
Completion Confirmation Gate as the release gate.

**Escalation triggers from quick-dev → full quality stage.** Quick-dev is
sufficient only while every one of these holds. The moment any of them flips,
halt and route to `create-quality-package` (and, upstream, to the full
requirements + design + planning pipeline):

- The change introduces a new data model, new API endpoint, new external
  integration, or architectural decision.
- Multi-environment automation strategy is required.
- A formal coverage matrix, release-gate metrics, or compliance evidence must
  exist as an artifact.
- Cross-team coordination on test data, environments, or release windows is
  needed.
- The risk profile is high (regulated workflow, irreversible change, large
  blast radius).
- The proof of an AC cannot be expressed as a one-line verification note.

See `.agents/skills/quality/README.md` for the matching carrier table.
