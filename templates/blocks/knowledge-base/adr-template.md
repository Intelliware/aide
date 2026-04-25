---
slug: adr-template
title: "Architecture Decision Record (MADR)"
applies-to: [kb-instance, greenfield-design-package]
requires-decision-from: [architect]
optional: false
order-hint: 50
---

# ADR-{{adr_number}}: {{adr_title}}

> **Status:** {{adr_status}}
> **Date:** {{adr_date}}
> **Deciders:** {{adr_deciders}}
> **Consulted:** {{adr_consulted}}
> **Informed:** {{adr_informed}}
> **Tags:** {{adr_tags}}

ADRs are **append-only / immutable**. Once an ADR has status `accepted`,
the file is never edited in place. To change the decision, write a new
ADR with status `accepted` whose body cites this one as
`Supersedes: ADR-{{adr_number}}`, and update _this_ ADR's status block
to `superseded by ADR-XXXX` — that single-line change is the only edit
permitted to an accepted ADR. Typos pre-acceptance are fine.

---

## Status

`{{adr_status}}`

Allowed values:

- `proposed` — drafted, awaiting review.
- `accepted` — decision is in force; teams must comply.
- `rejected` — drafted but not adopted; kept for the record.
- `deprecated` — no longer in force, but not replaced. Avoid; prefer
  `superseded by`.
- `superseded by ADR-XXXX` — replaced by a later decision.

---

## Context

{{adr_context_paragraphs}}

State the forces in play: the technical constraints, the business
constraints, the team / staffing constraints, the prior decisions that
this one builds on. Two-to-five paragraphs is the right length — if it
fits in one paragraph the decision is too small for an ADR (use a
component doc); if it needs ten paragraphs the decision probably hides
several smaller decisions that should each get their own ADR.

**Forces / drivers:**

- {{driver_1}}
- {{driver_2}}
- {{driver_n}}

**Constraints we cannot relax:**

- {{constraint_1}}
- {{constraint_2}}

---

## Decision

{{adr_decision_active_voice}}

State the decision in **active voice**, in one or two paragraphs:
"We will adopt PostgreSQL as the primary OLTP store" — _not_ "PostgreSQL
should be considered." Active voice forces commitment.

**What this decision applies to:** {{adr_scope_of_application}}

**What this decision does NOT apply to:** {{adr_explicit_non_scope}}

### Considered Alternatives

For each alternative, name it and give the one or two reasons it was
not chosen. Do not exhaustively compare — the decision is what was
chosen, not a market survey.

| Option | Outcome | Reason |
|---|---|---|
| {{alternative_1}} | rejected | {{alternative_1_reason}} |
| {{alternative_2}} | rejected | {{alternative_2_reason}} |
| {{alternative_n}} | rejected | {{alternative_n_reason}} |

---

## Consequences

The honest accounting of what this decision buys and costs. The
template separates these so an ADR can't claim only positives.

### Positive

- {{positive_consequence_1}}
- {{positive_consequence_2}}
- {{positive_consequence_n}}

### Negative

- {{negative_consequence_1}}
- {{negative_consequence_2}}
- {{negative_consequence_n}}

### Neutral / Follow-up Work

- {{neutral_consequence_or_followup_1}}
- {{neutral_consequence_or_followup_2}}

**Affected components / repos** (drives notification on acceptance):
{{affected_components_repos_list}}

**Migration / adoption plan** (if the decision changes existing systems):
{{migration_or_adoption_plan}}

---

## Links

- **Supersedes:** {{adr_supersedes}}
- **Superseded by:** {{adr_superseded_by}}
- **Related ADRs:** {{adr_related}}
- **Related components:** {{adr_related_components}}
- **External references:** {{adr_external_references}}

---

> **Format note:** This template follows the MADR (Markdown Any Decision
> Records) convention — `Title`, `Status`, `Context`, `Decision`,
> `Consequences`, plus a `Links` block. ADRs in this KB live at
> `knowledge-base/decisions/ADR-NNNN-{{kebab_title}}.md` with `NNNN` as
> a zero-padded sequence number. The number is allocated when the ADR is
> first proposed and never changes, even if status changes later.
