# Inputs and Outputs — create-requirements-package

## Inputs

| Name | Required? | Source | Example |
|---|---|---|---|
| Confirmed feature description (who/what/why) | yes | User, captured in Step 0 of the active first step (`steps/01-discovery.md` or `steps/04-writing.md`) | "Refunds team needs to be able to process partial refunds against orders so chargebacks fall under 1% monthly." |
| `project.toml` | yes | `{project-root}/project.toml` | `default_flow = "brownfield"`, `[project.paths] requirements_package = ".framework-output/requirements"`, `[[project.repos]]` entries |
| Active composition YAML | yes | `templates/compositions/<flow>-<package>.yaml` resolved from `project.default_flow` | `templates/compositions/greenfield-requirements-package.yaml` |
| Block templates referenced by the composition | yes | `templates/blocks/requirements/*.md`, `templates/blocks/shared/*.md` | `templates/blocks/requirements/functional-requirements.md` |
| Elicitation patterns | yes (per composition `elicitation:` list) | `references/elicitation-patterns/<pattern>.md` (referenced by path; files authored separately) | `references/elicitation-patterns/stakeholder-discovery.md` |
| Knowledge base | conditional (brownfield only) | `project.paths.knowledge_base_path` — accessed via `knowledge-base/navigate-knowledge-base` | `../knowledge-base/components/api-orders/order-checkout-flow.md` |
| Existing artifacts the user already has | optional | User upload / repo path (PRDs, mockups, prior tickets, meeting notes) | `docs/refund-processing/inputs/old-prd.md` |
| Stakeholder map (when analysis ran) | conditional | `{paths.requirements_package}/<feature-id>/analysis/stakeholder-map.md` | Roles, names, decision authority, RACI |
| Glossary references | optional | `[project.glossary] references` and `[[project.glossary.entries]]` in `project.toml` | `docs/glossary.md`, inline `term = "Refund"` |

## Outputs

| Artifact path | Format | Downstream consumer |
|---|---|---|
| `{paths.requirements_package}/{feature-id}/{feature-id}-requirements.md` (assembled) | Markdown, composed per `greenfield-requirements-package.yaml` block ordering | `review-requirements-package`, `create-design-package`, `create-implementation-package`, knowledge-base sync skills |
| `{paths.requirements_package}/<feature-id>/discovery/change-description.md` | Markdown | All subsequent steps (anchor file) |
| `{paths.requirements_package}/<feature-id>/discovery/*.md` (brownfield: codebase-discovery, existing-artifact-review, process-map, user-journey-map, requirements-elicitation, current-capability-baseline) | Markdown | Analysis step (Step 3), writing step (Step 4) |
| `{paths.requirements_package}/<feature-id>/analysis/*.md` (stakeholder-map, change-scope, dependency-map, impact-analysis, constraint-register, gap-analysis, assumption-log, decision-log, risk-register) | Markdown | Writing step (Step 4), `review-requirements-package`, `create-design-package` |
| `{paths.requirements_package}/<feature-id>/requirements/*.md` (per-section block files: 01-executive-summary through 14-acceptance-criteria) | Markdown — one block per file, FR numbering FR[Area].[Feature].[Detail] | `review-requirements-package`, `create-design-package` |
| `{paths.requirements_package}/<feature-id>/requirements/completeness-tracker.md` | Markdown table — Not Started / In Progress / Skipped / N/A / Complete per block | `review-requirements-package`, the user (visibility) |
| `{paths.requirements_package}/<feature-id>/requirements/change-tracker.md` | Markdown table — Added/Modified/Removed entries per item ID with Trigger and Authorized By | All downstream skills (delta detection); becomes Section 12 of the assembled package |
| `requirements-package.md` in the `docs/` working tree (alias for the assembled package, for backwards-compat with model-2 paths; **not opted in only**) | Markdown — pass-through to `{paths.requirements_package}/{feature-id}/{feature-id}-requirements.md` | Review skill, design skill |

When the composition declares a block as gated (`include-if`), the corresponding output file is omitted and the completeness tracker records the section as N/A with the gate condition that excluded it.

`<feature-id>` in the per-section working-tree paths above is the **registry's feature ID**, resolved by this skill's active-feature precondition (`references/ai-principles/feature-precondition.md`) — the same value that fills `{feature-id}` in the assembled path. It is not a name inferred from the user's description. On a project that has not opted in (no `features.toml`), it resolves as it did before: whatever feature directory the work already uses.
