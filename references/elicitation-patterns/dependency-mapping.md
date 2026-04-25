# Elicitation pattern: Dependency mapping

## Purpose

Captures the explicit dependency edges between increments — which
increments must complete before which others can start, what artifacts
flow from upstream to downstream, and where the critical path runs.
Invoked from `create-implementation-package` (after `increment-scoping`)
so each `INC-XXX.md`'s Dependencies section is concrete and the package
overview can render an unambiguous DAG.

## Inputs needed from user

- The increment list (input — produced by `increment-scoping`)
- For each increment: which prior increments it depends on
- For each dependency edge: the artifact(s) flowing across (compiled binary, deployed service, schema migration, environment variable, library version)
- External dependencies (third-party releases, cross-team deliveries) and ETAs
- Identification of the critical path
- Soft dependencies vs. hard dependencies

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

1. **Loop: for each increment, list its prior dependencies.**
   - **Format:** structured-list per increment of `{depends_on_inc_id, dependency_kind, artifact}`
   - **Validation:**
     - `depends_on_inc_id` references an existing increment
     - cycle detection: re-prompt if adding the edge creates a cycle
     - `dependency_kind` ∈ `{hard-must-complete, soft-can-overlap, contract-only-needs-interface}`
   - **Maps to:** `implementation.increments[].depends_on[]`

2. **For each dependency edge, name the artifact.** (what travels from upstream to downstream)
   - **Format:** structured `{artifact_kind, name}` where `artifact_kind` ∈ `{deployed-service, library-version, schema-migration, config-value, env-var, dataset, design-decision, frontmatter-edit-to-kb}`
   - **Validation:** every hard dependency must name at least one artifact
   - **Maps to:** `implementation.increments[].depends_on[].artifact`

3. **Are there external dependencies?** (third-party SDK release, partner team's API, vendor migration, license renewal)
   - **Format:** yes/no, then loop `{external_party, deliverable, eta, blocking_increments[]}` if yes
   - **Validation:** `eta` is parseable as an ISO date or fiscal quarter; blocking_increments references existing increments
   - **Maps to:** `implementation.external_dependencies[]`

4. **Identify the critical path.** (the longest dependency chain through the DAG)
   - **Format:** auto-computed from the edges, then user confirms or amends
   - **Validation:** computed path must be acyclic and reach a leaf
   - **Maps to:** `implementation.critical_path`

5. **Risk per dependency edge.** (how confident are you that the upstream artifact will be ready when the downstream needs it?)
   - **Format:** multiple-choice per edge
   - **Options:** `low-risk` (artifact already exists or trivially produced) / `medium-risk` (standard work, some uncertainty) / `high-risk` (untested integration, third-party, or research) / `unknown`
   - **Maps to:** `implementation.increments[].depends_on[].risk`

6. **Slack on the critical path.** (if any high-risk edge is on the critical path, the package needs a contingency note)
   - **Format:** auto-flagged + free-text contingency note from user when triggered
   - **Maps to:** `implementation.contingencies[]`

7. **Confirm: any soft dependencies the team should be aware of even though they don't gate start?** (e.g. "ideally INC-005 lands before INC-006 starts so the demo flows nicely, but it's not strictly required")
   - **Format:** structured-list
   - **Maps to:** `implementation.increments[].soft_depends_on[]`

**Wrap-up:** Confirm the answers in summary form before proceeding. Print the increment DAG (text rendering + ASCII edges), the critical path, the external-dependency table, and any flagged high-risk edges. Confirm before stamping per-increment Dependencies sections.

## Output format

Answers feed each `INC-XXX.md` file's Dependencies section and the package overview's DAG.

```toml
[[implementation.increments]]
id = "INC-002"
title = "Order intake REST endpoint"

[[implementation.increments.depends_on]]
inc_id = "INC-001"
kind = "hard-must-complete"
artifact = { kind = "deployed-service", name = "CI/CD pipeline produces builds for orders-api" }
risk = "low-risk"

[[implementation.increments.depends_on]]
inc_id = "INC-007"
kind = "contract-only-needs-interface"
artifact = { kind = "design-decision", name = "Customer master REST contract finalized" }
risk = "medium-risk"

[implementation]
critical_path = ["INC-001", "INC-002", "INC-004", "INC-008"]

[[implementation.external_dependencies]]
external_party = "Stripe"
deliverable = "v2 charge API in EU region"
eta = "2026-Q3"
blocking_increments = ["INC-006"]
```

## Validation rules

- The dependency graph must be acyclic. Adding an edge that would create a cycle is rejected with an explanation of the offending cycle.
- Every hard dependency must name at least one artifact.
- Every dependency edge has a kind from the enum and a risk from the enum.
- High-risk edges on the critical path require a contingency note.
- External dependencies must have a parseable ETA and at least one blocked increment.
- Soft dependencies are recorded but never block scheduling.

## Reusable across

- `create-implementation-package` (post-`increment-scoping`; before per-increment authoring)
- `greenfield-implementation-package` composition (declared as required elicitation)
