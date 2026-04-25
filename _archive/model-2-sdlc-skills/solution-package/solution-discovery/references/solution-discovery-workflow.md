# Solution Discovery Workflow

## Purpose

Define the entry-point sequence for a brownfield project from the architect's perspective — what the architect does first when receiving the requirements package for "add feature X to existing app Y." Sequences the architect's discovery skills for the brownfield case: (1) architecture-discovery to read the codebase at the architectural level — component topology, framework conventions, deployment manifests, data-layer architecture, integration patterns, and security boundaries, (2) technical-debt-assessment to categorize debt as must-fix, should-fix, or defer relative to the feature, and (3) existing-architecture-assessment to synthesize all discovery outputs into a single architecture baseline document. Ensures the architect understands the existing system's architectural reality before designing changes to it, and prevents the failure mode where design decisions are made against an idealized or assumed architecture rather than the actual one. The discovery phase produces the architecture-baseline document (from existing-architecture-assessment), which is the single input the design phase consumes alongside the BSA's requirements package. Requirements clarification, if needed, happens outside this flow — the architect raises gaps with the BSA directly. Not needed for greenfield projects where there is no existing architecture to discover.

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

Before any discovery work begins, determine the feature output folder.

1. **Check for existing feature folder.** Look for `docs/*/requirements-package/` in the project repository. If a feature folder already exists from the requirements phase, reuse it.
2. **If no existing folder**, read the change description or requirements package executive summary and infer a short kebab-case folder name (e.g., `refund-processing`, `user-onboarding`, `payment-gateway-v2`).
3. **Present to the user:** *"I'll organize all solution design outputs under `docs/<feature-name>/solutions-package/`. Does this folder name work?"*
4. **If inference fails**, ask the user: *"What short name should I use for the feature folder? This will be used as `docs/<name>/solutions-package/`."*
5. **Create the folder structure** if it does not exist: `docs/<feature>/solutions-package/discovery/`

All file paths in subsequent steps use `docs/<feature>/solutions-package/discovery/` as the output root.

---

## When to Use

- The entry point for the solutions package on a brownfield project
- After receiving the BSA's requirements package (`docs/<feature>/requirements-package/requirements-package.md`) for "add feature X to existing app Y"
- Before any design skills run

## Scope

Discovery produces a single **architecture-baseline** document — the architect's understanding of the existing system scoped to the areas affected by the proposed change. This is not a full system audit. The goal is to understand enough of the current architecture to design changes safely.

## What This Does

Sequences the architect's discovery skills in the order that builds understanding progressively — scan the codebase, assess debt, then synthesize into one baseline. This file is the workflow — it does not contain skill logic itself.

---

## The Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│  DESIGN DISCOVERY WORKFLOW — BROWNFIELD DISCOVERY SEQUENCE  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. architecture-discovery      ──► raw architectural           │
│     Read the codebase at the         observations               │
│     architectural level              Component topology,        │
│                                      framework conventions,     │
│                                      deployment manifests,      │
│                                      data-layer architecture,   │
│                                      integration patterns,      │
│                                      security boundaries        │
│              │                                                  │
│              ▼                                                  │
│  2. technical-debt-assessment   ──► technical debt assessment   │
│     Categorize debt relative         Must-fix / should-fix /    │
│     to the proposed feature          defer categorization by    │
│                                      type (code, architecture,  │
│                                      infrastructure, test,      │
│                                      documentation)             │
│              │                                                  │
│              ▼                                                  │
│  3. existing-architecture-      ──► architecture-baseline.md    │
│     assessment                       Single synthesized         │
│     Synthesize all discovery         document — the sole        │
│     outputs into one baseline        discovery input to the     │
│                                      design phase               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Why This Order

### Step 1 (Architecture Discovery) First

Technical debt can only be assessed relative to the areas the change will touch. Architecture discovery identifies the component topology, integration points, and boundaries — this tells the debt assessment where to look. Running debt assessment first would require scanning the entire codebase instead of focusing on the affected areas. If the requirements package has gaps that prevent scoping the codebase scan, the architect raises them with the BSA directly before proceeding.

### Step 2 (Technical Debt Assessment) Before Synthesis

The architecture baseline must include debt categorization so the design phase knows which debt blocks the feature (must-fix), which the feature will worsen (should-fix), and which is unrelated (defer). Running synthesis before debt assessment would produce a baseline that omits critical implementation constraints.

