# Section 5: Backend Design

> Populated by `backend-design.md`. This is Section 5 of the solution design package.

## For Brownfield Projects

### 1. Existing Backend Patterns

<!-- Patterns extracted from the codebase with convention comparison -->

| Convention | Observed Pattern | Recommended | Aligned? | Deviation |
|-----------|-----------------|-------------|----------|-----------|
| | | | | |

### 2. Architecture Layers

<!-- Layering approach with boundary definitions and dependency direction -->
<!-- Option A: Controller → Service → Repository -->
<!-- Option B: Hexagonal / Ports & Adapters -->

### 3. Service Layer Design

| API Contract | Service | Method | Transaction | Business Rules Applied |
|-------------|---------|--------|-------------|----------------------|
| | | | | |

### 4. Domain Model

#### Entity Design

| Entity | Domain Logic | Validation Rules | Notes |
|--------|-------------|-----------------|-------|
| | | | |

#### Domain Logic Placement

| Logic Type | Where It Lives | Example |
|-----------|---------------|---------|
| Entity-level invariants | In the entity | |
| Cross-entity business rules | In the service layer | |
| Derived calculations | Entity or domain service | |
| External data-dependent rules | Service layer | |

### 5. Data Access Layer

#### Repository Design

| Repository | Key Methods | Notes |
|-----------|-------------|-------|
| | | |

#### N+1 Prevention

| Query | N+1 Risk | Prevention Strategy |
|-------|---------|-------------------|
| | | |

#### Caching Strategy

| Data | Cache? | Strategy | TTL | Invalidation |
|------|--------|----------|-----|-------------|
| | | | | |

#### Connection Management

<!-- Pool config, read replicas, transaction isolation -->

### 6. Error Handling

#### Exception Hierarchy

| Exception | HTTP Status / gRPC Code | When Thrown | Retryable |
|-----------|------------------------|------------|-----------|
| | | | |

#### Retry Strategy for Downstream Calls

| Downstream Call | Retryable | Strategy | Max Retries | Backoff |
|----------------|-----------|----------|-------------|---------|
| | | | | |

#### Circuit Breakers

<!-- If applicable -->

### 7. Background Processing

<!-- If applicable -->

| Job / Task | Trigger | Idempotent | Failure Handling | Concurrency |
|-----------|---------|-----------|------------------|-------------|
| | | | | |

### 8. Cross-Cutting Concerns

#### Logging

| What to Log | Level | Context Fields |
|------------|-------|---------------|
| | | |

#### Auth Middleware

<!-- Where auth is enforced, how user context propagates -->

#### Health Checks

<!-- Liveness and readiness endpoints -->

### 9. Implementation Consistency Rules

#### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| | | |

#### File Organization

| Feature Area | Directory | Contents |
|-------------|-----------|----------|
| | | |

#### Code Patterns

| Area | Pattern | Rationale |
|------|---------|-----------|
| | | |

### 10. Requirements Traceability

| Component | Type | Change | Requirement ID | Requirement Summary |
|-----------|------|--------|---------------|---------------------|
| | | | | |

## For Greenfield Projects

Same structure as brownfield, minus Section 1 (Existing Backend Patterns).
