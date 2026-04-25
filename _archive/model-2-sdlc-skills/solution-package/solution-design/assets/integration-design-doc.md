# Section 8: Integration Design

> Populated by `integration-design.md`. This is Section 8 of the solution design package.

## For Brownfield Projects

### 1. Existing Integration Patterns

<!-- How the current system communicates with external systems -->

### 2. External System Inventory

| External System | Owner | Classification | Protocol | Auth | SLA | Rate Limits |
|----------------|-------|---------------|----------|------|-----|-------------|
| | | critical / important / non-critical | | | | |

### 3. Integration Patterns

| External System | Communication Pattern | Direction | Rationale |
|----------------|---------------------|-----------|-----------|
| | sync / async / event / polling / batch / streaming | | |

### 4. Data Mapping / Anti-Corruption Layers

| Integration | External Model | Internal Model | Translation Approach |
|------------|---------------|---------------|---------------------|
| | | | |

### 5. Resilience Strategy

| External System | Timeout | Retry Policy | Circuit Breaker | Fallback Behavior | Bulkhead |
|----------------|---------|-------------|----------------|-------------------|---------|
| | | | | | |

### 6. Distributed Transaction Patterns

<!-- If applicable: saga/compensation design for cross-system operations -->

| Operation | Systems Involved | Pattern | Compensation Steps |
|----------|-----------------|---------|-------------------|
| | | saga / compensation | |

### 7. Rate Limiting and Quota Management

| External API | Rate Limit | Throttling Strategy | Quota Monitoring |
|-------------|-----------|-------------------|-----------------|
| | | | |

### 8. Requirements Traceability

| External System | Integration | Change Type | Requirement ID | Requirement Summary |
|----------------|------------|------------|---------------|---------------------|
| | | | | |

## For Greenfield Projects

Same structure, omitting Section 1 (Existing Integration Patterns).
