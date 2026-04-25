---
slug: authentication-and-authorization
title: "Authentication and Authorization"
applies-to: [re-web-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 190
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
