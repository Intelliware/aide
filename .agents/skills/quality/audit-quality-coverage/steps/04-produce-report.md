---
slug: produce-report
sequence: 4
depends-on-prior: true
---

# Step 4 — Produce Report

## Purpose

Render the coverage report in chat per the canonical format defined in
`references/coverage-report-format.md`, and append a single
`Coverage audit` row to the quality package's `change-tracker.md`.

## Procedure

### 4a. Render the three tables

Render to chat, in this order:

1. **Header** — feature ID, generation timestamp, INC count, quality
   package version, KB-check status (enabled / skipped — reason).
2. **Summary table** — counts by verdict (`✅`, `🔄`, `⚠️ ready`,
   `🔴 blocked`, `⚠️ Drift`, `➖ N/A`).
3. **Coverage detail table** — one row per INC with: INC, Name, Test
   level, Dev status, Coverage claimed, TC(s), TC status, Markers
   verified, Verdict. Omit the TC columns when the team does not use
   the TC-XXX flow. Replace the Markers column with `KB skipped` for
   every row when Step 3 was skipped.
4. **Gaps table** — one row per non-passing INC with: INC, Name,
   Issue, Recommended action. Every recommended action must name a
   specific framework skill (see Step 5 for the action-mapping
   table).

Apply any team customisations from
`config/customizations/audit-quality-coverage.toml` (status vocabulary,
emoji set, summary-table extra columns).

### 4b. Render the trailer

```
Summary: <N> gaps requiring action across <M> categories.
Audit recorded in: {paths.quality_package}/<feature-id>/quality/change-tracker.md (Trigger: Coverage audit)
```

### 4c. Lightweight / CI variants

- **Lightweight mode** (when invoked from quick-dev against a single
  INC): drop the coverage-detail table; emit only the summary + gaps
  tables.
- **CI-friendly mode** (when
  `config/customizations/audit-quality-coverage.toml`
  `report.emit_json = true`): render the same content as JSON
  alongside the markdown, structured as
  `{ summary: {...}, detail: [...], gaps: [...] }` so a CI gate can
  parse it.

Both variants are off by default.

### 4d. Append the change-tracker row

Append one row to
`{paths.quality_package}/<feature-id>/quality/change-tracker.md`:

| Field | Value |
|---|---|
| Date | <YYYY-MM-DD> |
| Change Type | `Audit` |
| Parts Affected | `Quality Package` |
| Section / File | `quality/traceability.md` + `quality/plan/test-case-status.md` (when present) |
| Description | `Coverage audit: <N> total INCs — <A> ✅, <B> 🔄, <C> ⚠️ ready, <D> 🔴 blocked, <E> ⚠️ drift, <F> ➖ n/a` |
| Source Version | (the implementation package version audited) |
| Verified | `partial` if Step 3 was skipped; `yes` otherwise |
| Trigger note | `Coverage audit` |

This row is the audit trail. `review-quality-package` reads it on a
re-review to surface drift findings.

If a tracker bootstrap was performed in Step 1, append a second row
with Change Type = `Addition`, Parts Affected = `Status Tracker`,
Trigger note = `Bootstrap by audit-quality-coverage`.

### 4e. Hand off the report to the user

Present the rendered tables and trailer to the user. Wait for them to
acknowledge before proceeding to Step 5 (next actions). If the user
asks to drill into a specific row, oblige — re-read the underlying
artifacts and answer; do not invent.

## Next

Proceed to `steps/05-next-actions.md`.

