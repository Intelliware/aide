# Phase Execution Guide

**Purpose**: This document provides the canonical workflow for executing any phase in the Mind Match implementation plan. Follow this guide for every phase to ensure consistency, quality, and proper verification.

**Status**: Active
**Last Updated**: February 13, 2026

---

## Overview

As a development AI assistant executing a specific phase of a larger project, your role is to:

- **Educate** - Explain the phase thoroughly
- **Plan** - Create a clear implementation strategy
- **Execute** - Build and test the implementation
- **Verify** - Ensure all criteria are met
- **Never commit** - Wait for explicit user approval before committing code
- **Support bug handling** - Follow the bug process defined in this guide (ensure log exists, ask about bugs at phase end, support bug review and Phase Bug*n* creation and execution)

---

## Pre-Execution: Phase Analysis

Before beginning execution:

### Step 0: Ensure Bugs and Issues Log exists

- Confirm that **Bugs and Issues Log** exists at `docs/<feature>/implementation-package/bugs-and-issues-log.md`.
- If it has never been created for this project, create it by following **How to create the Bugs and Issues Log** in this guide (that section defines the full file structure; do not use `bugs-and-issues-log.md` as a reference for creation).

### Phase type

- **Normal phase** (e.g. PHASE-001.1, PHASE-018): Read the full phase specification from `docs/<feature>/implementation-package/implementation-plan.md` and proceed with Phase Education below.
- **Bug-fix phase** (e.g. PHASE-BUG-001): This is a bug-fix phase. Load the phase content from the **Bug-fix phases** section of `docs/<feature>/implementation-package/implementation-plan.md` and the corresponding bug entry in `docs/<feature>/implementation-package/bugs-and-issues-log.md`. Use that as the phase specification for Phase Education, Game Plan, Checklist, Definition of Done, and Test Coverage (same structure as a normal phase; scope comes from the bug).

### 1. Phase Education

Provide a comprehensive explanation covering:

#### What

- **Purpose**: What is this phase trying to achieve?
- **Scope**: What is included and explicitly excluded?
- **Context**: How does this phase fit into the overall project?

#### How

- **Approach**: High-level technical approach
- **Architecture**: How components fit together
- **Patterns**: Design patterns or conventions being used

#### Dependencies

- **Prerequisites**: Which previous phases must be complete?
- **External dependencies**: Tools, services, or libraries required
- **Blocking dependencies**: What cannot proceed without this phase?

#### Key Deliverables

- **Code artifacts**: Files, modules, components to be created
- **Configuration**: Config files, environment setup
- **Documentation**: Comments, README updates, API docs
- **Tests**: Test files and test coverage

### 2. Game Plan

Provide a clear, step-by-step implementation plan:

#### High-Level Approach and Strategy

- **Architecture decisions**: How will components be structured?
- **Technology choices**: Why specific tools/libraries are selected
- **Integration strategy**: How this phase integrates with existing code
- **Risk mitigation**: Known challenges and how to address them

#### Order of Operations

- **Dependency order**: What must be built first?
- **Logical sequence**: Step-by-step build order
- **Parallel work**: What can be done simultaneously?
- **Critical path**: What blocks other work?

#### Key Technical Decisions and Rationale

- **Design patterns**: Why specific patterns are chosen
- **API design**: Endpoint structure, request/response formats
- **Data modeling**: Schema decisions, relationships
- **Error handling**: How errors are handled and reported
- **Security considerations**: Authentication, authorization, data protection

#### Integration Points with Existing Code

- **APIs to consume**: Which existing endpoints/services are used?
- **Shared components**: Reusable code, utilities, helpers
- **Database migrations**: How schema changes are applied
- **Configuration**: Environment variables, properties files
- **Testing infrastructure**: How tests integrate with existing test suite

### 3. Implementation Checklist

Create a detailed, actionable checklist of all tasks to complete:

#### Structure

- **Task category 1** (e.g., "Database Setup")
  - Specific task 1
  - Specific task 2
- **Task category 2** (e.g., "API Implementation")
  - Specific task 1
  - Specific task 2

#### Checklist Requirements

