---
slug: response-format
title: "Response Format"
applies-to: [re-api-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 170
---

## 7. Response Format

Document the canonical success and error response shapes. Consumers should be able to write a single response parser. Cover: success envelope (or lack thereof), status-code policy, error envelope, included metadata (request ID, timing), and content-type negotiation. Verify by running a probe against several endpoints and comparing — drift between endpoints is common in older APIs and worth surfacing here.

Be explicit about what is GUARANTEED vs. opportunistic. "Always present" fields are a contract; "may be present" fields are not. Note when responses are stable across versions and when they may change (added fields are usually safe; removed/renamed fields are breaking).

### Suggested template content

**Status code policy:**

| Range | Meaning | Body |
|---|---|---|
| 2xx | Success | Resource or operation result |
| 3xx | Redirect | {{redirect-policy — e.g. "Follow location header"}} |
| 4xx | Client error | Error envelope (see below) |
| 5xx | Server error | Error envelope; safe to retry per error-handling block |

**Specific status codes used:**

| Code | When | Notes |
|---|---|---|
| 200 | Success with body | |
| 201 | Resource created | `Location` header points to the new resource. |
| 202 | Accepted, async | Body contains job ID; poll for completion. |
| 204 | Success, no body | Used for deletes and idempotent updates. |
| 400 | Bad request | Validation error; do not retry. |
| 401 | Unauthenticated | Re-auth and retry. |
| 403 | Forbidden | Permission denied; do not retry. |
| 404 | Not found | |
| 409 | Conflict | Duplicate, idempotency mismatch, or version conflict. |
| 422 | Unprocessable | Semantic validation failure. |
| 429 | Rate limited | Honor `Retry-After`. |
| 500 | Server error | Retry with backoff. |
| 502/503/504 | Upstream | Retry with backoff. |

**Success envelope:**

{{success-envelope-policy — pick one:}}

- **Bare resource (no envelope):** body IS the resource. Pagination metadata in headers (`Link`, `X-Total-Count`).
- **Wrapped envelope:** `{ "data": <resource>, "meta": {...} }`.

```json
{{success-example-json}}
```

**Always-present response headers:**

| Header | Purpose |
|---|---|
| `X-Request-ID` | Mirrors request, or assigned. Quote in support tickets. |
| `X-RateLimit-Remaining` | See rate-limits block. |
| `Date` | RFC 1123 timestamp. |
| `ETag` | Present on cacheable resources. |

**Error envelope:**

```json
{
  "error": {
    "code": "{{error-code}}",
    "message": "{{human-readable}}",
    "details": [
      { "field": "{{field}}", "issue": "{{issue}}" }
    ],
    "request_id": "{{uuid}}",
    "documentation_url": "{{url}}"
  }
}
```

**Error code stability:**

- `code` strings are stable across versions and safe to switch on.
- `message` strings may change; do not match on them.
- `details[]` shape may add fields; do not over-fit.

**Content negotiation:**

- Default response: `application/json; charset=utf-8`.
- `Accept: application/xml` → {{xml-policy — e.g. "supported on legacy /v0; rejected on /v1+"}}.
- Compression: `Accept-Encoding: gzip` is honored on bodies > {{gzip-threshold}}.

**Forward-compatibility rules:**

- New fields may appear at any time. Consumers MUST ignore unknown fields.
- Field types and semantics will not change within a major version.
- Removed/renamed fields are breaking and only happen on major-version bumps (see versioning block).
