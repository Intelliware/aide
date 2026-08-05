# Overview — review-knowledge-base-package

## Purpose

`review-knowledge-base-package` is the periodic-audit gate for the global KB. It exists to give teams a single, comprehensive readiness signal for the KB on a cadence — not on every change. The per-change signal continues to come from `detect-knowledge-base-drift`; this skill aggregates that plus six other lenses into one verdict.

## Why it exists

The KB is the long-lived ground truth that downstream skills consult. Its quality drifts in different ways than per-feature artifacts:

- Components grow stale as their source repos move (drift)
- New artifacts ship without corresponding KB leaves (coverage gaps)
- Frontmatter schema evolves but old leaves don't catch up (frontmatter rot)
- Links to renamed sections break silently (link rot)
- The solution-context layer (added in 1.1.0) gets neglected once the initial capture is done (staleness in shared/)
- The architecture index becomes inconsistent with the components it describes

No single existing skill caught all of these. `verify-knowledge-base-coverage` and `detect-knowledge-base-drift` each cover a slice. This skill orchestrates them and adds the missing slices (architecture-index integrity, graph integrity, link integrity, frontmatter integrity, solution-context coverage, plus the two adversarial lenses).

## Per-review depth

### 1. review-architecture-index

Reads `ARCHITECTURE.md`. Checks:

- File exists and parses
- Required sections present (3-paragraph solution summary, repository map, component catalog, capability index, dep graph reference, cross-cutting concerns pointers)
- Section 0 (Solution Overview, added in 1.1.0) links to `shared/solution-context/`
- Repository map matches `[[project.repos]]` in `project.toml`
- Component catalog count matches the number of leaves under `components/`

Verdict: FAIL on missing sections or count mismatch; PASS WITH OBSERVATIONS for thin sections; PASS otherwise.

### 2. review-component-coverage

Invokes `verify-knowledge-base-coverage` and consumes its output. The KB skill produces a coverage gap report; this sub-review maps:

- Any public artifact without a leaf → FAIL (orphan)
- Any leaf marked stale → PASS WITH OBSERVATIONS
- No gaps → PASS

The skill does not duplicate `verify-knowledge-base-coverage`'s logic — it orchestrates and interprets.

### 3. review-graph-integrity

Reads `graph.json`. Checks:

