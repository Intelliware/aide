---
slug: elicit-goals-kpis
sequence: 4
depends-on-prior: true
---

# Step 4 — Elicit goals & KPIs

## Goal

Produce `<KB>/shared/solution-context/20-goals-and-kpis.md` capturing
measurable outcomes and the metrics that prove progress against them.

## Inputs

- `00-overview.md` § 2 Value Proposition (frames goal selection).
- `10-personas-and-use-cases.md` § 1 Persona Catalog (each persona's
  primary outcome).
- Elicitation pattern: `references/elicitation-patterns/business-objectives.md`.

## Procedure

1. **Open elicitation conversation.** For each value-proposition outcome
   identified in `00-overview.md`:
   - "What is the north-star metric for this outcome?"
   - "What guardrail metrics must hold while we move the north-star?
     (latency, error rate, cost, compliance pass rate, etc.)"
   - "What leading indicators tell us the north-star will move?"
   - "What is the current baseline for each? If unknown, who could
     measure it?"
   - "What is the target, and by when?"
2. **Capture each KPI** as a row:
   - Name
   - Type (north-star / guardrail / leading)
   - Definition (precise, measurable)
   - Baseline (value or `TODO(baseline)` with responsible team)
   - Target (value + horizon)
   - Owning persona / team
3. **Draft `20-goals-and-kpis.md`** with sections:
   - Frontmatter
   - § 1 Outcomes (matched to value-prop bullets)
   - § 2 KPIs (table)
   - § 3 Trade-offs (which guardrails the team accepts in pursuit of the
     north-star)
   - § 4 Cross-references (link KPIs to relevant `related_components`
     by capability)
4. **Confirm and save.**
5. **Non-interactive fallback:** emit a stub with one row per outcome,
   all metric fields marked `TODO(define)`.

## Frontmatter

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
last_captured: <ISO-8601 date>
last_captured_by: <user_id>
related_components: []
---
```

## Acceptance

- File exists.
- § 2 KPI table has ≥ 1 row per outcome from `00-overview.md`.
- Every KPI row has Definition, Baseline (value or TODO), Target,
  Owner.
- Every TODO marker carries a comment naming the responsible team.

## Outputs

- `<KB>/shared/solution-context/20-goals-and-kpis.md`.

## Hand-off

`steps/05-elicit-constraints.md`.
