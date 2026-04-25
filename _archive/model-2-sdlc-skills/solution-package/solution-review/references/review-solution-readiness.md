# Review — Solution Readiness

## Purpose

Final go/no-go gate before handoff to implementation planning. Validates that the solution design package is complete (all in-scope sections present, no placeholders), internally consistent (no cross-section contradictions remaining after architecture and security reviews), aligned with the requirements package (full traceability), and operationally ready (deployment strategy, observability, and testing strategy are sufficient for safe production operation). Incorporates operational readiness checks — deployment pipeline adequacy, monitoring coverage, alerting completeness, rollback procedure clarity, and disaster recovery posture. Consumes the assembled solution-package.md, both prior review reports (architecture and security posture), the requirements package, and the architecture baseline. This is the last review skill — its output is the handoff decision.

## What This Produces

A go/no-go decision on whether the solution design package is ready for handoff to implementation planning. This is not another adversarial review — it is a **completeness and readiness gate**. The architecture review found structural issues. The security review found security issues. This review asks: "after addressing those findings, is the package complete, consistent, and ready for a developer to implement?"

The output is a readiness assessment with:
1. **Completeness check** — are all in-scope sections present and substantive?
2. **Consistency check** — do the reviewed and updated sections still align after changes?
3. **Requirements traceability check** — is every requirement covered by the design?
4. **Operational readiness check** — can the designed system be deployed, monitored, and operated safely?
5. **Prior review resolution check** — have CRITICAL and HIGH findings from architecture and security reviews been resolved?
6. **Go/no-go decision** — GO (proceed to implementation planning), CONDITIONAL GO (proceed with noted caveats), or NO-GO (must address gaps first)

**What this review covers vs. what prior reviews covered:**

| Concern | Where It Is Reviewed |
|---------|---------------------|
| Structural soundness, scalability, resilience, maintainability | `review-architecture` |
| Security vulnerabilities, auth, data protection, compliance | `review-security-posture` |
| **Package completeness** — all sections present, no stubs | **This review** |
| **Cross-section consistency after review updates** | **This review** |
| **Full requirements traceability** | **This review** |
| **Operational readiness** — deployment, observability, testing adequacy | **This review** |
| **Prior review resolution** — are CRITICAL/HIGH findings fixed? | **This review** |
| **Handoff decision** — go/no-go | **This review** |

## When to Use

- Always — every solution design package ends with a readiness gate
- Runs after both `review-architecture` and `review-security-posture` have completed and their findings have been addressed
- This is the final step before the package is handed off

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Assembled solution design package | `docs/<feature>/solutions-package/solution-package.md` (potentially updated after prior reviews) | Yes |
| Architecture review report | Output from `review-architecture` — findings, verdict, resolution notes | Yes |
| Security posture review report | Output from `review-security-posture` — findings, verdict, resolution notes | Yes |
| Requirements package | `docs/<feature>/requirements-package/requirements-package.md` — full requirements package | Yes |
| Requirements change tracker | `docs/<feature>/requirements-package/requirements/change-tracker.md` — Package Version Log and Version Diff Summary | Yes |
| Architecture baseline | `docs/<feature>/solutions-package/discovery/architecture-baseline.md` | If discovery ran |
| Scoping determination | Step 0 output from the design workflow — which sections are in scope and why | Yes |

> **Missing input guard:** If any required input cannot be found at its documented path, halt the review and inform the user: *"I cannot proceed with the solution readiness review because [artifact name] was not found at `[expected path]`. Please ensure the artifact exists before running this review."*

