# Review — Plan Readiness

## Purpose

Go/no-go gate — validates the implementation plan is complete, aligned with the solution package, and ready for AI coding agents to execute. Includes self-review checks: spec coverage gaps (every requirement and acceptance criterion in the solution package is addressed by at least one task), placeholders or TBD markers, type/name consistency across tasks (entity names, file paths, API endpoints match the solution package and codebase analysis), and missing verification steps. Checks for unresolved [NEEDS CLARIFICATION] markers — any remaining marker is an automatic NO-GO; the workflow returns to the user to resolve each ambiguity before proceeding. Also validates: task sequencing respects dependencies, each task is independently verifiable, inline design specs and acceptance criteria are present and complete, traceability references are correct, and the plan conforms to the canonical phase shape. Produces a GO / NO-GO verdict. Completes the readiness gate pattern across roles (BSA's review-requirements-readiness, architect's review-solution-readiness, developer's review-plan-readiness).

## What This Produces

A go/no-go decision on whether the implementation plan is ready for AI coding agents to execute. This is not an adversarial code review — it is a **completeness, consistency, and executability gate**. The implementation plan creator produced the plan. This review asks: "can an AI coding agent execute each phase blindly, without further design discussion, and produce a correct implementation?"

The output is a readiness assessment with:
1. **Structural completeness** — does every phase have all 8 canonical shape sections?
2. **Spec coverage** — is every FR and AC (across all artifact types: `AC-REQ-`, `AC-BR-`, `AC-DATA-`, `AC-ACR-`, `AC-PERM-`, `AC-NFR-`, and error-path ACs) from the requirements package covered?
3. **Placeholder sweep** — are there any unresolved markers, TBDs, or vague instructions?
4. **Naming consistency** — do entity names, file paths, and API endpoints match the solution design and codebase analysis?
5. **Dependency and ordering** — is the dependency graph valid and risk-ordered?
6. **Phase granularity** — is each phase session-sized, PR-sized, and self-contained with tests?
7. **Inline spec completeness** — does every plan step have design spec, ACs, file paths, patterns, and verification?
8. **Solution package alignment** — does the plan match the solution design without drift?
9. **Go/no-go decision** — GO (proceed to implementation) or NO-GO (must address gaps first)

**Where this fits in the readiness gate pattern:**

| Role | Gate | What It Validates |
|------|------|------------------|
| BSA | `review-requirements-readiness` | Requirements package is complete, consistent, and ready for the architect |
| Architect | `review-solution-readiness` | Solution design is complete, consistent, and ready for the developer |
| **Developer** | **`review-plan-readiness`** | **Implementation plan is complete, consistent, and ready for AI coding agents** |

## When to Use

- Step 7 (final step) of the implementation planning workflow
- After `implementation-plan-creator` has produced the implementation plan and the user has confirmed it
- This is the last step before coding begins

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Implementation plan | `docs/<feature>/implementation-package/plan/implementation-plan.md` — the plan to review | Yes |
| Solution design | `docs/<feature>/solutions-package/solution-package.md` — used for alignment checking | Yes |
| Requirements package | `docs/<feature>/requirements-package/requirements-package.md` — FRs, ACs, NFRs — used for coverage checking | Yes |
| Requirements change tracker | `docs/<feature>/requirements-package/requirements/change-tracker.md` — Package Version Log and Version Diff Summary — used for version staleness checking | Yes |
| Codebase analysis | `docs/<feature>/implementation-package/plan/codebase-analysis.md` — file paths, conventions — used for consistency checking | Yes |
| Test plan | `docs/<feature>/implementation-package/plan/test-plan.md` — testing strategy — used for verification adequacy checking | Yes |
| Project context | `docs/<feature>/implementation-package/plan/project-context.md` — naming conventions, patterns — used for consistency checking | Yes |
| Canonical phase shape | `../assets/canonical-phase-shape.md` — the structural reference | Yes |

> **Missing input guard:** If any required input cannot be found at its documented path, halt the review and inform the user: *"I cannot proceed with the plan readiness review because [artifact name] was not found at `[expected path]`. Please ensure the artifact exists before running this review."*

> **Version staleness check:** Compare the requirements package version recorded in the solution overview (Section 1 of `solution-package.md`) against the current version in the change tracker. If they differ and implementation planning did not already document a decision to proceed, flag this as a CRITICAL finding: *"The solution design was produced against requirements package [old version], but the current requirements is [new version]. The implementation plan may be based on stale design decisions."* This finding blocks GO until the user confirms the mismatch is acceptable or the solution design is updated.

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  PLAN READINESS REVIEW — INTERNAL SEQUENCE                       │
├──────────────────────────────────────────────────────────────────┤
│  1. LOAD — Read the implementation plan, solution design,        │
│     requirements, codebase analysis, test plan, project context  │
├──────────────────────────────────────────────────────────────────┤
│  2. STRUCTURAL — Validate canonical phase shape compliance        │
├──────────────────────────────────────────────────────────────────┤
│  3. COVERAGE — Verify every FR and AC (all types) is mapped       │
├──────────────────────────────────────────────────────────────────┤
│  4. PLACEHOLDERS — Sweep for unresolved markers and vague        │
│     instructions                                                 │
├──────────────────────────────────────────────────────────────────┤
│  5. CONSISTENCY — Check naming, paths, and endpoints match        │
│     across plan, solution design, and codebase analysis          │
├──────────────────────────────────────────────────────────────────┤
│  6. DEPENDENCIES — Validate the dependency graph                  │
├──────────────────────────────────────────────────────────────────┤
│  7. GRANULARITY — Check phase sizing, PR sizing, and test         │
│     inclusion                                                    │
├──────────────────────────────────────────────────────────────────┤
│  8. INLINE SPECS — Verify every plan step is self-contained       │
├──────────────────────────────────────────────────────────────────┤
│  9. ALIGNMENT — Check plan against solution design for drift      │
├──────────────────────────────────────────────────────────────────┤
│  10. DECISION — GO / NO-GO                                        │
├──────────────────────────────────────────────────────────────────┤
│  11. PRESENT — Deliver readiness assessment                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Load

Read all inputs. Build a complete picture of:
- The implementation plan (the artifact being reviewed)
- The solution design (the source of truth for *what* to build)
- The requirements package (the source of truth for *why* and what the acceptance criteria are)
- The codebase analysis (the source of truth for *where* and *how* — file paths, patterns, conventions)
- The test plan (the source of truth for testing strategy)
- The project context (the source of truth for naming and style conventions)
- The canonical phase shape (the structural template every phase must follow)

### Step 2 — Structural Completeness (Gate 1)

Verify every phase in the plan conforms to the canonical phase shape. Each phase must have all 8 sections in the correct order.

| Section | Check | Severity |
|---------|-------|----------|
| Phase Identity | Phase ID is unique and sequential; Phase Name is descriptive; FR Mapping lists at least one FR (or states "None (foundational)") | **CRITICAL** — missing identity makes the phase untraceable |
| Goal | Single sentence describing system state (not effort); present tense | Warning |
| Dependencies | Lists Phase IDs or states "None"; referenced Phase IDs exist in the plan | **CRITICAL** — missing or broken dependencies cause execution failures |
| Plan | Contains ordered, imperative steps; steps are specific and actionable | **CRITICAL** — this is what the agent executes |
| Outcome | Contains measurable deliverables | Warning |
| Automated Verification (AI Gate) | Contains specific test commands or verification steps with expected results | **CRITICAL** — without this, the agent cannot verify its own work |
| Human Verification (Human Gate) | Contains 2–4 review steps requiring human judgment | Warning |
| Success Criteria | Contains binary (✅) criteria; 4–8 items | Warning |

**Gate 1 fails** if any phase is missing a CRITICAL section.

### Step 3 — Spec Coverage (Gate 2)

Verify every FR and every AC across all artifact types from the requirements package is addressed by the implementation plan.

**Coverage check process:**

1. Extract every FR and every AC (across all artifact types) from the requirements package into an inventory list:
   - FR ACs (`AC-REQ-NNN-N`) — functional requirement acceptance criteria, including error-path ACs
   - Business rule ACs (`AC-BR-NNN-N`) — rule enforcement criteria
   - Data ACs (`AC-DATA-NNN-N`) — data contract criteria
   - Permission ACs (`AC-ACR-NNN-N`, `AC-PERM-NNN-N`) — authorization criteria
   - NFR ACs (`AC-NFR-[CAT]-NNN-N`) — non-functional criteria, including degraded-mode ACs
2. For each FR: verify it appears in at least one phase's FR Mapping section.
3. For each AC (any type): verify it appears as an inline acceptance criterion in at least one plan step.
4. For each error-path AC: verify it is embedded inline in the plan step that handles the failure scenario.
5. Check the plan's traceability matrix matches your independent inventory.

| Metric | Threshold | Severity |
|--------|-----------|----------|
| FR coverage | 100% — every FR mapped to at least one phase | **CRITICAL** — unmapped FRs will not be implemented |
| FR AC coverage | 100% — every `AC-REQ-` embedded inline in at least one plan step | **CRITICAL** — unmapped FR ACs will not be tested |
| Business rule AC coverage | 100% — every `AC-BR-` embedded inline in the plan step that implements the rule | **CRITICAL** — untested business rules lead to incorrect behavior |
| Data AC coverage | 100% — every `AC-DATA-` embedded inline in the plan step that handles the data contract | **CRITICAL** — untested data validation leads to corrupt data |
| Permission AC coverage | 100% — every `AC-ACR-` and `AC-PERM-` embedded inline in the plan step that enforces authorization | **CRITICAL** — untested authorization leads to security holes |
| NFR AC coverage | 100% — every `AC-NFR-` embedded inline in the plan step responsible for meeting the quality target | **CRITICAL** — untested NFRs lead to production failures |
| Error-path AC coverage | 100% — every error-path AC from any artifact type embedded inline | **CRITICAL** — untested failure paths lead to undefined behavior |
| Orphan phases | 0 — no phase that doesn't trace to any FR (unless explicitly foundational) | Warning — may indicate scope creep |

**Coverage summary:**

| Metric | Count | Covered | Missing |
|--------|-------|---------|---------|
| Functional Requirements | N | N | [list missing FR IDs] |
| FR Acceptance Criteria (`AC-REQ-`) | N | N | [list missing AC IDs] |
| Business Rule ACs (`AC-BR-`) | N | N | [list missing AC IDs] |
| Data ACs (`AC-DATA-`) | N | N | [list missing AC IDs] |
| Permission ACs (`AC-ACR-`, `AC-PERM-`) | N | N | [list missing AC IDs] |
| NFR ACs (`AC-NFR-`) | N | N | [list missing AC IDs] |
| Error-path ACs (all types) | N | N | [list missing AC IDs] |
| Orphan phases (no FR mapping) | N | — | [list Phase IDs] |

**Gate 2 fails** if any FR or AC of any type is missing from the plan.

### Step 4 — Placeholder and Ambiguity Sweep (Gate 3)

Scan the entire plan text for unresolved markers and vague instructions.

**Forbidden patterns:**

| Pattern | Examples | Severity |
|---------|----------|----------|
| Unresolved markers | `[NEEDS CLARIFICATION]`, `[TBD]`, `[TODO]` | **CRITICAL** — automatic NO-GO |
| Placeholder content | "add appropriate error handling," "implement validation," "handle edge cases" | **CRITICAL** — agent cannot execute vague instructions |
| Forward references | "similar to Phase N," "as described above," "see solution design Section X" | **CRITICAL** — plan steps must be self-contained |
| Unspecified behavior | "the system should handle errors gracefully" (which errors? what response?) | Warning — may be acceptable for polish phases |
| Undefined symbols | A type, class, or function referenced in a plan step but never defined anywhere in the plan | Warning |

**Gate 3 fails** if any CRITICAL pattern is found.

### Step 5 — Naming and Type Consistency (Gate 4)

Verify that entity names, file paths, API endpoints, and type names are consistent across:
- The implementation plan (internal consistency across phases)
- The implementation plan vs. the solution design (alignment)
- The implementation plan vs. the codebase analysis (file path accuracy)

| Check | What to Verify | Example Inconsistency |
|-------|---------------|----------------------|
| **Entity names** | Same entity has the same name everywhere | Plan says "RefundRequest" in Phase 3 but "RefundOrder" in Phase 5 |
| **File paths** | Paths in plan steps match paths from codebase analysis integration strategy | Plan says `src/services/refund.ts` but codebase analysis says `src/modules/orders/refund.service.ts` |
| **API endpoints** | Endpoint paths in plan match the solution design's API design | Plan says `POST /refunds` but solution design says `POST /orders/:id/refund` |
| **Type/class names** | TypeScript types, Java classes, Kotlin data classes use consistent naming | Plan creates `RefundDto` in Phase 3 but references `RefundRequest` in Phase 5 |
| **Convention compliance** | Names follow the conventions documented in the project context | Project context says "kebab-case file names" but plan uses PascalCase for a new file |

**Gate 4 fails** if naming inconsistencies exist between the plan and the solution design or codebase analysis (cross-artifact misalignment). Internal inconsistencies within the plan are also CRITICAL.

### Step 6 — Dependency and Ordering Validation (Gate 5)

Validate the plan's dependency graph:

| Check | What to Verify | Severity |
|-------|---------------|----------|
| **No circular dependencies** | No phase A depends on phase B that depends on phase A | **CRITICAL** |
| **All dependencies exist** | Every Phase ID referenced in a Dependencies section exists in the plan | **CRITICAL** |
| **Dependencies are necessary** | Each declared dependency represents a genuine requirement (phase B needs code from phase A) | Warning |
| **Risk ordering** | Within phases at the same dependency level, high-risk phases come before low-risk phases | Warning |
| **Prerequisites first** | Phases covering prerequisites-plan items are sequenced before phases that depend on them | **CRITICAL** |
| **Delivery plan respected** | If a delivery plan exists, migration ordering and phased rollout constraints are reflected | **CRITICAL** (if applicable) |

**Gate 5 fails** if circular dependencies, missing references, or prerequisite ordering violations are found.

### Step 7 — Phase Granularity (Gate 6)

Verify each phase is appropriately sized:

| Check | What to Verify | Severity |
|-------|---------------|----------|
| **Session-sized** | Each phase is executable in a single AI agent session (~1–2 hours of implementation) | Warning |
| **PR-sized** | Each phase is estimated to produce ≤500 lines changed | Warning |
| **Tests included** | Every feature phase includes unit tests for the code it produces (TDD) | **CRITICAL** — test-only phases are only allowed for cross-phase integration/E2E tests |
| **Working system state** | Each phase leaves the system compilable with all tests passing | **CRITICAL** |
| **Phase count** | Total phase count is 3–12 for a typical feature | Warning |

**Gate 6 fails** if any feature phase does not include its unit tests, or if a phase would leave the system in a broken state.

### Step 8 — Inline Spec Completeness (Gate 7)

Verify every plan step within every phase contains all required inline components:

| Component | Required In | Severity if Missing |
|-----------|-----------|-------------------|
| **File path** | Every step that creates or modifies a file | **CRITICAL** |
| **Design spec (inline)** | Every step that implements functionality | **CRITICAL** |
| **Acceptance criteria (inline)** | Every step that implements an AC | **CRITICAL** |
| **Pattern to follow** | Every step that creates a new file | Warning |
| **Verification step** | Every step | **CRITICAL** |

**What "inline" means:** The design spec and acceptance criteria must be embedded directly in the plan step — not a reference to "see solution design Section 5" or "per the requirements." An AI coding agent executing the plan should never need to open another document.

**Gate 7 fails** if any plan step is missing a CRITICAL component.

### Step 9 — Solution Package Alignment (Gate 8)

Verify the plan faithfully implements the solution design without drift:

| Check | What to Verify | Severity |
|-------|---------------|----------|
| **Components covered** | Every component in the solution design's component map has a corresponding phase or plan step | **CRITICAL** |
| **API contracts match** | Inline API specs in plan steps match the solution design's API contracts (endpoints, schemas, status codes, error codes) | **CRITICAL** |
| **Data model matches** | Inline entity definitions in plan steps match the solution design's data model (columns, types, constraints, relationships) | **CRITICAL** |
| **Business rules match** | Business rules in plan steps match the solution design's backend design | **CRITICAL** |
| **No added scope** | The plan does not implement functionality not specified in the solution design | Warning — may indicate scope creep |
| **No dropped scope** | The plan does not omit functionality specified in the solution design | **CRITICAL** |

**Gate 8 fails** if the plan deviates from the solution design on any CRITICAL check — either by adding, changing, or omitting specified functionality.

### Step 10 — Decision

Based on all gates, determine the verdict:

| Decision | Criteria | What Happens Next |
|----------|---------|------------------|
| **GO** | All gates pass. No CRITICAL findings. The plan is complete, consistent, traceable, and executable. | Implementation begins — the implementation workflow takes over. |
| **NO-GO** | One or more gates fail with CRITICAL findings. | Specific findings are listed. The plan must be updated by the plan creator and this review re-run. Implementation is blocked. |

There is no "CONDITIONAL GO" for implementation plans. Unlike a solution design (which is handed to a human developer who can exercise judgment), an implementation plan is executed by AI coding agents that follow instructions literally. Ambiguity, missing specs, or broken dependencies will cause implementation failures. The plan must be fully ready.

### Step 11 — Present

Present the readiness assessment to the user with the full verdict and all gate results.

---

## Output Structure

```
## Plan Readiness Assessment

### Decision: [GO / NO-GO]

### Gate Results Summary

| Gate | Name | Status | Findings |
|------|------|--------|----------|
| 1 | Structural Completeness | PASS / FAIL | N critical, N warning |
| 2 | Spec Coverage | PASS / FAIL | N FR covered / N total, N AC covered / N total (across all AC types: REQ, BR, DATA, ACR, PERM, NFR, error-path) |
| 3 | Placeholder Sweep | PASS / FAIL | N forbidden patterns found |
| 4 | Naming Consistency | PASS / FAIL | N inconsistencies |
| 5 | Dependency & Ordering | PASS / FAIL | N issues |
| 6 | Phase Granularity | PASS / FAIL | N issues |
| 7 | Inline Spec Completeness | PASS / FAIL | N missing components |
| 8 | Solution Package Alignment | PASS / FAIL | N deviations |

### Detailed Findings

#### Gate 1 — Structural Completeness
[Per-phase section checklist]

#### Gate 2 — Spec Coverage
[Coverage summary table + list of missing FRs/ACs]

#### Gate 3 — Placeholder Sweep
[List of forbidden patterns found with locations]

#### Gate 4 — Naming Consistency
[List of inconsistencies with plan location, expected name, actual name]

#### Gate 5 — Dependency & Ordering
[Dependency graph validation results]

#### Gate 6 — Phase Granularity
[Per-phase size assessment]

#### Gate 7 — Inline Spec Completeness
[Per-step component checklist for steps missing components]

#### Gate 8 — Solution Package Alignment
[Deviation list: added scope, dropped scope, contract mismatches]

### CRITICAL Findings (if NO-GO)

1. [Finding — gate, location, description, what must be fixed]
2. [Finding — ...]

### Warnings (non-blocking)

1. [Warning — gate, location, description, recommendation]
2. [Warning — ...]
```

---

## Hand-off Gate

This IS the hand-off gate — the terminal gate for the entire planning phase.

After presenting the readiness assessment:

1. **If GO:** Confirm with the user that the plan is ready for implementation. The planning phase is complete. The implementation workflow takes over.
2. **If NO-GO:** Present the CRITICAL findings. The plan creator must address all CRITICAL findings, update the plan, and this review is re-run. Implementation is blocked until GO.

**Final confirmation:** *"The implementation plan has been reviewed for structural completeness, spec coverage, naming consistency, dependency ordering, phase granularity, inline spec completeness, and solution package alignment. The decision is [GO / NO-GO]. [If GO:] The plan is ready for implementation — the implementation workflow can begin. [If NO-GO:] The following [N] critical findings must be addressed: [list]. After the plan is updated, re-run this review."*

**Requires:** Implementation plan confirmed by the user before review begins.

## Completion Criteria

- [ ] All 8 gates have been evaluated
- [ ] Every phase has been checked for canonical shape compliance (all 8 sections present)
- [ ] Every FR from the requirements package has been verified as mapped to at least one phase
- [ ] Every AC across all artifact types (`AC-REQ-`, `AC-BR-`, `AC-DATA-`, `AC-ACR-`, `AC-PERM-`, `AC-NFR-`) has been verified as embedded inline in at least one plan step
- [ ] Every error-path AC from any artifact type has been verified as embedded in the plan step that handles the failure scenario
- [ ] No unresolved `[NEEDS CLARIFICATION]`, `[TBD]`, `[TODO]`, or vague instructions remain
- [ ] Entity names, file paths, and API endpoints are consistent across the plan, solution design, and codebase analysis
- [ ] The dependency graph is valid — no circular dependencies, no missing references, prerequisites ordered first
- [ ] Every feature phase includes its unit tests; no test-only phases except cross-phase integration/E2E
- [ ] Every plan step that implements functionality has an inline design spec, inline ACs, file path, and verification step
- [ ] The plan faithfully implements the solution design without drift — no added or dropped scope
- [ ] Formal verdict recorded: GO or NO-GO
- [ ] If NO-GO: all CRITICAL findings listed with specific locations and remediation guidance
- [ ] The user has been presented the verdict and confirmed

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Implementation begins against a plan with missing phases — some requirements are never implemented | Gate 2 verifies 100% FR and AC coverage before implementation starts |
| AI agent encounters a plan step that says "implement validation" with no details and guesses at the rules | Gate 3 sweeps for vague instructions; Gate 7 verifies every step has inline specs |
| AI agent creates a file at the wrong path because the plan has a typo or outdated path from an earlier draft | Gate 4 cross-checks file paths against the codebase analysis integration strategy |
| Phases execute out of order because the dependency graph is broken — a phase tries to use code that doesn't exist yet | Gate 5 validates the dependency graph for missing references and circular dependencies |
| A feature phase ships production code without tests — TDD is broken, defects are caught late | Gate 6 verifies every feature phase includes unit tests |
| The plan subtly differs from the solution design — wrong API endpoint paths, missing error codes, different column types | Gate 8 aligns the plan against the solution design on API contracts, data models, and business rules |
| The team debates "is the plan ready?" indefinitely with no clear gate | The GO/NO-GO decision provides a binary, structured answer backed by 8 concrete gates |
| NO-GO findings are vague ("needs improvement") and the plan creator doesn't know what to fix | Every finding includes the gate, location, description, and specific remediation guidance |
| Plan appears complete at a glance but has `[NEEDS CLARIFICATION]` markers buried in individual steps | Gate 3 scans the full plan text — no marker escapes the sweep |
| Unresolved markers in the plan are treated as "we'll figure it out during implementation" instead of design decisions | Any `[NEEDS CLARIFICATION]` marker is an automatic NO-GO — ambiguity must be resolved before coding begins |
