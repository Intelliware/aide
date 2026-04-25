# Event-Driven API Design Standards

These are the baseline standards the AI uses when designing event-driven interfaces (Kafka, RabbitMQ, SQS/SNS, or any message broker). During Step 3 of the API design skill, the AI compares existing codebase conventions against these standards. Where the codebase deviates, the AI flags the deviation and asks the user whether new events should follow the existing pattern or adopt the standard.

These standards are broker-agnostic. They apply regardless of whether the project uses Kafka, RabbitMQ, SQS, or another platform, unless noted.

---

## 1. Topic / Queue Naming

### Rules

- Use a consistent hierarchical naming convention: `{domain}.{entity}.{action}`
- All lowercase, dot-separated
- Action should be **past tense** — the event describes something that already happened
- Include environment prefix only at the infrastructure level (not in code)

### Correct

```
order.created
order.payment.completed
user.profile.updated
inventory.stock.reserved
notification.email.sent
```

### Incorrect

```
createOrder              # verb, not past tense, no domain separation
ORDER_CREATED            # uppercase, underscore
order/created            # slash separator
new-order-event          # vague, kebab-case, "event" suffix is redundant
```

### Topic Granularity

| Approach | When to Use |
|----------|------------|
| **One topic per entity** (e.g., `order.events` with event type in payload) | Simple systems, few event types per entity, want easy topic management |
| **One topic per event type** (e.g., `order.created`, `order.cancelled`) | High-volume systems, consumers only need specific events, fine-grained filtering |

Choose one approach and apply it consistently. Do not mix within the same domain.

---

## 2. Message Envelope

### Standard Envelope Structure

Every event message should use a consistent envelope that separates metadata from the business payload:

```json
{
  "eventId": "UUID — unique identifier for this specific event instance",
  "eventType": "string — dot-separated event type (e.g., order.created)",
  "source": "string — the service that produced this event",
  "timestamp": "ISO 8601 UTC — when the event occurred",
  "version": "integer — schema version of the payload",
  "correlationId": "UUID — traces a business flow across multiple events",
  "payload": {
    "...business data..."
  }
}
```

### Example

```json
{
  "eventId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "eventType": "order.created",
  "source": "order-service",
  "timestamp": "2026-04-16T10:30:00Z",
  "version": 1,
  "correlationId": "f9e8d7c6-b5a4-3210-fedc-ba0987654321",
  "payload": {
    "orderId": "ord-123",
    "customerId": "cust-456",
    "items": [
      { "productId": "prod-789", "quantity": 2, "unitPrice": 29.99 }
    ],
    "total": 59.98,
    "currency": "USD"
  }
}
```

### Rules

- **eventId** is mandatory — consumers use it for idempotency (deduplication)
- **eventType** is mandatory — consumers use it to route/filter messages
- **source** identifies the producer — critical for debugging and auditing
- **timestamp** uses ISO 8601 in UTC — not Unix timestamps
- **version** enables schema evolution — consumers can handle multiple versions
- **correlationId** traces a business flow — the same correlationId follows an order from creation through payment, fulfillment, and delivery
- **payload** contains only business data — no infrastructure metadata inside the payload
- The envelope shape must be identical across all events in the system

### CloudEvents Compatibility