> **Version staleness check:** Confirm the requirements package version recorded in the solution overview matches the current version in the change tracker. If they do not match and the architecture review did not already flag and resolve this, it is a CRITICAL finding — the solution design is based on outdated requirements and must be updated before handoff.

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  SOLUTION READINESS REVIEW — INTERNAL SEQUENCE                   │
├──────────────────────────────────────────────────────────────────┤
│  1. LOAD — Read solution package, both review reports,           │
│     requirements, baseline, scoping determination                │
├──────────────────────────────────────────────────────────────────┤
│  2. PRIOR REVIEW RESOLUTION — Verify CRITICAL/HIGH findings      │
│     from architecture and security reviews are resolved          │
├──────────────────────────────────────────────────────────────────┤
│  3. COMPLETENESS — Check all in-scope sections are present       │
│     and substantive, skipped sections have rationale             │
├──────────────────────────────────────────────────────────────────┤
│  4. CONSISTENCY — Verify cross-section alignment after updates   │
│     Changes from review may have introduced new misalignment     │
├──────────────────────────────────────────────────────────────────┤
│  5. REQUIREMENTS TRACEABILITY — Full trace from requirements     │
│     to design decisions and back                                 │
├──────────────────────────────────────────────────────────────────┤
│  6. OPERATIONAL READINESS — Evaluate deployment, observability,  │
│     and testing adequacy for safe production operation            │
├──────────────────────────────────────────────────────────────────┤
│  7. IMPLEMENTATION HANDOFF — Assess whether a developer can      │
│     implement from this package without ambiguity                │
├──────────────────────────────────────────────────────────────────┤
│  8. DECISION — GO / CONDITIONAL GO / NO-GO                       │
├──────────────────────────────────────────────────────────────────┤
│  9. PRESENT — Deliver readiness assessment                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Load

Read all inputs. Build a comprehensive picture of the current state of the solution design package, including any changes made in response to prior review findings.

### Step 2 — Prior Review Resolution

Verify that findings from the architecture and security reviews have been addressed:

| Check | What to Verify |
|-------|---------------|
| **CRITICAL findings resolved** | Every CRITICAL finding from both reviews has been addressed in the updated design. The resolution is substantive (not just a comment saying "will fix later"). |
| **HIGH findings addressed** | Every HIGH finding has been either resolved or explicitly acknowledged by the user as an accepted risk. |
| **Resolution introduced no new issues** | Design changes made to address review findings did not inadvertently break other sections. |

If unresolved CRITICAL findings exist, stop here — the package is not ready. Report NO-GO with the unresolved findings as the reason.

### Step 3 — Completeness

Check that the solution design package is substantive and complete:

| Check | What to Verify |
|-------|---------------|
| **All in-scope sections present** | Cross-reference the scoping determination (Step 0) with the assembled package. Every section marked "included" has content — not stubs, placeholders, or TODOs. |
| **Skipped sections documented** | Every section marked "not applicable" in scoping has a rationale recorded in the package. |
| **No placeholder content** | Search for patterns like "TBD," "TODO," "to be determined," "placeholder," "[fill in]" — these indicate incomplete sections. |
| **Appendices and checklists** | If the solution package template includes a handoff checklist, verify every item is checked or explicitly marked not applicable. |

### Step 4 — Consistency

Check that the package is internally consistent after any updates from prior reviews:

| Check | What to Verify |
|-------|---------------|
| **Cross-section terminology** | Does the same entity have the same name across all sections? (e.g., "RefundRequest" in data model, "refund_request" in API, "RefundService" in backend — are these consistent and clearly the same concept?) |
| **Cross-section data flow** | Can data flow be traced from user action (frontend) through API, backend, data layer, and back without breaks or contradictions? |
| **Technology references** | Do all sections reference the same technology versions (from Section 2)? Did review updates introduce new technology references not in the tech stack? |
| **Boundary alignment** | Do component boundaries in the system design (Section 3) match the boundaries used in backend, frontend, and integration design? |

### Step 5 — Requirements Traceability

Perform a full traceability check in both directions:

**Forward trace (requirements → design):**

| Requirement Type | What to Check |
|-----------------|--------------|
| **Functional requirements** | Does every functional requirement have at least one design section that addresses it? Are all FR ACs (`AC-REQ-NNN-N`), including error-path ACs, verifiable through the testing strategy (Section 14)? |
| **Non-functional requirements** | Does every NFR have an architectural decision or pattern that supports it? Are performance targets reflected in SLOs (Section 13) and performance tests (Section 14)? Are NFR ACs (`AC-NFR-[CAT]-NNN-N`), including degraded-mode ACs, addressed by the testing strategy? |
| **User journeys** | Can every user journey be traced through the design — from the frontend interaction through the API, backend processing, data operations, and response? |
| **Business rules** | If the requirements include business rules, are they reflected in Section 10 (workflow/business rules) or the backend design? Are business rule ACs (`AC-BR-NNN-N`) verifiable through the testing strategy? |
| **Data requirements** | Are data contracts (inputs, outputs, new entities) reflected in the data model design (Section 6) and API design (Section 7)? Are data ACs (`AC-DATA-NNN-N`) for accepted/rejected data verifiable? |
| **Permissions/access control** | Do the roles and permissions in the requirements match the RBAC design in Section 9? Are permission ACs (`AC-ACR-NNN-N`, `AC-PERM-NNN-N`) for condition-met/not-met and authorized/unauthorized paths verifiable through the testing strategy? |
| **Error-path coverage** | For every error-path AC from any artifact type, does the design address the failure scenario? Are error responses, fallback behaviors, and degraded-mode behaviors designed, not left to the implementer's discretion? |

