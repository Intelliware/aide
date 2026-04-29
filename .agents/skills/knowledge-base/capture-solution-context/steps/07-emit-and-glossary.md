---
slug: emit-and-glossary
sequence: 7
depends-on-prior: true
---

# Step 7 — Emit & glossary delta

## Goal

Run the validation gate against every leaf produced in Steps 02–06,
then merge the discovery's new domain terms into `<KB>/glossary.md`
without disturbing existing entries.

## Inputs

- All six (or refresh-subset) solution-context leaves from Steps 02–06.
- Existing `<KB>/glossary.md`.
- Domain terms surfaced in elicitation conversations (held in the in-
  memory plan).

## Procedure

1. **Run validation gate** (per `references/INPUTS-OUTPUTS.md`
   validation table):
   - Required leaves present.
   - Each leaf's frontmatter `description` starts with `Use when `.
   - Each leaf's `solution_context_id` is unique within
     `<KB>/shared/solution-context/`.
   - `last_captured` is ISO-8601.
   - Every `related_components` entry resolves to a real `component_id`
     in `graph.json`.
   - In non-interactive mode: every TODO marker carries the discovery
     question as a comment.
   - Every "none" sentinel is dated and attributed.
2. **Compute glossary delta.** Walk the in-memory plan's collected
   terms (persona labels, KPI names, vendor categories, regulatory
   acronyms). For each term:
   - If already in `<KB>/glossary.md`, skip.
   - Else add to delta list with a one-sentence definition.
3. **Append delta to `<KB>/glossary.md`.** Use a date marker:
   ```
   <!-- solution-context delta — captured on <ISO-8601 date> by <user_id> -->
   - **<Term>** — <definition>
   ```
   Existing entries are preserved verbatim. Do NOT re-order existing
   entries.
4. **Stamp `<KB>/change-tracker.md`** with one row:
   - timestamp, user_id, action = "solution-context-captured",
     leaves-touched, glossary-additions count.
5. **Print summary.** Hand-off message to caller listing leaves
   written, glossary terms added, and (interactive only) any
   deferred TODOs the user committed to come back to.

## Acceptance

- Validation gate passes.
- Glossary delta appended without disturbing existing entries.
- `change-tracker.md` row written.
- Summary printed.

## Outputs

- All six (or refresh-subset) leaves under
  `<KB>/shared/solution-context/`.
- Updated `<KB>/glossary.md` (delta appended).
- Updated `<KB>/change-tracker.md` (one new row).

## Hand-off

Caller routes to `generate-ai-rules` (typical next skill in the
solution-context bootstrap sequence). The skill is idempotent —
re-running it overwrites only the leaves currently in the target set.
