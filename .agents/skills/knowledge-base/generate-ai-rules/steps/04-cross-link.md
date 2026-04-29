---
slug: cross-link
sequence: 4
depends-on-prior: true
---

# Step 4 — Cross-link

## Goal

Wire `project-context.md` into the rest of the KB so downstream skills
discover it through `navigate-knowledge-base` and so its rules stay in
sync with operations and solution-context updates.

## Inputs

- `<KB>/shared/ai-rules/project-context.md` (just written by Step 03).
- `<KB>/shared/solution-context/` leaves (already present).
- `<KB>/shared/operations/` leaves (may not exist yet — `document-
  operations` runs after this skill in the canonical sequence).
- `<KB>/ARCHITECTURE.md` (root index).

## Procedure

1. **Update § 9 of `project-context.md`** with these forward links,
   even if the target file does not yet exist (use a clearly marked
   "pending" annotation):
   - `<KB>/shared/solution-context/30-constraints-and-compliance.md` —
     "Source of architectural must-nots in § 8."
   - `<KB>/shared/solution-context/00-overview.md` — "Project mission
     this ruleset serves."
   - `<KB>/shared/operations/30-runbooks-and-oncall.md` — "On-call
     impact of incidents that result from rule violations." (annotate
     `pending` if file absent.)
   - `<KB>/shared/adrs/` — "Decision history that supersedes specific
     rules over time."
2. **Verify back-links from solution-context.** Specifically, check
   that `30-constraints-and-compliance.md` § 5 has a comment pointing
   to `project-context.md` § 8 stating the must-nots are duplicated
   there. If not, append a one-line back-link comment (do not modify
   any user-authored content).
3. **Update `<KB>/CLAUDE.md`** (root navigation) with a one-line entry
   under its "Solution-level docs" section pointing to
   `shared/ai-rules/project-context.md`. If that section does not yet
   exist, add it (the patch from Stage 3 to `build-knowledge-base/
   steps/07-emit-claude-md.md` will eventually own this; for now,
   append idempotently).
4. **Re-stamp change-tracker** with the cross-link row (separate from
   Step 03's emit row, so the audit log shows the two phases).

## Acceptance

- § 9 of `project-context.md` lists the four cross-links above. Pending
  links are annotated.
- `30-constraints-and-compliance.md` § 5 has a back-link comment to
  `project-context.md` § 8.
- `<KB>/CLAUDE.md` references `shared/ai-rules/project-context.md`.

## Outputs

- Updated `project-context.md` § 9.
- Possibly updated `30-constraints-and-compliance.md` (back-link only).
- Updated `<KB>/CLAUDE.md`.
- Change-tracker row.

## Hand-off

Caller routes to `document-operations`. Hand-off message:
"AI rules captured (project-context.md @ <line count> lines, <N>
overrides). Next: `document-operations` to capture deployment, SLOs,
and on-call."
