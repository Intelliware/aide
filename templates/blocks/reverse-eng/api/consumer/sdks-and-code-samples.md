---
slug: sdks-and-code-samples
title: "SDKs and Code Samples"
applies-to: [re-api-consumer]
requires-decision-from: [code-reader]
optional: true
order-hint: 230
---

## 13. SDKs and Code Samples

If official or community SDKs exist, list them here with versioning, install instructions, and a minimal example. Mark optional because some APIs are intentionally raw-HTTP-only. Even when an SDK exists, document the underlying HTTP semantics elsewhere (auth, errors, etc.) so consumers using a non-blessed language don't hit a documentation cliff.

Verify each sample by running it. SDK examples that don't compile are a common source of frustration. If an SDK lags the API, mark which features are exposed vs. only available via raw HTTP. Surface the SDK's source repo so consumers can read the implementation when behavior is ambiguous.

### Suggested template content

**Official SDKs:**

| Language | Package | Source | Latest version | Covers API version |
|---|---|---|---|---|
| TypeScript / JavaScript | `{{npm-name}}` | `{{repo-url}}` | `{{ver}}` | `{{api-ver}}` |
| Python | `{{pypi-name}}` | `{{repo-url}}` | `{{ver}}` | `{{api-ver}}` |
| Go | `{{module-path}}` | `{{repo-url}}` | `{{ver}}` | `{{api-ver}}` |
| Java | `{{maven-coords}}` | `{{repo-url}}` | `{{ver}}` | `{{api-ver}}` |
| Ruby | `{{gem-name}}` | `{{repo-url}}` | `{{ver}}` | `{{api-ver}}` |

**Community SDKs (use at your own risk):**

| Language | Package | Source | Maintained? |
|---|---|---|---|
| {{lang}} | {{pkg}} | {{repo}} | {{status}} |

**SDK feature parity:**

| Feature | TS | Py | Go | Java |
|---|---|---|---|---|
| Sync calls | yes | yes | yes | yes |
| Async/streaming | yes | yes | yes | partial |
| Webhook verification helpers | yes | yes | no | no |
| Auto-pagination iterators | yes | yes | yes | yes |
| Auto-retry with backoff | yes | yes | yes | yes |

**Quickstart — TypeScript:**

```bash
npm install {{npm-name}}
```

```typescript
import { Client } from "{{npm-name}}";

const client = new Client({ apiKey: process.env.{{API_KEY_ENV}} });
const orders = await client.orders.list({ limit: 50 });
for (const o of orders) console.log(o.id);
```

**Quickstart — Python:**

```bash
pip install {{pypi-name}}
```

```python
from {{pypi-name}} import Client
client = Client(api_key=os.environ["{{API_KEY_ENV}}"])
for order in client.orders.list(limit=50):
    print(order.id)
```

**Quickstart — Go:**

```go
client := api.NewClient(os.Getenv("{{API_KEY_ENV}}"))
it := client.Orders.List(ctx, &api.ListOpts{Limit: 50})
for it.Next() { fmt.Println(it.Order().ID) }
```

**Reporting SDK bugs:**

- File issues at the SDK repo, not the API support channel.
- Include SDK version, language version, and the failing request/response (with secrets redacted).

**Without an SDK:**

- All endpoints are reachable via plain HTTP — see request-format and response-format blocks.
- Use any well-tested HTTP client (axios, requests, OkHttp, net/http).
