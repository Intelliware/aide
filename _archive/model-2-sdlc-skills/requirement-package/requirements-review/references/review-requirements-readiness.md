# Review — Requirements Readiness

## Purpose

Go/no-go gate — validates the requirements package is complete, consistent, and ready for handoff to the architect. Checks that all specs, NFRs, acceptance criteria, and traceability are in place.

## When to Use

- After all other review skills have passed — this is the final gate, not an early check
- After the requirements-package has been assembled by `package-synthesis.md` (Phase 3 step 11)
- As the formal go/no-go decision point for architect handoff
- If any upstream review skill produced High findings that were subsequently resolved, re-run this skill to confirm the resolution before approving

## What This Is

Requirements readiness is the **terminal gate review** — the single decision point that determines whether the requirements set is ready to hand off to the architect. It does not re-run the detailed checks of the individual review skills. It aggregates their verdicts and applies a holistic assessment of package integrity and handoff risk.

This review is run by (or in consultation with) the accountable stakeholder or delivery lead, not just the BSA. Its output is a formal approval — not a findings list.

## Review Order

The individual review skills must be run and passed in this order before requirements readiness is assessed:

| Step | Review Skill | Purpose |
|------|-------------|---------|
| 1 | review-scope | Confirms scope is defined, bounded, and free of creep |
| 2 | review-completeness | Confirms nothing is missing |
| 3 | review-consistency | Confirms artifacts do not contradict each other |
| 4 | review-measurability | Confirms all requirements have numeric, objective criteria |
| 5 | review-testability | Confirms every requirement can be verified by QE |
| 6 | review-implementation-leakage | Confirms spec describes behavior, not implementation |
| 7 | review-data-completeness | Confirms all data definitions are fully specified |
| 8 | review-traceability | Confirms all requirements are linked forward and backward |
| 9 | review-feasibility | Confirms no requirements are structurally infeasible |
| 10 | **review-requirements-readiness** | **Final go/no-go gate** |

Running requirements-readiness before the others is not valid. The gate has no meaning if the individual checks have not been completed.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Verdicts from all 9 preceding review skills | Review findings documents from each preceding skill | Yes — each must be PASS or FAIL with documented findings |
| All requirements artifacts | `docs/<feature>/requirements-package/requirements-package.md` | Yes — reviewed for holistic integrity |
| Assumption log | `docs/<feature>/requirements-package/requirements/assumptions-constraints-scope.md` | Yes — unresolved assumptions are a handoff risk |
| Open question register | `docs/<feature>/requirements-package/requirements/assumptions-constraints-scope.md` | Yes — unresolved open questions must be assessed |

## Readiness Assessment

### Gate 1 — Individual Review Verdicts

| Review | Verdict | High Findings Resolved |
|--------|---------|----------------------|
| review-scope | PASS / FAIL | Yes / No / N/A |
| review-completeness | PASS / FAIL | Yes / No / N/A |
| review-consistency | PASS / FAIL | Yes / No / N/A |
| review-measurability | PASS / FAIL | Yes / No / N/A |
| review-testability | PASS / FAIL | Yes / No / N/A |
| review-implementation-leakage | PASS / FAIL | Yes / No / N/A |
| review-data-completeness | PASS / FAIL | Yes / No / N/A |
| review-traceability | PASS / FAIL | Yes / No / N/A |
| review-feasibility | PASS / FAIL | Yes / No / N/A |

**Gate 1 passes** when every review verdict is PASS or when every High finding has been explicitly resolved (requirement updated, constraint waived, or requirement descoped with a decision log entry).

### Gate 2 — Assumption Resolution

Review the assumption log. For handoff to proceed:

- [ ] Every assumption has a verification status (evidence-backed, stakeholder-confirmed, or assumed-pending-confirmation)
- [ ] Every assumed-pending-confirmation entry has: the risk if the assumption is wrong, the planned verification method, and an owner

Assumptions that are still marked as "assumed-pending-confirmation" at handoff are accepted risks, not blockers — provided they are explicitly logged, their risk is understood, and the architect is made aware that they are assumptions.

| Assumption Status | Count | Handoff implication |
|------------------|-------|-------------------|
| Code-verified | | Confident |
| Stakeholder-confirmed | | Confident |
| Assumed-pending-confirmation | | Risk accepted; architect informed |
| Unclassified (no status) | | **BLOCKER — must be classified before handoff** |

### Gate 3 — Open Questions

Review any open questions logged during requirements drafting. For handoff to proceed:

