# Inputs and Outputs — document-quick-change

## Inputs

| Name | Required? | Source | Example |
|---|---|---|---|
| developer description | yes | conversation | "Add a 'mark as read' button to notification cards" |
| existing artifacts | no — but always asked about | tickets, incident notes, screenshots, PRs, ADRs | Linear ticket NOT-142, Slack screenshot |
| feature folder | yes | the registry's feature ID, via the active-feature precondition — not opted in: reuse an existing folder for this change, else kebab-case `<name>` from description | `notification-mark-as-read` |
| `templates/compositions/quick-dev-spec.yaml` | yes | framework | structural template for the spec |
| project paths and stage config | yes | `project.toml` `[project.paths]`, `[stages.requirements]`, `[[project.repos]]`; `features.toml` `repos` when opted in | `requirements_package` |

## Outputs

| Artifact path | Format | Downstream consumer |
|---|---|---|
| `{paths.requirements_package}/<feature-id>/<feature-id>-quick-dev-spec.md` (small/medium) OR inline (trivial) | markdown — populated four-block composition | `plan-quick-change` |
| `{paths.requirements_package}/<feature-id>/CHANGE-TRACKER.md` (created if missing) | markdown — initialized | `track-change` |
| Glossary additions (when new terms appear) | markdown table inside the spec | downstream skills, glossary linter |

## Side effects

- Creates the requirements-stage quick-dev directory if it does not exist (`references/ai-principles/feature-precondition.md` § Quick-dev layout)
- Initializes the change tracker if missing
- Writes the spec to disk (unless trivial, in which case the spec stays inline in the conversation)

## Validation rules

- All `[NEEDS CLARIFICATION]` markers must be resolved before the spec is finalized
- Each acceptance criterion must be independently verifiable (no compound ACs, no "should" wording)
- "Out of Scope" must be explicit — empty is not acceptable on small/medium specs
- For brownfield changes, delta (ADDED/MODIFIED/REMOVED) must be filled
- User must explicitly confirm before the skill returns success
- The skill cannot return success while the rigor classification is unresolved
