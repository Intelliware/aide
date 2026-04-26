---
slug: validate
sequence: 7
depends-on-prior: true
---

# Step 7 — Validate update

## Goal

Self-check the update before returning the report. Prevent partial
updates from leaving the KB in an inconsistent state.

## Inputs

- The updated KB.
- Update context (affected components, edges added/removed, ADRs emitted).
- `--scope` flag.

## Checks

### 7a — Schema conformance (per affected component)

For each component touched in step 2 (existing + new):

1. Frontmatter parses cleanly.
2. All required fields present.
3. `description` starts with `Use when `.
4. `last_verified_against_commit` is exactly 40 hex chars and matches
   the merge SHA passed in for the component's repo.
5. `last_feature_id == feature_id`.
6. `repo` matches a `code` in `[[project.repos]]`.
7. `type` is one of the allowed enum values.
8. `verification_signal` is one of the allowed enum values.
9. `source_doc` is non-empty.
10. `component_id` remains unique across the KB.

### 7b — Edge integrity (full mode)

1. Every `depends_on` and `consumed_by` resolves to an existing
   component.
2. Symmetry holds across the affected set.
3. `graph.json` parses; node count equals file count under
   `components/**/*.md`; no edge references a missing node.

### 7c — Change-tracker

A new row was appended in step 3. The row contains: date, feature_id,
non-empty Components Touched (or the explicit `(none — see drift report)`
marker), summary, actor.

### 7d — ADR (full mode)

If any ADR was emitted in step 4:

1. The ADR file exists at
   `shared/adrs/ADR-NNNN-<kebab-title>.md`.
2. Its number is `max(prior numbers) + 1`.
3. `accepted` status (for shipped features).
4. Required fields populated; `[REVIEW: …]` markers acceptable but
   reported as warnings.
5. If supersedes was set, the superseded ADR's status line was flipped.
6. No accepted ADR other than the superseded one was modified.

### 7e — ARCHITECTURE.md (full mode, if regenerated)

1. § 2 `Last Indexed Commit` matches `merge_shas` for affected repos.
2. § 3 row count equals file count under `components/**/*.md`.
3. § 4 has at least one row per cluster of components with similar
   verb-phrases (no orphan components).
4. § 5 Mermaid parses.
5. § 1 and § 7 prose is byte-identical to the prior version.

### 7f — No-orphan check

For every component that previously had `paths:` and was modified, the
new `paths:` array is non-empty. (Lost-coverage flag from step 2 surfaces
here.)

### 7g — Catalog-only mode

If `--scope=catalog-only`, run only 7a (with relaxed expectations: only
`last_verified_against_commit` and `last_feature_id` need to have been
bumped) and 7c. Skip 7b–7f.

## Output — update report

Return the JSON report shape from `references/INPUTS-OUTPUTS.md`. The
caller (typically `execute-increments` or `execute-quick-change`) logs
the report and proceeds.

## Failure modes

- If 7a, 7b, 7c, or 7d fails: do NOT roll back automatically (the file
  edits already happened). Return an `error` report and instruct the
  caller to re-run with corrected inputs or to invoke
  `detect-knowledge-base-drift --mode=full` to re-baseline.
- Warnings (`[REVIEW: …]` markers, lost-coverage flags) do not block
  return.

## Hand-off

Returns to caller. Optionally hand off to
`detect-knowledge-base-drift --mode=gate` for an immediate post-update
sweep.
