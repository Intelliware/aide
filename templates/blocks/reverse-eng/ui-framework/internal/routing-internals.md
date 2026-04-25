---
slug: routing-internals
title: "Routing Internals"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 180
---

## 8. Routing Internals

<!-- The router package's internals: route matching, lazy loading,
navigation lifecycle, and integration with the component runtime. -->

### 8.1 Router Architecture

```
   history (browser/hash/memory)
            │
            ▼
   Router instance
     ├─ matcher        (path → record)
     ├─ guards         (beforeEach / beforeResolve / afterEach)
     ├─ navigation FSM (push/replace/back/forward)
     ├─ lazy loader    (dynamic imports, prefetch)
     └─ error handler
            │
            ▼
   <RouterView> component (renders matched component(s))
```

### 8.2 Route Records

```typescript
interface RouteRecordRaw {
  path: string;                  // '/users/:id'
  name?: string;
  component?: ComponentDefinition | (() => Promise<ComponentDefinition>);
  components?: Record<string, …>; // named views
  redirect?: string | ((to) => RouteLocation);
  alias?: string | string[];
  children?: RouteRecordRaw[];
  meta?: Record<string, unknown>;
  beforeEnter?: NavigationGuard | NavigationGuard[];
  props?: boolean | Record<string, unknown> | ((to) => Record<string, unknown>);
}
```

Records are normalized at registration into a flat list, each with a back-pointer to its parent for nested rendering.

### 8.3 Matcher

- **Implementation:** [e.g., "Trie-based with path-to-regexp tokenization and per-segment scoring."]
- **Score function:** more specific (static segments > params > wildcards) wins; ties broken by registration order.
- **Output:** `{ name, path, params, matched: RouteRecord[] }` where `matched` is the chain root → leaf.

```typescript
matcher.resolve({ path: '/users/42' })
// → { name: 'user-detail', params: { id: '42' }, matched: [/users/, /users/:id] }
```

### 8.4 Navigation Lifecycle

```
   call push(to) / replace(to)
        │
        ▼
   resolve to → matched chain
        │
        ▼
   compute leave / update / enter sets
        │
        ▼
   ┌── beforeRouteLeave (component, leaving)
   ├── beforeEach (global)
   ├── beforeRouteUpdate (component, reused)
   ├── beforeEnter (record-level)
   ├── component lazy load (if any)
   ├── beforeRouteEnter (component, entering)
   ├── beforeResolve (global) ◄── safe to fetch data
   ├── afterEach (global, side-effect only)
   │
   ▼
   commit to history; <RouterView> rerenders
```

- Each guard may: `return true` (proceed), `return false` (abort), `return '/login'` (redirect), or `next(error)` (fail).
- Guards run sequentially; the router holds an internal navigation token so a newer push cancels the in-flight one.

### 8.5 Lazy Loading and Prefetch

- A `component: () => import('./X')` registers a chunk; the matcher returns the lazy thunk.
- The runtime calls the thunk during navigation, caches the resolution, and updates `matched`.
- **Prefetch hooks:** `<RouterLink prefetch>` triggers the thunk on hover/visibility but does NOT navigate.

### 8.6 `<RouterView>`

- A component that subscribes to the router's reactive `currentRoute`.
- Walks `matched` based on its `depth` prop (set automatically by parent `<RouterView>` provide).
- Renders the matched component with route props.
- Supports transitions and keep-alive via slot props.

### 8.7 Scroll Behavior

- Hook: `scrollBehavior(to, from, savedPosition)` runs after navigation commits.
- `savedPosition` is non-null only on browser back/forward.
- Implementation reads/writes via `window.scrollTo`, scoped to the document or a `RouterView` container.

### 8.8 Programmatic Navigation Edge Cases

- **In-progress duplicate push:** the second call rejects with `NavigationDuplicated`.
- **Unguarded pop:** browser back fires `popstate`; the router runs guards. If a guard aborts, `history.go(deltaToRecover)` restores position.
- **Hash navigation:** anchor links inside the same route bypass the matcher and use native browser scroll.

### 8.9 SSR Considerations

- Memory history is used on the server; no `window`.
- The router instance MUST be created per request — sharing it leaks state across users.
- After `await router.isReady()`, the matched route is stable and can be rendered.

### 8.10 Hot Reloading Routes

- The dev server's HMR hook calls `router.{{api}}` to swap route records without a full reload.
- In-flight navigation is canceled and re-resolved against the new table.
