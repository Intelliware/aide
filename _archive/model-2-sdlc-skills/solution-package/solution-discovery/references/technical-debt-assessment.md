# Technical Debt Assessment

## Purpose

Assess existing technical debt that affects the proposed change. Consumes: the raw architectural observations from architecture-discovery (code patterns, framework usage, test infrastructure, deployment configuration) and the BSA's requirements package (executive summary at `docs/<feature>/requirements-package/requirements/executive-summary.md` for existing system baseline context, change scope at `docs/<feature>/requirements-package/analysis/change-scope.md` for which areas are affected). Identifies debt that blocks the feature (must-fix — the feature cannot be safely built until this is addressed), debt the feature will worsen if ignored (should-fix — not a blocker but will compound if deferred), and debt that is unrelated to the change area (defer — log for backlog). Categorizes by type: code debt (poor patterns, duplication, missing abstractions), architecture debt (inappropriate component boundaries, coupling violations), infrastructure debt (outdated dependencies, manual deployment steps, missing CI stages), test debt (low coverage in change area, flaky tests, missing integration tests), and documentation debt (stale or missing docs for affected components). Produces a technical debt assessment that feeds into existing-architecture-assessment as part of the architecture-baseline document.

## What This Is

The AI reviews the raw architectural observations from `architecture-discovery` and the BSA's requirements package to identify existing technical debt that affects the proposed change. Every debt item is categorized by its relationship to the feature (must-fix, should-fix, defer) and by its type (code, architecture, infrastructure, test, documentation).

This is not a general-purpose tech debt audit. The assessment is scoped to the areas the proposed change will touch. Debt that exists elsewhere in the system is out of scope unless it directly constrains the feature.

## When to Use

- After `architecture-discovery` has produced raw architectural observations
- Before `existing-architecture-assessment` synthesizes the architecture baseline
- Only for brownfield projects — greenfield projects have no existing debt

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Raw architectural observations | `docs/<feature>/solutions-package/discovery/architecture-discovery-observations.md` | Yes — the codebase findings that reveal debt indicators |
| Requirements package | BSA handoff — `docs/<feature>/requirements-package/requirements-package.md`. Specifically: change scope (`docs/<feature>/requirements-package/analysis/change-scope.md`), functional requirements (`docs/<feature>/requirements-package/requirements/functional-requirements.md`), NFRs (`docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md`) | Yes — determines which debt items are relevant to the feature |

