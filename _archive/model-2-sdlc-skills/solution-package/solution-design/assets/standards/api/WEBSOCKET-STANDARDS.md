# WebSocket API Design Standards

These are the baseline standards the AI uses when designing WebSocket interfaces for real-time communication. During Step 3 of the API design skill, the AI compares existing codebase conventions against these standards. Where the codebase deviates, the AI flags the deviation and asks the user whether new WebSocket interfaces should follow the existing pattern or adopt the standard.

These standards are framework-agnostic. They apply whether the project uses Socket.IO, native WebSocket, Spring WebSocket/STOMP, ActionCable, or another library.

---

## 1. When to Use WebSocket

### Use WebSocket For

- Real-time updates pushed from server to client (live dashboards, notifications, status changes)
- Bidirectional communication (chat, collaborative editing)
- High-frequency updates where polling would be wasteful (stock tickers, game state)

### Do NOT Use WebSocket For

- Request/response interactions — use REST or GraphQL
- One-time data fetches — use REST
- Low-frequency updates (every 30+ seconds) — consider Server-Sent Events (SSE) instead
- Fire-and-forget notifications — consider push notifications or SSE

### Decision Matrix

| Need | Recommended |
|------|------------|
| Server → client only, low frequency | SSE |
| Server → client only, high frequency | WebSocket |
| Bidirectional, low frequency | WebSocket or long-polling |
| Bidirectional, high frequency | WebSocket |
| Request/response | REST / GraphQL |

---

## 2. Event Naming

### Rules

- Use a consistent dot-separated namespace: `{domain}.{entity}.{action}`
- All lowercase
- Action can be present tense (for commands from client) or past tense (for notifications from server)
- Prefix with direction if helpful: client-sent events use imperative (`subscribe`, `send`), server-sent events describe what happened (`updated`, `created`)

### Correct

```
order.status.updated           # server → client notification
chat.message.received          # server → client
chat.message.send              # client → server command
user.presence.changed          # server → client
typing.started                 # client → server
typing.stopped                 # client → server
```

### Incorrect

```
UPDATE_ORDER_STATUS            # uppercase, underscore
orderStatusUpdate              # camelCase, no separation
new-message                    # vague, kebab-case
data                           # too generic
event                          # meaningless
```

---

## 3. Message Format

### Standard Message Structure

Every WebSocket message (both directions) should use a consistent envelope:

```json
{
  "type": "string — the event name (e.g., order.status.updated)",
  "id": "string — unique message ID for acknowledgment and deduplication",
  "timestamp": "ISO 8601 UTC",
  "data": {
    "...payload..."
  }
}
```

### Server → Client Example

```json
{
  "type": "order.status.updated",
  "id": "msg-a1b2c3d4",
  "timestamp": "2026-04-16T10:30:00Z",
  "data": {
    "orderId": "ord-123",
    "previousStatus": "pending",
    "newStatus": "confirmed",
    "updatedBy": "system"
  }
}
```

### Client → Server Example

```json
{
  "type": "chat.message.send",
  "id": "msg-e5f6g7h8",
  "timestamp": "2026-04-16T10:30:05Z",
  "data": {
    "channelId": "ch-456",
    "content": "Hello, team!",
    "contentType": "text/plain"
  }
}
```

### Rules

- **type** is mandatory — used for routing/dispatching on both sides
- **id** is mandatory — used for acknowledgments, deduplication, and debugging
- **timestamp** uses ISO 8601 in UTC
- **data** contains only the business payload
- The message shape must be identical for all events — never use different top-level structures for different event types
- Use JSON as the default format; binary formats (MessagePack, Protobuf) only if performance testing justifies it

---

## 4. Connection Lifecycle

### Connection Handshake

```
1. Client opens WebSocket connection with auth token
2. Server validates token
3. If valid: connection established, server sends "connection.established" event
4. If invalid: server closes connection with appropriate close code
```

### Standard Lifecycle Events