**Backward trace (design → requirements):**

| Check | What to Verify |
|-------|---------------|
| **No orphan design** | Is there any design decision that does not trace to a requirement, constraint, or user-confirmed input? (AI-invented features that serve no stated need.) |
| **Scope creep** | Has the design expanded beyond the scope defined in the requirements and scoping step? Are there components or features designed that were not requested? |

### Step 6 — Operational Readiness

Evaluate whether the designed system can be deployed, monitored, and operated safely in production. This consolidates operational concerns across deployment (Section 12), observability (Section 13), and testing (Section 14):

**Deployment readiness:**

| Check | What to Verify |
|-------|---------------|
| **Deployment sequence** | Is the deployment order clear and unambiguous? Are dependencies between deployment steps explicit? |
| **Rollback procedure** | Is there a rollback procedure for every deployable unit? Is the rollback tested or at least testable? Does the rollback procedure handle database migrations (backward-compatible or reversible)? |
| **Environment configuration** | Are all environment-specific configurations identified? Are secrets management and environment promotion paths clear? |
| **Migration safety** | If database migrations are involved, are they backward-compatible with the previous code version? Is the migration sequenced correctly relative to code deployment? |

**Monitoring readiness:**

| Check | What to Verify |
|-------|---------------|
| **SLI/SLO coverage** | Are Service Level Indicators defined for the feature? Are SLO targets set and achievable? Is there an error budget policy? |
| **Alert coverage** | Are alerts defined for critical failure scenarios? Do alerts have severity, routing, and runbook references? Are there alerts for the "silent failure" case (the system appears healthy but is producing incorrect results)? |
| **Dashboard coverage** | Are operational dashboards designed that answer the key operator questions: "Is it healthy? Is it performing? Is it handling errors correctly?" |
| **Log and trace coverage** | Are structured logging and distributed tracing designed for the new components? Can an operator trace a request through the full system? |

**Testing readiness:**

| Check | What to Verify |
|-------|---------------|
| **Test coverage plan** | Are test types assigned to all new components (unit, integration, E2E)? Are the boundaries clear — where to mock, where to test end-to-end? |
| **Quality gates** | Are CI/CD quality gates defined and aligned with the deployment pipeline? Do gates block deployment when tests fail? |
| **Performance test plan** | If NFRs include performance targets, is there a performance test plan that verifies those targets before production? |
| **Test infrastructure** | Are required test infrastructure changes identified (test databases, sandboxes, contract brokers, load test environments)? |

### Step 7 — Implementation Handoff

Assess whether a developer (human or AI agent) can implement the feature from this package without ambiguity:

| Check | What to Verify |
|-------|---------------|
| **Unambiguous specifications** | Can every design decision be implemented without further design discussion? Are there sections that say "TBD" or "depends on implementation"? |
| **Technology clarity** | Are framework versions, library choices, and configuration approaches specific enough to implement against? |
| **Interface contracts** | Are API contracts (request/response schemas, error codes, auth requirements) complete and unambiguous? |
| **Data model clarity** | Are entity definitions, relationships, indexes, and migration steps specific enough to write? |
| **Edge case coverage** | Are edge cases and error scenarios addressed, or will the implementer need to make design decisions on the fly? |
| **Dependencies and ordering** | Is it clear which components should be built first? Are there circular dependencies in the implementation order? |

### Step 8 — Decision

Based on the checks above, make the handoff decision:

