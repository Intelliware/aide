---
slug: testing
title: "Testing"
applies-to: [re-ui-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 300
---

## 20. Testing

### 20.1 Test Environment Setup

```typescript
// How to configure TestBed with all required framework providers
import { provideFwTestingModule } from '@orgname/framework-testing';

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      provideFwTestingModule(),
      // ...
    ],
  });
});
```

### 20.2 Unit Testing Components

```typescript
// Minimal component test
```

### 20.3 Framework-Provided Test Utilities

<!-- Test harnesses, mock services, fixture helpers. -->

| Utility                        | Import                                    | Purpose                              |
|--------------------------------|-------------------------------------------|--------------------------------------|
| `FwButtonHarness`              | `@orgname/framework-testing`              | [Test harness for `<fw-button>`.]    |
| `MockFwAuthService`            | `@orgname/framework-testing`              | [Pre-built mock for auth service.]   |
| `FwTestHelper.flush()`         | `@orgname/framework-testing`              | [Flushes async framework internals.] |
| `[utility]`                    | `[import]`                                | [Purpose.]                           |

```typescript
// Example: using a test harness
```

### 20.4 Mocking Framework Services

```typescript
// Pattern for mocking a framework store or service in tests
```

### 20.5 Integration Testing Patterns

```typescript
// Testing a feature with routing and data
```

### 20.6 E2E Testing Conventions

<!-- If the framework provides specific selectors, test IDs, or Cypress/Playwright utilities. -->

```typescript
// Example
```
