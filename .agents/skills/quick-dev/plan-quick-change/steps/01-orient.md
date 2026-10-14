---
slug: orient
sequence: 1
depends-on-prior: false
---

# Step 1 — Codebase orientation

Lightweight, scoped read of the codebase areas affected by the change. Not a
full audit — only the files referenced in the spec's "Where" section or
implied by the FRs.

## What to read

| Read | Purpose |
|---|---|
| Each source file the spec lists | Identify patterns, naming, error handling, state management, imports |
| The corresponding test files | Note framework, naming convention, mocking approach, file location |
| Any `project-context.md` from a prior elaborate flow | Reuse instead of regenerating |
| Build / config files only as needed for tech versions | Filter applicable coding standards |

## What to capture

| Field | Why |
|---|---|
| Technology versions | Decide which framework/language standards apply |
| Patterns observed in the affected files | New code should look like it belongs |
| Test infrastructure (framework, naming, file path conventions) | Plan can prescribe matching test files |
| Standards-compliance snapshot | Existing deviations are not precedent — standards win |
| Affected file inventory | Confirms or extends the spec's "Where" list |

## How long

Aim for under 15 minutes of reading. If orientation is taking longer, that
is itself a signal — invoke the escape hatch (`steps/02-escape-hatch.md`).

## Output

A short orientation summary, presented inline. For audit and session-resumption
purposes, optionally persist to
`{paths.implementation_package}/<feature-id>/codebase-orientation.md` — beside the plan,
in the planning-stage directory.