The envelope above aligns with the [CloudEvents specification](https://cloudevents.io/). If the project uses CloudEvents, map fields accordingly: `id` → `eventId`, `type` → `eventType`, `source` → `source`, `time` → `timestamp`, `datacontenttype` → `application/json`, `data` → `payload`.

---

## 3. Payload Design

### Rules

- Include all data the consumer needs — consumers should not need to call back to the producer to complete processing
- Use the same field naming convention as the rest of the system (camelCase or snake_case — be consistent)
- Include the entity ID that the event relates to (e.g., `orderId` in an order event)
- Do not include sensitive data (PII, secrets) unless the consumer genuinely needs it and the transport is secured
- Keep payloads reasonably sized — for large data, include a reference (URL or ID) rather than the full blob

### Field Types

| Type | Format | Example |
|------|--------|---------|
| IDs | UUID strings | `"orderId": "a1b2c3d4-..."` |
| Timestamps | ISO 8601 UTC | `"createdAt": "2026-04-16T10:30:00Z"` |
| Money | Decimal as string or integer cents + currency | `"amount": "59.98", "currency": "USD"` or `"amountCents": 5998` |
| Enums | Lowercase string constants | `"status": "pending"` |
| Nullable fields | Explicit null, not absent | `"cancelledAt": null` |

---

## 4. Partitioning and Ordering

### Rules

- Choose a **partition key** that groups related events for ordering guarantees
- Typically the entity ID (e.g., `orderId`) — all events for the same order arrive in order
- Events with the same partition key are processed in order within a partition
- Events with different partition keys have no ordering guarantee relative to each other

### Choosing a Partition Key

| Key | Use When |
|-----|----------|
| Entity ID (e.g., `orderId`) | Events for the same entity must be processed in order |
| Tenant/customer ID | Events for the same tenant should be processed by the same consumer for locality |
| Random / round-robin | No ordering requirement, maximize throughput and parallelism |

### Common Mistakes

- **No partition key** — events are distributed randomly, breaking ordering guarantees
- **Too few distinct keys** — one partition gets all traffic (hot partition)
- **Using a high-cardinality key with ordering needs** — spreading related events across partitions

---

## 5. Idempotency

### Rules

- Every consumer must be idempotent — processing the same event twice must produce the same result
- Use `eventId` for deduplication: before processing, check if this `eventId` was already handled
- Store processed `eventId`s in a deduplication table or cache with a TTL longer than the maximum retry window

### Implementation Patterns

| Pattern | How It Works |
|---------|-------------|
| **Deduplication table** | Store `eventId` in a database table before processing; check on each receive; use a unique constraint |
| **Idempotency key in cache** | Store `eventId` in Redis/Memcached with a TTL; check before processing |
| **Natural idempotency** | Design the operation to be naturally idempotent (e.g., `SET status = 'approved'` is idempotent; `INCREMENT counter` is not) |

### Rules

- Prefer natural idempotency in the business logic where possible
- For non-idempotent operations (counters, balance adjustments), use explicit deduplication
- The deduplication window must exceed the maximum time between retries (including DLQ reprocessing)

---

## 6. Error Handling and Dead-Letter Queues

### Retry Strategy

| Parameter | Standard |
|-----------|----------|
| **Max retries** | 3–5 attempts before routing to DLQ |
| **Backoff** | Exponential with jitter: base × 2^attempt + random jitter |
| **Initial delay** | 1 second |
| **Max delay** | 60 seconds |

### Dead-Letter Queue (DLQ) Rules

- Every topic/queue must have a corresponding DLQ
- DLQ naming convention: `{original-topic}.dlq` (e.g., `order.created.dlq`)
- Messages routed to DLQ must retain the original message, all headers, and the error reason
- DLQs must be monitored — alert when messages accumulate
- Define a reprocessing strategy: manual review, automated retry after fix, or discard with audit log

### Poison Message Handling

- A poison message is one that can never be processed successfully (e.g., schema mismatch, corrupt payload)
- After max retries, route to DLQ — do not block the queue
- Log the full message and error for debugging
- Never silently drop messages

### Common Mistakes

- **No DLQ** — a failing message blocks the entire queue or is silently lost
- **Infinite retries** — a poison message retries forever, burning resources
- **No alerting on DLQ** — messages accumulate in the DLQ and no one notices
- **Retrying non-retryable errors** — validation errors, schema mismatches, and auth failures should go directly to DLQ without retrying

---

## 7. Schema Evolution and Versioning

### Backward-Compatible Changes (No Version Bump Required)

- Adding a new **optional** field to the payload
- Adding a new event type to an existing topic

### Breaking Changes (Version Bump Required)

- Removing a field
- Renaming a field
- Changing a field's type
- Changing the meaning of a field
- Making a previously optional field required

### Versioning Strategies

| Strategy | How It Works | When to Use |
|----------|-------------|------------|
| **Version field in envelope** | `"version": 2` — consumers check version and handle accordingly | Most common; works with any broker |
| **Schema registry** (Avro/Protobuf) | Schema registry enforces compatibility; rejects breaking changes | High-maturity systems, many producers/consumers |
| **Topic-per-version** | `order.created.v2` — separate topic for new version | Simple but creates topic sprawl |
| **Dual-publish** | Publish to both v1 and v2 topics during migration, retire v1 after consumers migrate | Safest migration path for breaking changes |

### Rules

- Default to backward-compatible changes — add optional fields, don't remove or rename
- If a breaking change is unavoidable, dual-publish during a migration window
- Consumers must tolerate unknown fields — ignore fields they don't recognize
- Document the schema version in the message envelope
- If using a schema registry (Confluent, Apicurio), enforce BACKWARD compatibility mode by default

---

## 8. Consumer Group Design

### Naming Convention

```
{consuming-service}-{topic}
```

Example: `notification-service-order.created`

### Rules

- Each logical consumer has its own consumer group — two different services consuming the same topic have two different groups
- Within a consumer group, messages are distributed across instances for load balancing
- Consumer group names must be stable — changing the name resets the offset (reprocesses from the beginning or latest, depending on config)
- Configure `auto.offset.reset` explicitly: `earliest` for event sourcing / replay needs, `latest` for real-time processing where missed events are acceptable

---

## 9. Producer Design

### Rules

- Publish events **after** the database transaction commits — not before, not during
  - Pattern: Transactional outbox (write event to an outbox table in the same transaction, then publish from the outbox)
  - Or: Use CDC (Change Data Capture) to publish events from database changes
- If the broker is unavailable, the producer must not lose the event — use an outbox or local queue
- Include all mandatory envelope fields on every publish
- Set the partition key explicitly — do not rely on broker defaults

### Transactional Outbox Pattern

1. In the same database transaction: write the business data and an event record to an `outbox` table
2. A separate process (poller or CDC) reads the outbox and publishes to the broker
3. After successful publish, mark the outbox record as published

This guarantees that the event is published if and only if the business transaction committed.

### Common Mistakes

- **Publishing before commit** — if the transaction rolls back, a false event was already published
- **Publishing without outbox** — if the broker is down, the event is lost
- **Fire-and-forget** — not confirming that the broker acknowledged the message

---

## 10. Observability

### Rules

- Log every event publish and consume with: `eventId`, `eventType`, `correlationId`, processing time
- Use `correlationId` to trace a business flow across services and events
- Track these metrics per topic/consumer:
  - **Consumer lag** — how far behind the consumer is from the latest message
  - **Processing time** — how long each message takes to process
  - **Error rate** — percentage of messages that fail processing
  - **DLQ depth** — number of messages in the dead-letter queue
- Alert on: consumer lag exceeding threshold, DLQ depth increasing, error rate spike

---

## 11. Security

### Rules

- **Transport encryption** — use TLS for all broker connections
- **Authentication** — use SASL (Kafka), credentials (RabbitMQ), IAM roles (SQS/SNS) — never unauthenticated brokers in production
- **Authorization** — restrict which services can publish to or consume from each topic (topic-level ACLs)
- **Payload encryption** — if events contain sensitive data, encrypt the payload at the application level (not just transport)
- **Audit logging** — log who published what, when, for compliance-sensitive domains

---

## 12. Testing

### Rules

- **Unit test** event handlers in isolation — inject a test event, assert the side effects
- **Integration test** with an embedded or containerized broker (e.g., Testcontainers with Kafka/RabbitMQ)
- **Test idempotency** — publish the same event twice, assert the consumer handles it correctly
- **Test schema evolution** — publish a v1 event to a v2 consumer and vice versa, assert graceful handling
- **Test DLQ routing** — publish a poison message, assert it lands in the DLQ after max retries
- **Test ordering** — publish events with the same partition key, assert they're processed in order

---

## Event-Driven Design Checklist

Before finalizing a new event design, verify:

- [ ] Topic/queue name follows the naming convention (`{domain}.{entity}.{action}`, past tense)
- [ ] Message uses the standard envelope (eventId, eventType, source, timestamp, version, correlationId, payload)
- [ ] Payload includes all data consumers need — no callback to producer required
- [ ] Partition key is set and appropriate for ordering requirements
- [ ] Consumer is idempotent — deduplication by eventId or natural idempotency
- [ ] Retry policy defined (max retries, exponential backoff with jitter)
- [ ] DLQ exists for the topic/queue with monitoring and alerting
- [ ] Poison message handling defined — route to DLQ, don't block the queue
- [ ] Schema evolution rules defined — backward-compatible by default
- [ ] Every published event has at least one consumer defined
- [ ] Every consumed event has a publisher defined
- [ ] Producer uses transactional outbox or equivalent to prevent event loss
- [ ] Consumer group naming follows the convention
- [ ] Sensitive data is either excluded from payloads or encrypted
- [ ] Observability: correlationId traced, consumer lag monitored, DLQ depth alerted
