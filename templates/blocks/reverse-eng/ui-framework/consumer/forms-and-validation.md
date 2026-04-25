---
slug: forms-and-validation
title: "Forms and Validation"
applies-to: [re-ui-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 220
---

## 12. Forms and Validation

### 12.1 Framework Form Approach

<!-- Does the framework wrap Angular Reactive Forms? Provide its own primitives? -->

```typescript
// Example: building a basic form
```

```html
<!-- Corresponding template -->
```

### 12.2 Built-in Validators

| Validator                     | Usage                                      | Description                       |
|-------------------------------|--------------------------------------------|-----------------------------------|
| `FwValidators.required`       | `[e.g., control-level]`                    | [What it checks.]                 |
| `FwValidators.email`          | `[usage]`                                  | [What it checks.]                 |
| `FwValidators.minLength(n)`   | `[usage]`                                  | [What it checks.]                 |
| `[validator]`                 | `[usage]`                                  | [What it checks.]                 |

### 12.3 Custom Validator Pattern

```typescript
// How to write a custom validator the framework way
```

### 12.4 Async Validation

```typescript
// Example: async validator (e.g., checking username availability)
```

### 12.5 Cross-Field Validation

```typescript
// Example: validating that two fields match
```

### 12.6 Error Display Conventions

```html
<!-- How validation errors are displayed using framework components -->
```

### 12.7 Dynamic Forms

<!-- If the framework supports generating forms from config/schema. -->

```typescript
// Example: building a form from a config object
```

### 12.8 Form Arrays / Repeatable Sections

```typescript
// Example: adding/removing dynamic form rows
```
