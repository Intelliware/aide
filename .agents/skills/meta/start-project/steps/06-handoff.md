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

3. **When step 05 wrote `features.toml`**, state the default once, immediately
   before the handoff:

   > This project is feature-scoped: each delivery unit gets an ID like
   > `refund-processing`, and that ID becomes a directory segment in
   > every artifact path, so two features can never write over each other. The
   > first skill that produces feature-scoped work will ask you to name the
   > feature. If you'd rather not work this way, delete `features.toml` and
   > everything reverts to flat paths.

   A statement, not a question — do not wait for a reply. It names the opt-*out*
   because the file is already written; the reversal is one deletion and no
   migration, which is exactly why it is safe to default on for a project with no
   artifacts yet.

   **Do not mint a feature here, and do not route through `select-feature`.** The
   registry is created empty on purpose. Which skill comes next decides when a
   feature ID is meaningful, and for `brownfield` that is much later:
   `analyze-repository`, the `reverse-engineer-*` skills and
   `build-knowledge-base` carry no active-feature precondition at all, because RE
   documentation and KB components are keyed by repo-slug and domain rather than
   by feature. Forcing a name at bootstrap would make the user invent a feature
   for work that is not feature work, and that premature ID would then be the
   active one when their first real feature arrives — so it either gets reused
   under a wrong name or a second entry gets minted for the same work, which is
   the duplicate-identity hazard `select-feature` exists to prevent.

   Letting the precondition fire on its own costs nothing and lands the question
   at the right moment. For `greenfield` and `quick-dev` the very next skill is
   feature-scoped, so it halts immediately, redirects to `select-feature`, and is
   returned to automatically via `## Next skill\n<caller>` — the same destination,
   asked while the user is describing the work instead of configuring a project.

   When step 05 **skipped** `features.toml` (mode = `rebaseline` or
   `extend-repos`), say nothing about feature scoping. That project's paths are
   unchanged and an unprompted offer to restructure an existing artifact tree is a
   migration conversation this skill cannot finish — `select-feature` is there when
   its owner raises it.

4. Emit the handoff. Do not invoke the next skill silently — the user
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
- [ ] No feature minted and no `[user].active_feature` set by this skill — the
      registry is handed over empty.
- [ ] User has the trigger phrase for the next skill.
- [ ] Skill terminates cleanly (no further elicitation in this thread
      from `start-project`).

## Next

This is the last step of `start-project`. Control passes to:

- `create-requirements-package` (greenfield), or
- `analyze-repository` (brownfield), or
- `document-quick-change` (quick-dev).

Unchanged by the feature-registry default: the first skill that needs a feature
asks for one, which for brownfield is several skills later.
