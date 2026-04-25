---
slug: event-and-callback-api
title: "Event and Callback API"
applies-to: [re-web-app-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 160
---

## 6. Event and Callback API

<!-- The full list of events the embedded app emits and the callbacks
embedders can register. This is a contract — payloads are typed and
versioned. -->

### 6.1 Event Surfaces

| Surface | Use case |
|---------|----------|
| SDK `on(name, fn)` | In-process subscriptions (same-origin SDK / Web Component) |
| `postMessage` events | Cross-origin iframe |
| Webhooks | Server-side, durable |
| DOM `CustomEvent` | Web Component, with `bubbles: true` and `composed: true` |

### 6.2 Lifecycle Events

| Event | Fires when | Payload |
|-------|------------|---------|
| `ready` | Embed has fully mounted and is interactive | `{ version: string }` |
| `auth:signed-in` | User session established | `{ user: { id, email, displayName, tenantId } }` |
| `auth:signed-out` | User session cleared | `{ reason: 'user' \| 'expired' \| 'forced' }` |
| `auth:error` | Auth failed | `{ code: string; message: string }` |
| `error` | Uncaught error in embed (non-fatal) | `{ code: string; message: string }` |

### 6.3 Domain Events

<!-- Replace {{Item}} with each domain entity that emits events. -->

| Event | Fires when | Payload |
|-------|------------|---------|
| `{{item}}:selected` | User selects an item | `{ id: string; entity: '{{item}}' }` |
| `{{item}}:created` | Item is created and persisted | `{ id, … }` |
| `{{item}}:updated` | Item is updated | `{ id, before, after }` |
| `{{item}}:deleted` | Item is deleted | `{ id }` |
| `navigate` | User navigates within the embed | `{ from: string; to: string }` |

### 6.4 Subscribing — SDK / Web Component

```typescript
const off = sdk.on('{{item}}:created', (payload) => {
  console.log('Created:', payload.id);
});

// Unsubscribe
off();
```

**Web Component alternative — DOM events:**

```typescript
const el = document.querySelector('{{tag-name}}');
el.addEventListener('{{prefix}}-{{item}}-created', (ev) => {
  console.log(ev.detail);
});
```

### 6.5 Subscribing — postMessage (iframe)

```typescript
const TRUSTED_ORIGIN = 'https://{{embed-host}}';

window.addEventListener('message', (ev) => {
  if (ev.origin !== TRUSTED_ORIGIN) return;
  if (ev.data?.type !== 'event') return;

  const { name, payload } = ev.data;
  // dispatch on `name`
});
```

### 6.6 Callbacks (Synchronous Hooks)

<!-- Some integration points require an answer, not just a notification. -->

| Callback | Purpose | Signature | Veto-able? |
|----------|---------|-----------|------------|
| `resolveUser` | Resolve user details from a custom IdP | `(idHint) => Promise<User>` | No |
| `confirmDestroy` | Show host's confirm UI before deletion | `(item) => Promise<boolean>` | Yes — resolve `false` to cancel |
| `formatDate` | Override how dates render | `(d, locale) => string` | No |
| `[name]` | [purpose] | [signature] | [yes/no] |

```typescript
sdk.init({
  callbacks: {
    confirmDestroy: async (item) => {
      return window.hostUI.confirm(`Delete ${item.name}?`);
    },
  },
});
```

### 6.7 Event Versioning

- **Naming:** `domain:action` (kebab-case for `action`).
- **Payload evolution:** New optional fields may be added in minor releases. Required fields and field types are stable across major versions.
- **Deprecation:** [e.g., "Deprecated events fire a console warning for one major version before removal. See deprecation-policy."]
- **Internal events:** Names starting with `_` are internal and may change without notice.

### 6.8 Ordering and Delivery Guarantees

- **In-process (SDK / Web Component):** synchronous, ordered per emitter.
- **postMessage:** ordered per source/target pair, but `event` and `response` envelopes may interleave; correlate with `id`.
- **Webhooks:** at-least-once, NOT ordered. Consumers must reconcile via `occurredAt` and idempotency keys.
