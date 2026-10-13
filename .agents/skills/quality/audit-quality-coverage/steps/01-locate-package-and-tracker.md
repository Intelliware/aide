---
slug: locate-package-and-tracker
sequence: 1
depends-on-prior: false
---

# Step 1 — Locate Package and Tracker

## Purpose

Resolve the feature scope, locate the implementation package, the
quality package, the traceability matrix, and (if present) the
test-case status tracker. Bootstrap the tracker if and only if it is
missing **and** the composition includes the test-case-increment block.

## Procedure

### 1a. Resolve the entry point

Accept any of the following as the entry point:

- Direct feature ID / folder name (e.g. `outgoing-wires-mvp2`)
- INC ID (resolve the parent feature folder from the INC file path)
- JIRA / ticket ID (use upstream package frontmatter to match a folder)
- Open quality package file path (use its directory)

If the scope cannot be auto-detected, ask once:

> Which feature should I audit? (Provide a feature ID, an INC ID, or a
> path to the assembled quality package.)

Resolve `KB_FEATURE_ROOT` — the quality stage feature directory — per the
project's stage mode (`references/ai-principles/feature-precondition.md`
§ Resolving the stage feature directory):

- **Legacy:** `{paths.quality_package}/<feature-id>/` (not opted in: the
  feature's `docs/` folder, `quality-package/` underneath)
- **SoD directory mode:** `<host-repo>/<artifact_subdir>/quality/<repo-code-or-_cross-cutting>/<feature-id>/`
- **SoD colocate mode:** `<source-repo-path>/<artifact_subdir>/quality/<feature-id>/`

Read `project.toml` to determine the mode. Hold the resolved path for
the rest of the audit.

### 1b. Locate the implementation package

Confirm that `{paths.implementation_package}/{feature-id}/increment-status.md`
exists at the resolved location. If missing, halt with a clear error:

> No implementation package found at
> `{paths.implementation_package}/{feature-id}/`. The coverage audit requires a
> GO implementation package. Route the user to
> `create-implementation-package` or `review-implementation-package`.

Read the file list under `{paths.implementation_package}/{feature-id}/`:
- `increment-status.md` (required)
- `INC-XXX.md` for each increment (required — shard-aware: read per-file
  paths from `increment-status.md` if the package is sharded)

### 1c. Locate the quality package

Resolve the quality artifact path per stage mode (see SKILL Step 0 of
`review-quality-package` for the full SoD geometry). Required artifacts:

- `{paths.quality_package}/{feature-id}/{feature-id}-quality.md` — the assembled package
- `{paths.quality_package}/<feature-id>/quality/traceability.md` — the matrix
- `{paths.quality_package}/<feature-id>/quality/test-design.md` — the test-design block
- `{paths.quality_package}/<feature-id>/quality/automation-and-cicd.md` — the
  automation block (used in Step 3 for the marker scheme)

If the quality package is missing, halt with:

> No quality package found at `{paths.quality_package}/{feature-id}/`. The coverage
> audit requires an assembled quality package. Route the user to
> `create-quality-package`.

### 1d. Locate or bootstrap the test-case status tracker

Check whether `{paths.quality_package}/<feature-id>/quality/plan/test-case-status.md`
exists.

**If found:** record its current state (TC IDs, statuses) for use in
Step 2.

**If absent:**

1. Check the active composition for the `quality/test-case-increment`
   block (composition gate `uses_test_case_increments`).
2. **If the block is in the composition** but the tracker is missing,
   that is itself a finding — record it as a Step 1 anomaly to surface
   in the report. **Bootstrap** an empty tracker only when
   `config/customizations/audit-quality-coverage.toml`
   `bootstrap.tracker_when_missing = true` (default). Otherwise halt
   with a route back to `create-quality-package`.
3. **If the block is not in the composition,** the team has opted out
   of the TC layer. Skip the bootstrap; tests fold inline into the
   application `INC-XXX` flow and there is no TC layer to track.
   Record this in the audit notes so Step 2 knows to read coverage
   solely from `traceability.md`.

The bootstrap is the **only** write this skill ever performs. Use the
canonical columns from the test-case-increment block §4a.4. Initialise
every row at `not-started`.

### 1e. Read the rest of project.toml

Capture for downstream steps:
- Test-stack pins (framework, runner, build tool) from
  `[project.elicitation]`
- Test-suite lookup target from `[project.testing].qe_repo` when set,
  resolved through `[[project.repos]]`; if unset, record the in-scope
  code repo as the fallback. If set but unresolved, surface a project
  config error before Step 3 rather than silently searching all repos.
- Marker / tag conventions referenced in the automation-and-cicd block
- KB path (`{paths.knowledge_base_path}`) — used by Step 3 if present

### 1f. Verification

Summarise to the user:

> **Audit scope located:**
> - Feature: <feature-id>
> - Implementation package: <N> INCs
> - Quality package: <feature-id>-quality.md @ <version>
> - Traceability matrix: <K> rows
> - Test-case status tracker: <present | bootstrapped | not applicable — TC-XXX flow disabled>
> - Test-suite lookup repo: <qe repo from `[project.testing].qe_repo` | code-repo fallback>
> - KB drift check: <will run | skipped — KB not configured>
>
> Proceed to cross-reference?

Wait for acknowledgement.

## Next

Proceed to `steps/02-cross-reference.md`.

