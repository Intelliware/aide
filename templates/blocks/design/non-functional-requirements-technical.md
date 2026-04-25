---
slug: non-functional-requirements-technical
title: "Non-Functional Requirements (Technical)"
applies-to: [greenfield-design-package, brownfield-enhancement-spec]
requires-decision-from: [architect, ops, security]
optional: false
order-hint: 16
---

## 16. Non-Functional Requirements (Technical)

<!-- Technical specifications for non-functional requirements from the Requirements Package. -->

### 16.1 Performance Targets

| Metric | Target | Measurement | Requirement Ref |
|--------|--------|-------------|----------------|
| [e.g., Page load] | [e.g., < 2s] | [e.g., Lighthouse score] | [NFR-1] |
| [e.g., API P95 latency] | [e.g., < 500ms] | [e.g., APM monitoring] | [NFR-2] |
| | | | |

### 16.2 Scalability Design

[How the system scales to meet growth requirements.]

### 16.3 Availability Design

- **Target SLA:** [e.g., 99.5%]
- **Approach:** [e.g., Azure-managed HA for database, multiple container instances]
- **Maintenance Windows:** [e.g., Sundays 2-6 AM]
