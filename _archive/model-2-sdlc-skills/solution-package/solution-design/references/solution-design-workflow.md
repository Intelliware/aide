# Solution Design Workflow

## Purpose

Sequence and scope the design skills that produce the solution design package. Starts with a scoping step that reads the requirements package and, when available, the architecture baseline to determine which of the 14 design sections are needed for this feature, then sequences the applicable skills in dependency order. Not every feature needs every section — a backend-only API change skips frontend design; a feature with no external integrations skips integration design; a feature with no reporting needs skips dashboard/reporting design. The scoping step makes this determination explicit and presents it for user confirmation before any design work begins. For features with a frontend component, the scoping step also determines the platform(s) — web, iOS, Android, or a combination — so frontend design is tailored appropriately.

## Sequential Execution Rule — Read This First

**Execute one step at a time. Do not pre-read all reference files before starting.**

The sequence below tells you which reference file to read next. Read each reference file only when you are about to execute that step. After you finish a step:

1. Produce the output artifact in full.
2. Present the artifact to the user.
3. Wait for acknowledgement before reading the next reference file.

**DO NOT:**
- Read all reference files upfront and then execute from memory.
- Skip a step because a previous step's output seemed to cover it.
- Run steps in parallel unless explicitly noted — most steps depend on the outputs of previous steps.
- Begin the review phase before the solution package is assembled.

---

## Requirements Traceability — Mandatory for Every Skill

Every **new or modified** design decision must trace back to the requirements package, architecture baseline constraints when discovery ran, codebase evidence, or user-confirmed inputs. Existing, unchanged elements carry forward by default and do not require traceability when they are documented in the architecture baseline or explicitly confirmed during skipped-discovery intake.

The traceability chain builds across skills:

1. **Solution overview** — design drivers trace to specific requirements, constraints, and baseline observations
2. **Technology stack** — new technologies, explicit exclusions, and version upgrades trace to the requirements or constraints that drive them; existing-stack technologies carry forward without traceability
3. **System design** — requirements that drive new or modified components are traced; requirements fully satisfied by unchanged components are confirmed as covered but do not need traceability entries; structural decisions track cascading implications to downstream design sections
4. **All detail design skills** (data model, API, backend, frontend, etc.) — each new or modified design decision traces to the requirement(s) it satisfies

If a new design decision cannot be traced to a requirement, constraint, or baseline observation, it must be flagged and confirmed with the user before inclusion. This prevents the AI from inventing requirements or making design decisions that serve no stated need.

---

## Requirements Version Tracking — Applies to Every Skill

The BSA's requirements package includes a **change tracker** (`docs/<feature>/requirements-package/requirements/change-tracker.md`) that records every discrete change to every tracked item across the requirements phase. The design workflow and all design skills must use it to detect whether the requirements have changed since the last time they were consumed.

**How it works:**

1. **First consumption (no prior design artifacts exist):** At Step 0, read the change tracker and record the **current package version** (from the Package Version Log) in the solution overview. This establishes the baseline — all design decisions in this pass are made against this version of the requirements.

2. **Re-consumption (design artifacts already exist and requirements have been revised):** At Step 0, compare the package version recorded in the solution overview against the current version in the change tracker. If they differ:
   - Read the **Version Diff Summary** for every version between the recorded version and the current version.
   - Identify which requirements changed (Added, Modified, Removed, Deferred, Reinstated) and which design sections they affect. Use the change tracker's `Impact` field and the scoping questions to map requirement changes to design sections.
   - Present the delta to the user: *"The requirements package has been updated from [old version] to [new version]. The following changes affect the design: [list of changes with affected design sections]. I'll update the affected sections during this pass."*
   - For each affected design section: when that skill runs, it must address the changed requirements explicitly — either revising the design decision or confirming the existing decision still holds with a documented rationale.

3. **After design is complete:** Update the package version recorded in the solution overview to the current version. This ensures the next consumer (implementation package or review phase) knows which requirements version the solution was designed against.

**Why this matters for AI SDLC:** Without version tracking, an AI agent re-running a design skill after a requirements change would re-read the entire requirements package and produce a full design from scratch — wasting effort and potentially losing decisions that were already confirmed. The change tracker enables **targeted updates**: only the design sections affected by changed requirements need revision.

