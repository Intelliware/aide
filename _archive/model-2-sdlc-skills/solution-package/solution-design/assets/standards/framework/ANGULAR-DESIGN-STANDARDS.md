# Angular Frontend Design Standards

**Applies to:** Angular 17+ with standalone components, signals, and TypeScript. Features gated on specific Angular versions are noted inline (e.g., `@defer` blocks require Angular 17+, signals require Angular 16+, `inject()` function requires Angular 14+). For projects on older Angular versions using NgModules, the architectural patterns still apply — adapt syntax to the module-based equivalents.

These are the baseline standards the AI uses when designing Angular web frontend architecture in the solutions package. During Step 3 of the frontend design skill, the AI compares existing codebase conventions against these standards. Where the codebase deviates, the AI flags the deviation and asks the user whether new components should follow the existing pattern or adopt the standard.

These standards operate at the **design level** — they guide architectural decisions about component structure, module organization, state management, routing, and layout strategy. They do not prescribe implementation details (decorator configuration, dependency injection mechanics, RxJS operator chains). Implementation-level rules are covered separately in the implementation package's framework standards.

---

## 1. Application Architecture

### Rules

- Use **standalone components** as the default — `NgModule`-based components are legacy; new features should not introduce new NgModules
- Organize the application by **feature domains** — each feature is a self-contained directory with its components, services, models, and routes
- Define a **core layer** for singleton services (auth, API client, error handling) that are provided at the application root
- Define a **shared layer** for reusable UI components, pipes, and directives that are used across multiple features
- Features must not import directly from other features — cross-feature communication goes through the core layer (services, state, events)

### Architecture Layers

| Layer | Responsibility | Scope | Example |
|-------|---------------|-------|---------|
| Core | Singleton services, interceptors, guards, global error handling | App-wide (provided in root) | `AuthService`, `ApiService`, `ErrorHandler`, `AuthGuard` |
| Shared | Reusable UI components, pipes, directives — no business logic | Imported by any feature | `DataTableComponent`, `StatusBadgePipe`, `AutofocusDirective` |
| Feature | Domain-specific components, services, and routes for one capability | Self-contained; lazy-loaded | `orders/`, `checkout/`, `user-profile/` |
| Layout | Shell components — header, sidebar, footer, page frame | App-wide, wraps feature views | `AppShellComponent`, `SidebarComponent`, `HeaderComponent` |

### Feature Directory Structure

```
features/
  orders/
    order-list/           — page component (route entry)
    order-detail/         — page component
    order-table/          — feature component
    order-filters/        — feature component
    services/
      order.service       — data access for this feature
    models/
      order.model         — TypeScript interfaces
    orders.routes          — lazy-loaded route definitions
```

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Organizing by type (`components/`, `services/`, `pipes/`) at the top level | Related code scattered; a single feature change touches many directories |
| New `NgModule` for every component | Unnecessary boilerplate; standalone components are the modern Angular default |
| Feature A importing components directly from Feature B | Creates hidden coupling; features should communicate through core services or state |
| All services provided in a feature module instead of root | Unintended multiple instances; services that should be singletons get duplicated |

---

## 2. Component Architecture

### Rules

- Follow the **smart/dumb component pattern**: smart (container) components handle data and logic; dumb (presentational) components render based on inputs
- Smart components use **dependency injection** to access services — they do not pass services down through inputs
- Dumb components communicate exclusively through **@Input()** and **@Output()** — they never inject services
- Use **signals** for component state and reactivity — prefer signals over subject-based patterns in new components
- Use **OnPush change detection** on all components — it is the default for standalone components and should be explicitly set on NgModule-based components
- Design component APIs with **content projection** (`<ng-content>`) for flexible composition — not monolithic config-object inputs

### Component Type Responsibilities

| Type | Data access | Change detection | Reusability | Example |
|------|------------|-----------------|-------------|---------|
| Page (smart) | Injects services; loads data; manages route params | OnPush | Not reusable — one per route | `OrderListPageComponent` |
| Feature (smart) | Injects services for its specific domain | OnPush | Reusable within the feature | `OrderTableComponent` |
| Presentational (dumb) | @Input / @Output only; no injected services | OnPush | Highly reusable across features | `DataTableComponent`, `StatusBadgeComponent` |
| Layout | Minimal injection (auth, router for nav state) | OnPush | Shared across pages | `AppShellComponent` |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Presentational component that injects `OrderService` | Couples presentation to a specific data source; can't reuse with different data |
| Components using `Default` change detection | Checks every component on every cycle; poor performance at scale |
| Large config-object inputs (`@Input() config: { title, subtitle, icon, actions, ... }`) | Inflexible; use content projection and focused inputs instead |
| Business logic in the component template (complex `*ngIf` chains, calculations in interpolation) | Hard to test; move logic to the component class or a pipe |

