---
slug: architecture-and-design-patterns
title: "Architecture and Design Patterns"
applies-to: [re-web-app-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 140
---

## 4. Architecture and Design Patterns

### 4.1 High-Level Architecture

<!-- ASCII diagram showing how major components connect. Replace bracketed labels
with the codebase's actual framework / store / router. -->

```
┌─────────────────────────────────────────────────────────────┐
│                  Browser / SPA / SSR runtime                 │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │     [UI Framework] App Root                         │   │
│  │     (e.g., React / Vue / Angular / Svelte / Solid)  │   │
│  │                                                     │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │     [State Container] (Global State)         │   │   │
│  │  │     (e.g., Redux / Pinia / NgRx / Zustand /  │   │   │
│  │  │      MobX / Svelte stores / Solid signals)   │   │   │
│  │  │  ├── auth (user, token, permissions)         │   │   │
│  │  │  ├── [domain entity 1] (list, selected...)   │   │   │
│  │  │  ├── [domain entity 2] (list, detail...)     │   │   │
│  │  │  └── ui (modals, notifications, theme)       │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │                      ▲                               │   │
│  │                      │ (state updates)               │   │
│  │                      │                               │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │     [Router] (e.g., React Router /           │   │   │
│  │  │      Vue Router / Angular Router /           │   │   │
│  │  │      SvelteKit / Solid Router / Next.js)     │   │   │
│  │  │  ├── /dashboard                              │   │   │
│  │  │  ├── /[entity] (protected)                   │   │   │
│  │  │  ├── /admin/* (role-gated)                   │   │   │
│  │  │  └── /login                                  │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │           │                                          │   │
│  │           ▼                                          │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │     Feature Views / Components               │   │   │
│  │  │     ├── Read state via framework primitive   │   │   │
│  │  │     ├── Call services for API requests       │   │   │
│  │  │     └── Trigger state updates on interaction │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                      ▲                                      │
│                      │ (HTTP / GraphQL / WebSocket)         │
└──────────────────────┼──────────────────────────────────────┘
                       │
                       ▼
           ┌──────────────────────────┐
           │    Backend API Server    │
           │  (REST / GraphQL / RPC)  │
           └──────────────────────────┘
```

### 4.2 Data Flow

<!-- Describe how data flows through the app, from API to UI. The shape is
universal; only the names change per stack. -->

**Typical User Action → API Call → State Update → UI Rerender:**

1. **User interaction** (e.g., clicks "Create [Entity]" button)
2. **View / component invokes a state action** [e.g., Redux `dispatch(fetchTickets())`, Pinia `useTicketStore().fetch()`, NgRx `store.dispatch(...)`, Zustand `useStore.getState().fetch()`, Svelte store `tickets.fetch()`, Solid signal setter]
3. **Action / store calls an API service** (e.g., `ticketService.createTicket()`)
4. **HTTP client sends request** (authenticated via interceptor / middleware)
5. **API response received** by HTTP client
6. **HTTP interceptor handles** response (check for 401, normalise errors, format payload)
7. **State container updates** with new data [reducer / mutation / setter / signal write]
8. **Reactive subscribers re-render** with updated state
9. **UI shows new entity** in the list

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
