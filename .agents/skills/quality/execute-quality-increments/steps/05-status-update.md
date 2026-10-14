---
slug: status-update
sequence: 5
depends-on-prior: true
---

# Step 5 — Status Update

## Purpose

Mark the increment as completed, record the audit trail, and determine
what to do next.

## Procedure

### 5a. Update test-case-status.md

Flip the increment's status from `in-progress` to `completed` in
`{paths.quality_package}/<feature-id>/quality/plan/test-case-status.md`.
Record the completion date and any user-visible notes (e.g. accepted
reuse decisions, CI-only execution).

### 5b. Update change-tracker

Append a row to `{paths.quality_package}/<feature-id>/quality/change-tracker.md`
for every increment completed, following the canonical format from
`templates/blocks/shared/change-log.md`:

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|

- **Normal completions:** Change Type = `Addition`, Parts Affected =
  `Scaffolding Increment` or `Test-Case Increment`, Description = summary
  of artifacts created.
- **Deviations from plan** (approved by user in step 4): Change Type =
  `Correction`, Description = what deviated and why. Trigger note:
  `Execution deviation`.
- **Plan gaps discovered** during implementation: Change Type =
  `Addition` with note that the plan should be amended. This creates a
  traceable record that `review-quality-package` can pick up on a
  re-review. Trigger note: `Plan gap`.
- **Reuse decisions** that materially changed the planned artifact set
  (e.g. "did not create `WireProducer`; reused existing
  `KafkaProducerHelper`"): Change Type = `Correction`, Trigger note:
  `Reuse cross-check`.

### 5c. Determine next action

Check `test-case-status.md`:

- **More increments with status `not-started` and all dependencies
  `completed`:** Ask the user whether to continue or take a checkpoint.
  - If continue → return to `steps/01-load-increment.md`
  - If checkpoint → summarise progress and stop
- **More increments but dependencies not yet met:** Report which
  increments are blocked and why. Stop.
- **All increments `completed`:** Proceed to 5d.

### 5d. Completion summary (when all done)

When the final increment is completed, present:

> **Quality execution complete**
>
> - Scaffolding increments: {N} completed
> - Test-case increments: {N} completed
> - Total artifacts created / modified: {count + list of key files}
> - Reuse outcomes: {N reused, N extended, N wrapped, N new}
> - Open plan-gap / deviation rows in change-tracker: {N — link}
>
> All increments in the test-case plan have been implemented. You may now:
>
> - Run the full test suite per the automation-and-cicd block in the
>   quality package
> - Invoke `/audit-quality-coverage` to confirm every implementation
>   increment is covered
> - Invoke `/review-test-failures` if the suite reports failures
> - Resume `/execute-increments` for any remaining application code

## Next

Return to `steps/01-load-increment.md` for the next increment, or stop if
all increments are complete.
