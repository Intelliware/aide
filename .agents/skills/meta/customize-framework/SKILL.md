---
name: customize-framework
description: "Use when the user says \"customize the framework\", \"override a skill\", \"change a skill default\", \"suppress this artifact\", \"pin this elicitation answer\", \"make this project-specific\", \"author a customization\", or anytime they want to change behavior without editing the framework's shipped files. Walks the user through writing overrides under the right config layer (framework.user.toml, project.toml, project.user.toml, customizations/{skill}.toml or .user.toml) without hand-TOML editing. Covers scalar override, table merge, array-of-tables merge by code/id, and the _suppress: true marker."
---

# Customize Framework

## Overview

Authors and updates customization overrides for A.I.D.E.'s four-layer config model without making the user touch TOML directly. Covers all four override layers: `framework.user.toml` (rare, framework-global personal), `project.toml` (most common, project-team), `project.user.toml` (project-personal), and `customizations/<skill>.toml` / `.user.toml` (per-skill team or personal).

Implements the merge-aware operations that `config/SCHEMAS.md` § 1.3-1.4 requires: scalar override, recursive table merge, array-of-tables merge by `code`/`id`, plain-array replacement, and `_suppress: true` for dropping a base entry. Every authored file gets a managed-header comment and inline annotations explaining why each override exists, so reviewers see the intent at a glance.

## When to use

- The user wants to change a single field in the active configuration without re-running `start-project`
- The user wants to drop a framework-default artifact (suppression)
- The user wants to pin an elicitation answer team-wide or personally
- The user wants to override a per-skill setting (e.g. `max_user_stories` for `create-requirements-package`)
- The user wants to add or replace an array entry under any layer

## When NOT to use

- `project.toml` does not exist yet — run `start-project` first
- The user wants to bootstrap from scratch or re-baseline — that's `start-project`
- The user wants to author a new YAML composition — that's a separate authoring workflow
- The user wants to edit `framework.toml` directly — that file is installer-managed; use the framework-global scope (writes to `framework.user.toml`) instead
- The user wants to change source files of a skill — that's editing the skill, not customizing it

## Inputs

See `references/INPUTS-OUTPUTS.md`. Required:
- The active `project.toml` (so the skill knows the project context)
- The user's choice of scope (framework-global / project-team / project-personal / skill-specific)
- For skill-specific: the target skill name (kebab-case, must exist in the catalog)
- The override operation (override / suppress / append / replace-array)
- The new value(s)

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Sequenced phases. Run one step at a time. Each phase is a discrete elicitation; do not collapse into a single mega-prompt.

1. `steps/01-pick-scope.md` — choose the layer to write into. Four options.
2. `steps/02-pick-target.md` — for skill-specific scope, identify which skill; for the other scopes, identify the section/path being overridden.
3. `steps/03-pick-operation.md` — override (scalar), append (array entry), replace (array of scalars), suppress (drop a base entry), or recursive-merge (table).
4. `steps/04-author-override.md` — gather the new value(s); preview the rendered TOML and the predicted merged result; confirm.
5. `steps/05-verify-merge.md` — read the file back from disk, simulate the full merge against the lower layers, show the user what now applies, and exit.

Use elicitation prompts referenced from `references/elicitation-patterns/customization.md`.

## Output

| Artifact path | When | Format |
|---|---|---|
| `<framework-root>/framework.user.toml` | scope = framework-global | TOML (subset of `framework.toml.example` + `[user]` section) |
| `{project-root}/project.toml` | scope = project-team | TOML (`config/project.toml.example` schema) |
| `{project-root}/project.user.toml` | scope = project-personal | TOML (`config/project.user.toml.example` schema) |
| `{project-root}/customizations/<skill-name>.toml` | scope = skill-specific (team) | TOML (`config/customizations/example-skill.toml.example` schema) |
| `{project-root}/customizations/<skill-name>.user.toml` | scope = skill-specific (personal) | TOML (same schema; personal layer) |
| `.gitignore` patches | when a `*.user.toml` file is created | text append |

Every file written carries a top-of-file comment block:

```toml
# Managed by skills/meta/customize-framework.
# Override layer: <layer>. Schema: config/<layer-example>.toml.example.
# Edit via the skill or by hand; both are supported.
```

Each individual override carries an inline comment explaining the intent (why this is overridden, what would happen otherwise).

## Next skill

None — `customize-framework` is a tail action. Common follow-ups:
- The user re-runs the skill that was customized to see the new behavior
- The user re-runs `start-project` only if they hit a missing-config edge case (rare)

## Common mistakes

- Writing to `framework.toml` instead of `framework.user.toml`. The shipped framework file is installer-managed; never patch it from this skill.
- Forgetting `_suppress = true` requires the `code`/`id` key alongside it (see `config/SCHEMAS.md` § 1.4 rule 2).
- Suppressing on a scalar or plain table — `_suppress` is meaningful only inside an array-of-tables merged by `code`/`id`.
- Appending to an array of scalars expecting append semantics. Plain arrays REPLACE; only `code`/`id`-keyed arrays of tables merge.
- Authoring a per-skill override without checking the skill exists. Validate against the catalog before writing the file.
- Skipping the merge-preview in step 05. Without read-back, the user cannot tell whether the override actually took effect.
- Mixing personal and team overrides in the same file. Personal goes in `*.user.toml`; team goes in the un-suffixed file.
- Editing `customizations/<skill>.toml` for a skill the user does not actually use, then being confused when nothing changed.
