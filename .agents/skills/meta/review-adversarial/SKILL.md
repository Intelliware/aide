---
name: review-adversarial
description: "Use when the user asks to adversarially review, critique, stress-test, or challenge an A.I.D.E. artifact (requirements package, design package, implementation package, RE doc, KB component, KB instance, quick-change brief). Says 'adversarial review of X', 'critique X', 'find what's wrong with X', 'cynical review', 'stress-test these requirements', 'what would a skeptic say about this design', 'challenge my plan'. Attitude-driven — looks for hidden assumptions, weasel words, unsupported claims, missing risks, and scope inflation. Orthogonal to review-edge-case-hunter (method-driven). Anytime-runnable; also called as a sub-review by every review-*-package skill."
---

# Review Adversarial

## Overview

Performs an attitude-driven adversarial review of a single A.I.D.E. artifact and produces a Format 4 findings file. The skill assumes a skeptical reader and looks for everything the original author would rather you not notice — weasel words, hidden assumptions, unsupported claims, missing stakeholders, scope creep, "good news only" framing.

Orthogonal to `review-edge-case-hunter`: that skill walks branches and boundaries (method-driven). This one questions intent, evidence, and framing (attitude-driven). They catch different failure modes; teams typically run both.

Anytime-runnable. Also invoked by every `review-*-package` skill as the `review-adversarial-pass` sub-review (the wrapper supplies `--stage` and `--output-path`).

## When to use

- "adversarial review of X" / "critique X" / "find what's wrong with X"
- "cynical review" / "skeptic's read" / "what would a critic say"
- "stress-test these requirements" / "challenge my plan"
- A `review-*-package` skill is invoking this skill as a sub-review

## When NOT to use

- The user wants method-driven coverage (branches, boundaries, error paths) — use `review-edge-case-hunter` instead. Run both for complete coverage.
- The user wants to review running code rather than an artifact — out of scope for this layer.
- The user wants to fix findings — this skill produces findings only. Fixes are authored via the relevant `create-*-package` skill (or directly).

## Inputs

| Name | Required? |
|---|---|
| `--target=<path>` | yes — path to the artifact file or directory |
| `--stage=<stage>` | optional — one of requirements/design/planning/execution/reverse-engineering/knowledge-base/quick-dev/meta. Auto-detected from artifact frontmatter or path when absent. |
| `--output-path=<path>` | optional — where to write the findings file. Defaults to `_review/<artifact-slug>/<ISO8601>/review-adversarial.md` for standalone runs; wrappers always supply this. |
| `--target-commit=<sha>` | optional — short SHA recorded in frontmatter. Defaults to `git rev-parse --short HEAD` of the repo containing the target. |

See `references/INPUTS-OUTPUTS.md` for the full table.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

1. **Detect target** — resolve `--target`, classify `target_artifact`, infer `--stage` if absent. See `steps/01-detect-target.md`.
2. **Apply attitude lens** — load the stage-appropriate failure-mode catalog and walk the artifact, collecting findings with severity and triage. See `steps/02-apply-lens.md`.
3. **Emit Format 4 findings file** — render to `--output-path` per `references/review-patterns/review-output-format.md`. See `steps/03-emit.md`.

## Output

| Artifact | Path | Format |
|---|---|---|
| Findings file | `--output-path` (caller-supplied or default) | `aide-adversarial-findings@1` (Format 4) |

Side effects: none beyond writing the findings file. The skill does not modify the target artifact, the change tracker, or any registry.

## Next skill

- If invoked from a wrapper: control returns to the wrapper, which maps `worst_severity` → sub-review verdict per `references/review-patterns/review-verdict-mapping.md`.
- If invoked standalone: the user reads findings and decides whether to fix (via the relevant `create-*-package` skill) or accept.

## Common mistakes

- Treating findings as fixes — this skill never edits the target artifact. Findings are advisory; the author authors fixes.
- Drifting into method-driven territory (enumerating every branch). That's `review-edge-case-hunter`'s job. Stay in attitude mode.
- Inflating severity — every finding is `critical`. Keep the bar real: `critical` means the artifact cannot ship as-is.
- Producing findings without evidence — every finding MUST cite a section/line in the target artifact.
- Skipping the `none` case — if you find nothing, emit a complete Format 4 file with empty counts, not no file at all. Wrappers depend on the file existing.
- Running this in parallel with `review-edge-case-hunter` and merging the outputs into one file. They produce separate files; wrappers consume both.

## See also

- `references/OVERVIEW.md` — extended rationale and lens catalog
- `references/INPUTS-OUTPUTS.md` — full input/output contract
- `references/EXAMPLE.md` — worked end-to-end example
- `references/review-patterns/review-output-format.md` — Format 4 schema
- `references/review-patterns/review-verdict-mapping.md` — how wrappers consume findings
