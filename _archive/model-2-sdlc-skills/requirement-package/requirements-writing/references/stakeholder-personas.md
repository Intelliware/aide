# Stakeholders & Personas

## Purpose

Identify and document stakeholders and personas for the proposed change — who is affected, who can approve or block, who uses the system, and what roles they play. If analysis ran, consume the stakeholder map from analysis stakeholder-mapping (which always runs in analysis) and carry it forward with updates. If analysis was skipped, elicit stakeholder and persona information from the user — seeding from discovery outputs if discovery ran, or eliciting from scratch if both phases were skipped. Produce a stakeholder-personas artifact containing: stakeholder identification, influence/interest assessment, a requirements-phase RACI matrix, persona definitions, a consultation and notification plan, a stakeholder concerns register (anticipated vs confirmed), carry-forward change log, and an assumptions section.

## When to Use

- As the second skill in the requirements phase — after executive-summary
- When requirements work needs a clear record of who is affected, who approves, and who uses the system
- When persona definitions are needed to ground functional requirements and user journeys in real user types

## What This Produces

A **stakeholder-personas** artifact containing:

1. **Stakeholder identification** — named individuals or roles, categorised by their relationship to the change
2. **Influence/interest grid** — quadrant placement for engagement strategy
3. **Requirements-phase RACI matrix** — role assignments for requirements production, review, sign-off, and requirements package distribution
4. **Persona definitions** — for each end-user type, a structured profile capturing goals, pain points, and usage context
5. **Consultation and notification plan** — consultation plan for Consulted stakeholders, notification plan for Informed stakeholders
6. **Concerns register** — anticipated and confirmed concerns with mitigation strategies
7. **Carry-forward change log** — what changed from analysis stakeholder map (if analysis ran)
8. **Assumptions register** — structured assumptions with category, source, validation method, and impact if wrong

## Preflight Checks

Before running this skill:

1. Confirm `../assets/stakeholder-personas.md` exists.
2. If the template is missing, continue using this skill's section structure as the fallback output format (do not block execution).
3. Confirm whether analysis stakeholder artifacts are available.
4. Confirm the change description is sufficiently detailed to support stakeholder identification — it must identify who is affected, what is changing, and why. If the description is too vague to determine which user types, teams, or approval roles are in scope, request clarification from the user before proceeding. Do not attempt stakeholder identification against an underspecified change.

## Did Analysis Run?

The analysis stakeholder-mapping step **always runs** when analysis runs (step 1 in the analysis workflow). This means `docs/<feature>/requirements-package/analysis/stakeholder-map.md` is always produced when analysis ran, regardless of whether discovery ran.

**Analysis ran** if `docs/<feature>/requirements-package/analysis/stakeholder-map.md` exists:
- Carry forward the stakeholder map as the baseline.
- Supplement with persona definitions.
- Track all additions/removals/classification changes in a **Carry-forward Change Log** section.

**Analysis was skipped** if `docs/<feature>/requirements-package/analysis/stakeholder-map.md` does not exist. In this case:
- If **discovery ran**: load `docs/<feature>/requirements-package/discovery/requirements-elicitation.md` to seed the stakeholder candidate list before asking the user to fill gaps.
- If **both phases were skipped**: elicit stakeholder and persona information directly from the user from scratch.

In all cases where analysis was skipped, every identification and classification that is not stakeholder-confirmed is recorded as an assumption.

## Inputs

| Input | Source | Required | Notes |
|-------|--------|----------|-------|
| Stakeholder map | `docs/<feature>/requirements-package/analysis/stakeholder-map.md` | If analysis ran | Always produced when analysis ran (step 1 always runs in analysis) — carry it forward |
| Discovery elicitation outputs | `docs/<feature>/requirements-package/discovery/requirements-elicitation.md` | If discovery ran | Available when analysis was skipped but discovery ran — use to seed the stakeholder list |
| Proposed change description | `docs/<feature>/requirements-package/discovery/change-description.md` or `docs/<feature>/requirements-package/analysis/change-description.md` or user | Yes | Whichever exists from prior phases |
| Any existing documentation | User-supplied (specs, org charts) | If available | Particularly useful when both phases were skipped |

## Workflow

