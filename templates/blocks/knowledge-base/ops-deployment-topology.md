---
slug: ops-deployment-topology
title: "Operations — Deployment Topology (KB)"
applies-to: [kb-instance]
requires-decision-from: [sre, architect]
optional: false
order-hint: 70
---

```yaml
---
operations_id: 00-deployment-topology
description: >-
  Use when planning a deploy, evaluating a region change, or
  understanding the failover model.
triggers:
  - deployment
  - deploy
  - topology
  - regions
  - failover
  - release cadence
  - auto-scaling
last_captured: {{capture_date}}
last_captured_by: {{captured_by}}
---
```

# {{project_name}} — Deployment Topology

## 1. Overview

{{topology_one_paragraph}}

## 2. Topology Diagram

```mermaid
{{topology_mermaid}}
```

## 3. Failover Model

- Trigger: {{failover_trigger}}
- Approver: {{failover_approver}}
- RTO: {{failover_rto}}
- RPO: {{failover_rpo}}

## 4. Auto-scaling

| Component / repo | Strategy | Threshold | Owner |
|---|---|---|---|
{{autoscaling_rows}}

## 5. Release Cadence + Freeze Windows

- Cadence: {{release_cadence}}
- Strategy (blue-green / canary / rolling / replace): {{deploy_strategy}}
- Change-freeze windows: {{freeze_windows}}

## 6. Cross-links

- Environments & secrets: [`10-environments-and-secrets.md`](./10-environments-and-secrets.md)
- SLOs: [`20-slos-and-monitoring.md`](./20-slos-and-monitoring.md)
- On-call: [`30-runbooks-and-oncall.md`](./30-runbooks-and-oncall.md)
- Constraints: [`../solution-context/30-constraints-and-compliance.md`](../solution-context/30-constraints-and-compliance.md)
