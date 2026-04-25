# Elicitation pattern: Increment scoping

## Purpose

Decomposes an approved Solution Design Package into a sequence of
independently executable increments (INC-XXX). Names natural increment
boundaries, distinguishes foundation increments (infrastructure, scaffolds)
from feature increments (FR-bearing), and sets per-increment size targets
(typically 1-2 weeks of work). Invoked from `create-implementation-package`
step 03 (increment-decomposition) so the implementation package has a
defensible, FR-mapped increment sequence before per-increment authoring
begins.

## Inputs needed from user

- The approved design package (input — provides containers, FRs, NFRs)
- Boundary type per increment (foundation / feature / cross-cutting / ops)
- Per-increment goal (single-sentence, single-purpose)
- Per-increment FR mapping (which FRs this increment implements)
- Per-increment size estimate (XS / S / M / L; target M = 1-2 weeks)
- Sequencing preference (parallel-friendly vs. strict-serial)
- Risk-first vs. value-first ordering

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

1. **Are there foundation increments needed before any feature work can land?** (e.g. CI/CD pipeline, repository skeleton, database migration framework, observability bootstrap)
   - **Format:** yes/no
   - **Maps to:** drives whether the loop opens with a foundation pass

2. **Loop: list each foundation increment.** (until `done`)
   - **Format:** structured `{title, goal, components_touched[], expected_size}`
   - **Validation:** `expected_size` ∈ `{XS, S, M, L}` (M is the target — 1-2 weeks of work)
   - **Maps to:** `implementation.increments[]` with `boundary_type = "foundation"`

3. **Loop: identify the feature-bearing increments by walking the FR list.**
   For each cluster of related FRs, ask: "Should these ship together as one increment?"
   - **Format:** structured `{title, goal, fr_ids[], components_touched[], expected_size}`
   - **Validation:** every FR (priority `must` or `should`) appears in exactly one increment; `wont`-priority FRs are excluded; `could`-priority FRs may be deferred
   - **Maps to:** `implementation.increments[]` with `boundary_type = "feature"`

4. **Per increment: confirm the goal is a single sentence with a single purpose.**
   - **Format:** free-text + automated linter
   - **Validation:** flag goals containing " and also ", " plus ", " as well as " — re-prompt to split
   - **Maps to:** `implementation.increments[].goal`

5. **Per increment: confirm the FR mapping.**
   - **Format:** multi-select from the project's FR list
   - **Validation:** for foundation increments, allow `FR Mapping: None (foundational)`
   - **Maps to:** `implementation.increments[].fr_mapping[]`

6. **Per increment: estimate the size.**
   - **Format:** multiple-choice
   - **Options:** `XS` (<2 days) / `S` (2-5 days) / `M` (1-2 weeks) / `L` (2-4 weeks — re-prompt to split if possible)
   - **Validation:** L-size increments trigger a "can this be split?" prompt
   - **Maps to:** `implementation.increments[].size`

7. **Are there cross-cutting increments?** (shared library, refactor, telemetry pass — increments that don't map to a single FR but unblock several)
   - **Format:** structured-list `{title, goal, unblocks_increments[]}`
   - **Validation:** each entry names at least one increment it unblocks
   - **Maps to:** `implementation.increments[]` with `boundary_type = "cross-cutting"`

8. **Risk-first or value-first ordering?**
   - **Format:** multiple-choice
   - **Options:** `risk-first` (highest-risk increments first to fail fast) / `value-first` (highest-value FRs first to ship value early) / `dependency-only` (let the dependency graph drive — no human re-ordering) / `mixed` (foundation first, then risk-first within the feature pool)
   - **Maps to:** drives the initial sort order of `implementation.increments[]`

9. **Parallelizable increments?** Are there increment pairs that can run in parallel (different teams, different files)?
   - **Format:** structured-list of pairs
   - **Validation:** the named increments must have disjoint `components_touched[]`
   - **Maps to:** `implementation.parallel_lanes[]`

**Wrap-up:** Confirm the answers in summary form before proceeding. Print the full increment list (boundary type, title, goal, FR mapping, size, sequence position) and the parallel-lane groupings. Re-prompt any L-size increment until it splits or the user explicitly approves the size. Confirm before moving to dependency-mapping.

## Output format

Answers feed `implementation.md` (the package overview) and seed each `INC-XXX.md` file's Increment Identity + Goal + FR Mapping + size sections.

```toml
[[implementation.increments]]
id = "INC-001"
boundary_type = "foundation"
title = "CI/CD pipeline + repo skeleton"
goal = "Stand up the build/test/deploy pipeline so subsequent increments have a place to land."
fr_mapping = []
size = "S"
components_touched = []

[[implementation.increments]]
id = "INC-002"
boundary_type = "feature"
title = "Order intake REST endpoint"
goal = "Accept manual-entry orders via REST, validate against customer master, persist."
fr_mapping = ["FR1.1.1", "FR1.1.2", "FR1.1.3"]
size = "M"
components_touched = ["acme-orders-api/order-controller", "acme-orders-api/order-store"]

[[implementation.parallel_lanes]]
lane = "intake-vs-resolution"
increments = ["INC-002", "INC-003"]
```

## Validation rules

- Every `must`-priority FR is mapped to exactly one increment.
- Goals are single-sentence, single-purpose; "and also" / "plus" / "as well as" patterns are re-prompted.
- L-size increments are re-prompted to split; explicit user override required to keep an L.
- Foundation increments may have empty `fr_mapping[]` (recorded as `FR Mapping: None (foundational)`).
- Parallel-lane pairs must have disjoint `components_touched[]`.
- Cross-cutting increments must name the increments they unblock.

## Reusable across

- `create-implementation-package` (step 03 — increment decomposition)
- `greenfield-implementation-package` composition (declared as required elicitation)
