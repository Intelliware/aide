---
name: create-qe-package
description: "Use when the user asks to create, build, write, or assemble a QE package; says 'create the QE package', 'build the test package', 'create test cases', 'assemble the QE artifacts', 'start the QE stage', 'generate test plan', 'create integration tests', 'create E2E tests', 'build the QE implementation plan'. Drives the full QE stage: guided elicitation of test scope, topology, technologies, artifacts, execution strategy, and test case planning — producing a QE implementation plan with per-test-case increments, handing off to review-qe-package."
---

# Create QE Package

## Overview

Drives the QE stage end-to-end through a guided wizard/workflow that elicits test scope, system topology, technology choices, artifact expectations, execution strategy, and test case inventory from the user. Produces a QE implementation plan containing per-test-case increment files (mirroring the planning stage's INC-XXX pattern but for QE), organized by optional category sub-folders.

The skill consumes the requirements and design packages for full context before beginning elicitation. It deliberately does not consume the implementation package — QE tests are derived from requirements and design, not implementation details, preserving separation of concerns. It is solution-agnostic — the guided questions adapt to whatever technology stack, test framework, and domain the user's project declares.

## When to use

- Requirements and design packages exist and the user wants the QE package
- User says: "create the QE package", "build the test package", "create test cases", "generate test plan", "start the QE stage", "create integration tests", "create E2E tests", "build the QE implementation plan"
- Updating an existing QE package after design or implementation changes

## When NOT to use

- The QE package is already assembled and the user only wants validation → `review-qe-package`
- The user wants to execute QE test increments → `execute-qe-increments`
- The user is still designing → `create-design-package`
- The user is still planning implementation → `create-implementation-package`
- The change is trivial → `quick-dev/document-quick-change`

## Inputs

See `references/INPUTS-OUTPUTS.md` for the full table. Required:
- Approved requirements package (from `{paths.requirements_package}`)
- Approved design package (from `{paths.design_package}`)
- `project.toml` (for flow detection, paths, repo list, elicitation answers)
- Source documentation (if user provides it during elicitation)

## Verification rule (always-on)

After every drafted artifact and before any file write, summarize back to the user what you understood and what you produced; wait for their explicit acknowledgement (or correction) before proceeding. This applies regardless of which step you are on. Halt the step if the user disagrees.

## Workflow

Execute one step at a time. Read each step file only when starting that step. Do not pre-load all step files.

**Before Step 1:** Read the requirements and design packages for full context:
- Requirements package at `{paths.requirements_package}`
- Design package at `{paths.design_package}`
- Any source documentation the user provides during Step 1

> **Note:** The implementation package is intentionally excluded. QE tests are derived from requirements and design specifications, not implementation details — this preserves separation of concerns between QE and the service deliverable.

Announce to the user:

> You are now creating a **QE Package** for **{project.name}** which will be produced at **{paths.qe_package}**.

Then proceed to Step 1.

1. `steps/01-source-and-scope.md` — Elicit source documentation and high-level QE scope. Ask what kinds of tests the user wants (E2E, Integration, Path Integration, Chaos, etc.).
2. `steps/02-topology-and-boundaries.md` — Elicit system topology, service boundaries, inputs/outputs, sync/async nature.
3. `steps/03-technologies.md` — Elicit the detailed technology list for the QE test harness.
4. `steps/04-artifacts.md` — Elicit expected generated artifacts (feature files, step definitions, CSVs, etc.).
5. `steps/05-test-harness.md` — Elicit how the test harness works, how artifacts are used/executed, team-specific processes.
6. `steps/06-tech-stack-and-embedding.md` — Elicit specific tech stack choices and how QE tests embed into existing services.
7. `steps/07-test-case-organization.md` — Elicit test case organization: single location vs. category sub-folders.
8. `steps/08-execution-strategy.md` — Elicit test execution strategy across local, lower, and upper environments. Produce execution documentation.
9. `steps/09-generate-plan.md` — Generate the QE implementation plan with per-test-case increment files, organized by categories if chosen.

## Output

A QE package at `{paths.qe_package}/` containing:

| Artifact | Path | Format |
|---|---|---|
| QE package overview | `{paths.qe_package}/qe-package.md` | Markdown — overview of all QE test cases, topology, tech stack, execution strategy |
| Execution strategy doc | `{paths.qe_package}/execution-strategy.md` | Markdown — how tests run across all environments |
| QE implementation plan overview | `{paths.qe_package}/plan/qe-plan-overview.md` | Markdown — lists all increments (scaffolding + test cases) and dependencies |
| Scaffolding increment files | `{paths.qe_package}/plan/TC-XXX.md` | Markdown — preparatory work (dependencies, runner classes, test utilities, config profiles) |
| Test case increment files | `{paths.qe_package}/plan/<category>/TC-XXX.md` (categorized) or `{paths.qe_package}/plan/TC-XXX.md` (flat) | Markdown — detailed implementation plan for each test case's artifacts and their target paths in the codebase |
| Test case status tracker | `{paths.qe_package}/plan/test-case-status.md` | Markdown table — status of each increment (scaffolding + test case) |
| Change tracker | `{paths.qe_package}/change-tracker.md` | Markdown table |

## Next skill
review-qe-package

## Common mistakes

- **Skipping context loading.** Always read all prior packages before beginning elicitation. The QE package must trace back to requirements, design, and implementation.
- **Being solution-specific in the skill logic.** The skill is a generic framework tool — all solution-specific detail comes from elicitation and prior packages, not from hardcoded assumptions.
- **Generating test cases without understanding topology.** Steps 1–2 (scope + topology) must complete before test case planning begins.
- **Assuming a single test framework.** The user's project may use Cucumber, TestNG, pytest, Playwright, or anything else. Never assume.
- **Skipping the execution strategy.** QE tests run across multiple environments; the execution doc is a first-class artifact, not an afterthought.
- **Generating all plan files without offering incremental review.** Step 9 must offer the user a choice between batch generation and one-at-a-time review.
- **Using "phase" terminology.** This skill uses "test case" and "increment" as chunk-level units. The word "phase" refers to SDLC stages.
