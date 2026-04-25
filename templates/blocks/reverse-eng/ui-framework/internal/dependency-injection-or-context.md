---
slug: dependency-injection-or-context
title: "Dependency Injection / Context"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 200
---

## 10. Dependency Injection / Context

<!-- The framework's mechanism for crossing component boundaries with
shared services or values: provider/consumer trees and scoping rules. -->

### 10.1 Model

- **Approach:** [e.g., "Hierarchical provider/consumer tree on the component runtime", "React-style Context with `Provider`/`useContext`", "Angular-style hierarchical injectors with token classes."]
- **Lookup direction:** consumer → walk parents → app root → fallback default.
- **Scoping unit:** [e.g., "Component instance", "Module / lazy-loaded route", "Standalone injector."]

### 10.2 Tokens / Keys

- Tokens are usually `Symbol` or a typed sentinel:

```typescript
const CONFIG = Symbol('Config') as InjectionKey<Config>;

provide(CONFIG, { apiBase: '…' });

const cfg = inject(CONFIG)!;   // typed Config
```

- String keys are supported for compatibility but discouraged (collisions, stringly-typed APIs).

### 10.3 Provider Trees

```
   App root ─── provides A
        │
        ├── Layout ─── provides B
        │       │
        │       └── Page ─── provides C
        │              │
        │              └── Widget   inject(A) → app
        │                          inject(B) → Layout
        │                          inject(C) → Page
        │
        └── Sidebar ─── inject(B) → undefined (different branch)
```

- **Implementation:** an `provides` object created with the parent's `provides` as prototype on first write — see state-management-internals §5.3.
- **Invariants:** providers do not see siblings' provides; provides created lazily; lookups are O(depth).

### 10.4 Lazy / Tree-Scoped Providers

- Lazy-loaded routes can declare their own providers; they are scoped to that subtree and disposed when the route unmounts.
- **Standalone injector** (if supported): a detached scope used by background work or workers — does NOT inherit from any component tree.

### 10.5 Service Lifetimes

| Lifetime | Behavior | Where to use |
|----------|----------|--------------|
| **App-singleton** | Provided at app root; one instance | Cross-cutting services (logger, config, http client) |
| **Subtree** | Provided at any non-root provider | Feature-scoped state, modal-local services |
| **Per-instance** | Each component creates its own | Form controllers, per-row state |
| **Detached** | Created via `effectScope(true)` | Work that outlives a component |

### 10.6 Overriding for Tests

- Test utilities expose a shim that lets a test mount a component with `provides: { [TOKEN]: mock }` ahead of any production provider — tests do not need to assemble the real tree.
- `withProviders([...])` creates a temporary scope; effects created inside it are disposed in the test teardown.

### 10.7 SSR Considerations

- The provider tree is per-request. App-level provides are recreated for every request.
- Holding a request-bound provide in a module-level closure leaks data across requests — tests cover this.

### 10.8 Devtools

- Devtools exposes a "Providers" pane: each instance shows what it provides AND what it injects (with the resolution path).
- Useful for diagnosing "I provided X but it's `undefined`" — the inspector shows where the lookup fell off the chain.

### 10.9 Common Pitfalls

- [e.g., "Providing a non-reactive value: consumers won't see updates. Wrap in `signal`/`ref` and provide that."]
- [e.g., "Providing inside `setup` AFTER an `await`: the provide is registered after the parent finishes mounting; children mounted earlier see `undefined`. Provide before any await."]
- [e.g., "Two unrelated tokens with the same string key collide. Always prefer Symbol-based InjectionKey."]
- [e.g., "Standalone injector forgets to dispose — every standalone scope must `scope.stop()` to release effects."]
