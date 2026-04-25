# Dependency Map

> **Project:** [project name]
> **Change request:** [brief description]
> **Date mapped:** [date]
> **Change scope reference:** [link or filename of change-scope document]

> **If baseline is absent** (discovery was skipped): all readiness claims are assumptions — see assumption-log. Every status except `Gap` is provisional until verified with the named owner. Record baseline absence here.
> **If baseline is stale** (>6 months or >2 significant releases): readiness claims are provisional — flagged as assumptions in the assumption-log.

---

## Dependencies by Type

### Internal Capability Dependencies

Business capabilities within the existing system the feature must use.

| ID | Requirement | Capability | Purpose for Feature | Current State | Criticality | Readiness | Owner | Decision Logged | Escalations | Notes |
|----|-------------|-----------|--------------------|--------------| ------------|-----------|-------|----------------|------------|-------|
| DEP-001 | [REQ-xxx] | [e.g., Payment processing] | [why the feature needs this] | [what it currently supports — confirm with owner; record "Confirmed ready by [name], [date]" if Ready] | [Critical / Non-critical — if conditional, record condition] | [Ready / Needs extension / At risk / Gap / Uncertain] | [team or named person] | [DECISION-xxx if Needs extension — or "None"] | [gap-analysis / risk-analysis / assumption-log — or "None"] | [cross-references, overlap flags, transitive dependencies, conditional path details — or "None"] |

### Data Dependencies

Data sets or data entities the feature must read from or write to.

| ID | Requirement | Data Set / Entity | Access Type | Current State | Criticality | Readiness | Owner | Decision Logged | Escalations | Notes |
|----|-------------|------------------|-------------|--------------|-------------|-----------|-------|----------------|------------|-------|
| DEP-010 | [REQ-xxx] | [e.g., Order history dataset] | [Read / Write / Read+Write] | [what data is currently available and in what shape] | [Critical / Non-critical] | [Ready / Needs extension / At risk / Gap / Uncertain] | [team] | [DECISION-xxx or "None"] | [gap-analysis / risk-analysis / assumption-log — or "None"] | [None] |

### Process / Workflow Dependencies

Scheduled or automated processes the feature must trigger, subscribe to, or coordinate with.

| ID | Requirement | Process / Workflow | Interaction | Current Capability | Criticality | Readiness | Owner | Decision Logged | Escalations | Notes |
|----|-------------|-------------------|-------------|------------------|-------------|-----------|-------|----------------|------------|-------|
| DEP-020 | [REQ-xxx] | [e.g., Order fulfilment workflow] | [Triggers / Subscribes to / Coordinates with] | [what it currently does] | [Critical / Non-critical] | [Ready / Needs extension / At risk / Gap / Uncertain] | [team] | [DECISION-xxx or "None"] | [gap-analysis / risk-analysis / assumption-log — or "None"] | [None] |

### Shared Capability Dependencies

Existing platform capabilities the feature reuses rather than rebuilds.

| ID | Requirement | Shared Capability | Purpose for Feature | Current State | Criticality | Readiness | Owner | Decision Logged | Escalations | Notes |
|----|-------------|------------------|--------------------|--------------| ------------|-----------|-------|----------------|------------|-------|
| DEP-030 | [REQ-xxx] | [e.g., PDF generation service] | [how the feature uses it] | [what it currently supports] | [Critical / Non-critical] | [Ready / Needs extension / At risk / Gap / Uncertain] | [team] | [DECISION-xxx or "None"] | [gap-analysis / risk-analysis / assumption-log — or "None"] | [None] |

### Access Control Dependencies

Authentication mechanisms and permission checks the feature must satisfy.

| ID | Requirement | Access Control Element | What the Feature Requires | Current Behaviour | Criticality | Readiness | Owner | Decision Logged | Escalations | Notes |
|----|-------------|----------------------|--------------------------|-------------------|-------------|-----------|-------|----------------|------------|-------|
| DEP-040 | [REQ-xxx] | [e.g., Admin role gate] | [what the feature requires] | [what it currently enforces] | [Critical / Non-critical] | [Ready / Needs extension / At risk / Gap / Uncertain] | [team] | [DECISION-xxx or "None"] | [gap-analysis / risk-analysis / assumption-log — or "None"] | [None] |

