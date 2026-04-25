---
slug: build-output-and-tree-shaking
title: "Build Output and Tree Shaking"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 290
---

## 19. Build Output and Tree Shaking

<!-- How the framework itself is packaged for downstream consumers and
how downstream apps are bundled. The contract that makes "import only
what you use" actually work. -->

### 19.1 Framework Package Layout

| Field | Value |
|-------|-------|
| `module` | `dist/{{pkg}}.esm-bundler.js` (for bundlers) |
| `main` | `dist/{{pkg}}.cjs.js` (Node interop) |
| `unpkg` / `jsdelivr` | `dist/{{pkg}}.global.js` (IIFE for `<script>` tag) |
| `types` | `dist/{{pkg}}.d.ts` |
| `exports` | conditional exports (browser, node, dev/prod, default) |
| `sideEffects` | `false` (or a precise allowlist) |

**Conditional exports example:**

```jsonc
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "browser": {
        "production": "./dist/index.browser.prod.js",
        "development": "./dist/index.browser.dev.js",
        "default": "./dist/index.browser.js"
      },
      "node": {
        "import": "./dist/index.node.mjs",
        "require": "./dist/index.node.cjs"
      },
      "default": "./dist/index.js"
    }
  }
}
```

### 19.2 Dev vs. Prod Builds

| Build | Includes | Used in |
|-------|----------|---------|
| Dev | warnings, devtools hooks, asserts, named effects | dev server, test |
| Prod | dead-code-eliminated; warnings replaced with throws or removed | production bundles |

- Switch is done by replacing `__DEV__`/`__PROD__` constants at bundle time. Bundlers must define them.
- The "esm-bundler" entry leaves these constants intact so the downstream bundler decides.

### 19.3 Tree-Shaking Contract

- All public APIs are `export`-ed individually from the entry; no namespace mega-objects.
- Side-effecting modules are explicitly listed in `sideEffects` (CSS imports, polyfills).
- The compiler emits imports for ONLY the helpers each component actually uses (`h`, `Fragment`, `withDirectives`, …).

### 19.4 Code Splitting

| Split point | Mechanism |
|-------------|-----------|
| Route-level | Dynamic `import()` returning a component; router records lazy thunks |
| Component-level | `defineAsyncComponent(() => import(...))` |
| Locale chunks | `() => import('./locales/{locale}.json')` |
| Library facets | `import { Modal } from '@{{org}}/ui/modal'` (sub-path exports) |

### 19.5 CSS Output

- Per-chunk CSS extraction; downstream bundlers emit `.css` files alongside JS chunks.
- Critical CSS for SSR is collected per render and inlined in the head.
- Atomic CSS frameworks integrate via their own bundler plugin; the framework does not transform their output.

### 19.6 SSR Bundle

- A separate `node` conditional export emits CommonJS or ESM for Node.
- No DOM helpers in the SSR bundle (no `addEventListener`, no `MutationObserver`); the renderer-server uses string-buffer codepaths only.
- Separate "for-edge" condition exists for runtimes without Node APIs (workerd, Deno) — uses Web APIs instead of `Buffer`/`stream`.

### 19.7 Custom Element Build

- A custom-element-targeted bundle exists for embedding into non-framework hosts.
- Includes a slim runtime (no SSR) and registers components as HTMLElement subclasses with shadow-DOM scoped styles.

### 19.8 Bundle Size Budget

- CI gates the `gzip`/`br` size of the production bundle per package.
- A regression > {{%}} fails the PR; intentional growth requires a label and a design note.
- The runtime's own gzipped size target: {{kb}}.

### 19.9 Source Maps and Sourcemap-Discarding

- Production builds emit `.map` files but DO NOT serve them by default; CI uploads them to the observability sink with the build's commit SHA.
- Stack traces in production are de-mangled server-side in the observability layer.

### 19.10 Pitfalls

- [e.g., "Adding a side-effecting import to a top-level barrel breaks tree shaking for every downstream consumer — caught by a `sideEffects` lint."]
- [e.g., "Conditional exports must have a `default` branch — older bundlers ignore unknown conditions and fall through."]
- [e.g., "Runtime helper drift between major versions silently bloats consumer bundles when both versions resolve simultaneously through a transitive dep — bundler warnings + lockfile dedupe required."]
