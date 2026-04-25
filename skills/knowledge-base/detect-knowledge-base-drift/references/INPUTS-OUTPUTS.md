# detect-knowledge-base-drift — Inputs & Outputs

## Inputs

| Input | Type | Required | Default | Notes |
|---|---|---|---|---|
| `[[project.repos]]` array | `project.toml` | Yes | — | Each repo's `path` is needed to run git commands. |
| `<knowledge_base_path>/components/` | path | Yes | — | All component frontmatter is read. |
| `<knowledge_base_path>/graph.json` | path | Yes | — | For traversal hints; not strictly required for L1/L2 but speeds up severity propagation. |
| `--mode` | enum | No | `gate` | `gate` runs L1+L2 only; `full` runs L1–L4. |
| `--since` | git ref or ISO date | No | per-component `last_verified_against_commit` | Override the start point of the diff window. Useful for "show me drift since last release tag". |
| `--max-l3-suspects` | int | No | `20` | Cap on L3 (LLM) calls. If >cap suspects exist, sort by severity and call L3 on top-N. |
| `--include-cross-cutting` | bool | No | `true` | Whether `shared/cross-cutting/*.md` pointer pages are checked. They drift slowly; opt-out for speed. |
| `--cache-path` | path | No | `<knowledge_base_path>/.drift-cache.json` | Override the cache location. |
| `--no-cache` | bool | No | `false` | Bypass the L3 cache for this run. |
| `--severity-threshold` | enum | No | `medium` (gate) / `low` (full) | Rows below this severity are dropped from the gate's pass/fail decision but still appear in the report. |

## Outputs

The skill writes a drift report (JSON + Markdown rendering) and returns
its location. It does NOT modify the KB.

### Report location

- `<knowledge_base_path>/.drift-reports/<ISO-timestamp>.json`
  (machine-readable).
- `<knowledge_base_path>/.drift-reports/<ISO-timestamp>.md`
  (human-readable Markdown).

The `.drift-reports/` directory is gitignored.

### JSON report shape

```json
{
  "mode": "full",
  "started_at": "2026-04-25T14:23:00Z",
  "finished_at": "2026-04-25T14:31:42Z",
  "knowledge_base_path": "/path/to/kb",
  "repo_heads": {"api-orders": "8f3c1a2…", "api-billing": "b7e4d9c…"},
  "rows": [
    {
      "component_id": "order-checkout-flow",
      "layer": "L2",
      "severity": "high",
      "evidence": "OpenAPI removed POST /orders/{id}/cancel; component description still claims this endpoint exists.",
      "recommended_action": "update-knowledge-base --feature-id=<the relevant feature>",
      "verified_against_commit": "8f3c1a2b9e7d4c6f5b8a1d2e9c0f7a6b3d4e5f12",
      "current_repo_head": "a91b3c8d4e5f12...",
      "last_feature_id": "ACME-1247"
    },
    ...
  ],
  "summary": {
    "total_components_scanned": 14,
    "l1_suspects": 4,
    "l2_hits": 2,
    "l3_hits": 1,
    "l4_orphans": 0,
    "l4_stales": 0,
    "by_severity": {"high": 1, "medium": 2, "low": 1}
  },
  "gate_decision": "fail",
  "gate_reason": "1 hit of severity high (threshold: medium)"
}
```

### Markdown report shape

A Markdown table with the columns:

| Component ID | Layer | Severity | Evidence | Recommended action |

Plus a header that summarises mode, scan range, gate decision, and a
section listing repo HEADs and component-level commit stamps for the
gate row.

## Gate decision logic

`--mode=gate`:

- Pass if no row has severity ≥ `--severity-threshold` (default `medium`).
- Fail otherwise.
- Returns exit code 0 (pass) or 1 (fail) when invoked from CI.

`--mode=full`:

- Always returns exit code 0 (this is a report, not a gate).
- Caller / cron job decides whether to open an issue, ping channels, etc.

## Layer-specific output details

### L1 — commit-stamp

Per component:

- `commits_since_last_verified` (int).
- `paths_overlap` (bool — true if any commit in that range touched any
  of `paths:`).
- `severity`: `low` if commits exist but no overlap; `medium` if overlap
  and ≤10 commits; `high` if overlap and >10 commits.

### L2 — structural diff

Per `verification_signal`:

- `openapi-diff`: list of (added, removed, modified) endpoints.
- `exported-symbols-diff`: list of (added, removed, renamed) public
  symbols.
- `route-inventory-diff`: list of (added, removed, renamed) routes.
- `schema-diff`: list of (added, removed, modified) tables / columns.
- `manual`: skips L2; goes to L3 if `--mode=full`.

Severity:

- `high` if any removal or breaking modification.
- `medium` if any addition that the component description doesn't cover.
- `low` if changes are purely additive AND the description's "Use when …"
  phrasing still holds.

### L3 — LLM contradiction

Per suspect:

- `verdict`: `holds` / `contradicts` / `ambiguous`.
- `contradictions`: list of specific claims in the doc that no longer
  match the code.
- Severity: `high` if `contradicts`; `medium` if `ambiguous`; absent if
  `holds`.

### L4 — coverage sweep (full mode only)

- `orphans`: artifacts in source repos with no component coverage.
- `stales`: components whose `paths:` resolve to no existing source files.
- Severity: `medium` for both — informational, not failure.
