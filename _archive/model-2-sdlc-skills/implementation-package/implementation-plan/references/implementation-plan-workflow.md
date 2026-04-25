# Implementation Plan Workflow

## Purpose

Define the entry-point sequence for a brownfield project from the developer's perspective — what the developer does first when receiving a solution package for "add feature X to existing app Y." The solution package has already been reviewed and approved by the architect (review-solution-readiness returned GO) before handoff. Sequences the developer's planning skills for the brownfield case: (1) codebase-analysis to map the file structure, code patterns, dependencies, integration points, and conventions in the areas affected by the feature, (2) test-planning to analyze the existing test suite, define the test strategy, plan regression coverage, and identify existing tests that need modification, (3) prerequisites-planning to plan dependency additions, environment setup, and configuration changes that must be in place before feature code, (4) delivery-planning (conditional) to plan database migrations and phased delivery sequencing for live systems, (5) project-context-generator to produce the context document AI coding agents will operate with, (6) implementation-plan-creator to select the decomposition strategy and produce the ordered task list conforming to the canonical phase shape, and (7) review-plan-readiness as the go/no-go gate that validates the plan for spec coverage, completeness, naming consistency, and readiness for AI agents. Ensures the developer understands the codebase reality before planning changes to it, and prevents the failure mode where the implementation plan is structured around the design document's abstractions rather than the codebase's actual organization. The developer's equivalent of the BSA's and architect's brownfield-intake. Not needed for greenfield projects where there is no existing codebase to analyze.

## Sequential Execution Rule — Read This First

**Execute one step at a time. Do not pre-read all reference files before starting.**

The sequence below tells you which reference file to read next. Read each reference file only when you are about to execute that step. After you finish a step:

1. Produce the output artifact in full.
2. Present the artifact to the user.
3. Wait for acknowledgement before reading the next reference file.

**DO NOT:**
- Read all reference files upfront and then execute from memory.
- Skip a step because a previous step's output seemed to cover it.
- Run steps in parallel — every step depends on the outputs of previous steps.

---

## Step 0a — Determine Feature Folder

Before any implementation planning begins, confirm the feature output folder.

1. **Check for existing feature folder.** Look for `docs/*/solutions-package/` in the project repository. If a feature folder already exists from a previous phase, reuse it.
2. **If no existing folder**, read the solution design package (`docs/<feature>/solutions-package/solution-package.md`) or change description and infer a short kebab-case folder name (e.g., `refund-processing`, `user-onboarding`).
3. **Present to the user:** *"I'll organize all implementation planning outputs under `docs/<feature-name>/implementation-package/`. Does this folder name work?"*
4. **If inference fails**, ask the user: *"What short name should I use for the feature folder? This will be used as `docs/<name>/implementation-package/`."*
5. **Create the folder structure** if it does not exist: `docs/<feature>/implementation-package/plan/`

All file paths in subsequent steps use `docs/<feature>/implementation-package/` as the root.

---

## When to Use

- The entry point for the implementation package on a brownfield project
- After receiving the architect's solution package for "add feature X to existing app Y"
- Before any coding or testing skills run

## Scope

Implementation planning produces an **implementation package** — the developer's plan for how to build the proposed change. This is not the coding itself. The goal is to understand the codebase reality and produce a plan that AI coding agents can execute task-by-task.

## What This Does

Sequences the developer's planning skills in the order that builds understanding progressively — analyze the codebase, plan tests and prerequisites, then produce the implementation plan. This file is the workflow — it does not contain skill logic itself.

---

