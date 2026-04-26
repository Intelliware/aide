---
slug: enumerate-artifacts
sequence: 1
depends-on-prior: false
---

# Step 1 — Enumerate public artifacts

## Goal

Build the per-repo list of public artifacts that the KB must cover. In
`baseline` mode, all repos. In `delta` mode, only repos whose HEAD has
advanced since `--prior-report`.

## Inputs

- `[[project.repos]]` (paths, roles).
- `--mode`.
- `--prior-report` (delta mode).

## Procedure

### 1a — Determine the repo list

- `baseline`: every `[[project.repos]]` entry.
- `delta`: read `--prior-report` JSON, extract `repo_heads`. For each
  repo, run `git -C <repo.path> rev-parse HEAD` and compare to the prior
  recorded head. Include only repos whose HEAD advanced. **Always
  include all repos that contain any cross-repo component's `paths:`,
  even if they didn't advance** — a path-glob expansion in another
  advanced repo may now match files in a non-advanced repo.

### 1b — Enumerate per role

For each repo in the list:

| Role | Procedure |
|---|---|
| `api` | Locate the OpenAPI spec (path noted in `repos/<code>/README.md` § 6 "API contract", or default `openapi.json` / `openapi.yaml` at repo root or under `api/`). Parse it. For each `(path, method)` pair, emit one artifact: `{kind: endpoint, identifier: "<METHOD> <path>", repo: <code>, representative_path: <controller file derived from operationId or x-controller hint>}`. |
| `framework` / `shared-library` | Locate the exported-symbol manifest (TypeScript: `dist/index.d.ts` or `package.json#exports`; Java: `module-info.java`; Python: `__init__.py` walk; Rust: `lib.rs` `pub use` walk). Emit one artifact per public symbol: `{kind: symbol, identifier: <fully-qualified name>, repo, representative_path}`. |
| `ui` | Walk the route configuration (React Router config; Next.js `pages/` or `app/`; Vue Router config). Emit one artifact per route: `{kind: route, identifier: <route path>, repo, representative_path: <page file>}`. |
| `mobile` | Walk the screen registry (iOS: AppDelegate / SceneDelegate routes; Android: Navigation graph; React Native: navigator config). Emit one artifact per screen group. |
| `database` | Run a schema dump (typically replay migrations on a temp database, or `pg_dump --schema-only` against a freshly migrated dev DB). Emit one artifact per table: `{kind: schema-element, identifier: <table>, repo, representative_path: <migration file>}`. Optionally per column for finer-grained coverage. |
| `infra` / `tooling` | Skip — no canonical "public artifact" notion. Components in these repos are exempt from coverage checks. |

### 1c — Tooling errors

If artifact-source tooling fails for a repo (spec malformed, migration
tooling missing, etc.):

1. Record the error in the in-memory `tooling_errors` array.
2. Do NOT block the run. Continue with other repos.
3. The repo's components in step 2 will skip orphan-checking but still
   participate in stale-checking (their `paths:` resolution is
   independent of artifact enumeration).

### 1d — Cache stash

Store the artifact list keyed by repo for use in step 2. In delta mode,
also stash the prior report's artifact lists for repos that didn't
advance — they're trusted as still-current.

## Acceptance

- Every repo in the scope has either an enumerated artifact list or a
  tooling-error record.
- Artifacts are uniquely identifiable by `(kind, identifier, repo)`.
- Cross-repo coverage scope is correctly captured.

## Hand-off

`steps/02-compute-gaps.md`.
