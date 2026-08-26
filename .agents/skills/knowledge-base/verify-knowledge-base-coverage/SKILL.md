---
name: verify-knowledge-base-coverage
description: "Use when running the scheduled coverage sweep (baseline on first build, delta on subsequent runs), confirming every public artifact in source repos maps to ≥1 component, finding KB entries with no source backing, or validating the freshly built KB after build-knowledge-base ran. Emits orphan + stale + warning reports; never modifies the KB."
---

# Verify Knowledge Base Coverage

Scheduled coverage sweep. Confirms every public artifact in the source repos
maps to at least one KB component, and conversely that every KB entry still
has source files backing it. Reports gaps; **never modifies the KB**. Hand
off to `update-knowledge-base` or `build-knowledge-base` for fixes.

## Overview

Where `detect-knowledge-base-drift` answers "is what we have current?",
this skill answers "do we have what we should have?". Coverage drift is
slower-moving than freshness drift but more dangerous — an uncatalogued
endpoint or framework symbol means agents grounding via the KB will plan
work on incomplete information.

The skill runs in two modes:

- **`baseline`** (first run after `build-knowledge-base`): full scan of
  every artifact in every repo. Establishes the coverage baseline and
  flags any orphan that slipped through the build.
- **`delta`** (subsequent runs): only re-scan what's plausibly changed
  since the previous run. Cheaper.

## When to use

- Right after `build-knowledge-base` finishes — the build skill hands
  off here for an immediate `--mode=baseline` sweep.
- On a regular schedule (typically weekly, paired with the
  `detect-knowledge-base-drift --mode=full` cron, or every other week).
- After a major repo was added to `[[project.repos]]` — run
  `--mode=baseline` so the new repo's artifacts are catalogued.
- After a large refactor that may have left orphans / stales — run
  `--mode=delta` to catch coverage shifts without re-running drift
  detection.

## When NOT to use

- The KB doesn't exist — run `build-knowledge-base`.
- The user wants to know whether shipped code drifted the KB — use
  `detect-knowledge-base-drift` (which has L4 overlapping with this
  skill, but layered with the cheaper L1/L2 first).
- The user wants to fix coverage — use `update-knowledge-base` (or
  `build-knowledge-base --overwrite` if the picture is too broken).

## Inputs

| Input | Source | Required |
|---|---|---|
| `[[project.repos]]` paths | `project.toml` | Yes |
| `<knowledge_base_path>/components/` | KB repo | Yes |
| `<knowledge_base_path>/graph.json` | KB repo | Yes (used to derive expected coverage scope) |
| `--mode` flag | caller | No (default `baseline`) |
| `--staleness-warning-days` | `framework.toml` `[knowledge_base]` | No (default 30) |
| `--prior-report` | path | No (used by `delta` mode) |

See `references/INPUTS-OUTPUTS.md`.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Execute one step at a time.

1. **Enumerate artifacts** — `steps/01-enumerate-artifacts.md`
2. **Compute coverage gaps** — `steps/02-compute-gaps.md`
3. **Check staleness warnings** — `steps/03-check-staleness.md`
4. **Emit report** — `steps/04-emit-report.md`

In `--mode=delta`, step 1 reads the prior report and only re-enumerates
artifacts in repos whose HEAD has advanced; step 2 only re-checks
gaps for those repos plus any cross-repo components.

## Output

A coverage report with three categories:

| Category | Meaning |
|---|---|
| **Orphans** | Public artifacts (endpoints, symbols, routes, schema elements) in source repos with no KB component coverage. |
| **Stales** | KB components whose `paths:` resolve to no existing source files, OR whose `source_doc` no longer exists. |
| **Warnings** | Components whose `last_verified_against_commit` corresponds to a commit older than `staleness_warning_days` (default 30). |

The report is written to `<knowledge_base_path>/.coverage-reports/<ISO-timestamp>.json`
and `.md`. The skill exits 0 always — it's a report, not a gate.

## Next skill
- `update-knowledge-base` for narrow fixes (a few orphans tied to a
  recent feature).
- `build-knowledge-base` (overwrite mode) when a major repo was added,
  or when stales / orphans together exceed 30% of components.

## Common mistakes

- **Treating warnings as failures.** Warnings are "this component is
  more than N days stale at the wall-clock". They're informational —
  the freshness check belongs to `detect-knowledge-base-drift`. Don't
  block flows on warnings here.
- **Re-running `--mode=baseline` weekly.** Baseline is expensive; weekly
  sweeps should use `--mode=delta` after the first run.
- **Skipping cross-repo components.** Components with `paths:` that
  span repos must have their coverage re-checked whenever ANY of their
  repos advance. Step 2 enforces this.
- **Modifying the KB based on the report.** This skill never writes;
  it produces a report. Use `update-knowledge-base` to apply fixes.
- **Confusing orphan kinds.** Orphans come in three flavours:
  uncatalogued endpoints (from `api` repos), uncatalogued exports (from
  `framework` / `shared-library`), and uncatalogued routes (from
  `ui` / `mobile`). Each has its own remediation path.
- **Ignoring artifact-source tooling errors.** If the OpenAPI spec is
  malformed, the skill cannot enumerate endpoints — that's a gap in
  REPO documentation, not the KB. Surface it loudly in the report.
