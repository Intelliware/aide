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

## Hand-off

The skill suggested:

> "`alert-customer` is now your active feature. Run
> `create-requirements-package` when you're ready to start."
