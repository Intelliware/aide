# Change Tracker Template

**Purpose:** This template defines the standard structure for tracking documentation changes across all reverse engineering phases. Each phase document defines its own **Parts Affected** values; the tracker structure itself is universal.

**When to Use:** Create a `CHANGE-TRACKER.md` file at the root of each documentation output directory (e.g., `docs/api/CHANGE-TRACKER.md`, `docs/framework/CHANGE-TRACKER.md`). Use this template as the starting structure.

**Reference:** See `../reverse-engineering/phases/canonical-reverse-engineering-shape.md` for the universal change tracking rules, change types, and version alignment process.

---

## Template

Copy the structure below into your `CHANGE-TRACKER.md` file and populate the bracketed placeholders.

```markdown
# [System Name] Documentation Change Tracker

**System:** [System Name]
**System Type:** [API / UI Framework / Web Application / API Framework / Database / Mobile Application / Mobile Framework / Knowledge Repository]
**Current Source Version:** [e.g., 1.4.2]
**Current Documentation Version:** [e.g., 1.4.2-doc.1]
**Phase Document:** [e.g., reverse-engineer-api-phase.md]

---

## Documentation Versioning

Documentation versions follow the source system's version with a documentation revision suffix:
- `X.Y.Z-doc.1` = Documentation revision 1 for source version X.Y.Z
- `X.Y.Z-doc.2` = Documentation revision 2 (correction/addition) for source version X.Y.Z
- `X.Y.Z+1-doc.1` = First documentation for new source version

---

## Parts Affected — Reference

The "Parts Affected" column in the Change Log uses the values defined in the
referencing phase document. Populate this table with the values from your
phase document's Change Tracking section:

| Value | Meaning |
| --- | --- |
| [value] | [description — e.g., "Part A: Internal API Documentation"] |
| [value] | [description — e.g., "Part B1: OpenAPI Specification"] |
| [value] | [description — e.g., "Part B2: Consumer Companion Guide"] |
| [value] | [description — e.g., "All: All documentation parts"] |

---

## Change Log

### [Documentation Version] — [Date]

| # | Date | Change Type | Parts Affected | Section/File | Description | Source Version | Verified |
|---|------|-------------|----------------|-------------|-------------|----------------|----------|
| [seq] | YYYY-MM-DD | [type] | [values from Parts Affected table above] | [file path] | [description] | [version] | ✅ / 🔵 |

---

## Detailed Changes

### Change #[seq]

**Date:** YYYY-MM-DD
**Change Type:** [Initial Extraction / Correction / Source Update / Restructure / Addition / Deprecation / Removal]
**Parts Affected:** [values from Parts Affected table above]
**Section/File:** [e.g., part-a-internal/08-auth-internals.md]
**Source Version:** [e.g., 1.4.2]

**Description:**
[What changed and why]

**Before:**
[Previous content or "N/A — initial extraction"]

**After:**
[New content summary]

**Verification:**
[How the change was verified against source code]

**Cross-Impact:**
[Other parts/sections updated as a result, or "None"]
```

---

## Change Types

These change types are standard across all phases (reverse engineering, forward engineering, and knowledge repository):

| Change Type | When to Use |
| --- | --- |
| **Initial Extraction** | First-time documentation of an artifact from source code |
| **Correction** | Fixing an error in existing documentation (wrong type, wrong default, wrong schema, etc.) |
| **Source Update** | Documentation update triggered by a source code change (new version, new feature, modified behavior) |
| **Restructure** | Reorganizing documentation structure without changing technical content |
| **Addition** | Adding documentation for a newly discovered or newly added artifact |
| **Deprecation** | Marking an artifact as deprecated in documentation |
| **Removal** | Removing documentation for a removed artifact |

---

## Parts Affected — Phase-Specific Values

When creating a Change Tracker for a specific phase, populate the "Parts Affected — Reference" table using the values defined in the corresponding phase document's Change Tracking section. Here is the complete reference:

### API Repositories (reverse-engineer-api-phase.md)

| Value | Meaning |
| --- | --- |
| A | Part A: Internal API Documentation (maintainers) |
| B1 | Part B1: OpenAPI Specification (machine-readable contract) |
| B2 | Part B2: Consumer Companion Guide (narrative docs) |
| All | All three parts affected |

### UI Framework Repositories (reverse-engineer-ui-framework-phase.md)

| Value | Meaning |
| --- | --- |
| A | Part A: Full Framework Documentation (maintainers) |
| B | Part B: Implementer Documentation (app developers) |
| Both | Both parts affected |

### Web Application Repositories (reverse-engineer-web-app-phase.md)

| Value | Meaning |
| --- | --- |
| A | Part A: Internal Application Documentation (app developers) |
| B | Part B: Application Overview & Integration Guide (knowledge repository) |
| Both | Both parts affected |

### API Framework Repositories (reverse-engineer-api-framework-phase.md)

| Value | Meaning |
| --- | --- |
| A | Part A: Internal Framework Documentation (maintainers) |
| B | Part B: Implementer Documentation (API developers) |
| Both | Both parts affected |

### Database Repositories (reverse-engineer-database-phase.md)

| Value | Meaning |
| --- | --- |
| A | Part A: Internal Database Documentation (DBAs, maintainers) |
| B1 | Part B1: Data Dictionary & ERD (reference) |
| B2 | Part B2: Database Consumer Guide (application developers) |
| All | All three parts affected |

### Mobile Application Repositories (reverse-engineer-mobile-app-phase.md)

| Value | Meaning |
| --- | --- |
| A | Part A: Internal Application Documentation (app developers) |
| B | Part B: App Overview & Integration Guide (knowledge repository) |
| Both | Both parts affected |

