<!-- validate: allow-phase-vocab -->

# Canonical Increment Shape — Spec (read-only reference)

This file points the review skill at the authoritative shape spec. The shape
itself lives in `templates/blocks/planning/` (the 8 reusable blocks); do not
duplicate the spec here. This file exists so the review skill has a stable
reference URL inside its `references/` directory.

## The 8 blocks (in order)

| # | Section | Block file | What the block defines |
|---|---|---|---|
| 1 | Increment Identity | `templates/blocks/planning/increment-identity.md` | INC-XXX format, FR Mapping rules |
| 2 | Goal | `templates/blocks/planning/goal.md` | System-state phrasing rules |
| 3 | Dependencies | `templates/blocks/planning/dependencies.md` | INC ID listing, "None" allowed |
| 4 | Plan | `templates/blocks/planning/plan.md` | Imperative-step format |
| 5 | Outcome | `templates/blocks/planning/outcome.md` | Measurable deliverable rules |
| 6 | Automated Verification (AI Gate) | `templates/blocks/planning/automated-verification.md` | Specific tests + expected results |
| 7 | Human Verification (Human Gate) | `templates/blocks/planning/human-verification.md` | 2-4 judgment items |
| 8 | Success Criteria | `templates/blocks/planning/success-criteria.md` | 4-8 binary checkboxes |

## Composition

Increments are assembled from these blocks via the composition at
`templates/compositions/greenfield-implementation-package.yaml`, which also
adds the wrapper sections (shared overview, glossary, change-log).

## Terminology

This unified shape replaces the legacy "Canonical Phase Shape":

| Legacy | Unified |
|---|---|
| Canonical Phase Shape | Canonical Increment Shape |
| `PHASE-XXX` | `INC-XXX` |
| Phase Identity | Increment Identity |
| `phase-status.md` | `increment-status.md` |
| Phase Decomposition | Increment Decomposition |

The review skill's Shape Conformance check (Review #1 in
`review-workflow.md`) flags any remaining legacy terminology as a Critical
finding.

## Why this is a reference, not a spec

The spec is single-sourced under `templates/blocks/planning/`. If a block
changes, the change is automatically picked up by this skill's reviews —
nothing in this folder needs editing. Do not copy block contents here; that
defeats single-sourcing and creates drift risk.
