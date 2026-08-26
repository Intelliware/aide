# Inputs and Outputs — manage-presets

## Inputs

| Name | Required? | Source | Example |
|---|---|---|---|
| `project_root` | yes | inferred from `{cwd}` | `/Users/mike/work/acme-checkout` |
| `operation` | yes | user input — one of `discover`, `install`, `enable`, `disable`, `show` | `install` |
| `preset_name` | yes (except for `discover`) | user input — kebab-case preset identifier | `enterprise-compliance` |
| `source` | yes for `install` when not auto-discovered | user input — path to preset directory | `{workspace}/aide-enterprise-addon/presets/enterprise-compliance` |
| `personal` | no | user flag `--personal` — write to `presets.user.toml` instead of `presets.toml` | `true` |

## Outputs

| Artifact path | Operation | Format |
|---|---|---|
| `{project-root}/presets.toml` | install, enable, disable | TOML (`config/presets.toml.example` schema) |
| `{project-root}/presets.user.toml` | enable, disable (when `--personal`) | TOML (same schema; personal layer) |
| `{project-root}/.gitignore` | when `presets.user.toml` is newly created | text append |

## Operations

### discover

Scans workspace folders for `preset.toml` manifests that are not yet registered.

**Input:** none beyond `project_root`

**Output:** List of available presets with:
- Name
- Description
- Source path
- Registration status (registered/unregistered)

### install

Adds a preset to `presets.toml`.

**Input:**
- `preset_name` — matches `[preset].name` in the target's manifest
- `source` — path to preset directory (can use path tokens)

**Validation before write:**
- Source path exists and contains a valid `preset.toml`
- `[preset].name` matches the provided `preset_name`
- No conflict with already-enabled presets
- `requires_aide_version` constraint satisfied (warning only)

**Output:** Updated `presets.toml` with new entry, `enabled = true` by default

### enable

Enables a previously disabled preset.

**Input:**
- `preset_name` — must exist in registry
- `personal` — optional flag to write to `presets.user.toml`

**Validation:**
- Preset is registered
- No conflict with other enabled presets

**Output:** Updated registry with `enabled = true`

### disable

Disables an enabled preset without removing it from the registry.

**Input:**
- `preset_name` — must exist in registry
- `personal` — optional flag to write to `presets.user.toml`

**Output:** Updated registry with `enabled = false`

### show

Displays preset contents and effects.

**Input:**
- `preset_name` — can be registered or just a path

**Output:** Formatted display of:
- Preset metadata (name, description, version, tags)
- List of customization files with summaries
- Conflict declarations
- Extension chain (if `extends` is used)
- Current registration status (if applicable)

## Side effects

- Creates `presets.toml` if it doesn't exist (on first `install`)
- Creates `presets.user.toml` on first personal enable/disable
- Patches `.gitignore` for `presets.user.toml`
- Never modifies preset source files

## Validation rules

1. `preset_name` must be kebab-case
2. `source` must resolve to a directory containing `preset.toml`
3. `[preset].name` in manifest must match provided `preset_name`
4. `conflicts_with` check against currently enabled presets
5. `extends` must not create circular dependency
6. `[[preset.files]].skill` must match registered skills (warning only)
