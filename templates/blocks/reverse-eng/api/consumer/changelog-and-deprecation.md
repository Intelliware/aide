---
slug: changelog-and-deprecation
title: "Changelog and Deprecation"
applies-to: [re-api-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 250
---

## 15. Changelog and Deprecation

Maintain a per-release record of what changed, what's deprecated, and what's been removed. The point is to give a consumer a single place to scan when they upgrade. Verify by diffing the OpenAPI spec between releases and confirming every change is reflected here. Stale changelogs are worse than missing ones — consumers will trust them and miss real breaking changes.

For deprecations, list the date announced, the sunset date, and the recommended replacement. Cross-link to the versioning block for the policy around what counts as breaking. If the API ships SDKs, note the SDK release that first supports each new feature.

### Suggested template content

**Format:**

Each release entry follows:

```
## [version] — YYYY-MM-DD

### Added
- ...

### Changed (additive / non-breaking)
- ...

### Deprecated
- <thing> — sunset YYYY-MM-DD — replaced by <replacement>

### Removed (breaking — major version only)
- ...

### Fixed
- ...

### Security
- ...
```

**Recent releases:**

```
## v1.42.0 — 2026-04-15

### Added
- `GET /v1/orders/{id}/audit` — returns the audit trail for an order.
- `customer.tier` field on `GET /v1/customers/{id}` (additive, optional).

### Deprecated
- `POST /v1/orders/refund` — sunset 2027-04-15 — use `POST /v1/orders/{id}/refund`.

### Fixed
- `429` responses now consistently return `Retry-After` (was sometimes missing).
```

```
## v1.41.0 — 2026-03-20

### Added
- `Idempotency-Key` is now accepted on `DELETE /v1/orders/{id}`.

### Deprecated
- API key in query string (`?api_key=`) — sunset 2026-09-20 — use `Authorization: Bearer`.
```

**Currently deprecated (active deprecation list):**

| Item | Announced | Sunset | Replacement | Severity |
|---|---|---|---|---|
| `POST /v1/orders/refund` | 2026-04-15 | 2027-04-15 | `POST /v1/orders/{id}/refund` | medium |
| Query-string API keys | 2026-03-20 | 2026-09-20 | Bearer header | high |

**Removed (history of breaking changes by major version):**

```
## v1 (current)

(no removals yet)

## v0 → v1 (2025-01-15)

### Removed
- Implicit pagination (limit defaulted to 1000) — now defaults to 50.
- `total_count` field on list responses — replaced with `has_more` + cursor.
- `error.error_code` (legacy) — use `error.code`.
```

**Subscription channels:**

- Email: subscribe at {{deprecation-list-url}} (recommended).
- RSS / Atom: {{rss-url}}.
- Slack / Discord: {{community-link}}.

**How consumers should track this:**

1. Subscribe to the deprecation list — these emails go to your engineering on-call.
2. Watch `Deprecation: true` headers in production logs.
3. On every API release announcement, run the changelog through your team's review (10 minutes).
4. Maintain an internal ledger of pinned API version + last-reviewed changelog entry.
