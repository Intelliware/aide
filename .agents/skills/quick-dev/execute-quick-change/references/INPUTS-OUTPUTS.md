# Inputs and Outputs — execute-quick-change

## Inputs

| Name | Required? | Source | Example |
|---|---|---|---|
| quick-dev plan | yes | `{paths.implementation_package}/<feature-id>/<feature-id>-quick-dev-plan.md` | approved plan with 1–3 increments |
| quick-dev spec | yes | `{paths.requirements_package}/<feature-id>/<feature-id>-quick-dev-spec.md` | for spec-compliance review and PR description |
| solution constraints | yes | spec §12.2a (or inline if the spec is trivial) | guardrails the implementation must honor on every iteration, including any Solution Pivot — e.g. "no regex", "no new dependencies", "must reuse `useRetry`" |
| codebase | yes | local filesystem | repos referenced by the plan |
| project paths and stage config | yes | `project.toml` `[project.paths]`, `[stages.requirements]`, `[stages.planning]`, `[stages.execution]` | `requirements_package`, `implementation_package`, `knowledge_base_path` |
| coding standards | yes | framework standards or `customizations/` | scoped to the project's stack |

## Outputs

| Artifact path | Format | Downstream consumer |
|---|---|---|
| Working code with passing tests | source files in the target repos | the user, CI |
| Atomic commits with conventional messages | git history on `feature/<inc-id>-<short>` | reviewers |
| Open PR with generated description | git host (GitHub/GitLab/etc.) | reviewers |
| `{paths.requirements_package}/<feature-id>/CHANGE-TRACKER.md` updated entries — including any Solution Pivot rows and the user-confirmation row that closes the change | markdown | `track-change`, drift detection, audit |
| KB catalog update (via `update-knowledge-base --scope=catalog-only`) — only triggered after the Completion Confirmation Gate clears | KB component frontmatter refresh | `navigate-knowledge-base` |
| Adversarial review findings (when any) | inline + persisted to `{paths.implementation_package}/<feature-id>/review-YYYY-MM-DD.md` (execution-stage directory) | the user |
| Pivot summary (when a Solution Pivot fired) | inline message + CHANGE-TRACKER row capturing root cause, alternative chosen, approver, timestamp | the user, audit |

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
- A failed verification that requires a different approach halts at the Solution Pivot Gate — exactly one alternative is presented, with rationale and tradeoffs, and explicit user approval is required before any new code is written
- Solution constraints from the spec (§12.2a) are honored on every iteration, including after a pivot — candidate fixes that would violate them are discarded before they are proposed
- The Completion Confirmation Gate is mandatory — the skill does not declare the change complete until the user explicitly confirms the fix works in their environment
- The KB hand-off is mandatory **and** is gated on the Confirmation Gate clearing — quick-dev does not close until both have happened
