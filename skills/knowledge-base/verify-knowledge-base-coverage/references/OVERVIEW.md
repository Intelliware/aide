# verify-knowledge-base-coverage — Overview

## Purpose

Where `detect-knowledge-base-drift` answers "is what we have current?",
this skill answers "do we have what we should have?". Coverage gaps are
slower-moving than freshness gaps but more insidious: an uncatalogued
endpoint, framework symbol, or route means agents grounding via the KB
plan work on a system that the KB doesn't know exists. They'll
confidently propose patterns that re-implement what's already there, or
ignore an existing capability because the Capability Index never
mentioned it.

This skill enumerates every public artifact across every source repo and
checks coverage against the KB. It also walks every component and
confirms its `paths:` and `source_doc` still resolve. Output is a
report; the skill never edits the KB.

## When to use

- **Immediate baseline.** `build-knowledge-base` hands off here on
  first build for `--mode=baseline`. Catches anything the build missed.
- **Scheduled cron.** Weekly or fortnightly, paired with
  `detect-knowledge-base-drift --mode=full`. The two reports together
  give a complete picture: drift report says "what we have is wrong",
  coverage report says "what we have is incomplete".
- **After a major repo addition.** A new repo was added to
  `[[project.repos]]` and components were authored. Run baseline to
  confirm full coverage of the new repo before declaring the addition
  complete.
- **After a refactor.** Code reorganisation often invalidates `paths:`
  globs and creates stales. A delta-mode run catches this.

## When NOT to use

- The KB doesn't exist — run `build-knowledge-base`.
- The user wants drift detection (KB out of sync vs. KB incomplete) —
  use `detect-knowledge-base-drift`.
- The user wants to apply fixes — use `update-knowledge-base` for narrow
  fixes, `build-knowledge-base --overwrite` for broad ones.

## Position in workflow

```
build-knowledge-base completes
   ↓ hands off to
verify-knowledge-base-coverage --mode=baseline
   ↓ baseline report stored
   ↓ caller (start-project) routes to next stage
```

```
weekly/fortnightly cron
   ↓ verify-knowledge-base-coverage --mode=delta --prior-report=<last>
   ↓ report; if orphans + stales > 30% of components, recommend rebuild
   ↓ if a few narrow gaps, recommend update-knowledge-base
```

## Mode comparison

| Aspect | `baseline` | `delta` |
|---|---|---|
| Runs at | Initial build, major repo addition, on-demand triage | Weekly cron, post-refactor |
| Re-enumerates | All artifacts in all repos | Only artifacts in repos whose HEAD advanced since `--prior-report` |
| Re-checks `paths:` | Every component | Components with paths in advanced repos OR cross-repo components |
| Stales | Yes (full sweep) | Yes (limited to advanced-repo components) |
| Warnings | Yes | Yes |
| Wall-clock | Minutes (depends on repo count and artifact count) | Seconds–minutes |

## Output thresholds

The report includes a **rebuild recommendation** computed from the gap
ratio:

- `(orphans + stales) / total_artifacts < 0.05`: KB is healthy —
  recommend narrow fixes via `update-knowledge-base` for the listed
  gaps.
- `0.05 ≤ ratio < 0.30`: KB has notable gaps. Recommend a triage pass:
  pick the top-N gaps by severity and run `update-knowledge-base`
  per-feature.
- `ratio ≥ 0.30`: KB is too far from reality for incremental fixes.
  Recommend `build-knowledge-base --overwrite` followed by another
  `verify-knowledge-base-coverage --mode=baseline`.
