# Integration Design

## Purpose

Design integration patterns for how the feature communicates with existing components and external systems. Consumes: the existing-architecture-assessment (existing integration patterns, message brokers, event buses, external API integrations), the system-design (new integration seams between components), and the requirements package (data requirements for data exchange contracts, assumptions-constraints-scope for dependency map entries and integration constraints like rate limits and SLA commitments). For brownfield projects, designs new integrations to follow existing patterns — if the system uses a message broker, new async communication uses the same broker with consistent message formats; if the system uses REST between services, new inter-service calls follow the same conventions. When existing patterns are insufficient, explicitly documents the deviation with rationale. Covers: synchronous vs. asynchronous communication choices, message/event schemas, retry and dead-letter strategies, circuit breaker configuration, saga or compensation patterns for distributed transactions, external system protocols, and webhook/callback contracts. Produces integration design that is Section 8 of the solution design package.

## What This Produces

The integration architecture for the feature — how the system communicates with external systems, third-party services, and cross-team internal services. This covers the boundary between what your team controls and what it does not.

This is Section 8 of the solution design package. It builds on the system design (Section 3) which defines component boundaries, the API design (Section 7) which defines contracts, and the backend design (Section 5) which defines how services are structured internally. This section focuses on what happens at the system boundary — protocols, resilience, data mapping, SLAs, and distributed transaction patterns.

**What this section covers (and what other sections do not):**

| Concern | Where It Lives |
|---------|---------------|
| Internal API contracts (endpoint schemas, request/response) | Section 7 — API Design |
| Internal service implementation (service layer, repositories) | Section 5 — Backend Design |
| Component boundaries and communication patterns | Section 3 — System Design |
| **External system communication (third-party APIs, cross-team services)** | **Section 8 — This section** |
| **Anti-corruption layers (translating between external and internal models)** | **Section 8 — This section** |
| **Distributed transaction patterns (sagas, compensations)** | **Section 8 — This section** |
| **Data synchronization (batch, ETL, file-based)** | **Section 8 — This section** |
| **SLA management and resilience for external dependencies** | **Section 8 — This section** |
| **Rate limiting and quota management for external APIs** | **Section 8 — This section** |

## When to Use

