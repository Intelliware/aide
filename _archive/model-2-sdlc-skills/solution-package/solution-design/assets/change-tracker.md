# [Feature Name] — Solution Design Change Tracker

**Feature:** [Feature name — same as the feature folder under `docs/`]
**Current Requirements Package Version:** [e.g., 1.0.0 — from the BSA's change tracker]
**Current Solution Design Version:** [e.g., 1.0.0-design.1]
**Last Updated:** [YYYY-MM-DD]

---

## Solution Design Versioning

Solution design versions follow the requirements package version with a design revision suffix:
- `X.Y.Z-design.1` = First design pass against requirements package version X.Y.Z
- `X.Y.Z-design.2` = Design revision 2 (correction, review finding, or addition) for the same requirements version
- `X.Y.Z+1-design.1` = First design pass after a requirements package version change

---

## Parts Affected — Reference

The "Parts Affected" column in the Change Log uses the design section names from the solution design package.

| Value | Meaning |
| --- | --- |
| Solution Overview | Design drivers, scope, high-level approach (Section 1) |
| Technology Stack | Framework versions, exclusions, new additions (Section 2) |
| System Design | Component topology, boundaries, data flow (Section 3) |
| Frontend Design | UI architecture, state management, routing, accessibility (Section 4) |
| Backend Design | Service layer, domain model, error handling (Section 5) |
| Data Model Design | Schema, entities, migrations, ERD (Section 6) |
| API Design | Endpoint contracts, request/response schemas, error codes (Section 7) |
| Integration Design | External system integrations, protocols, patterns (Section 8) |
| Security Architecture | Auth flows, RBAC, data protection, trust boundaries (Section 9) |
| Workflow / Business Rules | State machines, workflow orchestration, rule enforcement (Section 10) |
| Dashboard / Reporting | Metrics, visualizations, aggregation strategy (Section 11) |
| Deployment Strategy | CI/CD pipeline, environments, rollout, rollback (Section 12) |
| Observability Design | Logging, monitoring, alerting, distributed tracing (Section 13) |
| Testability Design | Test types, coverage targets, automation, test data (Section 14) |
| Discovery | Architecture baseline, technical debt assessment |
| Assembled Package | The merged solution-package.md document |
| Multiple | When more than two sections are affected, list them |

---

## Change Log

### [Solution Design Version] — [Date]

| # | Date | Change Type | Parts Affected | Section/File | Description | Req. Package Version | Verified |
|---|------|-------------|----------------|-------------|-------------|----------------------|----------|
| [seq] | YYYY-MM-DD | [type] | [values from table above] | [file path] | [description] | [version] | ✅ / 🔵 |

---

## Detailed Changes

### Change #[seq]

**Date:** YYYY-MM-DD
**Change Type:** [Initial Design / Correction / Requirements Update / Review Finding / Restructure / Addition / Removal]
**Parts Affected:** [values from Parts Affected table above]
**Section/File:** [e.g., design/07-api-design.md]
**Requirements Package Version:** [e.g., 1.0.0]

**Description:**
[What changed and why]

**Before:**
[Previous content or "N/A — initial design pass"]

**After:**
[New content summary]

**Verification:**
[How the change was verified — e.g., cross-referenced against requirements, confirmed by user, review finding resolved]

**Cross-Impact:**
[Other sections updated as a result, or "None"]

---

## Change Types

| Change Type | When to Use |
| --- | --- |
| **Initial Design** | First-time creation of a design section |
| **Correction** | Fixing an error in existing design (wrong contract, wrong schema, inconsistency) |
| **Requirements Update** | Design update triggered by a requirements package version change |
| **Review Finding** | Design update triggered by an architecture, security, or readiness review finding |
| **Restructure** | Reorganizing design structure without changing technical content |
| **Addition** | Adding design for a newly scoped section or newly discovered concern |
| **Removal** | Removing design for a de-scoped section |

---

## Cross-Section Synchronization Rules

When a change affects one design section, evaluate related sections for impact.

| If This Changes... | Check These... |
| --- | --- |
| Data Model Design | API Design (contracts match entities?), Backend Design (domain model consistent?), Frontend Design (data shapes match?) |
| API Design | Frontend Design (consuming the right contracts?), Backend Design (implementing the right contracts?), Security Architecture (all endpoints covered?) |
| Technology Stack | All downstream sections (are version references consistent?) |
| System Design | All detail design sections (do boundaries still hold?) |
| Security Architecture | API Design (auth requirements per endpoint?), Frontend Design (RBAC enforcement?), Backend Design (authorization checks?) |
| Backend Design | API Design (service layer matches contracts?), Data Model Design (repository layer matches schema?) |
| Requirements package updated | Solution Overview (scope still accurate?), then trace changed requirements to affected design sections |

---

## Usage Instructions

### Creating a New Change Tracker for a Feature

1. Copy this template into `docs/<feature>/solutions-package/CHANGE-TRACKER.md`
2. Fill in the feature name, requirements package version, and initial solution design version
3. Begin logging changes with sequential numbering starting at 1

### Logging a Change

1. Add a row to the Change Log summary table
2. Create a Detailed Changes entry with the same sequence number
3. Fill in all fields — especially Verification and Cross-Impact
4. If the change affects multiple sections, list all affected sections

### After a Requirements Package Version Change

1. Create a new Change Log section header: `### [new-design-version] — [date]`
2. Continue sequential numbering (do not reset)
3. Log each design update triggered by the requirements change with Change Type "Requirements Update"
4. Update "Current Requirements Package Version" and "Current Solution Design Version" at the top

### After a Review Finding

1. Log each design update with Change Type "Review Finding"
2. Reference the review skill that produced the finding (architecture, security-posture, or solution-readiness)
3. Document the finding resolution in the Description field
