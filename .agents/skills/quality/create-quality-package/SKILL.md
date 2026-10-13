---
name: create-quality-package
description: "Use when the user asks to create, build, write, or assemble a quality package; says 'create the quality package', 'plan the testing', 'write the test strategy', 'design the tests', 'how will we test this', 'set up the quality plan', 'start the quality stage', 'define quality gates', 'plan test automation', or 'create the QA plan'. Drives the full quality stage: quality strategy (QA analysis), test design traced to acceptance criteria, and a quality-engineering plan (automation, CI gates, test data) — handing off to review-quality-package."
---

# Create Quality Package

## Overview

Drives the quality stage end-to-end: it turns an approved design and an
approved implementation plan into a single Quality Package that says how the
feature will be proven correct before and during execution. The package has
three discipline sections — quality strategy (QA analysis: goals, risk-based
approach, entry/exit + release gates, metrics), test design (software testing:
test levels and concrete cases traced to acceptance criteria, functional
requirements, and `INC-XXX` increments), and a quality-engineering plan
(automation framework, CI/CD gates, test data, environments). Every test
traces back to a requirement acceptance criterion, a design NFR, or an
increment; if it traces to nothing, either the upstream artifact is missing or
the test is speculative and is dropped.

The package is consumed by `execute-increments`: the per-increment TDD loop and
AI/Human gates implement the test design authored here, and the release gates
defined here become the exit criteria for the feature.

## When to use

- An approved design package exists and the user wants the test/quality plan.
  A GO implementation package is the normal input, but this skill may also be
  authored earlier (quality-first or parallel) — when no implementation package
  is on disk yet, it classifies and traces to ACs only and records `INC-XXX`
  rows as `(pending)` for a later re-run
- User says: "create the quality package", "plan the testing", "write the test
  strategy", "design the tests", "set up quality gates", "plan test automation",
  "start the quality stage"
- Updating an existing quality package after the requirements, design, or
  implementation change trackers recorded amendments

## When NOT to use

- The quality package is already assembled and only validation is wanted →
  `review-quality-package`
- The implementation plan is not yet GO → `create-implementation-package` then
  `review-implementation-package`
- The change is trivial → `quick-dev/document-quick-change` (quality folds into
  the combined quick-dev spec; this stage is bypassed)
- The user wants to execute tests / write code → `execute-increments`

## Inputs

See `references/INPUTS-OUTPUTS.md` for the full table. Required:
- Approved `requirements-package.md` (acceptance criteria, NFRs) and its
  `change-tracker.md`
- Approved design package (testing strategy, technical NFRs, security design)
- GO implementation package (all `INC-XXX.md`, `increment-status.md`) when
  available; optional when authoring quality-first / in parallel before INCs
  land (the `INC-XXX` traceability column is then recorded as `(pending)`)
- `project.toml` (flow detection, paths, repo list, elicitation answers such as
  `testing_strategy`, `compliance_regime`)
- Active composition YAML (`templates/compositions/greenfield-quality-package.yaml`)
- Knowledge base (when present and brownfield) — via `knowledge-base/navigate-knowledge-base` with `--profile=test-suite` for test-stack grounding (requires `reverse-engineer-test-suite` output already in the KB); falls back to `--profile=default` for application-side grounding

## Verification rule (always-on)

After every drafted artifact and before any file write, summarize back to the
user what you understood and what you produced; wait for their explicit
acknowledgement (or correction) before proceeding. This applies regardless of
which step you are on. Halt the step if the user disagrees.

## Precondition — active feature

Follow `references/ai-principles/feature-precondition.md` Mode A, before Step 0. If `features.toml` is absent, skip feature resolution, but still map this skill's paths per that file's § *Not opted in* before reading or writing — they are spelled in the opted-in form. If present and `[user].active_feature` does not resolve, halt and invoke `select-feature` (`caller: create-quality-package`) rather than inventing a feature ID from the request. If it resolves, echo the feature ID and the resolved output directory before Step 0.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Sequenced steps. Run one step at a time. Read each `steps/<n>.md` only when you
are about to execute it; do not pre-load every reference.

