# Gap Analysis

## Purpose

Identify readiness gaps that could block or delay the proposed change — gaps in organisational capability, business tooling availability, adoption readiness, budget authority, data availability, process maturity, and skills — that are not captured by change-scoping (which defines what system functionality must change), dependency-mapping (which maps what the feature depends on), or constraint-extraction (which documents limits the feature must operate within). Readiness gaps are things the organisation needs to have or do but currently does not: the business lacks the operational function required to sustain a new process, end users have not been prepared to adopt the change, funding for a required third-party service has not been approved, data needed for the feature does not exist and must be sourced, or the approval process for a required third-party integration has not been started. Each gap specifies: what is missing, why it blocks or degrades the proposed change, who owns the resolution, the estimated lead time to close the gap, and the fallback if the gap cannot be closed before the feature ships. Produces a gap register that feeds into risk-analysis (gaps that cannot be closed become risks), and the requirements-package (the architect needs to know which readiness gaps constrain the design).

## When to Use

- Step 8 in the analysis-workflow sequence — run after user-journey-mapping, before assumption-log consolidation
- When any dependency has a readiness status of Gap or Uncertain
- Before the requirements-package is finalised — unresolved gaps affect the architect's design choices
- When the delivery timeline must be realistic about what the organisation needs to have in place before the feature can ship

## What This Covers

Gap analysis identifies **organisational readiness gaps** — things that must exist or be done before the feature can be built or delivered but currently do not. The comparison basis is: **current state** against **future state** (from the to-be process maps and user journey maps produced in steps 6–7).

**Current-state basis depends on whether discovery ran:**
- **Discovery completed:** current state is drawn from the `current-capability-baseline` (evidence-derived). Gap collection is grounded in verified facts.
- **Discovery was skipped:** current state is drawn from user-stated claims, not evidence. All gap assessments that rely on current-state assumptions must be marked as assumption-backed in the gap register. Direct consultation with business process owners, team leads, and subject-matter experts (see Step 1) is mandatory, not optional, in this path.

This is distinct from:

| Analysis area | What it covers |
|---------------|---------------|
| Dependency mapping | What the feature needs *from the system* (technical inputs) |
| Constraint extraction | Limits the feature must *operate within* |
| **Gap analysis** | What the **organisation** needs to *have or do* but currently does not |

Gaps are about readiness, not requirements. A gap does not describe desired behaviour — it describes a prerequisite that must be in place before the desired behaviour can be built or delivered.

**When a single situation spans multiple categories:** Apply the primary-blocker rule — categorise by the action that must happen first before any other resolution can begin. For example, if a vendor integration requires an internal legal review before the contract can be signed, the primary blocker is a Process gap (internal approval not started); the Third-party gap (contract not signed) is secondary and cannot be actioned until the Process gap is closed. The secondary category may be noted in the gap register entry but does not drive the resolution order.

**Materiality threshold:** Not every potential readiness item warrants formal registration as a gap. An item may be noted as an observation rather than a formal gap entry if all three of the following are true:
1. The lead time to resolve it is two business days or fewer
2. The delivery impact is "Workaround available" or lower
3. The business impact is "Contained to delivery"

Formal gap entries require a named resolution owner, lead time estimate, and fallback option. Observations do not — but they must still be documented in the register so downstream consumers can see what was considered and dismissed.

## Gap Categories

