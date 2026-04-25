# Implementation Plan

## Plan Summary

**Feature:** [One-sentence feature description]

**Decomposition Strategy:** [Strategy name — Vertical Slice / Horizontal Layer / Risk-First / Dependency-Ordered / Hybrid]

**Rationale:** [Why this strategy fits the feature, codebase, and risk profile — 2–3 sentences]

**Phase Count:** [N phases]

**Key Risks:**

| Risk | Mitigation | Phase |
|---|---|---|
| *[e.g., Shared table migration may break dependent services]* | *[e.g., Additive-only migration; expand-contract pattern]* | *PHASE-002* |

---

## Technology Versions

*(Carried forward from codebase analysis Step 1a — determines which standard rules apply to plan steps)*

| Technology | Version | Source |
|---|---|---|
| *[e.g., Java]* | *[e.g., 21]* | *[e.g., build.gradle.kts — jvmToolchain(21)]* |
| *[e.g., Spring Boot]* | *[e.g., 3.3.x]* | *[e.g., build.gradle.kts — springBoot plugin]* |

---

## Dependency Graph

```
PHASE-001 (Prerequisites)
    └──► PHASE-002 (Foundation)
              ├──► PHASE-003 (Feature A)  ──┐
              └──► PHASE-004 (Feature B)  ──┤
                                             └──► PHASE-005 (Integration Tests)
                                                       └──► PHASE-006 (Polish)
```

**Parallelism:** PHASE-003 and PHASE-004 can execute in parallel (no dependency, no file conflicts).

---

## Phase Index

| Phase ID | Phase Name | FR Mapping | Dependencies | Risk Level | Status |
|---|---|---|---|---|---|
| PHASE-001 | Prerequisites | None (foundational) | None | Low | backlog |
| PHASE-002 | Foundation | FR-X.Y | PHASE-001 | High | backlog |
| PHASE-003 | [Feature A] | FR-X.Y, FR-X.Z | PHASE-002 | Medium | backlog |

---

## Traceability Matrix

| Requirement | Description | Phase(s) | Plan Step |
|---|---|---|---|
| FR-X.Y | [Description] | PHASE-002, PHASE-003 | PHASE-002 Step 3, PHASE-003 Step 2 |
| AC-X.Y.1 | [Acceptance criterion] | PHASE-003 | PHASE-003 Step 2 (inline) |

---

## Phases

### Phase 1 — [Phase Name]

#### Phase Identity

**Phase ID**: PHASE-001
**Phase Name**: [Descriptive Name]
**FR Mapping**:
- FR-X.Y.Z [Requirement description]

#### Goal

[Single sentence describing system state after completion — not effort]

#### Dependencies

None

#### Plan

1. [Action verb] [target file path] — [what to do]

   **Design spec:** [Inline excerpt from solution package — API contract, data model, business rules]

   **Acceptance criteria:**
   - AC-X.Y.Z: [Testable pass/fail condition]

   **Pattern:** [Reference to existing file or coding standard to follow]

   **Verify:** [Test command and expected output]

2. [Next step...]

#### Outcome

- [Measurable deliverable 1]
- [Measurable deliverable 2]

#### Automated Verification (AI Gate)

1. [Test command or verification step]
2. [Test command or verification step]

**Expected**:
- [Expected result 1]
- [Expected result 2]

#### Human Verification (Human Gate)

1. [Review step requiring human judgment]
2. [Review step requiring human judgment]

#### Success Criteria

✅ [Binary criterion 1]
✅ [Binary criterion 2]
✅ [Binary criterion 3]

**Rollback:** [Rollback approach for this phase — e.g., "git revert; no data changes" or "reverse migration drops new columns"]

---

*(Repeat for each phase)*

---

## Bug-fix Phases

*(Initially empty — populated during execution by the phase execution guide when bugs are identified and approved for fixing)*
