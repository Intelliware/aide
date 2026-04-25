---
slug: accessibility-considerations
title: "Accessibility Considerations"
applies-to: [re-web-app-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 170
---

## 7. Accessibility Considerations

<!-- The accessibility CONTRACT the embed offers to host pages. Embedders
need to know: what we guarantee, what they must do, and what may break
when their host environment differs. -->

### 7.1 Accessibility Contract

- **Conformance target:** [e.g., "WCAG 2.2 AA across all public surfaces."]
- **Audited:** [e.g., "Last external audit: {{YYYY-MM}}; report available on request."]
- **Automated checks:** [e.g., "axe-core gates every release; `npm run a11y` reports any regressions."]
- **Known gaps:** [e.g., "Drag-and-drop reordering has a keyboard fallback but no screen-reader announcements yet — tracked in {{ticket}}."]

### 7.2 What the Embed Guarantees

- [e.g., "All interactive controls are keyboard-reachable."]
- [e.g., "Visible focus indicators meet WCAG 2.4.7 contrast."]
- [e.g., "Form fields have programmatic labels; errors are announced via `aria-live`."]
- [e.g., "Modal dialogs trap focus and restore focus to the trigger on close."]
- [e.g., "Color is never the sole channel for state — every status has an icon and text."]
- [e.g., "Reduced-motion preferences are honored automatically."]
- [e.g., "Forced-Colors Mode (Windows high-contrast) is supported."]

### 7.3 What the Host MUST Provide

| Responsibility | Why |
|----------------|-----|
| Set `lang` on the iframe / host element | Screen readers pick the right voice and pronunciation |
| Provide an accessible `title` on the iframe | Screen-reader users get a meaningful frame label |
| Avoid embedding inside hidden ancestors using `aria-hidden="true"` while users may interact | Otherwise screen readers can't reach the embed |
| Pass through `prefers-reduced-motion` and `prefers-color-scheme` (don't override) | Respects user's OS-level preferences |

### 7.4 iframe-Specific Patterns

```html
<iframe
  src="https://{{embed-host}}/embed?…"
  title="{{Embedded experience name}}"
  lang="en"
  loading="lazy"
></iframe>
```

- **Focus order:** Tab moves into and out of the iframe naturally; the embed manages internal focus.
- **Skip link:** [e.g., "The embed exposes a `skip-to-content` link as the first focusable element. Embedders may add their own skip links above the iframe."]

### 7.5 Keyboard Model

| Keystroke | Action |
|-----------|--------|
| `Tab` / `Shift+Tab` | Move focus |
| `Enter` / `Space` | Activate focused control |
| `Esc` | Close the active modal/menu |
| `Arrow keys` | Navigate within composite widgets (menu, listbox, grid) |
| `?` | [Optional] Open keyboard-shortcut overlay |

Composite widgets follow [ARIA Authoring Practices Guide patterns](https://www.w3.org/WAI/ARIA/apg/) for the relevant role.

### 7.6 Screen Reader Behavior

- **Live regions:** [e.g., "Toasts use `role="status"` (`aria-live=polite`); errors use `role="alert"` (`aria-live=assertive`)."]
- **Landmarks:** [e.g., "Top-level landmarks are `banner`, `main`, `complementary`, `contentinfo`."]
- **Dynamic content:** [e.g., "List updates announce count via a polite live region."]

### 7.7 Localization and Accessibility

- The `lang` attribute is set on the embed root from the active locale.
- Numbers, dates, and currency use locale-appropriate formatting (see localization-integration).
- Right-to-left scripts (Arabic, Hebrew) use `dir="rtl"`; layout mirrors automatically.

### 7.8 Reporting Accessibility Issues

- [e.g., "Email a11y@{{embed-host}} with: page URL, screen reader + version, browser + version, repro steps."]
- [e.g., "Severity SLA: blocking issues (cannot complete a core flow) responded to within {{n}} business days."]