```
┌──────────────────────────────────────────────────┐
│  1. ELICIT+IDENTIFY — Gather context and build    │
│     stakeholder list by category                  │
├──────────────────────────────────────────────────┤
│  2. CLASSIFY — Assign influence/interest and      │
│     place on grid with documented rationale       │
├──────────────────────────────────────────────────┤
│  3. RACI — Build requirements-phase role matrix   │
│     for production, review, sign-off, distribution│
├──────────────────────────────────────────────────┤
│  4. PERSONAS — Define user personas and trace     │
│     each to requirement themes and journeys       │
├──────────────────────────────────────────────────┤
│  5. CONSULT+NOTIFY — Build consultation and       │
│     notification plan using quadrant-based depth  │
├──────────────────────────────────────────────────┤
│  6. CONCERNS — Capture anticipated and confirmed  │
│     concerns with mitigation + follow-up owners   │
├──────────────────────────────────────────────────┤
│  7. ASSEMBLE+VALIDATE — Populate template, run    │
│     quality checks, and gate hand-off             │
└──────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Elicit Context and Identify Stakeholders

**If `docs/<feature>/requirements-package/analysis/stakeholder-map.md` exists** (analysis ran):
Load the stakeholder map from the analysis phase. Review for completeness and flag gaps that emerged since the map was produced. If new stakeholders are identified, add them and record the change in the Carry-forward Change Log.

**If `docs/<feature>/requirements-package/analysis/stakeholder-map.md` does not exist** (analysis was skipped):

- *Discovery ran but analysis was skipped:* Load `docs/<feature>/requirements-package/discovery/requirements-elicitation.md` to extract stakeholder context from discovery. Use this to seed the candidate list before asking the user targeted gap-filling questions. Treat stakeholder identifications confirmed by the user as stakeholder-confirmed; record as assumptions only those system-behavior claims (e.g., which teams own which components) that have not been verified.

- *Both phases skipped:* Ask the user the following structured questions from scratch. Ask **one question at a time** and wait for the response before asking the next. If the user prefers to answer all questions in one go, accept the batch, but follow up on any answers that are incomplete. **These questions apply only to this path** — do not re-ask them when discovery or analysis outputs are available.

  1. **Who requested this change?** (the requestor and their role)
  2. **Who uses the part of the system being changed?** (end users, internal users, external partners)
  3. **Who owns or operates the system technically?** (engineering teams, ops/SRE, DBAs)
  4. **Who can block or approve this change?** (management, compliance, security, architecture review)
  5. **Are there downstream systems or teams that consume data from this part of the system?**
  6. **Is there anyone else who needs to know about this change even if they have no input?**

**If the user answers "I don't know" to any question on any path:** Record the unanswered category as Unknown in the "Unknown / Not Identified Stakeholder Categories" section. Continue the workflow, but apply the unknown-threshold gate in Step 7.

Who stakeholders are and what roles they hold are treated as stakeholder-confirmed — the stakeholder knows their own organisation. What requires assumption tracking are system claims that have not been verified against the codebase: which components specific teams own, how downstream systems consume data from the affected area, and similar system-behaviour assertions. Record those in the structured assumptions table:

| Field | Required content |
|-------|------------------|
| Assumption | The claim being made |
| Category | Stakeholder identity / Organizational structure / Influence / Interest / RACI role / Persona |
| Stated by | User / analysis artifact / other source |
| Validation method | How this will be verified |
| Impact if wrong | Specific downstream risk |

Compile and maintain the candidate list using these categories:

| Category | Examples |
|----------|---------|
| **Requestors** | The person or team who commissioned the change |
| **Users / End users** | People who interact with the affected part of the system |
| **Operators** | Teams who run, monitor, or support the system |
| **Data owners** | Teams responsible for data the change reads or writes |
| **Downstream consumers** | Systems or teams that consume outputs from the affected area |
| **Compliance / Risk** | Legal, security, privacy, or audit roles |
| **Approvers** | People with sign-off authority |
| **External parties** | Third-party vendors, partners, or regulators |

For any category where no stakeholder could be named, mark the category as Unknown. Do not silently omit it — an unknown category is a risk that must be visible.

**Mid-phase stakeholder changes:** Stakeholders can change during the requirements phase — people leave, scope expands, or organisational structures shift. If a material stakeholder change is identified at any point during requirements work (new approver, lapsed Accountable, scope addition that brings in a new team), re-open this artifact: add the new entry, reassess the RACI for affected columns, and record the change as follows:
- **If analysis ran** (Carry-forward Change Log exists): record the change there, consistent with other carry-forward entries.
- **If analysis was skipped** (no Carry-forward Change Log): record the change in a **Requirements-Phase Amendment Log** section — one entry per change, stating what changed, when, and why.

Present the updated document to the user for re-acknowledgement before continuing. Do not silently incorporate mid-phase stakeholder changes without surfacing them.

### Step 2 — Classify by Influence and Interest

For each stakeholder, assess:

**Influence** — their ability to affect the change's direction, scope, or approval:
- High: can block, redirect, or mandate the change
- Medium: can raise concerns that must be addressed, but cannot block unilaterally
- Low: their input is valuable but non-binding

**Interest** — how much this change affects them or they care about its outcome:
- High: directly impacted — their workflows, data, or responsibilities change
- Medium: adjacent — aware and may have opinions but not directly affected
- Low: minimal awareness or impact

**Default grid placement rule:** Treat Medium as Low for quadrant placement to avoid over-classifying moderate stakeholders as high-touch.

**Override rule (required when either condition is true):**
- The stakeholder controls a formal approval gate, funding decision, or compliance decision.
- The stakeholder can block requirements progress by withholding input or dependency work needed during this phase.

When overriding, document: reason, expected impact, and owner approving the override.

| | Low Interest | High Interest |
|---|---|---|
| **High Influence** | Keep satisfied — inform proactively, seek input on constraints | Manage closely — key partners in requirements |
| **Low Influence** | Monitor — minimal engagement | Keep informed — communicate changes that affect them |

### Step 3 — RACI for This Change

Assign each stakeholder a role across four deliverable columns: **Requirements Production**, **Requirements Review**, **Requirements Sign-off**, **Requirements Package Distribution**.

**Scope note:** This RACI covers requirements-phase deliverables only. It does not define implementation, testing, deployment, or operations ownership. "Requirements Package Distribution" is who receives the completed and approved requirements package at handoff — it is a requirements-phase event, not a release event.

| Role | Meaning |
|------|---------|
| **R — Responsible** | Does the work for that deliverable |
| **A — Accountable** | Has final authority; approves or rejects |
| **C — Consulted** | Must provide input before the deliverable is finalised |
| **I — Informed** | Receives the completed deliverable; no input required |

**Rules:**
- Exactly one **A** per deliverable column
- Keep **C** entries small — every Consulted stakeholder is a dependency
- **External parties** may be assigned C or I. Accountability (A) and primary responsibility (R) must rest with an internal role in the default case. **Exception:** if an external party (e.g., a commissioning client or a regulatory body) holds legitimate and non-delegatable approval authority for this change, they may be assigned A for Requirements Sign-off only — record this as a **RACI Exception** (not a conflict) in a dedicated RACI Exceptions section, stating: the external party's name, the basis for their approval authority, and the internal sponsor accountable for follow-through if the external party is unavailable.
- **Requestor guidance:** Requestors are commonly A or C for Requirements Sign-off and C or I for Requirements Review. Do not assign Requestors by default — assign based on actual decision authority.
- If multiple stakeholders claim Accountable status for the same column, or no Accountable can be identified, record the conflict in the **RACI Conflicts** section with the column name, the stakeholders in conflict, and when resolution is required.

### Step 4 — Define User Personas

For each end-user type identified in Step 1, create a persona definition:

| Field | What to capture |
|-------|----------------|
| **Persona name** | A descriptive label (e.g., "Branch Manager", "Mobile Customer", "Support Agent") |
| **Role / description** | What they do and their relationship to the system |
| **Goals** | What they want to accomplish in their role (written as "I want to...") — state the underlying need, not the assumed solution |
| **Pain points** | Current frustrations in the domain of this change (if analysis ran, draw from journey maps and gap analysis) — state what the user experiences today; do not presuppose that the proposed change resolves them |
| **Usage context** | When, where, and how frequently they interact with the system (desktop, mobile, daily, weekly) |
| **Access level** | What permissions or roles they currently hold in the system — captures current state as context only; any changes to access belong in functional-requirements and permissions-access-control |
| **Key scenarios** | The 2–3 most important tasks they perform in the domain of this change |

If analysis ran and user journey maps exist, cross-reference each persona to the journeys that feature them.

Personas are not fictional marketing profiles — they represent real user types whose needs drive functional requirements. A valid persona must represent a real, distinct pattern of interaction with the system and must be grounded in evidence — either a named internal role (e.g., "Branch Manager"), a defined external user category (e.g., "API Partner", "Public Website Visitor"), or a user type confirmed by the requestor or analysis. A persona with no evidential basis — invented to justify a feature — is not valid.

**Requirement Themes** are high-level capability areas that group related functional requirements (e.g., "Reporting", "Authentication", "Notifications", "Bulk Data Export"). They are not requirements themselves — they are forward-looking placeholders used here to anchor personas to the functional work ahead. Themes will be elaborated into specific REQ-NNN functional requirements when the functional-requirements skill runs. Each theme should be expressed as a capability area in 1–4 words. Do not specify how the capability will be implemented.

Because this skill runs before functional-requirements in the workflow, capture Requirement Themes now (high-level capability areas) and mark detailed mapping as deferred.

- Minimum coverage rule: create at least one persona per distinct end-user type.
- Sufficiency check: split one persona into two or more if they have different primary goals, materially different workflow paths (one does X then Y; another does only Y by a different route), or categorically different access levels (read-only vs read-write). Do not split personas for minor differences in frequency of use or UI preference.
- Traceability requirement: each persona must map to at least one Requirement Theme now, then map to specific functional requirements when the functional-requirements skill completes.

### Step 5 — Plan Consultation and Notification

Produce a single **consultation and notification plan**. Tie engagement depth to quadrant:
- **Manage Closely:** Consult early and repeatedly; include in pre-final review.
- **Keep Satisfied:** Targeted consultations at decision points; concise updates.
- **Keep Informed:** Notification-centric engagement with optional comment window.
- **Monitor:** Low-touch tracking unless risk or impact changes.

**Consultation plan** — for each Consulted stakeholder:
- What topics they need to be consulted on
- The basis for consultation: their role, ownership, or expertise
- Priority: must resolve before requirements are finalised, or can resolve during review
- Engagement method: interview, async review, workshop

Method selection guidance:
- **Interview** for high ambiguity, sensitive decisions, or single-owner expertise.
- **Workshop** for cross-team dependency resolution and conflicting views.
- **Async review** for low-ambiguity validation and document feedback.

**Consultation closure:** A consultation is complete when the stakeholder has provided input on all listed topics and that input has been recorded. Record the closure date and a one-line summary of the outcome for each consultation entry. An open consultation with a "must resolve before requirements are finalised" priority that has not closed by the time Step 7 runs must be treated as an unresolved concern and surfaced at the hand-off gate.

**Notification plan** — for each Informed stakeholder:
- When they are notified (after requirements sign-off, when requirements package is baselined and distributed)
- How (email, document share, ticket update)
- What they receive

**Scope note:** Notification timing is bounded by the requirements phase. Post-release and deployment notifications are outside the scope of this artifact and belong in the delivery plan.

### Step 6 — Capture and Validate Stakeholder Concerns

For each stakeholder, record concerns in two classes:
- **Anticipated** — inferred from role/change profile and not yet validated.
- **Confirmed** — explicitly raised by stakeholder during consultation/review.

For each concern, record:
- Concern statement
- Basis/evidence
- Status (Anticipated or Confirmed)
- Mitigation/response action
- Owner and due date

**Escalation:** If a confirmed concern reaches its due date unresolved, it must be escalated before the hand-off gate can pass. Surface the overdue concern explicitly in the hand-off gate presentation — list the concern, its original due date, its owner, and the impact of proceeding with it unresolved. The user must make an explicit decision: resolve the concern, accept the risk in writing, or defer handoff.

If no concerns are identified, record: "No concerns identified at this stage."

### Step 7 — Assemble and Validate

All completion criteria (see end of this skill) must be satisfied before writing the document. Before writing, also confirm:
- The Assumptions section is populated with all unverified claims
- The RACI has exactly one Accountable per column
- Every persona maps to a real user type
- Every persona maps to at least one Requirement Theme
- No overdue confirmed concerns are outstanding without an explicit escalation decision

Unknown-threshold gate:
- If 0–2 categories are Unknown: proceed, highlight follow-up actions.
- If 3–4 categories are Unknown: proceed with **elevated risk** warning — record each unknown category as an assumption in the Assumptions Register (Category: Stakeholder identity) and add a corresponding entry to the Concerns Register (Status: Anticipated, mitigation: resolve via targeted discovery before functional requirements are written).
- If 5+ categories are Unknown: pause and request targeted stakeholder discovery before continuing. The document may not be written until the count drops below 5 or the user provides written acknowledgement of the risk and an explicit instruction to proceed.

## Output

A populated **stakeholder-personas** document (use the template at `../assets/stakeholder-personas.md`).

### File Output

Write the completed stakeholder personas to `docs/<feature>/requirements-package/requirements/stakeholder-personas.md`.

This artifact identifies the people the requirements serve and the people who approve them.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Requirements are written without knowing who the users are | Persona definitions force explicit identification of user types before requirements are specified |
| No approval chain is defined, leading to debates at sign-off | RACI forces explicit Accountable assignment before requirements are written |
| Key stakeholders surface late and reject requirements decisions | Step 1 covers all standard stakeholder categories and flags any that could not be named |
| Stakeholder identification gaps are invisible | Unknown categories are explicitly recorded — not silently omitted |
| Personas are vague marketing profiles instead of real user types | Step 4 requires goals, pain points, usage context, and key scenarios grounded in the actual change |

## Hand-off Gate

Before proceeding to the next requirements skill, you must:
1. Write the completed stakeholder-personas document in full — all stakeholders, RACI, persona definitions, and consultation and notification plan.
2. Present it to the user for review.
3. If the RACI Conflicts section contains any open conflicts, surface them explicitly and require resolution or written acceptance before proceeding.
4. If the RACI Exceptions section contains any entries, surface them explicitly for user awareness — these are sanctioned deviations, not blockers, but the user must confirm they are intentional.
5. Receive explicit acknowledgement before proceeding.

**Explicit acknowledgement means one of:**
- A direct approval statement ("approved", "looks good", "proceed")
- A written instruction to continue despite named open issues
- A list of required edits that are completed and then confirmed by the user

---

## Completion Criteria

All criteria below must be satisfied before the document is written (Step 7). The hand-off gate confirms the document is written, presented, and acknowledged — it does not re-check these criteria. Both must pass for the skill to be complete.

- [ ] All stakeholder categories have been considered — any category with no named stakeholder is recorded as Unknown
- [ ] Every stakeholder has an influence and interest rating and grid quadrant placement
- [ ] The RACI matrix covers all four deliverable columns (Requirements Production, Requirements Review, Requirements Sign-off, Requirements Package Distribution) with exactly one Accountable per column
- [ ] Any unresolved Accountable disputes are recorded in the RACI Conflicts section
- [ ] Any external-party Accountable exceptions are recorded in the RACI Exceptions section (not RACI Conflicts), with external party named, authority basis stated, and internal sponsor identified
- [ ] Every end-user type has a persona definition with: name, role, goals, pain points, usage context, access level, and key scenarios
- [ ] Every persona maps to at least one Requirement Theme (and is marked for later mapping to specific functional requirements)
- [ ] A consultation and notification plan exists — a consultation entry for every Consulted stakeholder and a notification entry for every Informed stakeholder
- [ ] The Stakeholder Concerns Register is populated with status (Anticipated/Confirmed), or explicitly states that no concerns were identified
- [ ] Any overdue confirmed concerns have an explicit escalation decision recorded
- [ ] Unknown-threshold gate has been applied — if 3–4 categories are Unknown, corresponding assumption and concern entries exist; if 5+, user has provided written instruction to proceed
- [ ] If `docs/<feature>/requirements-package/analysis/stakeholder-map.md` exists (analysis ran), carry-forward updates are recorded in a Carry-forward Change Log (added/removed/changed stakeholders and classifications)
- [ ] If `docs/<feature>/requirements-package/analysis/stakeholder-map.md` does not exist (analysis was skipped), stakeholder identifications and roles confirmed by the user are treated as stakeholder-confirmed; system-behaviour claims (component ownership, downstream data consumption, unverified influence classifications, unverified organisational structure) are recorded as assumptions; discovery elicitation outputs were used to seed the list if discovery ran
