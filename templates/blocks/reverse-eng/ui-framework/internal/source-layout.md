---
slug: source-layout
title: "Source Layout"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 310
---

## 21. Source Layout

<!-- The repository's module map. New maintainers need to know where each
concept lives, what depends on what, and what the package boundaries
guarantee. -->

### 21.1 Repository Topology

- **Type:** [e.g., "pnpm + workspaces monorepo", "Nx monorepo", "yarn workspaces"].
- **Top-level dirs:**

```
/
├─ packages/
│  ├─ core/                  # reactivity + scheduler
│  ├─ runtime-core/          # component runtime, VDOM, scheduler glue
│  ├─ runtime-dom/           # DOM-specific renderer
│  ├─ runtime-ssr/           # server-side renderer
│  ├─ compiler-core/         # parser + transform + codegen (target-agnostic)
│  ├─ compiler-dom/          # DOM-flavored compiler additions
│  ├─ compiler-sfc/          # single-file component tooling
│  ├─ router/                # routing
│  ├─ test-utils/            # mount/wrapper helpers
│  ├─ devtools-bridge/       # devtools protocol
│  ├─ cli/                   # CLI + scaffolds
│  └─ shared/                # internal cross-package utilities
├─ scripts/                  # build/release scripts
├─ playground/               # local sandbox apps
├─ docs/                     # docs site
├─ pnpm-workspace.yaml
└─ tsconfig.json
```

### 21.2 Package Boundaries

| Package | Depends on | Re-exported by |
|---------|-----------|----------------|
| `core` | (none) | `runtime-core` |
| `runtime-core` | `core`, `shared` | `runtime-dom`, `runtime-ssr` |
| `runtime-dom` | `runtime-core`, `shared` | (final entry for browser) |
| `runtime-ssr` | `runtime-core`, `shared` | (final entry for SSR) |
| `compiler-core` | `shared` | `compiler-dom`, `compiler-sfc` |
| `compiler-dom` | `compiler-core` | `compiler-sfc` |
| `compiler-sfc` | `compiler-dom`, parsers | (build tool integrations) |
| `router` | `runtime-core` | (app-side) |
| `test-utils` | `runtime-dom` | (testing) |
| `cli` | `compiler-sfc`, bundler plugins | (top-level) |

- Cross-package imports go through PUBLIC entries only. Reaching into another package's `src/` is a build-time error.

### 21.3 Inside a Package

A typical `packages/{name}/` looks like:

```
packages/runtime-core/
├─ src/
│  ├─ index.ts                # public entry — re-exports only
│  ├─ apiCreateApp.ts
│  ├─ apiLifecycle.ts
│  ├─ component.ts
│  ├─ componentProps.ts
│  ├─ componentSlots.ts
│  ├─ componentEmits.ts
│  ├─ scheduler.ts
│  ├─ vnode.ts
│  ├─ rendererTemplateRef.ts
│  ├─ helpers/
│  │  ├─ renderList.ts
│  │  ├─ renderSlot.ts
│  │  └─ withDirectives.ts
│  └─ types/                  # internal types
├─ __tests__/                 # mirrors src/ structure
├─ package.json
├─ rollup.config.ts
└─ api-extractor.json
```

### 21.4 Module Naming Rules

- Files use camelCase; types and classes use PascalCase.
- Shared internal utilities live in `packages/shared/`; nothing else imports across siblings.
- Cyclic imports are gated by an ESLint rule; intentional cycles must be approved in review.

### 21.5 Build Outputs

- Each package emits to its own `dist/`; the workspace publish script bumps versions in lockstep when packages share a major.
- Generated `.d.ts` rollups via `api-extractor` per package — public types only.

### 21.6 Tests Layout

- Co-located unit tests under `__tests__/` mirror `src/`.
- Cross-package integration tests live in `packages/test-integration/` (or a dedicated workspace).
- Browser-target tests are tagged so CI can split by runner.

### 21.7 Documentation Map

- Reference docs in `docs/api/` are generated from JSDoc / source comments.
- Guide articles in `docs/guide/` are written by hand.
- Internal architecture docs (this very document family) in `docs/internals/` — kept in sync with code via review checklist.

### 21.8 New-Maintainer Reading Path

1. `packages/core/src/effect.ts` — the reactive primitive.
2. `packages/runtime-core/src/scheduler.ts` — how effects are queued.
3. `packages/runtime-core/src/component.ts` — how setup runs.
4. `packages/runtime-core/src/renderer.ts` — patch loop.
5. `packages/compiler-core/src/codegen.ts` — what the runtime consumes.

### 21.9 Pitfalls

- [e.g., "Importing from `packages/runtime-core/src/internal/...` from another package: forbidden by tsconfig path constraints."]
- [e.g., "Adding a peer dependency on a sibling package: must be declared in BOTH the workspace pnpm filter and the publish script."]
- [e.g., "`shared` is meant to stay small; large utilities belong in their own internal package."]
