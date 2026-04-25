---
slug: solution-overview
title: "Solution Overview"
applies-to: [greenfield-design-package, brownfield-enhancement-spec]
requires-decision-from: [architect, product-owner]
optional: false
order-hint: 1
---

## 1. Solution Overview

<!-- Executive-level view of the solution, bridging from business context to technical approach. This is the master document that ties everything together. -->

### 1.1 Executive Summary

<!-- Brief technical summary: what we're building, core technical approach, and key design decisions. Written for technical stakeholders. -->

[2-3 paragraphs summarizing the technical solution, its architecture, and how it addresses the business requirements.]

### 1.2 Business Context & Problem Statement

<!-- Brief recap from Requirements — enough context so this document stands on its own when loaded into an AI session. -->

- **Business Problem:** [One sentence from requirements]
- **Solution:** [One sentence describing the system]
- **Key Users:** [List primary personas from requirements]

### 1.3 Solution Vision & Scope

<!-- What the solution encompasses at a high level. -->

**In-Scope Capabilities:**

| # | Capability | Requirement Reference |
|---|-----------|----------------------|
| 1 | [e.g., Practitioner profile management] | FR1.1 |
| 2 | [e.g., Resource allocation workflow] | FR3.1 |
| | | |

**Explicitly Out of Scope:**

- [e.g., Mobile native application]
- [e.g., Third-party integrations beyond SSO]

### 1.4 High-Level Navigation / User Experience

<!-- Information architecture — what major areas exist and how they relate. Not UI design, but the conceptual structure. -->

```
[Application]
├── Dashboard (role-specific)
├── [Area 1, e.g., People]
│   ├── List View
│   └── Detail View
├── [Area 2, e.g., Projects]
│   ├── List View
│   └── Detail View
├── [Area 3, e.g., Allocations]
└── [Area 4, e.g., Administration]
```

### 1.5 Data Ownership & Source of Truth

<!-- Define where authoritative data lives. Critical for integration decisions. -->

| Data | Source of Truth | Notes |
|------|----------------|-------|
| [e.g., User identity] | [e.g., Microsoft Entra ID] | [e.g., JIT provisioned into local DB] |
| [e.g., Employee details] | [e.g., HR System] | [e.g., Synced nightly] |
| [e.g., Allocations] | [e.g., This system] | [e.g., Authoritative source] |

### 1.6 Assumptions, Constraints & Out of Scope

<!-- Technical assumptions and constraints that shape design decisions. -->

**Technical Assumptions:**
- [e.g., All users have modern browsers with JavaScript enabled]
- [e.g., Network latency to Azure services < 50ms]

**Technical Constraints:**
- [e.g., Must use corporate-approved technology stack]
- [e.g., Must deploy to Azure cloud]
- [e.g., Database must be managed PostgreSQL service]
