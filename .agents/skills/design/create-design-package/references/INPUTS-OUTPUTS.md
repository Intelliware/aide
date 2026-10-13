# Inputs and Outputs — create-design-package

## Inputs

| Name | Required? | Source | Example |
|---|---|---|---|
| Approved requirements package | yes | `{paths.requirements_package}/{feature-id}/{feature-id}-requirements.md` | Output of `create-requirements-package` + `review-requirements-package` APPROVED |
| Requirements change tracker | yes | `{paths.requirements_package}/<feature-id>/requirements/change-tracker.md` | Used for delta detection on design re-runs |
| Requirements readiness verdict | yes | `{paths.requirements_package}/<feature-id>/review/readiness-verdict.md` | APPROVED or CONDITIONAL only |
| `project.toml` | yes | `{project-root}/project.toml` | Flow detection, paths, repos, elicitation answers |
| Active composition YAML | yes | `templates/compositions/<flow>-design-package.yaml` | `greenfield-design-package.yaml` or `brownfield-enhancement-spec.yaml` |
| Block templates referenced by composition | yes | `templates/blocks/design/*.md`, `templates/blocks/shared/*.md`, `templates/blocks/knowledge-base/adr-template.md` | `templates/blocks/design/api-design.md` |
| Elicitation patterns | yes (per composition `elicitation:` list) | `references/elicitation-patterns/<pattern>.md` (referenced by path; files authored separately) | `references/elicitation-patterns/architecture-discovery.md` |
| Knowledge base | conditional (brownfield only) | `project.paths.knowledge_base_path` — accessed via `knowledge-base/navigate-knowledge-base` | `../knowledge-base/components/api-orders/order-checkout-flow.md` |
| Architecture baseline | conditional (when Step 1 ran) | `{paths.design_package}/<feature-id>/discovery/architecture-baseline.md` | Output of `steps/01-discovery.md` |

## Outputs

| Artifact path | Format | Downstream consumer |
|---|---|---|
| `{paths.design_package}/{feature-id}/{feature-id}-design.md` (assembled) | Markdown, composed per `greenfield-design-package.yaml` block ordering | `review-design-package`, `create-implementation-package` |
| `{paths.design_package}/<feature-id>/discovery/architecture-baseline.md` (brownfield) | Markdown — synthesized architectural observations + technical-debt categorization | Step 2 design assembly, `review-design-package` |
| `{paths.design_package}/<feature-id>/discovery/raw-architectural-observations.md` (brownfield) | Markdown | Architecture-baseline synthesis (consumed by Step 1.3) |
| `{paths.design_package}/<feature-id>/discovery/technical-debt-assessment.md` (brownfield) | Markdown — must-fix / should-fix / defer per debt type | Architecture-baseline synthesis, design assembly |
| `{paths.design_package}/<feature-id>/design/<NN>-<block-slug>.md` (per-section block files) | Markdown — one block per file | `review-design-package`, `create-implementation-package`, KB sync |
| `{paths.design_package}/<feature-id>/design/change-tracker.md` | Markdown table — `Trigger = Initial authoring` / `Hand-off gate feedback` / `Downstream skill discovery` / `Review finding` rows | `review-design-package`, `create-implementation-package` |
| `solution-package.md` in the `docs/` working tree (alias for back-compat with model-2 paths; **not opted in only**) | Markdown — pass-through to `{paths.design_package}/{feature-id}/{feature-id}-design.md` | Review skill, planning skill |
| ADR files (one per significant decision) | Markdown — ADR template from `templates/blocks/knowledge-base/adr-template.md` | `{paths.knowledge_base_path}/adr/<id>.md` (or fallback under `{paths.design_package}/<feature-id>/design/adr/<id>.md`) |

When the composition declares a block as gated (`include-if`), the corresponding output file is omitted and the design completeness tracker (kept inside `design/change-tracker.md`'s header section) records the section as N/A with the gate condition that excluded it.

`<feature-id>` in the per-section working-tree paths above is the **registry's feature ID**, resolved by this skill's active-feature precondition (`references/ai-principles/feature-precondition.md`) — the same value that fills `{feature-id}` in the assembled path, and the same value the upstream requirements package used. It is not a name inferred from the requirements or executive summary. On a project that has not opted in (no `features.toml`), it resolves as it did before: whatever feature directory the work already uses.
