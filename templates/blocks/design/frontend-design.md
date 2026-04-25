---
slug: frontend-design
title: "Frontend Design"
applies-to: [greenfield-design-package, brownfield-enhancement-spec]
requires-decision-from: [architect, lead-dev]
optional: true
order-hint: 4
---

## 4. Frontend Design

<!-- Technical design for the web frontend. Covers architecture, state management, routing, and all frontend-specific concerns. -->

### 4.1 Frontend Architecture Overview

[One paragraph describing the frontend approach, framework, and key patterns.]

### 4.2 Technology Baseline

[Reference Technology Stack document section 2.2. Summarize key frontend technologies here.]

### 4.3 Application Structure

<!-- Folder organization and module structure. -->

```
src/
├── components/        # Shared/reusable components
├── features/          # Feature-based modules
│   ├── [feature-a]/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types/
│   └── [feature-b]/
├── layouts/           # Page layouts
├── hooks/             # Shared hooks
├── services/          # API services
├── types/             # Shared types
├── utils/             # Utility functions
└── config/            # Configuration
```

### 4.4 Routing

<!-- Route definitions and navigation structure. -->

| Route | Component | Auth Required | Roles |
|-------|----------|:---:|-------|
| [e.g., /] | [e.g., Dashboard] | Yes | [e.g., All] |
| [e.g., /practitioners] | [e.g., PractitionerList] | Yes | [e.g., Admin, Resource Manager] |
| [e.g., /practitioners/:id] | [e.g., PractitionerDetail] | Yes | [e.g., Admin, Resource Manager] |
| | | | |

### 4.5 State Management Strategy

<!-- How application and server state are managed. -->

| State Type | Technology | Usage |
|-----------|-----------|-------|
| [e.g., Server State] | [e.g., TanStack Query] | [e.g., API data fetching, caching, invalidation] |
| [e.g., Application State] | [e.g., React Context] | [e.g., User session, theme, sidebar state] |
| [e.g., Form State] | [e.g., React Hook Form] | [e.g., Form inputs, validation] |
| [e.g., URL State] | [e.g., React Router] | [e.g., Filters, pagination, active tabs] |

### 4.6 API Integration

<!-- How the frontend communicates with the backend. -->

- **HTTP Client:** [e.g., Axios / fetch wrapper]
- **Base URL Configuration:** [e.g., Environment-specific API base URL]
- **Authentication Header:** [e.g., Bearer token in Authorization header]
- **Error Handling:** [e.g., Global error interceptor, RFC 7807 error parsing]
- **Data Freshness:** [e.g., TanStack Query stale time: 30s, refetch on window focus]

### 4.7 Authentication (Frontend)

<!-- How SSO and token management work on the frontend. -->

- **SSO Flow:** [e.g., MSAL redirect flow → Entra ID → token returned → stored in memory]
- **Token Storage:** [e.g., In-memory only (not localStorage)]
- **Token Refresh:** [e.g., Silent refresh via MSAL]
- **Logout:** [e.g., Clear token + redirect to Entra ID logout]

### 4.8 Authorization (Frontend)

<!-- How RBAC is enforced in the UI. -->

- **Role Source:** [e.g., JWT claims from /api/me endpoint]
- **Route Guards:** [e.g., Role-based route protection via wrapper component]
- **Component Visibility:** [e.g., Conditional rendering based on user role]

### 4.9 Environment Configuration

<!-- How different environments are configured. -->

| Variable | Development | Staging | Production |
|----------|-----------|---------|------------|
| [e.g., API_BASE_URL] | [e.g., http://localhost:8080] | [e.g., https://api-staging.example.com] | [e.g., https://api.example.com] |
| [e.g., ENTRA_CLIENT_ID] | [value] | [value] | [value] |

### 4.10 Browser Support & Accessibility

- **Browsers:** [e.g., Chrome, Firefox, Safari, Edge — latest 2 versions]
- **Accessibility Standard:** [e.g., WCAG 2.1 AA]
- **Responsive:** [e.g., Desktop-first, responsive down to 1024px]

### 4.11 Frontend Testing Strategy

| Test Type | Framework | Coverage Target | Focus |
|-----------|----------|----------------|-------|
| [e.g., Unit Tests] | [e.g., Vitest] | [e.g., 80%] | [e.g., Hooks, utilities, business logic] |
| [e.g., Component Tests] | [e.g., Testing Library] | [e.g., Key components] | [e.g., Render, interaction, accessibility] |
| [e.g., E2E Tests] | [e.g., Playwright] | [e.g., Critical paths] | [e.g., Login, CRUD workflows, navigation] |

### 4.12 Frontend Performance

- [e.g., Code splitting by route (lazy loading)]
- [e.g., Image optimization]
- [e.g., Memoization of expensive computations]
- [e.g., Virtualization for long lists]
