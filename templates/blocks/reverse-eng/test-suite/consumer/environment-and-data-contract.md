---
slug: environment-and-data-contract
title: "Environment and Data Contract"
applies-to: [re-test-suite-consumer]
requires-decision-from: [code-reader, devops, data-steward]
optional: false
order-hint: 170
---

## 7. Environment and Data Contract

The contract a consumer (quality-package author, new scenario, downstream integration) can rely on from each environment the suite targets. This is a strict subset of the internal view's environment-matrix — it omits operational details (refresh procedures, runner agent pools) and exposes only what a consumer needs to make safe assumptions.

The "binding" parts of this block — read-only environments, mutating-scenario forbiddances, seed-data freshness guarantees — are enforced by `audit-quality-coverage` and `review-test-failures`. Drift from this contract surfaces as findings.

### Suggested template content

```yaml
---
kind: test-suite
component-id: {{suite-id}}
sub-component: environment-contract
---
```

**Environments available to consumers:**

| Environment | URL | Auth source | Mutating-scenario policy | Tag subsets safe to invoke |
|---|---|---|---|---|
| `dev` (local) | `{{dev-url}}` | `{{dev-auth}}` | ✅ Allowed | All |
| `qa` (shared) | `{{qa-url}}` | `{{qa-auth}}` | ✅ Allowed (cleanup mandatory) | `@regression`, `@smoke`, `@critical` |
| `stage` | `{{stage-url}}` | `{{stage-auth}}` | ⚠️ Pre-release validation only | `@smoke`, `@critical` |
| `prod-readonly` | `{{prod-url}}` | `{{prod-auth}}` | ❌ FORBIDDEN | `@smoke` paired with `@readonly` only |

**Per-environment capability contract:**

| Capability | dev | qa | stage | prod-readonly |
|---|---|---|---|---|
| Resettable seed data | ✅ | ⚠️ shared | ❌ | ❌ |
| Sandbox payment processor | ✅ | ✅ | ✅ | ❌ live |
| Feature flags overridable | ✅ | ✅ via admin | ❌ | ❌ |
| Email / SMS delivery to non-allow-list addresses | ❌ stubbed | ❌ stubbed | ❌ | ❌ |
| Webhook sink available | ✅ | ✅ | ✅ | n/a |

**Seed-data contract (binding):**

The suite guarantees the following pre-seeded entities are present in `qa` and `stage`:

| Entity | Identifier convention | Reset cadence | Reuse rule |
|---|---|---|---|
| Test merchants | `test-merchant-<region>-<tier>` | Nightly (qa); per-release (stage) | Read-only; never mutated |
| Test plans | `plan-<tier>` | Stable; manual update | Read-only |
| Test payment methods | `pm-<scheme>-<outcome>` (e.g. `pm-visa-decline`) | Stable | Read-only |

New scenarios needing entities outside this guaranteed set MUST allocate via the builders (see fixtures-catalogue block); they MUST NOT assume an additional pre-seeded entity exists.

**Forbidden against `prod-readonly` (binding on consuming skills):**

- Any HTTP method other than `GET`, `HEAD`, `OPTIONS`.
- Any mutation of any entity, even via a "read-only" admin endpoint.
- Any test that creates a customer-visible side effect (email, SMS, webhook).

`review-test-failures` classifies any prod-readonly failure on a non-`@readonly`-tagged scenario as a high-severity findings (likely a contract violation).

**Environment status (live):** consumers can check the current health of each environment at `{{env-status-url}}` before invoking the suite.

