# Inputs and Outputs — execute-quality-increments

## Inputs

| Name | Required? | Source | Purpose |
|---|---|---|---|
| Assembled quality package | yes | `{paths.quality_package}/{feature-id}/{feature-id}-quality.md` | Topology, test stack, harness design, execution conventions |
| Quality automation & CI/CD block | yes | `{paths.quality_package}/<feature-id>/quality/automation-and-cicd.md` | Framework, runner, tag vocabulary, environment profiles |
| Test-case plan overview | yes | `{paths.quality_package}/<feature-id>/quality/plan/qe-plan-overview.md` | Increment list, dependency graph, execution order |
| Scaffolding increment files | yes | `{paths.quality_package}/<feature-id>/quality/plan/TC-XXX.md` (scaffolding type) | Implementation plans for prep work |
| Test-case increment files | yes | `{paths.quality_package}/<feature-id>/quality/plan/<category>/TC-XXX.md` or `{paths.quality_package}/<feature-id>/quality/plan/TC-XXX.md` | Implementation plans for test artifacts |
| Test-case status tracker | yes | `{paths.quality_package}/<feature-id>/quality/plan/test-case-status.md` | Tracks progress through the plan |
| Review readiness verdict | yes | `{paths.quality_package}/<feature-id>/review/readiness-verdict.md` | Must be GO or accepted CONDITIONAL GO |
| Test-artifact target repo | yes | `[project.testing].qe_repo` resolved through `[[project.repos]]`; fallback to the in-scope code repo | Where QE-owned executable test artifacts are written |
| `project.toml` | yes | `{project-root}/project.toml` | Flow detection, paths, repos, test-stack pins |
| Knowledge base | recommended | `{paths.knowledge_base_path}/` via `navigate-knowledge-base` | Reuse cross-check against existing test utilities and fixtures |

## Outputs

| Artifact | Location | Format | Notes |
|---|---|---|---|
| Build-file modifications | Test-artifact target repo (path per build tool) | Per build tool | Scaffolding only |
| Runner classes / suite definitions | Test-artifact target repo (path per test framework) | Per framework | Scaffolding only |
| Test configuration | Test-artifact target repo (path per framework / runner) | Per framework | Scaffolding only |
| Shared test utilities, fixtures, builders | Test-artifact target repo (path per language) | Per language | Scaffolding only |
| Feature / scenario / spec files | Test-artifact target repo (path per framework) | Per framework | Test-case increments |
| Step definitions / test classes | Test-artifact target repo (path per language) | Per language | Test-case increments |
| Test-case data files / exports (CSV, JSON, fixtures) | `{paths.quality_package}/{feature-id}/` or test-artifact target repo | Per format | Test-case increments |
| Updated test-case-status.md | `{paths.quality_package}/<feature-id>/quality/plan/test-case-status.md` | Markdown table | Every increment |
| Updated change-tracker.md | `{paths.quality_package}/<feature-id>/quality/change-tracker.md` | Markdown table | Every increment; with `Trigger = Execution deviation` when relevant |

Exact paths depend on `[project.testing].qe_repo` (when configured), the
embedding strategy (in-repo vs. dedicated test-repo), and the tool conventions declared during `create-quality-package`
and documented in the quality package's automation-and-cicd and
test-data-and-environments blocks. The skill reads those values rather
than hard-coding paths.

