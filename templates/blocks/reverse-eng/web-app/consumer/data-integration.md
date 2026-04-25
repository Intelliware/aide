---
slug: data-integration
title: "Data Integration"
applies-to: [re-web-app-consumer]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 140
---

## 4. Data Integration

<!-- How data crosses the boundary in BOTH directions: into the embedded app
(seeding, prefill, configuration) and out of it (exports, webhooks, postMessage,
public API). -->

### 4.1 Inbound Data Channels

| Channel | Direction | Use case |
|---------|-----------|----------|
| Init config (SDK / attributes) | host → app | One-shot configuration at mount |
| `postMessage` (iframe) | host → app | Runtime updates, command invocation |
| Public REST API | server → app | Authoritative data source |
| Server-to-server webhook | host backend → our backend | Out-of-band data sync |
| Prefill via URL params | host → app | Deep-linking with state |

### 4.2 Outbound Data Channels

| Channel | Direction | Use case |
|---------|-----------|----------|
| `postMessage` events | app → host | Runtime notifications |
| SDK callbacks | app → host | Typed in-process events |
| Webhooks (server-side) | our backend → host backend | Async events |
| CSV / JSON export | app → user (file) | Manual export |
| Public REST API (read) | server → host backend | Pull-style integration |

### 4.3 postMessage Protocol (iframe)

**Envelope shape:**

```typescript
type Envelope =
  | { type: 'request';  id: string; method: string; params?: unknown }
  | { type: 'response'; id: string; result?: unknown; error?: { code: string; message: string } }
  | { type: 'event';    name:  string; payload?: unknown };
```

**Origin handshake:**

```typescript
// On the host page
const iframe = document.querySelector('iframe#{{id}}');
const TRUSTED_ORIGIN = 'https://{{embed-host}}';

window.addEventListener('message', (ev) => {
  if (ev.origin !== TRUSTED_ORIGIN) return;     // ALWAYS verify origin
  if (ev.source !== iframe.contentWindow) return;
  // handle ev.data as Envelope
});

// Send a command into the iframe
iframe.contentWindow.postMessage(
  { type: 'request', id: '1', method: 'setFilter', params: { status: 'open' } },
  TRUSTED_ORIGIN,
);
```

### 4.4 Seeding / Prefill

```typescript
// SDK: seed initial data before mount completes
sdk.init({
  initialData: {
    user: { id: '{{u}}', email: '{{e}}', displayName: '{{n}}' },
    selection: { itemId: '{{id}}' },
  },
});
```

| Field | Purpose | Required |
|-------|---------|----------|
| `user` | Identity hint (does NOT replace authenticated session) | No |
| `selection` | Pre-selected entity for deep links | No |
| `filters` | Initial filter state | No |
| [field] | [purpose] | [yes/no] |

### 4.5 Public REST API Surface

- **Base URL:** `https://api.{{embed-host}}/v{{n}}/`
- **Auth:** [e.g., "Bearer token (machine-to-machine) — see authentication-integration."]
- **Idempotency:** [e.g., "All POST endpoints accept `Idempotency-Key` header."]
- **Pagination:** [e.g., "Cursor-based: `?cursor=…&limit=…`; envelope `{ data, page: { next, prev } }`."]
- **Rate limits:** [e.g., "{{n}} requests / minute per token; 429 with `Retry-After` on overflow."]

| Resource | Method + path | Purpose |
|----------|----------------|---------|
| `Item` | `GET /items` | List |
| `Item` | `POST /items` | Create |
| `Item` | `GET /items/{id}` | Read |
| `Item` | `PATCH /items/{id}` | Update |
| `Item` | `DELETE /items/{id}` | Delete |
| [resource] | [method+path] | [purpose] |

### 4.6 Webhooks (Server → Host)

```http
POST {{host-webhook-url}}
Content-Type: application/json
X-{{Prefix}}-Signature: sha256=…
X-{{Prefix}}-Timestamp: 1714000000

{
  "event": "item.created",
  "id": "evt_…",
  "data": { /* event payload */ },
  "occurredAt": "2025-04-25T10:00:00Z"
}
```

- **Signature:** [e.g., "HMAC-SHA256 of `timestamp.body` using shared secret. Reject if timestamp skew > 5 minutes."]
- **Retries:** [e.g., "Exponential backoff: 1m, 5m, 30m, 2h, 12h. After {{n}} failures the subscription is suspended."]
- **At-least-once:** [e.g., "Events may be redelivered; consumers MUST be idempotent on `id`."]

### 4.7 Exports and Bulk Data

| Export | Formats | Trigger | Notes |
|--------|---------|---------|-------|
| User-initiated CSV | CSV, JSON | UI button | Streamed; max {{rows}} rows per export |
| Scheduled bulk | NDJSON | Server-side | Via [export API endpoint] |
| [Other] | [formats] | [trigger] | [notes] |

### 4.8 Data-Integration Anti-Patterns

- [e.g., "Don't poll the iframe via postMessage at high frequency — subscribe to events instead."]
- [e.g., "Don't pass authentication tokens through URL parameters — use postMessage or the SDK."]
- [e.g., "Don't use the public API as a sync source for primary records — use webhooks for change events."]
