---
slug: environment-matrix
title: "Environment Matrix"
applies-to: [re-test-suite-internal]
requires-decision-from: [code-reader, devops]
optional: false
order-hint: 210
---

## 11. Environment Matrix

A grid of every environment the suite can target, what each one provides (and doesn't), what authentication and seed data each one carries, and which tag-filtered subsets are safe / unsafe to run against it. The reader needs to know — before they hit "run" — whether their local dev env can actually execute the scenario they're about to invoke.

Be honest about read-only / write-restricted environments. Suites that run mutating scenarios against `prod-readonly` produce real outages; suites that run read-only scenarios against an empty dev DB produce false negatives. The matrix is the safety guardrail.

### Suggested template content

**Environment matrix:**

| Environment | URL | Auth source | Seed data | Mutating scenarios | Tag subsets safe to run | Owner |
|---|---|---|---|---|---|---|
| `dev` (local) | `{{dev-url}}` | `{{dev-auth}}` | `{{dev-seed}}` | ✅ allowed | All | Dev team |
| `qa` (shared) | `{{qa-url}}` | `{{qa-auth}}` | `{{qa-seed}}` | ✅ allowed (cleanup mandatory) | `@regression`, `@smoke`, `@critical` | QE team |
| `stage` | `{{stage-url}}` | `{{stage-auth}}` | `{{stage-seed}}` | ⚠️ allowed for pre-release validation only | `@smoke`, `@critical` | Release manager |
| `prod-readonly` | `{{prod-url}}` | `{{prod-auth}}` | live (read-only) | ❌ FORBIDDEN | `@smoke` with `@readonly` only | On-call |

**Per-environment provides / doesn't-provide:**

| Capability | dev | qa | stage | prod-readonly |
|---|---|---|---|---|
| Stable URLs | ✅ | ✅ | ✅ | ✅ |
| Resettable seed data | ✅ | ⚠️ shared | ❌ | ❌ |
| Sandbox payment processor | ✅ | ✅ | ✅ | ❌ live |
| Feature flags overridable | ✅ | ✅ via admin | ❌ | ❌ |
| Email / SMS deliverability | ❌ stubbed | ❌ stubbed | ✅ to allow-list | ✅ to allow-list |
| Webhook endpoint sink | ✅ local | ✅ shared sink | ✅ shared sink | n/a |

**Refresh / reset procedures:**

| Environment | Refresh trigger | Procedure | Downtime |
|---|---|---|---|
| `dev` | On-demand | `{{dev-refresh-cmd}}` | None |
| `qa` | Nightly + on-demand | `{{qa-refresh-cmd}}` | 5 min |
| `stage` | Per release | Owned by release manager | 15 min |

**Known environment-specific failures:** {{env-failures — e.g. "QA's payment processor stub returns `RATE_LIMITED` after ~200 calls/min; smoke runs that exceed this should be split or rate-limited. See ticket QE-1294."}}

**Local-dev workaround:** {{local-workaround — e.g. "If you can't reach QA, `{{local-target}}` spins up a docker-compose stack with all dependencies stubbed; pass `--profile=local-stack`."}}

