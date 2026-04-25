# detect-knowledge-base-drift — Overview

## Purpose

Drift is the failure mode that motivates this entire stage. The KB is
useful only to the extent it tracks reality; once it falls behind, agents
ground themselves in stale information and produce wrong decisions
**with confidence**, which is worse than producing them with no
information at all. `detect-knowledge-base-drift` is the watchdog that
catches drift before it propagates.

The skill is intentionally **layered** — cheap signals first, expensive
ones only on suspects. The four layers ascend in cost roughly two orders
of magnitude per layer:

| Layer | Cost (per component) | What it catches |
|---|---|---|
| L1 commit-stamp | ms | Source repos moved AND paths overlap → component is at risk. |
| L2 structural diff | s | Specific public-interface changes that drift the doc's contract claims. |
| L3 LLM contradiction | s–m | Behavioural / semantic drift no structural diff would catch. |
| L4 coverage sweep | s–m × N components | Orphan artifacts (added but uncatalogued) + stale paths (in catalog but no source). |

The two operating modes — `gate` and `full` — choose how many layers run.
`gate` runs L1 + L2 only; `full` runs all four.

## When to use

- **PR gate (`--mode=gate`).** Project CI invokes this skill on every
  PR opening / re-push. The gate fails if any L1 or L2 signal of
  severity ≥ medium fires. Suggested wallclock budget: 60 seconds.
  Keeps the KB and code in lockstep at PR-time, not weeks later.
- **Scheduled cron (`--mode=full`).** Weekly job. Catches drift that
  individual PRs missed (e.g. squashed merges that bypassed the gate,
  retroactive code changes, API renames that didn't surface in
  structural diff). Suggested wallclock budget: ≤30 minutes for a KB of
  100 components.
- **Post-update verification.** After running `update-knowledge-base`,
  an immediate `--mode=gate` confirms no residual drift.
- **Triage on demand.** User says "is the KB out of date?" — run
  `--mode=full` and surface the drift report.

## When NOT to use

- The KB does not exist — run `build-knowledge-base`.
- The user knows what shipped and wants the KB updated — go straight to
  `update-knowledge-base`. This skill is detection, not remediation.
- The user wants only the orphan/stale picture, not drift — use
  `verify-knowledge-base-coverage` instead. (L4 here overlaps with
  that skill; `verify-knowledge-base-coverage` is the canonical home
  for coverage and runs faster when drift detection isn't needed.)

## Position in workflow

```
PR opened
   ↓ CI invokes
   detect-knowledge-base-drift --mode=gate
   ↓ pass: PR proceeds. fail (L1 ≥ medium or L2 hit): PR blocked.
   ↓ user runs update-knowledge-base
   ↓ retry detect-knowledge-base-drift --mode=gate
   ↓ pass: PR proceeds.
```

```
weekly cron
   ↓ detect-knowledge-base-drift --mode=full
   ↓ drift report opened as a tracking issue
   ↓ team triages → update-knowledge-base or verify-knowledge-base-coverage
```

## Severity assignment

The drift report assigns severity per row:

- **`high`** — public interface breakage. OpenAPI removed an endpoint
  the doc still claims; an exported symbol was renamed; a route
  disappeared. Anything that breaks downstream consumers if they trust
  the KB.
- **`medium`** — behavioural drift. Internal flow changed; new
  side-effect appeared; data-entity schema gained a required field.
  Doesn't break callers but the doc is misleading.
- **`low`** — stale stamp with no observed change. The
  `last_verified_against_commit` is old but the structural / contradict
  layers found nothing. Worth refreshing; not urgent.

## Caching notes

L3 (LLM contradiction) is the only expensive layer. Cache results keyed
by `(component_id, paths-checksum, source-SHA)` so re-runs against the
same code state hit cache. The cache lives in the KB at
`<knowledge_base_path>/.drift-cache.json` (gitignored). Cache is
invalidated when the component frontmatter changes (specifically when
`last_verified_against_commit` advances).
