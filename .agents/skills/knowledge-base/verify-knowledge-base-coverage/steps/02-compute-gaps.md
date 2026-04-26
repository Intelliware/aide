---
slug: compute-gaps
sequence: 2
depends-on-prior: true
---

# Step 2 — Compute orphans and stales

## Goal

Cross-reference the enumerated artifacts (step 1) against the KB's
component map. Orphans = artifacts not covered. Stales = components whose
paths or source_doc no longer resolve.

## Inputs

- Artifact list per repo from step 1.
- All component frontmatter (loaded once, cached).
- `--mode`.

## Procedure

### 2a — Build the path-to-component reverse index

(Same as `update-knowledge-base/steps/01-classify-diff.md` step 1, but
re-built afresh here so the skill is independently runnable.)

For each component, parse `paths:` and emit `(glob, component_id)` entries
into a per-repo reverse index. Repo-prefixed globs go into the index for
the prefix's repo, NOT the component's `repo` field.

### 2b — Orphan detection

For each artifact in step 1's enumeration:

1. Use `representative_path` to look up matching components in the
   per-repo index for the artifact's repo.
2. If at least one component matches → covered. Move on.
3. If no component matches → ORPHAN.
   - Compose the orphan record:
     - `kind`: from artifact.
     - `identifier`: from artifact.
     - `repo`: from artifact.
     - `representative_path`: from artifact.
     - `recommended_action`: distilled from kind:
       - `endpoint` → "Extend an existing api-feature component's
         `paths:` if the endpoint belongs to its surface, OR author a
         new component."
       - `symbol` → "Extend the framework component covering this
         module, OR author a new shared-library component."
       - `route` → "Extend an existing ui-feature component's `paths:`
         OR author a new component."
       - `schema-element` → "Extend the database-schema component
         covering this schema area."
   - Push to `orphans[]`.

### 2c — Stale detection

For each component in scope (baseline: all components; delta:
components whose `repo` is in advanced set + cross-repo components):

1. **`paths:` resolution.** For each glob in `paths:`:
   - Determine the target repo (un-prefixed → component's `repo`;
     prefixed → the prefix repo).
   - Run the glob against the target repo's filesystem.
   - If the glob matches at least one file: this path is OK.
   - If the glob matches nothing: record the unresolved path.
2. **`source_doc` resolution.** Confirm `<repo.path>/<source_doc>`
   exists. If not, record `missing_source_doc=true`.
3. **Stale verdict.** If ALL paths failed to resolve OR
   `missing_source_doc=true`, the component is stale. Compose:
   - `component_id`.
   - `unresolved_paths`: list.
   - `missing_source_doc`: bool.
   - `recommended_action`:
     - All paths unresolved → "Code was likely deleted or relocated.
       Either delete the component or update `paths:`."
     - Some paths unresolved → "Some paths point at non-existent code.
       Update `paths:` to remove dead globs." (this is a **partial
       stale** — recorded with severity `low`; not counted toward the
       gap_ratio rebuild trigger.)
     - `missing_source_doc=true` → "The canonical Part B doc moved or
       was deleted. Update `source_doc:` to point at the current location."

### 2d — Cross-repo component handling

A component with cross-repo paths is stale only if ALL its paths fail to
resolve, regardless of which paths' repos changed. The check in 2c handles
this naturally as long as the component's `paths:` are walked in full.

### 2e — Compute gap ratio

```
gap_ratio = (count(orphans) + count(full-stales)) / total_artifacts
```

Where:
- `total_artifacts` = sum across all repos of enumerated artifacts.
- `full-stales` = stales where ALL paths are unresolved (partial stales
  excluded).

## Acceptance

- Every artifact has been classified as covered or orphan.
- Every in-scope component has been classified as healthy, partial-stale,
  or full-stale.
- `gap_ratio` is computed.

## Hand-off

`steps/03-check-staleness.md`.
