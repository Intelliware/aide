---
slug: detect-existing
sequence: 1
depends-on-prior: false
---

# Step 1 — Detect existing project

Hard gate. Run before any elicitation. The whole skill is destructive
toward `project.toml`, so this step decides whether we are bootstrapping
fresh, extending, or re-baselining.

## Purpose

Prevent accidental overwrite of an existing `project.toml`. Surface the
existing state to the user, present the three legitimate continuation
paths, and route the rest of the skill accordingly.

## Sub-steps (run in order)

1. Inspect `{cwd}/project.toml`.
2. If absent — bootstrap path. Set mode = `fresh`. Continue to step 02.
3. If present — read and parse it. Surface a brief summary to the user:
   - `project.name`, `project.code`, `project.default_flow`
   - count of `[[project.repos]]` entries
   - presence of `project.user.toml` (sibling file)
4. Ask the user which continuation they want:
   - **Add a repo** — set mode = `extend-repos`. Skip step 03; go to step 04 and append (don't replace) entries.
   - **Re-baseline** — set mode = `rebaseline`. Confirm overwrite; continue with full elicitation. Take a backup at `project.toml.bak` before step 05 writes.
   - **Targeted override** — exit this skill and hand off to `customize-framework`.
   - **Cancel** — exit silently.
5. Carry the chosen mode forward as a step input for step 05.

## Hard gates

- Existing `project.toml` MUST NOT be overwritten without explicit
  user confirmation.
- A backup MUST be written to `project.toml.bak` before re-baseline
  overwrites.

## Exit criteria

- [ ] `project.toml` presence is known.
- [ ] Mode is one of `fresh`, `extend-repos`, `rebaseline`, or the skill
      has already exited.
- [ ] If extending or rebaselining, the user has acknowledged what is
      about to happen.

## Next

Step 02 (elicit-flow) for `fresh` and `rebaseline`. Skip directly to
step 04 (elicit-repos) for `extend-repos`.
