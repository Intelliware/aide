---
slug: validate-coverage
sequence: 8
depends-on-prior: true
---

# Step 8 — Validate coverage

## Goal

Self-check the freshly built KB before handing off. Catch authoring
mistakes here so they do not propagate to downstream stages. This is a
**lighter** check than `verify-knowledge-base-coverage` — that skill does
the deeper sweep across all source repos. This step verifies internal
consistency.

## Inputs

- The complete KB at `<kb>/`.
- All RE source docs under `<kb>/source-docs/<repo>/`.

## Checks

### 8a — Schema conformance

1. Every `components/**/*.md` parses YAML frontmatter cleanly.
2. Every required field per `config/SCHEMAS.md` § 3.2 is present:
   `component_id`, `repo`, `type`, `description`, `triggers`, `paths`,
   `last_verified_against_commit`, `source_doc`, `verification_signal`.
3. Every `description` starts with the literal `Use when ` (case-sensitive).
4. Every `last_verified_against_commit` is exactly 40 hex chars.
5. Every `repo` matches a `code` in `[[project.repos]]`.
6. Every `type` is one of: `api-feature`, `ui-feature`, `framework`,
   `mobile-feature`, `database-schema`, `shared-library`.
7. Every `verification_signal` is one of: `openapi-diff`,
   `exported-symbols-diff`, `route-inventory-diff`, `schema-diff`, `manual`.
8. Every `source_doc` is a non-empty string.
9. `component_id` is unique across the entire KB.

### 8b — Edge integrity

1. Every `depends_on` entry resolves to an existing `component_id`.
2. Every `consumed_by` entry resolves to an existing `component_id`.
3. `depends_on` and `consumed_by` are symmetric (every A→B in
   `depends_on` has B→A in `consumed_by`).
4. `graph.json` `nodes.length` equals component file count.
5. Every `graph.json` edge `from` / `to` matches a node `id`.
6. No self-edges in `graph.json`.

### 8c — Coverage of public artifacts

For each repo, enumerate from RE Part B:

- API endpoints / routes (from OpenAPI tags or controller manifests).
- Exported framework symbols (from Part B's "Public API" section).
- Application entry points (from Part B's "Routes" / "Screens" section).

For each artifact, confirm it appears under at least one component's
`paths:` (literal path or matching glob). Any artifact with zero
component-coverage is reported as an **orphan** in the build report.

This check is best-effort on initial build — `verify-knowledge-base-coverage`
runs the deep sweep next.

### 8d — Capability index sanity

Every cluster of components with similar `description` verb-phrases has at
least one Capability Index row in `ARCHITECTURE.md` § 4.

### 8e — Skeleton completeness

- `<kb>/ARCHITECTURE.md` exists and has all sections.
- `<kb>/NAVIGATE.md` exists (or, for legacy KBs built before the rename,
  `<kb>/CLAUDE.md` — readers resolve `NAVIGATE.md` first and fall back).
- `<kb>/graph.json` exists and parses.
- `<kb>/glossary.md` and `<kb>/change-tracker.md` exist.
- For every `[[project.repos]]` entry, both
  `repos/<code>/README.md` and `repos/<code>/NAVIGATE.md` exist (legacy
  KBs: `CLAUDE.md` in place of `NAVIGATE.md` is acceptable).
- `synthesized/01..10/` directories exist (may have only stub READMEs at
  this point).

## Output

- A build report summarising: # components emitted, # edges, # shared
  entities, # orphans (artifacts with no component), # warnings (e.g.
  `manual` verification_signal, ambiguous edge-kind inference flagged in
  step 5).

- If any check in 8a or 8b fails: STOP. Do not hand off. Fix and re-run
  (this skill is idempotent under overwrite-mode).

- If 8c finds orphans or 8d finds gaps: WARN but proceed. The next
  skill, `verify-knowledge-base-coverage`, performs the authoritative
  coverage sweep.

## Hand-off

`verify-knowledge-base-coverage` (mode=`baseline`).

After that, control returns to whichever skill invoked
`build-knowledge-base` — typically `start-project`, which then routes to
the next stage skill (in brownfield mode this is
`create-requirements-package`).
