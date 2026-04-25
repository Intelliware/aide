# Overview — track-change

## Purpose

`track-change` is the universal change-tracking utility. Every documentation
package, requirements package, design package, implementation package, and
knowledge-base component carries a `CHANGE-TRACKER.md`. This skill is the
canonical writer for that file: it appends a one-row table summary plus a
detailed entry, both in the framework's standard format, so the project can
reconstruct what changed, when, why, and against which source version.

The format matters. Without a consistent tracker shape, downstream tools
(`detect-knowledge-base-drift`, `verify-source`, the build-knowledge-base
indexer) cannot tell stale entries from fresh ones, cannot verify that a
documented behavior was actually verified against source code, and cannot
batch related changes for cross-impact assessment. Centralizing the writer
ensures every tracker has the same shape regardless of which stage produced
the change.

## When to use

- A documentation extraction or correction completes
- A requirements amendment lands
- A design decision changes
- An implementation increment closes with documentation impact
- A KB component is updated or re-verified
- Any change with auditable cross-impact

## When NOT to use

- No `CHANGE-TRACKER.md` exists for the package and the user does not want
  one yet (rare; usually we initialize)
- Pure conversation, no artifact change
- Bulk regeneration / migration — those need a one-shot migration log, not
  per-change rows

## Position in workflow

Tail-end utility. Called after work completes, before the user moves on to
the next skill. Logs the verified shift so future skills can detect drift,
trace changes back to source versions, and reason about staleness.