## The Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│  IMPLEMENTATION PLAN WORKFLOW — BROWNFIELD SEQUENCE          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. codebase-analysis           ──► codebase-analysis.md        │
│     Map affected code areas:         File/module map, patterns, │
│     structure, patterns,             conventions, integration   │
│     dependencies, conventions,       points, code integration   │
│     integration points               strategy                   │
│              │                                                  │
│              ▼                                                  │
│  2. test-planning               ──► test-plan.md                │
│     Existing tests, strategy,        Coverage, mocking, data,   │
│     regression coverage,             regression, test mods      │
│     test modifications                                          │
│              │                                                  │
│              ▼                                                  │
│  3. prerequisites-planning      ──► prerequisites-plan.md       │
│     Dependencies, environment,       Package changes, env vars, │
│     configuration                    config, flags              │
│              │                                                  │
│              ▼                                                  │
│  4. delivery-planning           ──► delivery-plan.md            │
│     Migrations, phased delivery      (CONDITIONAL — only if     │
│     sequencing, rollback             DB changes or multi-deploy │
│                                      rollout)                   │
│              │                                                  │
│              ▼                                                  │
│  5. project-context-generator   ──► project-context.md          │
│     Produce AI agent context:        Naming, patterns, testing, │
│     naming, patterns, gotchas,       boundaries, gotchas,       │
│     imports, style                   imports, style             │
│              │                                                  │
│              ▼                                                  │
│  6. implementation-plan-creator ──► implementation-plan.md       │
│     Select decomposition             Ordered task list with     │
│     strategy, produce ordered        exact paths, inline specs, │
│     task list conforming to          verification steps,        │
│     canonical phase shape            traceability               │
│              │                                                  │
│              ▼                                                  │
│  7. review-plan-readiness       ──► GO / NO-GO verdict          │
│     (from review/)                   Final gate before coding   │
│     Spec coverage, placeholders,     begins                     │
│     naming consistency, missing                                 │
│     verification, completeness,                                 │
│     solution package alignment                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Why This Order

### Step 1 (Codebase Analysis) First

The implementation plan must be structured around the codebase's actual organization — not the design document's abstractions. Codebase analysis maps the file structure, patterns, conventions, and integration points that the plan will reference. Planning without this produces tasks that don't map to real files.

### Step 2 (Test Planning) Before Implementation Planning

Test modifications and regression coverage affect the implementation plan's task sequencing. Tests that break due to intentional changes must be paired with the code changes that cause them. The test strategy defines coverage expectations that each task must satisfy.

### Step 3 (Prerequisites Planning) Before Implementation Planning

Dependencies, environment setup, and configuration changes must be sequenced before the code that depends on them. Discovering prerequisite conflicts mid-implementation forces rework.

### Step 4 (Delivery Planning) Conditional

Only runs when the feature involves database changes, multi-deployment rollout, or changes to a live system. Migration ordering and phased delivery affect task sequencing in the implementation plan.

### Step 5 (Project Context Generator) Before Plan Creation

The context document captures naming conventions, patterns, gotchas, and style rules that the implementation plan creator needs to reference in task instructions.

### Step 7 (Review Plan Readiness) Last

The go/no-go gate runs after the plan is produced. It checks spec coverage, placeholders, naming consistency, missing verification steps, solution package alignment, and canonical phase shape conformance. It also verifies that no `[NEEDS CLARIFICATION]` markers remain unresolved — any marker is an automatic NO-GO. This is the final checkpoint before coding begins.

---

## Planning Phase Outputs

All planning outputs are written to `docs/<feature>/implementation-package/` (see Step 0a).

| Output | Path | Produced By | Purpose |
|--------|------|------------|---------|
| codebase-analysis.md | `docs/<feature>/implementation-package/plan/codebase-analysis.md` | codebase-analysis | File/module map, patterns, conventions, integration strategy |
| test-plan.md | `docs/<feature>/implementation-package/plan/test-plan.md` | test-planning | Test strategy, regression coverage, test modifications |
| prerequisites-plan.md | `docs/<feature>/implementation-package/plan/prerequisites-plan.md` | prerequisites-planning | Dependency, environment, and configuration changes |
| delivery-plan.md | `docs/<feature>/implementation-package/plan/delivery-plan.md` | delivery-planning | Migration and phased delivery plan (conditional) |
| project-context.md | `docs/<feature>/implementation-package/plan/project-context.md` | project-context-generator | AI agent context document |
| **implementation-plan.md** | **`docs/<feature>/implementation-package/plan/implementation-plan.md`** | **implementation-plan-creator** | **Ordered task list — the primary deliverable** |
| GO / NO-GO verdict | — | review-plan-readiness | Final gate before coding (includes self-review checks) |
| **implementation-package.md** | **`docs/<feature>/implementation-package/implementation-package.md`** | Assembly of all planning outputs | **The assembled implementation package** |

## Entry Criteria

Before starting implementation planning, confirm:

