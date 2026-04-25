# Requirements Package

> **Project:** [project name]
> **Change request:** [brief description]
> **Date:** [date]
> **Prepared by:** [name]
> **Package completeness status:** Ready — [date]
> **Discovery ran:** Yes / No
> **Analysis ran:** Yes / No

---

## Section 1 — Executive Summary

### Feature Summary

[3–5 sentences: what is being built or changed, who it is for, why it is being built, and where it sits in the existing system.]

### Business Context

**Business problem / opportunity:** [what pain or opportunity drives this change]

**Cost of inaction:** [what happens if this is not built]

**Strategic alignment:** [how this change supports broader organisational goals]

### Scope Summary

| Dimension | Count | Highlights |
|-----------|-------|------------|
| In scope | [N items] | [most notable in-scope items] |
| Out of scope | [N items] | [most notable exclusions] |
| Must not touch | [N items] | [highest-risk must-not-touch areas] |

### Key Risks

| Risk ID | Description | Impact | Mitigation |
|---------|-------------|--------|------------|
| [RISK-xxx] | [risk description] | [consequence] | [mitigation or "Not formally assessed"] |

---

## Section 2 — Stakeholder Personas

### Influence Grid & RACI

| Name / Role | Accountable | Responsible | Consulted | Informed | Notes |
|-------------|:-----------:|:-----------:|:---------:|:--------:|-------|
| [name / role] | ☐ | ☐ | ☐ | ☐ | |

### User Personas

| Persona ID | Name | Role | Primary Goals | Pain Points | Tech Proficiency |
|-----------|------|------|--------------|-------------|-----------------|
| [P-01] | [persona name] | [role] | [what they are trying to accomplish] | [current friction] | [Low / Medium / High] |

---

## Section 3 — Business Objectives

| Objective ID | Objective | Success Metric | Measurement Method | Priority | Functional Requirements |
|-------------|-----------|---------------|-------------------|----------|------------------------|
| [OBJ-01] | [measurable business outcome] | [specific metric] | [how it will be measured] | [Must / Should / Could] | [FR-xxx, FR-xxx] |

**Objectives with no functional requirement coverage:** [none / list OBJ-xx]

---

## Section 4 — User Journeys

> One sub-section per persona journey. Add additional journey tables as needed.

### Journey: [Journey Name] — Persona: [Persona ID]

**Objective:** [what the persona is trying to accomplish in this journey]

| # | Stage | User Action | System Response | Friction Score (1–5) | Functional Requirements |
|---|-------|-------------|----------------|:--------------------:|------------------------|
| 1 | [stage name] | [what the user does] | [what the system does] | [1–5] | [FR-xxx] |

**Journey gaps / pain points:**
- [any friction or gap noted at this journey stage]

---

## Section 5 — Functional Requirements

> *Forward-looking specification of feature capabilities.*

