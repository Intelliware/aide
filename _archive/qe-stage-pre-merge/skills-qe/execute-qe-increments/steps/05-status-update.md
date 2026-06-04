---
slug: status-update
sequence: 5
depends-on-prior: true
---

# Step 5 — Status Update

## Purpose

Mark the increment as completed and determine what to do next.

## Procedure

### 5a. Update test-case-status.md

Flip the increment's status from `in-progress` to `completed` in `test-case-status.md`. Record the completion date and any notes.

### 5b. Update change tracker

Append a row to `{paths.qe_package}/change-tracker.md` for every increment completed, following the canonical format from `templates/blocks/shared/change-log.md`:

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|

- **For normal completions:** Change Type = `Addition`, Parts Affected = `Scaffolding Increment` or `Test Case Increment`, Description = summary of artifacts created.
- **For deviations from plan** (approved by user in step 4): Change Type = `Correction`, Description = what deviated and why. Trigger note: `Execution deviation`.
- **For plan gaps discovered** during implementation: Change Type = `Addition` with a note that the plan should be amended. This creates a traceable record that `review-qe-package` can pick up if the package is re-reviewed.

### 5c. Determine next action

Check `test-case-status.md`:

- **More increments with status `not-started` and all dependencies `completed`:** Ask the user if they want to continue to the next increment or take a checkpoint.
  - If continue → return to `steps/01-load-increment.md`
  - If checkpoint → summarize progress and stop
- **More increments but dependencies not yet met:** Report which increments are blocked and why. Stop.
- **All increments `completed`:** Report QE execution is complete.

### 5d. Completion summary (when all done)

When the final increment is completed, present:

> **QE Execution Complete**
>
> - Scaffolding increments: {N} completed
> - Test case increments: {N} completed
> - Total artifacts created: {list of key files}
>
> All increments in the QE plan have been implemented. You may now run the full QE test suite per the execution strategy at `{paths.qe_package}/execution-strategy.md`.

## Next

Return to `steps/01-load-increment.md` for the next increment, or stop if all increments are complete.

