# Business Objectives

## Purpose

Define measurable business objectives the feature must achieve — the outcomes the business expects, expressed as quantifiable targets with success criteria. Business objectives sit above functional requirements: they answer "what business outcome must this deliver?" while functional requirements answer "what must the system do?" Every functional requirement should trace to at least one business objective, and every business objective should be achievable through the specified requirements. If the analysis phase ran, consumes the change-scope (which defines what the change aims to achieve), the risk register (which identifies risks to objective achievement), and the constraint register (which identifies hard limits that bound objective achievement). If a gap register also exists, uses it for additional readiness risks. If analysis was skipped, the user provides objectives directly. Produces a business objectives document that becomes Section 3 of the requirements package.

## When to Use

- After executive-summary and stakeholder-personas — business objectives require understanding of the business context and who the stakeholders are
- Before functional-requirements — objectives frame what the requirements must collectively achieve
- When the business needs measurable targets to evaluate whether the feature succeeded after delivery

## What This Produces

A business objectives document with:

1. **Primary objectives** — the measurable business outcomes this change must deliver
2. **Success metrics** — for each objective, a quantifiable target with measurement method, baseline, target value, and accountability
3. **Objective-to-requirement areas** — a forward reference identifying which requirement areas will support each objective. This is a placeholder at this stage: requirement area names are populated now; specific requirement IDs are added after the functional-requirements step is complete (see Traceability Update below)
4. **Constraints on objectives** — conditions or dependencies that limit objective achievement

## Did Analysis Run?

Use the same check the requirements workflow uses:

**Analysis completed** if all of the following exist:
- `docs/<feature>/requirements-package/analysis/change-scope.md` from change-scoping
- `docs/<feature>/requirements-package/analysis/constraint-register.md` from constraint-extraction
- `docs/<feature>/requirements-package/analysis/risk-register.md` from risk-analysis
- `docs/<feature>/requirements-package/analysis/assumption-log.md` from assumption-log consolidation

> **Note on `stakeholder-map`:** The analysis stakeholder-mapping step always runs (step 1 in the analysis workflow). `docs/<feature>/requirements-package/analysis/stakeholder-map.md` is always produced when analysis ran. Use it alongside the other analysis artifacts when analysis completed.

If analysis completed → derive objectives from the change-scope's stated goals; use the risk register for constraints on objectives. If `docs/<feature>/requirements-package/analysis/gap-analysis.md` also exists, use it to identify additional objective achievement risks — but its absence does not indicate analysis was skipped.

**Analysis was skipped** if any of the four core artifacts above are missing:
- The user provides business objectives directly; these are stakeholder-confirmed requirements — the stakeholder is stating what the business needs
- What is not confirmed is whether the existing system can support achieving those objectives within the constraints — system delivery risk, technical feasibility, and constraint compatibility are the unknowns, not the objectives themselves. Record each such uncertainty as an assumption in the assumption log (see Assumption Recording below)

## Inputs

| Input | Source | Required | If analysis was skipped |
|-------|--------|----------|------------------------|
| Proposed change description | User or project brief | Yes | User provides directly |
| Change-scope | change-scoping (analysis phase) | If available | User describes what the change aims to achieve |
| Risk register | risk-analysis (analysis phase) | If available | User identifies risks to objective achievement |
| Constraint register | constraint-extraction (analysis phase) | If available | User identifies constraints on objective achievement |
| Gap register | gap-analysis (analysis phase) | If available | User identifies known readiness gaps |
| Executive summary | executive-summary (this phase) | Yes | Completed in the prior step |
| Stakeholder-personas | stakeholder-personas (this phase) | Yes | Completed in the prior step |

## Assumption Recording

Throughout this skill, "record as an assumption" means: add an entry to the **assumption log** for this requirements engagement. If analysis ran, the assumption log was produced during the analysis phase (`docs/<feature>/requirements-package/analysis/assumption-log.md`) — append to it. If analysis was skipped, create or maintain a running assumption log as a separate document (`docs/<feature>/requirements-package/requirements/assumption-log.md`) during the requirements phase.

Each assumption entry must include:

