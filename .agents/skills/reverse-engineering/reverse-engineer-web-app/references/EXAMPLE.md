# reverse-engineer-web-app — Worked Example

> **Stack-agnostic note.** The workflow below is illustrated with one concrete stack (React + Vite + Redux Toolkit + React Router) so the artefacts are tangible. The same five-stage flow applies unchanged for any other web-app stack — Vue + Pinia + Vue Router, Svelte + SvelteKit, Angular + NgRx, Solid + Solid Router, Astro + islands, Next.js / Nuxt / Remix, server-rendered Rails / Django / Laravel, etc. Stage 1 discovery simply finds different values and Stage 2–4 fill the same blocks with the technologies the code actually uses.

## Scenario

User has a React 18 + Vite + Redux Toolkit + React Router 6 app at `~/code/orderhub-web` that consumes the OrderHub backend API.

User says: *"Document the web app at ~/code/orderhub-web."*

## Stage 1 — Discovery and Inventory

```
Framework: React 18, Vite, TypeScript
Routing: React Router 6 — 24 routes
State: Redux Toolkit — 8 slices (auth, orders, products, cart, checkout, ui, notifications, admin)
API client: rtk-query — 1 base, 6 service modules
Auth: JWT + refresh, cookie-based session for admin
Components: ~140 total — 12 page-level, 38 feature-scoped, 90 generic
Build: Vite + Rollup
Deployment: S3 + CloudFront, edge function for auth refresh
```

`steps/scaffold.md` proposes Part A as 15 files under `docs/web-app-internal/` and Part B as a single `web-app-consumer.md`. User approves. Files created with TODO markers.

## Stage 2 — Global Infrastructure

Documents architecture (SPA, client-side routed, hydrated at boot), project structure (`src/features/<name>/`), routing strategy (lazy-loaded chunks per feature), state shape (RTK with rtk-query for API state), API service module pattern, auth flow (JWT in cookie, refresh on 401), error handling (global ErrorBoundary + per-query fallback), styling (Tailwind + CSS modules for complex components).

## Stage 3 — Feature-by-Feature Extraction

For each feature (e.g. `checkout`):

- **Part A:** `src/features/checkout/` — 3 routes (`/checkout`, `/checkout/payment`, `/checkout/confirm`), 1 Redux slice (`checkoutSlice`), uses `ordersApi.placeOrder` mutation, has 2 guards (`requireAuth`, `requireCart`). Renders `CheckoutLayout` → `StepIndicator` + step-specific page component.
- **Part B:** Checkout feature consumes `POST /orders` and `POST /payments/*` endpoints from the OrderHub API. Auth required.

After each feature, runs the inner verification (do the documented props/state/API calls match the source?).

## Stage 4 — Cross-Cutting Concerns

- i18n: `react-intl`, locales loaded from `src/locales/<lang>.json`, dynamic switching.
- a11y: axe-core in CI, manual screen-reader pass for new pages.
- Performance: route-level code splitting; perf budgets enforced via `webpack-bundle-analyzer` on PR.
- Security: CSP via meta tag in `index.html`, no inline scripts, secrets via Vite `import.meta.env`.
- Testing: Vitest unit + RTL component + Playwright e2e (12 critical paths).

## Stage 5 — Verification and Finalization

`steps/verify.md`:

- Completeness: 24/24 routes, 8/8 slices, 6/6 API service modules documented. Pass.
- Accuracy: spot-checked 5 features. 1 failure — `cart` slice documented as persisted to localStorage, but actually persisted to sessionStorage. Corrected.
- Consistency: Part B references no internals. Pass.
- Domain checks: deployment shape documented for integrators; auth integration points clear; APIs consumed listed with version pin. Pass.

Verification report: 1 failure, 0 warnings. GO.

## Outputs

```
~/code/orderhub-web/docs/web-app-internal/      ← Part A
  ├── 01-app-overview.md
  ├── 02-architecture.md
  ├── 03-routing.md
  ├── ... (12 more)
  ├── extraction-status.md
  └── CHANGE-TRACKER.md

~/code/orderhub-knowledge-base/source-docs/orderhub-web/
  └── web-app-consumer.md                       ← Part B
```

## Hand-off

> "Reverse-engineering of orderhub-web is complete. Next, run `build-knowledge-base` to aggregate Part B into the central KB index."
