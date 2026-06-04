# Example — qe-defect-review

## Scenario: Review 2 failures from qe-execution run

**Hand-off from qe-execution:**
- Failure 1: "User uploads CSV file" — AssertionError: Expected "Success" but was "Failed: Invalid format"
- Failure 2: "User navigates to dashboard" — TimeoutError: Element #dashboard-menu not found within 30000ms

---

### Failure 1 of 2:

**Skill presents:**

> ## Failure 1 of 2
>
> **Scenario:** User successfully uploads a valid CSV file
> **Feature:** file_transfer_upload.feature
> **Failed Step:** Then "User" should see "uploadSuccess" text on "fileTransfer" page
> **Error:** AssertionError: Expected "Success" but was "Failed: Invalid format"
> **Screenshot:** screenshots/FAILED_fileTransfer_uploadCSV.png
>
> ### Classification
> **Category:** Assertion Failure — likely application defect
> **Confidence:** High
>
> **Reasoning:** The test correctly navigated to the upload page, selected a valid CSV, and submitted. The application responded with an error message that contradicts expected behaviour. This is not a locator or timing issue — the app processed the request and returned an unexpected result.
>
> ### Proposed Remediation
> **Action:** Create JIRA ticket (application defect)
> **Details:** [BZC][File Transfer] Upload rejects valid CSV with "Invalid format" error. Backend validation may be incorrect.
>
> ---
> Do you agree? Reply APPROVED or provide alternative cause.

**User:** APPROVED

---

### Failure 2 of 2:

**Skill presents:**

> ## Failure 2 of 2
>
> **Scenario:** User navigates to dashboard
> **Feature:** healthchecks/aas.feature
> **Failed Step:** Given "User" lands on "Dashboard" Page
> **Error:** TimeoutError: Element #dashboard-menu not found within 30000ms
> **Screenshot:** screenshots/FAILED_dashboard_nav.png
>
> ### Classification
> **Category:** Element Not Found — script issue
> **Confidence:** High
>
> **Reasoning:** Cross-referencing KNOWLEDGE.md Section 21 — the locator `dashboard.menuButton.button` is defined as `#dashboard-menu` in objectRepo.properties. Checking the screenshot, the page loaded but the element ID appears to have changed to `#main-menu`. This is a locator drift issue, not an application defect.
>
> ### Proposed Remediation
> **Action:** Fix test (update locator)
> **Details:** Update `objectRepo.properties`: `dashboard.menuButton.button=#main-menu`
>
> ---
> Do you agree? Reply APPROVED or provide alternative cause.

**User:** APPROVED

---

### Final Summary:

```markdown
## Failure Analysis Summary

**Total failures reviewed:** 2
**Environment:** PAT4 | **Tag:** @BZC-5678

| # | Scenario | Category | Cause | Remediation | Status |
|---|---|---|---|---|---|
| 1 | User uploads CSV file | Assertion Failure | App rejects valid CSV | Create JIRA ticket | Approved |
| 2 | User navigates to dashboard | Element Not Found | Locator changed #dashboard-menu → #main-menu | Update objectRepo.properties | Approved |

### Action Items

**Fix in test code:**
- [ ] Update `dashboard.menuButton.button=#main-menu` in objectRepo.properties

**Create JIRA tickets:**
- [ ] [BZC][File Transfer] Upload rejects valid CSV with "Invalid format"
```

**Skill offers:**
> "There is 1 test script fix needed. Would you like to invoke qe-development to apply it?"

