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
does not recall that `FEAT-0007-refund-delays` already exists will cheerfully
mint `FEAT-0012-delayed-refund-alerts` for the same work. Presenting what
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
4. **Create.** Compute the next ordinal as `max(existing ordinals) + 1` (or
   `1` for an empty/absent registry). Prompt for a one-line title, propose a
   kebab slug from it, let the user override the slug, optionally capture
   `ticket` and `repos`. Warn if the local working tree is behind its remote
   before appending — a stale read is the one concurrency hazard ordinal
   allocation has (see `config/SCHEMAS.md` § 2.8). Append the entry to
   `features.toml` and set it as `[user].active_feature`.

   **When proposing the slug, look at `docs/` first.** If the project has
   pre-opt-in working directories (`docs/<slug>/` with no `FEAT-NNNN-` prefix)
   and one plausibly covers the work being minted, propose *that directory's
   name* as the slug and say why:

   > `docs/refunds/` looks like this work. Using `refunds` as the slug gives
   > `FEAT-0001-refunds`, so I can offer to rename that directory instead of
   > starting a second one beside it.

   This is not cosmetic. The reconciliation rule in
   `references/ai-principles/feature-precondition.md` finds a feature's
   pre-opt-in directory by stripping `FEAT-NNNN-` from the ID and matching the
   remainder, so a slug that does not match is a slug that makes the rule
   invisible: the next skill takes the "neither exists" branch and creates a
   second tree without asking. Deriving the slug purely from a freshly typed
   title is the likeliest way to land there, since "Refund processing fixes"
   yields `refund-processing-fixes`, not `refunds`. The user may still override
   — an unrelated directory should not capture the name — but the match must be
   offered before a title-derived slug wins by default.
5. **Echo the resolved output paths.** Print, for each stage the project
   uses, where that stage's artifacts will land once the feature is active
   (e.g. `.framework-output/requirements/FEAT-0001-alert-customer/`). This is
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
  `docs/<slug>/` directories.** The reconciliation rule matches a feature's
  pre-opt-in directory on the slug, so a title-derived slug that misses it
  silently starts a second tree for one feature — the exact failure feature IDs
  exist to prevent. Check `docs/` before proposing.
- **Minting without checking registry freshness.** Two people minting on
  separate branches can both compute the same next ordinal — warn when the
  working tree looks behind, and let the (loud, small) merge conflict be the
  final backstop rather than the first line of defense.
- **Skipping the output-path echo.** It is the one moment a wrong resolution
  is cheap to catch, before anything is written to disk.
- **Treating `repos` as authoritative.** It is advisory; the calling skill's
  own run-time scope prompt always wins on divergence.
- **Adding a `status` field "just this once."** Feature lifecycle is
  explicitly deferred — do not let it back in through this skill.
