---
slug: styling-and-design-system
title: "Styling and Design System"
applies-to: [re-web-app-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 210
---

## 11. Styling and Design System

### 11.1 Styling Approach

- **Technology:** [e.g., "SCSS with CSS Modules", "Styled Components", "Tailwind CSS"]
- **Component styles:** [e.g., "CSS Modules for component-scoped styles", "scoped via BEM naming"]
- **Global styles:** [e.g., "Global variables and reset in styles/index.scss"]

**File Organization:**

```
src/styles/
├── index.scss           # Global imports — loads reset, variables, utilities
├── _reset.scss          # CSS reset (remove defaults)
├── _variables.scss      # Design tokens (colors, spacing, typography)
├── _mixins.scss         # Reusable SCSS mixins
└── _utilities.scss      # Utility classes (.flex, .hidden, etc.)

src/features/[feature]/components/[Component]/
└── [Component].module.scss  # Component-scoped styles

src/shared/components/[Component]/
└── [Component].module.scss  # Shared component styles
```

### 11.2 Design Tokens

<!-- Complete list of colors, spacing, typography, etc. -->

**Color Palette:**

```scss
// src/styles/_variables.scss

// Primary Colors
$color-primary: #007bff;
$color-primary-light: #0d6efd;
$color-primary-dark: #0c63e4;

// Semantic Colors
$color-success: #198754;
$color-warning: #ffc107;
$color-danger: #dc3545;
$color-info: #0dcaf0;

// Neutral Colors
$color-text-primary: #212529;
$color-text-secondary: #6c757d;
$color-text-light: #999;
$color-background: #ffffff;
$color-background-secondary: #f8f9fa;
$color-border: #dee2e6;

// Status Colors
$color-error: #dc3545;
$color-success: #198754;
$color-warning: #ffc107;
$color-info: #0dcaf0;
```

**Spacing Scale:**

```scss
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-xxl: 48px;
```

**Typography:**

```scss
$font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
$font-family-mono: 'SF Mono', 'Monaco', 'Courier New', monospace;

$font-size-xs: 12px;
$font-size-sm: 14px;
$font-size-md: 16px;
$font-size-lg: 18px;
$font-size-xl: 20px;
$font-size-2xl: 24px;

$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-bold: 700;

$line-height-tight: 1.2;
$line-height-normal: 1.5;
$line-height-relaxed: 1.75;
```

**Borders and Radii:**

```scss
$border-radius-sm: 4px;
$border-radius-md: 8px;
$border-radius-lg: 12px;
$border-radius-full: 9999px;

$border-width: 1px;
$border-color: $color-border;
```

**Shadows:**

```scss
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.15);
```

**Z-Index Scale:**

```scss
$z-index-dropdown: 1000;
$z-index-sticky: 1100;
$z-index-modal-backdrop: 1200;
$z-index-modal: 1300;
$z-index-toast: 1400;
$z-index-tooltip: 1500;
```

### 11.3 Responsive Breakpoints

<!-- How the app adapts to different screen sizes. -->

```scss
$breakpoint-xs: 320px;   // Mobile (extra small)
$breakpoint-sm: 640px;   // Mobile landscape
$breakpoint-md: 768px;   // Tablet
$breakpoint-lg: 1024px;  // Desktop
$breakpoint-xl: 1280px;  // Large desktop

// Mixins for media queries
@mixin mobile-only {
  @media (max-width: ($breakpoint-sm - 1)) {
    @content;
  }
}

@mixin tablet-up {
  @media (min-width: $breakpoint-md) {
    @content;
  }
}

@mixin desktop-up {
  @media (min-width: $breakpoint-lg) {
    @content;
  }
}

// Usage:
.sidebar {
  display: none;

  @include tablet-up {
    display: block;
    width: 250px;
  }
}
```

### 11.4 Using Design Tokens in Components

**SCSS Modules (Component-Scoped):**

```scss
// src/features/tickets/components/TicketCard/TicketCard.module.scss
@import '@/styles/variables';

.card {
  padding: $spacing-md;
  background-color: $color-background;
  border: $border-width solid $color-border;
  border-radius: $border-radius-md;
  box-shadow: $shadow-md;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: $shadow-lg;
  }

  @include mobile-only {
    padding: $spacing-sm;
  }
}

.title {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $color-text-primary;
  margin-bottom: $spacing-sm;
}

.status {
  display: inline-block;
  padding: $spacing-xs $spacing-sm;
  border-radius: $border-radius-sm;
  font-size: $font-size-sm;

  &.open {
    background-color: $color-info;
    color: white;
  }

  &.closed {
    background-color: $color-success;
    color: white;
  }
}
```

**In TypeScript Components:**

```typescript
import styles from './TicketCard.module.scss';

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{ticket.title}</h2>
      <span className={`${styles.status} ${styles[ticket.status.toLowerCase()]}`}>
        {ticket.status}
      </span>
    </div>
  );
};
```

### 11.5 Styling Do's and Don'ts

- **DO:** Use design tokens from `_variables.scss` for all colors, spacing, fonts
- **DO:** Use CSS Modules for component-scoped styles
- **DO:** Use responsive mixins for mobile/tablet/desktop breakpoints
- **DO:** Keep component styles in the component folder
- **DO NOT:** Hardcode colors or dimensions — always use tokens
- **DO NOT:** Use `!important` — indicates specificity issues
- **DO NOT:** Override global styles at the component level — use scoped styles
- **DO NOT:** Skip mobile styles — assume all layouts must work on all breakpoints

---

# Part 5 — Features and Workflows
