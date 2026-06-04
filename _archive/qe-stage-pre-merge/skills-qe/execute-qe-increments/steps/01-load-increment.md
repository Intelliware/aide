---
slug: load-increment
sequence: 1
depends-on-prior: false
---

# Step 1 — Load Increment

## Purpose

Load the next increment from the QE plan, verify its dependencies are satisfied, and confirm prerequisites before implementation begins.

## Procedure

### 1a. Determine next increment

Read `test-case-status.md` and find the next increment with status `not-started` whose dependencies are all `completed`. Scaffolding increments take priority over test case increments.

If no increment is available (all remaining have unmet dependencies), report the blocker and halt.

If no increments remain with status `not-started`, the QE plan is fully executed — report completion and stop.

### 1b. Load the increment file

Read the increment's `TC-XXX.md` file. For scaffolding increments, this is at the plan root. For test case increments, this is in the category sub-folder (if categorized) or plan root (if flat).

### 1c. Verify dependencies

Check `test-case-status.md` to confirm every ID listed in the increment's Dependencies section has status `completed`. If any dependency is not completed, halt and report which dependencies are blocking.

### 1d. Confirm prerequisites

Present the increment to the user:

> **Next increment:** TC-XXX — {summary}
> **Type:** {scaffolding | test-case}
> **Dependencies:** {list — all completed ✅}
> **Prerequisites:** {infrastructure, services, etc.}
>
> Ready to implement this increment?

Wait for explicit confirmation before proceeding.

### 1e. Update status

Flip the increment's status to `in-progress` in `test-case-status.md`.

## Next

Proceed to `steps/02-implement-artifacts.md`.
