---
slug: install
sequence: 2
depends-on-prior: false
---

# Step 2 — Install preset

Add a preset to `{project-root}/presets.toml` registry.

## Purpose

Register a preset so its customizations are applied during config merge.
Installation validates the preset manifest, checks for conflicts, and
writes the registry entry.

## Sub-steps

1. **Resolve source path** — If coming from Step 01 (discover), use the
   discovered source path. Otherwise, elicit from user:
   ```
   Preset source path: _
   ```

   Expand path tokens (`{workspace}`, `{project-root}`, etc.).

2. **Validate preset directory** — Confirm:
   - Directory exists
   - Contains `preset.toml`
   - `preset.toml` parses without error

3. **Load preset manifest** — Read `preset.toml` and extract:
   - `[preset].name` (required)
   - `[preset].description`
   - `[preset].version`
   - `[preset].requires_aide_version`
   - `[preset].conflicts_with`
   - `[preset].extends`
   - `[[preset.files]]` array

4. **Validate preset name** — If user provided a `preset_name` input,
   confirm it matches `[preset].name` in the manifest. Mismatch is an error.

5. **Check version constraint** — If `requires_aide_version` is set,
   compare against current A.I.D.E. version. Mismatch is a **warning**,
   not a blocker.

6. **Check conflicts** — Load `{project-root}/presets.toml` and
   `{project-root}/presets.user.toml`. For each preset where
   `enabled = true`, check if this preset's name appears in their
   `conflicts_with` list OR if their name appears in this preset's
   `conflicts_with`. If conflict exists:
   ```
   Error: Preset 'enterprise-compliance' conflicts with already-enabled preset 'minimal-docs'.
   Disable 'minimal-docs' first, then retry.
   ```

7. **Check for duplicate** — If a preset with the same name is already
   registered, prompt:
   ```
   Preset 'enterprise-compliance' is already registered.
   Update source path? [y/N]: _
   ```

   If yes, update the existing entry. If no, abort.

8. **Write registry entry** — Append to `presets.toml`:
   ```toml
   [[presets]]
   name = "enterprise-compliance"
   source = "{workspace}/aide-enterprise-addon/presets/enterprise-compliance"
   enabled = true
   ```

   If `presets.toml` doesn't exist, create it with the managed header:
   ```toml
   # Preset registry — managed by skills/meta/manage-presets
   # Edit via the skill or by hand; both are supported.
   # See config/SCHEMAS.md § 2.11 for schema.

   [[presets]]
   ...
   ```

9. **Confirm installation** — Display:
   ```
   Installed preset 'enterprise-compliance' from {workspace}/aide-enterprise-addon/presets/enterprise-compliance

   Files in this preset:
   - customizations/create-requirements-package.toml — Adds compliance-callout block
   - customizations/review-implementation-package.toml — Requires compliance sign-off gate

   The preset is enabled and will take effect on the next skill invocation.
   ```

## Hard gates

- Source path MUST exist and contain valid `preset.toml`
- Preset name MUST match manifest
- No conflicts with enabled presets

## Exit criteria

- [ ] Preset validated
- [ ] Conflicts checked
- [ ] Entry written to `presets.toml`
- [ ] Confirmation displayed

## Next

Skill exits. User may run affected skills to see the preset's effect.
