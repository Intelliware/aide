---
slug: handoff
sequence: 6
depends-on-prior: true
---

# Step 6 — Handoff

Final step. Pass control to the first skill of the chosen flow. The
handoff is by name only — this skill does not pre-load the next
skill's references.

## Purpose

Make the transition from bootstrap to flow execution explicit. The
user sees which skill is taking over and why; downstream skills know
that `project.toml` is now in place and validated.

## Sub-steps

1. Look up the next skill by `flow` (chosen in step 02):

| flow | next skill | rationale |
|---|---|---|
| `greenfield` | `create-requirements-package` | Net-new — start with requirements; no source to RE. |
| `brownfield` | `analyze-repository` | Identify which RE skill applies for the primary repo, then sequence RE → KB build → requirements (brownfield mode). |
| `quick-dev` | `document-quick-change` | Tiny change — one combined spec file, no formal stages. |

2. Compose the handoff message. Include:
   - The skill name (kebab-case, exactly as it appears in the catalog)
   - One sentence on why this skill is next
   - Any input the next skill will need that the user already supplied
     (e.g. for brownfield: "I'll start with `api-orders` because it's
     marked `primary = true`")
   - The trigger phrase the user can repeat to invoke the next skill
     manually if they want to come back to it later

3. Add the feature-scoping note, once, immediately before the handoff:

   > Artifacts will be written per feature under `docs/`, in a folder named from
   > your description. If you would rather have them keyed to a registered
   > feature ID (`docs/FEAT-0001-refund-processing/`), run `select-feature` at
   > any point — including later, once work is already underway.

   This is a statement, not a question. Do not wait for a reply, do not create
   `features.toml`, and do not re-raise it if the user says nothing — the note
   exists because opt-in is otherwise undiscoverable from bootstrap, not because
   the project needs to decide now. `select-feature` handles a mid-flight opt-in,
   including renaming an existing `docs/<slug>/`.

4. Emit the handoff. Do not invoke the next skill silently — the user
   should see the transition.

## Hard gates

- The next skill name MUST match an existing skill folder under
  `skills/<stage>/<skill>/`. Validate against the catalog before emit.
- Bootstrap state MUST be persisted (step 05 already did this) before
  handoff.

## Exit criteria

- [ ] Handoff message emitted.
- [ ] Feature-scoping note stated once, with no `features.toml` written.
- [ ] User has the trigger phrase for the next skill.
- [ ] Skill terminates cleanly (no further elicitation in this thread
      from `start-project`).

## Next

This is the last step of `start-project`. Control passes to:

- `create-requirements-package` (greenfield), or
- `analyze-repository` (brownfield), or
- `document-quick-change` (quick-dev).
