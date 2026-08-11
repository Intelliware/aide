---
slug: discover
sequence: 1
depends-on-prior: false
---

# Step 1 — Discover presets

Scan workspace folders for `preset.toml` manifests that are not yet
registered in `presets.toml`.

## Purpose

Help users find available presets without manually searching the filesystem.
This step globs workspace folders for preset manifests and compares against
the current registry.

## Sub-steps

1. **Load current registry** — Read `{project-root}/presets.toml` if it
   exists. Extract the list of already-registered preset names.

2. **Identify workspace folders** — The workspace typically includes:
   - `{framework-root}` — the A.I.D.E. installation
   - `{project-root}` — the project directory
   - Sibling add-on repos (e.g., `{workspace}/aide-*`)
   - Any folders listed in the IDE's workspace configuration

3. **Scan for preset manifests** — For each workspace folder, glob for:
   ```
   **/presets/*/preset.toml
   presets/*/preset.toml
   ```

   Parse each discovered `preset.toml` and extract:
   - `[preset].name`
   - `[preset].description`
   - `[preset].version`
   - `[preset].tags`

4. **Classify presets** — For each discovered preset:
   - **Registered + Enabled** — in `presets.toml` with `enabled = true`
   - **Registered + Disabled** — in `presets.toml` with `enabled = false`
   - **Unregistered** — not in `presets.toml`

5. **Display results** — Present a table:

   ```
   Available Presets
   =================

   Name                     Status       Source                                    Description
   ----                     ------       ------                                    -----------
   enterprise-compliance    Enabled      {workspace}/aide-enterprise/presets/...   SOX/SOC2 compliance gates
   team-conventions         Disabled     {project-root}/presets/team-conventions   Team coding standards
   minimal-docs             Available    {workspace}/aide-minimal/presets/...      Reduced documentation

   Legend: Enabled = active, Disabled = registered but inactive, Available = not yet installed
   ```

6. **Offer to install** — If unregistered presets exist, prompt:
   ```
   Install a preset? Enter name or 'skip': _
   ```

   If user enters a name, proceed to Step 02 (install) with that preset.

## Hard gates

- Must have read access to workspace folders
- Parse errors in `preset.toml` are reported but don't halt discovery

## Exit criteria

- [ ] All workspace folders scanned
- [ ] Results displayed to user
- [ ] User has chosen to install a preset (→ Step 02) or skip

## Next

Step 02 (install) if user selects a preset, otherwise skill exits.
