---
name: create-implementation-package
description: >
  Create an Implementation Package (Phase 3 of the AI SDLC) — the phased implementation plan that
  translates solution design into working software through incremental, verifiable phases. Use this
  skill whenever the user mentions creating an implementation plan, setting up coding phases, building
  the implementation package, creating development phases, or starting Phase 3. Trigger for "create the
  implementation plan", "set up the phases", "build the implementation package", "start Phase 3", "how
  do we implement this", "break this into coding phases". Requires a completed Solution Design Package
  as input.
---

# Create Implementation Package

You are guiding the user through creating an Implementation Package — a phased, incremental plan for
building the solution defined in the Solution Design Package.

## Before You Start — Load Context

1. `phases/create-implementation-package.md` — The complete implementation process
2. `phases/canonical-phase-shape.md` — The mandatory 8-section structure for each phase
3. `../implementation-execution/phases/phase-execution-guide.md` — How phases are executed
4. `../_shared/templates/change-tracker-template.md` — Change tracking structure
5. **Read the Solution Design Package** — this is your primary input
6. **Read the Requirements Package** — for FR mapping

## What the Implementation Package IS

- **Working software** delivered in verifiable phases
- Each phase follows the **Canonical Phase Shape**: Phase Identity, Goal, Dependencies, Plan, Outcome,
  AI Gate (automated verification), Human Gate (manual verification), Success Criteria
- Phases are **independently executable** — another AI or developer can pick up any phase and execute it
- Every phase **maps to specific Functional Requirements** (FRs)

## Canonical Phase Shape (Mandatory for Every Phase)

Every phase MUST contain these 8 sections:

1. **Phase Identity** — ID, name, FR mapping
2. **Goal** — testable statement of what "done" looks like
3. **Dependencies** — what must exist before this phase starts
4. **Plan** — numbered steps the implementer will follow
5. **Outcome** — concrete artifacts produced
6. **Automated Verification (AI Gate)** — programmatically verifiable checks
7. **Human Verification (Human Gate)** — manual review steps
8. **Success Criteria** — checklist of completion conditions

## Workflow

### Phase 1: Analyze Solution Design
- Read the solution design and requirements
- Identify natural phase boundaries (feature modules, layers, integration points)
- Map FRs to potential phases

### Phase 2: Phase Decomposition
- Break the solution into phases, each independently verifiable
- Establish phase dependencies (which phases must complete before others can start)
- Ensure every FR is covered by at least one phase
- Use scaffolding: propose the phase list and get approval before writing details

### Phase 3: Write Each Phase
- For each phase, write all 8 mandatory sections
- Ensure AI Gates have specific, testable assertions
- Ensure Human Gates have clear review instructions
- Include the plan steps in enough detail for blind execution

### Phase 4: Support Documents
- Create the bugs-and-issues-log.md
- Create the change-tracker.md
- Create the phase-status.md for tracking progress
- Add the implementation plan to the docs structure

## Key Rules

- **Every phase follows the Canonical Phase Shape exactly** — no exceptions
- **FR mapping is mandatory** — every phase lists which FRs it implements
- **AI Gates must be testable** — "looks good" is not a gate; "all unit tests pass" is
- **Phases must be independently executable** — ask yourself "can another AI execute this blindly?"
- **Don't combine unrelated work** — each phase should have a cohesive purpose
