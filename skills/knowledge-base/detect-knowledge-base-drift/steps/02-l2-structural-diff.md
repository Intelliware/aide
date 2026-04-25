---
slug: l2-structural-diff
sequence: 2
depends-on-prior: true
---

# Step 2 — L2 structural diff

## Goal

For each L1 suspect, run a domain-specific structural diff based on the
component's `verification_signal`. Determines whether the public
contract has actually changed (vs. internal-only commits which trip L1
but don't drift the doc).

## Inputs

- L1 suspects from step 1 (with `last_verified_against_commit` and
  current head per repo).
- The component's `verification_signal` field.
- Source repos (read-only).

## Per-signal procedures

### `openapi-diff`

For components in API repos:

1. Locate the OpenAPI spec at the canonical path for the repo (per repo
   convention: `openapi.json`, `api/openapi.yaml`, etc. — read from
   the repo's `repos/<code>/README.md` § 6 "API contract").
2. Check out the spec at `last_verified_against_commit` and at HEAD.
3. Run a structural OpenAPI diff (e.g. `oasdiff` or equivalent):
   - Endpoints added.
   - Endpoints removed.
   - Endpoints with breaking parameter / response changes.
4. Severity:
   - Any **removed endpoint** the component description claims → `high`.
   - Any **breaking modification** to an endpoint the component
     description claims → `high`.
   - Any **new endpoint** that the component description doesn't cover
     but plausibly belongs (path under `paths:`) → `medium`.
   - Purely additive AND the description's "Use when …" clause still
     covers the new surface → `low`.

### `exported-symbols-diff`

For framework / shared-library components:

1. Locate the exported-symbols manifest. Source convention varies
   (e.g. TypeScript: `dist/*.d.ts`; Java: `module-info.java`; Python:
   `__init__.py`).
2. Compute the symbol set at LV vs HEAD.
3. Diff: added, removed, renamed (heuristic: same parameter signature,
   different name).
4. Severity rules same as openapi-diff with "endpoint" replaced by
   "symbol".

### `route-inventory-diff`

For UI / mobile components:

1. Run a route enumeration (the same one RE used). Tooling varies:
   React Router config dump; Next.js `pages/` walk; Vue Router config;
   etc.
2. Compute route set at LV vs HEAD.
3. Diff added / removed / renamed.
4. Severity rules same as above.

### `schema-diff`

For database-schema components:

1. Run a schema dump at LV and HEAD (typically via migration
   replay against an empty DB or via `pg_dump --schema-only` /
   equivalent).
2. Diff: added/removed tables, added/removed/modified columns,
   constraint changes.
3. Severity:
   - Removed columns / tables → `high`.
   - Required-column additions → `medium`.
   - Optional-column additions → `low`.

### `manual`

The component opted out of automated structural checks. L2 does not run.
The L1 suspect remains a suspect; in `--mode=full` it is automatically
nominated for L3.

## Procedure

For each L1 suspect:

1. Read `verification_signal`.
2. Dispatch to the appropriate sub-procedure above.
3. Record the L2 result (verdict + evidence) keyed by component_id.
4. If the structural diff tooling fails to run (e.g. spec file missing,
   migration tool not installed), record a `tool-error` outcome with
   severity `low` and a recommended action of "configure structural
   diff tooling for this `verification_signal`".

## Severity propagation

L2 severity overrides L1 severity for the same component:

- If L2 says `high`, the row's severity is `high` (regardless of L1).
- If L2 says `medium`, severity is `max(L1, medium)`.
- If L2 says `low` or finds no change, the row keeps L1 severity but
  the evidence is augmented: "L1 suspect; L2 found no public-interface
  change."

## Acceptance

- Every L1 suspect has an L2 verdict (or `manual` skip).
- L2 evidence is specific (lists endpoints / symbols / routes / columns,
  not just "diff detected").

## Hand-off

`steps/03-l3-llm-contradiction.md` (gate mode skips this and goes to
step 5).
