---
slug: fixtures-and-test-data
title: "Fixtures and Test Data"
applies-to: [re-test-suite-internal]
requires-decision-from: [code-reader, data-steward]
optional: false
order-hint: 160
---

## 6. Fixtures and Test Data

Document the test-data strategy: where fixtures live, how they're loaded, how dynamic data is generated (factories / builders), how seed data lands in the target environment, and how state is reset between scenarios. The reader needs to know what data they can rely on, what they have to create themselves, and what they MUST clean up.

Be explicit about the data source-of-truth. Suites that mix "static JSON committed to the repo" + "generated on the fly" + "pre-loaded in the QA database" without documenting which is which produce scenarios that pass locally and fail in CI for non-obvious reasons. Pin each fixture's origin and refresh cadence.

### Suggested template content

**Fixture categories:**

| Category | Storage | Loaded via | Lifetime | Refresh cadence |
|---|---|---|---|---|
| Static reference data (countries, currencies, …) | `{{static-path}}` | `{{loader-static}}` | Committed | Manual; quarterly review |
| Per-scenario builders (generated at runtime) | n/a (code) | `{{builder-class}}` | Per scenario | n/a |
| Pre-seeded DB rows | Seed scripts in `{{seed-path}}` | DB migration on env spin-up | Per environment | On env refresh |
| Authentication tokens | Secret store | `{{auth-helper}}` | Per worker | Rotated by `{{rotate-cmd}}` |
| Mock-server responses | `{{mock-path}}` | `{{mock-server}}` setup hook | Per worker | Per commit |

**Static fixtures:**

| File | Schema / shape | Used by | Owner |
|---|---|---|---|
| `{{fixture-1}}` | `{{schema-1}}` | {{used-by-1}} | {{owner-1}} |
| `{{fixture-2}}` | `{{schema-2}}` | {{used-by-2}} | {{owner-2}} |

**Builders / factories:**

| Class | Source | Produces | Defaults strategy |
|---|---|---|---|
| `{{builder-1}}` | `{{path-1}}` | `{{type-1}}` | {{defaults-1 — e.g. "Faker-driven; deterministic when `SEED` env var set"}} |
| `{{builder-2}}` | `{{path-2}}` | `{{type-2}}` | {{defaults-2}} |

**Seed-data lifecycle (per environment):**

1. {{step-1 — e.g. "Environment spin-up runs `{{seed-cmd}}` to load `{{seed-file}}` against the target DB."}}
2. {{step-2}}
3. {{step-3}}

**Per-scenario state contract:**

- **Setup:** {{setup-rule — e.g. "Each scenario starts with a fresh authenticated user via `LoginPage.asNewMerchant()`; no shared user state between scenarios."}}
- **Teardown:** {{teardown-rule — e.g. "Scenarios MUST clean up any orders / refunds they created via the `@AfterScenario` hook in `cleanup.steps.ts`."}}
- **Shared state (allowed):** {{shared-state — e.g. "Read-only reference data only — currency, country, plan catalogues."}}
- **Shared state (forbidden):** {{forbidden — e.g. "Per-test users, per-test orders, per-test API keys"}}

**PII / secret handling:** {{pii-rule — e.g. "Fixture data MUST use synthetic identifiers (`faker.internet.email()`); real-customer-shaped data is forbidden even in fixtures. Production-derived dumps NEVER land in `fixtures/`."}}

**Drift detection:** {{drift — e.g. "`{{drift-cmd}}` runs nightly against the QA DB and flags missing or schema-drifted seed rows."}}