---

## 3. State Management Strategy

### Rules

- Separate state into **five categories** and use the appropriate mechanism for each
- **Server state** (API data) should use a **service + signal pattern** or a **state management library with server state support** (NgRx with Effects, TanStack Query for Angular) — not manual subscription management
- **Component state** uses **signals** — the modern Angular reactivity primitive
- **Form state** uses **Reactive Forms** — not Template-driven forms, which are harder to test and validate programmatically
- **URL state** (filters, pagination, sort) lives in **query parameters** via `ActivatedRoute` — shareable and bookmarkable
- **Application state** (shared across features) uses a **lightweight store** (NgRx SignalStore, Elf, or a custom signal-based service) — only for state that genuinely needs to be shared

### State Category Decision Table

| Category | Mechanism | When to use | Example |
|----------|-----------|-------------|---------|
| Server | Signal-based service with caching, or NgRx/TanStack Query | Data from APIs that may be stale, cached, or shared | Order list, user profile, product catalog |
| Component | Signals (`signal()`, `computed()`) | Reactive state within a single component | Accordion expanded, modal open, dropdown selection |
| Form | Reactive Forms (`FormGroup`, `FormControl`) | Any user input form — simple or complex | Login, checkout, profile edit |
| URL | Router query params (`ActivatedRoute.queryParams`) | State that should survive refresh and be shareable | Active filter, sort order, page number, search query |
| Application (shared) | NgRx SignalStore / Elf / signal-based service (provided in root) | UI state shared across 3+ components in different features | Shopping cart, notification queue, user preferences |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Storing API data in NgRx Store for simple CRUD | Massive boilerplate (actions, reducers, effects, selectors) for straightforward data; use a signal-based service or TanStack Query |
| Manual `.subscribe()` in components without unsubscribing | Memory leaks; use `toSignal()`, `takeUntilDestroyed()`, or the `async` pipe |
| Template-driven forms for complex forms with cross-field validation | Validation logic scattered in template; hard to test; use Reactive Forms |
| Filters and pagination stored only in component state | Lost on page refresh; not shareable via URL; use query params |
| Every piece of state in a global store | Unnecessary complexity; most state is local or server-derived |

---

## 4. Routing and Navigation

### Rules

- Every feature defines its own **route configuration** — lazy-loaded via `loadChildren` or `loadComponent`
- Every significant view must have a **URL** — no conditional rendering that hides views without URL changes
- **Route guards** protect routes based on authentication and authorization — use functional guards (not class-based)
- **Route resolvers** pre-fetch critical data before the route activates — so the page doesn't render with empty data then flash
- Define **layouts per route group** — use a parent route with a layout component and child routes for the pages within it
- **Error routes** (404, 403) must be defined — unmatched routes redirect to a "not found" page

### Route Design Specification

| Route | Component | Layout | Guard | Resolver | Lazy |
|-------|-----------|--------|-------|----------|------|
| `/orders` | `OrderListPage` | `AppShell` | `authGuard` | `ordersResolver` (optional) | Yes |
| `/orders/:id` | `OrderDetailPage` | `AppShell` | `authGuard` | `orderResolver(id)` | Yes |
| `/login` | `LoginPage` | `AuthLayout` | `noAuthGuard` (redirect if already logged in) | None | Yes |
| `**` | `NotFoundPage` | `AppShell` | None | None | No |

### Guard Behavior

| Scenario | Guard | Behavior |
|----------|-------|----------|
| Unauthenticated → protected route | `authGuard` | Redirect to `/login?returnUrl=<original>` |
| Authenticated → login page | `noAuthGuard` | Redirect to `/` (already logged in) |
| Authenticated but wrong role | `roleGuard(['admin'])` | Redirect to `/access-denied` |
| Token expired | `authGuard` | Redirect to login; preserve return URL |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| All routes eagerly loaded in the root module | Massive initial bundle; slow first load; every feature loaded upfront |
| Class-based guards (`CanActivate` interface) | Deprecated pattern; use functional guards for simplicity |
| Auth check in every component's `ngOnInit` | Duplicated logic; easy to miss a component; use a route guard |
| No 404/wildcard route | Unmatched URLs show a blank page or crash |
| Route resolvers that block rendering for slow data | Use resolvers for fast critical data; load slow data after render with loading states |

