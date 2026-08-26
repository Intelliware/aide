---
name: manage-presets
description: "Use when the user says \"install a preset\", \"enable preset\", \"disable preset\", \"show preset\", \"list presets\", \"discover presets\", or wants to manage reusable customization bundles. Handles preset discovery, installation, enable/disable toggling, and inspection without manual TOML editing."
---

# Manage Presets

## Overview

Manages preset bundles — reusable collections of skill customizations that can be
installed and enabled as a unit. Presets ship in add-on repos or local `presets/`
directories and are registered in `{project-root}/presets.toml`.

This skill provides four operations:
1. **discover** — Scan workspace folders for unregistered presets
2. **install** — Add a preset to `presets.toml`
3. **enable/disable** — Toggle a preset's active state
4. **show** — Display a preset's contents and effects

For the preset schema, see `config/SCHEMAS.md` § 2.10 (preset.toml) and § 2.11 (presets.toml).

## When to use

- The user wants to find available presets in the workspace
- The user wants to install a preset from an add-on repo or local directory
- The user wants to enable or disable an installed preset
- The user wants to inspect what a preset contains before installing
- The user wants to see which presets are currently active

## When NOT to use

- The user wants to edit a preset's contents — that requires editing the preset's
  source files directly
- The user wants to create a new preset from scratch — use `customize-framework`
  to create customization files first, then organize them into a preset directory
- The user wants to author individual customization overrides — that's `customize-framework`
- `project.toml` does not exist yet — run `start-project` first

## Inputs

See `references/INPUTS-OUTPUTS.md`. Key inputs:
- `operation` — one of `discover`, `install`, `enable`, `disable`, `show`
- `preset_name` — the preset to operate on (required for all except `discover`)
- `source` — path to preset directory (required for `install` when not discovered)

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

The skill routes to one of four step files based on the operation:

1. `steps/01-discover.md` — Scan workspace for `preset.toml` manifests
2. `steps/02-install.md` — Add a preset to the registry
3. `steps/03-enable-disable.md` — Toggle preset enabled state
4. `steps/04-show.md` — Display preset contents

Each step is discrete. After completing, the skill returns to the user with a
summary of what changed.

## Output

| Artifact path | When | Format |
|---|---|---|
| `{project-root}/presets.toml` | install, enable, disable | TOML (`config/presets.toml.example` schema) |
| `{project-root}/presets.user.toml` | enable/disable with `--personal` | TOML (same schema, gitignored) |
| `{project-root}/.gitignore` | when `presets.user.toml` is newly created | text append |

## Next skill

None — `manage-presets` is a utility action. Common follow-ups:
- The user runs `customize-framework` to verify the preset's merged effect
- The user re-runs a skill to see the preset's customizations in action

## Common mistakes

- Installing a preset without checking `conflicts_with` — the loader will reject
  conflicting presets at config-merge time
- Expecting preset changes to apply retroactively to already-written artifacts —
  presets affect skill behavior, not existing outputs
- Forgetting that project-local `customizations/<skill>.toml` overrides preset
  values — if a local customization exists, it wins
- Editing `presets.toml` by hand with a typo in `source` — use this skill's
  `install` operation to validate paths
- Confusing preset enable/disable with hook suppression — they're different
  mechanisms serving different purposes
