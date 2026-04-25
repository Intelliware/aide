---
slug: testing-strategy
title: "Testing Strategy"
applies-to: [greenfield-design-package, brownfield-enhancement-spec]
requires-decision-from: [architect, lead-dev, qa]
optional: false
order-hint: 15
---

## 15. Testing Strategy

### 15.1 Testing Pyramid

| Level | Quantity | Speed | Focus |
|-------|---------|-------|-------|
| [Unit Tests] | [Many] | [Fast] | [Individual functions, services, components] |
| [Integration Tests] | [Moderate] | [Medium] | [API endpoints, database operations] |
| [E2E Tests] | [Few] | [Slow] | [Critical user journeys] |

### 15.2 Test Environment Strategy

| Environment | Database | External Services | Data |
|------------|----------|------------------|------|
| [e.g., Unit Tests] | [e.g., Mocked] | [e.g., Mocked] | [e.g., In-memory fixtures] |
| [e.g., Integration Tests] | [e.g., Testcontainers PostgreSQL] | [e.g., Mocked/WireMock] | [e.g., Test fixtures] |
| [e.g., E2E Tests] | [e.g., Staging DB copy] | [e.g., Staging services] | [e.g., Seeded test data] |

### 15.3 Test Data Management

[How test data is created, maintained, and cleaned up.]
