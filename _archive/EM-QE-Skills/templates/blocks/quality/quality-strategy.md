---
slug: quality-strategy
title: "Quality Strategy"
applies-to: [greenfield-quality-package]
requires-decision-from: [tester, qa-analyst, product-owner]
optional: false
order-hint: 1
---

## 1. Quality Strategy

### 1.1 Quality goals

State measurably what "good" means for this feature.

| # | Quality goal | Measure |
|---|---|---|
| 1 | [e.g., Refund correctness provable end-to-end] | [e.g., 100% of money-movement ACs automated] |
| 2 | [e.g., No sensitive data in logs or fixtures] | [e.g., Zero PAN matches in log/fixture scan] |

### 1.2 Risk-based scope

Rank scope by risk; heaviest coverage goes to the highest-risk paths.

| Area | Risk (H/M/L) | Coverage intensity | Rationale |
|---|---|---|---|
| [e.g., Partner clearing-house integration] | [High] | [Heavy: contract + E2E] | [Money movement, external dependency] |
| [e.g., Static content] | [Low] | [Smoke only] | [No state change] |

### 1.3 Entry and exit criteria

- **Entry:** [e.g., implementation package is GO; test environment available]
- **Exit:** [e.g., all release gates in 1.4 pass]

### 1.4 Release gates

Each gate must be measurable and binary, and must map to a CI check in the
Automation and CI/CD section.

| # | Release gate | Threshold | Basis |
|---|---|---|---|
| 1 | [e.g., Changed-file line coverage] | [>= 80%] | [testing_strategy] |
| 2 | [e.g., Open Critical/High defects] | [= 0] | [release policy] |
