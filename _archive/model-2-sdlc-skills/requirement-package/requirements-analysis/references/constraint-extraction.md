# Constraint Extraction

## Purpose

Extract and document the constraints the existing system imposes on any proposed change — constraints that are distinct from dependencies (what the feature needs) and impact (what the feature affects). Constraints are limits the new feature must operate within, whether or not it interacts with the constraining element directly. Categories include: system compatibility constraints (operational environment limits, hosting capacity boundaries, supported platform commitments), performance budget constraints (response time headroom already consumed, capacity ceilings, throughput limits shared across capabilities), data constraints (data structure rigidity, migration window restrictions, data format commitments to external consumers), operational constraints (release windows, rollback capabilities, monitoring infrastructure limits), contractual constraints (SLA commitments, interface versioning promises, third-party rate limits), regulatory and compliance constraints (data residency requirements, privacy regulations such as GDPR or CCPA, industry-specific regulations such as HIPAA or PCI-DSS, audit trail obligations, accessibility mandates), security constraints (authentication and authorisation policy mandates, encryption obligations, access control boundaries that cannot be bypassed), timeline and scheduling constraints (business-driven limits on when changes can take effect — release blackout periods, fiscal close windows, external announcement gates), and organisational constraints (team ownership boundaries, approval gates, internal policy requirements). Each constraint specifies: the source of the constraint (system evidence, documentation, or stakeholder), the constraint owner (who is responsible for its validity and has authority to waive it if soft), whether it is hard (non-negotiable) or soft (negotiable with trade-offs), and the consequence of violating it. Conflicting hard constraints are escalated to the appropriate resolution authority and logged in the decision-log before the hand-off gate is cleared. Produces a constraint register that feeds into the requirements-package. Prevents the failure mode where feasible-looking requirements become infeasible during design or implementation because system-level constraints were not surfaced during analysis.

## When to Use

- Step 5 in the analysis-workflow sequence — run after impact-analysis completes and is acknowledged
- Before requirements are written — constraints define the envelope requirements must fit within
- Whenever the existing system, organisation, or regulatory context limits what the feature can do

## Constraints vs. Dependencies vs. Impact

These three analysis skills cover adjacent but distinct concerns:

| Skill | Covers |
|-------|--------|
| Dependency mapping | What the feature needs *from* the system |
| Impact analysis | What the change *does to* the system |
| **Constraint extraction** | What the feature **must operate within** — limits that apply whether or not the feature directly interacts with the constraining element |

A performance budget constraint applies even if the feature never touches the component that consumes the budget. A regulatory constraint applies even if the feature never reads a regulated data field directly. That is what makes constraints distinct — they are system-level limits, not interaction-level requirements.

## Constraint Categories

| Category | Examples |
|----------|---------|
| **System compatibility** | Compatibility constraints imposed by the existing system — e.g., the system operates in a way that limits what the new feature can do; capacity restrictions; minimum version requirements for supported devices |
| **Performance budget** | Response time headroom already consumed by existing capabilities, capacity ceilings on shared infrastructure, data retrieval throughput limits, rate limits shared across capabilities |
| **Data** | Data structure rigidity (cannot change data formats without a migration window), data format commitments to external consumers, data retention requirements, personal information handling obligations |
| **Operational** | Release windows, rollback capability limits, zero-downtime release requirements, monitoring coverage capacity, on-call coverage scope |
| **Contractual** | SLA commitments to customers, interface versioning promises to external consumers, third-party rate limits and quotas, vendor licensing constraints |
| **Regulatory / compliance** | Data residency requirements, GDPR / CCPA privacy obligations, HIPAA / PCI-DSS industry rules, SOX financial reporting controls, ITAR/EAR export controls, FERPA educational records, employment data regulations, audit trail obligations, accessibility mandates (WCAG level) |
| **Security** | Authentication and authorisation policy mandates (e.g., SSO-only sign-in, no service-account bypass), encryption-at-rest and in-transit obligations defined by security policy, access control boundaries the feature cannot cross, data classification policies that restrict how data may be handled — distinct from regulatory obligations; these are internal security policy constraints |
| **Timeline / scheduling** | Business-driven limits on when changes can take effect — release blackout periods (e.g., no releases during fiscal close), external announcement or partner launch gates, contractual go-live dates, organisational change management windows that constrain deployment timing |
| **Organisational** | Team ownership approval gates, internal policy requirements, security review gates, change advisory board processes |

