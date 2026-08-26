---
name: review-knowledge-base-package
description: "Use when the user asks to review, audit, validate, or check readiness of the global knowledge base — periodic audit covering architecture index, component coverage, graph integrity, frontmatter integrity, staleness, link integrity, solution-context coverage, mainframe lineage integrity when present, adversarial pass, edge cases, and readiness. Says 'review the KB', 'audit the knowledge base', 'check KB readiness', 'is the KB current', 'periodic KB review', 'review knowledge-base package'. Periodic skill, not gate-blocking on every change. Orchestrates verify-knowledge-base-coverage and detect-knowledge-base-drift; adds adversarial and edge-case sub-reviews; emits a final readiness verdict."
---

# Review Knowledge-Base Package

## Overview

Runs a formal periodic audit of the global knowledge base instance. Produces findings and a verdict (PASS / PASS WITH OBSERVATIONS / FAIL) per sub-review, ending with `review-kb-readiness` as the final summary verdict.

Designed as a **periodic** skill — typically run on a cadence (monthly, quarterly) or on demand when the user wants a snapshot of KB health. The cheap per-PR signal continues to come from `detect-knowledge-base-drift` (which this skill orchestrates as one of its sub-reviews) and `verify-knowledge-base-coverage`. This skill aggregates them and adds the adversarial/edge-case lenses for a fuller readiness picture.

The review sequence is strict — ten sub-reviews in fixed order, no parallel execution. A FAIL halts the sequence; the user fixes (typically by running the relevant maintenance skill) and the failed sub-review re-runs from the beginning.

## When to use

- Periodic KB audit (monthly, quarterly, etc.)
- "review the KB", "audit the knowledge base", "check KB readiness", "is the KB current"
- Before a major release that depends on KB-grounded decisions
- After a significant repository or solution-context change
- After a long quiet period where KB updates may have lagged

## When NOT to use

- Per-PR drift checking — use `detect-knowledge-base-drift` (cheaper, scoped)
- Coverage checking only — use `verify-knowledge-base-coverage` (one of the sub-reviews here)
- Per-repo RE output validation before ingestion — use `review-reverse-engineering-package`
- Reviewing a single KB component leaf — use `meta/review-adversarial` and/or `meta/review-edge-case-hunter` directly

## Inputs

| Name | Required? |
|---|---|
| `<knowledge_base_path>/` (the KB instance) | yes |
| `project.toml` | yes — for `[project.paths] knowledge_base_path` and `[[project.repos]]` |
| `framework.toml` | optional — for staleness thresholds, cadence config |

See `references/INPUTS-OUTPUTS.md` for the full table.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Run sub-reviews strictly in order. Do not parallelize. Present findings and verdict after each. Stop on any FAIL until resolved.

| Order | Sub-review | What it checks |
|---|---|---|
| 1 | review-architecture-index | `ARCHITECTURE.md` exists, well-formed, all sections present |
| 2 | review-component-coverage | Every public artifact has a leaf — invokes `verify-knowledge-base-coverage` |
| 3 | review-graph-integrity | `graph.json` parses; `depends_on` / `consumed_by` are symmetric |
| 4 | review-frontmatter-integrity | Every leaf has required frontmatter fields per the schema |
| 5 | review-staleness | `last_verified_against_commit` is recent across leaves — invokes `detect-knowledge-base-drift` L1 |
| 6 | review-link-integrity | No broken links in `CLAUDE.md`, `ARCHITECTURE.md`, or leaves |
| 7 | review-solution-context-coverage | `shared/{solution-context, ai-rules, operations}/` leaves present |
| 7.5 | review-mainframe-lineage-integrity *(conditional)* | When `<KB>/lineage/mainframe/` exists: feed-files present and consumed, canonical fields covered, unbound host-vars triaged, provenance SHAs match, coverage rules 1–10 PASS. Skipped with a recorded `N/A` verdict otherwise |
| 8 | review-adversarial-pass | Wrapper around `meta/review-adversarial` with `--stage=knowledge-base` |
| 9 | review-edge-cases | Wrapper around `meta/review-edge-case-hunter` with `--stage=knowledge-base` |
| 10 | review-kb-readiness | Final go/no-go gate (last) |

Detailed instructions, halt conditions, and verdict templates live in `references/review-workflow.md`.

## Output

| Artifact | Path | Format |
|---|---|---|
| Per-review findings | `<knowledge_base_path>/_review/<ISO8601>/<review-name>.md` (one per sub-review, ten total) | Markdown — findings + verdict |
| Adversarial findings file | `<knowledge_base_path>/_review/<ISO8601>/adversarial-findings.md` | `aide-adversarial-findings@1` |
| Edge-case findings file | `<knowledge_base_path>/_review/<ISO8601>/edge-case-findings.md` | `aide-adversarial-findings@1` |
| Final readiness verdict | `<knowledge_base_path>/_review/<ISO8601>/readiness-verdict.md` | Markdown — APPROVED / CONDITIONAL / BLOCKED |

Each run gets a fresh ISO-timestamped subdirectory under `_review/`, so historic audits are preserved without overwriting.

## Next skill

- If readiness = APPROVED → no action; KB is healthy.
- If readiness = CONDITIONAL → conditions recorded; address per cadence.
- If readiness = BLOCKED → user runs the relevant maintenance skill (`update-knowledge-base`, re-run a specific RE skill, `capture-solution-context` for missing solution-context leaves, etc.) and re-runs this skill.

## Common mistakes

- Running this on every PR. It's periodic by design; the per-PR signal is `detect-knowledge-base-drift`.
- Running reviews in parallel. The sequence depends on earlier verdicts.
- Treating PASS WITH OBSERVATIONS as PASS without explicit acceptance.
- Skipping sub-reviews 8–9 (adversarial/edge). They're the layer that catches what the mechanical checks (1–7) miss.
- Mutating leaves during review. This skill validates only — fixes are authored by maintenance skills.
- Confusing this skill with `review-reverse-engineering-package`. This one reviews the GLOBAL KB. The RE one reviews ONE repo's RE output before ingestion.

## See also

- `references/OVERVIEW.md` — extended rationale and per-review depth
- `references/INPUTS-OUTPUTS.md` — full input/output contract
- `references/EXAMPLE.md` — worked end-to-end example
- `references/review-workflow.md` — detailed sequence with verdict templates
- `references/review-patterns/review-output-format.md` — Format 4 schema (used by sub-reviews 8–9)
- `references/review-patterns/review-verdict-mapping.md` — how the wrappers map findings to verdicts
- `verify-knowledge-base-coverage` SKILL — the engine sub-review 2 orchestrates
- `detect-knowledge-base-drift` SKILL — the engine sub-review 5 orchestrates
