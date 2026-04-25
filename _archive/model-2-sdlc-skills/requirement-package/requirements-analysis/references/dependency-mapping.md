# Dependency Mapping

## Purpose

Map what the new feature depends on from the existing system — the business capabilities, data, services, integrations, access controls, and shared logic it needs in order to function. The inward complement to impact-analysis (which maps what the change affects outward).

## When to Use

- Step 3 in the analysis-workflow sequence — run after change-scoping, before impact-analysis
- The proposed change needs to call, read, write, or extend anything in the existing system
- Before the architect designs the feature — the dependency map defines what the new feature connects to

## Inward vs. Outward

Dependency mapping and impact-analysis are two halves of the same analysis:

| Skill | Direction | Question |
|-------|-----------|----------|
| **Dependency mapping** | **Inward** | What does the new feature need *from* the existing system? |
| **Impact-analysis** | Outward | What does the change *affect* in the existing system? |

Both are necessary. A dependency that is not mapped is a design assumption. An impact that is not mapped is a surprise.

**Overlap:** writing to a shared data entity is simultaneously an inward dependency (the feature depends on that data being available in a certain shape) and an outward impact (other consumers of that data are affected by what the feature writes). Map it here as a dependency and separately flag it in impact-analysis. On the dependency entry, record in the `Notes` field: "Also flagged in impact-analysis — [brief reason]." Do not assume one skill covers both directions.

## Dependency Types

| Type | Examples |
|------|---------|
| **Internal capability** | Business capabilities within the existing system the feature must use to retrieve, submit, or process information — payment processing, notification dispatch, customer lookup, order management |
| **Data** | Data sets or data entities the feature must read from or write to — customer records, order history, product catalog, transaction log |
| **Process / workflow** | Scheduled or automated processes the feature must trigger, respond to, or coordinate with |
| **Shared capability** | Existing platform capabilities the feature reuses rather than rebuilds — pricing engines, address validation, document generation, reporting pipelines |
| **Access control** | Authentication mechanisms and permission checks the feature must satisfy — login flows, role gates, permission checks |
| **UI** | Shared navigation, page layouts, or design system components the feature must integrate with |
| **External** | Third-party systems, partner integrations, or SaaS platforms the feature will call |
| **Business logic** | Existing business rules, calculation rules, or validation logic the feature must reuse rather than duplicate |
| **Restricted** | Existing system elements the feature must explicitly *not* use — legacy stores, deprecated services, or components stakeholders have prohibited. Record the reason for the exclusion. |

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Change scope (in-scope list) | change-scoping output | Yes — defines the boundary of what the new feature does |
| Existing-system-baseline | current-capability-synthesis | Yes — integration landscape and capability inventory |
| Confirmed requirements | requirements-elicitation | Yes — the requirements reveal what the feature must do, which reveals what it needs |

**"Confirmed requirements"** means requirements that have been agreed by elicitation stakeholders and recorded in the elicitation output — not requirements still open for discussion or subject to unresolved disagreement. If requirements-elicitation surfaced open disputes, those requirements are not confirmed. See degraded-input handling below for how to proceed when requirements are unconfirmed.

**Degraded-input handling:**

- **Baseline absent** (discovery was skipped): the enumeration in Step 1 cannot use an existing-system-baseline as the authoritative source. Instead, derive dependencies directly from the confirmed requirements, the proposed change description, the change-scope in-scope list, and any system knowledge the BSA can obtain through stakeholder interviews or codebase inspection. All system claims derived this way are assumptions — seed the assumption-log with each one and reference the source. Record the absence of a baseline in the dependency-map artifact header. Readiness validation (Step 3) is operating without ground truth; every readiness status except `Gap` must be treated as provisional until verified with the named owner.
- **Baseline stale** (more than six months old, or more than two significant releases behind current — teams on faster cadences should shorten this window): proceed with the baseline but flag every readiness claim as provisional. Record the staleness in the artifact header and note it in the assumption-log. Stale readiness claims are risks that must surface in risk-analysis.
- **Change scope incomplete**: stop. The scope boundary is required before enumeration can be scoped correctly. Return to change-scoping before proceeding.
- **Requirements unconfirmed**: flag each dependency derived from an unconfirmed requirement as an assumption, referencing the requirement ID. Do not treat unconfirmed requirements as a stable enumeration basis.

## Workflow

