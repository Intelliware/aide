# Review — Traceability

## Purpose

Verify that all requirements trace to their stakeholder origin, test coverage, scope boundaries, constraints, risks, and must-not-touch items. Vertical traceability to design decisions is out of scope at this stage — it is verified at architect handoff.

## When to Use

- After the requirements package has been assembled and before architect handoff — design decisions do not exist yet at this stage; this review validates that the package is internally traceable before the architect receives it
- When the requirements set has grown through multiple stakeholder review cycles and the cross-references between sections need verification
- Any time a stakeholder asks "why is this requirement in here?" or "what stakeholder need does this design decision serve?"

## What This Reviews

Traceability review asks: **can every functional requirement in the package be connected to every other artifact it should connect to?** It works entirely from the assembled requirements package, checking that the cross-references embedded within its sections are correct, complete, and bidirectional — and that no requirements, objectives, journey stages, or risks are orphaned.

Traceability is not bureaucracy. It serves a practical function: when a requirement changes, traceability tells you exactly which tests to rerun, which design decisions to revisit, and which stakeholders to notify.

## Traceability Dimensions

| Direction | What it confirms | Checks | Package sections |
|-----------|-----------------|--------|-----------------|
| **Backward** (to origin) | Every FR traces to at least one business objective or user journey stage | Check 1 | Sections 3, 4, 5 |
| **Forward** (to test) | Every FR traces to at least one acceptance criterion | Check 2 | Section 5 |
| **Horizontal** (to scope and constraints) | No FR violates scope exclusions or hard constraints; every must-not-touch item and every risk traces forward to at least one FR or NFR that governs it | Checks 3, 4, 5, 6 | Sections 1, 5, 9, 10 |
| **Internal** (cross-reference accuracy) | Cross-references embedded in the package are current and bidirectional | Check 7 | All sections |
| **Vertical** (to design) | Every FR traces to a design decision — populated by the architect during design and verified at architect handoff, not at this review stage | — | — |

The BSA owns backward, forward, horizontal, and internal traceability. The architect populates vertical traceability during design. This review validates backward, forward, horizontal, and internal traceability; vertical traceability is verified separately at architect handoff.

## Inputs

| Input | Source | Section in requirements package |
|-------|--------|--------------------------------|
| Requirements package | `docs/<feature>/requirements-package/requirements-package.md` | The single assembled document — all checks below draw from its sections |

The checks reference specific sections of the requirements package:

| Section | Used by |
|---------|---------|
| Section 3 — Business Objectives | Check 1 (backward traceability — objectives as origin) |
| Section 4 — User Journeys | Check 1 (backward traceability — journey stages as origin) |
| Section 5 — Functional Requirements | All checks — FR-xxx items are the primary artifact under review |
| Section 9 — Non-Functional Requirements | Check 4 (constraint traceability — NFRs derived from constraints) |
| Section 10 — Assumptions, Constraints & Scope | Checks 3, 4, 5 (scope exclusions, hard constraints, must-not-touch items) |
| Section 1 — Executive Summary (Key Risks) | Check 5 (must-not-touch count cross-check); Check 6 (risk traceability — risks as origin) |

If a section is absent or has no relevant content, the corresponding check is recorded as **Not Applicable**. Before recording Not Applicable, confirm with the package author whether the absence is deliberate (e.g. no risks identified, no constraints imposed) or an oversight. Record the author's confirmation alongside the finding. An unchecked Not Applicable is not a clean bill of health — it is an untested assumption.

## Workflow

