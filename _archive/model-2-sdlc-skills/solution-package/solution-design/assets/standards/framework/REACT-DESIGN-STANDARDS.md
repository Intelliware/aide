# React Frontend Design Standards

**Applies to:** React 18+ with function components, hooks, and TypeScript. Assumes a client-side SPA architecture (Create React App, Vite, or similar). For Next.js (which adds server components, SSR/SSG, and file-based routing), use the Next.js design standards instead if available.

These are the baseline standards the AI uses when designing React web frontend architecture in the solutions package. During Step 3 of the frontend design skill, the AI compares existing codebase conventions against these standards. Where the codebase deviates, the AI flags the deviation and asks the user whether new components should follow the existing pattern or adopt the standard.

These standards operate at the **design level** — they guide architectural decisions about component structure, state management, routing, and layout strategy. They do not prescribe implementation details (hook internals, CSS-in-JS library APIs, bundler configuration). Implementation-level rules are covered separately in the implementation package's framework standards.

These standards assume React with a client-side SPA architecture. For Next.js (which adds server components, SSR/SSG, and file-based routing), use the Next.js design standards instead.

---

## 1. Component Architecture

### Rules

- Organize components by **feature** (co-located), not by type — group a feature's components, hooks, types, and styles together
- Distinguish between **page components** (route-level, handle data loading), **feature components** (business logic, compose UI components), and **UI components** (reusable, presentational, no business logic)
- UI components must be **stateless or locally stateful** — they receive data via props and emit events via callbacks; they never fetch data or access global state directly
- Feature components **compose UI components** and connect them to data (hooks, context, stores)
- Limit component files to **one exported component** — co-locate sub-components in the same directory if they are only used by the parent

### Component Type Hierarchy

| Type | Responsibility | Data access | Reusability | Example |
|------|---------------|-------------|-------------|---------|
| Page | Route entry point; orchestrates data loading; composes feature components | Fetches data via hooks; provides context | Not reusable — one per route | `OrderListPage`, `DashboardPage` |
| Feature | Business logic for a specific capability; composes UI components | Consumes hooks and context; passes data down as props | Reusable within the same feature area | `OrderTable`, `RefundRequestForm`, `CartSummary` |
| UI | Presentational; renders based on props; no domain knowledge | Props only — no direct data fetching, no global state | Highly reusable across features | `Button`, `DataTable`, `StatusBadge`, `Modal` |
| Layout | Page structure; header, sidebar, footer, content area | Minimal — auth state for nav, route info for breadcrumbs | Shared across multiple pages | `AppLayout`, `DashboardLayout`, `AuthLayout` |

### Feature Directory Structure

Design the component hierarchy so each feature is self-contained:

```
features/
  orders/
    OrderListPage        — page component (route entry)
    OrderTable           — feature component
    OrderRow             — feature component
    OrderFilters         — feature component
    useOrders            — data hook
    useOrderFilters      — filter state hook
    types                — TypeScript types for the feature
  refunds/
    RefundRequestPage    — page component
    RefundForm           — feature component
    RefundStatusTracker  — feature component
    useRefund            — data hook
```

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Organizing by type (`components/`, `hooks/`, `utils/`, `types/`) at the top level | Related code is scattered; changing a feature requires touching many directories |
| UI components that fetch data directly | Cannot be reused in different data contexts; hard to test; couples presentation to data source |
| Feature components that render raw HTML/CSS instead of composing UI components | Duplicates UI patterns; inconsistent styling; harder to maintain |
| "God components" — single components with 500+ lines handling data, logic, and rendering | Hard to test, understand, and modify; break into page → feature → UI layers |

---

## 2. State Management Strategy

### Rules

