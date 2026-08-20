# Overview — select-feature

## Purpose

`{feature-id}` already appears in 21+ skill files and 7+ compositions, in
strings like `{paths.requirements_package}/{feature-id}/{feature-id}-requirements.md`.
Before this skill existed, nothing anywhere defined what its *value* was: no
skill minted it, no config declared it, no elicitation pattern asked for it —
it was resolved by whatever the agent decided in the moment. Two sessions
describing the same work could produce two different IDs and two orphan
directory trees, with no error raised anywhere.

`select-feature` is the single place that mints and activates a feature ID,
backed by two files:

- `features.toml` (project root, committed) — the registry of every feature
  that has ever been minted. Shared truth.
- `[user].active_feature` in `project.user.toml` (gitignored) — which feature
  *this person, on this machine* is currently working on. Personal state.

See `config/SCHEMAS.md` § 2.8 and § 2.9 for the full schema and the reasoning
behind splitting registry (Layer 3 territory) from pointer (Layer 4).

## Why select leads and create follows

The failure this skill exists to prevent is the same piece of work acquiring
two identities. A skill that opens by offering to *add* a feature reproduces
that hazard at exactly the moment it was meant to stop it: a user who does not
recall that `refund-delays` exists will cheerfully mint
`delayed-refund-alerts` for the same work. Presenting what already
exists first — with enough context per entry to be recognised (ID, title,
ticket, which stages already have artifacts) — makes reuse the path of least
resistance and creation the deliberate choice.

**Two cases skip selection entirely**, or select-first becomes friction for no
benefit:

1. **Empty registry.** Nothing to select from — go straight to create.
2. **A supplied description with no plausible match.** When the caller passes
   the text the user already typed (e.g. a halted skill forwarding the
   original request), and ranking it against existing features surfaces
   nothing plausible, offer create immediately rather than making the user
   reject a list first.

The inverse risk is worth naming too: if creating reads as the discouraged
path, people attach unrelated work to a loosely-related existing feature, and
a feature accumulating three unrelated changes is its own kind of mess. That
is why create stays a visible, first-class option in the select list rather
than something buried beneath it — the design leans toward reuse, it does not
mandate it.

## Why the `docs/` question is unconditional

The `id` *is* the directory name, so a proposed `id` that matches an existing
`docs/<name>/` is one of two completely different situations, and nothing on
disk distinguishes them:

1. **The directory is this work.** Then the match is the desired outcome. The
   resolution rule in `references/ai-principles/feature-precondition.md` takes
   its first branch and the feature continues in place — no rename, no
   migration, no second tree. Deriving the slug from a freshly typed title is
   the likeliest way to miss this, since "Refund processing fixes" yields
   `refund-processing-fixes` rather than `refunds`, manufacturing a
   reconciliation prompt that never needed to exist.
2. **The directory is something else** — hand-written notes, an unrelated
   subject area. Then that same first branch silently adopts it as this
   feature's working tree, merging two unrelated bodies of work under one ID.

Both readings are plausible from the name alone, which is why this is a
question rather than an inference, and why it is asked every time rather than
only when something looks wrong. It previously existed as *two* rules that read
the same `docs/` listing and reached opposite conclusions — a proposal that
recommended the matching directory, and a warning that fired only "if the user
has just said the directory is *not* this feature", a thing no step ever asked.
On a project with hand-written `docs/architecture/` and the title "Architecture
refresh", the proposal won by default and used the warning's own subject matter
as the selling point. Since `config/SCHEMAS.md` § 2.8 makes this a convention
rather than a validated rule — the validators accept a registry whose `id` is
`architecture` — the mint-time question is the only defence there is, so it
cannot be reachable only by user initiative.

The third branch covers the inverse, which is the one that actually produces
the failure the mechanism exists to prevent: *declining* a matching directory
is what creates two trees for one feature. Warning coverage used to be
inverted relative to risk, the louder case being the safer one.

## When to use

- Choosing or switching the active feature before starting work in a
  feature-scoped project
- Listing registered features and their per-stage progress
- Starting genuinely new work that needs a feature ID minted
- Redirected here by another skill's halted precondition ("No active feature.
  Run `select-feature`, then re-run this skill.")
- Opting a project into feature-scoped paths for the first time — creating
  the first registry entry *is* the opt-in

## When NOT to use

- The project has no `features.toml` and no intent to create one — every
  skill already behaves correctly with no active feature; nothing to resolve
- Renaming or relocating on-disk artifacts — this skill only touches the two
  config files, never the artifact tree (a slug can drift from a later title
  edit; the directory name does not follow it — see `config/SCHEMAS.md` § 2.8)
- Recording that a feature shipped, was abandoned, or is on hold — status and
  lifecycle are explicitly out of scope; do not let a `status` field creep in
  here

## Position in workflow

Listed as `anytime` in `.agents/skills/_registry/workflow-graph.yaml`, not in
any flow's linear `sequence` — every write-side and read-side skill in the
feature-ID precondition (`create-requirements-package`, `create-design-package`,
`create-implementation-package`, `create-quality-package`, `execute-increments`,
`execute-quality-increments`, `document-quick-change`, `plan-quick-change`,
`execute-quick-change`, `manage-bugs`, `create-pr`, and the `review-*` gates)
halts and names this skill as the destination when no active feature resolves.
This skill returns the user to that caller via the ordinary `## Next skill`
forward-handoff convention, pointed backwards.

## Concurrency note

Minting has no shared counter to contend over, so concurrent minting is
mostly a non-event: two people creating different features on separate
branches choose different slugs and nothing collides. This is why the `id` is
a plain slug rather than the ordinal-prefixed form originally specified —
allocating `max + 1` manufactured a contended resource, and the contention
then had to be caught (see `config/SCHEMAS.md` § 2.8).

What remains is a genuine collision rather than an allocation artefact: two
people independently naming the *same* work with the same slug. Because
`features.toml` is committed, that surfaces as a git merge conflict in one
small file — loud and blocking — and Check N2's uniqueness rule catches it if
a merge resolves badly. Both are correct outcomes: it is one feature with two
entries, and the fix is a conversation, not a number.
