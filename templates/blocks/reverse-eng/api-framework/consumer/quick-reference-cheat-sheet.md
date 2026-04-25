---
slug: quick-reference-cheat-sheet
title: "Quick Reference Cheat Sheet"
applies-to: [re-api-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 310
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
