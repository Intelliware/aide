# Technology Stack

## Purpose

Document the technology stack — all pinned versions, technology decisions, and explicit exclusions for the solution. For brownfield projects, the existing stack is the starting point; this skill documents what stays, what is added, and what is explicitly excluded. For greenfield projects, this skill defines the full stack from scratch. Consumes: the existing-architecture-assessment (current tech stack for compatibility), the requirements package (assumptions-constraints-scope for technology constraints and hard limits), and any organizational technology standards. Covers: frontend framework, UI library, state management, and build tool; backend language, framework, ORM, and testing tools; database type, version, and hosting; infrastructure — cloud provider, compute platform, networking; authentication — SSO provider, token strategy; standards — API conventions, error formats, documentation, patterns to follow; and explicit exclusions — technologies NOT to use. All versions must be pinned. The technology stack must be fully defined before any other design skill proposes scaffolding or makes implementation-level decisions. Produces a technology stack document that is Section 2 of the solution design package.

## What This Is

Document the technology stack for the solution — what technologies are in use, what versions are pinned, what is being added for this feature, and what is explicitly excluded.

For brownfield projects this is mostly confirmation: the existing stack carries forward unless the feature introduces something new. For greenfield projects this defines the full stack from scratch.

Every other design skill references this section for version numbers, framework conventions, and technology constraints. It must be complete before any downstream design work begins.

## When to Use

- Always — this is Section 2 of the solution design package and is always included
- Runs after `solution-overview` (Step 1) and before `system-design` (Step 3)

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Architecture baseline | `docs/<feature>/solutions-package/discovery/architecture-baseline.md` — Sections 3 (Tech Stack), 4 (Deployment Topology), 5 (Data Architecture), 7 (Security Architecture) | **If discovery ran** — pre-populates the existing stack from multiple sections (see "Did Discovery Run?" below) |
| Requirements package | `docs/<feature>/requirements-package/requirements/assumptions-constraints-scope.md` — technology constraints and hard limits | Yes |
| Solution overview | `docs/<feature>/solutions-package/design/01-solution-overview.md` — high-level approach and design drivers | Yes — frames what technology decisions matter |

> **Missing input guard:** If the requirements package or any required input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[path]` but it was not found. This input is required. Please provide it or confirm I should proceed without it."*

## Did Discovery Run?

**Discovery ran** if `docs/<feature>/solutions-package/discovery/architecture-baseline.md` exists:

The architecture baseline contains the technology information spread across multiple sections. Pull from all of them to pre-populate the technology stack:

| Stack category | Primary baseline section | What to pull |
|---|---|---|
| Frontend | Section 3 (Tech Stack) | Framework, UI library, state management, build tool — all with observed versions |
| Backend | Section 3 (Tech Stack) | Language, framework, ORM, libraries — all with observed versions |
| Database | Section 3 (Tech Stack) + Section 5 (Data Architecture) | Database type and version from Section 3; access patterns, caching layers, schema management from Section 5 |
| Infrastructure | Section 3 (Tech Stack) + Section 4 (Deployment Topology) | IaC tool versions from Section 3; cloud provider, compute platform, environments, CI/CD pipeline from Section 4 |
| Auth & Authorization | Section 3 (Tech Stack) + Section 7 (Security Architecture) | Auth library versions from Section 3; SSO provider, token strategy, authorization model from Section 7 |
| Testing | Section 3 (Tech Stack) | Test frameworks and libraries with versions |
| Build & DevOps | Section 3 (Tech Stack) + Section 4 (Deployment Topology) | Build tool versions from Section 3; CI/CD tool and pipeline structure from Section 4 |

After pulling from all relevant sections, present the pre-populated stack to the user: **"Based on the architecture baseline, here is the existing technology stack. I've pulled versions from the tech stack findings, infrastructure from the deployment topology, data stores from the data architecture, and authentication from the security architecture. Let me know if anything needs correcting, and we'll then determine if the feature requires any additions."**

The user confirms, corrects, or adds to the pre-populated stack.

**Discovery was skipped** if `docs/<feature>/solutions-package/discovery/architecture-baseline.md` does not exist:
- The existing stack is unknown. Elicit it directly from the user.
- Ask the user to describe the current technology stack, or provide documentation, a `package.json`, `pom.xml`, `build.gradle`, or equivalent dependency file.
- Record all elicited technology as `user-stated` — the architect has not verified it against the codebase.

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  1. LOAD — Check for architecture baseline                       │
│     If discovery ran: read Sections 3, 4, 5, and 7 from the     │
│     baseline and pre-populate all stack categories.              │
│     If discovery was skipped: note that the stack will be        │
│     elicited from the user.                                      │
├──────────────────────────────────────────────────────────────────┤
│  2. PRESENT EXISTING STACK — Confirm what carries forward        │
│     Present the current stack (from baseline or user).           │
│     Organize by category. Ask the user to confirm or correct.   │
├──────────────────────────────────────────────────────────────────┤
│  3. IDENTIFY ADDITIONS — What does the feature need?             │
│     Review functional requirements, NFRs, and the solution       │
│     overview to determine if the feature requires technology     │
│     the existing system doesn't have. Ask the user.              │
├──────────────────────────────────────────────────────────────────┤
│  4. IDENTIFY EXCLUSIONS — What is explicitly not used?           │
│     Record technologies the team has decided NOT to use for      │
│     this feature, with rationale. This prevents downstream       │
│     design skills from proposing excluded technologies.          │
├──────────────────────────────────────────────────────────────────┤
│  5. PIN VERSIONS — Confirm every version number                  │
│     Every technology must have a pinned version. For existing    │
│     tech, use the version from the baseline. For new tech,       │
│     confirm the version with the user.                           │
├──────────────────────────────────────────────────────────────────┤
│  6. ASSEMBLE — Write the technology stack section                │
│     Produce the structured output. Write to the solution         │
│     package. Present for review.                                 │
└──────────────────────────────────────────────────────────────────┘
```