---

## When to Use

- After solution discovery is complete and `architecture-baseline.md` has been produced
- As the first solution phase when solution discovery is intentionally skipped
- After the BSA's requirements package has been handed to the architect
- Before any implementation planning

## Scope

This workflow produces a **solution design package** — the architect's specification of how the proposed change will be built. Not every section applies to every project. The scoping step determines which sections are needed.

## What This Does

Sequences the design skills in dependency order — foundational decisions first, then detailed design that depends on those decisions. This file is the workflow — it does not contain skill logic itself.

---

## Step 0 — Scope the Design Package

**This step runs before any design skill. It determines which sections are needed and in what order.**

Read the following inputs:
- The BSA's **requirements package** (`docs/<feature>/requirements-package/requirements-package.md`) — specifically functional requirements, data requirements, user journeys, business rules, permissions-access-control, and NFRs
- The BSA's **change tracker** (`docs/<feature>/requirements-package/requirements/change-tracker.md`) — the Package Version Log and Version Diff Summary. If design artifacts already exist, compare the recorded package version in the solution overview against the current version and follow the Requirements Version Tracking protocol above.
- The architect's **architecture-baseline** (`docs/<feature>/solutions-package/discovery/architecture-baseline.md`) if solution discovery ran — specifically component architecture, tech stack, integration points, and areas affected by the proposed change

### If Solution Discovery Was Skipped

Do not fail only because `docs/<feature>/solutions-package/discovery/architecture-baseline.md` is missing.

Before scoping sections:

1. Tell the user that solution design is starting without an architecture baseline.
2. Ask whether this is greenfield or brownfield.
3. For greenfield, record that no existing architecture baseline applies.
4. For brownfield, use available codebase context and ask targeted questions only for architecture details required to scope the design.
5. Record unverified architecture claims as assumptions or design risks in the solution overview.

Then answer each scoping question below. Present the answers to the user for confirmation before proceeding.

### Scoping Questions

#### Core sections (almost always needed)

| Question | Determines | Default |
|----------|-----------|---------|
| Does the feature change what is built or why? | Section 1: Solution Overview | **Always included** |
| Does the feature introduce or change technology choices? | Section 2: Technology Stack | **Always included** — for brownfield, may be minimal ("no changes to existing stack") |
| Does the feature add, modify, or remove components or change how they communicate? | Section 3: Solution Architecture | **Always included** |

#### Conditional sections

| Question | Determines | How to check |
|----------|-----------|-------------|
| Does the feature have a user-facing interface? | Section 4: Frontend Design | Check functional requirements and user journeys for UI-driven capabilities |
| Does the feature have server-side logic? | Section 5: Backend Design | Check functional requirements for processing, validation, or data manipulation that happens server-side |
| Does the feature change the data model? | Section 6: Database Design | Check data requirements for new or modified entities |
| Does the feature expose or modify APIs? | Section 7: API Design | Check functional requirements for endpoints, or check if frontend design needs an API to consume |
| Does the feature communicate with external systems or other services? | Section 8: Integration Design | Check architecture baseline integration points and requirements for external dependencies |
| Does the feature change authentication, authorization, or data protection? | Section 9: Security Design | Check permissions-access-control for new roles, permissions, or access rules; check for new data sensitivity levels |
| Does the feature involve stateful workflows, state machines, or complex business rule enforcement? | Section 10: Workflow / Business Rules | Check business rules catalog and functional requirements for state transitions, approval flows, or conditional logic |
| Does the feature involve dashboards, reports, or analytics? | Section 11: Dashboard / Reporting | Check functional requirements and business objectives for reporting or metric visualization needs |

#### Cross-cutting sections (almost always needed)

| Question | Determines | Default |
|----------|-----------|---------|
| Does the feature need to be deployed? | Section 12: Deployment / DevOps | **Always included** unless the change is documentation-only |
| Does the feature need monitoring in production? | Section 13: Observability | **Always included** unless the change is documentation-only |
| Does the feature need to be tested? | Section 14: Testing Strategy | **Always included** |

### Frontend Platform Detection

If Section 4 (Frontend Design) is included, determine the platform(s):

