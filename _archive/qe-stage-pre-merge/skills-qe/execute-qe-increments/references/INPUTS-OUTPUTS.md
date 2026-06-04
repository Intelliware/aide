# Inputs and Outputs — execute-qe-increments

## Inputs

| Name | Required? | Source | Purpose |
|---|---|---|---|
| QE package | yes | `{paths.qe_package}/` | The assembled and reviewed QE package |
| QE package overview | yes | `{paths.qe_package}/qe-package.md` | Topology, tech stack, harness design context |
| Execution strategy | yes | `{paths.qe_package}/execution-strategy.md` | Framework conventions, tag vocabulary, environment config |
| QE plan overview | yes | `{paths.qe_package}/plan/qe-plan-overview.md` | Increment list, dependency graph, execution order |
| Scaffolding increment files | yes | `{paths.qe_package}/plan/TC-XXX.md` (scaffolding type) | Implementation plans for prep work |
| Test case increment files | yes | `{paths.qe_package}/plan/<category>/TC-XXX.md` or `{paths.qe_package}/plan/TC-XXX.md` | Implementation plans for test artifacts |
| Test case status tracker | yes | `{paths.qe_package}/plan/test-case-status.md` | Tracks progress through the plan |
| Review readiness verdict | yes | `{paths.qe_package}/review/readiness-verdict.md` | Must be PASS or accepted PASS WITH OBSERVATIONS |
| Target codebase | yes | filesystem (repo paths from `project.toml`) | Where artifacts are written |
| `project.toml` | yes | `{project-root}/project.toml` | Flow detection, paths, repos |

## Outputs

| Artifact | Location | Format | Notes |
|---|---|---|---|
| Build file modifications | Target codebase (e.g., `pom.xml`) | Per build tool | Scaffolding only |
| Runner classes | Target codebase (e.g., `src/test/java/.../RunQeTests.java`) | Per framework | Scaffolding only |
| Test configuration | Target codebase (e.g., `src/test/resources/cucumber.properties`) | Per framework | Scaffolding only |
| Shared test utilities | Target codebase (e.g., `src/test/java/.../qe/support/`) | Per language | Scaffolding only |
| Feature files | Target codebase (e.g., `src/test/resources/features/qe/`) | Gherkin / framework-specific | Test case increments |
| Step definitions | Target codebase (e.g., `src/test/java/.../qe/steps/`) | Per language | Test case increments |
| CSV test case exports | `{paths.qe_package}/` or target codebase | CSV | Test case increments |
| Updated test-case-status.md | `{paths.qe_package}/plan/test-case-status.md` | Markdown table | Every increment |
| Updated change-tracker.md | `{paths.qe_package}/change-tracker.md` | Markdown table | When deviations occur |

Exact paths depend on the embedding strategy declared during `create-qe-package` and documented in the QE package overview.
