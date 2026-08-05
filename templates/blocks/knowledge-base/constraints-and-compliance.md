---
slug: constraints-and-compliance
title: "Constraints & Compliance (KB)"
applies-to: [kb-instance]
requires-decision-from: [security, legal, architect]
optional: false
order-hint: 30
---

```yaml
---
solution_context_id: 30-constraints-and-compliance
description: >-
  Use when validating that a feature respects regulatory regimes,
  contractual SLAs, NFR ceilings, or architectural prohibitions before
  it ships.
triggers:
  - constraints
  - compliance
  - regulatory
  - SLA
  - PCI
  - GDPR
  - HIPAA
  - SOC 2
  - non-functional
  - NFR
  - data residency
last_captured: {{capture_date}}
last_captured_by: {{captured_by}}
related_components: []
---
```

# {{project_name}} — Constraints & Compliance

## 1. Regulatory Regimes

| Regime | Scope | Source | Status | Verification | Linked KPI |
|---|---|---|---|---|---|
{{regulatory_rows}}

## 2. Contractual Obligations

| Obligation | Scope | Source | Status | Verification | Linked KPI |
|---|---|---|---|---|---|
{{contractual_rows}}

## 3. Non-Functional Ceilings

| Ceiling | Definition | Owner | Verification | Linked KPI |
|---|---|---|---|---|
{{nfr_rows}}

## 4. Operational Policies

| Policy | Scope | Owner | Verification |
|---|---|---|---|
{{operational_rows}}

## 5. Architectural Prohibitions

The list of must-nots. Feeds `<KB>/shared/ai-rules/project-context.md`
§ 8.

| Rule | Reason | Source | Verification |
|---|---|---|---|
{{prohibition_rows}}

If genuinely none, write a single row: "No project-wide architectural
prohibitions captured — confirmed by {{captured_by}} on
{{capture_date}}."
