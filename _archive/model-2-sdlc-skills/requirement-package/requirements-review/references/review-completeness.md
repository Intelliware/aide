# Review — Completeness

## Purpose

Check for missing requirements, undefined edge cases, and gaps in coverage. Ensures nothing was left out.

## Role Definition

**BSA (Business Systems Analyst):** the accountable owner of the requirements artifacts for this engagement. The BSA has authority to accept findings, direct artifact updates, and grant sign-off on review verdicts. If this role does not exist on the project by this title, identify a named equivalent before this review begins and record that person's name in the findings document.

## When to Use

- After `review-scope.md` (Review 1) has returned a PASS verdict — completeness is only meaningful once scope is settled. A completeness review run against an unsettled scope will surface false gaps and miss real ones.
- After `package-synthesis.md` has produced and written `docs/<feature>/requirements-package/requirements-package.md` — all review skills operate on the assembled package, not on individual artifacts
- When stakeholders raise concerns that something "wasn't covered"

## What This Reviews

Completeness asks: **is anything missing?** It does not ask whether what is there is correct — that is consistency, measurability, and testability's job. Completeness finds the holes.

## Pre-conditions

Before running any check, verify the following:

| Pre-condition | Required | If not met |
|---|---|---|
| `review-scope.md` returned a PASS verdict and the findings document is available | Yes | Do not begin. Raise with BSA: scope review must pass before completeness review begins. |
| All requirements artifacts are authored and not pending substantive revision | Yes | Do not begin. Raise with BSA: identify which artifacts are incomplete. Record as a Blocker finding and halt. |

## Inputs

All inputs are drawn from the assembled `docs/<feature>/requirements-package/requirements-package.md`.

| Input | Source | Required |
|-------|--------|----------|
| Functional requirements (Section 5 of the package) | `docs/<feature>/requirements-package/requirements-package.md` | Yes |
| Acceptance criteria — embedded in Section 5 alongside each requirement, or as a separate artifact if one was produced; Check 4 describes how to handle both cases | `docs/<feature>/requirements-package/requirements-package.md` | Yes |
| Non-functional requirements (Section 9 of the package) | `docs/<feature>/requirements-package/requirements-package.md` | Yes |
| Business rules catalog (Section 6 of the package) | `docs/<feature>/requirements-package/requirements-package.md` | Yes |
| Data requirements document (Section 7 of the package) | `docs/<feature>/requirements-package/requirements-package.md` | Yes |
| Business objectives (Section 3 of the package) | `docs/<feature>/requirements-package/requirements-package.md` | Yes — needed to verify every objective is covered by ≥1 requirement |
| User journeys (Section 4 of the package) | `docs/<feature>/requirements-package/requirements-package.md` | Yes — needed to verify every journey stage is covered by ≥1 requirement |
| Assumptions, constraints & out-of-scope (Section 10 of the package) | `docs/<feature>/requirements-package/requirements-package.md` | Yes — needed to verify all in-scope items are addressed and all must-not-touch items have preservation requirements |

## Workflow

```
┌──────────────────────────────────────────────────────┐
│  PRE-CONDITIONS                                      │
│     Scope review PASS confirmed. All artifacts       │
│     authored and not pending substantive revision.   │
│     Halt if either pre-condition fails.              │
├──────────────────────────────────────────────────────┤
│  1. OBJECTIVE & JOURNEY COVERAGE                     │
│     Every business objective and journey stage       │
│     → ≥1 functional requirement                      │
├──────────────────────────────────────────────────────┤
│  2. SCOPE ITEM COVERAGE                              │
│     Every in-scope item → ≥1 requirement             │
├──────────────────────────────────────────────────────┤
│  3. EDGE CASE COVERAGE                               │
│     Empty states, error paths, boundary conditions   │
├──────────────────────────────────────────────────────┤
│  4. AC COVERAGE                                      │
│     Every requirement → ≥1 acceptance criterion      │
├──────────────────────────────────────────────────────┤
│  5. NFR COVERAGE                                     │
│     Every capability area → relevant NFRs            │
├──────────────────────────────────────────────────────┤
│  6. BUSINESS RULE COVERAGE                           │
│     Every conditional behavior → ≥1 business rule    │
├──────────────────────────────────────────────────────┤
│  7. DATA COVERAGE                                    │
│     Every entity referenced in spec → data req entry │
├──────────────────────────────────────────────────────┤
│  8. PRESERVATION REQUIREMENT COVERAGE (brownfield)   │
│     Every must-not-touch item → ≥1 preservation req  │
└──────────────────────────────────────────────────────┘
```

## Check Details

### Check 1 — Business Objective and Journey Coverage

Read each business objective from the business objectives artifact. Find the functional requirement(s) that implement it. If no requirement covers a stated objective, it is a **completeness gap**.

