---
slug: api-integration
title: "API Integration"
applies-to: [re-web-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 180
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