## Hard vs. Soft

Every constraint is either hard or soft:

| Type | Definition | Consequence |
|------|-----------|-------------|
| **Hard** | Non-negotiable — cannot be violated under any circumstances | Requirement or design that violates this must be revised |
| **Soft** | Has trade-offs — can be negotiated with appropriate approval and accepted consequences | Must be explicitly waived with documented rationale and approver — waiver logged in decision-log |

Treating a hard constraint as soft (or failing to classify) is a requirements risk — it allows infeasible requirements to pass through unchallenged.

### Conflicting Hard Constraints

When two hard constraints directly contradict each other — for example, a GDPR right-to-erasure obligation and an audit trail retention requirement, or a zero-downtime release requirement and a data structure migration that requires downtime — neither can be waived unilaterally. Both constraints remain hard until the conflict is formally resolved by an authority with standing to rule on both. The BA/PO does not resolve hard constraint conflicts unilaterally. The conflict must be:

1. Recorded in the `decision-log` with both constraint IDs, the nature of the conflict, and a named resolution owner.
2. Escalated immediately to the appropriate resolution authority — the correct authority depends on the nature of the conflict:
   - **Regulatory vs. operational or data conflicts** (e.g., GDPR erasure vs. audit retention): Legal or Compliance
   - **Contractual vs. operational conflicts** (e.g., SLA uptime commitment vs. required downtime window): project sponsor or business owner with authority over both commitments
   - **Security policy vs. business process conflicts**: the Security team lead or Chief Information Security Officer
   - **Cross-team ownership conflicts** (e.g., two teams with conflicting must-not-touch claims): the BA/PO escalates to the project sponsor or programme manager
3. Reflected in the constraint register with a `Conflict` status on both entries, referencing the decision-log entry.

A hard constraint conflict is a requirements-blocking finding. It must be resolved before the requirements phase produces finalised requirements.

If the named resolution owner does not respond or cannot resolve the conflict before the hand-off gate is due, record the conflict as a high-severity constraint risk in risk-analysis with no current mitigation and present it to the project sponsor. Do not hold the gate open indefinitely — an unresolvable conflict carried unacknowledged into the requirements phase is more damaging than one that is formally escalated as a risk.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Existing-system-baseline | current-capability-synthesis | Yes — consolidated constraints section is the primary harvest source |
| Documentation currency assessment | existing-artifact-review | Yes — settled decisions and documented constraints |
| Confirmed requirements | requirements-elicitation | Yes — requirements may trigger regulatory or compliance constraints |
| Dependency map | dependency-mapping | Yes — dependencies may reveal additional constraints (e.g., rate limits, interface contracts) |
| Change scope | change-scoping | Yes — in-scope and must-not-touch lists constrain the solution space |
| Impact analysis | impact-analysis | Yes — operational, performance, and security/compliance impacts may reveal additional constraints |

**Degraded-input handling:**

- **Existing-system-baseline absent** (discovery was skipped): the Harvest step (Step 1) cannot use an evidence-derived baseline as the primary source. Derive constraints directly from confirmed requirements, change scope, stakeholder input, and codebase inspection where available. All system claims derived without a baseline are assumptions — seed the assumption-log with each one. Record the absence of a baseline in the constraint-register artifact header. Every constraint sourced this way is automatically stakeholder or inference evidence only and must be cross-referenced in the assumption-log per Step 4.
- **Documentation currency assessment absent** (discovery was skipped): settled decisions and ADR constraints cannot be harvested from an assessed artifact. Consult directly with known document owners, policy holders, and senior stakeholders to identify known ADRs and policy constraints. Record each with stakeholder evidence and cross-reference in the assumption-log.
- **Impact analysis absent**: this should not occur in normal execution — constraint-extraction runs after impact-analysis per the workflow sequence. If impact-analysis output is missing, halt and flag the sequencing failure — record the gap in the assumption-log and present to the project sponsor before proceeding. Do not attempt constraint-extraction without the impact-analysis output.
- **Confirmed requirements unconfirmed**: flag each regulatory or compliance trigger derived from an unconfirmed requirement as an assumption referencing the requirement ID. Do not treat unconfirmed requirements as a stable basis for regulatory constraint derivation.

