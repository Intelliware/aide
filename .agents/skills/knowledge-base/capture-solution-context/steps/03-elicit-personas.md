---
slug: elicit-personas
sequence: 3
depends-on-prior: true
---

# Step 3 — Elicit personas & use cases

## Goal

Produce `<KB>/shared/solution-context/10-personas-and-use-cases.md`
capturing each user/operator persona and their jobs-to-be-done, with
links to existing components when those jobs map to catalogued
capabilities.

## Inputs

- ARCHITECTURE.md § 4 Capability Index (cheap read; used for component
  linking suggestions).
- `<KB>/components/<repo>/<id>.md` frontmatter `triggers` (read via
  grep, not full file reads).
- Elicitation pattern: `references/elicitation-patterns/personas.md`
  (NEW — created by this skill's authoring task; if missing, fall back
  to `references/elicitation-patterns/stakeholder-discovery.md`).

## Procedure

1. **Open elicitation conversation** (interactive mode). For each
   persona discovered, capture:
   - Role / segment label (e.g. "Merchant Engineer")
   - Sketch (2–3 sentences: who, context, what they care about)
   - 2–4 jobs-to-be-done (in the form: "When <situation>, I want to
     <motivation>, so I can <outcome>")
   - Pains and gains (optional)
2. **Match each job-to-be-done to components.** For each job:
   - Tokenize the job statement.
   - Grep `triggers:` lists in `<KB>/components/**/*.md` for keyword
     overlap.
   - If ≥ 1 match, suggest `related_components` for that job and ask
     the user to confirm.
   - If 0 matches, leave `related_components` empty and add a
     `TODO(catalog):` note suggesting the job may need a new component
     (or a feature still unbuilt).
3. **Draft `10-personas-and-use-cases.md`** with structure:
   - Frontmatter
   - § 1 Persona Catalog (table: label, segment, primary outcome)
   - § 2 Per-Persona Sections (one `## <persona label>` per persona,
     each with sketch + jobs-to-be-done table)
   - § 3 Jobs-to-Component Map (consolidated table linking
     job-statement → component_id list)
4. **Present and confirm** (interactive); save.
5. **Non-interactive fallback:** if RE Part B "consumer" docs exist for
   any repo, extract the implied audience (e.g. "embedders",
   "merchants", "internal staff") as a stub persona with TODO markers
   for jobs-to-be-done.

## Frontmatter

```yaml
---
solution_context_id: 10-personas-and-use-cases
description: >-
  Use when scoping work for a specific user segment, mapping a job-to-
  be-done to existing components, or framing a feature in terms of
  who it serves.
triggers:
  - personas
  - users
  - user segment
  - jobs to be done
  - use cases
  - who uses
last_captured: <ISO-8601 date>
last_captured_by: <user_id>
related_components:
  - <derived from § 3 mapping; deduped>
---
```

## Acceptance

- File exists.
- ≥ 1 persona section present (or TODO stub in non-interactive mode).
- § 3 Jobs-to-Component Map exists, even if rows are TODO.
- Every `related_components` entry resolves to a real `component_id`.

## Outputs

- `<KB>/shared/solution-context/10-personas-and-use-cases.md`.

## Hand-off

`steps/04-elicit-goals-kpis.md`.
