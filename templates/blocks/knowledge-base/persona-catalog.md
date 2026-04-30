---
slug: persona-catalog
title: "Persona Catalog (KB)"
applies-to: [kb-instance]
requires-decision-from: [product]
optional: false
order-hint: 10
---

```yaml
---
solution_context_id: 10-personas-and-use-cases
description: >-
  Use when scoping work for a specific user segment, mapping a
  job-to-be-done to existing components, or framing a feature in terms
  of who it serves.
triggers:
  - personas
  - users
  - user segment
  - jobs to be done
  - use cases
  - who uses
last_captured: {{capture_date}}
last_captured_by: {{captured_by}}
related_components:
{{related_components_yaml_list}}
---
```

# {{project_name}} — Personas & Use Cases

## 1. Persona Catalog

| Label | Segment | Primary Outcome |
|---|---|---|
{{persona_summary_rows}}

## 2. Persona Detail

<!-- Repeat per persona. -->

### {{persona_label}}

**Sketch:** {{persona_sketch_2_to_3_sentences}}

**Jobs-to-be-done:**

| When (situation) | I want (motivation) | So I can (outcome) | Frequency | Criticality |
|---|---|---|---|---|
{{persona_jtbd_rows}}

**Pains and gains** (optional): {{persona_pains_gains_optional}}

## 3. Jobs-to-Component Map

| Persona | Job statement | Component IDs |
|---|---|---|
{{jobs_to_component_rows}}
