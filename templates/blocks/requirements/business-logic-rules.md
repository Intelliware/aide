---
slug: business-logic-rules
title: "Business Logic & Rules"
applies-to: [greenfield-requirements-package, brownfield-enhancement-spec, quick-dev-spec]
requires-decision-from: [product-owner, stakeholder]
optional: false
order-hint: 6
---

<!--
AUTHORING RULE — sub-section acknowledgement

Do not draft this entire block in one pass. The block contains multiple independent items (FRs / rules / endpoints / tables). For each item:

1. State the item heading and one-sentence scope.
2. Draft the item.
3. Present it to the user.
4. Ask: "Approve, change, or skip?"
5. Apply the answer; do not move to the next item until you have one.

Only after every item has its own acknowledgement, mark the block complete in the completeness tracker.
-->

# 6. Business Logic & Rules

> **Part of:** [Project Name] — Requirements Package
>
> **Purpose:** Document the rules that govern system behavior. These become validation logic, calculations, and workflows in the implementation. Organized by functional area.

---

## 6.1 [Area] Business Rules

<!-- Format each rule clearly so it can be directly implemented in any technology. -->

| Rule ID | Rule | Applies To | Enforcement |
|---------|------|-----------|-------------|
| BR1.1 | [e.g., Allocation percentage must be between 1% and 100%] | [e.g., Allocation creation/edit] | [e.g., Validation on save] |
| BR1.2 | [e.g., A practitioner cannot be allocated to the same project twice for overlapping dates] | [e.g., Allocation creation] | [e.g., Pre-save check] |
| | | | |

## 6.2 Calculations & Formulas

<!-- Document any business calculations. Be precise — these become code. -->

| Calculation | Formula | Inputs | Output | Example |
|------------|---------|--------|--------|---------|
| [e.g., Utilization Rate] | [e.g., (Total Allocated Hours / Total Available Hours) × 100] | [e.g., Allocated %, date range] | [e.g., Percentage] | [e.g., 80hrs/100hrs = 80%] |
| | | | | |

## 6.3 Validation Rules

<!-- Input validation rules that apply across the system. -->

| Field/Entity | Rule | Error Message |
|-------------|------|---------------|
| [e.g., Email] | [e.g., Must be valid email format, case-insensitive unique] | [e.g., "Email address is already in use"] |
| [e.g., Start Date] | [e.g., Cannot be in the past] | [e.g., "Start date must be today or later"] |
| | | |

## 6.4 State Transitions

<!-- Document valid state changes for entities with status/lifecycle. -->

**[Entity Name, e.g., Allocation] State Machine:**

```
[Initial State] → [Action] → [Next State]

e.g.:
Provisional → Approve → Approved
Provisional → Reject → Rejected
Approved → Release → Released
```

| Current State | Action | Next State | Who Can Perform | Conditions |
|--------------|--------|-----------|----------------|------------|
| [e.g., Provisional] | [e.g., Approve] | [e.g., Approved] | [e.g., Resource Manager] | [e.g., None] |
| | | | | |