```
┌──────────────────────────────────────────────────────┐
│  1. BACKWARD TRACEABILITY          [Sections 3,4,5]  │
│     Every FR → ≥1 objective or journey stage         │
│     Every objective → ≥1 FR                         │
│     Every journey stage → ≥1 FR                     │
├──────────────────────────────────────────────────────┤
│  2. FORWARD TRACEABILITY               [Section 5]   │
│     Every FR → ≥1 AC                                │
│     Every AC → the FR it tests                      │
├──────────────────────────────────────────────────────┤
│  3. SCOPE TRACEABILITY              [Sections 5,10]  │
│     No FR addresses an EX-xxx out-of-scope item     │
│     No FR modifies an EX-xxx must-not-touch item    │
├──────────────────────────────────────────────────────┤
│  4. CONSTRAINT TRACEABILITY        [Sections 9,10]   │
│     Every hard constraint → ≥1 FR or NFR            │
│     Every NFR bounded by a constraint → refs it     │
├──────────────────────────────────────────────────────┤
│  5. MUST-NOT-TOUCH TRACEABILITY   [Sections 1,5,10]  │
│     Every must-not-touch item → ≥1 preservation FR  │
├──────────────────────────────────────────────────────┤
│  6. RISK TRACEABILITY              [Sections 1,5,9]  │
│     Every flagged risk → ≥1 mitigation FR or NFR    │
├──────────────────────────────────────────────────────┤
│  7. CROSS-REFERENCE ACCURACY          [All sections] │
│     Every FR-xxx, NFR-xxx, OBJ-xxx cross-reference  │
│     in the package resolves and is bidirectional    │
└──────────────────────────────────────────────────────┘
```

## Check Details

### Check 1 — Backward Traceability

This check verifies that every functional requirement in Section 5 can be traced back to a stated stakeholder need — a business objective (Section 3) and a user journey stage (Section 4). Both are embedded directly in the FR table: the Journey Stage column and the Business Objective column. The business objectives table in Section 3 also carries a Functional Requirements column, making the link bidirectionally recorded in the package.

**FR → objective and journey stage (no orphaned requirements):**
Every FR in Section 5 must have a non-empty Business Objective (OBJ-xxx) and Journey Stage. An FR missing either is potential scope creep — it was added without a traceable stakeholder need behind it.

**Objective → FR (no uncovered objectives):**
Every business objective in Section 3 must trace to at least one FR. An objective with no FR coverage is a completeness failure — the stakeholder outcome was stated but no requirement addresses it.

**Journey stage → FR (no unsupported journey stages):**
Every journey stage in Section 4 must trace to at least one FR. A journey stage with no FR is a completeness gap — the system's behaviour at that stage is undefined. Exception: a stage explicitly noted as out of scope, or where the System Response column is empty because no system involvement is expected (e.g., the user acts entirely outside the system at that step), is exempt. Record the exemption reason alongside the check result.

### Check 2 — Forward Traceability

This check verifies that every FR in Section 5 has an acceptance criterion recorded against it, and that every AC recorded can be linked back to its FR. The Acceptance Criteria Summary column in the FR table is the source of truth. AC quality — whether each criterion is testable, measurable, and unambiguous — is the remit of `review-testability.md`, not this check.

**FR → AC (no untested requirements):**
Every FR must have a non-empty Acceptance Criteria Summary. An FR whose summary field is blank or contains a placeholder has no forward traceability — it cannot be tested and cannot be accepted.

**AC → FR (no dangling ACs):**
Every AC summary must be written against a specific FR. An AC entry that describes behaviour not covered by any FR in Section 5 is either testing an implementation detail (`review-implementation-leakage.md` failure) or was written for a requirement subsequently removed and not cleaned up.

### Check 3 — Scope Traceability

The Scope Exclusions table in Section 10 lists every item explicitly out of scope or must-not-touch, each with an EX-xxx ID and a Type. This check verifies that no FR in Section 5 addresses an excluded item.

Coverage in the other direction — confirming that every in-scope intent is addressed by at least one FR — is the remit of `review-completeness.md`, not this check. The requirements package does not contain an enumerated in-scope list separate from the FRs themselves; attempting to derive one from the Executive Summary narrative would be inference, not verification.

**FR → scope exclusions (no scope creep):**
For each FR in Section 5, verify that it does not address any item listed with Type "Out of scope" in Section 10. An FR that implements an explicitly excluded item is a scope creep finding regardless of how it entered the package.

**Must-not-touch boundary (no accidental touch):**
For each FR in Section 5, verify that it does not modify behaviour of any item listed with Type "Must not touch" in Section 10. An FR that alters a must-not-touch area without a preservation intent is a High finding.

If Section 10 contains no scope exclusions, record this check as Not Applicable — confirm with the package author that the absence is deliberate rather than an oversight.

**Relationship to Check 5:** Check 3 identifies FRs that unintentionally cross a must-not-touch boundary — it finds violations. Check 5 verifies the other direction: that each must-not-touch item in Section 10 has a corresponding preservation FR — it finds gaps. Both must be run; they address different failure modes and neither subsumes the other.

