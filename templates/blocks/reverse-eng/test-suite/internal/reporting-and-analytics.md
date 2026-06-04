---
slug: reporting-and-analytics
title: "Reporting and Analytics"
applies-to: [re-test-suite-internal]
requires-decision-from: [code-reader, qe-analyst]
optional: false
order-hint: 230
---

## 13. Reporting and Analytics

Document every report the suite emits, where it lands, who consumes it, and how long it's retained. This is the bridge between "the suite passed" and "stakeholders know it passed" — undocumented reports get ignored, and ignored reports decay until nobody trusts them.

Pin the report formats and paths exactly — they're consumed by the quality package's `automation-and-cicd` block, by CI dashboards, and by the `review-test-failures` skill during triage. Format drift here breaks all three.

### Suggested template content

**Reports emitted per run:**

| Report | Path / format | Audience | Retention | Consumed by |
|---|---|---|---|---|
| HTML report | `{{html-path}}` (per-run subdir) | Developers, QE engineers | CI artifact, 30 days | Manual inspection, `review-test-failures` |
| JUnit XML | `{{junit-path}}` | CI dashboard | CI artifact, 90 days | `{{ci-dashboard}}` (e.g. ReportPortal, TestRail, native CI) |
| JSON results | `{{json-path}}` | Tooling / scripts | CI artifact, 30 days | `audit-quality-coverage`, custom dashboards |
| Trace files | `{{trace-path}}` | Failure triage | CI artifact, 14 days; failures only | `review-test-failures`, manual debug |
| Screenshots | `{{screenshot-path}}` | Failure triage | CI artifact, 14 days; failures only | `review-test-failures` |
| Videos | `{{video-path}}` | Failure triage | CI artifact, 14 days; gated by `{{video-flag}}` | `review-test-failures` |

**Aggregated dashboards (cross-run):**

| Dashboard | Source data | URL | Owner |
|---|---|---|---|
| Pass-rate trend | JUnit XML | `{{dashboard-url-1}}` | QE lead |
| Duration trend | JSON results | `{{dashboard-url-2}}` | QE lead |
| Flake rate | Run-history DB | `{{dashboard-url-3}}` | QE lead |
| Coverage roll-up | spec-feature-inventory + JSON results | `{{dashboard-url-4}}` | `audit-quality-coverage` |

**Reporting hooks / integrations:**

| Integration | Purpose | Configured in |
|---|---|---|
| `{{slack-integration}}` | Post-run summary to `#{{channel}}` | `{{config-path-1}}` |
| `{{jira-integration}}` | Auto-link failing scenarios to bug tickets | `{{config-path-2}}` |
| `{{kb-integration}}` | Update the test-suite KB component with current pass-rate | `{{config-path-3}}` |

**Trace / screenshot policy:**

- Captured ONLY on failure by default (cost control).
- Captured on every run when `{{always-trace-flag}}` is set (for diagnosing flakes).
- Uploaded to `{{trace-store}}` for `{{retention-days}}` days; older traces are auto-pruned.

**Privacy note:** {{privacy — e.g. "Screenshots and videos may capture seeded fixture data; they MUST NOT capture real-user data. The QA / stage environments use synthetic identities only — verified by the data-steward."}}

