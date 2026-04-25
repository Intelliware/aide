# Logging Standards

## Purpose

Consistent, structured logging is critical for production observability, incident response, and debugging distributed systems. These standards ensure that log output is machine-parseable, appropriately leveled, free of sensitive data, and useful for tracing requests across service boundaries.

## Applicability

All backend services, serverless functions, and long-running workers. Frontend applications follow these standards where a logging library is in use. CLI tools and one-off scripts may relax LOG-03 (see Customization).

## Rules

### LOG-01: Use Structured Logging

**Severity:** Error
**Rule:** Emit log entries as structured objects with consistent fields (`timestamp`, `level`, `message`, `context`) — never concatenate strings to build log lines.
**Why:** Structured logs are machine-parseable, enabling reliable search, filtering, and alerting in log aggregation systems.

**Compliant:**

```typescript
logger.info("Order placed", {
  orderId: order.id,
  customerId: order.customerId,
  total: order.total,
});
```

**Non-compliant:**

```typescript
logger.info(
  "Order placed: " + order.id + " by " + order.customerId
);
```

### LOG-02: Use Correct Log Levels

**Severity:** Error
**Rule:** Use ERROR for failures requiring operator attention, WARN for degraded-but-functioning states, INFO for significant business events, and DEBUG for development diagnostics — never use ERROR for expected conditions.
**Why:** Incorrect log levels cause alert fatigue or hide real incidents.

**Compliant:**

```typescript
logger.warn("Payment retry scheduled", { attempt: 2, orderId });
logger.error("Payment gateway unreachable", { error: err.message });
```

**Non-compliant:**

```typescript
logger.error("User entered invalid email", { email });
logger.info("Database connection lost");
```

### LOG-03: No console.log in Production Code

**Severity:** Error
**Rule:** Use the application's configured logger — never use `console.log`, `console.warn`, or `console.error` in production source files.
**Why:** Console methods bypass log-level filtering, structured formatting, and transport configuration.

**Compliant:**

```typescript
logger.debug("Cache miss", { key });
```

**Non-compliant:**

```typescript
console.log("Cache miss", key);
```

### LOG-04: Include Correlation IDs

**Severity:** Error
**Rule:** Every log entry within a request chain must include a correlation or trace ID that links it to the originating request.
**Why:** Without correlation IDs, tracing a single user action across multiple services or async steps is impractical.

**Compliant:**

```typescript
logger.info("Inventory reserved", {
  traceId: ctx.traceId,
  sku,
  quantity,
});
```

**Non-compliant:**

```typescript
logger.info("Inventory reserved", { sku, quantity });
```

### LOG-05: Redact PII and Secrets

**Severity:** Error
**Rule:** Never log passwords, tokens, API keys, SSNs, full email addresses, or other sensitive data in plain text — mask or omit sensitive fields before logging.
**Why:** Leaked secrets in logs create security vulnerabilities; PII in logs violates data-protection regulations.

**Compliant:**

```typescript
logger.info("User authenticated", {
  userId: user.id,
  email: maskEmail(user.email),
});
```

**Non-compliant:**

```typescript
logger.info("User authenticated", {
  email: user.email,
  token: session.accessToken,
});
```

### LOG-06: Log at Boundaries

**Severity:** Warning
**Rule:** Log when entering and exiting external calls, service boundaries, and async operations — do not log inside tight loops or on every iteration.
**Why:** Boundary logging provides a clear trace of system interactions without generating excessive volume.

**Compliant:**

```typescript
logger.info("Calling payment gateway", { orderId });
const result = await paymentClient.charge(order);
logger.info("Payment gateway responded", { orderId, status: result.status });
```

**Non-compliant:**

```typescript
for (const item of cart.items) {
  logger.info("Processing item", { itemId: item.id });
  total += item.price;
}
```

### LOG-07: Include Operation Context

**Severity:** Warning
**Rule:** Log entries must include the operation name, relevant entity IDs, duration for timed operations, and the outcome (success/failure).
**Why:** Context-rich logs allow filtering and aggregation without cross-referencing other data sources.

**Compliant:**

```typescript
logger.info("syncInventory completed", {
  warehouseId,
  itemsSynced: 142,
  durationMs: elapsed,
  outcome: "success",
});
```

**Non-compliant:**

```typescript
logger.info("Done syncing");
```

### LOG-08: Do Not Log in Libraries at INFO+

**Severity:** Warning
**Rule:** Shared libraries and reusable modules must log only at DEBUG level — let the consuming application control which log levels are emitted.
**Why:** A library logging at INFO or above pollutes the host application's log stream and cannot be silenced without code changes.

**Compliant:**

```typescript
// Inside a shared HTTP client library
logger.debug("Request dispatched", { url, method });
```

**Non-compliant:**

```typescript
// Inside a shared HTTP client library
logger.info("Request dispatched", { url, method });
```

## Customization

- **LOG-01 format:** Organizations may choose JSON, logfmt, or another structured format depending on their log aggregation stack. The requirement is structure and consistency, not a specific serialization.
- **LOG-03 console restriction:** CLI tools, build scripts, and local-only utilities may use `console.*` methods when no logging framework is configured.
- **LOG-04 implementation:** Correlation ID propagation depends on infrastructure — OpenTelemetry, custom middleware, or cloud-native tracing (e.g., AWS X-Ray) are all acceptable as long as the ID appears in every log entry.
