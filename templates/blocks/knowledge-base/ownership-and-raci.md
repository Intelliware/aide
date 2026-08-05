---
slug: ownership-and-raci
title: "Ownership & RACI (KB)"
applies-to: [kb-instance]
requires-decision-from: [eng-leadership, product]
optional: false
order-hint: 50
---

```yaml
---
solution_context_id: 50-ownership-and-raci
description: >-
  Use when routing a feature's review or approval, identifying the
  on-call rotation for an incident, or resolving a decision-rights
  question.
triggers:
  - ownership
  - RACI
  - on-call
  - team
  - decision rights
  - escalation
  - approver
last_captured: {{capture_date}}
last_captured_by: {{captured_by}}
related_components: []
---
```

# {{project_name}} — Ownership & RACI

## 1. Repo Ownership

| Repo | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
{{repo_raci_rows}}

`Accountable` is exactly one team per row.

## 2. Capability Ownership (Overrides)

Only rows that diverge from the repo default belong here.

| Capability | Responsible | Accountable | Consulted | Informed | Why override |
|---|---|---|---|---|---|
{{capability_raci_rows}}

## 3. On-call Rotations

| Rotation | Scope | Tier 1 team | Tier 2 escalation | Tier 3 escalation | Paging tool | Handover cadence | Comms channel |
|---|---|---|---|---|---|---|---|
{{oncall_rows}}

## 4. Decision-Rights Matrix

| Decision class | Authority | Consultation required |
|---|---|---|
{{decision_rights_rows}}

`Decision class` includes: architecture, security, product,
hiring/team-structure.
