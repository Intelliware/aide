---
name: review-reverse-engineering-package
description: "Use when the user asks to review, validate, or check readiness of the reverse-engineered Part A + Part B doc set for a single repo before it is ingested into the knowledge base — for any of the eleven domains (api, api-framework, web-app, ui-framework, database, mobile-app, mobile-framework, cobol-program, copybook-library, jcl-job, test-suite). Says 'review the RE output for <repo>', 'validate reverse-engineering for <repo>', 'check RE readiness', 'is the RE pass ready for the KB', 'review reverse-engineering package'. Independently invocable; assumes Part A and Part B already exist for the repo."
---

# Review Reverse-Engineering Package

## Overview

Runs the formal review sequence and final readiness gate against the Part A (internal) + Part B (consumer) doc set produced for one repo by `analyze-repository` and the appropriate domain RE skill. Produces findings and a verdict (PASS / PASS WITH OBSERVATIONS / FAIL) per review, ending with `review-re-readiness` as the GO/NO-GO gate before KB ingestion.

The review sequence is strict — nine reviews in fixed order, no parallel execution. A FAIL verdict halts the sequence; the user fixes (with this skill's help if asked) and the failed review re-runs from the beginning. If a fix changes content checked by an earlier passed review, that earlier verdict is explicitly re-evaluated.

Per-repo. Run once per repo before `build-knowledge-base` ingests its output.

This skill is one of the two legal close-outs for a reverse-engineering run. The
domain RE skill asks the user which one to take (see
`references/elicitation-patterns/re-verification-gate-selection.md`); this is the
**review** path, chosen when the extraction warrants human sign-off. The other path
is the automated gate in the RE skill's own `steps/verify.md`. Choosing review does
not skip the mechanical checks — the RE skill runs them first in `review-evidence`
mode and hands their report to this skill (see `## Inputs`).

## When to use

- Part A + Part B docs exist for a repo and the user wants validation before KB ingestion
- The user elected the **review** path at the RE close-out gate
- User says: "review the RE output for `<repo>`", "validate reverse-engineering for `<repo>`", "check RE readiness", "is the RE pass ready for the KB"
- Re-validating after the source repo changed and RE was re-run

## When NOT to use

- The Part A + Part B docs don't exist yet — run `analyze-repository` and the dispatched domain skill first
- The user wants a coverage sweep of the global KB instance (not a single repo's RE output) — use `verify-knowledge-base-coverage`
- The user wants to fix RE findings — this skill produces findings only; fixes are authored by re-running the relevant RE skill (or directly)

## Inputs

| Name | Required? |
|---|---|
| Part A doc set | yes — the composition-rendered tree under `<source-repo-path>/docs/<domain>-internal/` |
| Part B doc set | yes — the composition-rendered tree under `<knowledge_base_path>/source-docs/<repo-slug>/<domain>-consumer/` |
| Both compositions | yes — `templates/compositions/re-<domain>-internal.yaml` and `re-<domain>-consumer.yaml`, the authority on what "complete" means for sub-review 1 |
| `extraction-status.md` + `CHANGE-TRACKER.md` | yes — at the Part-A directory root |
| Mechanical verification report | recommended — produced by the RE skill's `steps/verify.md` in `review-evidence` mode; supplies evidence for sub-reviews 1, 5, 6. When absent, those sub-reviews perform their own checks from scratch |
| Source repo | yes — for grounding, freshness, and traceability checks |
| `project.toml` | yes — for `[project.paths] knowledge_base_path` and the `[[project.repos]]` entry |

See `references/INPUTS-OUTPUTS.md` for the full table.

## Verification rule (always-on)

After every sub-review, summarize back to the user what you checked and what you
found, then wait for their explicit acceptance of the verdict before writing the
verdict file and moving to the next sub-review. This applies regardless of which
sub-review you are on. Halt the sequence if the user disagrees.

## Step 0 — Resolve domain and paths

Before running the sequence, establish which of the eleven domains produced this
output, because every path below is domain-scoped:

1. Read the `[[project.repos]]` entry for the repo and take its `role` / `type`.
2. Confirm against the Part-A directory name on disk (`docs/<domain>-internal/`).
3. If the two disagree, or the repo is absent from `project.toml`, **halt** and ask —
   do not guess the domain. Reviewing against the wrong composition produces
   confidently wrong completeness findings.
4. Resolve `<repo-slug>` the same way the RE skill did, so the Part B path matches
   what was actually written.

Detection signals per domain are the same ones `analyze-repository` uses (file
extensions and source-line markers); reuse that table rather than restating it.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Run reviews strictly in order. Do not parallelize. Present findings and verdict after each review. Stop on any FAIL until resolved.

| Order | Review | What it checks |
|---|---|---|
| 1 | review-section-completeness | Every non-gated block in both compositions has a rendered `<NN>-<bare-slug>.md`, non-stub; numbering gaps correspond to `decision-gates: include-if:` exclusions |
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

All review artifacts are written to `<PART-A>/review/`, where `<PART-A>` is
`<source-repo-path>/docs/<domain>-internal/` — the same directory root that already
holds `extraction-status.md` and `CHANGE-TRACKER.md`. Review findings sit with the
extraction they judge, mirroring how the four artifact stages keep `review/` inside
the package directory.

| Artifact | Path | Format |
|---|---|---|
| Per-review findings | `<PART-A>/review/<review-name>.md` (one per sub-review, nine total) | Markdown — findings + verdict |
| Adversarial findings file | `<PART-A>/review/adversarial-findings.md` | `aide-adversarial-findings@1` (Format 4) |
| Edge-case findings file | `<PART-A>/review/edge-case-findings.md` | `aide-adversarial-findings@1` (Format 4) |
| Final readiness verdict | `<PART-A>/review/readiness-verdict.md` | Markdown — APPROVED / CONDITIONAL / BLOCKED |

**CRITICAL — write artifacts to disk immediately.** After each sub-review verdict is
accepted by the user, create `review/<review-name>.md` at once. Do NOT wait until all
nine are complete. After sub-review 9, immediately create `review/readiness-verdict.md`.
These files are mandatory deliverables — presenting findings only in chat without
writing the files is a skill failure. Create `review/` if it does not exist.

## Next skill

- If readiness verdict = APPROVED → `build-knowledge-base`, which ingests the Part B tree
- If readiness verdict = CONDITIONAL → `build-knowledge-base` may proceed once the user
  explicitly accepts the recorded conditions; the conditions travel in the change tracker
  for the next RE pass
- If readiness verdict = BLOCKED → re-run the relevant RE skill to address the failing area, then re-run this skill

Note this is a *re-extraction* path, not a feature-shipping one — `update-knowledge-base`
is the closing skill for a shipped increment and is not the right target here even when
the KB already exists.

## Common mistakes

- **Not writing review files to disk.** Each sub-review MUST produce a `review/<review-name>.md` immediately after the user accepts the verdict, and `review/readiness-verdict.md` after sub-review 9. Presenting results only in chat is the most common failure mode of this skill.
- Running reviews in parallel. The sequence depends on earlier verdicts being settled before later reviews run.
- Treating PASS WITH OBSERVATIONS as PASS without explicit user acceptance.
- Skipping the readiness gate. `review-re-readiness` is the last review; without an APPROVED verdict, KB ingestion is blocked.
- Authoring RE content during review. This skill validates only — fixes are deferred to the RE skill that produced the docs.
- Treating the adversarial wrappers as optional. They run as sub-reviews 7–8; their verdicts feed the readiness gate.
- **Guessing the domain.** Every path and the completeness baseline are domain-scoped. An unresolvable domain is a halt (Step 0), not a best guess.
- **Reviewing against the domain skill's prose instead of its compositions.** `re-<domain>-internal.yaml` / `re-<domain>-consumer.yaml` are the authority on the required block list; the SKILL.md narrative is not.
- Reviewing a single repo's output and reporting it as a KB-wide verdict. This skill is per-repo; the global KB sweep is `verify-knowledge-base-coverage`.

## See also

- `references/OVERVIEW.md` — extended rationale and per-review depth
- `references/INPUTS-OUTPUTS.md` — full input/output contract
- `references/EXAMPLE.md` — worked end-to-end example
- `references/review-workflow.md` — detailed sequence with verdict templates
- `references/review-patterns/review-output-format.md` — Format 4 schema (used by sub-reviews 7–8)
- `references/review-patterns/review-verdict-mapping.md` — how the wrappers map findings to verdicts
- `references/elicitation-patterns/re-verification-gate-selection.md` — the close-out gate that routes here