---

## 5. Service Design

### Rules

- Services are the **primary mechanism for data access, business logic, and cross-component communication** in Angular
- Use **providedIn: 'root'** for true singletons (auth, API client, global config) — feature-scoped services use `providedIn: 'any'` or are provided in the feature's route
- Services expose **signals or observables** for reactive data — consumers never call methods that return data synchronously and then manually track freshness
- **HTTP interceptors** handle cross-cutting concerns: auth headers, error mapping, retry logic, loading indicators — not individual services
- Define a **clear API client layer** — one service per API domain (OrderApiService, UserApiService) that wraps HTTP calls and maps responses to domain models

### Service Layer Architecture

| Layer | Responsibility | Example |
|-------|---------------|---------|
| API client service | HTTP calls to a specific API domain; maps responses to TypeScript models | `OrderApiService.getOrders(): Observable<Order[]>` |
| Domain service | Business logic, caching, state coordination for a feature | `OrderService` — calls `OrderApiService`, caches results, provides signals |
| Facade service | Simplified interface for complex multi-service operations | `CheckoutFacade` — coordinates cart, payment, shipping services |
| Utility service | Stateless helpers (formatting, validation) | `DateFormatService`, `CurrencyService` |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Components making HTTP calls directly | Duplicates API logic; no caching layer; hard to test |
| Services that hold mutable state without signals or observables | Consumers don't know when data changes; stale UI |
| Auth token added manually in every service method | Duplicated; error-prone; use an HTTP interceptor |
| One massive `ApiService` for all endpoints | Violates single responsibility; hard to maintain; split by domain |

---

## 6. Error Handling and UX Feedback

### Rules

- Every data-loading page defines **four states**: loading, content (success), empty, and error
- **Loading**: show skeleton placeholders that match the content shape — not a centered spinner
- **Error**: show a user-friendly message with retry; use a **global error handler** (`ErrorHandler`) for unhandled exceptions
- **HTTP interceptors** map error responses to user-friendly error types — individual components never parse HTTP status codes
- **Toast/snackbar** for transient action feedback; **inline banners** for persistent state; **dialogs** for critical decisions
- Define a **notification service** in the core layer — components call it to show feedback; they don't create toasts directly

### UX State Matrix

| Page | Loading | Content | Empty | Error (4xx) | Error (5xx) |
|------|---------|---------|-------|-------------|-------------|
| `OrderListPage` | Skeleton table | Data table | "No orders" + CTA | N/A | Error banner + retry |
| `OrderDetailPage` | Skeleton layout | Detail view | N/A | "Not found" page | Error + retry |

### Feedback Component Selection

| Scenario | Component | Behavior |
|----------|-----------|----------|
| Action succeeded | Snackbar (auto-dismiss 5s) + optional action link | "Order saved" + "View" |
| Action failed (recoverable) | Snackbar with retry (persists until dismissed) | "Couldn't save — Retry" |
| Destructive confirmation | Dialog with two buttons | "Delete order?" + "Cancel" / "Delete" |
| Connectivity lost | Persistent banner at top | "You're offline" |
| Background process | Progress bar in toolbar area | Upload progress |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Each component handling its own HTTP errors | Duplicated error handling; inconsistent messages; use interceptor + error handler |
| `console.error` as the only error handling | User sees nothing; errors invisible in production |
| Centered spinner for all loading states | No layout context; skeleton placeholders are better UX |
| Alert/dialog for "Item added to cart" | Over-interrupts for non-critical feedback; use a snackbar |

---

## 7. Form Architecture

### Rules

- Use **Reactive Forms** for all forms — they provide programmatic control, testability, and complex validation
- Define **typed form models** (`FormGroup<{ name: FormControl<string>, email: FormControl<string> }>`) — not untyped `FormGroup`
- Show **inline validation errors** after the field is touched and blurred — not on every keystroke
- **Cross-field validation** (password confirmation, date range) uses a group-level validator — not ad-hoc template logic
- Map **server-side validation errors** (422 responses) to specific form controls using `setErrors()`
- Multi-step forms use a **stepper component** with validation per step — users can't advance past an invalid step

### Form Design Specification

| Form | Controls | Validation | Submission | On success | On error |
|------|----------|-----------|-----------|-----------|----------|
| Refund request | reason (required, maxLength 500), lineItems (minLength 1) | Zod or class-validator schema matching API contract | `POST /orders/:id/refunds` | Navigate to refund status + snackbar | 422: `setErrors` per control; 5xx: snackbar with retry |

