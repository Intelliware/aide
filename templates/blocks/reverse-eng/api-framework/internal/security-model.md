---
slug: security-model
title: "Security Model"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader, security]
optional: false
order-hint: 290
---

## 19. Security Model

Document the framework's threat model, default protections, and the boundary between what the framework guarantees vs. what is the application/plugin's responsibility. Maintainers and security reviewers need this as the canonical "what does this framework promise" document. Verify against the security advisory history — past CVEs reveal where reality diverged from the model.

Be conservative in claims. Anything not explicitly listed as a guarantee is NOT a guarantee. Make the application's responsibilities just as clear (e.g., authorization, tenant isolation, output encoding for HTML), since framework users routinely assume the framework handles things it doesn't.

### Suggested template content

**Threat model (in scope):**

- Untrusted, untyped, attacker-controlled HTTP input.
- Malformed bodies (oversized, malformed JSON, deeply nested, malicious multipart).
- Slowloris and related connection-exhaustion attacks.
- Header injection, response-splitting, smuggling against the upstream.
- Replay of captured tokens (within strategy capabilities).
- Plugin-supplied code (treated as semi-trusted; same-process isolation only).

**Threat model (OUT of scope — application responsibility):**

- Business-logic authorization (the framework provides scope checks; correctness is yours).
- Tenant isolation at the data layer (framework provides `ctx.tenant`; query construction is yours).
- HTML / SQL output encoding (the framework speaks JSON; downstream encoding is yours).
- Cryptographic operations beyond TLS termination and HMAC for webhook-style signing.
- Secret storage at rest (use a secrets manager).

**Default protections (always on):**

| Protection | Mechanism | Configurable? |
|---|---|---|
| Body size limit | parser pre-buffer cap | yes |
| JSON depth limit | parser stack guard | yes |
| Header size limit | runtime | yes |
| Slowloris timeout | runtime | yes |
| HSTS on TLS | security-headers middleware | yes (off-by-default but documented) |
| `X-Content-Type-Options: nosniff` | security-headers | yes |
| Stack traces in 5xx responses | only in dev mode | yes |
| Log redaction | redactor | yes |

**Source files:**

- Security headers middleware: `{{path}}`
- Body / size guards: `{{path}}`
- Redactor (logging): `{{path}}`
- Auth bridge: `{{path}}` (see auth-extension-points block)

**Vulnerability disclosure:**

- Address: `security@{{domain}}` (PGP key: {{fingerprint}}).
- SLA: acknowledged within {{ack-window}}, fix within {{fix-window}} for high severity.
- Coordinated disclosure: standard 90 days; can be shortened for active exploitation.
- CVE assignment: via {{numbering-authority}}.

**Audit log of past advisories:**

| ID | Severity | Affected versions | Summary |
|---|---|---|---|
| `{{cve-1}}` | high | {{range}} | Body-parser DoS via deep recursion |
| `{{cve-2}}` | medium | {{range}} | Log redaction missed nested fields |

**Sandboxing / privilege separation:**

- The framework runs in a single OS process; plugins are not sandboxed (same JS realm / classloader).
- For multi-tenant deployments, isolate at the process or container level.
- Native bindings ship with their own threat model; reviewed at upgrade time.

**Cryptographic primitives:**

- The framework does NOT roll its own crypto.
- Uses runtime-provided primitives ({{primitives — e.g. `node:crypto`, `javax.crypto`}}).
- HMAC for webhook signing uses SHA-256 with constant-time comparison.

**Defaults vs. opt-ins:**

| Feature | Default |
|---|---|
| CORS | off (must opt-in) |
| Trust proxy | off; configure via `server.trust_proxy` |
| Cookies (Secure / HttpOnly / SameSite) | conservative defaults; helpers provided |

**Secrets in config:**

- Config keys with `secret: true` redacted in logs and error responses.
- Secret loading via secret-reference (`vault://...`, `file://...`) — see configuration-system block.

**Plugin author guidance:**

- Plugins MUST NOT relax framework-provided protections without explicit documentation.
- Plugins handling auth tokens MUST opt into log redaction for any new sensitive fields.
- Security-impacting changes require security review per the review checklist.

**Common pitfalls:**

- Trusting `X-Forwarded-For` without `trust_proxy` configured — IP spoofing.
- Returning user-supplied content directly via `text/html` — XSS; framework speaks JSON, deviation is your risk.
- Logging request bodies for "debugging" in production — leaks PII.
- Disabling body limits to "fix" a 413 — opens DoS surface; use streaming uploads instead.

**Cross-references:**

- See auth-extension-points block for authentication details.
- See logging-architecture block for redaction policy.
- See compatibility-strategy block for security-fix backporting.
