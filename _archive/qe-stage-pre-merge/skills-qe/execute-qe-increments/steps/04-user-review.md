---
slug: user-review
sequence: 4
depends-on-prior: true
---

# Step 4 — User Review

## Purpose

Present the implemented artifacts to the user for explicit acknowledgement before marking the increment as complete.

## Procedure

### Present summary

Summarize what was implemented for the increment:

> **Increment:** TC-XXX — {summary}
> **Type:** {scaffolding | test-case}
>
> **Artifacts created/modified:**
> - `{path/to/file1}` — {brief description}
> - `{path/to/file2}` — {brief description}
> - ...
>
> **Verification results:**
> - {check 1}: ✅ {evidence}
> - {check 2}: ✅ {evidence}
> - ...
>
> Does this implementation look correct? Any changes needed?

### Handle feedback

- **User approves:** Proceed to step 5 (status update).
- **User requests changes:** Apply the requested changes, re-run verification (step 3), then re-present for review.
- **User identifies a gap in the plan:** If the plan itself is wrong (not just the implementation), note it. The user may choose to fix the implementation to match intent (rather than the flawed plan) and log a change tracker entry for the plan amendment.

Do not proceed to step 5 without explicit user approval.

## Next

Proceed to `steps/05-status-update.md`.
