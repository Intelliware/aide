# Inputs and Outputs — review-requirements-package

## Inputs

| Name | Required? | Source | Example |
|---|---|---|---|
| Assembled requirements package | yes | `{paths.requirements_package}/{feature-id}-requirements.md` (or `docs/<feature-id>/requirements-package/requirements-package.md`) | The artifact produced by `create-requirements-package` |
| Change tracker | yes | `docs/<feature-id>/requirements-package/requirements/change-tracker.md` | Used by reviews to scope checks to what changed since last review |
| Completeness tracker | yes | `docs/<feature-id>/requirements-package/requirements/completeness-tracker.md` | Confirms every block is `Complete` or explicitly `N/A` with gate |
| Analysis artifacts | yes (when analysis ran) | `docs/<feature-id>/requirements-package/analysis/*.md` | Traceability review consumes constraint/risk/decision logs |
| `project.toml` | yes | `{project-root}/project.toml` | Flow detection, policy gates (`project.policies.requires_traceability_matrix`, etc.) |
| Active composition YAML | yes | `templates/compositions/<flow>-requirements-package.yaml` | Confirms which blocks are required vs gated |
| Glossary | yes | `[project.glossary]` references and inline entries in `project.toml` | Consistency review uses it to detect undefined terms |

## Outputs

| Artifact path | Format | Downstream consumer |
|---|---|---|
| `docs/<feature-id>/requirements-package/review/<review-name>.md` (one per review, ten total) | Markdown — findings + PASS / PASS WITH OBSERVATIONS / FAIL verdict | User; subsequent reviews; `create-design-package` (consumes the readiness verdict) |
| `docs/<feature-id>/requirements-package/review/readiness-verdict.md` | Markdown — APPROVED / CONDITIONAL / BLOCKED, summary of accepted risks, open assumptions, open questions, points of contact | `create-design-package` (gate); the user; the orchestrator |
| Updated `change-tracker.md` rows | Markdown table — appended rows with `Trigger = Review finding`, named `Authorized By` | All downstream skills (delta detection); the next review pass; the orchestrator |

`<feature-id>` above is the **registry's feature ID**, resolved by this skill's active-feature precondition (`references/ai-principles/feature-precondition.md`) in select-only mode. Reviewing the wrong feature's package returns a confident verdict about the wrong artifacts, so the resolved ID is echoed before the first read.

When a review returns FAIL, the verdict file is still written (with FAIL) so the audit trail is preserved across re-runs. The next pass of that review overwrites it (or appends, depending on `framework.toml` policy — default: overwrite with audit log retained in the change tracker).
