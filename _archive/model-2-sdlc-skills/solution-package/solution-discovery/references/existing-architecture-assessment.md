# Existing Architecture Assessment

## Purpose

Synthesize all architect discovery outputs into a single architecture baseline document that the design phase works against. The architect's equivalent of the BSA's current-capability-synthesis. Consumes and merges: the raw architectural observations from architecture-discovery (component topology, framework conventions, deployment manifests, data-layer architecture, integration patterns, security boundaries), the technical-debt-assessment (must-fix/should-fix/defer categorization), and the relevant sections of the BSA's requirements package (executive summary at `docs/<feature>/requirements-package/requirements/executive-summary.md` for business-level context, change scope at `docs/<feature>/requirements-package/analysis/change-scope.md` for scope and constraints). The assembled baseline covers: current component architecture and module boundaries, tech stack and framework versions, deployment topology and infrastructure, data stores and schemas at the architectural level, integration points and communication patterns, security architecture and trust boundaries, performance characteristics and known bottlenecks, technical debt categorized by impact on the proposed change, and architectural constraints the proposed change must operate within. Produces a single architecture-baseline document — not a collection of fragments — that is the sole discovery-phase input to the design phase. All design skills consume this document rather than reaching back into individual discovery artifacts. Prevents the failure mode where design decisions are made against an incomplete or inconsistent understanding of the existing architecture.

## What This Is

The synthesis step of design discovery. The AI merges three inputs — the raw architectural observations from `architecture-discovery`, the categorized debt from `technical-debt-assessment`, and the relevant sections of the BSA's requirements package — into a single **architecture-baseline** document.

This document is the sole discovery-phase input to the design phase. Every design skill consumes it. No design skill reaches back into individual discovery artifacts (`docs/<feature>/solutions-package/discovery/architecture-discovery-observations.md` or `docs/<feature>/solutions-package/discovery/technical-debt-assessment.md`). The baseline is the single source of truth for the existing system.

This is the architect's equivalent of package synthesis — it takes multiple fragmented outputs and reconciles them into one coherent document that downstream skills can rely on.

## When to Use

- After both `architecture-discovery` and `technical-debt-assessment` have completed and been confirmed by the user
- As the final step of the design discovery workflow
- Before any design skill runs

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Raw architectural observations | `docs/<feature>/solutions-package/discovery/architecture-discovery-observations.md` | Yes |
| Technical debt assessment | `docs/<feature>/solutions-package/discovery/technical-debt-assessment.md` | Yes |
| Requirements package | BSA handoff — `docs/<feature>/requirements-package/requirements-package.md`. Specifically: executive summary (`docs/<feature>/requirements-package/requirements/executive-summary.md`), change scope (`docs/<feature>/requirements-package/analysis/change-scope.md`), functional requirements (`docs/<feature>/requirements-package/requirements/functional-requirements.md`), data requirements (`docs/<feature>/requirements-package/requirements/data-requirements.md`), NFRs (`docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md`) | Yes — provides the business context and change boundaries that frame the baseline |

