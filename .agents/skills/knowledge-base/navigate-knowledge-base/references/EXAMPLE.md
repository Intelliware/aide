# navigate-knowledge-base — Worked Example

## Scenario

The user has come into ACME's `create-requirements-package` skill with the
prompt: "I want to add a 'guest checkout' option so buyers without an
account can place orders. They should still get an order confirmation
email but won't have a saved profile."

`create-requirements-package` invokes `navigate-knowledge-base` with that
prompt as the feature description and the default cap of 7 components.

## Inputs

```
feature_description: "Add guest checkout: buyers without an account can place
  orders, get a confirmation email, but no saved profile."
knowledge_base_path: ../acme-kb
--max-components: 7
--include-cross-cutting: true
--depth: one-hop
```

## Step trace

### 1. Read ARCHITECTURE.md (§ 1–4)

The skill reads:

- Solution Summary (3 paragraphs).
- Repository Map (3 rows: api-orders, api-billing, web-portal).
- Component Catalog (14 rows).
- Capability Index (~10 rows).

Capability Index rows that catch the eye:

| Capability | Component IDs |
|---|---|
| place order | `order-checkout-flow` |
| render checkout page | `web-portal-checkout-page` |
| send transactional email | `notifications-email-dispatcher` |
| authenticate user | `auth-session-issuer` |
| authorize payment | `billing-payment-authorization` |

### 2. Capability lookup

Tokenise feature description: ["add", "guest", "checkout", "buyers",
"without", "account", "place", "orders", "confirmation", "email", "saved",
"profile"]. Lemmatise: ["add", "guest", "checkout", "buyer", "without",
"account", "place", "order", "confirmation", "email", "save", "profile"].

Match capabilities:

| Capability | Match |
|---|---|
| place order | "place" + "order" verbatim → score 1.0. Component: `order-checkout-flow`. |
| render checkout page | "checkout" verbatim → score 0.6. Component: `web-portal-checkout-page`. |
| send transactional email | "email" + "confirmation" → score 0.7. Component: `notifications-email-dispatcher`. |
| authenticate user | no match — but cross-cutting "auth" keyword → see step 4. |

Three primary components.

### 3. Graph expansion (one-hop)

Read `graph.json`. For each primary, walk `depends_on` and the inverse of
`consumed_by`:

- `order-checkout-flow`:
  - depends_on: `billing-payment-authorization`, `inventory-reservation`,
    `tax-calculation`.
  - consumed_by: `web-portal-checkout-page` (already a primary),
    `mobile-app-checkout-screen`.
- `web-portal-checkout-page`:
  - depends_on: `order-checkout-flow` (already a primary),
    `auth-session-issuer`.
  - consumed_by: (none, it's a UI leaf).
- `notifications-email-dispatcher`:
  - depends_on: `template-renderer`.
  - consumed_by: `order-checkout-flow`,
    `account-password-reset-flow`.

One-hop neighbours (deduped, primaries removed):

- `billing-payment-authorization`
- `inventory-reservation`
- `tax-calculation`
- `mobile-app-checkout-screen`
- `auth-session-issuer`
- `template-renderer`
- `account-password-reset-flow`

### 4. Cross-cutting injection

Feature description mentions "account" → cross-cutting concern `auth`
matches. Append `shared/cross-cutting/auth.md` (tier=cross-cutting, score
0.4).

### 5. Cap and rank

Pre-cap candidate list (10 entries):

| Tier | Component | Score |
|---|---|---|
| primary | order-checkout-flow | 1.0 |
| primary | notifications-email-dispatcher | 0.7 |
| primary | web-portal-checkout-page | 0.6 |
| one-hop | billing-payment-authorization | 0.5 |
| one-hop | auth-session-issuer | 0.5 |
| one-hop | inventory-reservation | 0.5 |
| one-hop | tax-calculation | 0.5 |
| one-hop | mobile-app-checkout-screen | 0.5 |
| one-hop | template-renderer | 0.5 |
| one-hop | account-password-reset-flow | 0.5 |
| cross-cutting | shared/cross-cutting/auth.md | 0.4 |

Ranking (tier_rank * 1000 + score):

1. order-checkout-flow (3000 + 1.0)
2. notifications-email-dispatcher (3000 + 0.7)
3. web-portal-checkout-page (3000 + 0.6)
4. cross-cutting auth.md (1500 + 0.4 = 1500.4)
5. billing-payment-authorization (2000 + 0.5)

Wait — cross-cutting tier-rank is 1.5, primary is 3, one-hop is 2. Re-sort:

1. order-checkout-flow (3000.0 + 1.0)
2. notifications-email-dispatcher (3000 + 0.7)
3. web-portal-checkout-page (3000 + 0.6)
4. billing-payment-authorization (2000 + 0.5)
5. auth-session-issuer (2000 + 0.5)
6. inventory-reservation (2000 + 0.5)
7. tax-calculation (2000 + 0.5)

Cap at 7. Cross-cutting auth.md is dropped; tax-calculation is dropped.
Tie-breakers: alphabetical on component_id within score-bucket. Final
top-7:

| # | Path | Tier | Why |
|---|---|---|---|
| 1 | components/api-orders/order-checkout-flow.md | primary | Capability "place order" + trigger "checkout" / "place order" both matched. |
| 2 | components/notifications/notifications-email-dispatcher.md | primary | Capability "send transactional email" + trigger "confirmation email" matched. |
| 3 | components/web-portal/web-portal-checkout-page.md | primary | Capability "render checkout page" + trigger "checkout" matched. |
| 4 | components/api-billing/billing-payment-authorization.md | one-hop | order-checkout-flow depends_on this (calls). |
| 5 | components/auth/auth-session-issuer.md | one-hop | web-portal-checkout-page depends_on this (calls); guest flow likely needs anonymous-session handling. |
| 6 | components/api-orders/inventory-reservation.md | one-hop | order-checkout-flow depends_on this (calls). |
| 7 | components/api-orders/tax-calculation.md | one-hop | order-checkout-flow depends_on this (calls). |

## Output passed to caller

```json
[
  {
    "path": "components/api-orders/order-checkout-flow.md",
    "tier": "primary",
    "score": 1.0,
    "why": "Capability \"place order\" matched; triggers \"place order\" and \"checkout\" verbatim in feature description.",
    "repo": "api-orders",
    "last_verified_against_commit": "8f3c1a2b9e7d4c6f5b8a1d2e9c0f7a6b3d4e5f12",
    "frontmatter": { ... }
  },
  ...
]
```

`create-requirements-package` then reads these 7 components and proceeds
with requirement authoring.

## Counter-example — when the skill returns empty

User prompt: "I want to refactor our internal CI build cache."

- Capability lookup: no row matches "build cache" or "CI" — these are
  not user-facing capabilities.
- Trigger lookup: `triggers:` arrays in component frontmatter mostly hold
  user-action verbs; no match.
- Cross-cutting: "build" doesn't match any of auth/log/error/security/
  performance/version.

Skill returns `[]` with `why = "no capability or trigger matched the
description; the system has no user-facing component for build-cache
concerns. Read ARCHITECTURE.md and synthesized/10-repository-maintenance/
README.md for cross-cutting tooling."`

Caller (the requirements skill) sees the empty list and switches to a
"the user is asking about repo tooling, not product capability" handler.
