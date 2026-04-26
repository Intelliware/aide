---
slug: append-change-tracker
sequence: 3
depends-on-prior: true
---

# Step 3 — Append change-tracker row

## Goal

Append exactly one row to `<knowledge_base_path>/change-tracker.md`
documenting this feature's KB impact. Non-optional in both modes.

## Inputs

- Update context from step 2 (affected list, new components, merge SHAs,
  feature ID, actor).
- `<knowledge_base_path>/change-tracker.md` (existing file from
  build-knowledge-base step 2).

## Procedure

1. **Read** `change-tracker.md`. Confirm the table header is present:

   ```
   | Date | Feature ID | Components Touched | Summary | Author |
   ```

   If missing (legacy KB), insert it before appending.

2. **Compose the row:**

   - **Date:** today, ISO format (YYYY-MM-DD).
   - **Feature ID:** the supplied `feature_id`. Hyperlink to ticket if
     `--feature-link` was provided.
   - **Components Touched:** comma-separated component IDs from the
     affected set. New components annotated with `(new)` after the ID.
     If the set is empty (zero-match path), write `(none — see drift
     report)`.
   - **Summary:** one sentence distilled from the increment goal(s) plus
     a parenthetical for any architectural signals (new external dep,
     new auth model, etc.). Length: ≤200 chars.
   - **Author:** `actor` (from `framework.user.toml` `[user] name`,
     or the override in `--actor`). When the actor is an email,
     append the actor; when a name, prefer the name.

3. **Append** the row to the table. Preserve existing rows.

4. **Sort sanity.** Rows are appended chronologically; do not re-sort.

5. **Refusal modes:**
   - If `feature_id` is empty, REFUSE the entire update — even ad-hoc
     changes must carry an ID. This was already enforced in step 1; this
     is the fail-safe.
   - If a row with this exact `feature_id` already exists, append a
     second row anyway (a feature can ship in multiple chunks; that's
     fine to record).

## Acceptance

- Exactly one new row exists at the bottom of the table.
- All columns are populated.
- File still parses as Markdown (table renders correctly).

## Hand-off

`steps/04-emit-adr-if-threshold.md` (skipped in `catalog-only` mode →
goes straight to `steps/07-validate.md`).
