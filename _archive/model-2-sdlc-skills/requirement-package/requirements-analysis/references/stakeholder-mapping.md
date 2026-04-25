# Stakeholder Mapping

## Purpose

Identify stakeholders affected by or needed for the proposed change — who approves, who is impacted, who must be consulted for analysis decisions. Always runs as step 1 in the analysis-workflow sequence. Produces a change-focused RACI, approval chain, a notification plan, a consultation plan, a stakeholder concerns register, an assumptions section, and a decisions section. When discovery ran, seeds the stakeholder picture from docs/<feature>/requirements-package/discovery/elicitation-outputs.md and docs/<feature>/requirements-package/discovery/current-capability-baseline.md before consulting the user. When discovery was skipped, derives everything from the user's description of the change and any context they can provide.

## When to Use

- Step 1 in the analysis-workflow sequence — **always runs**
- Before change-scoping in all cases — the analyst needs to know who to validate scope boundaries with before scoping the change
- When discovery ran: seeds from discovery outputs before consulting the user
- When discovery was skipped: derives everything from the user's description

## What This Produces

A **change-focused stakeholder map** containing: an influence/interest grid, a RACI matrix for the change, a consultation plan for analysis decisions, a notification plan, a stakeholder concerns register, an assumptions section, and a decisions section. This is scoped to the change — not a full organisational stakeholder analysis.

## When This Skill Runs

This skill always runs as the first step of analysis, before change-scoping. The analyst needs to know who to consult before scoping the change — this is true whether discovery ran or not. Discovery does not produce a stakeholder map, so this step is the only place a formal stakeholder map is produced.

Two input modes:
- **Discovery ran:** Load `docs/<feature>/requirements-package/discovery/elicitation-outputs.md` and `docs/<feature>/requirements-package/discovery/current-capability-baseline.md`. Both contain named actors (primary users, requestors, operators, system owners) surfaced during discovery. Use these to build an initial candidate list, then validate and extend with the user.
- **Discovery was skipped:** No discovery artifacts exist. Derive the stakeholder picture entirely from the user's description of the change and any context they can provide.

## Inputs

| Input | Source | Required | Notes |
|-------|--------|----------|-------|
| Proposed change description | `docs/<feature>/requirements-package/discovery/change-description.md` or user | Yes | From discovery if it ran; captured from user in Step 0 of this workflow if not |
| Discovery elicitation outputs | `docs/<feature>/requirements-package/discovery/elicitation-outputs.md` | If available | Present when discovery ran; contains named users, requestors, and system actors from elicitation |
| Current-capability-baseline | `docs/<feature>/requirements-package/discovery/current-capability-baseline.md` | If available | Present when discovery ran; contains primary users, operators, and integration owners |
| Any existing documentation | User-supplied (specs, diagrams, org charts) | If available | Particularly useful when discovery was skipped |

> **Missing input guard:** If an expected input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[full path]` but it was not found. This input is [required/recommended] for this skill. Should I proceed without it, or can you provide it?"*

## Workflow

```
┌──────────────────────────────────────────────────┐
│  1. ELICIT — Ask the user to describe the change │
│     and the people involved. Who requested it?   │
│     Who uses the system? Who owns the system?    │
│     Who can block the change?                    │
├──────────────────────────────────────────────────┤
│  2. IDENTIFY — List candidate stakeholders       │
│     From the user's description: requestors,     │
│     users, operators, data owners, downstream    │
│     consumers, compliance, approvers.            │
├──────────────────────────────────────────────────┤
│  3. CLASSIFY — Assign influence and interest     │
│     Based on the user's description of each      │
│     stakeholder's relationship to the change.    │
├──────────────────────────────────────────────────┤
│  4. RACI — Map roles for this change             │
│     Requirements Production, Review, Sign-off,   │
│     Release Notification.                        │
├──────────────────────────────────────────────────┤
│  5. PLAN — Define consultation, notification,    │
│     and anticipated concerns. Who to consult,    │
│     who to notify, what concerns to flag.        │
├──────────────────────────────────────────────────┤
│  6. ASSEMBLE — Populate the stakeholder map      │
└──────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Build the Initial Stakeholder Picture

