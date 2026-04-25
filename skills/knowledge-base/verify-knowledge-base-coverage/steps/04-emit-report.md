---
slug: emit-report
sequence: 4
depends-on-prior: true
---

# Step 4 — Emit coverage report

## Goal

Render the JSON and Markdown reports under
`<knowledge_base_path>/.coverage-reports/` and return their paths.

## Inputs

- Orphans, stales, warnings from steps 2 and 3.
- Per-repo enumeration totals from step 1.
- `gap_ratio` from step 2.
- `tooling_errors` from step 1.

## Procedure

### 4a — Compute rebuild recommendation

| `gap_ratio` | Recommendation |
|---|---|
| < 0.05 | `narrow-fix` |
| 0.05 ≤ x < 0.30 | `triage` |
| ≥ 0.30 | `rebuild` |

If `tooling_errors` is non-empty, append a note to the recommendation:
"Coverage figures exclude repos with tooling errors: <list>."

### 4b — Group recommendations

For `narrow-fix` and `triage` modes, attempt to group orphans by likely
feature ID:

1. Read `<knowledge_base_path>/change-tracker.md`.
2. For each orphan's `representative_path`, find the most recent
   change-tracker row whose listed components have `paths:` overlapping
   that file's directory. Use that row's feature_id as a hint.
3. Append `likely_feature_id` to the orphan record. Caller uses this when
   formulating `update-knowledge-base --feature-id=<id>`.

### 4c — Write JSON report

Path: `<knowledge_base_path>/.coverage-reports/<ISO-timestamp>.json`.

Shape per `references/INPUTS-OUTPUTS.md` § "JSON report shape", plus:

```json
{
  ...
  "tooling_errors": ["api-billing: openapi.yaml malformed at line 42"],
  ...
}
```

Ensure the `.coverage-reports/` directory exists before writing.

Add the directory to `<knowledge_base_path>/.gitignore` if not already
present (so reports don't accidentally get committed).

### 4d — Write Markdown report

Path: `<knowledge_base_path>/.coverage-reports/<ISO-timestamp>.md`.

Shape per `references/INPUTS-OUTPUTS.md` § "Markdown report shape".

Ordering:
- Orphans: by `kind` then `repo` then `identifier`.
- Stales: by `component_id` ASC.
- Warnings: by `age_days` DESC.

### 4e — Output to caller

Print to stdout:

```
verify-knowledge-base-coverage [<mode>] complete.
Components: <N> | Artifacts: <M> | Gap ratio: <X.X>%
Recommendation: <narrow-fix | triage | rebuild>

Orphans: <n> | Stales: <n> | Warnings: <n>

JSON report: <path>
Markdown report: <path>
```

Always exit 0.

## Acceptance

- Both JSON and Markdown report files exist.
- JSON parses; matches the schema in INPUTS-OUTPUTS.md.
- Markdown renders correctly (tables align, headings present).
- Stdout summary is clear.
- `.coverage-reports/` is gitignored.

## Hand-off

None — terminal step. Caller acts on the report:

- `narrow-fix` → invoke `update-knowledge-base --feature-id=<id>` per
  recommended grouping.
- `triage` → open a tracking issue with the report attached.
- `rebuild` → invoke `build-knowledge-base --overwrite` then re-run
  `verify-knowledge-base-coverage --mode=baseline`.
