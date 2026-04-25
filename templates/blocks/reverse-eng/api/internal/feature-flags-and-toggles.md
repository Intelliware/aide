---
slug: feature-flags-and-toggles
title: "Feature Flags and Toggles"
applies-to: [re-api-internal]
requires-decision-from: [code-reader, architect]
optional: true
order-hint: 360
---

## 26. Feature Flags and Toggles

This section documents the feature-flag system used by the API: the flag provider (LaunchDarkly, Unleash, ConfigCat, Flipt, env-var booleans, in-house), the flag taxonomy (release toggle, experiment, ops toggle, permissioning), the access pattern in code, and the lifecycle expectations (when a flag should be removed). The downstream AI must use the existing flag client rather than reading config directly, and must know which flags are *short-lived* (delete after rollout) vs *permanent* (kill switches, customer-tier gates).

Extract from the source: the flag-client wrapper module, the list of currently-defined flags (often in a central registry or in the provider's UI export), and any naming conventions. Trace one flag from definition to evaluation site to confirm the pattern. If flag values are cached, document the TTL and the impact of a stale value.

To verify, list flags that are referenced in code but no longer exist in the provider (dead-code risk) and flags that exist in the provider but not referenced in code (config drift). Confirm flag evaluations include the appropriate context (user, tenant, environment) — a flag evaluated without user context cannot be targeted per-user.

Be careful about confusing feature flags with environment configuration. A boolean env var like `ENABLE_NEW_PARSER=true` is *not* a feature flag — it can't be flipped without redeploy. Document the distinction. Also be careful: kill switches are critical and must default safe (off → safe behavior, missing flag → safe behavior).

Hallucination risks: do not assume LaunchDarkly when the codebase uses a homegrown system; do not invent flags not present in code; do not assume per-user targeting works if the evaluation context omits userId.

If the API has no feature-flag system, mark this section "Not applicable — feature gating is done via deploy-time configuration only" and skip subsections.

### Suggested template content

#### 26.1 Flag Provider

- **Provider:** {{e.g., LaunchDarkly, Unleash self-hosted, ConfigCat, in-house}}
- **SDK:** {{e.g., launchdarkly-node-server-sdk 7.x}}
- **Init location:** `{{src/flags/client.ts}}`
- **Flag definition source of truth:** {{provider UI / git-tracked YAML / both with sync job}}

#### 26.2 Flag Taxonomy

| Type | Lifetime | Naming Prefix | Example |
|------|----------|---------------|---------|
| Release | {{weeks}} | `release-` | `{{release-orders-v2}}` |
| Experiment | {{weeks}} | `exp-` | `{{exp-checkout-cta-color}}` |
| Ops / kill switch | {{permanent}} | `ops-` | `{{ops-disable-3rd-party-billing}}` |
| Permission / entitlement | {{permanent}} | `entitlement-` | `{{entitlement-advanced-analytics}}` |

#### 26.3 Evaluating a Flag

```{{language}}
// Canonical evaluation pattern — always include context (user, tenant, env)
const enabled = await flags.boolVariation(
  'release-orders-v2',
  { userId, tenantId, env: process.env.NODE_ENV },
  /* default */ false
);
```

**Default value rules:**
- Release flags: default to `false` (old behavior)
- Kill switches: default to `true` (feature on) — flipping `false` disables fast
- Entitlements: default to `false` (deny by default)

#### 26.4 Current Flag Inventory

| Flag | Type | Owner | Created | Removal Target |
|------|------|-------|---------|----------------|
| `{{release-orders-v2}}` | release | {{@orders-team}} | {{2024-09}} | {{after 100% rollout, ~2024-12}} |
| `{{ops-disable-third-party-billing}}` | ops | {{@platform}} | {{2023-04}} | {{permanent}} |

#### 26.5 Flag Hygiene Rules

- {{Release flags: open a removal ticket the day they hit 100%}}
- {{Never reference a flag in more than 5 sites without a wrapper function}}
- {{Never branch on a flag inside a hot loop — evaluate once at the boundary}}

#### 26.6 Local Development

- **Override mechanism:** {{e.g., `.env.flags.local` overrides → bypass provider}}
- **Provider in dev/test:** {{e.g., file-source provider with checked-in defaults}}

#### 26.7 Audit / Change Log

- {{Where flag changes are logged (provider audit log, CloudTrail, dedicated channel)}}
- {{Who can flip prod flags (RBAC in provider)}}
