# Implementation Execution Workflow

## Purpose

Sequence the coding and testing skills that execute the implementation plan produced by the planning phase. Supports two execution modes: inline execution (agent works through tasks sequentially in a single session) and subagent-driven development (fresh subagent per task with two-stage review — spec compliance then code quality). References the phase execution guide for the per-phase workflow: phase education, game plan, checklist, definition of done, test coverage, go/no-go, branch creation, execution, verification, bug capture, and approval. Enforces TDD (test-driven development) as the mandatory coding discipline — no production code without a failing test first. Coordinates the feature-implementer skill for task execution, systematic-debugging for issue resolution, and test-creator skills (unit, integration, component) for test authoring. After each task or task group, invokes the relevant review skills to validate code quality before proceeding. Enforces verification-before-completion: no success claim without fresh verification in the same turn (run tests, read output, cite evidence). Manages task status tracking via a state machine (backlog → ready → in-progress → review → done, with a blocked state).

## Sequential Execution Rule — Read This First

**Execute one step at a time. Do not pre-read all reference files before starting.**

Read each reference file only when you are about to execute that step. After you finish a step:

1. Verify the task's success criteria are met.
2. Update the task status.
3. Proceed to the next task only after verification passes.

**DO NOT:**
- Read all reference files upfront and then execute from memory.
- Skip a task because a previous task seemed to cover it.
- Proceed past a failed verification — fix the issue first.
- Claim success without fresh verification in the same turn.

---

## When to Use

- After the implementation planning phase is complete and review-plan-readiness has returned GO
- The implementation plan (`implementation-plan.md`) exists and has been approved
- The project context document (`project-context.md`) exists

## Scope

This workflow executes the implementation plan — it does not produce it. The planning workflow produces the plan; this workflow consumes it.

## What This Does

Sequences the coding and testing skills to execute each task in the implementation plan. Manages execution mode selection, task status tracking, TDD enforcement, and review coordination. This file is the workflow — it does not contain skill logic itself.

---

## Execution Mode Selection

Present both modes to the user before starting. The user chooses.

### Mode A: Inline Execution

The agent works through tasks sequentially in the current session.

**Best for:** Smaller plans (< 15 tasks), tasks with heavy interdependencies, when human wants close oversight.

**Flow per task:**
1. Read the task from `implementation-plan.md`
2. Follow the phase execution guide (`../assets/phase-execution-guide.md`) for pre-execution steps
3. Execute using `feature-implementer.md` with TDD workflow (`tdd-workflow.md`)
4. If issues arise, invoke `systematic-debugging.md`
5. Verify success criteria
6. Update task status
7. Proceed to next task

### Mode B: Subagent-Driven Development

Fresh subagent per task with two-stage review after each task.

**Best for:** Larger plans (15+ tasks), tasks that are mostly independent, when human wants less frequent checkpoints.

**Flow per task:**
1. Dispatch a subagent with the full task text (do not have the subagent read the plan file)
2. Subagent executes using TDD workflow
3. **Stage 1 review:** Spec compliance — does the implementation match the design spec and acceptance criteria embedded in the task?
4. **Stage 2 review:** Code quality — does the code follow project conventions, handle errors, and maintain test coverage?
5. If either review fails, the subagent fixes and re-reviews
6. Update task status
7. Proceed to next task

---