- Separate state into **five categories** and use the right tool for each — do not put all state in one store
- **Server state** (data from APIs) must use a **server state library** (React Query, SWR, Apollo) — never store API data in Redux, Zustand, or Context
- **Client state** (UI state shared across components) uses a lightweight store (Zustand, Jotai) or Context — only for state that genuinely needs to be shared
- **Form state** uses a form library (React Hook Form, Formik) — not manual `useState` per field
- **URL state** (filters, pagination, search, selected tab) lives in the URL via search params — so it's shareable and bookmarkable
- **Local state** (`useState`, `useReducer`) is the default — only promote to a higher level when multiple components need the same state

### State Category Decision Table

| State category | Tool | When to use | Example |
|----------------|------|-------------|---------|
| Server | React Query / SWR / Apollo | Any data that comes from an API and may be stale, cacheable, or shared | Order list, user profile, product catalog |
| Client (shared) | Zustand / Jotai / Context | UI state that 3+ components need and that isn't derived from server data | Theme preference, sidebar collapsed, notification queue |
| Form | React Hook Form / Formik | Form input values, validation state, submission state | Checkout form, profile edit, search filters |
| URL | `useSearchParams` / URL query string | State that should persist across page refresh and be shareable via link | Active tab, filter selections, pagination page, sort order |
| Local | `useState` / `useReducer` | State used by a single component or a parent-child pair | Modal open/closed, accordion expanded, hover state |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Storing API responses in Redux / Zustand | Duplicates caching, invalidation, and loading state that server state libraries handle automatically; stale data bugs |
| Using Context for frequently changing values (e.g., form input, mouse position) | Every Context consumer re-renders on every change; causes performance problems |
| All state in `useState` — including server data with manual `useEffect` fetch | No caching, no deduplication, no background refresh, no error/retry handling; re-fetches on every mount |
| URL-worthy state stored only in component state | Filters reset on page refresh; users can't share or bookmark a filtered view |
| Global store for state used by only one component | Unnecessary complexity; local state is simpler and more performant |

---

## 3. Routing and Navigation

### Rules

- Every significant view must be **addressable via a URL** — users can share, bookmark, and navigate directly to it
- Use **nested layouts** — shared UI (header, sidebar) is defined once in a layout route, not repeated in every page
- **Protected routes** use a guard component that checks auth state and redirects to login with a return URL
- **Route-level code splitting** — each page component is lazy-loaded so the initial bundle contains only the entry route
- Define **loading and error boundaries** per route — a failed page doesn't crash the entire app

### Route Design Specification

For each route in the frontend design, specify:

| Route | Page component | Layout | Auth required | Roles | Data loading | Code split |
|-------|---------------|--------|---------------|-------|-------------|------------|
| `/orders` | `OrderListPage` | `AppLayout` | Yes | user, admin | `useOrders(filters)` | Yes (lazy) |
| `/orders/:id` | `OrderDetailPage` | `AppLayout` | Yes | user, admin | `useOrder(id)` | Yes (lazy) |
| `/login` | `LoginPage` | `AuthLayout` | No | — | None | Yes (lazy) |

### Auth Guard Behavior

| Scenario | Behavior |
|----------|----------|
| Unauthenticated user visits protected route | Redirect to `/login?returnUrl=<original-url>` |
| Authenticated but unauthorized (wrong role) | Show "Access Denied" page — do not redirect to login |
| Token expires during session | Show re-authentication prompt; preserve current page state |
| Login succeeds with returnUrl | Redirect to the original URL, not the home page |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Conditional rendering instead of routes (show/hide components based on state) | No URL, no browser history, no direct navigation, no sharing |
| All pages in one bundle (no code splitting) | Large initial download; slow first load |
| Auth check in every page component | Duplicated logic; easy to miss; use a single guard wrapper |
| Redirecting unauthorized users to login | They are logged in — showing the login page is confusing; show "Access Denied" |

---

## 4. Component Contracts and Props Design

### Rules

