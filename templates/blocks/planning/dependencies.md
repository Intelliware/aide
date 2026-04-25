---
slug: dependencies
title: "Dependencies"
applies-to: [greenfield-implementation-package]
requires-decision-from: [lead-dev]
optional: false
order-hint: 3
---

## Dependencies

Part of the **Canonical Increment Shape**.

**Format:**

```
#### Dependencies

INC-XXX [Increment Name]
INC-YYY [Increment Name]
```

**Rules:**

- List all increments that must complete before this increment can start
- Use Increment IDs (e.g., INC-002)
- If no dependencies, state: `None`
- Dependencies should reference Increment IDs, not increment numbers

**Example:**

```
#### Dependencies

INC-001.1 DB/ORM Core Platform
```
