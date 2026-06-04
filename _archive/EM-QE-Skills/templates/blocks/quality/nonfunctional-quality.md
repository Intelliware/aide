---
slug: nonfunctional-quality
title: "Non-Functional Quality"
applies-to: [greenfield-quality-package]
requires-decision-from: [tester, architect]
optional: true
order-hint: 6
---

## 6. Non-Functional Quality

How performance, security, accessibility, and reliability are validated. Each
row traces to a technical NFR or the security design in the design package.

| NFR dimension | Target | How validated | Traces to |
|---|---|---|---|
| Performance | [e.g., settlement batch < 10 min for 1M rows] | [Nightly perf suite] | [NFR-PERF-1] |
| Security | [e.g., no secret material in logs] | [Static scan + security test] | [NFR-SEC-2 / security design] |
| Accessibility | [e.g., WCAG 2.2 AA on refund UI] | [axe automated + manual audit] | [NFR-A11Y-1] |
| Reliability | [e.g., saga recovers from partner timeout] | [Fault-injection integration test] | [NFR-REL-1] |

This block is optional and is omitted (recorded `N/A` in the change tracker)
when the feature has no non-functional requirements in scope.
