# Assumptions, Constraints & Out of Scope

## Purpose

Consolidate assumptions, constraints, and out-of-scope items into a single requirements-phase artifact. Consumes the assumption log, constraint register, change-scope, and decision log from the analysis phase and carries them forward into the requirements package, updated with anything new surfaced during requirements. If analysis was skipped, elicits all items directly from the user. For assumptions: captures statement, category, source, impact if wrong, verification status, verification plan, verification deadline, owner, and risk level; includes an escalation protocol for assumptions verified as false. For constraints: captures category, hard/soft classification, source, consequence of violation, waiver path, and affected requirements; detects and escalates conflicts between constraints. For out-of-scope items: captures description, rationale, decision maker (with authority confirmed), risk if later needed, related requirements, and future phase (validated against an active roadmap); must-not-touch items are documented separately. Produces a consolidated document that becomes Section 10 of the requirements package.

## When to Use

- As the final section-producing skill in the requirements phase — after all other requirements sections are complete
- When the requirements package needs a consolidated view of what is assumed, what limits the change, and what is excluded
- As a checkpoint: by this point, every skill in the requirements phase has surfaced assumptions and constraints — this skill consolidates them

## What This Produces

A consolidated document with three sections:

1. **Assumptions** — everything the requirements are built on that has not been verified as fact, with impact-if-wrong and verification plans
2. **Constraints** — hard and soft limits the change must operate within, with consequences of violation
3. **Out of Scope** — what is explicitly excluded from this change, why, and who decided

## Did Analysis Run?

Assess which analysis artefacts exist and apply the matching path. Do not treat this as a binary — analysis may be partially complete.

**All three artefacts present** (`docs/<feature>/requirements-package/analysis/assumption-log.md`, `docs/<feature>/requirements-package/analysis/constraint-register.md`, `docs/<feature>/requirements-package/analysis/change-scope.md`):
- Carry forward all entries from all three artefacts, plus the `decision-log` if available
- Update with any new assumptions, constraints, or scope exclusions surfaced during requirements

**Some artefacts missing** (one or two of the three exist):
- Carry forward the artefacts that do exist
- For each missing artefact only: elicit the corresponding items directly from the user and from requirements skill outputs
- Do not discard or re-elicit from artefacts that are present

**No artefacts present** (analysis was fully skipped):
- Elicit all assumptions, constraints, and scope exclusions directly from the user and from each requirements skill's output

**In all paths:** stakeholder statements about business intent, scope decisions, and organisational constraints are treated as `Stakeholder-confirmed` and do not require assumption tracking — with two qualifications:
1. **Inter-stakeholder conflicts:** if two stakeholders assert contradictory positions on the same business rule, scope decision, or constraint, the conflict must be escalated and resolved before the item is treated as confirmed. Do not silently accept one version over another.
2. **Material system claims from stakeholders:** if a stakeholder describes how the existing system currently behaves (rather than expressing business intent), treat the statement as `Assumed-pending-confirmation` and verify it against the codebase or prior analysis artefacts — stakeholders can misremember or describe the intended state rather than the actual state.

What requires tracking as assumptions are system claims — statements about how the existing system behaves, what technical constraints the system has, and what integration dependencies exist — that have not been verified against the codebase or prior analysis artefacts.

## Inputs

| Input | Source | Required | If analysis was skipped |
|-------|--------|----------|------------------------|
| Assumption log | `docs/<feature>/requirements-package/analysis/assumption-log.md` | If available | Harvest assumptions from all requirements skills |
| Constraint register | `docs/<feature>/requirements-package/analysis/constraint-register.md` | If available | User provides constraints |
| Change-scope (out-of-scope list) | `docs/<feature>/requirements-package/analysis/change-scope.md` | If available | User describes scope exclusions |
| Decision log | `docs/<feature>/requirements-package/analysis/decision-log.md` | If available | Elicit scope exclusion decisions and constraint waivers directly from the user |
| All requirements-phase artifacts | All prior requirements skills | Yes | Scan for assumptions surfaced during requirements |

