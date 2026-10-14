---
name: select-feature
description: "Use when the user wants to choose which feature they're working on, switch their active feature, list registered features, or start a new feature — says 'select a feature', 'switch feature', 'what features exist', 'which feature am I on', 'start a new feature', 'register this feature', or is redirected here by another skill's halted precondition (\"No active feature. Run select-feature.\"). Reads and writes the project's feature registry (features.toml) and the personal active-feature pointer ([user].active_feature in project.user.toml). Only relevant on projects that have opted into feature-scoped paths."
---

# Select Feature

## Overview

The project's feature registry (`features.toml`) and the per-person active-feature
pointer (`[user].active_feature` in `project.user.toml`) exist to give the
`{feature-id}` token — already load-bearing in every stage's output paths — a
real source of truth instead of letting each skill improvise one from whatever
the user typed. See `config/SCHEMAS.md` § 2.8 and § 2.9 for the schema.

This skill is the single place that reads and writes both files. Two modes:

- **Select** (default) — list registered features, mark the currently active
  one, and set `[user].active_feature` on choice.
- **Create** — reachable directly, or offered from inside select — mint the
  next feature ID and set it active.

**`caller_mode` decides whether create is reachable at all.** When a halted skill
redirects here it passes its own name as `caller` and, if it is a Mode B skill, also
`caller_mode = select-only` (see `references/INPUTS-OUTPUTS.md` and
`references/ai-principles/feature-precondition.md` Mode B). Under `select-only`
**create is unreachable for that call** — every branch below that would otherwise
route to or offer create is suppressed, and the steps say so individually. The
default is `select-and-create`, which is also what a direct invocation gets: a user
who runs this skill themselves may always mint.

This is not a stylistic preference. Twelve Mode B skills — every `review-*`, the
audit and execution skills, `manage-bugs`, `execute-quick-change` — depend on the
suppression, because each operates on an artifact that must already exist. Minting a
feature at a review would produce one with nothing to review, then attach a confident
verdict to it. If create is offered on a `select-only` call, that is a defect in this
skill, not a judgement call.

**Select leads; create follows.** A skill that opens by offering to add a
feature re-creates the exact hazard this skill exists to prevent: a user who
does not recall that `refund-delays` already exists will cheerfully
mint `delayed-refund-alerts` for the same work. Presenting what
already exists first makes reuse the path of least resistance. See
`references/OVERVIEW.md` for the full reasoning and the two cases that skip
straight to create.

## When to use

- The user wants to see which features are registered, or which one is active
- The user wants to switch their active feature before starting work
- The user is starting genuinely new work and needs a feature ID minted
- Another skill halted with "No active feature. Run `select-feature`, then
  re-run this skill." — this skill is that redirect's destination
- `project.toml` exists but `features.toml` does not, and the user wants to
  opt in to feature-scoped paths for the first time (creating the first entry
  **is** the opt-in — see `config/SCHEMAS.md` § 2.8)

## When NOT to use

- The project has not opted in and never will (no `features.toml`, no
  intention to create one) — every skill already behaves correctly with no
  active feature in that case; there is nothing for this skill to do
- The user wants to rename or delete a feature's on-disk artifacts — this
  skill only touches the two config files, never the artifact tree
- The user wants to record that a feature shipped or was abandoned — feature
  status/lifecycle is explicitly out of scope (`_docs/feature-id-minimal-plan.md`
  § 1); this skill carries identity only

## Inputs

See `references/INPUTS-OUTPUTS.md`.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

1. **Read `features.toml`.** If it does not exist, offer to create it —
   creating the file and appending the first entry *is* the opt-in moment.
   Confirm with the user before scaffolding it; do not create it silently.
2. **Branch on registry state:**
   - **Empty registry** → skip straight to create (step 4). There is nothing
     to select from. **Under `select-only`** create is unreachable and there is
     nothing to select, so this call cannot succeed: halt, naming the `create-*`
     skill that produces what the caller wanted to read.
     > No features are registered yet, and `<caller>` needs one that already has
     > artifacts. Run the stage's `create-*` skill first — that is what mints the
     > feature and writes its first artifact.
   - **Non-empty, caller supplied a description** (e.g. the user's own request
     text, passed through from a halted skill) → rank existing features
     against it. If a plausible match surfaces, present it first; if none
     plausibly matches, skip straight to create rather than making the user
     reject a list first. **Under `select-only`**, fall through to step 3 and
     present the full list instead. A weak ranking is not evidence that the
     feature is absent — a Mode B caller's description is usually an *action*
     ("review the requirements package"), which resembles no feature title, so
     this branch would otherwise route almost every review to a suppressed step.
   - **Otherwise** → go to step 3.