| Req ID | Requirement | Priority | Persona | Journey Stage | Business Objective | Acceptance Criteria Summary |
|--------|-------------|----------|---------|--------------|--------------------|-----------------------------|
| [FR-001] | The system shall [specific, measurable behaviour] | [Must / Should / Could / Won't] | [P-xx] | [journey stage reference] | [OBJ-xx] | [one or two sentences stating the condition and outcome that confirms this requirement is met — e.g. "Given X, when Y, then the system returns Z"] |

**Orphaned requirements (no journey stage):** [none / list FR-xx with resolution]

---

## Section 6 — Business Rules

| Rule ID | Category | Rule Statement | Triggering Requirement | Lifecycle | AC Count |
|---------|----------|---------------|----------------------|-----------|----------|
| [BR-001] | [Validation / Calculation / Eligibility / State / Policy / Integration] | [precise rule statement] | [FR-xxx] | [New / Modified / Retained / Deprecated] | [N ACs] |

**Orphaned rules (no triggering requirement):** [none / list BR-xx with resolution]

**Rules with missing ACs:** [none / list BR-xx — logged in Section 11]

---

## Section 7 — Data Requirements

### Information Types

| Information Type | Business Purpose | Source / Owner | Lifecycle | Referenced in |
|-----------------|-----------------|---------------|-----------|--------------|
| [plain-English name] | [what it represents in business terms] | [source system or team] | [New / Modified / Existing (unchanged)] | [FR-xxx, BR-xxx] |

### Information Elements

| Element | Information Type | Business Description | Business Constraint | Required / Conditional | Sensitivity | Notes |
|---------|-----------------|---------------------|--------------------| ----------------------|-------------|-------|
| [plain-English element name] | [information type name] | [what it represents in business terms] | [BR-xxx or "No constraint"] | [Required / Conditional — when (condition)] | [PII / internal-only / public] | |

**Orphaned information types (no requirement reference):** [none / list information types with resolution]

---

## Section 8 — Permissions & Access Control

> *Summary view. The full permissions-access-control artifact is the authoritative source for enforcement points, ACR conditions, session lifecycle, and audit detail.*

### Authentication & Authorization Model

| Field | Value |
|-------|-------|
| **Authentication mechanism** | [SSO / federated identity / username-password / shared key / other] |
| **Identity provider** | [IdP name or "Internal"] |
| **Authorization model** | [role-based / attribute-based / ownership-based / custom] |
| **Enforcement point** | [business-level boundary responsible for authorization decisions] |
| **Identity provider unavailable** | [Fail-closed: all access denied / Fallback: describe] |

### Resource Sensitivity Classification

| Resource | Sensitivity Tier |
|----------|-----------------|
| [resource name] | [Public / Internal / Confidential / Restricted] |

### Role Definitions

| Role | Scope | Sensitivity Tier | Maps to Persona | Status |
|------|-------|-----------------|----------------|--------|
| [role name] | [all data / own branch / own account] | [Public / Internal / Confidential / Restricted] | [P-xx] | [Existing / Modified / New] |

> Machine identities (service accounts, API clients, background jobs) are defined in the full artifact.

### Permission Matrix

| Role | Action | Resource | Permission | Condition | Enforcement Point | Req Ref |
|------|--------|----------|-----------|-----------|------------------|---------|
| [role or machine identity] | [create / read / update / delete / execute / export] | [business object / screen / capability — plain English] | [Allow / Deny] | [unconditional / ACR-NNN] | [business-level boundary] | [FR-xxx] |

> **Default deny:** Any combination not listed is **Denied**.

### Access Control Rules

| Rule ID | Description | Condition | Effect | Enforcement Point | Source |
|---------|-------------|-----------|--------|------------------|--------|
| [ACR-001] | [rule name] | [when this rule applies] | [deny / restrict / escalate] | [where evaluated] | [constraint register / business rule / regulatory] |

### Denied Access Behavior

| Scenario | What the User Experiences | What the Business Expects to Happen |
|----------|--------------------------|-------------------------------------|
| Unauthenticated access | [login prompt / error page — describe the experience] | [Attempt is recorded; user is redirected to sign in] |
| Insufficient role | [access denied message — describe what the user sees] | [Denied attempt is recorded for audit] |
| Data-level restriction — resource out of scope | [access denied or resource hidden — see full artifact for decision] | [Filtered access attempt is recorded for audit] |
| Data-level restriction — filtered result | ["no results" state] | [Query filtering is recorded] |

### Audit Requirements Summary

| Event Type | What Must Be Recorded | Retention Period | Regulatory Driver |
|-----------|----------------------|-----------------|-------------------|
| Successful access to sensitive data | Who accessed what, when, and the outcome | [period] | [regulation and article/requirement number] |
| Denied access attempt | Who was denied, what they tried to access, when, and why | [period] | [driver] |
| Role provisioning / deprovisioning | Who was given/lost what role, when, and who approved or what triggered it | [period] | [driver] |

> Full audit event detail and delegation/break-glass events are in the full artifact.

**Permissions referencing undefined roles:** [none / list with resolution]

---

## Section 9 — Non-Functional Requirements

| NFR ID | Category | NFR Statement | Baseline | Target | Measurement Method | Applies To | Constraint Ref |
|--------|----------|--------------|----------|--------|--------------------|-----------|----------------|
| [NFR-001] | [Performance / Scalability / Availability / Security / Compliance / Monitoring & Reporting / Usability] | [specific, measurable quality target] | [current measured value or "Not measured"] | [target value with unit] | [how it will be tested or monitored] | [FR-xxx or capability / workflow name] | [constraint row # from Section 10 that bounds this target, or "None"] |

**NFRs referencing undefined system elements:** [none / list with resolution]

**NFRs with missing ACs:** [none / list NFR-xx — logged in Section 11]

---

## Section 10 — Assumptions, Constraints & Scope

### Assumptions

| # | Assumption | Owner | Validation Deadline | Impact if Wrong |
|---|-----------|-------|--------------------|----|
| 1 | [assumption statement] | [name or role] | [date or milestone] | [consequence] |

### Constraints

| # | Constraint | Type | Hard / Soft | Source | What It Rules Out |
|---|-----------|------|:-----------:|--------|------------------|
| 1 | [constraint statement] | [Compatibility / Performance / Data / Regulatory / Operational / Organisational] | [Hard — eliminates approaches or creates a non-negotiable bound / Soft — sets a preference or default that can be overridden with justification] | [source artifact or stakeholder] | [what approaches or requirements this eliminates] |

### Scope Exclusions

| ID | Type | Excluded Item | Decision Maker | Rationale | Revisit Condition |
|----|------|--------------|---------------|-----------|------------------|
| [EX-001] | [Out of scope / Must not touch] | [what is explicitly excluded or must not be altered] | [name or role] | [why it was excluded or preserved] | [condition under which it could be re-scoped, or "Not applicable"] |

---

## Section 11 — Package Status

### Self-Review

| Item | Status |
|------|--------|
| Package completeness status | Ready |
| Completeness review date | [date] |
| Issues resolved before assembly | [count or "None"] |

### Cross-Artifact Reconciliation

| Check | Result | Notes |
|-------|--------|-------|
| Scope boundary consistency | Pass / Fail | |
| Persona coverage | Pass / Fail | |
| Objective traceability | Pass / Fail | |
| Journey-to-requirement alignment | Pass / Fail | |
| Rule-to-requirement alignment | Pass / Fail | |
| Data-to-requirement alignment | Pass / Fail | |
| Permission-to-actor alignment | Pass / Fail | |
| NFR scope alignment | Pass / Fail | |
| Assumption consistency | Pass / Fail | |
| Constraint consistency | Pass / Fail | |
| FR AC coverage | Pass / Fail | |
| Business rule AC coverage | Pass / Fail | |
| Data AC coverage | Pass / Fail | |
| Permission AC coverage | Pass / Fail | |
| NFR AC coverage | Pass / Fail | |
| Error-path AC coverage | Pass / Fail | |

### Traceability Summary

| Chain | Orphans Found | Resolved | Outstanding |
|-------|:------------:|:--------:|:-----------:|
| Objectives → Journeys | [count] | [count] | [count] |
| Journeys → Functional Requirements | [count] | [count] | [count] |
| Functional Requirements → Business Rules | [count] | [count] | [count] |
| Functional Requirements → Information Types | [count] | [count] | [count] |
| Functional Requirements → Permissions | [count] | [count] | [count] |
| Functional Requirements → NFRs | [count] | [count] | [count] |

### Outstanding Issues

| # | Issue | Type | Blocking? | Resolution |
|---|-------|------|:---------:|-----------|
| 1 | [gap, contradiction, or orphan description] | [Gap / Contradiction / Orphan] | Yes / No | [resolved / owner and deadline] |

*If no outstanding issues, write: No outstanding issues — package is ready for formal review.*

---

## Section 12 — Change Tracker

> Drawn from `requirements/change-tracker.md`. Provides downstream consumers (architects, AI agents, reviewers) with a structured change history so they can identify exactly what changed between package versions without re-reading all sections.

### Package Version Log

| Version | Date | Trigger | Summary | Assembled by |
|---------|------|---------|---------|-------------|
| [v0.1] | [date] | [Initial assembly / Review correction / Stakeholder revision / Post-handoff amendment] | [1–2 sentence summary] | [name or role] |

### Change Register (This Version)

> Full register is in the standalone change-tracker artifact. This section includes entries for the current package version only.

| CHG ID | Date | Artifact | Item ID | Change Type | Description | Trigger | Authorized By | Impact |
|--------|------|----------|---------|-------------|-------------|---------|---------------|--------|
| [CHG-001] | [date] | [artifact name] | [ID or —] | [Added / Modified / Removed / Deferred / Reinstated] | [what changed] | [trigger] | [name/role] | [impacted IDs or None] |

### Version Diff Summary

> Produced by the synthesiser at assembly time. Enables downstream consumers to act on changes without re-reading the entire package.

**Items added:** [count]

| Artifact | Item ID | Description |
|----------|---------|-------------|
| [artifact] | [ID] | [what was added] |

*None — no items added in this version.*

**Items modified:** [count]

| Artifact | Item ID | Field Changed | Previous Value | New Value |
|----------|---------|--------------|----------------|-----------|
| [artifact] | [ID] | [field] | [old] | [new] |

*None — no items modified in this version.*

**Items removed or deferred:** [count]

| Artifact | Item ID | Change Type | Reason |
|----------|---------|-------------|--------|
| [artifact] | [ID] | [Removed / Deferred] | [why] |

*None — no items removed or deferred in this version.*

**Impact chain (cross-artifact):**

| Source Change | Impacted Item | Impact Confirmed |
|--------------|--------------|:----------------:|
| [CHG-xxx → Item ID] | [Item ID in another artifact] | Yes / No / Pending |

*None — no cross-artifact impacts in this version.*

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| [date] | Initial package assembled | |
