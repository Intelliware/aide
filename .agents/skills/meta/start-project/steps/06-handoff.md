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

3. **When step 05 wrote `features.toml`**, state the default once and name the
   extra hop, immediately before the handoff:

   > This project is feature-scoped: each delivery unit gets an ID like
   > `FEAT-0001-refund-processing`, and that ID is a directory segment in every
   > artifact path, so two features can never write over each other. I'll hand you
   > to `select-feature` first to name this one, then straight on to
   > `<next skill>`. If you'd rather not work this way, delete `features.toml` and
   > everything reverts to flat paths.

   A statement, not a question — do not wait for a reply. It names the opt-*out*
   because the file is already written; the reversal is one deletion and no
   migration, which is exactly why it is safe to default on for a project with no
   artifacts yet.

   When step 05 **skipped** `features.toml` (mode = `rebaseline` or
   `extend-repos`), say nothing about feature scoping. That project's paths are
   unchanged and an unprompted offer to restructure an existing artifact tree is a
   migration conversation this skill cannot finish — `select-feature` is there when
   its owner raises it.

4. **Route through `select-feature` when `features.toml` was written.** Hand off to
   `select-feature`, passing the flow's next skill (from the table above) as
   `caller` and the user's project description as `description`. Its empty-registry
   path goes straight to create, and its step 6 closes with
   `## Next skill\n<caller>`, so the user lands in the stage skill with
   `FEAT-0001` already active.

   Routing this way rather than handing straight to the stage skill avoids an
   immediate halt: with a registry present and no `[user].active_feature`, every
   write-side skill's Mode A precondition stops on its first step and sends the
   user to `select-feature` anyway. Same destination, one less dead end, and the
   feature gets named when the user is describing work instead of configuring a
   project.

5. Emit the handoff. Do not invoke the next skill silently — the user
   should see the transition.

## Hard gates

- The next skill name MUST match an existing skill folder under
  `skills/<stage>/<skill>/`. Validate against the catalog before emit.
- Bootstrap state MUST be persisted (step 05 already did this) before
  handoff.

## Exit criteria

- [ ] Handoff message emitted.
- [ ] Feature-scoping note stated once iff step 05 wrote `features.toml`, naming
      the opt-out; silent otherwise.
- [ ] Handoff routed via `select-feature` (with `caller` set) iff `features.toml`
      was written; direct to the flow's next skill otherwise.
- [ ] User has the trigger phrase for the next skill.
- [ ] Skill terminates cleanly (no further elicitation in this thread
      from `start-project`).

## Next

This is the last step of `start-project`. Control passes to:

- `select-feature` when step 05 wrote `features.toml`, carrying the flow's skill
  below as `caller` so control continues there once a feature is active; otherwise
  directly to:
- `create-requirements-package` (greenfield), or
- `analyze-repository` (brownfield), or
- `document-quick-change` (quick-dev).