- [ ] The architect's solution package exists at `docs/<feature>/solutions-package/solution-package.md` and has been handed to the developer
- [ ] The BSA's requirements package exists at `docs/<feature>/requirements-package/requirements-package.md` (consumed by individual planning references)
- [ ] The BSA's change tracker exists at `docs/<feature>/requirements-package/requirements/change-tracker.md` — provides the package version log and change register so the implementation phase can detect requirements staleness
- [ ] The codebase for the existing application is accessible
- [ ] The user is available to answer questions during planning

> **Missing input guard:** If the solution package cannot be found at `docs/<feature>/solutions-package/solution-package.md`, do not proceed. Ask the user to provide the location of the solution design package before beginning implementation planning.

> **Version staleness check:** At the start of implementation planning, read the requirements change tracker and compare the package version recorded in the solution overview (Section 1 of `solution-package.md`) against the current package version in the change tracker. If they differ, the solution design may be stale — requirements changed after the design was produced. Present this to the user: *"The solution design was produced against requirements package [old version], but the current requirements package is [new version]. The following requirements changed: [list from Version Diff Summary]. The solution design may need updating before implementation planning proceeds."* The user decides whether to proceed (accepting the risk) or return to the architect for design updates. Record the decision.

## Exit Criteria

Planning is complete when:

- [ ] The codebase has been analyzed for the areas affected by the proposed change
- [ ] Test planning is complete (strategy, regression, test modifications)
- [ ] Prerequisites are planned (dependencies, environment, configuration)
- [ ] Delivery planning is complete (if applicable — migrations, phased delivery)
- [ ] Project context document has been produced
- [ ] Implementation plan has been produced conforming to canonical phase shape
- [ ] Review-plan-readiness has returned GO

## Skill Reference

| Step | Skill | Output | Key Rule |
|------|-------|--------|---------|
| 1 | `codebase-analysis` | codebase-analysis.md | Scoped to areas affected by the proposed change — not a full codebase audit |
| 2 | `test-planning` | test-plan.md | Covers existing tests, strategy, regression, and test modifications in one pass |
| 3 | `prerequisites-planning` | prerequisites-plan.md | Dependencies, environment, and configuration planned before feature code |
| 4 | `delivery-planning` | delivery-plan.md | **Conditional** — only if DB changes or multi-deploy rollout |
| 5 | `project-context-generator` | project-context.md | Produces AI agent context with concrete examples |
| 6 | `implementation-plan-creator` | **implementation-plan.md** | Includes decomposition strategy; phases conform to canonical phase shape |
| 7 | `review-plan-readiness` (review/) | GO / NO-GO | Final gate — spec coverage, placeholders, naming, completeness, alignment |

## What Comes After Planning

Once the implementation plan is produced and review-plan-readiness returns GO, the **implementation execution phase** begins. The `implementation-execution` skill sequences coding and testing references to execute the plan task-by-task, referencing `../assets/phase-execution-guide.md` for the per-phase workflow.

## Failure Modes This Orchestration Prevents

| Failure mode | How the sequence prevents it |
|---|---|
| Implementation plan structured around design abstractions rather than codebase organization | Step 1 maps the actual codebase before step 6 creates the plan |
| Existing tests break unexpectedly during implementation | Step 2 identifies tests that will break and pairs modifications with code changes |
| Dependency conflicts discovered mid-implementation | Step 3 plans prerequisites before the plan is created |
| Migration ordering conflicts with code deployment | Step 4 plans delivery sequencing before tasks are ordered |
| AI agents lack codebase context during execution | Step 5 produces a context document with naming, patterns, and concrete examples |
| Plan has spec coverage gaps or missing verification steps | Step 7 reviews and gates before coding begins |
| Agent guesses at ambiguous requirements instead of asking | Step 6 forces `[NEEDS CLARIFICATION]` markers; step 7 blocks on unresolved markers |

## Phase Handoff

After `review-plan-readiness` returns GO and `docs/<feature>/implementation-package/plan/implementation-plan.md` is acknowledged, ask the user:

> Implementation planning is complete. The implementation plan is ready for execution. Are you ready to start implementation execution?

If yes, activate or recommend the `implementation-execution` skill. If no, stop and summarize the completed implementation planning outputs and the next recommended phase.
