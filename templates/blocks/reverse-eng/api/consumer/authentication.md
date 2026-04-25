---
slug: authentication
title: "Authentication"
applies-to: [re-api-consumer]
requires-decision-from: [code-reader, security]
optional: false
order-hint: 120
---

## 2. Authentication

Document every supported authentication scheme the API accepts and which one a typical consumer should use. Make it explicit which scheme is required versus optional, what scopes/audiences are required, how credentials are obtained, where they are sent (header, query, body), how long they last, and how they are rotated/revoked. Verify by reading the API's middleware/auth code and the published spec — do not infer from documentation alone, since docs frequently lag the implementation.

Be concrete about secrets handling. Tell the consumer where credentials must NOT be placed (URL query strings, frontend code, public repos). If the API uses OAuth, document the exact grant types supported, token endpoint URL, scope strings, and refresh-token behavior. If keys are long-lived, document rotation cadence and whether the API supports overlapping keys during rotation.

### Suggested template content

**Supported auth schemes:**

| Scheme | When to use | Header / location | Lifetime | Rotation |
|---|---|---|---|---|
| {{scheme-1 — e.g. "API key"}} | {{when-1 — e.g. "Server-to-server, low-trust"}} | `{{header-1 — e.g. "X-API-Key: <key>"}}` | {{lifetime-1}} | {{rotation-1}} |
| {{scheme-2 — e.g. "OAuth2 client_credentials"}} | {{when-2}} | `Authorization: Bearer <token>` | {{lifetime-2 — e.g. "1h access, no refresh"}} | {{rotation-2}} |
| {{scheme-3 — e.g. "JWT (signed by issuer)"}} | {{when-3}} | `Authorization: Bearer <jwt>` | {{lifetime-3}} | {{rotation-3}} |

**Obtaining credentials:**

{{credential-acquisition-flow — exact steps, e.g.:}}

1. Log in to {{dashboard-url}}.
2. Create an OAuth client; note `client_id` and `client_secret`.
3. Exchange for a token:

```bash
curl -sS -X POST "{{token-endpoint}}" \
  -d "grant_type=client_credentials" \
  -d "client_id={{client_id}}" \
  -d "client_secret={{client_secret}}" \
  -d "scope={{required-scopes}}"
```

**Required scopes / audiences:**

| Scope / aud | Grants access to |
|---|---|
| `{{scope-1}}` | {{what-1}} |
| `{{scope-2}}` | {{what-2}} |

**Token verification on the server side (informational):**

- Issuer: `{{iss}}`
- JWKS: `{{jwks-url}}`
- Algorithm: {{alg — e.g. "RS256"}}

**Common 401/403 causes:**

- {{cause-1 — e.g. "Token expired; re-fetch from /oauth/token"}}
- {{cause-2 — e.g. "Wrong audience; check `aud` claim matches `{{aud}}`"}}
- {{cause-3 — e.g. "Clock skew on caller exceeds 60s"}}

**Secrets handling rules:**

- Store credentials in a secrets manager ({{secrets-manager}}), never in code or repo.
- Never put tokens in URL query strings — they leak via access logs.
- Rotate credentials at least every {{rotation-cadence}}.