```
┌──────────────────────────────────────────────────┐
│  1. ENUMERATE — List what the feature needs      │
│     Read each confirmed requirement and ask:     │
│     what existing system element must the        │
│     feature call, read, write, or extend?        │
├──────────────────────────────────────────────────┤
│  2. CLASSIFY — Assign dependency type            │
│     Internal capability / Data / Process /       │
│     Shared capability / Access control / UI /    │
│     External / Business logic / Restricted       │
├──────────────────────────────────────────────────┤
│  3. VALIDATE — Is the dependency ready?          │
│     Does the existing element currently          │
│     support what the feature needs? Or does it   │
│     need to be extended first?                   │
├──────────────────────────────────────────────────┤
│  4. ASSESS — What if the dependency is           │
│     unavailable or not ready?                    │
│     Feeds into gap-analysis and risk-analysis.   │
├──────────────────────────────────────────────────┤
│  5. ASSEMBLE — Populate the dependency-map       │
└──────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Enumerate Dependencies

Work through each confirmed requirement and each in-scope item from change-scoping. For each, ask:

- What **existing business capabilities** must the feature use rather than build from scratch? Which internal capabilities (payment processing, customer lookup, notification dispatch) does the feature need, and which platform capabilities (pricing, address validation, document generation) must it reuse?
- What **data** must the feature read or write? Which existing data sets provide or store that data?
- What **access control** must the feature satisfy? Which login flows, role gates, or permission checks apply?
- What **automated processes or background jobs** must the feature trigger, respond to, or coordinate with?
- What **UI components or layouts** must the feature integrate with?
- What **external systems** must the feature use?
- What **existing business logic** must the feature reuse rather than duplicate?

Name each dependency specifically enough to identify it and its owner — not "the customer system" but "the customer address lookup capability" or "the order history dataset."

**Negative dependencies (Restricted type):** enumerate what the feature must explicitly *not* use — legacy components, deprecated data stores, or system elements that stakeholders have prohibited. Record these with type `Restricted` and a note explaining the exclusion. Failure to capture prohibitions creates implicit constraints that appear nowhere in the requirements package and will surface as surprises during design.

**Transitive dependencies:** if a dependency has `Gap` or `Uncertain` readiness, assess whether its own upstream dependencies are material to resolution. Do not enumerate the full dependency graph — trace one level deeper only when the intermediate dependency is a blocker and its upstream dependency is something the BSA must be aware of to advise on timeline or risk. Record transitive dependencies with a note referencing the intermediate dependency: "Transitive — surfaces because DEP-003 is Gap; this capability cannot be extended until the upstream data migration completes."

### Step 2 — Classify and Describe Current State

For each dependency, record:

- Its **type** (from the taxonomy above)
- Its **current state** — what does it currently support that the feature can use? Describe at a functional level: what the dependency does today, not how it is implemented.
- Its **criticality**: `Critical` (feature cannot function at all without this dependency) or `Non-critical` (feature works at reduced capability without it). **Conditional:** if a dependency is only required in certain execution paths, record it as `Non-critical` and add a note: "Required when [condition] — feature operates without it via [alternate path]." Do not mark a conditional dependency `Critical` because the condition may sometimes apply; criticality reflects the feature's baseline behaviour.
- Its **owner**: the team or named individual who controls changes to this element and is the first point of contact for readiness questions. If ownership is unclear or disputed, record `Owner: unresolved` and add an entry to the assumption-log. "Unresolved" is an acceptable placeholder only when paired with an assumption-log entry that names who will resolve it and by when.
- Its **escalations**: downstream handoffs triggered by this dependency — gap-analysis (if readiness is `Gap` or `Uncertain`), risk-analysis (if cross-team), assumption-log (if `Uncertain` or any claim is unverified). Record `None` if no escalations apply.
- Its **notes**: any cross-references, overlap flags, transitive dependency relationships, conditional path details, or blocking relationships identified in Steps 1 and 4. Record `None` if none apply.

**Ownership disputes:** if two teams each claim the other owns the dependency, escalate to the BSA's accountable stakeholder with a deadline for resolution. Record in the assumption-log: both claimants, the date escalated, and the date by which the accountable stakeholder must resolve it. A dependency with a genuine ownership dispute is a risk — flag it for risk-analysis regardless of its readiness status. Do not leave it in `Owner: unresolved` indefinitely on the assumption that it will sort itself out.

### Step 3 — Validate Readiness

For each dependency, assess whether it currently supports what the new feature needs:

| Readiness Status | Meaning |
|-----------------|---------|
| **Ready** | The dependency supports the feature's needs today — no changes required |
| **Needs extension** | The dependency exists but currently lacks the specific capability the feature requires — it must be extended before the feature can use it |
| **At risk** | The dependency is currently usable but is subject to a planned deprecation, breaking change, or ownership transfer that may affect availability before the feature ships |
| **Gap** | The dependency does not exist or cannot support the feature's needs — flag in the dependency-map for gap-analysis to consume |
| **Uncertain** | Cannot determine readiness from available evidence — see resolution guidance below |

**Ready:** before recording `Ready`, confirm with the named owner that the dependency supports the feature's specific needs — do not assign `Ready` based on documentation or inference alone. Record who confirmed it and on what date in the `Current state` field (e.g., "Confirmed ready by J. Smith, Payments team, 2026-04-08"). If the owner cannot confirm within the time available, assign `Uncertain` rather than assuming readiness.

**Needs extension:** record the specific extension required in functional terms (e.g., "the order management service must be updated to support a 'cancelled' status"). Log a decision in `docs/<feature>/requirements-package/analysis/decision-log.md` capturing: the dependency name, the extension required, and the team responsible for deciding whether and when it is made. The scope implications of that extension are a separate conversation between the BSA and the Accountable stakeholder after the dependency-map is reviewed — do not update the change-scope from within this skill. If the responsible party subsequently determines the extension is not feasible, reclassify the dependency as `Gap` and update the dependency-map and decision-log accordingly.

**At risk:** record the deprecation timeline or planned change event. Assess whether the feature's target ship date is before or after that event. If the dependency will be gone or incompatible before the feature ships, reclassify it as a Gap. If uncertain, log it as an assumption with a resolution date.

**Uncertain:** log each Uncertain item in the assumption-log with: (a) what specifically is unknown, (b) the named person or team who can resolve it, and (c) the latest acceptable resolution date. Do not advance past the hand-off gate with Uncertain items that have no owner or no resolution date — unresolved uncertainty without a resolution path is a risk, not a documentation state.

### Step 4 — Assess Availability Risk

For each dependency, consider: what happens if it is unavailable or not ready at the time the feature is built?

- Is this a hard blocker (feature cannot work without it) or non-critical (feature works at reduced capability)? This must match the criticality recorded in Step 2 — `Critical` here must align with `Critical` there; `Non-critical` here must align with `Non-critical` there. Contradictions between Step 2 and Step 4 indicate one of the two assessments is wrong.
- Is there an alternative if this dependency is not available?
- Who controls this dependency's readiness — the same team or another?

Cross-team dependencies must be flagged in the dependency-map so that risk-analysis can consume them as dependency risks. Dependencies with `Gap` or `Uncertain` readiness must similarly be flagged in the dependency-map for gap-analysis to consume. Neither is a real-time escalation — both are flags on the artifact that downstream skills pick up when they read it.

**Dependency sequencing:** where multiple dependencies have `Gap` or `Uncertain` readiness, assess whether resolving one is a prerequisite for assessing another. Record blocking relationships in the `Notes` field of the blocked dependency: "Resolution blocked until DEP-003 ownership is confirmed — the scope of the extension cannot be determined without the owning team." Sequencing information feeds risk-analysis when it assesses delivery risk across dependent resolution streams. A cluster of mutually blocking Gaps is a higher risk than the same number of independent Gaps.

### Step 5 — Assemble

Populate the `dependency-map` template. Group dependencies by type for readability.

**Worked example — a single dependency entry:**

| Field | Example |
|-------|---------|
| ID | DEP-007 |
| Requirement | REQ-014 — allow order cancellation after payment |
| Type | Internal capability |
| Name | Order management — order status tracking |
| Current state | Currently supports order statuses: pending, processing, shipped. Cancelled status is not supported. Confirmed with Payments team (J. Smith, 2026-04-08). |
| Criticality | Critical |
| Owner | Payments team |
| Readiness status | Needs extension — must be updated to support a cancelled order status |
| Decision logged | DECISION-012 — Payments team to confirm feasibility and delivery timeline before design begins |
| Escalations | None — same-team dependency, not a Gap |
| Notes | Also flagged in impact-analysis — existing order history views will be affected by the addition of a cancelled status. |

## Output

A populated **dependency-map** document (use the template at `../assets/dependency-map.md`).

### File Output

Write the completed dependency map to `docs/<feature>/requirements-package/analysis/dependency-map.md`.

Consumed by: impact-analysis (dependencies reveal what is touched and therefore what has impact), gap-analysis (unready dependencies may be gaps), risk-analysis (cross-team dependencies are risks), and the requirements-package to the architect.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Feature designed against an interface that does not yet exist | Readiness validation (step 3) surfaces gaps before design |
| Feature duplicates logic that already exists in the system | Step 1 explicitly asks "what existing logic must the feature reuse?" — Logic is a named dependency type |
| Cross-team dependency discovered during implementation | Step 4 flags cross-team dependencies for risk-analysis during analysis phase |
| Feature built against a dependency that requires work from another team, discovered mid-implementation | Step 4 flags cross-team dependencies during analysis so coordination begins early |
| Auth/permission model for the new feature not designed | Auth dependencies are explicitly typed and validated |
| Feature ships against a dependency being deprecated | "At risk" readiness status surfaces deprecation timelines before design begins |
| Extension decisions absorbed silently with no record | "Needs extension" items are logged as decisions — not silent scope edits |

**Failure modes this skill can introduce if executed poorly:**

| Failure mode | Mitigation |
|---|---|
| "Ready" assigned without verifying with the owner | Readiness claims must be confirmed with the named owner, not inferred from available documentation alone |
| Uncertain items logged but never resolved | Every Uncertain entry must have a named resolution owner and a deadline in the assumption-log |
| Shallow enumeration that produces a technically compliant but substantively incomplete map | The completion criterion requires coverage that is plausibly complete given each requirement's scope — a single dependency for a multi-system requirement is not plausibly complete; the BSA reviewer checklist explicitly asks whether coverage depth is adequate |

## Late-Discovered Dependencies

The hand-off gate between dependency-mapping and impact-analysis is a quality gate, not a one-way door. Impact-analysis routinely surfaces dependencies that were not visible during enumeration. When this occurs:

1. Add the dependency to the dependency-map with a note: "Late addition — surfaced during impact-analysis."
2. Assess its readiness status before impact-analysis proceeds past the point where the discovery occurred.
3. If the late-discovered dependency is `Critical` and has `Gap` or `Uncertain` readiness, treat it as a blocker — notify the BSA before impact-analysis continues.
4. Update the assumption-log and decision-log with any new unresolved items the dependency generates.

The dependency-map is a living document throughout the analysis phase. It is only frozen when risk-analysis (Step 11) is complete.

## Hand-off Gate

**`dependency-mapping` must complete before `impact-analysis` begins. This skill does not run in parallel with impact-analysis** — impact-analysis consumes the dependency-map as a required input (see analysis-workflow outputs table).

Before reading `impact-analysis.md`, you must:
1. Write the completed `dependency-map` artifact in full — every dependency with its type, current state, readiness status, owner, criticality, escalations, and notes fields populated (or explicitly `None`).
2. Present it to the BSA for review. The BSA review must address:
   - Are all confirmed requirements represented by at least one dependency, and does the coverage depth look plausibly complete for each requirement's scope?
   - Does any dependency carry `Uncertain` status without a named resolution owner and date?
   - Are all `Needs extension` items recorded in the decision-log with a responsible party?
   - Are any `Critical` dependencies marked `At risk` or `Gap` without a corresponding escalation?
3. Receive explicit acknowledgement before proceeding.

---

## Completion Criteria

> **Note on the relationship between the Hand-off Gate and these criteria:** the Hand-off Gate is a *process gate* — the conditions under which dependency-mapping may hand off to impact-analysis (artifact written, BSA review conducted, acknowledgement received). The completion criteria below are a *quality checklist* — the conditions that define whether the dependency-map artifact itself is complete. An artifact that passes the hand-off gate review must also satisfy the completion criteria. The hand-off gate review is the mechanism; the completion criteria are the standard against which the artifact is judged.

- [ ] Every confirmed requirement has been traced to at least one dependency, and the dependency coverage for each requirement is plausibly complete given the requirement's scope
- [ ] Every dependency has a type, current state description, criticality, owner (or `Owner: unresolved` with an assumption-log entry), readiness status, and a `Notes` field (populated or explicitly `None`)
- [ ] `Restricted` dependencies (negative dependencies) have been enumerated for any system elements that stakeholders have prohibited the feature from using
- [ ] `Needs extension` dependencies are recorded in `docs/<feature>/requirements-package/analysis/decision-log.md` with the specific extension required in functional terms and a responsible party
- [ ] `At risk` dependencies have a deprecation or change timeline recorded
- [ ] Gaps (dependencies that do not exist or cannot support the feature's needs) are flagged in the dependency-map for gap-analysis to consume
- [ ] `Uncertain` readiness items are logged in the assumption-log with a named resolution owner and a resolution deadline
- [ ] Cross-team dependencies are flagged for risk-analysis
- [ ] Ownership disputes are escalated and recorded in the assumption-log with both claimants, the escalation date, and a resolution deadline
- [ ] Any overlap dependencies (also flagged in impact-analysis) are noted in the `Notes` field
- [ ] The BSA reviewer has confirmed all confirmed requirements are covered and no `Uncertain` items are ownerless
