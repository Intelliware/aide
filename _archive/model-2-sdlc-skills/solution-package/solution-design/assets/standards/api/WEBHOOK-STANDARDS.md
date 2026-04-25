# Webhook Design Standards

These are the baseline standards the AI uses when designing webhook interfaces (outbound HTTP callbacks to external consumers). During Step 3 of the API design skill, the AI compares existing webhook implementations against these standards. Where the codebase deviates, the AI flags the deviation and asks the user whether new webhook events should follow the existing pattern or adopt the standard.

---

## 1. Event Type Naming

### Rules

- Use dot-separated, lowercase naming: `{entity}.{action}`
- Action should be **past tense** — the event describes something that already happened
- Group by domain entity, not by consumer
- Provide a discoverable event catalog

### Examples

```
# Good
order.created
order.updated
order.cancelled
payment.completed
payment.failed
invoice.finalized
subscription.renewed
subscription.cancelled

# Bad
createOrder          # verb-first, imperative
ORDER_CREATED        # inconsistent casing
new-order            # ambiguous, no entity.action pattern
handlePayment        # describes handler, not event
```

### Event Catalog

Maintain a documented catalog of all webhook event types with:
- Event type name
- Description of when the event fires
- Payload schema (or link to schema)
- API version the event was introduced in
- Whether the event is opt-in or always delivered

---

## 2. Payload Envelope

### Rules

- Every webhook delivery uses a consistent envelope wrapping the event-specific data
- Include metadata fields for routing, verification, and debugging
- The `data` object contains the event-specific payload
- Timestamps use ISO 8601 with timezone

### Standard Envelope

```json
{
  "id": "evt_delivery_abc123",
  "type": "order.completed",
  "apiVersion": "2024-01-15",
  "created": "2024-01-15T10:30:00Z",
  "data": {
    "id": "ord_xyz789",
    "status": "completed",
    "total": 99.99,
    "currency": "USD"
  }
}
```

### Required Fields

| Field | Type | Purpose |
|-------|------|---------|
| `id` | string | Unique delivery ID for idempotency — consumers use this to deduplicate |
| `type` | string | Event type (matches event catalog) |
| `apiVersion` | string | API version of this payload schema (date-based: `YYYY-MM-DD`) |
| `created` | string (ISO 8601) | When the event occurred (not when it was delivered) |
| `data` | object | Event-specific payload |

### Optional Fields

| Field | Type | Purpose |
|-------|------|---------|
| `livemode` | boolean | Whether this is a production event or a test |
| `previousAttributes` | object | For `*.updated` events — which fields changed and their previous values |
| `account` | string | Multi-tenant: which account/org this event belongs to |

---

## 3. Payload Design

### Rules

- Payloads should be **self-contained** — include enough data for the consumer to act without making additional API calls
- Include the full current state of the resource, not just the changed fields (except for `previousAttributes`)
- Use the same field names and types as the corresponding REST API resource representation
- Keep payloads under 256 KB — for larger data, include a resource ID and a link to fetch the full resource

### Self-Contained Payload

```json
{
  "type": "order.completed",
  "data": {
    "id": "ord_xyz789",
    "customer": {
      "id": "cust_abc123",
      "email": "user@example.com"
    },
    "items": [
      {"productId": "prod_001", "quantity": 2, "price": 49.99}
    ],
    "total": 99.99,
    "currency": "USD",
    "completedAt": "2024-01-15T10:30:00Z"
  }
}
```

Not:

```json
{
  "type": "order.completed",
  "data": {
    "orderId": "ord_xyz789"
  }
}
```

---

## 4. Signature and Verification

### Rules

- Sign every delivery payload using HMAC-SHA256 with a per-subscription secret
- Include the signature in a dedicated header (e.g., `X-Signature-256`)
- The signature is computed over the **raw request body** (not a parsed/re-serialized version)
- Provide clear documentation and code examples for verification in common languages
- Support secret rotation — allow two active secrets during rotation, accept either signature

### Signature Format

```
X-Signature-256: sha256=<hex-encoded HMAC-SHA256 of raw body>
```

### Verification Pseudocode

```
expected = HMAC-SHA256(webhook_secret, raw_request_body)
actual = parse_header(request.headers["X-Signature-256"])
if not constant_time_compare(expected, actual):
    return 401
```

### Timestamp Protection (Replay Prevention)

Include a timestamp header (e.g., `X-Webhook-Timestamp`) and reject deliveries older than 5 minutes:

```
X-Webhook-Timestamp: 1705312200
```

The signature should cover `{timestamp}.{body}` to bind the timestamp to the payload.

---

## 5. Delivery Headers

### Standard Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Type` | `application/json` | Payload format |
| `X-Webhook-ID` | Unique delivery ID | Same as envelope `id` — for deduplication |
| `X-Webhook-Timestamp` | Unix timestamp | When the delivery was sent |
| `X-Signature-256` | `sha256=...` | HMAC signature for verification |
| `X-Event-Type` | `order.completed` | Event type for quick routing without parsing body |
| `X-API-Version` | `2024-01-15` | API version for payload schema |
| `User-Agent` | `YourApp-Webhook/1.0` | Identifies the webhook sender |

---

## 6. Retry Policy

### Rules

