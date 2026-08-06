---
slug: l4-coverage-sweep
sequence: 4
depends-on-prior: true
---

# Step 4 — L4 coverage sweep (full mode only)

## Goal

Enumerate every public artifact across all source repos and confirm each
maps to ≥1 component. Surface orphans (artifacts uncatalogued) and
stales (components whose paths resolve to nothing). Overlaps with
`verify-knowledge-base-coverage`; this step exists in the drift skill so
weekly cron runs catch coverage regressions in the same pass as
detection.

## Inputs

- All component frontmatter (already loaded).
- Source repos (read-only).
- Per-repo artifact enumeration tooling (same as `build-knowledge-base`
  step 8).

## Procedure

### 4a — Enumerate artifacts

For each `[[project.repos]]` entry, by `role`:

| Role | Artifact source |
|---|---|
| `api` | OpenAPI spec → list of (path, method) pairs as endpoint IDs. |
| `framework` / `shared-library` | Exported-symbol manifest → list of fully-qualified symbol names. |
| `ui` / `mobile` | Route enumeration → list of route paths. |
| `database` | Migration / schema dump → list of table+column names. |
| `infra` / `tooling` | Skipped (no canonical "public artifact" notion). |

Stash the per-repo artifact list.

### 4b — Orphan detection

For each artifact in each repo:

1. Determine its representative file path (e.g. for an OpenAPI endpoint,
   the controller file; for a route, the page file).
2. Match against every component's `paths:` (literal or glob, with
   repo-prefix awareness).
3. If no component matches → orphan. Record:
   - `kind`: `endpoint` / `symbol` / `route` / `schema-element`.
   - `identifier`: the artifact's identifier.
   - `representative_path`: the source file.
   - `recommended_action`: "Author a new component covering this
     artifact, or extend an existing component's `paths:`."

### 4c — Stale detection

For each component, walk its `paths:`:

1. Resolve every glob against the (cross-repo-aware) source tree.
2. If at least one path resolves → component is sourced.
3. If NO path resolves → stale. Record:
   - `component_id`.
   - `unresolved_paths`: the paths in frontmatter that match nothing.
   - `recommended_action`: "Either delete the component or update its
     `paths:` to reflect the current source layout."

### 4d — Solution-context staleness

Walk every leaf under `<KB>/shared/{solution-context,ai-rules,operations}/`.
For each leaf:

1. Read frontmatter `last_captured` (or `last_generated` for ai-rules
   and `last_reviewed` for individual runbooks).
2. Compute age in days from today's date.
3. Threshold: `[knowledge_base.solution_context_max_age_days]` from
   `project.toml` (or `framework.toml` if not set), default `90`.
4. If age > threshold → solution-context stale. Record:
   - `kind`: `solution-context-stale`
   - `leaf_path`: relative to KB root.
   - `last_captured`: the date.
   - `age_days`: integer.
   - `recommended_action`:
     - solution-context leaf → "Re-run `capture-solution-context
       --refresh-only`."
     - ai-rules leaf → "Re-run `generate-ai-rules`."
     - operations leaf or runbook → "Re-run `document-operations`
       (or refresh just the affected runbook)."

Severity for solution-context stales: `low` if age is within 1.5×
threshold, `medium` if greater. Solution-context staleness never
fires `high` because it does not block code correctness — but
exceeding 1.5× threshold often indicates the team has stopped
maintaining the human-grounded layer and should be flagged.

### 4e — Solution-context repo-coverage check

For each `[[project.repos]]` entry, grep across
`<KB>/shared/solution-context/**/*.md` for the repo's `code`
appearing in any `paths:`, `related_components`, or table cell. If
no leaf references the repo at all, record:

- `kind`: `solution-context-repo-orphan`
- `repo_code`: the unreferenced repo.
- `recommended_action`: "Re-run `capture-solution-context` and
  ensure ownership/RACI § 1 covers this repo."
- Severity: `low`.

### 4f — Severity (for component-side checks)

Both orphans and stales (component-side, from 4b/4c) → severity
`medium`. They are advisory, not breaking.

## Acceptance

- Every repo with a defined artifact source was enumerated.
- Every artifact has a coverage verdict.
- Every component has a path-resolution verdict.
- Every solution-context / ai-rules / operations leaf has a staleness
  verdict.
- Every repo has a solution-context coverage verdict.

## Output

L4 rows ready to merge into the report:

- For each orphan: `(layer=L4-orphan, severity=medium, evidence,
  recommended_action)`.
- For each stale: `(layer=L4-stale, severity=medium, evidence,
  recommended_action)`.
- For each solution-context stale: `(layer=L4-sc-stale,
  severity=low|medium, evidence, recommended_action)`.
- For each solution-context repo orphan: `(layer=L4-sc-repo-orphan,
  severity=low, evidence, recommended_action)`.

## Hand-off

`steps/05-compose-report.md`.
