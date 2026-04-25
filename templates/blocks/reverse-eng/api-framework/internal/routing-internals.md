---
slug: routing-internals
title: "Routing Internals"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 130
---

## 3. Routing Internals

Document how routes are registered, indexed, and matched at request time. This is where most performance characteristics and many surprising behaviors live (case sensitivity, trailing slashes, parameter coercion). Read the router source end-to-end: tree shape (radix? trie? regex list?), insertion semantics (override rules), match priority (specificity, registration order), and how parameter extraction is wired to the handler signature.

Cover how route conflicts are detected (or silently shadowed), how dynamic segments are constrained, and how the router exposes itself to plugins (most frameworks have a "post-bootstrap, route-list-frozen" rule). Verify by writing a small test that registers ambiguous routes and inspecting which one wins.

### Suggested template content

**Internal data structure:** {{structure — e.g. "Radix tree, one node per path segment"}}

**Why this structure:** {{rationale — e.g. "O(k) match cost where k is path length; supports static + parametric + wildcard with deterministic priority"}}

**Match priority (most specific first):**

1. Exact static segment (`/users/me`)
2. Constrained parametric (`/users/:id(\d+)`)
3. Unconstrained parametric (`/users/:id`)
4. Wildcard (`/users/*`)
5. Catch-all (`/*`)

**Registration:**

```{{lang}}
// Public surface (consumer-facing) — what plugins / app code call
router.get("/users/:id", handler);

// Internal flow:
// 1. parsePath("/users/:id") → [Segment.Static("users"), Segment.Param("id")]
// 2. radix.insert(method=GET, segments, handler)
// 3. throw on conflict if strict-mode enabled
```

**Source files:**

- Router top-level: `{{path}}`
- Path parser: `{{path}}`
- Tree implementation: `{{path}}`
- Param coercion: `{{path}}`

**Path parameter extraction:**

- Params are captured during the match walk and attached to the request context.
- Type coercion is performed by {{coercion-strategy — e.g. "the parsing block, not the router"}} — the router only collects raw strings.
- Reserved names (`req`, `ctx`, etc.): {{reserved-names-policy}}.

**Conflict detection:**

- Duplicate exact route → throw at bootstrap (`RouteConflictError`).
- Overlapping parametric routes → {{policy — e.g. "throw if `strict: true`; warn otherwise"}}.
- Route registration after bootstrap → {{post-bootstrap-policy — e.g. "rejected; routes are frozen after `app.listen()`"}}.

**Case sensitivity:**

- Paths: {{case-policy — e.g. "case-sensitive by default; opt into insensitivity per-app"}}.
- Methods: case-insensitive on input, normalized to uppercase internally.

**Trailing slash:**

- {{trailing-policy — e.g. "Strict by default: `/users` and `/users/` are different routes; opt-in normalization."}}

**Wildcard / catch-all semantics:**

- `*` matches one segment; `**` (or `*name`) matches the remainder of the path.
- Captured wildcard value is exposed as `{{wildcard-name}}`.

**Hooks for plugins:**

- `onRouteAdd(route)` — fires synchronously on registration.
- `onRouteResolve(req, route)` — fires before handler dispatch.
- `getRoutes()` — read-only snapshot for introspection.

**Performance characteristics:**

- Match cost: {{big-o}} for n routes, k path length.
- Memory: ~{{bytes-per-route}} per route.
- Cold-start cost: {{cold-start}} for n routes.

**Common pitfalls:**

- Registering routes from inside a request handler — silently no-ops post-bootstrap.
- Relying on registration order to disambiguate routes — match is by specificity, not order.
- Mixing strict and non-strict path modes within one app.
