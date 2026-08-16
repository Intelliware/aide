# Implementation Plan Workflow

This file defines the per-step workflow inside `create-implementation-package`,
folding in the rapid-dev planning granularity from the legacy
`model-2-sdlc-skills/implementation-package/implementation-plan/` skill while
keeping the elaborate domain skill's Canonical Increment Shape as the
authoritative artifact.

## Purpose

Sequence the planning steps that turn an approved Solution Design Package into
an implementation package whose every increment conforms to the Canonical
Increment Shape. The sequence:

1. Builds codebase ground truth (brownfield) before authoring increments —
   prevents plans that are structured around the design's abstractions rather
   than the codebase's actual organization.
2. Plans tests before increments — test strategy and regression coverage drive
   increment sequencing and the AI Gate phrasing.
3. Decomposes the design into INC-XXX units with explicit dependencies — gets
   user approval on the increment list and dependency graph before writing
   per-increment detail.
4. Writes each increment by composing the 8 planning blocks via
   `templates/compositions/greenfield-implementation-package.yaml`.
5. Generates support documents (`implementation-package.md`,
   `increment-status.md`, `bugs-and-issues-log.md`, `change-tracker.md`).
6. Runs plan-readiness review as the final GO/NO-GO gate before handoff.

## Sequential execution rule

**Execute one step at a time.** Read each step file (under `steps/`) only
when you are about to execute that step. After each step:

1. Produce the artifact in full.
2. Present it to the user.
3. Wait for acknowledgement before reading the next step file.

## Step sequence

```
┌──────────────────────────────────────────────────────────────────────┐
│ 1. CODEBASE ANALYSIS (brownfield only)        steps/codebase-       │
│    File/module map, conventions,              analysis.md            │
│    integration strategy                                              │
│           │                                                          │
│           ▼                                                          │
│ 2. TEST PLANNING                              steps/test-planning.md │
│    Test strategy, regression coverage,                               │
│    test modifications                                                │
│           │                                                          │
│           ▼                                                          │
│ 3. INCREMENT DECOMPOSITION                    (in SKILL.md workflow)│
│    Propose INC-XXX list + dependency graph,                          │
│    get user approval                                                 │
│           │                                                          │
│           ▼                                                          │
│ 4. WRITE EACH INCREMENT                       templates/blocks/      │
│    Compose 8 blocks per                       planning/*.md +        │
│    Canonical Increment Shape                  greenfield-imple-      │
│                                               mentation-             │
│                                               package.yaml           │
│           │                                                          │
│           ▼                                                          │
│ 5. SUPPORT DOCUMENTS                          (in SKILL.md workflow)│
│    implementation-package.md,                                        │
│    increment-status.md,                                              │
│    bugs-and-issues-log.md, change-tracker.md                         │
│           │                                                          │
│           ▼                                                          │
│ 6. PLAN-READINESS REVIEW                      steps/plan-readiness-  │
│    Self-check before handoff to               review.md              │
│    review-implementation-package                                     │
└──────────────────────────────────────────────────────────────────────┘
```

## Why this order

- **Codebase analysis first (brownfield).** Plans must be structured around
  the codebase's actual organization, not the design's abstractions. Without
  this step, INC plans reference files that don't exist or use patterns the
  codebase doesn't follow.
- **Test planning before decomposition.** Tests that break due to intentional
  changes must be paired with the increments that cause them. Test strategy
  defines AI Gate phrasing.
- **Decomposition before per-increment writing.** Get user approval on the
  list and dependency graph before investing in per-increment detail. Reduces
  rework when an increment boundary is wrong.
- **Plan-readiness last.** The final gate verifies coverage, naming
  consistency, missing verification, and shape conformance before handoff.

## What this skill does NOT do

- Does not write production code (that is `execute-increments`).
- Does not create the design (that is `create-design-package`).
- Does not run the formal pre-execution review (that is
  `review-implementation-package`).

## Failure modes this sequence prevents

| Failure mode | Prevented by |
|---|---|
| Increments structured around design abstractions, not codebase reality | Step 1 (codebase analysis) before increment authoring |
| AI Gate phrasing too vague to verify | Step 2 (test planning) drives Gate language |
| Reworking dependency graphs after per-increment detail is written | Step 3 (decomposition + approval) before Step 4 |
| Increments duplicate the shape spec instead of composing blocks | Step 4 uses the composition |
| Support docs forgotten | Step 5 explicit in workflow |
| Package handed off with FR coverage gaps | Step 6 plan-readiness review |

## Handoff

After plan-readiness review returns GO and all artifacts are in
`{project.paths.implementation_package}/{feature-id}/`, hand off to
`review-implementation-package` for the formal pre-execution gate.