> **Missing input guard:** If a required input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[full path]` but it was not found. This input is required for this skill. Should I proceed without it, or can you provide it?"*

## What This Skill Does NOT Do

- It does not re-read the codebase. All codebase findings come from `architecture-discovery`.
- It does not re-assess debt. All debt classification comes from `technical-debt-assessment`.
- It does not design anything. It describes the existing system — the design phase decides what to change.
- It does not generate new observations. It merges, reconciles, and structures what has already been discovered.

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  1. LOAD — Read all three inputs                                 │
│     Read the architecture-discovery observations, the            │
│     technical-debt-assessment, and the relevant sections of      │
│     the BSA's requirements package.                              │
├──────────────────────────────────────────────────────────────────┤
│  2. RECONCILE — Check for contradictions across inputs            │
│     Compare the architecture-discovery observations against      │
│     the requirements package's description of the existing       │
│     system. If the BSA's requirements package says the system    │
│     does X and the codebase shows Y, record the contradiction    │
│     as an open question — do not silently resolve it.            │
├──────────────────────────────────────────────────────────────────┤
│  3. STRUCTURE — Populate the architecture-baseline template      │
│     Map the merged content into the 12 sections of the           │
│     architecture-baseline template. Each section draws from      │
│     specific sources:                                            │
│       Section 1  (System Context)        ← requirements package  │
│       Section 2  (Component Architecture)← arch-discovery cat 1  │
│       Section 3  (Tech Stack)            ← arch-discovery cat 2  │
│       Section 4  (Deployment Topology)   ← arch-discovery cat 3  │
│       Section 5  (Data Architecture)     ← arch-discovery cat 4  │
│       Section 6  (Integration Points)    ← arch-discovery cat 5  │
│       Section 7  (Security Architecture) ← arch-discovery cat 6  │
│       Section 8  (Performance)           ← arch-discovery cat 7  │
│       Section 9  (Technical Debt)        ← tech-debt-assessment  │
│       Section 10 (Constraints)           ← arch-discovery +      │
│                                            tech-debt must-fix    │
│       Section 11 (Areas Affected)        ← requirements package  │
│                                            + arch-discovery scope│
│       Section 12 (Open Questions)        ← all unresolved items  │
├──────────────────────────────────────────────────────────────────┤
│  4. CONSOLIDATE CONSTRAINTS — Build the constraints register     │
│     Merge the constraints identified in architecture-discovery   │
│     with the must-fix debt items from the debt assessment.       │
│     Must-fix debt items are architectural constraints — the      │
│     design cannot ignore them. Present them as constraints       │
│     the design phase must account for, not as separate debt.     │
├──────────────────────────────────────────────────────────────────┤
│  5. CONSOLIDATE OPEN QUESTIONS — Build the questions register    │
│     Collect all open questions from architecture-discovery       │
│     (Unknown confidence items) and any contradictions found      │
│     in the reconciliation step. Each question states what is     │
│     unknown and who can answer it.                               │
├──────────────────────────────────────────────────────────────────┤
│  6. VALIDATE — Completeness check                                │
│     Verify that every section of the template is populated       │
│     or explicitly marked as not applicable with rationale.       │
│     Verify that every must-fix debt item appears as a            │
│     constraint in Section 10. Verify that every Unknown item     │
│     from discovery appears in Section 12.                        │
├──────────────────────────────────────────────────────────────────┤
│  7. ASSEMBLE — Write the architecture-baseline document          │
│     Produce the final document following the template. Write     │
│     the file to disk. Present to the user for review.            │
└──────────────────────────────────────────────────────────────────┘
```

### File Output

Write the completed architecture baseline to `docs/<feature>/solutions-package/discovery/architecture-baseline.md` using the template at `../assets/architecture-baseline.md` as the output structure.

## Section-by-Section Assembly Guide

### Section 1: System Context

**Source:** BSA's requirements package — executive summary (`docs/<feature>/requirements-package/requirements/executive-summary.md`) and change scope (`docs/<feature>/requirements-package/analysis/change-scope.md`).

**Content:** System name, purpose, primary users, deployment environment. This is the business framing that orients a reader before they encounter the technical detail. Written in one or two paragraphs — not a copy of the executive summary, but a concise system-level context statement.

### Section 2: Component Architecture

**Source:** Architecture-discovery Category 1 (Component Topology).

**Content:** The component map — each distinct component in the affected area, its responsibility, and how it communicates with other components. Include dependency direction and coupling indicators. Present as a structured list or table, not a narrative paragraph.

### Section 3: Tech Stack and Frameworks

**Source:** Architecture-discovery Category 2 (Tech Stack and Frameworks).

**Content:** Every significant technology with its observed version. Framework conventions the codebase follows. Technologies flagged as outdated or at end-of-life. Present as a table: technology, version, role, notes.

### Section 4: Deployment Topology

**Source:** Architecture-discovery Category 3 (Deployment Topology).

**Content:** Where and how the application is deployed, environment structure, CI/CD pipeline, health checks, scaling configuration. Infrastructure constraints that affect the design.

### Section 5: Data Architecture

**Source:** Architecture-discovery Category 4 (Data Architecture).

**Content:** Each data store (type, purpose, which components access it), data access patterns, schema management approach, caching architecture. Present data stores as a table: store, type, purpose, accessing components, access pattern.

### Section 6: Integration Points

**Source:** Architecture-discovery Category 5 (Integration Points).

**Content:** Each external system integration (protocol, sync/async, error handling approach). Message/event patterns (topic naming, message formats, consumer patterns, dead-letter configuration). Present as a table: system, protocol, direction, sync/async, error handling.

### Section 7: Security Architecture

**Source:** Architecture-discovery Category 6 (Security Architecture).

**Content:** Authentication flow, authorization model, trust boundaries, secrets management approach. This section describes how security currently works — the design phase decides what to add or change.

### Section 8: Performance Characteristics

**Source:** Architecture-discovery Category 7 (Performance and Operational Characteristics).

**Content:** Observability stack (logging, metrics, tracing, alerting — what exists and what is missing). Known performance-relevant architecture decisions. Scaling constraints.

### Section 9: Technical Debt Assessment