- Define **TypeScript interfaces** for all component props — never use `any` or untyped props in the design
- Props should be **minimal and focused** — pass only what the component needs to render, not entire domain objects when only a few fields are used
- Use **callback props** (`onSubmit`, `onChange`, `onSelect`) for events — the parent decides what to do; the child just emits
- Use **composition** (children, render props, slots) over configuration (large config objects) for flexible components
- **Required vs. optional** props must be explicit — required props have no default; optional props have sensible defaults

### Props Design Principles

| Principle | Correct | Incorrect |
|-----------|---------|-----------|
| Minimal data | `OrderRow({ title, status, total, onSelect })` | `OrderRow({ order })` when only 3 fields are used — leaks the full domain model |
| Callback events | `onDelete: (id: string) => void` | `deleteOrder: () => void` — parent can't control what happens |
| Composition | `<Card>{children}</Card>` | `<Card title="..." subtitle="..." body="..." footer="..." />` — inflexible |
| Explicit optionality | `variant?: 'filled' \| 'outlined'` with default `'filled'` | `variant: string` with no default and no constraint |
| No boolean explosion | `variant: 'primary' \| 'secondary' \| 'danger'` | `isPrimary, isSecondary, isDanger` — mutually exclusive booleans |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Passing entire objects when only a few fields are needed | Tight coupling; component re-renders on any object field change |
| Boolean prop pairs (`isLoading` + `isError` + `isEmpty`) instead of a discriminated union | Impossible states (e.g., `isLoading: true, isError: true`); use `status: 'loading' \| 'error' \| 'empty' \| 'success'` |
| Components with 15+ props | Too many responsibilities; break into smaller composed components |
| Prop drilling through 4+ levels | Use composition (children), context, or restructure the component hierarchy |

---

## 5. Data Fetching and API Consumption

### Rules

- Every API call maps to a **custom hook** that encapsulates the query key, fetching logic, and cache configuration
- Define **query keys** as structured arrays — not plain strings — so related queries can be invalidated together
- **Mutations** define their cache invalidation strategy — which queries to refetch or update after a write
- Map **API error responses** to user-facing error types — the UI layer never displays raw HTTP status codes or server error messages
- Define **optimistic updates** for write operations where instant feedback matters — with a rollback strategy for failures

### API Consumption Map

For each page in the frontend design, specify:

| Page | API endpoint | Hook | Query key | Cache strategy | Error handling |
|------|-------------|------|-----------|---------------|---------------|
| `OrderListPage` | `GET /api/v1/orders` | `useOrders(filters)` | `['orders', 'list', filters]` | staleTime: 30s; refetch on window focus | Empty state if 0 results; error banner with retry on 5xx |
| `OrderDetailPage` | `GET /api/v1/orders/:id` | `useOrder(id)` | `['orders', 'detail', id]` | staleTime: 60s | 404 → "Not found" page; 5xx → error with retry |

### Mutation Design

| Mutation | Hook | On success | Optimistic? | Rollback |
|----------|------|-----------|------------|----------|
| Create order | `useCreateOrder()` | Invalidate `['orders', 'list']`; navigate to detail | No — wait for server ID | N/A |
| Delete order | `useDeleteOrder()` | Remove from `['orders', 'list']` cache | Yes — remove immediately | Re-add to list; show error toast |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `useEffect` + `fetch` + `useState` for data fetching | No caching, no deduplication, no background refresh, no retry; re-fetches on every mount |
| String query keys (`'orders'`) | Can't invalidate subsets (e.g., invalidate list but keep detail); use structured arrays |
| No cache invalidation after mutations | Stale data shown after writes; user sees old values until manual refresh |
| Displaying raw API error messages to users | Confusing, potentially leaks internal details; map to user-friendly messages |

---

## 6. Error Handling and UX Feedback

### Rules

- Every data-loading page defines **four states**: loading, content (success), empty, and error
- **Loading**: use skeleton placeholders that match the content layout shape — not a centered spinner
- **Empty**: show an illustration or icon, an explanatory message, and a CTA
- **Error**: distinguish recoverable (retry button) from non-recoverable (navigate away); show user-friendly messages
- Place **error boundaries** at the route level and around independent widget areas — a failed sidebar doesn't crash the main content
- **Toasts/snackbars** for transient feedback; **inline banners** for persistent messages; **dialogs** for critical confirmations

