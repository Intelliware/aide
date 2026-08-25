# Example — select-feature

## Scenario 1 — redirected from a halted skill, reuse an existing feature

### Trigger

The user runs `create-design-package`. Its precondition finds `features.toml`
present but `[user].active_feature` unset in `project.user.toml`, and halts:

> No active feature. Run `select-feature`, then re-run this skill.

`create-design-package` forwards its own name (`create-design-package`) and
the user's original request text ("we need to design the delayed-refund
notification") as `select-feature`'s inputs.

### What the skill did

1. Read `features.toml` — two entries already registered.
2. Ranked both against the forwarded description. `alert-customer`
   ("Alert customer when a refund is delayed") scored as a clear match.
3. Presented the list with the match surfaced first:

   ```
   Registered features:
   → alert-customer — "Alert customer when a refund is delayed"
       (ticket ACME-1247; requirements ✓, design —, planning —, execution —)
       ← looks like a match for what you described
     refund-fee-waiver — "Waive processing fee on approved refunds"
       (no ticket; requirements ✓, design —, planning —, execution —)
     [ create a new feature ]
   ```

4. User confirmed `alert-customer`.
5. Set `[user].active_feature = "alert-customer"` in
   `project.user.toml`, creating the `[user]` block (it did not exist yet).
6. Echoed the resolved path:

   > Working feature: `alert-customer`.
   > Design artifacts will be written under
   > `.framework-output/design/alert-customer/`.

7. Closed with `## Next skill\ncreate-design-package` — the user is carried
   straight back into the skill that halted, precondition now satisfied.

## Scenario 2 — first opt-in, mint the first feature

### Trigger

> "Let's start tracking features properly. Register what I'm about to build:
> customers should get an email when a refund is delayed more than 2 days."

No `features.toml` exists yet.

### What the skill did

1. Found no `features.toml`. Confirmed with the user before creating one —
   "This project has no feature registry yet. Create `features.toml` and
   register this as the first feature?" User confirmed.
2. Empty registry → skipped straight to create (step 2 of the workflow).
3. Checked `docs/` for a pre-opt-in directory this feature might already own —
   none present, so the id is free to come from the title.
4. Proposed title from the description: "Alert customer when a refund is
   delayed". User accepted.
5. Proposed slug `alert-customer`, confirmed it is not already registered. User
   accepted.
6. Asked for optional `ticket` / `repos` — user supplied `ACME-1247` and
   `["api-billing"]`.
7. Appended to `features.toml`:

   ```toml
   [[features]]
   id      = "alert-customer"
   title   = "Alert customer when a refund is delayed"
   created = 2026-08-14
   ticket  = "ACME-1247"
   repos   = ["api-billing"]
   ```

8. Set `[user].active_feature = "alert-customer"`.
9. Echoed resolved paths for every stage this project uses (requirements,
   design, implementation, quality — this project has no SoD, so all four
   resolve under `.framework-output/<stage>/alert-customer/`).
10. No caller to return to — invoked directly, so the skill stopped here.

## Scenario 3 — redirected from a Mode B skill, create suppressed

### Trigger

`review-requirements-package` halted with "No active feature. Run `select-feature`,
then re-run this skill." and invoked this skill with
`caller: review-requirements-package`, `caller_mode: select-only`,
`description: "review the requirements package"`. The registry holds two features,
`alert-customer` and `refund-fee-waiver`; `[user].active_feature` was unset.

### What the skill did

1. Read `features.toml` — present, two entries.
2. Registry non-empty and a description was supplied, so it ranked both against
   "review the requirements package". Neither matched, because the description
   names an *action*, not a feature. Under `select-and-create` that would have
   skipped straight to create; under `select-only` it fell through to step 3 and
   presented the full list instead.
3. Listed both features with their on-disk stage coverage, marking neither as
   active. **No "create a new feature" option was shown** — not greyed out, not
   footnoted, simply absent.
4. The user asked whether they could start a new feature instead. The skill
   declined and named the way in:

   > `review-requirements-package` works on a feature that already has artifacts,
   > so it can't mint a new one. Pick an existing feature, or run the stage's
   > `create-*` skill to start a new one and come back.

5. The user chose `alert-customer`. Set `[user].active_feature = "alert-customer"`
   in `project.user.toml`. **`features.toml` was not touched** — select mode never
   writes to the registry.
6. Echoed the resolved artifact path before the caller's first read.
7. Closed with `## Next skill\nreview-requirements-package`, returning the user to
   the skill that halted.

The point of the scenario: a Mode B caller's description almost never resembles a
feature title, so the no-match branch is the *common* path for a review, not an edge
case. If it routed to create, minting-at-review would be the default behaviour rather
than a rare accident.

## Scenario 4 — the proposed id matches a `docs/` directory that is *not* this feature

### Trigger

> "New feature: architecture refresh for the billing service."

`features.toml` exists with two unrelated features. The project also has a
hand-written `docs/architecture/` — long-standing design notes, owned by no
registered feature.

### What the skill did

1. Read `features.toml` — present, no plausible match for "architecture
   refresh", so it went to create.
2. Checked `docs/` first. Found `architecture/` matching no registered feature.
   The title would independently have yielded `architecture` anyway, so the
   proposed id collided either way — which is the point: the question below is
   keyed on the *match*, not on how the slug was derived.
3. Asked, before accepting the id:

   > `architecture` matches `docs/architecture/`, which no registered feature
   > owns. Is that directory this feature's work, or something else?

4. The user answered that it is long-standing design notes, not this work. The
   skill refused the name and said why:

   > Then `architecture` can't be the id: this feature would adopt
   > `docs/architecture/` as its working tree and merge the two. Pick a name
   > that isn't already a directory.

5. The user supplied `billing-architecture-refresh`. Confirmed unregistered and
   matching no `docs/` directory, so no further question was needed.
6. Appended the entry, set it active, echoed the resolved paths.

The point of the scenario: had the skill inferred the answer instead of asking,
the id `architecture` would have been accepted — the title made it the obvious
slug and the matching directory made it look *confirmed* rather than dangerous.
Nothing downstream would have objected: both validators accept a registry whose
`id` is `architecture` (`config/SCHEMAS.md` § 2.8 makes this a convention, not a
validated rule), and the resolution rule would have adopted the notes directory
silently. This question is the only defence, which is why it has no safe
default and is not conditional on the user having volunteered anything.

Answering "this feature's work" is the ordinary case and takes the other branch:
the id is used as-is and the work continues in place, with nothing to move.

## Hand-off

The skill suggested:

> "`alert-customer` is now your active feature. Run
> `create-requirements-package` when you're ready to start."
