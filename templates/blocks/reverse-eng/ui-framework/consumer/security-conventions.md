---
slug: security-conventions
title: "Security Conventions"
applies-to: [re-ui-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 260
---

## 16. Security Conventions

### 16.1 XSS Prevention

- [e.g., "The framework auto-sanitizes all `[innerHTML]` bindings. Use `FwSanitizer` if you need to bypass."]
- [e.g., "Never use `bypassSecurityTrustHtml` without explicit justification."]

### 16.2 Authentication Integration

```typescript
// How the framework integrates with authentication (token attachment, session management)
```

### 16.3 Authorization / Permission Patterns

```typescript
// How to conditionally show/hide UI based on user permissions
```

```html
<!-- Template example: permission-based visibility -->
```

### 16.4 CSP (Content Security Policy) Notes

- [e.g., "The framework does not use inline styles dynamically. Compatible with strict CSP."]
- [e.g., "If using framework animations, add `'unsafe-eval'` to script-src (or use the CSP-compatible animation bundle)."]

---

# Part 5 — Recipes
