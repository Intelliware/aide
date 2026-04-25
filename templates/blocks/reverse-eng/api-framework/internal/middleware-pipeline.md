---
slug: middleware-pipeline
title: "Middleware Pipeline"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 140
---

## 4. Middleware Pipeline

The middleware pipeline is the framework's core composition primitive — almost every cross-cutting concern is implemented as middleware. Document its kernel: how middleware is registered (global vs. route vs. group), how the pipeline is compiled (lazily per-request, ahead-of-time at bootstrap, or recursive function chain), how `next()` propagates, and how errors are routed. Trace one request through the pipeline in the debugger and write down what you see.

Be explicit about the contract: what middleware can mutate vs. what is frozen, what an early-return middleware does to downstream middleware, and how async cancellation propagates. Most framework bugs in user code happen because the consumer misunderstood the pipeline contract — this block exists to make that contract unambiguous.

### Suggested template content

**Pipeline shape:**

```
                        compiled at: {{compile-time — e.g. bootstrap}}
                                          │
       ┌──────────────────────────────────┴────────────────────────────────┐
       │   global pre   →   group pre   →   route pre   →   handler        │
       │                                                       │           │
       │   global post  ←   group post  ←   route post  ←──────┘           │
       └─────────────────────────────────────────────────────────────────┘
                                          │
                                  on error: error pipeline
```

**Middleware function signature:**

```{{lang}}
type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void>;
```

**Composition algorithm (kernel):**

```{{lang}}
function compose(mws: Middleware[]): Middleware {
  return (ctx, finalNext) => {
    let i = -1;
    function dispatch(idx: number): Promise<void> {
      if (idx <= i) throw new Error("next() called multiple times");
      i = idx;
      const fn = idx === mws.length ? finalNext : mws[idx];
      return Promise.resolve(fn(ctx, () => dispatch(idx + 1)));
    }
    return dispatch(0);
  };
}
```

**Source files:**

- Pipeline kernel: `{{path}}`
- Built-in middleware: `{{path}}`
- Registration sites (global / group / route): `{{path}}`

**Registration scopes:**

| Scope | Registered via | Applies to |
|---|---|---|
| Global | `app.use(mw)` | Every request |
| Group | `app.group("/api", g => g.use(mw))` | Routes under prefix |
| Route | `app.get(path, mw1, mw2, handler)` | One route |

**Built-in middleware (in default order):**

| # | Name | Purpose | Removable? |
|---|---|---|---|
| 1 | `request-id` | Assigns / propagates `X-Request-ID` | yes |
| 2 | `cors` | Cross-origin handling | yes (default off) |
| 3 | `body-limit` | Reject oversized bodies early | no (security) |
| 4 | `body-parser` | JSON / form / multipart | yes |
| 5 | `auth-bridge` | Looks up auth strategy from registry | yes |
| 6 | `error-boundary` | Catches downstream errors | no |

**Error propagation:**

- Throwing in a middleware short-circuits the rest of the chain.
- `error-boundary` is the last frame above user code; it catches and routes to the error pipeline (see error-handling-pipeline block).
- `next()` called twice → fatal `MiddlewareKernelError`.
- `next()` not called → request hangs unless middleware writes a response itself.

**Async cancellation:**

- The pipeline honors `ctx.signal` (`AbortSignal`).
- Middleware that schedules work after `next()` returns must check `ctx.signal.aborted` before continuing.

**Plugin-installed middleware:**

- Plugins can register middleware via `plugin.useMiddleware(mw, { phase: "pre" | "post" })`.
- Phase ordering: `pre-global → pre-plugin → ... → handler → ... → post-plugin → post-global`.

**Performance notes:**

- The pipeline is compiled once at registration; per-request cost is N closures + 1 promise per middleware.
- Hot path lives in `{{hot-path-file}}` — keep allocations minimal there.

**Testing:**

- `testing.compose([mw1, mw2])` exposes a synchronous variant for unit tests.
- See testing-harness block for the request-level test client.
