---
slug: 06-status-update
sequence: 6
depends-on-prior: true
---

# Step 6 — Status Update + KB Handoff

## Purpose

Close the increment by updating `increment-status.md` and handing off to
`update-knowledge-base` so the KB stays current. This is the per-increment
closing step.

## Procedure

1. **Update `increment-status.md`.** Flip the increment's row from
   `in-progress` to `completed`. Record the completion date. If the
   tracker has fields for verification evidence (test counts, coverage
   delta), populate them.
2. **Append to `change-tracker.md`.** Record:
   - Increment ID and name
   - Completion date
   - FRs implemented
   - Components touched
   - Verification evidence summary (from AI Gate)
3. **Identify affected knowledge-base components.** From the codebase paths
   modified, look up which components in
   `{project.paths.knowledge_base_path}/components/` are affected. Build
   the affected-components list.
4. **Hand off to `update-knowledge-base`.** Pass:
   - The increment ID
   - The list of affected components
   - The full SHA of the closing commit if available; otherwise the
     working-tree state reference
5. **Announce closure** in chat:
   - Increment ID and name
   - Completion date
   - Bug entries logged during execution (count + IDs)
   - Components handed off to update-knowledge-base
   - Next increment to consider, or "package complete"

## Output of this step

- Updated `increment-status.md` row (`completed`)
- New entry in `change-tracker.md`
- `update-knowledge-base` invoked with affected components
- Clear announcement to user with next-step recommendation

## After this step

- If more increments remain in the package, return to Step 1 for the next
  increment (or stop at user's checkpoint).
- If all increments in scope are complete, recommend `create-pr` to package
  the diff into commits and a PR.
- If the user wants to triage / close bugs that surfaced during execution,
  recommend `manage-bugs`.
