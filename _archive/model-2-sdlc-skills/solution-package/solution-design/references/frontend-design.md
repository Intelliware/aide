# Frontend Design

## Purpose

Design the frontend architecture for the feature — UI architecture, component structure, state management, and routing. Adapts to the platform (web, iOS, Android, cross-platform mobile, or multi-platform) as determined in the design workflow's Step 0. Consumes: the technology-stack (frontend framework, UI library, state management approach, build tool — all with pinned versions), the system-design (component boundaries and API surfaces the frontend consumes), the api-design (endpoint contracts tagged with consumer=frontend that the frontend calls), the existing-architecture-assessment (existing frontend patterns, component libraries, styling conventions, routing structure), and the requirements package (user journeys for user experience flows the UI must support, functional requirements for capabilities the UI must expose, permissions-access-control for role-based UI visibility, nonfunctional requirements for usability and accessibility targets). For brownfield projects, the AI extracts existing frontend patterns from the codebase and ensures new components follow the same conventions. Covers: UI architecture (page/view structure, component hierarchy), component design (reusable vs. new components, component contracts/props), state management strategy (local vs. global state, server state caching, optimistic updates), routing design (route structure, protected routes, navigation flow), API consumption layer (how the frontend calls the API contracts from Section 7), form handling and validation approach (client-side validation aligned to business rules), error handling and user feedback (loading states, error states, empty states, toast/notification patterns), responsive design approach, performance strategy (code splitting, memoization, virtualization), and accessibility implementation strategy (how WCAG conformance targets from NFRs are achieved in the UI layer). Produces frontend design that is Section 4 of the solution design package.

## What This Produces

The frontend architecture **for the requested feature only** — the new and modified pages, components, state, routes, and API consumption the feature requires. This is not a full architecture document of the entire existing frontend. For brownfield projects, the AI extracts existing frontend patterns from the codebase as **context** (so new components follow the same conventions), but the deliverable is scoped to what the feature adds or changes.

This is Section 4 of the solution design package. It consumes the API contracts (Section 7, interfaces tagged `consumer=frontend`), operates within the component boundaries from the system design (Section 3), and uses the technologies pinned in the technology stack (Section 2).

## When to Use

