---
slug: test-approach
title: "Test Approach"
applies-to: [greenfield-quality-package]
requires-decision-from: [tester, qa-analyst]
optional: false
order-hint: 2
---

## 2. Test Approach

### 2.1 Test levels in scope

| Level | In scope? | Responsible for proving | Notes |
|---|---|---|---|
| Unit | [Yes] | [Logic correctness in isolation] | [Smallest sufficient level preferred] |
| Integration | [Yes] | [Component + contract interactions] | [e.g., saga, partner API] |
| System / E2E | [Yes] | [User-facing happy + key error paths] | |
| Performance | [Yes/No] | [Throughput / latency under load] | [Tie to design NFRs] |
| Security | [Yes/No] | [Authn/authz, data protection] | [Tie to security design] |
| Accessibility | [Yes/No] | [WCAG conformance] | [If user-facing UI] |

### 2.2 Out of scope

List what is explicitly NOT tested in this package and why (e.g., third-party
library internals, deferred to a later increment).

- [Item] — [reason]