| Decision | Criteria | What Happens Next |
|----------|---------|------------------|
| **GO** | No unresolved CRITICAL or HIGH issues from prior reviews. Package is complete, consistent, traceable. Operational readiness is adequate. Implementation can proceed without further design work. | Package is handed off to implementation planning. |
| **CONDITIONAL GO** | No unresolved CRITICAL issues. Minor gaps exist but are documented and will not block implementation. Known risks are acknowledged. | Package is handed off with a conditions list — specific items to address during implementation planning or early implementation. |
| **NO-GO** | Unresolved CRITICAL issues, significant completeness gaps, missing traceability for key requirements, or operational readiness gaps that would make production deployment unsafe. | Specific gaps are listed. The design must be updated and re-reviewed. |

### Step 9 — Present

Present the readiness assessment to the user.

---

## Output Structure

```
## Solution Readiness Assessment

### Decision: [GO / CONDITIONAL GO / NO-GO]

### Prior Review Resolution

| Review | CRITICAL Resolved | HIGH Resolved | Status |
|--------|------------------|---------------|--------|
| Architecture | N/N | N/N | All resolved / N unresolved |
| Security Posture | N/N | N/N | All resolved / N unresolved |

### Completeness

| Section | In Scope | Present | Substantive | Status |
|---------|----------|---------|-------------|--------|
| 1. Solution Overview | Yes | Yes | Yes | OK |
| 2. Technology Stack | Yes | Yes | Yes | OK |
| 3. Solution Architecture | Yes | Yes | Yes | OK |
| 4. Frontend Design | Yes/No | ... | ... | OK / N/A |
| 5. Backend Design | Yes/No | ... | ... | OK / N/A |
| 6. Database Design | Yes/No | ... | ... | OK / N/A |
| 7. API Design | Yes/No | ... | ... | OK / N/A |
| 8. Integration Design | Yes/No | ... | ... | OK / N/A |
| 9. Security Design | Yes/No | ... | ... | OK / N/A |
| 10. Workflow / Business Rules | Yes/No | ... | ... | OK / N/A |
| 11. Dashboard / Reporting | Yes/No | ... | ... | OK / N/A |
| 12. Deployment / DevOps | Yes | Yes | Yes | OK |
| 13. Observability | Yes | Yes | Yes | OK |
| 14. Testing Strategy | Yes | Yes | Yes | OK |

### Requirements Traceability

| Requirement / AC | Type | Design Coverage | Section(s) | Gap |
|-------------|------|----------------|------------|-----|
| FR-01 | Functional | Full / Partial / None | Section N | [if partial/none] |
| AC-REQ-001-1 | FR AC | Full / Partial / None | Section N | [if partial/none] |
| AC-REQ-001-2 | FR AC (error-path) | Full / Partial / None | Section N | [if partial/none] |
| BR-015 | Business Rule | Full / Partial / None | Section 10 | [if partial/none] |
| AC-BR-015-1 | BR AC | Full / Partial / None | Section 10, 14 | [if partial/none] |
| AC-DATA-007-1 | Data AC | Full / Partial / None | Section 6, 7 | [if partial/none] |
| AC-PERM-004-1 | Permission AC | Full / Partial / None | Section 9 | [if partial/none] |
| NFR-PER-001 | Non-functional | Full / Partial / None | Section 13, 14 | [if partial/none] |
| AC-NFR-PER-001-1 | NFR AC | Full / Partial / None | Section 14 | [if partial/none] |
| AC-NFR-PER-001-2 | NFR AC (degraded-mode) | Full / Partial / None | Section 14 | [if partial/none] |
| UJ-01 | User journey | Full / Partial / None | Sections N, M | [if partial/none] |

**Orphan design decisions (no traced requirement):** [list or "none"]
**Scope creep (design beyond stated scope):** [list or "none"]

### Operational Readiness

| Area | Status | Gaps |
|------|--------|------|
| Deployment sequence and rollback | Ready / Gaps | [description] |
| Monitoring (SLIs, SLOs, alerts) | Ready / Gaps | [description] |
| Dashboards (operational) | Ready / Gaps | [description] |
| Logging and tracing | Ready / Gaps | [description] |
| Test coverage plan | Ready / Gaps | [description] |
| Quality gates in CI/CD | Ready / Gaps | [description] |
| Performance test plan | Ready / Gaps / N/A | [description] |
| Test infrastructure changes | Ready / Gaps / N/A | [description] |

### Implementation Handoff Assessment

| Check | Status |
|-------|--------|
| Specifications unambiguous | Yes / Gaps noted |
| Technology choices specific | Yes / Gaps noted |
| Interface contracts complete | Yes / Gaps noted |
| Data model implementable | Yes / Gaps noted |
| Edge cases addressed | Yes / Gaps noted |
| Implementation ordering clear | Yes / Gaps noted |

### Conditions (if CONDITIONAL GO)

1. [Condition — what must be addressed during implementation planning]
2. [Condition — ...]

### Blocking Gaps (if NO-GO)

1. [Gap — what must be resolved before re-review]
2. [Gap — ...]
```

