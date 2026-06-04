---
slug: generate-plan
sequence: 9
depends-on-prior: true
---

# Step 9 — Generate QE Implementation Plan

## Purpose

Generate the QE implementation plan — a sequenced set of increment files organized by the chosen structure (flat or categorized), plus an overview and status tracker.

There are **two kinds of increments** in a QE plan:

1. **Scaffolding / infrastructure increments** — preparatory work that makes the service (or a separate test project) ready for QE test execution. Examples: adding Cucumber/test-framework dependencies to `pom.xml` or `build.gradle`, creating runner classes, adding test configuration profiles (`application-qe.yml`), wiring up report plugins, creating shared test utilities (Kafka test producer/consumer helpers, Awaitility wrappers, test data builders). These are numbered with the project's TC prefix but use a `SCAFFOLD` or `INFRA` label in their summary. They always come first in the dependency chain.

2. **Test case increments** — each one is a **detailed implementation plan** for producing the actual test artifacts and placing them in their target locations within the codebase. An increment specifies exactly which files to create (e.g., a `.feature` file at `src/test/resources/features/qe/wire-happy-path.feature`, a step definition class at `src/test/java/com/wires/qe/steps/WireHappyPathSteps.java`, a CSV row for Jira export), what each file should contain, where it goes, and how to verify it works. The increment is the plan; `execute-qe-increments` turns it into real artifacts.

Every test case increment depends on the scaffolding increments being complete first.

## Procedure

### 9a. Derive scaffolding increments

Based on the tech stack (Step 6), embedding strategy (Step 6), and artifact expectations (Step 4), identify all preparatory work required before any test case can be implemented. Group related prep work into logical increments. Examples:

- Add Cucumber + JUnit Platform dependencies to `pom.xml`
- Create Cucumber runner class and `cucumber.properties`
- Create `application-qe.yml` test profile
- Create shared test utilities (Kafka test producer, test consumer, Awaitility helpers)
- Create test data builders / fixtures

Present the scaffolding increment list to the user for review. Wait for acknowledgement.

### 9b. Derive test case inventory

Using all context gathered in Steps 1–8, plus the full content of the requirements, design, and implementation packages, derive the complete inventory of test cases. For each test case, determine:

| Field | Description |
|---|---|
| TC ID | Unique identifier (e.g., `TC-WIRE-001`, `TC-{PROJECT-CODE}-NNN`) |
| Summary | Short description of what the test verifies |
| Category | Which category sub-folder (if categorized) |
| Test Type | E2E, Integration, etc. |
| Tags | Labels for filtering (e.g., `@smoke`, `@regression`, `@happy-path`) |
| Priority | P1, P2, P3 |
| FR/NFR Traceability | Which requirements this test traces to |
| Dependencies | Scaffolding increment IDs + other TC-XXX IDs that must be implemented first (if any) |

Present the full test case inventory table to the user for review. Wait for acknowledgement before generating files.

### 9c. Ask generation mode

> Would you like to proceed with generating the QE implementation plan?

If **yes**, ask:

> How would you like to generate the plan files?
>
> **Option A — All at once:** Generate all increment files (scaffolding + test cases) in one pass.
> **Option B — One at a time:** Generate each file individually with a hard stop for review between each.

If **no**, generate all files (including category sub-folders).

### 9d. Generate increment files

**Scaffolding increments first.** For each scaffolding increment, generate a file containing:

1. **Increment Identity** — ID, summary, type (`scaffolding`)
2. **Goal** — what this preparatory work achieves
3. **Dependencies** — other scaffolding increments (if sequenced)
4. **Implementation Plan** — imperative instructions for exactly what to create/modify (files, dependencies, configuration), with target file paths within the codebase
5. **Verification** — how to confirm the scaffolding is correct (e.g., "build compiles", "runner class is on classpath", "empty test suite executes")

**Then test case increments.** For each test case, generate a file containing:

