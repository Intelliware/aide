# build-knowledge-base — Worked Example

## Scenario

ACME, an e-commerce SaaS, has reverse-engineered three repos: `api-orders`,
`api-billing`, and `web-portal`. Each repo's RE produced a Part A (internal)
doc and a Part B (consumer / implementer) doc, deposited under
`<knowledge_base_path>/source-docs/<repo-slug>/`. The KB path is set in
`project.toml` as `knowledge_base_path = "../acme-kb"`.

## Inputs (state on disk before running)

```
acme-source-monorepo/
├── project.toml                      # declares knowledge_base_path = "../acme-kb"
├── api-orders/                       # source repo, HEAD = 8f3c1a2…
├── api-billing/                      # source repo, HEAD = b7e4d9c…
└── web-portal/                       # source repo, HEAD = 2d8a5f1…

acme-kb/                              # the KB repo (sibling to source)
└── source-docs/
    ├── api-orders/{part-a/, part-b/}  # populated by RE stage
    ├── api-billing/{part-a/, part-b/}
    └── web-portal/{part-a/, part-b/}
```

`project.toml` excerpt:

```toml
[project]
code = "acme-checkout"
name = "ACME Checkout Platform"
domain = "e-commerce checkout"
default_flow = "brownfield"

[project.paths]
knowledge_base_path = "../acme-kb"

[[project.repos]]
code = "api-orders"
name = "Orders API"
path = "./api-orders"
role = "api"
type = "node-typescript-nest"
primary = true

[[project.repos]]
code = "api-billing"
name = "Billing API"
path = "./api-billing"
role = "api"
type = "dotnet-8"

[[project.repos]]
code = "web-portal"
name = "Customer Portal"
path = "./web-portal"
role = "ui"
type = "react-vite"
```

## Step-by-step trace

### Step 1 — Validate target

- Reads `project.toml`, resolves `knowledge_base_path` to `../acme-kb`.
- Confirms directory exists and contains only `source-docs/` (i.e.
  considered "empty" for KB content purposes — `source-docs/` was placed
  there by RE).
- No overwrite confirmation needed.

### Step 2 — Scaffold per-repo entries

Creates:

```
acme-kb/
├── glossary.md                       # seeded from project.toml.glossary
├── change-tracker.md                 # initialised empty
├── repos/
│   ├── api-orders/{README.md, NAVIGATE.md}
│   ├── api-billing/{README.md, NAVIGATE.md}
│   └── web-portal/{README.md, NAVIGATE.md}
├── components/{api-orders/, api-billing/, web-portal/}/
├── shared/{entities/, cross-cutting/, adrs/, integration-patterns/}/
└── synthesized/{01-architecture-overview/ … 10-repository-maintenance/}/
```

Each `repos/<slug>/README.md` is rendered from
`templates/blocks/knowledge-base/repo-summary.md` with placeholders filled
from `[[project.repos]]` and the matching RE Part B doc's purpose summary.

### Step 3 — Emit components

For each repo, the skill walks Part A + Part B and emits one
`components/<slug>/<component-id>.md` per logical component. From
`api-orders`, the RE produced 4 logical components; one is rendered as:

```yaml
---
component_id: order-checkout-flow
repo: api-orders
type: api-feature
description: >-
  Use when a buyer submits a cart and the system must place an order, authorize
  payment, and return a confirmation in a single synchronous request.
triggers:
  - place order
  - submit cart
  - checkout
  - capture payment
paths:
  - src/features/checkout/**
  - src/features/orders/checkout-controller.ts
  - api-billing:src/Authorization/CheckoutAuthorizationHandler.cs
depends_on:
  - billing-payment-authorization
  - inventory-reservation
consumed_by:
  - web-portal-checkout-page
data_entities:
  - Order
  - PaymentAuthorization
  - Cart
last_verified_against_commit: 8f3c1a2b9e7d4c6f5b8a1d2e9c0f7a6b3d4e5f12
last_feature_id: ""
source_doc: docs/part-b/checkout-consumer-guide.md
verification_signal: openapi-diff
---
```

(Body follows `templates/blocks/knowledge-base/component.md` § 1–4.)

### Step 4 — Shared pass

`Order` is referenced by both `api-orders` and `api-billing` components, so
it is promoted to `shared/entities/order.md` (rendered from
`shared-entity.md` block). Auth and observability standards from the three
Part B docs are turned into pointer pages under `shared/cross-cutting/`.

### Step 5 — Emit graph.json

Walks all component frontmatter, derives 14 nodes and 22 edges. Edge kinds
inferred from frontmatter: `depends_on` → `calls` for cross-repo HTTP
deps, `depends-on` for shared-library deps; `consumed_by` is the inverse
view and is not written as a separate edge — it's derived at read time.

### Step 6 — Emit ARCHITECTURE.md

Renders `templates/blocks/knowledge-base/architecture-index.md` filling:

- `repository_map_table_rows` — 3 rows from `[[project.repos]]`.
- `component_catalog_table_rows` — 14 rows.
- `capability_index_table_rows` — derived from the rendered
  `capability-index.md` block (also embedded as § 4).
- `dependency_graph_mermaid_c4_l2` — generated from `graph.json`.

### Step 7 — Emit root NAVIGATE.md

Tells the AI agent how to navigate this KB: read `ARCHITECTURE.md` first,
hit the Capability Index (§ 4), open `graph.json` for blast radius, then
open specific `components/<repo>/<component_id>.md` files. Never read the
whole KB; always go through the capability lookup. (Legacy KBs hold the
same content at `CLAUDE.md`; readers fall back transparently.)

### Step 8 — Validate coverage

Runs the 9 checks from `INPUTS-OUTPUTS.md`. All pass. Skill emits
"KB initial build succeeded — 14 components, 22 edges, 0 orphan
artifacts. Hand off to verify-knowledge-base-coverage for an immediate
sweep."

## Hand-off

Caller routes to `verify-knowledge-base-coverage` (mode=`baseline`), then
back to `start-project`, which resumes the brownfield flow at
`create-requirements-package`.
