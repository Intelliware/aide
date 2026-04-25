---
slug: dependency-injection-tokens-and-providers
title: "Dependency Injection Tokens and Providers"
applies-to: [re-ui-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 190
---

## 9. Dependency Injection Tokens and Providers

<!-- This section documents how to customize the framework via DI. Many frameworks allow overriding default behaviors by providing custom implementations for injection tokens. -->

### 9.1 Available Injection Tokens

| Token                           | Type                    | Default Provider                     | Purpose                                           |
|---------------------------------|-------------------------|--------------------------------------|---------------------------------------------------|
| `FW_HTTP_BASE_URL`              | `string`                | `'/'`                                | [Base URL for all framework HTTP calls.]          |
| `FW_DATE_FORMAT`                | `string`                | `'MM/dd/yyyy'`                       | [Default date display format.]                    |
| `FW_AUTH_SERVICE`               | `FwAuthService`         | `DefaultFwAuthService`               | [Provide a custom auth implementation.]           |
| `FW_ERROR_HANDLER`              | `FwErrorHandler`        | `DefaultFwErrorHandler`              | [Provide custom global error handling.]           |
| `[TOKEN_NAME]`                  | `[type]`                | `[default]`                          | [Purpose.]                                        |

### 9.2 Overriding a Token

```typescript
// Example: providing a custom auth service
import { FW_AUTH_SERVICE } from '@orgname/framework-core';
import { MyCustomAuthService } from './core/services/my-auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: FW_AUTH_SERVICE, useClass: MyCustomAuthService },
  ],
};
```

### 9.3 Provider Functions

<!-- If the framework exposes convenience `provide*()` functions. -->

| Function                                     | Purpose                                          |
|----------------------------------------------|--------------------------------------------------|
| `provideFwConfig(config: FwConfig)`           | [Registers core framework configuration.]        |
| `provideFwHttpInterceptors()`                 | [Registers framework HTTP interceptors.]         |
| `provideFwRouter(routes: Routes)`             | [Configures framework-aware routing.]            |
| `[function]`                                  | [Purpose.]                                       |

---

# Part 4 — Patterns and Guides
