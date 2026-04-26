---
slug: rollout-notes
title: "Rollout Notes"
applies-to: [pr-description]
requires-decision-from: [author, ops]
optional: true
order-hint: 6
---

## Rollout Notes

Anything operations / SRE / ops-on-call needs to know to land this change
safely. Omit the section when the PR is a pure code change with no
deploy-time considerations.

**Format:**

```
## Rollout Notes

- **Deploy order:** {{which services / repos must deploy first; or
  "any order"}}
- **Migrations:** {{schema migrations, data backfills, idempotency
  guarantees}}
- **Feature flags:** {{flag name, default state, rollout plan}}
- **Config changes:** {{new env vars, secrets, infra knobs}}
- **Rollback plan:** {{is rollback safe? if not, why and what mitigates}}
- **Observability:** {{new metrics, dashboards, alerts to watch on
  rollout}}
```

**Rules:**

- Required when the PR includes: a schema migration, a new env var or
  secret, a feature flag, a service-to-service contract change, or any
  change that is not safely rollback-able.
- Always state whether rollback is safe. "Yes, just revert" is a valid
  answer; silence is not.
- Cite the dashboard / alert by name, not by URL (URLs rot).

**Examples:**

- ✅ "Schema migration `0042_add_entra_sub.sql` — additive, safe to
  rollback; backfill is a separate idempotent script run after deploy."
- ✅ "Feature-flagged behind `auth.entra_enabled`, off by default; rollout
  plan: 5% staff cohort → 50% → 100% over one week."
- ❌ "Should be fine to deploy." (not a plan)