## The Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│  IMPLEMENTATION WORKFLOW — EXECUTION SEQUENCE               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  0. MODE SELECTION              ──► inline or subagent-driven   │
│     Present both modes;              User-confirmed mode        │
│     user chooses                                                │
│              │                                                  │
│  ┌───────────┤ PER-TASK LOOP ──────────────────────────────────┐│
│  │           ▼                                                 ││
│  │  1. LOAD TASK                ──► task specification          ││
│  │     Read next task from           Design spec, ACs,          ││
│  │     implementation-plan.md        file paths, verification   ││
│  │           │                                                 ││
│  │           ▼                                                 ││
│  │  2. PRE-EXECUTION            ──► phase education, game      ││
│  │     Follow phase-execution-       plan, go/no-go            ││
│  │     guide.md workflow             (inline mode only)         ││
│  │           │                                                 ││
│  │           ▼                                                 ││
│  │  3. EXECUTE (TDD)            ──► working code + tests       ││
│  │     feature-implementer +         RED-GREEN-REFACTOR         ││
│  │     tdd-workflow                  No production code         ││
│  │     + test creators               without failing test       ││
│  │           │                                                 ││
│  │           ▼                                                 ││
│  │  4. DEBUG (if needed)        ──► root cause + fix           ││
│  │     systematic-debugging          4-phase RCA process        ││
│  │           │                                                 ││
│  │           ▼                                                 ││
│  │  5. VERIFY (3 dimensions)   ──► verification result        ││
│  │     Completeness, Correctness,    Fresh verification in      ││
│  │     Coherence                     the same turn              ││
│  │           │                                                 ││
│  │           ▼                                                 ││
│  │  6. REVIEW                   ──► review findings            ││
│  │     Spec compliance then          (subagent mode: 2-stage;   ││
│  │     code quality                  inline: per-task or        ││
│  │                                   batched)                   ││
│  │           │                                                 ││
│  │           ▼                                                 ││
│  │  7. UPDATE STATUS            ──► task marked done           ││
│  │     Record completion in          Status: done / blocked     ││
│  │     implementation plan                                     ││
│  └───────────┤                                                 ││
│              │ (repeat for each task)                           ││
│              ▼                                                  │
│  8. COMPLETION                  ──► implementation complete     │
│     All tasks done;                  Ready for PR phase         │
│     full test suite passes                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## TDD Enforcement

TDD is mandatory for all implementation tasks. The `tdd-workflow.md` defines the cycle:

1. **RED** — Write a minimal failing test for the next behavior
2. **Verify fail** — Run the test and confirm it fails for the expected reason
3. **GREEN** — Write the minimal production code to make the test pass
4. **Verify pass** — Run the test and confirm it passes
5. **REFACTOR** — Clean up without changing behavior
6. **Repeat** — Next behavior

**Iron rule:** No production code without a failing test first. Code written before the test must be deleted and redone.

---

## Verification-Before-Completion

No success or completion claim without fresh verification in the same turn. Before marking any task done, committing code, or declaring the implementation complete:

