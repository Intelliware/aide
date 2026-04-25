---
slug: increment-identity
title: "Increment Identity"
applies-to: [greenfield-implementation-package]
requires-decision-from: [lead-dev, architect]
optional: false
order-hint: 1
---

## Increment Identity

Part of the **Canonical Increment Shape**.

**Format:**

```
#### Increment Identity

**Increment ID**: INC-XXX (or INC-XXX.Y for sub-increments)
**Increment Name**: [Descriptive Name]
**FR Mapping**:
- FR-X.Y.Z [Requirement description]
- FR-X.Y.Z [Requirement description]
- ...
```

**Rules:**

- Increment IDs must be sequential and unique
- Increment Names should be descriptive (e.g., "Allocation Creation (API-only)")
- **FR Mapping is MANDATORY** — every increment must list at least one FR, unless explicitly foundational
- Foundational increments must state: `FR Mapping: None (foundational)`
- FRs must appear exactly as authored (IDs and names unchanged)
- An increment may implement partial FRs, but must list them explicitly
- An FR may appear in multiple increments if implementation is incremental

**Example:**

```
#### Increment Identity

**Increment ID**: INC-002
**Increment Name**: Security Baseline (API-only)
**FR Mapping**:

- FR1.9.1 Single Sign-On support
- FR1.9.2 Microsoft Entra ID integration
- FR1.9.4 Role-based access control enforcement
```
