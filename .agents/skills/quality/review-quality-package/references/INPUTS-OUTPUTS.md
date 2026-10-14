# Inputs and Outputs — review-quality-package

## Inputs

| Name | Required? | Source | Example |
|---|---|---|---|
| Assembled quality package | yes | `{paths.quality_package}/{feature-id}/{feature-id}-quality.md` | The artifact produced by `create-quality-package` |
| Quality change tracker | yes | `{paths.quality_package}/<feature-id>/quality/change-tracker.md` | Scopes reviews to what changed since last review |
| Test-traceability matrix | yes | `{paths.quality_package}/<feature-id>/quality/traceability.md` | Coverage and traceability reviews consume it |
| Approved requirements package + readiness verdict | yes | `{paths.requirements_package}/{feature-id}/` + `review/readiness-verdict.md` | Coverage review confirms every AC is tested |
| Approved design package + readiness verdict | yes | `{paths.design_package}/{feature-id}/` + `review/readiness-verdict.md` | NFR / security validation traces here |
| GO implementation package | yes | `{paths.implementation_package}/{feature-id}/` (all `INC-XXX.md`) | Coverage review confirms every increment is covered or excepted |
| `project.toml` | yes | `{project-root}/project.toml` | Flow detection, policy gates (`testing_strategy`, `compliance_regime`) |

## Outputs

| Artifact path | Format | Downstream consumer |
|---|---|---|
| `{paths.quality_package}/<feature-id>/review/<review-name>.md` (one per review, six total) | Markdown — findings + PASS / PASS WITH OBSERVATIONS / FAIL verdict | User; subsequent reviews; `execute-increments` |
| `{paths.quality_package}/<feature-id>/review/readiness-verdict.md` | Markdown — GO / CONDITIONAL GO / NO-GO, accepted exceptions, open conditions | `execute-increments` (gate); the user; the orchestrator |
| Updated `change-tracker.md` rows | Markdown table — appended rows with `Trigger = Review finding` | Downstream skills (delta detection); the next review pass |

`<feature-id>` above is the **registry's feature ID**, resolved by this skill's
active-feature precondition (`references/ai-principles/feature-precondition.md`)
in select-only mode. Reviewing the wrong feature's package returns a confident
verdict about the wrong artifacts, so the resolved ID is echoed before the first
read.

When a review returns FAIL, the verdict file is still written (with FAIL) so the
audit trail is preserved across re-runs. The next pass of that review overwrites
it (audit log retained in the change tracker).
