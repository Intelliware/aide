<!-- validate: allow-phase-vocab -->

# Canonical Increment Shape — Skill Reference

> **Cross-cutting source of truth.** The framework-level specification of
> the Canonical Increment Shape lives at
> `references/canonical-shapes/canonical-increment-shape.md` and is also
> consumed by `skills/design/`. The content below is the same document
> kept here for skill-local convenience; if the two ever diverge, the
> cross-cutting copy under `references/canonical-shapes/` wins.

The Canonical Increment Shape is the standardized 8-section structure every
increment in an implementation package must conform to. It guarantees:

- **Clarity** — every increment is independently executable
- **Traceability** — Functional Requirements (FRs) are explicitly mapped
- **Verifiability** — both AI and human gates are present and well-defined
- **Consistency** — uniform structure across increments and projects

## Single source of truth

This skill **does not inline the shape spec**. The 8 sections are extracted as
8 reusable blocks under `templates/blocks/planning/`, and assembled via the
composition `templates/compositions/greenfield-implementation-package.yaml`.

| # | Section | Block file |
|---|---|---|
| 1 | Increment Identity | `templates/blocks/planning/increment-identity.md` |
| 2 | Goal | `templates/blocks/planning/goal.md` |
| 3 | Dependencies | `templates/blocks/planning/dependencies.md` |
| 4 | Plan | `templates/blocks/planning/plan.md` |
| 5 | Outcome | `templates/blocks/planning/outcome.md` |
| 6 | Automated Verification (AI Gate) | `templates/blocks/planning/automated-verification.md` |
| 7 | Human Verification (Human Gate) | `templates/blocks/planning/human-verification.md` |
| 8 | Success Criteria | `templates/blocks/planning/success-criteria.md` |

To author or edit the shape itself, edit the relevant block file. To assemble
an increment file, use the composition. Never duplicate the spec into the
increment files.

## Terminology lineage

This shape is the renamed, unified successor to the legacy "Canonical Phase
Shape" (`PHASE-XXX`). The migration:

| Legacy term | Unified term |
|---|---|
| Canonical Phase Shape | Canonical Increment Shape |
| `PHASE-XXX` / `PHASE-XXX.Y` | `INC-XXX` / `INC-XXX.Y` |
| Phase Identity | Increment Identity |
| `phase-status.md` | `increment-status.md` |
| Phase Decomposition | Increment Decomposition |
| "phase" (chunk-level) | "increment" |

The word "phase" is reserved for SDLC stages (planning phase, execution phase)
and for operational contexts (deployment phase, rollout phase).

## Validation checklist

Before marking an implementation package ready for review, confirm for every
increment file:

- [ ] All 8 sections present in order
- [ ] FR mapping is explicit (or `FR Mapping: None (foundational)`)
- [ ] Goal describes **system state** (present tense), not effort
- [ ] Dependencies list INC IDs (or state `None`)
- [ ] Plan items are imperative instructions, not narratives
- [ ] Outcome items are measurable deliverables
- [ ] AI Gate has specific verification steps with expected results
- [ ] Human Gate has 2-4 judgment-requiring review items
- [ ] Success Criteria are 4-8 binary checkboxes

## Per-section rules — quick reference

These are intentionally brief. The authoritative rules live in the block files
under `templates/blocks/planning/`.

### 1. Increment Identity
- Sequential unique ID: `INC-XXX` or `INC-XXX.Y`
- Descriptive name
- FR Mapping mandatory (or `None (foundational)`)
- FRs appear verbatim — never invent, edit, merge, or split

### 2. Goal
- Single sentence describing system state after the increment completes
- Present tense ("The system can…", "X exists…")
- No implementation details (those go in Plan)

### 3. Dependencies
- List INC IDs that must complete before this increment can start
- `None` if no dependencies

### 4. Plan
- Numbered imperative steps
- Each step starts with an action verb
- Specific enough for blind execution

### 5. Outcome
- Bullet list of measurable deliverables
- Each item is independently verifiable

### 6. Automated Verification (AI Gate)
- Specific test commands or assertions
- Include expected results
- Executable by CI or an automated runner

### 7. Human Verification (Human Gate)
- 2–4 review items requiring human judgment
- Focus on intent alignment, not mechanics

### 8. Success Criteria
- 4–8 binary checkboxes
- Each independently verifiable
- All must be checked for the increment to be considered done

## Common mistakes

- Writing the Goal as effort ("Implement authentication") instead of state ("The system can authenticate users")
- Letting the AI Gate be vague ("tests pass") instead of specific commands with expected results
- Merging two unrelated concerns into one increment because they sit in the same module
- Repeating the shape spec inside each increment instead of referencing the blocks
- Using "phase" terminology in section headings or IDs (use "increment" / `INC-XXX`)
