---
name: review-requirements-package
description: "Use when the user asks to review, validate, or check readiness of an assembled requirements package; says 'review the requirements package', 'validate requirements', 'check requirements readiness', 'requirements review', 'check scope/completeness/consistency/measurability/testability', 'requirements handoff readiness', 'is the requirements package ready for the architect'. Independently invocable; assumes the package is already assembled."
---

# Review Requirements Package

## Overview

Runs the formal review sequence and final readiness gate against an already-assembled requirements package. Produces findings and a verdict (PASS / PASS WITH OBSERVATIONS / FAIL) per review, ending with `review-requirements-readiness` as the GO/NO-GO gate before design handoff. Independently invocable: the user can run this skill against any existing requirements package without re-running creation.

The review sequence is strict — twelve reviews in fixed order, no parallel execution. A FAIL verdict halts the sequence; the user fixes (with this skill's help if asked) and the failed review re-runs from the beginning. If a fix changes content checked by an earlier passed review, that earlier verdict is explicitly re-evaluated.

## When to use

- An assembled `requirements-package.md` exists and the user wants validation before design handoff
- User says: "review the requirements package", "validate requirements", "check requirements readiness", "requirements handoff readiness", "is the requirements package ready"
- Re-validating after a downstream skill (design or implementation) flagged a requirements gap
- Re-validating after the requirements change tracker recorded amendments

## When NOT to use

- The package is not yet assembled — run `create-requirements-package` first
- The user wants validation of a design or implementation package — use `review-design-package` or future `review-implementation-package`
- The user wants to create requirements — `create-requirements-package`

## Inputs

| Name | Required? |
|---|---|
| Assembled `requirements-package.md` | yes |
| `change-tracker.md` | yes |
| `completeness-tracker.md` | yes |
| Analysis artifacts (when present) | yes (for traceability review) |
| `project.toml` | yes (for flow detection and policy gates) |

See `references/INPUTS-OUTPUTS.md` for the full table.

## Step 0 — Locate the upstream artifact (SoD only)

Before running the review sequence, resolve the path to the assembled
requirements artifact under the project's current stage configuration.

All three modes below nest the artifact under a `<feature-id>/` directory, and
that segment is conditional on `features.toml` existing — resolve it by
`references/ai-principles/feature-precondition.md`, which drops the segment
(keeping the filename prefix) for a project that has not opted in. "Legacy"
names the non-SoD layout only; it is orthogonal to feature-ID opt-in, so an
opted-in project in legacy mode still carries the segment.

- **Legacy mode.** If `[stages.requirements]` has neither `dir` nor
  `colocate_with_source`, the artifact lives at
  `{project.paths.requirements_package}/{feature-id}/{feature-id}-requirements.md`.
  No scoping needed.
- **SoD directory mode** (`[stages.requirements].dir = "..."`). The artifact
  lives under `<host-repo>/<artifact_subdir>/requirements/`:
  - **Single-repo:** under `<repo-code>/<feature-id>/<feature-id>-requirements.md`.
    The user identifies the feature; if the `<repo-code>` is ambiguous, prompt.
  - **Cross-cutting:** under
    `_cross-cutting/<feature-id>/<feature-id>-requirements.md`.
    The artifact's YAML frontmatter carries `affects_repos` (validated as
    part of review-completeness).
- **SoD colocate mode** (uncommon for requirements): single-repo only;
  artifact lives under `<source-repo-path>/<artifact_subdir>/requirements/<feature-id>/<feature-id>-requirements.md`.

This step is **read-only** — no permission check required (the review skill
does not write to the upstream artifact). When the review skill writes its
own findings, it writes them into the same stage feature directory as the
upstream artifact: `{paths.requirements_package}/<feature-id>/review/...` in
legacy mode, the resolved SoD directory's `review/` otherwise.

If executed non-interactively without an explicit `feature-id` (and `scope`
when ambiguous), **fail fast** with a clear error rather than blocking on a
prompt.

See `_docs/sod-multi-repo-proposal.md` § 5 and `config/SCHEMAS.md` § 5 for
the full SoD layout geometry.

## Precondition — active feature

