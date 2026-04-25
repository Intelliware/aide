---
slug: tooling-and-cli
title: "Tooling and CLI"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 280
---

## 18. Tooling and CLI

<!-- The CLI's internals: project scaffolding, dev server, HMR plumbing,
production build orchestration, plugin loading, and devtools bridge. -->

### 18.1 CLI Surface

| Command | Purpose |
|---------|---------|
| `{{cli}} create {{name}}` | Scaffold a new project from a template |
| `{{cli}} dev` | Start the dev server with HMR |
| `{{cli}} build` | Produce a production bundle |
| `{{cli}} preview` | Serve the production build locally |
| `{{cli}} test` | Run tests |
| `{{cli}} info` | Print env, versions, config snapshot |
| `{{cli}} upgrade` | Run a codemod for the next major |

### 18.2 Project Scaffolding

- Templates live in `packages/cli/templates/{name}/` and are versioned alongside the CLI.
- The scaffolder is a streaming copier with placeholder substitution (`{{projectName}}`, `{{org}}`, etc.) and prompt-driven feature toggles (TS, router, store, i18n).
- Exit-code contract: `0` success, `1` user abort, `2` template error, `3` IO error.

### 18.3 Dev Server

```
   request
     │
     ▼
   middleware chain
     ├─ plugin transform (per file extension)
     ├─ HMR boundary detection
     ├─ source map injection
     ├─ static asset serving
     └─ index.html template
     │
     ▼
   browser ◄── ESM modules + WS HMR channel
```

- ESM-first: each `.{{ext}}` is transformed and served as ES module — no bundling in dev.
- HMR is push-based: the file watcher determines an "HMR boundary" (the smallest re-evaluable unit) and pushes a payload to the browser.
- Component HMR: the runtime registers a HMR record with `__HMR_ID__`; the dev runtime swaps the component definition and refreshes its render effect.

### 18.4 Plugin Architecture

- Adopts the [bundler]'s plugin interface (Rollup-style or webpack-style depending on the toolchain).
- Framework-specific hooks layered on top:
  - `transformTemplate(code, id, ctx)` — for SFCs
  - `resolveComponent(name, ctx)` — for auto-import
  - `addEntryChunk(...)` — for islands or virtual entries
- Plugin order is deterministic; conflicts surfaced at config-load time.

### 18.5 Production Build

```
   resolve config
        │
        ▼
   compile every source (compiler + plugins)
        │
        ▼
   bundle (Rollup/webpack/Turbopack)
     ├─ tree-shake
     ├─ code-split per route
     ├─ extract CSS (per chunk)
     ├─ inline critical CSS (if SSR)
     └─ emit assets
        │
        ▼
   run post-build steps (manifest, prefetch hints, pre-render routes)
```

- Default output: `dist/` with `dist/assets/` for hashed assets and an HTML entry per app.
- A manifest (`asset-manifest.json` or `.{{cli}}/manifest.json`) maps logical chunk names → emitted filenames; consumed by SSR / preload.

### 18.6 Source Maps

- Every transform emits a source map; the bundler chains them.
- Production source maps are uploaded to the configured observability sink (Sentry-compatible) and not served from the CDN by default.

### 18.7 Devtools Bridge

- Browser extension exposes a panel; communicates with the running app via a global hook (`window.__{{prefix}}_DEVTOOLS_GLOBAL_HOOK__`).
- The runtime emits events: app init, component add/remove/update, store mutation, route change, error.
- Production builds disable the bridge by default; opt-in via env flag.

### 18.8 Codemods (Upgrade Tooling)

- AST-based transforms (jscodeshift / babel-codemod / ts-morph).
- Each major ships codemods for breaking source changes (renamed APIs, prop signatures).
- The CLI's `upgrade` command runs codemods in dry-run by default; `--write` applies.

### 18.9 Diagnostics

- `{{cli}} info` prints versions of: framework packages, CLI, Node, package manager, OS, key plugin versions, repo lockfile hash. This is the first thing a triage engineer asks for.
- `{{cli}} doctor` (if present) checks for known config / version pitfalls.

### 18.10 Pitfalls

- [e.g., "Plugin order changes between minor versions of the bundler; CI integration tests pin both."]
- [e.g., "HMR module identity must survive across reloads — plugins that rewrite specifiers can break HMR by changing the module URL."]
- [e.g., "Codemods that touch SFC `<style>` blocks must round-trip through the SFC parser; raw text replace causes encoding losses."]
