---
slug: backend-design
title: "Backend Design"
applies-to: [greenfield-design-package, brownfield-enhancement-spec]
requires-decision-from: [architect, lead-dev]
optional: true
order-hint: 5
---

## 5. Backend Design

<!-- Technical design for the backend API. Covers architecture, service patterns, and backend-specific concerns. -->

### 5.1 Backend Architecture Overview

[One paragraph describing the backend approach, framework, and key patterns.]

### 5.2 Layered Architecture

<!-- Define the layers and their responsibilities. -->

| Layer | Responsibility | Example Classes |
|-------|---------------|----------------|
| [e.g., Controller] | [e.g., HTTP handling, request/response mapping, validation] | [e.g., PractitionerController] |
| [e.g., Service] | [e.g., Business logic, orchestration, transaction management] | [e.g., PractitionerService] |
| [e.g., Repository] | [e.g., Data access, queries, persistence] | [e.g., PractitionerRepository] |
| [e.g., Domain/Entity] | [e.g., Data model, entity definitions] | [e.g., Practitioner, Allocation] |

**Rules:**
- [e.g., Controllers never access repositories directly]
- [e.g., Services never handle HTTP concerns]
- [e.g., Repositories never contain business logic]

### 5.3 Domain Model

<!-- Key entities and their relationships in the backend. -->

[Describe the domain model — entities, value objects, and how they map to database tables.]

### 5.4 Service Layer Design

<!-- Patterns for service classes. -->

- **Transaction Management:** [e.g., @Transactional on service methods, not controllers]
- **Validation:** [e.g., Bean Validation on DTOs, business validation in services]
- **Error Handling:** [e.g., Services throw domain exceptions, global handler maps to RFC 7807]

### 5.5 API Conventions

<!-- REST API conventions that apply across all endpoints. -->

- **Naming:** [e.g., kebab-case URLs, camelCase JSON]
- **Pagination:** [e.g., ?page=0&size=20, response includes totalElements, totalPages]
- **Filtering:** [e.g., Query parameters: ?status=ACTIVE&search=keyword]
- **Sorting:** [e.g., ?sort=lastName,asc]
- **Error Format:** [e.g., RFC 7807 Problem Details]

### 5.6 Backend Testing Strategy

| Test Type | Framework | Focus |
|-----------|----------|-------|
| [e.g., Unit Tests] | [e.g., JUnit 5 + Mockito] | [e.g., Service logic, validation rules] |
| [e.g., Integration Tests] | [e.g., @SpringBootTest + Testcontainers] | [e.g., API endpoints, database operations] |