- Included when the feature communicates with external systems or cross-team internal services
- Runs after `frontend-design` (Step 7) and before `security-architecture` (Step 9)
- May be omitted only if the feature operates entirely within the existing system boundary with no external dependencies (confirmed in the design workflow's Step 0)

## Inputs

| Input | Source | Required | If discovery was skipped |
|-------|--------|----------|--------------------------|
| System design | `docs/<feature>/solutions-package/design/03-system-design.md` — component map, communication patterns, integration seams | Yes | Yes |
| Technology stack | `docs/<feature>/solutions-package/design/02-technology-stack.md` — message brokers, API frameworks, integration tools with pinned versions | Yes | Yes |
| API design | `docs/<feature>/solutions-package/design/07-api-design.md` — event schemas, webhook contracts, inter-service API contracts | Yes (if API design ran) | Yes |
| Backend design | `docs/<feature>/solutions-package/design/05-backend-design.md` — service layer, error handling, background processing | Yes (if backend design ran) | Yes |
| Architecture baseline | `docs/<feature>/solutions-package/discovery/architecture-baseline.md` — Section 6 (Integration Points: existing external connections, protocols, auth, SLAs) | If discovery ran — identifies existing integration patterns | Identifies patterns from codebase or user input |
| Requirements package — functional requirements | `docs/<feature>/requirements-package/requirements/functional-requirements.md` — capabilities that involve external systems | Yes | Yes |
| Requirements package — data requirements | `docs/<feature>/requirements-package/requirements/data-requirements.md` — data exchange contracts, data sourced from external systems | Yes | Yes |
| Requirements package — assumptions-constraints-scope | `docs/<feature>/requirements-package/requirements/assumptions-constraints-scope.md` — dependency map, external system SLAs, rate limits, integration constraints | Yes | Yes |
| Requirements package — NFRs | `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md` — availability, latency, and reliability targets that affect integration resilience | Yes | Yes |
| Access to the codebase | Local filesystem or repository — existing integration code, API client configurations, message broker setup, adapter implementations | Yes (brownfield) — the AI reads the actual code to extract existing integration patterns | Yes if available; otherwise user provides description |

> **Missing input guard:** If the requirements package or any required input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[path]` but it was not found. This input is required. Please provide it or confirm I should proceed without it."*

## Did Discovery Run?

**Discovery ran** if `docs/<feature>/solutions-package/discovery/architecture-baseline.md` exists:

- Read Section 6 (Integration Points) — existing external system connections, protocols, authentication methods, SLAs, and data exchange formats.
- Note which external systems the existing architecture already integrates with. If the new feature adds a new connection to one of these systems, the integration pattern should follow what already exists.
- Note any integration middleware or adapters (API gateways, ESBs, message brokers, adapter services) that new integrations should route through.
- Then proceed to Step 2, where the AI reads the actual codebase to extract integration implementations.

**Discovery was skipped:**

- For brownfield projects with codebase access: the AI uses the system design's component map and integration seams (Section 3, Step 8) to identify where external connections exist, then reads the codebase to extract existing integration patterns.
- For brownfield projects without codebase access: ask the user to describe existing external integrations — what systems, what protocols, what auth, what error handling. Record as `user-stated`.
- For greenfield projects: no existing integrations to reference. Design from scratch.

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  INTEGRATION DESIGN — INTERNAL SEQUENCE                          │
├──────────────────────────────────────────────────────────────────┤
│  1. LOAD — Read all inputs                                       │
│     Read system design (integration seams), technology stack      │
│     (message brokers, integration tools), API design (event       │
│     contracts, webhook contracts), backend design (error          │
│     handling, background processing), requirements.               │
│     If discovery ran: read baseline Section 6.                   │
├──────────────────────────────────────────────────────────────────┤
│  2. EXTRACT EXISTING — Read the codebase to extract existing     │
│     integration patterns (Brownfield only)                       │
│     Read API client code, message broker config, adapter          │
│     implementations, retry/circuit breaker setup, data mapping.  │
├──────────────────────────────────────────────────────────────────┤
│  3. INVENTORY — Build the external system inventory              │
│     List every external system the feature interacts with.       │
│     For each: owner, protocol, auth, SLA, rate limits.           │
│     Classify: third-party, cross-team internal, legacy.          │
├──────────────────────────────────────────────────────────────────┤
│  4. INTEGRATION PATTERNS — Design communication approach         │
│     For each external system: sync vs async, protocol,           │
│     data format, direction, frequency.                           │
│     Determine: request-reply, fire-and-forget, pub-sub,          │
│     polling, file-based, batch, streaming.                       │
├──────────────────────────────────────────────────────────────────┤
│  5. DATA MAPPING — Design anti-corruption layers                 │
│     For each integration: how external data models map to        │
│     internal domain models. Translation logic, validation,       │
│     canonical model decisions.                                   │
├──────────────────────────────────────────────────────────────────┤
│  6. RESILIENCE — Design failure handling per integration          │
│     Retry policies, circuit breakers, timeouts, fallbacks,       │
│     bulkheads. What happens when the external system is down?    │
├──────────────────────────────────────────────────────────────────┤
│  7. DISTRIBUTED TRANSACTIONS — Design saga/compensation          │
│     patterns (if applicable)                                     │
│     For operations spanning multiple systems: orchestration      │
│     vs choreography, compensation actions, partial failure.      │
├──────────────────────────────────────────────────────────────────┤
│  8. RATE LIMITING & QUOTAS — Design throttling strategy          │
│     For each external API with rate limits: how the system       │
│     stays within limits, queueing, backpressure.                 │
├──────────────────────────────────────────────────────────────────┤
│  9. VALIDATE — Check against constraints and requirements        │
│     Every external dependency has a resilience strategy.         │
│     Every data exchange has a mapping.                           │
│     SLA targets are achievable given external constraints.       │
│     Traceability is complete.                                    │
├──────────────────────────────────────────────────────────────────┤
│  10. ASSEMBLE — Write the integration design section             │
│      Produce the structured output. Present for review.          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Load Inputs

Read all inputs. If the system design is not yet complete, stop — this skill depends on it. The API design and backend design are also important inputs if they ran (they define the contracts and error handling the integration must work with).

From the system design (Section 3), note:
- **Integration seams** (Step 8 output) — where new code connects to external systems, with existing-side expectations and risks
- **Communication patterns** (Step 5 output) — sync/async decisions between components, especially those crossing system boundaries

From the API design (Section 7), note:
- **Event-driven contracts** — event schemas, DLQ strategies, retry policies for messages. If the feature publishes events consumed by external systems (or vice versa), the API design defines the schema; this section defines the operational integration.
- **Webhook contracts** — outbound webhook delivery specs. The API design defines the payload/signature; this section defines delivery reliability and consumer SLA management.

From the backend design (Section 5), note:
- **Retry strategy and circuit breakers** for downstream calls — the backend design defines these at the service level. This section coordinates them across multiple integrations to ensure consistent resilience.

From the requirements package, note:
- **Dependency map** (assumptions-constraints-scope) — external systems listed as dependencies, their SLAs, rate limits
- **NFRs** — availability and latency targets that the integration must not violate

### Step 2 — Extract Existing Integration Patterns from the Codebase (Brownfield Only)

The AI has access to the codebase. Read integration-related source files to understand how the existing system communicates with external systems.

**What to look for:**

| Pattern Area | What to Read |
|-------------|-------------|
| **API clients** | HTTP client classes/functions that call external APIs — URL construction, auth header setup, request/response mapping, error handling |
| **Message broker setup** | Kafka/RabbitMQ/SQS producer and consumer configurations — topic names, serialization, consumer groups, DLQ config |
| **Adapter/gateway classes** | Wrapper classes that translate between external system models and internal domain models |
| **Retry and circuit breaker config** | Resilience library configuration (Resilience4j, Polly, retry decorators) — retry counts, backoff, circuit thresholds |
| **Data sync jobs** | Scheduled jobs or batch processes that sync data between systems — ETL scripts, file import/export, polling jobs |
| **Configuration** | External system URLs, API keys (references, not values), timeout settings, connection pool sizes |
| **Error handling for external calls** | How external system errors are caught, classified, logged, and surfaced |

Present the extracted patterns: **"I've read the existing integration code and identified the following patterns for communicating with external systems. Please confirm these are accurate, and let me know if there are integrations the code doesn't fully reflect (e.g., integrations managed by another team, or integrations configured outside the codebase)."**

For greenfield projects, skip this step.

### Step 3 — Build the External System Inventory

List every external system the feature interacts with. For each, capture:

| External System | Owner | Classification | Protocol | Auth | SLA | Rate Limits | Direction | Status |
|----------------|-------|---------------|----------|------|-----|------------|-----------|--------|
| *(e.g., Stripe Payment API)* | *(Third-party)* | *(Critical — payment processing)* | *(REST/HTTPS)* | *(API key)* | *(99.99% uptime, < 500ms p95)* | *(100 req/s per account)* | *(Outbound — system calls Stripe)* | *(existing)* |
| *(e.g., Email Service — SendGrid)* | *(Third-party)* | *(Non-critical — notification)* | *(REST/HTTPS)* | *(API key)* | *(99.9% uptime)* | *(600 req/min)* | *(Outbound)* | *(existing)* |
| *(e.g., Accounting Service)* | *(Cross-team — finance team)* | *(Critical — financial reconciliation)* | *(Event-driven — Kafka)* | *(mTLS)* | *(Internal SLA: < 30s processing)* | *(N/A — event-driven)* | *(Outbound — publish events)* | *(new)* |
| *(e.g., Legacy CRM)* | *(Internal — legacy)* | *(Important — customer data)* | *(SOAP/XML)* | *(WS-Security)* | *(Best-effort — no SLA)* | *(50 req/min)* | *(Inbound — CRM pushes to system)* | *(existing)* |

**Classification categories:**
- **Critical** — failure blocks the user flow; requires fallback strategy
- **Important** — failure degrades functionality but user can continue; requires retry
- **Non-critical** — failure is invisible to the user; log and continue

**Direction:**
- **Outbound** — the system calls the external system
- **Inbound** — the external system calls the system (webhooks, callbacks, file pushes)
- **Bidirectional** — both directions (sync, polling + push)

Present the inventory to the user: **"Here are all the external systems this feature integrates with. I've classified each by criticality and noted the SLAs and rate limits from the requirements. Are any systems missing? Are the classifications and SLAs correct?"**

### Step 4 — Design Integration Pattern per External System

For each external system in the inventory, determine the communication approach:

| External System | Pattern | Why This Pattern |
|----------------|---------|-----------------|
| *(Stripe)* | *(Synchronous request-reply)* | *(Payment must complete before returning to user; Stripe responds in < 500ms)* |
| *(SendGrid)* | *(Fire-and-forget via async queue)* | *(Email is non-critical; decouple from user flow to avoid latency)* |
| *(Accounting Service)* | *(Event-driven — publish domain event)* | *(Cross-team; accounting processes asynchronously; decoupled via Kafka)* |
| *(Legacy CRM)* | *(Polling + anti-corruption layer)* | *(No webhook support; CRM API is SOAP; translate to internal model)* |

**Integration pattern options:**

| Pattern | When to Use |
|---------|------------|
| **Synchronous request-reply** | External call must complete before the user flow continues; external system responds quickly; result is needed immediately |
| **Asynchronous fire-and-forget** | External call is non-critical; decouple from the user flow; accept eventual consistency |
| **Event-driven (publish)** | Cross-service communication; multiple consumers may need the event; decoupled systems |
| **Event-driven (consume)** | The system reacts to events from another system; eventual consistency is acceptable |
| **Polling** | External system has no push mechanism; data changes need to be detected periodically |
| **Batch / file-based** | Large data volumes; scheduled data exchange (daily feed, nightly ETL); legacy system constraints |
| **Streaming** | Real-time continuous data flow (sensor data, market feeds, log streams) |
| **Webhook (inbound)** | External system pushes events to the system via HTTP callback |

For brownfield projects, new integrations should follow existing patterns unless there is explicit rationale for deviation. If the existing system uses a message broker for async communication, new async integrations should use the same broker.

### Step 5 — Design Anti-Corruption Layers (Data Mapping)

For each integration where the external system's data model differs from the internal domain model, define the translation boundary:

| External System | External Model | Internal Model | Translation | Where Enforced |
|----------------|---------------|---------------|-------------|---------------|
| *(Stripe)* | *(Stripe PaymentIntent: amount in cents, currency code, status string)* | *(Payment: amount as decimal, currency enum, PaymentStatus enum)* | *(Cents → decimal, string → enum, Stripe status → internal status machine)* | *(PaymentGatewayAdapter)* |
| *(Legacy CRM)* | *(CRM Customer: XML, flat structure, nullable fields, legacy codes)* | *(Customer: typed entity, nested address, validated enums)* | *(XML → JSON, flatten → structure, code → enum, null → default)* | *(CrmAdapter)* |

**Anti-corruption layer rules:**
- External models must never leak into the domain — always translate at the boundary
- The adapter is the only component that knows the external system's data format
- If the external system changes its API, only the adapter changes — the rest of the system is unaffected
- If the external system's data is unreliable (missing fields, invalid values), the adapter validates and rejects or defaults before passing to the domain

For integrations where the data model is identical or near-identical (e.g., a well-designed internal service with shared schema definitions), note that no anti-corruption layer is needed and why.

### Step 6 — Design Resilience Strategy per Integration

For each external system, define what happens when it fails:

| External System | Criticality | Timeout | Retry Policy | Circuit Breaker | Fallback |
|----------------|------------|---------|-------------|----------------|----------|
| *(Stripe)* | *(Critical)* | *(5s)* | *(2 retries, exponential backoff: 1s, 2s)* | *(Open after 5 failures in 60s; half-open after 30s)* | *(Queue payment for retry; inform user of delay)* |
| *(SendGrid)* | *(Non-critical)* | *(10s)* | *(3 retries, exponential backoff: 2s, 4s, 8s)* | *(Open after 10 failures in 60s)* | *(Log failure; user is not notified of email failure)* |
| *(Accounting Service)* | *(Critical)* | *(N/A — event-driven)* | *(Consumer retry: 3x with backoff, then DLQ)* | *(N/A)* | *(DLQ → ops team reviews; refund not blocked)* |
| *(Legacy CRM)* | *(Important)* | *(15s)* | *(1 retry)* | *(Open after 3 failures in 120s)* | *(Use cached CRM data; flag as stale)* |

**Resilience design decisions:**
- **Timeout** — how long to wait before treating the call as failed. Must be shorter than the system's own response time target from NFRs.
- **Retry** — how many times to retry and with what backoff. Only for transient failures (timeout, 5xx). Never retry on 4xx (except 429).
- **Circuit breaker** — threshold for tripping (failure count in window), recovery behavior (half-open probing). Prevents cascading failures.
- **Fallback** — what the system does when the external call fails permanently. This is the most important design decision and depends on the criticality classification from Step 3:
  - **Critical** — must have a defined fallback (queue for later, degrade gracefully, inform user)
  - **Important** — may use cached/stale data or skip the enrichment
  - **Non-critical** — log and continue; user experience is unaffected

**Bulkhead isolation** — if the system integrates with multiple external systems, define whether external calls use separate thread pools / connection pools to prevent one slow system from exhausting resources for others.

### Step 7 — Design Distributed Transaction Patterns (If Applicable)

Only include this step if the feature involves operations that span multiple systems and must be coordinated.

**When is this needed?**
- A user action triggers changes in two or more systems that must be consistent (e.g., create order in system + charge payment in Stripe + reserve inventory in warehouse)
- Failure in one system requires compensating actions in another

**Pattern options:**

| Pattern | When to Use | Trade-offs |
|---------|------------|------------|
| **Saga — orchestration** | Central coordinator manages the sequence; each step calls a service; coordinator handles compensation on failure | Clear flow; single point of coordination; coordinator must track state |
| **Saga — choreography** | Each service reacts to events and performs its step; publishes events for the next step; each service knows its own compensation | Decoupled; no central coordinator; harder to trace the flow; compensation logic is distributed |
| **Two-phase commit** | All systems support distributed transactions (XA) | Strong consistency; high coupling; rarely appropriate for external systems |
| **Best effort + reconciliation** | Accept that systems may be temporarily inconsistent; run periodic reconciliation to detect and fix discrepancies | Simplest; acceptable when business tolerates temporary inconsistency |

For each distributed operation, define:

| Operation | Systems Involved | Pattern | Steps | Compensation |
|-----------|-----------------|---------|-------|-------------|
| *(Create refund)* | *(Refund Service, Payment Gateway, Accounting Service)* | *(Saga — orchestration)* | *(1. Create refund record → 2. Initiate payment reversal → 3. Publish accounting event)* | *(If step 2 fails: cancel refund record. If step 3 fails: refund still valid, retry event delivery from DLQ)* |

For each compensation step, define:
- What triggers it (which failure condition)
- What it reverses
- Whether it is idempotent (it must be)
- What happens if the compensation itself fails (human intervention? retry?)

### Step 8 — Design Rate Limiting and Quota Management

For each external API with rate limits:

| External API | Rate Limit | Current Usage (if known) | Strategy | Overflow Handling |
|-------------|-----------|------------------------|----------|------------------|
| *(Stripe)* | *(100 req/s)* | *(~30 req/s average, peaks to 80)* | *(Monitor usage; alert at 70% threshold)* | *(Queue excess requests with backpressure; shed non-critical calls)* |
| *(SendGrid)* | *(600 req/min)* | *(~100 req/min)* | *(Batch email sends per minute; spread load)* | *(Queue and batch; delay is acceptable for email)* |

**Rate limiting design decisions:**
- **Proactive throttling** — does the system track its own usage and throttle before hitting the limit?
- **Request queuing** — when the limit is approached, are requests queued for later delivery?
- **Priority** — if requests must be shed, which are dropped first? (Non-critical before critical)
- **Quota sharing** — if multiple services share the same external API quota, how is the quota divided?
- **Monitoring** — how is quota usage tracked? At what threshold is an alert raised?

### Step 9 — Validate

Check the completed integration design against:

- **External system inventory** — does every external dependency from the requirements have a corresponding entry?
- **System design** — do the integration patterns align with the communication patterns in Section 3?
- **API design** — do event and webhook contracts in Section 7 match what this section specifies for external systems?
- **Backend design** — are the retry/circuit breaker patterns in Section 5 consistent with the resilience strategy here?
- **NFRs** — are the availability and latency targets achievable given the external system SLAs and the resilience strategies?
- **Rate limits** — can the system operate within the external API rate limits given expected traffic?
- **Data mapping** — does every integration that crosses a model boundary have an anti-corruption layer defined?
- **Distributed transactions** — does every cross-system operation have a compensation strategy?
- **Traceability** — does every integration trace to a requirement?

### Step 10 — Assemble

Combine all sections into the integration design output. This becomes Section 8 of the solution design package.

### File Output

Write the completed section to `docs/<feature>/solutions-package/design/08-integration-design.md` using the template at `../assets/integration-design-doc.md` as the output structure.

If this section was determined to be not applicable in the design workflow's Step 0, write a stub file containing: **"Not applicable — [rationale from scoping step]."**

---

## Output Structure

### For Brownfield Projects

**1. Existing Integration Patterns** — how the current system communicates with external systems (from Step 2)

**2. External System Inventory** — every external system the feature interacts with, classified by criticality, with protocols, auth, SLAs, and rate limits (from Step 3)

**3. Integration Patterns** — communication approach per external system with rationale (from Step 4)

**4. Data Mapping / Anti-Corruption Layers** — translation between external and internal models per integration (from Step 5)

**5. Resilience Strategy** — timeout, retry, circuit breaker, fallback, and bulkhead decisions per integration (from Step 6)

**6. Distributed Transaction Patterns** — saga/compensation design for cross-system operations, if applicable (from Step 7)

**7. Rate Limiting and Quota Management** — throttling strategy per rate-limited external API (from Step 8)

**8. Requirements Traceability** — every integration traces to the requirement that drives it

### For Greenfield Projects

Same structure, omitting Section 1 (Existing Integration Patterns).

---

## Requirements Traceability

Every new or modified integration must trace to the requirement that drives it. Existing unchanged integrations carry forward without traceability.

| External System | Integration | Change Type | Requirement ID | Requirement Summary |
|----------------|------------|------------|---------------|---------------------|
| *(Accounting Service)* | *(Publish refund.completed event via Kafka)* | *(new)* | *(FR-05)* | *(Finance team must receive refund data for reconciliation)* |
| *(Stripe)* | *(Initiate payment reversal on refund approval)* | *(new)* | *(FR-04)* | *(Approved refunds must be credited to the original payment method)* |
| *(SendGrid)* | *(Send refund confirmation email)* | *(modified — new email template)* | *(FR-06)* | *(Users must be notified when their refund is processed)* |
| *(Legacy CRM)* | *(Sync refund status to customer record)* | *(new)* | *(FR-09)* | *(CRM must reflect customer refund history for support agents)* |

If an integration cannot be traced to a requirement, it must be flagged and confirmed with the user before inclusion.

---

## Hand-off Gate

Before proceeding to `security-architecture`, you must:

1. Write the completed integration design in full.
2. Present it to the user for review with the following questions:
   - **External systems:** Are all external systems identified? Are any missing?
   - **Classifications:** Are the criticality ratings correct? Should any system be classified differently?
   - **Patterns:** Are the communication patterns right for each system? Would you choose a different pattern for any?
   - **Data mapping:** Are the anti-corruption layers correctly designed? Are there translations I've missed?
   - **Resilience:** Are the timeout, retry, circuit breaker, and fallback strategies appropriate?
   - **Distributed transactions:** If applicable: is the saga/compensation approach correct? Are the compensation steps complete?
   - **Rate limiting:** Are the rate limit strategies adequate? Are the external API limits accurate?
   - **Traceability:** Is every integration connected to a requirement?
3. If the user identifies corrections, update and re-present before proceeding.
4. Do not proceed until the user explicitly confirms the integration design is accurate.

## Completion Criteria

- [ ] Every external system the feature interacts with is listed in the inventory with owner, classification, protocol, auth, SLA, and rate limits
- [ ] For brownfield: existing integration patterns are extracted from the codebase (API clients, broker config, adapters, retry setup) and confirmed by the user
- [ ] If the AI has codebase access, existing patterns are extracted from the actual code — not described from memory
- [ ] If the AI does not have codebase access, existing patterns are elicited from the user and recorded as `user-stated`
- [ ] Every integration has a defined communication pattern (sync, async, event-driven, polling, batch, streaming) with rationale
- [ ] For brownfield: new integrations follow existing patterns unless a deviation is justified
- [ ] Every integration crossing a data model boundary has an anti-corruption layer defined (or an explicit statement that none is needed and why)
- [ ] Every external system has a resilience strategy: timeout, retry policy, circuit breaker (if applicable), and fallback behavior
- [ ] Fallback behavior is defined based on criticality: critical systems have explicit fallback; non-critical systems log and continue
- [ ] If the feature involves cross-system operations: saga or compensation pattern is defined with explicit compensation steps for each failure scenario
- [ ] Compensation steps are idempotent and have a defined behavior if the compensation itself fails
- [ ] Rate limiting strategy is defined for every external API with known rate limits
- [ ] Integration patterns are consistent with the communication patterns in the system design (Section 3)
- [ ] Event and webhook contracts are consistent with the API design (Section 7)
- [ ] Resilience strategies are consistent with the backend design (Section 5)
- [ ] NFR targets (availability, latency) are achievable given external system SLAs and resilience strategies
- [ ] Requirements traceability is complete — every new or modified integration traces to a requirement
- [ ] The user has explicitly confirmed the integration design is accurate

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| An external system dependency is never identified, and the feature fails in production when it can't reach the system | Step 3 builds a complete inventory of every external system and confirms it with the user |
| External system failure cascades to the rest of the application because there is no resilience strategy | Step 6 requires timeout, retry, circuit breaker, and fallback for every external integration based on its criticality |
| External data models leak into the internal domain, coupling the system to third-party API changes | Step 5 designs anti-corruption layers that translate at the boundary; external models never reach domain code |
| A cross-system operation partially completes and there is no compensation, leaving data inconsistent | Step 7 designs saga/compensation patterns for every cross-system operation with explicit compensation steps for each failure |
| The system exceeds an external API's rate limit, gets throttled or blocked, and the feature stops working | Step 8 designs rate limiting and quota management strategies, including monitoring thresholds and overflow handling |
| New integrations use a different pattern from existing ones (REST in one place, message broker in another) without justification | Step 4 checks existing patterns for brownfield; deviations require explicit rationale |
| Timeout values are too high, causing the system to hang waiting for slow external responses | Step 6 requires explicit timeout values per integration; timeout must be shorter than the system's own response time target from NFRs |
| Circuit breaker is not configured, and a failing external system causes repeated retries that overwhelm both systems | Step 6 requires circuit breaker configuration for critical and important integrations |
| Compensation logic fails and there is no plan for what happens next | Step 7 requires each compensation step to define what happens if the compensation itself fails (human intervention, retry queue, reconciliation) |
| Multiple services share an external API quota but no one manages the allocation, leading to unpredictable throttling | Step 8 addresses quota sharing when multiple services call the same external API |
| Integration patterns are designed without awareness of the contracts already defined in the API design | Step 1 reads the API design's event schemas and webhook contracts; Step 9 validates consistency between integration design and API design |
| The backend's retry and circuit breaker strategies conflict with the integration design's resilience approach | Step 9 validates that backend design (Section 5) and integration design (Section 8) are consistent |
