---
slug: ops-runbook
title: "Operations — Single Runbook (KB)"
applies-to: [kb-instance]
requires-decision-from: [sre]
optional: true
order-hint: 74
---

```yaml
---
runbook_id: {{runbook_slug}}
description: >-
  Use when {{runbook_trigger_one_sentence}}.
triggers:
  - {{runbook_keyword_1}}
  - {{runbook_keyword_2}}
last_reviewed: {{review_date}}
last_reviewed_by: {{reviewed_by}}
owner: {{owner_team}}
---
```

# Runbook — {{runbook_human_title}}

## 1. When to Use This Runbook

**Trigger:** {{trigger_alert_or_signal}}

**Severity:** {{severity_class}} (S1 / S2 / S3 / S4)

**Detection signal:** {{detection_dashboard_or_log_query}}

## 2. Mitigation Steps

Numbered, concrete actions. Each step should be performable by an
engineer who has not seen this runbook before.

1. {{step_1}}
2. {{step_2}}
3. {{step_3}}
4. {{step_n}}

## 3. Verification

How you know mitigation worked.

- {{verification_check_1}}
- {{verification_check_2}}

## 4. Communication

| Channel | Message template | When |
|---|---|---|
{{communication_rows}}

## 5. Postmortem

If this runbook fired, file a postmortem at
[`../../../shared/adrs/`](../../../shared/adrs/) when the action
indicates a permanent decision change. Otherwise an incident review
note in {{incident_review_repo}} suffices.

## 6. Cross-links

- On-call index: [`../30-runbooks-and-oncall.md`](../30-runbooks-and-oncall.md)
- Topology: [`../00-deployment-topology.md`](../00-deployment-topology.md)