### UX State Matrix

For each page, specify all states:

| Page | Loading | Success | Empty | Error (4xx) | Error (5xx) | Offline |
|------|---------|---------|-------|-------------|-------------|---------|
| `OrderListPage` | Skeleton table rows | Order table | "No orders yet" + CTA | N/A | Error banner + retry | Cached data + offline banner |
| `OrderDetailPage` | Skeleton layout | Order detail | N/A | "Order not found" | Error + retry | Cached if visited before |

### Feedback Component Selection

| Scenario | Component | Behavior |
|----------|-----------|----------|
| Action succeeded | Toast (auto-dismiss 5s) with optional action link | "Order saved" + "View order" |
| Action failed (recoverable) | Toast with retry action (persists until dismissed) | "Couldn't save — Retry" |
| Action failed (non-recoverable) | Dialog with explanation | "Payment declined" + details |
| Destructive confirmation | Dialog with two explicit buttons | "Delete this order?" + "Cancel" / "Delete" |
| Connectivity lost | Persistent banner at top of content | "You're offline — changes will sync" |
| Background process | Linear progress bar at top of page | File upload progress |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Centered spinner as the only loading state | No indication of what will appear; use skeletons that match the layout |
| Blank screen on empty state | User can't tell if the app is broken or there's no data |
| `console.error` as the only error handling | User sees nothing; error is invisible outside dev tools |
| Single error boundary wrapping the entire app | One failed component takes down everything; use granular boundaries |
| Dialog for every success message | Over-interrupts the user; use a toast for non-critical feedback |

---

## 7. Form Architecture

### Rules

- Use a **form library** (React Hook Form, Formik) — not manual `useState` per field
- Define **validation schemas** (Zod, Yup) that match the API contract constraints — client validation must be a subset of server validation
- Show **inline errors** after the field loses focus (on blur) — not on every keystroke
- **Map server validation errors** to the specific form field — don't show a generic error banner for 422 responses
- Multi-step forms define a **step sequence**, which fields belong to each step, and how partial state is preserved

### Form Design Specification

| Form | Fields | Validation | Submission API | On success | On error |
|------|--------|-----------|---------------|-----------|----------|
| Refund request | reason (required, max 500), lineItems (≥ 1 selected) | Zod schema matching POST body | `POST /orders/:id/refunds` | Navigate to refund status + success toast | 422: map to fields; 5xx: error toast with retry |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Manual `useState` for each form field | No validation coordination, no dirty tracking, no submit handling; boilerplate-heavy |
| Validating on every keystroke | Shows errors before the user finishes typing; frustrating UX |
| Generic "Something went wrong" for all submission errors | User doesn't know what to fix; map 422 errors to specific fields |
| Submit button hidden by scrolling, not sticky | User can't find or reach the action button |
| Placeholder text as the only label | Label disappears when typing; user forgets what the field is for |

---

## 8. Responsive Design

### Rules

- Define **breakpoints** and design each page at three widths: mobile (< 768px), tablet (768–1023px), desktop (≥ 1024px)
- Use a **mobile-first** approach — the base design is mobile; tablet and desktop add complexity
- Navigation adapts per breakpoint: **mobile** (hamburger or bottom nav) → **tablet** (collapsible sidebar) → **desktop** (persistent sidebar)
- Tables convert to **card stacks** on mobile — do not rely on horizontal scrolling for data tables
- Modals become **full-screen** on mobile — don't show a tiny centered dialog on a phone screen

### Layout Adaptation

