# Example — qe-development

## Scenario: Build test for File Transfer upload from JIRA ticket BZC-5678

**User says:** "Build a test for BZC-5678 — user uploads a CSV file via File Transfer"

### Phase 0 — Seed Knowledge
- Checks `docs/KNOWLEDGE.md` — exists, scan fresh → skip rescan
- Creates `features/BZC-5678/`

### Phase 1 — Understand Requirements
Skill parses the JIRA ticket and writes `test-cases.md`:
- Environment: PAT4
- User Role: SA_USER
- Entry Point: `"SA_USER" navigates to UAP page and logs in...`
- Journey: Login → navigate to File Transfer → click Upload → select CSV → submit → verify success

User approves.

### Phase 2 — Generate BDD Scenarios
Skill writes `scenarios.md` with a `.feature` draft:
```gherkin
@file_transfer @BZC-5678
Feature: File Transfer CSV Upload

  Background:
    Given "SA_USER" navigates to UAP page and logs in with credentials...
    And "SA_USER" lands on the BZC Landing Page

  Scenario: User successfully uploads a valid CSV file
    Given "User" lands on "fileTransfer" Page
    When "User" clicks on "uploadButton" button on "fileTransfer" page  # NEW STEP
    And "User" uploads file "testdata/valid.csv" on "fileTransfer" page  # NEW STEP
    Then "User" should see "uploadSuccess" text on "fileTransfer" page
```

User approves.

### Phase 3 — Reuse & Gap Analysis
Skill writes `reuse-analysis.md`:
- Reuse score: 60% — 3 existing steps reused, 2 new items needed
- New: upload button click step (use CommonSteps pattern), file upload step (use GenericActions.uploadFile)
- Locators needed: `fileTransfer.uploadButton.button`, `fileTransfer.fileInput.input`

User approves.

### Phase 4 — Code Output
Skill writes `code-output.md` with:
- 2 new locator entries for objectRepo.properties
- 1 new step definition (uploadFile) using GenericActions.uploadFile()
- 1 new feature file

User approves.

### Phase 5 — Sign-off & Apply
Skill applies changes to BB-DCC-QE, writes `sign-off.md` with rollback plan.

### Phase 6 — Refresh Knowledge
Skill invokes qe-code-scanner, KNOWLEDGE.md updated.

**Skill offers:**
> "Tests ready. Tag: `@BZC-5678`. Default environment: PAT4. Invoke qe-execution to run."

