---
slug: analytics-and-attribution-events
title: "Analytics and Attribution Events"
applies-to: [re-mobile-app-consumer]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 160
---

## 6. Analytics and Attribution Events

This section is the **partner-visible event catalogue** — every analytics or attribution event the app emits. Marketing partners, attribution providers, and reporting consumers should treat this as a stable contract.

### 6.1 Event Naming Convention

```
{{domain}}.{{object}}.{{action}}
```

- `domain`: high-level area, e.g., `auth`, `commerce`, `messaging`, `account`, `marketing`.
- `object`: the noun the action applies to.
- `action`: a past-tense verb.

Examples: `auth.login.succeeded`, `commerce.order.completed`, `messaging.thread.opened`.

> Property names use `snake_case`. Booleans are explicit `true`/`false` (never `0`/`1`).

### 6.2 Core Event Catalogue

| Event Name | When It Fires | Required Properties | Optional Properties | Surfaced to Attribution? |
|------------|---------------|---------------------|---------------------|--------------------------|
| `app.session.started` | Cold start or return-from-background ≥30 min | `session_id`, `app_version`, `os`, `os_version` | `referrer_source`, `is_first_session` | yes |
| `app.session.ended` | Background ≥30 min | `session_id`, `duration_seconds` | — | no |
| `auth.login.succeeded` | Successful login | `user_id`, `auth_method` | `is_returning` | yes |
| `auth.signup.succeeded` | New account created | `user_id`, `auth_method` | `referrer_code` | yes (registration event) |
| `auth.logout.completed` | Logout completed | `user_id` | — | no |
| `screen.viewed` | Screen visible ≥0.5s | `screen_name`, `route` | `referrer_screen`, `tab` | partial (top funnels only) |
| `commerce.product.viewed` | PDP visible ≥1s | `product_id`, `category` | `position`, `list_id` | yes |
| `commerce.cart.added` | Item added to cart | `product_id`, `quantity`, `price`, `currency` | — | yes |
| `commerce.checkout.started` | Checkout entered | `cart_id`, `value`, `currency`, `item_count` | — | yes |
| `commerce.order.completed` | Purchase confirmed | `order_id`, `value`, `currency`, `tax`, `items[]` | `coupon`, `payment_method` | yes (purchase event) |
| `messaging.thread.opened` | Chat thread opened | `thread_id` | `partner_id` | no |
| `notification.received` | Push received in-app | `type`, `correlation_id` | `campaign_id` | no |
| `notification.opened` | Push tapped | `type`, `correlation_id` | `campaign_id` | yes |
| `deep_link.opened` | Deep link routed in app | `link`, `source` | `campaign`, `utm_*` | yes |
| `marketing.campaign.viewed` | In-app banner / surface viewed | `campaign_id`, `placement` | `variant` | yes |
| `marketing.campaign.clicked` | In-app banner clicked | `campaign_id`, `placement` | `variant` | yes |

### 6.3 User Properties (Set on Identify)

| Property | Type | Sources | Notes |
|----------|------|---------|-------|
| `user_id` | string | login | Opaque, stable across reinstalls |
| `account_age_days` | int | server-derived | Updated on each session start |
| `subscription_tier` | enum | server-derived | `free`, `plus`, `pro` |
| `locale` | string | OS | BCP-47 |
| `country` | string | OS / IP | ISO-3166 alpha-2 |
| `experiments` | map<string,string> | feature-flag SDK | Variant assignment per active experiment |

### 6.4 Standard Properties (Auto-Attached to Every Event)

```json
{
  "app_version": "2.4.5",
  "build_number": "24050",
  "os": "ios",
  "os_version": "17.4",
  "device_model": "iPhone15,2",
  "device_class": "phone",
  "locale": "en-US",
  "timezone": "America/New_York",
  "network": "wifi",
  "session_id": "{{uuid}}",
  "is_internal_user": false
}
```

### 6.5 Attribution-Provider Mapping

| Internal Event | AppsFlyer / Branch / Adjust Equivalent |
|----------------|----------------------------------------|
| `auth.signup.succeeded` | `af_complete_registration` / `COMPLETE_REGISTRATION` |
| `commerce.product.viewed` | `af_content_view` / `VIEW_ITEM` |
| `commerce.cart.added` | `af_add_to_cart` / `ADD_TO_CART` |
| `commerce.checkout.started` | `af_initiated_checkout` / `BEGIN_CHECKOUT` |
| `commerce.order.completed` | `af_purchase` / `PURCHASE` |
| `marketing.campaign.clicked` | `af_ad_click` / `AD_CLICK` |

> All revenue-bearing events include `value` (number) and `currency` (ISO-4217) so attribution providers compute LTV / ROAS automatically.

### 6.6 Event Validation

- Events failing the schema are **dropped client-side** (never sent) and logged to crash-reporting under tag `analytics.schema.violation`.
- Schemas live in `{{event_schema_path}}` (e.g., `events.schema.json`) and are versioned alongside the app.
- Partners requesting a new event provide schema + downstream consumer in `{{event_request_url}}`.

### 6.7 Server-Side Event Forwarding

Selected events are also dispatched **server-to-server** to partners via:

```
POST https://{{event_forwarder_host}}/v1/events
Authorization: Bearer ${PARTNER_API_KEY}
Content-Type: application/x-ndjson
```

This bypass exists for partners that cannot or should not consume IDFA/AAID directly. Eligibility list and the per-partner property allowlist live in `{{event_forwarder_config}}`.