### Check 4 — Constraint Traceability

Constraints are listed in Section 10. Each constraint row has a Hard / Soft column. Hard constraints eliminate implementation approaches or create non-negotiable bounds; they must be enforced by at least one FR or NFR. Soft constraints set preferences that can be overridden with justification; they do not require a requirement but should not be silently ignored either.

**Hard constraint → FR or NFR:**
For every constraint in Section 10 marked Hard, find the FR (Section 5) or NFR (Section 9) that enforces it. A Hard constraint with no covering requirement will be silently violated during implementation — flag it as High.

**NFR → constraint (where applicable):**
Every NFR in Section 9 with a specific numeric target has a Constraint Ref column. Where that column is populated with a constraint row number, verify that the referenced constraint exists in Section 10. An NFR whose target appears to be bounded by a constraint but whose Constraint Ref is "None" or blank is a traceability gap — the target is ungrounded and cannot be justified to an architect or QE.

If Section 10 contains no constraints, record this check as Not Applicable — confirm with the package author that the absence is deliberate.

### Check 5 — Must-Not-Touch Traceability (Brownfield)

Must-not-touch items are rows in the Section 10 Scope Exclusions table with Type "Must not touch". Each has an EX-xxx ID. The Must Not Touch count in the Section 1 scope summary should match the number of such rows — if the counts disagree, flag it before proceeding.

Every EX-xxx row with Type "Must not touch" must trace to at least one preservation FR in Section 5. A must-not-touch item with no preservation requirement is an unprotected preservation intent — nothing in the spec prevents an implementer from touching it.

If Section 10 contains no rows with Type "Must not touch", record this check as Not Applicable — confirm with the package author that this is a deliberate decision that no areas require preservation, not an oversight.

**Relationship to Check 3:** Check 5 verifies coverage — that every must-not-touch item has a preservation FR. Check 3 verifies boundaries — that no FR unintentionally crosses a must-not-touch boundary. Both must be run; skipping one because the other was completed is a gap.

### Check 6 — Risk Traceability (Brownfield)

Risks are listed in the Key Risks table in Section 1 (Executive Summary). Each row has a Risk ID, description, impact, and mitigation column. The mitigation column names the approach but the requirement that enforces it must exist in Section 5 or Section 9.

**Risk → mitigation FR or NFR:**
For each risk in Section 1, find the FR or NFR that directly constrains, avoids, or bounds it. If no requirement governs the risk, flag it. Use the impact stated in the risk row to set finding severity — a high-impact risk with no mitigation requirement is a High finding.

A general reliability or security NFR does not satisfy traceability for a specific named risk unless that NFR is explicitly scoped to the area the risk describes.

If Section 1 contains no Key Risks, record this check as Not Applicable — confirm with the package author that no risks were identified, not that the risk assessment was skipped.

### Check 7 — Cross-Reference Accuracy

The requirements package contains cross-references embedded within its sections — FR IDs appear in the objectives table, business rules table, data requirements table, and permissions matrix. These were written during drafting and may have gone stale if requirements were added, removed, or renumbered before the package was assembled.

Verify:

- Every FR-xxx referenced in the Key Risks table (Section 1, Mitigation column) exists in Section 5
- Every FR-xxx referenced in the Business Objectives table (Section 3) exists in Section 5
- Every FR-xxx referenced in the User Journeys table (Section 4) exists in Section 5
- Every FR-xxx referenced in the Business Rules table (Section 6) exists in Section 5
- Every FR-xxx referenced in the Data Requirements table (Section 7) exists in Section 5
- Every FR-xxx referenced in the Permissions matrix (Section 8) exists in Section 5
- Every constraint row number in the Constraint Ref column of any NFR in Section 9 corresponds to a row that exists in the Section 10 Constraints table
- All cross-references are bidirectional — if Section 3 says OBJ-01 is served by FR-005, Section 5's FR-005 row must list OBJ-01 in its Business Objective column; if Section 5's FR-005 lists OBJ-01, Section 3's OBJ-01 row must reference FR-005

Stale cross-references are the most common traceability failure and the hardest to catch without a dedicated check.

## Output

A findings list in this format:

