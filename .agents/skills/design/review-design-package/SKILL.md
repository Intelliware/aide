---
name: review-design-package
description: "Use when the user asks to review, validate, or check readiness of an assembled design package; says 'review the design package', 'review the solution design', 'validate the design', 'check design readiness', 'architecture review', 'security posture review', 'is the design ready for implementation', 'solution readiness', 'implementation handoff'. Independently invocable; assumes the design package is already assembled."
---

# Review Design Package

## Overview

Runs the formal review sequence and final readiness gate against an already-assembled design package. Produces findings and a verdict per review (PASS / PASS WITH OBSERVATIONS / FAIL or, for readiness, GO / CONDITIONAL GO / NO-GO), ending with `review-solution-readiness` as the gate before planning handoff. Independently invocable: the user can run this skill against any existing design package without re-running creation.

The review sequence is strict — five reviews in fixed order (architecture, security-posture, adversarial-pass, edge-cases, readiness), no parallel execution. A NO-GO or blocking finding halts the sequence; the user fixes (with this skill's help if asked) and the failed review re-runs from the beginning. Folder name is `review-design-package` (renamed from the legacy `solution-review` to drop the "solution-" prefix and align with the new stage name "design").

## When to use

- An assembled design package exists and validation is wanted before planning handoff
- User says: "review the design package", "review the solution design", "validate the design", "architecture review", "security posture review", "is the design ready for implementation", "implementation handoff"
- Re-validating after a downstream skill flagged a design gap
- Re-validating after the design change tracker recorded amendments

## When NOT to use

- The design package is not yet assembled — run `create-design-package` first
- The user wants validation of a requirements or implementation package — `review-requirements-package` or future `review-implementation-package`
- The user wants to create or amend the design — `create-design-package`

## Inputs

| Name | Required? |
|---|---|
| Assembled design package (`{paths.design_package}/{feature-id}/{feature-id}-design.md`) | yes |
| Design `change-tracker.md` | yes |
| Architecture baseline (when present) | conditional |
| Approved requirements package + readiness verdict | yes |
| `project.toml` | yes |

See `references/INPUTS-OUTPUTS.md` for the full table.

## Step 0 — Locate the upstream artifact (SoD only)

Before running the review sequence, resolve the path to the assembled design
artifact under the project's current stage configuration.

All three modes below nest the artifact under a `<feature-id>/` directory, and
that segment is conditional on `features.toml` existing — resolve it by
`references/ai-principles/feature-precondition.md`, which drops the segment
(keeping the filename prefix) for a project that has not opted in. "Legacy"
names the non-SoD layout only; it is orthogonal to feature-ID opt-in, so an
opted-in project in legacy mode still carries the segment.

- **Legacy mode.** If `[stages.design]` has neither `dir` nor
  `colocate_with_source`, the artifact lives at
  `{project.paths.design_package}/{feature-id}/{feature-id}-design.md` (or, when
  the project has not opted in, its `solution-package.md` alias). No scoping needed.
- **SoD directory mode** (`[stages.design].dir = "..."`). The artifact lives
  under `<host-repo>/<artifact_subdir>/design/`:
  - **Single-repo:** under `<repo-code>/<feature-id>/<feature-id>-design.md`.
    The user identifies the feature; if the `<repo-code>` is ambiguous, prompt.
  - **Cross-cutting:** under `_cross-cutting/<feature-id>/<feature-id>-design.md`.
    The artifact's YAML frontmatter carries `affects_repos` (must match the
    upstream requirements artifact; cross-checked during review-architecture).
- **SoD colocate mode** (uncommon for design): single-repo only; artifact
  lives under `<source-repo-path>/<artifact_subdir>/design/<feature-id>/<feature-id>-design.md`.

This step is **read-only** — no permission check required (the review skill
does not write to the upstream artifact). When the review skill writes its
own findings, it writes them into the same stage feature directory as the
upstream artifact: `{paths.design_package}/<feature-id>/review/...` in legacy
mode, the resolved SoD directory's `review/` otherwise.

If executed non-interactively without an explicit `feature-id` (and `scope`
when ambiguous), **fail fast** with a clear error rather than blocking on a
prompt.

See `_docs/sod-multi-repo-proposal.md` § 5 and `config/SCHEMAS.md` § 5 for
the full SoD layout geometry.

## Precondition — active feature

Follow `references/ai-principles/feature-precondition.md` Mode B, before Step 0. If `features.toml` is absent, skip feature resolution, but still map this skill's paths per that file's § *Not opted in* before reading or writing — they are spelled in the opted-in form. If present and `[user].active_feature` does not resolve, halt and invoke `select-feature` in select-only mode (`caller: review-design-package`) rather than guessing which feature's package to review — do not fall back to creating one. If it resolves, echo the feature ID and the resolved artifact path before Review 1.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Run reviews strictly in order. Do not parallelize. Present findings and verdict after each review. Stop on any NO-GO or blocking finding until resolved.

| Order | Review | What it validates |
|---|---|---|
| 1 | review-architecture | Structural soundness, scalability, resilience, maintainability |
| 2 | review-security-posture | Security vulnerabilities, authn/authz, data protection, compliance posture |
| 3 | review-adversarial-pass | Wraps `meta/review-adversarial` with `--stage=design` |
| 4 | review-edge-cases | Wraps `meta/review-edge-case-hunter` with `--stage=design` |
| 5 | review-solution-readiness | Final GO / CONDITIONAL GO / NO-GO gate for planning handoff |

The detailed instructions, halt conditions, and verdict templates live in `references/review-workflow.md`.

## Output

| Artifact | Path | Format |
|---|---|---|
| Per-review findings | `{paths.design_package}/<feature-id>/review/<review-name>.md` | Markdown — findings + verdict |
| Adversarial findings file | `{paths.design_package}/<feature-id>/review/adversarial-findings.md` | `aide-adversarial-findings@1` (Format 4) |
| Edge-case findings file | `{paths.design_package}/<feature-id>/review/edge-case-findings.md` | `aide-adversarial-findings@1` (Format 4) |
| Final readiness verdict | `{paths.design_package}/<feature-id>/review/readiness-verdict.md` | Markdown — GO / CONDITIONAL GO / NO-GO |
| Updated `change-tracker.md` rows | `{paths.design_package}/<feature-id>/design/change-tracker.md` | Markdown table — `Trigger = Review finding` rows |

## Next skill

- If readiness verdict = GO or CONDITIONAL GO (user-accepted) → `create-implementation-package`
- If readiness verdict = NO-GO → back to `create-design-package` to address the failing area, then re-run this skill

## Common mistakes

- Running reviews in parallel. Sequence depends on earlier verdicts being settled before later reviews run.
- Skipping ahead. Every review depends on the verdict of the one before it.
- Treating CONDITIONAL GO as GO. Conditions must be logged and explicitly accepted.
- Forgetting to re-run an earlier review when a fix materially changes its checked content.
- Authoring design during review. This skill validates only — fixes are deferred to `create-design-package` (or done with this skill's help in a clearly bracketed fix-then-re-validate cycle).
- Skipping the readiness gate. `review-solution-readiness` is the last review; without GO or accepted CONDITIONAL GO, planning handoff is blocked.
- Not appending `Review finding` rows to the change tracker for every fix.
- Reviewing without the requirements readiness verdict. The design must reference an APPROVED requirements package; if requirements are not approved, halt and route back.