| Element | Mobile (< 768px) | Tablet (768–1023px) | Desktop (≥ 1024px) |
|---------|------------------|--------------------|--------------------|
| Navigation | Hamburger menu or bottom nav | Collapsible sidebar (icon-only) | Persistent sidebar with labels |
| Data tables | Card stack (one card per row) | Compact table (hide low-priority columns) | Full table with all columns |
| Forms | Single column, stacked fields | Single column or two-column for related pairs | Two-column with help text or preview panel |
| Modals/dialogs | Full-screen overlay | Centered, max 560px wide | Centered, max 560px wide |
| Grid content | 1 column | 2–3 columns | 3–4 columns |
| Side panels (filters, details) | Full-screen overlay or bottom sheet | Collapsible side panel | Persistent side panel |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Horizontal scrolling data tables on mobile | Hard to scan; users miss columns; use card stacks |
| Fixed-width layouts that don't adapt | Unusable on small screens; wastes space on large screens |
| Hiding critical content on mobile instead of redesigning | Users on mobile can't access functionality they need |
| Desktop-first design that "shrinks" for mobile | Produces cramped, unusable mobile layouts; design mobile-first |

---

## 9. Accessibility Design

### Rules

- All interactive elements must be **keyboard accessible** — Tab to navigate, Enter/Space to activate, Escape to close
- Use **semantic HTML** as the foundation: `<button>`, `<a>`, `<nav>`, `<main>`, `<header>`, `<form>` — not `<div onClick>`
- Color must never be the **sole indicator** of state — pair with an icon, text, or pattern
- Text contrast ratio must meet WCAG 2.1 AA: **4.5:1** for normal text, **3:1** for large text
- **Focus management**: trap focus in modals; restore focus on close; move focus to main content on route change
- Custom components must declare **ARIA roles, states, and properties** matching WAI-ARIA authoring practices
- **Live regions** (`aria-live`) for dynamic content that updates without page navigation (toast notifications, status changes)

### Accessibility Plan

| Requirement | Design decision |
|------------|----------------|
| Keyboard navigation | All interactive elements in tab order; custom components follow WAI-ARIA keyboard patterns (arrow keys for menus, Escape to close) |
| Focus management — modals | Trap focus inside dialog; restore to trigger element on close |
| Focus management — route change | Move focus to `<h1>` or `<main>` on page navigation |
| Screen reader — dynamic content | Toasts use `aria-live="polite"`; form errors announced on submission |
| Color contrast | 4.5:1 minimum for text; 3:1 for icons and large text; verify against the design system color palette |
| Semantic structure | Landmarks (`<nav>`, `<main>`, `<aside>`); heading hierarchy (`h1` → `h2` → `h3`, no skipped levels) |
| Forms | Labels linked to inputs via `htmlFor`; error messages linked via `aria-describedby`; required fields marked with `aria-required` |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `<div onClick={handler}>Click me</div>` | Not keyboard accessible; no button role; invisible to screen readers |
| Color-only status indicators (red = error, green = success) | Unusable for color-blind users (~8% of males); add an icon or text label |
| No focus trap in modals | Keyboard users can tab behind the modal into invisible content |
| Heading levels that skip (h1 → h3) | Broken document outline; screen reader users navigate by headings |
| `aria-label` that duplicates visible text | Redundant; only add ARIA when the visual context is insufficient for assistive technology |

---

## 10. Performance Design Targets

### Rules

- Define **Core Web Vitals** targets per route and validate during design review
- **Code split** at the route level — every page is a separate chunk loaded on demand
- **Memoize** only when measured — not preemptively; document the reason for each memoization decision
- Lists with **50+ items** must specify a virtualization strategy (react-window, react-virtuoso, or native virtual scrolling)
- **Images** must specify a loading strategy: lazy loading below the fold, responsive `srcSet`, proper dimensions to prevent layout shift

### Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | Main content visible |
| INP (Interaction to Next Paint) | ≤ 200ms | UI responsiveness |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | Visual stability — reserve space for images, ads, dynamic content |
| Initial bundle size | ≤ 200KB (compressed) | Excluding lazy-loaded route chunks |