**Setup — before any elicitation begins:** Check whether `docs/<feature>/requirements-package/analysis/assumption-log.md` and `docs/<feature>/requirements-package/analysis/decision-log.md` exist. If either does not exist, create it now from the corresponding template at `../assets/assumption-log.md` or `../assets/decision-log.md`. The `docs/<feature>/requirements-package/analysis/` directory was created by Step 0 or the workflow, but the log files are not created until this step. Both file creations must succeed before any assumption or decision is logged. If the `docs/<feature>/requirements-package/analysis/` directory does not exist for any reason, create it first.

**If discovery ran:**
Load `docs/<feature>/requirements-package/discovery/elicitation-outputs.md` and `docs/<feature>/requirements-package/discovery/current-capability-baseline.md`. Extract every named actor from both documents — requestors named in elicitation, primary users described in the system overview, operators, integration owners, and downstream consumers. Build an initial candidate list from these sources. Then present the candidate list to the user and ask targeted gap-filling questions:

1. **Is anyone missing from this list?** (roles the discovery outputs did not name)
2. **Who can block or approve this change?** (approval chain — often not surfaced in discovery)
3. **Are there compliance, security, or legal stakeholders for this change?**
4. **Is there anyone else who needs to know about the outcome even if they have no input?**

Stakeholders derived from discovery outputs carry the confidence level of the source artifact — elicitation-confirmed for actors named in the elicitation session, and inferred-from-discovery for actors identified in the capability baseline. Record the source for each in the Stakeholder Identification table. Gaps filled by the user are assumptions — record them as such.

**If discovery was skipped:**
No discovery artifacts exist. Ask the user structured questions to build a minimum viable stakeholder picture. Present the six questions as a numbered list so the user can see the full scope. Work through them one at a time, waiting for each response before asking the next. If the user answers multiple questions in one response, accept the batch. Follow up on any answer that is incomplete or ambiguous before moving on.

1. **Who requested this change?** (the requestor and their role)
2. **Who uses the part of the system being changed?** (end users, internal users, external partners)
3. **Who owns or operates the system technically?** (engineering teams, ops/SRE, DBAs)
4. **Who can block or approve this change?** (management, compliance, security, architecture review)
5. **Are there downstream systems or teams that consume data from this part of the system?**
6. **Is there anyone else who needs to know about this change even if they have no input?**

Every stakeholder claim the user makes is an unverified assumption. Seed the assumption log now with all system claims the user provides.

---

**Both paths:** If the user answers "I don't know" to any question, record the unanswered category as Unknown in the "Unknown / Not Identified Stakeholder Categories" section of the template. Do not stall the workflow — continue with what is known and flag the gap.

Every assumption must be recorded in the Assumptions section of the stakeholder-map artifact and added to the assumption log (`docs/<feature>/requirements-package/analysis/assumption-log.md`). Any decision — marking a category Unknown, accepting an ambiguous answer, resolving a confidence question — must be recorded in the Decisions section and added to the decision log (`docs/<feature>/requirements-package/analysis/decision-log.md`).

### Step 2 — Identify Candidate Stakeholders

From the user's answers, compile a candidate list using these categories:

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

For any category where the user could not name anyone, mark the category as Unknown in the stakeholder-map artifact. Do not silently omit it — an unknown category is a risk that must be visible.

### Step 3 — Classify by Influence and Interest

For each stakeholder, assess:

**Influence** — their ability to affect the change's direction, scope, or approval:
- High: can block, redirect, or mandate the change
- Medium: can raise concerns that must be addressed, but cannot block unilaterally
- Low: their input is valuable but non-binding

**Interest** — how much this change affects them or they care about its outcome:
- High: directly impacted — their workflows, data, or responsibilities change
- Medium: adjacent — aware and may have opinions but not directly affected
- Low: minimal awareness or impact

**Grid placement rule:** Treat Medium as Low for grid placement. This prevents over-investment in stakeholders whose influence and interest are moderate — a stakeholder with Medium influence who is over-engaged consumes analysis bandwidth without meaningful return. Record the precise H/M/L values in the assessment table for nuance; use the placement rule only to assign the quadrant.

**Mixed-axis cases:** When one axis is High and the other is Medium, apply the rule to the Medium axis only — Medium collapses to Low. A stakeholder with High Influence and Medium Interest → High Influence + Low Interest → **Keep Satisfied**. A stakeholder with Medium Influence and High Interest → Low Influence + High Interest → **Keep Informed**.

| | Low Interest | High Interest |
|---|---|---|
| **High Influence** | Keep satisfied — inform proactively, seek input on constraints | Manage closely — key partners in analysis |
| **Low Influence** | Monitor — minimal engagement | Keep informed — communicate changes that affect them |

