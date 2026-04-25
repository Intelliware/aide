---
slug: compose-report
sequence: 5
depends-on-prior: true
---

# Step 5 — Compose drift report

## Goal

Aggregate L1–L4 results, write the JSON and Markdown reports, and
compute the gate decision (gate mode only).

## Inputs

- L1 result from step 1.
- L2 result from step 2.
- L3 result from step 3 (full mode).
- L4 result from step 4 (full mode).
- `--mode`, `--severity-threshold`.

## Procedure

### 5a — Merge rows

For each component, collect all rows from L1, L2, L3 keyed by component.
The row's final severity is `max(L1, L2, L3)` for that component
(`max` per the order `low < medium < high`).

For L4:
- L4-orphan rows are not keyed to a component_id (orphans, by definition,
  have none); they get a synthetic identifier (`<repo>:<artifact-id>`).
- L4-stale rows are keyed to their component_id and merged with any L1
  rows for that component if present.

### 5b — Per-row recommended action

| Row pattern | Recommended action |
|---|---|
| L1 only (no L2/L3 hit) | "L1 stamp old; consider running `update-knowledge-base --feature-id=<id>` to refresh stamp." |
| L2 hit (any severity) | "Run `update-knowledge-base --scope=full --feature-id=<id>` and feed the merged diff." |
| L3 contradicts | "Run `update-knowledge-base --scope=full` to re-derive the component's body and triggers." |
| L4-orphan | "Author a new component or extend existing component's `paths:`. Run `verify-knowledge-base-coverage --mode=delta`." |
| L4-stale | "Either delete the component or update `paths:`. Likely a code reorganisation happened; run `update-knowledge-base` with the responsible feature." |
| Severity high — overall drift > 50% of components | "Run `build-knowledge-base --overwrite` followed by `verify-knowledge-base-coverage --mode=baseline`." |

### 5c — Compose JSON report

Write to `<knowledge_base_path>/.drift-reports/<ISO-timestamp>.json`
following the shape in `references/INPUTS-OUTPUTS.md` § "JSON report shape".

Computed fields:

- `summary.total_components_scanned`: total component file count.
- `summary.l1_suspects`: count of L1 rows.
- `summary.l2_hits`: count of L2 rows with severity ≥ medium.
- `summary.l3_hits`: count of L3 rows with verdict ≠ holds.
- `summary.l4_orphans` / `l4_stales`: respective counts.
- `summary.by_severity`: histogram of final per-component severities.

### 5d — Compose Markdown report

Write to `<knowledge_base_path>/.drift-reports/<ISO-timestamp>.md`:

```markdown
# Drift Report — <ISO timestamp>

**Mode:** <gate | full>
**Repo HEADs:** <comma-separated repo:sha>
**Total components:** <N>
**Gate decision:** <pass | fail | n/a (full mode)>
**Gate reason:** <one sentence>

## Findings

| Component ID | Layer | Severity | Evidence | Recommended action |
|---|---|---|---|---|
<rows sorted by severity DESC then component_id ASC>

## Summary

- L1 suspects: <n>
- L2 hits: <n>
- L3 contradictions: <n>
- L4 orphans: <n>
- L4 stales: <n>

## Next steps

<Bullet list — one bullet per recommended action that appears in any
row, deduped.>
```

### 5e — Gate decision (gate mode)

- Pass if no row has severity ≥ `--severity-threshold` (default
  `medium`).
- Fail otherwise.
- Print the decision line to stdout. Exit 1 on fail, 0 on pass.

In full mode, no decision is computed; the skill always exits 0.

## Acceptance

- JSON and Markdown reports written and parseable.
- Gate decision printed (gate mode).
- Exit code matches the decision (gate mode) or is 0 (full mode).

## Output

Returns the report paths to the caller. Caller may surface the Markdown
report in CI logs / Slack / GitHub PR comment as appropriate.

## Hand-off

None — terminal step. Caller acts on the report by invoking
`update-knowledge-base` or `verify-knowledge-base-coverage` as
recommended.
