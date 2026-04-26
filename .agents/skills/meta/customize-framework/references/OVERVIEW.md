# Overview — customize-framework

## Purpose

`customize-framework` is the only sanctioned author of files under
`{project-root}/customizations/` and the only skill that touches
`framework.user.toml`, `project.toml` (post-bootstrap), and
`project.user.toml` for *targeted* overrides. It exists so users
never need to learn the deep-merge rules from `config/SCHEMAS.md` to
make a one-line change. They pick a scope, a target, and an
operation; the skill picks the right file, writes the right TOML,
and confirms the merge.

The framework's four-layer config model gives users five distinct
places to express a change, with five distinct precedence levels and
three different merge behaviors (scalar override, recursive table
merge, array-of-tables merge by `code`/`id`) plus a suppression
marker. That power is necessary — but the surface area is large
enough that hand-editing routinely produces files that *parse* but
do not *behave* as the author expected. This skill collapses the
surface area to "what do you want, and where should it apply?" and
generates the right TOML.

## When to use

- A field in the active config needs to change without bootstrap
- A framework-default artifact needs to be dropped (suppression)
- An elicitation answer needs to be pinned at any layer
- A per-skill setting needs to be overridden
- An array entry needs to be added, edited, or replaced

## When NOT to use

- No `project.toml` yet → run `start-project` first
- Re-baselining the whole project → run `start-project` in rebaseline mode
- Authoring a YAML composition → that's a different workflow
- Editing skill source files → that's editing, not customizing
- Editing `framework.toml` directly → use the framework-global scope, which writes to `framework.user.toml`

## Position in workflow

Stage: meta. Cross-stage utility, invoked as needed.

Pre-conditions:
- `project.toml` exists at `{project-root}/project.toml`.
- For skill-specific scope: the target skill exists in the catalog.

Post-conditions:
- One file under one of the four override layers has been created or
  edited.
- The merged config has been simulated and shown to the user.
- (Optional) `.gitignore` updated when a `*.user.toml` is newly
  created.

Common follow-up: the user re-invokes whatever skill they customized
to see the override take effect.
