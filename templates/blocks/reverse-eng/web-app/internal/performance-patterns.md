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

<!-- How the app splits code to reduce initial bundle. Framework primitives differ
but the pattern (lazy-load + suspense / loading boundary at route level) is universal. -->

- **Route-Based:** Each feature is lazy-loaded when its route is visited.
- **Component-Based:** Heavy components (modals, charts, editors) lazy-loaded on first interaction.

**Framework primitives:** [e.g., React `lazy()` + `<Suspense>`, Vue `defineAsyncComponent` + `<Suspense>`, Angular standalone-route `loadComponent`, SvelteKit dynamic `+page.ts` imports, Solid `lazy()` + `<Suspense>`, Next.js / Nuxt / Remix native dynamic-import + framework loading state]

**Implementation (illustrative — React 18 + React Router):**

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

<!-- When and how to use memoization — primitives vary by framework. Document the
ones this codebase actually uses. -->

- **Components / views:** Use the framework's memoization primitive for expensive presentational components [e.g., React: `React.memo()` + `useMemo`; Vue: `computed` + `<KeepAlive>`; Angular: `OnPush` change-detection strategy + pure pipes; Svelte: `$derived` runes / `{#key}` re-keying; Solid: `createMemo`; Lit: `@property({ hasChanged })` + reactive controllers].
- **Selectors / derived state:** Use the state library's memoized-selector helper [e.g., Redux `reselect`, Zustand selector subscription, Pinia getters, NgRx `createSelector`, RTK `createSelector`, Recoil/Jotai derived atoms].
- **Stable callbacks / functions:** Stabilise event handlers passed to memoized children [e.g., React `useCallback`, Vue `shallowRef` + closures, Angular template-stable references, Svelte `$state.snapshot` / external functions].