Any classification call where the user's description supported more than one valid placement — including any case where the grid placement rule resolved an ambiguity by demoting a Medium rating to Low — is a decision. Record it in the Decisions section of the artifact and add it to the decision log (`docs/<feature>/requirements-package/analysis/decision-log.md`).

### Step 4 — RACI for This Change

Assign each stakeholder a role across four deliverable columns: **Requirements Production**, **Requirements Review**, **Requirements Sign-off**, **Release Notification**.

**RACI scope:** These four columns cover the requirements-and-release lifecycle for this change. Implementation accountability, testing sign-off, and operational ownership are outside the scope of this mapping — they are defined in project governance and release planning activities that follow. Do not add columns for those activities here.

| Role | Meaning |
|------|---------|
| **R — Responsible** | Does the work for that deliverable |
| **A — Accountable** | Has final authority; approves or rejects |
| **C — Consulted** | Must provide input before the deliverable is finalised |
| **I — Informed** | Receives the completed deliverable; no input required |

**Rules:**
- Exactly one **A** per deliverable column
- Keep **C** entries small — every Consulted stakeholder is a dependency
- **External parties** (vendors, regulators, partners) may be assigned C or I. Accountability (A) and primary responsibility (R) must rest with an internal role.
- If multiple stakeholders claim Accountable status for the same column, or no Accountable can be identified, record the conflict in the **RACI Conflicts** section of the stakeholder-map artifact with the column name, the stakeholders in conflict, and when resolution is required. Do not proceed past this step without flagging conflicts explicitly.
- If a conflict is resolved during this step, record the resolution as a decision in the Decisions section of the artifact and in the decision log (`docs/<feature>/requirements-package/analysis/decision-log.md`).

### Step 5 — Plan Consultation, Notification, and Concerns

**Consultation plan** — for each Consulted stakeholder:
- What topics they need to be consulted on during analysis
- The basis for consultation: their role, ownership, or expertise
- Priority: must resolve before change-scoping, or can resolve during later analysis steps
- Engagement method: interview, async review, workshop

**Notification plan** — for each Informed stakeholder:
- When they are notified (after requirements sign-off, at release)
- How (email, document share, ticket update)
- What they receive

**Concerns register** — for each stakeholder, consider whether their role, ownership, or the nature of the change gives reason to anticipate a specific concern (e.g., a compliance owner asked to approve a data-schema change, a downstream team whose integration may break). Record any anticipated concern, its basis, and a mitigation or question to raise during consultation. If no concerns can be anticipated, record that explicitly — do not leave the section blank.

Each anticipated concern for a Consulted stakeholder becomes a mandatory topic in their consultation plan entry — ensure the consultation plan's "Topics to Cover" column references it. If a stakeholder with an anticipated concern is assigned I (Informed, not Consulted), assess whether the concern is material enough to warrant reclassifying them as C. Record any such reclassification as a decision in the Decisions section and the decision log.

After consultation, update each concern entry with the outcome — confirmed, partially addressed, or refuted. Concerns that remain unresolved after consultation are inputs to risk-analysis: they must be recorded as risks in the risk register at step 11.

**Priority decisions** — the assignment of "must resolve before change-scoping" versus "can resolve during later analysis steps" has direct downstream consequences. Any priority call that is not self-evident — where either timing was genuinely viable — must be recorded in the Decisions section of the artifact and added to the decision log (`docs/<feature>/requirements-package/analysis/decision-log.md`).

### Step 6 — Assemble

Populate the stakeholder map using the template at `../assets/stakeholder-map.md` relative to the project repository root. Write the completed artifact to `docs/<feature>/requirements-package/analysis/stakeholder-map.md` relative to the project repository root.

Before writing, confirm:
- The **Assumptions** section is populated. Every entry must also be added to the assumption log (`docs/<feature>/requirements-package/analysis/assumption-log.md`).
- The **Decisions** section is populated with all calls captured in steps 1–5. Every entry must also be added to the decision log (`docs/<feature>/requirements-package/analysis/decision-log.md`). If no decisions required logging, state that explicitly — do not leave the section blank.

## Output

A populated **stakeholder-map** document written to `docs/<feature>/requirements-package/analysis/stakeholder-map.md`.

### File Output

Write the completed stakeholder map to `docs/<feature>/requirements-package/analysis/stakeholder-map.md`.

