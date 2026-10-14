---
slug: confirmation-gate
sequence: 4
depends-on-prior: true
---

# Step 4 — Completion Confirmation Gate

After all code is written, the three-dimension verification is green, the
adversarial review is clean, and the PR is open, the change is **not yet
done**. The skill does not declare completion on its own. It hands the
verdict to the user, who is the only one who can confirm the change works
in the environment that matters — the browser, the device, the staging
deploy, the legacy mainframe job, the user's machine.

The "code written = done" assumption is the failure mode this gate exists
to prevent. Verification commands in CI / Node / a unit-test sandbox can
all be green while the actual experience the user cares about is still
broken (timezone mismatch in the browser, missing `aria-busy`, a
network-tab regression, a UX flicker, a copy paste from prod data that
breaks the parser). The gate forces the AI to stop and surface the
implementation for environment-level confirmation before closing the loop.

## What the gate does

1. **Present the implementation.** State plainly what was changed, where,
   and what the user should look at. Reference the PR, the diff, and the
   spec/plan files. Surface anything that requires human-eye verification
   (visual look, tone of voice, accessibility focus order, reflowed
   layout, real-data corner cases).
2. **Surface verification evidence.** Re-state — with paths and brief
   excerpts — what *did* pass: the test command output, the lint output,
   the AI Gate, the adversarial review summary. The user sees what the
   automated layer guarantees, so they know what is left for them to
   verify.
3. **Ask explicitly for confirmation.** Use words close to:

   > "Implementation is ready for your review. Please confirm the fix
   > works as expected in your environment before this is considered done.
   > If something is off, tell me what you saw and I'll diagnose the root
   > cause."

   Do not say "the change is complete", "task done", "ready to merge", or
   any phrase that implies closure. The skill cannot self-close.
4. **Wait.** No KB hand-off, no celebratory summary, no `track-change`
   close-out, no offering to start the next increment. The skill halts
   here until the user replies.

## How to interpret the user's response

| User signal | Action |
|---|---|
| Explicit confirmation: "looks good", "confirmed", "verified", "ship it", "merge it" | Mark the increment complete, proceed to KB hand-off (step 7 of the workflow). |
| Specific issue report: "X is still broken", "still seeing GMT+5:30 in the browser", "the toast doesn't appear" | Treat as a failed verification. Do **not** patch — go to step 02-verify.md "Failed verification — Solution Pivot Gate" and run the protocol from there. |
| Vague concern: "I'm not sure", "something feels off" | Ask the user for a specific reproduction step or observable they saw, then route to one of the rows above based on their answer. Do not assume the change is done. |
| Silence / "I'll check later" | Acknowledge, but do **not** mark the change complete. The skill stays in this gate until explicit confirmation arrives. The PR can sit open; the implementation is just not "done" yet. |
| Approval of a partial slice ("AC1 looks good, I haven't checked AC2 yet") | Record an audit row that names which ACs are confirmed and which remain pending; keep the gate open until **every** AC has been confirmed. Do not extrapolate one confirmation to cover the whole change, and do not proceed to KB hand-off while any AC is still pending. |

## What "complete" means after this gate

After explicit user confirmation, the skill may:

- mark the increment / change as complete in `CHANGE-TRACKER.md` and any
  sprint status,
- proceed to `update-knowledge-base --scope=catalog-only` (the KB
  hand-off),
- offer the next increment, the next quick change, or close out the
  feature folder,
- write a closing summary that uses words like "complete", "done",
  "shipped".

Until the gate has cleared, none of those happen.

## Common mistakes

- "Tests pass and the PR is open, so I'll go ahead and update the KB." —
  No. The KB hand-off is **after** the gate, not before.
- Combining the gate with the commit-approval ask: those are two
  different gates. Commit approval comes after the diff is green;
  confirmation comes after the implementation is in the user's
  environment. Asking once and treating "go ahead and commit" as also
  meaning "I confirm it works in my environment" collapses two checks
  into one.
- Restating the gate ask three different ways in one message — the
  request is one short paragraph, not a lecture. The user knows what
  they need to do; surface the evidence and ask once.
- Burying the ask. The confirmation request is the headline of the
  message that closes the implementation turn — not a sentence the user
  has to scroll past three sections to find.

## Audit trail

Append a one-line entry to the increment's row in
`{paths.requirements_package}/<feature-id>/CHANGE-TRACKER.md` capturing the
confirmation: who confirmed, when, in what environment, and (when the
confirmation is partial) which ACs are confirmed vs still pending. The
gate is only closed once an entry exists for every AC. If the gate had
to be re-opened (the user reported a problem, a Solution Pivot fired,
re-implementation, gate re-opened, then confirmed) record that loop too —
the audit shows the change was confirmed by a human, not by the AI alone.