Follow `references/ai-principles/feature-precondition.md` Mode B, before Step 0. If `features.toml` is absent, skip feature resolution, but still map this skill's paths per that file's § *Not opted in* before reading or writing — they are spelled in the opted-in form. If present and `[user].active_feature` does not resolve, halt and invoke `select-feature` in select-only mode (`caller: review-requirements-package`) rather than guessing which feature's package to review — do not fall back to creating one. If it resolves, echo the feature ID and the resolved artifact path before Review 1.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Run reviews strictly in order. Do not parallelize. Present findings and verdict after each review. Stop on any FAIL until resolved.

**CRITICAL — Write artifacts to disk immediately:**
After each review verdict is accepted by the user, **immediately create** the file `review/<review-name>.md` on disk (under the output path declared in the Output table below). Do NOT wait until all twelve reviews are complete. After Review 12, **immediately create** `review/readiness-verdict.md`. These files are mandatory deliverables — presenting findings only in chat without writing the files is a skill failure. If the `review/` directory does not exist, create it.

| Order | Review | What it checks |
|---|---|---|
| 1 | review-scope | Scope is well-defined, bounded, free of creep |
| 2 | review-completeness | No missing requirements, undefined edge cases, coverage gaps |
| 3 | review-consistency | No contradictions, ambiguity, or duplicates |
| 4 | review-measurability | Quantifiable language, SMART scoring |
| 5 | review-testability | Every requirement has verifiable acceptance criteria |
| 6 | review-implementation-leakage | What, not how |
| 7 | review-data-completeness | Data dictionary and impacts fully specified |
| 8 | review-traceability | Forward to acceptance criteria, backward to needs |
| 9 | review-feasibility | No structurally infeasible or constraint-violating requirements |
| 10 | review-adversarial-pass | Wraps `meta/review-adversarial` with `--stage=requirements` |
| 11 | review-edge-cases | Wraps `meta/review-edge-case-hunter` with `--stage=requirements` |
| 12 | review-requirements-readiness | Final go/no-go gate (last) |

The detailed instructions, halt conditions, and verdict templates live in `references/review-workflow.md`.

## Output

| Artifact | Path | Format |
|---|---|---|
| Per-review findings | `{paths.requirements_package}/<feature-id>/review/<review-name>.md` | Markdown — findings + verdict |
| Adversarial findings file | `{paths.requirements_package}/<feature-id>/review/adversarial-findings.md` | `aide-adversarial-findings@1` (Format 4) |
| Edge-case findings file | `{paths.requirements_package}/<feature-id>/review/edge-case-findings.md` | `aide-adversarial-findings@1` (Format 4) |
| Final readiness verdict | `{paths.requirements_package}/<feature-id>/review/readiness-verdict.md` | Markdown — APPROVED / CONDITIONAL / BLOCKED |
| Updated `change-tracker.md` rows | `{paths.requirements_package}/<feature-id>/requirements/change-tracker.md` | Markdown table — `Trigger = Review finding` rows for any fix |

## Next skill

- If readiness verdict = APPROVED → `create-design-package`
- If readiness verdict = BLOCKED → back to `create-requirements-package` to address the failing area, then re-run this skill

## Common mistakes

- **Not writing review files to disk.** Each review MUST produce a `review/<review-name>.md` file on disk immediately after the user accepts the verdict. The final `review/readiness-verdict.md` MUST be written after Review 10. Presenting results only in chat without creating the files is the most common failure mode of this skill.
- Running reviews in parallel. The sequence depends on earlier verdicts being settled before later reviews run.
- Skipping ahead. Every review depends on the verdict of the one before it.
- Treating PASS WITH OBSERVATIONS as PASS. Observations must be logged and the user must explicitly accept them.
- Forgetting to re-run an earlier review when a fix materially changes its checked content.
- Authoring requirements during review. This skill validates only — fixes are deferred to `create-requirements-package` (or done with this skill's help in a clearly bracketed fix-then-re-validate cycle).
- Skipping the readiness gate. `review-requirements-readiness` is the last review; without an APPROVED verdict, design handoff is blocked.
- Treating the adversarial wrappers as optional. Reviews 10–11 run like any other sub-review and their verdicts feed the readiness gate. They are the layer that catches what the nine mechanical reviews miss.
- Not appending `Review finding` rows to the change tracker for every fix the review triggers.
