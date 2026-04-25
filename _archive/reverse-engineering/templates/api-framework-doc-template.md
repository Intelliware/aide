# [API Framework Name] — Documentation for AI-Assisted Development

> **Purpose of this document:** This documentation is structured to enable API developers to correctly use and extend [API Framework Name]. It covers the public API, configuration patterns, and how to build applications on top of this framework. Every section prioritizes precision, concrete examples, and explicit constraints over narrative explanation.
>
> **What this document is NOT:** This is not internal framework developer documentation. Internal architecture documentation (for framework maintainers) is a separate document (Part A).
>
> **Technology covered:** Language: [e.g., TypeScript/Python/Java/Go], Framework: [e.g., NestJS/Express/FastAPI/ASP.NET Core/Spring Boot]
>
> **Documentation version:** [e.g., 2.1.0 — keep in sync with framework version]
> **Framework version covered:** [e.g., 3.4.x]
> **Last updated:** [date]

---

## Table of Contents

### Part 1 — Foundation
1. [Framework Overview](#1-framework-overview)
2. [Environment and Configuration](#2-environment-and-configuration)
3. [Project Structure and Conventions](#3-project-structure-and-conventions)

### Part 2 — Request Pipeline and Core Patterns
4. [Request Pipeline and Middleware](#4-request-pipeline-and-middleware)
5. [Base Controllers and Handlers](#5-base-controllers-and-handlers)
6. [Dependency Injection and Service Registration](#6-dependency-injection-and-service-registration)

### Part 3 — Business Logic and Data Patterns
7. [Service Layer Patterns](#7-service-layer-patterns)
8. [Data Access and Database Utilities](#8-data-access-and-database-utilities)

### Part 4 — Utilities and Decorators
9. [Validation and Transformation](#9-validation-and-transformation)
10. [Error Handling](#10-error-handling)
11. [Authentication and Authorization](#11-authentication-and-authorization)
12. [Logging and Observability](#12-logging-and-observability)
13. [Configuration Management](#13-configuration-management)

### Part 5 — Operational Concerns
14. [Health Checks and Monitoring](#14-health-checks-and-monitoring)
15. [Testing Utilities](#15-testing-utilities)

### Part 6 — Patterns and Reference
16. [Recipes and Common Patterns](#16-recipes-and-common-patterns)
17. [Anti-Patterns](#17-anti-patterns)
18. [Migration and Upgrade Notes](#18-migration-and-upgrade-notes)

### Part 7 — Reference
19. [Shared Types and Interfaces](#19-shared-types-and-interfaces)
20. [Glossary](#20-glossary)
21. [Quick Reference Cheat Sheet](#21-quick-reference-cheat-sheet)
22. [Appendix A: Complete Reference Application](#appendix-a-complete-reference-application)

---

# Part 1 — Foundation

---

## 1. Framework Overview

### 1.1 What This Framework Is

- **Name:** [Framework Name]
- **Language / Runtime:** [e.g., TypeScript / Node.js 20.x, Python 3.12, Java 21, Go 1.22, C# / .NET 8]
- **Base Framework:** [e.g., "Built on NestJS 18.x", "Built on Express 4.x", "Built on FastAPI 0.115+"]
- **Purpose:** [One or two sentences — e.g., "A structured framework for building REST APIs with built-in support for authentication, validation, error handling, and observability."]
- **Primary Packages:**

| Package                            | Purpose                                    |
|------------------------------------|--------------------------------------------|
| `@orgname/api-core`                | [e.g., "Base controllers, middleware, utilities."] |
| `@orgname/api-decorators`          | [e.g., "Validation and authorization decorators."] |
| `@orgname/api-testing`             | [e.g., "Testing utilities and fixtures."] |
| <!-- Add all distributed packages --> | |

### 1.2 Key Architectural Concepts

<!-- The 3-7 foundational concepts that everything else builds on. AI models need to understand these before seeing any API. Use a short paragraph per concept, not just a bullet. -->

**[Concept 1, e.g., "The Layered Architecture"]**

[Explain the layer separation and how they interact. e.g., "This framework enforces a three-layer architecture: Controllers handle HTTP concerns and validation, Services orchestrate business logic, and Repositories handle data access. Layers only depend downward — controllers depend on services, services depend on repositories, but never the reverse."]

**[Concept 2, e.g., "Request Lifecycle and Middleware"]**

[Explain the request flow through the pipeline. e.g., "Every request flows through middleware in order: [list middleware]. Middleware can transform the request or reject it. Controllers never see the raw HTTP request — they receive validated, transformed objects. Middleware can be configured or extended by applications."]

**[Concept 3, e.g., "Dependency Injection"]**

[e.g., "All cross-cutting concerns (databases, loggers, caches, config) are obtained via dependency injection, never instantiated directly. This framework provides a DI container that manages service lifetimes (singleton, transient, request-scoped). Applications register their own services in the same container."]

**[Concept 4, e.g., "Error Handling and Status Codes"]**

[e.g., "All errors are mapped to HTTP status codes through a global exception handler. Application code throws typed exceptions; the framework maps them to responses. Clients always receive consistent error response format: error code, message, and details."]

**[Concept 5, e.g., "Configuration Management"]**

[e.g., "All configuration comes from a central config object injected at startup. Environment-specific configuration (dev/staging/prod) is handled via config providers. Application code reads config through injected ConfigService, never from environment variables directly."]

<!-- Add as many concepts as needed (typically 5-7) -->

### 1.3 Core Philosophy and Design Principles

- **Principle 1:** [e.g., "Convention over configuration — most behaviors have sensible defaults; explicit configuration required only for exceptions."]
- **Principle 2:** [e.g., "Composition over inheritance — extend behavior through middleware and decorators, not by subclassing."]
- **Principle 3:** [e.g., "Fail fast — invalid input is rejected at the boundary, not deep in business logic."]
- **Principle 4:** [e.g., "Explicit over magic — no hidden side effects; all framework behavior is documented and opt-in."]
- **Principle 5:** [e.g., "Layering discipline — enforced separation between HTTP, business logic, and data access."]

### 1.4 When to Use / When NOT to Use This Framework

**Use this framework when:**
- [e.g., "Building REST APIs that need consistent structure across a team or organization."]
- [e.g., "You want built-in support for authentication, validation, and error handling."]
- [e.g., "You need request/response transformation and observability out of the box."]

**Do NOT use this framework when:**
- [e.g., "Building GraphQL-only APIs — this framework is REST-focused."]
- [e.g., "You need a minimal, lightweight HTTP server — this framework adds structure/overhead."]

---

## 2. Environment and Configuration

### 2.1 Prerequisites

| Dependency        | Required Version | Notes                          |
|-------------------|------------------|--------------------------------|
| [Language/Runtime]| [e.g., Node 20.x]| [e.g., "LTS only."]            |
| [Package manager] | [e.g., npm 10.x] |                                |
| [Database]        | [e.g., PostgreSQL 15+] |                            |
| [Other peer dep]  | [version]        | [notes]                        |

### 2.2 Installation

```bash
# Complete installation commands — include ALL packages
npm install @orgname/api-core @orgname/api-decorators
# OR
pip install orgname-api-core orgname-api-decorators
# OR
Add-PackageReference OrgnameApiCore

# For development/testing
npm install --save-dev @orgname/api-testing
```

### 2.3 Required Application Configuration Changes

<!-- Exact configuration and setup. AI will apply these literally when bootstrapping. -->

**Application bootstrap setup:**

```typescript
// Example: how to configure and start an application using this framework
// Include the complete bootstrap code
```

**Environment variables required:**

| Variable               | Required | Default            | Purpose                        |
|------------------------|----------|-------------------|--------------------------------|
| `[VAR_NAME]`           | Yes/No   | `[default value]`  | [e.g., "API base URL"]        |
| [var]                  | [y/n]    | [default]         | [purpose]                      |

### 2.4 Application Configuration Schema

```typescript
// The complete configuration interface/class — showing every config key the app uses.
// AI needs this to know what configuration is available when implementing features.

interface AppConfig {
  // Server and HTTP
  port: number;                       // Default: 3000
  nodeEnv: 'development' | 'staging' | 'production';

  // Database
  database: {
    host: string;
    port: number;                     // Default: 5432
    name: string;
    user: string;
    password: string;
  };

  // Authentication
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;             // Default: '15m'
    refreshTokenExpiresIn: string;    // Default: '7d'
  };

  // ... document EVERY config key available to applications
}
```

---

## 3. Project Structure and Conventions

### 3.1 Recommended Application Project Structure

<!-- AI models rely on this heavily. Be explicit about what goes where and WHY. -->

```
src/
├── main.ts                           # Application entry point — bootstraps framework
├── app.config.ts                     # Application configuration — DI providers registered here
├── app.module.ts                     # Root module/feature (or equivalent in your framework)
│
├── features/                         # One folder per feature/domain
│   └── [feature-name]/
│       ├── [feature-name].controller.ts      # HTTP layer — handles routes
│       ├── [feature-name].service.ts         # Business logic
│       ├── [feature-name].repository.ts      # Data access
│       ├── [feature-name].module.ts          # Feature module (if applicable)
│       ├── dto/                              # Data transfer objects (DTOs)
│       │   ├── create-[entity].dto.ts
│       │   ├── update-[entity].dto.ts
│       │   └── [entity].response.ts
│       └── models/                           # Domain models/entities
│           └── [entity].model.ts
│
├── shared/                           # Code used across features
│   ├── decorators/                   # Custom decorators
│   ├── pipes/                        # Custom validation pipes
│   ├── guards/                       # Custom authorization guards
│   ├── middleware/                   # Custom middleware
│   ├── services/                     # Shared services (database, cache, etc.)
│   └── types/                        # Shared interfaces and types
│
└── config/                           # Configuration management
    ├── configuration.ts              # Config schema and defaults
    └── env.ts                        # Environment variable loading and validation
```

### 3.2 Naming Conventions

| Artifact                | Convention                         | Example                              |
|-------------------------|------------------------------------|--------------------------------------|
| Controller/Handler      | [e.g., PascalCase + Controller]    | `UserController` or `productHandler` |
| Routes                  | [e.g., kebab-case]                 | `GET /users`, `POST /products`       |
| Service classes         | [e.g., PascalCase + Service]       | `UserService`, `ProductService`      |
| Repository classes      | [e.g., PascalCase + Repository]    | `UserRepository`                     |
| DTOs                    | [e.g., PascalCase + Dto]           | `CreateUserDto`                      |
| Models/Entities         | [e.g., PascalCase]                 | `User`, `Product`                    |
| Middleware functions    | [e.g., camelCase + Middleware]     | `loggingMiddleware`                  |
| Decorators              | [e.g., camelCase starting with @]  | `@IsEmail()`, `@RequireAuth()`       |
| Test files              | [convention]                       | `user.service.spec.ts`              |

---

# Part 2 — Request Pipeline and Core Patterns

---

## 4. Request Pipeline and Middleware

### 4.1 Request Lifecycle Overview

<!-- Show how a request flows through the system. -->

```
Incoming HTTP Request
    ↓
[Global Middleware 1: Logging]
    ↓
[Global Middleware 2: Authentication Check]
    ↓
[Route Matching]
    ↓
[Controller Method]
    ↓
[Service Layer]
    ↓
[Repository/Data Access]
    ↓
[Response Built]
    ↓
[Response Middleware]
    ↓
HTTP Response to Client
```

### 4.2 Built-in Middleware

<!-- Document each middleware component. -->

**[Middleware Name]**
- **Purpose:** [What this middleware does]
- **Configuration:** [Config options, if any]
- **Order:** [Runs at position X in the pipeline]
- **Extension:** [Can applications extend or override this?]

[Repeat for each middleware]

### 4.3 Adding Custom Middleware

```typescript
// Example: how to add custom middleware to the pipeline
```

### 4.4 Error Handling Pipeline

<!-- How errors are caught and converted to responses. -->

```
Error thrown in Controller/Service
    ↓
[Global Exception Handler]
    ↓
[Maps exception type to HTTP status code]
    ↓
[Formats error response]
    ↓
[Error Response Middleware (optional)]
    ↓
HTTP Error Response to Client
```

**Built-in Exception Types:**

| Exception Type | HTTP Status | When Thrown |
|---|---|---|
| [e.g., `BadRequestException`] | 400 | [e.g., "Validation fails"] |
| [exception] | [code] | [when] |

---

## 5. Base Controllers and Handlers

### 5.1 Base Controller/Handler Class

**Import:**
```typescript
import { BaseController } from '@orgname/api-core';
```

**Purpose:** [One sentence describing what this base class provides]

**What You Must Override:**

| Method | Purpose | Signature |
|---|---|---|
| [e.g., `getAll()`] | [e.g., "List all entities"] | `async getAll(req: Request): Promise<Entity[]>` |
| [method] | [purpose] | [signature] |

**What You Can Override (Optional):**

| Hook | Purpose | Default Behavior |
|---|---|---|
| [e.g., `beforeSave()`] | [e.g., "Modify entity before saving"] | [What the default does] |
| [hook] | [purpose] | [default] |

**Public Methods Available:**

| Method | Purpose | Signature |
|---|---|---|
| [e.g., `getById(id)`] | [e.g., "Get entity by ID"] | `async getById(id: string): Promise<Entity>` |
| [method] | [purpose] | [signature] |

**Minimal Implementation Example:**

```typescript
// Simplest possible controller extending this base
```

**Realistic Implementation Example:**

```typescript
// Full controller with common overrides and configurations
```

---

## 6. Dependency Injection and Service Registration

### 6.1 How Dependency Injection Works

<!-- Clear explanation of how DI works in this framework. -->

[Explanation of DI/IoC in this framework]

### 6.2 Service Registration

```typescript
// How to register services in the DI container
```

### 6.3 Service Lifetimes

| Lifetime | Behavior | When to Use |
|---|---|---|
| Singleton | [e.g., "One instance for entire application"] | [e.g., "Configuration, logger, cache"] |
| Transient | [e.g., "New instance for every injection"] | [e.g., "DTOs, temporary objects"] |
| Request-Scoped | [e.g., "One instance per HTTP request"] | [e.g., "Request context, user session"] |

### 6.4 Injecting Services

```typescript
// Example: how to inject dependencies into controllers and services
```

### 6.5 Overriding Default Providers

```typescript
// Example: how to replace a framework-provided service with a custom implementation
```

---

# Part 3 — Business Logic and Data Patterns

---

## 7. Service Layer Patterns

### 7.1 Service Base Class (if applicable)

**Purpose:** [What base services provide]

**Key Methods:**

[Document public methods]

**Example Service:**

```typescript
// Example of implementing a business logic service
```

### 7.2 Service Patterns and Best Practices

[Document recommended patterns for organizing services]

---

## 8. Data Access and Database Utilities

### 8.1 Repository Base Class (if applicable)

**Purpose:** [What repository base classes provide]

**Key Methods:**

[Document public methods and their signatures]

### 8.2 Query Building and Filtering

[Document how to build queries, apply filters, pagination]

### 8.3 Database Utilities and Helpers

[Document any ORM-specific or database-specific utilities provided by the framework]

### 8.4 Transactions

[Document how to use transactions in services]

---

# Part 4 — Utilities and Decorators

---

## 9. Validation and Transformation

### 9.1 Built-in Validation Decorators

<!-- Document every available validation decorator. -->

**@[DecoratorName]**
- **Purpose:** [What this validates]
- **Parameters:** [name, type, optional/required, description]
- **Error Message:** [What message is shown on failure]
- **Usage:**

```typescript
// Example usage
```

[Repeat for each validation decorator]

### 9.2 Custom Validators

```typescript
// Example: how to create a custom validator
```

---

## 10. Error Handling

### 10.1 Built-in Exception Types

| Exception | HTTP Status | When to Use |
|---|---|---|
| [e.g., `BadRequestException`] | 400 | [e.g., "Validation failures, invalid input"] |
| [exception] | [code] | [usage] |

### 10.2 Throwing and Handling Errors

```typescript
// Example: how to throw errors in controllers and services
```

### 10.3 Global Error Handling

[Document how the framework handles errors, transforms them to HTTP responses]

---

## 11. Authentication and Authorization

### 11.1 Built-in Auth Utilities

[Document authentication decorators, guards, and utilities]

### 11.2 Authentication Patterns

```typescript
// Example: implementing authentication
```

### 11.3 Authorization Patterns

```typescript
// Example: checking authorization/permissions
```

---

## 12. Logging and Observability

### 12.1 Logger Service

```typescript
// How to use the framework's logger
```

### 12.2 Structured Logging

[How to add context and structure to logs]

### 12.3 Metrics and Tracing

[What observability utilities does the framework provide?]

---

## 13. Configuration Management

### 13.1 ConfigService

```typescript
// How to inject and use ConfigService
```

### 13.2 Type-Safe Configuration

```typescript
// How to define and validate configuration schemas
```

### 13.3 Environment-Specific Configuration

[How to handle dev/staging/prod differences]

---

# Part 5 — Operational Concerns

---

## 14. Health Checks and Monitoring

### 14.1 Health Check Endpoints

[Document built-in health check utilities]

### 14.2 Monitoring and Metrics

[What monitoring utilities are available?]

---

## 15. Testing Utilities

### 15.1 Testing Framework Integration

[How to set up tests for applications built with this framework]

### 15.2 Available Test Helpers and Fixtures

[Document testing utilities provided by the framework]

### 15.3 Testing Services

```typescript
// Example: testing a service
```

### 15.4 Testing Controllers

```typescript
// Example: testing a controller
```

---

# Part 6 — Patterns and Reference

---

## 16. Recipes and Common Patterns

### 16.1 CRUD Endpoint Pattern

[Complete example of implementing Create, Read, Update, Delete endpoints]

### 16.2 [Pattern Name]

[Document another common pattern]

[Add more recipes as needed]

---

## 17. Anti-Patterns

### 17.1 [Anti-Pattern Name]

**What's Wrong:**

```typescript
// Example of the anti-pattern
```

**Why It's Wrong:** [Explain the problems]

**Correct Approach:**

```typescript
// Correct way to do this
```

[Repeat for each anti-pattern]

---

## 18. Migration and Upgrade Notes

### 18.1 Upgrading from [Previous Version]

[Document breaking changes and migration steps]

---

# Part 7 — Reference

---

## 19. Shared Types and Interfaces

### 19.1 Request/Response Interfaces

[Document common request and response DTOs used by the framework]

### 19.2 Framework-Provided Interfaces

[Document interfaces that applications must implement]

### 19.3 Error Response Format

```typescript
// The standard error response format
```

---

## 20. Glossary

| Term | Definition |
|---|---|
| [e.g., "DTO"] | [e.g., "Data Transfer Object — used to transform data between HTTP and business logic layers"] |
| [term] | [definition] |

---

## 21. Quick Reference Cheat Sheet

### Quick HTTP Request Flow

```
1. Request arrives
2. Middleware processes it
3. Router matches route → Controller
4. Controller calls Service
5. Service calls Repository
6. Repository queries database
7. Data flows back up
8. Response sent to client
```

### Common Decorators

| Decorator | Purpose |
|---|---|
| `@Post()` | [e.g., "Marks a controller method as a POST handler"] |
| `@Param()` | [e.g., "Extracts URL parameters"] |
| [decorator] | [purpose] |

### Common Service Methods

[Quick reference for frequently used service/utility methods]

---

## 22. Appendix A: Complete Reference Application

[Provide a complete, runnable example application that demonstrates all major framework features: controllers, services, repositories, validation, error handling, testing, etc.]

```
src/
├── features/
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       ├── update-user.dto.ts
│   │       └── user.response.ts
│   │
│   ├── products/
│   │   └── [similar structure]
│   │
│   └── orders/
│       └── [similar structure]
│
├── shared/
│   ├── decorators/
│   ├── guards/
│   └── services/
│
├── config/
│   └── configuration.ts
│
└── main.ts
```

[Include complete source files for each component]

---

## Conclusion

This framework provides a structured foundation for building APIs with consistent patterns, built-in error handling, validation, and observability. Follow the conventions documented here to ensure your API is maintainable, testable, and predictable.

For framework maintainer documentation, see Part A documentation.
