---
slug: performance-patterns
title: "Performance Patterns"
applies-to: [re-ui-framework-consumer]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 250
---

## 15. Performance Patterns

### 15.1 Change Detection Strategy

<!-- Does the framework recommend or enforce OnPush? -->
- [e.g., "All framework components use `ChangeDetectionStrategy.OnPush`. Your components should too."]

### 15.2 Lazy Loading

```typescript
// The framework's recommended lazy loading pattern
```

### 15.3 Virtual Scrolling

<!-- If the framework provides virtual scrolling for large lists/tables. -->

```html
<!-- Example -->
```

### 15.4 Bundle Size Considerations

- [e.g., "Import individual components, not the entire module: `import { FwButton } from '@orgname/framework-components/button';`"]
- [e.g., "Tree-shakeable provider pattern: use `providedIn: 'root'` for services."]

### 15.5 TrackBy Conventions

```html
<!-- Required trackBy pattern for *ngFor or @for with framework components -->
```