**Check the architecture baseline:**
- Is there an existing web frontend? (React, Angular, Vue, Next.js, etc.)
- Is there an existing iOS app? (Swift, SwiftUI, UIKit)
- Is there an existing Android app? (Kotlin, Jetpack Compose, XML layouts)
- Is there an existing cross-platform mobile app? (React Native, Flutter)

**Check the requirements package:**
- Do user journeys reference mobile-specific interactions (push notifications, camera, GPS, offline mode)?
- Do functional requirements specify platform-specific capabilities?
- Do NFRs specify platform-specific targets (app store compliance, mobile performance)?

**Record the platform determination:**
- **Web only** — frontend design covers web UI architecture
- **iOS only** — frontend design covers iOS app architecture
- **Android only** — frontend design covers Android app architecture
- **Cross-platform mobile** — frontend design covers the shared framework and platform-specific deviations
- **Web + mobile** — frontend design covers both, with shared design decisions (API contracts, auth flow) called out once and platform-specific design separated clearly
- **No frontend** — Section 4 is skipped entirely

### Present the Scope

Present the scoping determination to the user:

**"Based on the requirements package, architecture baseline if available, and any codebase or user-confirmed architecture context, here are the design sections needed for this feature:**

| Section | Included | Reason |
|---------|----------|--------|
| 1. Solution Overview | Yes | *(always)* |
| 2. Technology Stack | Yes | *(always — state whether changes are expected or just confirmation of existing stack)* |
| 3. Solution Architecture | Yes | *(always)* |
| 4. Frontend Design | Yes/No | *(reason — platform: web/iOS/Android/cross-platform/web+mobile)* |
| 5. Backend Design | Yes/No | *(reason)* |
| 6. Database Design | Yes/No | *(reason)* |
| 7. API Design | Yes/No | *(reason)* |
| 8. Integration Design | Yes/No | *(reason)* |
| 9. Security Design | Yes/No | *(reason)* |
| 10. Workflow / Business Rules | Yes/No | *(reason)* |
| 11. Dashboard / Reporting | Yes/No | *(reason)* |
| 12. Deployment / DevOps | Yes | *(always)* |
| 13. Observability | Yes | *(always)* |
| 14. Testing Strategy | Yes | *(always)* |

**Does this scope look right? Are there sections I should add or remove?"**

Wait for explicit confirmation. If the user adjusts the scope, update and re-present. Do not proceed to Step 1 until the scope is confirmed.

---

## The Sequence

The design skills run in dependency order. Skills later in the sequence consume outputs from earlier skills. Skipped sections are noted in the solution package as "Not applicable — [rationale from scoping step]."

