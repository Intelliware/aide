---
slug: solution-overview
title: "Solution Overview (KB)"
applies-to: [kb-instance]
requires-decision-from: [product, architect]
optional: false
order-hint: 5
---

```yaml
---
solution_context_id: 00-overview
description: >-
  Use when grounding a discussion in the solution's mission, value
  proposition, or out-of-scope boundaries.
triggers:
  - mission
  - value proposition
  - out of scope
  - solution overview
  - what is this system
last_captured: {{capture_date}}
last_captured_by: {{captured_by}}
---
```

# {{project_name}} — Solution Overview

## 1. Mission

{{mission_one_paragraph}}

## 2. Value Proposition

- {{value_prop_1}}
- {{value_prop_2}}
- {{value_prop_3_optional}}

## 3. Out of Scope

- {{out_of_scope_1}}
- {{out_of_scope_2}}

## 4. Classification

| Field | Value |
|---|---|
| Project type(s) | {{project_types}} |
| Primary languages | {{primary_languages}} |
| Architecture pattern | {{architecture_pattern}} |
| Repo count | {{repo_count}} |

## 5. Multi-Part Summary

<!-- Conditional: only render when project has > 1 repo. -->

{{multi_part_summary_table_or_omit}}

## 6. Links Forward

- [`10-personas-and-use-cases.md`](./10-personas-and-use-cases.md)
- [`20-goals-and-kpis.md`](./20-goals-and-kpis.md)
- [`30-constraints-and-compliance.md`](./30-constraints-and-compliance.md)
- [`40-external-integrations.md`](./40-external-integrations.md)
- [`50-ownership-and-raci.md`](./50-ownership-and-raci.md)
- [ARCHITECTURE.md § 4 Capability Index](../../ARCHITECTURE.md)