### Mobile Framework/Library Repositories (reverse-engineer-mobile-framework-phase.md)

| Value | Meaning |
| --- | --- |
| A | Part A: Internal Framework Documentation (maintainers) |
| B | Part B: Implementer Documentation (app developers) |
| Both | Both parts affected |

### Knowledge Repository (build-knowledge-repository-phase.md)

The Knowledge Repository does not follow the Part A / Part B model. Changes are tracked by **component name**:

| Value | Meaning |
| --- | --- |
| Architecture Overview | C4 diagrams, system context, container diagrams |
| Service/API Catalog | API and service registry entries |
| Framework/Library Catalog | Framework and library registry entries |
| Application Catalog | Application registry entries |
| Data Dictionary | Aggregated data dictionary and ERD |
| Cross-Cutting Concerns | Shared patterns, security, observability, etc. |
| Dependency Map | Inter-system dependency graph |
| ADRs | Architecture Decision Records |
| Onboarding Guide | New developer onboarding documentation |
| Maintenance Guide | Ongoing maintenance procedures |
| Multiple | When more than two components are affected, list them |

### Requirements Package (create-requirements-package.md)

Forward engineering deliverable. Changes are tracked by **document component**:

| Value | Meaning |
| --- | --- |
| Executive Summary | Project overview, objectives, scope |
| Functional Requirements | FR specifications and functional flows |
| Business Rules | Business logic, calculations, validations, state machines |
| User Journeys | User stories, workflows, personas |
| Data Requirements | Data entities, attributes, relationships |
| NFRs | Non-functional requirements (performance, security, etc.) |
| Acceptance Criteria | Testable acceptance conditions |
| Traceability | Traceability matrix and cross-references |
| Multiple | When more than two components are affected, list them |

### Solution Design Package (create-solution-design-package.md)

Forward engineering deliverable. Changes are tracked by **design area**:

| Value | Meaning |
| --- | --- |
| Architecture | Solution overview, C4 diagrams, technology stack |
| Frontend Design | Routing, state management, component structure, UI/UX |
| Backend Design | Layered architecture, domain model, API conventions |
| API Design | Endpoint specifications, request/response schemas |
| Database Design | Table definitions, ERD, migration strategy |
| Security Design | Authentication, authorization, data security |
| Integration Design | External service integration, workflows, state machines |
| Infrastructure | Deployment, DevOps, observability, environments |
| Testing Strategy | Test pyramid, environments, data management |
| NFR Specs | Non-functional requirement technical specifications |
| Multiple | When more than two components are affected, list them |

### Implementation Package (create-implementation-package.md)

Forward engineering deliverable. Changes are tracked by **artifact type**:

| Value | Meaning |
| --- | --- |
| Requirements | Changes cascading from requirements updates |
| Solution Design | Changes cascading from design updates |
| Code | Source code changes (backend, frontend, database) |
| Tests | Test code changes (unit, integration, E2E) |
| Configuration | Build, deployment, environment configuration changes |
| Documentation | Implementation documentation changes |
| Multiple | When more than two components are affected, list them |

### Phase Execution Guide & Canonical Phase Shape

> **Not Applicable — Meta Documents:** These documents define process and structure for executing phases. They do not produce documentation deliverables and do not have their own Parts Affected values. See the relevant phase document for applicable values.

---

## Cross-Part Synchronization Rules

When a change affects one documentation part, always evaluate the other parts for impact. The specific cross-impact patterns depend on the documentation model:

### For 2-Part Models (A / B)

| If This Changes... | Check This... |
| --- | --- |
| Part A: Internal detail that affects public interface | Part B: Does the consumer-facing documentation need updating? |
| Part B: Consumer documentation corrected | Part A: Does the internal documentation have the same error? |
| Source code: Feature changed | Both parts: Which sections reference this feature? |

### For 3-Part Models (A / B1 / B2)

| If This Changes... | Check These... |
| --- | --- |
| Part A: Internal implementation changed | Part B1: Does the external contract change? Part B2: Do examples or guides need updating? |
| Part B1: Schema or contract changed | Part A: Does internal documentation match? Part B2: Do examples use the updated schema? |
| Part B2: Narrative content updated | Part B1: Do referenced schemas still match? |
| Source code: Feature changed | All parts: Which sections reference this feature? |

---

## Usage Instructions

### Creating a New Change Tracker

1. Copy the template structure above into a new `CHANGE-TRACKER.md` file
2. Fill in the system name, type, and current versions
3. Look up your phase document to find the correct Parts Affected values
4. Populate the "Parts Affected — Reference" table with those values
5. Begin logging changes with sequential numbering starting at 1

### Logging a Change

1. Add a row to the Change Log summary table
2. Create a "Detailed Changes" entry with the same sequence number
3. Fill in all fields — especially Verification and Cross-Impact
4. If the change affects multiple parts, list all affected parts in the "Parts Affected" column

### Version Alignment

When the source system releases a new version:

1. Create a new Change Log section header: `### [new-doc-version] — [date]`
2. Continue sequential numbering (do not reset)
3. Log each documentation update triggered by the version change
4. Update the "Current Source Version" and "Current Documentation Version" at the top

---

## Additional Resources

- **Canonical Reverse Engineering Shape:** `../reverse-engineering/phases/canonical-reverse-engineering-shape.md` — defines universal change tracking rules for reverse engineering phases
- **Canonical Phase Shape:** `../implementation-planning/phases/canonical-phase-shape.md` — defines mandatory structure for implementation phases
- **Individual Phase Documents:** See specific phase document for domain-specific Parts Affected values and cross-impact patterns
