---
name: audit-quality-coverage
description: "Use when the user asks to audit test coverage against an implementation package, check whether all increments have test coverage, produce a coverage report, find INCs with no tests, detect coverage drift, or run a pre-release coverage check; says 'check quality coverage', 'audit coverage', 'are all increments covered', 'coverage report', 'which INCs have no tests', 'coverage gap', 'pre-release quality audit'. Independently invocable at any time; read-only against source code; creates the test-case status tracker only if missing."
---
# Audit Quality Coverage
## Overview
Audits test coverage against every increment in an approved implementation
package. Answers the question: *"Have all increments that require test
coverage actually been covered, and is the coverage we claim to have
actually present in the codebase?"*
Produces a structured coverage report showing each increment's status —
fully covered, in-progress, ready but not started, blocked on dev,
drifted (tracker says covered but the marker is missing in the suite),
or not applicable (dev-owned only) — plus recommended next actions per
gap, each routed to an existing framework skill.
This skill is **read-only** against the application and test codebases.
The only write it ever performs is bootstrapping
`test-case-status.md` in the quality package when no tracker exists
(first-run convenience). It is independently invocable at any time and
appears under the workflow graph's `anytime:` block.
## When to use
- Pre-release: confirm no increment has been missed by the test suite
- After a batch of `execute-increments` or `execute-quality-increments`
  sessions: verify completeness
- Periodic QA audit: "which ready INCs still have no tests?"
- After a knowledge-base drift report: confirm whether the test-coverage
  claims still hold
- User supplies a feature name, INC ID, or quality package path as the
  entry point
## When NOT to use
- The user wants to **author** the quality package — `create-quality-package`
- The user wants to **review** the quality package against its own
  contents — `review-quality-package`
- The user wants to **build test artifacts** for a TC increment —
  `execute-quality-increments`
- The user wants to **triage test failures** — `review-test-failures`
- The user wants to **refresh the knowledge base** — `update-knowledge-base`
  or `detect-knowledge-base-drift`
- The user wants to **execute application code** — `execute-increments`
## Inputs
| Input | Source | Required |
|---|---|---|
| Feature ID / scope | User-provided or auto-detected from INC ID or open quality package | Yes |
| Implementation package | `{paths.implementation_package}/{feature-id}/` (all `INC-XXX.md` + `increment-status.md`) | Yes |
| Quality package | `{paths.quality_package}/{feature-id}/{feature-id}-quality.md` (or SoD-resolved path) | Yes (use the latest assembled version) |
| Test-traceability matrix | `{paths.quality_package}/<feature-id>/quality/traceability.md` | Yes — primary source of "what's claimed to be covered" |
| Test-case status tracker | `{paths.quality_package}/<feature-id>/quality/plan/test-case-status.md` | Recommended; **bootstrapped if absent** |
| `project.toml` | `{project-root}/project.toml` | Yes |
| Knowledge base | `{paths.knowledge_base_path}/` via `navigate-knowledge-base --profile=test-suite` (with `--profile-subkind=marker-vocabulary` and `--profile-subkind=feature-inventory` for the live drift check) | Optional but recommended — enables the live drift check |
| Test suite codebase | `[project.testing].qe_repo` resolved through `[[project.repos]]`; fallback to in-scope code repo when unset | Optional — enables direct marker search when the KB is unavailable |
See `references/INPUTS-OUTPUTS.md` for the full table.
## Verification rule (always-on)
Before claiming completion, summarise the inputs found, the coverage
counts, and the recommended actions; wait for explicit user
acknowledgement before declaring the audit closed. If any input is
missing or ambiguous, surface that to the user before producing the
report rather than silently substituting defaults.
## Precondition — active feature
Follow `references/ai-principles/feature-precondition.md` Mode B, before Step 1. If `features.toml` is absent, skip feature resolution, but still map this skill's paths per that file's § *Not opted in* before reading or writing — they are spelled in the opted-in form. If present and `[user].active_feature` does not resolve, halt and invoke `select-feature` in select-only mode (`caller: audit-quality-coverage`) rather than guessing which feature to audit — do not fall back to creating one. If it resolves, echo the feature ID before locating the packages.
## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow
Execute one step at a time. Read each step file only when starting that
step.
1. `steps/01-locate-package-and-tracker.md` — Resolve the feature scope,
   locate the implementation package, the quality package, the
   traceability matrix, and the test-case status tracker; bootstrap the
   tracker if absent.
2. `steps/02-cross-reference.md` — Build the master coverage list by
   joining `increment-status.md` (dev status per INC) with the
   traceability matrix (claimed test coverage per INC) and the
   test-case status tracker (per-TC implementation status).
3. `steps/03-kb-tag-verification.md` — Optional live drift check: for
   every INC that the matrix claims is covered, verify the test
   marker / tag actually exists in the test suite (via the KB or a
   direct codebase search). Flag drift where the claim does not match
   reality.
4. `steps/04-produce-report.md` — Render the summary table + detail
   table + gaps table per the format in
   `references/coverage-report-format.md`.
5. `steps/05-next-actions.md` — Offer concrete next-action hand-offs
   for every gap (each routed to a framework skill).
## Output
| Artifact | Destination | Format |
|---|---|---|
| Coverage report | Chat | Markdown — summary table + coverage-detail table + gaps table + recommended next actions |
| Bootstrapped test-case status tracker | `{paths.quality_package}/<feature-id>/quality/plan/test-case-status.md` | Markdown table — **only when the tracker did not previously exist** |
| Updated change-tracker row | `{paths.quality_package}/<feature-id>/quality/change-tracker.md` | Markdown table — single row recording the audit and its findings (Trigger note: `Coverage audit`) |
## Next skill
Selected per the gap type (the skill offers a choice; the user picks):
- **Uncovered INC** → `create-quality-package` (extend the package) or
  `execute-quality-increments` (if a TC-XXX increment already exists)
  or `execute-increments` (if tests fold inline)
- **Drift (tracker says covered, marker missing)** →
  `detect-knowledge-base-drift` then `update-knowledge-base`, or
  `execute-quality-increments` to re-author the missing artifact
- **Blocked on dev** → `execute-increments` to ship the application
  increment first
- **All covered, no drift** → confirm and exit
## Common mistakes
- **Marking an INC as covered without verifying the marker exists.**
  Step 3's live drift check is the difference between a paper audit
  and a real one.
- **Skipping Step 2.** The implementation package is the source of
  truth for what must be covered. Reading the quality package alone
  hides "this INC has no traceability row at all" omissions.
- **Reporting coverage as complete while any required INC is not
  `done` in the quality dimension.** An INC marked `done` in
  `increment-status.md` but with no matching test-coverage row is a
  gap, not a pass.
- **Hard-coding paths or tool names.** Every path comes from
  `project.toml`; prefer `[project.testing].qe_repo` for QE-owned test-suite
  lookup when configured. Every marker/tag scheme comes from the quality
  package's `automation-and-cicd` block.
- **Modifying existing trackers.** This skill is read-only; the only
  write is bootstrapping `test-case-status.md` when it does not exist.
- **Treating "no KB available" as a failure.** The KB-grounded drift
  check (Step 3) is optional; skip it with a clear note when the KB
  is not configured, and recommend `build-knowledge-base` /
  `update-knowledge-base` as the path to enable it next time.
- **Using "phase" terminology.** This skill uses "step", "increment",
  and "stage" per framework vocabulary.