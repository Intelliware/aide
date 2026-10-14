---
slug: kb-tag-verification
sequence: 3
depends-on-prior: true
---

# Step 3 — KB-grounded marker verification (live drift check)

## Purpose

Verify that the test markers (tags, scenario names, spec selectors)
that the traceability matrix claims to exist **actually exist in the
test suite**. This is the difference between a paper audit (reads
trackers, trusts them) and a real audit (reads trackers, then proves
their claims against the source). Drift detected here is the most
common single source of false confidence in QE coverage.

This step is **optional**. It runs when at least one of these is
available:

1. A knowledge base (`{paths.knowledge_base_path}` configured in
   `project.toml`)
2. The test-suite codebase on disk (`[project.testing].qe_repo` when
  configured; otherwise the in-scope code repo fallback)

If neither is available, skip with a clear note and recommend
`build-knowledge-base` as the path to enable the check next time.

## Procedure

### 3a. Determine the marker scheme

Read `{paths.quality_package}/<feature-id>/quality/automation-and-cicd.md`
for the team's marker / tag / scenario-naming convention. Typical
schemes:

- Tag annotations on scenarios (e.g. `@INC-001`, `@feature-name`,
  `@regression`)
- Naming convention on spec / scenario titles (e.g. spec name contains
  the INC ID or the AC ID)
- Filename convention (e.g. `INC-001-*.feature` or `*-INC-001.spec.ts`)
- A test-ID column in an external test-management export

Do **not** assume Cucumber / Gherkin / Playwright / any specific
framework. The scheme is whatever the team pinned in their
automation-and-cicd block. If multiple schemes are pinned, check all.

### 3b. Decide the lookup mechanism

Prefer the KB. Fall back to the codebase. Both is fine.

**KB path (preferred):** If `{paths.knowledge_base_path}` is set,
invoke `navigate-knowledge-base` with the audit scope to get the
ranked list of test-suite KB components. Read each component's
`tests:` / `markers:` / `scenarios:` frontmatter and body. This is
the framework-native way to ask the KB "what tests exist?".

If the KB looks stale (per-component `last_verified_at` older than
the configured drift threshold), record a `KB freshness warning`
and recommend `detect-knowledge-base-drift` as a follow-up — but
proceed with the check.

**Codebase path (fallback):** When the KB is not configured or
returns no test-suite component, search the resolved test-suite repo
directly using the marker scheme from 3a. Resolve that repo from
`[project.testing].qe_repo` first; only use the code repo fallback when
the field is unset:
- For tag schemes: grep for the tag literal across test files
- For naming schemes: grep for the ID in spec / scenario titles
- For filename schemes: glob the filename pattern

Cap the search to the resolved QE repo (or fallback code repo) listed in
`project.toml`; do not traverse arbitrary paths or silently fan out to all
repos.

### 3c. Per-INC verification

For each INC that Step 2 marked `Coverage claimed = yes`:

1. Collect the expected markers from `traceability.md` (the matrix
   should record either the marker directly or a test ID that maps
   to one via the team's scheme).
2. Confirm each expected marker is present in the suite via 3b.
3. Record the result:
   - **✅ Verified** — marker found at least once; record the
     scenario / spec count
   - **❌ Drift** — marker not found; the matrix claims coverage but
     the artifact is missing or renamed
   - **⚠️ Ambiguous** — marker found but in a quantity that
     contradicts what the matrix claims (e.g. matrix says 4 scenarios,
     suite has 1)

### 3d. Update the provisional verdict

For each INC, upgrade or downgrade Step 2d's verdict:

| Step 2 verdict | Step 3 result | Final verdict |
|---|---|---|
| ✅ Fully covered (pending drift check) | ✅ Verified | ✅ Fully covered |
| ✅ Fully covered (pending drift check) | ❌ Drift | ⚠️ Drift (coverage claimed but missing) |
| ✅ Fully covered (pending drift check) | ⚠️ Ambiguous | ⚠️ Drift (coverage count mismatch) |
| 🔄 In-progress | (any) | 🔄 In-progress (drift check deferred until completion) |
| ⚠️ Ready but not started | (any) | ⚠️ Ready but not started |
| 🔴 Blocked on dev | (any) | 🔴 Blocked on dev |
| ➖ Not applicable / accepted exception | (any) | ➖ unchanged |

### 3e. Skip path

If neither KB nor codebase is available, do **not** halt. Record:

> Live drift check skipped — no knowledge base configured and the
> test-suite repos are not accessible from this workspace. Coverage
> verdicts reflect tracker contents only. Run `build-knowledge-base`
> on the test suite (or `update-knowledge-base` if a KB already
> exists) to enable the drift check next time.

Mark every "✅ Fully covered" verdict as "✅ Fully covered (paper)" in
the Step 4 report so the user knows the verification was tracker-only.

## Next

Proceed to `steps/04-produce-report.md`.