| Category | What makes it this category | Examples |
|----------|------------------------------|---------|
| **Business capability** | The organisation lacks the function, role structure, or operational capacity required to sustain or operate the feature | No customer support team exists for a newly introduced service channel; no operational team owns the process the feature introduces; a required business role (e.g., data steward, product authority, named approver) has not been established |
| **Adoption readiness** | Business users are not ready to adopt and use the feature as intended | End-user training has not been planned; operational procedures for the new process have not been written; the support model for the new capability has not been designed; business owners have not been engaged |
| **Budget / funding** | Financial authority to fund required resolutions has not been secured | Procurement budget for a required business tool has not been approved; funding for a compliance assessment has not been raised; the business case for a required vendor contract has not received executive sign-off |
| **Business tooling** | A business or operational tool required to support the feature or its associated processes does not exist or is not configured for this use | A reporting or analytics platform required for the new process is not available; a business application needed to operate the feature is not licensed or configured; an internal tool required for approvals or workflow management does not exist |
| **Skills & expertise** | The delivery team lacks the knowledge or experience required to build or implement a required capability | The feature requires a domain or specialist skill the delivery team does not have; no one on the delivery team has built this type of capability before; specialist knowledge required for implementation has not been identified or sourced |
| **Data availability** | Data required by the feature does not exist or is not in a usable state | Data needed for the feature does not exist yet; existing data must be cleaned or migrated before the feature can use it; a data governance or access approval has not been obtained |
| **Process** | An *internal* organisational workflow or approval chain has not been initiated | Internal change management approval has not been started; the internal procurement workflow for a business tool has not been raised; an internal sign-off chain requires a sponsor who has not been engaged |
| **Third-party / approval** | An action from an *external party* is required and has not been initiated | A vendor contract has not been signed; an API key or partnership agreement has not been requested; an SLA negotiation with an external provider has not begun |
| **Compliance** | A formal assessment against a regulatory standard or legal requirement has not been scheduled | A privacy impact assessment has not been commissioned; a security audit required by policy has not been scheduled; an accessibility certification required for the product has not been initiated |

**How to distinguish Business capability and Adoption readiness:** Business capability gaps exist when the required function, team, or role does not exist at all and must be created, hired, or outsourced. Adoption readiness gaps exist when the required function, team, or role already exists but has not been prepared to operate the new capability. If the support team does not exist — Business capability. If the support team exists but has not been trained — Adoption readiness.

**How to distinguish Skills & expertise and Adoption readiness:** Skills & expertise gaps are about the delivery team's ability to build and implement the feature. Adoption readiness gaps are about business users' ability to operate and use the feature once it is delivered. If the delivery team lacks the specialist skill to implement the capability — Skills & expertise. If end users and business operators lack the training or procedures to use the capability — Adoption readiness.

**How to distinguish Process, Third-party, and Compliance:** Process gaps are resolved internally by the organisation's own people and workflows. Third-party gaps require an external party to take action. Compliance gaps require a formal, structured assessment against an external standard or regulation — even if conducted internally, the trigger and acceptance criteria are externally defined. When a single situation involves more than one of these (e.g., a vendor contract requires internal legal sign-off first), apply the primary-blocker rule: categorise by the action that must happen first.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Change scope | change-scoping | Yes — defines what is being built; determines which gaps are in scope |
| Dependency map | dependency-mapping | Yes — Gap and Uncertain readiness statuses are primary inputs |
| Constraint register | constraint-extraction | Yes — regulatory and compliance constraints often require process or compliance gaps to be resolved |
| Impact analysis | impact-analysis | Yes — operational and business-process impacts may reveal business capability, tooling, or adoption readiness gaps |
| To-be process maps | process-mapping | Yes — future-state workflows reveal process, tooling, and business capability readiness gaps |
| To-be user journey maps | user-journey-mapping | Yes — future-state user experience flows may surface data availability and adoption readiness gaps |
| Existing-system-baseline open questions | current-capability-synthesis | Yes — unresolved open questions may represent capability, expertise, or data gaps |