- **Granular**: Break down into small, testable tasks
- **Specific**: Each item should be clear and actionable
- **Complete**: Cover all aspects: code, config, tests, docs
- **Traceable**: Link to phase requirements where applicable

#### Categories to Consider

- Project structure and setup
- Dependencies and configuration
- Core implementation
- Error handling and validation
- Security and RBAC
- Testing (unit, integration, E2E)
- Documentation
- Linting and code quality
- Build verification

### 4. Definition of Done

List all success criteria that must be met:

#### Code Quality

- All code follows project conventions and style guide
- No linting errors or warnings
- Build succeeds without errors
- All tests pass

#### Functional Requirements

- All phase requirements implemented
- Edge cases handled
- Error scenarios covered
- Integration points working

#### Testing

- Unit tests written and passing
- Integration tests written and passing
- Test coverage meets requirements (specify percentage)
- E2E tests written (if applicable)

#### Documentation

- Code comments added where needed
- README updated (if applicable)
- API documentation updated (if applicable)
- Configuration documented

#### Verification

- Manual testing completed successfully
- All acceptance criteria met
- Phase-specific verification gates passed

### 5. Test Coverage Requirements

Specify detailed testing requirements:

#### Unit Tests

- **Scope**: What units/components are tested?
- **Coverage target**: Minimum coverage percentage
- **Test files**: Location and naming convention
- **Key scenarios**: Critical paths to test
- **Mocking strategy**: What is mocked and why

#### Integration Tests

- **Scope**: What integrations are tested?
- **Test environment**: How tests run (Testcontainers, in-memory DB, etc.)
- **Test files**: Location and naming convention
- **Key scenarios**: Integration paths to verify
- **Setup/teardown**: How test data is managed

#### End-to-End Tests (if applicable)

- **Scope**: What user flows are tested?
- **Test framework**: Playwright, Cypress, etc.
- **Test files**: Location and naming convention
- **Key scenarios**: Critical user journeys
- **Test data**: How test data is seeded

#### Test Execution

- **Command to run**: `npm test`, `mvn test`, etc.
- **Expected output**: What success looks like
- **Coverage reports**: How to view coverage
- **CI integration**: How tests run in CI pipeline

#### Test Requirements

- ✅ All tests must pass before requesting approval
- ✅ No skipped or disabled tests
- ✅ Tests are deterministic (no flaky tests)
- ✅ Tests are fast enough for development workflow

---

## Execution Workflow

Follow this workflow exactly for every phase:

### Step 1: Wait for Go/No-Go (or run bug review if requested)

If the user has asked to **review bugs** (e.g. "I'd like to review the bugs in the bugs-and-issues-log and decide if any should be fixed before we proceed"), follow the **Bug review and bug-fix phase workflow** in the section below instead of starting a normal phase. Otherwise, proceed as follows.

After providing the Phase Education, Game Plan, Implementation Checklist, Definition of Done, and Test Coverage Requirements:

- **Present the information** clearly and comprehensively
- **Ask explicitly**: "Ready to proceed? Please respond with 'go' or 'no-go'"
- **Wait for user response** - Do not proceed until user explicitly says "go"

**If user says "no-go":**

- Address any concerns or questions
- Revise the plan if needed
- Present updated information and wait again

### Step 2: Create Branch (if user says "go")

When user says "go":

- **Create branch** using naming convention: `feature/{phase-id-short-name}`
  - Example: `feature/phase-0-foundation`
  - Example: `feature/phase-1-1-db-core-platform`
  - Example: `feature/phase-2-security-baseline`
  - Example (bug-fix phase): `feature/phase-bug-1-practitioner-reactivate` or `feature/phase-bug-001`
- **Confirm branch creation**:

```bash
git checkout -b feature/{phase-id-short-name}
git branch  # Show current branch
```

- **Verify**: Confirm the branch name and that you're on the correct branch before proceeding

### Step 3: Execute Implementation

Implement all items from your checklist:

#### Implementation Steps

