# Implementation Plan Creator

## Purpose

Produce an ordered implementation plan from the change spec and codebase orientation — no solution package dependency. Takes the change spec (what, where, why, ACs, delta) and the inline codebase context (patterns, conventions, test files) as inputs. Decomposes the change into ordered tasks, each containing: (1) files to create or modify (exact paths from orientation), (2) the specific change to make (what code to add, modify, or remove), (3) success criteria (testable pass/fail conditions derived from the change spec's ACs), (4) test approach (what test to write, what it asserts, which test file), and (5) relevant spec excerpt inline (so the executing agent has the behavioral specification without re-reading the change spec). Task granularity: each task should be independently verifiable, produce a working system state, and be small enough for a single AI agent session. Each phase in the plan must conform to the canonical phase shape (see ../assets/canonical-phase-shape.md): Phase Identity, Goal, Dependencies, Plan, Outcome, Automated Verification (AI Gate), Human Verification (Human Gate), and Success Criteria. AC Mapping in Phase Identity traces each phase back to the change spec's acceptance criteria. Enforces forced uncertainty markers: if anything from the change spec or codebase orientation is ambiguous, incomplete, or contradictory on a point that affects a task, insert [NEEDS CLARIFICATION: specific question] rather than guessing. The plan cannot proceed past the clarity gate with unresolved markers. Clarity gate (must pass before execution begins): (1) no [NEEDS CLARIFICATION] markers remain, (2) every task has verifiable success criteria, (3) file paths are specified for every task, (4) no speculative tasks — every task traces to a change spec acceptance criterion. If the clarity gate fails, return to scope or orient to resolve.

## What This Produces

An ordered implementation plan with phases conforming to the canonical phase shape. Each phase contains enough detail for a coding agent to execute without re-reading the change spec or codebase — the behavioral specification, file paths, patterns to follow, tests to write, and success criteria are all inline.

This skill derives the plan from the change spec and codebase orientation. It does not require a solution package or requirements package.

## When to Use

- Third step of the expedited workflow — after the change spec is agreed and orientation is complete
- Before any coding begins
- The plan must pass the clarity gate before execution starts

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Change spec | From Step 1 — what, where, why, ACs, out of scope, delta | Yes |
| Codebase orientation | From Step 2 — technology versions, patterns, conventions, test infrastructure, standards compliance snapshot | Yes |
| Canonical phase shape | `../assets/canonical-phase-shape.md` — mandatory 8-section structure for each phase | Yes |
| Implementation plan template | `../assets/implementation-plan.md` — output format | Yes |
| Coding standards | Loaded during orientation — applicable common, language, framework standards | Yes — referenced for pattern guidance in plan steps |

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  IMPLEMENTATION PLAN CREATOR — PLANNING SEQUENCE                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ANALYZE ACs ─────────► Map acceptance criteria to work units │
│     Each AC becomes one or more implementation tasks.            │
│     Identify dependencies between ACs.                           │
│                                                                  │
│  2. DETERMINE ORDER ─────► Sequence phases by dependency         │
│     Foundation first, then features, then integration.           │
│     Each phase produces a working system state.                  │
│                                                                  │
│  3. POPULATE PHASES ─────► Fill canonical phase shape             │
│     For each phase: Identity (AC mapping), Goal, Dependencies,  │
│     Plan (steps with inline specs), Outcome, AI Gate, Human     │
│     Gate, Success Criteria.                                      │
│                                                                  │
│  4. EMBED CONTEXT ───────► Inline patterns and conventions       │
│     Each plan step includes: file paths (from orientation),      │
│     patterns to follow (from orientation + standards),           │
│     test approach (framework, naming, file path).                │
│                                                                  │
│  5. MARK UNCERTAINTY ────► Insert [NEEDS CLARIFICATION]          │
│     Any ambiguity that affects implementation gets a marker.     │
│                                                                  │
│  6. CLARITY GATE ────────► Validate the plan                     │
│     No markers, all sections, AC traceability, file paths.      │
│     If fails → return to scope or orient.                        │
│                                                                  │
│  7. PRESENT ─────────────► Write docs/<feature>/implementation-package/          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Analyze Acceptance Criteria

Take each AC from the change spec and determine what implementation work it requires:

| AC | Work Units | Files Affected |
|---|---|---|
| *(AC-1: Clicking "mark as read" sends PATCH)* | *(1. Add click handler; 2. Wire API call)* | *(NotificationCard.tsx, api/endpoints.ts)* |
| *(AC-2: Button disappears after success)* | *(1. Add state tracking; 2. Conditional render)* | *(NotificationCard.tsx)* |
| *(AC-3: Already-read notifications hide button)* | *(1. Check read status on render)* | *(NotificationCard.tsx)* |

**Group related work units into phases.** A phase should:
- Implement one or a few related ACs
- Be independently verifiable — the system works after the phase completes
- Be small enough for a single coding session

### Step 2 — Determine Phase Order

Sequence phases by dependency — foundation before features, features before integration:

| Ordering Principle | Example |
|-------------------|---------|
| **Infrastructure first** | Config changes, imports, type definitions before code that uses them |
| **Data layer before business logic** | Model changes before service changes |
| **Backend before frontend** | API changes before UI changes (if both affected) |
| **Core behavior before edge cases** | Happy path before error handling |
| **Tests accompany each phase** | Test creation is part of the phase, not a separate phase |

### Step 3 — Populate Each Phase with Canonical Shape

Each phase must have all 8 sections from the canonical phase shape (`../assets/canonical-phase-shape.md`):

#### Phase Identity

| Field | Content |
|-------|---------|
| Phase ID | `PHASE-001`, `PHASE-002`, etc. |
| Phase Name | Descriptive name (e.g., "Add mark-as-read handler") |
| AC Mapping | Which ACs from the change spec this phase implements |

**AC Mapping traces every phase to the change spec.** If a phase cannot be mapped to any AC, it is speculative and should be removed.

#### Goal

A single sentence describing the system state after this phase completes. Describes outcome, not effort.

| Good | Bad |
|------|-----|
| "NotificationCard dispatches a PATCH request when the mark-as-read button is clicked" | "Implement the click handler" |
| "Concurrent cancel requests are serialized — only the first succeeds" | "Add locking to the cancel endpoint" |

#### Dependencies

Which phases must complete first. `None` for the first phase.

#### Plan

Step-by-step instructions — imperative, specific, executable. Each step includes:

| Element | What to Include |
|---------|----------------|
| **Action** | Verb-first instruction: "Create," "Add," "Modify," "Write test" |
| **File path** | Exact path from orientation (e.g., `src/components/NotificationCard.tsx`) |
| **Inline spec excerpt** | The behavioral specification from the change spec AC that this step implements |
| **Pattern to follow** | From orientation: "Follow the existing click handler pattern in `ActionButton.tsx`" |
| **Standard to follow** | From orientation: "Use typed exceptions per `../assets/standards/common/error-handling.md`" — only when the relevant codebase pattern deviates from the standard |
| **Test approach** | "Write test in `NotificationCard.test.tsx` — assert PATCH is called with correct payload" |

**Standards in plan steps:** When the codebase orientation identified a pattern that deviates from the organizational standard, the plan step must explicitly state which standard to follow. When the codebase pattern is compliant, a simple "follow the existing pattern" suffices — no need to cite the standard.

#### Outcome

Measurable deliverables this phase produces (files created, files modified, tests added).

#### Automated Verification (AI Gate)

Specific commands to run and their expected results:
- Test command with expected pass count
- Build command with expected clean output
- Lint command with expected zero errors

#### Human Verification (Human Gate)

What the developer should manually review or check — things that automated tests cannot cover (e.g., visual appearance, UX flow).

#### Success Criteria

Binary pass/fail checklist. Each criterion starts with a verb and is independently verifiable.

### Step 4 — Embed Codebase Context Inline

For each plan step, embed the context the executing agent needs — it should not have to re-read the orientation or standards:

| Context to Embed | Source | Example |
|-----------------|--------|---------|
| File path | Orientation | `src/components/NotificationCard.tsx` |
| Pattern to follow | Orientation compliance snapshot | "Follow existing `useCallback` pattern for handlers" |
| Standard override | Orientation compliance snapshot (non-compliant entries) | "Use NestJS Logger per standard, not console.log" |
| Test file and framework | Orientation test infrastructure | "Write test in `NotificationCard.test.tsx` using Testing Library RTL 16 + Jest 29" |
| Test naming convention | Orientation test infrastructure | "Name: `it('sends PATCH when mark-as-read is clicked')`" |
| Mocking approach | Orientation test infrastructure | "Mock API call using `jest.mock('../api/notifications')`" |

### Step 5 — Mark Uncertainty

If anything from the change spec or orientation is ambiguous, incomplete, or contradictory on a point that affects a task, insert a marker:

```
[NEEDS CLARIFICATION: The change spec says "button disappears" but the
existing pattern uses opacity animation for removals. Should we use
the existing animation pattern or instant removal?]
```

**Do not guess.** A marker is always better than a wrong assumption in the plan.

### Step 6 — Clarity Gate

The plan cannot proceed to execution until all checks pass:

| Check | Pass Condition |
|-------|---------------|
| No `[NEEDS CLARIFICATION]` markers | All ambiguities resolved |
| Every phase has all 8 canonical sections | Canonical phase shape is complete |
| Every phase has success criteria | Binary pass/fail defined |
| File paths specified | Each phase names the files it creates or modifies |
| AC mappings present | Every phase traces to change spec acceptance criteria |
| No speculative phases | Every phase traces to a change spec AC — no "might need later" phases |
| Standards referenced where needed | Plan steps cite the standard when codebase pattern deviates |
| Test approach specified | Each phase includes what to test, where, and how |

If the clarity gate fails, return to scope (to resolve spec ambiguity) or orient (to resolve codebase ambiguity).

### Step 7 — Present the Plan

Write `docs/<feature>/implementation-package/implementation-plan.md` using the template at `../assets/implementation-plan.md`. Present the plan to the developer:

> "Here's the implementation plan — [N] phases, each mapped to your acceptance criteria. The clarity gate [passed / has N issues to resolve]. Can I walk you through it?"

Present the clarity gate checklist result. Do not proceed until the developer confirms the plan.

---

## Output

The implementation plan follows the template at `../assets/implementation-plan.md` with all phases populated in canonical shape, the clarity gate checklist at the end, and inline context embedded in each plan step.

---

## Hand-off Gate

Before proceeding to execution (`feature-implementer`):

1. The plan is written in `docs/<feature>/implementation-package/implementation-plan.md`.
2. The clarity gate has passed — all checks green.
3. The developer has reviewed and confirmed the plan.
4. Ask: "Ready to start executing? I'll work through phases in order, one at a time."

---

## Completion Criteria

- [ ] Every AC from the change spec maps to at least one phase
- [ ] Every phase maps to at least one AC (no speculative phases)
- [ ] Every phase has all 8 canonical sections populated
- [ ] Every plan step has: action, file path, inline spec excerpt, pattern/standard reference, test approach
- [ ] Standards are cited in plan steps where codebase patterns deviate from the standard
- [ ] Testing approach references the correct framework, version, and naming convention (from orientation)
- [ ] All `[NEEDS CLARIFICATION]` markers are resolved
- [ ] Clarity gate checklist passes
- [ ] The developer has confirmed the plan

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Plan phases don't trace to any AC — speculative work | AC mapping required in Phase Identity; clarity gate rejects unmapped phases |
| An AC is never implemented — missed in the plan | Step 1 maps every AC to work units; Step 6 verifies coverage |
| Plan step says "implement the feature" with no detail — agent guesses | Step 3 requires inline spec excerpts, file paths, patterns, test approach in every step |
| Agent uses wrong test framework or API version | Step 4 embeds testing framework, version, and naming from orientation |
| Agent follows a bad codebase pattern instead of the standard | Step 4 embeds standard overrides from the orientation compliance snapshot |
| Plan has ambiguity that surfaces as a wrong implementation during coding | Step 5 inserts markers; Step 6 blocks until resolved |
| Agent proceeds to coding with a plan that has missing sections | Step 6 clarity gate requires all 8 canonical sections per phase |
| Plan looks complete but the developer disagrees with the approach | Step 7 hand-off gate requires explicit developer confirmation |
