# Inputs and Outputs — create-qe-package

## Inputs

| Name | Required? | Source | Purpose |
|---|---|---|---|
| Approved requirements package | yes | `{paths.requirements_package}` | FR/NFR traceability for test cases |
| Approved design package | yes | `{paths.design_package}` | Topology, tech stack, testing strategy, integration points |
| `project.toml` | yes | `{project-root}/project.toml` | Flow detection, paths, repos, elicitation answers |
| Source documentation | conditional | User-provided path during Step 1 | Additional context for QE scope |
| Knowledge base | conditional | `{project.paths.knowledge_base_path}` | Component context when present |

## Outputs

| Artifact | Path | Format | Downstream consumer |
|---|---|---|---|
| QE package overview | `{paths.qe_package}/qe-package.md` | Markdown — synthesizes scope, topology, tech stack, harness, execution | `review-qe-package`, `execute-qe-increments` |
| Execution strategy | `{paths.qe_package}/execution-strategy.md` | Markdown — per-environment execution instructions | `execute-qe-increments`, QE engineers |
| QE plan overview | `{paths.qe_package}/plan/qe-plan-overview.md` | Markdown — lists all TC-XXX with dependencies | `review-qe-package`, `execute-qe-increments` |
| Per-test-case increment files | `{paths.qe_package}/plan/<category>/TC-XXX.md` or `{paths.qe_package}/plan/TC-XXX.md` | Markdown — 8-section test case increment | `execute-qe-increments` |
| Test case status tracker | `{paths.qe_package}/plan/test-case-status.md` | Markdown table | `execute-qe-increments` |
| Change tracker | `{paths.qe_package}/change-tracker.md` | Markdown table | `review-qe-package` |
