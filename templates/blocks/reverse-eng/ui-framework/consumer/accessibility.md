---
slug: accessibility
title: "Accessibility"
applies-to: [re-ui-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 310
---

## 21. Accessibility

### 21.1 Built-in A11y Features

- [e.g., "All form components auto-generate `id`, `for`, and `aria-describedby` from the `label` input."]
- [e.g., "Framework modals trap focus and restore it on close."]

### 21.2 Required Developer Actions

- [e.g., "Always provide `label` input on `<fw-input>` — it is used for `aria-label`."]
- [e.g., "Use `<fw-sr-only>` for screen-reader-only text."]
- [e.g., "Use `fwAriaLive` directive for dynamic content announcements."]

### 21.3 Keyboard Navigation

| Component         | Keyboard Behavior                                                |
|-------------------|------------------------------------------------------------------|
| `<fw-menu>`       | [e.g., "Arrow keys navigate, Enter selects, Escape closes."]    |
| `<fw-table>`      | [e.g., "Tab moves between focusable cells."]                    |
| `[component]`     | [behavior]                                                       |

### 21.4 Focus Management Patterns

```typescript
// Example: programmatic focus management after a dialog closes or a route changes
```

---

# Part 7 — Reference
