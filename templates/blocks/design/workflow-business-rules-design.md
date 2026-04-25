---
slug: workflow-business-rules-design
title: "Workflow & Business Rules Design"
applies-to: [greenfield-design-package, brownfield-enhancement-spec]
requires-decision-from: [architect, lead-dev, product-owner]
optional: true
order-hint: 10
---

## 10. Workflow & Business Rules Design

<!-- How business rules from Requirements translate to system behavior. -->

### 10.1 State Machines

<!-- Technical implementation of state transitions from Requirements. -->

#### [Entity] State Machine

```mermaid
stateDiagram-v2
    [*] --> Provisional : Create
    Provisional --> Approved : Approve
    Provisional --> Rejected : Reject
    Approved --> Released : Release
```

**Transition Rules:**

| From | To | Action | Required Role | Side Effects |
|------|-----|--------|--------------|-------------|
| [Provisional] | [Approved] | [Approve] | [Resource Manager] | [e.g., Notify requester, update availability] |
| | | | | |

### 10.2 Business Rule Implementation

<!-- Map business rules from Requirements to technical implementation. -->

| Rule (from Requirements) | Implementation Approach | Location |
|-------------------------|------------------------|----------|
| [e.g., BR1.1 — Allocation 1-100%] | [e.g., Bean Validation @Min(1) @Max(100)] | [e.g., CreateAllocationRequest DTO] |
| [e.g., BR1.2 — No duplicate allocations] | [e.g., Service layer check before save] | [e.g., AllocationService.create()] |
| | | |
