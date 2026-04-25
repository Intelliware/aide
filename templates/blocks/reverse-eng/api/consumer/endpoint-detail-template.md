---
slug: endpoint-detail-template
title: "Endpoint Detail Template"
applies-to: [re-api-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 150
---

## 5. Endpoint Detail Template

A reusable per-endpoint sub-template. Use it once per non-trivial endpoint (the catalog block lists everything; this block shows the rich detail for endpoints worth documenting in depth). The discipline is: every section listed here MUST be filled or explicitly marked "n/a" — partial documentation creates more bugs than no documentation. Verify each example by replaying it against the actual API and pasting the real response.

For idempotent endpoints, document idempotency-key behavior. For long-running operations, document the polling/callback pattern. For endpoints that touch money or PII, link to the security/compliance notes. Keep examples small but realistic — a single-field example fails to surface the shape problems consumers will hit.

### Suggested template content

**Endpoint:** `{{METHOD}} {{path}}`

**Purpose:** {{one-sentence-purpose}}

**Auth:** {{auth-required — e.g. "Bearer token, scope `orders:write`"}}

**Idempotency:** {{idempotency-policy — e.g. "Send `Idempotency-Key: <uuid>`; replays within 24h return the original response"}}

**Path parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `{{param-1}}` | {{type}} | yes | {{desc}} |

**Query parameters:**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `{{q-1}}` | {{type}} | no | {{default}} | {{desc}} |

**Request headers (beyond auth/content-type):**

| Header | Required | Notes |
|---|---|---|
| `{{header-1}}` | {{required}} | {{notes}} |

**Request body (JSON):**

```json
{{request-body-example}}
```

**Field reference (request):**

| Field | Type | Required | Constraints | Notes |
|---|---|---|---|---|
| `{{field-1}}` | {{type}} | yes | {{constraints}} | {{notes}} |

**Successful response (HTTP {{success-status}}):**

```json
{{response-body-example}}
```

**Field reference (response):**

| Field | Type | Always present | Notes |
|---|---|---|---|
| `{{field-1}}` | {{type}} | yes | {{notes}} |

**Error responses:**

| Status | Code | When | Action |
|---|---|---|---|
| 400 | `{{err-code-1}}` | {{when}} | {{action}} |
| 404 | `{{err-code-2}}` | {{when}} | {{action}} |
| 409 | `{{err-code-3}}` | {{when}} | {{action}} |
| 429 | `rate_limited` | Rate limit exceeded | Honor `Retry-After` |

**curl example:**

```bash
curl -sS -X {{METHOD}} "{{base-url}}{{path}}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{{request-body-example-inline}}'
```

**Side effects:**

- {{side-effect-1 — e.g. "Emits `order.created` webhook"}}
- {{side-effect-2 — e.g. "Decrements inventory atomically"}}

**Caveats / gotchas:**

- {{gotcha-1}}
- {{gotcha-2}}
