---
slug: security-implementation
title: "Security Implementation"
applies-to: [re-api-internal]
requires-decision-from: [code-reader, security]
optional: false
order-hint: 330
---

## 23. Security Implementation

This section documents the API's defensive posture: input handling, output encoding, secrets management, transport security, common-attack mitigations, and the boundary between the API's responsibilities and the platform's (WAF, mTLS, network policy). Authentication and authorization mechanics are covered in Section 8; this section covers everything *else*. Extract from the source: which security middleware is wired (helmet, CORS, rate limiter, CSRF), how secrets are loaded (env, secret manager, mounted file), and which OWASP-class mitigations are in place.

To verify, find a request handler that processes user-controlled string input and trace whether it (a) validates against a schema, (b) parameterizes any database query, (c) escapes any outbound HTML/email/SMS, and (d) rate-limits. Confirm the rate limiter is per-user/per-IP and not just global. Confirm secrets do not appear in logs (cross-check with Section 21 redaction rules).

Be careful about scoping: many "security" claims live in infrastructure (CDN WAF, k8s NetworkPolicy, ALB rules), not in the API code. Document which concerns belong to which layer so the AI doesn't try to reimplement WAF rules in middleware. Also: CORS and CSRF are sometimes both configured, sometimes one or the other depending on whether the API has cookie sessions or pure bearer-token auth.

Hallucination risks: do not claim "all inputs are validated" — find the validation library and the routes it covers; do not claim "all secrets are in vault" — confirm via the actual config loader; do not invent CSP headers if helmet isn't configured. Do not inflate security guarantees beyond what the code actually enforces.

### Suggested template content

#### 23.1 Threat Model Snapshot

| Threat | Mitigation Layer | Location in Codebase |
|--------|------------------|----------------------|
| SQL injection | {{parameterized queries / ORM}} | {{Section 15 patterns}} |
| XSS (server-rendered) | {{output encoding / templating}} | `{{e.g., n/a — JSON only}}` |
| CSRF | {{double-submit cookie / SameSite}} | `{{src/middleware/csrf.ts}}` |
| Mass assignment | {{DTO whitelist / strict-mode}} | `{{Section 9}}` |
| Path traversal | {{path normalize + allowlist}} | `{{src/storage/}}` |
| SSRF | {{outbound URL allowlist}} | `{{src/http/client.ts}}` |
| Open redirect | {{return-url allowlist}} | `{{src/auth/redirect.ts}}` |

#### 23.2 Security Middleware Chain

```{{language}}
// Order matters — document the actual application order
app.use(helmet())                  // {{secure headers}}
app.use(cors({{...}}))             // {{whitelist origins}}
app.use(rateLimiter({{...}}))      // {{per-IP + per-user}}
app.use(bodyParser.json({ limit: '{{1mb}}' }))
app.use(authMiddleware)            // {{Section 8}}
app.use(csrfMiddleware)            // {{cookie-session routes only}}
```

#### 23.3 Secrets Management

- **Storage:** {{e.g., AWS Secrets Manager / HashiCorp Vault / k8s Secrets}}
- **Loading:** {{e.g., loaded once at startup, cached in `Config` object}}
- **Rotation:** {{e.g., manual quarterly / automated via Secrets Manager}}
- **Where secrets MUST NOT appear:** logs, error messages, traces, response bodies, git history

#### 23.4 Transport & TLS

- **TLS termination:** {{e.g., at ALB / Envoy / app}}
- **Internal mTLS:** {{e.g., yes — service mesh / no}}
- **HSTS:** {{enabled, max-age=31536000}}

#### 23.5 Rate Limiting

| Scope | Limit | Window | Backend |
|-------|-------|--------|---------|
| {{anonymous IP}} | {{60 req}} | {{1 min}} | {{Redis token bucket}} |
| {{authenticated user}} | {{600 req}} | {{1 min}} | {{Redis token bucket}} |
| {{login endpoint}} | {{5 req}} | {{15 min}} | {{Redis fixed window}} |

#### 23.6 Input Validation Boundary

- All public-route bodies validated by {{Zod / class-validator / FluentValidation}} schemas (see Section 9).
- {{Path/query params validated at the same boundary}}.
- {{File uploads MIME-sniffed, not trusting Content-Type}}.

#### 23.7 Output Encoding

- {{All JSON responses serialized via the framework — no manual concatenation}}
- {{HTML emails: rendered with templating engine that auto-escapes}}
- {{Logs: structured fields only, no string concatenation with user input}}

#### 23.8 Vulnerability Surface — What is Out of Scope

- {{e.g., DDoS protection — handled by CDN/WAF}}
- {{e.g., DNS hardening — handled by platform}}
- {{e.g., container image scanning — handled in CI (Section 25)}}