## Output — Technology Stack Section

The output is organized by category. Each technology entry includes: name, version, role (what it's used for), and status (existing / new for this feature).

### Category Structure

#### Frontend
*(Skip this category if frontend is not in scope per the design workflow's Step 0)*

| Technology | Version | Role | Status |
|-----------|---------|------|--------|
| *(e.g., React)* | *(e.g., 18.3)* | *(UI framework)* | *(existing)* |
| *(e.g., Next.js)* | *(e.g., 14.2)* | *(framework)* | *(existing)* |
| *(e.g., Tailwind CSS)* | *(e.g., 3.4)* | *(styling)* | *(existing)* |

For mobile projects, include platform-specific entries:
- **iOS:** Swift version, minimum iOS deployment target, SwiftUI or UIKit, dependency manager (SPM, CocoaPods)
- **Android:** Kotlin version, minimum SDK, Jetpack Compose or XML, Gradle version
- **Cross-platform:** Framework version (React Native, Flutter), native module dependencies

#### Backend

| Technology | Version | Role | Status |
|-----------|---------|------|--------|
| *(e.g., Java)* | *(e.g., 21 LTS)* | *(language)* | *(existing)* |
| *(e.g., Spring Boot)* | *(e.g., 3.2)* | *(framework)* | *(existing)* |
| *(e.g., Hibernate)* | *(e.g., 6.4)* | *(ORM)* | *(existing)* |

#### Database

| Technology | Version | Role | Status |
|-----------|---------|------|--------|
| *(e.g., PostgreSQL)* | *(e.g., 16)* | *(primary data store)* | *(existing)* |
| *(e.g., Redis)* | *(e.g., 7.2)* | *(caching)* | *(existing)* |

#### Infrastructure

| Technology | Version / Service | Role | Status |
|-----------|------------------|------|--------|
| *(e.g., AWS)* | — | *(cloud provider)* | *(existing)* |
| *(e.g., ECS Fargate)* | — | *(compute)* | *(existing)* |
| *(e.g., Terraform)* | *(e.g., 1.7)* | *(IaC)* | *(existing)* |

#### Authentication & Authorization

| Technology | Version / Service | Role | Status |
|-----------|------------------|------|--------|
| *(e.g., Keycloak)* | *(e.g., 24)* | *(identity provider)* | *(existing)* |
| *(e.g., JWT)* | — | *(token strategy)* | *(existing)* |

#### Testing

| Technology | Version | Role | Status |
|-----------|---------|------|--------|
| *(e.g., JUnit 5)* | *(e.g., 5.10)* | *(unit testing)* | *(existing)* |
| *(e.g., Testcontainers)* | *(e.g., 1.19)* | *(integration testing)* | *(existing)* |

#### Build & DevOps

| Technology | Version | Role | Status |
|-----------|---------|------|--------|
| *(e.g., Gradle)* | *(e.g., 8.5)* | *(build tool)* | *(existing)* |
| *(e.g., GitHub Actions)* | — | *(CI/CD)* | *(existing)* |

### New Technologies for This Feature

Technologies being introduced specifically for this feature. Each entry includes rationale for the addition.

| Technology | Version | Role | Why it's needed |
|-----------|---------|------|----------------|
| *(e.g., Apache Kafka)* | *(e.g., 3.7)* | *(event streaming)* | *(Feature requires async event processing between order service and notification service)* |

If no new technologies are being introduced, state: **"No new technologies required — the existing stack supports the feature as designed."**

### Explicit Exclusions

Technologies the team has decided NOT to use, with rationale. This prevents downstream skills from proposing them.

| Technology | Why excluded |
|-----------|-------------|
| *(e.g., GraphQL)* | *(Existing API layer is REST; introducing GraphQL for one feature creates two API paradigms to maintain)* |

If no exclusions, state: **"No explicit exclusions recorded."**

### Standards and Conventions

Conventions that all design skills must follow, carried forward from the existing codebase or established for this feature:

- **API conventions:** *(e.g., REST, JSON:API, OpenAPI 3.0 for documentation)*
- **Error format:** *(e.g., RFC 7807 Problem Details)*
- **Naming conventions:** *(e.g., snake_case for DB columns, camelCase for JSON fields)*
- **Patterns to follow:** *(e.g., repository pattern for data access, service layer for business logic)*

### Requirements Traceability

Every technology decision must trace back to a requirement, constraint, or established convention. This table maps each new technology and each explicit exclusion to the requirement(s) that drive them.

**New technology traceability:**

| Technology | Traces To | Requirement / Constraint |
|-----------|----------|--------------------------|
| *(e.g., Apache Kafka)* | *(NFR-05)* | *(Async event processing required — system must handle 10k events/sec without blocking the API response)* |
| *(e.g., Redis 7.2)* | *(NFR-02)* | *(API response time < 200ms p95 — caching layer needed for frequently read reference data)* |

**Exclusion traceability:**

| Excluded Technology | Traces To | Constraint / Rationale |
|--------------------|----------|------------------------|
| *(e.g., GraphQL)* | *(Architecture baseline constraint)* | *(Existing API layer is REST; organizational standard prohibits mixed API paradigms within the same service)* |

If a technology is part of the existing stack (status: existing), traceability is not required — it carries forward by default. Traceability is required for:
- Every **new** technology introduced for this feature
- Every **explicit exclusion**
- Every **version upgrade** of an existing technology (why the upgrade, not just "latest version")

### File Output

Write the completed section to `docs/<feature>/solutions-package/design/02-technology-stack.md` using the template at `../assets/technology-evaluation.md` as the output structure.

If this section was determined to be not applicable in the design workflow's Step 0, write a stub file containing: **"Not applicable — [rationale from scoping step]."**

---

## Hand-off Gate

Before proceeding to `system-design`, you must:

1. Write the completed technology stack section in full.
2. Present the stack to the user.
3. Ask explicitly: **"Is this technology stack complete and accurate? Are there any technologies I've missed, any versions that are wrong, or any exclusions that should be added?"**
4. If the user identifies corrections, update and re-present before proceeding.
5. Do not proceed until the user explicitly confirms the stack is correct.

## Completion Criteria

- [ ] Every significant technology is listed with a pinned version
- [ ] Each technology has a role (what it's used for) and a status (existing / new for this feature)
- [ ] If discovery ran, the existing stack from the architecture baseline is carried forward and confirmed by the user
- [ ] If discovery was skipped, the stack is elicited from the user and recorded as `user-stated`
- [ ] New technologies introduced for this feature are listed with rationale
- [ ] Explicit exclusions are listed with rationale (or stated as none)
- [ ] Standards and conventions are documented
- [ ] Requirements traceability is complete — every new technology, explicit exclusion, and version upgrade traces to a requirement or constraint
- [ ] Frontend technologies are appropriate for the platform(s) determined in the design workflow's Step 0
- [ ] The user has explicitly confirmed the technology stack is complete and accurate

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Downstream design skills propose technologies that conflict with the existing stack | The definitive stack is documented before any other design skill runs |
| A design skill introduces a technology the team explicitly decided not to use | Explicit exclusions are recorded and visible to all downstream skills |
| Version mismatches between design sections (e.g., API design assumes Spring Boot 3, backend design assumes Spring Boot 2) | All versions are pinned in one place — every skill references this section |
| Architect assumes the existing stack without verifying | If discovery ran, the stack is pre-populated from actual codebase observations; if not, it's explicitly elicited |
| New technologies are introduced without rationale | Every new technology requires a reason for its addition |
| Frontend designed for web when the platform is mobile | Platform determination from the design workflow's Step 0 ensures frontend technologies match the target platform(s) |
| A new technology is introduced without connecting it to a requirement — no one can explain why it's in the stack | Every new technology and exclusion must trace to a requirement or constraint in the traceability table |
