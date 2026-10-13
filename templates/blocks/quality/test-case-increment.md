---
slug: test-case-increment
title: "Test-Case Increment Shape"
applies-to: [greenfield-quality-package]
requires-decision-from: [qa-engineer, tester]
optional: true
order-hint: 4.5
include-if: "project.elicitation.uses_test_case_increments == true"
---
## 4a. Test-Case Increment Plan (optional)
This block is included **only when the team has opted into the TC-XXX
test-case increment flow** (composition gate
`project.elicitation.uses_test_case_increments = true`). When this gate
is `false`, the block is omitted and test work folds inline into the
application `INC-XXX` increments executed by `execute-increments`'s TDD
loop. The composition records the omission as `N/A` in the change tracker.
When included, this block decomposes the test design from §3 into
independently executable increments that `execute-quality-increments`
processes one at a time. Each plan records the resolved test-artifact
target repo: `[project.testing].qe_repo` when configured, otherwise the
in-scope code repo fallback. There are **two kinds of increments**:
1. **Scaffolding increments** — preparatory work that makes the
   codebase (or a separate test project) ready for test execution.
   Examples: adding test-framework dependencies to the build file,
   creating runner classes or suite definitions, adding test
   configuration / profile files, wiring up report plugins, creating
   shared test utilities (producers, consumers, async helpers, test-data
   builders, fixtures, page objects). Scaffolding increments always
   come first in the dependency chain.
2. **Test-case increments** — each one is a **detailed implementation
  plan** for producing the actual test artifacts and placing them in
  their target locations within the resolved test-artifact target repo.
  An increment specifies
   exactly which files to create, what each file should contain, where
   it goes, and how to verify it works. The increment is the plan;
   `execute-quality-increments` turns it into real artifacts.
Every test-case increment depends on the relevant scaffolding being
complete first.
### 4a.1 Canonical 8-block increment shape (QE projection)
Test-case increments follow the same canonical 8-block shape as
application `INC-XXX` increments, with each block specialised for test
artifacts:
| # | Block | Application `INC-XXX` | Test-case `TC-XXX` |
|---|---|---|---|
| 1 | **Increment Identity** | `INC-XXX`, FR mapping | `TC-{project-code}-{nnn}`, AC/FR/NFR/INC mapping, category, tags, priority |
| 2 | **Goal** | System state after the increment | What truth the test proves (present tense, single sentence) |
| 3 | **Dependencies** | Other INC IDs | Other TCs (reused step-defs / fixtures), scaffolding TCs, infra, services |
| 4 | **Plan** | Imperative steps to build the feature | Steps to build the test artifacts (feature / spec / step-def / fixture / data) |
| 5 | **Outcome** | Production deliverables | Test artifacts (paths relative to project root) |
| 6 | **AI Gate** | Test commands + expected results | Test-runner command + expected scenario / spec outcome |
| 7 | **Human Gate** | Intent review | Scenario readability, assertion coverage, fragility / flake-risk review |
| 8 | **Success Criteria** | Binary checkboxes | Compiles, runs, passes, traceable, exported / reported |
### 4a.2 Per-block content rules (generic)
**1. Increment Identity**
- ID format: `TC-{project-code}-{nnn}` (e.g. `TC-WIRE-001`). Project
  code is pinned in `project.toml`.
- **Type**: `scaffolding` or `test-case`.
- **Category**: from the test-design categorisation (`e2e`,
  `integration`, `contract`, `smoke`, `chaos`, etc.). Optional for flat
  plans.
- **Tags**: the tag vocabulary pinned in
  `quality/automation-and-cicd` (e.g. `@smoke`, `@regression`,
  `@happy-path`). These drive test filtering at execution time. No
  framework-specific syntax is assumed in this block.
- **Priority**: P1 (must-run, every deployment), P2 (regression), P3
  (nice-to-have).
- **Traceability**: AC IDs / FR IDs / NFR IDs / INC IDs from the
  upstream packages. Recorded in the package-level traceability matrix
  rendered via `shared/traceability`.
**2. Goal**
- Single sentence, present tense, describing what truth the test proves.
- *Good:* "A valid event published to the input topic is enriched and
  appears on the output topic with all required fields."
