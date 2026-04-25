---
slug: state-and-data-flow
title: "State and Data Flow"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 180
---

## 8. State and Data Flow

### 8.1 Reactive Primitives Provided

| Primitive | Purpose | Ownership |
|-----------|---------|-----------|
| `useState` / `signal` / `ValueNotifier` | Local component state | Component |
| `useReducer` / `Bloc` / store | Reducer-style local state | Component or feature |
| Context / `Provider` / `InheritedWidget` | Subtree-scoped read-mostly value | Ancestor |
| Observable / `Stream` / `Riverpod`-like | Outside-the-tree reactive source | Provider module |
| Global store | App-wide shared mutable state | App composition root |

### 8.2 Update Cycle

```
[ Mutation source — handler / async result ]
        ↓
[ State write through primitive API ]
        ↓
[ Subscription bookkeeping invalidates dependents ]
        ↓
[ Reconciler scheduled to re-render affected subtrees ]
        ↓
[ Renderer applies diffs ]
```

### 8.3 Subscription / Dependency Tracking

- **Auto-tracked** primitives (signals, observables): runtime records reads; only readers re-evaluate.
- **Manually-listed** primitives (`useEffect` deps, `Provider.select`): consumer declares the slice they care about.
- **Whole-store** primitives (legacy redux): every mutation re-evaluates every subscribed selector — leads to reselect-style memoisation.

### 8.4 Async Data Flow

| Mechanism | Use Case |
|-----------|----------|
| Promise / `Future` | Single-shot async result |
| Async iterator / `Stream` | Push-based updates |
| Observable | Push + multicast |
| Suspense / `FutureBuilder` | Render-aware async — surfaces fallback UI while pending |
| Resource / `useResource` | Tracks loading/error/value lifecycle |

### 8.5 Side Effect Containment

- Effects are scheduled **after** render commits.
- The runtime guarantees effect cleanup ordering: parent → child for unmount, child → parent for mount.
- Recommended places to put side effects: `useEffect`, `initState`, `viewDidLoad`. Discouraged: render bodies, builder functions.

### 8.6 Concurrency

- The framework supports concurrent rendering (where applicable): low-priority updates can be deferred or interrupted.
- Marking work as urgent (e.g., `flushSync`, `WidgetsBinding.scheduleFrame`) bypasses the scheduler.
- State writes in event handlers are batched per microtask; manual unbatching requires `flushSync`-equivalent.

### 8.7 Cross-Tree Data Sharing Patterns

- **Lifting state up**: idiomatic, no special primitives.
- **Context / inherited models**: ergonomic for small subtrees, costly when too many consumers re-render.
- **Provider modules / atoms**: scaling pattern when tree size grows.
- **Pub-sub event bus**: anti-pattern; only used at framework-internal boundaries.

### 8.8 Persistence Hooks

State libraries integrate with `storage-internals` via:
- Serialiser per atom / store key.
- Lifecycle: hydrate on mount, debounce-write on change.
- Migration hooks per store (mapping `vN` → `vN+1`).

### 8.9 Where the Code Lives

```
{{repo}}/
├── packages/state/                     # primitives + dependency tracker
├── packages/runtime/src/scheduler/     # update scheduling
└── packages/state-devtools/            # state inspector
```
