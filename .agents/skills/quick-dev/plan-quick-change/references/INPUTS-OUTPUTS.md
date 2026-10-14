# Inputs and Outputs — plan-quick-change

## Inputs

| Name | Required? | Source | Example |
|---|---|---|---|
| quick-dev spec | yes | `{paths.requirements_package}/<feature-id>/<feature-id>-quick-dev-spec.md` | populated four-block spec from `document-quick-change` |
| codebase | yes | local filesystem — repos referenced in the spec's FR/Where | `../api`, `../web` |
| canonical reduced increment shape | yes | `references/canonical-increment-shape.md` | reduced 7-section shape |
| project paths and stage config | yes | `project.toml` `[project.paths]`, `[stages.requirements]`, `[stages.planning]`, `[[project.repos]]` | `requirements_package`, `implementation_package` |
| coding standards | no — when present | framework standards or `customizations/` | language/framework standards relevant to the change |

## Outputs

| Artifact path | Format | Downstream consumer |
|---|---|---|
| `{paths.implementation_package}/<feature-id>/<feature-id>-quick-dev-plan.md` | markdown — 1–3 increments per reduced shape | `execute-quick-change` |
| Inline orientation summary | conversation message | the user |
| Optional: `{paths.implementation_package}/<feature-id>/codebase-orientation.md` | markdown — persisted orientation findings | session-resumption, audit |

## Side effects

- Writes the plan to the planning-stage quick-dev directory (`references/ai-principles/feature-precondition.md` § Quick-dev layout), creating it if needed
- Optionally persists orientation findings
- Triggers the escape hatch (and stops) if the change exceeds quick-dev scope

## Validation rules

- No `[NEEDS CLARIFICATION]` markers in the plan
- Every increment has all reduced-shape sections
- Every increment has measurable success criteria
- Every increment names the files it creates or modifies
- Every increment traces to at least one AC from the spec
- No more than 3 increments in a quick-dev plan; >3 is a signal to escape-hatch
- User explicitly approves before handoff
