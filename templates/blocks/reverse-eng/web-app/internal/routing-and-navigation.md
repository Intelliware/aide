---
slug: routing-and-navigation
title: "Routing and Navigation"
applies-to: [re-web-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 150
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
