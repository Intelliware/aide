---
slug: reactivity-system
title: "Reactivity System"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 130
---

## 3. Reactivity System

<!-- The change-detection engine — what data structures track reads and
writes, how dependencies are recorded, when effects re-run, and where
glitches/anomalies hide. -->

### 3.1 Reactivity Model

- **Approach:** [e.g., "Push-pull signals: values track readers; reads return values, writes schedule effect re-runs."]
- **Granularity:** [e.g., "Per-property fine-grained — only the components that read a changed key re-render."]
- **Comparison:** [e.g., "Closer to Solid/MobX than to React's pull-based VDOM diff."]

### 3.2 Core Primitives

| Primitive | Purpose | API |
|-----------|---------|-----|
| `signal` / `ref` | Atom holding a single value | `s()` reads, `s(v)` writes |
| `computed` | Derived value, lazily recalculated | `c()` reads |
| `effect` | Side effect that re-runs when deps change | `effect(() => …)` |
| `reactive` (proxy) | Deep proxy over object/array | property access tracks |
| `readonly` | Read-through proxy | reads track; writes throw |
| `effectScope` | Group effects for collective dispose | `scope.run(() => …)` |

### 3.3 Dependency Tracking

```typescript
// Pseudocode of the dep-collection machinery

let activeEffect: ReactiveEffect | null = null;

function track(target, key) {
  if (!activeEffect) return;
  const depsMap = targetMap.get(target) ?? targetMap.set(target, new Map()).get(target);
  const dep = depsMap.get(key) ?? depsMap.set(key, new Set()).get(key);
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

function trigger(target, key) {
  const dep = targetMap.get(target)?.get(key);
  if (!dep) return;
  for (const effect of dep) scheduler.queue(effect);
}

class ReactiveEffect {
  run() {
    cleanup(this);          // remove this effect from prior deps
    activeEffect = this;
    try { return this.fn(); }
    finally { activeEffect = this.parent ?? null; }
  }
}
```

### 3.4 Scheduling and Batching

- **Microtask flush:** writes within the same microtask are coalesced; effects run once per flush.
- **Two queues:**
  - `pre`: ran before render effects (e.g., user `watchEffect(() => {}, { flush: 'pre' })`).
  - `post`: ran after the DOM has been patched (e.g., reading layout).
- **Cycle detection:** an effect that triggers itself is allowed up to {{n}} re-runs per flush before the scheduler aborts and warns.

### 3.5 Computed Caching Rules

- A computed is **dirty** when any of its tracked deps change.
- It is **not** recomputed eagerly — it recomputes on next read.
- It deduplicates re-runs by comparing the new value with the prior using `Object.is` (configurable via custom `equals`).

### 3.6 Proxy Behavior

| Access | Behavior |
|--------|----------|
| `obj.foo` | tracks `(obj, 'foo')` |
| `obj.foo = v` | triggers `(obj, 'foo')`; if `'foo'` is new and target is array/object, also triggers `ITERATE_KEY` |
| `'foo' in obj` | tracks via `HAS` symbol |
| `for (const k in obj)` | tracks `ITERATE_KEY` |
| Array methods (`push`, `splice`, …) | wrapped to avoid re-entrant tracking; trigger `length` and indices |
| Map / Set | wrapped iterators; tracks via `ITERATE_KEY`, `MAP_KEY_ITERATE_KEY` |

### 3.7 Glitch and Anomaly Avoidance

- **No intermediate inconsistency:** computed chains use a generation counter so a reader can't see a stale combination.
- **Order of effect runs:** topologically sorted so producers run before consumers; ties broken by scope creation order.
- **Stop / cleanup:** on `effect.stop()`, the effect is removed from every dep set it joined; scoped effects are stopped when their scope disposes.

### 3.8 Common Bugs Maintainers Find Here

- [e.g., "Adding tracking to a new internal proxy without updating `cleanup()` causes stale-dep leaks across renders."]
- [e.g., "Writing inside an effect re-enters; check the re-entry guard before adding new triggers."]
- [e.g., "Custom equality on `computed` must be transitive; non-transitive equality breaks computed caching."]
- [e.g., "`ITERATE_KEY` triggers must fire on key insertion AND deletion — easy to miss when adding new collection methods."]
