<!-- validate: allow-phase-vocab -->

# Planning Blocks — Canonical Increment Shape

These eight blocks together form the **Canonical Increment Shape** — the standardized structure that every increment in a forward-engineering implementation plan must contain. Each block holds the format spec, rules, and examples for one section of the shape.

## The Eight Mandatory Blocks (in order)

| # | Slug | Section |
|---|------|---------|
| 1 | `increment-identity` | Increment Identity (ID, Name, FR Mapping) |
| 2 | `goal` | Goal — single sentence describing system state after the increment |
| 3 | `dependencies` | Dependencies — INC IDs that must complete first |
| 4 | `plan` | Plan — imperative steps to execute |
| 5 | `outcome` | Outcome — measurable deliverables |
| 6 | `automated-verification` | Automated Verification (AI Gate) — executable tests with expected results |
| 7 | `human-verification` | Human Verification (Human Gate) — review steps requiring human judgment |
| 8 | `success-criteria` | Success Criteria — binary completion checklist |

## How to Use

Compositions for `greenfield-implementation-package` include all eight blocks per increment, in this order. Increments are repeated as a unit; the eight blocks describe the shape of one increment.

## What This Shape Guarantees

- **Clarity** — every increment is independently executable
- **Traceability** — Functional Requirements (FRs) are explicitly mapped
- **Verifiability** — clear AI and human gates for completion
- **Consistency** — uniform structure across all increments

## When to Use

Use this shape when:

- Creating a new incremental implementation plan
- Refactoring an existing implementation plan into increments
- Reviewing increment completeness
- Onboarding new team members to a project

## Validation Checklist

Before marking an increment plan complete, confirm:

- Every increment has all 8 sections, in order
- FR mappings are explicit (or `None (foundational)`)
- Goals describe system state, not effort
- Plans are instructions, not explanations
- Outcomes are measurable
- Verification gates are executable
- Success criteria are binary

## Source

These blocks were authored by decomposing `implementation-planning/phases/canonical-phase-shape.md` (the legacy "Canonical Phase Shape" document). Terminology was updated as part of the unification: `PHASE-XXX` → `INC-XXX`, "phase" → "increment", and "Canonical Phase Shape" → "Canonical Increment Shape".