0. `steps/00-scope-target-repo.md` — (SoD only) inherit the artifact's host repo
   and `affects_repos` from the upstream packages. No-op in legacy mode.
1. `steps/00b-testability-check.md` — **always-on.** Classify every in-scope
   `INC-XXX` (and each unmapped top-level AC) as `automatable` /
   `partially-automatable` / `not-automatable — waived | manual | monitored` /
   `unclear`. Halts on `unclear` and routes back upstream. Output feeds Steps
   1–3 and `audit-quality-coverage`. Reference: `references/testability-classification.md`.
   **When this skill is authored before the implementation package has landed on
   disk (quality-first or parallel authoring), this step classifies the in-scope
   ACs only**; the `INC-XXX` classification is deferred until the implementation
   package lands and the skill is re-run.
2. `steps/01-quality-strategy.md` — author the quality strategy: quality goals,
   risk-based scope, test levels (`test-approach`), entry/exit criteria and
   release gates, and the quality-metrics set.
3. `steps/02-test-design.md` — author test design: concrete test cases /
   scenarios per level, each traced to an acceptance criterion, FR, NFR, or
   `INC-XXX`; record the traceability matrix and test data needs. Apply
   `references/reuse-analysis.md` when proposing shared utilities / fixtures
   / page objects so the design does not re-invent assets the KB or test-suite
   already provide. **When authored before the implementation package has landed
   on disk, traceability rows trace to AC / FR / NFR only and the
   `INC-XXX` column is recorded as `(pending)`** — to be filled on a re-run
   once `INC-XXX.md` files exist.
4. `steps/02b-test-case-increments.md` — **optional, gated.** Runs only when
   `project.elicitation.uses_test_case_increments == true`. Decomposes the
   test design into `TC-XXX` scaffolding + test-case increments executable by
   `execute-quality-increments`. Skipped (recorded `N/A` in the change tracker)
   when the gate is false.
5. `steps/03-quality-engineering.md` — author the quality-engineering plan
   (automation framework + pinned versions, CI/CD gates and coverage
   thresholds, test data and environments), the defect-management approach
   (links to `manage-bugs`), then assemble `quality-package.md`, update the
   change tracker, and hand off by name to `review-quality-package`.

The discipline definitions are in `references/quality-disciplines.md`; the
per-stage touchpoint map is in `references/quality-in-the-lifecycle.md`.

## Output

| Artifact | Path | Format |
|---|---|---|
| Assembled quality package | path resolved per stage mode (SoD: `<host-repo>/<artifact_subdir>/quality/<repo-code-or-_cross-cutting>/<feature-id>/<feature-id>-quality.md`; legacy: `{paths.quality_package}/{feature-id}/{feature-id}-quality.md`) | Markdown (composed per `templates/compositions/greenfield-quality-package.yaml`) |
| Per-section block files | `{paths.quality_package}/<feature-id>/quality/*.md` | Markdown (one block per file) |
| Test-traceability matrix | `{paths.quality_package}/<feature-id>/quality/traceability.md` | Markdown table — test ↔ AC ↔ FR/NFR ↔ INC |
| Change tracker continuation | `{paths.quality_package}/<feature-id>/quality/change-tracker.md` | Markdown table |

## Next skill

review-quality-package

## Common mistakes

- Authoring test cases that trace to nothing. Every case must map to an
  acceptance criterion, FR, NFR, or `INC-XXX`; untraceable cases are dropped or
  routed back to the upstream package.
- Pinning "latest" for a test framework or runner. Every automation tool and
  language version must be explicitly pinned, exactly as the design stage pins
  the production stack.
- Defining release gates that are not measurable. "Good coverage" is not a gate;
  "line coverage >= 80% on changed files, zero open Critical defects" is.
- Re-deriving acceptance criteria here. The quality package tests the approved
  requirements; if an AC is wrong, fix it in `create-requirements-package`.
- Duplicating the design's testing-strategy block verbatim. The design states
  the strategy at a high level; this package operationalizes it into concrete
  cases, data, automation, and gates.
- Skipping the increment mapping. If an increment has no test coverage, either
  add it or record an explicit, accepted exception.
- Handing off to execution without running `review-quality-package`.