> **Missing input guard:** If an expected input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[full path]` but it was not found. This input is [required/recommended] for this skill. Should I proceed without it, or can you provide it?"*

## Workflow

```
┌──────────────────────────────────────────────────┐
│  1. COLLECT — Gather gap signals from all inputs │
│     Unready dependencies, compliance triggers,   │
│     business process impacts revealing missing   │
│     capability, open questions about readiness.  │
├──────────────────────────────────────────────────┤
│  2. DEDUPLICATE & CATEGORISE — Merge overlaps,   │
│     assign gap type                              │
│     Business capability / Adoption readiness /   │
│     Budget / Business tooling / Skills /         │
│     Data / Process / Third-party / Compliance    │
├──────────────────────────────────────────────────┤
│  3. ASSESS — Delivery impact AND business impact │
│     Hard blocker / Degraded delivery /           │
│     Workaround available                         │
│     Threatens outcome / Reduces value /          │
│     Contained to delivery                        │
├──────────────────────────────────────────────────┤
│  4. PRIORITISE & ESTIMATE — Order by urgency;    │
│     estimate lead time per gap                   │
│     Who owns it, how long will it take,          │
│     and does that fit the timeline?              │
├──────────────────────────────────────────────────┤
│  5. FALLBACK — What if the gap cannot be closed? │
│     Can the feature ship without it?             │
│     At reduced scope? With a workaround?         │
│     If no fallback exists — escalate immediately │
├──────────────────────────────────────────────────┤
│  6. ESCALATE — Gaps that cannot be closed        │
│     become risks — feed into risk-analysis       │
├──────────────────────────────────────────────────┤
│  7. ASSEMBLE — Populate the gap register         │
└──────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Collect Gap Signals

Compare each input's current-state picture against the future state defined in the to-be process maps and user journey maps. Signals that reveal the organisation cannot reach the future state without action are gaps.

**From change-scoping:**
- New business capabilities or operational approaches that the organisation does not currently have the capacity, skills, or funding to support
- New vendor relationships, third-party services, or business tools introduced by the scope that have no approved budget or procurement authority — check at scoping time, not only when process maps surface the workflow

**From dependency-mapping:**
- Dependencies with readiness status **Gap** — the dependency does not exist or cannot support the feature
- Dependencies with readiness status **Uncertain** — readiness not confirmed; treat as potential gaps

**From constraint-extraction:**
- Regulatory / compliance constraints — privacy impact assessments, security audits, and accessibility certifications are Compliance gaps if they haven't been scheduled; internal approval workflows triggered by those constraints are Process gaps
- Contractual constraints — SLA or API versioning obligations that require external party negotiation or sign-off are Third-party gaps; internal legal review required before executing those obligations is a Process gap

**From impact-analysis:**
- Business-process impacts that assume a business role, team, or operational function that does not currently exist
- Operational impacts that reveal the business lacks the capacity, skills, or tooling to manage the new process

**From to-be process maps:**
- Future-state workflows that assume business tools, roles, or process steps that do not currently exist
- Future-state workflows that require budget or procurement approvals that have not been initiated

**From to-be user journey maps:**
- Future-state user experiences that depend on data, business capabilities, or operational support not yet available
- User journeys that assume end users have been trained or onboarded to the new capability

**From the existing-system-baseline open questions:**
- Any unresolved open question about current-state capability, data quality, team expertise, or business readiness

**When artifacts are incomplete:** Supplement artifact-based collection with direct consultation with business process owners, team leads, and subject-matter experts. Gaps identified through consultation must be recorded with the same fields as artifact-derived gaps.

### Step 2 — Deduplicate and Categorise

**Deduplication:** Multiple inputs may surface the same underlying gap. Before categorising, check the draft gap list for overlapping entries (e.g., a compliance constraint from constraint-extraction and a "Gap" dependency status in dependency-mapping may both point to the same missing security review). Merge duplicates into a single gap entry, noting all source signals.

**Categorisation:** Assign each gap to its primary category using the primary-blocker rule — categorise by what must be resolved first before any other action can begin. Note secondary categories where relevant.

### Step 3 — Assess Impact

For each gap, assess both **delivery impact** and **business impact** independently.

**Delivery impact** — how does the gap affect the feature's delivery:

| Impact | Definition |
|--------|-----------|
| **Hard blocker** | Feature cannot be built, tested, or deployed without closing this gap |
| **Degraded delivery** | Feature can ship but with reduced quality, scope, or confidence until the gap is closed |
| **Workaround available** | A short-term workaround exists that allows delivery to proceed; the gap is deferred but not ignored |

**Business impact** — how does the gap affect the business outcome if left unclosed:

