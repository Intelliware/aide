# verify-knowledge-base-coverage — Inputs & Outputs

## Inputs

| Input | Type | Required | Default | Notes |
|---|---|---|---|---|
| `[[project.repos]]` array | `project.toml` | Yes | — | Each repo's `path` and `role` drives artifact enumeration. |
| `<knowledge_base_path>/components/` | path | Yes | — | All component frontmatter is read. |
| `<knowledge_base_path>/graph.json` | path | Yes | — | Used to identify cross-repo components quickly. |
| `--mode` | enum | No | `baseline` | `baseline` runs full enumeration; `delta` reads the prior report and only re-checks advanced repos. |
| `--prior-report` | path to JSON report | Required for `delta` | — | Skill errors if delta mode is requested without this. |
| `--staleness-warning-days` | int | No | `framework.toml [knowledge_base] staleness_warning_days` (default 30) | Components whose stamps are older than this raise warnings. |
| `--include-cross-cutting` | bool | No | `true` | Whether `shared/cross-cutting/*.md` pointer-page targets are checked for existence. |

## Outputs

The skill writes a JSON and Markdown report; never modifies the KB.

### Report locations

- `<knowledge_base_path>/.coverage-reports/<ISO-timestamp>.json`
- `<knowledge_base_path>/.coverage-reports/<ISO-timestamp>.md`

The `.coverage-reports/` directory is gitignored.

### JSON report shape

```json
{
  "mode": "baseline",
  "started_at": "2026-04-25T15:00:00Z",
  "finished_at": "2026-04-25T15:04:18Z",
  "knowledge_base_path": "/path/to/kb",
  "repo_heads": {"api-orders": "8f3c1a2…", "api-billing": "b7e4d9c…"},
  "totals": {
    "components": 14,
    "endpoints_enumerated": 47,
    "exports_enumerated": 8,
    "routes_enumerated": 12,
    "schema_elements_enumerated": 31
  },
  "orphans": [
    {
      "kind": "route",
      "identifier": "/fraud-review",
      "repo": "web-portal",
      "representative_path": "src/routes/fraud-review.tsx",
      "recommended_action": "Author a new component covering /fraud-review or extend web-portal-fraud-screen to include this route. Run update-knowledge-base."
    }
  ],
  "stales": [
    {
      "component_id": "legacy-coupon-engine",
      "unresolved_paths": ["src/coupons/v1/**"],
      "missing_source_doc": false,
      "recommended_action": "Code reorganisation removed src/coupons/v1; either delete this component or update paths to point at the new location."
    }
  ],
  "warnings": [
    {
      "component_id": "billing-refund-processor",
      "last_verified_against_commit": "c0f7a6b3d4e5f12...",
      "age_days": 47,
      "recommended_action": "Run detect-knowledge-base-drift on this component; if drift confirmed, run update-knowledge-base."
    }
  ],
  "gap_ratio": 0.043,
  "rebuild_recommendation": "narrow-fix"
}
```

### Markdown report shape

```markdown
# Coverage Report — <ISO timestamp>

**Mode:** <baseline | delta>
**Repo HEADs:** <comma-separated repo:sha>
**Total components:** <N>
**Gap ratio:** <X.X%>
**Recommendation:** <narrow-fix | triage | rebuild>

## Orphans (<n>)

| Kind | Identifier | Repo | Representative path | Recommended action |
|---|---|---|---|---|
…

## Stales (<n>)

| Component ID | Unresolved paths | Missing source_doc? | Recommended action |
|---|---|---|---|
…

## Warnings (<n>)

| Component ID | Last verified | Age (days) | Recommended action |
|---|---|---|---|
…
```

## Recommendation logic

| Gap ratio | Recommendation |
|---|---|
| < 0.05 | `narrow-fix` — list each gap with its specific `update-knowledge-base` invocation. |
| 0.05–0.30 | `triage` — group gaps by recent feature ID (read from `change-tracker.md`); recommend per-group `update-knowledge-base` runs. |
| ≥ 0.30 | `rebuild` — recommend `build-knowledge-base --overwrite` followed by `verify-knowledge-base-coverage --mode=baseline`. |

`gap_ratio` denominator: total artifacts enumerated. Numerator: orphans
+ stales (warnings do NOT count toward the rebuild trigger).

## Refusal modes

| Condition | Response |
|---|---|
| `--mode=delta` without `--prior-report` | Refuse: "Delta mode requires a prior report. Run `--mode=baseline` first." |
| `--prior-report` doesn't parse | Refuse: "Prior report is malformed. Re-run baseline." |
| Component count = 0 | Refuse: "KB has no components — run `build-knowledge-base` first." |
| Artifact-source tooling fails for a repo | Continue, but emit a top-level `tooling_errors` array in the report listing repos that couldn't be enumerated. The gap_ratio is computed only over repos that succeeded; a `tooling-error` repo is never the cause of a `rebuild` recommendation. |
