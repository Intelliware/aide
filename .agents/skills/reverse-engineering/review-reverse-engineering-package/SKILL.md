---
name: review-reverse-engineering-package
description: "Use when the user asks to review, validate, or check readiness of the reverse-engineered Part A + Part B doc set for a single repo before it is ingested into the knowledge base. Says 'review the RE output for <repo>', 'validate reverse-engineering for <repo>', 'check RE readiness', 'is the RE pass ready for the KB', 'review reverse-engineering package'. Independently invocable; assumes Part A and Part B already exist for the repo."
---

# Review Reverse-Engineering Package

## Overview

Runs the formal review sequence and final readiness gate against the Part A (internal) + Part B (consumer) doc set produced for one repo by `analyze-repository` and the appropriate domain RE skill. Produces findings and a verdict (PASS / PASS WITH OBSERVATIONS / FAIL) per review, ending with `review-re-readiness` as the GO/NO-GO gate before KB ingestion.

The review sequence is strict — nine reviews in fixed order, no parallel execution. A FAIL verdict halts the sequence; the user fixes (with this skill's help if asked) and the failed review re-runs from the beginning. If a fix changes content checked by an earlier passed review, that earlier verdict is explicitly re-evaluated.

Per-repo. Run once per repo before `build-knowledge-base` ingests its output.

## When to use

- Part A + Part B docs exist under `<knowledge_base_path>/source-docs/<repo-slug>/` and the user wants validation before KB ingestion
- User says: "review the RE output for `<repo>`", "validate reverse-engineering for `<repo>`", "check RE readiness", "is the RE pass ready for the KB"
- Re-validating after the source repo changed and RE was re-run

## When NOT to use

- The Part A + Part B docs don't exist yet — run `analyze-repository` and the dispatched domain skill first
- The user wants to review the global KB instance (not a single repo's RE output) — use `review-knowledge-base-package`
- The user wants to fix RE findings — this skill produces findings only; fixes are authored by re-running the relevant RE skill (or directly)

## Inputs

| Name | Required? |
|---|---|
| Part A doc set | yes — under `<knowledge_base_path>/source-docs/<repo-slug>/internal.md` (and any per-section files) |
| Part B doc set | yes — under `<knowledge_base_path>/source-docs/<repo-slug>/consumer.md` (and per-section files) |
| Source repo | yes — for grounding, freshness, and traceability checks |
| `project.toml` | yes — for `[project.paths] knowledge_base_path` and `[[project.repos]]` entry |

See `references/INPUTS-OUTPUTS.md` for the full table.

## Workflow

Run reviews strictly in order. Do not parallelize. Present findings and verdict after each review. Stop on any FAIL until resolved.

| Order | Review | What it checks |
|---|---|---|
| 1 | review-section-completeness | All required Part A and Part B sections (per the domain skill's spec) are present |
| 2 | review-grounding | Every claim references a source file or commit; no fabrications |
| 3 | review-consistency | Part A (internal) and Part B (consumer) tell a consistent story |
| 4 | review-coverage | Public artifacts (exported APIs, schemas, routes) are all surfaced |
| 5 | review-freshness | `last_verified_against_commit` matches the source repo HEAD; no drift |
| 6 | review-traceability | Component frontmatter `paths` resolve to real files |
| 7 | review-adversarial-pass | Wrapper around `meta/review-adversarial` with `--stage=reverse-engineering` |
| 8 | review-edge-cases | Wrapper around `meta/review-edge-case-hunter` with `--stage=reverse-engineering` |
| 9 | review-re-readiness | Final go/no-go gate (last) |

Detailed instructions, halt conditions, and verdict templates live in `references/review-workflow.md`.

## Output

| Artifact | Path | Format |
|---|---|---|
| Per-review findings | `<knowledge_base_path>/source-docs/<repo-slug>/review/<review-name>.md` | Markdown — findings + verdict |
| Adversarial findings file | `<knowledge_base_path>/source-docs/<repo-slug>/review/adversarial-findings.md` | `aide-adversarial-findings@1` (Format 4) |
| Edge-case findings file | `<knowledge_base_path>/source-docs/<repo-slug>/review/edge-case-findings.md` | `aide-adversarial-findings@1` (Format 4) |
| Final readiness verdict | `<knowledge_base_path>/source-docs/<repo-slug>/review/readiness-verdict.md` | Markdown — APPROVED / CONDITIONAL / BLOCKED |

## Next skill

- If readiness verdict = APPROVED → `build-knowledge-base` (or `update-knowledge-base` if KB already exists)
- If readiness verdict = BLOCKED → re-run the relevant RE skill to address the failing area, then re-run this skill

## Common mistakes

- Running reviews in parallel. The sequence depends on earlier verdicts being settled before later reviews run.
- Treating PASS WITH OBSERVATIONS as PASS without explicit user acceptance.
- Skipping the readiness gate. `review-re-readiness` is the last review; without an APPROVED verdict, KB ingestion is blocked.
- Authoring RE content during review. This skill validates only — fixes are deferred to the RE skill that produced the docs.
- Treating the adversarial wrappers as optional. They run as sub-reviews 7–8; their verdicts feed the readiness gate.
- Confusing this skill with `review-knowledge-base-package`. This one reviews ONE repo's RE output before ingestion. The KB-package skill reviews the GLOBAL KB after ingestion.

## See also

- `references/OVERVIEW.md` — extended rationale and per-review depth
- `references/INPUTS-OUTPUTS.md` — full input/output contract
- `references/EXAMPLE.md` — worked end-to-end example
- `references/review-workflow.md` — detailed sequence with verdict templates
- `references/review-patterns/review-output-format.md` — Format 4 schema (used by sub-reviews 7–8)
- `references/review-patterns/review-verdict-mapping.md` — how the wrappers map findings to verdicts