- [ ] Every open question has been resolved OR documented as an accepted risk with an impact statement
- [ ] No open question is a blocker for architect design decisions

An unresolved open question that the architect cannot design around is a **handoff blocker** — it must be resolved before handoff. An unresolved open question that affects only QE planning (not design) may be accepted with a noted risk.

### Gate 4 — Package Integrity

Read the requirements package (if assembled) or assess the artifact set holistically:

- [ ] All upstream artifacts are present or explicitly documented as N/A with rationale
- [ ] No section of the package references an artifact or ID that does not exist
- [ ] The handoff checklist (Section 4.2 of the requirements-package template) is complete

### Gate 5 — Architect Readiness Questions

These are the questions the architect will ask on receiving the package. The requirements are ready for handoff if all can be answered with confidence:

| Question | Can it be answered from the package? |
|----------|-------------------------------------|
| What is the current system doing in the change area? | Yes / No (brownfield) |
| What specifically must change? | Yes / No |
| What must not change? | Yes / No |
| What are the hard limits I must design within? | Yes / No |
| What quality targets must my design achieve? | Yes / No |
| What data model does my design produce or consume? | Yes / No |
| What are the deployment and rollout constraints? | Yes / No |
| What are the open risks I need to be aware of? | Yes / No |

Any "No" answer is a gap that must be resolved before the package is handed off.

## Readiness Verdict

### APPROVED — Ready for Handoff

All five gates pass. The requirements package is approved for handoff to the architect.

Record:
- **Approval date:** [date]
- **Approved by:** [accountable stakeholder name / role]
- **Conditions:** [any outstanding medium/low findings that are accepted as known risks]
- **Open assumptions at handoff:** [list with their risk statements]

### NOT APPROVED — Handoff Blocked

One or more gates fail. The package must not be handed off until the blocking conditions are resolved.

Record:
- **Blocking gates:** [list]
- **Specific blockers:** [list each item that must be resolved]
- **Re-review required:** Yes — after blockers are resolved, re-run review-requirements-readiness

## Handoff Communication

When the verdict is APPROVED, communicate to the architect:

1. **The requirements package** — the single self-contained document
2. **Acceptance of known risks** — the assumptions marked assumed-pending-confirmation and their risk statements
3. **Open questions** — any questions still outstanding that may affect design, with the BSA committed to resolving them within [X days]
4. **Points of contact** — who to contact for clarification on each major area (subject matter experts, stakeholders)
5. **Review participation** — invite the architect to a brief requirements walkthrough before design begins (not required, but reduces misunderstanding)

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Requirements are handed off with passing individual reviews but a broken package (orphaned references, missing N/A sections) | Gate 4 package integrity check catches structural gaps the individual reviews missed |
| Architect begins design against requirements that contain unresolved open questions, then discovers the answer invalidates their design | Gate 3 ensures open questions are resolved or explicitly accepted before handoff |
| Unclassified assumptions reach the architect who treats them as confirmed facts | Gate 2 blocks handoff until every assumption has a classification |
| Requirements-readiness is claimed without the individual review skills being run | Gate 1 requires verdicts from all 9 preceding reviews |

## Hand-off Gate

**Review 10 of 10 — the terminal gate for the entire requirements process. Architect handoff does not begin until this verdict is APPROVED.**

**Requires: all 9 preceding review skills at PASS verdict.**

After completing this review:
1. Write the final verdict in full — all gate results, the APPROVED or NOT APPROVED verdict, and if NOT APPROVED, the explicit list of blockers.
2. Present the verdict to the BSA.
3. If **NOT APPROVED**: the BSA resolves all blockers, re-runs the affected review skills, and this review is re-run. Handoff is blocked until APPROVED.
4. If **APPROVED**: receive explicit BSA acknowledgement, then proceed to Phase 5 — architect handoff.

Do not skip this gate. An APPROVED verdict here is the only condition that permits architect handoff.

---

## Completion Criteria

- [ ] All 9 preceding review skills have PASS verdicts or all High findings are resolved
- [ ] All assumptions are classified; assumed-pending-confirmation entries have risk, method, and owner
- [ ] All open questions are resolved or accepted with risk statements
- [ ] Package integrity confirmed: all sections present or N/A, no orphaned references
- [ ] All five architect readiness questions can be answered from the package
- [ ] Formal verdict recorded: APPROVED or NOT APPROVED
- [ ] Approved: handoff communication sent to architect
- [ ] Not approved: blockers listed and re-review scheduled
