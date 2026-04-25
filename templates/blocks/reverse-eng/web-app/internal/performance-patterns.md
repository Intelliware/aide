---
slug: performance-patterns
title: "Performance Patterns"
applies-to: [re-web-app-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 260
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
