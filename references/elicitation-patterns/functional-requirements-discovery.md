# Elicitation pattern: Functional requirements discovery

## Purpose

Drives the "what does the system do" pass: capability areas, the features
under each area, the detailed behaviors under each feature, and the
acceptance criteria that anchor each detail. Invoked from
`create-requirements-package` step 01-discovery and step 04-writing to
populate `requirements/functional-requirements` and
`requirements/functional-specifications` with FR IDs that follow the
`FR[Area].[Feature].[Detail]` numbering scheme.

## Inputs needed from user

- Capability areas (top-level groupings; e.g. `Order Intake`, `Order Resolution`, `Reporting`)
- Per-area feature list
- Per-feature detailed behaviors / requirements (the FRs themselves)
- Acceptance criteria per FR (Given / When / Then or equivalent)
- Priority per FR (must / should / could / won't — MoSCoW)
- Source/origin of each FR (which stakeholder, which document, which research note)

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

1. **Loop: name each capability area in one or two words.** (top-level grouping; add until `done`)
   - **Format:** structured-list of area names
   - **Validation:** each name is unique within the project; <=40 chars
   - **Maps to:** `requirements.functional.areas[].name`

2. **For each area, loop the features:** "What is feature N under <area>?" (one feature per loop iteration)
   - **Format:** free-text feature title + 1-sentence description
   - **Validation:** title is unique within the area
   - **Maps to:** `requirements.functional.areas[].features[]`

3. **For each feature, loop the detailed FRs:** "List the next behavior the system must perform for <feature>."
   - **Format:** free-text imperative ("The system SHALL ...") + optional rationale
   - **Validation:** SHALL/MUST/SHOULD modal verb required; flag passive-voice as warning
   - **Maps to:** `requirements.functional.areas[].features[].details[]`

4. **For each detail, prompt for acceptance criteria.** (at least one Given/When/Then per detail)
   - **Format:** structured-list of `{given, when, then}` triples
   - **Validation:** at least one triple per detail; each part non-empty
   - **Maps to:** `requirements.acceptance_criteria[]` (linked back by `fr_id`)

5. **For each detail, set priority.**
   - **Format:** multiple-choice
   - **Options:** `must` (release-blocking) / `should` (release-blocking unless renegotiated) / `could` (nice-to-have) / `wont` (out for this release)
   - **Maps to:** `requirements.functional....details[].priority`

6. **Where did each FR originate?** (sponsor request, persona research, support ticket, regulatory mandate, prior incident — auto-fill where the source is unambiguous)
   - **Format:** free-text or multiple-choice from `sponsor` / `persona-research` / `support-ticket` / `regulation` / `incident` / `other`
   - **Maps to:** `requirements.functional....details[].source`

**Wrap-up:** Confirm the answers in summary form before proceeding. Echo the area / feature / detail tree with FR IDs assigned (`FR<Area>.<Feature>.<Detail>`), then confirm priority and source for each before writing the functional-requirements and functional-specifications blocks.

## Output format

Answers feed `requirements/functional-requirements` and `requirements/functional-specifications`. FR IDs follow `FR<area-number>.<feature-number>.<detail-number>` (e.g. `FR1.2.3`).

```toml
[[requirements.functional.areas]]
id = 1
name = "Order Intake"

[[requirements.functional.areas.features]]
id = 1
name = "Manual entry"
description = "Operators key in orders received by phone."

[[requirements.functional.areas.features.details]]
id = 1
fr_id = "FR1.1.1"
text = "The system SHALL validate the customer ID against the customer master before accepting the order."
priority = "must"
source = "sponsor"

# Acceptance criteria recorded separately and linked by fr_id
```

## Validation rules

- Every detail must have a SHALL / MUST / SHOULD modal verb.
- Every detail must have at least one Given/When/Then acceptance criterion.
- FR IDs are auto-assigned; the user does not pick them. Numbering is monotone within each parent.
- Priority must be one of the four MoSCoW values.
- Each detail must have a non-empty `source` (record `[NEEDS CLARIFICATION]` if unknown).
- Area names and feature names are unique within their parent scope.

## Reusable across

- `create-requirements-package` (step 01-discovery; step 04-writing)
- `greenfield-requirements-package` composition (declared as required elicitation)
