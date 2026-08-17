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

## Workflow

1. **Read `features.toml`.** If it does not exist, offer to create it —
   creating the file and appending the first entry *is* the opt-in moment.
   Confirm with the user before scaffolding it; do not create it silently.
2. **Branch on registry state:**
   - **Empty registry** → skip straight to create (step 4). There is nothing
     to select from.
   - **Non-empty, caller supplied a description** (e.g. the user's own request
     text, passed through from a halted skill) → rank existing features
     against it. If a plausible match surfaces, present it first; if none
     plausibly matches, skip straight to create rather than making the user
     reject a list first.
   - **Otherwise** → go to step 3.
3. **Select.** List every registered feature: `id`, `title`, `ticket` (if
   set), and which stages already have artifacts on disk (a cheap
   existence check under each stage root). Mark the current
   `[user].active_feature`, if any. Offer "create a new feature" as a
   permanently visible option in the same list, not buried beneath it. On
   choice, set `[user].active_feature` in `project.user.toml`, creating the
   `[user]` block if needed. Go to step 5.
4. **Create.** Prompt for a one-line title, propose a kebab slug as the `id`,
   let the user override it, optionally capture `ticket` and `repos`. Append the
   entry to `features.toml` and set it as `[user].active_feature`. There is no
   number to allocate: the `id` is the slug and nothing else (`config/SCHEMAS.md`
   § 2.8).

   **Reject a slug already in the registry** and ask for another. Two features
   cannot share a directory, and with no ordinal there is nothing to
   disambiguate them by — so near-neighbours must be named apart
   (`refunds-api` and `refunds-ui`, not two `refunds`).

   **Also warn if the slug matches a `docs/` directory the user has just said is
   *not* this feature.** Because the id is the directory name, the resolution
   rule would adopt that directory as this feature's working tree without
   asking — so naming a feature `architecture` on a project with a hand-written
   `docs/architecture/` quietly merges the two. Nothing validates this (a
   registry file says nothing about what else lives under `docs/`), which is why
   the check belongs here, at the only point where both the proposed name and
   the directory listing are in view.

   **When proposing the slug, look at `docs/` first.** If the project has
   pre-opt-in working directories (a `docs/<name>/` matching no registered
   feature) and one plausibly covers the work being minted, propose *that
   directory's name* and say why:

   > `docs/refunds/` looks like this work. Using `refunds` as the id means that
   > directory already matches, so nothing has to move.

   This is load-bearing, not cosmetic. When the id matches an existing
   directory, the resolution rule in
   `references/ai-principles/feature-precondition.md` takes its first branch and
   the feature simply continues in place — no rename, no question, no second
   tree. Deriving the slug purely from a freshly typed title is the likeliest way
   to miss that, since "Refund processing fixes" yields
   `refund-processing-fixes`, not `refunds`, and the next skill would then offer
   to reconcile a mismatch that never needed to exist. The user may still
   override — an unrelated directory should not capture the name — but the match
   must be offered before a title-derived slug wins by default.
5. **Echo the resolved output paths.** Print, for each stage the project
   uses, where that stage's artifacts will land once the feature is active
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
- **Silently creating `features.toml`.** Its creation is the project's opt-in
  moment; confirm with the user rather than scaffolding it as a side effect.
- **Deriving the slug from the title alone on a project with existing
  `docs/<name>/` directories.** An id that matches the existing directory needs
  no migration at all; a title-derived one that misses it turns a non-event into
  a reconciliation prompt, and if that prompt is answered carelessly, into a
  second tree for one feature. Check `docs/` before proposing.
- **Reusing an id that is already registered.** There is no ordinal to tell two
  `refunds` apart, so a duplicate is a directory collision, not a variant.
  Reject it at mint time rather than letting Check N2 catch it in CI.
- **Skipping the output-path echo.** It is the one moment a wrong resolution
  is cheap to catch, before anything is written to disk.
- **Treating `repos` as authoritative.** It is advisory; the calling skill's
  own run-time scope prompt always wins on divergence.
- **Adding a `status` field "just this once."** Feature lifecycle is
  explicitly deferred — do not let it back in through this skill.
