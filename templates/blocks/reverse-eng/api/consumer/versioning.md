---
slug: versioning
title: "Versioning"
applies-to: [re-api-consumer]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 240
---

## 14. Versioning

Document the API's versioning policy: how versions are expressed (URL path, header, query, content-type), how breaking changes are handled, what counts as breaking vs. additive, and how a consumer pins to a specific version. Verify by reading the gateway/router config — versioning is one of the most undocumented dimensions of real APIs.

State the support window per version (how long after deprecation does the version stay live?), and the rollback policy. If the API uses date-based versioning (Stripe-style), document how a consumer pins, and how the API behaves when no version is specified.

### Suggested template content

**Versioning model:** {{model — e.g. "URL-path major version + date-based minor version header"}}

**How to specify a version:**

- **Major version (URL):** `/v1/orders`, `/v2/orders`. Required.
- **Date pin (header):** `X-API-Version: 2026-04-01`. Optional; if absent, the request uses the version pinned to your account.
- **Account default version:** set via {{dashboard-link}}; recommended for production stability.

**What counts as a breaking change (major bump only):**

- Removing or renaming a field, endpoint, or error code.
- Changing a field's type or semantic meaning.
- Tightening validation (rejecting input that previously succeeded).
- Changing the default value of a parameter.
- Changing an event payload's required fields.

**What is additive (minor bump, no major change):**

- Adding new optional fields to requests.
- Adding new fields to responses.
- Adding new endpoints or event types.
- Adding new error codes (consumers MUST treat unknown codes as their HTTP-status fallback).
- Loosening validation.

**Version lifecycle:**

| Phase | Duration | Behavior |
|---|---|---|
| Active | Indefinite | New features, bug fixes. |
| Deprecated | {{deprecation-window — e.g. 12 months}} | Returns `Sunset` header on every response. |
| Sunset | After deprecation | Returns `410 Gone` with migration link. |

**Sunset signal:**

When an endpoint or version is deprecated, every response carries:

```
Sunset: Wed, 01 Jul 2027 00:00:00 GMT
Deprecation: true
Link: <{{migration-doc-url}}>; rel="deprecation"
```

Consumers MUST monitor for `Deprecation: true` and surface to engineers.

**Supported versions today:**

| Version | Status | Sunset date | Notes |
|---|---|---|---|
| v1 | Active | — | Recommended |
| v0 | Deprecated | {{date}} | See migration guide. |

**Recommended consumer practice:**

- Pin to a specific version in code; do not rely on account defaults for production.
- Track the changelog block for additive changes — your code should ignore unknown fields by default.
- Subscribe to the deprecation mailing list at {{deprecation-list-url}}.
- Test against the next version in sandbox before forced cut-overs.

**Cross-references:**

- See changelog-and-deprecation block for the running list of changes.
- See response-format block for the forward-compatibility rules consumers must follow.