> **Missing input guard:** If a required input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[full path]` but it was not found. This input is required for this skill. Should I proceed without it, or can you provide it?"*

## What Constitutes Technical Debt

Technical debt is any aspect of the existing system that increases the cost, risk, or difficulty of delivering the proposed change. It is not a value judgment about the original decision — debt may have been the right trade-off when it was incurred. The question is whether it affects *this* feature.

### Debt Types

**Code debt** — Poor patterns, duplication, missing abstractions, overly complex logic, inconsistent conventions in the affected area. Indicators from architecture-discovery: components with unclear responsibilities, tangled dependencies, inconsistent naming or structure patterns.

**Architecture debt** — Inappropriate component boundaries, coupling violations, layering violations, architectural patterns that the rest of the system has moved away from but this area hasn't. Indicators: circular dependencies, components that bypass established boundaries, outdated architectural patterns alongside newer ones.

**Infrastructure debt** — Outdated dependencies (frameworks, libraries, runtimes near or past end-of-life), manual deployment steps that should be automated, missing CI/CD stages (e.g., no automated security scanning, no integration test stage), incomplete environment parity. Indicators from architecture-discovery: version observations flagged as outdated, deployment topology gaps, missing pipeline stages.

**Test debt** — Low or no test coverage in the change area, flaky tests, missing integration test seams, tests that test implementation rather than behavior, no performance test infrastructure for areas that have NFR targets. Indicators: absence of test files in affected directories, test configuration that excludes the change area, test patterns that are brittle.

**Documentation debt** — Stale or missing documentation for components the feature depends on, undocumented API contracts between components, missing runbooks for operational procedures the feature will extend. Indicators: README files with outdated information, API documentation that doesn't match the code, missing architectural decision records for significant past choices.

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  1. SCOPE — Identify the assessment boundary                     │
│     From the requirements package change scope, identify which   │
│     components, data stores, integrations, and infrastructure    │
│     the proposed feature will touch. Cross-reference with the    │
│     architecture-discovery component map.                        │
├──────────────────────────────────────────────────────────────────┤
│  2. SCAN — Walk each category for debt indicators                │
│     For each of the five debt types (code, architecture,         │
│     infrastructure, test, documentation), review the             │
│     architecture-discovery observations for indicators.          │
│     Also check the BSA's requirements package for known          │
│     issues flagged in the existing system baseline.              │
├──────────────────────────────────────────────────────────────────┤
│  3. CLASSIFY — Assign impact relative to the feature             │
│     For each debt item found, determine its relationship         │
│     to the proposed change:                                      │
│       • Must-fix: the feature cannot be safely built             │
│         until this is addressed                                  │
│       • Should-fix: the feature will worsen this if              │
│         ignored — not blocking but compounds                     │
│       • Defer: exists in the area but unrelated to               │
│         this change — log for backlog                            │
├──────────────────────────────────────────────────────────────────┤
│  4. ASSESS RISK — Determine what happens if not addressed        │
│     For each must-fix and should-fix item, state:                │
│       • What goes wrong if the feature is built on top of it     │
│       • What the remediation looks like at a high level          │
│       • Whether remediation should happen before, during,        │
│         or after the feature work                                │
├──────────────────────────────────────────────────────────────────┤
│  5. ASSEMBLE — Write the assessment document                     │
│     Produce the structured assessment. Write the file to         │
│     disk. Present to the user for review.                        │
└──────────────────────────────────────────────────────────────────┘
```

### File Output

Write the completed assessment to `docs/<feature>/solutions-package/discovery/technical-debt-assessment.md`.

## Classification Rules

### Must-Fix

A debt item is **must-fix** when any of the following apply:

- The feature depends on a component or library that is broken, deprecated past support, or has a known security vulnerability that would be exposed by the new functionality
- The feature requires modifying code that has no test coverage and the change is high-risk (touches data persistence, financial calculations, security, or integration contracts)
- The feature requires extending an architectural pattern that is actively being migrated away from — building more on it would increase the migration cost significantly
- The feature cannot meet its NFR targets (performance, security, availability) without first addressing the debt

### Should-Fix

A debt item is **should-fix** when:

- The feature will add more code following an inconsistent pattern, making future cleanup harder
- The feature will increase coupling between components that are already too tightly coupled
- The feature will add endpoints or workflows to an area with no integration tests — not blocking, but the team loses confidence in the change area
- The debt is in a component the feature reads from but doesn't modify — the debt doesn't block the feature but creates risk if the component behaves unexpectedly

### Defer

A debt item is **defer** when:

- It exists in the scanned area but the proposed change does not interact with the affected code, data, or infrastructure
- It is a general improvement (e.g., upgrading a logging library) that would be nice but has no bearing on the feature's success or risk
- It was identified during scope expansion but is in a component that the feature only observes, not modifies

## Output — Technical Debt Assessment

The AI produces a structured document with three sections.

### Section 1: Must-Fix Items

One entry per debt item that blocks the feature. Each entry contains:

| Field | Content |
|-------|---------|
| **ID** | TD-001, TD-002, etc. |
| **Type** | Code / Architecture / Infrastructure / Test / Documentation |
| **Location** | Which component, module, or infrastructure element is affected |
| **What the debt is** | Plain description of the problem |
| **Why it blocks the feature** | What goes wrong if the feature is built on top of this |
| **Remediation approach** | High-level description of what fixing it looks like — not a detailed implementation plan |
| **Timing** | Before the feature work begins / As the first task of the feature work |
| **Evidence** | Reference to the architecture-discovery observation or requirements package section that revealed it |

