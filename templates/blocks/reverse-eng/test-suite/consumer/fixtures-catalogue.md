---
slug: fixtures-catalogue
title: "Fixtures Catalogue"
applies-to: [re-test-suite-consumer]
requires-decision-from: [code-reader, data-steward]
optional: false
order-hint: 140
---

## 4. Fixtures Catalogue (consumer view)

Enumerate every fixture (static file) and builder (runtime generator) the suite exposes for reuse. A new scenario or test case should source its test data from this catalogue first; only when no entry covers the needed shape does the author propose a new fixture (and that proposal goes through the suite maintainer, not into the new scenario as ad-hoc code).

Pin the shape, not the values. Real test data shouldn't appear in this block — only the schema, the generator signature, and an example invocation.

### Suggested template content

```yaml
---
kind: test-suite
component-id: {{suite-id}}
sub-component: fixtures
query-axes: [static, builder, seed, mock]
---
```

**Static fixtures (committed JSON / YAML):**

| Fixture | Schema / shape | Source | Used by | Example loader call |
|---|---|---|---|---|
| `{{fixture-1}}` | `{{schema-1}}` | `{{path-1}}` | `{{used-by-1}}` | `{{call-1}}` |
| `{{fixture-2}}` | `{{schema-2}}` | `{{path-2}}` | `{{used-by-2}}` | `{{call-2}}` |

**Runtime builders / factories:**

| Builder | Signature | Produces (type) | Determinism | Example call |
|---|---|---|---|---|
| `{{builder-1}}` | `{{sig-1}}` | `{{type-1}}` | {{det-1 — e.g. "Seeded when SEED env set; Faker-driven otherwise"}} | `{{call-1}}` |
| `{{builder-2}}` | `{{sig-2}}` | `{{type-2}}` | {{det-2}} | `{{call-2}}` |

**Pre-seeded environment data (read-only for consumers):**

| Entity | Where | Quantity | Refresh cadence | Reuse contract |
|---|---|---|---|---|
| Seed merchants | `{{env-1}}` DB | `{{qty-1}}` | `{{cadence-1}}` | Read-only; never mutate |
| Seed plans | `{{env-2}}` DB | `{{qty-2}}` | `{{cadence-2}}` | Read-only |
| Seed payment methods | `{{env-3}}` DB | `{{qty-3}}` | `{{cadence-3}}` | Read-only |

**Mock-server canned responses:**

| Response set | Source | Loader | Use case |
|---|---|---|---|
| `{{mock-set-1}}` | `{{mock-path-1}}` | `{{loader-1}}` | {{use-1}} |
| `{{mock-set-2}}` | `{{mock-path-2}}` | `{{loader-2}}` | {{use-2}} |

**Reuse rule (binding on consuming skills):**

Before authoring a new fixture or hardcoding test data inline, the quality-stage skill MUST query this catalogue and the runtime builders. If a builder covers the needed shape (with parameters), use it. If no builder fits, prefer extending an existing builder over creating a parallel one — and route the extension proposal through the suite maintainer.

**Forbidden in consumer scenarios:**

- Hardcoded entity IDs (use builders or seed-data references).
- Real-user data (suite is synthetic-only).
- Mutation of pre-seeded read-only entities.

