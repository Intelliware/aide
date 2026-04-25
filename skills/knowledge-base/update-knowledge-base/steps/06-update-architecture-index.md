---
slug: update-architecture-index
sequence: 6
depends-on-prior: true
---

# Step 6 — Update ARCHITECTURE.md (capability index slice; full mode only)

## Goal

Refresh the relevant slices of `<knowledge_base_path>/ARCHITECTURE.md`
without regenerating the whole document. The hand-edited prose (Solution
Summary, How To Load This KB) is preserved verbatim.

## Inputs

- Existing `ARCHITECTURE.md`.
- `affected_components` and the `capability_index_needs_refresh` flag
  from step 2.
- New components from step 2b.
- Updated `graph.json` from step 5.
- `templates/blocks/knowledge-base/capability-index.md`.

## Procedure

### 6a — Component Catalog (§ 3)

1. For each affected component whose `description` or `type` changed,
   update its row in § 3.
2. For each new component, append a new row (alphabetical by
   `component_id` within its repo group, if § 3 is grouped by repo;
   otherwise append).
3. For deleted components (rare), remove the row.

### 6b — Capability Index (§ 4)

Skip if `capability_index_needs_refresh` is false.

Otherwise, regenerate § 4 from current frontmatter:

1. Walk every `components/**/*.md` and parse `description` and
   `triggers`.
2. Cluster by primary verb-phrase (same algorithm as
   `build-knowledge-base/steps/06-emit-architecture-index.md` § 4).
3. Render via `templates/blocks/knowledge-base/capability-index.md`.
4. Splice into § 4, replacing the prior table verbatim.

**Never hand-edit the capability index.** If a desired capability vocabulary
doesn't appear, the fix is to update the underlying components' triggers
or descriptions and re-run this step.

### 6c — Repository Map (§ 2)

For each repo in `merge_shas`, update the `Last Indexed Commit` column to
the merge SHA. Other columns are unchanged.

### 6d — Dependency Graph (§ 5)

If `edge_changes` is non-empty, regenerate the Mermaid diagram from the
updated `graph.json` (same algorithm as build skill step 6 procedure
step 5). Replace § 5's Mermaid block.

### 6e — Cross-Cutting Concerns (§ 6)

Untouched in update flow. Cross-cutting concerns evolve very slowly; if a
new concern was introduced, an ADR was emitted in step 4 — the user can
manually link the ADR into § 6 if appropriate.

### 6f — Header metadata

- `Last full re-index`: NOT updated (this is an incremental update, not a
  full re-index). Preserve the prior value.
- The skill records the merge SHA in the Repository Map (§ 2) and in
  individual component frontmatter; that suffices for staleness
  computation.

## Acceptance

- § 2's `Last Indexed Commit` matches `merge_shas` for affected repos.
- § 3 has rows for all current components, no rows for non-existent ones.
- § 4 reflects current triggers if it was regenerated.
- § 5's Mermaid parses if it was regenerated.
- All `{{placeholders}}` from the original template remain absent.
- The hand-authored prose (§ 1, § 7) is byte-identical to before.

## Hand-off

`steps/07-validate.md`.