```
┌─────────────────────────────────────────────────────────────────┐
│  DESIGN WORKFLOW — SOLUTION DESIGN SEQUENCE                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  0. SCOPE                          ──► included sections list   │
│     Determine which sections            Platform determination  │
│     this feature needs                  User-confirmed scope    │
│              │                                                  │
│  ┌───────────┤ FOUNDATIONAL (run in order) ──────────────────┐  │
│  │           ▼                                               │  │
│  │  1. solution-overview           ──► Section 1              │  │
│  │     Business context, scope,         Frames everything     │  │
│  │     high-level approach                                    │  │
│  │           │                                               │  │
│  │           ▼                                               │  │
│  │  2. technology-stack            ──► Section 2              │  │
│  │     Pin versions, confirm or         All other design      │  │
│  │     extend the tech stack            skills depend on this │  │
│  │           │                                               │  │
│  │           ▼                                               │  │
│  │  3. system-design               ──► Section 3              │  │
│  │     Component topology,              Structural foundation │  │
│  │     boundaries, data flow            for all detail design │  │
│  └───────────┤                                               │  │
│  ┌───────────┤ DETAIL DESIGN (run applicable ones in order) ─┐  │
│  │           ▼                                               │  │
│  │  4. data-model-design           ──► Section 6              │  │
│  │     Schema, entities,                Backend and API need  │  │
│  │     migrations                       this first            │  │
│  │           │                 (skip if not in scope)         │  │
│  │           ▼                                               │  │
│  │  5. api-design                  ──► Section 7              │  │
│  │     Endpoint contracts,              Frontend and backend  │  │
│  │     request/response schemas         implement against this│  │
│  │           │                 (skip if not in scope)         │  │
│  │           ▼                                               │  │
│  │  6. backend-design              ──► Section 5              │  │
│  │     Service layer, domain            Implements API        │  │
│  │     model, error handling            contracts and rules   │  │
│  │           │                 (skip if not in scope)         │  │
│  │           ▼                                               │  │
│  │  7. frontend-design             ──► Section 4              │  │
│  │     UI architecture, state           Consumes API          │  │
│  │     management, routing              contracts             │  │
│  │     (web/iOS/Android/multi)   (skip if not in scope)      │  │
│  │           │                                               │  │
│  │           ▼                                               │  │
│  │  8. integration-design          ──► Section 8              │  │
│  │     External system                  Depends on system     │  │
│  │     communication patterns           design boundaries     │  │
│  │           │                 (skip if not in scope)         │  │
│  │           ▼                                               │  │
│  │  9. security-architecture       ──► Section 9              │  │
│  │     Auth flows, RBAC,                Needs to know all     │  │
│  │     data protection                  endpoints and data    │  │
│  │           │                 (skip if not in scope)         │  │
│  │           ▼                                               │  │
│  │  10. workflow-business-rules    ──► Section 10             │  │
│  │      State machines, rule            Depends on backend    │  │
│  │      enforcement strategy            and data model        │  │
│  │           │                 (skip if not in scope)         │  │
│  │           ▼                                               │  │
│  │  11. dashboard-reporting        ──► Section 11             │  │
│  │      Metrics, visualizations,        Depends on data model │  │
│  │      aggregation strategy            and backend           │  │
│  │           │                 (skip if not in scope)         │  │
│  └───────────┤                                               │  │
│  ┌───────────┤ CROSS-CUTTING (run in order) ─────────────────┐  │
│  │           ▼                                               │  │
│  │  12. deployment-strategy        ──► Section 12             │  │
│  │      CI/CD, environments,            Needs to know all     │  │
│  │      rollout, rollback               components to deploy  │  │
│  │           │                                               │  │
│  │           ▼                                               │  │
│  │  13. observability-design       ──► Section 13             │  │
│  │      Logging, monitoring,            Needs to know all     │  │
│  │      alerting, tracing               components to monitor │  │
│  │           │                                               │  │
│  │           ▼                                               │  │
│  │  14. testability-design         ──► Section 14             │  │
│  │      Test types, coverage,           Needs to know all     │  │
│  │      automation, test data           seams to test         │  │
│  └───────────┘                                               │  │
│              │                                                  │
│              ▼                                                  │
│  15. ASSEMBLE                      ──► solution-package.md      │
│      Merge all completed sections       Single self-contained   │
│      into one document; mark            document ready for      │
│      skipped sections with              review                  │
│      rationale                                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Why This Order

### Foundational: Solution Overview → Technology Stack → System Design

Everything depends on these three. The solution overview frames the problem and approach. The technology stack pins the versions that every other design skill references. The system design defines the component boundaries that all detail design builds within. These three always run, in this order, before anything else.

### Detail Design: Data Model → API → Backend → Frontend

This sequence follows the dependency chain:
- **Data model first** — backend services operate on entities; API contracts expose them; frontend displays them. Designing data last means every upstream design is guessing at the shape of the data.
- **API before backend and frontend** — the API contract is the agreement between them. Designing backend or frontend without API contracts leads to mismatched assumptions. Both sides implement against the same contract.
- **Backend before frontend** — the backend implements the API contracts and enforces business rules. The frontend consumes what the backend provides. Designing frontend first risks designing for capabilities the backend doesn't support.
- **Frontend last in this group** — it consumes API contracts (designed in step 5), follows the state management approach from the tech stack (step 2), and implements the UI for capabilities defined in backend (step 6).

### Integration and Security after Detail Design

Integration design needs to know all component boundaries (from system design) and data contracts (from data model and API design). Security design needs to know all endpoints (from API design), all data entities (from data model), and all integration points (from integration design) to design comprehensive authorization and data protection.

### Workflow / Business Rules and Dashboard / Reporting

These are specialized sections that depend on backend and data model being designed. Not every project needs them, and they don't block the cross-cutting sections.

### Cross-Cutting: Deployment → Observability → Testing

These run last because they need to know the full picture:
- **Deployment** needs to know all components, database migrations, and integration changes to design the rollout sequence.
- **Observability** needs to know all components and integration seams to design monitoring coverage.
- **Testing** needs to know everything — all components, boundaries, integration seams, and NFR targets — to design the test strategy.

---

## Handling Skipped Sections

When a section is skipped (determined in Step 0), the workflow:

1. Does not read or execute the corresponding reference file
2. Records the skip in the solution package assembly (Step 15) as: **"Section N: [Title] — Not applicable. [Rationale from scoping step]"**
3. Ensures downstream skills that would normally consume the skipped section's output are informed. For example:
   - If frontend is skipped, security design does not need to cover UI-level access control
   - If integration is skipped, observability does not need to cover external system monitoring
   - If data model is skipped, backend design works with the existing data model from the architecture baseline, codebase evidence, or user-confirmed schema context

---

## Frontend Platform Guidance

When Section 4 (Frontend Design) is in scope, the frontend-design skill adapts based on the platform determination from Step 0:

### Web

Focus on: component architecture (React/Angular/Vue patterns), routing, state management, responsive design, accessibility (WCAG), browser compatibility, bundle optimization.

### iOS

Focus on: view architecture (SwiftUI views or UIKit view controllers), navigation patterns, data persistence (Core Data, SwiftData, or API-driven), state management (ObservableObject, Combine, or TCA), platform conventions (Human Interface Guidelines), App Store requirements, offline capability.

### Android

Focus on: UI architecture (Jetpack Compose or XML layouts), navigation (Navigation component), data layer (Room, DataStore), state management (ViewModel, StateFlow), platform conventions (Material Design), Play Store requirements, offline capability.

### Cross-Platform Mobile (React Native / Flutter)

Focus on: shared vs. platform-specific code boundaries, navigation framework, state management, native module requirements, platform-specific deviations, build and distribution for both app stores.

### Web + Mobile

Design shared concerns once (API contracts, auth flow, data model), then separate platform-specific UI design clearly. The skill should produce:
- **Shared design decisions** — API consumption patterns, authentication flow, offline/sync strategy, push notification architecture
- **Web-specific design** — component architecture, routing, responsive design, accessibility
- **Mobile-specific design** — view architecture, navigation, platform conventions, app store requirements

---

## Step 0a — Determine Feature Folder

Before any design work begins, determine the feature output folder.

1. **Check for existing feature folder.** Look for `docs/*/requirements-package/` in the project repository. If a feature folder already exists from the requirements phase, reuse it.
2. **If no existing folder**, read the change description or requirements package executive summary and infer a short kebab-case folder name (e.g., `refund-processing`, `user-onboarding`, `payment-gateway-v2`).
3. **Present to the user:** *"I'll organize all solution design outputs under `docs/<feature-name>/solutions-package/`. Does this folder name work?"*
4. **If inference fails**, ask the user: *"What short name should I use for the feature folder? This will be used as `docs/<name>/solutions-package/`."*
5. **Create the folder structure** if it does not exist:
   - `docs/<feature>/solutions-package/discovery/`
   - `docs/<feature>/solutions-package/design/`

All file paths in subsequent steps use `docs/<feature>/solutions-package/` as the root.

---

## Entry Criteria

Before starting the design workflow, confirm:

- [ ] `docs/<feature>/solutions-package/discovery/architecture-baseline.md` exists and has been confirmed by the user, or solution discovery was explicitly skipped
- [ ] The BSA's requirements package exists and has been handed to the architect (at `docs/<feature>/requirements-package/requirements-package.md` or user-provided)
- [ ] The BSA's change tracker exists at `docs/<feature>/requirements-package/requirements/change-tracker.md` — provides the package version log and change register so the design phase can detect which requirements changed between versions
- [ ] The user is available to answer questions during design

> **Missing input guard:** If the requirements package cannot be found at `docs/<feature>/requirements-package/requirements-package.md`, do not proceed. Ask the user to provide the requirements package location. If the change tracker cannot be found at `docs/<feature>/requirements-package/requirements/change-tracker.md`, warn the user: *"The requirements change tracker was not found. I can proceed, but I will not be able to detect which requirements changed since the last design pass. All requirements will be treated as new."* If the architecture baseline cannot be found at `docs/<feature>/solutions-package/discovery/architecture-baseline.md`, first check whether solution discovery was explicitly skipped. If it was skipped, follow **If Solution Discovery Was Skipped** above. If it was not skipped and the project is brownfield, do not proceed — ask the user whether discovery needs to run first or whether they intentionally want to skip it and accept the assumption/risk recording rules.

## Exit Criteria

Design is complete when:

- [ ] Step 0 scoping has been completed and confirmed by the user
- [ ] The requirements package version consumed is recorded in the solution overview
- [ ] All in-scope design skills have been executed in sequence
- [ ] If this is a re-consumption pass: all design sections affected by changed requirements have been updated or confirmed with rationale
- [ ] All design artifacts are written
- [ ] All skipped sections are noted with rationale in the solution package
- [ ] Each in-scope section is written to its standalone file at `docs/<feature>/solutions-package/design/`
- [ ] The solution package is assembled as a single document at `docs/<feature>/solutions-package/solution-package.md`
- [ ] The change tracker at `docs/<feature>/solutions-package/CHANGE-TRACKER.md` is initialized or updated with entries for all sections produced in this pass

## Skill Reference

| Step | Skill | Output Section | Dependency | Always? |
|------|-------|---------------|------------|---------|
| 0 | *(workflow — no reference file)* | scoping determination | — | Yes |
| 1 | `solution-overview` | Section 1 | — | Yes |
| 2 | `technology-stack` | Section 2 | Section 1 | Yes |
| 3 | `system-design` | Section 3 | Sections 1–2 | Yes |
| 4 | `data-model-design` | Section 6 | Sections 1–3 | If data model changes |
| 5 | `api-design` | Section 7 | Sections 1–3, 6 | If APIs change |
| 6 | `backend-design` | Section 5 | Sections 1–3, 6, 7 | If server-side logic |
| 7 | `frontend-design` | Section 4 | Sections 1–3, 7 | If user-facing interface |
| 8 | `integration-design` | Section 8 | Sections 1–3 | If external integrations |
| 9 | `security-architecture` | Section 9 | Sections 1–3, 7 | If auth/access changes |
| 10 | `workflow-business-rules-design` | Section 10 | Sections 3, 5, 6 | If workflows or complex rules |
| 11 | `dashboard-reporting-design` | Section 11 | Sections 5, 6 | If reporting needed |
| 12 | `deployment-strategy` | Section 12 | All prior sections | Yes |
| 13 | `observability-design` | Section 13 | All prior sections | Yes |
| 14 | `testability-design` | Section 14 | All prior sections | Yes |
| 15 | *(workflow — no reference file)* | `docs/<feature>/solutions-package/solution-package.md` | All completed sections | Yes |
| 16 | *(workflow — no reference file)* | `docs/<feature>/solutions-package/CHANGE-TRACKER.md` | All completed sections | Yes |

## Step 15 — Assemble the Solution Package

After all in-scope design skills have completed:

1. Read the `../assets/solution-package.md` template.
2. Read each individual section file from `docs/<feature>/solutions-package/design/`:
   - `01-solution-overview.md`, `02-technology-stack.md`, `03-system-design.md`
   - `04-frontend-design.md`, `05-backend-design.md`, `06-data-model-design.md`
   - `07-api-design.md`, `08-integration-design.md`, `09-security-architecture.md`
   - `10-workflow-business-rules.md`, `11-dashboard-reporting.md`, `12-deployment-strategy.md`
   - `13-observability-design.md`, `14-testability-design.md`
3. Populate each section in the template with the content from its corresponding standalone file.
4. For each skipped section (file contains "Not applicable"), carry that notation into the assembled document.
5. Verify the handoff checklist in the appendix — every item must be checkable or explicitly noted as not applicable.
6. Write the assembled document to `docs/<feature>/solutions-package/solution-package.md`. The file write must succeed.
7. Present the assembled package to the user.
8. Ask explicitly: **"The solution design package is assembled. Before we move to review, does the overall design hold together? Are there any sections where the design conflicts with what was decided in another section?"**
9. Wait for explicit confirmation before proceeding to Step 16.

## Step 16 — Initialize or Update the Change Tracker

After the solution package is assembled and confirmed by the user:

1. Read the `../assets/change-tracker.md` template.
2. Check whether `docs/<feature>/solutions-package/CHANGE-TRACKER.md` already exists.

**If it does not exist (first design pass):**

3. Copy the template into `docs/<feature>/solutions-package/CHANGE-TRACKER.md`.
4. Fill in the feature name, the requirements package version consumed (from the solution overview), and the initial solution design version (`1.0.0-design.1`).
5. Log one "Initial Design" entry for each in-scope section that was produced, using sequential numbering.
6. For skipped sections, do not create entries — the solution package already notes them with rationale.

**If it already exists (re-consumption pass):**

3. Read the existing change tracker.
4. Increment the solution design version (bump the `-design.N` suffix, or bump the base version if the requirements package version changed).
5. Create a new Change Log section header with the new version and today's date.
6. Log one entry per design section that was created or updated in this pass, using the appropriate Change Type:
   - "Requirements Update" — if the section changed because requirements changed
   - "Review Finding" — if the section changed because a review skill surfaced a finding
   - "Correction" — if the section was fixed for consistency or error
   - "Addition" — if a previously skipped section was newly scoped in
   - "Removal" — if a previously included section was de-scoped
7. Continue sequential numbering from the last entry (do not reset).

**In both cases:**

8. Present the change tracker to the user for confirmation.
9. Wait for explicit confirmation before the review phase begins.

## What Comes After Design

Once `docs/<feature>/solutions-package/solution-package.md` is assembled and confirmed, and the change tracker is initialized, the **review phase** begins. Three review skills run in sequence:

1. **`review-architecture`** — comprehensive adversarial review of architectural soundness, evaluating the design through multiple quality-attribute lenses: structural integrity, coherence, scalability, resilience, and maintainability. Must find issues — zero findings triggers re-analysis.
2. **`review-security-posture`** — adversarial security review of authentication, authorization, data protection, attack surface, input validation, secrets management, and trust boundaries. Includes a conditional compliance section that activates when the requirements package identifies regulatory constraints (GDPR, HIPAA, SOC2, PCI-DSS).
3. **`review-solution-readiness`** — final go/no-go gate that validates package completeness, cross-section consistency, full requirements traceability, operational readiness (deployment, monitoring, testing adequacy), and prior review resolution. Produces the handoff decision: GO, CONDITIONAL GO, or NO-GO.

## Failure Modes This Orchestration Prevents

| Failure mode | How the sequence prevents it |
|---|---|
| Design starts without knowing which sections are needed | Step 0 scopes the package and gets user confirmation before any design work begins |
| Frontend designed before API contracts exist | API design (step 5) runs before frontend design (step 7) |
| Backend designed before the data model is defined | Data model design (step 4) runs before backend design (step 6) |
| Security designed without knowing what endpoints exist | Security design (step 9) runs after API design (step 5) |
| Testing strategy designed without knowing what components exist | Testing strategy (step 14) runs last, after all components are designed |
| Frontend designed as web when the feature is mobile | Step 0 detects the platform(s) and tailors the frontend skill accordingly |
| A section is skipped silently without rationale | Skipped sections are explicitly noted in the solution package with rationale from the scoping step |
| Design sections contradict each other | Step 15 assembly asks the user to verify cross-section coherence before moving to review |
| Every project runs all 14 sections regardless of relevance | Step 0 scoping makes each section opt-in based on evidence from the requirements and available architecture context |
| Deployment designed without knowing about database migrations | Deployment (step 12) runs after data model (step 4) and all component design is complete |
| Design changes are made across passes with no audit trail | Step 16 initializes or updates CHANGE-TRACKER.md after every assembly, logging each section created or updated |

## Phase Handoff

After `docs/<feature>/solutions-package/solution-package.md` is assembled and acknowledged, ask the user:

> Solution design is complete. The assembled package is ready for formal review. Are you ready to start solution review?

If yes, activate or recommend the `solution-review` skill. If no, stop and summarize the completed solution design outputs and the next recommended phase.
