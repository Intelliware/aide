# navigate-knowledge-base — Inputs & Outputs

## Inputs

| Input | Type | Required | Default | Notes |
|---|---|---|---|---|
| Feature description | string (free text) | One of these two | — | Tokenised + lemmatised for capability/trigger matching. |
| `--seed-component-id` | string | One of these two | — | Skips capability lookup; starts graph expansion from this component directly. Useful for impact analysis. |
| `knowledge_base_path` | path | Yes | — | Resolved from `project.toml` `[project.paths]`. |
| `--max-components` | int | No | `7` | Hard cap on returned items. Cross-cutting pointers count toward the cap. |
| `--include-cross-cutting` | bool | No | `true` | When true, append `shared/cross-cutting/<concern>.md` pointers if the feature description triggers a concern keyword (auth, log, error, security, performance, version). |
| `--depth` | enum | No | `one-hop` | `one-hop` walks `depends_on` + `consumed_by` once; `two-hop` repeats. |
| `--include-stale` | bool | No | `true` | When false, components whose `last_verified_against_commit` differs from their repo HEAD AND whose `paths` overlap recent diffs are excluded. Requires source-repo access. |
| `--format` | enum | No | `markdown` | `markdown` or `json` — controls return format. |

## Outputs

The skill returns a list (no disk writes). Each entry has:

| Field | Type | Description |
|---|---|---|
| `path` | string | Relative to KB root, e.g. `components/api-orders/order-checkout-flow.md`. |
| `tier` | enum | `primary` (capability/trigger match), `one-hop` (graph neighbour of a primary), `two-hop` (only when `--depth=two-hop`), `cross-cutting` (pointer page from `shared/cross-cutting/`), `seed` (when invoked with `--seed-component-id`). |
| `why` | string | One-sentence reason — which capability matched, which trigger fired, which graph edge connected. |
| `score` | float | 0–1; ranking score within tier. Useful when caller sets `--max-components` lower than this skill's natural threshold. |
| `frontmatter` | object | Inline copy of the component's parsed frontmatter (so caller doesn't need a second read just for metadata). |
| `repo` | string | Convenience field copied from `frontmatter.repo`. |
| `last_verified_against_commit` | string | Convenience field copied from frontmatter; let caller decide on freshness. |

## Selection algorithm — score weights

| Signal | Weight |
|---|---|
| Capability Index row matches feature description (exact phrase) | 1.0 |
| Capability Index row matches feature description (lemmatised tokens, ≥2 overlap) | 0.7 |
| Component `triggers` entry contained verbatim in feature description | 0.6 |
| Component `triggers` entry overlap (lemmatised) with feature description | 0.4 |
| Component `description` ("Use when …") clause overlap | 0.3 |
| `--seed-component-id` direct hit | 1.0 (auto `seed` tier) |
| One-hop graph neighbour of any primary | 0.5 (auto `one-hop` tier) |
| Two-hop graph neighbour | 0.25 (auto `two-hop` tier; only on `--depth=two-hop`) |
| Cross-cutting concern keyword in feature description | 0.4 (auto `cross-cutting` tier) |

Threshold for inclusion: combined score ≥ 0.3. Final ranking:
`tier-rank * 1000 + score`, where tier ranks are seed=4, primary=3,
one-hop=2, cross-cutting=1.5, two-hop=1. Lower-ranked tiers tie-break by
score within tier.

## Failure modes

| Condition | Behaviour |
|---|---|
| `<knowledge_base_path>/ARCHITECTURE.md` missing | Error: "KB not initialised. Run `build-knowledge-base`." Stop. |
| `<knowledge_base_path>/graph.json` missing or invalid | Warn; proceed without graph expansion (returns primaries only). |
| Feature description empty AND no `--seed-component-id` | Error: "Provide a feature description or `--seed-component-id`." Stop. |
| Zero matches (no component hits the inclusion threshold) | Return empty list with `why` = "no capability or trigger matched"; caller decides whether to fall back to `ARCHITECTURE.md` directly. |
| `--max-components` < primary count | Drop one-hop and two-hop; return only top-N primaries. Warn in `why` of the cap. |