| Field | What to capture |
|-------|----------------|
| **ID** | Sequential identifier (e.g., A-01) |
| **Assumption** | A single declarative statement of what is being assumed |
| **Rationale** | Why this is an assumption rather than a confirmed fact |
| **Owner** | The person responsible for resolving or confirming the assumption |
| **Resolution deadline** | The latest date by which this must be resolved (typically: before the hand-off gate at which the assumption becomes a blocker) |
| **Status** | Open / Confirmed / Invalidated |

An assumption that remains Open at the hand-off gate must be explicitly acknowledged by the business sponsor or product owner before proceeding.

## Workflow

```
┌──────────────────────────────────────────────────────┐
│  1. ELICIT — Gather business objectives from         │
│     available sources. If analysis ran, derive from   │
│     change-scope goals. If not, ask the user.        │
├──────────────────────────────────────────────────────┤
│  2. DEFINE — Write each objective precisely          │
│     Outcome-focused, not activity-focused            │
│     Business language, not technical language         │
│     Feasibility-checked against scope of change      │
├──────────────────────────────────────────────────────┤
│  3. MEASURE — Define success metrics                 │
│     Baseline value, target value, measurement        │
│     method, measurement timeline, ownership          │
├──────────────────────────────────────────────────────┤
│  4. PRIORITISE — Rank objectives and check conflicts  │
│     Primary (must achieve) vs secondary (should      │
│     achieve); confirm no objectives undermine others  │
├──────────────────────────────────────────────────────┤
│  5. CONSTRAIN — Identify constraints on achievement  │
│     Dependencies, gaps, risks that affect delivery   │
├──────────────────────────────────────────────────────┤
│  6. ASSEMBLE — Populate the business-objectives      │
│     template                                         │
└──────────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Elicit Business Objectives

**Before eliciting:** Confirm that the person you are engaging with has authority to commit the business to these outcomes. The required stakeholder is the business sponsor or product owner — not the project coordinator, not a subject-matter expert, not a proxy who will "check with" someone else. If that person is unavailable, follow the hand-off gate procedure for unavailable stakeholders (see Hand-off Gate, item 5) before proceeding.

**If analysis ran:**
- Read the change-scope for the stated goals of the change
- Read the executive summary for the business problem and cost of inaction
- Derive objectives from these sources: each goal in the change-scope should map to at least one measurable business objective
- After deriving, apply the quality rules in Step 2 to every derived objective before accepting it — analysis artifacts do not guarantee the goals they contain are outcome-focused, measurable, or achievable as written

**If analysis was skipped:**
Ask the user the following questions. Ask **one question at a time** and wait for the response before asking the next:

1. **What business outcomes do you expect from this change?** (not what the system should do, but what the business should gain)
2. **How will you know the change was successful?** (what metrics would you look at 3–6 months after delivery?)
3. **What is the most important outcome?** (if the change could only achieve one thing, what would it be?)
4. **Who in the business is accountable for each outcome?** (the product owner, business sponsor, or named executive)
5. **Is there anything the business will hold this change responsible for that is outside what we have described as in-scope?** (use this to surface expectations the stakeholder has that the feature as currently scoped cannot deliver — these become out-of-scope business goals, not objectives in this document)

Treat objectives stated directly by the stakeholder as stakeholder-confirmed requirements — the stakeholder is telling you what the business needs. What requires assumption tracking is whether the existing system can deliver those outcomes within the stated constraints; record each such uncertainty as an assumption. Apply the quality rules in Step 2 before accepting any objective — do not carry forward objectives that fail the quality check without flagging them as gaps.

### Step 2 — Define Each Objective

Write each objective using this structure:

- **Outcome-focused:** "Reduce customer support ticket volume for account-related issues by 30%" — not "Build a self-service account management feature"
- **Business language:** no technical implementation detail
- **Timebound:** include the measurement window ("within 6 months of launch")

The **feasibility check** referenced in the workflow diagram is performed here, via the Achievable criterion in the quality rules below. An objective fails the feasibility check when its outcome cannot be delivered by the change as currently scoped — either because it depends on capabilities outside the scope boundary, or because it depends on other in-flight projects or third-party decisions the team does not control. Flag cross-project dependencies explicitly; they are not the same as out-of-scope capabilities and must be tracked as delivery risk assumptions (see Assumption Recording).

**Objective quality rules — apply these before accepting any objective:**

| Criterion | Check | Fix if failing |
|-----------|-------|----------------|
| **Specific** | Is the outcome unambiguously defined? Could two people interpret it differently? | Rewrite with a concrete, bounded outcome |
| **Measurable** | Is there a quantifiable threshold? | Add a number, percentage, or observable condition |
| **Achievable** | Is this outcome within the scope of influence of the change being specified? Does it depend on capabilities, systems, or decisions outside the scope boundary? | If the objective depends on out-of-scope factors, flag it as constrained and document the dependency; do not accept it as a standalone objective |
| **Relevant** | Does this objective connect to the business problem stated in the executive summary? | If no executive summary business driver supports this objective, escalate before accepting |
| **Timebound** | Is there a measurement window? | Add a measurement horizon |
| **Independent** | **(a) Decomposition:** Does achieving this objective automatically and entirely deliver another listed objective? **(b) Conflict:** Does aggressively pursuing this objective risk undermining another? These are distinct checks — (a) identifies redundancy; (b) identifies trade-offs. | For (a): merge or split the dependent objectives. For (b): do not merge — flag the pair as a conflict for the Step 4 conflict check. Treat them separately; conflating them produces wrong fixes. |

**Example of an objective that passes the quality check:**

> **Objective:** Reduce customer support ticket volume for account-related issues by 30% within 6 months of launch.
> **Why it passes:** Specific outcome (ticket volume, account issues), measurable threshold (30%), achievable by the self-service account management feature in scope, relevant to the executive summary's cost-of-inaction (support costs), timebound (6 months post-launch), independent of other stated objectives.

**On the number of objectives:** Aim for 2–5. Fewer than 2 suggests the business case has not been clearly articulated — a single objective may indicate missing stakeholder perspectives or an incomplete problem decomposition; probe for additional outcomes before accepting a singleton list. More than 5 suggests either the scope of the change is too broad to be managed as a single requirements effort, or the objectives are too granular and should be consolidated under higher-order outcomes. These are diagnostic signals, not hard limits — do not pad objectives to reach 2, or merge distinct outcomes to stay below 5. If the count falls outside the range, document the reason in the business-objectives document.

### Step 3 — Define Success Metrics

For each objective, specify:

| Field | What to capture |
|-------|----------------|
| **Metric name** | The specific measurement (e.g., "support ticket volume for account issues") |
| **Baseline value** | Current measurement, if known. If unknown, state "baseline to be measured before launch" |
| **Target value** | The quantified success threshold (e.g., "≤ 70 tickets/month, down from ~100 tickets/month") |
| **Measurement method** | How this will be measured (dashboard, analytics tool, survey, manual count) |
| **Measurement timeline** | When to measure (e.g., "3 months post-launch, measured monthly through month 6") |
| **Measurement owner** | Who is responsible for capturing and reporting the metric |
| **Objective owner** | Who is accountable for the business outcome — the named stakeholder or role who will be held responsible if the objective is not achieved. If unknown at this stage, record "to be confirmed before hand-off" and flag as a gap action item |

If the baseline is unknown, flag as a gap action item. The gap action item must name the person responsible for capturing the baseline (typically the measurement owner) and specify the latest acceptable capture date — no later than the start of acceptance testing. If no owner can be assigned at this stage, escalate to the objective owner; an unowned baseline gap is itself a gap action item. Success metrics without baselines cannot be evaluated post-launch.

If the measurement timeline is unknown, flag as a gap action item. A target value without a review date cannot be enforced.

If the objective owner is unknown or disputed, flag as a gap action item. Do not proceed past the hand-off gate with an unowned Primary objective — the business sponsor or product owner must confirm ownership as part of the hand-off review. An unresolved Primary objective owner is a blocker.

**Non-functional implications:** When a success metric contains a performance, volume, availability, or reliability threshold (e.g., "process 10,000 transactions per day," "achieve 99.9% uptime"), that threshold implies non-functional requirements. Do not embed the NFR in the objective — the objective describes the business outcome; the NFR will be captured in the non-functional requirements step. Instead, flag the metric with a note: "This target implies NFRs — carry forward to non-functional requirements." The linkage must be explicit so the NFR step does not rediscover it independently with a potentially different value.

### Step 4 — Prioritise Objectives and Check for Conflicts

**Assign each objective a priority tier:**

| Tier | Meaning | Implication for requirements |
|------|---------|------------------------------|
| **Primary** | Must achieve — the feature is considered a failure if this objective is not met | Requirements that directly support this objective are strong candidates for Must-have; confirm MoSCoW priority when writing functional requirements |
| **Secondary** | Should achieve — important but the feature can ship without it in the short term | Requirements supporting this may be phased |

At least one objective must be Primary. If all objectives are Secondary, the business case is underspecified — ask the stakeholder which outcome they cannot accept missing.

**Secondary objective lifecycle:** Secondary objectives must be reviewed at each phase gate. If delivery scope is reduced, Secondary objectives and their supporting requirements are the first candidates for deferral — but deferral must be a deliberate decision confirmed by the objective owner, not a silent descope. A Secondary objective deferred to a future phase must be removed from this document and recorded as an out-of-scope business goal in the assumptions-constraints-scope register, with the target phase and the deferral decision-maker named. A Secondary objective that is deferred without documentation becomes invisible; it will resurface as a stakeholder complaint after delivery.

**Regulatory and compliance objectives** require distinct handling. When an objective is driven by a regulatory, legal, or contractual obligation:

- Mark it **Primary** regardless of business preference — it is not negotiable
- Document the regulatory source (legislation name and clause, standard reference, or contractual obligation) as a constraint authority entry; the objective owner for a compliance objective is the compliance or legal function, not the business sponsor
- The measurement method is typically binary (compliant / non-compliant or pass / fail) — do not force a percentage threshold onto a binary outcome
- The measurement timeline is externally imposed; do not allow it to be adjusted in Step 3
- Confirm the measurement method with the compliance or legal function directly — the business sponsor cannot override it

If a regulatory objective cannot be achieved within the current scope, this is not an "aspirational" objective to redirect — it is a scope deficiency that must be resolved before the requirements package proceeds.

**Note on Aspirational objectives:** If a stakeholder raises an objective that is desirable but not achievable within the current scope of this change, do not add it to the objectives document. Document it in the assumptions-constraints-scope register as an out-of-scope business goal with the stakeholder name and a note that it should be considered for a future phase. Including unachievable objectives in this document will create false traceability downstream.

**Conflict check — perform this before finalising priorities:**

Review all objectives as a set. For each pair of objectives, ask: could aggressively pursuing Objective A undermine Objective B? This check is pair-wise and applies regardless of objective type — do not limit it to the patterns below.

Common examples of conflict (not an exhaustive checklist):
- Cost-reduction vs. quality or satisfaction (e.g., deflecting support tickets vs. resolving them)
- Speed vs. accuracy (e.g., faster processing vs. error-free processing)
- Volume vs. depth-of-engagement (e.g., onboarding more users vs. increasing usage depth per user)

If a conflict exists: document it explicitly under Constraints on Achievement (Step 5). Do not suppress it. The stakeholder must acknowledge the trade-off before requirements are written.

**If the stakeholder refuses to acknowledge or resolve the conflict:** do not proceed as though it does not exist. Record the unresolved conflict as an Open assumption in the assumption log (see Assumption Recording). Present it at the hand-off gate as a blocker. If the business sponsor or product owner still declines to resolve it, document who made the decision to proceed and the specific risk they are accepting. An unresolved objective conflict is a known requirements defect — it must be visible in the requirements package, not buried.

### Step 5 — Identify Constraints on Achievement

Document conditions or dependencies that limit objective achievement:

**If analysis ran:**
- Constraint register entries that impose hard limits on objective achievement (e.g., regulatory ceilings, contractual obligations, capacity constraints)
- Risk register entries that threaten objective achievement
- Gap register entries that affect readiness for objective achievement — if no gap register exists, note "gap analysis was not performed" rather than leaving this blank
- Dependency readiness issues that may delay achievement
- Objective conflicts identified in Step 4

**If analysis was skipped:**
- User-identified constraints and risks
- Objective conflicts identified in Step 4
- Flag all as assumptions

### Step 6 — Assemble

Populate the `business-objectives` template.

## Output

A populated **business-objectives** document (use the template at `../assets/business-objectives.md`).

### File Output

Write the completed business objectives to `docs/<feature>/requirements-package/requirements/business-objectives.md`.

The template is structured as:
- **Document header** — title, version number, date, BA/PO name, and stakeholder approver name
- **Section 1 — Objectives** — one row per objective: objective ID, description, priority tier, objective owner
- **Section 2 — Success metrics** — one block per objective: metric name, baseline value (or gap flag), target value, measurement method, measurement timeline (or gap flag), measurement owner, objective owner, and any NFR flags
- **Section 3 — Objective-to-requirement traceability** — placeholder requirement area names at authoring time; updated to specific requirement IDs after the functional-requirements step
- **Section 4 — Constraints on objective achievement** — hard limits, risks, gaps, and objective conflicts
- **Document history** — version, date, change description, author

If the template is missing any of these sections, do not populate around the gap — raise it as a template defect before proceeding.

This is Section 3 of the requirements package. It defines what the business expects the requirements to collectively achieve.

## Traceability Update (Triggered by Functional Requirements Hand-off)

The objective-to-requirement traceability in this document is a forward reference at the time business objectives are produced. It must be completed before the package-synthesis (step 11) runs.

**When to perform the update:** The functional-requirements hand-off gate is the trigger. When functional-requirements presents its completed document for acknowledgement, the BA/PO must complete the traceability update before acknowledging and proceeding to step 5 (business-rules).

**How to perform the update:**

1. Return to the business-objectives document
2. Replace requirement area placeholders with specific requirement IDs from the functional-requirements document
3. Verify that every Primary objective maps to at least one Must-have functional requirement — if a Primary objective has no Must-have requirement, this is a requirements gap; raise it before proceeding
4. Verify that every functional requirement traces to at least one objective — requirements with no objective link are scope-creep candidates; flag each one explicitly
5. Present the updated traceability table to the objective owner for confirmation before acknowledging the functional-requirements hand-off gate

**Why this cannot be left until the synthesiser:** The package-synthesis (step 11) validates the traceability chain, but it requires specific requirement IDs to do so. If the objective-to-requirement table still contains area name placeholders at that point, the traceability validation cannot run correctly. The update must happen at step 4.

**Document versioning after update:** When the traceability update is complete, increment the document version (e.g., v1.0 → v1.1) and add a document history entry noting the date, the change made ("Traceability table updated with functional requirement IDs from FR document vX.X"), and the person who made the update. The objective owner who approved the original document must acknowledge the updated traceability table — the original approval does not cover subsequent modifications. A one-line acknowledgement is sufficient; silence is not.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Requirements are written without a clear definition of success | Business objectives define measurable success criteria before requirements are specified |
| Feature ships but nobody can say whether it achieved its purpose | Success metrics with baselines, targets, timelines, and named owners enable post-launch evaluation |
| All objectives are treated as equally important, preventing scope negotiation | Priority tiers (Primary / Secondary) enable trade-off conversations when scope must be reduced |
| Objectives are stated as activities ("build X") instead of outcomes ("achieve Y") | Step 2 quality rules enforce outcome-focused language and reject activity statements |
| Success metrics have no baseline, making post-launch comparison impossible | Step 3 forces baseline identification and flags missing baselines as action items |
| Objectives that conflict with each other are carried forward silently | Step 4 conflict check surfaces trade-offs before requirements are written |
| Objectives are written that the feature cannot actually achieve | Step 2 Achievable criterion requires each objective to be within the scope of influence of this change |
| Unachievable "aspirational" objectives create false traceability | Out-of-scope objectives are redirected to the assumptions-constraints-scope register, not the objectives document |
| Regulatory objectives are treated as negotiable and deprioritised | Step 4 distinguishes regulatory objectives, mandates Primary tier, and requires confirmation from the compliance or legal function |
| NFR thresholds are embedded in objectives and then duplicated — potentially with a different value — in the NFR step | Step 3 flags metrics with NFR implications and requires explicit carry-forward to the non-functional requirements step |
| Objectives are confirmed by a proxy who lacks authority to commit | Step 1 requires authority verification before elicitation begins; the hand-off gate names the required approver explicitly |
| The traceability table is updated post-approval without the objective owner's knowledge | The Traceability Update section requires document versioning and objective owner acknowledgement of the revised table |
| An unresolved objective conflict is buried and surfaces during development | Step 4 requires explicit stakeholder acknowledgement of every conflict; refusal to resolve is documented as a known defect, not dropped |

## Hand-off Gate

Before proceeding to functional-requirements, you must:

1. Write the completed business objectives document in full — all objectives, success metrics (including objective owners and measurement owners), priority tiers, conflict notes, and constraints.
2. Present it to the **business sponsor or product owner** — the stakeholder with authority to commit to these outcomes, not simply the person running the requirements session — with the following specific questions:
   - Does each objective accurately describe the business outcome the organisation expects from this change?
   - Is each success metric's target value realistic and agreed? Is the baseline known, or is capturing it a pre-launch action item?
   - Is the priority tier assigned to each objective correct? Are all objectives the business cannot accept missing marked Primary? Are any objectives marked Primary that the business could accept deferring to a later phase?
   - Are the named objective owners correct — are the right people accountable for these outcomes?
   - Are any objectives missing that the business will hold this feature responsible for? Are any objectives listed that the feature should not be held responsible for?
   - Are all identified constraints and conflicts acknowledged?
3. Receive an explicit answer to each question before proceeding. A one-word approval is not sufficient.
4. If corrections are identified, revise the affected objectives, re-present the updated document, and receive confirmation before proceeding.
5. **If the business sponsor or product owner is unavailable:** do not proceed to functional-requirements. Record the blockage in the assumption log as: "Business objectives have not been confirmed by an authorised stakeholder — all objectives are unvalidated assumptions." Present this to the person running the requirements session. If they choose to proceed under this assumption, they accept the risk that objectives may be revised after functional requirements are written, requiring rework. Document the decision and who made it.

---

## Completion Criteria

- [ ] Each business objective describes a business outcome (not a system capability or activity)
- [ ] Each objective passes all six quality rules: Specific, Measurable, Achievable, Relevant, Timebound, Independent
- [ ] Each objective has a success metric with: metric name, baseline (or gap flag), target value, measurement method, measurement timeline (or gap flag), measurement owner, and objective owner (or gap flag — unresolved Primary objective owner is a blocker; unresolved Secondary objective owner is a gap action item)
- [ ] Each objective has a priority tier (Primary or Secondary)
- [ ] At least one objective is Primary
- [ ] A conflict check has been performed across all objectives; any conflicts are documented under constraints
- [ ] Constraints on objective achievement are documented (from analysis artifacts or user input)
- [ ] Objective-to-requirement area forward reference is populated (requirement area names; IDs to be added after functional-requirements step)
- [ ] If analysis ran, objectives trace to change-scope goals
- [ ] If analysis was skipped, objectives stated by the stakeholder are treated as stakeholder-confirmed requirements; system delivery uncertainties (feasibility, constraint compatibility, dependency risks) are recorded as assumptions
- [ ] Out-of-scope desired outcomes have been redirected to the assumptions-constraints-scope register, not listed as objectives
- [ ] The number of objectives is justified — if outside the 2–5 advisory range, the reason is documented
- [ ] The hand-off gate review questions have been explicitly answered by the business sponsor or product owner and all corrections applied
- [ ] All "record as an assumption" instructions have resulted in a named entry in the assumption log with an owner and resolution deadline
- [ ] Regulatory and compliance objectives (if any) are marked Primary, reference their regulatory source, and have their measurement method confirmed by the compliance or legal function
- [ ] Success metrics containing performance, volume, availability, or reliability thresholds are flagged for the non-functional requirements step
- [ ] Gap action items for unknown baselines name the responsible person and the latest acceptable capture date
- [ ] The business-objectives document carries a version number and document history section
- [ ] Objectives were elicited from a stakeholder with authority to commit to these outcomes (business sponsor or product owner), not a proxy
