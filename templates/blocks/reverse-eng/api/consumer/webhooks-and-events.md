---
slug: webhooks-and-events
title: "Webhooks and Events"
applies-to: [re-api-consumer]
requires-decision-from: [code-reader, security]
optional: true
order-hint: 220
---

## 12. Webhooks and Events

If the API supports server-to-server events / webhooks, document the registration flow, event types, payload shape, signature verification, retry/replay semantics, and ordering guarantees. Mark this block optional — many consumer integrations are pull-only. If the API instead exposes a streaming endpoint (SSE, WebSocket) or a message bus (Kafka, SNS), use this block to cover that and rename if helpful.

Verify webhook signature verification by sending a real event and a tampered event through the consumer's verification function — silent acceptance of a bad signature is the classic webhook security bug. Document the API's behavior under retries (does it deliver duplicates? in what order?) so the consumer can build idempotent receivers.

### Suggested template content

**When to use webhooks:**

- Use webhooks for: {{use-cases — e.g. "order.completed, refund.issued"}}.
- Do NOT use webhooks for: {{anti-uses — e.g. "high-frequency price ticks — use the streaming endpoint instead"}}.

**Registering a webhook:**

```
POST /v1/webhooks
{
  "url": "https://example.com/hooks/api",
  "events": ["order.created", "order.updated"],
  "secret": "{{caller-supplied-secret}}",
  "active": true
}
```

- The `secret` is used to sign every delivery; store it in your secrets manager.
- One subscription per event-type bundle; multiple subscriptions are allowed.

**Event catalog:**

| Event type | When fired | Idempotent? |
|---|---|---|
| `order.created` | New order accepted | yes (use `event.id`) |
| `order.updated` | Any field change | yes |
| `order.completed` | Fulfillment finished | yes |
| `refund.issued` | Refund processed | yes |
| {{event-N}} | {{when}} | {{idempotent}} |

**Event payload shape:**

```json
{
  "id": "evt_{{uuid}}",
  "type": "order.created",
  "created_at": "2026-04-25T12:34:56Z",
  "api_version": "{{version}}",
  "data": { {{resource-snapshot}} }
}
```

**Signature verification:**

Headers on every delivery:

| Header | Purpose |
|---|---|
| `X-Signature` | `t=<unix>,v1=<hex-hmac-sha256>` |
| `X-Event-Id` | Stable event ID; use for dedupe. |
| `X-Delivery-Attempt` | Increments on each retry. |

Verification (pseudo):

```
signed_payload = f"{t}.{raw_body}"
expected = hmac_sha256(secret, signed_payload)
if not constant_time_eq(expected, v1):
    return 400
if abs(now() - t) > 300:
    return 400  # tolerance window 5min
```

- Reject events older than the tolerance window to prevent replay.
- Use constant-time comparison; do not use `==`.

**Retry / replay behavior:**

- Failed deliveries (non-2xx, timeout) retry with backoff: {{retry-schedule — e.g. "1m, 5m, 30m, 2h, 12h"}}.
- Total retry window: {{retry-window — e.g. "24h"}}.
- After exhaustion, events go to a dead-letter queue; manual replay via dashboard.
- Duplicates are possible — receivers MUST dedupe on `event.id`.

**Ordering:**

- Within a single resource, events are delivered in causal order on a best-effort basis.
- Across resources, NO ordering guarantee.
- Consumers should derive state from `data` snapshots, not from event ordering.

**Receiver checklist:**

1. Verify signature within tolerance window.
2. Dedupe on `X-Event-Id`.
3. Persist event before acting on it.
4. Return 2xx within {{ack-timeout — e.g. 5s}} or the delivery is retried.
5. Respond with 4xx for permanently bad payloads (signature invalid, unknown type) so the API stops retrying.
6. Respond with 5xx for transient issues so the API retries.
