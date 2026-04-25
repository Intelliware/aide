# {{project_name}} — Knowledge Base

> **Project code:** `{{project_code}}`
> **Domain:** {{project_domain}}
> **KB schema version:** 1.0
> **Last full re-index:** {{last_full_reindex_date}} (against commit {{last_full_reindex_commit}})
> **Maintained by:** {{kb_maintainer}}

This is the root index of the {{project_name}} knowledge base. It is the
first file every framework skill reads when it needs to ground itself in the
state of the codebase. Tooling (`graph.json`) is the machine companion to
this human-readable index — keep them consistent via the
`build-knowledge-base-index` skill.

---

## 1. Solution Summary

{{solution_summary_paragraph_1_what_the_system_does}}

{{solution_summary_paragraph_2_architectural_style_and_shaping_decisions}}

{{solution_summary_paragraph_3_boundaries_and_explicit_out_of_scope}}

---

## 2. Repository Map

| Code | Role | Path | Primary Owner | Last Indexed Commit |
|---|---|---|---|---|
{{repository_map_table_rows}}

> Each row above corresponds to one entry in `project.toml`'s
> `[[project.repos]]`. The `Last Indexed Commit` column is the SHA of the
> commit the KB was last verified against for that repo — _not_ the repo's
> current HEAD. Skills compare these against `last_verified_against_commit`
> on individual components to compute staleness.

---

## 3. Component Catalog

| Component ID | Repo | Type | Description | Doc |
|---|---|---|---|---|
{{component_catalog_table_rows}}

> Description column is in **"Use when …"** form by convention — that
> phrasing is what skill-routing matches against, mirroring how Claude Code
> skill descriptions work. If a description does not start with "Use when ",
> the component is malformed and `verify-knowledge-base` will flag it.

---

## 4. Capability Index

Capability → list of `component_id`s that implement it. This is the
inverted lookup the orchestrator uses first when a story arrives.

| Capability | Components |
|---|---|
{{capability_index_table_rows}}

> Capability strings are free-form short verb-phrases ("process refunds",
> "render checkout page", "emit invoice PDF"). Maintained manually in this
> file; not auto-derived from component frontmatter.

---

## 5. Dependency Graph

The diagram below is a C4 Level 2 (container) view rendered from
`graph.json`. It shows components as nodes and the four edge kinds —
`calls`, `consumes`, `depends-on`, `derives-from` — with distinct line
styles. For programmatic access, consume `graph.json` directly.

```mermaid
{{dependency_graph_mermaid_c4_l2}}
```

**Source of truth:** [`graph.json`]({{graph_json_relative_path}}). This
diagram is regenerated from it on every `build-knowledge-base-index` run.

---

## 6. Cross-Cutting Concerns

These topics live _inside_ each repo's Part B documentation. The KB indexes
them rather than copying their content, because cross-cutting concerns
change rarely and source-repo docs are the source of truth.

| Concern | Owning Repo | Doc Pointer |
|---|---|---|
| Authentication & Authorization | {{auth_owning_repo}} | {{auth_doc_pointer}} |
| Logging & Observability | {{observability_owning_repo}} | {{observability_doc_pointer}} |
| Error handling | {{error_handling_owning_repo}} | {{error_handling_doc_pointer}} |
| Security standards | {{security_owning_repo}} | {{security_doc_pointer}} |
| Performance & rate limits | {{performance_owning_repo}} | {{performance_doc_pointer}} |
| API versioning & deprecation | {{versioning_owning_repo}} | {{versioning_doc_pointer}} |

---

## 7. How To Load This KB (instructions for the AI agent)

You — the AI agent reading this file — should load the KB in this order:

1. **Read this `ARCHITECTURE.md` first.** Sections 1–4 give you the shape
   of the system: what it is, which repos compose it, what the components
   are, and which capabilities exist.
2. **Hit the Capability Index (§ 4) before anything else** when the user
   gives you a task. Match the user's verbs/nouns against the capability
   strings to narrow to a small set of `component_id`s.
3. **Open `graph.json` next** to compute the blast radius of those
   components. Walk outgoing edges (`calls`, `consumes`, `depends-on`) to
   see what they touch; walk incoming edges to see what touches them.
4. **Open the specific `components/<repo>/<component_id>.md` files** for
   the components in scope. Their frontmatter tells you `paths`,
   `data_entities`, `verification_signal`, and how stale they are.
5. **Check freshness.** If `last_verified_against_commit` on a component
   is older than the corresponding repo's `Last Indexed Commit` in § 2 —
   _or_ older than {{staleness_warning_days}} days as a wall-clock fallback
   — treat that component's body text as suggestive, not authoritative,
   and verify against the source files directly.
6. **Never fabricate components.** If a capability is needed but no
   component in § 4 implements it, say so explicitly. Adding a capability
   that does not exist is the worst possible failure mode.
7. **Cross-cutting concerns (§ 6) are pointers.** If you need the actual
   contents of an auth/logging/error standard, follow the pointer into the
   owning repo's Part B docs. Do not reproduce them here.

When you finish a feature implementation, the `build-knowledge-base-index`
skill will refresh the components you touched. Update the `last_feature_id`
on each affected component frontmatter and bump
`last_verified_against_commit` to the merge commit.

---

## 8. Maintenance Hooks

The following skills produce/maintain this KB:

- `build-knowledge-base-index` — rebuilds this `ARCHITECTURE.md`,
  `graph.json`, and any stale component frontmatter from source.
- `verify-knowledge-base` — runs the per-component
  `verification_signal` checks and reports drift.
- `build-component-doc` — drafts a single
  `components/<repo>/<component_id>.md` for a new or substantially
  changed component.

KB-level changes are logged in `_meta/change-log.md`. Project-specific KB
conventions (naming, capability vocabulary) live in
`_meta/conventions.md`.
