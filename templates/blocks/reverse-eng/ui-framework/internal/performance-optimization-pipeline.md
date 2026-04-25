---
slug: performance-optimization-pipeline
title: "Performance Optimization Pipeline"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 250
---

## 15. Performance Optimization Pipeline

<!-- The cross-cutting performance levers: memoization, batching,
scheduling, and the optimizer flags that link compile-time and runtime. -->

### 15.1 Performance Levers Overview

| Lever | Layer | Effect |
|-------|-------|--------|
| Static hoisting | Compiler | Avoid recreating VNodes for static subtrees |
| Patch flags | Compiler ↔ Runtime | Diff only dynamic props/children |
| Block tree | Runtime | Skip static descendants during patch |
| Inline-handler caching | Compiler | Stable handler identity across renders |
| Memoization (`memo`) | Runtime | Skip re-render of children whose props are equal |
| Effect batching | Reactivity | Coalesce reactive updates per microtask |
| Scheduler tiers | Reactivity | `pre` / render / `post` job queues |
| Lazy components / routes | Bundler ↔ Runtime | Defer code load |
| `keep-alive` | Runtime | Cache mounted instances across navigations |
| Virtualization | Component lib | Render only visible rows |

### 15.2 Static Hoisting

The optimizer walks the AST and lifts subtrees with no dynamic descendants:

```typescript
// Before
return h('div', null, [
  h('h1', 'Static title'),
  h('p', null, _ctx.message),
]);

// After
const _hoisted_1 = h('h1', 'Static title');

return h('div', null, [
  _hoisted_1,
  h('p', null, _ctx.message, 1 /* TEXT */),
]);
```

`_hoisted_1` is allocated once at module init and reused.

### 15.3 Block Tree

A block tree records all dynamic VNodes in a flat array per block root, so patch can iterate dynamic descendants without recursing through the static ones.

```typescript
return (openBlock(), createBlock('div', null, [
  _hoisted_static_subtree,
  h('span', null, _ctx.dynamic, 1),
], 64 /* STABLE_FRAGMENT */));
// At runtime: block.dynamicChildren is [span]; static subtree skipped entirely.
```

### 15.4 Inline-Handler Caching

```typescript
// Compiler emits with cache slots
return h('button', {
  onClick: _cache[0] ||= ($event) => _ctx.foo($event),
});
```

Stable handler identity prevents `patchEvent` from doing any work when only handler closures change but underlying logic is the same.

### 15.5 Component Memoization

- `memo` receives a list of dependencies; the component re-renders only if any element of the list changes.
- Implementation stores last deps array on the instance; equality check via `Object.is` per slot.
- **Caveat:** `memo` blocks reactive prop tracking — use only when prop equality is well-defined.

### 15.6 Scheduler

- Single microtask job queue; `queueJob` deduplicates by job id.
- Three queues:
  - `preFlushCbs` — run before render effects
  - render effects
  - `postFlushCbs` — run after DOM commit
- Job priorities: render effects sorted by component depth ascending so parents render before children.
- Re-entrancy guarded by `flushIndex`; jobs added during flush join the current pass; deeply recursive triggers raise a dev warning.

### 15.7 Keep-Alive

- Wraps a slot, tracks include/exclude lists, and caches component instances by name.
- Cached instances stay in memory but are unmounted from the DOM via `_deactivate`/`_activate` lifecycle hooks instead of full unmount.
- Eviction uses LRU with `max` cap.

### 15.8 Lazy Loading

- `defineAsyncComponent(loader, options)` returns a placeholder component that mounts a fallback while the loader resolves.
- The bundler emits a separate chunk for the loader's import.
- **Suspense integration:** an async component inside `<Suspense>` boundary holds the boundary's "pending" state until the loader resolves.

### 15.9 Virtualization (If Provided)

- Item recycling: the list reuses VNodes for off-screen items as new items scroll in, swapping data instead of mounting/unmounting.
- Variable heights handled via measured-height cache; estimated heights for unmeasured items.
- Scroll restoration uses an anchor element so DOM updates don't jump scrollTop.

### 15.10 Profiling Hooks

- `app.config.performance = true` enables `performance.measure` calls bracketing component init / mount / patch.
- Flame charts in browser devtools show per-component timing.
- A built-in profiler component records render counts and durations; surfaced in framework-specific devtools panel.

### 15.11 Pitfalls

- [e.g., "Adding a new patchFlag without updating the optimizer's emit OR the runtime's fast path falls back silently to FULL_PROPS, regressing perf without breaking tests."]
- [e.g., "`memo` with reference-unstable deps (object literals, inline arrays) defeats memoization — lint rule warns."]
- [e.g., "keep-alive caches grow unbounded if `max` is not set."]
