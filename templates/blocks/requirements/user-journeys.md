---
slug: user-journeys
title: "User Journeys"
applies-to: [greenfield-requirements-package, brownfield-enhancement-spec]
requires-decision-from: [product-owner, stakeholder]
optional: false
order-hint: 7
---

# 7. User Journeys

> **Part of:** [Project Name] — Requirements Package
>
> **Purpose:** Document how users interact with the system end-to-end. Journeys connect functional requirements, business rules, and personas into coherent workflows. Focus on WHAT the user does and WHY, not UI specifics.

---

## 7.1 Journey Framework

<!-- Standard structure for each journey. -->

Each journey follows this structure:
- **Persona:** Who is performing this journey
- **Goal:** What they want to accomplish
- **Trigger:** What initiates the journey
- **Steps:** Numbered sequence of actions
- **Outcome:** What the user has achieved at the end
- **Related FRs:** Which functional requirements this journey exercises

## 7.2 [Persona] Journeys

### Journey: [Journey Name, e.g., "Rachel assigns a resource to a project"]

- **Persona:** [e.g., Rachel — Resource Manager]
- **Goal:** [e.g., Assign the best available practitioner to a project request]
- **Trigger:** [e.g., Receives notification of new allocation request]

**Steps:**
1. [e.g., Reviews pending allocation requests in dashboard]
2. [e.g., Opens request details to see project requirements and requested practitioner]
3. [e.g., Checks practitioner's current allocations and availability]
4. [e.g., Approves or rejects the request with comments]
5. [e.g., System updates allocation status and notifies requester]

- **Outcome:** [e.g., Allocation is approved and visible in both project and practitioner views]
- **Related FRs:** [e.g., FR3.1.1, FR3.2.1, FR3.2.5]

<!-- Repeat for each significant journey per persona -->

## 7.3 Cross-Functional Journeys

<!-- Journeys that involve multiple personas working together. -->

### Journey: [Journey Name, e.g., "End-to-end resource allocation from request to assignment"]

- **Personas Involved:** [e.g., Delivery Manager, Resource Manager, Practitioner]
- **Goal:** [e.g., Fill an open project role with the right practitioner]

**Steps:**
1. [Persona A] — [Action]
2. [Persona B] — [Action]
3. [System] — [Automated action]
4. [Persona C] — [Action]