| Impact | Definition |
|--------|-----------|
| **Threatens business outcome** | If this gap is not closed, the primary business objective of the feature cannot be achieved, regardless of whether the feature ships |
| **Reduces business value** | The business objective is achievable but the feature delivers less value, to fewer users, or with reduced quality until the gap is closed |
| **Contained to delivery** | The gap affects the timeline or delivery effort but does not materially affect what the business receives once the gap is closed |

Both dimensions must be recorded for every gap. A gap that is "Workaround available" from a delivery perspective may still "Threaten the business outcome" — these are not the same judgement and must not be conflated.

**"Workaround available" requires explicit documentation.** It is not sufficient to assert that a workaround exists. The gap register entry must state: (1) what the workaround is, (2) its cost or quality trade-off, (3) whether it is acceptable as a permanent state or must be retired, and (4) the condition or date by which the underlying gap must still be closed.

**When a workaround is proposed as permanent**, the BA/PO must explicitly accept the trade-off before it can be recorded as the fallback. A permanent workaround is a conscious product or operational decision — it cannot be self-certified by the analyst. Record the BA/PO's acceptance in the gap register entry alongside the trade-off documentation.

### Step 4 — Prioritise and Estimate Lead Time

**Prioritisation by delivery impact level:**
- **Hard blocker gaps:** order by lead time descending — the gap with the longest lead time constrains the schedule most and must be actioned first.
- **Degraded delivery gaps:** order by severity of the business impact. Ask: if this gap remains unclosed at ship, what is the worst-case impact on the business outcome? The gap with the highest business impact should be addressed first. Where two gaps are comparable, prefer the one with the longer lead time.
- **Workaround available gaps:** order by retirement urgency — the gap whose workaround has the shortest acceptable life or highest ongoing cost to maintain should be addressed first.

**Ordering dependencies between gaps:** Before finalising prioritisation, identify any gaps whose resolution depends on another gap being closed first (e.g., a vendor contract cannot be signed until an internal legal review is complete, which cannot begin until budget has been approved). Where such dependencies exist, sequence the dependent gap after its prerequisite regardless of lead time.

**Circular gap dependencies:** If Gap A cannot be resolved without Gap B, and Gap B cannot be resolved without Gap A, this is not a resolvable ordering problem — it is a structural constraint that sits above the gap register. Escalate immediately to the BA/PO. Do not assign a resolution order to circular-dependent gaps. Record both gaps as blocked pending a decision, and flag them for risk-analysis.

**For each gap, record:**
- Who is the resolution owner? (A named person or team who has the authority and capacity to drive closure — not "team TBD")
- What specific actions are needed to close it? (Training, procurement, data sourcing, contract signing, assessment submission)
- What is the lead time from decision-to-act to completion? Lead time is measured from the point the resolution owner begins action to the point the gap is fully closed — not from when the gap was identified.
- Does that lead time fit within the delivery timeline? If not, flag it for the BA/PO.

**Lead time reference ranges by category:**
Use these ranges to sense-check estimates before recording them. All estimates must be validated with the resolution owner — do not record an estimate the resolution owner has not confirmed. If an owner's estimate falls significantly outside the reference range, document the owner's stated rationale in the gap register entry before recording the estimate; do not silently accept or silently override it.

| Gap category | Typical lead time range | Key factors |
|---|---|---|
| Business capability | 8–26 weeks | Hiring, restructuring, or outsourcing timelines; onboarding cycles |
| Adoption readiness | 2–12 weeks | Training design and delivery; procedure documentation; support model design |
| Budget / funding | 1–8 weeks | Budget cycle timing; approval authority level; procurement policy |
| Business tooling | 2–16 weeks | Procurement, licensing, configuration, and user acceptance |
| Skills & expertise | 3–16 weeks | Training availability; course delivery schedule; on-the-job ramp-up |
| Data availability | 4–20 weeks | Data sourcing; cleansing and migration; governance approval |
| Process | 1–6 weeks | Internal approval chains; policy committee meeting cadences |
| Third-party / approval | 4–16 weeks | Vendor responsiveness; contract negotiation cycles |
| Compliance | 6–24 weeks | Assessment scheduling; regulatory backlog; remediation cycle |

