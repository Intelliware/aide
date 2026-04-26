---
slug: classify-diff
sequence: 1
depends-on-prior: false
---

# Step 1 — Classify diff against component map

## Goal

Determine which KB components are affected by this feature's diff. Refuse if
the diff scope is too large.

## Inputs

- Git diff (file paths, optionally with line ranges).
- Implementation increment(s).
- `<knowledge_base_path>/components/**/*.md` (component map).
- Merge SHA per repo touched.
- `--scope` flag.

## Procedure

1. **Build the path-to-component map.** Walk every component file, parse
   frontmatter, and for each `(component_id, paths[])` entry build a
   reverse index: glob → component_id. Repo-prefixed globs
   (`<repo-code>:<glob>`) are scoped to that repo only.

2. **Walk the diff.** For each changed file `f`:
   - Determine its repo from the path prefix.
   - Match against the path-to-component reverse index for that repo's
     scope:
     - Literal match wins.
     - Otherwise, glob match (any glob matching the file).
     - A file may match multiple components — record all hits.
   - If `f` matches a component's `source_doc` (the canonical Part B
     doc), the component is affected even if no other paths matched.

3. **Build the affected-component set.** Union of all hits.

4. **Flag unmatched files.** Files that match no component are in three
   categories:
   - **Manifest / dependency files** (`package.json`, `requirements.txt`,
     `pom.xml`, `Cargo.toml`, etc.) — flagged for ADR threshold check
     in step 4.
   - **Test files** — fine; recorded for step 2's body refresh.
   - **Genuinely orphan** (changed source file with no component
     coverage) — flagged in the report. Indicates either an
     under-decomposed KB or a new component is needed. Step 2 attempts
     to detect "new component should be created here" cases.

5. **Diff scope guard.** Compute
   `affected / total_components`. If > 0.5, REFUSE the update with:
   "Diff touches >50% of components — incremental update unsafe.
   Recommend `build-knowledge-base --overwrite` followed by
   `verify-knowledge-base-coverage --mode=baseline`." Stop.

6. **Zero-match guard.** If `affected.size == 0`:
   - In `--scope=catalog-only`: append a change-tracker row with
     `Components Touched: (none)` and stop. The change is presumed
     pure tooling/infra.
   - In `--scope=full`: warn loudly. Either the change is purely
     tooling/infra (run `--scope=catalog-only` instead), or the
     component `paths:` are out of date (run
     `detect-knowledge-base-drift --mode=full`). Ask the caller for
     guidance; do not silently proceed.

7. **Detect "new component needed" cases.** For each file flagged
   `genuinely orphan` in step 4:
   - If the file is in a path that suggests a feature directory (e.g.
     `src/features/<new-feature>/`), suggest creating a new component
     for it.
   - If the file is a single utility (e.g. `src/utils/<new-helper>.ts`),
     attribute it to the nearest existing component by directory
     proximity.
   - The full new-component creation logic runs in step 2.

8. **Capture per-repo merge SHAs.** Confirm each SHA is reachable from
   the repo's HEAD or from a recent merge — `git -C <repo.path>
   merge-base --is-ancestor <SHA> HEAD` should exit 0.

## Acceptance

- Affected-component set is computed and either non-empty (proceed) or
  the zero-match path is taken.
- Diff scope ≤50% of total components.
- Every merge SHA is verified reachable.
- Files flagged for ADR threshold checks are stashed for step 4.

## Output

In-memory update context with:

- `affected_components: [component_id, …]`
- `new_component_candidates: [{filename, suggested_id, reason}, …]`
- `adr_threshold_signals: [{kind, evidence}, …]` (raw — step 4 evaluates)
- `merge_shas: {repo: sha}`
- `feature_id`
- `actor`

## Hand-off

`steps/02-update-components.md`.
