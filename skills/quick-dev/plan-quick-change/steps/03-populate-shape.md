---
slug: populate-shape
sequence: 3
depends-on-prior: true
---

# Step 3 — Populate the reduced increment shape

For each increment, fill the reduced increment shape. The reduced shape keeps
the fields that matter for execution discipline and inlines the elaborate
`Dependencies` and `Outcome` sections.

## The reduced shape

| Section | Content |
|---|---|
| **Identity** | `INC-XXX` id, name, AC mapping (e.g. `AC1, AC2, AC3`) |
| **Goal** | The system state after the increment is done — not the effort. Inlines what the elaborate shape splits across "Goal" and "Outcome". |
| **Plan** | Imperative, specific, executable steps. Each step names the files it creates or modifies. Inlines what elaborate-shape "Dependencies" would have put in a separate section. |
| **AI Gate** | Test commands and expected results. The agent runs these and they pass before claiming completion. |
| **Human Gate** | Review steps that need human judgment (visual check, UX feel, integration smell). |
| **Success Criteria** | Binary pass/fail checklist. One line per AC the increment covers. |

## Sizing rules

- Each increment produces a working system state — the system is shippable
  after each increment, even if the feature is not yet whole.
- Each increment is independently verifiable — its AI Gate passes without
  requiring the next increment to land first.
- Aim for 1 increment when the change is small. 2–3 increments when there
  are natural cut-points (e.g. backend then frontend; foundation then feature).
- More than 3 increments is a signal — apply the escape hatch.

## Inline what was elaborate

| Elaborate section | Reduced-shape home |
|---|---|
| Dependencies | Inlined in Plan when relevant; omitted when there are none |
| Outcome | Inlined in Goal — Goal already describes the resulting system state |

## AC traceability

Every increment must trace to at least one AC from the spec. The mapping is
listed in Identity. No speculative increments — if an increment does not
trace to an AC, either delete it or amend the spec.

## Forbidden patterns

- Vague goals ("improve notifications")
- Non-binary success criteria ("button works well")
- AI Gate without commands or expected outputs
- Plan steps without file paths
- Increments without AC mapping
