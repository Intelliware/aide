---
slug: endpoint-catalog
title: "Endpoint Catalog"
applies-to: [re-api-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 140
---

## 4. Endpoint Catalog

A flat, scannable index of every public endpoint, grouped by resource or capability. The goal is to let a consumer answer "does this API do X?" in under 30 seconds. Each row shows method, path, purpose, auth requirement, and a link to the per-endpoint detail (see the endpoint-detail-template block). Generate this from the OpenAPI / Swagger spec where possible to keep it in sync; if you handcraft it, audit against the spec at every release.

Group endpoints by the consumer's mental model, not by file structure on the server. Common groupings: by resource (Users, Orders, Webhooks), by capability (Read, Write, Admin), by surface (public, partner, internal). Mark deprecated endpoints inline with a clear sunset date (cross-link to the changelog block).

### Suggested template content

**Conventions used in this catalog:**

- **Auth:** `public` (none), `key` (API key), `user` (user token), `admin` (admin scope)
- **Status:** `GA`, `beta`, `deprecated (sunset YYYY-MM-DD)`, `internal`
- **Cost:** rate-limit cost in tokens (see rate-limits block)

**Resource: {{resource-name-1 — e.g. Orders}}**

| Method | Path | Purpose | Auth | Status | Cost |
|---|---|---|---|---|---|
| GET | `/v1/orders` | List orders (paginated) | user | GA | 1 |
| POST | `/v1/orders` | Create an order | user | GA | 5 |
| GET | `/v1/orders/{id}` | Get order by ID | user | GA | 1 |
| PATCH | `/v1/orders/{id}` | Partial update | user | GA | 3 |
| DELETE | `/v1/orders/{id}` | Cancel order | user | GA | 5 |
| POST | `/v1/orders/{id}/refund` | Issue refund | admin | GA | 10 |

**Resource: {{resource-name-2 — e.g. Customers}}**

| Method | Path | Purpose | Auth | Status | Cost |
|---|---|---|---|---|---|
| GET | `/v1/customers` | List customers | user | GA | 1 |
| POST | `/v1/customers` | Create customer | user | GA | 3 |
| GET | `/v1/customers/{id}` | Get by ID | user | GA | 1 |
| GET | `/v1/customers/search` | Search by email/phone | user | beta | 2 |

**Resource: {{resource-name-3}}**

{{...repeat per resource group}}

**Deprecated endpoints (do not use for new integrations):**

| Method | Path | Replacement | Sunset date |
|---|---|---|---|
| `{{deprecated-1}}` | `{{path-1}}` | `{{replacement-1}}` | `{{date-1}}` |

**OpenAPI source of truth:** `{{openapi-url}}` — use this to auto-generate client code; treat the catalog above as a navigational aid, not a spec.
