---
slug: ops-environments-and-secrets
title: "Operations — Environments & Secrets (KB)"
applies-to: [kb-instance]
requires-decision-from: [sre, security]
optional: false
order-hint: 71
---

```yaml
---
operations_id: 10-environments-and-secrets
description: >-
  Use when bootstrapping a new environment, rotating a secret, or
  understanding which config layer wins in which env.
triggers:
  - environments
  - secrets
  - env matrix
  - rotation
  - config layering
  - secret store
  - bootstrap env
last_captured: {{capture_date}}
last_captured_by: {{captured_by}}
---
```

# {{project_name}} — Environments & Secrets

## 1. Environment Matrix

| Env | Account / project / namespace | Owner | Purpose |
|---|---|---|---|
{{env_matrix_rows}}

## 2. Config Layering

How config sources stack. The bottom layer is the default; each layer
above overrides.

```
{{config_layering_diagram}}
```

## 3. Secret Stores

| Store | Class of secrets | Owner | Rotation cadence | Bootstrap procedure |
|---|---|---|---|---|
{{secret_stores_rows}}

**Never inline secret values in this document.** Every cell names
mechanisms — never values.

## 4. Cross-links

- Topology: [`00-deployment-topology.md`](./00-deployment-topology.md)
- AI rules workflow: [`../ai-rules/project-context.md`](../ai-rules/project-context.md) § 5
- Constraints (data residency, retention): [`../solution-context/30-constraints-and-compliance.md`](../solution-context/30-constraints-and-compliance.md)
