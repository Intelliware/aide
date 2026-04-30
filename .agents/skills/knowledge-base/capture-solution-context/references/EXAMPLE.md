# capture-solution-context — Worked Example

## Scenario

ACME Checkout Platform, fresh off `verify-knowledge-base-coverage`. The
KB now has 14 components across three repos (`api-orders`, `api-billing`,
`web-portal`) and an empty `<KB>/shared/solution-context/` directory.
The product manager joins the session to capture solution context for
the first time.

## Inputs (state on disk before running)

```
acme-kb/
├── ARCHITECTURE.md           # 14 components catalogued
├── graph.json
├── components/{api-orders/, api-billing/, web-portal/}/
├── shared/{entities/, cross-cutting/, adrs/, integration-patterns/}/
└── shared/solution-context/   # empty
```

`project.toml` excerpt (relevant fields):

```toml
[project]
code = "acme-checkout"
name = "ACME Checkout Platform"
domain = "e-commerce checkout"
user_email = "pm@acme.example"
default_flow = "brownfield"
```

## Step-by-step trace

### Step 01 — Detect existing context

- Scans `<KB>/shared/solution-context/` — directory empty.
- No prompt needed. Sets `mode = create`. Continues.

### Step 02 — Elicit mission & overview

- Auto-fills classification from RE: 3 repos, languages (TypeScript,
  C#), arch pattern (microservice + SPA).
- Opens elicitation pattern `references/elicitation-patterns/business-objectives.md`.
- Conversation captures: "Headless checkout-as-a-service for mid-market
  e-commerce; replaces in-house checkouts that average 4-week build
  times; primary value: PCI scope reduction + 22 % conversion lift on
  mobile."
- Drafts `00-overview.md`, presents to PM, gets confirmation.

### Step 03 — Elicit personas & use cases

- Three personas captured: *Merchant Engineer* (integrator), *Merchant
  Ops Lead* (config), *End Buyer* (checkout UX).
- For each, 2–3 jobs-to-be-done.
- Persona "End Buyer / submit-cart" links to existing component
  `order-checkout-flow` via `related_components`.
- Drafts `10-personas-and-use-cases.md`, gets confirmation.

### Step 04 — Elicit goals & KPIs

- North-star: checkout-completion rate.
- Three guardrails: P95 latency < 800 ms, payment-failure rate < 1.2 %,
  PCI audit pass rate 100 %.
- Two leading indicators: NPS among Merchant Engineers, time-to-first-
  successful-checkout in days.
- Baselines unknown for two metrics → captured as `TODO(baseline)`
  with the responsible team in the comment.

### Step 05 — Elicit constraints & compliance

- PCI DSS 4.0 (in-scope: card data; out-of-scope: shopper PII).
- GDPR — DSAR handling delegated to merchants.
- Contractual: 99.95 % SLA with top-25 merchants.
- NFR ceiling: P95 latency budget 800 ms (mirrors goal-04).

### Step 06 — Elicit integrations & ownership

- External integrations:
  - Stripe (primary PSP) — owner: Billing team
  - Adyen (fallback PSP) — owner: Billing team
  - Segment (analytics) — owner: Growth
  - Datadog (observability) — owner: Platform
- Ownership / RACI:
  - api-orders → Orders squad (R), Architecture (A), Billing (C),
    Platform (I).
  - api-billing → Billing squad (R), Architecture (A), Risk (C),
    Platform (I).
  - web-portal → Storefront squad (R), Design (A), Growth (C).
  - On-call: combined `checkout-oncall` rotation across Orders +
    Billing.

### Step 07 — Emit & glossary delta

- All six leaves written to `<KB>/shared/solution-context/`.
- Glossary delta appended to `<KB>/glossary.md` with date marker:
  - "Checkout-completion rate"
  - "Merchant Engineer"
  - "PSP fallback"
  - "DSAR"
- Validation passes: all six leaves present; every `description` begins
  with `Use when `; all `related_components` resolve.
- Hand-off message: "Solution context captured (6 leaves, 4 glossary
  entries). Next: `generate-ai-rules` to capture AI coding guardrails,
  then `document-operations`."

## Hand-off

Caller routes to `generate-ai-rules`. Both skills are also added to the
`anytime` list so the PM can refresh personas or KPIs without re-running
the full bootstrap.
