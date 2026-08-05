---
slug: ops-slos-and-monitoring
title: "Operations — SLOs & Monitoring (KB)"
applies-to: [kb-instance]
requires-decision-from: [sre, product]
optional: false
order-hint: 72
---

```yaml
---
operations_id: 20-slos-and-monitoring
description: >-
  Use when setting an SLO target, evaluating an error-budget burn, or
  routing an alert.
triggers:
  - SLO
  - SLI
  - SLA
  - error budget
  - monitoring
  - dashboard
  - alert
last_captured: {{capture_date}}
last_captured_by: {{captured_by}}
---
```

# {{project_name}} — SLOs & Monitoring

## 1. SLOs

| Name | Target | SLI definition | Measurement tool | Status | Owner |
|---|---|---|---|---|---|
{{slo_rows}}

`Status` is one of: `measured` / `aspirational`. Aspirational rows
must include a TODO comment naming the team responsible for setting
up measurement.

## 2. Error-Budget Policy

{{error_budget_policy}}

## 3. Alert Routing

| Alert | Severity | Paging tool | On-call tier | Escalation |
|---|---|---|---|---|
{{alert_rows}}

## 4. Dashboards

| Dashboard | Link | Owner |
|---|---|---|
{{dashboard_rows}}

## 5. Cross-links

- Constraints (SLAs): [`../solution-context/30-constraints-and-compliance.md`](../solution-context/30-constraints-and-compliance.md) § 2
- KPIs: [`../solution-context/20-goals-and-kpis.md`](../solution-context/20-goals-and-kpis.md)
- On-call: [`30-runbooks-and-oncall.md`](./30-runbooks-and-oncall.md)
