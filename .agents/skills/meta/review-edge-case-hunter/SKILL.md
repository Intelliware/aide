---
name: review-edge-case-hunter
description: "Use when the user asks to walk every branching path and boundary condition in an A.I.D.E. artifact and report only what's not handled. Says 'edge-case review of X', 'find unhandled edge cases in X', 'walk the paths in this design', 'what edges does this requirement miss', 'boundary analysis of X'. Method-driven — enumerates branches, error paths, boundaries, concurrency edges, time/clock edges, data-shape edges, authorization edges. Orthogonal to review-adversarial (attitude-driven). Anytime-runnable; also called as a sub-review by every review-*-package skill."
---

# Review Edge-Case Hunter

## Overview

Performs a method-driven edge-case review of a single A.I.D.E. artifact and produces a Format 4 findings file. The skill enumerates every branching path, boundary, error path, and edge condition that the artifact's domain implies, then reports **only those the artifact does not handle**.

Orthogonal to `review-adversarial`: that skill questions intent and framing (attitude-driven). This one walks the artifact's logic exhaustively (method-driven). They catch different failure modes; teams typically run both.

Anytime-runnable. Also invoked by every `review-*-package` skill as the `review-edge-cases` sub-review (the wrapper supplies `--stage` and `--output-path`).

## When to use

- "edge-case review of X" / "find unhandled edge cases" / "what edges does this miss"
- "walk the paths in this design" / "boundary analysis"
- "stress this requirement against weird inputs"
- A `review-*-package` skill is invoking this skill as a sub-review

## When NOT to use

- The user wants attitude-driven critique (weasel words, hidden assumptions, framing) — use `review-adversarial`. Run both for complete coverage.
- The user wants to review running code rather than an artifact — out of scope for this layer.
- The user wants to fix findings — this skill produces findings only.

## Inputs

| Name | Required? |
|---|---|
| `--target=<path>` | yes — path to the artifact file or directory |
| `--stage=<stage>` | optional — one of requirements/design/planning/execution/reverse-engineering/knowledge-base/quick-dev/meta. Auto-detected from artifact frontmatter or path when absent. |
| `--output-path=<path>` | optional — defaults to `_review/<artifact-slug>/<ISO8601>/review-edge-case-hunter.md` for standalone runs; wrappers always supply this. |
| `--target-commit=<sha>` | optional — short SHA recorded in frontmatter. |

See `references/INPUTS-OUTPUTS.md` for the full table.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

1. **Detect target** — resolve `--target`, classify `target_artifact`, infer `--stage` if absent. See `steps/01-detect-target.md`. (Identical to the corresponding step in `review-adversarial`.)
2. **Walk paths** — apply the seven edge categories systematically; for each, enumerate the edges the artifact's domain implies, then report only those not handled. See `steps/02-walk-paths.md`.
3. **Emit Format 4 findings file** — render to `--output-path` per `references/review-patterns/review-output-format.md`. See `steps/03-emit.md`.

## Output

| Artifact | Path | Format |
|---|---|---|
| Findings file | `--output-path` (caller-supplied or default) | `aide-adversarial-findings@1` (Format 4) |

Side effects: none beyond writing the findings file. The skill does not modify the target artifact, the change tracker, or any registry.

The Format 4 schema is shared with `review-adversarial` (same `produced_by` field carries the producer's name). Wrappers don't need to know which skill produced a given findings file — they apply the verdict mapping uniformly.

## Next skill

- If invoked from a wrapper: control returns to the wrapper, which maps `worst_severity` → sub-review verdict per `references/review-patterns/review-verdict-mapping.md`.
- If invoked standalone: the user reads findings and decides whether to fix or accept.

## Common mistakes

- Drifting into attitude-driven territory (weasel words, framing). That's `review-adversarial`'s job. Stay in method mode.
- Reporting handled edges as findings — only report what's unhandled. If the artifact says "we ignore X by design", that's handled.
- Inflating the edge list — focus on edges the artifact's domain actually implies, not generic "what if the universe is hostile" enumeration.
- Inflating severity — every finding is `critical`. Keep the bar real.
- Producing findings without evidence — every finding MUST cite a section/line in the target artifact (the section that *should* have addressed the edge).
- Skipping the `none` case — emit a complete Format 4 file even when no findings.
- Running this in parallel with `review-adversarial` and merging outputs into one file. They produce separate files; wrappers consume both.

## See also

- `references/OVERVIEW.md` — extended rationale and edge-category catalog
- `references/INPUTS-OUTPUTS.md` — full input/output contract
- `references/EXAMPLE.md` — worked end-to-end example
- `references/review-patterns/review-output-format.md` — Format 4 schema (shared with `review-adversarial`)
- `references/review-patterns/review-verdict-mapping.md` — how wrappers consume findings
