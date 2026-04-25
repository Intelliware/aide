---
slug: functional-specifications
title: "Functional Specifications"
applies-to: [greenfield-requirements-package, brownfield-enhancement-spec, quick-dev-spec]
requires-decision-from: [product-owner, lead-dev]
optional: false
order-hint: 5
---

# 5. Functional Specifications

> **Part of:** [Project Name] — Requirements Package
>
> **Purpose:** Define HOW functional requirements are implemented at the workflow level. Each specification traces back to one or more FRs. Focus on process flows, inputs/outputs, and system behavior — NOT UI details or technology choices.

---

## FS1: [Workflow Name, e.g., Create Allocation Request]

**Implements:** FR3.1.1, FR3.1.2

**Trigger:** [What initiates this workflow — e.g., User clicks "Request Allocation"]

**Preconditions:**
- [e.g., User has Delivery Manager role]
- [e.g., Project exists and is active]

**Process Flow:**

1. [Step 1 — e.g., User selects practitioner and project]
2. [Step 2 — e.g., System validates availability]
3. [Step 3 — e.g., System checks for over-allocation conflicts]
4. [Step 4 — e.g., System creates allocation request with "Provisional" status]
5. [Step 5 — e.g., System notifies Resource Manager for approval]

**Outputs:**
- [e.g., Allocation record created in "Provisional" status]
- [e.g., Notification sent to Resource Manager]

**Error Conditions:**
- [e.g., If practitioner is inactive → display error, prevent creation]
- [e.g., If date range overlaps existing allocation at >100% → display warning]

<!-- Repeat for each significant workflow -->
