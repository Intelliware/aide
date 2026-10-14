# Inputs and Outputs — review-design-package

## Inputs

| Name | Required? | Source | Example |
|---|---|---|---|
| Assembled design package | yes | `{paths.design_package}/{feature-id}/{feature-id}-design.md` | The artifact produced by `create-design-package` |
| Design change tracker | yes | `{paths.design_package}/<feature-id>/design/change-tracker.md` | Used by reviews to scope checks to what changed since last review |
| Architecture baseline | conditional (brownfield only) | `{paths.design_package}/<feature-id>/discovery/architecture-baseline.md` | Architecture review consumes it |
| Approved requirements package | yes | `{paths.requirements_package}/{feature-id}/{feature-id}-requirements.md` | Architecture and traceability checks need it |
| Requirements readiness verdict | yes | `{paths.requirements_package}/<feature-id>/review/readiness-verdict.md` | Must be APPROVED or accepted CONDITIONAL |
| Requirements change tracker | yes | `{paths.requirements_package}/<feature-id>/requirements/change-tracker.md` | Used to confirm the design's recorded requirements version is current |
| `project.toml` | yes | `{project-root}/project.toml` | Flow detection, policy gates |
| Active composition YAML | yes | `templates/compositions/<flow>-design-package.yaml` | Confirms which blocks are required vs gated |
| ADR files referenced by the design | yes | `{paths.knowledge_base_path}/adr/<id>.md` (or fallback) | Each ADR ID referenced in the design must resolve to a file |

## Outputs

| Artifact path | Format | Downstream consumer |
|---|---|---|
| `{paths.design_package}/<feature-id>/review/review-architecture.md` | Markdown — findings + PASS / PASS WITH OBSERVATIONS / FAIL | User; subsequent reviews; `create-implementation-package` |
| `{paths.design_package}/<feature-id>/review/review-security-posture.md` | Markdown — findings + verdict | User; subsequent reviews; `create-implementation-package` |
| `{paths.design_package}/<feature-id>/review/readiness-verdict.md` | Markdown — GO / CONDITIONAL GO / NO-GO, summary of accepted risks, conditions, points of contact | `create-implementation-package` (gate); user; orchestrator |
| Updated `change-tracker.md` rows | Markdown table — appended rows with `Trigger = Review finding`, named `Authorized By` | All downstream skills (delta detection); the next review pass; the orchestrator |

`<feature-id>` above is the **registry's feature ID**, resolved by this skill's active-feature precondition (`references/ai-principles/feature-precondition.md`) in select-only mode. Reviewing the wrong feature's package returns a confident verdict about the wrong artifacts, so the resolved ID is echoed before the first read.

When a review returns FAIL or NO-GO, the verdict file is still written (with the verdict) so the audit trail is preserved across re-runs. The next pass of that review overwrites it with the audit log retained in the change tracker.
