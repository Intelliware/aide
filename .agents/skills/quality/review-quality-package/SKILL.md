---
name: review-quality-package
description: "Use when the user asks to review, validate, or check readiness of an assembled quality package; says 'review the quality package', 'validate the test plan', 'check test coverage', 'is the quality plan ready', 'quality gate review', 'check the test strategy', 'review the test design', 'are the quality gates measurable', or 'quality readiness for execution'. Independently invocable; assumes the quality package is already assembled."
---

# Review Quality Package

## Overview

Runs the formal review sequence and final readiness gate against an
already-assembled quality package. Produces findings and a verdict per review
(PASS / PASS WITH OBSERVATIONS / FAIL or, for readiness, GO / CONDITIONAL GO /
NO-GO), ending with `review-quality-readiness` as the gate before execution
handoff. Independently invocable: the user can run this against any existing
quality package without re-running creation.

The review sequence is strict — six reviews in fixed order plus one
conditional review for teams that opted into the TC-XXX test-case
increment flow, no parallel execution. A NO-GO or blocking finding halts the sequence; the user fixes (with
this skill's help if asked) and the failed review re-runs from the beginning. If
a fix changes content checked by an earlier passed review, that earlier verdict
is explicitly re-evaluated.

## When to use

- An assembled quality package exists and validation is wanted before execution
  handoff
- User says: "review the quality package", "validate the test plan", "check test
  coverage", "quality gate review", "is the quality plan ready for execution"
- Re-validating after a downstream skill (execution) flagged a quality gap
- Re-validating after the quality change tracker recorded amendments

## When NOT to use

- The package is not yet assembled — run `create-quality-package` first
- The user wants validation of a requirements / design / implementation package
  — use the matching review skill
- The user wants to author or amend the quality package —
  `create-quality-package`
- The user wants to execute the tests / write code — `execute-increments`

## Inputs

| Name | Required? |
|---|---|
| Assembled quality package (`{paths.quality_package}/{feature-id}/{feature-id}-quality.md`) | yes |
| Quality `change-tracker.md` | yes |
| Test-traceability matrix | yes |
| Approved requirements package + readiness verdict | yes |
| Approved design package + readiness verdict | yes |
| GO implementation package (`INC-XXX` set) | yes |
| `project.toml` | yes (flow detection and policy gates) |

See `references/INPUTS-OUTPUTS.md` for the full table.

## Step 0 — Locate the upstream artifact (SoD only)

Before running the review sequence, resolve the path to the assembled quality
artifact under the project's current stage configuration.

All three modes below nest the artifact under a `<feature-id>/` directory, and
that segment is conditional on `features.toml` existing — resolve it by
`references/ai-principles/feature-precondition.md`, which drops the segment
(keeping the filename prefix) for a project that has not opted in. "Legacy"
names the non-SoD layout only; it is orthogonal to feature-ID opt-in, so an
opted-in project in legacy mode still carries the segment.

- **Legacy mode.** If `[stages.quality]` has neither `dir` nor
  `colocate_with_source`, the artifact lives at
  `{paths.quality_package}/{feature-id}/{feature-id}-quality.md`. No scoping needed.
- **SoD directory mode** (`[stages.quality].dir = "..."`). The artifact lives
  under `<host-repo>/<artifact_subdir>/quality/`:
  - **Single-repo:** `<repo-code>/<feature-id>/<feature-id>-quality.md`. The user
    identifies the feature; if `<repo-code>` is ambiguous, prompt.
  - **Cross-cutting:** `_cross-cutting/<feature-id>/<feature-id>-quality.md`. The
    frontmatter `affects_repos` must match the upstream requirements/design
    artifacts (cross-checked during review-coverage).
- **SoD colocate mode:** single-repo only; artifact lives under
  `<source-repo-path>/<artifact_subdir>/quality/<feature-id>/<feature-id>-quality.md`.

This step is read-only — no permission check required. When the review skill
writes its own findings, it writes them into the same stage feature directory as
the upstream artifact: `{paths.quality_package}/<feature-id>/review/...` in legacy
mode, the resolved SoD directory's `review/` otherwise.

If executed non-interactively without an explicit `feature-id` (and `scope` when
ambiguous), fail fast with a clear error rather than blocking on a prompt.

See `_docs/sod-multi-repo-proposal.md` § 5 and `config/SCHEMAS.md` § 5 for the
full SoD layout geometry.

## Precondition — active feature

Follow `references/ai-principles/feature-precondition.md` Mode B, before Step 0. If `features.toml` is absent, skip feature resolution, but still map this skill's paths per that file's § *Not opted in* before reading or writing — they are spelled in the opted-in form. If present and `[user].active_feature` does not resolve, halt and invoke `select-feature` in select-only mode (`caller: review-quality-package`) rather than guessing which feature's package to review — do not fall back to creating one. If it resolves, echo the feature ID and the resolved artifact path before Review 1.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Run reviews strictly in order. Do not parallelize. Present findings and verdict
after each review. Stop on any NO-GO or blocking finding until resolved.

| Order | Review | What it validates |
|---|---|---|
| 1 | review-coverage | Every acceptance criterion, NFR, and increment is covered by a test or carries an accepted exception |
| 2 | review-test-design-quality | Test cases are concrete, deterministic, independently runnable, with explicit expected results |
| 3 | review-quality-engineering | Automation tools and versions pinned; test data has no production secrets; environments defined |
| 4 | review-metrics-and-gates | Release gates and quality metrics are measurable and binary; each gate maps to a CI check |
| 5 | review-traceability | Tests trace to ACs / NFRs / increments; no orphan or speculative cases |
| 6 | review-test-case-increment-shape *(conditional)* | When the quality package was assembled with the `test-case-increment` block (composition gate `project.elicitation.uses_test_case_increments = true`), every `TC-XXX.md` conforms to the test-case-increment shape: typed (scaffolding vs test-case), dependencies declared, artifact-plan present, verification steps stated, and addressable from `test-case-status.md`. **Skipped with a recorded `N/A` verdict if the block was not used.** |
| 7 | review-quality-readiness | Final GO / CONDITIONAL GO / NO-GO gate for execution handoff |

The detailed instructions, halt conditions, and verdict templates live in
`references/review-workflow.md`.

## Output

| Artifact | Path | Format |
|---|---|---|
| Per-review findings | `{paths.quality_package}/<feature-id>/review/<review-name>.md` | Markdown — findings + verdict |
| Final readiness verdict | `{paths.quality_package}/<feature-id>/review/readiness-verdict.md` | Markdown — GO / CONDITIONAL GO / NO-GO |
| Updated `change-tracker.md` rows | `{paths.quality_package}/<feature-id>/quality/change-tracker.md` | Markdown table — `Trigger = Review finding` rows |

## Next skill

- If readiness verdict = GO or CONDITIONAL GO (user-accepted):
  - If the team uses the TC-XXX test-case increment flow → `execute-quality-increments`
  - Otherwise → `execute-increments` (tests fold into application increments
    via TDD)
  - This gate binds execution only when the team elected the **quality-first**
    path at the `review-implementation-package` GO handoff. If the team chose
    the **execute-first** path, `execute-increments` may already be running in
    parallel — this verdict still governs the Quality Package's own readiness
    but does not retroactively block coding. (`[project.testing].qe_repo` plays
    no part in this routing; it only directs where QE-owned test artifacts are
    written.)
- If readiness verdict = NO-GO → back to `create-quality-package` to address the
  failing area, then re-run this skill

## Common mistakes

- Running reviews in parallel. The sequence depends on earlier verdicts being
  settled before later reviews run.
- Treating CONDITIONAL GO as GO. Conditions must be logged and explicitly
  accepted by the user.
- Passing coverage review with unaccounted increments. An increment with no
  mapped test and no accepted exception is a NO-GO.
- Accepting non-measurable gates. "Solid coverage" is not a gate; a numeric
  threshold tied to a CI check is.
- Authoring quality content during review. This skill validates only — fixes are
  deferred to `create-quality-package` (or done with this skill's help in a
  clearly bracketed fix-then-re-validate cycle).
- Skipping the readiness gate. `review-quality-readiness` is last; without GO or
  accepted CONDITIONAL GO, execution handoff is blocked.
- Reviewing without the upstream readiness verdicts. The quality package must
  reference an APPROVED requirements package, a GO design package, and a GO
  implementation package; if any is missing, halt and route back.
