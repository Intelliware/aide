---
slug: user-review
sequence: 4
depends-on-prior: true
---

# Step 4 — User Review

## Purpose

Present the implemented artifacts to the user for explicit acknowledgement
before marking the increment as complete.

## Procedure

### 4a. Present summary

Summarise what was implemented for the increment:

> **Increment:** TC-XXX — {summary}
> **Type:** {scaffolding | test-case}
> **Category:** {category | N/A}
>
> **Reuse decisions (from step 2a):**
> - {component}: {reuse | extend | wrap | new — rationale}
>
> **Artifacts created / modified:**
> - `{path/to/file1}` — {brief description}
> - `{path/to/file2}` — {brief description}
> - ...
>
> **Verification results (fresh evidence, this turn):**
> - {check 1}: ✅ {evidence excerpt}
> - {check 2}: ✅ {evidence excerpt}
> - ...
>
> **Deviations from plan:** {none | list — to be logged in change-tracker}
>
> Does this implementation look correct? Any changes needed?

### 4b. Handle feedback

- **User approves:** Proceed to step 5 (status update).
- **User requests changes:** Apply the requested changes, re-run
  verification (step 3) with fresh evidence, then re-present for review.
- **User identifies a gap in the plan:** If the plan itself is wrong
  (not just the implementation), note it. The user may choose to fix
  the implementation to match intent — rather than the flawed plan —
  and log a change-tracker entry for the plan amendment so
  `review-quality-package` can pick it up if the package is re-reviewed.
- **User requests a checkpoint:** Stop after step 5 closes the current
  increment; do not auto-advance.

Do not proceed to step 5 without explicit user approval.

## Next

Proceed to `steps/05-status-update.md`.