| Event | Direction | When |
|-------|-----------|------|
| `connection.established` | server → client | Immediately after successful auth |
| `connection.error` | server → client | Auth failure or server-side issue |
| `heartbeat.ping` | client → server | Periodic keepalive (every 30s) |
| `heartbeat.pong` | server → client | Response to ping |
| `subscription.confirmed` | server → client | After client subscribes to a channel/topic |
| `subscription.error` | server → client | Subscription rejected |

### Rules

- Authenticate during the connection handshake, not after — reject unauthenticated connections immediately
- Send a `connection.established` event with the user's context (user ID, permissions) so the client knows the connection is ready
- Implement heartbeat/keepalive to detect stale connections (30-second interval is standard)
- Close stale connections server-side if no heartbeat received within 2× the interval

---

## 5. Authentication

### Standard Pattern

Pass the auth token during the WebSocket handshake:

```
// Option A: Query parameter (simple but appears in logs)
wss://api.example.com/ws?token=eyJhbGci...

// Option B: Protocol header (preferred)
new WebSocket('wss://api.example.com/ws', ['access_token', 'eyJhbGci...'])

// Option C: First message after connection (Socket.IO pattern)
socket.emit('authenticate', { token: 'eyJhbGci...' })
```

### Token Refresh

- If the token expires while connected, the server sends an `auth.token.expiring` event before closing
- The client should reconnect with a fresh token
- Alternatively, support a `auth.token.refresh` client → server event that provides a new token without disconnecting

### Rules

- Never rely on cookies alone for WebSocket auth — they're vulnerable to CSRF
- Prefer Option B (protocol header) over query parameters — query params appear in server access logs
- Validate the token on every connection, not just the first
- If auth fails mid-session (token revoked), close the connection with close code 4001

---

## 6. Channels and Subscriptions

### Subscription Model

Clients subscribe to specific channels/topics to receive relevant events:

```json
// Client → Server: subscribe
{
  "type": "subscribe",
  "id": "msg-sub-1",
  "data": {
    "channel": "order:ord-123"
  }
}

// Server → Client: confirmation
{
  "type": "subscription.confirmed",
  "id": "msg-sub-1-ack",
  "data": {
    "channel": "order:ord-123"
  }
}
```

### Channel Naming

```
{entity}:{id}           # specific resource: order:ord-123, user:usr-456
{entity}:{id}:{topic}   # sub-topic: order:ord-123:status
{scope}                 # broadcast: system-announcements, maintenance
```

### Rules

- Clients should only receive events for channels they've subscribed to
- Server must validate that the client is authorized to subscribe to each channel (e.g., a user can only subscribe to their own order updates)
- Provide an `unsubscribe` event to stop receiving updates
- On reconnection, the client must re-subscribe — subscriptions are not persisted across connections

---

## 7. Error Handling

### Error Event Format

```json
{
  "type": "error",
  "id": "msg-err-1",
  "timestamp": "2026-04-16T10:30:00Z",
  "data": {
    "code": "string — machine-readable error code",
    "message": "string — human-readable description",
    "originalMessageId": "string — the id of the message that caused the error (if applicable)"
  }
}
```

### Standard Error Codes

| Code | Meaning |
|------|---------|
| `invalid_message` | Message format is invalid (bad JSON, missing type) |
| `unknown_type` | The event type is not recognized |
| `unauthorized` | Not authenticated or token expired |
| `forbidden` | Authenticated but not authorized for this channel/action |
| `rate_limited` | Too many messages in the time window |
| `subscription_failed` | Could not subscribe to the requested channel |
| `internal_error` | Unexpected server failure |

### WebSocket Close Codes

| Code | Meaning | Use When |
|------|---------|----------|
| 1000 | Normal closure | Clean disconnect |
| 1001 | Going away | Server shutting down |
| 1008 | Policy violation | Auth failure, banned user |
| 1011 | Internal error | Unexpected server failure |
| 4001 | Authentication expired | Token expired mid-session |
| 4003 | Forbidden | User banned or permissions revoked |
| 4429 | Rate limited | Too many connections or messages |

