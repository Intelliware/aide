---
slug: testability-classification
title: "Testability Classification"
applies-to: [greenfield-quality-package]
requires-decision-from: [qa-engineer, tester]
optional: true
order-hint: 1.5
include-if: "project.elicitation.records_testability_classification == true"
---

## 1a. Testability Classification

This block records the output of the testability check authored in
`create-quality-package` Step 0b. The check itself is **always-on** —
the gate runs for every quality package — but this *visible* block is
gated by the elicitation answer `records_testability_classification`.

- When the gate is `true` (default for compliance-regulated and
  brownfield projects), the full classification table appears here so
  reviewers can audit the routing of every in-scope `INC-XXX` and AC.
- When the gate is `false`, the classification still runs but is
  summarised in the change tracker only; this block is omitted with
  `N/A — composition gate records_testability_classification = false`.

Either way, downstream steps (test design, automation-and-cicd, metrics)
consume the same classification rows. The block is presentation, not
the source of truth.

See
`.agents/skills/quality/create-quality-package/references/testability-classification.md`
for the classifier (5 questions), outcomes (6), and decision rules.

## 1a.1 Classification table

One row per classified scope. Add or remove rows freely; do not split
the table into multiple sections.

| Scope ID | Classification | Observable surface | Boundary | Constraints | Rationale | Action |
|---|---|---|---|---|---|---|
| `INC-001` | `automatable` | `POST /wires → 201 + persisted row + Kafka event` | API + integration | none | — | design test case |
| `INC-002` | `partially-automatable` | Latency under load (deterministically bounded) + visual chart | API + manual | NFR-LAT-1 (p95 ≤ 200ms) | Visual chart cannot be asserted in CI; latency is | design test case + record manual procedure |
| `INC-003` | `not-automatable — waived` | none | n/a | none | Build-file pin upgrade; suite proves no regression | waive |
| `INC-004` | `not-automatable — monitored` | Production SLO burn rate | metric | NFR-AVAIL-1 (99.9%) | Behaviour only observable in production; assert via Datadog burn-rate monitor | record monitoring assertion |
| `AC-12` | `unclear` | n/a | n/a | n/a | Acceptance criterion ambiguous on what "approved" means; routed back to requirements | escalate |

**Allowed values:**

- **Classification:** `automatable` | `partially-automatable` |
  `not-automatable — waived` | `not-automatable — manual` |
  `not-automatable — monitored` | `unclear`
- **Boundary:** `unit` | `contract` | `integration` | `API` | `UI` |
  `event` | `log` | `metric` | `manual` | `monitored` | `n/a`
- **Action:** `design test case` | `record manual procedure` |
  `record monitoring assertion` | `waive` | `escalate`

## 1a.2 Distribution summary

Render after the table. Counts per classification across all rows:

| Classification | Count |
|---|---|
| `automatable` | [n] |
| `partially-automatable` | [n] |
| `not-automatable — waived` | [n] |
| `not-automatable — manual` | [n] |
| `not-automatable — monitored` | [n] |
| `unclear` (escalated or dropped this iteration) | [n] |
| **Total scopes classified** | **[n]** |

## 1a.3 Routing notes (only when non-empty)

Capture the human-readable narrative for the rows the user wants
recorded in the package itself rather than only in the change tracker:

- Waiver rationale list — one bullet per `waived` row stating *why*
  testing is unnecessary (refactor / pin / etc.)
- Manual procedure list — one bullet per `manual` row stating *who*
  performs the procedure and *when*
- Monitored signal list — one bullet per `monitored` row naming the
  dashboard / alert / SLO that carries the assertion
- Escalation list — one bullet per `unclear` row naming the upstream
  skill the question routed back to (`create-requirements-package` /
  `create-design-package` / `create-implementation-package`) and the
  date the route was opened

Omit this section when the rows above carry sufficient detail in
their `Rationale` column.

## 1a.4 Cross-references

| Consumer | What it uses |
|---|---|
| `quality/test-design` (§3) | Rows where `Action = design test case` or `record manual procedure` |
| `quality/test-case-increment` (§4a, when gated on) | Same subset |
| `quality/automation-and-cicd` (§5) | `partially-automatable` rows — used to size the manual / automated split in release gates |
| `quality/quality-metrics-and-reporting` (§7) | Rows where `Action = record monitoring assertion` |
| `audit-quality-coverage` | Treats `waived` rows as "covered by waiver"; flags any `INC-XXX` not appearing in this table as a coverage gap |

