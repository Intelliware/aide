---
slug: defect-management
title: "Defect Management"
applies-to: [greenfield-quality-package]
requires-decision-from: [tester, qa-analyst]
optional: false
order-hint: 7
---

## 7. Defect Management

Defects found during execution are logged and triaged via `manage-bugs`, not
inline. This section defines the severity model and triage flow the feature
uses.

### 7.1 Severity model

| Severity | Definition | Gate impact |
|---|---|---|
| Critical | [Data loss, money movement wrong, security breach] | [Blocks release] |
| High | [Core flow broken, no workaround] | [Blocks release] |
| Medium | [Degraded behavior, workaround exists] | [Fix or accept with note] |
| Low | [Cosmetic, minor] | [Backlog] |

### 7.2 Triage flow

- Where defects are logged: `bugs-and-issues-log.md` via `manage-bugs`.
- Who triages and how often: [e.g., per increment, by tester + dev].
- Re-test policy: [e.g., every fixed defect gets a regression case added to
  Test Design].
