# [Application Name] — Documentation for AI-Assisted Development

> **Purpose of this document:** This documentation is structured to enable AI assistants to accurately generate features, components, and integrations for [Application Name]. Every section prioritizes precision, concrete examples, and explicit constraints over narrative explanation.
>
> **Documentation version:** [e.g., 2.1.0 — keep in sync with app version]
> **Application version covered:** [e.g., 3.4.x]
> **Last updated:** [date]
> **Audience:** Internal developers, maintainers, and AI assistants

---

## Table of Contents

### Part 1 — Foundation
1. [Application Overview](#1-application-overview)
2. [Environment and Configuration](#2-environment-and-configuration)
3. [Project Structure](#3-project-structure)

### Part 2 — Architecture
4. [Architecture and Design Patterns](#4-architecture-and-design-patterns)
5. [Routing and Navigation](#5-routing-and-navigation)
6. [State Management](#6-state-management)
7. [Component Architecture](#7-component-architecture)

### Part 3 — Integration
8. [API Integration](#8-api-integration)
9. [Authentication and Authorization](#9-authentication-and-authorization)
10. [Error Handling and Logging](#10-error-handling-and-logging)

### Part 4 — Styling and Theming
11. [Styling and Design System](#11-styling-and-design-system)

### Part 5 — Features and Workflows
12. [Forms and Validation](#12-forms-and-validation)
13. [Feature Modules](#13-feature-modules)

### Part 6 — Cross-Cutting Concerns
14. [Internationalization (i18n)](#14-internationalization-i18n)
15. [Accessibility](#15-accessibility)
16. [Performance Patterns](#16-performance-patterns)
17. [Security Implementation](#17-security-implementation)

### Part 7 — Quality and Maintenance
18. [Testing Strategy](#18-testing-strategy)
19. [Build and Deployment](#19-build-and-deployment)
20. [Anti-Patterns](#20-anti-patterns)

### Part 8 — Reference
21. [Troubleshooting](#21-troubleshooting)
22. [Glossary](#22-glossary)
23. [Quick Reference](#23-quick-reference)
24. [Appendix A: Architecture Diagram](#appendix-a-architecture-diagram)

---

# Part 1 — Foundation

---

## 1. Application Overview

### 1.1 What This Application Is

- **Application Name:** [Full application name]
- **Current Version:** [e.g., 3.4.2]
- **Repository:** [URL to the git repository]
- **Deployed Instances:** [URLs to production, staging, dev environments]
- **Primary Purpose:** [One or two sentences — e.g., "An internal dashboard for managing customer support tickets, used by 200+ support agents across 5 regions."]
- **Key Users/Stakeholders:** [Who uses this app: internal team, customers, partners?]

### 1.2 Key Features

<!-- List the 3–7 most important features that define what this app does. Each should be one sentence. -->

- [Feature 1]: [One sentence describing the feature and its value]
- [Feature 2]: [One sentence describing the feature and its value]
- [Feature 3]: [One sentence describing the feature and its value]
- [Feature 4]: [One sentence describing the feature and its value]

### 1.3 Technology Stack

**Framework and Libraries:**

| Technology          | Version    | Purpose                                        |
|---------------------|-----------|------------------------------------------------|
| [Framework]         | [e.g., 18.x] | [e.g., "UI framework for building components"] |
| [State Library]     | [version] | [e.g., "Global state management"]              |
| [HTTP Client]       | [version] | [e.g., "API communication"]                    |
| [Routing Library]   | [version] | [e.g., "Client-side routing"]                  |
| [Testing Library]   | [version] | [e.g., "Component and unit testing"]           |
| [Build Tool]        | [version] | [e.g., "Build optimization and bundling"]      |
| [Styling]           | [version] | [e.g., "SCSS, CSS Modules, or CSS-in-JS"]      |
| [i18n Library]      | [version] | [e.g., "Internationalization support"]         |
| [Additional Lib]    | [version] | [Purpose]                                      |

**Runtime and Build Environment:**

| Dependency          | Required Version | Purpose                                   |
|---------------------|------------------|-------------------------------------------|
| Node.js             | [e.g., >= 18.x]  | JavaScript runtime for dev and build      |
| npm or yarn         | [version]        | Package manager                           |
| [Other runtime]     | [version]        | [Purpose]                                 |

**Infrastructure:**

| Component           | Details                                            |
|---------------------|---------------------------------------------------|
| Hosting             | [e.g., "AWS S3 + CloudFront", "Netlify", "Docker on Kubernetes"] |
| Database            | [e.g., "No backend database — calls REST API"] |
| Authentication      | [e.g., "Auth0", "OAuth2", "API key in headers"]   |
| CDN                 | [e.g., "CloudFront", "Cloudflare", "None"]        |
| Monitoring          | [e.g., "DataDog", "Sentry", "custom logging"]     |
| CI/CD               | [e.g., "GitHub Actions", "GitLab CI", "Jenkins"]  |

### 1.4 Architecture Pattern

- **Type:** [e.g., "Single Page Application (SPA)", "Server-Side Rendering (SSR)", "Progressive Web App (PWA)", "Hybrid (SPA with offline capability)"]
- **Explanation:** [One or two sentences explaining why this pattern was chosen and what problems it solves]

**Architecture Diagram:**
```
[Optional: Simple ASCII or description of the high-level architecture]

Example for SPA:
┌─────────────────────────────────────────┐
│         Browser / SPA Application        │
│  ┌──────────┐  ┌──────────┐             │
│  │ Routes   │  │ State    │             │
│  │& Views   │  │Management│             │
│  └────┬─────┘  └────┬─────┘             │
│       │             │                   │
│       └──────┬──────┘                   │
│              │                          │
└──────────────┼──────────────────────────┘
               │ (HTTP API calls)
               ▼
        [Backend API Server]
```

### 1.5 Core Architecture Decisions and Rationale

<!-- Explain the major architectural decisions and WHY they were made. This helps developers understand the reasoning. -->

**Decision 1: [e.g., "SPA with Client-Side Routing"]**
- **Rationale:** [e.g., "Enables fast navigation without full page reloads, reducing latency and improving UX for power users who manage dozens of tickets per day."]
- **Trade-offs:** [e.g., "Initial load is heavier; requires careful JavaScript code splitting to keep initial bundle under 500KB."]
- **Where it's used:** [Every route; see section 5]

**Decision 2: [e.g., "Redux for Global State"]**
- **Rationale:** [e.g., "Multiple features need access to authenticated user data and team permissions; Redux DevTools enables time-travel debugging for production issues."]
- **Trade-offs:** [e.g., "Boilerplate for simple features; steeper learning curve for new developers."]
- **Where it's used:** [Global state; see section 6]

**Decision 3: [e.g., "CSS Modules for Component Styles"]**
- **Rationale:** [e.g., "Prevents style collisions in large codebases; enables confident refactoring of CSS without affecting other components."]
- **Trade-offs:** [e.g., "Requires build tool support; theme switching is more complex than global CSS variables."]
- **Where it's used:** [All component styling; see section 11]

### 1.6 Dependencies and External Services

**APIs Consumed:**

| API / Service       | Endpoint(s)                  | Purpose                                    | Auth Type    |
|---------------------|------------------------------|-------------------------------------------|--------------|
| [API Name]          | [e.g., /api/v1/tickets]      | [e.g., "Fetches support tickets"]          | Bearer token |
| [API Name]          | [e.g., /api/v1/users]        | [e.g., "User management"]                  | API key      |
| [Service Name]      | [e.g., service.com/upload]   | [e.g., "File storage and uploads"]         | OAuth2       |
| [Other Service]     | [details]                    | [Purpose]                                  | [Auth type]  |

**Third-Party Libraries:**
- [Library Name] v[version]: [Purpose in one sentence]
- [Library Name] v[version]: [Purpose in one sentence]

---

## 2. Environment and Configuration

### 2.1 Prerequisites for Development

| Requirement      | Version     | How to Check        | Installation Link |
|------------------|-------------|---------------------|--------------------|
| Node.js          | [e.g., 18.x] | `node --version`    | [nodejs.org]       |
| npm or yarn      | [e.g., 9.x]  | `npm --version`     | Bundled with Node  |
| Git              | [any]       | `git --version`     | [git-scm.com]      |
| [Other tool]     | [version]   | [Check command]     | [URL]              |

### 2.2 Browser Support

| Browser       | Minimum Version | Notes                                   |
|---------------|-----------------|----------------------------------------|
| Chrome        | [e.g., 110]     | [e.g., "Fully supported"]               |
| Firefox       | [e.g., 109]     | [e.g., "Fully supported"]               |
| Safari        | [e.g., 16.1]    | [e.g., "Fully supported"]               |
| Edge          | [e.g., 110]     | [e.g., "Fully supported"]               |
| Internet Explorer | Not supported   | [e.g., "Use Edge instead"]              |

### 2.3 Installation and Setup

**Clone the repository:**
```bash
git clone [repository-url]
cd [project-directory]
```

**Install dependencies:**
```bash
npm install
# or
yarn install
```

**Configure environment:**
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit with your local settings
# Required variables:
# REACT_APP_API_URL=http://localhost:3001
# REACT_APP_AUTH_DOMAIN=your-auth0-domain.auth0.com
```

**Start development server:**
```bash
npm start
# or
yarn start
```

**Verify setup:**
```bash
# Open browser to http://localhost:3000
# You should see the login page
# Try logging in with test credentials (see .env.example)
```

### 2.4 Environment Variables

<!-- Complete reference of all environment variables. Include defaults and examples. -->

**Frontend Application Configuration:**

| Variable Name          | Type      | Default Value    | Required | Example / Description |
|------------------------|-----------|--------------------|----------|---------------------------|
| `REACT_APP_API_URL`    | String    | `http://localhost:3001` | Yes | Base URL for API calls; varies by environment |
| `REACT_APP_API_TIMEOUT`| Number    | `30000`           | No      | HTTP request timeout in milliseconds |
| `REACT_APP_LOG_LEVEL`  | String    | `'warn'`          | No      | Log level: 'debug', 'info', 'warn', 'error' |
| `REACT_APP_SENTRY_DSN` | String    | (empty)           | No      | Sentry error tracking URL; only in prod |
| `REACT_APP_AUTH_DOMAIN`| String    | (none)            | Yes     | Auth0 domain for authentication |
| `REACT_APP_AUTH_CLIENTID` | String | (none)            | Yes     | Auth0 application client ID |
| `REACT_APP_ENV`        | String    | `'development'`   | No      | Current environment: 'development', 'staging', 'production' |
| `[VARIABLE]`           | `[type]`  | `[default]`       | [Yes/No] | [Description] |

**Example .env.local for local development:**
```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_API_TIMEOUT=30000
REACT_APP_LOG_LEVEL=debug
REACT_APP_AUTH_DOMAIN=myapp-dev.auth0.com
REACT_APP_AUTH_CLIENTID=YOUR_DEV_CLIENT_ID
REACT_APP_ENV=development
```

### 2.5 Build and Runtime Configuration

**Build Configuration Files:**

- `tsconfig.json`: TypeScript compiler options. Key settings:
  - `target`: [e.g., "ES2020"]
  - `module`: [e.g., "ESNext"]
  - `lib`: [List of libraries, e.g., "ES2020", "DOM"]

- `[Build config file, e.g., webpack.config.js, vite.config.ts]`: [Purpose and key settings]

**Application Configuration Bootstrap:**

<!-- The main application setup file. Show the complete code if possible. -->

```typescript
// src/main.tsx (or app.config.ts, index.tsx, depending on framework)
// This file sets up the application at startup

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import store from './store';
import './styles/index.scss';

// Example bootstrap code — show your actual code
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
```

### 2.6 Development Tools and Commands

| Command              | Purpose                                      | Example |
|----------------------|----------------------------------------------|---------|
| `npm start`          | Start development server with hot reload    | Runs on http://localhost:3000 |
| `npm test`           | Run unit and component tests                 | Uses Jest with watch mode |
| `npm run build`      | Create optimized production build            | Output goes to `dist/` folder |
| `npm run lint`       | Check code for style and error issues        | Uses ESLint |
| `npm run format`     | Auto-format code                             | Uses Prettier |
| `npm run type-check` | Check TypeScript types                       | Full type checking without building |
| `npm run e2e`        | Run end-to-end tests                         | Uses Playwright or Cypress |
| [Other command]      | [Purpose]                                    | [Details] |

---

## 3. Project Structure

### 3.1 Folder Organization

<!-- Show the exact folder structure. Use comments to explain what goes where. -->

```
[project-root]/
│
├── public/                          # Static assets served as-is
│   ├── index.html                   # Main HTML file (entry point for SPA)
│   ├── favicon.ico
│   └── manifest.json                # PWA web app manifest (if PWA)
│
├── src/                             # All source code
│   ├── index.tsx                    # App entry point
│   ├── App.tsx                      # Root component
│   ├── App.scss
│   │
│   ├── features/                    # Feature modules — one folder per feature
│   │   ├── tickets/                 # Example feature: Ticket Management
│   │   │   ├── routes.tsx           # Feature-specific routes
│   │   │   ├── Tickets.tsx          # Feature root component
│   │   │   ├── Tickets.scss
│   │   │   │
│   │   │   ├── pages/               # Page components for this feature
│   │   │   │   ├── TicketListPage.tsx
│   │   │   │   ├── TicketDetailPage.tsx
│   │   │   │   └── CreateTicketPage.tsx
│   │   │   │
│   │   │   ├── components/          # Reusable components for this feature
│   │   │   │   ├── TicketCard/
│   │   │   │   │   ├── TicketCard.tsx
│   │   │   │   │   ├── TicketCard.scss
│   │   │   │   │   └── TicketCard.test.tsx
│   │   │   │   └── TicketForm/
│   │   │   │       ├── TicketForm.tsx
│   │   │   │       ├── TicketForm.scss
│   │   │   │       └── TicketForm.test.tsx
│   │   │   │
│   │   │   ├── store/               # Feature-specific state (Redux slices, Vuex modules, etc.)
│   │   │   │   ├── ticketsSlice.ts  # Redux slice (state, reducers, actions)
│   │   │   │   └── selectors.ts     # Selectors for accessing state
│   │   │   │
│   │   │   ├── services/            # Feature-specific API services
│   │   │   │   └── ticketService.ts # API calls for tickets
│   │   │   │
│   │   │   ├── models/              # TypeScript types for this feature
│   │   │   │   └── Ticket.ts
│   │   │   │
│   │   │   ├── hooks/               # Feature-specific custom hooks
│   │   │   │   ├── useTickets.ts    # Hook to fetch/manage tickets
│   │   │   │   └── useTicketForm.ts # Hook for form state
│   │   │   │
│   │   │   └── constants.ts         # Feature-specific constants
│   │   │
│   │   ├── dashboard/               # Another feature
│   │   │   └── [same structure as tickets/]
│   │   │
│   │   └── [other features...]
│   │
│   ├── core/                        # Core/singleton services, guards, app-wide setup
│   │   ├── services/                # App-wide services
│   │   │   ├── authService.ts       # Authentication
│   │   │   ├── httpClient.ts        # HTTP client setup with interceptors
│   │   │   ├── errorHandler.ts      # Global error handling
│   │   │   └── loggingService.ts    # Logging setup
│   │   │
│   │   ├── guards/                  # Route guards
│   │   │   ├── authGuard.ts         # Ensure user is logged in
│   │   │   ├── adminGuard.ts        # Ensure user is admin
│   │   │   └── unsavedChangesGuard.ts
│   │   │
│   │   ├── interceptors/            # HTTP interceptors
│   │   │   ├── authInterceptor.ts   # Add auth token to requests
│   │   │   └── errorInterceptor.ts  # Handle errors globally
│   │   │
│   │   ├── models/                  # App-wide types
│   │   │   ├── User.ts
│   │   │   ├── AuthState.ts
│   │   │   └── ApiResponse.ts
│   │   │
│   │   └── hooks/                   # App-wide custom hooks
│   │       ├── useAuth.ts
│   │       └── useAppConfig.ts
│   │
│   ├── shared/                      # Reusable components, pipes, utilities used across features
│   │   ├── components/              # Shared UI components (buttons, cards, modals, etc.)
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   ├── LoadingSpinner/
│   │   │   └── ErrorBoundary/
│   │   │
│   │   ├── layout/                  # Layout components
│   │   │   ├── MainLayout.tsx       # Main layout with header, sidebar
│   │   │   ├── PageLayout.tsx       # Standard page container
│   │   │   └── MainLayout.scss
│   │   │
│   │   ├── pipes/                   # Utility pipes/filters (Angular) or functions (React)
│   │   │   ├── formatDate.ts
│   │   │   └── formatCurrency.ts
│   │   │
│   │   ├── directives/              # (Angular) Reusable directives
│   │   │
│   │   └── utils/                   # Utility functions
│   │       ├── api.ts               # API helper functions
│   │       ├── string.ts            # String utilities
│   │       └── validation.ts        # Form validation helpers
│   │
│   ├── store/                       # Global state management setup
│   │   ├── store.ts                 # Redux store configuration
│   │   ├── rootReducer.ts           # Root reducer combining feature slices
│   │   ├── hooks.ts                 # Typed useAppDispatch, useAppSelector
│   │   └── types.ts                 # RootState, AppDispatch types
│   │
│   ├── routes/                      # Global routing setup
│   │   └── routes.tsx               # Main route definitions
│   │
│   ├── styles/                      # Global styles
│   │   ├── index.scss               # Global imports and entry point
│   │   ├── _variables.scss          # Design tokens, colors, spacing
│   │   ├── _mixins.scss             # Reusable SCSS mixins
│   │   ├── _reset.scss              # CSS reset
│   │   └── _utilities.scss          # Utility classes
│   │
│   ├── config/                      # Configuration files
│   │   ├── environment.ts           # Environment-specific config
│   │   ├── theme.ts                 # Theme/styling constants
│   │   └── constants.ts             # App-wide constants
│   │
│   ├── i18n/                        # Internationalization
│   │   ├── i18n.ts                  # i18n setup
│   │   └── locales/                 # Translation files
│   │       ├── en.json              # English translations
│   │       ├── es.json              # Spanish translations
│   │       └── [other languages...]
│   │
│   └── assets/                      # Non-code assets
│       ├── images/
│       ├── icons/
│       └── fonts/
│
├── tests/                           # Test files (if not colocated with source)
│   ├── e2e/                         # End-to-end tests
│   │   ├── login.spec.ts
│   │   └── ticketWorkflow.spec.ts
│   │
│   └── integration/                 # Integration tests
│       └── api.integration.ts
│
├── .github/                         # GitHub-specific files
│   └── workflows/                   # GitHub Actions CI/CD
│       ├── build.yml
│       ├── test.yml
│       └── deploy.yml
│
├── docs/                            # Project documentation
│   ├── ARCHITECTURE.md              # Architecture overview
│   ├── CONTRIBUTING.md              # Contribution guidelines
│   └── [other docs]
│
├── .gitignore
├── .prettierrc                      # Code formatting
├── .eslintrc                        # Linting rules
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies and scripts
├── package-lock.json
├── README.md                        # Project overview
└── [Build config files: webpack.config.js, vite.config.ts, etc.]
```

### 3.2 Naming Conventions

<!-- Document exact naming conventions so generated code matches the project's style. -->

| Artifact Type            | Convention           | Example                             |
|--------------------------|----------------------|-------------------------------------|
| Component files          | PascalCase           | `UserProfile.tsx`, `LoginForm.tsx`  |
| Component classes        | PascalCase           | `class UserProfile extends React.Component` |
| Service files            | camelCase            | `userService.ts`, `authService.ts`  |
| Redux slices             | camelCase            | `usersSlice.ts`, `authSlice.ts`     |
| Actions                  | camelCase            | `fetchUsers`, `setSelectedUser`     |
| Selectors                | camelCase            | `selectUsers`, `selectIsLoading`    |
| Custom hooks             | camelCase, prefix with `use` | `useAuth`, `useFetchTickets` |
| Utility functions        | camelCase            | `formatDate`, `validateEmail`       |
| Constants                | UPPER_SNAKE_CASE     | `MAX_UPLOAD_SIZE`, `API_TIMEOUT`    |
| CSS classes              | kebab-case           | `.user-profile`, `.btn-primary`     |
| SCSS variables           | kebab-case with prefix | `$app-primary-color`, `$spacing-md` |
| File names (generic)     | kebab-case or PascalCase for components | `user-profile.scss`, `UserProfile.tsx` |
| Test files               | [source-file].test.ts | `UserProfile.test.tsx`              |
| Environment files        | .env.[environment]   | `.env.local`, `.env.production`     |

### 3.3 Module and Dependency Registration

<!-- How to import and use dependencies. Show exact patterns. -->

**Importing Framework Components and Services:**

```typescript
// Example: Importing a service
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUsers, selectUsers, selectIsLoading } from '@/store/slices/usersSlice';

// Example: Importing a shared component
import Button from '@/shared/components/Button/Button';
import { MainLayout } from '@/shared/layout/MainLayout';

// Example: Importing utilities
import { formatDate, validateEmail } from '@/shared/utils';

// Example: Importing feature-specific components
import { TicketCard } from '@/features/tickets/components/TicketCard';
```

**Creating a New Component (Template):**

```typescript
// src/features/[feature]/components/[ComponentName]/[ComponentName].tsx
import React from 'react';
import styles from './[ComponentName].module.scss';

interface [ComponentName]Props {
  // Define your props here
  prop1: string;
  prop2?: number;
  onAction?: (value: any) => void;
}

const [ComponentName]: React.FC<[ComponentName]Props> = ({
  prop1,
  prop2,
  onAction,
}) => {
  return (
    <div className={styles.container}>
      {/* Component content */}
    </div>
  );
};

export default [ComponentName];
```

---

# Part 2 — Architecture

---

## 4. Architecture and Design Patterns

### 4.1 High-Level Architecture

<!-- ASCII diagram showing how major components connect. -->

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser / SPA                         │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              React / App Component                  │   │
│  │                                                     │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │         Redux Store (Global State)           │   │   │
│  │  │  ├── auth (user, token, permissions)         │   │   │
│  │  │  ├── users (list, selected, filters)         │   │   │
│  │  │  ├── tickets (list, detail, form state)      │   │   │
│  │  │  └── ui (modals, notifications, theme)       │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │                      ▲                               │   │
│  │                      │ (dispatch actions)            │   │
│  │                      │                               │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │       Router (React Router v6)               │   │   │
│  │  │  ├── /dashboard                              │   │   │
│  │  │  ├── /tickets (protected)                    │   │   │
│  │  │  ├── /users (admin only)                     │   │   │
│  │  │  └── /login                                  │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │           │                                          │   │
│  │           ▼                                          │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │   Feature Components (Dashboard, Tickets)    │   │   │
│  │  │   ├── Connect to Redux via hooks             │   │   │
│  │  │   ├── Call services for API requests         │   │   │
│  │  │   └── Dispatch actions on user interaction   │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                      ▲                                      │
│                      │ (HTTP API calls)                     │
└──────────────────────┼──────────────────────────────────────┘
                       │
                       ▼
           ┌──────────────────────────┐
           │    Backend API Server    │
           │  (REST endpoints)        │
           └──────────────────────────┘
```

### 4.2 Data Flow

<!-- Describe how data flows through the app, from API to UI. -->

**Typical User Action → API Call → State Update → UI Rerender:**

1. **User interaction** (e.g., clicks "Create Ticket" button)
2. **Component dispatches Redux action** (e.g., `fetchTickets()`)
3. **Action creator calls API service** (e.g., `ticketService.createTicket()`)
4. **HTTP client sends request** (authenticated via interceptor)
5. **API response received** by HTTP client
6. **HTTP interceptor handles** response (check for 401, format response, etc.)
7. **Redux reducer updates state** with new ticket
8. **Component re-renders** with updated state
9. **UI shows new ticket** in the list

### 4.3 Key Design Patterns

**Pattern 1: [Name, e.g., "Container / Presentational Components"]**
- **What:** [Explanation of the pattern]
- **How it's used:** [Where in the app you'll find it]
- **Example:** [Code example or specific component]

**Pattern 2: [Name]**
- **What:** [Explanation]
- **How it's used:** [Where]
- **Example:** [Code example]

<!-- Add more patterns as needed -->

---

## 5. Routing and Navigation

### 5.1 Route Configuration

<!-- Complete list of every route. Include path, component, guards, and purpose. -->

**Top-Level Routes:**

| Path         | Component        | Requires Auth | Requires Role  | Purpose                            |
|--------------|------------------|---------------|----------------|------------------------------------|
| `/`          | Dashboard        | Yes           | Any            | Main dashboard view                |
| `/login`     | LoginPage        | No            | None           | Login page                         |
| `/logout`    | (redirect)       | Yes           | Any            | Logout and redirect to login       |
| `/tickets`   | TicketListPage   | Yes           | User+          | List all tickets                   |
| `/tickets/:id` | TicketDetailPage | Yes           | User+          | View single ticket                 |
| `/users`     | UserListPage     | Yes           | Admin          | User management (admin only)       |
| `/settings`  | SettingsPage     | Yes           | Any            | User settings                      |
| `/*`         | NotFoundPage     | No            | None           | 404 page for undefined routes      |

**Route Configuration Code:**

```typescript
// src/routes/routes.tsx
import { createBrowserRouter } from 'react-router-dom';
import Dashboard from '@/features/dashboard/pages/Dashboard';
import LoginPage from '@/features/auth/pages/LoginPage';
import TicketListPage from '@/features/tickets/pages/TicketListPage';
import { authGuard, adminGuard } from '@/core/guards';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
    loader: authGuard, // Requires authentication
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/tickets',
    element: <TicketListPage />,
    loader: authGuard,
  },
  // More routes...
]);
```

### 5.2 Navigation Guards and Protection

<!-- Explain which routes require authentication, role checks, etc. -->

**Authentication Guard (`authGuard`):**
- **Applied to:** All routes except `/login`
- **Behavior:** If user is not authenticated, redirects to `/login`
- **Token validation:** Checks if stored token is valid; refreshes if needed

**Admin Guard (`adminGuard`):**
- **Applied to:** `/users`, and admin-only feature routes
- **Behavior:** If user role is not 'admin', redirects to dashboard
- **Note:** Applied AFTER `authGuard`

**Unsaved Changes Guard:**
- **Applied to:** Routes that have forms (e.g., `/tickets/create`, `/users/:id/edit`)
- **Behavior:** Prompts user to confirm before leaving if there are unsaved changes

### 5.3 Route Parameters and Query Strings

**Path Parameters (in route path):**

| Route | Parameter | Type | Example | Purpose |
|-------|-----------|------|---------|---------|
| `/tickets/:id` | `id` | string (UUID) | `/tickets/123e4567-e89b` | Identifies which ticket to view |
| `/users/:id` | `id` | string (number) | `/users/42` | Identifies which user to edit |

**Query String Parameters (in URL search):**

| Parameter | Type | Example | Purpose |
|-----------|------|---------|---------|
| `page` | number | `?page=2` | Pagination — which page of results to show |
| `sort` | string | `?sort=created_at:desc` | Sort order for lists |
| `filter` | string | `?filter=status:open` | Filter results |
| `redirect` | string | `?redirect=/tickets` | Where to go after login |

**Example:**
```
/tickets?page=2&sort=created_at:desc&filter=status:open
```

---

## 6. State Management

### 6.1 State Architecture

<!-- Describe the state management approach and structure. -->

**Approach:** [Redux / Vuex / Context / Zustand / MobX / other]

**Explanation:** [Why this was chosen, benefits, trade-offs]

**Root State Shape:**

```typescript
// src/store/types.ts
export interface RootState {
  auth: AuthState;           // User authentication and permissions
  users: UsersState;         // User management data
  tickets: TicketsState;     // Tickets management data
  ui: UIState;               // UI state (modals, notifications, theme)
  filters: FiltersState;     // Applied filters and search
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface TicketsState {
  list: Ticket[];
  selectedId: string | null;
  isLoading: boolean;
  error: string | null;
  pagination: { page: number; total: number };
}

// [Define other slices...]
```

### 6.2 State Slices / Modules

**Redux Slices:**

| Slice          | Purpose                                      | Key State        | Key Actions      |
|----------------|----------------------------------------------|------------------|------------------|
| `auth`         | Authentication, user info, token             | user, token, isAuthenticated | login, logout, refreshToken |
| `users`        | Users list, selected user                    | list, selectedId | fetchUsers, selectUser, updateUser |
| `tickets`      | Tickets list, detail, form state            | list, selectedId | fetchTickets, createTicket, updateTicket |
| `ui`           | Modals, toasts, theme                       | modals, toasts, theme | openModal, closeModal, showToast |
| `filters`      | Active filters and search terms             | activeFilters    | setFilter, clearFilters |

**Slice Definition Example (Redux):**

```typescript
// src/store/slices/ticketsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async (params: FetchParams, { rejectWithValue }) => {
    try {
      const response = await ticketService.getTickets(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState: TicketsState = {
  list: [],
  selectedId: null,
  isLoading: false,
  error: null,
};

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    selectTicket: (state, action: PayloadAction<string>) => {
      state.selectedId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { selectTicket } = ticketsSlice.actions;
export default ticketsSlice.reducer;
```

### 6.3 Accessing State in Components

**Using Redux Hooks:**

```typescript
// In a component
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectTickets, selectIsLoading, fetchTickets } from '@/store/slices/ticketsSlice';

const TicketList: React.FC = () => {
  const dispatch = useAppDispatch();
  const tickets = useAppSelector(selectTickets);
  const isLoading = useAppSelector(selectIsLoading);

  React.useEffect(() => {
    dispatch(fetchTickets({ page: 1 }));
  }, [dispatch]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
};
```

---

## 7. Component Architecture

### 7.1 Component Hierarchy

<!-- Show the component tree for the main layout. -->

```
<App>
  ├── <MainLayout>
  │   ├── <Header>
  │   │   ├── <Logo>
  │   │   ├── <Navigation>
  │   │   └── <UserMenu>
  │   ├── <Sidebar>
  │   │   ├── <NavLink> (Dashboard)
  │   │   ├── <NavLink> (Tickets)
  │   │   ├── <NavLink> (Users)
  │   │   └── <NavLink> (Settings)
  │   └── <MainContent>
  │       └── <Router Outlet> → Current Feature
  │
  └── <ModalProvider>
      └── <ToastContainer>
```

### 7.2 Component Documentation Template

<!-- Use this for documenting each major component. -->

**Component: `[ComponentName]`**

- **Location:** `src/features/[feature]/components/[ComponentName]`
- **Purpose:** [One sentence describing what it does]
- **Type:** [Presentational / Container / Layout]

**Props:**

| Prop Name   | Type         | Default | Required | Purpose                              |
|-------------|--------------|---------|----------|--------------------------------------|
| `prop1`     | `string`     | —       | Yes      | What this prop controls              |
| `prop2`     | `number`     | `10`    | No       | What this prop controls              |
| `onAction`  | `() => void` | —       | No       | Callback fired when action happens   |

**State (if applicable):**
- `[stateName]`: [Type and purpose]

**Outputs/Events (if applicable):**
- `onActionName`: Fired when [event] happens. Payload: [type]

**Usage Example:**

```typescript
<[ComponentName]
  prop1="value"
  prop2={20}
  onAction={() => console.log('Action!')}
/>
```

**Edge Cases:**
- [e.g., "If prop1 is empty string, component shows placeholder text."]
- [e.g., "Maximum 100 items in list; longer lists must use pagination."]

---

# Part 3 — Integration

---

## 8. API Integration

### 8.1 API Service Architecture

<!-- How API calls are made and organized. -->

**HTTP Client Setup:**

```typescript
// src/core/services/httpClient.ts
import axios, { AxiosInstance } from 'axios';
import { authInterceptor } from './interceptors/authInterceptor';
import { errorInterceptor } from './interceptors/errorInterceptor';

export const httpClient: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Register interceptors
httpClient.interceptors.request.use(authInterceptor);
httpClient.interceptors.response.use(
  (response) => response,
  errorInterceptor
);

export default httpClient;
```

**Service Organization:**

| Service File | Endpoints | Purpose |
|--------------|-----------|---------|
| `authService.ts` | POST /auth/login, POST /auth/refresh | Authentication |
| `userService.ts` | GET /users, POST /users, PATCH /users/:id | User management |
| `ticketService.ts` | GET /tickets, POST /tickets, PATCH /tickets/:id | Ticket operations |
| [Other service] | [endpoints] | [Purpose] |

### 8.2 API Endpoints Consumed

<!-- Complete list of API calls the app makes. -->

**Authentication:**

```
POST /api/v1/auth/login
├── Request: { email: string; password: string }
├── Response: { token: string; user: User }
└── Errors: 401 Unauthorized, 422 Unprocessable Entity

POST /api/v1/auth/refresh
├── Request: { token: string }
├── Response: { token: string }
└── Errors: 401 Unauthorized

POST /api/v1/auth/logout
├── Request: {}
├── Response: {}
└── Errors: None
```

**Tickets:**

```
GET /api/v1/tickets
├── Query params: page, limit, sort, filter
├── Response: { data: Ticket[]; pagination: { page, total } }
├── Auth: Required (Bearer token)
└── Errors: 401 Unauthorized, 500 Server Error

GET /api/v1/tickets/:id
├── Response: { data: Ticket }
├── Auth: Required
└── Errors: 401, 404 Not Found, 500

POST /api/v1/tickets
├── Request: { title: string; description: string; priority: string }
├── Response: { data: Ticket }
├── Auth: Required
└── Errors: 401, 422 Validation Error, 500

PATCH /api/v1/tickets/:id
├── Request: { [any Ticket field] }
├── Response: { data: Ticket }
├── Auth: Required
└── Errors: 401, 404, 422, 500

DELETE /api/v1/tickets/:id
├── Request: {}
├── Response: {}
├── Auth: Required (admin or creator)
└── Errors: 401, 403 Forbidden, 404, 500
```

<!-- Add more endpoint documentation as needed -->

### 8.3 Error Handling

<!-- How API errors are handled. -->

**Global Error Interceptor:**

```typescript
// src/core/services/interceptors/errorInterceptor.ts
export const errorInterceptor = (error: AxiosError) => {
  const status = error.response?.status;

  switch (status) {
    case 401:
      // Unauthorized — clear auth and redirect to login
      store.dispatch(logout());
      window.location.href = '/login';
      break;

    case 403:
      // Forbidden — user doesn't have permission
      showToast('You do not have permission to perform this action', 'error');
      break;

    case 404:
      // Not found
      showToast('The requested resource was not found', 'error');
      break;

    case 422:
      // Validation error — show field errors
      const errors = error.response?.data?.errors;
      showValidationErrors(errors);
      break;

    case 500:
    case 502:
    case 503:
      // Server error
      showToast('Server error. Please try again later.', 'error');
      // Report to Sentry
      reportError(error);
      break;

    default:
      showToast('An unexpected error occurred', 'error');
  }

  return Promise.reject(error);
};
```

**Component-Level Error Handling:**

```typescript
// Example: Handling API call errors in a component
const handleCreateTicket = async (ticketData) => {
  try {
    const response = await ticketService.createTicket(ticketData);
    showToast('Ticket created successfully', 'success');
    dispatch(addTicket(response.data));
  } catch (error) {
    if (error.response?.status === 422) {
      // Show validation errors
      setFormErrors(error.response.data.errors);
    } else {
      // Generic error already handled by interceptor
      // Do nothing — user already saw the error toast
    }
  }
};
```

---

## 9. Authentication and Authorization

### 9.1 Authentication Flow

<!-- How users log in and how tokens are managed. -->

```
User Login Flow:
1. User enters email + password on /login
2. Component calls authService.login(email, password)
3. API returns JWT token
4. Token stored in Redux state (NOT localStorage — for security)
5. httpClient's authInterceptor attaches token to every request
6. User redirected to dashboard
7. On page reload: check if token is still valid in Redux state

Token Refresh Flow:
1. API returns 401 Unauthorized
2. errorInterceptor intercepts the error
3. Calls authService.refreshToken()
4. New token received and stored in Redux
5. Original request is retried with new token

Logout Flow:
1. User clicks logout button
2. Component dispatches logout() action
3. Token cleared from Redux state
4. User redirected to /login
5. Optional: POST /auth/logout to notify backend
```

**Code Example:**

```typescript
// src/store/slices/authSlice.ts
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      // Token is stored in state, NOT localStorage
      return {
        user: response.data.user,
        token: response.data.token,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
```

### 9.2 Authorization

<!-- Which routes/features require which roles. -->

**Role-Based Access Control (RBAC):**

| Feature / Route | Required Role | Notes |
|-----------------|---------------|-------|
| /dashboard | Any authenticated user | All logged-in users can access |
| /tickets | User or Admin | Support agents and admins |
| /tickets/create | User or Admin | Can create new tickets |
| /users | Admin | User management — admin only |
| /settings | Any authenticated user | Users can change their own settings |

**Authorization Guards:**

```typescript
// src/core/guards/adminGuard.ts
export const adminGuard = async ({ params }) => {
  const state = store.getState();
  const user = state.auth.user;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return null; // Allow navigation
};
```

---

## 10. Error Handling and Logging

### 10.1 Error Handling Strategy

<!-- How different types of errors are handled. -->

**Network Errors:**
- Caught by httpClient error interceptor
- User sees toast notification: "Connection error. Please check your internet."
- Automatic retry for safe operations (GET requests)

**Validation Errors (422):**
- Caught by form submission handler
- Field-level errors displayed next to form inputs
- Example: "Email must be a valid email address"

**Authorization Errors (401):**
- Caught by error interceptor
- Token refresh attempted automatically
- If refresh fails, user redirected to login

**Permission Errors (403):**
- Caught by error interceptor
- User sees: "You do not have permission to perform this action"
- User stays on current page

**Not Found Errors (404):**
- Caught by error interceptor
- User sees: "The requested resource was not found"
- For /tickets/:id routes, redirected to /tickets after delay

**Server Errors (5xx):**
- Caught by error interceptor
- User sees: "Server error. Please try again later."
- Error logged to Sentry for monitoring
- No automatic retry (manual retry only)

### 10.2 Logging

<!-- What information is logged and where. -->

**Error Logging:**
- All unhandled errors logged to Sentry
- Sentry configuration: [environment] dashboard at [URL]
- Local development: errors logged to console

**API Call Logging:**
- Request/response details logged only in development (via httpClient interceptor)
- Production: errors only (handled by error interceptor)

**User Action Logging:**
- Login/logout events logged to backend audit trail
- User edits/creates/deletes logged to backend (for compliance)
- Optional: Google Analytics for user behavior tracking

---

# Part 4 — Styling and Theming

---

## 11. Styling and Design System

### 11.1 Styling Approach

- **Technology:** [e.g., "SCSS with CSS Modules", "Styled Components", "Tailwind CSS"]
- **Component styles:** [e.g., "CSS Modules for component-scoped styles", "scoped via BEM naming"]
- **Global styles:** [e.g., "Global variables and reset in styles/index.scss"]

**File Organization:**

```
src/styles/
├── index.scss           # Global imports — loads reset, variables, utilities
├── _reset.scss          # CSS reset (remove defaults)
├── _variables.scss      # Design tokens (colors, spacing, typography)
├── _mixins.scss         # Reusable SCSS mixins
└── _utilities.scss      # Utility classes (.flex, .hidden, etc.)

src/features/[feature]/components/[Component]/
└── [Component].module.scss  # Component-scoped styles

src/shared/components/[Component]/
└── [Component].module.scss  # Shared component styles
```

### 11.2 Design Tokens

<!-- Complete list of colors, spacing, typography, etc. -->

**Color Palette:**

```scss
// src/styles/_variables.scss

// Primary Colors
$color-primary: #007bff;
$color-primary-light: #0d6efd;
$color-primary-dark: #0c63e4;

// Semantic Colors
$color-success: #198754;
$color-warning: #ffc107;
$color-danger: #dc3545;
$color-info: #0dcaf0;

// Neutral Colors
$color-text-primary: #212529;
$color-text-secondary: #6c757d;
$color-text-light: #999;
$color-background: #ffffff;
$color-background-secondary: #f8f9fa;
$color-border: #dee2e6;

// Status Colors
$color-error: #dc3545;
$color-success: #198754;
$color-warning: #ffc107;
$color-info: #0dcaf0;
```

**Spacing Scale:**

```scss
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-xxl: 48px;
```

**Typography:**

```scss
$font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
$font-family-mono: 'SF Mono', 'Monaco', 'Courier New', monospace;

$font-size-xs: 12px;
$font-size-sm: 14px;
$font-size-md: 16px;
$font-size-lg: 18px;
$font-size-xl: 20px;
$font-size-2xl: 24px;

$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-bold: 700;

$line-height-tight: 1.2;
$line-height-normal: 1.5;
$line-height-relaxed: 1.75;
```

**Borders and Radii:**

```scss
$border-radius-sm: 4px;
$border-radius-md: 8px;
$border-radius-lg: 12px;
$border-radius-full: 9999px;

$border-width: 1px;
$border-color: $color-border;
```

**Shadows:**

```scss
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.15);
```

**Z-Index Scale:**

```scss
$z-index-dropdown: 1000;
$z-index-sticky: 1100;
$z-index-modal-backdrop: 1200;
$z-index-modal: 1300;
$z-index-toast: 1400;
$z-index-tooltip: 1500;
```

### 11.3 Responsive Breakpoints

<!-- How the app adapts to different screen sizes. -->

```scss
$breakpoint-xs: 320px;   // Mobile (extra small)
$breakpoint-sm: 640px;   // Mobile landscape
$breakpoint-md: 768px;   // Tablet
$breakpoint-lg: 1024px;  // Desktop
$breakpoint-xl: 1280px;  // Large desktop

// Mixins for media queries
@mixin mobile-only {
  @media (max-width: ($breakpoint-sm - 1)) {
    @content;
  }
}

@mixin tablet-up {
  @media (min-width: $breakpoint-md) {
    @content;
  }
}

@mixin desktop-up {
  @media (min-width: $breakpoint-lg) {
    @content;
  }
}

// Usage:
.sidebar {
  display: none;

  @include tablet-up {
    display: block;
    width: 250px;
  }
}
```

### 11.4 Using Design Tokens in Components

**SCSS Modules (Component-Scoped):**

```scss
// src/features/tickets/components/TicketCard/TicketCard.module.scss
@import '@/styles/variables';

.card {
  padding: $spacing-md;
  background-color: $color-background;
  border: $border-width solid $color-border;
  border-radius: $border-radius-md;
  box-shadow: $shadow-md;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: $shadow-lg;
  }

  @include mobile-only {
    padding: $spacing-sm;
  }
}

.title {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $color-text-primary;
  margin-bottom: $spacing-sm;
}

.status {
  display: inline-block;
  padding: $spacing-xs $spacing-sm;
  border-radius: $border-radius-sm;
  font-size: $font-size-sm;

  &.open {
    background-color: $color-info;
    color: white;
  }

  &.closed {
    background-color: $color-success;
    color: white;
  }
}
```

**In TypeScript Components:**

```typescript
import styles from './TicketCard.module.scss';

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{ticket.title}</h2>
      <span className={`${styles.status} ${styles[ticket.status.toLowerCase()]}`}>
        {ticket.status}
      </span>
    </div>
  );
};
```

### 11.5 Styling Do's and Don'ts

- **DO:** Use design tokens from `_variables.scss` for all colors, spacing, fonts
- **DO:** Use CSS Modules for component-scoped styles
- **DO:** Use responsive mixins for mobile/tablet/desktop breakpoints
- **DO:** Keep component styles in the component folder
- **DO NOT:** Hardcode colors or dimensions — always use tokens
- **DO NOT:** Use `!important` — indicates specificity issues
- **DO NOT:** Override global styles at the component level — use scoped styles
- **DO NOT:** Skip mobile styles — assume all layouts must work on all breakpoints

---

# Part 5 — Features and Workflows

---

## 12. Forms and Validation

### 12.1 Form Handling Approach

<!-- How forms are structured and submitted. -->

- **Form Library:** [e.g., "React Hook Form", "Formik", "custom useState"]
- **Validation:** [e.g., "Zod schema validation", "manual validation", "server-side validation"]
- **Approach:** [Uncontrolled / controlled components, how data flows]

**Form Structure:**

```typescript
// Example form using React Hook Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ticketSchema } from './ticketSchema';

const TicketForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ticketSchema),
    mode: 'onBlur', // Validate on blur, not on every keystroke
  });

  const onSubmit = async (data) => {
    try {
      const response = await ticketService.createTicket(data);
      showToast('Ticket created successfully', 'success');
      // Redirect or refresh
    } catch (error) {
      // Error already handled by httpClient interceptor
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} placeholder="Title" />
      {errors.title && <span className="error">{errors.title.message}</span>}

      <textarea {...register('description')} placeholder="Description" />
      {errors.description && <span className="error">{errors.description.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Ticket'}
      </button>
    </form>
  );
};
```

### 12.2 Validation Rules

<!-- What validation is performed and where. -->

**Ticket Creation Validation:**

| Field | Type | Rules | Error Message |
|-------|------|-------|---------------|
| title | string | Required, 3-200 chars | "Title is required and must be 3-200 characters" |
| description | string | Required, 10-5000 chars | "Description must be 10-5000 characters" |
| priority | enum | One of: low, medium, high | "Invalid priority" |
| assignee_id | string | Optional, valid UUID | "Invalid assignee" |

**Client-Side vs. Server-Side:**
- **Client-side:** Format validation, required fields, length checks (fast feedback)
- **Server-side:** Business logic validation, uniqueness checks, authorization (source of truth)

---

## 13. Feature Modules

### 13.1 Dashboard Feature

**Routes:**
- `GET /` → Dashboard page

**Components:**
- `DashboardPage` — Main dashboard layout
  - `DashboardWidget` — Reusable widget components
  - `StatCard` — Shows a metric (tickets open, users active, etc.)

**State:**
- `dashboard` slice in Redux
  - `widgets`: WidgetData[]
  - `isLoading`: boolean

**API Calls:**
- `GET /api/v1/dashboard/stats` — Fetch dashboard statistics

---

### 13.2 Tickets Feature

**Routes:**
- `GET /tickets` → Ticket list page
- `GET /tickets/:id` → Ticket detail page
- `GET /tickets/create` → Create ticket form

**Components:**
- `TicketListPage` → Lists all tickets with filters and pagination
  - `TicketCard` → Individual ticket in the list
  - `TicketFilters` → Filter controls
  - `TicketPagination` → Pagination controls
- `TicketDetailPage` → Shows full ticket details and comments
  - `TicketHeader` → Ticket title, status, priority
  - `TicketComments` → Discussion thread
  - `CommentForm` → Add new comment
- `CreateTicketPage` → Create ticket form
  - `TicketForm` → Reusable form component

**State:**
- `tickets` slice in Redux
  - `list`: Ticket[]
  - `selectedId`: string | null
  - `isLoading`: boolean
  - `filters`: { status: string; priority: string; ... }
  - `pagination`: { page: number; total: number }

**API Calls:**
- `GET /api/v1/tickets` — List tickets
- `GET /api/v1/tickets/:id` — Get single ticket
- `POST /api/v1/tickets` — Create ticket
- `PATCH /api/v1/tickets/:id` — Update ticket
- `DELETE /api/v1/tickets/:id` — Delete ticket
- `POST /api/v1/tickets/:id/comments` — Add comment

**Typical User Workflow:**
1. User navigates to `/tickets`
2. TicketListPage loads and dispatches `fetchTickets()`
3. List displays with filters
4. User clicks on a ticket
5. Routes to `/tickets/:id`
6. TicketDetailPage loads and dispatches `fetchTicketById()`
7. Detail page displays ticket + comments
8. User can add comment or update ticket

---

# Part 6 — Cross-Cutting Concerns

---

## 14. Internationalization (i18n)

### 14.1 i18n Setup

<!-- How translations are implemented. -->

- **Library:** [e.g., "react-i18next"]
- **Supported Languages:** English (en), Spanish (es), French (fr)
- **Translation Files:** Located in `src/i18n/locales/`

**Configuration:**

```typescript
// src/i18n/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    es: { translation: esTranslations },
  },
  lng: localStorage.getItem('language') || 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
```

### 14.2 Using Translations in Components

```typescript
import { useTranslation } from 'react-i18next';

const TicketCard: React.FC = ({ ticket }) => {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{ticket.title}</h2>
      <p>{t('common.status')}: {ticket.status}</p>
      <button>{t('common.edit')}</button>
    </div>
  );
};
```

### 14.3 Translation Keys

| Key | English | Spanish | Usage |
|-----|---------|---------|-------|
| `common.status` | Status | Estado | In ticket cards, lists |
| `common.edit` | Edit | Editar | Button labels |
| `tickets.create` | Create Ticket | Crear Ticket | Form heading |
| [key] | [en] | [es] | [usage] |

---

## 15. Accessibility

### 15.1 Accessibility Features

<!-- What a11y features are implemented. -->

- **ARIA Labels:** All interactive elements have `aria-label` or `aria-labelledby`
- **Keyboard Navigation:** All features fully keyboard accessible (Tab, Enter, Escape)
- **Focus Management:** Focus visible, focus trapped in modals
- **Semantic HTML:** Proper `<button>`, `<a>`, `<form>` elements
- **Color Contrast:** All text meets WCAG AA standards (4.5:1 for body text)
- **Screen Reader Testing:** Tested with NVDA and JAWS

### 15.2 ARIA Attributes

**Buttons:**
```html
<button aria-label="Close modal">×</button>
```

**Forms:**
```html
<label htmlFor="email">Email</label>
<input id="email" type="email" aria-required="true" />
```

**Regions:**
```html
<main aria-label="Main content">...</main>
<aside aria-label="Navigation">...</aside>
```

---

## 16. Performance Patterns

### 16.1 Code Splitting

<!-- How the app splits code to reduce initial bundle. -->

- **Route-Based:** Each feature is lazy-loaded when route is visited
- **Component-Based:** Heavy components (modals, charts) lazy-loaded

**Implementation:**

```typescript
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/shared/components';

const TicketDetailPage = lazy(() =>
  import('@/features/tickets/pages/TicketDetailPage')
);

// In route definition:
{
  path: '/tickets/:id',
  element: (
    <Suspense fallback={<LoadingSpinner />}>
      <TicketDetailPage />
    </Suspense>
  ),
}
```

### 16.2 Memoization

<!-- When and how to use memoization. -->

- **Components:** Use `React.memo()` for expensive presentational components
- **Selectors:** Use `reselect` for selector memoization in Redux
- **Functions:** Use `useCallback` for event handlers passed to memoized children

---

## 17. Security Implementation

### 17.1 Security Practices

- **Token Storage:** JWT tokens stored in Redux state (NOT localStorage) — cleared on logout
- **CORS:** API configured to accept requests from app domain only
- **HTTPS:** App and API use HTTPS in production
- **XSS Prevention:** All user input sanitized before display
- **CSRF Protection:** [If applicable — double-submit cookie, SameSite, token-based]

### 17.2 Sensitive Data Handling

- **Passwords:** Never logged or displayed
- **Tokens:** Never logged in console
- **PII:** Treated as sensitive; logged only to secure backend
- **Forms:** Sensitive fields (password, credit card) don't autofill

---

# Part 7 — Quality and Maintenance

---

## 18. Testing Strategy

### 18.1 Testing Approach

<!-- How the app is tested. -->

- **Unit Tests:** Services, utilities, reducers (80%+ coverage recommended)
- **Component Tests:** Presentational components with React Testing Library
- **Integration Tests:** Feature workflows (multiple components + API calls)
- **E2E Tests:** User workflows across entire app with Playwright

**Test Framework Stack:**
- Unit/Component: Jest + React Testing Library
- E2E: Playwright
- Coverage Threshold: 80% for business logic, 60% overall

### 18.2 Running Tests

```bash
# Run all tests in watch mode
npm test

# Run specific test file
npm test -- TicketCard.test.tsx

# Run with coverage report
npm test -- --coverage

# Run E2E tests
npm run e2e

# Run E2E in UI mode
npm run e2e -- --ui
```

### 18.3 Testing Examples

**Service Unit Test:**

```typescript
// src/features/tickets/services/ticketService.test.ts
import { ticketService } from './ticketService';
import httpClient from '@/core/services/httpClient';

jest.mock('@/core/services/httpClient');

describe('ticketService', () => {
  it('should fetch tickets with pagination', async () => {
    const mockResponse = {
      data: [{ id: '1', title: 'Test' }],
      pagination: { page: 1, total: 1 },
    };
    httpClient.get.mockResolvedValue({ data: mockResponse });

    const result = await ticketService.getTickets({ page: 1, limit: 10 });

    expect(result).toEqual(mockResponse);
    expect(httpClient.get).toHaveBeenCalledWith('/tickets', {
      params: { page: 1, limit: 10 },
    });
  });
});
```

**Component Test:**

```typescript
// src/features/tickets/components/TicketCard/TicketCard.test.tsx
import { render, screen } from '@testing-library/react';
import TicketCard from './TicketCard';

describe('TicketCard', () => {
  it('should display ticket title and status', () => {
    const ticket = { id: '1', title: 'Test Ticket', status: 'open' };
    render(<TicketCard ticket={ticket} />);

    expect(screen.getByText('Test Ticket')).toBeInTheDocument();
    expect(screen.getByText('open')).toBeInTheDocument();
  });

  it('should call onEdit when edit button clicked', () => {
    const ticket = { id: '1', title: 'Test Ticket', status: 'open' };
    const onEdit = jest.fn();
    render(<TicketCard ticket={ticket} onEdit={onEdit} />);

    screen.getByRole('button', { name: /edit/i }).click();

    expect(onEdit).toHaveBeenCalledWith(ticket.id);
  });
});
```

---

## 19. Build and Deployment

### 19.1 Build Process

```bash
# Create optimized production build
npm run build

# Output: dist/ folder with:
# - Minified JavaScript
# - Optimized images
# - Source maps (for debugging in production)
# - Static assets

# Build size analysis (optional)
npm run build -- --analyze
```

**Build Output:**

| File | Size | Purpose |
|------|------|---------|
| `main.[hash].js` | ~250KB | Main application code |
| `vendor.[hash].js` | ~150KB | Third-party libraries |
| `styles.[hash].css` | ~50KB | Global and component styles |
| `index.html` | ~2KB | HTML entry point |

### 19.2 Deployment Environments

**Development:**
- URL: http://localhost:3000
- API: http://localhost:3001
- Build: `npm start` (watch mode, sourcemaps)

**Staging:**
- URL: https://staging-app.company.com
- API: https://api-staging.company.com
- Build: Production build, deployed to staging bucket/server

**Production:**
- URL: https://app.company.com
- API: https://api.company.com
- Build: Production build, deployed to CDN + S3 + CloudFront

**Deployment Process:**

1. Developer pushes code to GitHub
2. CI/CD pipeline (GitHub Actions) runs:
   - Install dependencies
   - Lint and format checks
   - Run tests (unit + E2E)
   - Build production bundle
   - Upload to S3 (staging/production based on branch)
   - Invalidate CloudFront cache
3. App is live

---

## 20. Anti-Patterns

### 20.1 Common Mistakes to Avoid

**Anti-Pattern 1: Storing Large Objects in Redux**
- **Problem:** Every state change triggers a re-render of every connected component
- **Solution:** Normalize state, store only IDs in lists, use selectors to join
- **Example:**
  ```typescript
  // WRONG
  const state = { tickets: { 'id1': { id, title, description, ... 100 fields } } };

  // RIGHT
  const state = {
    tickets: { byId: { 'id1': { id, title } }, allIds: ['id1'] },
    ticketDetails: { 'id1': { full 100-field object } },
  };
  ```

**Anti-Pattern 2: Calling API on Every Render**
- **Problem:** Infinite requests, server overload
- **Solution:** Use `useEffect` with dependency array, cache results
- **Example:**
  ```typescript
  // WRONG
  const tickets = await ticketService.getTickets(); // Called every render!

  // RIGHT
  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);
  ```

**Anti-Pattern 3: Not Handling Loading/Error States**
- **Problem:** Users see outdated data while loading, don't know if it failed
- **Solution:** Always show loading spinner and error message
- **Example:**
  ```typescript
  // WRONG
  const TicketList = () => <div>{tickets.map(...)}</div>;

  // RIGHT
  const TicketList = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    return <div>{tickets.map(...)}</div>;
  };
  ```

**Anti-Pattern 4: Coupling Components to Routing**
- **Problem:** Hard to test, hard to reuse, hard to nest
- **Solution:** Pass data as props, keep routing separate
- **Example:**
  ```typescript
  // WRONG
  const TicketDetail = () => {
    const { id } = useParams();
    const ticket = useSelector(selectTicket(id)); // Couples component to routing
  };

  // RIGHT
  const TicketDetail: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
    return <div>{ticket.title}</div>;
  };
  ```

**Anti-Pattern 5: Inline Styles or Hardcoded Values**
- **Problem:** Hard to maintain, inconsistent design, hard to change theme
- **Solution:** Always use design tokens
- **Example:**
  ```typescript
  // WRONG
  <div style={{ color: '#007bff', padding: '16px' }}>

  // RIGHT
  <div className={styles.container}>
  // In CSS Module: color: $color-primary; padding: $spacing-md;
  ```

---

# Part 8 — Reference

---

## 21. Troubleshooting

### 21.1 Common Issues and Solutions

**Issue: Blank page after build**
- Cause: Missing base URL or asset paths
- Solution: Check `.env` variables, verify `PUBLIC_URL` if needed

**Issue: State not updating after API call**
- Cause: Action not dispatched, or reducer not handling action
- Solution: Check Redux DevTools, verify action type matches

**Issue: Infinite loading spinner**
- Cause: API call not completing (error or hanging)
- Solution: Check network tab, verify API endpoint is working

**Issue: Form validation errors not showing**
- Cause: Validation schema doesn't match form fields
- Solution: Check Zod/Yup schema vs form field names

**Issue: Styles not applying to component**
- Cause: CSS Module not imported, class name mismatch
- Solution: Check import, verify `className={styles.name}` matches SCSS

---

## 22. Glossary

<!-- Define key terms and acronyms. -->

| Term | Definition |
|------|-----------|
| **SPA** | Single Page Application — app loads once, then updates DOM without page reload |
| **Redux** | State management library — centralized store for application state |
| **Slice** | Redux slice — contains reducers, actions, and selectors for one piece of state |
| **Selector** | Redux selector — function to extract state from store |
| **Reducer** | Pure function that takes state and action, returns new state |
| **Action** | Object describing what happened; dispatched to trigger state change |
| **Thunk** | Async action in Redux; allows side effects (API calls) |
| **Lazy Loading** | Loading code/data only when needed, not upfront |
| **Code Splitting** | Dividing JavaScript into chunks loaded on-demand |
| **ARIA** | Accessible Rich Internet Applications — attributes for accessibility |
| **i18n** | Internationalization — support for multiple languages |
| **HTTP Interceptor** | Middleware that intercepts all HTTP requests/responses |
| **Guard** | Function that determines if a route can be accessed |
| **Guard** | Function that determines if a route can be accessed |
| [Term] | [Definition] |

---

## 23. Quick Reference

### 23.1 Command Cheat Sheet

```bash
# Development
npm start                    # Start dev server with hot reload
npm test                     # Run tests in watch mode
npm run lint                 # Check code style
npm run format               # Auto-fix code style

# Production
npm run build                # Create optimized build
npm run build -- --analyze   # Analyze bundle size

# Testing
npm test -- TicketCard.test  # Run specific test
npm test -- --coverage       # Show coverage report
npm run e2e                  # Run E2E tests
npm run e2e -- --ui          # Run E2E with UI

# Other
npm run type-check           # TypeScript checking
npm install                  # Install dependencies
npm outdated                 # Check for outdated packages
```

### 23.2 Component Development Checklist

When creating a new component:

- [ ] Create component file and styles file in appropriate folder
- [ ] Define prop types as TypeScript interface
- [ ] Write component with JSDoc comments
- [ ] Use design tokens for all colors, spacing, fonts
- [ ] Make component responsive (mobile-first)
- [ ] Add ARIA attributes for accessibility
- [ ] Write unit tests (at least happy path + error case)
- [ ] Document in this guide if it's a new shared component

### 23.3 Feature Development Checklist

When creating a new feature:

- [ ] Create feature folder in `src/features/[name]/`
- [ ] Create routes, pages, components folders
- [ ] Define Redux slice (state, reducers, actions, selectors)
- [ ] Create API service methods in service file
- [ ] Create page components
- [ ] Create reusable feature components
- [ ] Add internationalization keys for all user-facing text
- [ ] Write tests (unit + integration)
- [ ] Add error handling and loading states
- [ ] Document the feature in this guide
- [ ] Review for accessibility, performance, security

---

## 24. Appendix A: Architecture Diagram

<!-- Complete visual representation of the application architecture. -->

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Browser                         │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React Application                      │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │           React Router (Client-side routing)        │ │  │
│  │  │  ├── /login                                         │ │  │
│  │  │  ├── / → /dashboard (AuthGuard)                     │ │  │
│  │  │  ├── /tickets → /tickets/:id (AuthGuard)            │ │  │
│  │  │  ├── /users (AdminGuard)                            │ │  │
│  │  │  └── /* → 404                                       │ │  │
│  │  └─────────────┬───────────────────────────────────────┘ │  │
│  │               │                                           │  │
│  │               ▼                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │            Feature Components                       │ │  │
│  │  │  (Dashboard, Tickets, Users, Settings)              │ │  │
│  │  │                                                     │ │  │
│  │  │  ├── Connect to Redux Store via hooks              │ │  │
│  │  │  ├── Dispatch actions on user interaction          │ │  │
│  │  │  ├── Call services for API calls                   │ │  │
│  │  │  └── Show loading/error states                     │ │  │
│  │  └─────────────┬───────────────────────────────────────┘ │  │
│  │               │                                           │  │
│  │               ▼                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │      Redux Store (Global State Management)          │ │  │
│  │  │                                                     │ │  │
│  │  │  ├── auth (user, token, isAuthenticated)           │ │  │
│  │  │  ├── users (list, selected, isLoading)             │ │  │
│  │  │  ├── tickets (list, detail, filters)               │ │  │
│  │  │  ├── dashboard (stats, widgets)                    │ │  │
│  │  │  └── ui (modals, toasts, theme)                    │ │  │
│  │  └─────────────┬───────────────────────────────────────┘ │  │
│  │               │ (actions/reducers)                       │  │
│  │               ▼                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │           Services (Business Logic)                 │ │  │
│  │  │                                                     │ │  │
│  │  │  ├── authService (login, logout, token refresh)    │ │  │
│  │  │  ├── ticketService (CRUD, comments)               │ │  │
│  │  │  ├── userService (list, update, delete)            │ │  │
│  │  │  ├── httpClient (axios instance + interceptors)    │ │  │
│  │  │  └── errorHandler (logging, user notifications)    │ │  │
│  │  └─────────────┬───────────────────────────────────────┘ │  │
│  │               │ (HTTP requests with auth token)          │  │
│  │  ┌────────────┴─────────────────────────────────────────┐ │  │
│  │  │  Interceptors                                       │ │  │
│  │  │  ├── authInterceptor (add Bearer token)             │ │  │
│  │  │  └── errorInterceptor (handle 401, 403, etc)       │ │  │
│  │  └────────────┬─────────────────────────────────────────┘ │  │
│  │               │                                           │  │
│  │  ┌────────────┴──────────────────────────────────────────┐ │  │
│  │  │  Styling                                             │ │  │
│  │  │  ├── Design tokens (colors, spacing, typography)   │ │  │
│  │  │  ├── CSS Modules (component-scoped styles)         │ │  │
│  │  │  └── Responsive breakpoints (mobile/tablet/desktop) │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           ▲                                      │
│                           │ (HTTPS/TLS encrypted)                │
│                           │ (HTTP requests with Authorization)   │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            ▼
        ┌──────────────────────────────────────┐
        │       Backend API Server             │
        │                                      │
        │  ├── POST /api/v1/auth/login         │
        │  ├── GET /api/v1/users               │
        │  ├── GET /api/v1/tickets             │
        │  ├── POST /api/v1/tickets            │
        │  ├── PATCH /api/v1/tickets/:id       │
        │  └── DELETE /api/v1/tickets/:id      │
        │                                      │
        │  Authentication: JWT Bearer tokens   │
        │  Response format: { data, error }    │
        └──────────────────────────────────────┘
```

---

## End of Application Documentation

This document is a living reference. Update sections as the application evolves, and log all changes in the CHANGE-TRACKER.md file in the docs folder.

**For questions about this documentation or the application architecture, contact:**
- [Primary contact name] (Team lead)
- [Secondary contact name] (Documentation owner)