**Source:** `docs/<feature>/solutions-package/discovery/technical-debt-assessment.md` — carried over in full.

**Content:** Must-fix items (with remediation approach and timing), should-fix items (with risk statement), defer items (logged only). Summary table. Design phase impact statement.

### Section 10: Architectural Constraints

**Source:** Architecture-discovery constraints register + must-fix debt items from technical-debt-assessment.

**Content:** A consolidated list of every constraint the design must respect. Each constraint states what it is, where it comes from (codebase observation or debt prerequisite), and what design freedom it restricts. Must-fix debt items appear here because they are constraints — the design cannot proceed as if they don't exist.

### Section 11: Areas Affected by Proposed Change

**Source:** Requirements package change scope (`docs/<feature>/requirements-package/analysis/change-scope.md`) + architecture-discovery component map and scope expansion record.

**Content:** Which architectural components, integration points, and data stores the proposed feature will touch. Cross-referenced with the BSA's change scope to confirm alignment. If architecture-discovery revealed affected areas the BSA's change scope didn't anticipate, these are flagged explicitly.

### Section 12: Open Questions

**Source:** Architecture-discovery open questions + reconciliation contradictions.

**Content:** Every architectural unknown that discovery could not resolve. Each question states: what is unknown, which section it affects, and who can answer it (user, operations team, infrastructure team, etc.).

## Output File

The completed architecture baseline is written to **`docs/<feature>/solutions-package/discovery/architecture-baseline.md`** in the project repository. If the directory does not exist, it is created.

This document is the **sole discovery-phase input to the design phase**. Every design skill consumes it alongside the BSA's requirements package. No design skill references `docs/<feature>/solutions-package/discovery/architecture-discovery-observations.md` or `docs/<feature>/solutions-package/discovery/technical-debt-assessment.md` directly.

---

## Hand-off Gate

Before declaring discovery complete, you must:

1. Write the completed architecture baseline in full — all 12 sections populated or explicitly marked as not applicable.
2. Write the document to `docs/<feature>/solutions-package/discovery/architecture-baseline.md`. The file write must succeed before proceeding.
3. Present the baseline to the user.
4. Ask explicitly: **"This architecture baseline is the document the entire design phase will work against. Does it accurately represent the existing system in the areas this feature will touch? Are there constraints, integration points, data stores, or architectural decisions that are missing or incorrect?"**
5. If the user identifies corrections or additions, update the baseline, overwrite the file, and re-present before proceeding.
6. Do not interpret silence, a "thank you," or general acknowledgement as acceptance. Wait for an explicit confirmation before the design phase begins.

## Completion Criteria

- [ ] All three inputs have been read: architecture-discovery observations, technical-debt-assessment, and the BSA's requirements package
- [ ] Contradictions between the codebase observations and the requirements package's description of the existing system are recorded as open questions in Section 12 — not silently resolved
- [ ] All 12 sections of the template are either populated or explicitly marked as not applicable with rationale
- [ ] Section 10 (Architectural Constraints) includes every must-fix debt item as a constraint the design must account for
- [ ] Section 11 (Areas Affected) cross-references the BSA's change scope with the architecture-discovery component map — discrepancies are flagged
- [ ] Section 12 (Open Questions) includes every Unknown item from architecture-discovery and every contradiction found during reconciliation
- [ ] The document is self-contained — a reader can understand the existing architecture without referencing `docs/<feature>/solutions-package/discovery/architecture-discovery-observations.md` or `docs/<feature>/solutions-package/discovery/technical-debt-assessment.md`
- [ ] The document is written to `docs/<feature>/solutions-package/discovery/architecture-baseline.md` and the file write has succeeded
- [ ] The user has explicitly confirmed the baseline is accurate and complete enough for the design phase to begin

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Design skills consume fragmented discovery artifacts and miss context from one or the other | A single synthesized document is the only input — nothing is fragmented |
| Contradictions between what the BSA says the system does and what the codebase shows are silently ignored | The reconciliation step explicitly checks for and records contradictions |
| Must-fix debt items are treated as optional by the design phase | Must-fix items appear in the constraints register (Section 10) — the design phase sees them as constraints, not suggestions |
| Architecture-discovery found affected areas the BSA didn't anticipate, but this is never surfaced | Section 11 cross-references both sources and flags discrepancies |
| Open questions from discovery are scattered across artifacts and forgotten | Section 12 consolidates all open questions with enough context to answer them |
| A section of the template is empty because the corresponding discovery category had no findings, and no one notices | The completeness check verifies every section is populated or explicitly marked as not applicable |
| Design begins before the architect confirms the baseline is correct | The hand-off gate requires explicit user confirmation before the design phase starts |