### Section 2: Should-Fix Items

Same structure as must-fix, with one difference:

| Field | Content |
|-------|---------|
| **Why it should be fixed** | What risk or cost increases if the feature is built without addressing this |
| **Timing** | During the feature work / Immediately after the feature ships |

### Section 3: Defer Items

A lighter-weight table — these items are logged, not analyzed in depth.

| ID | Type | Location | What the debt is | Why it can be deferred |
|----|------|----------|-------------------|----------------------|
| TD-NNN | | | | |

### Summary

After all three sections, a summary containing:

| Metric | Count |
|--------|-------|
| Must-fix items | |
| Should-fix items | |
| Defer items | |
| Must-fix by type (code / architecture / infrastructure / test / documentation) | |
| Should-fix by type | |

**Design phase impact statement** — a concise paragraph stating what the design phase needs to account for based on this assessment. For example: "The design must include remediation of TD-001 (migration to the new auth middleware) as a prerequisite before the feature's permission model can be designed. TD-003 and TD-004 (missing integration test seams) should be addressed as part of the testing strategy design."

## Output File

The completed assessment is written to **`docs/<feature>/solutions-package/discovery/technical-debt-assessment.md`** in the project repository. If the directory does not exist, it is created.

This document feeds into: **`existing-architecture-assessment`** (synthesis step), which merges it into Section 9 of the architecture-baseline document.

---

## Hand-off Gate

Before proceeding to `existing-architecture-assessment`, you must:

1. Write the completed technical debt assessment in full — all three sections plus the summary.
2. Write the document to `docs/<feature>/solutions-package/discovery/technical-debt-assessment.md`. The file write must succeed before proceeding.
3. Present the assessment to the user.
4. Ask explicitly: **"Does this assessment capture the technical debt that matters for this feature? Are there known issues — in the codebase, infrastructure, or test coverage — that affect this area and aren't listed here?"**
5. If the user identifies additional debt items or corrections, update the assessment, overwrite the file, and re-present before proceeding.
6. Do not interpret silence, a "thank you," or general acknowledgement as acceptance. Wait for an explicit confirmation before proceeding to `existing-architecture-assessment`.

## Completion Criteria

- [ ] The assessment is scoped to the areas identified in the requirements package change scope — not a full system debt audit
- [ ] Every debt item is classified as must-fix, should-fix, or defer with a clear rationale for the classification
- [ ] Every debt item is typed as code, architecture, infrastructure, test, or documentation
- [ ] Every must-fix item states why it blocks the feature and what remediation looks like
- [ ] Every should-fix item states what risk increases if the feature ships without addressing it
- [ ] Defer items are logged with enough context to be actionable as backlog items
- [ ] The summary table is fully populated
- [ ] The design phase impact statement is present and actionable
- [ ] The assessment is written to `docs/<feature>/solutions-package/discovery/technical-debt-assessment.md` and the file write has succeeded
- [ ] The user has explicitly confirmed the assessment is accurate and complete enough to proceed

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Feature built on top of blocking debt — breaks during implementation or after release | Must-fix items are identified and flagged as prerequisites before design begins |
| Feature worsens existing debt without anyone realizing | Should-fix items make the compounding risk visible so the team can decide consciously |
| Debt assessment becomes a full system audit that delays the project | Assessment is scoped to the change area — defer items are logged, not analyzed in depth |
| Debt is identified but no one knows what to do about it | Each must-fix and should-fix item includes a high-level remediation approach and timing recommendation |
| Design phase ignores debt constraints | The design phase impact statement tells the architect exactly what debt must be accounted for in the design |
| Debt items are listed without evidence | Every item references the architecture-discovery observation or requirements package section that revealed it |
| Team debates whether a debt item is blocking without clear criteria | Classification rules provide objective criteria for must-fix vs. should-fix vs. defer |
