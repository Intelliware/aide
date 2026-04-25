# Elicitation pattern: Architecture discovery

## Purpose

Captures the architectural shape of the solution: the chosen pattern,
the architectural drivers (which NFRs and constraints push the design),
the major subsystems, and the C4 Level 1 + Level 2 decomposition.
Invoked from `create-design-package` step 01-discovery and step 02-design
so the `design/solution-overview` block has a defensible "why this shape"
narrative.

## Inputs needed from user

- Top architectural drivers ranked (NFRs that dominate, constraints that bind)
- Architectural pattern (monolith / modular-monolith / micro-services / event-driven / serverless / hybrid)
- Major subsystems (System Context — C4 Level 1)
- Container decomposition (C4 Level 2): each container's name, technology, responsibility
- Cross-cutting concerns (authn, observability, secrets, deployment topology)
- Known anti-patterns to avoid (lessons from prior systems)

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

1. **Rank the top 3 architectural drivers.** (which NFRs / constraints dominate the design?)
   - **Format:** structured-list of `{driver, rationale}` (top 3)
   - **Validation:** each driver references either an NFR ID or a named constraint
   - **Maps to:** `design.architecture.drivers[]`

2. **What architectural pattern best fits these drivers?**
   - **Format:** multiple-choice
   - **Options:** `monolith` / `modular-monolith` / `micro-services` / `event-driven` / `serverless` / `hybrid` / `other`
   - **Maps to:** `design.architecture.pattern`

3. **Why this pattern over the alternatives?** (one paragraph)
   - **Format:** free-text
   - **Validation:** non-empty; encourage naming at least one alternative considered
   - **Maps to:** `design.architecture.pattern_rationale`

4. **List the external systems and user types that interact with the solution.** (C4 Level 1)
   - **Format:** structured-list of `{name, type, role}` where `type` ∈ `{user-persona, external-system, scheduled-job, third-party-service}`
   - **Validation:** at least one user-persona required for user-facing systems
   - **Maps to:** `design.architecture.context_diagram.actors[]`

5. **Loop the containers (C4 Level 2): for each, ask name, technology, responsibility, owned data.** (add until `done`)
   - **Format:** structured `{name, technology, responsibility, owned_entities[]}`
   - **Validation:** `responsibility` is a single sentence; `owned_entities` reference entries from `requirements.data.entities`
   - **Maps to:** `design.architecture.containers[]`

6. **Sketch the inter-container communication.** (loop pairs: `from -> to`, mechanism, sync/async)
   - **Format:** structured `{from, to, mechanism, mode}` where `mechanism` ∈ `{rest, grpc, graphql, event-bus, message-queue, shared-db, file-drop}`, `mode` ∈ `{sync, async, batch}`
   - **Validation:** every container appears as either source or sink at least once
   - **Maps to:** `design.architecture.flows[]`

7. **Cross-cutting concerns: name the chosen approach for each.**
   - **Format:** structured (one row per concern)
   - **Concerns to ask about:** authn/authz, secrets, configuration, observability, error handling, deployment topology
   - **Validation:** each concern has either a chosen approach OR `[NEEDS CLARIFICATION]`
   - **Maps to:** `design.architecture.cross_cutting`

8. **What anti-patterns should we explicitly avoid?** (lessons from prior systems; optional)
   - **Format:** structured-list
   - **Maps to:** `design.architecture.anti_patterns[]`

**Wrap-up:** Confirm the answers in summary form before proceeding. Restate the chosen pattern, the top 3 drivers, the actor list, the container catalog, the flow list, and the cross-cutting choices. Confirm before writing the solution-overview block.

## Output format

Answers feed `design/solution-overview` (and seed `design/solution-architecture` for brownfield flows).

```toml
[design.architecture]
pattern = "modular-monolith"
pattern_rationale = "Single deployable matches team size 5-10; module boundaries protect future extraction."

[[design.architecture.drivers]]
driver = "NFR-PERF-1 (sub-2s P50 response)"
rationale = "Forces co-location of order-resolution UI and order-resolution-service."

[[design.architecture.containers]]
name = "Order Resolution Service"
technology = "node-typescript-nest"
responsibility = "Owns the order lifecycle from ingress through resolution."
owned_entities = ["Order", "OrderLine", "ResolutionAction"]

[[design.architecture.flows]]
from = "Order Resolution UI"
to = "Order Resolution Service"
mechanism = "rest"
mode = "sync"
```

## Validation rules

- Architectural drivers must trace back to NFR IDs or named constraints; "general best practice" is not accepted.
- The chosen pattern must have a stated rationale that names at least one alternative considered (or explicitly states none was — also acceptable).
- C4 Level 1: at least one human/persona actor for user-facing systems.
- C4 Level 2: every container has a single-sentence responsibility (no run-on "and also …").
- Every flow names both ends of the communication, the mechanism, and sync/async mode.
- Cross-cutting concerns: any unanswered concern is recorded as `[NEEDS CLARIFICATION]` so the design package surfaces the gap.

## Reusable across

- `create-design-package` (step 01-discovery sets the high-level shape; step 02-design refines into solution-overview)
- `greenfield-design-package` composition (declared as required elicitation)
