---
slug: enable-disable
sequence: 3
depends-on-prior: false
---

# Step 3 — Enable or disable preset

Toggle a preset's `enabled` state in the registry.

## Purpose

Allow users to activate or deactivate presets without removing them from
the registry. Disabled presets are skipped during config merge but
remembered for easy re-enabling.

## Sub-steps

1. **Determine operation** — Based on skill input:
   - `enable` — set `enabled = true`
   - `disable` — set `enabled = false`

2. **Determine target file** — Based on `--personal` flag:
   - Without flag: write to `{project-root}/presets.toml` (team)
   - With flag: write to `{project-root}/presets.user.toml` (personal)

3. **Load registries** — Read both `presets.toml` and `presets.user.toml`
   (if they exist). Compute the merged state:
   - Personal entries override team entries by name

4. **Find preset** — Look for an entry with matching `name`:
   - In team registry
   - In personal registry

   If not found:
   ```
   Error: Preset 'enterprise-compliance' is not registered.
   Run 'manage-presets install' first.
   ```

5. **Check conflicts (enable only)** — When enabling, check against
   other enabled presets' `conflicts_with` declarations. If conflict:
   ```
   Error: Cannot enable 'enterprise-compliance' — conflicts with enabled preset 'minimal-docs'.
   Disable 'minimal-docs' first.
   ```

6. **Determine write strategy**:

   **For team file (`presets.toml`):**
   - If entry exists in team file, update `enabled` in place
   - If entry only exists in personal file, this is an error (can't move
     personal entries to team)

   **For personal file (`presets.user.toml`):**
   - If entry exists in personal file, update `enabled` in place
   - If entry only exists in team file, add a new personal entry that
     overrides just the `enabled` field:
     ```toml
     [[presets]]
     name = "enterprise-compliance"
     enabled = false    # Personal override
     ```

7. **Write update** — Update the target file. If creating
   `presets.user.toml` for the first time:
   - Write managed header
   - Patch `.gitignore` to include `presets.user.toml`

8. **Confirm change** — Display:
   ```
   Preset 'enterprise-compliance' is now disabled.

   Note: This change is in your personal registry (presets.user.toml).
   Team members will still see this preset as enabled.
   ```

   Or for team changes:
   ```
   Preset 'enterprise-compliance' is now enabled.

   This change affects all team members.
   ```

## Hard gates

- Preset MUST be registered
- Enable operation MUST pass conflict check
- Cannot move personal entries to team registry

## Exit criteria

- [ ] Preset found in registry
- [ ] Conflicts checked (for enable)
- [ ] Target file updated
- [ ] `.gitignore` patched if `presets.user.toml` created
- [ ] Confirmation displayed

## Next

Skill exits. User may run affected skills to see the change.
