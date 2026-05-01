# update-knowledge-base — Overview

## Purpose

`update-knowledge-base` is the closing skill of every execution flow. After
a feature ships — through `execute-increments` (full) or
`execute-quick-change` (catalog-only) — this skill brings the KB back into
sync with reality. It does so **incrementally**: it processes only the
components matched by the diff, never the whole KB. A KB that is out of
sync silently is worse than no KB; this skill is what prevents that.

The skill operates in two modes:

- **`full`** — the default, invoked by `execute-increments`. Re-derives
  every aspect of every affected component (description, triggers,
  depends_on, consumed_by, data_entities, source_doc, body sections),
  emits an ADR if a threshold was crossed, regenerates the graph slice
  for changed edges, and refreshes the capability index slice in
  `ARCHITECTURE.md`.
- **`catalog-only`** — invoked by `execute-quick-change`. Updates only
  the catalog fields (`description` if changed, `last_feature_id`,
  `last_verified_against_commit`) and the change-tracker. Skips body
  re-derivation, graph updates, ADR emission, and the capability index
  refresh. Lighter, faster, suitable when the change is too small to
  warrant a full re-derivation pass.

  **Both modes touch the same component set:** the affected components
  Step 1 derives by intersecting the feature's diff against each
  component's `paths:` glob. `catalog-only` is "smaller per-component
  surface, same per-component selection." Components whose `paths:` did
  not match the diff are not re-attested even if their
  `last_verified_against_commit` is stale relative to current source
  HEAD — that's a separate sweep, see "When NOT to use" below.

## When to use

- `execute-increments` has finished a feature → invoke with `--scope=full`,
  pass the increment list, the merged diff, the merge SHA, the feature ID.
- `execute-quick-change` has finished a small change → invoke with
  `--scope=catalog-only`.
- A merge has landed on the trunk via a path that bypassed the framework
  → invoke retroactively with the merge SHA and a hand-supplied feature
  ID.

## When NOT to use

- The diff is so broad it touches >50% of components — refuse and run
  `build-knowledge-base` in overwrite mode. Step 1 enforces this.
- The KB doesn't exist — run `build-knowledge-base`.
- A drift alarm was raised but no feature shipped — use
  `detect-knowledge-base-drift` to identify the source of drift.
- You want to re-attest stale `last_verified_against_commit` stamps
  without a feature shipping — use `verify-knowledge-base-coverage`
  instead. This skill is scoped to the affected-component set derived
  from a feature's diff; it is not a stale-stamp sweeper.

## Position in workflow

```
execute-increments (or execute-quick-change)
   ↓ produces: increment manifest + git diff + feature ID + merge SHA
   ↓
update-knowledge-base
   ↓ updates: affected components, change-tracker, optional ADR, graph slice
   ↓
[optional] detect-knowledge-base-drift --mode=gate
   ↓ confirms: no residual drift introduced by this update
   ↓
end of flow
```

## ADR emission thresholds

The skill emits an ADR (in `--scope=full` mode) when the diff crosses one
of these thresholds — the boundaries between "minor change" and
"architectural decision":

1. **New external dependency.** The diff adds a new entry to
   `package.json` / `requirements.txt` / `pom.xml` / `Cargo.toml` etc.
   that wasn't already used elsewhere in the project.
2. **Framework replacement.** The diff removes one framework and adds
   another in the same role (e.g. swapping ORM, swapping HTTP client,
   swapping state-management library).
3. **New authentication / authorization model.** The diff introduces a
   new auth flow, new identity provider integration, or changes the
   org-wide auth strategy.
4. **New data store.** The diff introduces a new database engine, cache,
   queue, or storage backend not previously used.
5. **Breaking public-interface change.** The diff modifies an OpenAPI
   spec, a published GraphQL schema, or an exported framework symbol in
   a non-backward-compatible way.
6. **New cross-cutting standard.** The diff adds a new logging /
   observability / error-handling pattern that the team intends to
   adopt project-wide.

Below threshold: no ADR. The change is just a regular feature, captured
adequately by the change-tracker row and the updated component
frontmatter.

ADRs are **append-only**. Step 4 never edits existing ADRs except to
flip an `accepted` status to `superseded by ADR-XXXX` when a new ADR
explicitly supersedes an old one.
