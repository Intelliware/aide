---
slug: ops-runbooks-and-oncall
title: "Operations — Runbooks & On-call (KB)"
applies-to: [kb-instance]
requires-decision-from: [sre]
optional: false
order-hint: 73
---

```yaml
---
operations_id: 30-runbooks-and-oncall
description: >-
  Use when paged, when authoring a new runbook, or when onboarding a
  new on-call engineer.
triggers:
  - runbook
  - on-call
  - oncall
  - escalation
  - incident
  - paging
  - handover
last_captured: {{capture_date}}
last_captured_by: {{captured_by}}
---
```

# {{project_name}} — Runbooks & On-call

## 1. On-call Rotations

| Rotation | Scope | Tier 1 team | Handover cadence | Comms channel |
|---|---|---|---|---|
{{oncall_rotation_rows}}

## 2. Escalation Tiers

| Tier | Role | Trigger condition | Time-to-escalate |
|---|---|---|---|
{{escalation_rows}}

## 3. Incident-Comms Channels

| Channel | Purpose | Notes |
|---|---|---|
{{comms_rows}}

## 4. Runbook Index

| Trigger | Runbook | Last reviewed | Owner |
|---|---|---|---|
{{runbook_index_rows}}

If the index has more than 6 rows, runbooks live in
`<KB>/shared/operations/runbooks/<runbook-slug>.md` files (one runbook
per file). Each individual runbook follows the
`templates/blocks/knowledge-base/ops-runbook.md` shape.

## 5. Cross-links

- Ownership: [`../solution-context/50-ownership-and-raci.md`](../solution-context/50-ownership-and-raci.md) § 3
- Topology: [`00-deployment-topology.md`](./00-deployment-topology.md)
- AI rules: [`../ai-rules/project-context.md`](../ai-rules/project-context.md)
