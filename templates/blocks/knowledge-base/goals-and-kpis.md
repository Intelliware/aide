---
slug: goals-and-kpis
title: "Goals & KPIs (KB)"
applies-to: [kb-instance]
requires-decision-from: [product]
optional: false
order-hint: 20
---

```yaml
---
solution_context_id: 20-goals-and-kpis
description: >-
  Use when prioritising work against measurable outcomes, defining a
  feature's success metric, or evaluating a trade-off between
  north-star and guardrail KPIs.
triggers:
  - goals
  - KPIs
  - metrics
  - success criteria
  - north star
  - guardrails
last_captured: {{capture_date}}
last_captured_by: {{captured_by}}
related_components: []
---
```

# {{project_name}} — Goals & KPIs

## 1. Outcomes

For each outcome from the value proposition, name the metric that
proves progress.

- {{outcome_1}} → tracked by {{outcome_1_metric_link}}
- {{outcome_2}} → tracked by {{outcome_2_metric_link}}

## 2. KPIs

| Name | Type | Definition | Baseline | Target | Horizon | Owner |
|---|---|---|---|---|---|---|
{{kpi_rows}}

`Type` is one of: north-star / guardrail / leading.

`Baseline` is either a measured value or `TODO(baseline)` with the
team responsible noted in a comment cell.

## 3. Trade-offs

Which guardrails the team is willing to accept while moving the
north-star, and which guardrails are non-negotiable.

- {{tradeoff_1}}
- {{tradeoff_2}}

## 4. Cross-references

| KPI | Linked components | Linked constraints |
|---|---|---|
{{kpi_cross_ref_rows}}
