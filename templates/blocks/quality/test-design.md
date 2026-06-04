---
slug: test-design
title: "Test Design"
applies-to: [greenfield-quality-package]
requires-decision-from: [tester]
optional: false
order-hint: 3
---

## 3. Test Design

Concrete test cases per level. Every case must be deterministic and
independently runnable, and must trace to an acceptance criterion, FR, NFR, or
`INC-XXX` increment (recorded in the Traceability section).

| Test ID | Level | Preconditions | Action | Expected result | Traces to | INC |
|---|---|---|---|---|---|---|
| QT-01 | [unit] | [e.g., refund amount <= captured amount] | [Compute partial refund] | [Refund = requested; remaining updated] | [AC-3] | [INC-002] |
| QT-02 | [integration] | [Partner sandbox reachable] | [Submit refund to partner] | [202 + saga state = pending] | [AC-5] | [INC-004] |
| | | | | | | |

### 3.1 Coverage exceptions

Increments with no mapped test coverage must be listed here with an explicit,
user-accepted reason.

| INC | Reason for exception | Accepted by |
|---|---|---|
| [e.g., INC-006] | [Read-only view, no money-movement risk; smoke only] | [user] |