1. **Create project structure** (if needed) - Directories, files, basic scaffolding
2. **Add dependencies** (if needed) - Update pom.xml, package.json, etc.; install dependencies
3. **Write code** - Implement all features from checklist; follow project conventions; add appropriate comments
4. **Write tests** - Unit tests, integration tests, E2E tests (if applicable)
5. **Fix linting errors** - Run linters; fix all errors and warnings; ensure code style compliance
6. **Verify build succeeds** - Run build commands; fix any build errors; ensure clean build
7. **Run all tests** - Execute test suite; fix failing tests; ensure all tests pass
8. **Verify test coverage** - Check coverage reports; ensure coverage meets requirements; document coverage percentage

#### Quality Gates

- ✅ All code written and functional
- ✅ All tests written and passing
- ✅ No linting errors
- ✅ Build succeeds
- ✅ Test coverage meets requirements

### Step 4: Provide Manual Test Plan

After implementation is complete, provide a detailed manual test plan:

#### Setup Instructions

- **Prerequisites**: What must be running/configured
- **Environment setup**: How to prepare test environment
- **Database setup**: How to seed test data (if needed)
- **Start services**: Commands to start API, frontend, etc.

#### Test Scenarios

For each scenario, provide:

- **Test ID/Name**: Unique identifier
- **Description**: What is being tested
- **Prerequisites**: Setup required
- **Steps**: Detailed step-by-step instructions
- **Expected Result**: What should happen
- **Actual Result**: (Leave blank for tester to fill)
- **Pass/Fail**: (Leave blank for tester to fill)

#### Test Categories

- **Happy path**: Normal, successful operations
- **Error cases**: Invalid inputs, error conditions
- **Edge cases**: Boundary conditions, unusual scenarios
- **Integration**: Cross-component interactions
- **Security**: Authentication, authorization, RBAC
- **Performance**: Response times, load handling (if applicable)

#### Browser/Device Testing (for UI phases)

- **Browsers**: Chrome, Firefox, Safari, Edge
- **Devices**: Desktop, tablet, mobile (if applicable)
- **Screen sizes**: Responsive design verification

#### Edge Cases to Consider

- Empty/null inputs
- Invalid data formats
- Concurrent operations
- Network failures
- Timeout scenarios
- Large datasets
- Permission boundaries

### Step 4.5: Ask about bugs before requesting approval (before commit)

Before presenting the approval summary (Step 5) and before any commit, ask the user:

*"Is there any need to track any bugs or issues before moving on to the next phase?"*

- If the user says **yes**, add each bug or issue to `docs/<feature>/implementation-package/bugs-and-issues-log.md` using the log format (see that document), and set **Phase when added** to the current phase ID (e.g. PHASE-018).
- Then continue to Step 5 (Request Approval).

### Step 5: Request Approval

Present a comprehensive summary:

#### Summary of What Was Built

- **Features implemented**: List all features completed
- **Files created**: List new files with brief descriptions
- **Files modified**: List modified files with brief descriptions
- **Dependencies added**: New libraries/packages
- **Configuration changes**: Environment variables, config files

#### Test Results

- **Unit tests**: X passed, Y failed (must be all passed)
- **Integration tests**: X passed, Y failed (must be all passed)
- **E2E tests**: X passed, Y failed (if applicable, must be all passed)
- **Test coverage**: X% (must meet requirements)
- **Test execution command**: How to run tests
- **Test output**: Key test results or link to test report

#### Manual Test Plan

- Reference the manual test plan provided in Step 4
- Note any special instructions or prerequisites

#### Approval Request

- **Explicit statement**: "All implementation is complete. All tests pass. Ready for review."
- **DO NOT COMMIT**: Explicitly state "I have NOT committed any code. Waiting for your approval."
- **Wait for explicit approval**: User must say "approved" or "commit" before committing

#### What NOT to Do

- ❌ Do NOT commit code automatically
- ❌ Do NOT skip tests
- ❌ Do NOT proceed if tests fail
- ❌ Do NOT commit without explicit user approval

---

## Post-Approval: Commit and Merge

**Only after user explicitly says "approved" or "commit":**

1. **Stage changes**:

```bash
git add .
```

2. **Commit with descriptive message**:

```
git commit -m "feat: [Phase ID] [Phase Name] - [Brief description]

- [Key feature 1]
- [Key feature 2]
- [Key feature 3]

Implements: [Phase ID from implementation-plan.md]
Traceability: [FR/FS references if applicable]"
```

