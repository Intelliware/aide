# Overview — manage-presets

## Purpose

`manage-presets` manages the preset bundle lifecycle — discovery, installation,
enable/disable, and inspection. It provides a user-friendly interface to the
`presets.toml` registry without requiring manual TOML editing.

Presets are reusable collections of skill customizations. They live in:
- Add-on repos: `{workspace}/aide-<addon>/presets/<preset-name>/`
- Local project directories: `{project-root}/presets/<preset-name>/`

Each preset contains a `preset.toml` manifest and a `customizations/` subdirectory
with skill override files.

## When to use

- Finding available presets in the workspace
- Installing a preset from any source
- Enabling or disabling installed presets
- Inspecting preset contents before installation
- Listing currently active presets

## When NOT to use

- Editing preset contents → edit the source files directly
- Creating new presets → use `customize-framework` to create files, then organize
- Authoring individual overrides → use `customize-framework`
- No `project.toml` exists → run `start-project` first

## Position in workflow

Stage: meta. Cross-stage utility, invocable anytime.

Pre-conditions:
- `project.toml` exists at `{project-root}/project.toml`

Post-conditions:
- For `install`: `presets.toml` has a new entry
- For `enable/disable`: `presets.toml` or `presets.user.toml` updated
- For `discover`: list of available presets displayed
- For `show`: preset contents displayed

## Key concepts

### Preset precedence

When multiple presets customize the same skill, later entries in `[[presets]]`
array win. Project-local `customizations/<skill>.toml` always wins over all presets.

```
framework.toml → project.toml → [PRESETS] → customizations/<skill>.toml
                                   ↑
                    earlier = lower precedence
                    later = higher precedence
```

### Personal vs team

- `presets.toml` (committed) — team presets, shared across all users
- `presets.user.toml` (gitignored) — personal overrides, enable/disable for one user

Use `--personal` flag with enable/disable to write to the personal registry.

### Conflicts

Presets declare `conflicts_with` in their manifest. The loader rejects enabling
two presets that conflict. This skill checks conflicts before installation.
