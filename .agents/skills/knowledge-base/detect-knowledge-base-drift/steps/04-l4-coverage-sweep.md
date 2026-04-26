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

### 4d — Severity

Both orphans and stales → severity `medium`. They are advisory, not
breaking.

## Acceptance

- Every repo with a defined artifact source was enumerated.
- Every artifact has a coverage verdict.
- Every component has a path-resolution verdict.

## Output

L4 rows ready to merge into the report:

- For each orphan: `(layer=L4-orphan, severity=medium, evidence,
  recommended_action)`.
- For each stale: `(layer=L4-stale, severity=medium, evidence,
  recommended_action)`.

## Hand-off

`steps/05-compose-report.md`.