3. **Confirm commit**: Show commit hash and summary
4. **Ask about merge**: "Would you like me to merge this branch, or will you handle it?"

---

## Bug review and bug-fix phase workflow

When the user asks to **review bugs** and decide what to fix (e.g. "I'd like to review the bugs in the bugs-and-issues-log and decide if any should be fixed before we proceed"):

### Review cycle

1. Read `docs/<feature>/implementation-package/bugs-and-issues-log.md`.
2. For each bug entry (Bug #1, Bug #2, …), present a short summary to the user and ask: *"Do you want to fix this bug (Bug #x) before proceeding?"*
3. Cycle through all listed bugs so the user can indicate which (if any) they want to fix.

### Creating Phase Bug*n* (when user says they want to fix bug *x*)

1. Generate a full **Phase Bug*n*** (e.g. Phase Bug1 for Bug #1) with the **same structure as a normal phase** in this guide: Phase Identity (Phase ID e.g. PHASE-BUG-001, Phase Name, FR Mapping), Goal, Dependencies, Plan, Outcome, Automated Verification (AI Gate), Human Verification (Human Gate), Success Criteria, Traceability (if applicable). Derive content from the bug entry in the bugs-and-issues-log and from the requirements/solution docs it references.
2. **Do not** add the phase to `docs/<feature>/implementation-package/implementation-plan.md` yet. Output the full Phase Bug*n* content **in chat** and say: *"I'm about to add the following phase to the implementation plan for your approval. Please review and tell me if you approve or what you'd like changed."*
3. Only after the user **approves**, add the phase to the **Bug-fix phases** section of `docs/<feature>/implementation-package/implementation-plan.md` and add a line to the **Phase index** under "Bug-fix phases" (e.g. **Phase Bug1** — Bug fix: Bug #1 — [short name]).
4. Ask: "Phase Bug*n* is now in the plan. Do you want to execute Phase Bug*n* now, or proceed to the next regular phase?"

**This section is the source of truth for the bug process.** The implementation plan only stores the resulting Phase Bug*n* entries; it does not define the workflow.

---

## How to create the Bugs and Issues Log

Use this section when creating `docs/<feature>/implementation-package/bugs-and-issues-log.md` for the first time. The guide is the source of truth; do not look at an existing `bugs-and-issues-log.md` to learn the format.

**File path:** `docs/<feature>/implementation-package/bugs-and-issues-log.md`

### Document structure to create:

**Title and purpose** (first lines of the file):

```markdown
# Bugs and Issues Log

This document records bugs and issues found during testing. Items are logged for later 
remediation; **do not fix at log time**. Each entry includes a short analysis of where 
the issue likely resides and which requirements/solution documents are impacted.
```

**Conventions** (bulleted list):

- **Impact type**: *Missed/new requirement* = capability was never specified or implemented. *Badly implemented requirement* = requirement exists but implementation is incomplete or wrong.
- **Where it resides**: Backend (API/service), Frontend (web UI), or both; plus specific docs if useful.
- **Phase when added**: The phase during which the bug was identified and logged (e.g. the phase under verification or in progress when the issue was found). Use the Phase ID (e.g. PHASE-017). See `docs/<feature>/implementation-package/implementation-plan.md` for the phase index.
- **Status**: Default is **new**. Allowed values: **new**, **to do**, **priority**, **hold**, **fixed**. When status is set to **fixed**, set **Fixed date** to the current date (YYYY-MM-DD).
- **Fixed date**: Default is empty. When **Status** is set to **fixed**, set this to the current date (YYYY-MM-DD).

**Log format (per entry)** — show the template for one entry:

```markdown
### Bug #X

| # | Date found | Found by | Summary | Phase when added | Status | Fixed date |
|---|------------|----------|---------|------------------|--------|------------|
| X | YYYY-MM-DD | (name) | One-line description | Phase ID (e.g. PHASE-017) | new | |

**Analysis**
- **Where the issue likely resides**: (backend / frontend / both; components or layers)
- **Requirements/solution docs impacted**: (list with paths)
- **Impact type**: (Missed/new requirement | Badly implemented requirement)
- **Notes**: (optional clarification)
```

Record **Phase when added** as the phase during which the bug was identified and logged. New entries use **Status** default **new** and **Fixed date** empty; when a bug is resolved, set **Status** to **fixed** and **Fixed date** to the current date.

**Entries** section:

```markdown
## Entries

### Bug #1
...

*Add new entries below using the same format. Increment the bug number for each new entry.*
```

When **adding a new entry** to an existing log, use the same per-entry format. Always set **Phase when added** to the current phase ID. Set **Status** to **new** and **Fixed date** to empty for new entries. When a bug is resolved, set **Status** to **fixed** and **Fixed date** to the current date (YYYY-MM-DD).

---

## Phase Completion Checklist

Before marking a phase as complete, verify:

- [ ] All code implemented per checklist
- [ ] All tests written and passing
- [ ] Test coverage meets requirements
- [ ] No linting errors
- [ ] Build succeeds
- [ ] Manual test plan provided
- [ ] **Bug capture**: Before requesting approval (Step 4.5), asked user "Is there any need to track any bugs or issues before moving on to the next phase?" and, if yes, logged entries in `bugs-and-issues-log.md` with **Phase when added**
- [ ] User has approved
- [ ] Code committed (if user approved)
- [ ] Phase status updated in `phase-status.md` (if applicable)
- [ ] **Bug-fix phases**: If the user requested a bug review and approved a Phase Bug*n*, that phase was added to `docs/<feature>/implementation-package/implementation-plan.md` (Bug-fix phases section and Phase index)

---

## Notes

- **Always read the full phase specification** before starting
- **Follow the implementation plan** - don't skip ahead or add features not in scope
- **Maintain traceability** - link code to requirements where applicable
- **Document decisions** - comment on non-obvious choices
- **Keep commits atomic** - one logical change per commit
- **Test thoroughly** - better to catch issues early
- **Communicate clearly** - explain what you're doing and why
- **Bug handling** - Ensure the bugs log exists; ask about bugs at phase end (Step 4.5) **before requesting approval/commit**. Follow the bug review and bug-fix phase workflow in this guide when the user requests it. This guide is the source of truth for the bug process.

---

## Example Phase Execution Flow

1. AI: [Provides Phase Education, Game Plan, Checklist, DoD, Test Coverage]
2. AI: "Ready to proceed? Please respond with 'go' or 'no-go'"
3. User: "go"
4. AI: [Creates branch `feature/phase-0-foundation`]
5. AI: [Implements all checklist items]
6. AI: [Provides Manual Test Plan]
7. AI: [Step 4.5: Asks "Is there any need to track any bugs or issues before moving on?"]
8. AI: [Requests approval with summary]
9. User: "approved"
10. AI: [Commits code]
11. AI: [Confirms completion]

---

## Example: Bug review and Phase Bug1

1. User: "I'd like to review the bugs in the bugs-and-issues-log and decide if any should be fixed before we proceed."
2. AI: [Reads `bugs-and-issues-log.md`; for each bug: summary + "Do you want to fix this bug (Bug #x)?"]
3. User: "Yes, fix bug 1."
4. AI: [Generates full Phase Bug1 in chat] "I'm about to add this phase to the implementation plan for your approval. Please review and tell me if you approve or what you'd like changed."
5. User: "Approved."
6. AI: [Adds Phase Bug1 to `docs/<feature>/implementation-package/implementation-plan.md` Bug-fix phases section and Phase index]
7. AI: "Phase Bug1 is now in the plan. Do you want to execute Phase Bug1 now, or proceed to the next regular phase?"

**Executing Phase Bug1** then follows the same execution workflow as any other phase (Go/No-Go → Create branch `feature/phase-bug-1-...` → Implement → Manual Test Plan → Step 4.5 → Request Approval → Commit after approval).

---

---

## Change Tracking

> **Not Applicable — Meta Document:** This document is a process guide for executing implementation phases. It does not itself produce documentation deliverables and therefore does not have its own Parts Affected values. However, when executing phases, all changes to project documentation should be logged using the Change Tracker. See `../assets/change-tracker-template.md` for the universal Change Tracker file structure, and the relevant phase document (e.g., `create-implementation-package.md`) for the applicable Parts Affected values.

---

**This guide is the canonical reference for phase execution. Follow it consistently for every phase.**