1. **Identify** the proof command or verification step (from the task's success criteria)
2. **Run** it fully in the current turn — not from memory or a prior run
3. **Read** the complete output — not just the first or last line
4. **Only then** claim success, citing the evidence

This applies at every level: per-task verification, per-phase test suite runs, and final implementation completion. When reviewing delegated subagent work, verify via VCS diff and test commands — not subagent reports alone.

### Three Verification Dimensions

Every verification pass must check all three dimensions — a task is not done until all three are satisfied:

| Dimension | What it checks | Example failures |
|-----------|---------------|-----------------|
| **Completeness** | All acceptance criteria implemented, all scenarios from the spec have corresponding code and tests, no task steps skipped | AC says "handle timeout" but no timeout logic exists; spec scenario has no test |
| **Correctness** | Implementation matches the design spec's intent, edge cases handled, error states match spec definitions, tests assert the right behavior | Design says "retry 3 times" but code retries infinitely; test asserts no exception but doesn't check the return value |
| **Coherence** | Design decisions reflected in code structure, naming matches project-context.md, patterns consistent with codebase, no drift between plan and implementation | Design says "event-driven" but code uses polling; project uses `camelCase` but new code uses `snake_case` |

---

## Task Status Tracking

Each task in the implementation plan has a status that follows this state machine:

```
backlog ──► ready ──► in-progress ──► review ──► done
                          │                        ▲
                          └──► blocked ─────────────┘
                                  (after unblocked)
```

| Status | Meaning |
|--------|---------|
| `backlog` | Not yet started; default for all tasks at plan creation |
| `ready` | Prerequisites satisfied; can be picked up |
| `in-progress` | Currently being executed |
| `review` | Code written and tests pass; awaiting review (subagent mode) |
| `done` | Verified, reviewed, complete |
| `blocked` | Cannot proceed — dependency, clarification, or environment issue; record the blocker |

**Rules:**
- Only one task should be `in-progress` at a time (inline mode) or one per subagent (subagent mode)
- Never downgrade status (e.g. `done` back to `in-progress`) — if rework is needed, create a follow-up task
- A task cannot move to `done` without passing verification-before-completion
- Update status in `implementation-plan.md` after each state change

---

## Skill Reference

| Skill | Location | Role in Orchestration |
|-------|----------|----------------------|
| `feature-implementer.md` | `references/` | Primary execution reference — works through task steps |
| `tdd-workflow.md` | `references/` | TDD discipline — RED-GREEN-REFACTOR cycle |
| `systematic-debugging.md` | `references/` | Issue resolution — 4-phase root cause analysis |
| `unit-test-creator.md` | `references/` | Unit test authoring |
| `integration-test-creator.md` | `references/` | Integration test authoring |
| `component-test-creator.md` | `references/` | UI component test authoring |
| `verification.md` | `references/` | Verification-before-completion checks |

## Pre-Implementation Gates

Before writing any code, the workflow runs these adversarial gates. Each gate must pass or document a justified exception. A gate that fails without documented justification blocks implementation.

### Simplicity Gate

| Check | Pass condition |
|-------|---------------|
| Task count proportional to feature scope | No task does more than one logical thing |
| No speculative tasks | Every task traces to a concrete acceptance criterion — no "might need later" tasks |
| No premature abstraction | Tasks use framework/library APIs directly rather than wrapping them in custom abstractions unless the plan explicitly justifies the wrapper |

### Clarity Gate

| Check | Pass condition |
|-------|---------------|
| No `[NEEDS CLARIFICATION]` markers remain | All ambiguities resolved before implementation starts |
| Every task has verifiable success criteria | Each task defines what "done" looks like in testable terms |
| File paths specified | Each task names the files it will create or modify |

### Integration-First Gate

| Check | Pass condition |
|-------|---------------|
| Contracts defined before implementation | API contracts, data models, and interface boundaries exist in the plan |
| Test boundaries specified | The test plan defines which tests are unit, integration, and component |
| Existing test suite passes | Run the full existing test suite and confirm green before touching code |

If a gate fails, the workflow stops and either returns to implementation planning (for plan-level issues) or asks the user to resolve the blocker. Do not begin coding with known gate failures.

---

## Entry Criteria

Before starting implementation execution, confirm:

- [ ] Implementation planning is complete (review-plan-readiness returned GO)
- [ ] `implementation-plan.md` exists with ordered tasks conforming to canonical phase shape
- [ ] `project-context.md` exists
- [ ] Prerequisites from `prerequisites-plan.md` have been set up
- [ ] The codebase is in a clean state (all existing tests pass)
- [ ] All pre-implementation gates pass (or have documented justified exceptions)
- [ ] The requirements package version consumed by the solution design matches the current package version in the change tracker (at `docs/<feature>/requirements-package/requirements/change-tracker.md`) — or a documented decision to proceed despite version mismatch exists from implementation planning

## Exit Criteria

Implementation is complete when:

- [ ] All tasks in the implementation plan are marked done
- [ ] All tests pass (unit, integration, component, E2E as applicable)
- [ ] No tasks are in blocked status
- [ ] The full test suite passes (including pre-existing tests)

## What Comes After Implementation

Once all tasks are complete and verified, the **PR phase** begins. Activate `implementation-pr` and follow `implementation-pr/references/implementation-pr-workflow.md` for review, approved commits, PR description, and handoff.

## Phase Handoff

After all implementation plan tasks are complete and verified, ask the user:

> Implementation execution is complete. The working tree is ready for PR review and handoff. Are you ready to start implementation PR/handoff?

If yes, activate or recommend the `implementation-pr` skill. If no, stop and summarize completed tasks, verification evidence, and the next recommended phase.
