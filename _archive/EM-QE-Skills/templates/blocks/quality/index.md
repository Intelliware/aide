---
slug: index
title: "Quality Package — Index"
applies-to: [greenfield-quality-package]
requires-decision-from: []
optional: false
order-hint: 0
---

# Quality Package: [Feature Name]

| Field | Value |
|---|---|
| Feature ID | [feature-id] |
| Author (role) | [Tester / QA] |
| Status | [Draft / In Review / Approved] |
| Requirements package version | [vX.Y] |
| Design package version | [vX.Y] |
| Implementation package version | [vX.Y] |

## Sections

1. Quality Strategy
2. Test Approach
3. Test Design
4. Test Data and Environments
5. Automation and CI/CD
6. Non-Functional Quality
7. Defect Management
8. Quality Metrics and Reporting
9. Traceability

This package states how the feature is proven correct before and during
execution. It is consumed by `execute-increments` (test design + gates) and
gated by `review-quality-package`.
