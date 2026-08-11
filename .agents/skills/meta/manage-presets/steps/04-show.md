---
slug: show
sequence: 4
depends-on-prior: false
---

# Step 4 — Show preset

Display a preset's contents, metadata, and current status.

## Purpose

Allow users to inspect what a preset contains before installing or to
understand what an installed preset is doing. This is a read-only
operation that does not modify any files.

## Sub-steps

1. **Resolve preset location** — The preset can be identified by:
   - **Name** — Look up in `presets.toml` to get `source` path
   - **Path** — Direct path to a preset directory

   If name provided but not registered:
   ```
   Preset 'enterprise-compliance' is not registered.
   Looking for it in workspace folders...
   ```
   Then scan as in Step 01 (discover).

2. **Load preset manifest** — Read `preset.toml` from the resolved path.
   If missing or invalid:
   ```
   Error: No valid preset.toml found at <path>
   ```

3. **Display metadata**:
   ```
   Preset: enterprise-compliance
   ==============================

   Description:  SOX/SOC2 compliance gates for regulated environments
   Version:      1.0.0
   Requires:     A.I.D.E. >= 2.3.0
   Tags:         compliance, enterprise, regulated
   ```

4. **Display registration status**:
   ```
   Status: Enabled (registered in presets.toml)
   Source: {workspace}/aide-enterprise-addon/presets/enterprise-compliance
   ```

   Or if not registered:
   ```
   Status: Not installed
   Source: {workspace}/aide-enterprise-addon/presets/enterprise-compliance
   ```

5. **Display conflicts and extensions**:
   ```
   Conflicts with: minimal-docs, fast-iteration
   Extends:        (none)
   ```

6. **Display customization files** — For each `[[preset.files]]` entry:
   ```
   Customization Files
   -------------------

   1. create-requirements-package.toml
      Skill:   create-requirements-package
      Summary: Adds compliance-callout block and requires regulatory-impact section

   2. review-requirements-package.toml
      Skill:   review-requirements-package
      Summary: Adds compliance review lens with regulatory-mapping check

   3. review-implementation-package.toml
      Skill:   review-implementation-package
      Summary: Requires compliance sign-off gate before GO verdict
   ```

7. **Display hooks (if any)** — Scan customization files for `[[hooks]]`
   declarations:
   ```
   Hooks Defined
   -------------

   - execute-increments: after-hook → verify-source (code: compliance-check-post-increment)
   ```

8. **Display effective merge position** — Show where this preset sits in
   the merge order:
   ```
   Merge Order
   -----------

   1. framework.toml
   2. project.toml
   3. [presets]
      a. team-conventions (enabled)
      b. enterprise-compliance (enabled) ← this preset
   4. customizations/<skill>.toml (wins over presets)
   ```

9. **Offer next action** (if not registered):
   ```
   Install this preset? [y/N]: _
   ```
   If yes, proceed to Step 02 (install).

## Hard gates

- Preset path must be resolvable
- `preset.toml` must be parseable

## Exit criteria

- [ ] Preset metadata displayed
- [ ] Registration status shown
- [ ] Customization files listed
- [ ] Hooks identified and displayed
- [ ] Merge position shown

## Next

Step 02 (install) if user chooses to install, otherwise skill exits.
