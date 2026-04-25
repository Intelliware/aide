---
slug: inter-component-communication
title: "Inter-Component Communication"
applies-to: [re-ui-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 200
---

## 10. Inter-Component Communication

### 10.1 Parent → Child

```typescript
// Standard @Input binding or framework-specific alternative
```

### 10.2 Child → Parent

```typescript
// Standard @Output/EventEmitter or framework-specific alternative
```

### 10.3 Sibling / Cross-Feature Communication

<!-- Does the framework provide a message bus, event system, or shared state? -->

```typescript
// Example using framework mechanism
```

### 10.4 Global App State / Context

```typescript
// How the framework manages app-wide state (user session, global config, etc.)
```

### 10.5 Framework-Specific DI Communication Patterns

<!-- Patterns like providing a service at a component level to create scoped communication. -->

```typescript
// Example if applicable
```
