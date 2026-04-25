---
slug: styling-architecture
title: "Styling Architecture"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 230
---

## 13. Styling Architecture

<!-- How CSS is associated with components, encapsulated, transformed at
build time, and injected at run time. Pure concerns of the framework's
own pipeline, not application-style choices. -->

### 13.1 Encapsulation Strategy

| Strategy | When used | Mechanism |
|----------|-----------|-----------|
| **Scoped** (default) | `<style scoped>` SFC | Compile-time: append `[data-v-{{hash}}]` attribute selector to every rule; runtime: add `data-v-{{hash}}` attribute to every element in the template |
| **CSS Modules** | `<style module>` | PostCSS CSS Modules plugin produces a hash map; identifiers exposed to the template scope |
| **Shadow DOM** | Custom-element build target | Styles inserted into the shadow root; native CSS isolation |
| **Global** | `<style>` (no modifier) | Untouched; deduplicated by source identity |
| **CSS-in-JS** (if supported) | `css\`…\`` template tag | Runtime style injection with cached hash |

### 13.2 Compile-Time Pipeline

```
   <style scoped> source
        │
        ▼
   PostCSS pipeline
     ├── parse selectors
     ├── inject [data-v-{{hash}}] (rewritten to compound selectors)
     ├── handle ::v-deep / :deep / :slotted / :global
     ├── autoprefixer (project-config dependent)
     └── minify (production)
        │
        ▼
   emit:
     - extracted CSS asset (production), OR
     - JS module exporting the CSS string (dev / SSR)
```

### 13.3 Deep, Slotted, Global Selectors

| Pseudo | Purpose | Compiler behavior |
|--------|---------|-------------------|
| `:deep(.x)` | Reach into child component's scope | Strip the data-attr from `.x`; keep on the parent selector |
| `:slotted(.x)` | Style projected slot content | Use a different attribute (`data-v-{{hash}}-s`) added to slot roots |
| `:global(.x)` | Opt out of scoping for this rule | Emit raw selector |

### 13.4 Runtime Style Injection

- **Dev:** styles imported as JS modules and injected via `<style data-id={{hash}}>` tags. HMR replaces the tag's textContent.
- **SSR:** style tags collected per render and inlined into the head OR streamed in critical-CSS order.
- **Production:** styles extracted to `.css` chunks alongside JS chunks; route-level chunks load their CSS lazily.

### 13.5 Dynamic Bindings

```html
<div :class="{ active: isActive, [dynKey]: true }" :style="{ color: color }">
```

- `class`/`style` patching uses dedicated helpers (`patchClass`, `patchStyle`) — see render-pipeline patch flags `CLASS` and `STYLE`.
- Both accept arrays/objects/strings and merge with static class/style on the same element.

### 13.6 Theme / Custom-Property Pipeline

- Tokens authored as CSS custom properties at the app or component root.
- The framework does not transform them — they travel through PostCSS untouched.
- Theme switching is a CSS variable swap; no JS rerender required.

### 13.7 Scoped CSS Edge Cases

- **Children of a v-for:** every iteration receives the parent's scope attribute; nested components keep their own.
- **Functional / Fragment roots:** all root nodes get the attribute.
- **Teleported content:** target nodes receive the scope attribute so styles still apply outside the original tree.
- **`<slot>` content:** projected children belong to the parent's scope, not the child's — `:slotted` is the bridge.

### 13.8 SSR + Hydration With Styles

- Each component records the set of style modules it depends on; SSR aggregates them per request.
- Critical-CSS extraction emits ONLY rules used by mounted components.
- Hydration does not re-inject already-rendered styles; client merely takes ownership of the existing `<style>` tags.

### 13.9 Performance Notes

- Rule de-duplication uses style-tag identity (id) and content hash.
- Avoid recompiling `:deep` selectors at runtime — they are fully resolved at compile time.
- Atomic CSS frameworks (Tailwind, UnoCSS) integrate via the bundler; framework runtime does not know about them.

### 13.10 Pitfalls

- [e.g., "Adding a new pseudo (`:slotted`) requires updates in: parser, transform, codegen, AND the patcher (so slot roots get the matching attribute)."]
- [e.g., "Extracted CSS chunks must be ordered to match JS chunk load order — bundler integration tests cover this."]
- [e.g., "Dynamic `style` binding with object identity that changes every render churns inline-style writes; tests assert no churn for stable values."]
