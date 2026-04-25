---
slug: request-format
title: "Request Format"
applies-to: [re-api-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 160
---

## 6. Request Format

Document conventions that apply to every request: required headers, content-type rules, body encoding, parameter casing, character sets, idempotency keys, request IDs, and size limits. The aim is to let a consumer write a single HTTP-client wrapper that gets all of this right and never revisit it. Verify by tailing actual request/response logs from the API gateway, not by reading docs — header policies tend to drift.

Be precise about case sensitivity (paths, query keys, header values), about how arrays/objects are encoded in query strings, and about what happens for unknown fields in JSON bodies (rejected, ignored, or silently mutated). Document the exact maximum request body size — clients hit this in production and the failure mode is rarely friendly.

### Suggested template content

**Required request headers:**

| Header | Value / format | Notes |
|---|---|---|
| `Authorization` | `Bearer <token>` | See authentication block. |
| `Content-Type` | `application/json` (default) | Other accepted: {{other-content-types}} |
| `Accept` | `application/json` | Used for content negotiation. |
| `Idempotency-Key` | UUID v4 string | Required for non-idempotent writes. |
| `X-Request-ID` | Optional, UUID | Echoed in responses for tracing. |
| `User-Agent` | `<app>/<version>` | Required; bare clients are blocked. |

**Body encoding:**

- JSON bodies must be UTF-8.
- Numeric IDs over 2^53 must be sent as strings (JSON number precision).
- Dates/times: ISO-8601 with timezone, e.g. `2026-04-25T12:34:56Z`.
- Decimals (currency, etc.): {{decimal-encoding — e.g. "minor units as integers"}}.
- Unknown fields: {{policy — e.g. "rejected with 400 unknown_field"}}.

**Query string conventions:**

- Casing: `{{casing — e.g. snake_case}}`.
- Arrays: `{{array-encoding — e.g. "?ids=1&ids=2 (repeated key) — NOT comma-separated"}}`.
- Booleans: `true` / `false` (lowercase).
- Empty values: {{empty-value-policy — e.g. "treated as null"}}.

**Path conventions:**

- Path is case-sensitive.
- Resource IDs are URL-safe base62 / UUID / numeric — see per-resource detail.
- Encoding: percent-encode unsafe bytes; do not double-encode.

**Size limits:**

- Maximum request body: `{{max-body — e.g. "1 MiB"}}`.
- Maximum URL length: `{{max-url}}`.
- Maximum header size: `{{max-header}}`.

**Idempotency keys:**

- Apply to all `POST`, `PUT`, `PATCH`, `DELETE`.
- Key is scoped to {{idempotency-scope — e.g. "auth principal + endpoint"}}.
- Replays within {{idempotency-window — e.g. 24h}} return the original response.
- Conflicting bodies with the same key return `409 idempotency_conflict`.

**Request ID propagation:**

- Send `X-Request-ID` for distributed tracing; it is logged and surfaced in error responses.
- If absent, the gateway assigns one and returns it in the response.

**Common mistakes:**

- {{mistake-1 — e.g. "Sending Content-Type: text/plain — rejected with 415"}}
- {{mistake-2 — e.g. "Sending booleans as 0/1 — rejected with 400"}}
- {{mistake-3 — e.g. "Reusing idempotency keys across endpoints"}}