---

## Hand-off Gate

This IS the hand-off gate. After presenting the readiness assessment:

1. **If GO:** Confirm with the user that the package is ready for handoff. The solution design phase is complete.
2. **If CONDITIONAL GO:** Present the conditions. Confirm the user accepts the conditions and understands they must be addressed during implementation planning. The solution design phase is complete with caveats.
3. **If NO-GO:** Present the blocking gaps. The user must address the gaps, update the design, and trigger a re-review cycle (architecture review → security review → solution readiness, or a subset if only specific sections changed).

**Final confirmation:** *"The solution design package has been reviewed for architectural soundness, security posture, and solution readiness. The decision is [GO / CONDITIONAL GO / NO-GO]. [If GO/CONDITIONAL GO:] The package is ready for handoff to implementation planning. [If NO-GO:] The following gaps must be addressed: [list]."*

## Completion Criteria

- [ ] Prior review findings have been verified as resolved (CRITICAL fully resolved, HIGH resolved or acknowledged)
- [ ] All in-scope sections are present and substantive — no stubs, placeholders, or TODOs
- [ ] All skipped sections have documented rationale
- [ ] Cross-section consistency verified after any updates from prior reviews
- [ ] Every functional requirement has design coverage; all FR ACs (`AC-REQ-`), including error-path ACs, are verifiable through the testing strategy
- [ ] Every NFR has architectural support; all NFR ACs (`AC-NFR-`), including degraded-mode ACs, are addressed by the testing strategy
- [ ] Every business rule is reflected in the design; all BR ACs (`AC-BR-`) are verifiable
- [ ] Every data contract is reflected in the data model and API design; all data ACs (`AC-DATA-`) are verifiable
- [ ] Every permission/access control requirement matches the security design; all permission ACs (`AC-ACR-`, `AC-PERM-`) are verifiable
- [ ] Every error-path AC from any artifact type has a corresponding design decision for the failure scenario
- [ ] Every user journey can be traced through the design
- [ ] No orphan design decisions (all trace to requirements or user-confirmed inputs)
- [ ] Deployment readiness verified — sequence, rollback, environments, migration safety
- [ ] Monitoring readiness verified — SLIs/SLOs, alerts, dashboards, logging, tracing
- [ ] Testing readiness verified — coverage plan, quality gates, performance tests, test infrastructure
- [ ] Implementation handoff assessment completed — specifications are unambiguous and implementable
- [ ] Go/no-go decision is stated with clear justification
- [ ] The user has confirmed the decision

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Solution package is handed off with unresolved CRITICAL findings from prior reviews | Step 2 verifies all CRITICAL findings are resolved; NO-GO if any remain |
| A design section is a stub or placeholder — the implementer discovers it is empty mid-implementation | Step 3 checks every in-scope section for substantive content; flags stubs and TODOs |
| Review updates fixed one section but broke alignment with another | Step 4 re-checks cross-section consistency after review-driven changes |
| A requirement has no design coverage — the implementer must make design decisions during coding | Step 5 traces every requirement to its design coverage; gaps are flagged |
| The AI invented features not in the requirements — implementation scope is larger than intended | Step 5 backward trace catches orphan design decisions and scope creep |
| The system is deployed to production but has no monitoring — failures are invisible | Step 6 checks SLI/SLO, alert, dashboard, and logging coverage for operational readiness |
| Deployment goes wrong and there is no rollback procedure | Step 6 checks rollback procedures for every deployable unit |
| The package is technically complete but ambiguous — the implementer interprets it differently than intended | Step 7 evaluates whether a developer can implement without further design discussion |
| The team debates "is the design done?" indefinitely with no clear gate | The GO / CONDITIONAL GO / NO-GO decision provides a clear, structured answer |