This stakeholder map feeds into:
- **change-scoping** (step 2) — identifies who to validate scope boundaries with
- All subsequent analysis steps — identifies who to consult for domain context
- **requirements phase** — the RACI carries forward for review and sign-off

## Confidence Note

**When discovery ran:** Stakeholder identifications extracted from discovery outputs carry the confidence level of the source artifact — elicitation-confirmed for actors named in the elicitation session, and inferred-from-discovery for actors identified in the capability baseline. User-supplied additions and gap-filled information (answers to the four targeted questions in Step 1) are unverified assumptions. RACI assignments and influence/interest classifications are provisional decisions based on user-stated information regardless of path. The map is more grounded than the discovery-skipped path but is not fully verified until consultation confirms the classifications.

**When discovery was skipped:** The stakeholder map is based entirely on user-stated information. Every stakeholder identification and classification is an assumption, and every RACI assignment and classification call made against ambiguous input is a provisional decision. The Assumptions and Decisions sections of the artifact must reflect this fully.

**Both paths — update protocol:** The stakeholder map is a living artifact, not a one-time capture. If change-scoping (step 2) or any later analysis step reveals stakeholders not identified here — for example, an integration owner surfaced during dependency-mapping, or an affected team identified during impact-analysis — update the stakeholder map immediately: add the stakeholder to the Stakeholder Identification table, assess their influence and interest, assign a RACI role, and add them to the consultation or notification plan as appropriate. Record the addition as an assumption if unverified, and record any RACI placement decision in the Decisions section and the decision log.

## Failure Modes This Skill Prevents

| Failure mode | How this skill reduces the risk |
|---|---|
| Analyst scopes a change with no idea who to validate with | Stakeholder-mapping is the first mandatory step before change-scoping — ensures the analyst knows who to consult before any scope boundary is drawn |
| Analysis proceeds with no approval chain defined | RACI requires explicit Accountable assignment for each deliverable column — any missing or contested Accountable is recorded and surfaced before analysis continues |
| Key stakeholders surface late and reject analysis decisions | Step 2 covers all standard stakeholder categories and flags any that could not be named; the update protocol ensures late-surfacing stakeholders are added to the map when discovered |
| Stakeholder identification gaps are invisible | Unknown categories are explicitly recorded in the artifact — not silently omitted |
| RACI authority conflicts are discovered mid-analysis | Conflicts are recorded in the RACI Conflicts section and must be resolved or consciously accepted before change-scoping proceeds |

## Hand-off Gate

**Before reading `change-scoping.md` (analysis-workflow step 2), you must:**
1. **Write the completed artifact to `docs/<feature>/requirements-package/analysis/stakeholder-map.md` relative to the project repository root. The file write must succeed before proceeding.**
2. Confirm that `docs/<feature>/requirements-package/analysis/assumption-log.md` and `docs/<feature>/requirements-package/analysis/decision-log.md` have been updated with all entries from this artifact.
3. Present the stakeholder map to the user.
4. If the RACI Conflicts section contains any open conflicts, surface them explicitly: **"The following RACI conflicts are unresolved: [list]. These must be resolved or consciously accepted before change-scoping can proceed."**
5. Ask the user explicitly: **"Is this stakeholder map complete and accurate enough to proceed to change-scoping?"**
6. Do not proceed until the user has explicitly confirmed.

---

## Completion Criteria

- [ ] All stakeholder categories have been considered — any category with no named stakeholder is recorded as Unknown in the artifact
- [ ] Every stakeholder has an influence and interest rating
- [ ] Every stakeholder is placed in a grid quadrant
- [ ] The RACI matrix covers all four deliverable columns with exactly one Accountable per column
- [ ] Any RACI conflicts are recorded in the RACI Conflicts section of the artifact
- [ ] A consultation plan exists for every Consulted stakeholder
- [ ] A notification plan exists for every Informed stakeholder
- [ ] The Stakeholder Concerns Register is populated, or explicitly states that no concerns were identified
- [ ] User-stated stakeholder identifications and classifications are recorded as assumptions in the Assumptions section of the artifact; stakeholder identifications sourced from discovery artifacts are recorded with their source in the Stakeholder Identification table and are not duplicated as assumptions unless the user modified or extended them
- [ ] All assumptions in the artifact are also added to the assumption log
- [ ] All classification calls where two or more valid placements existed, all RACI conflict resolutions, and all engagement priority calls where either timing was genuinely viable are recorded in the Decisions section of the artifact
- [ ] All decisions in the artifact are also added to the decision log
