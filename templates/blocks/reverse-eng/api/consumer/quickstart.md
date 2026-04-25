---
slug: quickstart
title: "Quickstart"
applies-to: [re-api-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 110
---

## 1. Quickstart

This block gets a new consumer from "I have nothing" to "I made a successful authenticated call" in roughly five minutes. Extract the minimum viable path: where to get credentials, what base URL to point at, and one canonical request that returns a non-trivial response. Verify each command end-to-end against the live API or a fixture before publishing — a broken quickstart is worse than no quickstart. If the API requires onboarding (signup, allowlisting, contract negotiation), call that out at the very top with realistic timelines.

Keep the example minimal but complete. Show the full curl invocation including required headers, then show the expected response shape. Avoid SDK code here — quickstart is for confirming raw connectivity. Cross-reference {{auth-block-link}} for production-grade auth and {{endpoint-catalog-link}} for the rest of the surface area.

### Suggested template content

**API at a glance:**

- **API name:** {{api-name}}
- **Production base URL:** `{{prod-base-url}}`
- **Auth model (TL;DR):** {{auth-tldr — e.g. "Bearer token in `Authorization` header; obtain via OAuth client_credentials"}}
- **Content-Type:** {{content-type — e.g. "application/json"}}
- **Status / docs link:** {{docs-url}}

**Prerequisites:**

1. {{step-1 — e.g. "Sign up for a developer account at https://..."}}
2. {{step-2 — e.g. "Create an API key in the dashboard under Settings > API"}}
3. {{step-3 — e.g. "Whitelist your egress IP if you are calling from a server"}}

**Your first call:**

```bash
curl -sS -X GET "{{prod-base-url}}/{{quickstart-endpoint}}" \
  -H "Authorization: Bearer {{YOUR_TOKEN}}" \
  -H "Accept: application/json"
```

**Expected response (HTTP 200):**

```json
{{example-response-json}}
```

**If you got a non-200, jump to:** {{error-handling-block-link}}

**Next steps:**

- Read {{auth-block-link}} to set up production credentials and rotation.
- Read {{endpoint-catalog-link}} for the full list of endpoints.
- Read {{rate-limits-block-link}} before you start load-testing.
