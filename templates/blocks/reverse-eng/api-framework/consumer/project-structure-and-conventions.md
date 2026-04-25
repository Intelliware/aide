---
slug: project-structure-and-conventions
title: "Project Structure and Conventions"
applies-to: [re-api-framework-consumer]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 130
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