Read each stage of every user journey from the user journeys artifact. Find the functional requirement(s) that specify the system behavior at that stage. If a journey stage has no corresponding requirement, it is a **completeness gap**.

Common causes: high-level objectives that were decomposed into user journeys but never translated into concrete functional requirements; journey stages that describe desired UX without a matching system behavior requirement.

### Check 2 — Scope Item Coverage

Read the scope section of the assumptions, constraints & out-of-scope artifact. For each item confirmed as in-scope, find the corresponding functional requirement(s). If an in-scope item has no requirement, it is a **completeness gap** — either a missing requirement or a scope item that should have been explicitly excluded.

### Check 3 — Edge Case Coverage

For each functional requirement, ask:
- What happens when the input is empty or null?
- What happens when the user lacks permission?
- What happens when a dependency is unavailable?
- What happens at boundary values (minimum, maximum, zero, exactly-at-limit)?
- What happens concurrently (two users performing the same action simultaneously)?

For any scenario that has no requirement or AC covering it, flag as a **missing edge case**.

Common causes: requirements authored against the happy path only; edge cases discussed verbally during elicitation but never recorded; concurrent-access scenarios absent on single-user test systems.

### Check 4 — Acceptance Criteria Coverage

**Method:** Construct a two-column mapping: one column for requirement IDs from the functional spec, one column for AC IDs from the acceptance criteria artifact. For every requirement, record the AC(s) that cover it. Any requirement with an empty AC column is a **completeness gap**.

If the functional spec and acceptance criteria are combined in a single document, apply the same mapping — locate each requirement and confirm at least one explicit pass/fail condition is stated for it within the same document.

**Total absence:** If no requirements in the spec have any ACs whatsoever, record a FAIL verdict immediately and halt — there is nothing meaningful to check. Do not continue to Checks 5–8. Escalate to the BSA before proceeding.

**Partial absence:** If some requirements have ACs and others do not, record a High finding for each requirement missing ACs, continue all remaining checks, and record a FAIL verdict — partial AC coverage cannot produce a PASS.

### Check 5 — NFR Coverage

For each new or modified capability area:
- Is there at least one performance NFR for any endpoint or workflow it introduces or modifies?
- If it involves user data, is there a security NFR?
- If it has a compliance dimension (PII, financial, healthcare), is there a compliance NFR?
- If it runs on a schedule or as a background job, is there an availability or reliability NFR?
- If it introduces or modifies any user-facing surface, is there a scalability NFR covering concurrent load?
- If it is integrated with an external system, is there a reliability or error-handling NFR covering that integration?

Missing NFRs for capability areas that clearly have quality requirements are **completeness gaps**.

### Check 6 — Business Rule Coverage

For every "if," "unless," "only when," or conditional clause in the functional spec, find the corresponding business rule in the business rules catalog. Any conditional logic in the spec with no corresponding rule entry is a **completeness gap**.

### Check 7 — Data Coverage

For every information type, information element, or data concept referenced in the functional spec, find the corresponding entry in the data requirements document. Any reference without a data requirements entry is a **completeness gap**.

### Check 8 — Preservation Requirement Coverage (Brownfield)

For every must-not-touch item documented in the assumptions, constraints & out-of-scope artifact, find the corresponding preservation requirement in the functional requirements. Any must-not-touch item with no preservation requirement is a **completeness gap**.

## Output

**Finding ID convention:** Use the prefix `COMP-` followed by a three-digit sequence number starting at `001` for each review run. If a re-run is required after a FAIL, continue the sequence from where the prior run ended — do not restart at `001`. Record the run number in the findings document header so that IDs from different runs remain traceable.

A findings list in this format:

| Finding ID | Check | Location | Description | Severity | Recommended Action |
|-----------|-------|---------|-------------|---------|-------------------|
| COMP-001 | Objective & journey coverage | BO-003 | Business objective "support bulk export" has no functional requirement covering it | High | Add REQ-xxx to functional spec |
| COMP-002 | Edge case coverage | REQ-007 | No requirement or AC covers the behavior when the export job queue is full | High | Add edge case requirement and AC |
| COMP-003 | AC coverage | REQ-012 | Requirement has no acceptance criterion | High | Add AC to acceptance criteria artifact before proceeding to testability review |
| COMP-004 | NFR coverage | User data storage capability | Feature stores PII but no security NFR is present | High | Add security NFR to NFR register |
| COMP-005 | Business rule coverage | REQ-015 | "Only eligible users may access this feature" — no business rule defines eligibility conditions | High | Add eligibility rule to business rules catalog |
| COMP-006 | Data coverage | REQ-009 | References "Shipment event" information — no entry exists in the data requirements document | High | Add Shipment event to data requirements document |
| COMP-007 | Preservation req coverage | MNT-004 | Legacy order processing engine listed as must-not-touch but no preservation requirement exists in functional spec | High | Add preservation requirement to functional spec |

