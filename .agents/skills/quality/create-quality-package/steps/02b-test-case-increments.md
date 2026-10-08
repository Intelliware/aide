# Step 2b — Test-case increment plan (optional, gated)
## When this sub-step runs
This sub-step runs **only** when the active composition includes the
`quality/test-case-increment` block — i.e. the team has set
`project.elicitation.uses_test_case_increments = true` in `project.toml`.
When the gate is `false`, **skip this sub-step entirely**, record
`Skipped (N/A) — composition gate uses_test_case_increments = false` in
the change tracker, and proceed to Step 3. Tests will then be written
inline inside `execute-increments`'s TDD loop against the test design
authored in Step 2.
When the gate is `true`, decompose the test design from Step 2 into
`TC-XXX` increments that `execute-quality-increments` can later process
one at a time. The shape of every increment is governed by the
`templates/blocks/quality/test-case-increment.md` block (the
canonical 8-block shape projected onto QE artefacts).

Before generating any `TC-XXX` file, resolve the default test-artifact
target repo from `project.toml`: if `[project.testing].qe_repo` is set,
use the matching `[[project.repos]].code` as the QE-owned artifact target;
if it is unset, record that the plan falls back to the in-scope code repo.
If the configured code does not resolve, halt and route the user to fix
`project.toml` before continuing.
## Procedure
### 2b.1 Confirm the gate
Read `project.toml` and confirm
`[project.elicitation].uses_test_case_increments == true`. If absent or
`false`, halt this sub-step, log the skip in the change tracker, and
return to the workflow at Step 3.
If `true`, briefly confirm with the user:
> The composition includes the `test-case-increment` block, so this
> quality package will produce TC-XXX test-case increments executable
> by `execute-quality-increments`. Continue?
Wait for acknowledgement.
### 2b.2 Derive scaffolding increments
From the test design (Step 2), the
`quality/test-data-and-environments` block, and the
`quality/automation-and-cicd` block, identify all preparatory work
required **before any test-case increment can be implemented**. Group
related prep work into logical scaffolding increments. Typical
scaffolding includes:
- Test-framework dependency additions to the build file
- Runner classes / suite definitions / test entry points
- Test-profile / framework configuration files
- Shared test utilities (producers, consumers, async-wait helpers,
  test-data builders, fixtures, page objects)
- Directory structures for test artifacts
- Out-of-tree export configuration (e.g. test-case CSV for an external
  tracker)
Do **not** assume a specific stack. Read the pinned values in the
quality package's automation-and-cicd block to derive what scaffolding
is actually needed for the team's chosen framework + runner + build
tool. If the package pins multiple frameworks (rare), produce
scaffolding for each.