### Rules

- Non-fatal errors (invalid message, subscription failure) — send error event, keep connection open
- Fatal errors (auth expired, banned) — send error event, then close with appropriate close code
- Never silently drop invalid messages — always respond with an error event
- Include `originalMessageId` so the client can correlate the error to the request that caused it

---

## 8. Reconnection

### Client-Side Reconnection Strategy

```
1. On disconnect, wait: min(baseDelay × 2^attempt + jitter, maxDelay)
2. Attempt reconnection with a fresh auth token
3. On successful reconnection:
   a. Re-subscribe to all previously active channels
   b. Request missed events since last received message (if supported)
4. After maxRetries, stop reconnecting and notify the user
```

### Standard Parameters

| Parameter | Standard Value |
|-----------|---------------|
| Base delay | 1 second |
| Max delay | 30 seconds |
| Max retries | 10 (then notify user) |
| Jitter | Random 0–1 second |

### Missed Event Recovery

| Strategy | How It Works | When to Use |
|----------|-------------|------------|
| **Last event ID** | Client sends last received `id` on reconnect; server replays missed events | When the server buffers recent events |
| **Timestamp-based** | Client sends `lastEventTimestamp`; server sends events after that time | When events are stored with timestamps |
| **Full state sync** | Server sends current state snapshot on reconnect | When events are ephemeral and state is what matters |
| **No recovery** | Client accepts it may miss events during disconnection | When missing events is acceptable |

### Rules

- Always use exponential backoff with jitter — do not reconnect immediately or at fixed intervals
- The server should support at least one missed event recovery strategy
- On reconnect, re-authenticate — do not assume the old session is still valid
- If the server restarts, all clients must reconnect — the server sends close code 1001 (going away)

---

## 9. Rate Limiting

### Rules

- Limit messages per connection per time window (e.g., 60 messages/minute for client → server)
- Limit total concurrent connections per user (e.g., max 5)
- When rate limited: send an error event with code `rate_limited`, then close with 4429 if the client continues
- Server → client broadcasts are not rate limited (the server controls the volume)

---

## 10. Scalability

### Rules

- WebSocket connections are stateful — plan for sticky sessions or a pub/sub backplane (Redis Pub/Sub, Kafka) across server instances
- Track connection count per server instance — alert when approaching limits
- Implement graceful shutdown: on server drain, send close code 1001 to all clients, wait for reconnection to other instances
- For high-scale scenarios, consider connection gateways that separate WebSocket termination from business logic

---

## 11. Security

### Rules

- Use `wss://` (TLS) exclusively — never `ws://` in production
- Validate origin headers to prevent cross-site WebSocket hijacking
- Sanitize all incoming message payloads — WebSocket messages are user input
- Set maximum message size (e.g., 64KB) to prevent memory exhaustion
- Log connection events (connect, disconnect, auth failure) with user ID and IP for auditing

---

## WebSocket Design Checklist

Before finalizing a new WebSocket interface design, verify:

- [ ] Event names follow the naming convention (dot-separated, lowercase)
- [ ] Messages use the standard envelope (type, id, timestamp, data)
- [ ] Authentication happens during the handshake, not after
- [ ] Token refresh/expiry handling is defined
- [ ] Channel/subscription model is defined with authorization checks
- [ ] Error events follow the standard format with error codes
- [ ] WebSocket close codes are used appropriately
- [ ] Reconnection strategy is defined (exponential backoff with jitter)
- [ ] Missed event recovery strategy is defined (last event ID, timestamp, state sync, or none)
- [ ] Rate limiting is configured for client → server messages
- [ ] Connection uses `wss://` with origin validation
- [ ] Maximum message size is enforced
- [ ] Heartbeat/keepalive is implemented (30s interval)
- [ ] Scalability: pub/sub backplane or sticky sessions for multi-instance deployments
