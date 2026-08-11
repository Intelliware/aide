---
slug: verify-merge
sequence: 5
depends-on-prior: true
---

# Step 5 — Verify merge

Re-read the just-written file from disk, run the full layer-stack
merge, and show the user the EFFECTIVE post-write configuration. This
is the only way to confirm the override actually wins precedence.

## Purpose

Hand-edited TOML often parses but does not behave. This step closes
the loop by simulating exactly what the loader will see at runtime
and showing the user the result.

## Sub-steps

1. **Re-read** every layer from disk in precedence order (low →
   high):
   1. `framework.toml` (installer-shipped)
   2. `framework.user.toml` (if present)
   3. `project.toml`
   4. `project.user.toml` (if present)
   5. **Presets** (from `presets.toml`, enabled only, in array order)
   6. `customizations/<skill>.toml` (per skill, if present)
   7. `customizations/<skill>.user.toml` (per skill, if present)

   Use the merge rules in `config/SCHEMAS.md` § 1.3 (scalar override,
   table recursive merge, array-of-tables merge by `code`/`id`,
   plain-array replace) and the `_suppress = true` semantics in §
   1.4.

2. **Compute** the effective value at the target path. For
   `suppress`, also compute the effective array before-and-after.
   For `merge-table`, show the merged table at one level deeper than
   the override path so the user sees inherited keys.

3. **Print the merge table** in the format:

   ```
   <target_path>
   Layer                                Value
   -----------------------------------  -----
   framework                            <v>
   framework.user                       <v or —>
   project                              <v or —>
   project.user                         <v or —>
   preset: enterprise-compliance        <v or —>
   preset: team-conventions             <v or —>
   customizations/<skill>.toml          <v or —>
   customizations/<skill>.user.toml     <v or —>
   EFFECTIVE                            <v>
   ```

   For arrays, print the effective list (one entry per line).

   **Preset origins:** When a value comes from a preset, show the
   preset name in the layer column. List presets in their merge order
   (earlier = lower precedence). This helps users understand why a
   value may differ from what they expect.

4. **Validate** the override actually wins. If the EFFECTIVE value
   differs from what the user authored, surface the higher-precedence
   layer that overrode it and offer to drop into a higher layer
   (e.g. user wrote to `project.toml` but `project.user.toml`
   already overrides at the same path on this machine).

5. **Final summary**:
   - Path written
   - Operation applied
   - Effective value
   - Suggested next action ("re-run the customized skill to see the
     change")

## Hard gates

- The effective value MUST be computed from disk, not from the
  in-memory state used during step 04.
- If the user's override does not actually win, the skill MUST
  surface that fact rather than declaring success.

## Exit criteria

- [ ] Merge table printed.
- [ ] Effective value confirmed equal to (or non-equal to with
      explanation) the authored value.
- [ ] Skill exits — no handoff to another skill.

## Next

This is the last step. `customize-framework` is a tail action; no
automatic handoff. The user typically re-runs whatever skill was
customized to see the new behavior.
