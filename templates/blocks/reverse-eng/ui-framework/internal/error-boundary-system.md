---
slug: error-boundary-system
title: "Error Boundary System"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 260
---

## 16. Error Boundary System

<!-- How errors during render, lifecycle, async setup, and event handlers
are captured, propagated, and surfaced. The contract for fallback
rendering and the rules around recovery. -->

### 16.1 Error Sources

| Source | Caught by |
|--------|-----------|
| Render function throws | render-effect catch → `errorCaptured` chain |
| Lifecycle hook throws | hook caller catch → `errorCaptured` chain |
| Setup throws (sync) | mount catch → `errorCaptured` chain |
| Setup rejects (async) | `<Suspense>` if any; else `errorCaptured` chain |
| Event handler throws | invoker catch → `errorCaptured` chain |
| Watcher / effect throws | scheduler catch → `errorCaptured` chain |
| Promise inside `nextTick` | scheduler catch → `errorCaptured` chain |
| Custom directive hook throws | patch catch → `errorCaptured` chain |

### 16.2 Propagation Algorithm

```
   error originates at instance I
        │
        ▼
   walk parents (I, I.parent, …, root):
     for each ancestor A:
       for each fn in A.errorCaptured:
         result = fn(error, instance, info)
         if result === false:
           STOP — error consumed
        │
        ▼
   if no ancestor consumes:
     app.config.errorHandler(error, instance, info) ?? console.error
```

- `info` is a string discriminator like `'render function'`, `'setup function'`, `'event handler'` so handlers can branch.
- Returning anything other than `false` (including `undefined`) lets the error continue propagating.

### 16.3 Boundary Component Pattern

```typescript
const ErrorBoundary = defineComponent({
  setup(_, { slots }) {
    const error = ref(null);

    onErrorCaptured((err, _instance, info) => {
      error.value = { err, info };
      return false;       // consume; do NOT propagate further
    });

    return () => error.value
      ? slots.fallback?.({ error: error.value }) ?? null
      : slots.default?.();
  },
});
```

- The boundary itself does not crash because the error path UNMOUNTS the failed subtree before the next render runs.
- A boundary handler that THROWS escalates to its own ancestor.

### 16.4 Render-Failure Recovery

- After a render throw, the failing subtree is torn down (effects stopped, DOM removed) — partial DOM is never left behind.
- The next render replaces it with whatever the parent produces (often a fallback via boundary).
- Hydration mismatches do NOT route through this path; they fall back to client-rendering the affected subtree silently (with a dev warning).

### 16.5 Async Boundaries (`<Suspense>`)

- `<Suspense>` catches rejection from async setup and pending Promises during initial mount.
- Two named slots: `default` (the awaited tree) and `fallback` (shown while pending).
- On rejection, an ancestor `errorCaptured` (or the Suspense's own onError) handles it; otherwise the error escalates.

### 16.6 Global Error Handler

```typescript
app.config.errorHandler = (err, instance, info) => {
  reportToObservability({ err, component: instance?.type?.name, info });
};
```

- Last line of defense; runs once per error.
- Sourcemaps applied here in dev.

### 16.7 Warnings vs. Errors

| Severity | Path |
|----------|------|
| `console.warn` | non-fatal contract violations (missing key, wrong prop type) |
| `console.error` | recoverable but indicates a bug (unhandled error, mismatched hydration) |
| `errorCaptured` | actual thrown errors |

`app.config.warnHandler` lets apps re-route warnings (silence, ship to log).

### 16.8 Devtools Integration

- Each captured error is sent to devtools with: error object (incl. stack), instance UID, component tree path, the `info` string.
- Devtools can pause time-travel state at the moment of throw.

### 16.9 Pitfalls

- [e.g., "Returning `true` from `errorCaptured` does NOT consume the error — only `false` does. Easy to invert."]
- [e.g., "Errors in `errorCaptured` itself escalate to the next ancestor, not infinite-loop. Confirm via tests."]
- [e.g., "Async errors thrown after the component unmounts have no boundary — the global handler is the only catch. Avoid unawaited fire-and-forget."]
- [e.g., "Sometimes a render throw on the first mount leaves the parent VNode without an `el` reference; subsequent patches must not assume `el` exists."]