**Severity:**
- **High** — a functional gap that will cause a defect or scope dispute if not addressed
- **Medium** — a quality gap that will cause ambiguity or testing difficulty
- **Low** — a documentation gap with no functional impact

## Verdict

- **PASS** — No High findings. Any Medium or Low findings are documented, and each carries a written BSA acceptance decision recorded against the specific finding ID — a comment in the findings document, an email, or equivalent — stating that the finding is understood and the risk is accepted. Verbal acceptance does not qualify.
- **PASS WITH OBSERVATIONS** — No High findings remain open. One or more Medium or Low findings remain without a written BSA acceptance decision. Before advancing to the next review skill, obtain and record written BSA acceptance for each open finding. The finding row must show the BSA's name, the date, and the risk accepted. Only then is the verdict treated as PASS for sequencing purposes.
- **FAIL** — One or more High findings remain unresolved. Requirements-package must not be assembled until resolved.

## Failure Modes This Skill Prevents

| Failure mode | Check | How this skill prevents it |
|---|---|---|
| A business objective or journey stage has no functional requirement covering it | 1 | Check 1 surfaces the gap before handoff |
| An in-scope item is never translated into a requirement | 2 | Check 2 closes the scope-to-spec gap |
| An error path has no specified behavior and the developer makes it up | 3 | Check 3 forces edge case coverage at requirements time |
| QE has nothing to test against because an AC is missing | 4 | Check 4 ensures every requirement has at least one AC |
| A capability with clear quality requirements has no NFR and the architect designs without a target | 5 | Check 5 ensures every capability area has the NFRs its quality profile demands |
| Conditional behavior in the spec has no governing business rule and is implemented inconsistently | 6 | Check 6 catches conditional clauses with no corresponding rule before handoff |
| An information type is referenced in the spec but never defined, causing developer assumptions to diverge | 7 | Check 7 catches undefined data references before implementation begins |
| A must-not-touch system element is changed because no preservation requirement existed to prevent it | 8 | Check 8 ensures every must-not-touch item has an explicit preservation requirement in the spec |

## Hand-off Gate

**Review 2 of 10 — strictly sequential.**

← Review 1: `review-scope.md` | **Review 2: this skill** | Review 3: `review-consistency.md` →

A FAIL verdict must be fully resolved before reading the next review skill.

Before reading `review-consistency.md`, you must:
1. Write the completed findings list in full — every check result with its finding, severity, and recommended action.
2. Record the PASS, PASS WITH OBSERVATIONS, or FAIL verdict.
3. Present findings and verdict to the BSA for review.
4. If **FAIL**: the BSA resolves all High findings, updates the affected artifacts, and you re-run this review **in full from Check 1** — not selectively from the failed checks. Do not proceed until the verdict is PASS or PASS WITH OBSERVATIONS.
5. If **PASS WITH OBSERVATIONS**: obtain written BSA acceptance for each open Medium or Low finding, recorded as a note on the relevant finding row in the findings document. Acceptable forms: a written comment on the finding row (BSA name and date required), or an email confirmation linked or appended to the findings document. Verbal acceptance does not qualify. Then read `review-consistency.md`.
6. If **PASS**: receive explicit written BSA acknowledgement — a recorded comment, email, or document sign-off. Verbal acknowledgement does not qualify. Then read `review-consistency.md`.

---

## Completion Criteria

Complete this checklist immediately before recording the verdict. For each item, record the result: **Pass**, **Fail** (with finding ID), or **N/A** (with written justification confirmed by the BSA).

- [ ] Pre-conditions: scope review PASS confirmed; all artifacts authored and not pending substantive revision
- [ ] Check 1: every business objective has ≥1 functional requirement; every user journey stage has ≥1 functional requirement
- [ ] Check 2: every in-scope item in the assumptions-constraints-scope artifact has ≥1 functional requirement
- [ ] Check 3: every functional requirement has been assessed for edge cases; any uncovered scenario is raised as a finding
- [ ] Check 4: every functional requirement has at least one AC; total or partial absence handled per Check 4 procedure
- [ ] Check 5: every new or modified capability area has the NFRs its quality profile demands
- [ ] Check 6: every conditional clause in the functional spec has a corresponding business rule in the catalog
- [ ] Check 7: every information type, information element, and data concept in the functional spec has an entry in the data requirements document
- [ ] Check 8: every must-not-touch item has a preservation requirement in the functional spec
- [ ] All findings documented with severity and recommended action
- [ ] All High findings resolved (spec updated) or — if accepted — recorded with written BSA rationale
- [ ] Verdict recorded (PASS / PASS WITH OBSERVATIONS / FAIL)
- [ ] If PASS or PASS WITH OBSERVATIONS: written BSA acknowledgement received and recorded in the findings document
