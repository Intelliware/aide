# Requirements Package Synthesiser

## Purpose

Final step in the requirements-workflow sequence. Synthesises all ten requirements artifacts — executive-summary, stakeholder-personas, business-objectives, user-journeys, functional-requirements, business-rules, data-requirements, permissions-access-control, nonfunctional-requirements, and assumptions-constraints-scope — plus the cross-cutting change tracker into a single coherent requirements package document. Reconciles cross-artifact contradictions, validates the traceability chain from business objectives through to functional requirements and their derived artifacts, validates change tracker coverage and impact chains, produces the Version Diff Summary, and surfaces any gaps or orphaned content before handoff. Produces the single document handed to the architect.

## When to Use

- Final step after all ten requirements artifacts are complete and acknowledged
- The formal review phase (`review/`) is about to begin — or the package is being assembled for handoff

**If an artifact is missing:** Do not skip it — record the gap explicitly in the package, state what is unknown as a result, and flag it as a blocker before handoff. A package that is honest about its gaps is more useful than one that silently omits them.

---

## What This Produces

A single, coherent **requirements package** document — not a collection of links to the ten individual artifacts. The architect and any formal reviewer should be able to work from this document alone without opening individual artifact files.

---

## What This Is Not

- Not a requirements authoring step — all requirements are written by the individual skills; this step only assembles and cross-checks them
- Not a substitute for formal review — the review skills in `review/` still run after this; the package is the input to those reviews
- Not a simple concatenation — it reconciles contradictions across artifacts and validates the traceability chain before assembling

---

## Inputs

| Input | Source skill | Required | If unavailable |
|-------|-------------|----------|----------------|
| Executive summary | `docs/<feature>/requirements-package/requirements/executive-summary.md` | Yes | Record the gap; note that feature context and risk summary are missing from the package |
| Stakeholder personas | `docs/<feature>/requirements-package/requirements/stakeholder-personas.md` | Yes | Record the gap; note that actor definitions for functional requirements are unverified |
| Business objectives | `docs/<feature>/requirements-package/requirements/business-objectives.md` | Yes | Record the gap; note that success criteria cannot be traced from requirements |
| User journeys | `docs/<feature>/requirements-package/requirements/user-journeys.md` | Yes | Record the gap; note that end-to-end experience coverage cannot be confirmed |
| Functional requirements | `docs/<feature>/requirements-package/requirements/functional-requirements.md` | Yes | Package cannot be assembled — functional requirements are the core artifact |
| Business rules | `docs/<feature>/requirements-package/requirements/business-rules.md` | Yes | Record the gap; note that conditional logic and validation rules are undocumented |
| Data requirements | `docs/<feature>/requirements-package/requirements/data-requirements.md` | Yes | Record the gap; note that business information requirements and constraints are undocumented |
| Permissions & access control | `docs/<feature>/requirements-package/requirements/permissions-access-control.md` | Yes | Record the gap; note that authorization rules are undefined |
| Non-functional requirements | `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md` | Yes | Record the gap; note that quality targets are undefined |
| Assumptions, constraints & scope | `docs/<feature>/requirements-package/requirements/assumptions-constraints-scope.md` | Yes | Record the gap; note that the consolidated assumptions register is missing |
| Change tracker | `docs/<feature>/requirements-package/requirements/change-tracker.md` | Yes | Record the gap; note that change history is unavailable — downstream consumers cannot identify what changed between package versions |

---

## Workflow