- Included when the feature has a user-facing interface (determined in the design workflow's Step 0)
- Runs after `backend-design` (Step 6)
- The platform(s) — web, iOS, Android, cross-platform, or multi-platform — are determined in the workflow's Step 0

## Inputs

| Input | Source | Required | If discovery was skipped |
|-------|--------|----------|--------------------------|
| System design | `docs/<feature>/solutions-package/design/03-system-design.md` — component boundaries, frontend component(s) identified | Yes | Yes |
| Technology stack | `docs/<feature>/solutions-package/design/02-technology-stack.md` — frontend framework, UI library, state management, build tool with pinned versions | Yes | Yes |
| API design | `docs/<feature>/solutions-package/design/07-api-design.md` — interfaces tagged `consumer=frontend` (REST endpoints, GraphQL operations, WebSocket events the frontend calls) | Yes | Yes |
| Data model design | `docs/<feature>/solutions-package/design/06-data-model-design.md` — entities the frontend displays and manipulates | Yes | Yes |
| Architecture baseline | `docs/<feature>/solutions-package/discovery/architecture-baseline.md` — Section 3 (Tech Stack: frontend framework version, UI library, state management, build tool) | If discovery ran — identifies the frontend technology and versions; frontend conventions (component patterns, styling approach, state management patterns, testing approach) are derived from the codebase in Steps 2 and 3 | Identifies conventions from codebase or user input |
| Requirements package — user journeys | `docs/<feature>/requirements-package/requirements/user-journeys.md` — UX flows the UI must support | Yes | Yes |
| Requirements package — functional requirements | `docs/<feature>/requirements-package/requirements/functional-requirements.md` — capabilities the UI must expose | Yes | Yes |
| Requirements package — permissions-access-control | `docs/<feature>/requirements-package/requirements/permissions-access-control.md` — role-based UI visibility rules | Yes | Yes |
| Requirements package — NFRs | `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md` — usability targets, accessibility level (WCAG), performance targets | Yes | Yes |
| UI/UX design artifacts | Figma files, design mockups, wireframes, prototypes, or design system documentation — visual specifications for the feature's UI | No — but highly valuable if they exist; ask the user | No — but ask |
| Access to the codebase | Local filesystem or repository — component files, hooks, styles, routing config, state stores | Yes (brownfield) — the AI reads the actual code to extract existing patterns | Yes if available; otherwise user provides description |

> **Missing input guard:** If the requirements package or any required input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[path]` but it was not found. This input is required. Please provide it or confirm I should proceed without it."*

---

## Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND DESIGN — INTERNAL SEQUENCE                             │
├──────────────────────────────────────────────────────────────────┤
│  1. LOAD — Read all inputs                                       │
│     Read system design (frontend component boundaries),          │
│     technology stack (framework, UI library, state management),  │
│     API design (interfaces tagged consumer=frontend),            │
│     data model (entities the UI displays), requirements          │
│     (user journeys, functional reqs, permissions, NFRs).         │
│     If discovery ran: read baseline Section 3.                   │
├──────────────────────────────────────────────────────────────────┤
│  1a. COLLECT UI/UX DESIGN ARTIFACTS                              │
│      Ask user for Figma files, wireframes, mockups, design       │
│      system docs. Use as primary source for UI architecture      │
│      if available.                                               │
├──────────────────────────────────────────────────────────────────┤
│  1b. IDENTIFY PLATFORM                                           │
│      Read platform from workflow Step 0 determination.       │
│      The AI uses its built-in knowledge of platform and          │
│      framework design patterns for comparison in Step 3.         │
├──────────────────────────────────────────────────────────────────┤
│  2. EXTRACT EXISTING — Read the codebase to extract existing     │
│     frontend patterns (Brownfield only)                          │
│     Read component files, hooks, state management, routing,      │
│     styling, and test patterns from the actual code.             │
├──────────────────────────────────────────────────────────────────┤
│  3. CONVENTIONS — Identify conventions and compare against       │
│     recommended practices                                        │
│     3a. Derive conventions from existing code                    │
│     3b. Ask user for a reference component (brownfield)          │
│     3c. Compare against recommended practices, flag deviations   │
├──────────────────────────────────────────────────────────────────┤
│  4. UI ARCHITECTURE — Define page/view structure and             │
│     component hierarchy                                          │
│     Map user journeys to pages/views, define layout,             │
│     identify reusable vs. new components.                        │
├──────────────────────────────────────────────────────────────────┤
│  5. COMPONENT DESIGN — Define new component contracts            │
│     Props/inputs, events/outputs, composition patterns.          │
│     Identify design system components to reuse.                  │
├──────────────────────────────────────────────────────────────────┤
│  6. STATE MANAGEMENT — Define state strategy                     │
│     Local vs. server vs. URL vs. global state.                   │
│     Data fetching and caching approach.                          │
│     Optimistic updates for write operations.                     │
├──────────────────────────────────────────────────────────────────┤
│  7. ROUTING — Define route structure                             │
│     Routes, auth guards, layouts, navigation flow.               │
│     Deep linking, URL-synchronized state.                        │
├──────────────────────────────────────────────────────────────────┤
│  8. API CONSUMPTION — Map frontend views to API endpoints        │
│     Which page calls which API (from Section 7).                 │
│     Data fetching hooks, cache invalidation, error mapping.      │
├──────────────────────────────────────────────────────────────────┤
│  9. FORMS & VALIDATION — Define form architecture                │
│     Validation schemas, submission flow, error mapping.          │
├──────────────────────────────────────────────────────────────────┤
│  10. ERROR HANDLING & UX FEEDBACK — Define UI states             │
│      Loading, error, empty, success patterns.                    │
│      Error boundary placement.                                   │
├──────────────────────────────────────────────────────────────────┤
│  11. PERFORMANCE — Define optimization strategy                  │
│      Code splitting, memoization, virtualization, rendering.     │
├──────────────────────────────────────────────────────────────────┤
│  12. ACCESSIBILITY — Define a11y implementation                  │
│      WCAG target, keyboard nav, focus management, ARIA.          │
├──────────────────────────────────────────────────────────────────┤
│  13. RESPONSIVE DESIGN — Define adaptation strategy              │
│      Breakpoints, layout changes, navigation adaptation.         │
├──────────────────────────────────────────────────────────────────┤
│  14. FRONTEND SECURITY — Define client-side security approach    │
│      Token storage, XSS prevention, CSP, CSRF.                  │
│      (Only design decisions, not implementation code)            │
├──────────────────────────────────────────────────────────────────┤
│  15. INTERNATIONALIZATION — Define i18n approach                  │
│      (Only if the feature or project requires multiple locales)  │
├──────────────────────────────────────────────────────────────────┤
│  16. VALIDATE — Cross-check against requirements and API         │
├──────────────────────────────────────────────────────────────────┤
│  17. ASSEMBLE — Produce Section 4 output                         │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Load All Inputs

Read every input listed in the Inputs table. Pay particular attention to:

- **API design (Section 7)** — filter to interfaces tagged `consumer=frontend`. These are the only API contracts the frontend calls. Ignore interfaces tagged `service` or `external` — those are backend-to-backend or integration concerns.
- **User journeys** — these define the flow the UI must support. Each journey maps to one or more pages/views.
- **Permissions-access-control** — these define what UI elements are visible per role. Certain pages, buttons, or data fields may be hidden or disabled based on the user's role.
- **NFRs** — look for usability targets (response time for UI interactions), accessibility level (WCAG 2.1 AA/AAA), and performance targets (page load time, bundle size).

### Step 1a — Collect UI/UX Design Artifacts

Before proceeding with the frontend architecture, ask the user for existing design artifacts:

**"Do you have any UI/UX design artifacts for this feature? This could include:**
- **Figma files** (designs, prototypes, component specs)
- **Wireframes or mockups** (any fidelity)
- **Design system documentation** (component library, style guide, design tokens)
- **UX specifications** (interaction patterns, animation specs, responsive breakpoints)

**If you have Figma links or exported specs, please share them. If designs are still in progress, let me know which screens/flows have been designed so far."**

If design artifacts are provided:
- Use them as the **primary source** for UI architecture (Step 4) — the component hierarchy should reflect the designed layout, not be invented
- Cross-reference Figma component names with the project's existing component library — identify which designed elements map to existing components and which are new
- Extract responsive breakpoints, spacing, colors, and typography from the design to inform Steps 12 and 13
- Note any discrepancies between the designs and the requirements (e.g., a design that shows a feature not in the functional requirements, or a requirement with no corresponding design)
- Surface discrepancies to the user: **"The Figma designs show [X], but the functional requirements don't include this. Should I include it in the frontend design, or is the design ahead of the requirements?"**

If no design artifacts exist:
- Derive the UI structure from user journeys and functional requirements
- Note in the output that no design artifacts were available and the component hierarchy is requirement-driven, not design-driven
- Recommend that designs be created before implementation to reduce rework

### Step 1b — Identify Platform

Read the platform determination from the design workflow's Step 0 (web, iOS, Android, cross-platform, web+mobile).

The framework is determined from the technology stack (Section 2): e.g., if the tech stack says "React 18 + Next.js", the AI applies its built-in knowledge of React/Next.js design patterns when comparing against existing code in Step 3.

**Platform design standards:** Read the corresponding platform or framework design standards file before proceeding to Step 2. These standards define the baseline design patterns (navigation architecture, screen structure, component selection, theming, adaptive layout, state representation, motion, accessibility, forms, and feedback) that the AI uses when comparing conventions in Step 3c and making design decisions in Steps 4–15.

| Platform / Framework | Standards file |
|---------------------|---------------|
| Android | `../assets/standards/platform/ANDROID-DESIGN-STANDARDS.md` |
| iOS | `../assets/standards/platform/IOS-DESIGN-STANDARDS.md` |
| React (web SPA) | `../assets/standards/framework/REACT-DESIGN-STANDARDS.md` |
| Angular (web) | `../assets/standards/framework/ANGULAR-DESIGN-STANDARDS.md` |
| React Native (cross-platform mobile) | `../assets/standards/framework/REACT-NATIVE-DESIGN-STANDARDS.md` |
| Cross-platform native (Android + iOS) | Read both Android and iOS platform files; note platform-specific differences in the output |
| Framework not listed | No standards file — use the AI's built-in knowledge of the framework's design patterns |

If the platform has a standards file, the AI uses it as the primary reference for recommended practices in Step 3c — not built-in knowledge alone. Where the standards file and existing codebase conventions differ, the AI flags the deviation and asks the user whether new components should follow the existing pattern or adopt the standard.

**Version compatibility check:** After loading the standards file, compare the **Applies to** version in the standards file against the **actual version** specified in the technology stack (Section 2). If the project's version is older than the standards' baseline version, alert the user:

**"The [platform/framework] design standards are written for [standards version, e.g., React 18+], but the technology stack specifies [project version, e.g., React 17.0.2]. Some standards may reference features unavailable in your version. I'll flag version-gated recommendations as I encounter them and offer alternatives for your version. If you'd like, I can adjust the standards baseline to match your version."**

If the project version is equal to or newer than the standards baseline, no alert is needed — proceed normally.

**Ask for project-specific standards:** After loading any built-in platform or framework standards, ask the user:

**"Do you have any project-specific or organization-specific frontend design standards I should follow? This could include:**
- **A custom design system** (component library documentation, design tokens, spacing/color/typography definitions)
- **UX or UI guidelines** (internal style guide, interaction pattern library, branding guide)
- **Platform-specific standards** (standards files in this repository or elsewhere that override or extend the built-in standards)
- **Accessibility or compliance standards** (organization-specific WCAG targets, regulatory requirements beyond the baseline)

**If you have standards files, provide the path or link. I'll use them as the highest-priority reference — they override the built-in standards where they conflict."**

If the user provides project-specific standards:
- Load and read them before proceeding to Step 2
- In Step 3c, use them as the **highest-priority** reference: project-specific standards > built-in platform/framework standards > AI built-in knowledge
- Note any conflicts between project-specific standards and built-in standards; present the conflict and ask the user which takes precedence

If no project-specific standards exist, proceed with the built-in standards as the primary reference.

### Step 2 — Extract Existing Frontend Patterns from the Codebase (Brownfield Only)

The AI has access to the codebase. Rather than asking the user to describe the existing frontend, the AI reads the actual source files to extract patterns.

**Step 2a — Identify the frontend project structure.**

Locate the frontend source directory and map the project structure:

| What to find | How to find it |
|--------------|---------------|
| Framework | `package.json` dependencies (react, @angular/core, vue), or mobile project files (Podfile, build.gradle, pubspec.yaml) |
| Project structure | Top-level directories under `src/` — components, pages, features, hooks, services, utils, styles, assets |
| Routing | Router configuration (react-router config, Next.js `app/` or `pages/`, Angular routing modules, Vue Router) |
| State management | Store files (Redux store, Zustand stores, Pinia stores, NgRx reducers), Context providers, state management imports |
| Styling approach | CSS files, CSS modules, styled-components, Tailwind config, SCSS, theme files |
| Design system / component library | Imports from Material UI, Ant Design, Chakra, Shadcn, custom component library |
| Test setup | Test files, testing library imports, test utilities, mock setup |

**Step 2b — Extract component patterns.**

Read 3–5 representative components from different areas of the application to identify patterns:

| Pattern | What to look for |
|---------|-----------------|
| Component structure | Function vs. class, export style (named vs. default), file organization (co-located vs. separated) |
| Props design | TypeScript interfaces, prop types, destructuring, children patterns |
| Composition | How complex components are built — compound components, render props, HOCs, or simple composition |
| Hook usage | Custom hooks, data fetching hooks, state hooks — patterns and naming conventions |
| Error handling | Error boundaries, try/catch in async operations, error state rendering |
| Loading states | Skeletons, spinners, Suspense boundaries |

**Step 2c — Extract state management patterns.**

| Pattern | What to look for |
|---------|-----------------|
| Server state | React Query/SWR/Apollo usage, query key conventions, cache configuration, optimistic updates |
| Client state | Context providers, Zustand/Redux stores, local state patterns |
| URL state | Search params usage, query string management for filters/pagination |
| Form state | Form library (React Hook Form, Formik, Angular Forms), validation approach |

**Step 2d — Extract routing patterns.**

| Pattern | What to look for |
|---------|-----------------|
| Route structure | Route hierarchy, naming conventions, nested routes |
| Auth guards | How protected routes are implemented (guard components, middleware, redirects) |
| Layouts | Layout components, how shared UI (header, sidebar, footer) is structured |
| Navigation | Programmatic navigation patterns, link components, breadcrumbs |

**Step 2e — Extract styling patterns.**

| Pattern | What to look for |
|---------|-----------------|
| Approach | CSS Modules, Tailwind, styled-components, SCSS, component library theming |
| Design tokens | Theme files, CSS custom properties, color/spacing/typography constants |
| Responsive | Breakpoint definitions, media query patterns, container queries |
| Dark mode | Theme switching mechanism (CSS custom properties, class-based, context-based) |

**Step 2f — Present findings to the user.**

Present the extracted patterns: **"I've read the codebase and identified the existing frontend patterns. Here is what I found — please confirm these are accurate, and let me know if there are conventions the code doesn't fully reflect or patterns I've missed."**

**If the AI does not have codebase access**, ask the user to describe the existing frontend patterns. Record as `user-stated`.

For greenfield projects, skip this step.

### Step 3 — Identify Conventions and Compare Against Recommended Practices

**Step 3a — Derive conventions from the extracted patterns** (brownfield) or from the technology stack (greenfield).

**Step 3b — Ask for a reference component** (brownfield only):

**"Is there an existing component or page you consider the gold standard for how frontend code should look in this project? I'll use it as the primary reference for conventions. If you don't have a preference, I'll derive conventions from the most common patterns and compare against recommended practices."**

If the user nominates a reference, use it as the primary convention source — but still compare against recommended practices in Step 3c.

**Step 3c — Compare against recommended design practices.**

For each convention area, compare the observed pattern against recommended practices for the platform and framework. If a platform design standards file was loaded in Step 1b (Android or iOS), use those standards as the primary source for recommended practices. For web platforms, use the AI's built-in knowledge of the framework:

| Convention Area | Observed Pattern | Recommended Practice | Aligned? | Deviation |
|----------------|-----------------|---------------------|----------|-----------|
| Component structure | *(e.g., function components, named exports)* | *(Function components, composition over inheritance)* | *(Yes)* | |
| State management | *(e.g., Redux for everything)* | *(Server state library for API data, client store only for complex shared UI state)* | *(No)* | *(All API data in Redux instead of server state library)* |
| Styling | *(e.g., mix of CSS Modules and inline styles)* | *(One approach used consistently)* | *(No)* | *(Inconsistent styling approach)* |

For each deviation, present the choice: **"The existing codebase uses [observed pattern], but the recommended practice is [recommended pattern]. For new components, should I: (a) follow the existing pattern for consistency, or (b) adopt the recommendation?"**

For greenfield projects, use recommended practices for the chosen framework as the convention baseline.

### Step 4 — Define UI Architecture

Map user journeys to pages/views. Define the page structure and component hierarchy. **Only include pages and components that are new or modified for this feature.** Existing unchanged pages are not documented here — they are part of the existing codebase context extracted in Step 2, not the deliverable.

**Page/View inventory:**

| Page / View | User Journey | Primary API Calls (consumer=frontend) | Permissions | Platform |
|------------|-------------|---------------------------------------|-------------|----------|
| *(Order Detail)* | *(UJ-01: View order)* | *(GET /orders/{id})* | *(user, admin)* | *(web)* |
| *(Refund Request)* | *(UJ-03: Request refund)* | *(POST /orders/{id}/refunds)* | *(user)* | *(web)* |
| *(Refund Status)* | *(UJ-04: Track refund)* | *(GET /refunds/{id}, WS refund.status.updated)* | *(user)* | *(web)* |

**Component hierarchy** — for each page, define the component tree showing which components compose the page and whether they are existing (from the design system) or new:

```
OrderDetailPage (new - page component)
├── PageLayout (existing - layout)
│   ├── OrderHeader (new - feature)
│   │   ├── Badge (existing - UI)
│   │   └── ActionMenu (existing - UI)
│   ├── OrderItemList (new - feature)
│   │   └── OrderItemRow (new - UI, reusable)
│   ├── OrderSummary (new - feature)
│   └── RefundEligibilityBanner (new - feature)
│       └── Button (existing - UI)
```

For each new component, mark whether it is a page, feature, UI, or layout component.

### Step 5 — Define New Component Contracts

For each new component identified in Step 4, define its contract. The format depends on the platform/framework.

**Web (React example):**

| Component | Type | Props | Events | State | Notes |
|-----------|------|-------|--------|-------|-------|
| `OrderItemRow` | UI | `item: OrderItem`, `onSelect?: (id) => void` | — | Stateless | Reusable across order and refund views |
| `RefundRequestForm` | Feature | `orderId: string`, `items: OrderItem[]` | `onSubmit`, `onCancel` | Form state (React Hook Form), submission state (useMutation) | Validates against API constraints |
| `RefundStatusTracker` | Feature | `refundId: string` | — | Server state (useQuery) + WebSocket subscription | Real-time updates via WS |

**iOS (SwiftUI example):**

| View | Type | Input | Bindings | State | Notes |
|------|------|-------|----------|-------|-------|
| `OrderDetailView` | Screen | `orderId: String` | — | `@StateObject viewModel: OrderDetailViewModel` | Loaded via NavigationLink |
| `RefundRequestView` | Sheet | `order: Order` | `@Binding isPresented: Bool` | `@StateObject viewModel: RefundRequestViewModel` | Presented as modal sheet |

**Android (Jetpack Compose example):**

| Composable | Type | Parameters | State | Notes |
|-----------|------|-----------|-------|-------|
| `OrderDetailScreen` | Screen | `orderId: String`, `navController: NavController` | `viewModel: OrderDetailViewModel = hiltViewModel()` | Collects StateFlow |
| `RefundRequestDialog` | Dialog | `order: Order`, `onDismiss: () -> Unit` | `viewModel: RefundRequestViewModel` | Confirmation dialog |

### Step 6 — Define State Management Strategy

Define where each piece of state lives.

**State inventory:**

| State | Type | Location | Tool | Cache / Invalidation |
|-------|------|----------|------|---------------------|
| *(Order data)* | *(server)* | *(server state library)* | *(React Query: ['orders', id])* | *(staleTime: 30s, invalidate after refund mutation)* |
| *(Refund form inputs)* | *(form)* | *(local — form library)* | *(React Hook Form + Zod)* | *(N/A)* |
| *(Refund status — real-time)* | *(server + push)* | *(server state + WebSocket)* | *(React Query + WS subscription updates cache)* | *(WS event triggers query invalidation)* |
| *(Selected tab on order detail)* | *(URL)* | *(URL search params)* | *(useSearchParams)* | *(N/A — shareable via URL)* |
| *(Current user / auth)* | *(global)* | *(Context)* | *(AuthContext)* | *(Refreshed on token expiry)* |
| *(Toast notifications)* | *(global UI)* | *(Context or store)* | *(ToastContext)* | *(Auto-dismiss after timeout)* |

**Optimistic updates** — for each write operation, define whether optimistic UI is used:

| Mutation | Optimistic? | Rollback Behavior |
|----------|------------|-------------------|
| *(Submit refund)* | *(No — wait for server confirmation)* | *(N/A)* |
| *(Cancel refund)* | *(Yes — immediately update status to "cancelling")* | *(Revert to previous status, show error toast)* |

### Step 7 — Define Routing

**Route table:**

| Route | Component | Auth | Layout | Data Loading | Platform |
|-------|-----------|------|--------|-------------|----------|
| `/orders` | `OrderListPage` | Yes (user) | `AppLayout` | `useOrders(filters)` | web |
| `/orders/:id` | `OrderDetailPage` | Yes (user) | `AppLayout` | `useOrder(id)` | web |
| `/orders/:id/refund` | `RefundRequestPage` | Yes (user) | `AppLayout` | depends on order | web |
| `/refunds/:id` | `RefundStatusPage` | Yes (user) | `AppLayout` | `useRefund(id)` + WS | web |

**Auth guard behavior:**
- Unauthenticated user → redirect to `/login` with return URL
- Authenticated but unauthorized (wrong role) → show "Access Denied" page
- Token expiry during session → show re-authentication prompt, preserve current state

**Navigation flow:**
- Define primary navigation paths through the feature (breadcrumbs, back links)
- Define deep-linking behavior (every significant view reachable via direct URL)

For **iOS/Android**: replace route table with navigation graph (NavigationStack, NavHost) showing screens, transitions, and deep link URIs.

### Step 8 — Define API Consumption Layer

Map each page/view to the API endpoints it consumes. All endpoints come from Section 7 (interfaces tagged `consumer=frontend`).

**API consumption map:**

| Page / View | API Endpoint (from Section 7) | Method | Hook / Function | Cache Key | Error Handling |
|------------|-------------------------------|--------|-----------------|-----------|---------------|
| `OrderListPage` | `GET /api/v1/orders` | Query | `useOrders(filters)` | `['orders', filters]` | Empty state if 0 results, error banner on 5xx |
| `OrderDetailPage` | `GET /api/v1/orders/{id}` | Query | `useOrder(id)` | `['orders', id]` | 404 → "Order not found" page, 5xx → error with retry |
| `RefundRequestPage` | `POST /api/v1/orders/{id}/refunds` | Mutation | `useCreateRefund()` | Invalidates `['orders', id]` | 422 → map to form errors, 5xx → error toast with retry |
| `RefundStatusPage` | `GET /api/v1/refunds/{id}` | Query | `useRefund(id)` | `['refunds', id]` | 404 → "Refund not found" |
| `RefundStatusPage` | `WS refund.status.updated` | Subscription | `useRefundStatusSocket(id)` | Updates `['refunds', id]` cache | Reconnect on disconnect |

**API client configuration:**
- Base URL source (environment variable)
- Auth header injection (token from auth context/store)
- Error interceptor (401 → redirect to login, 5xx → error tracking)
- Request/response types (generated from API design or manually defined matching Section 7 schemas)

### Step 9 — Define Form Architecture

For each form in the feature, define the validation and submission approach.

**Form inventory:**

| Form | Fields | Validation Schema | Submission API | On Success | On Error |
|------|--------|-------------------|---------------|-----------|----------|
| *(Refund Request)* | *(reason: required string max 500, lineItems: at least 1 selected)* | *(Zod schema matching POST /refunds request body)* | *(POST /orders/{id}/refunds)* | *(Redirect to /refunds/{id} with success toast)* | *(422: map errors to fields; 5xx: error toast with retry)* |

**Validation rules alignment:** the client-side validation schema must match the constraints defined in the API design (Section 7) for the corresponding request body. List any constraints from Section 7 and confirm the form enforces them.

**Multi-step forms** (if applicable): define step sequence, which fields belong to each step, and how partial state is preserved between steps.

### Step 10 — Define Error Handling and UX Feedback

**UX state matrix** — for each page/view, define all possible UI states:

| Page / View | Loading | Success | Empty | Error (4xx) | Error (5xx) | Offline |
|------------|---------|---------|-------|-------------|-------------|---------|
| `OrderListPage` | Skeleton table | Order list | "No orders yet" + CTA | N/A | Error banner + retry | Cached data + offline banner |
| `OrderDetailPage` | Skeleton layout | Order detail | N/A | "Order not found" | Error + retry | Cached if previously loaded |
| `RefundRequestPage` | Skeleton form | Pre-filled form | N/A | "Order not eligible" | Error + retry | Block submission + offline banner |

**Error boundary placement:**
- Route-level: one per top-level route (failed page doesn't crash the app)
- Widget-level: around independent sections (failed sidebar doesn't crash main content)
- Define the fallback UI for each boundary level

**Toast/notification patterns:**
- Success: auto-dismiss after 5s, action link (e.g., "View refund")
- Error: persist until dismissed, retry button
- Info: auto-dismiss after 5s

### Step 11 — Define Performance Strategy

**Performance targets** — use NFR targets if specified; otherwise use these defaults for web:

| Metric | Target | Notes |
|--------|--------|-------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | Main content visible |
| INP (Interaction to Next Paint) | ≤ 200ms | UI responsiveness |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | Visual stability |

For mobile (iOS/Android), the equivalent targets are app launch time and frame rendering performance, informed by the platform's guidelines.

**Code splitting plan:**

| Split Point | Type | Trigger |
|------------|------|---------|
| *(Each top-level route)* | Route-based lazy loading | Navigation to route |
| *(Chart component on analytics page)* | Component-level dynamic import | Tab selection |
| *(PDF export library)* | Library-level dynamic import | "Export" button click |

**Memoization decisions** (based on measurement, not premature optimization):

| Component / Computation | Memoize? | Reason |
|------------------------|----------|--------|
| *(OrderItemRow in list of 100+ items)* | *(Yes — React.memo)* | *(Prevents re-render of all rows when one changes)* |
| *(Sorted/filtered order list)* | *(Yes — useMemo)* | *(Expensive sort on large dataset)* |
| *(Simple Button component)* | *(No)* | *(Cheap to re-render)* |

**Virtualization:**
- Lists with > 50 items: define which lists need virtualization

**Rendering strategy** (web — Next.js or similar):

| Page | Strategy | Reason |
|------|----------|--------|
| *(Order List)* | *(CSR)* | *(Authenticated, dynamic data)* |
| *(Marketing / Landing)* | *(SSG)* | *(Public, content changes rarely)* |

### Step 12 — Define Accessibility Implementation

Map WCAG NFR targets to concrete implementation decisions.

**Accessibility plan:**

| Requirement | Design Decision |
|------------|----------------|
| *(Keyboard navigation)* | *(All interactive elements reachable via Tab; custom components follow WAI-ARIA keyboard patterns)* |
| *(Focus management — modals)* | *(Trap focus inside dialog, restore on close)* |
| *(Focus management — route changes)* | *(Move focus to main content heading on navigation)* |
| *(Screen reader — dynamic content)* | *(Toast notifications use aria-live="polite"; form errors announced)* |
| *(Color contrast)* | *(4.5:1 minimum for normal text, 3:1 for large text — verified against design tokens)* |
| *(Semantic HTML)* | *(Landmark roles for page structure, button/a used correctly)* |

**Automated accessibility testing:**
- axe-core integrated into component tests
- Lighthouse accessibility audit in CI pipeline

### Step 13 — Define Responsive Design Strategy

**Breakpoint definitions** (from the existing codebase, or define for greenfield):

| Breakpoint | Min Width | Layout Changes |
|-----------|-----------|---------------|
| *(sm)* | *(640px)* | *(Single column, hamburger nav)* |
| *(md)* | *(768px)* | *(Two-column where applicable, expanded nav)* |
| *(lg)* | *(1024px)* | *(Full sidebar visible, three-column on dashboard)* |

**Navigation adaptation:**
- Mobile: bottom tab bar or hamburger menu
- Tablet: collapsible sidebar
- Desktop: persistent sidebar

**Component adaptations** — which components change layout per breakpoint:

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| *(OrderItemList)* | *(Card stack)* | *(Compact table)* | *(Full table with all columns)* |
| *(RefundRequestForm)* | *(Full width, stacked fields)* | *(Two-column)* | *(Two-column with preview panel)* |

### Step 14 — Define Frontend Security Approach

Define the client-side security design decisions. These are architectural choices, not coding patterns.

**Token/session storage strategy:**

| Approach | XSS Risk | CSRF Risk | When to Use |
|----------|----------|-----------|-------------|
| `httpOnly` cookie | Low | Medium (mitigate with SameSite + CSRF token) | Session tokens — recommended default |
| In-memory (JS variable) | Low | None | Short-lived tokens where refresh-on-reload is acceptable |
| `localStorage` | High (accessible via JS) | None | Only if strong CSP is enforced and there is no sensitive data in the token |

State which approach the feature uses and why. If the existing system already has a token storage approach, confirm it carries forward.

**XSS prevention approach:**
- How is user-generated content handled? (sanitization library, framework auto-escaping, Content Security Policy)
- Are there any areas where raw HTML rendering is needed? If so, what sanitization is in place?

**CSRF protection:**
- For cookie-based auth: how are CSRF tokens included in state-changing requests?
- For token-based auth (Bearer header): CSRF is inherently mitigated — confirm this is the case

**Content Security Policy (CSP):**
- Is a CSP header planned for new pages? What is the policy (no `unsafe-inline`, no `unsafe-eval`)?
- If the existing system has a CSP, will the new feature comply with it?

For brownfield projects, these are likely established already — confirm the existing approach carries forward. For greenfield, these are design decisions that must be made before implementation.

### Step 15 — Define Internationalization Approach (If Applicable)

Only include this step if the feature or project requires multiple locales.

**i18n design decisions:**

| Decision | Choice | Rationale |
|----------|--------|-----------|
| String management | *(e.g., translation key system, ICU MessageFormat)* | *(All user-facing strings externalized)* |
| Date/number/currency formatting | *(e.g., Intl.DateTimeFormat, framework i18n library)* | *(Locale-aware formatting)* |
| RTL support | *(Yes/No)* | *(Required if targeting Arabic, Hebrew, etc.)* |
| Text expansion | *(Design accommodates ~30% longer text)* | *(German, Finnish, etc. produce longer strings)* |

If the project does not support multiple locales, skip this step. If the feature is the first to introduce i18n, note that this is a new architectural concern and define the approach for future features to follow.

### Step 16 — Validate

Check the completed frontend design against:

- **User journeys** — does every user journey have corresponding pages/views and navigation paths?
- **Functional requirements** — does every functional requirement that maps to a UI capability have a corresponding component?
- **API contracts** — does every API endpoint tagged `consumer=frontend` in Section 7 have a corresponding consumer in the API consumption map (Step 8)?
- **Permissions** — does every permission-gated UI element match the permissions-access-control requirements?
- **NFRs** — are accessibility, performance, and usability targets addressed?
- **Data model** — does the UI display and manipulate entities consistently with the data model (Section 6)?
- **Backend design** — does the frontend's error handling match the error responses defined in the backend design (Section 5)?
- **UX alignment** — do the page/view structures support the user journeys without unnecessary steps?
- **Design artifacts** — if Figma/mockups were provided: does the component hierarchy match the designed layout? Are there screens in the designs not covered by the frontend design, or vice versa?
- **Security** — is the token storage approach defined? Is XSS prevention addressed? Is CSP planned?
- **Traceability** — does every new or modified component trace to a requirement?

### Step 17 — Assemble

Combine all sections into the frontend design output. This becomes Section 4 of the solution design package.

### File Output

Write the completed section to `docs/<feature>/solutions-package/design/04-frontend-design.md` using the template at `../assets/frontend-design-doc.md` as the output structure.

If this section was determined to be not applicable in the design workflow's Step 0, write a stub file containing: **"Not applicable — [rationale from scoping step]."**

---

## Output Structure

The output is organized by concern. Only include platform-specific sections for platforms in scope.

### For Brownfield Projects

**1. Platform and Framework** — which platform(s) and framework(s) this feature targets (from Step 1b)

**2. Existing Patterns** — frontend patterns extracted from the codebase, organized by area: component structure, state management, routing, styling, testing (from Step 2)

**3. Conventions** — patterns derived from existing code, compared against recommended practices, with deviations noted (from Step 3)

**4. UI Architecture**
- Page/view inventory with user journey mapping
- Component hierarchy per page (existing vs. new, component types)

**5. Component Contracts** — props/inputs, events/outputs, state, and notes for every new component (from Step 5)

**6. State Management Strategy** — state inventory with type, location, tool, and cache/invalidation rules (from Step 6)

**7. Routing** — route table (or navigation graph for mobile) with auth guards, layouts, and data loading (from Step 7)

**8. API Consumption Map** — which pages call which API endpoints, with hooks/functions, cache keys, and error handling (from Step 8)

**9. Forms and Validation** — form inventory with validation schemas, submission flow, and error mapping (from Step 9)

**10. Error Handling and UX Feedback** — UX state matrix, error boundary placement, toast patterns (from Step 10)

**11. Performance Strategy** — code splitting, memoization, virtualization, rendering strategy (from Step 11)

**12. Accessibility Implementation** — a11y plan mapped to WCAG targets, automated testing approach (from Step 12)

**13. Responsive Design** — breakpoints, navigation adaptation, component adaptations per breakpoint (from Step 13)

**14. Frontend Security** — token storage approach, XSS prevention, CSRF protection, CSP (from Step 14)

**15. Internationalization** — i18n approach if applicable (from Step 15)

**16. Requirements Traceability** — every new or modified component traces to the requirement that drives it

### For Greenfield Projects

Same structure, omitting Section 2 (Existing Patterns).

---

## Requirements Traceability

Every new or modified component must trace to the requirement that drives it. Existing unchanged components carry forward without traceability.

| Component | Type | Change Type | Requirement ID | Requirement Summary |
|-----------|------|------------|---------------|---------------------|
| *(RefundRequestForm)* | *(feature)* | *(new)* | *(FR-01)* | *(Users can submit refund requests)* |
| *(RefundStatusTracker)* | *(feature)* | *(new)* | *(FR-07)* | *(Users see live refund status updates)* |
| *(OrderDetailPage — add refund eligibility banner)* | *(page)* | *(modified)* | *(FR-02)* | *(Orders must show refund eligibility)* |
| *(OrderItemRow)* | *(UI)* | *(new)* | *(FR-01, FR-03)* | *(Shared row component for order and refund views)* |

If a component cannot be traced to a requirement, it must be flagged and confirmed with the user before inclusion.

---

## Hand-off Gate

Before proceeding to `integration-design`, you must:

1. Write the completed frontend design in full.
2. Present it to the user for review with the following questions:
   - **UI architecture:** Does the page/view structure support all user journeys? Are any pages missing?
   - **Components:** Are the component contracts correct? Are reusable components identified? Are design system components used where appropriate?
   - **State management:** Is the state strategy correct? Is server state separated from client state?
   - **API consumption:** Does every `consumer=frontend` endpoint from Section 7 have a consumer in the design? Are any missing?
   - **Forms:** Are the validation schemas aligned with the API contracts?
   - **Error handling:** Are all error and loading states defined? Are error boundaries placed correctly?
   - **Performance:** Is the code splitting and virtualization strategy appropriate?
   - **Accessibility:** Does the a11y plan meet the WCAG targets from the NFRs?
   - **Responsive:** Does the responsive strategy cover the target devices?
   - **Design artifacts:** If Figma/mockups were provided, does the architecture match the designs? Are there discrepancies?
   - **Traceability:** Is every new or modified component connected to a requirement?
3. If the user identifies corrections, update and re-present before proceeding.
4. Do not proceed until the user explicitly confirms the frontend design is accurate.

## Completion Criteria

- [ ] Platform and framework are identified from the workflow's Step 0 and technology stack
- [ ] User has been asked for UI/UX design artifacts (Figma, mockups, wireframes, design system docs)
- [ ] If design artifacts were provided: component hierarchy reflects the designed layout; discrepancies between designs and requirements are surfaced
- [ ] If no design artifacts: this is noted in the output, and the component hierarchy is derived from requirements
- [ ] For brownfield: existing frontend patterns are extracted from the codebase (component files, hooks, state stores, routing config, styling) with full detail
- [ ] For brownfield: conventions are derived from existing patterns and compared against recommended practices for the platform/framework; deviations are flagged and user has chosen which to follow
- [ ] If user nominated a reference component, it was used as the primary convention source and still compared against recommended practices
- [ ] Every user journey has corresponding pages/views with navigation paths
- [ ] Component hierarchy is defined for every page (existing vs. new, component types marked)
- [ ] New component contracts are defined with props/inputs, events/outputs, and state
- [ ] Design system / component library components are identified for reuse where appropriate
- [ ] State management strategy is defined: local, server (React Query/SWR/Apollo), URL, and global state with specific tools
- [ ] Server state uses a server state library — not a client state store for API data
- [ ] Route table (or navigation graph) is defined with auth guards, layouts, and data loading per route
- [ ] API consumption map connects every `consumer=frontend` endpoint from Section 7 to a page and hook/function
- [ ] No `consumer=frontend` endpoints from Section 7 are missing from the consumption map
- [ ] Forms define validation schemas that match API contract constraints from Section 7
- [ ] UX state matrix defines loading, error, empty, and success states for every page
- [ ] Error boundary placement is defined at route and widget level
- [ ] Performance strategy defines code splitting, memoization, and virtualization decisions
- [ ] Accessibility plan maps WCAG targets from NFRs to concrete implementation decisions
- [ ] Responsive design defines breakpoints, navigation adaptation, and component layout changes
- [ ] Frontend security approach is defined: token storage, XSS prevention, CSRF protection, CSP
- [ ] If the project requires multiple locales: i18n approach is defined (string management, formatting, RTL, text expansion)
- [ ] If the AI has codebase access, existing patterns are extracted from the actual code — not described from memory
- [ ] Requirements traceability is complete — every new or modified component traces to a requirement
- [ ] The user has explicitly confirmed the frontend design is accurate

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Frontend calls API endpoints that don't exist or have different schemas than expected | API consumption map (Step 8) maps every frontend call to a specific endpoint from Section 7 (tagged `consumer=frontend`); schemas are cross-checked |
| Frontend doesn't know which API endpoints it should consume | Consumer tagging in Section 7 explicitly marks which interfaces are `frontend`-facing; Step 8 maps all of them |
| State management is inconsistent — some API data in Redux, some in React Query, some in local state | State inventory (Step 6) defines a clear strategy for each type of state; recommended practices enforce server state separation |
| Different developers build components with different patterns (some with hooks, some with classes, different prop styles) | Conventions (Step 3) establish a single pattern set; new components follow it; deviations from recommended practices are flagged |
| Loading, error, and empty states are missing or inconsistent across pages | UX state matrix (Step 10) requires every page to define all UI states; patterns are standardized |
| Forms validate differently from the API, causing submission failures | Validation schemas (Step 9) are explicitly aligned to API contract constraints from Section 7 |
| Accessibility is an afterthought — no keyboard navigation, missing ARIA, poor contrast | Accessibility plan (Step 12) maps WCAG targets to specific implementations; automated testing is planned |
| Performance degrades with large lists because virtualization was never planned | Performance strategy (Step 11) identifies lists needing virtualization and defines the approach |
| Code splitting is not planned, resulting in a massive initial bundle | Performance strategy (Step 11) defines route-level and library-level splitting |
| Components are built from scratch when the design system already has them | Component hierarchy (Step 4) explicitly marks existing vs. new components; Step 5 identifies design system reuse |
| Frontend design doesn't match the user journeys from the requirements | UI architecture (Step 4) maps every user journey to pages/views; validation (Step 14) cross-checks coverage |
| Responsive design is ad-hoc — some pages work on mobile, others don't | Responsive strategy (Step 13) defines breakpoints and component adaptations for every page |
| Existing frontend patterns are described from memory incorrectly | The AI reads the actual codebase to extract patterns (Step 2) — not described from memory or guessed |
| Real-time features (WebSocket) are designed without considering reconnection or missed events | API consumption map (Step 8) covers WebSocket subscriptions with error handling (reconnect, cache updates) |
| Frontend architecture doesn't match the Figma designs, causing rework during implementation | Step 1a asks for design artifacts upfront; component hierarchy (Step 4) is built from the designs when available; validation (Step 14) cross-checks alignment |
| Figma designs exist but are never referenced, leading to a gap between design and implementation | Step 1a explicitly prompts for design artifacts; if not provided, the output notes this gap and recommends designs be created before implementation |
