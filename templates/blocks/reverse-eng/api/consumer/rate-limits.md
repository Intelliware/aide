---
slug: rate-limits
title: "Rate Limits"
applies-to: [re-api-consumer]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 200
---

## 10. Rate Limits

Document the rate-limit model in enough detail that a consumer can size their workload and build a correct retry strategy. Specify the limit dimensions (per-key, per-IP, per-endpoint, per-token-cost), the time windows, the exact response headers returned, and the expected behavior on burst vs. sustained overage. Verify by intentionally tripping the limit in sandbox and inspecting the headers and the retry semantics.

If the API uses a token-bucket model with per-endpoint cost, document the cost table here (cross-link to the endpoint catalog). If different plans / tiers have different limits, list them. Be explicit about whether rate-limit headers are returned on every response or only on rejection — consumers need to know if they can pace themselves preemptively.

### Suggested template content

**Rate-limit model:** {{model — e.g. "Token bucket, per API key"}}

**Limits by tier:**

| Tier | Burst capacity | Refill rate | Notes |
|---|---|---|---|
| Free | 60 | 1/s | |
| Standard | 1,000 | 50/s | |
| Enterprise | Custom | Custom | Contact support |

**Per-endpoint cost (token cost):**

| Endpoint | Cost | Notes |
|---|---|---|
| `GET /v1/*` (single resource) | 1 | |
| `GET /v1/*` (list) | 1 + (limit/100) | Larger pages cost more. |
| `POST /v1/orders` | 5 | Writes cost more. |
| `POST /v1/orders/*/refund` | 10 | Sensitive ops are expensive. |

**Returned headers (on EVERY response):**

| Header | Meaning |
|---|---|
| `X-RateLimit-Limit` | Total bucket capacity. |
| `X-RateLimit-Remaining` | Tokens remaining at time of response. |
| `X-RateLimit-Reset` | Unix epoch seconds until full refill. |
| `Retry-After` | (On 429 only) seconds to wait before retrying. |

**429 response shape:**

```json
{
  "error": {
    "code": "rate_limited",
    "message": "Rate limit exceeded",
    "retry_after_seconds": 12
  }
}
```

**Recommended client strategy:**

1. Track `X-RateLimit-Remaining`; throttle preemptively below {{preemptive-threshold — e.g. 10%}}.
2. On 429, sleep for `Retry-After` plus jitter, then retry.
3. Cap retries at {{max-retries — e.g. 5}}; surface failures upward beyond that.
4. Use exponential backoff for chained 429s: `min(cap, base * 2^attempt) + random(0..base)`.
5. Group concurrent requests to avoid thundering-herd retries.

**Distinct limit dimensions:**

- **Per API key:** primary limit.
- **Per IP:** secondary limit, looser, protects against shared-key abuse.
- **Global:** circuit-breaker if the API is degraded.

**Long-running / bulk endpoints:**

- `{{bulk-endpoint}}` is exempt from the standard limit but enforces concurrency: max {{bulk-concurrency}} in-flight per key.

**Operational guidance:**

- Plan for headroom: target steady-state usage at ≤ 70% of refill rate.
- Capacity changes require a tier upgrade ({{upgrade-link}}); short-term burst increases via {{burst-request-process}}.
- Do not cache requests indiscriminately to dodge limits — caching policies in response headers must be honored.
