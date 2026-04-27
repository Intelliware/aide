<!-- validate: allow-phase-vocab -->

# create-implementation-package — Overview

## Purpose

This skill decomposes an approved Solution Design Package into a sequence of
**increments** (INC-XXX), each conforming to the **Canonical Increment Shape** —
an 8-section structure that guarantees every increment is independently
executable, traceable to functional requirements, and gated by both automated
checks (AI gate) and human review (human gate). The output is an implementation
package that an execution-stage skill or human developer can pick up unit by
unit.

The Canonical Increment Shape is the load-bearing artifact of the planning
stage and is single-sourced as 8 reusable blocks under
`templates/blocks/planning/`. This skill never inlines the shape spec; it
references the blocks via the composition at
`templates/compositions/greenfield-implementation-package.yaml`. The renaming
from the legacy "Canonical Phase Shape" / `PHASE-XXX` vocabulary to
"Canonical Increment Shape" / `INC-XXX` is part of the unification — the word
"phase" is reserved for SDLC stages (planning phase, execution phase) and for
operational contexts (deployment phase), never for the chunk-level unit of work.

## When to use

- A Solution Design Package exists and has been approved by the design review
- A Requirements Package exists with stable FR identifiers
- The intended next step is implementation by AI agents or human developers
- The user invokes language matching the trigger conditions in the SKILL
  description

## When NOT to use

- The design has not been reviewed and approved yet — run the design stage first
- The work is a one-off small change — use `quick-dev/plan-quick-change`
- The user wants to validate an already-written implementation package — use
  `review-implementation-package`
- The user wants to execute an existing increment — use `execute-increments`

## Position in workflow

```
requirements/create-requirements-package
    └─► requirements/review-requirements-package  (GO)
        └─► design/create-design-package
            └─► design/review-design-package      (GO)
                └─► planning/create-implementation-package   ◄── this skill
                    └─► planning/review-implementation-package  (GO)
                        └─► execution/execute-increments
                            └─► execution/manage-bugs (independently invocable)
                            └─► execution/create-pr   (closing handoff)
```

The skill consumes the approved design and requirements packages; it produces
an implementation package whose individual increment files conform to the
Canonical Increment Shape. The handoff is to `review-implementation-package`,
which is the pre-execution gate.