### UI Dependencies

Shared navigation, page layouts, or design system components the feature integrates with.

| ID | Requirement | Screen / Navigation Area | Connection Point | Current State | Criticality | Readiness | Owner | Decision Logged | Escalations | Notes |
|----|-------------|--------------------------|-----------------|--------------|-------------|-----------|-------|----------------|------------|-------|
| DEP-050 | [REQ-xxx] | [e.g., Main navigation shell] | [how the feature connects] | [what it currently provides] | [Critical / Non-critical] | [Ready / Needs extension / At risk / Gap / Uncertain] | [team] | [DECISION-xxx or "None"] | [gap-analysis / risk-analysis / assumption-log — or "None"] | [None] |

### External Dependencies

Third-party systems, partner integrations, or SaaS platforms the feature will call.

| ID | Requirement | External System | Purpose | Current State | Criticality | Readiness | Owner | Decision Logged | Escalations | Notes |
|----|-------------|----------------|---------|--------------|-------------|-----------|-------|----------------|------------|-------|
| DEP-060 | [REQ-xxx] | [e.g., Payment service] | [what the feature needs from it] | [what it currently supports] | [Critical / Non-critical] | [Ready / Needs extension / At risk / Gap / Uncertain] | [team or vendor] | [DECISION-xxx or "None"] | [gap-analysis / risk-analysis / assumption-log — or "None"] | [None] |

### Business Logic Dependencies

Existing business rules, calculation methods, or validation logic the feature must reuse rather than duplicate.

| ID | Requirement | Business Logic Element | Purpose for Feature | Current State | Criticality | Readiness | Owner | Decision Logged | Escalations | Notes |
|----|-------------|----------------------|--------------------|--------------| ------------|-----------|-------|----------------|------------|-------|
| DEP-070 | [REQ-xxx] | [e.g., Pricing calculation rules] | [how the feature uses them] | [what they currently calculate or validate] | [Critical / Non-critical] | [Ready / Needs extension / At risk / Gap / Uncertain] | [team] | [DECISION-xxx or "None"] | [gap-analysis / risk-analysis / assumption-log — or "None"] | [None] |

### Restricted Dependencies (Negative Dependencies)

Existing system elements the feature must explicitly **not** use — legacy components, deprecated services, or stakeholder-prohibited elements.

| ID | Element | Reason for Exclusion | Prohibited By | Notes |
|----|---------|---------------------|--------------|-------|
| DEP-080 | [e.g., Legacy orders database] | [why the feature must not use this] | [stakeholder instruction / deprecation policy / ADR-xxx] | [None] |

---

## Readiness Summary

| Status | Count | IDs |
|--------|-------|-----|
| Ready | | |
| Needs extension (→ log in decision-log; discuss scope with BSA) | | |
| At risk (→ log timeline; assess before/after feature ship date) | | |
| Gap (→ escalate to gap-analysis) | | |
| Uncertain (→ log in assumption-log with named owner and deadline) | | |

---

## Scope Feedback

Dependencies requiring extension that may affect the change-scope in-scope list.

| Dependency ID | Extension Needed | Proposed Change-Scope Impact | Decision Required From |
|--------------|-----------------|------------------------------|----------------------|
| DEP-xxx | [what needs to be added or changed — in functional terms] | [SC-xxx or new item] | [BSA / Accountable stakeholder] |

---

## Cross-Team Dependencies

Dependencies owned by another team — escalate to risk-analysis.

| Dependency ID | Capability / Service | Owner Team | Nature of Dependency | Readiness | Escalated to Risk? |
|--------------|---------------------|------------|---------------------|-----------|-------------------|
| DEP-xxx | | | [what coordination is required] | | [Yes — RISK-xxx / No] |
