---
slug: dependency-injection
title: "Dependency Injection"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader, architect]
optional: true
order-hint: 210
---

## 11. Dependency Injection

If the framework provides a DI container, document the container's design: registration API, scopes (singleton, request-scoped, transient), resolution algorithm, lifetime management, and lifecycle hooks. Mark this block optional — many minimalist frameworks intentionally have no DI. If the framework relies on a third-party DI library, document the integration adapter rather than restating the library.

Cover the request-scope plumbing carefully: how a per-request container is created, how it's bound to the request context, how it's disposed on response, and what happens when a singleton accidentally holds a request-scoped reference (the classic memory leak). Verify by writing a test that registers a request-scoped service and asserts disposal.

### Suggested template content

**Container model:** {{model — e.g. "Hierarchical: app → request"}}

**Scopes:**

| Scope | Lifetime | Sharing |
|---|---|---|
| `singleton` | Whole app | One instance across all requests |
| `request` | Per request | New instance per request, disposed on response |
| `transient` | Per resolve | New instance every `container.get()` |

**Registration API:**

```{{lang}}
container.register(Token, factory, { scope: "singleton" });
container.register(LoggerToken, () => new Logger(...), { scope: "singleton" });
container.register(DbConnectionToken, (c) => new Db(c.get(ConfigToken)), { scope: "request" });
```

**Source files:**

- Container: `{{path}}`
- Scope manager: `{{path}}`
- Request-scope binding: `{{path}}`

**Resolution algorithm:**

```{{lang}}
function get<T>(token: Token<T>, scopeChain: Scope[]): T {
  // Walk scopes from innermost (request) outward (app).
  for (const scope of scopeChain) {
    if (scope.has(token)) return scope.get(token);
  }
  // Build fresh.
  const reg = registry.get(token);
  if (!reg) throw new UnregisteredServiceError(token);
  const instance = reg.factory(this);
  scopeChain[reg.scope].set(token, instance);
  return instance;
}
```

**Request-scope binding:**

- A new request-scope container is created per-request, parented to the app container.
- Bound to the request context: `ctx.container`.
- On response (success or error), `await container.dispose()` runs all `OnDispose` hooks in registration order.

**Lifecycle hooks per service:**

```{{lang}}
class DbConnection implements OnInit, OnDispose {
  async onInit() { await this.pool.connect(); }
  async onDispose() { await this.pool.end(); }
}
```

- Hooks run in registration order on init, reverse order on dispose.

**Common scope mistakes (anti-patterns):**

- A `singleton` accepting a `request`-scoped dep → captured-reference; memory leak. Container detects this at registration and throws `ScopeViolationError`.
- A `request` scope used outside a request (e.g., a background job) → throws `NoActiveRequestScopeError`.
- Disposing the request scope before the response finishes streaming → use-after-dispose; framework guards with a deferred dispose.

**Async resolution:**

- Factories may return Promises; `container.get` is async-resolving by default.
- Cycles in async factories → `CircularDependencyError`.

**Plugin extensibility:**

- `plugin.registerService(token, factory, scope)` — register before bootstrap freezes the registry.
- After `beforeStart`, the registry is frozen; runtime registrations throw.

**Type integration:**

- Tokens are typed via {{token-system — e.g. branded class symbols / TypeScript decorators}}.
- The container is type-safe end to end; misuse is a compile error.

**Disposal guarantees:**

- The framework `await`s every `onDispose` on the response path.
- Errors during disposal are logged at `error` and do not affect the response.
- On forced shutdown (signal), the framework waits up to {{shutdown-grace}} for disposal to complete.

**Common pitfalls:**

- Calling `container.get()` from constructors → resolves with the wrong scope chain. Use injected factory functions instead.
- Holding a reference to `ctx.container` after the response — container is disposed; further `get()` throws.
- Registering the same token twice — depends on policy; default is "last write wins" with a warning.
