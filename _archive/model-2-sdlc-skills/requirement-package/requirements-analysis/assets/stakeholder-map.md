# Stakeholder Map

> **Project:** [project name]
> **Proposed change:** [brief description of the feature or change request]
> **Date mapped:** [date]
> **Prepared by:** [name]

---

## Stakeholder Identification

| # | Name / Role | Organisation / Team | Category | Source |
|---|------------|-------------------|----------|--------|
| 1 | [name or role title] | [team or org] | [Requestor / User / Operator / Data owner / Downstream consumer / Compliance / Approver / External] | [User-stated — [name/role, date] / Discovery-derived (elicitation-confirmed) — docs/<feature>/requirements-package/discovery/elicitation-outputs.md / Discovery-derived (inferred from capability baseline) — docs/<feature>/requirements-package/discovery/current-capability-baseline.md] |

---

## Unknown / Not Identified Stakeholder Categories

Record any stakeholder category where no stakeholder could be named. These are blind spots that increase delivery risk.

| Category | Status | Notes |
|----------|--------|-------|
| Requestors | [Named / **Unknown**] | [what the user said, or why this could not be identified] |
| Users / End users | [Named / **Unknown**] | |
| Operators | [Named / **Unknown**] | |
| Data owners | [Named / **Unknown**] | |
| Downstream consumers | [Named / **Unknown**] | |
| Compliance / Risk | [Named / **Unknown**] | |
| Approvers | [Named / **Unknown**] | |
| External parties | [Named / **Unknown**] | |

*If all categories are named, write: No unknown stakeholder categories.*

---

## Influence / Interest Assessment

| Stakeholder | Influence | Interest | Grid Quadrant | Rationale |
|------------|-----------|----------|---------------|-----------|
| [name / role] | [High / Medium / Low] | [High / Medium / Low] | [Manage Closely / Keep Satisfied / Keep Informed / Monitor] | [brief explanation — what gives them influence, why they care about this change] |

> **Grid placement rule:** Medium influence → treat as Low for quadrant placement. Medium interest → treat as Low for quadrant placement. This prevents over-investment in stakeholders whose influence and interest are moderate. Record the precise H/M/L values above for nuance; use the placement rule only to assign the quadrant. **Mixed-axis cases:** High Influence + Medium Interest → High Influence + Low Interest → Keep Satisfied. Medium Influence + High Interest → Low Influence + High Interest → Keep Informed.

### Influence / Interest Grid

```
High │  Keep Satisfied    │  Manage Closely   │
     │  (high influence,  │  (high influence, │
     │   low interest)    │   high interest)  │
     │                    │                   │
 I   │────────────────────┼───────────────────│
 n   │                    │                   │
 f   │  Monitor           │  Keep Informed    │
 l   │  (low influence,   │  (low influence,  │
 u   │   low interest)    │   high interest)  │
 e   │                    │                   │
 n   └────────────────────┴───────────────────┘
 c        Low Interest         High Interest
 e
```

**Manage Closely:** [list stakeholders in this quadrant]
**Keep Satisfied:** [list stakeholders in this quadrant]
**Keep Informed:** [list stakeholders in this quadrant]
**Monitor:** [list stakeholders in this quadrant]

---

## RACI Matrix

*Scope: requirements definition and sign-off for this change*

| Stakeholder | Requirements Production | Requirements Review | Requirements Sign-off | Release Notification |
|------------|------------------------|--------------------|-----------------------|---------------------|
| [name / role] | [R / A / C / I / —] | [R / A / C / I / —] | [R / A / C / I / —] | [R / A / C / I / —] |

**Accountable for Requirements Sign-off (column 3):** [single name/role — there must be exactly one A in this column]

> R = Responsible (does the work) | A = Accountable (final authority, **one per deliverable column**) | C = Consulted (input required before finalising) | I = Informed (receives output, no input required)

> **External parties** (vendors, regulators, partners): External parties may be assigned C or I. Accountability (A) and primary responsibility (R) must rest with an internal role.

