# Inputs and Outputs — review-qe-package

## Inputs

| Name | Required? | Source | Purpose |
|---|---|---|---|
| Assembled QE package | yes | `{paths.qe_package}/` | The package produced by `create-qe-package` |
| QE package overview | yes | `{paths.qe_package}/qe-package.md` | Top-level synthesis of scope, topology, tech stack, harness |
| Execution strategy | yes | `{paths.qe_package}/execution-strategy.md` | Per-environment execution instructions |
| QE plan overview | yes | `{paths.qe_package}/plan/qe-plan-overview.md` | Lists all increments with dependencies |
| Scaffolding increment files | yes | `{paths.qe_package}/plan/TC-XXX.md` (scaffolding type) | Preparatory work increments |
| Test case increment files | yes | `{paths.qe_package}/plan/<category>/TC-XXX.md` or `{paths.qe_package}/plan/TC-XXX.md` | Per-test-case implementation plans |
| Test case status tracker | yes | `{paths.qe_package}/plan/test-case-status.md` | Status of each increment |
| QE change tracker | yes | `{paths.qe_package}/change-tracker.md` | Delta detection for re-reviews |
| Approved requirements package | yes | `{paths.requirements_package}` | Traceability checks |
| Approved design package | yes | `{paths.design_package}` | Topology, tech stack cross-reference |
| Implementation package | yes | `{paths.implementation_package}` | Implementation context for coverage checks |
| `project.toml` | yes | `{project-root}/project.toml` | Flow detection, paths, policy gates |

## Outputs

| Artifact | Path | Format | Downstream consumer |
|---|---|---|---|
| Completeness findings | `{paths.qe_package}/review/review-completeness.md` | Markdown — findings + PASS / PASS WITH OBSERVATIONS / FAIL | User; subsequent reviews |
| Consistency findings | `{paths.qe_package}/review/review-consistency.md` | Markdown — findings + verdict | User; subsequent reviews |
| Execution readiness findings | `{paths.qe_package}/review/review-execution-readiness.md` | Markdown — findings + verdict | User; final verdict |
| Readiness verdict | `{paths.qe_package}/review/readiness-verdict.md` | Markdown — PASS / PASS WITH OBSERVATIONS / FAIL | `execute-qe-increments` (gate); user |
| Updated change tracker rows | `{paths.qe_package}/change-tracker.md` | Markdown table — appended rows with `Trigger = Review finding` | All downstream skills; next review pass |

When a review returns FAIL, the verdict file is still written (preserving audit trail). The next pass overwrites it; the change tracker retains the history.