Derive all scaffolding target paths relative to the resolved test-artifact
target repo. Include the repo code in the presented scaffolding list so the
user can see whether artifacts are targeting the QE repo or the code-repo
fallback.
Present the scaffolding-increment list to the user. Wait for
acknowledgement.
### 2b.3 Derive test-case inventory
Using all context gathered so far (Steps 0, 1, 2) plus the full content
of the requirements, design, and implementation packages, derive the
complete test-case inventory. For each test case capture:
| Field | Description |
|---|---|
| TC ID | Unique identifier `TC-{project-code}-{nnn}` |
| Summary | Short description of what the test verifies |
| Category | Category sub-folder (if categorised) — e.g. `e2e`, `integration`, `contract`, `smoke`, `chaos` |
| Test Level | The smallest sufficient level (unit / integration / contract / E2E / NFR) |
| Tags | Filtering tags drawn from the tag vocabulary pinned in automation-and-cicd |
| Priority | P1 / P2 / P3 |
| Traceability | AC / FR / NFR / INC IDs from upstream packages |
| Dependencies | Scaffolding increment IDs + any prior TC-XXX IDs whose shared artifacts this case reuses |
Present the full inventory to the user. Wait for acknowledgement before
generating files.
### 2b.4 Choose plan layout
Ask:
> Plan layout?
>
> **Flat:** every `TC-XXX.md` at the plan root, `{paths.quality_package}/<feature-id>/quality/plan/` (not opted in: `quality-package/quality/plan/` under the feature's `docs/` folder). All `plan/` paths in this step are relative to `{paths.quality_package}/<feature-id>/quality/`.
> **Categorised:** test-case increments under `plan/<category>/TC-XXX.md`
> (scaffolding stays at `plan/TC-XXX.md`).
Record the choice in the test-case-increment block.

Also record the resolved test-artifact target repo in the block:
`qe_repo = <repo-code>` when configured, or `fallback = code repo` when no
QE repo is configured.
### 2b.5 Choose generation mode
Ask:
> How would you like to generate the increment files?
>
> **Option A — All at once:** Generate every TC-XXX file in one pass.
> **Option B — One at a time:** Generate each file individually with a
> hard stop for review between each.
### 2b.6 Generate increment files
For each scaffolding increment, then each test-case increment, generate
a `TC-XXX.md` file conforming to the 8-block shape defined in
`templates/blocks/quality/test-case-increment.md` §4a.2:
1. Increment Identity
2. Goal
3. Dependencies
4. Plan / Implementation Plan (scaffolding) **or** Artifact Plan
   (test-case)
5. Outcome
6. AI Gate
7. Human Gate
8. Success Criteria
Place files per the plan layout chosen in 2b.4. Outcome paths in each
`TC-XXX.md` must be relative to the resolved test-artifact target repo,
unless the user explicitly approves a different repo for a specific
increment. If Option B was chosen,
present each file and wait for acknowledgement before generating the
next.
### 2b.7 Generate plan-overview and status tracker
After all increment files are written, generate:
- **`plan/qe-plan-overview.md`** — lists all increments (scaffolding +
  test-case), their categories, dependencies, and a dependency graph
  showing scaffolding → test-case ordering. Include the resolved
  test-artifact target repo and whether it came from
  `[project.testing].qe_repo` or the code-repo fallback.
- **`plan/test-case-status.md`** — status tracker initialised per the
  columns defined in the test-case-increment block §4a.4. Every
  increment starts at `not-started`.
### 2b.8 Artifact-completeness cross-check
Cross-reference the artifact expectations stated in the
`quality/automation-and-cicd` and
`quality/quality-metrics-and-reporting` blocks (e.g. feature files,
step definitions, fixtures, exports, report configurations) against
the generated increments. Every artifact type the package promises must
appear as a deliverable in at least one increment's Plan / Artifact
Plan section.
If an artifact type is promised but has **no producing increment**,
add a scaffolding or test-case increment for it (e.g. "Generate
test-case CSV export for external tracker"). Present any additions to
the user for acknowledgement.
This ensures nothing the package promises gets silently dropped between
elicitation and plan generation.
### 2b.9 Update package-level traceability
The TC IDs derived here feed the package-level traceability matrix
rendered via `shared/traceability` (test ↔ AC ↔ FR/NFR ↔ INC). Confirm
each new TC ID is reflected there before moving on.
### 2b.10 Change-tracker entries
Append one `Initial Extraction` row per generated artefact:
- `qe-plan-overview.md` — Parts Affected: `Plan Overview`
- `test-case-status.md` — Parts Affected: `Status Tracker`
- Each scaffolding `TC-XXX.md` — Parts Affected: `Scaffolding Increment`
- Each test-case `TC-XXX.md` — Parts Affected: `Test Case Increment`
Use the canonical change-log format from
`templates/blocks/shared/change-log.md`.
## Acknowledgement checkpoint
Summarise what was produced (scaffolding count, test-case count,
category breakdown, support documents written, output path). Ask:
> Is the test-case increment plan complete? Ready to proceed to Step 3
> (quality engineering)?
Wait for confirmation.
## Next
Proceed to `steps/03-quality-engineering.md`.