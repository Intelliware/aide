---
slug: state-management-internals
title: "State Management Internals"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 150
---

## 5. State Management Internals

<!-- The framework's own state primitives and how they compose: local
component state, context propagation, and the contract for any
companion state library. -->

### 5.1 Layers of State

| Layer | Owner | Lifetime | Primitive |
|-------|-------|----------|-----------|
| Local | Component instance | Mount → unmount | `signal`, `reactive`, `computed` |
| Provided | Provider component subtree | Provider's mount → unmount | `provide` / `inject` |
| App | App root | App `createApp` → unmount | `app.provide` |
| Global stores (companion lib) | Store module | Module load → page unload | Library-specific |

### 5.2 Local State

- Created in `setup` via reactivity primitives.
- Owned by the instance's `EffectScope` — automatically disposed on unmount.
- Not addressable by parent or sibling unless explicitly exposed (`expose({...})`) or returned for the template.

### 5.3 Context (Provide / Inject)

```typescript
// Internal storage on the instance
interface ComponentInternalInstance {
  provides: Record<string | symbol, unknown>;
}

// On mount, `provides` is created with the parent's `provides` as the
// prototype (so lookups walk up the tree without copying).

function provide(key, value) {
  const i = getCurrentInstance();
  if (i.provides === i.parent?.provides) {
    i.provides = Object.create(i.parent.provides);
  }
  i.provides[key] = value;
}

function inject(key, defaultValue) {
  const i = getCurrentInstance();
  if (i && key in i.provides) return i.provides[key];
  return defaultValue;
}
```

- Lookups are O(1) average on prototype chain length.
- Reactive values cross provider/consumer boundaries unchanged (no copy/snapshot).

### 5.4 Reactivity Across Boundaries

- Pass a signal/ref through `provide` to share a reactive cell across descendants.
- Consumers reading the injected value inside `effect` automatically subscribe.
- Updates from any descendant call the same setter; tracking is per-key, not per-subscriber.

### 5.5 Update Propagation Rules

- Writes to a signal trigger ONLY the effects that read the same key — `provide` does not broadcast on its own.
- Computed values can be provided; they recompute lazily on read.
- Effects in different subtrees may run in any order within a flush; do not rely on tree order for correctness.

### 5.6 Companion Store Contract

If the framework ships an official store, it builds on the same primitives:

```typescript
function defineStore(id, setup) {
  return () => {
    if (cache.has(id)) return cache.get(id);
    const scope = effectScope(/* detached */);
    const store = scope.run(setup);    // setup returns refs/computeds/actions
    cache.set(id, store);
    return store;
  };
}
```

- Stores live outside the component tree but use the same scheduler.
- HMR updates a store by replacing its setup output and patching consumers.
- SSR creates a fresh store registry per request to avoid cross-request leakage.

### 5.7 Devtools Integration

- The reactivity layer exposes `__{{prefix}}_track__` and `__{{prefix}}_trigger__` hooks that devtools listens to.
- Component instances expose `setupState` (read-only proxy for the inspector).
- Stores expose their `id` and reactive fields for time-travel debugging.

### 5.8 Pitfalls

- [e.g., "Mutating injected reactive objects in a child has the same effect as in the provider — there is no isolation. Use `readonly()` if you mean to expose immutable state."]
- [e.g., "Module-scope refs persist across SSR requests and leak data — always create stores per request."]
- [e.g., "Memoizing on object identity assumes proxy stability; recreating the proxy in each render breaks memoization."]