- Retry on 5xx responses and timeouts — do not retry on 4xx (client error means the request won't succeed on retry)
- Use exponential backoff with jitter: e.g., 1 min, 5 min, 30 min, 2 hr, 8 hr
- Set a maximum number of retry attempts (recommended: 5)
- Set a per-delivery timeout (recommended: 30 seconds)
- After all retries are exhausted, mark the delivery as failed
- Provide a mechanism for manual re-delivery (via API or dashboard)

### Standard Schedule

| Attempt | Delay After Previous |
|---------|---------------------|
| 1 (initial) | Immediate |
| 2 | ~1 minute |
| 3 | ~5 minutes |
| 4 | ~30 minutes |
| 5 | ~2 hours |
| 6 (final) | ~8 hours |

### Response Interpretation

| Consumer Response | Producer Action |
|------------------|-----------------|
| 2xx | Delivery successful — no retry |
| 3xx | Follow redirect once, then treat final response normally |
| 4xx | Delivery failed — do not retry (consumer error) |
| 5xx | Delivery failed — retry per schedule |
| Timeout (no response) | Delivery failed — retry per schedule |
| Connection refused | Delivery failed — retry per schedule |

---

## 7. Subscription Health Monitoring

### Rules

- Track consecutive delivery failures per subscription
- Auto-disable subscriptions after N consecutive failures (recommended: 5–10)
- Notify the subscription owner before disabling (email, dashboard alert)
- Provide a health status per subscription: `active`, `degraded` (some failures), `disabled` (auto-paused)
- Allow manual re-enable after the consumer fixes the issue
- Provide a test/ping endpoint to verify the consumer URL is reachable

### Health States

```
active    → all recent deliveries succeeded
degraded  → 1+ recent deliveries failed, retries in progress
disabled  → consecutive failure threshold exceeded, deliveries paused
```

---

## 8. Registration API

### Rules

- Provide a RESTful API for subscription management (follows the REST standards)
- Subscriptions specify: callback URL, event types to subscribe to, and a secret for signature verification
- Support filtering by event type — consumers should only receive events they care about
- Return the signing secret only once at creation time (do not expose in GET responses)

### Standard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/webhooks` | Create a new subscription |
| GET | `/api/v1/webhooks` | List all subscriptions for the authenticated consumer |
| GET | `/api/v1/webhooks/{id}` | Get subscription details (excludes secret) |
| PATCH | `/api/v1/webhooks/{id}` | Update subscription (URL, events) |
| DELETE | `/api/v1/webhooks/{id}` | Delete subscription |
| POST | `/api/v1/webhooks/{id}/test` | Send a test event to verify the endpoint |
| POST | `/api/v1/webhooks/{id}/rotate-secret` | Rotate the signing secret (returns new secret, old remains valid for 24h) |

### Registration Payload

```json
{
  "url": "https://consumer.example.com/hooks/orders",
  "events": ["order.completed", "order.cancelled"],
  "description": "Order fulfillment notifications"
}
```

### Response (creation only)

```json
{
  "id": "whk_abc123",
  "url": "https://consumer.example.com/hooks/orders",
  "events": ["order.completed", "order.cancelled"],
  "secret": "whsec_xxxxxxxxxxxxxxxx",
  "status": "active",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

## 9. Idempotency

### Rules

- Every delivery includes a unique delivery ID (`id` in envelope, `X-Webhook-ID` header)
- Consumers must deduplicate by delivery ID — the same event may be delivered more than once due to retries
- Document that delivery is "at least once" — consumers must handle duplicates gracefully
- For `*.updated` events, include enough state (or a version/sequence number) for consumers to detect out-of-order delivery

---

## 10. Versioning

### Rules

- Use date-based API versions (e.g., `2024-01-15`) — each version defines the payload schema for all event types
- Include the API version in both the payload envelope and the delivery headers
- When introducing breaking payload changes, release a new API version
- Consumers subscribe at a specific API version — they continue receiving that version's schema until they upgrade
- Maintain at least 2 API versions concurrently during migration periods
- Breaking changes include: removing fields, renaming fields, changing field types, restructuring nested objects

### Non-Breaking Changes (Safe Within Same Version)

- Adding new optional fields to the payload
- Adding new event types to the catalog
- Adding new optional fields to the envelope

---

## 11. Security

### Rules

- Validate callback URLs at registration time — reject private IPs, localhost, and internal network addresses (SSRF prevention)
- Use HTTPS-only callback URLs (reject HTTP)
- Include timestamp in signature to prevent replay attacks (reject deliveries older than 5 minutes)
- Rate-limit webhook registration endpoints to prevent abuse
- Do not include sensitive data (passwords, full payment details, PII beyond what's necessary) in webhook payloads
- Support IP allowlisting — publish the IP ranges webhook deliveries originate from

---

## 12. Testing and Debugging

### Rules

- Provide a test/ping mechanism to verify consumer endpoints
- Provide a delivery log (recent deliveries per subscription with status, response code, response time)
- Support manual re-delivery of specific events for debugging
- Provide a webhook event simulator in sandbox/test environments
- Include a `livemode: false` flag in test deliveries so consumers can differentiate

---

## Design Checklist

For every webhook implementation, verify:

- [ ] Event types follow `entity.action` naming (past tense)
- [ ] Payload envelope includes: id, type, apiVersion, created, data
- [ ] Payloads are self-contained (consumer can act without additional API calls)
- [ ] Deliveries are signed with HMAC-SHA256
- [ ] Signature covers timestamp + body (replay protection)
- [ ] Retry policy uses exponential backoff (5xx and timeout only)
- [ ] Maximum retry count and schedule are defined
- [ ] Subscription health monitoring auto-disables after consecutive failures
- [ ] Registration API is RESTful with CRUD + test + rotate-secret endpoints
- [ ] Signing secret is returned only at creation time
- [ ] Callback URLs are validated (HTTPS only, no private IPs)
- [ ] Delivery IDs enable consumer-side deduplication
- [ ] API versioning is date-based with concurrent version support
- [ ] Event catalog is documented and discoverable
- [ ] Sensitive data is excluded from payloads