- *Bad:* "Test the happy path." (too vague)
**3. Dependencies**
- Other TC IDs whose scaffolding or shared artifacts this test reuses.
- Infrastructure assumptions (broker running, topics created, service
  deployed, schema registered).
- Shared test helpers / fixtures / page objects this test consumes.
**4. Plan**
- Numbered imperative steps.
- Names the exact artifacts to create (file names, class / module
  names) and the assertions to verify.
- Defers tool-specific conventions to
  `quality/automation-and-cicd` and team customisations under
  `config/customizations/execute-quality-increments.toml`.
**5. Outcome**
- Lists every file the increment produces, with paths relative to the
  resolved test-artifact target repo root.
- Includes any out-of-tree exports (e.g. test-case CSV for an external
  tracker) the team uses, as declared in
  `quality/quality-metrics-and-reporting`.
**6. AI Gate**
- The specific test-runner command the executing agent will run, with
  the tag / filter / spec selector that targets this case.
- The expected outcome (specific scenario / spec passes; assertion
  set met).
- A compile / syntax-validation command for the language and build
  tool in use.
**7. Human Gate**
- [ ] Scenario / spec reads clearly in plain language (a non-technical
  stakeholder could understand intent).
- [ ] Step definitions / matchers follow the team's established
  patterns and reuse shared helpers rather than re-implementing them.
- [ ] Assertions cover every linked acceptance criterion fully.
- [ ] No timing-dependent assertions without explicit async waiting
  (no raw `sleep`s — use the framework's polling / await primitive
  pinned in `automation-and-cicd`).
**8. Success Criteria**
- [ ] Artifact file(s) exist and parse / compile cleanly.
- [ ] Step definitions / matchers compile and resolve every step
  declared in the feature / spec (no undefined, no ambiguous).
- [ ] Test executes against the documented environment and passes
  (or fails for the documented expected reason).
- [ ] Traceability to AC / FR / NFR / INC is recorded in the
  increment file and rolls up into `shared/traceability`.
- [ ] Any required out-of-tree export row (e.g. CSV) is generated.
### 4a.3 Plan layout on disk
| Concern | Path |
|---|---|
| Scaffolding increments (always plan-root) | `{paths.quality_package}/<feature-id>/quality/plan/TC-XXX.md` |
| Test-case increments (flat) | `{paths.quality_package}/<feature-id>/quality/plan/TC-XXX.md` |
| Test-case increments (categorised) | `{paths.quality_package}/<feature-id>/quality/plan/<category>/TC-XXX.md` |
| Plan overview | `{paths.quality_package}/<feature-id>/quality/plan/qe-plan-overview.md` |
| Status tracker | `{paths.quality_package}/<feature-id>/quality/plan/test-case-status.md` |
The plan layout (flat vs categorised) is the team's choice and is
recorded in this block when the package is authored.
The plan overview also records the test-artifact target repo code and
whether it came from `[project.testing].qe_repo` or from the code-repo
fallback.
### 4a.4 Status-tracker columns
| Column | Notes |
|---|---|
| TC ID | `TC-{project-code}-{nnn}` |
| Name | Short summary |
| Type | `scaffolding` or `test-case` |
| Category | category or `N/A` |
| Status | `not-started` / `in-progress` / `completed` / `blocked` |
| Started | date |
| Completed | date |
| Notes | reuse decisions, accepted deviations, CI-only execution, etc. |
### 4a.5 Customisation hooks
- Tag vocabulary, runner command shape, build-tool target names, and
  embedding strategy (in-repo vs dedicated test repo) are pinned in
  `quality/automation-and-cicd` and may be overridden per team in
  `config/customizations/execute-quality-increments.toml`.
- The default repo for QE-owned artifacts is pinned by
  `[project.testing].qe_repo` when present. If absent, the executing skill
  falls back to the in-scope code repo.
- The framework name itself is read from `project.toml`
  (`[project.elicitation].test_framework`,
  `[project.elicitation].test_runner`) — never hard-coded into this
  block or the generated `TC-XXX.md` files.
### 4a.6 Hand-off
A populated test-case-increment block makes the team eligible for the
optional `execute-quality-increments` execution loop after a GO from
`review-quality-package`. `review-quality-package` runs an additional
conditional review (`review-test-case-increment-shape`) against the
plan when this block is in the composition.