### Validation Display Rules

| Scenario | Behavior |
|----------|----------|
| Required field left empty | Show after blur: "This field is required" |
| Format validation fails | Show after blur: "Enter a valid email address" |
| Server-side error (422) | Map to the specific control; scroll to first error |
| Cross-field error | Show at the group level (below the related fields) |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Template-driven forms for complex forms | Validation logic scattered in HTML; hard to test; conditional validators are awkward |
| Untyped `FormGroup` (`this.form = new FormGroup({})` without generics) | No type safety; runtime errors when accessing non-existent controls |
| Validating on every keystroke (`updateOn: 'change'` with immediate error display) | Shows errors while the user is typing; use `updateOn: 'blur'` or show errors only when touched |
| Generic "Form has errors" message instead of per-field errors | User doesn't know which field to fix |

---

## 8. Responsive Design

### Rules

- Define **breakpoints** and design each page at three widths: mobile (< 768px), tablet (768–1023px), desktop (≥ 1024px)
- Use a **desktop-first or mobile-first** approach consistently — not a mix
- Navigation adapts per breakpoint: **mobile** (hamburger or bottom nav) → **tablet** (collapsible sidebar) → **desktop** (persistent sidebar)
- Data tables convert to **card layouts** on mobile — avoid horizontal scrolling
- Use Angular CDK **BreakpointObserver** for responsive logic in components — not manual `window.innerWidth` checks

### Layout Adaptation

| Element | Mobile (< 768px) | Tablet (768–1023px) | Desktop (≥ 1024px) |
|---------|------------------|--------------------|--------------------|
| Navigation | Hamburger menu or bottom nav | Collapsible sidebar (icon-only) | Persistent sidebar with labels |
| Data tables | Card stack (one card per row) | Compact table (hidden low-priority columns) | Full table |
| Forms | Single column | Two-column for related pairs | Two-column with help text |
| Dialogs | Full-screen overlay | Centered, max 560px | Centered, max 560px |
| Grid content | 1 column | 2–3 columns | 3–4 columns |
| Filters | Bottom sheet or full-screen overlay | Collapsible side panel | Persistent side panel |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Horizontally scrolling data tables on mobile | Hard to scan; columns missed; use card layouts |
| `window.innerWidth` checks in components | Not reactive; doesn't update on resize; use `BreakpointObserver` |
| Hiding critical features on mobile | Users on mobile can't access needed functionality |
| Fixed pixel widths on containers | Doesn't adapt to different screen sizes |

---

## 9. Accessibility Design

### Rules

- Use **semantic HTML** in component templates: `<button>`, `<a>`, `<nav>`, `<main>`, `<header>`, `<form>` — not `<div (click)>`
- All interactive elements must be **keyboard accessible** — Tab, Enter/Space, Escape follow expected patterns
- Use Angular CDK **A11yModule** for focus traps (dialogs), live announcements, and focus monitoring
- Color must not be the **sole indicator** of state — pair with an icon, text, or pattern
- Text contrast: **4.5:1** for body text, **3:1** for large text (WCAG 2.1 AA)
- **Focus management**: trap focus in dialogs; restore focus on close; announce route changes to screen readers

### Accessibility Plan

| Requirement | Design decision |
|------------|----------------|
| Keyboard navigation | All interactive elements in tab order; custom components follow WAI-ARIA patterns |
| Focus trap — dialogs | Use CDK `cdkTrapFocus`; restore focus to trigger on close |
| Route change announcement | Use CDK `LiveAnnouncer` to announce the new page title on navigation |
| Dynamic content | Use `aria-live="polite"` regions for toast messages and status updates |
| Form accessibility | Labels linked via `for`; errors linked via `aria-describedby`; required marked with `aria-required` |
| Color independence | Status indicators include icon + text, not only color |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| `<div (click)="handler()">` without role or tabindex | Not keyboard accessible; invisible to screen readers; use `<button>` |
| No route change announcements | Screen reader users don't know the page changed |
| Dialog without CDK focus trap | Users tab behind the dialog into hidden content |
| Color-only status indicators | Unusable for color-blind users |

---

## 10. Performance Design Targets

### Rules

- Define **Core Web Vitals** targets and validate during design review
- **Lazy-load** every feature route — the initial bundle contains only the app shell and the landing route
- Use **OnPush change detection** on every component — prevent unnecessary change detection cycles
- Lists with **50+ items** must use **virtual scrolling** (CDK `cdk-virtual-scroll-viewport`)
- **Preload strategies** define which lazy routes to prefetch after the initial load — use `PreloadAllModules` or a custom strategy that preloads likely next routes

### Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | Main content visible |
| INP (Interaction to Next Paint) | ≤ 200ms | UI responsiveness |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | Visual stability |
| Initial bundle size | ≤ 200KB (compressed) | Excluding lazy-loaded features |

### Code Splitting Plan

| Split point | Type | Trigger |
|------------|------|---------|
| Each feature route | Route-based lazy loading (`loadComponent` / `loadChildren`) | Navigation |
| Heavy third-party library (chart, rich editor) | Dynamic import | User interaction |
| Below-the-fold widgets | Defer block (`@defer`) | Viewport intersection or interaction |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| All features eagerly imported in the app module | Massive initial bundle; slow first paint |
| Components using `Default` change detection | Every change detection cycle checks every component; poor at scale |
| `*ngFor` over 500+ items without virtual scroll | DOM overload; janky scrolling; high memory |
| No preload strategy for lazy routes | Subsequent navigations feel slow because the chunk isn't pre-fetched |

---

## 11. Security Design

### Rules

- **HTTP interceptors** inject auth tokens — individual services never add headers manually
- **Route guards** enforce authorization — unauthorized routes are inaccessible, not just hidden
- Angular's **built-in XSS protection** (template binding auto-sanitization) must not be bypassed — never use `bypassSecurityTrustHtml` without a sanitization step
- **CSRF protection**: for cookie-based auth, use Angular's `HttpClientXsrfModule` or include CSRF tokens via interceptor
- **Sensitive data**: never bind tokens or PII to templates; never log them to console or error tracking

### Security Design Decisions

| Concern | Design decision |
|---------|----------------|
| Auth token injection | HTTP interceptor adds `Authorization: Bearer <token>` to every API request |
| Token storage | `httpOnly` cookie (recommended) or encrypted browser storage — never plain `localStorage` for sensitive tokens |
| CSRF | Angular's XSRF module reads the CSRF token from a cookie and includes it in requests |
| XSS prevention | Rely on Angular's template sanitization; never bypass without DOMPurify |
| Role-based visibility | Route guards prevent navigation; `*ngIf` with role check hides UI elements — but guards are the enforcement layer, not template conditionals |

### Incorrect Patterns

| Pattern | Problem |
|---------|---------|
| Token in `localStorage` without encryption | Accessible to any JS on the page; XSS exposes the token |
| `[innerHTML]="userInput"` without sanitization | XSS vector — Angular sanitizes by default, but `bypassSecurityTrustHtml` disables this |
| Hiding admin buttons with `*ngIf` but no route guard | Users can navigate directly to the admin URL; hide + guard |
| Each service manually adding auth headers | Duplicated; easy to miss; use an interceptor |

---

## Customization

- **Section 1 (Application Architecture — Standalone Components):** Standalone components require Angular 14+. Projects on Angular 13 or earlier must use NgModules. Projects migrating from NgModules to standalone can do so incrementally — the design should document which components are standalone and which remain module-based during migration.

- **Section 2 (Component Architecture — Signals):** Signals require Angular 16+. Projects on Angular 15 or earlier should use RxJS-based state management with `BehaviorSubject` and `async` pipe. The design should specify whether the project uses signals, RxJS, or a hybrid approach.

- **Section 3 (State Management):** The specific library choice (NgRx, Elf, NGXS, or no library) is a project decision. Simple apps with few shared states may use services with signals or `BehaviorSubject` — a full state management library is not always justified. The design should document the chosen approach and the criteria for when shared state justifies a store vs. a service.

- **Section 4 (Routing):** Route guard and resolver design depends on the auth architecture. Projects using server-side session auth have different guard patterns than JWT-based SPAs. The design should specify the auth model and how guards enforce it.

- **Section 9 (Accessibility):** The baseline WCAG level is 2.1 AA. Organizations with different targets should override specific thresholds. Angular CDK A11y modules (`LiveAnnouncer`, `FocusTrap`, `FocusMonitor`) are recommended but not mandatory if the project uses alternative accessibility utilities.

- **Section 10 (Performance):** Virtual scrolling thresholds (when to use `cdk-virtual-scroll-viewport` vs. simple `*ngFor`) depend on the expected data volume. Lists under ~100 items may not benefit from virtual scrolling. The design should specify the anticipated data scale and choose accordingly.
