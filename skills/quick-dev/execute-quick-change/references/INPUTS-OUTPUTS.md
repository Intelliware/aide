# Inputs and Outputs — execute-quick-change

## Inputs

| Name | Required? | Source | Example |
|---|---|---|---|
| quick-dev plan | yes | `<feature-folder>/quick-dev-package/<feature-id>-quick-dev-plan.md` | approved plan with 1–3 increments |
| quick-dev spec | yes | `<feature-folder>/quick-dev-package/<feature-id>-quick-dev-spec.md` | for spec-compliance review and PR description |
| codebase | yes | local filesystem | repos referenced by the plan |
| project paths | yes | `project.toml` `[project.paths]` | `implementation_package`, `knowledge_base_path` |
| coding standards | yes | framework standards or `customizations/` | scoped to the project's stack |

## Outputs

| Artifact path | Format | Downstream consumer |
|---|---|---|
| Working code with passing tests | source files in the target repos | the user, CI |
| Atomic commits with conventional messages | git history on `feature/<inc-id>-<short>` | reviewers |
| Open PR with generated description | git host (GitHub/GitLab/etc.) | reviewers |
| `<feature-folder>/quick-dev-package/CHANGE-TRACKER.md` updated entries | markdown | `track-change`, drift detection |
| KB catalog update (via `update-knowledge-base --scope=catalog-only`) | KB component frontmatter refresh | `navigate-knowledge-base` |
| Adversarial review findings (when any) | inline + persisted to `<feature-folder>/quick-dev-package/review-YYYY-MM-DD.md` | the user |

## Side effects

- Creates a feature branch per increment (or per plan, depending on the user's preference)
- Stages and commits files only after explicit user approval
- Opens a PR after explicit user approval
- Triggers the KB catalog update at close

## Validation rules

- No production code lands without a failing test first
- Verification is always re-run in the same turn — never claimed from memory
- Code written before tests must be deleted and redone
- No commit without explicit user approval
- Adversarial review must produce findings or trigger re-analysis (zero is not a pass)
- Critical and Important findings must be fixed and re-reviewed before commit
- The KB hand-off is mandatory — quick-dev does not close until the catalog update is invoked
