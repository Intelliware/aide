---
slug: state-management
title: "State Management"
applies-to: [re-web-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 160
---

## 6. State Management

### 6.1 State Architecture

<!-- Describe the state management approach and structure. -->

**Approach:** [e.g., Redux / Redux Toolkit (RTK) / Zustand / MobX / Recoil / Jotai / Valtio / React Context + reducers — for React; Pinia / Vuex — for Vue; NgRx / NGXS / Akita — for Angular; Svelte stores / Svelte 5 runes — for Svelte; Solid signals / stores — for Solid; or "no central store: server-state library only" (e.g., TanStack Query / SWR / RTK Query / Apollo / urql)]

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
