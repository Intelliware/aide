# Inputs and Outputs — customize-framework

## Inputs

| Name | Required? | Source | Example |
|---|---|---|---|
| `project_root` | yes | inferred from `{cwd}` at invocation | `/Users/mike/work/acme-checkout` |
| `framework_root` | yes (when scope = framework-global) | from environment / installer | `/opt/A.I.D.E.` |
| `scope` | yes | user input — one of `framework-global`, `project-team`, `project-personal`, `skill-specific` | `skill-specific` |
| `is_personal` | yes when scope = skill-specific | user input — boolean. `true` → write `<skill>.user.toml`; `false` → write `<skill>.toml` | `true` |
| `target_skill` | yes when scope = skill-specific | user input — kebab-case, must exist in catalog | `create-requirements-package` |
| `target_path` | yes | user input — TOML dotted-path of the override (e.g. `stages.requirements.elicitation.persona`) | `output.line_length` |
| `operation` | yes | user input — one of `override`, `append`, `replace-array`, `suppress`, `merge-table` | `override` |
| `new_value` | yes (varies by operation) | user input — typed payload | `100` |
| `key_field` | yes when operation = `append` or `suppress` on an array-of-tables | user input — `code` or `id` | `code = "compliance-callout"` |
| `note` | no | user input — short rationale, becomes inline comment | `"Shorter PRDs for marketplace tier"` |

## Outputs

| Artifact path | Scope | Format |
|---|---|---|
| `{framework-root}/framework.user.toml` | framework-global | TOML (subset of `framework.toml.example` + `[user]`) |
| `{project-root}/project.toml` | project-team | TOML (`config/project.toml.example` schema) |
| `{project-root}/project.user.toml` | project-personal | TOML (`config/project.user.toml.example` schema) |
| `{project-root}/customizations/<skill>.toml` | skill-specific (team) | TOML (`config/customizations/example-skill.toml.example` schema) |
| `{project-root}/customizations/<skill>.user.toml` | skill-specific (personal) | TOML (same schema; personal layer) |
| `{project-root}/.gitignore` (line append) | when a `*.user.toml` is newly created | text |

## Side effects

- Creates the target file when absent. Edits in-place when present.
- Inserts a managed-header comment block at the top of any newly created file.
- Inserts an inline comment alongside each override (the `note` input or a generated explanation).
- Patches `.gitignore` once per newly created `*.user.toml` (no duplicate entries).
- Never edits `framework.toml` (read-only) or any skill source file.

## Validation rules (enforced before write)

- For framework-global: target file is `framework.user.toml`, not `framework.toml`.
- For skill-specific: `target_skill` must match an existing skill folder.
- For `operation = suppress`: target must be an array-of-tables entry merged by `code` or `id`; the entry must carry only the key field plus `_suppress = true`.
- For `operation = append`: target must be an array; if it's an array-of-tables with `code`/`id`, the new entry must include the key.
- For `operation = override`: target must be a scalar (or table value at a leaf path).
- For `operation = merge-table`: target must be a table; the value is rendered as a nested TOML table that recursively merges.
- For `operation = replace-array`: target must be an array of scalars (per-schema rule that scalars REPLACE rather than merge).
- All path tokens used in values are one of `{project-root}`, `{framework-root}`, `{home}`, `{cwd}`.

## Merge-preview output

After every write, the skill simulates the full layer stack
(`framework.toml` → `framework.user.toml` → `project.toml` →
`project.user.toml` → `customizations/<skill>.toml` →
`customizations/<skill>.user.toml`) at the target path and prints:

```
Layer        Value
-----------  -----
framework    50
project      —
your write   25         ← from <file you just wrote>
EFFECTIVE    25
```

so the user can confirm the override actually wins precedence.
