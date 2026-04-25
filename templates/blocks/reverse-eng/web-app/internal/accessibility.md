---
slug: accessibility
title: "Accessibility"
applies-to: [re-web-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 250
---

## 15. Accessibility

### 15.1 Accessibility Features

<!-- What a11y features are implemented. -->

- **ARIA Labels:** All interactive elements have `aria-label` or `aria-labelledby`
- **Keyboard Navigation:** All features fully keyboard accessible (Tab, Enter, Escape)
- **Focus Management:** Focus visible, focus trapped in modals
- **Semantic HTML:** Proper `<button>`, `<a>`, `<form>` elements
- **Color Contrast:** All text meets WCAG AA standards (4.5:1 for body text)
- **Screen Reader Testing:** Tested with NVDA and JAWS

### 15.2 ARIA Attributes

**Buttons:**
```html
<button aria-label="Close modal">×</button>
```

**Forms:**
```html
<label htmlFor="email">Email</label>
<input id="email" type="email" aria-required="true" />
```

**Regions:**
```html
<main aria-label="Main content">...</main>
<aside aria-label="Navigation">...</aside>
```
