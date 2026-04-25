---
slug: technology-stack
title: "Technology Stack"
applies-to: [greenfield-design-package, brownfield-enhancement-spec]
requires-decision-from: [architect, lead-dev]
optional: false
order-hint: 2
---

## 2. Technology Stack

<!-- Actionable, implementation-ready technology decisions with pinned versions. This document is THE reference for all technology choices — other design documents reference this. -->

### 2.1 Pinned Versions (Baseline)

<!-- Pin major versions to ensure consistency across all design documents and implementation. -->

```
[Language]: [Version]
[Framework]: [Version]
[Database]: [Version]
[Runtime]: [Version]
```

### 2.2 Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Language | [e.g., TypeScript] | [e.g., 5.x] | [e.g., Type-safe development] |
| Framework | [e.g., React] | [e.g., 18.2.0] | [e.g., UI component framework] |
| Routing | [e.g., React Router] | [e.g., 6.x] | [e.g., Client-side routing] |
| State Management | [e.g., TanStack Query + Context] | [e.g., 5.x] | [e.g., Server state + app state] |
| UI Components | [e.g., shadcn/ui + Tailwind CSS] | [e.g., latest] | [e.g., Design system] |
| Build Tool | [e.g., Vite] | [e.g., 5.x] | [e.g., Development server and bundler] |
| Testing | [e.g., Vitest + Playwright] | [versions] | [e.g., Unit + E2E testing] |

### 2.3 Backend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Language | [e.g., Java] | [e.g., 21] | [e.g., Backend development] |
| Framework | [e.g., Spring Boot] | [e.g., 3.5.9] | [e.g., Application framework] |
| ORM | [e.g., Spring Data JPA / Hibernate] | [version] | [e.g., Database access] |
| Migrations | [e.g., Flyway] | [version] | [e.g., Schema versioning] |
| Testing | [e.g., JUnit 5 + Testcontainers] | [versions] | [e.g., Unit + integration testing] |

### 2.4 Database Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| RDBMS | [e.g., PostgreSQL] | [e.g., 16] | [e.g., Primary data store] |
| Hosting | [e.g., Azure Database for PostgreSQL] | [e.g., Flexible Server] | [e.g., Managed service] |

### 2.5 Infrastructure & Hosting

| Category | Technology | Purpose |
|----------|-----------|---------|
| Cloud | [e.g., Microsoft Azure] | [e.g., Hosting platform] |
| Compute | [e.g., Azure Container Apps] | [e.g., Application runtime] |
| Identity | [e.g., Microsoft Entra ID] | [e.g., SSO and user management] |
| CI/CD | [e.g., GitHub Actions] | [e.g., Build and deployment pipeline] |

### 2.6 Standards & Conventions

| Standard | Specification | Usage |
|----------|--------------|-------|
| [e.g., API Errors] | [e.g., RFC 7807 Problem Details] | [e.g., All API error responses] |
| [e.g., API Documentation] | [e.g., OpenAPI 3.0] | [e.g., API contract specification] |
| [e.g., Accessibility] | [e.g., WCAG 2.1 AA] | [e.g., All user-facing interfaces] |
| [e.g., Date/Time] | [e.g., ISO 8601] | [e.g., All date/time fields in API and DB] |
