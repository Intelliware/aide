---
slug: template-or-jsx-compilation
title: "Template / JSX Compilation"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 160
---

## 6. Template / JSX Compilation

<!-- The compiler's job: turn declarative source (templates, JSX, or
single-file components) into the runtime's render function and
optimizer hints. Deeply linked to render-pipeline patch flags. -->

### 6.1 Compiler Stages

```
  source (.{{ext}})
       │
       ▼
   ┌─ Parse ────────────► AST
   │
   ▼
   ┌─ Transform ────────► AST + metadata (scopes, refs, directives)
   │
   ▼
   ┌─ Optimize ─────────► AST + patch flags + static hoisting
   │
   ▼
   ┌─ Codegen ──────────► JS module (render fn, imports, helpers)
   │
   ▼
   bundler (Vite / webpack / Rollup)
```

### 6.2 Parsing

- **Source format:** [e.g., "HTML-like templates with `{{ }}` interpolation and `:` / `@` shorthand directives", "JSX via Babel/TS plugin", "Single-file `<template>/<script>/<style>` blocks."]
- **Tokenizer:** [e.g., "Custom HTML5-friendly tokenizer; preserves whitespace per `whitespace: 'preserve' | 'condense'` option."]
- **AST nodes:** `RootNode`, `ElementNode`, `ComponentNode`, `TextNode`, `InterpolationNode`, `DirectiveNode`, `IfNode`, `ForNode`, `SlotNode`.
- **Source maps:** every emitted node carries `loc: { start, end, source }`; codegen preserves these into the JS output.

### 6.3 Transform Plugins

The transformer is a pipeline of plugins that mutate the AST. Standard plugins, in order:

1. **Scope analysis:** track which identifiers are declared in `setup` vs. template-only vs. global.
2. **Directive lowering:** `v-if` / `v-for` / `v-model` rewrite into runtime calls.
3. **Slot transform:** named/scoped slots become functions on the children object.
4. **Element/component disambiguation:** check capitalization, registration, custom element list.
5. **Expression rewrite:** in `setup`-style components, prepend the setup binding name to identifiers.
6. **Cache transform:** mark expressions/handlers eligible for memoization.

### 6.4 Optimizer Hints

The optimizer scans the AST and emits:

| Hint | Meaning | Used by |
|------|---------|---------|
| `HOISTED` | Subtree is fully static | render pipeline; skipped on patch |
| `CACHED` | Inline handler can be cached across renders | avoids re-binding |
| `patchFlag` (bitmask) | Which props/children are dynamic | patch fast path |
| `dynamicProps` | Names of dynamic props on an element | targeted prop diff |
| `BAIL_OUT` | Subtree opts out of optimization (e.g., `v-html`, custom directive) | safe fallback |

### 6.5 Codegen

- **Output:** ES modules. Imports are added on-demand for `h`, `Fragment`, `withDirectives`, `vModelText`, etc.
- **Render function shape:**

```typescript
import { h, Fragment, openBlock, createBlock, toDisplayString } from '@{{org}}/runtime-core';

export const _hoisted_1 = h('h1', 'Static');

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createBlock(Fragment, null, [
    _hoisted_1,
    h('p', null, toDisplayString(_ctx.message), 1 /* TEXT */),
  ], 64 /* STABLE_FRAGMENT */));
}
```

- **`openBlock` / `createBlock`** mark dynamic root containers so the runtime can iterate only dynamic descendants — see render-pipeline.

### 6.6 Single-File Component Compilation

If `.{{ext}}` is supported:

- `<template>` → `render` function (above).
- `<script setup>` → setup function with auto-exposed bindings.
- `<style scoped>` → CSS post-processed with attribute selectors `[data-v-{{hash}}]`; matching attribute is added to every element in the template at compile time.
- `<style module>` → CSS Modules-style; identifiers exposed to the template.
- Custom blocks (e.g., `<i18n>`, `<docs>`) are forwarded to bundler plugins via the SFC tool's main API.

### 6.7 Output Stability

- **What is part of the contract:** runtime helper names, render-function signature, the `patchFlag` numeric values.
- **What is NOT part of the contract:** internal hoist variable names, codegen output formatting, intermediate AST node shapes.
- **Cross-version codegen:** any change to runtime helpers requires a coordinated bump of the compiler's `__VERSION__` so the bundler can detect mismatch.

### 6.8 Test Strategy for Compiler Changes

- Snapshot the codegen output of `__tests__/__fixtures__/*.txt`.
- Run the produced render function against the runtime in a JSDOM smoke test.
- E2E: build a sample app and assert no patch-flag regressions.
