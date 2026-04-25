---
slug: theming-and-branding
title: "Theming and Branding"
applies-to: [re-web-app-consumer]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 120
---

## 2. Theming and Branding

<!-- Document the supported surface for visual customization. Embedders
need a sharp boundary between "supported tokens" and "internal styles
that may change without notice." -->

### 2.1 Theming Model

- **Mechanism:** [e.g., "CSS custom properties exposed on the embed root element."]
- **Scope:** [e.g., "All tokens are scoped to `:host` (web component) or `[data-{{prefix}}-root]` (SDK / iframe wrapper). Embedders set them on or above that scope."]
- **Fallback chain:** [e.g., "Token → semantic default → primitive default. If a token is unset, the framework falls back to the active palette (light/dark/high-contrast)."]

### 2.2 Public Theme Tokens

<!-- Complete list of tokens that ARE part of the public contract. -->

**Color tokens:**

| Token | Purpose | Default (light) | Default (dark) |
|-------|---------|-----------------|----------------|
| `--{{prefix}}-color-brand` | Primary brand surface, CTAs | `#{{hex}}` | `#{{hex}}` |
| `--{{prefix}}-color-brand-contrast` | Foreground on `brand` surfaces | `#{{hex}}` | `#{{hex}}` |
| `--{{prefix}}-color-surface` | Default content background | `#{{hex}}` | `#{{hex}}` |
| `--{{prefix}}-color-surface-muted` | Secondary panels, sidebars | `#{{hex}}` | `#{{hex}}` |
| `--{{prefix}}-color-text` | Default body text | `#{{hex}}` | `#{{hex}}` |
| `--{{prefix}}-color-text-muted` | Secondary text, captions | `#{{hex}}` | `#{{hex}}` |
| `--{{prefix}}-color-border` | Hairlines, dividers | `#{{hex}}` | `#{{hex}}` |
| `--{{prefix}}-color-danger` | Destructive state | `#{{hex}}` | `#{{hex}}` |
| `--{{prefix}}-color-success` | Success state | `#{{hex}}` | `#{{hex}}` |

**Shape and density:**

| Token | Purpose | Default |
|-------|---------|---------|
| `--{{prefix}}-radius-sm` | Small radii (chips, inputs) | `4px` |
| `--{{prefix}}-radius-md` | Cards, surfaces | `8px` |
| `--{{prefix}}-radius-lg` | Modals, sheets | `16px` |
| `--{{prefix}}-density` | `comfortable` \| `compact` | `comfortable` |
| `--{{prefix}}-spacing-unit` | Base spacing (4 or 8) | `4px` |

**Typography:**

| Token | Purpose | Default |
|-------|---------|---------|
| `--{{prefix}}-font-family` | Body font stack | `system-ui, …` |
| `--{{prefix}}-font-family-mono` | Monospace stack | `ui-monospace, …` |
| `--{{prefix}}-font-size-base` | Root size | `14px` |

### 2.3 Brand Override Recipe

```css
/* In the embedder's stylesheet, scoped to the embed root */
{{embed-root-selector}} {
  --{{prefix}}-color-brand: #6E56CF;
  --{{prefix}}-color-brand-contrast: #FFFFFF;
  --{{prefix}}-radius-md: 12px;
  --{{prefix}}-font-family: "Inter", system-ui, sans-serif;
}
```

### 2.4 Logo and Asset Slots

| Slot / setting | Asset type | Constraints | How to set |
|----------------|------------|-------------|------------|
| `logo` | SVG or PNG | Max {{w}}×{{h}}; must include alt text | [e.g., "`<{{tag-name}} logo-url=…>` or SDK `init({ logo: { url, alt } })`."] |
| `favicon` | ICO/SVG | iframe only — host controls top-page favicon | [e.g., "`embedConfig.favicon = …`"] |
| `splash` | Image | Shown during initial load | [setting] |

### 2.5 Dark Mode and System Preferences

- **Auto-detection:** [e.g., "By default the embed inherits `prefers-color-scheme` from the host. Override via `theme="light" | "dark" | "auto"`."]
- **Reduced motion:** [e.g., "Respects `prefers-reduced-motion: reduce` automatically; embedders cannot disable this."]
- **High-contrast:** [e.g., "Honors Forced Colors Mode (Windows). Token overrides are skipped in forced-colors."]

### 2.6 What Is NOT Themable

<!-- Be explicit. This is the contract. -->

- [e.g., "Internal component padding is not exposed as a public token; do not target internal class names."]
- [e.g., "Selectors prefixed with `_{{prefix}}-` are private and may change in any minor release."]
- [e.g., "Animation durations are not themable — they follow `prefers-reduced-motion`."]