```
┌──────────────────────────────────────────────────┐
│  1. CHECK — Confirm all artifacts present         │
│     ↓ any artifact missing → stop               │
├──────────────────────────────────────────────────┤
│  2. RECONCILE — Cross-check artifacts for        │
│     contradictions before assembling             │
│     ↓ irresolvable contradictions → Step 6       │
├──────────────────────────────────────────────────┤
│  3. TRACE — Validate the traceability chain      │
│     Objectives → Journeys → Functional reqs →   │
│     Business rules / Data / Permissions / NFRs  │
│     ↓ orphaned items → Step 6                   │
├──────────────────────────────────────────────────┤
│  4. VALIDATE CHANGE TRACKER — Confirm coverage   │
│     Every tracked item has an entry; every       │
│     Impact pointer was acted on; produce the     │
│     Version Diff Summary for this version        │
├──────────────────────────────────────────────────┤
│  5. ASSEMBLE — Produce the package document      │
│     One coherent document in workflow order  │
│     including the change tracker as Section 12   │
├──────────────────────────────────────────────────┤
│  6. LOG GAPS & CONTRADICTIONS — Append to        │
│     package; flag blockers before handoff        │
└──────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Check Completeness

Before reconciling, confirm that every input artifact is present.

**Checklist:**

- [ ] `docs/<feature>/requirements-package/requirements/executive-summary.md` artifact exists and is fully populated (no placeholder sections)
- [ ] `docs/<feature>/requirements-package/requirements/stakeholder-personas.md` artifact exists and is fully populated
- [ ] `docs/<feature>/requirements-package/requirements/business-objectives.md` artifact exists and is fully populated
- [ ] `docs/<feature>/requirements-package/requirements/user-journeys.md` artifact exists with at least one journey per primary persona
- [ ] `docs/<feature>/requirements-package/requirements/functional-requirements.md` artifact exists and is fully populated
- [ ] `docs/<feature>/requirements-package/requirements/business-rules.md` artifact exists and is fully populated
- [ ] `docs/<feature>/requirements-package/requirements/data-requirements.md` artifact exists and is fully populated
- [ ] `docs/<feature>/requirements-package/requirements/permissions-access-control.md` artifact exists and is fully populated
- [ ] `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md` artifact exists and is fully populated
- [ ] `docs/<feature>/requirements-package/requirements/assumptions-constraints-scope.md` artifact exists and is fully populated
- [ ] `docs/<feature>/requirements-package/requirements/change-tracker.md` artifact exists and contains entries

**If functional-requirements is unchecked:** Stop. The package cannot be assembled without the core artifact. Record the gap and halt — do not proceed to Step 2 until functional-requirements is produced.

**If change-tracker is unchecked:** Do not stop. Record the gap in Step 6. Note that the assembled package will have no change history — downstream consumers will not be able to identify what changed between package versions. The package can still be assembled, but the Version Diff Summary (Section 12) will state that the change tracker was not maintained.

**If any other artifact is unchecked:** Do not stop. Record the gap explicitly — state which section is absent and what is unknown as a result. Log it as a blocking or non-blocking issue in Step 6 and continue to Step 2. A package that is honest about its gaps is more useful than one that silently omits them.

---

### Step 2 — Reconcile Cross-Artifact Contradictions

Check for contradictions between artifacts before assembling. Contradictions that are not caught here will appear in the formal review as consistency failures.

**Checks to run:**

| Check | What to compare |
|-------|----------------|
| Scope boundary consistency | Executive summary scope statement vs. assumptions-constraints-scope exclusions — do they agree on what is in and out? |
| Persona coverage | Stakeholder personas list vs. actors named in functional requirements and user journeys — are all actors defined? Are any actors in the requirements not in the personas? |
| Objective traceability | Every business objective (OBJ-xxx, Section 3) must be served by at least one FR — check for objectives with no FR in their Functional Requirements column. Every FR must have a populated Business Objective Ref column — check for FRs with a blank or missing OBJ-xxx link. |
| Journey-to-requirement alignment | Every FR must have a populated Journey Stage Ref column — check for FRs with a blank or missing journey stage reference. Every journey stage must be served by at least one FR — check for journey stages with no FR. |
| FR AC coverage | Every FR must have at least one entry in the Acceptance Criteria section. Check for FRs with no corresponding AC-[REQ-NNN]-N entry. Any FR without an AC is a blocking orphan — assembly cannot proceed. |
| Business rule AC coverage | Every active (New / Modified) business rule must have at least one AC-BR-NNN-N entry. Every Removed rule must have an AC verifying the prior behavior is no longer produced. Rules with multiple branches must have at least one AC per branch. Any active rule without an AC is a non-blocking orphan — flag it for the BSA. |
| Data AC coverage | Every DI-xxx must have at least one AC-DATA-NNN-N for accepted data and at least one for rejected data. Every DO-xxx must have at least one AC for the success path and at least one for the failure path. Missing data ACs are non-blocking orphans — flag them. |
| Permission AC coverage | Every ACR-NNN must have at least one AC-ACR-NNN-N for the condition-met path and at least one for the condition-not-met path. At least one AC-PERM-NNN-N must verify denied access per role. Missing permission ACs are non-blocking orphans — flag them. |
| NFR AC coverage | Every NFR must have at least one AC-NFR-[CAT]-NNN-N entry with the numeric threshold from the NFR target restated in the `Then` clause. Missing NFR ACs are non-blocking orphans — flag them. |
| Error-path AC coverage | Every `New` and `Modified` FR must either have at least one error-path AC (describing the observable outcome on failure) or an explicit `Error path: None — [reason]` determination. Every business rule must address the "no ELSE branch" and "rule-evaluation failure" cases. Every data input from an external source must address source unavailability. Every ACR must address context-source unavailability where applicable. Every performance/reliability/availability NFR must address degraded-mode behavior. Missing error-path assessments are non-blocking orphans — flag them. |
| Rule-to-requirement alignment | Every business rule should be triggered by at least one functional requirement — check for rules with no triggering requirement |
| Data-to-requirement alignment | Every information type in data-requirements should appear in at least one functional requirement — check for information types with no requirement reference |
| Permission-to-actor alignment | Every permission in permissions-access-control should map to a persona defined in stakeholder-personas — check for permissions referencing undefined human roles. Also check that every machine identity named in functional-requirements (service accounts, API clients, background jobs) appears in the permissions artifact's machine identity definitions. |
| Sensitivity classification consistency | The sensitivity tier assigned to each resource in the permissions-access-control artifact should be consistent with the sensitivity classification of the corresponding information types in data-requirements — check for resources classified at a lower tier than the information types they expose. |
| NFR scope alignment | NFRs should be scoped to endpoints, workflows, or capabilities named in functional requirements — check for NFRs referencing undefined system elements |
| Assumption consistency | Assumptions in assumptions-constraints-scope should not contradict confirmed statements in any other artifact — check for assumptions that negate artifact content |
| Constraint consistency | Constraints in assumptions-constraints-scope should not be violated by any functional requirement or NFR — check for requirements that exceed a hard constraint |

**For each contradiction found:**

Record: what contradicted, which artifacts are involved, which artifact is treated as authoritative, and what change (if any) is needed before the package is assembled. If a contradiction cannot be resolved here, log it in Step 6 and flag it as a blocker.

**Determining which artifact is authoritative — apply in order:**

1. **Specificity:** The more specific artifact takes precedence over the more general one for the item in dispute. For example, `assumptions-constraints-scope` takes precedence over the executive summary for scope boundary details; `functional-requirements` takes precedence over the executive summary for what the system does.
2. **Recency of BSA acknowledgement:** If one artifact was revised and re-acknowledged by the BSA more recently than the other, the more recently acknowledged version takes precedence — provided the revision did not itself introduce the contradiction (i.e., an earlier artifact was not made inconsistent by a later revision without a corresponding update).
3. **Stakeholder confirmation:** If one artifact contains a claim explicitly confirmed by a named stakeholder and the other does not, the stakeholder-confirmed claim takes precedence.
4. **None of the above resolves it:** Escalate to the product owner. Record the contradiction, both artifact positions, and the escalation request. Do not guess, do not pick arbitrarily, and do not proceed to assembly until the product owner provides a documented resolution. Record the product owner's decision in the gap log (Step 6).

---

### Step 3 — Validate the Traceability Chain

Trace the logical chain from intent to specification. The chain must hold for the package to be coherent.

**The chain:**

```
Business Objectives
      │
      ▼  (each objective linked directly via OBJ-xxx in every FR's Business Objective Ref column)
Functional Requirements ◄──── User Journeys
      │                       (each journey stage linked via Journey Stage Ref column in every FR)
      │
      ├──► Acceptance Criteria  (one or more ACs per requirement, written inline in the FR document)
      ├──► Business Rules       (rules extracted from functional conditional logic)
      ├──► Data Requirements    (entities identified in functional requirements)
      ├──► Permissions          (actors and capabilities from functional requirements)
      └──► NFRs                 (quality targets scoped to functional endpoints/flows)
```

> **Note on traceability structure:** Business Objective and Journey Stage links are direct — they are embedded as named columns in each functional requirement at authoring time (not derived transitively at synthesis time). The synthesiser validates that both columns are populated; it does not reconstruct the links by traversal. If a Business Objective Ref or Journey Stage Ref cell is blank, that is a data gap in the FR document, not a synthesiser discovery.

**Orphan checks:**

| Orphan type | Description | Action |
|-------------|-------------|--------|
| Objective with no journey coverage | A business objective is not served by any user journey | Flag — either add a journey stage or downgrade the objective to an assumption |
| Journey stage with no functional requirement | A journey stage has no requirement specifying how the system supports it | Flag — either add a requirement or note the stage as out of scope |
| Functional requirement with no journey stage | A requirement has a blank Journey Stage Ref column | Flag — return to functional-requirements and populate the field before proceeding |
| Functional requirement with no business objective | A requirement has a blank Business Objective Ref column | Flag — return to functional-requirements and populate the field before proceeding |
| Functional requirement with no ACs | A requirement has no acceptance criteria in the AC section | Flag as blocking — return to functional-requirements and add ACs before proceeding |
| Business rule with no ACs | An active rule has no AC-BR-NNN-N entry | Flag as non-blocking — return to business-rules and add ACs; log in Step 6 |
| Data input/output with no ACs | A DI-xxx or DO-xxx has no AC-DATA-NNN-N entry | Flag as non-blocking — return to data-requirements and add ACs; log in Step 6 |
| ACR rule with no ACs | An ACR-NNN has no AC-ACR-NNN-N entry | Flag as non-blocking — return to permissions-access-control and add ACs; log in Step 6 |
| NFR with no ACs | An NFR has no AC-NFR-[CAT]-NNN-N entry | Flag as non-blocking — return to nonfunctional-requirements and add ACs; log in Step 6 |
| New/Modified FR with no error-path assessment | A `New` or `Modified` FR has no error-path AC and no `Error path: None` determination | Flag as non-blocking — return to functional-requirements and assess; log in Step 6 |
| Performance/reliability/availability NFR with no degraded-mode assessment | An NFR in these categories has no degraded-mode AC and no `Degraded mode: Not applicable` determination | Flag as non-blocking — return to nonfunctional-requirements and assess; log in Step 6 |
| Business rule with no parent requirement | A rule cannot be traced to any functional requirement that would trigger it | Flag — either link it to a requirement or remove it |
| Information type with no requirement reference | An information type in data-requirements is not referenced by any functional requirement | Flag — either add a requirement or remove the information type |
| NFR with no scoped system element | An NFR references an endpoint or capability not named in functional requirements | Flag — either correct the NFR target or add the missing requirement |
| Machine identity with no permission entry | A machine identity named in functional-requirements has no corresponding entry in the permissions artifact | Flag — return to permissions-access-control and add the machine identity definition before proceeding |
| Resource with no sensitivity classification | A resource appears in the permission matrix but has no sensitivity tier in the permissions-access-control sensitivity classification table | Flag — return to permissions-access-control and classify the resource before proceeding |

Log all orphans found. An orphan is not automatically a bug — it may indicate a legitimate gap in an adjacent artifact. Present the orphans list to the user for resolution before assembling.

**Important:** Blank Business Objective Ref and Journey Stage Ref cells are authoring gaps, not synthesis discoveries — they should have been prevented by the functional-requirements hand-off gate. If they appear here, return the spec to the BSA for correction before continuing synthesis. Do not proceed with assembly while any FR has a blank in either column.

---

### Step 4 — Validate the Change Tracker

Before assembling, confirm that the change tracker is complete and consistent.

**Coverage check:**

For each artifact, count the tracked items it contains (REQ-xxx, OBJ-xxx, BR-xxx, NFR-xxx, ACR-xxx, ASMP-xxx, CON-xxx, OOS-xxx, MNT-xxx, P-xx). Compare against the change tracker's `Added` entries for that artifact. Every tracked item must have at least one `Added` entry. Items with no entry are missing from the tracker — either the authoring skill did not log them, or they were introduced after tracker initialization. Flag each missing item and add a back-filled `Added` entry with `Trigger` set to `Initial authoring (back-filled at synthesis)`.

**Impact chain validation:**

For every change tracker entry where the `Impact` field contains item IDs:
1. Confirm that each impacted item has its own change tracker entry dated on or after the source change — meaning the impact was acted on.
2. If an impacted item has no subsequent entry, it was not updated after the change that affected it. Flag this as a potential stale-artifact issue and log it in Step 6 as a non-blocking issue. Present it to the user — it may be intentional (the impact was assessed and no change was needed) or it may be an oversight.

**Version Diff Summary production:**

Produce the Version Diff Summary for the current package version using the change tracker template structure. For each change tracker entry in this version:
- Aggregate all `Added` entries into the "Items added" table
- Aggregate all `Modified` entries into the "Items modified" table — include the field that changed, the previous value, and the new value. If the previous value is not recorded in the change tracker entry's `Description` field, read the artifact's own revision history or changelog to reconstruct it.
- Aggregate all `Removed` and `Deferred` entries into the "Items removed or deferred" table
- Aggregate all entries with populated `Impact` fields into the "Impact chain" table, with the Impact Confirmed column set based on whether the impacted item has a corresponding entry

Write the completed Version Diff Summary into the change tracker document before proceeding to Step 5.

**If the change tracker is absent:** Record the gap in Step 6. Add a note to Section 12 of the assembled package: "Change tracker was not maintained during the requirements phase. No change history is available. Downstream consumers must treat the entire package as a baseline with no prior version."

---

### Step 5 — Assemble the Package Document

Populate the requirements package using the template at `../assets/requirements-package.md`. Write it as a coherent document — each section is drawn from its source artifact, lightly edited for cross-references and consistency, not copied verbatim.

**The completed package must contain the following sections, in this order:**

1. **Executive Summary** — drawn from `docs/<feature>/requirements-package/requirements/executive-summary.md`: what the feature is, who it is for, why it is being built, scope boundaries, and key risks
2. **Stakeholder Personas** — drawn from `docs/<feature>/requirements-package/requirements/stakeholder-personas.md`: influence grid, RACI, and persona definitions for every actor
3. **Business Objectives** — drawn from `docs/<feature>/requirements-package/requirements/business-objectives.md`: measurable outcomes, success metrics, and priorities
4. **User Journeys** — drawn from `docs/<feature>/requirements-package/requirements/user-journeys.md`: per-persona end-to-end journey maps with friction scores and journey-to-requirement cross-references
5. **Functional Requirements** — drawn from `docs/<feature>/requirements-package/requirements/functional-requirements.md`: the full functional spec with requirement IDs, type, business objective refs, journey stage refs, and inline acceptance criteria
6. **Business Rules** — drawn from `docs/<feature>/requirements-package/requirements/business-rules.md`: rule catalog by category, with each rule linked to the functional requirement that triggers it
7. **Data Requirements** — drawn from `docs/<feature>/requirements-package/requirements/data-requirements.md`: business information requirements with lifecycle tags and links to the functional requirements that reference each information type
8. **Permissions & Access Control** — drawn from `docs/<feature>/requirements-package/requirements/permissions-access-control.md`: role definitions, permission matrix, and authorization rules linked to the functional requirements they gate
9. **Non-Functional Requirements** — drawn from `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md`: NFR statements by category with baselines, targets, and the functional elements they apply to
10. **Assumptions, Constraints & Scope** — drawn from `docs/<feature>/requirements-package/requirements/assumptions-constraints-scope.md`: consolidated register of all assumptions (with owners and validation deadlines), all hard constraints, and all explicit scope exclusions
11. **Package Status** — synthesis date, and a summary of any reconciliation gaps or orphans logged in Steps 2–4 with their resolution status
12. **Change Tracker** — drawn from `docs/<feature>/requirements-package/requirements/change-tracker.md`: the package version log, the change register for this version, and the version diff summary produced in Step 4

**Cross-references:** Where an artifact references content in another artifact (e.g., a business rule links to a functional requirement ID), use the same identifier in the assembled package. Do not introduce new IDs or rename existing ones during assembly.

---

### Step 6 — Log Gaps and Contradictions

Record everything that could not be resolved during Steps 1–4. This log becomes Section 11 of the package and is the input the formal reviewer uses to prioritise their checks.

**For each gap or contradiction, record:**

- What the issue is (gap, contradiction, orphan)
- Which artifacts are involved
- What interim position is being held (or state explicitly that none is safe)
- Whether it is **blocking** (the package must not proceed to formal review until resolved) or **non-blocking** (the formal reviewer is aware and will assess it)

**Blocking items** require resolution before the package is presented for formal review. Surface them to the user, agree on a resolution path, and update the package before continuing.

---

## Output

A single **requirements package** document containing all twelve sections in workflow order, produced by filling in `../assets/requirements-package.md`.

**Write the completed package to a file before presenting it.** Save it as `requirements-package.md` in the `requirements` folder. Do not present the package to the user until the file has been written — the file is the canonical output; the chat presentation is a preview.

### File Output

Write the assembled requirements package to `docs/<feature>/requirements-package/requirements-package.md`.

This document is the single input to the formal review phase:
- **`review-scope.md`** — uses the executive summary and assumptions-constraints-scope sections
- **`review-completeness.md`** — uses functional requirements, user journeys, and business objectives
- **`review-consistency.md`** — uses all sections (cross-artifact consistency)
- **`review-measurability.md`** — uses functional requirements, business objectives, and NFRs
- **`review-testability.md`** — uses functional requirements and business rules
- **`review-implementation-leakage.md`** — uses functional requirements
- **`review-data-completeness.md`** — uses data requirements and business rules
- **`review-traceability.md`** — uses Sections 1 (Key Risks), 3 (Business Objectives), 4 (User Journeys), 5 (Functional Requirements), 9 (NFRs), and 10 (Assumptions, Constraints & Scope)
- **`review-feasibility.md`** — uses NFRs, constraints, and functional requirements
- **`review-requirements-readiness.md`** — uses the full package

---

## Hand-off Gate

**Requirements synthesis is not complete until this step is done. Before proceeding to Phase 4 (Formal Review):**

1. Complete all six synthesis steps (check, reconcile, trace, validate change tracker, assemble, log).
2. Log all gaps, contradictions, and orphans in Section 11 with their blocking or non-blocking status.
3. Resolve all blocking gaps and contradictions before presenting the package.
4. Write the completed `requirements-package.md` to the `requirements` folder — this file write must succeed before proceeding.
5. Present the package to the user, noting it has been saved and where.
6. Ask the user to confirm the Completion Criteria below are satisfied before acknowledging that formal review can begin.

---

## Completion Criteria

- [ ] All ten section-producing artifacts and the change tracker were present; any gaps are explicitly logged in Section 11
- [ ] All cross-artifact contradictions were checked; each is either resolved (with the authoritative artifact recorded) or logged as a blocking or non-blocking issue in Section 11
- [ ] The traceability chain was validated: every objective traces to a journey and to at least one FR (via the FR table's Business Objective column), every journey stage traces to at least one FR (via the FR table's Journey Stage column), every derived artifact (rules, data, permissions, NFRs) traces to a functional requirement
- [ ] Every machine identity named in functional-requirements appears in the permissions-access-control artifact
- [ ] Resource sensitivity tiers in permissions-access-control are consistent with information type classifications in data-requirements — no resource is classified at a lower tier than the information it exposes
- [ ] All orphans (objectives, journey stages, requirements, rules, entities, NFRs with no traceable parent or child) are logged in Section 11 with their resolution status
- [ ] Acceptance criteria coverage validated: every FR has ACs (blocking); every active business rule, data input/output, ACR rule, and NFR has ACs (non-blocking — missing ACs are logged in Section 11)
- [ ] Error-path AC coverage validated: every New/Modified FR has an error-path AC or explicit `Error path: None` determination; every performance/reliability/availability NFR has a degraded-mode AC or explicit determination (non-blocking — missing assessments are logged in Section 11)
- [ ] The change tracker has been validated: every tracked item across all artifacts has at least one `Added` entry; all Impact pointers have been checked; the Version Diff Summary for this package version has been produced and written to the change tracker
- [ ] The package contains all twelve sections in workflow order, with no empty or placeholder sections — absent content is explained explicitly
- [ ] Cross-references between sections use consistent requirement IDs from the source artifacts
- [ ] Blocking items in Section 11 have been resolved before the package was presented
- [ ] The package reads as a single coherent document, not a set of artifact summaries stapled together
- [ ] **`requirements-package.md` has been written to the `requirements` folder before the user is asked to acknowledge**
