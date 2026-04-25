---
slug: error-handling
title: "Error Handling and Retries"
applies-to: [re-api-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 210
---

## 11. Error Handling and Retries

Document the canonical error model, the retry classification of every status code, and the safe retry strategy. Consumers need a single decision table they can encode into their HTTP client. Verify by intentionally producing each error class (bad input, expired token, 409 conflict, simulated 5xx) and confirming the response shape and headers.

This block is the consumer's reference for resilience. Tie idempotency keys to retries explicitly: which methods MUST carry an idempotency key for safe retry, and what the API does when a retry collides with an in-flight request. Cross-link to rate-limits for 429 handling and to authentication for 401 handling.

### Suggested template content

**Canonical error envelope:**

```json
{
  "error": {
    "code": "{{stable-code}}",
    "message": "{{human-readable}}",
    "details": [ { "field": "{{f}}", "issue": "{{i}}" } ],
    "request_id": "{{uuid}}",
    "documentation_url": "{{url}}"
  }
}
```

- Switch on `error.code` (stable). Do NOT switch on `error.message` (may change).
- `details` is present for validation errors (typically 400, 422).

**Status code → retry decision matrix:**

| Status | Retry safe? | Strategy |
|---|---|---|
| 400 bad_request | No | Fix request; do not retry. |
| 401 unauthenticated | Once after re-auth | Refresh token, retry once. |
| 403 forbidden | No | Permission issue. |
| 404 not_found | No (usually) | Unless the resource is racy / eventually consistent. |
| 408 timeout | Yes, with backoff | Use idempotency key. |
| 409 conflict | No | Resolve conflict (refetch, merge, retry write). |
| 422 unprocessable | No | Validation error. |
| 425 too_early | Yes, after delay | Wait and retry; rare. |
| 429 rate_limited | Yes | Honor `Retry-After`; see rate-limits block. |
| 500 server_error | Yes, with backoff + idempotency | |
| 502/503/504 upstream | Yes, with backoff | |

**Retry algorithm (recommended):**

```
attempt = 0
while attempt < MAX_RETRIES:
    response = send(request, idempotency_key=KEY)
    if response.status < 500 and response.status not in (408, 425, 429):
        return response
    if response.status == 429:
        sleep(response.headers["Retry-After"] + jitter())
    else:
        sleep(min(MAX_BACKOFF, BASE * 2**attempt) + jitter())
    attempt += 1
raise GiveUp(response)
```

- `BASE`: 250 ms.
- `MAX_BACKOFF`: 30 s.
- `MAX_RETRIES`: 5.
- `jitter()`: uniform 0..BASE.
- `KEY`: stable UUID per logical request.

**Idempotency and retries:**

- All `POST`/`PUT`/`PATCH`/`DELETE` retried by the client MUST carry the SAME `Idempotency-Key`.
- Replays within {{idempotency-window}} return the original response.
- Replays after the window may double-execute — surface as user-visible error if duplication is unacceptable.

**Validation errors (400/422):**

```json
{
  "error": {
    "code": "validation_failed",
    "details": [
      { "field": "email", "issue": "must be a valid email address" },
      { "field": "age",   "issue": "must be >= 18" }
    ]
  }
}
```

Map `details[].field` to your form / DTO and surface inline.

**Distributed-tracing hooks:**

- `error.request_id` is the ID for support tickets.
- The same value is in the `X-Request-ID` response header.
- Log it on every consumer-side error.

**Anti-patterns:**

- Retrying 400/403/422 — wastes quota and obscures the real bug.
- Retrying without an idempotency key on writes — risks duplicates.
- Tight retry loops without backoff — can degrade an already-degraded service.
- Switching on `error.message` strings — they will change.
