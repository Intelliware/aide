# Impact Analysis

## Purpose

Assess the outward ripple effects of the proposed change across business processes, customers, teams, and the capabilities that support them. The outward complement to dependency-mapping (which maps what the new feature needs inward from the existing system). For each in-scope change from change-scoping, identifies: upstream consumers that depend on the affected capability (other processes, business relationships, external parties), downstream recipients that receive data or outcomes from the affected capability, shared business assets whose availability or behaviour changes (shared data, integration contracts, shared workflows), business processes and workflows directly disrupted or altered by the change, customers and end users who will experience a changed behaviour, operational readiness requirements (support, training, documentation), financial and contractual obligations triggered by the change, security and compliance surfaces affected (access controls, data handling, PII, regulatory obligations), and team ownership boundaries the change crosses (requiring coordination or approval). Each impact entry specifies: the affected element, the nature of the impact (breaking change, behavioural change, performance change, configuration change, obligation change), the severity (high/medium/low), the confidence in that assessment (high/medium/low based on evidence quality), the evidence source (business process documentation, baseline documentation, stakeholder input), and the required mitigation or coordination action. Consumes: the change-scope boundaries and dependency map. Produces an impact analysis document that feeds into risk-analysis (coordination failures and unresolved impacts become project risks) and the requirements-package.

## When to Use

- Step 4 in the analysis-workflow sequence — run after dependency-mapping completes
- Before writing requirements — impact-analysis determines what must be preserved, updated, or coordinated alongside the new feature
- Whenever the proposed change modifies something shared, exposed, or consumed by other parts of the business or its supporting capabilities

## Outward vs. Inward

| Skill | Direction | Question |
|-------|-----------|----------|
| Dependency mapping | Inward | What does the new feature need *from* the system? |
| **Impact analysis** | **Outward** | What does the change *do to* the rest of the business and its capabilities? |

Every in-scope change from change-scoping has outward effects. Some are obvious; many are not. This skill finds both.

## Impact Categories

| Category | What to Look For |
|----------|----------------|
| **Upstream consumers** | Other processes, business relationships, or external parties that depend on the capability being changed |
| **Downstream recipients** | Processes or parties that receive data, outcomes, or notifications from the changed capability |
| **Shared business assets** | Shared data, integration contracts, or shared workflows whose behaviour or availability changes — and whose other consumers are affected |
| **Business process and workflow** | Business workflows, operational procedures, or manual processes that will behave differently or be disrupted — including the roles that perform them and how they hand off work |
| **Customer and end-user experience** | End users and customers who will notice a change in behaviour, including disruption to agreed service levels or degradation to their experience |
| **Operational readiness** | Support teams, operations staff, and internal users who will need updated procedures, training, or documentation to operate the changed capability |
| **Financial and contractual obligations** | Cost implications, commercial SLA commitments to external parties, contractual notification obligations, or licensing impacts triggered by the change |
| **Security and compliance** | Changes to who can access what, how data is handled, PII exposure, audit coverage, or regulatory obligations (GDPR, HIPAA, SOC 2, PCI-DSS) |
| **Team ownership** | Team boundaries the change crosses — requiring coordination, approval, or handoff |

**Category boundary guidance:** Upstream consumers and downstream recipients capture entities that call or receive from the capability across a boundary — they depend on the capability but operate outside the changed process. Business process and workflow captures the operational workflow context *within which* the changed capability operates — the steps, roles, and handoffs that are part of the same business process. An entity that both depends on and participates in the changed process may appear in more than one category; record it in each that applies and note the overlap in the artifact.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Change scope (in-scope list) | change-scoping | Yes — defines what is changing |
| Dependency map | dependency-mapping | Yes — dependencies reveal what depends on the same elements |
| Existing-system-baseline | current-capability-synthesis | If available — integration landscape, consumers, known issues |

**Degraded-input handling:**

- **Existing-system-baseline absent** (discovery was skipped): the enumeration of upstream consumers, downstream recipients, and shared business assets in Step 1 cannot use an evidence-derived baseline. Instead, derive impact targets from the change-scope in-scope list, the dependency map, stakeholder interviews, business process documentation, and operational runbooks. All consumer and dependency claims derived this way are assumptions — seed the assumption-log with each one and cite the source. Record the absence of a baseline in the impact-analysis artifact header. Confidence levels for all impact entries default to Low until independently verified.

**In-flight parallel work:** Before beginning, check whether other features under active development also modify any in-scope component. If so, record the overlap: this impact analysis is conditional on the baseline state, and concurrent changes may invalidate specific entries. Flag all known overlaps in the artifact.

