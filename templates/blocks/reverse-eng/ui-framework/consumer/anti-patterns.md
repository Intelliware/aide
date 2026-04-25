---
slug: anti-patterns
title: "Anti-Patterns"
applies-to: [re-ui-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 280
---

## 18. Anti-Patterns

<!-- AI models tend to generate plausible-but-wrong code. This section is critical. -->

### 18.1 Component Anti-Patterns

| Anti-Pattern                                               | Why It's Wrong                                         | Correct Approach                                     |
|------------------------------------------------------------|--------------------------------------------------------|------------------------------------------------------|
| [e.g., "Wrapping `<fw-card>` in a `<div>` for layout"]    | [e.g., "Breaks grid system."]                          | [e.g., "Use `<fw-grid-item>` as wrapper."]           |
| [e.g., "Using `ViewEncapsulation.None` to style framework components"] | [e.g., "Bleeds styles globally."]           | [e.g., "Use CSS custom properties or theming API."]  |
| [anti-pattern]                                              | [why]                                                  | [correct]                                            |

### 18.2 Data/State Anti-Patterns

| Anti-Pattern                                               | Why It's Wrong                                         | Correct Approach                                     |
|------------------------------------------------------------|--------------------------------------------------------|------------------------------------------------------|
| [e.g., "Calling HTTP directly from a component"]           | [e.g., "Bypasses framework caching/error handling."]   | [e.g., "Use a `FwStore` or framework data service."] |
| [e.g., "Manual `.subscribe()` without teardown"]           | [e.g., "Memory leaks."]                                | [e.g., "Use `async` pipe or `takeUntilDestroyed()`."]|
| [anti-pattern]                                              | [why]                                                  | [correct]                                            |

### 18.3 Styling Anti-Patterns

| Anti-Pattern                                               | Why It's Wrong                                         | Correct Approach                                     |
|------------------------------------------------------------|--------------------------------------------------------|------------------------------------------------------|
| [e.g., "Using `::ng-deep` to override framework styles"]  | [e.g., "Deprecated and fragile."]                      | [e.g., "Use `--fw-*` CSS custom properties."]        |
| [e.g., "Hardcoded colors instead of tokens"]               | [e.g., "Breaks theming."]                              | [e.g., "Always use `$fw-color-*` tokens."]           |
| [anti-pattern]                                              | [why]                                                  | [correct]                                            |

### 18.4 Form Anti-Patterns

| Anti-Pattern                                               | Why It's Wrong                                         | Correct Approach                                     |
|------------------------------------------------------------|--------------------------------------------------------|------------------------------------------------------|
| [e.g., "Using `ngModel` with framework form components"]   | [e.g., "Conflicts with reactive model."]               | [e.g., "Use `fwFormControl` binding."]               |
| [anti-pattern]                                              | [why]                                                  | [correct]                                            |

### 18.5 Routing Anti-Patterns

| Anti-Pattern                                               | Why It's Wrong                                         | Correct Approach                                     |
|------------------------------------------------------------|--------------------------------------------------------|------------------------------------------------------|
| [e.g., "Eagerly importing feature components"]             | [e.g., "Defeats lazy loading, inflates initial bundle."]| [e.g., "Always use `loadChildren` or `loadComponent`."] |
| [anti-pattern]                                              | [why]                                                  | [correct]                                            |

---

# Part 6 — Quality and Maintenance
