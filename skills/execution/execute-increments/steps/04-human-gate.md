---
slug: 04-human-gate
sequence: 4
depends-on-prior: true
---

# Step 4 — Human Gate (Human Verification)

## Purpose

Surface the increment's Human Verification items and wait for sign-off. The
Human Gate verifies **intent** — is this the right thing? — which requires
human judgment.

## Iron rules

1. **Wait for explicit sign-off.** Do not proceed without the user
   confirming each Human Gate item (or explicitly waiving / deferring).
2. **Surface all items at once.** Present the full Human Gate list and
   request confirmation as a single review unit, so the user can think
   about them together.
3. **Capture deferrals as bugs.** If the user wants to defer a Human Gate
   item, invoke `manage-bugs` to log it; do not silently mark the gate
   passed.
4. **Failure halts the increment** until the user resolves the failed
   items.

## Procedure

1. **Read the increment's `Human Verification (Human Gate)` section.**
2. **Surface every item** to the user exactly as written in the increment
   file. Number them.
3. **Request confirmation** with explicit options per item:
   - Confirmed (item passes)
   - Failed (with description) — increment halts, user resolves
   - Defer (with reason) — log as a bug via `manage-bugs`, user accepts
     documented risk
4. **Wait for user response.** Do not infer answers. Do not proceed.
5. **Aggregate:**
   - All confirmed (or deferred-with-acceptance) → Human Gate PASS
   - Any unresolved failure → Human Gate HALT (return to step 2 if a code
     fix is needed; or pause increment if it is an environment issue)
6. **Record the verdict** in chat with the user's exact responses.

## What goes in a Human Gate

Examples of legitimate Human Gate items:

- "Real login can call /api/me end-to-end"
- "Tenant configuration is correct in the Entra portal"
- "UI matches the design mockups for the create flow"
- "Stakeholder confirms the calculation rounding rule is correct"
- "Security review confirms the new endpoint's authorization rules"

What does NOT belong in a Human Gate (these belong in the AI Gate):

- "Tests pass"
- "Build succeeds"
- "Endpoint returns 200"

If you find AI-Gate-shaped items in a Human Gate, surface as a finding and
recommend re-running `review-implementation-package`.

## Output of this step

- Human Gate PASS / HALT determination
- User responses captured in chat
- Any deferred items logged as bugs via `manage-bugs`