## Workflow

```
┌──────────────────────────────────────────────────┐
│  1. PER ITEM — Work through each in-scope item   │
│     For each change-scope item, assess all nine  │
│     impact categories: who uses this? who        │
│     receives output? which workflows change?     │
│     which customers are affected?                │
├──────────────────────────────────────────────────┤
│  2. CLASSIFY — Nature, severity, confidence      │
│     Breaking / Behavioral / Performance /        │
│     Configuration / Obligation                   │
│     High / Medium / Low severity                 │
│     High / Medium / Low confidence               │
├──────────────────────────────────────────────────┤
│  3. BUSINESS PROCESS, CUSTOMER AND OPERATIONAL   │
│     IMPACT — Which workflows change? Who are     │
│     the affected end users? What operational     │
│     readiness is needed? What financial or       │
│     contractual obligations are triggered?       │
├──────────────────────────────────────────────────┤
│  4. SECURITY AND COMPLIANCE IMPACT               │
│     Does the change affect access controls,      │
│     data exposure, or compliance obligations?    │
├──────────────────────────────────────────────────┤
│  5. TEAM IMPACT — Coordination needed            │
│     Which team boundaries does this change cross?│
├──────────────────────────────────────────────────┤
│  6. MITIGATE — Define the action for each impact │
│     update / preserve parallel capability /      │
│     notify / coordinate / accept / monitor       │
├──────────────────────────────────────────────────┤
│  7. SCOPE CHECK — Reassess if scope has grown    │
│     Does the impact map reveal undisclosed scope?│
├──────────────────────────────────────────────────┤
│  8. ASSEMBLE — Populate the impact-analysis doc  │
└──────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Per In-Scope Item, Find What Depends on It

For each in-scope change-scope item, assess all nine impact categories. For each category, identify everything that uses, depends on, or is downstream of the capability being changed.

**Evidence sources (in priority order):**
- Business process documentation: which workflows, roles, and external parties are documented as users of this capability
- Stakeholder consultation: ask the teams and business owners who own adjacent capabilities whether they depend on the element being changed
- Existing-system-baseline: the integration landscape and capability inventory documented during discovery
- Dependency map: if the feature depends on X, other features or processes may depend on the same thing

**Key question for each in-scope item:** If this changes, who notices — and what breaks or degrades?

**When evidence is absent:** If an evidence source yields no results, do not conclude there is no impact — conclude that the impact is *unknown*. Record the gap explicitly (e.g., "no documentation found for consumers of this capability; extent of downstream dependency is unknown"). Absent evidence lowers confidence in the severity rating and must be resolved or explicitly accepted before the artifact is signed off. Do not silently omit categories where no evidence was found.

### Step 2 — Classify Nature and Severity

**Nature of impact:**

| Nature | Definition | Example |
|--------|-----------|---------|
| **Breaking change** | Consumers must update or they fail | Removed capability, changed required input, renamed data element |
| **Behavioral change** | Consumers continue working but behaviour they rely on is different | Changed sort order, new validation rule, different default value |
| **Performance change** | Consumers experience degraded throughput, increased wait time, or reduced capacity | Increased processing time for an operations workflow, reduced volume capacity for a customer-facing process |
| **Configuration change** | Consumers need updated configuration or procedures | New required setting, changed activation default, updated operating procedure |
| **Obligation change** | A business commitment, contractual requirement, or regulatory obligation is created, altered, or triggered | New contractual notification requirement to a customer, changed licensing obligation, regulatory reporting duty activated by the change |

An impact may have more than one nature (e.g., a removed capability is both a breaking change and a configuration change for the team that operated it). Record all that apply.

**Severity:**

| Severity | Criteria |
|----------|---------|
| **High** | Breaking change for any consumer; behavioural change that produces incorrect outcomes in a downstream process; performance change that breaches a defined service level commitment; change that disrupts a business-critical workflow or a customer-facing service obligation |
| **Medium** | Behavioural change that downstream processes must accommodate but can tolerate for one release cycle without incorrect output; performance change measurably within agreed service level bounds; configuration change requiring cross-team action |
| **Low** | Configuration change completable by the immediate team with no cross-team coordination; behavioural change that does not affect any consumer's observable output |

**Confidence:**

Each severity rating must also carry a confidence level based on the quality of the underlying evidence:

| Confidence | Evidence basis |
|------------|----------------|
| **High** | Confirmed through the existing-system-baseline or explicit stakeholder confirmation from the owner of the affected element |
| **Medium** | Partial evidence — some consumers or dependencies are documented; others are inferred from stakeholder input or adjacent documentation |
| **Low** | Inferred from general knowledge of the domain; documentation absent, stale, or not directly consulted |

Low-confidence High-severity items must be escalated to the BSA for a decision on whether to gather additional evidence or accept the uncertainty before proceeding.

### Step 3 — Business Process, Customer, and Operational Impact

For each in-scope change, assess:

**Business process and workflow:**
- Which business workflows or operational procedures involve the capability being changed?
- Will any workflow step be removed, altered, or require a new handoff?
- Which roles currently perform or interact with this workflow — and will their responsibilities change?
- Are there manual procedures that compensate for current limitations? Will the change affect them?

**Customer and end-user experience:**
- Which end users or customers will experience a change in behaviour?
- Does the change affect a committed service level or a contractually defined customer experience?
- Will customers need to be notified of the change? Is there a contractual or regulatory obligation to do so?
- Does the change degrade or improve what customers can do?

**Operational readiness:**
- Which support teams, operations staff, or internal users will need updated procedures or runbooks?
- What training is required before the change can go live?
- What documentation must be updated — user guides, operating procedures, help content?
- Is there a knowledge gap that could cause operational failure post-release?

**Financial and contractual obligations:**
- Does the change affect cost structures, licensing arrangements, or capacity commitments?
- Does the change breach or alter a commercial SLA with an external party?
- Are there contractual notification obligations to customers, partners, or regulators triggered by the change?

Business process, customer, and operational impacts are classified using the same nature/severity/confidence schema as all other impacts. Financial and contractual obligation impacts use the **Obligation change** nature type defined in Step 2. High-severity impacts in any of these areas must be escalated to the BSA before the requirements phase begins.

### Step 4 — Security and Compliance Impact

For each in-scope change, assess:

- **Access controls:** Does the change alter what users or parties are permitted to do? Does it add, remove, or modify who can access what?
- **Data exposure:** Does the change cause any process or party to receive data it did not previously receive? Does it expose information to a broader audience?
- **PII and sensitive data:** Does the change affect how personally identifiable information or other sensitive data is stored, processed, or disclosed?
- **Audit coverage:** Does the change affect operations that must be audited? Will existing audit coverage be preserved after the change?
- **Regulatory obligations:** Does the organisation operate under GDPR, HIPAA, SOC 2, PCI-DSS, or equivalent? If so, does the change affect any area in scope for those obligations?
- **New exposure:** Does the change make a capability or interaction point accessible to parties who could not previously reach it?

Security and compliance impacts are classified using the same nature/severity/confidence schema as all other impacts. High-severity security impacts must be escalated to the BSA and to the security team owner (if one exists) before the requirements phase begins.

### Step 5 — Team Impact

Identify every team that owns an affected consumer, downstream process, shared asset, or business workflow.

For each cross-team impact:
- What coordination is required? (Notification only, joint planning, approval, interface contract renegotiation)
- What is the timeline dependency? (Their changes must be ready before this feature can ship)
- Who is the contact? If team ownership is undocumented, record the ownership as unknown and flag it as a risk in risk-analysis.

Cross-team impacts must be recorded in the impact-analysis artifact and explicitly carried into risk-analysis by the analyst — they do not propagate themselves.

If a team identified as a required coordinator is unavailable or unresponsive, escalate to the BSA immediately. Do not leave this as an open item in the artifact.

### Step 6 — Define Mitigation

For each impact, define the required action:

| Mitigation Type | When to Use |
|----------------|-------------|
| **Update** | The impacted consumer, workflow, or process must be changed to accommodate the new behaviour |
| **Preserve parallel capability** | The existing behaviour must be maintained alongside the new behaviour while consumers or workflows migrate — record this as a requirements constraint |
| **Notify** | Inform the owner — they will handle any updates on their side |
| **Coordinate** | Joint planning or effort required — include in delivery plan |
| **Accept** | Impact is known and acceptable — no action required |
| **Monitor** | No immediate action but watch for degradation post-release |

High-severity impacts must have an Update, Preserve parallel capability, or Coordinate mitigation — Accept and Monitor are not appropriate for high-severity items.

**When Notify is selected:** Record who will be notified, by when, and who is responsible for confirming receipt. Notify without a confirmed follow-up is not a complete mitigation.

**When no mitigation is viable:** If all appropriate mitigation types are blocked (team unresponsive, no feasible way to preserve parallel capability, timeline prevents coordination), escalate immediately to the BSA. Do not default to Accept or Monitor for a high-severity item without explicit BSA sign-off recorded in the artifact.

### Step 7 — Scope Check

After assembling impacts across all in-scope items, assess whether the aggregate impact map reveals undisclosed scope:

- If the impact analysis identifies changes not in the current change scope but required for the feature to ship safely, flag them as scope additions and return them to the BSA for a scope decision.
- Do not silently absorb undisclosed scope into mitigations. Scope additions must be explicitly acknowledged before the requirements phase begins.

### Step 8 — Assemble

Populate the `impact-analysis` artifact. Each impact entry must contain the following fields:

| Field | Value |
|-------|-------|
| **In-scope item** | The change-scope item this impact originates from |
| **Affected element** | The consumer, process, asset, customer group, or team affected |
| **Category** | One of the nine impact categories |
| **Nature** | Breaking / Behavioral / Performance / Configuration / Obligation (one or more) |
| **Severity** | High / Medium / Low |
| **Confidence** | High / Medium / Low |
| **Evidence source** | Business process documentation / baseline documentation / stakeholder input / inferred (specify) |
| **Mitigation type** | Update / Preserve parallel capability / Notify / Coordinate / Accept / Monitor |
| **Mitigation owner** | Who is responsible for executing the mitigation |
| **Notes** | Constraints, unknowns, open questions, or in-flight parallel work flags |

High-severity impacts must be reviewed with the BSA before the requirements phase begins.

## Output

A populated **impact-analysis** artifact.

### File Output

Write the completed impact analysis to `docs/<feature>/requirements-package/analysis/impact-analysis.md`.

Consumed by: risk-analysis (coordination failures and blocked mitigations become project risks) and the requirements-package.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| A change disrupts an undiscovered business workflow or customer obligation | Step 1 assesses all nine categories — including business process and customer impact — before the change ships |
| A change breaks an undiscovered consumer or dependent business relationship in production | Step 1 finds all consumers and dependent processes before the change ships |
| Cross-team coordination surfaced too late to meet the delivery timeline | Step 5 flags cross-team impacts during analysis, not during delivery |
| A security-relevant change ships without a security review | Step 4 surfaces access control, data exposure, and compliance impacts |
| Operational readiness gaps cause failure after release | Step 3 surfaces training, documentation, and support readiness requirements before delivery |
| Financial or contractual obligations are missed until post-release | Step 3 explicitly assesses commercial SLAs, contractual notifications, and cost implications |
| Scope growth is absorbed silently into mitigations, bypassing requirements | Step 7 forces an explicit scope decision before requirements are written |
| A Low-confidence High-severity item is treated as resolved without challenge | Confidence field forces evidence quality to be declared alongside every severity rating |

## Hand-off Gate

**`constraint-extraction` cannot begin until this artifact is presented.**

Before reading `constraint-extraction.md`, you must:
1. Write the completed `impact-analysis` artifact in full — every impact with its nature classification, severity, confidence, evidence source, mitigation type, and mitigation owner.
2. Present it to the BSA for review.
3. Receive explicit acknowledgement.

High-severity impacts flagged for stakeholder review must be acknowledged by the BSA before constraint-extraction begins.

---

## Completion Criteria

- [ ] Every in-scope change-scope item has been assessed against all nine impact categories — categories with no evidence must be recorded as "none found" or "unknown", not omitted
- [ ] Every impact has a nature classification (breaking / behavioral / performance / configuration / obligation) and severity (high / medium / low)
- [ ] Every impact has a confidence rating (high / medium / low) with its evidence basis stated
- [ ] Business process and workflow impacts are assessed across all in-scope items
- [ ] Customer and end-user impacts are assessed across all in-scope items
- [ ] Operational readiness requirements (training, documentation, support procedures) are identified and recorded
- [ ] Financial and contractual obligations triggered by the change are identified and recorded
- [ ] Security and compliance impacts are assessed across all in-scope items
- [ ] In-flight parallel work overlaps are identified and recorded
- [ ] Cross-team impacts are recorded in the impact-analysis artifact and explicitly carried into risk-analysis by the analyst
- [ ] Every impact has a defined mitigation type and mitigation owner
- [ ] Blocked mitigations are escalated to the BSA — not silently defaulted to Accept
- [ ] Scope additions discovered during impact analysis are returned to the BSA for a scope decision
- [ ] High-severity impacts are reviewed and acknowledged by the BSA before the requirements phase