- Parses as valid JSON
- For every node: `depends_on` references resolve to existing nodes
- For every edge: the reverse edge in `consumed_by` exists (symmetry)
- No cycles in `depends_on` (DAG check)
- No orphan nodes (every node is either depended on or consumed by something, OR it's an explicit "root" entry point)

Verdict: FAIL on parse failure, broken references, or cycles; PASS WITH OBSERVATIONS for orphan nodes; PASS otherwise.

### 4. review-frontmatter-integrity

For every leaf under `components/`, `shared/solution-context/`, `shared/ai-rules/`, `shared/operations/`:

- Required fields present per the schema (`component_id`, `repo`, `type`, `description`, `triggers`, `paths`, etc. for components; `description`, `triggers` for solution-context leaves)
- Values conform to expected types
- `description` field starts with "Use when" (per the discovery convention)
- `triggers` is a non-empty array

Verdict: FAIL on missing required fields; PASS WITH OBSERVATIONS for stylistic violations (missing "Use when" prefix); PASS otherwise.

### 5. review-staleness

Invokes `detect-knowledge-base-drift` at L1 (commit-stamp check) for every component leaf, plus L4 (solution-context staleness). Consumes its output.

Verdict: FAIL if any component leaf has stale-severity high; PASS WITH OBSERVATIONS for medium; PASS otherwise. Solution-context staleness never fires FAIL on its own (per design).

### 6. review-link-integrity

Walks every markdown link in `ARCHITECTURE.md`, `CLAUDE.md`, leaves under `components/`, and leaves under `shared/`. For each:

- Internal (`./`, `../`) → resolves to a real file
- Anchor (`#section`) → corresponding section exists in target file
- Source-doc reference (`source-docs/<repo>/...`) → file exists in KB
- External URL → not validated (out of scope; external availability is not a KB concern)

Verdict: FAIL on any internal broken link; PASS WITH OBSERVATIONS for anchor mismatches; PASS otherwise.

### 7. review-solution-context-coverage

Checks `shared/solution-context/`, `shared/ai-rules/`, `shared/operations/` per the layout defined by 1.1.0:

- `solution-context/` has the six expected leaves (`00-overview.md`, `10-personas-and-use-cases.md`, `20-goals-and-kpis.md`, `30-constraints-and-compliance.md`, `40-external-integrations.md`, `50-ownership-and-raci.md`)
- `ai-rules/project-context.md` exists
- `operations/` has the four expected leaves (`00-deployment-topology.md`, `10-environments-and-secrets.md`, `20-slos-and-monitoring.md`, `30-runbooks-and-oncall.md`)
- For each repo in `[[project.repos]]`, at least one solution-context reference touches it

Verdict: FAIL if any required leaf is missing; PASS WITH OBSERVATIONS if leaves exist but are stub-only; PASS otherwise.

### 7.5. review-mainframe-lineage-integrity (conditional)

When `<KB>/lineage/mainframe/` exists — i.e. this project includes mainframe
components and `build-mainframe-data-lineage` has run — this sub-review confirms:

- Every contributing repo's feed-files are present and parse
  (`program-data-bindings.json`, `copybook-record-graph.json`, `dataset-io.json`),
  cross-checked against `build-mainframe-data-lineage`'s step 1 outputs
- Coverage rules 1–10 (per that skill's `steps/08-verify-coverage.md`) all PASS
- `field-where-used.md` covers every canonical field
- Unbound items in `09-unbound-and-flagged-items.md` are categorised — each entry
  carries a triage class (investigate / accept / mitigate). An uncategorised
  unbound item is the finding, not the unbound item itself: lineage always has
  loose ends, and the question is whether someone has looked at them
- Provenance SHAs in `01-lineage-overview.md` match each contributing repo's
  `last_verified_against_commit`, cross-checked against the per-repo Part A/B stamps
- The artefact tree was rebuilt within `[knowledge_base] lineage_max_drift_commits`
  (default 25) of the contributing repos' HEADs

This sub-review exists because lineage is a KB-stage artefact distinct from the
per-repo `source-docs/` trees that sub-reviews 1–7 cover. Without it, the readiness
gate would silently accept a KB whose lineage artefact has fallen out of sync with
the repos that feed it.

**Skipped with a recorded `N/A` verdict when `<KB>/lineage/mainframe/` is absent** —
the same convention `review-quality-package` sub-review 6 uses for
`uses_test_case_increments`. Recording the skip matters: a silently-omitted
sub-review and a legitimately-inapplicable one look identical in a verdict file
otherwise.

Verdict: FAIL if any feed-file is missing or malformed, any coverage rule fails, or
any unbound item lacks a triage class; PASS WITH OBSERVATIONS at the freshness
boundary; PASS otherwise; `N/A` when not applicable.

### 8. review-adversarial-pass (wrapper)

Invokes `meta/review-adversarial --stage=knowledge-base` against `<KB>/ARCHITECTURE.md`. The adversarial lens emphasizes hidden assumptions baked into ARCHITECTURE.md or CLAUDE.md (e.g., "the agent will figure out X" with no instruction; "we use convention Y" with no convention spec).

### 9. review-edge-cases (wrapper)

Invokes `meta/review-edge-case-hunter --stage=knowledge-base` against `<KB>/ARCHITECTURE.md`. The edge-case lens emphasizes branching paths (component dependency edges), and data-shape edges (frontmatter validity).

### 10. review-kb-readiness

Final gate. Reads all nine prior verdicts. Emits APPROVED / CONDITIONAL / BLOCKED with explicit conditions for any PASS WITH OBSERVATIONS.

## Cadence and policy

This skill is **not** intended for per-PR use. The expected use:

- Monthly or quarterly cadence (configured in `framework.toml [knowledge_base.full_review_cadence]`)
- On demand before a major release that depends on KB-grounded decisions
- After a major repo addition / removal in `[[project.repos]]`

For per-PR coverage and drift signals, use `verify-knowledge-base-coverage` and `detect-knowledge-base-drift` directly.

## What this skill does not do

- It does not modify the KB. Fixes are authored by maintenance skills.
- It does not re-run RE. RE-output validation is `review-reverse-engineering-package`.
- It does not block per-PR work. It is a periodic readiness signal.
- It does not duplicate `verify-knowledge-base-coverage` or `detect-knowledge-base-drift` logic — it orchestrates them.
