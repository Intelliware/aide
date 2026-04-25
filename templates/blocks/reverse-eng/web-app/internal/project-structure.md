---
slug: project-structure
title: "Project Structure"
applies-to: [re-web-app-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 130
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