## Workflow

```
┌──────────────────────────────────────────────────┐
│  1. HARVEST — Collect from all discovery sources │
│     Baseline constraints section, settled        │
│     decisions, ADRs, elicitation outputs.        │
├──────────────────────────────────────────────────┤
│  2. DERIVE — Infer constraints from context      │
│     Dependencies, impact analysis, regulatory    │
│     triggers from requirement content.           │
├──────────────────────────────────────────────────┤
│  3. CLASSIFY — Category and hard/soft            │
│     Escalate conflicting hard constraints.       │
├──────────────────────────────────────────────────┤
│  4. EVIDENCE — Cite the source                   │
│     System observation / document / stakeholder.  │
│     Unsourced constraints are assumptions.       │
├──────────────────────────────────────────────────┤
│  5. CONSEQUENCE — What does violation mean?      │
│     What breaks, what liability arises, what     │
│     must be redesigned? Record waiver path       │
│     for soft constraints.                        │
├──────────────────────────────────────────────────┤
│  6. ASSEMBLE — Populate the constraint register  │
└──────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Harvest from Discovery Sources

The baseline's consolidated constraints section is the primary input — do not re-derive what discovery already found. Also harvest from:

- **Settled decisions** in the documentation currency assessment — ADR decisions that constrain the solution space (e.g., "we use the existing data store — no new databases")
- **Must-not-touch items** in the change scope — each is implicitly a constraint on what the feature can modify
- **Elicitation outputs** — stakeholders often state constraints directly ("it has to work offline", "it must not store credit card numbers", "we cannot change the API until Q4")

**Stale source check:** For every constraint harvested whose sole evidence is a document, ADR, or policy more than six months old (or predating more than two significant releases), confirm with the named owner that the constraint is still in force before recording it as valid. Do not rely on document currency alone. If the owner cannot confirm in the time available, record the constraint with status `Confirmed: pending — [owner name]` and add an assumption-log entry with a resolution deadline. If ownership is unresolved, record `Owner: unresolved` and add an assumption-log entry naming who will resolve it and by when. A stale, unconfirmed constraint that later proves obsolete will corrupt the requirements it feeds.

### Step 2 — Derive Constraints from Context

Some constraints are not stated but implied. The goal of this step is systematic coverage — not a best-effort pass through whatever is visible. Work through the following prompts in order. After completing all prompts, each constraint category in the taxonomy must either have a constraint entry or an explicit "assessed — none found" record in the register.

**From dependencies (dependency-map):**
- Does any external service impose a rate limit, quota, or SLA that constrains how frequently or at what volume the feature can call it?
- Does any dependency have a required interface contract (API version, field format, schema) that the feature cannot deviate from?
- Does any dependency carry an "At risk" readiness status (deprecation or ownership transfer) that constrains the feature's timeline?

**From data entities:**
- Are any fields in the dependency map used by an external consumer? If so, the feature cannot change their type, name, or semantics without breaking that consumer.
- Do data retention, privacy, or format commitments exist for these entities that the feature must inherit?

**From confirmed requirements:**
- Does any requirement involve storing, transmitting, or processing personal data? → Check GDPR, CCPA, and applicable regional privacy regulations.
- Does any requirement involve payment data or financial transactions? → Check PCI-DSS and applicable financial regulations.
- Does any requirement involve health records or medical data? → Check HIPAA or applicable regional health regulations.
- Does any requirement involve educational records? → Check FERPA.
- Does any requirement involve export of technology or data? → Check ITAR/EAR export control obligations.
- Does any requirement involve employment data? → Check applicable labor and employment data regulations.
- Does any requirement affect accessibility of a user-facing interface? → Check WCAG level mandate.
- Does any requirement affect financial reporting systems? → Check SOX controls.

This list is not exhaustive. For any requirement whose subject matter falls under a domain with known regulatory activity, verify whether a specific obligation applies before concluding no regulatory constraint exists.

**From confirmed requirements — security:**
- Does any requirement involve user authentication or privileged access? → Check whether the organisation mandates SSO, MFA, or specific authentication protocols — these are internal security policy constraints, not regulatory ones.
- Does any requirement involve data at rest or in transit? → Check whether encryption policy defines the required standard and whether the feature must meet it.
- Does any requirement involve third-party integrations or cross-system data sharing? → Check data classification policy for constraints on what data may leave the system boundary.
- Does any requirement involve access control decisions or permission changes? → Check whether existing access control boundaries impose constraints the feature cannot cross.

**From confirmed requirements — timeline and scheduling:**
- Does any requirement have an implied or stated go-live date linked to a business event — a product launch, regulatory enforcement date, partner contract date, or external announcement? → Record as a timeline constraint, not merely a project deadline.
- Does any requirement involve a change that must be sequenced with a specific business cycle — fiscal close, peak trading period, annual review — where the change cannot occur during that window? → Record as a timeline constraint.

**From the impact analysis:**
- Do any high-severity operational impacts reveal deployment, monitoring, or rollback constraints not already captured?
- Do any security or compliance impacts in the impact analysis trigger obligations not already captured in the confirmed requirements (e.g., the impact analysis reveals PII handling that no requirement explicitly mentions)?
- Do any performance impacts show that a shared component is already consuming significant budget headroom, constraining how much additional load the feature can add?

**From the operational and release model:**
- Does the operational environment impose limits on when or at what scale the capability can operate — for example, geographic restrictions, capacity commitments made to customers, or availability windows the business has contracted to maintain?
- Do release processes impose ordering, migration window, or timing constraints — for example, data migrations that cannot occur during peak trading hours, or releases that must be batched with a quarterly change window?
- Does the business support model constrain deployment timing — for example, on-call coverage that limits when changes can go live?

**Performance budget measurement:** If a performance budget constraint is derived but no baseline measurement exists for how much of the budget is already consumed, record the constraint with the ceiling value and flag the current consumption as unknown. Log an assumption-log entry with a named owner who can provide the measurement and a resolution deadline. Do not omit the constraint because the measurement is unavailable — record it with the uncertainty explicit.

**Marking derived constraints:** Constraints produced in this step — inferred rather than directly harvested — must have their evidence source marked as `Derived — [basis]` (e.g., "Derived — rate limit implied by external service SLA in dependency-map DEP-007"). Derived constraints with no corroborating document or system evidence are also logged in the assumption-log per Step 4.

### Step 3 — Classify

Assign each constraint to exactly one category and classify it as hard or soft. When in doubt between hard and soft, default to hard. Downgrading a constraint from hard to soft requires documented rationale and approval from the appropriate authority — the correct authority depends on the constraint category:

- **Regulatory / compliance constraints:** Legal or Compliance — the BA/PO does not independently reclassify regulatory obligations
- **Security constraints:** the Security team lead or CISO
- **Contractual constraints:** the business owner or project sponsor with authority over the commitment
- **Operational, organisational, or timeline constraints:** operations leadership or the relevant business owner

If any two hard constraints conflict with each other, follow the Conflicting Hard Constraints protocol above — log in the decision-log, escalate to the appropriate resolution authority per the protocol, and mark both entries with `Conflict` status.

### Step 4 — Evidence Every Constraint

An unsourced constraint is an assumption. For every constraint, cite:
- **System evidence:** the specific artifact, configuration, or system component that enforces or implies the constraint
- **Documentation:** the ADR, spec, or runbook that states it
- **Stakeholder:** name and context of who stated it in elicitation

Constraints with only stakeholder evidence and no system or document corroboration must be logged in the assumption-log. Derived constraints (from Step 2) must also be logged in the assumption-log unless they can be corroborated by system or documentation evidence.

### Step 5 — State the Consequence of Violation

Every constraint must state what happens if a requirement or design violates it:
- Hard constraints: what must be revised in the requirement or design
- Soft constraints: what approval is needed, what the trade-off is, and who has authority to grant the waiver

**Waiver tracking:** when a soft constraint is waived, the waiver must be logged in the `decision-log` with: the constraint ID, the waiver rationale, the approver name and role, and the date approved. A soft constraint waived without a decision-log entry is functionally indistinguishable from a constraint that was missed — it provides no audit trail and no accountability.

### Step 6 — Assemble

Populate the `constraint-register` template. Hard constraints must be flagged for review with the appropriate authority (per Step 3) before the hand-off gate is cleared — do not carry unreviewed hard constraints into the requirements phase.

Each entry in the register must contain the following fields. These fields apply to positive constraint entries — constraints that exist and have been identified.

**Null assessments:** when no constraint has been identified for a given category after both harvest (Step 1) and derivation (Step 2), record a single summary row for that category containing only the Category field and the value `Assessed — none found` in the Description field. All other fields are left blank for null rows. Null rows are not constraint entries — they are coverage evidence that the category was assessed and nothing was found. Do not omit them; a blank category is indistinguishable from an unevaluated one.

| Field | Description |
|-------|-------------|
| **ID** | Unique constraint identifier (e.g., CON-001) |
| **Category** | One of the nine constraint categories defined in the Constraint Categories table |
| **Description** | What the constraint is and what it limits |
| **Hard / Soft** | Classification — hard (non-negotiable) or soft (negotiable with trade-offs) |
| **Conflict status** | `None` or `Conflict — see DECISION-[ID]` |
| **Owner** | The person or team responsible for this constraint's validity — the authority who can confirm it is still current and, for soft constraints, has standing to approve a waiver. For every harvested constraint whose sole evidence is a document more than six months old (or more than two significant releases behind current), confirm with the named owner that the constraint is still in force before recording it as valid. If the owner cannot confirm in the time available, record `Confirmed: pending — [owner name]` and add an assumption-log entry with a resolution deadline. If ownership is unresolved, record `Owner: unresolved` and add an assumption-log entry naming who will resolve it and by when. |
| **Evidence source** | System observation, document reference, stakeholder name, or `Derived — [basis]` |
| **Consequence of violation** | What breaks, what liability arises, or what must be redesigned if this constraint is violated |
| **Waiver path** | For soft constraints: the approval required and the decision-log entry if already waived. `N/A` for hard constraints. |

## Output

A populated **constraint-register** document (use the template at `../assets/constraint-register.md`).

### File Output

Write the completed constraint register to `docs/<feature>/requirements-package/analysis/constraint-register.md`.

Consumed by: process-mapping and gap-analysis (future-state workflows must respect identified constraints), risk-analysis (constraint violations are requirements-level risks), and the requirements-package.

## Constraint Amendments

The constraint register is a living document during the requirements phase. Constraints may change after the register is first published — a vendor updates their rate limits, a new regulation is announced, a business decision upgrades a soft constraint to hard, or a previously hard constraint is formally waived. When this occurs:

1. **Update the register immediately** — do not carry a stale constraint into requirements writing.
2. **Record the change in the decision-log** — include the old value, the new value, the reason for the change, and who authorised it.
3. **Review any requirements already written that depended on the amended constraint** — flag any that may now be invalid or need revision.
4. **If a hard constraint is newly identified after requirements have been written** — flag it to the project sponsor immediately and pause requirements writing until the impact is assessed. Requirements that violate it must be revised before the requirements-package is finalised.

Do not amend a constraint classification (hard → soft or soft → hard) without the authorisation of the appropriate authority as defined in Step 3.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| A feasible-looking requirement becomes infeasible during design | Constraints extracted here define the envelope requirements must fit within — before requirements are written |
| A regulatory constraint missed during analysis surfaces during legal review | Step 2 actively checks whether requirement content triggers regulatory obligations across multiple domains |
| A regulatory or security constraint is misclassified without expert input | Hand-off Gate requires regulatory constraints to be reviewed by Legal or Compliance, and security constraints to be confirmed by the Security team, before the gate is acknowledged |
| Hard and soft constraints treated identically | Hard/soft classification is explicit — hard constraints cannot be waived without approval from the appropriate authority |
| Constraint stated verbally but never documented | Step 4 requires every constraint to be sourced — verbal-only constraints go to assumption-log |
| Two hard constraints conflict and the conflict is left unresolved | Step 3 requires conflicting hard constraints to be escalated to the appropriate resolution authority and logged in the decision-log before the hand-off gate is cleared |
| A soft constraint waiver is granted informally and leaves no audit trail | Step 5 requires all waivers to be logged in the decision-log with approver and rationale |
| Performance budget constraint omitted because baseline consumption is unknown | Step 2 requires the constraint to be recorded with the ceiling and the consumption gap flagged as an assumption |
| Derived constraints mistaken for documented constraints, skipping assumption-log | Step 2 requires derived constraints to be marked as derived and cross-referenced in the assumption-log |
| Discovery was skipped and the skill silently fails on its primary inputs | Degraded-input handling in the Inputs section defines the fallback for each missing input |
| A constraint from a superseded ADR is treated as still in force | Step 1 stale source check requires confirmation with the named owner for any constraint whose sole source is a document more than six months old — unconfirmed constraints are flagged as pending in the assumption-log |

## Hand-off Gate

**This skill runs in strict sequence after `impact-analysis`. The constraint-register must be presented before `risk-analysis` and before the Requirements phase begins.**

Before reading `risk-analysis.md`, you must:
1. Write the completed `constraint-register` artifact in full — every constraint with its ID, category, hard/soft classification, conflict status, owner, evidence source, consequence of violation, and waiver path.
2. Present it to the BA/PO for review.
3. Receive explicit acknowledgement.

The BA/PO review must confirm:
- Any conflicting hard constraints have a decision-log entry with a named resolution owner — do not acknowledge with open conflicts unassigned.
- All soft constraint waivers already granted are recorded in the decision-log.
- All regulatory and compliance constraints have been submitted to Legal or Compliance for review, or the review is formally scheduled before requirements are finalised. The BA/PO does not independently validate regulatory constraint classification — if no Legal or Compliance review has occurred and none is scheduled, this is a gap that must be called out explicitly before acknowledging the gate.
- All security constraints have been confirmed with the Security team lead or equivalent — the BA/PO does not independently validate security policy constraints.

---

## Completion Criteria

- [ ] All constraints from the baseline consolidated constraints section are carried forward
- [ ] All settled decisions from existing-artifact-review are represented as constraints where relevant
- [ ] All must-not-touch items from change-scoping are represented as constraints
- [ ] Step 2 derivation has been performed against the dependency map, all confirmed requirements, the impact analysis, and the deployment model — each constraint category has either a constraint entry or an explicit "assessed — none found" record
- [ ] Regulatory triggers from requirement content have been checked against the full prompt list in Step 2 — not only personal data and payment data
- [ ] Every constraint has a category, hard/soft classification, owner, evidence source, and consequence of violation
- [ ] All derived constraints are marked as derived in the evidence field
- [ ] Constraints sourced only from stakeholder verbal input or derivation (with no system or document corroboration) are cross-referenced in the assumption-log
- [ ] Any conflicting hard constraints are logged in the decision-log with a named resolution owner and are not marked as resolved without documented authority
- [ ] All soft constraint waivers already granted are logged in the decision-log with approver and rationale
- [ ] Constraints harvested from documentation more than six months old have either been confirmed as still current with the named owner, or have a pending confirmation logged in the assumption-log with a resolution deadline
- [ ] All regulatory and compliance constraints have been submitted to Legal or Compliance for review, or the review is formally scheduled before requirements are finalised
- [ ] All security constraints have been confirmed with the Security team lead or equivalent
