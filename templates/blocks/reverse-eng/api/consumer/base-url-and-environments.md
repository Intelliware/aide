---
slug: base-url-and-environments
title: "Base URL and Environments"
applies-to: [re-api-consumer]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 130
---

## 3. Base URL and Environments

List every environment the consumer can target (dev, staging, sandbox, production, region-specific). For each, document the exact base URL, any environment-specific authentication differences, data isolation guarantees (does sandbox share data with prod?), and rate-limit deltas. Verify URLs against both the API spec and a live `OPTIONS` or health-check probe — typos here cascade into hours of wasted debugging.

Call out any region routing requirements (latency-sensitive consumers, data-residency rules). If the API uses a global anycast endpoint, say so explicitly. If different environments have different TLS / mTLS requirements, document them here rather than scattered through other blocks.

### Suggested template content

**Environments:**

| Environment | Base URL | Purpose | Data isolation | Notes |
|---|---|---|---|---|
| Local / dev mock | `{{local-base-url}}` | {{purpose-1}} | Fully isolated | {{notes-1}} |
| Sandbox | `{{sandbox-base-url}}` | Integration testing | {{isolation-2}} | {{notes-2 — e.g. "Resets nightly"}} |
| Staging | `{{staging-base-url}}` | Pre-prod verification | {{isolation-3}} | {{notes-3}} |
| Production | `{{prod-base-url}}` | Live traffic | Production data | {{notes-4}} |
| {{region-X}} | `{{region-X-base-url}}` | {{e.g. "EU residency"}} | {{notes-5}} | {{notes-6}} |

**Path conventions:**

- All paths begin with `{{api-prefix — e.g. /v1}}`.
- Resources use `{{naming-convention — e.g. plural kebab-case}}`.
- Trailing slashes: {{trailing-slash-policy — e.g. "rejected; do not include"}}.

**TLS / network requirements:**

- Minimum TLS version: {{tls-min — e.g. TLS 1.2}}
- Cipher restrictions: {{cipher-policy}}
- mTLS: {{mtls-required-or-no}}
- Required egress allowlist: {{egress-cidrs-or-domains}}

**Choosing an environment:**

- Use **sandbox** when {{sandbox-criteria}}.
- Use **staging** when {{staging-criteria}}.
- Use **production** only when {{prod-criteria}}.

**Switching environments in your code:**

```{{lang}}
const BASE_URL = process.env.{{API_BASE_URL_ENV_VAR}} ?? "{{prod-base-url}}";
```