1. **Test Case Identity** — ID, summary, category, type, tags, priority
2. **Traceability** — FR/NFR mapping, design section references, implementation increment references
3. **Prerequisites** — scaffolding increments that must be complete, plus infrastructure/services/test data needed
4. **Test Scenario** — detailed description of what is being tested
5. **Test Steps** — ordered steps (Given/When/Then or equivalent for the chosen framework)
6. **Expected Results** — what success looks like
7. **Artifact Plan** — the exact files to generate, their full target paths in the codebase, and a description of what each file should contain. This is the implementation blueprint that `execute-qe-increments` will follow.
8. **Verification** — how to confirm the test case implementation is correct (e.g., "feature file parses", "step definitions compile", "test executes against running infrastructure and passes")

Place files at:
- **Flat:** `{paths.qe_package}/plan/TC-XXX.md`
- **Categorized:** `{paths.qe_package}/plan/<category>/TC-XXX.md`

Scaffolding increments always go in the plan root: `{paths.qe_package}/plan/TC-XXX.md` (not in a category sub-folder).

If Option B was chosen, present each file and wait for acknowledgement before generating the next.

### 9e. Generate support documents

After all increment files are written, generate:

- **`{paths.qe_package}/plan/qe-plan-overview.md`** — overview listing all increments (scaffolding + test cases), their categories, dependencies, and a dependency graph showing scaffolding → test case ordering
- **`{paths.qe_package}/plan/test-case-status.md`** — status tracker table with columns: TC ID, Name, Type (scaffolding/test-case), Category, Status (not-started), Started, Completed, Notes
- **`{paths.qe_package}/qe-package.md`** — top-level QE package overview synthesizing all gathered information (scope, topology, technologies, artifacts, harness design, embedding, execution strategy, test case summary)
- **`{paths.qe_package}/change-tracker.md`** — initialized change log using the canonical format from `templates/blocks/shared/change-log.md`. Initialize with:

  **Header:**
  | Field | Value |
  |---|---|
  | Artifact | QE Package |
  | Artifact type | qe-package |
  | Current source version | (from requirements package version) |
  | Current artifact version | 0.1-qe.1 |
  | Stage / Skill of record | create-qe-package |

  **Parts Affected vocabulary for QE packages:**
  | Value | Meaning |
  |---|---|
  | QE Package Overview | Top-level `qe-package.md` |
  | Execution Strategy | `execution-strategy.md` |
  | Scaffolding Increment | A `TC-XXX.md` scaffolding increment |
  | Test Case Increment | A `TC-XXX.md` test case increment |
  | Plan Overview | `qe-plan-overview.md` |
  | Status Tracker | `test-case-status.md` |

  **Initial rows:** One `Initial Extraction` row per document generated (qe-package.md, execution-strategy.md, qe-plan-overview.md, test-case-status.md, each TC-XXX.md).

### 9f. Artifact completeness cross-check

Before generating traceability, cross-reference the **artifact list confirmed in Step 4** against the generated scaffolding and test case increments. Every artifact type the user confirmed (feature files, step definitions, CSVs, report configurations, test data fixtures, contract schemas, etc.) must appear as a deliverable in at least one increment's Artifact Plan section.

If an artifact type declared in Step 4 has **no increment producing it**, add a scaffolding increment for it (e.g., "Generate CSV test case export for Jira upload" or "Configure report output plugin"). Present any additions to the user for acknowledgement.

This ensures nothing the user explicitly asked for gets silently dropped between elicitation and plan generation.

### 9g. Traceability summary

Before completion, generate a **traceability matrix** section inside `qe-package.md` that maps:

| FR/NFR ID | Requirement Summary | TC ID(s) | Test Type | Coverage |
|---|---|---|---|---|
| (from requirements package) | (short description) | (TC-XXX list) | (E2E/Integration/etc.) | (Full / Partial / None) |

Any requirement with Coverage = None must be flagged. This matrix is the primary traceability artifact that `review-qe-package` validates in its completeness review.

### 9h. Completion

Summarize what was produced:
- Scaffolding increments generated
- Test case increments generated
- Category breakdown (if categorized)
- Support documents written
- Output path

## Acknowledgement checkpoint

Present the summary. Ask: "Is the QE implementation plan complete? Ready to proceed to review?" Wait for confirmation.

## Next

Hand off by name to `review-qe-package`.
