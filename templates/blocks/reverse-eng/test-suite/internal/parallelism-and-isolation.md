---
slug: parallelism-and-isolation
title: "Parallelism and Isolation"
applies-to: [re-test-suite-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 220
---

## 12. Parallelism and Isolation

Document the suite's parallelism model: how many workers, how scenarios are partitioned across them, what state each worker owns, and what guarantees the suite makes about isolation. Parallelism is the single biggest source of flake when done sloppily — a clear, documented model is the antidote.

Be specific about what is and isn't safe to share across workers. "Each worker gets its own user" is the most common shape; document the helper that enforces it, the cost of warming up a worker, and any per-worker resources (browser context, DB schema, message queue) that must be torn down at exit.

### Suggested template content

**Parallelism model:**

- **Default workers (CI):** `{{ci-workers}}`
- **Default workers (local):** `{{local-workers}}`
- **Partitioning strategy:** {{strategy — e.g. "Scenario-level; the runner shards scenarios across workers round-robin"}}
- **Within-file ordering:** {{ordering — e.g. "Scenarios within a feature run sequentially in declaration order; features run in parallel"}}

**Per-worker resources:**

| Resource | Lifecycle | Cleanup |
|---|---|---|
| Browser context | Per worker; reused across scenarios | `{{browser-teardown}}` at worker exit |
| Authenticated user | Per worker; cached via `{{api-token-helper}}` | Token expires; no explicit cleanup |
| API client | Per worker | Garbage collected |
| Mock-server instance | Per worker on port `{{base-port}} + workerId` | `{{mock-teardown}}` |

**Shared resources (must be safe for concurrent access):**

| Resource | Safety mechanism |
|---|---|
| Reference data (countries, currencies) | Read-only; immutable |
| Shared seed users | Pre-seeded, NOT mutated by scenarios |
| Application DB | Each worker writes to its own row-set via UUIDs from builders |
| Mock-server config | Per-worker port + per-scenario reset |

**Isolation contract (scenarios must honor):**

- Each scenario MUST allocate its own user / merchant / order via the builders — no shared mutable state across scenarios.
- Each scenario MUST clean up the entities it creates (via `@AfterScenario` hook) so re-runs are stable.
- Scenarios MUST NOT depend on declaration / execution order — runner may shuffle.
- Scenarios MUST NOT touch global config / feature flags without restoring them.

**Race conditions observed in the past (warnings):** {{races — e.g. "Two scenarios both creating a merchant with the same `business-name` will collide; always use a builder-supplied UUID suffix. See bug TICK-512."}}

**Per-environment parallelism limits:**

| Environment | Max safe workers | Why |
|---|---|---|
| `dev` (local) | CPU-bound (`{{nproc}}`) | Local resources |
| `qa` | `{{qa-max}}` | Shared DB write contention |
| `stage` | `{{stage-max}}` | Single-tenant DB; lower bound |
| `prod-readonly` | `{{prod-max}}` | Live rate-limits |

