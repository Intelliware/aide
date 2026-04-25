---
slug: update-graph
sequence: 5
depends-on-prior: true
---

# Step 5 — Update graph.json incrementally (full mode only)

## Goal

Rewrite `graph.json` reflecting added/removed nodes and edges from this
update. Do NOT regenerate the whole graph from scratch — that would erase
edges that no other component reflects in its frontmatter (rare but
possible for `consumes` edges that aren't in `depends_on`).

## Inputs

- Existing `<knowledge_base_path>/graph.json`.
- `affected_components` (with old vs new frontmatter from step 2).
- `edge_changes` recorded during step 2.
- New component IDs from step 2b.

## Procedure

### 5a — Reconcile depends_on / consumed_by symmetry

(Same as `build-knowledge-base/steps/04-shared-pass.md` § 4a — but scoped
to affected + new components only.)

1. For each affected component, walk its current `depends_on` and ensure
   the target's `consumed_by` lists it. Write missing entries.
2. For each affected component, walk its current `consumed_by` and ensure
   the source's `depends_on` lists it. (Rare — usually depends_on is the
   author's edit and consumed_by is derived. But the symmetry is the
   contract.)
3. For each removed `depends_on` edge (present in old frontmatter,
   absent in new), remove the corresponding `consumed_by` entry on the
   target. CAUTION: only remove if no _other_ component still depends_on
   the target — otherwise the consumed_by stays.

### 5b — Update graph.json

1. **Read** existing `graph.json`. Parse into `{nodes, edges}`.
2. **Add new nodes** for each new component from step 2b:
   ```json
   {"id": "<id>", "repo": "<repo>", "type": "<type>", "doc": "components/<repo>/<id>.md"}
   ```
3. **Remove nodes** for any deleted components (rare in update flow —
   step 2 doesn't auto-delete, but if step 1 explicitly recorded a
   deletion, honour it).
4. **Edge diff:**
   - For every entry in `edge_changes.added`, add an edge with inferred
     `kind` (use the same inference rules as
     `build-knowledge-base/steps/05-emit-graph.md` Procedure step 2).
   - For every entry in `edge_changes.removed`, remove the matching
     edge.
   - Edge identity is `(from, to, kind)`; if the same `from`+`to` pair
     changed kind (rare), record both as remove + add.
5. **Verify integrity** (same checks as build skill):
   - Every edge `from`/`to` matches a node `id`.
   - No duplicate node IDs.
   - No self-edges.
   - Node count matches file count under
     `<knowledge_base_path>/components/**/*.md`.
6. **Write** `graph.json`. Preserve `_schema_version` and `_comment`
   metadata from the prior version.

## Acceptance

- `graph.json` parses cleanly.
- All integrity checks pass.
- Symmetry between depends_on and consumed_by is restored.
- The diff between old and new graph.json equals the edge_changes set
  (plus any added/removed nodes).

## Hand-off

`steps/06-update-architecture-index.md`.