### Code Splitting Plan

| Split point | Type | Trigger |
|------------|------|---------|
| Each top-level route | Route-based lazy import | Navigation to route |
| Heavy library (chart, PDF, rich text editor) | Component-level dynamic import | User interaction (tab click, button press) |
| Below-the-fold sections on long pages | Intersection observer lazy load | Scroll into viewport |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| All pages in one bundle | Massive initial download; slow first load; users pay for pages they never visit |
| `React.memo` on every component | Adds comparison overhead; most components are cheap to re-render; memoize only measured bottlenecks |
| Rendering 1000+ list items without virtualization | DOM overload; janky scroll; high memory usage |
| Images without width/height or aspect-ratio | Layout shift when images load; poor CLS score |

---

## 11. Security Design

### Rules

- Define **token storage strategy** — `httpOnly` cookies (recommended), in-memory, or `localStorage` (only with strong CSP) — never `localStorage` for sensitive tokens without justification
- **XSS prevention**: rely on React's auto-escaping; use `DOMPurify` for any `dangerouslySetInnerHTML`; enforce Content Security Policy
- **CSRF protection**: for cookie-based auth, include CSRF tokens in state-changing requests; for Bearer token auth, CSRF is inherently mitigated
- **Sensitive data**: never log tokens, PII, or credentials to the console or error tracking services
- **Dependency security**: design assumes automated dependency scanning in CI (npm audit, Snyk)

### Token Storage Decision

| Approach | XSS risk | CSRF risk | When to use |
|----------|----------|-----------|-------------|
| `httpOnly` cookie (SameSite=Strict) | Low | Low (SameSite mitigates) | Session tokens — recommended default |
| In-memory (JS variable) | Low | None | Short-lived tokens where refresh-on-reload is acceptable |
| `localStorage` | High (accessible via JS) | None | Only with strict CSP; never for highly sensitive tokens |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Auth token in `localStorage` with no CSP | Any XSS vulnerability exposes the token |
| `dangerouslySetInnerHTML` without sanitization | Direct XSS vector |
| Logging user tokens or PII to console | Accessible in browser dev tools; may be captured by error tracking |
| No CSRF token with cookie-based auth | Vulnerable to cross-site request forgery |

---

## Customization

- **Section 1 (Component Architecture):** The feature-first directory structure (`features/{name}/`) is the default. Projects with fewer than 5 features may use a flatter structure. Monorepo setups with shared packages may use a library-based structure (`packages/{name}/`). Document the chosen approach and the rationale.

- **Section 2 (State Management):** The specific library choices (React Query vs. SWR for server state; Zustand vs. Jotai for client state) are project decisions. The design standard requires categorizing state (server, client, form, URL, local) and choosing an appropriate tool per category — not a specific library. Teams already using Redux may continue; the design should document the state management strategy regardless.

- **Section 3 (Routing):** The default assumes React Router. Projects using TanStack Router, Wouter, or a framework-provided router (Next.js, Remix) should adapt the route design patterns while preserving the principles: type-safe params, protected routes, code splitting at route boundaries.

- **Section 6 (Error Handling):** Error boundary granularity depends on the app's complexity. A simple CRUD app may use one top-level boundary + per-route boundaries. A complex dashboard may need per-widget boundaries. The design should specify boundary placement based on the UX requirements, not default to the most granular option.

- **Section 10 (Performance):** Core Web Vitals thresholds follow Google's "good" targets (LCP < 2.5s, CLS < 0.1, INP < 200ms). Projects with different performance NFRs should override these thresholds. Code splitting strategy (route-based vs. component-based) depends on bundle size analysis — the design should state the strategy, not prescribe specific split points.

- **Section 11 (Security):** Auth token storage (httpOnly cookie vs. in-memory) depends on the auth architecture. Cookie-based auth requires CSRF protection; in-memory tokens don't survive page refresh. The design should document the chosen approach and its trade-offs, not assume one pattern fits all.
