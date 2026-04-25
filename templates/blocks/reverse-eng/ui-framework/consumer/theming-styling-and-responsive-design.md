---
slug: theming-styling-and-responsive-design
title: "Theming, Styling, and Responsive Design"
applies-to: [re-ui-framework-consumer]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 140
---

## 4. Theming, Styling, and Responsive Design

### 4.1 Styling Approach

- **Styling method:** [e.g., "SCSS with framework-provided design tokens."]
- **Component styles:** [e.g., "Use Angular ViewEncapsulation.Emulated (default). Never use None."]
- **Global styles:** [e.g., "Import framework base styles in `styles.scss`. App-level overrides go in `_variables.scss`."]

### 4.2 Design Tokens / Variables

<!-- Complete list. AI must use these instead of hardcoded values. -->

**Colors:**
```scss
$fw-color-primary: ...;
$fw-color-primary-light: ...;
$fw-color-primary-dark: ...;
$fw-color-secondary: ...;
$fw-color-success: ...;
$fw-color-warning: ...;
$fw-color-danger: ...;
$fw-color-info: ...;
$fw-color-text-primary: ...;
$fw-color-text-secondary: ...;
$fw-color-background: ...;
$fw-color-surface: ...;
$fw-color-border: ...;
// ... complete list
```

**Spacing Scale:**
```scss
$fw-spacing-xxs: ...;   // [e.g., 4px]
$fw-spacing-xs: ...;    // [e.g., 8px]
$fw-spacing-sm: ...;    // [e.g., 12px]
$fw-spacing-md: ...;    // [e.g., 16px]
$fw-spacing-lg: ...;    // [e.g., 24px]
$fw-spacing-xl: ...;    // [e.g., 32px]
$fw-spacing-xxl: ...;   // [e.g., 48px]
```

**Typography:**
```scss
$fw-font-family-base: ...;
$fw-font-family-mono: ...;
$fw-font-size-xs: ...;
$fw-font-size-sm: ...;
$fw-font-size-md: ...;
$fw-font-size-lg: ...;
$fw-font-size-xl: ...;
$fw-font-weight-normal: ...;
$fw-font-weight-medium: ...;
$fw-font-weight-bold: ...;
$fw-line-height-tight: ...;
$fw-line-height-normal: ...;
$fw-line-height-relaxed: ...;
```

**Borders and Radii:**
```scss
$fw-border-radius-sm: ...;
$fw-border-radius-md: ...;
$fw-border-radius-lg: ...;
$fw-border-radius-full: ...;
$fw-border-width: ...;
$fw-border-color: ...;
```

**Shadows and Elevation:**
```scss
$fw-shadow-sm: ...;
$fw-shadow-md: ...;
$fw-shadow-lg: ...;
```

**Z-index Scale:**
```scss
$fw-z-index-dropdown: ...;
$fw-z-index-sticky: ...;
$fw-z-index-modal: ...;
$fw-z-index-toast: ...;
$fw-z-index-tooltip: ...;
```

### 4.3 Responsive Breakpoints

| Name        | Min-width  | Token / Mixin                        | Typical Use                  |
|-------------|-----------|---------------------------------------|------------------------------|
| `xs`        | `0`       | `@include fw-breakpoint-up(xs) {}`    | [Mobile portrait]            |
| `sm`        | `[px]`    | `@include fw-breakpoint-up(sm) {}`    | [Mobile landscape]           |
| `md`        | `[px]`    | `@include fw-breakpoint-up(md) {}`    | [Tablet]                     |
| `lg`        | `[px]`    | `@include fw-breakpoint-up(lg) {}`    | [Desktop]                    |
| `xl`        | `[px]`    | `@include fw-breakpoint-up(xl) {}`    | [Large desktop]              |

### 4.4 Icon System

<!-- If the framework provides or mandates a specific icon approach. -->

- **Icon library:** [e.g., "Framework ships its own SVG icon set via `<fw-icon>`."]
- **Usage:**

```html
<!-- How to use icons -->
<fw-icon name="[icon-name]"></fw-icon>
```

- **Available icons:** [Link to icon reference or list common ones]
- **Custom icons:** [How to register custom SVG icons]

```typescript
// Example: registering custom icons
```

### 4.5 Applying and Switching Themes

```typescript
// How to configure or swap themes at the app level
```

### 4.6 Framework-Provided Utility CSS Classes

<!-- If the framework provides utility classes (e.g., `fw-mt-md`, `fw-flex`, `fw-hidden-sm`). -->

| Class Pattern          | Example              | Effect                         |
|------------------------|----------------------|--------------------------------|
| `fw-m[side]-[size]`   | `fw-mt-md`           | [Margin top, medium.]          |
| `fw-p[side]-[size]`   | `fw-px-lg`           | [Padding horizontal, large.]   |
| `fw-text-[variant]`   | `fw-text-secondary`  | [Text color secondary.]        |
| `fw-display-[value]`  | `fw-display-flex`    | [Display flex.]                |
| [pattern]              | [example]            | [effect]                       |

### 4.7 Styling Do's and Don'ts

- **DO:** [e.g., "Use `$fw-spacing-*` tokens for all margins and padding."]
- **DO:** [e.g., "Use the framework grid system for page layout."]
- **DO NOT:** [e.g., "Never override framework component styles with `::ng-deep`."]
- **DO NOT:** [e.g., "Never use hardcoded color hex values — always reference tokens."]
- **DO NOT:** [e.g., "Never set `z-index` with arbitrary values — use the scale tokens."]

---

# Part 3 — API Reference

<!-- ============================================================
     INSTRUCTIONS FOR DOCUMENTING EACH COMPONENT/SERVICE/DIRECTIVE
     Repeat the appropriate template below for EVERY public export.
     Group them logically by domain (e.g., Layout, Data, Navigation, Forms).
     ============================================================ -->
