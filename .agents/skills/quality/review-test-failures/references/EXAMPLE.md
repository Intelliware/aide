# Example — review-test-failures

> Illustrative only. Feature names, framework conventions, locator
> formats, and remediation paths are placeholders. The skill is
> framework-agnostic; substitute the test stack and reporting paths
> pinned in your team's quality package.

## Scenario — Triage 2 failures handed off by `execute-quality-increments`

**Hand-off:**

- Failure 1: scenario "User uploads CSV file" — assertion error
  `Expected "Success" but was "Failed: Invalid format"`
- Failure 2: scenario "User navigates to dashboard" — timeout on
  locator `dashboard-menu`

The team's quality package pins:
- Evidence locations in `automation-and-cicd.md` →
  - Reports: `<repo>/<reports-dir>/`
  - Logs: `<repo>/<logs-dir>/latest-run.<ext>`
  - Screenshots: `<repo>/<screenshots-dir>/FAILED_*.<ext>`
- Test framework + runner: `<framework>` / `<runner>`

---

### Step 1 — Gather failure data

The skill reads the report directory, log file, and any failure
screenshots at the paths above. Produces an internal failure list
with 2 entries, each tagged with the available evidence.

### Step 2/3 — Walk failures, classify, propose remediation

**Failure 1 of 2 — skill presents:**

> ## Failure 1 of 2
>
> **Scenario:** User successfully uploads a valid CSV file
> **Spec / feature:** `file_transfer_upload.<ext>`
> **Failed step:** assertion that page shows "Success"
> **Error:** `AssertionError: Expected "Success" but was "Failed: Invalid format"`
> **Evidence:**
> - Report row: `<reports-dir>/upload-flow.json#scenario-3`
> - Log lines: `<logs-dir>/latest-run.log:412-430`
> - Screenshot: `<screenshots-dir>/FAILED_upload_csv.png`
>
> ### Classification
> **Category:** Assertion failure — likely application defect
> **Confidence:** High
>
> **Reasoning:** The test reached the assertion step successfully
> (navigation worked, file was selected, form was submitted). The
> application returned an error message that contradicts the
> documented behaviour from the design package's API contract. KB
> lookup on the relevant component shows no recent locator changes
> and no known issue matching this signature.
>
> ### Proposed remediation
> **Action:** Application defect — route to `manage-bugs`
> **Details:** Backend rejects a CSV that meets the documented format.
> Likely the validator regex changed; trace via the application's
> recent commits.
>
> ---
> Do you agree with this classification? Reply APPROVED, or provide
> an alternative cause.

**User:** APPROVED

---

**Failure 2 of 2 — skill presents:**

> ## Failure 2 of 2
>
> **Scenario:** User navigates to dashboard
> **Spec / feature:** `dashboard_smoke.<ext>`
> **Failed step:** locator lookup for the dashboard menu
> **Error:** `Timeout: locator "dashboard-menu" not found within 30000ms`
> **Evidence:**
> - Log lines: `<logs-dir>/latest-run.log:88-102`
> - Screenshot: `<screenshots-dir>/FAILED_dashboard_nav.png`
>
> ### Classification
> **Category:** Element-not-found — script issue (locator drift)
> **Confidence:** High
>
> **Reasoning:** Cross-referenced the KB's dashboard component. The
> documented locator for the menu was renamed in the last design
> increment from `dashboard-menu` to `main-menu`. The screenshot
> confirms the page rendered; only the locator is wrong.
>
> ### Proposed remediation
> **Action:** Script fix — update the locator definition in the
> shared selector / page-object source pinned in the quality
> package's automation-and-cicd block. Route to
> `execute-quality-increments` (if the team uses the TC-XXX flow,
> with a small follow-up TC) or `execute-increments` (inline-tests
> mode).
> **Details:** Replace `dashboard-menu` with `main-menu` in the
> shared selector source; re-run the dashboard smoke scenario to
> verify.
>
> ---
> Do you agree? Reply APPROVED or provide alternative cause.

**User:** APPROVED

### Step 4 — Final summary

> ## Failure Triage Summary
>
> **Total failures triaged:** 2
> **Date:** 2026-05-31
> **Run reference:** CI pipeline run #4521 (smoke suite, profile `pat4`)
>
> | # | Scenario | Category | Cause | Remediation | Status |
> |---|---|---|---|---|---|
> | 1 | User uploads CSV file | Assertion failure (app defect) | Validator rejects valid CSV | `/manage-bugs` to log + triage | Approved |
> | 2 | User navigates to dashboard | Element-not-found (script issue) | Locator renamed `dashboard-menu` → `main-menu` | Update shared selector + re-run | Approved |
>
> ### Action items (routed)
>
> **Script fixes:**
> - [ ] Update shared selector `dashboard-menu` → `main-menu` —
>   invoke `/execute-quality-increments` (or `/execute-increments`
>   if inline-tests mode), then re-run the dashboard smoke scenario.
>
> **Application defects:**
> - [ ] CSV upload validator rejects valid input — invoke
>   `/manage-bugs` to log the defect with the evidence collected
>   above.
>
> **Environment / data:**
> - (none)
>
> Triage session recorded in:
> `{paths.quality_package}/<feature-id>/quality/change-tracker.md`
> (Trigger: `Failure triage`).
>
> Would you like me to invoke `/manage-bugs` for the application
> defect now?


