---
slug: quality-metrics-and-reporting
title: "Quality Metrics and Reporting"
applies-to: [greenfield-quality-package]
requires-decision-from: [qa-analyst, tester]
optional: false
order-hint: 8
---

## 8. Quality Metrics and Reporting

The KPIs tracked for this feature and where they are reported. Metrics feed the
release gates and are recorded to the knowledge base on ship via
`update-knowledge-base`.

| Metric | Definition | Target | Reported where |
|---|---|---|---|
| Test coverage | [Changed-file line coverage] | [>= 80%] | [CI summary] |
| Escaped-defect rate | [Defects found post-merge / total] | [< 5%] | [Quality dashboard] |
| Gate pass rate | [PRs passing all gates first try] | [>= 90%] | [CI summary] |
| Flaky-test rate | [Non-deterministic failures / runs] | [< 1%] | [CI summary] |

### 8.1 Reporting cadence

State when and to whom quality status is reported (e.g., per-increment summary
in `increment-status.md`, end-of-feature summary surfaced to the PR by
`create-pr`).