**Owner-refusal or non-response:** If a named resolution owner disputes ownership or does not respond within five business days of being notified, escalate to the BA/PO. If ownership cannot be confirmed within a further five business days, the gap is treated as unowned and escalated to risk-analysis as a risk with no resolution path. An unowned gap cannot remain in the gap register as an open action item.

### Step 5 — Define Fallback

Every gap needs a fallback position — what happens if the gap cannot be closed in time:

- Feature descoped to avoid the gap
- Feature phased — deploy without the capability that requires the gap, add it in a follow-up phase
- Workaround accepted as permanent (with explicit trade-off documented and BA/PO acceptance recorded)

**Special case — no fallback exists:** If none of the above options are viable, the gap has no fallback and the feature cannot proceed without closing it. This is not a fallback option — it is an escalation trigger. Record the gap as delivery-blocking, escalate it to risk-analysis via Step 6, and flag it explicitly to the BA/PO before proceeding past the hand-off gate. Do not present the gap register as complete or proceed to risk-analysis as a downstream skill until the BA/PO has acknowledged each no-fallback gap.

### Step 6 — Escalate Unresolvable Gaps to Risk Analysis

Gaps that cannot be closed before the required delivery date, or whose closure is uncertain, are escalated to risk-analysis as delivery risks. The gap register entry links to the risk register entry.

### Step 7 — Assemble

Populate the `gap-analysis` template (at `../assets/gap-analysis.md`). If the template is not available, ensure every gap entry contains the following fields: gap ID, description, gap category, delivery impact, business impact, resolution owner (named person or team), specific resolution actions, lead time estimate (from decision-to-act to completion), fallback option, and status.

Every gap must have all fields populated. "TBD" is not acceptable for resolution owner or lead time.

## Output

A populated **gap-analysis** document (use the template at `../assets/gap-analysis.md`).

### File Output

Write the completed gap analysis to `docs/<feature>/requirements-package/analysis/gap-analysis.md`.

Consumed by: risk-analysis (unclosed gaps are risks) and the requirements-package (the architect needs to know which readiness gaps constrain design choices).

**Gap lifecycle:** Gaps do not disappear once the register is published. When a gap is closed:
1. Record the closure date and the evidence of closure (e.g., contract signed, training programme confirmed, assessment scheduled, budget approved) in the gap register entry
2. Update the gap status to "Closed" — do not remove the entry from the register; downstream consumers need visibility of what was resolved and when
3. If the gap had a corresponding risk register entry, notify the risk-analysis owner so the risk can be updated
4. The resolution owner confirms closure; the BA/PO verifies the evidence before the status is updated

**Version note:** If the change scope is modified after this analysis is complete, the gap register must be reassessed. Scope changes may introduce new gaps or make existing gaps irrelevant.

- **Refinements within the existing boundary** (e.g., changes within the same user journeys and system components): spot-check — re-validate every gap entry against the refined scope without re-running the full workflow.
- **Expansions that add new system components, user personas, or user journeys**: partial re-run — execute Steps 1–7 scoped to the additions only, then merge the results into the existing gap register.
- **Fundamental scope changes** (the change boundary adds or removes a primary user persona, a primary system component, or a core user journey that was not part of the original scope): treat as a new analysis and re-run the full workflow.

Record the change scope version in the gap register header so downstream consumers know which scope the register reflects.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| A third-party integration contract that takes 6 weeks to execute is discovered during implementation | Step 1 surfaces process and third-party gaps from constraint and dependency analysis during the analysis phase |
| A data migration that must precede the feature is not planned until the sprint before launch | Data availability gaps are identified here and fed into the delivery timeline |
| The team discovers they have no one with the skills to deliver the required capability | Skills & expertise gaps are identified and lead time for training or sourcing is factored into planning |
| A compliance review blocks a release | Compliance gaps are identified early and review scheduling becomes a tracked action item |
| The business has no operational team or role structure to run the new process once it ships | Business capability gaps are identified in Step 1 and assigned owners before delivery begins |
| Business users are unprepared to adopt the feature, resulting in low uptake or operational failures | Adoption readiness gaps are identified and end-user training, procedure, and support model gaps are tracked as formal actions |
| A required vendor contract or tool has no approved funding, blocking procurement | Budget / funding gaps are identified and escalated before procurement is blocked |
| The gap register is filed and never acted on | Step 7 requires named resolution owners; the hand-off gate requires ownership acknowledgement before proceeding |

