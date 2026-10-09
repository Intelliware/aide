# Quick-dev stage

Skills for small, scoped changes. Skips full requirements / design / planning packages in favor of one combined spec, then a lightweight plan, then execution.

## Produces
A combined quick-change spec per `templates/compositions/quick-dev-spec.yaml`, plus a lightweight plan and the implemented change. KB is updated at the end with `--scope=catalog-only`.

Each artifact goes to its own stage's configured directory — the spec and change tracker to the requirements stage, the plan and review findings to the planning and execution stages — resolved from `project.toml` (and `features.toml` when present), with or without an active feature. See `references/ai-principles/feature-precondition.md` § Quick-dev layout.

## Consumes
- Change description from user
- The knowledge base (for component context — `navigate-knowledge-base`)

## Skills (NEW — authored in task #6 from `expedited-implementation-package` DNA)
- `document-quick-change/` — combined spec
- `plan-quick-change/` — lightweight plan
- `execute-quick-change/` — implementation + KB update