### Step 3 (Existing Architecture Assessment) Last

This is the synthesis step. It merges raw architectural observations, debt categorization, and relevant sections of the requirements package into a single architecture-baseline document. It must run after all other discovery skills are complete so it has the full picture.

---

## Discovery Phase Outputs

| Output | Produced By | Purpose |
|--------|------------|---------|
| raw architectural observations | architecture-discovery | Component topology, frameworks, deployment, data, integrations, security |
| technical debt assessment | technical-debt-assessment | Must-fix / should-fix / defer categorized by type |
| **`docs/<feature>/solutions-package/discovery/architecture-baseline.md`** | **existing-architecture-assessment** | **Single synthesized document — the sole discovery input to the design phase** |

## Entry Criteria

Before starting design discovery, confirm:

- [ ] The BSA's requirements package (`docs/<feature>/requirements-package/requirements-package.md`) exists and has been handed to the architect
- [ ] The codebase for the existing application is accessible to the architect
- [ ] The user is available to answer questions during discovery

> **Missing input guard:** If the requirements package cannot be found at `docs/<feature>/requirements-package/requirements-package.md`, do not proceed. Ask the user: *"I expected the requirements package at `docs/<feature>/requirements-package/requirements-package.md` but it was not found. Please provide the location of the requirements package before I can begin design discovery."*

## Exit Criteria

Discovery is complete when:

- [ ] The codebase has been scanned at the architectural level for the areas affected by the proposed change
- [ ] Technical debt in the affected areas has been categorized as must-fix, should-fix, or defer
- [ ] `docs/<feature>/solutions-package/discovery/architecture-baseline.md` has been produced as a single synthesized document
- [ ] The architecture baseline covers: component architecture, tech stack, deployment topology, data architecture, integration points, security architecture, performance characteristics, technical debt, architectural constraints, and areas affected by the proposed change

## Skill Reference

| Step | Skill | Output | Key Rule |
|------|-------|--------|---------|
| 1 | `architecture-discovery` | `docs/<feature>/solutions-package/discovery/architecture-discovery-observations.md` | Scoped to areas affected by the proposed change — not a full system audit |
| 2 | `technical-debt-assessment` | `docs/<feature>/solutions-package/discovery/technical-debt-assessment.md` | Categorizes debt relative to the proposed feature, not the whole system |
| 3 | `existing-architecture-assessment` | **`docs/<feature>/solutions-package/discovery/architecture-baseline.md`** | Synthesis step — merges all discovery outputs into the single document the design phase consumes |

## What Comes After Discovery

Once `docs/<feature>/solutions-package/discovery/architecture-baseline.md` is produced, the design phase begins. Every design skill consumes two inputs:

1. The BSA's **requirements package** (`docs/<feature>/requirements-package/requirements-package.md`) — what must be built
2. The architect's **architecture-baseline** (`docs/<feature>/solutions-package/discovery/architecture-baseline.md`) — what already exists

No design skill reaches back into individual discovery artifacts. The architecture baseline is the single point of truth for the existing system.

## Failure Modes This Orchestration Prevents

| Failure mode | How the sequence prevents it |
|---|---|
| Design decisions made against an idealized or assumed architecture | Step 1 reads the actual codebase — the architect designs against reality, not documentation |
| Feature built on top of must-fix technical debt | Step 2 categorizes debt so the design phase knows what must be addressed first |
| Design phase consumes fragmented, inconsistent discovery outputs | Step 3 synthesizes everything into one baseline — design skills have a single source of truth |
| Codebase scan covers the entire system instead of the affected areas | Step 1 is scoped by the requirements package — only areas the proposed change touches are analyzed |
| Debt assessment runs without knowing which areas are affected | Step 1 (architecture discovery) identifies the affected areas before step 2 (debt assessment) runs |
| Requirements package has gaps that prevent scoping the codebase scan | Step 1 reads the requirements package to scope the scan — if gaps prevent scoping, the architect raises them with the BSA before proceeding |

## Phase Handoff

After `docs/<feature>/solutions-package/discovery/architecture-baseline.md` is complete and acknowledged, ask the user:

> Solution discovery is complete. The architecture baseline is ready to feed solution design. Are you ready to start solution design?

If yes, activate or recommend the `solution-design` skill. If no, stop and summarize the completed discovery outputs and the next recommended phase.
