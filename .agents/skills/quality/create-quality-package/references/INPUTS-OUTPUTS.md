# Inputs and Outputs — create-quality-package

## Inputs

| Name | Required? | Source | Example |
|---|---|---|---|
| Approved requirements package | yes | `{paths.requirements_package}/{feature-id}/{feature-id}-requirements.md` | Acceptance criteria, FRs, and NFRs that test design traces to |
| Requirements change tracker | yes | `{paths.requirements_package}/<feature-id>/requirements/change-tracker.md` | Scopes which test cases need revision on a re-author |
| Approved design package | yes | `{paths.design_package}/{feature-id}/{feature-id}-design.md` | Testing-strategy block, technical NFRs, security design |
| Implementation package | **yes (GO)** when authoring after the implementation package lands (normal path); **optional / if present** when authoring quality-first or in parallel before INCs exist | `{paths.implementation_package}/{feature-id}/` (all `INC-XXX.md`, `increment-status.md`) | Test design maps coverage to each increment. When authored before the implementation package is on disk, the `INC-XXX` traceability column is recorded as `(pending)` and populated on a re-run once INCs land. |
| `project.toml` | yes | `{project-root}/project.toml` | Flow, paths, repos, elicitation (`testing_strategy`, `compliance_regime`, `observability_stack`) |
| Active composition YAML | yes | `templates/compositions/greenfield-quality-package.yaml` | Confirms which blocks are required vs gated |
| Knowledge base | when present (brownfield) | `{paths.knowledge_base_path}/` | Existing suites, coverage baselines, flaky-area history (via `navigate-knowledge-base`) |

## Outputs

| Artifact path | Format | Downstream consumer |
|---|---|---|
| Assembled `quality-package.md` (resolved per stage mode; legacy `{paths.quality_package}/{feature-id}/{feature-id}-quality.md`) | Markdown (composed per `greenfield-quality-package.yaml`) | `review-quality-package` (gate); `execute-increments` (test design + gates) |
| Per-section block files `{paths.quality_package}/<feature-id>/quality/*.md` | Markdown (one block per file) | The review skill; the author on re-runs |
| Test-traceability matrix `{paths.quality_package}/<feature-id>/quality/traceability.md` | Markdown table — test ↔ AC ↔ FR/NFR ↔ INC | `review-quality-package` (coverage review) |
| Change tracker `{paths.quality_package}/<feature-id>/quality/change-tracker.md` | Markdown table | Downstream skills; subsequent review passes |

## Notes

- `<feature-id>` in the per-section working-tree paths above is the
  **registry's feature ID**, resolved by this skill's active-feature
  precondition (`references/ai-principles/feature-precondition.md`) — the same
  value the requirements, design, and implementation packages used. It is not a
  name inferred from the package contents. On a project that has not opted in
  (no `features.toml`), it resolves as it did before: whatever feature
  directory the work already uses.
- `[project.paths].quality_package` and the composition token
  `{paths.quality_package}` name the same quality-stage output directory.
- When an increment has no mapped test coverage, the skill records an explicit
  exception row in the traceability matrix rather than silently omitting it; the
  coverage review in `review-quality-package` checks for unaccounted increments.
