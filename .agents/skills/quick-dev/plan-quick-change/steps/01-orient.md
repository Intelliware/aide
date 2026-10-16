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
| KB components from `navigate-knowledge-base` (when `project.paths.knowledge_base_path` is set) | Confirms which components own the change and who calls them; a hit outside the spec's "Where" list is worth raising with the user |
| Each source file the spec lists | Identify patterns, naming, error handling, state management, imports |
| The corresponding test files | Note framework, naming convention, mocking approach, file location |
| Any `project-context.md` from a prior elaborate flow | Reuse instead of regenerating |
| Build / config files only as needed for tech versions | Filter applicable coding standards |

Query the KB before opening source files. Pass the spec's "Where" file paths as
`--from-paths`, or the spec's change summary as the feature description when it
names no files. Read only the frontmatter and § 3 Change-Impact Summary of the
returned components — quick-dev needs ownership and blast radius, not a full
component read.

The KB lookup is context only: it never limits which files the plan may change,
and it never triggers the escape hatch on its own. If more than two `one-hop`
components look like they need changes, tell the user which ones and why, and ask
whether to stay in quick-dev or switch to the full pipeline. Record the answer
in the orientation summary. The escape hatch's own conditions
(`steps/02-escape-hatch.md`) still apply, judged from the code you read. If the
navigator errors or returns nothing, note it and orient from the spec's files
alone. No KB configured → skip this row.

## What to capture

| Field | Why |
|---|---|
| Technology versions | Decide which framework/language standards apply |
| Patterns observed in the affected files | New code should look like it belongs |
| Test infrastructure (framework, naming, file path conventions) | Plan can prescribe matching test files |
| Standards-compliance snapshot | Existing deviations are not precedent — standards win |
| Affected file inventory | Confirms or extends the spec's "Where" list |
| KB components in scope (IDs + tier) | Grounds the plan's file paths; feeds the catalog-only KB update after execution |

## How long

Aim for under 15 minutes of reading. If orientation is taking longer, that
is itself a signal — invoke the escape hatch (`steps/02-escape-hatch.md`).

## Output

A short orientation summary, presented inline. For audit and session-resumption
purposes, optionally persist to
`{paths.implementation_package}/<feature-id>/codebase-orientation.md` — beside the plan,
in the planning-stage directory.
