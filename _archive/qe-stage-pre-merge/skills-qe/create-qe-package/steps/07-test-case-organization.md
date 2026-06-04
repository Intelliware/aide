---
slug: test-case-organization
sequence: 7
depends-on-prior: true
---

# Step 7 — Test Case Organization

## Purpose

Determine how test cases are organized in the QE implementation plan — either in a single flat location or grouped into category sub-folders.

## Procedure

Ask the user:

> How would you like to organize the test cases in the QE implementation plan?
>
> **Option A — Single location:** All test case increment files go into `{paths.qe_package}/plan/` with no sub-folders.
>
> **Option B — Category sub-folders:** Test case increment files are grouped into sub-folders by category. Each category gets its own folder under `{paths.qe_package}/plan/<category>/`.

If the user chooses **Option B**, ask:

> Please enter the categories as a comma-separated list.

Suggest defaults based on the test types selected in Step 1 (e.g., if they selected E2E and Integration, suggest `e2e, integration`). The user may use any categorization they prefer — by test type, by feature area, by service, or any other scheme.

Record the organization choice and (if applicable) the category list.

## Acknowledgement checkpoint

Summarize:
- Organization: flat or categorized
- Categories (if applicable)

Ask: "Does this organization work for you?" Wait for confirmation.

## Next

Proceed to `steps/08-execution-strategy.md`.
