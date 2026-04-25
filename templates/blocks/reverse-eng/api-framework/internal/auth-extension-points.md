---
slug: auth-extension-points
title: "Authentication Extension Points"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader, security]
optional: false
order-hint: 220
---

## 12. Authentication Extension Points

Document how the framework hosts authentication and authorization without prescribing a specific scheme. The framework typically owns the *plumbing* (where in the pipeline auth runs, how strategies are registered, how the auth result is exposed) while strategies (JWT verifier, session lookup, mTLS, OIDC) live in plugins. Read `auth-bridge` middleware and the strategy registry to confirm the contract.

Be explicit about the security boundary: which fields plugins MAY mutate, what happens when no strategy matches, and how the framework prevents downgrade attacks (a lower-priority strategy succeeding when a higher one fails). Auth is a frequent vector for confused-deputy bugs; the maintainer doc must remove ambiguity.

### Suggested template content

**Strategy contract:**

```{{lang}}
interface AuthStrategy {
  name: string;
  /**
   * Inspect the request. Return:
   *   - { ok: true, principal } — accept authentication
   *   - { ok: false, error } — explicit reject (final unless `continue: true`)
   *   - null — strategy not applicable, try next
   */
  authenticate(ctx: Context): Promise<AuthResult | null>;
}
```

**Strategy registry:**

- Strategies registered via `plugin.registerAuthStrategy(strategy, { priority })`.
- Tried in priority order (high → low) until one returns non-null.
- An unmatched chain results in {{unmatched-policy — e.g. "anonymous principal; routes that require auth respond 401"}}.

**Source files:**

- Auth bridge middleware: `{{path}}`
- Strategy registry: `{{path}}`
- Principal type: `{{path}}`
- Authorization helpers: `{{path}}`

**Pipeline placement:**

```
[1] global pre middleware
[2] body parser
[3] auth-bridge   ← here; runs strategies, sets ctx.principal
[4] route resolution
[5] route-level guards (authorization)
[6] handler
```

- Auth runs AFTER body parsing because some strategies (HMAC body signing) need the parsed body.
- Auth runs BEFORE route-level guards so guards always see a populated `ctx.principal` (which may be `Anonymous`).

**Principal shape:**

```{{lang}}
type Principal =
  | { kind: "user"; id: string; tenant?: string; scopes: string[]; raw: unknown }
  | { kind: "service"; id: string; scopes: string[]; raw: unknown }
  | { kind: "anonymous" };
```

- `raw` carries strategy-specific data (decoded JWT claims, session record).
- The framework exposes `ctx.principal` (read-only after auth-bridge).

**Authorization extension points:**

- `requireAuth()` — middleware factory; rejects anonymous with 401.
- `requireScope(scopes...)` — rejects insufficient scope with 403.
- `requireTenant(tenant)` — rejects tenant mismatch with 403.
- Plugins may register additional `Guard` factories.

**Strategy ordering and downgrade prevention:**

- Strategies declare `{ exclusive: true }` to prevent fallthrough — if an exclusive strategy explicitly rejects, no lower-priority strategy is tried.
- A strategy returning `null` means "not applicable" and is safe to fall through.
- A strategy returning `{ ok: false }` without `continue: true` halts the chain.

**Common strategies (each in its own plugin):**

| Strategy | Priority | Exclusive | Notes |
|---|---|---|---|
| `mtls-strategy` | 100 | yes | If present, must succeed |
| `oauth-jwt-strategy` | 80 | no | Bearer JWT verification |
| `api-key-strategy` | 60 | no | Header lookup, hashed compare |
| `session-cookie-strategy` | 40 | no | Browser flows |

**Authorization model (extensible):**

- Default: scope-based (`scopes: string[]`).
- Plugins may install ABAC/RBAC engines via `plugin.registerAuthorizer(authzr)`.
- Authorizer decisions are exposed as middleware factories so per-route policies remain composable.

**Plugin extension API summary:**

| Method | Purpose |
|---|---|
| `registerAuthStrategy(strategy, opts)` | Add a strategy to the chain |
| `registerAuthorizer(authzr)` | Add a non-scope authorization model |
| `setPrincipalEnricher(fn)` | Last-chance to add fields to the principal post-auth |
| `setUnmatchedPolicy(policy)` | Override the default fallthrough |

**Common pitfalls:**

- Strategies returning a populated `ok: true` AND throwing — `ok: true` wins; throw is treated as bug.
- Mutating `ctx.principal` after auth-bridge from a downstream middleware — the framework freezes it; mutation throws.
- A strategy that depends on a request body field — confirm the body parser runs first (it does, but document the dependency in the strategy plugin).
- Using HTTP headers for both auth and CSRF — split them; framework provides `ctx.csrfToken` separately.