| Finding ID | Check | Orphaned Item | Direction | Description | Severity | Recommended Action |
|-----------|-------|--------------|-----------|-------------|---------|-------------------|
| TRACE-001 | Backward | FR-009 | FR → origin | FR-009 has no objective or journey stage reference — no stakeholder need behind it | High | Identify the objective or journey stage it serves, or remove FR-009 as scope creep |
| TRACE-002 | Forward | FR-005 | FR → test | FR-005 has no acceptance criterion — it will not be tested | High | Add AC for FR-005 |
| TRACE-003 | Must-not-touch | EX-002 | Must-not-touch → preservation FR | EX-002 "payment gateway internals" (Type: Must not touch, Section 10) has no preservation FR in Section 5 | High | Add preservation FR referencing EX-002 |
| TRACE-004 | Risk | RISK-007 (Section 1) | Risk → mitigation FR or NFR | High-impact concurrency risk has no FR or NFR that constrains concurrent access behaviour | High | Add mitigation FR or NFR scoped to the concurrency scenario described in RISK-007 |
| TRACE-005 | Cross-reference accuracy | Section 6, BR-011 | — | BR-011 references FR-011 which was removed from Section 5 in the last revision | Medium | Remove BR-011 or re-link to the replacement FR |

**Severity:**
- **High** — orphaned requirement or uncovered risk that will cause a defect, scope dispute, or missed regression
- **Medium** — stale reference or incomplete link that creates confusion but is easily corrected
- **Low** — bidirectionality gap or minor matrix formatting issue

## Verdict

- **PASS** — No High findings. Medium and Low findings documented and accepted by the accountable stakeholder.
- **FAIL** — One or more High findings remain unresolved.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| A requirement added late in the process has no business objective or journey stage behind it — discovered during UAT | Check 1 backward traceability surfaces FRs with no objective or journey stage reference before handoff |
| A business objective is never translated into a requirement, leaving a stakeholder outcome unaddressed | Check 1 surfaces objectives in Section 3 with no FR coverage |
| A requirement implements something explicitly excluded from scope — discovered during UAT when the sponsor rejects the delivery | Check 3 flags any FR that addresses an EX-xxx out-of-scope item before handoff |
| A hard constraint is not reflected in any requirement or NFR and is ignored during implementation | Check 4 enforces the constraint → FR/NFR link |
| A must-not-touch item has no preservation requirement, leaving it unprotected during implementation | Check 5 enforces the must-not-touch → preservation FR chain |
| A high-impact risk has no mitigation requirement and surfaces as a defect during UAT | Check 6 enforces the risk → mitigation FR or NFR link |
| A cross-reference in the package points to a requirement that was removed, making the package misleading | Check 7 cross-reference accuracy catches stale IDs before the package is handed off |
| An architect asks "why does this requirement exist?" and no one can answer | Backward traceability provides the answer: it exists because OBJ-01 was a confirmed business objective or a specific journey stage required it |

## Hand-off Gate

**Review 8 of 10 — strictly sequential. A FAIL verdict must be resolved before reading the next review skill.**

Before reading `review-feasibility.md`, you must:
1. Write the completed findings list in full — every check result with its finding, severity, and recommended action.
2. Record the PASS or FAIL verdict.
3. Present findings and verdict to the BSA for review.
4. If **FAIL**: the BSA resolves all High findings, updates the affected artifacts, and you re-run this review. Do not proceed until the verdict is PASS.
5. If **PASS**: receive explicit BSA acknowledgement, then read `review-feasibility.md`.

---

## Completion Criteria

- [ ] All 7 checks completed (or recorded as Not Applicable with a reason)
- [ ] Every FR in Section 5 has a non-empty Business Objective (OBJ-xxx) and Journey Stage
- [ ] Every business objective in Section 3 traces to at least one FR in Section 5
- [ ] Every journey stage in Section 4 traces to at least one FR in Section 5
- [ ] Every FR in Section 5 has at least one acceptance criterion
- [ ] Every hard constraint in Section 10 is reflected in at least one FR or NFR
- [ ] Every EX-xxx row with Type "Must not touch" in Section 10 traces to at least one preservation FR (brownfield)
- [ ] Every risk in Section 1 traces to at least one mitigation FR or NFR (brownfield)
- [ ] No stale cross-references within the package (FR-xxx, NFR-xxx, OBJ-xxx all resolve)
- [ ] Verdict recorded
- [ ] Verdict presented to and acknowledged by the BSA