### RACI Conflicts

Record any column where multiple stakeholders claim Accountable status, or where no Accountable could be identified. These must be resolved before analysis proceeds.

| Column | Conflict Description | Stakeholders in Conflict | Resolution Required By |
|--------|---------------------|--------------------------|------------------------|
| [e.g., Requirements Sign-off] | [e.g., both Product Owner and CTO claim A] | [names / roles] | [before change-scoping / before requirements review] |

*If no conflicts, write: No RACI conflicts identified.*

---

## Engagement Plan

### Consulted Stakeholders

Defines who to consult during analysis, on what topics, and in what sequence.

| # | Stakeholder | Method | Topics to Cover | Basis for Consultation | Priority |
|---|------------|--------|----------------|------------------------|----------|
| 1 | [name / role] | [Interview / Workshop / Async review] | [specific questions or decision areas] | [their role, ownership, or expertise that makes their input necessary] | [Must resolve before change-scoping / Can resolve during later analysis steps] |

### Informed Stakeholders

Defines when and how each Informed stakeholder receives the completed deliverable.

| Stakeholder | Deliverable | When | How | What they receive |
|------------|-------------|------|-----|-------------------|
| [name / role] | [Requirements Sign-off / Release Notification] | [e.g., after sign-off, at release] | [email / document share / ticket] | [full requirements doc / executive summary / release notes] |

---

## Stakeholder Concerns Register

Anticipated concerns based on each stakeholder's role and relationship to this change. All entries are user-stated and unverified — treat as assumptions until confirmed through consultation.

| Stakeholder | Anticipated Concern | Basis | Mitigation or Question | Consultation Outcome |
|------------|---------------------|-------|------------------------|----------------------|
| [name / role] | [what they will likely push back on or ask about] | [why this concern is expected — role, ownership, or context provided by user] | [how to address it or what to ask during consultation] | [Confirmed / Partially addressed / Refuted — complete after consultation; unresolved entries are inputs to risk-analysis] |

*If no concerns have been identified, write: No concerns identified at this stage.*

---

## Assumptions

Stakeholder identifications and classifications in this document are based on user-stated information and, where discovery ran, discovery artifacts. User-stated identifications and gap-filled information are unverified assumptions — treat each as such until consultation confirms or refutes it. Identifications sourced from discovery artifacts carry the confidence level of the source artifact and are not listed as assumptions unless the user modified or extended them. Each assumption entry here must also be added to the assumption log.

| # | Assumption | Category | Impact if Wrong |
|---|-----------|----------|----------------|
| 1 | [the assumption — e.g., "The Product Owner has final sign-off authority for this change"] | [Stakeholder identity / Influence / Interest / Grid placement / RACI role / Concern] | [what analysis decision goes wrong if this assumption is false] |

*If no assumptions were identified, write: No assumptions identified at this stage.*

---

## Decisions

Key decisions made during this stakeholder mapping — RACI conflict resolutions, ambiguous classification calls, and engagement choices that were not self-evident. Each entry here must also be added to the decision log.

| # | Decision | Alternatives Considered | Rationale | Decision-maker |
|---|---------|------------------------|-----------|----------------|
| 1 | [e.g., "Classified Security Lead as C not A for Requirements Sign-off — final authority confirmed with Product Owner"] | [what else was considered] | [why this was chosen] | [name or role] |

*If no decisions required logging, write: No stakeholder-mapping decisions required logging.*

---

## Summary

| Metric | Value |
|--------|-------|
| Total stakeholders identified | |
| Manage Closely (high influence, high interest) | |
| Keep Satisfied (high influence, low interest) | |
| Keep Informed (low influence, high interest) | |
| Monitor (low influence, low interest) | |
| Unknown / not identified categories | |
| Consulted in analysis | |
| Informed (notification only) | |
| Accountable for Requirements Sign-off | [single name/role] |
| Open RACI conflicts | |
| Total assumptions logged | |
| Total decisions logged | |
