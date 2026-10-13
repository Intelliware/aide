---
slug: gather-failure-data
sequence: 1
depends-on-prior: false
---

# Step 1 — Gather Failure Data

## Purpose

Assemble the canonical failure list that Steps 2–4 will operate on.
Each failure must arrive at Step 2 with **enough evidence to triage
it** — at minimum: scenario / spec identifier, failed step, error
message; ideally also: log excerpt, report row, screenshot, and KB
component reference.

## Procedure

### 1a. Resolve the entry point

Accept any of the following as the failure source:

- **Hand-off from `execute-quality-increments`** — the executor passes
  a structured list (TC ID, scenario, error)
- **Hand-off from `execute-increments`** — the executor passes failing
  test names + diff from a TDD red phase
- **Hand-off from a CI run** — the user pastes / points at the CI
  log, junit.xml, or framework-native report path
- **User-pasted output** — raw stdout/stderr from a local run

If the source is ambiguous, ask once:

> Where are the failures? Paste the output, point at a results file,
> or hand them off from `execute-quality-increments` /
> `execute-increments`.

### 1b. Read the quality package's evidence locations

Read `{paths.quality_package}/<feature-id>/quality/automation-and-cicd.md`
and capture the team's pinned evidence paths:

| Concern | Where to look |
|---|---|
| Per-test reports | `reporting.results_dir` (e.g. JUnit XML, Allure JSON, framework-native) |
| Execution log | `reporting.log_path` |
| Screenshots / artefacts | `reporting.artifacts_dir` |
| Failure naming convention | `reporting.failure_filename_pattern` |

If the team has not declared these paths, ask the user once and note
that the quality package should be updated to capture them (route to
`create-quality-package` after triage if the user agrees).

Do **not** hard-code paths. Do **not** assume Allure / JUnit / any
specific format.

### 1c. Build the canonical failure list

For each failure, capture:

| Field | Required? | Source |
|---|---|---|
| Failure ID (local sequence number) | yes | Assigned `1..N` in input order |
| Scenario / spec name | yes | Report or stdout |
| Spec / feature file path | yes | Report or stdout |
| Failed step / assertion | yes | Report or stdout |
| Error message | yes | Report or stdout |
| Stack trace (if available) | recommended | Report or log |
| Log excerpt around the failure | recommended | `log_path` lines ± 20 around the failure timestamp |
| Screenshot path (if available) | recommended | `artifacts_dir` per failure |
| TC ID (if the team uses TC-XXX flow) | recommended | Match scenario / tag to `test-case-status.md` |
| Run reference (CI run #, local user, timestamp) | recommended | Hand-off context |

If the same scenario fails multiple times in one run (retry artefacts),
group them — present once with the retry count noted.

### 1d. Bulk-mode detection

If the failure count exceeds the configured `bulk_mode_threshold`
(default 10; overridable in
`config/customizations/review-test-failures.toml`), ask the user:

> N failures detected. Options:
>
> **A.** Triage all individually (default — one at a time, slowest
>    but most thorough).
> **B.** Group obvious duplicates first (same error message,
>    same failed step) and triage one representative per group.
> **C.** Filter to a subset (give me a tag, category, or scenario
>    glob).
>
> Which?

Default to **A** if the user declines to choose. Record the choice so
Step 2 knows how many representative failures to walk through.

### 1e. Optional KB warm-up

If a KB is configured (`{paths.knowledge_base_path}`), invoke
`navigate-knowledge-base` once with the failing scope (feature ID,
component names from the failure list) and cache the ranked
component list for Step 2's per-failure cross-references. Skip if no
KB is configured.

### 1f. Verification

Summarise to the user:

> **Failure data gathered:**
> - Source: <hand-off / CI / user-paste>
> - Failures: <N total> — <K representative> after grouping
> - Evidence completeness: <X/N> have full evidence; <Y/N> have
>   error-only
> - KB warm-up: <ran with <K> components / skipped — no KB>
>
> Proceed to walk through failures one at a time?

Wait for acknowledgement.

## Next

Proceed to `steps/02-walk-failures.md`.

