---
slug: external-integrations
title: "External Integrations (KB)"
applies-to: [kb-instance]
requires-decision-from: [architect, procurement]
optional: false
order-hint: 40
---

```yaml
---
solution_context_id: 40-external-integrations
description: >-
  Use when assessing vendor exposure for a feature, planning a vendor
  swap, or validating that a critical-path vendor has a replacement
  plan.
triggers:
  - vendors
  - SaaS
  - external integrations
  - third-party APIs
  - PSP
  - vendor swap
  - critical-path vendor
last_captured: {{capture_date}}
last_captured_by: {{captured_by}}
related_components: []
---
```

# {{project_name}} — External Integrations

## 1. Vendor Catalog

| Vendor | Product | Category | Criticality | Owner | Contract Status | Renewal Window | Replacement Plan |
|---|---|---|---|---|---|---|---|
{{vendor_rows}}

`Criticality` is one of: critical / important / nice-to-have.

`Contract Status` is one of: signed / negotiating / month-to-month /
informal.

## 2. Critical-Path Map

Which vendors block which user flows. If the vendor is unavailable,
which features go down.

| User flow | Critical vendors | Failure mode | Mitigation |
|---|---|---|---|
{{critical_path_rows}}

## 3. Replacement Plans

For each vendor with a replacement plan, link to the relevant ADR (or
mark `none`).

| Vendor | Replacement Plan | ADR Link |
|---|---|---|
{{replacement_rows}}
