# Constraint Register

> **Project:** [project name]
> **Change request:** [brief description]
> **Date extracted:** [date]
> **Sources:** capability baseline | documentation review | stakeholder input | dependency mapping | change scoping | impact analysis

---

## Constraints

| ID | Category | Description | Hard / Soft | Conflict Status | Owner | Evidence Source | Consequence of Violation | Waiver Path |
|----|----------|-------------|-------------|----------------|-------|----------------|--------------------------|------------|
| CON-001 | [System compatibility / Performance budget / Data / Operational / Contractual / Regulatory-compliance / Security / Timeline-scheduling / Organisational] | [clear constraint statement — what the feature must or must not do] | [Hard / Soft] | [None / Conflict — see DECISION-xxx] | [named person or team — the authority who can confirm this is still current and, for soft, can approve a waiver. If unresolved: "Owner: unresolved — see assumption-log [ASMP-xxx]". If pending confirmation: "Confirmed: pending — [owner name] — see assumption-log [ASMP-xxx]".] | [observed system behaviour: description / document: `name, version, date` / stakeholder: `Name, context, date` / Derived — [basis]] | [what must be revised or what liability arises if violated] | [Hard: N/A / Soft: approval required from [named authority]; waiver logged in decision-log [DEC-xxx] if already granted] |

> **Null assessments:** when no constraint is found for a category after both harvest and derivation, record a single row for that category with `Assessed — none found` in the Description field and leave all other fields blank. Do not omit any category — a blank category is indistinguishable from an unevaluated one.

> **Derived constraints:** mark evidence source as `Derived — [basis]` and cross-reference in assumption-log.

---

## Hard Constraints Summary

Constraints that cannot be violated — require specialist review before the solution approach is determined.

| ID | Category | Description | Consequence | Review Status |
|----|----------|-------------|-------------|--------------|
| CON-xxx | | | | [Pending review / Reviewed by [name, date]] |

---

## Regulatory / Compliance Constraints

Constraints triggered by regulatory obligations — require Legal or Compliance review before requirements are finalised.

| ID | Regulation / Standard | Obligation | Triggered By | Review Status |
|----|-----------------------|-----------|--------------|--------------|
| CON-xxx | [GDPR / CCPA / HIPAA / PCI-DSS / SOX / ITAR-EAR / FERPA / WCAG / other] | [specific obligation] | [which requirement or data type triggers this] | [Not started / Scheduled — [date] / In review / Confirmed by [name, date]] |

---

## Security Constraints

Security policy constraints — require confirmation from the Security team lead or CISO.

| ID | Description | Policy Source | Confirmation Status |
|----|-------------|--------------|---------------------|
| CON-xxx | | [internal policy name / framework] | [Not confirmed / Confirmed by [name, date]] |

---

## Soft Constraints Requiring Negotiation

| ID | Category | Description | Trade-off | Negotiation Owner | Status |
|----|----------|-------------|----------|-------------------|--------|
| CON-xxx | | | [what is gained vs. what is risked by waiving this constraint] | [named authority with standing to approve a waiver] | [Under negotiation / Waived — approved by: name, date, decision-log DEC-xxx] |

---

## Conflicting Hard Constraints

Pairs of hard constraints that directly contradict each other — must be escalated before the requirements phase produces finalised requirements.

| Constraint A | Constraint B | Nature of Conflict | Resolution Owner | Decision-log Entry | Status |
|-------------|-------------|-------------------|-----------------|-------------------|--------|
| CON-xxx | CON-xxx | [description of the contradiction] | [named authority — Legal / Compliance / Security lead / project sponsor] | [DEC-xxx — logged / Awaiting logging] | [Open / Resolved — see DEC-xxx] |

---

## Assumption-Backed Constraints

Constraints sourced only from stakeholder verbal input or derivation with no system or document corroboration — also logged in assumption-log.

| Constraint ID | Assumption ID | What Needs Verification |
|--------------|--------------|------------------------|
| CON-xxx | ASMP-xxx | [what system or document evidence would confirm this constraint] |

---

## Summary

| Category | Total | Hard | Soft |
|----------|-------|------|------|
| System compatibility | | | |
| Performance budget | | | |
| Data | | | |
| Operational | | | |
| Contractual | | | |
| Regulatory / Compliance | | | |
| Security | | | |
| Timeline / Scheduling | | | |
| Organisational | | | |
| **Total** | | | |