## Hand-off Gate

**Requires: all required inputs consulted; gap register reviewed and acknowledged.**

Before reading `risk-analysis.md`, confirm that all of the following were consulted during gap collection (Step 1):
- `docs/<feature>/requirements-package/analysis/change-scope.md` — the scope against which gaps were identified
- `docs/<feature>/requirements-package/analysis/dependency-map.md` — including all Gap and Uncertain entries
- `docs/<feature>/requirements-package/analysis/constraint-register.md` — including all regulatory and compliance constraints
- `docs/<feature>/requirements-package/analysis/impact-analysis.md` — including all operational and business-process impacts
- `docs/<feature>/requirements-package/analysis/process-map-[process-name].md` — future-state workflows
- `docs/<feature>/requirements-package/analysis/user-journey-[journey-name].md` — future-state user experience flows

Then:
1. Write the completed `gap-analysis` artifact in full — every gap with its category, delivery impact, business impact, resolution owner, lead time estimate, and fallback option.
2. Present it to the BA/PO for review.
3. Receive explicit acknowledgement.
4. Confirm that each named resolution owner has been notified and has acknowledged their responsibility. A gap owner who does not know they own a gap is not an owner.

Gaps with no fallback must be resolved or explicitly accepted by the BA/PO before proceeding to risk-analysis. Gaps with lead times exceeding the delivery timeline must be explicitly noted for the BA/PO before proceeding.

---

## Completion Criteria

- [ ] All required inputs (change-scope, dependency-map, constraint-register, impact-analysis, to-be process-maps, to-be user-journey-maps, baseline open questions) have been reviewed for gap signals
- [ ] All Gap and Uncertain dependency-map entries have a corresponding gap register entry
- [ ] All regulatory / compliance constraints have been checked for associated process or compliance gaps
- [ ] All open questions from the current-capability-baseline have been assessed for gaps (capability, expertise, and data availability)
- [ ] To-be process maps and user journey maps have been reviewed for business capability, tooling, adoption readiness, and data prerequisites not yet in place
- [ ] Business capability gaps have been assessed for all new operational processes or functions the feature introduces
- [ ] Adoption readiness gaps have been assessed for all user-facing features and process changes
- [ ] Skills & expertise gaps have been assessed for every capability the delivery team is required to build or implement that it has not previously delivered
- [ ] Budget / funding gaps have been identified for every gap whose resolution requires a procurement, contract, or assessment that has not yet received financial approval
- [ ] Duplicate gap signals from multiple inputs have been merged into single gap entries
- [ ] Every gap has a category, delivery impact, business impact, resolution owner, lead time estimate, and fallback
- [ ] All "Workaround available" gaps have the workaround explicitly documented: what it is, its cost, durability, and retirement condition
- [ ] Gaps with no viable fallback have been flagged to the BA/PO and acknowledged before proceeding
- [ ] All gaps are prioritised within their delivery impact level using the rules in Step 4 (hard blockers by lead time descending; degraded delivery by worst-case business impact; workaround available by retirement urgency)
- [ ] Gaps with lead times that exceed the delivery timeline are escalated to risk-analysis
- [ ] Resolution owners are named people or teams — not "TBD"
- [ ] Lead time estimates have been validated with resolution owners — not self-estimated by the analyst
- [ ] All named resolution owners have been notified and have acknowledged their responsibility
- [ ] All escalated gaps link to their corresponding risk register entries
- [ ] Gaps closed during analysis are recorded with closure date and evidence; downstream consumers notified
- [ ] The gap register records the change scope version it was produced against
