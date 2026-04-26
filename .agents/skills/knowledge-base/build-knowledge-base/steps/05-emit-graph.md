---
slug: emit-graph
sequence: 5
depends-on-prior: true
---

# Step 5 — Emit graph.json

## Goal

Generate the machine-readable component dependency graph at
`<kb>/graph.json`, conforming to the schema in `config/SCHEMAS.md` § 3.3 and
shaped like `config/kb-graph.example.json`.

## Inputs

- All component files under `<kb>/components/**/*.md` (with reconciled
  frontmatter from step 4).
- The four edge `kind` values: `calls`, `consumes`, `depends-on`,
  `derives-from`.

## Procedure

1. **Build node list.** For each component file, emit:

   ```json
   {
     "id": "<component_id>",
     "repo": "<repo>",
     "type": "<type>",
     "doc": "components/<repo>/<id>.md"
   }
   ```

   `doc` is always relative to the KB root.

2. **Build edge list.** Walk every component's `depends_on` and infer the
   edge `kind` per these rules:

   | Source component type | Target component type | Inferred edge kind |
   |---|---|---|
   | Same repo, both `api-feature` | Same repo, `database-schema` | `depends-on` |
   | `api-feature` | `api-feature` in different repo | `calls` |
   | `ui-feature` / `mobile-feature` | `api-feature` | `calls` |
   | Any | `framework` / `shared-library` | `depends-on` |
   | Any | `database-schema` (in different repo) | `derives-from` if the source has a `triggers` containing words like `project`, `view`, `materialize`; else `calls` |
   | Any | Any (when frontmatter or RE doc explicitly says "consumes event/queue") | `consumes` |

   When inference is ambiguous, default to `depends-on` and add a note
   in the build report that flags the edge for human review.

3. **`consumed_by` is not written to the edge list.** It is the inverse
   view of the `depends_on` edges and is computed at read time.

4. **Validate graph integrity:**
   - Every edge `from` and `to` matches a node `id`. Reject otherwise.
   - Node count equals file count under `components/**/*.md`.
   - No duplicate node IDs.
   - No self-edges (a component depending on itself indicates a stale
     `depends_on` — flag and remove).

5. **Write** to `<kb>/graph.json` with the optional `_schema_version: "1.0"`
   and `_comment` keys at the top, then the canonical `nodes` and
   `edges` arrays.

## Acceptance

- `graph.json` parses as valid JSON.
- Conforms to `config/SCHEMAS.md` § 3.3 schema.
- All four integrity checks pass.
- File count under `components/**/*.md` matches `nodes.length`.

## Hand-off

`steps/06-emit-architecture-index.md`.
