---
slug: authentication-integration
title: "Authentication Integration"
applies-to: [re-web-app-consumer]
requires-decision-from: [code-reader, security, architect]
optional: false
order-hint: 150
---

## 5. Authentication Integration

<!-- How identity flows from the host's existing identity system into the
embedded web app. The reader already has an IdP / session — they need to
know which protocol patterns are supported and which are recommended. -->

### 5.1 Supported Authentication Patterns

| Pattern | Best for | Trust model |
|---------|----------|-------------|
| **OIDC (Authorization Code + PKCE)** | Most embedders with a real IdP (Okta, Auth0, Entra, Keycloak) | Standard browser redirect; tokens stay in the embed |
| **OIDC silent SSO (prompt=none)** | iframe embeds where a top-level redirect breaks UX | Requires shared third-party cookies or partitioned-storage opt-in |
| **SAML SP-initiated** | Enterprise customers behind a SAML IdP | Browser POST through host's SAML SP |
| **Signed JWT handoff** | Trusted host → embedded app, backend-to-backend | Host signs short-lived JWT with shared key |
| **Bearer token (machine-to-machine)** | API-only integrations, no end-user | Server-side only |
| **Anonymous / public** | Read-only widgets | No identity |

### 5.2 OIDC Setup (Recommended)

**On the embedder's IdP:**

| Setting | Value |
|---------|-------|
| Client type | Public (PKCE) |
| Redirect URIs | `https://{{embed-host}}/auth/callback` |
| Post-logout redirect URIs | `https://{{embed-host}}/auth/logout` |
| Scopes | `openid profile email {{custom-scope}}` |
| Token endpoint auth | `none` (PKCE) |
| ID-token signing | RS256 |

**On the embed init:**

```typescript
sdk.init({
  auth: {
    type: 'oidc',
    issuer: 'https://idp.embedder.com',
    clientId: '{{client-id}}',
    scopes: ['openid', 'profile', 'email'],
    // Optional: pre-supply an ID token to skip the redirect on first load
    idTokenHint: '{{jwt}}',
  },
});
```

### 5.3 Signed JWT Handoff

```typescript
// Host backend mints a short-lived JWT and passes it to the SDK
const token = jwt.sign(
  {
    sub: user.id,
    email: user.email,
    name: user.displayName,
    tenantId: user.tenantId,
    // optional custom claims
    roles: user.roles,
  },
  SHARED_SECRET,
  { algorithm: 'HS256', expiresIn: '5m', audience: '{{embed-host}}' },
);
```

**Required claims:** `sub`, `aud`, `exp`, `iat`. Rejected if any are missing or `exp` is more than {{n}} minutes in the future.

**Recommended claims:** `email`, `name`, `tenantId`, `roles`.

**Key rotation:** [e.g., "JWKS endpoint at `https://{{embedder-host}}/.well-known/jwks.json` is polled every {{n}} minutes; old keys honored for a {{m}}-minute grace window."]

### 5.4 Iframe-Specific Considerations

- **Third-party cookies:** [e.g., "Many browsers block 3rd-party cookies. Either (a) host the embed under the embedder's domain via reverse proxy, (b) use Storage Access API, or (c) use the JWT handoff pattern instead of cookie-based sessions."]
- **Top-frame redirects:** [e.g., "If the IdP refuses iframe rendering, the SDK escalates to a popup or top-frame redirect. Configure `auth.redirectMode: 'popup' | 'top' | 'iframe'`."]
- **Storage Partitioning:** [e.g., "On supported browsers, request access via `document.requestStorageAccess()` triggered from a user gesture."]

### 5.5 Session Lifecycle

```
host page loads
   └─► SDK init
       └─► auth strategy resolves
           ├─► token in storage?  → validate exp; renew if close to expiry
           ├─► JWT hint provided? → validate sig + claims, mint session
           ├─► OIDC silent SSO?   → prompt=none redirect
           └─► OIDC interactive   → user-visible redirect
       └─► session ready event fires
```

### 5.6 Logout

```typescript
await sdk.auth.signOut({
  // 'local' clears only the embedded session
  // 'global' also calls IdP end_session_endpoint
  scope: 'global',
});
```

### 5.7 Multi-Tenant Embedding

- **Tenant scoping:** [e.g., "Every authenticated session is bound to a `tenantId` claim. Cross-tenant data access is rejected at the API."]
- **Tenant impersonation:** [e.g., "Not supported via the embedded UI. Backend admin tools required."]

### 5.8 Anti-Patterns

- [e.g., "Do NOT pass long-lived JWTs in URL fragments — use postMessage or SDK init."]
- [e.g., "Do NOT share OIDC client secrets — embedded clients must be public + PKCE."]
- [e.g., "Do NOT rely on `window.parent` for identity — always validate a signed token."]