## Workflow

```
┌──────────────────────────────────────────────────────┐
│  1. HARVEST — Collect from all sources               │
│     ┌─ Did analysis run? ──────────────────────────┐ │
│     │  YES → load assumption-log, constraint-      │ │
│     │         register, change-scope, decision-    │ │
│     │         log; carry all entries forward       │ │
│     │  NO  → elicit from user; scan requirements   │ │
│     │         skill outputs; flag all as pending   │ │
│     └──────────────────────────────────────────────┘ │
│     In both paths: scan requirements artifacts for   │
│     any new assumptions or constraints not yet       │
│     logged.                                          │
├──────────────────────────────────────────────────────┤
│  2. ASSUMPTIONS — Consolidate and classify           │
│     Every assumption with: statement, category,      │
│     source, impact if wrong, verification status,    │
│     verification plan, deadline, owner, risk level,  │
│     cross-reference. Flag invalidated assumptions    │
│     immediately.                                     │
├──────────────────────────────────────────────────────┤
│  3. CONSTRAINTS — Consolidate and classify           │
│     Every constraint with: category, hard/soft,      │
│     evidence, consequence, owner. Detect and         │
│     escalate conflicts before assembling.            │
├──────────────────────────────────────────────────────┤
│  4. OUT OF SCOPE — Consolidate and justify           │
│     Every exclusion with: what is excluded, why,     │
│     who decided (with authority), and the risk if    │
│     it is later needed. Validate future phase refs.  │
├──────────────────────────────────────────────────────┤
│  5. REVIEW — Cross-check for completeness            │
│     Scan all requirements artifacts using signal     │
│     phrases for unlogged assumptions, unrecorded     │
│     constraints, and undocumented scope exclusions.  │
├──────────────────────────────────────────────────────┤
│  6. ASSEMBLE — Populate the template                 │
└──────────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Harvest from All Sources

**If analysis ran:**
- Load the assumption log — carry forward all entries
- Load the constraint register — carry forward all entries
- Load the change-scope — extract the out-of-scope and must-not-touch lists
- Load the decision log — extract the following for use in this skill:
  - **Scope boundary decisions and Won't-have decisions** (DEC entries with scope or Won't-have rationale) → candidate out-of-scope items for Step 4. If a scope boundary or Won't-have decision does not already appear in the change-scope out-of-scope list, add it here with the DEC ID as the decision source and the decision-maker recorded as the authority
  - **Constraint waivers and accepted constraints** (DEC entries recording a constraint accepted or waived) → candidate constraint entries for Step 3. If a waived or accepted constraint does not already appear in the constraint register, add it here with the DEC ID as the source
  - **Accepted risks that impose a boundary** → candidate constraint entries for Step 3
- Scan all requirements-phase artifacts for new assumptions or constraints surfaced during requirements writing

**If analysis was skipped:**
Ask the user:

1. **What are you assuming to be true that has not been verified?** (about the system, the users, the data, the business rules)
2. **What limits or restrictions does this change need to operate within?** (technology, performance, regulatory, organizational)
3. **What is explicitly NOT included in this change?** (features deferred, areas not touched, integrations not in scope)

Additionally, scan every requirements skill output (executive summary, stakeholders, objectives, functional requirements, business rules, user journeys, data requirements, permissions, NFRs) for any assumptions recorded in their individual Assumptions sections.

### Step 2 — Consolidate Assumptions

See the **Worked Example** section for a correctly populated assumption entry, including a cross-referenced assumption–constraint overlap.

For each assumption, document:

| Field | What to capture |
|-------|----------------|
| **ID** | Unique identifier (ASMP-xxx) |
| **Statement** | The assumption, stated clearly |
| **Category** | `System behavior` / `User behavior` / `Data` / `Business rule` / `Technical` — see category decision rules below |
| **Source** | Which skill or artifact surfaced this assumption |
| **Impact if wrong** | What requirement or design decision is invalidated if this assumption is false |
| **Verification status** | `Code-verified` / `Stakeholder-confirmed` / `Assumed-pending-confirmation` / `Verification-In-Progress` / `Verification-Blocked` / `Verified-False` — see classification rules below |
| **Verification plan** | How this assumption will be verified and who will confirm it |
| **Verification deadline** | Target date by which this assumption must be verified |
| **Owner** | Who is responsible for verifying this assumption |
| **Risk level** | High (invalidates a requirement on the delivery critical path, a contractual commitment, or one with a named regulatory dependency) / Medium (requires rework to one or more requirements with no critical-path impact) / Low (minor adjustment, no requirement re-opened) |
| **Cross-reference** | If this assumption also generates a constraint, the ID of the corresponding CON-xxx entry. Omit if no overlap. |
| **Depends on** | If this assumption is only valid if another assumption holds (i.e., a dependency chain exists), record the ASMP-xxx ID of the parent assumption. Omit if standalone. |

**Assumption category decision rules** — categories are mutually exclusive; apply the first that fits:
- **System behavior:** the assumption is about how the existing system, API, or infrastructure currently behaves (e.g., "the API supports pagination")
- **User behavior:** the assumption is about how users act or what they expect (e.g., "users will not submit duplicate requests")
- **Data:** the assumption is about the state, quality, or structure of data (e.g., "all customer records have a valid email address")
- **Business rule:** the assumption is about an organisational policy, process, or decision rule that has not been formally confirmed (e.g., "returns are only permitted within 30 days")
- **Technical:** the assumption is about a technical dependency, tool, or platform capability that is not the existing system itself (e.g., "the cloud provider supports the required instance type")
- If an assumption spans categories, choose the category that describes the primary risk if the assumption is wrong. Do not assign multiple categories.

**Classification rules:**
- **Code-verified:** confirmed by reading the actual codebase, database schema, or configuration
- **Stakeholder-confirmed:** confirmed in a stakeholder session with a named participant
- **Assumed-pending-confirmation:** not yet verified and no verification attempt has been made — carries risk
- **Verification-In-Progress:** verification has been initiated; owner has begun the confirmation activity
- **Verification-Blocked:** verification cannot proceed — the required artefact, access, or respondent is unavailable; record the blocker explicitly and escalate if on the delivery critical path
- **Verified-False:** verification was completed and the assumption was found to be incorrect — see escalation protocol below

**If an assumption is verified as false:**
1. Set verification status to `Verified-False`
2. Identify every requirement whose `Impact if wrong` references this assumption
3. Re-invoke the requirements skill that owns each affected requirement (e.g., functional-requirements for functional specs, business-rules for business rules, nonfunctional-requirements for NFRs) and revise the affected items. Re-run any downstream skill whose output depends on the revised requirements
4. Notify the owner and escalate to the appropriate authority (project sponsor, product owner, or delivery manager — whoever holds accountability for requirements decisions on this project) if the risk level is High
5. Check the `Depends on` field across all other assumptions — any assumption that lists the verified-false assumption as a parent is also invalidated. Process each dependent assumption through this same protocol
6. Do not mark the hand-off gate as complete until all affected requirements have been revised and the impacted skills' outputs updated

**If a verification deadline has passed without verification:**
1. Move the assumption to `Verification-Blocked` status if a specific blocker exists; otherwise retain `Assumed-pending-confirmation` and flag as overdue
2. Escalate immediately to the assumption owner and to the appropriate authority (project sponsor, product owner, or delivery manager)
3. If the assumption is on the delivery critical path or carries a High risk level, block the hand-off gate until verification is completed or the assumption is formally accepted as a known risk by a named authority
4. Record the overdue status and escalation explicitly in the assumption entry — do not allow a missed deadline to pass silently

### Step 3 — Consolidate Constraints

See the **Worked Example** section for a correctly populated constraint entry, including a cross-referenced assumption–constraint overlap.

For each constraint, document:

| Field | What to capture |
|-------|----------------|
| **ID** | Unique identifier (CON-xxx) |
| **Category** | Technology / Performance / Data / Operational / Contractual / Regulatory / Organizational |
| **Description** | What the constraint is and what it limits |
| **Hard / Soft** | Hard (non-negotiable) or Soft (negotiable with trade-offs) |
| **Source** | Code evidence / document / stakeholder / derived from analysis |
| **Owner** | Who is responsible for this constraint's validity |
| **Consequence of violation** | What breaks, what liability arises, or what must be redesigned |
| **Waiver path** | For soft constraints: the approval required. N/A for hard constraints |
| **Affected requirements** | Which REQ-xxx items are bounded by this constraint |
| **Cross-reference** | If this constraint depends on an unverified assumption, the ID of the corresponding ASMP-xxx entry. Omit if no overlap. |

**If analysis ran:** carry forward the constraint register entries and update with any new constraints surfaced during requirements.

**If analysis was skipped:** derive constraints from:
- The functional spec (any technology or performance implications)
- The permissions model (security and regulatory constraints)
- The NFR document (performance and availability constraints)
- The user's direct input

**Constraint conflict detection:**
After all constraints are logged, check for pairs that cannot be simultaneously satisfied. If a conflict exists between two hard constraints, do not proceed to Step 4. Record the conflict, identify the constraint owners, and escalate to the appropriate authority (project sponsor, product owner, or delivery manager — whoever holds accountability for requirements decisions on this project) for resolution. If a hard and soft constraint conflict, the soft constraint yields — document this explicitly, recording the authority who confirmed the yield.

**Assumption–constraint overlap:**
An item can qualify as both an assumption and a constraint — for example, "The payment gateway is assumed to support idempotent retries; if it does not, the retry logic cannot be implemented as designed." When this occurs:
- Log it in **both** registers with cross-references (e.g., ASMP-003 → CON-007)
- The assumption captures the unverified state of the world
- The constraint captures the design boundary that depends on that state

### Step 4 — Consolidate Out-of-Scope Items

See the **Worked Example** section for correctly populated out-of-scope and must-not-touch entries.

For each scope exclusion, document:

| Field | What to capture |
|-------|----------------|
| **ID** | Unique identifier (OOS-xxx) |
| **Description** | What is excluded from this change |
| **Rationale** | Why it is excluded — must be substantive: `deferred to future phase` / `too risky at this time` / `resource constraint` / `dependency not yet resolved`. Vague rationales (e.g., "not related") are not acceptable — if something appeared as a candidate scope item, it requires a real justification for exclusion |
| **Decision maker** | Who decided this is out of scope — must be someone with authority to commit to scope exclusions |
| **Risk if later needed** | What happens if this exclusion turns out to be a mistake (rework cost, schedule impact) |
| **Related requirements** | Any requirements that are affected by this exclusion |
| **Future phase** | If deferred: which future phase or initiative is expected to address it |

> **Decision maker authority:** Confirm that the named decision maker has organizational authority to exclude this scope. Exclusions made by individuals without that authority are not binding and will be challenged during implementation. If authority is unclear, record the name and escalate for sign-off before the package is finalized.

> **Future phase validation:** Verify that the referenced future phase or initiative exists in an active roadmap or backlog. If no such initiative exists, record this explicitly — e.g., "No planned initiative — risk accepted by [name]." Do not allow "Phase 2 will handle it" to stand as an unverified reference.

**Must-not-touch items:** items in the system that must not be modified by this change. These are distinct from out-of-scope items — must-not-touch is an active preservation constraint, not just a scope boundary.

| Field | What to capture |
|-------|----------------|
| **ID** | Unique identifier (MNT-xxx) |
| **Description** | What must not be touched |
| **Rationale** | Why it must be preserved |
| **Risk if violated** | What requirement or dependency is invalidated if this item is inadvertently modified |
| **Related requirements** | Any requirements that rely on or reference this item |

### Step 5 — Cross-Check for Completeness

Scan the output of every requirements-phase skill that ran before this one:

- executive-summary
- stakeholder-personas
- business-objectives
- functional-requirements
- business-rules
- user-journeys
- data-requirements
- permissions-access-control
- nonfunctional-requirements

For each of the above, check for:
- Assumptions that were stated in individual skill outputs but not carried to this consolidated document
- Constraints implied by requirements that were not formally recorded
- Scope exclusions that were mentioned in discussions but not formally documented

This is a completeness sweep — the goal is to ensure this document is the single source of truth for assumptions, constraints, and scope exclusions.

**Scanning signal phrases — use these to find unlogged items:**

| Signal phrase pattern | Likely type |
|---|---|
| "is assumed," "we expect," "should be," "currently," "in practice," "typically" | Unlogged assumption |
| "must not," "cannot exceed," "is limited to," "is restricted to," "must comply," "is not permitted" | Unlogged constraint |
| "outside this change," "not in scope," "future phase," "deferred," "will not be addressed," "is excluded" | Undocumented scope exclusion |
| "must not be modified," "must remain unchanged," "do not touch," "must be preserved" | Undocumented must-not-touch item |

For each hit: determine whether the item is already logged. If not, add it before proceeding to Step 6.

### Step 6 — Assemble

Populate the `assumptions-constraints-scope` template.

## Worked Example

One representative entry for each category, showing correct field population. ASMP-004 and CON-005 demonstrate an assumption–constraint overlap — the same item is logged in both registers with cross-references.

**Assumption (with overlap cross-reference)**

| Field | Value |
|---|---|
| ID | ASMP-004 |
| Statement | The legacy billing API supports paginated retrieval via a pagination token parameter |
| Category | System behavior |
| Source | functional-requirements (FR-12) |
| Impact if wrong | FR-12 as currently specified is invalid — the requirement must be re-opened and rewritten before it can be baselined |
| Verification status | Assumed-pending-confirmation |
| Verification plan | Engineering lead to confirm against API documentation and integration verification |
| Verification deadline | 2026-04-23 |
| Owner | Lead Engineer |
| Risk level | High (invalidates FR-12, which is on the delivery critical path) |
| Cross-reference | Also logged as CON-005 — the constraint that FR-12's retry design is bounded by this assumption |

**Constraint (with overlap cross-reference)**

| Field | Value |
|---|---|
| ID | CON-005 |
| Category | Technology |
| Description | FR-12 bulk invoice retrieval requires paginated retrieval to be available in the legacy billing API — the requirement cannot be specified as written if this capability is absent |
| Hard / Soft | Soft (negotiable if ASMP-004 is verified false — requires FR-12 redesign) |
| Source | functional-requirements (FR-12); derived from ASMP-004 |
| Owner | Lead Engineer |
| Consequence of violation | FR-12 as specified is undeliverable — the constraint boundary cannot be enforced, and the requirement must be re-opened before the package can be baselined |
| Waiver path | If ASMP-004 is verified false, escalate to product owner; FR-12 must be redesigned before this constraint is re-classified |
| Affected requirements | REQ-012 |
| Cross-reference | Also logged as ASMP-004 — the unverified state this constraint depends on |

**Constraint (standalone, no overlap)**

| Field | Value |
|---|---|
| ID | CON-002 |
| Category | Regulatory |
| Description | All personally identifiable data must be stored in the EU region only, per GDPR Article 44 |
| Hard / Soft | Hard |
| Source | Legal team memo dated 2026-01-15 |
| Owner | Data Privacy Officer |
| Consequence of violation | Regulatory breach; potential fines under GDPR; contractual liability with EU customers |
| Waiver path | N/A |
| Affected requirements | REQ-008, REQ-014 |

**Out-of-scope item**

| Field | Value |
|---|---|
| ID | OOS-003 |
| Description | Mobile application support |
| Rationale | Resource constraint — mobile development capacity not allocated to this release |
| Decision maker | Head of Product (confirmed in steering committee 2026-03-01) |
| Risk if later needed | Separate mobile workstream required; estimated 6-week delay to a dependent roadmap item |
| Related requirements | REQ-021 (web only as currently specified) |
| Future phase | Q3 2026 mobile initiative — confirmed in roadmap (JIRA Epic MOB-1) |

**Must-not-touch item**

| Field | Value |
|---|---|
| ID | MNT-001 |
| Description | The `user_audit_log` table schema and write path |
| Rationale | Shared dependency with the compliance reporting system; any schema change breaks downstream reports |
| Risk if violated | The compliance reporting requirement (REQ-031) is invalidated — the reporting system cannot function correctly if the schema or write path changes |
| Related requirements | REQ-031 |

## Output

A populated **assumptions-constraints-scope** document (use the template at `../assets/assumptions-constraints-scope.md`).

### File Output

Write the completed assumptions, constraints, and scope document to `docs/<feature>/requirements-package/requirements/assumptions-constraints-scope.md`.

This is Section 10 of the requirements package. It is the final section and serves as the package's risk and boundary register.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Assumptions are scattered across individual artifacts and never consolidated | Step 2 consolidates all assumptions from every source into one register |
| A constraint is documented in analysis but not carried forward to requirements | Step 3 explicitly carries forward the analysis constraint register |
| Scope exclusions are verbal agreements with no record, leading to scope creep later | Step 4 documents every exclusion with decision maker and rationale |
| Requirements are built on unverified assumptions that nobody tracks | Step 2 verification deadline and owner assignment creates accountability; Assumed-pending-confirmation status makes risk visible |
| A hard constraint is missed and surfaces during implementation as a design blocker | Step 3 consolidation sweep and Step 5 signal-phrase scan catches constraints from all sources including those implied by requirements |
| An assumption is verified as false but affected requirements are not updated | Step 2 escalation protocol mandates re-opening affected requirements before the hand-off gate is cleared |
| Two hard constraints conflict and the contradiction surfaces during implementation | Step 3 conflict detection requires resolution before assembly proceeds |
| A scope exclusion is made by someone without authority to commit to it | Step 4 decision maker authority note requires confirmation of authority before the exclusion is accepted |
| "Future phase will handle it" becomes a permanent deferral with no tracking | Step 4 future phase validation requires a named, active initiative or explicit risk acceptance |

## Hand-off Gate

Before proceeding to `package-synthesis`, you must:
1. Write the completed assumptions-constraints-scope document in full — all assumptions, constraints, and out-of-scope items with their classifications and verification status.
2. Present it to the user for review.
3. Receive explicit acknowledgement before proceeding.

---

## Completion Criteria

- [ ] All assumptions from the analysis assumption log (if it exists) are carried forward
- [ ] All assumptions surfaced during the requirements phase are included
- [ ] Every assumption has: statement, category, impact if wrong, verification status, verification plan, verification deadline, and owner; cross-reference populated where an assumption–constraint overlap exists
- [ ] All constraints from the analysis constraint register (if it exists) are carried forward
- [ ] All constraint waivers and accepted constraints from the analysis decision log (if it exists) are carried forward into the constraint register, with the DEC ID recorded as the source
- [ ] All constraints surfaced during the requirements phase are included
- [ ] Every constraint has: category, hard/soft classification, source, consequence of violation, waiver path (or N/A if hard), and affected requirements; cross-reference populated where a constraint–assumption overlap exists
- [ ] Constraint conflicts have been checked — any conflicts are resolved or escalated before assembly
- [ ] Assumption–constraint overlaps are cross-referenced in both registers
- [ ] All out-of-scope items from the analysis change-scope (if it exists) are carried forward
- [ ] All Won't-have decisions and scope boundary decisions from the analysis decision log (if it exists) are carried forward as out-of-scope items, with the DEC ID recorded as the decision source
- [ ] Every out-of-scope item has: description, rationale, decision maker (with authority confirmed), risk if later needed, and future phase (validated or explicitly noted as unplanned)
- [ ] Must-not-touch items are documented separately from out-of-scope items
- [ ] Every must-not-touch item has: description, rationale, and risk if violated
- [ ] Cross-check sweep (Step 5) has been completed against all requirements-phase artifacts using the signal phrase list
- [ ] If analysis was skipped, all items are flagged as requiring verification
