---
name: detect-knowledge-base-drift
description: "Use when source repos may have changed without the KB being updated, when running a PR-gate freshness check, or for the scheduled (cron / weekly) drift sweep. Performs cheap-to-expensive layered detection (commit-stamp / structural diff / LLM contradiction / coverage sweep) and reports drift with per-component severity and recommended actions."
---

# Detect Knowledge Base Drift

Detect when source repos have changed but the KB hasn't kept up. Used as a
**PR-gate** (cheap signal, fails the pipeline on L1/L2 hits) and as a
**scheduled cron** (weekly deep sweep). Layered detection — cheap checks
first, expensive ones only on suspects.

## Overview

A KB silently going stale is the worst failure mode in this stage. This
skill is the watchdog: it compares each component's stated
`last_verified_against_commit` against the current state of the source repo
and flags drift in ascending cost-order.

The four layers:

1. **L1 — commit-stamp check** (seconds): per component, compute
   `git rev-list <last_verified_against_commit>..HEAD --count` for the
   repo, AND check whether any path in `paths:` was touched in that
   commit range. If both conditions hold → suspect.
2. **L2 — structural diff** (seconds–minutes): for L1 suspects, run a
   domain-specific structural check based on `verification_signal`:
   OpenAPI diff for `openapi-diff`, exported-symbol diff for
   `exported-symbols-diff`, route inventory for `route-inventory-diff`,
   schema migration diff for `schema-diff`. `manual` skips L2 and goes
   straight to L3.
3. **L3 — LLM contradiction check** (minutes): for L2 suspects, ask the
   model whether the component doc still factually matches the
   changed code. driftcheck-style — load the doc + the changed file
   list + small diff samples and have the model emit a
   contradicts/holds verdict.
4. **L4 — coverage sweep** (full mode only, minutes): enumerate all
   public artifacts in source repos and confirm each maps to ≥1
   component. Surfaces orphans (uncatalogued artifacts) and stales
   (components whose paths no longer resolve).

## When to use

- The user is opening a PR and the project's CI invokes this skill in
  `--mode=gate`.
- A scheduled cron job runs weekly to sweep the entire KB —
  `--mode=full`.
- The user just shipped a feature and ran `update-knowledge-base`; an
  immediate `--mode=gate` confirms no residual drift.
- The user suspects the KB is wrong and wants a triage report.

## When NOT to use

- The KB doesn't exist — run `build-knowledge-base`.
- The user has a specific feature shipped and needs to update — use
  `update-knowledge-base` directly; this skill is for detection, not
  remediation.
- The user wants a full coverage report (orphans + stales) without
  drift detection — use `verify-knowledge-base-coverage` (this skill's
  L4 layer overlaps but is opt-in via `--mode=full`).

## Inputs

| Input | Source | Required |
|---|---|---|
| `[[project.repos]]` paths | `project.toml` | Yes |
| `<knowledge_base_path>/components/` | KB repo | Yes |
| `<knowledge_base_path>/graph.json` | KB repo | Yes |
| `--mode` flag | caller | No (default `gate`) |
| `--since` (ref / date) | caller | No (default: per-component `last_verified_against_commit`) |
| `--max-l3-suspects` | caller | No (default 20; cap on LLM calls) |

See `references/INPUTS-OUTPUTS.md`.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Execute one step at a time.

1. **L1 commit-stamp check** — `steps/01-l1-commit-stamp.md`
2. **L2 structural diff** — `steps/02-l2-structural-diff.md`
3. **L3 LLM contradiction check** — `steps/03-l3-llm-contradiction.md`
4. **L4 coverage sweep** (full mode only) — `steps/04-l4-coverage-sweep.md`
5. **Compose drift report** — `steps/05-compose-report.md`

In `--mode=gate`: run L1 + L2 + report. Skip L3 and L4 (gate must be
fast). Fail the gate if any L1 OR L2 hits with severity ≥ medium.

In `--mode=full`: run all layers and emit the full report.

## Output

A drift report with rows of:

| Column | Description |
|---|---|
| Component ID | The component flagged. |
| Layer | Which layer flagged it (L1 / L2 / L3 / L4-orphan / L4-stale). |
| Severity | `low` / `medium` / `high` — `high` for breaking interface changes; `medium` for behavioural drift; `low` for stale stamps with no observed change. |
| Evidence | One-line description of the signal — `OpenAPI added 2 endpoints, removed 0`; `5 commits touching paths since last verification`; etc. |
| Recommended action | `update-knowledge-base --feature-id=…`, or `verify-knowledge-base-coverage --mode=delta`, or `run build-knowledge-base --overwrite` for >50% drift. |

## Next skill
`update-knowledge-base` (when drift is correctable to a recent feature)
or `verify-knowledge-base-coverage` (when the picture is broader than a
single feature).

## Common mistakes

- **Running L3 in gate mode.** L3 is too slow for a PR gate. The gate
  must complete in under a minute.
- **Treating L1 hits as automatic failures.** A commit-stamp mismatch
  with no path overlap is a low-severity hint, not a failure. The
  `paths:`-overlap check is mandatory for L1 to fire.
- **Skipping repo-prefix paths.** Components with cross-repo paths
  (e.g. `api-billing:src/Authorization/**`) need stamp checks against
  every repo they touch, not just `repo:`. L1 walks all repos.
- **Confusing `--mode=gate` with `--mode=full`.** Gate is fast and only
  fails on L1+L2; full sweeps L1–L4 and reports for human triage.
- **Hand-fixing components based on the report.** This skill never
  writes to the KB. Pass the report to `update-knowledge-base` or
  `build-knowledge-base` for actual fixes.
- **Re-running L3 on the same suspect set without invalidating cache.**
  L3 results should be cached per `(component_id, source_sha)` pair —
  re-running for the same SHA is wasteful.
