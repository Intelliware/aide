---
slug: feature-modules
title: "Feature Modules"
applies-to: [re-web-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 230
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