3. **Select.** List every registered feature: `id`, `title`, `ticket` (if
   set), and which stages already have artifacts on disk (a cheap
   existence check under each stage root). Mark the current
   `[user].active_feature`, if any. Offer "create a new feature" as a
   permanently visible option in the same list, not buried beneath it —
   **except under `select-only`, where that option is omitted entirely.** Do not
   render it greyed out or explain that it is disabled; an unreachable option
   invites the user to ask for it. The list is then exactly the registered
   features. On choice, set `[user].active_feature` in `project.user.toml`,
   creating the `[user]` block if needed. Go to step 5.

   If the user asks to create one anyway, say why it is not available here and
   name the way in:
   > `<caller>` works on a feature that already has artifacts, so it can't mint a
   > new one. Pick an existing feature, or run the stage's `create-*` skill to
   > start a new one and come back.
4. **Create** — *unreachable under `select-only`*; step 2 and step 3 are the only
   routes in, and both suppress it. Prompt for a one-line title, propose a kebab slug as the `id`,
   let the user override it, optionally capture `ticket` and `repos`. Append the
   entry to `features.toml` and set it as `[user].active_feature`. There is no
   number to allocate: the `id` is the slug and nothing else (`config/SCHEMAS.md`
   § 2.8).

   **Reject a slug already in the registry** and ask for another. Two features
   cannot share a directory, and with no ordinal there is nothing to
   disambiguate them by — so near-neighbours must be named apart
   (`refunds-api` and `refunds-ui`, not two `refunds`).

   **When proposing the slug, look at `docs/` first.** If a `docs/<name>/`
   matches no registered feature and plausibly covers this work, propose *that
   directory's name*: "Refund processing fixes" yields
   `refund-processing-fixes`, not `refunds`, leaving a mismatch to reconcile
   downstream instead of one that never needed to exist.

   **Then, before accepting any `id` that matches a `docs/` directory no
   registered feature owns, ask — every time, however the slug was derived:**

   > `architecture` matches `docs/architecture/`, which no registered feature
   > owns. Is that directory this feature's work, or something else?

   Never infer this from the title, and never skip the question because the
   match looks obvious: the precondition's legacy-tree check treats a match as
   this feature's pre-2.7.0 working tree, and nothing validates the answer.

   - **"This feature's work"** → use it; each stage offers the move once.
     > Using `architecture`, then — each stage will offer to move its part of
     > `docs/architecture/` into its feature directory the first time it runs.
   - **"Something else"** → the name is unavailable; ask for another.
     > Then `architecture` can't be the id: the stages would mistake
     > `docs/architecture/` for this feature's earlier work. Pick a name
     > that isn't already a directory.
   - **Overriding a proposed match** → name the cost, because declining is what
     actually produces two trees for one feature.
     > That leaves `docs/refunds/` where it is; no stage will recognise it as
     > this feature's earlier work, so it stays apart from this feature.
5. **Echo the resolved output paths.** Print, for each stage the project
   uses, where all of that stage's artifacts, working files included, will land
   (e.g. `.framework-output/requirements/alert-customer/`). This is
   the cheapest possible guard against writing to the wrong place — the user
   sees it before any work starts.
6. **Return to the caller.** If invoked from a halted skill's precondition,
   close with `## Next skill` naming that caller, so the user is carried back
   without having to remember what they were doing. If invoked directly by
   the user, stop here.

## Output

See `references/INPUTS-OUTPUTS.md`. Updates `features.toml` (create mode only)
and `[user].active_feature` in `project.user.toml` (both modes), plus a chat
summary of the resolved feature and its output paths.

## Next skill

Whatever the caller named when it halted (`## Next skill\n<caller>`), or
whatever the user came here to do if invoked directly. This skill never
proceeds into a `create-*` / `execute-*` skill on its own — it activates a
feature and stops.

## Common mistakes

- **Offering create before select.** Reproduces the duplicate-identity hazard
  this skill exists to prevent — always list what already exists first,
  except in the two skip cases in step 2.
- **Offering create at all on a `select-only` call.** The two step-2 skip cases and
  step 3's permanently-visible option are all suppressed when a Mode B caller sets
  `caller_mode = select-only`. Twelve skills depend on this; letting a `review-*`
  caller mint a feature produces one with nothing to review and then a verdict
  about it. Check `caller_mode` before rendering any create affordance.
- **Silently creating `features.toml`.** Its creation is the project's opt-in
  moment; confirm with the user rather than scaffolding it as a side effect.
- **Deriving the slug from the title alone when `docs/<name>/` directories
  exist, or accepting a matching id without asking whose work that directory
  is.** The id *is* the directory name, so that answer decides whether the
  feature continues in place or silently absorbs unrelated work. Check `docs/`
  first, then ask — the question has no safe default.
- **Reusing an id that is already registered.** There is no ordinal to tell two
  `refunds` apart, so a duplicate is a directory collision, not a variant.
  Reject it at mint time rather than letting Check N2 catch it in CI.
- **Skipping the output-path echo.** It is the one moment a wrong resolution
  is cheap to catch, before anything is written to disk.
- **Treating `repos` as authoritative.** It is advisory; the calling skill's
  own run-time scope prompt always wins on divergence.
- **Adding a `status` field "just this once."** Feature lifecycle is
  explicitly deferred — do not let it back in through this skill.
