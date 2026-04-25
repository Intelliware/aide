---
slug: source-layout
title: "Source Layout"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 310
---

## 21. Source Layout

### 21.1 Repository Top-Level

```
{{repo}}/
├── packages/                # all framework packages, one folder per package
├── ReactCommon/ or engine/  # native engine & shared C++ (if applicable)
├── ios/                     # iOS-only sources (where not co-located in packages)
├── android/                 # Android-only sources (where not co-located in packages)
├── third_party/             # vendored / patched upstream code
├── examples/                # sample apps (also used as smoke tests)
├── docs/                    # framework documentation
├── tools/                   # build / release / codegen / dev tooling
├── e2e/                     # end-to-end tests
└── scripts/                 # short helper scripts
```

### 21.2 Package Map

| Path | Public package | Owner | One-liner |
|------|----------------|-------|-----------|
| `packages/runtime/` | `@framework/runtime` | core | Runtime bootstrap, module registry |
| `packages/renderer/` | `@framework/renderer` | rendering | Reconciler + mounting layer |
| `packages/scheduler/` | `@framework/scheduler` | core | Priority scheduler |
| `packages/state/` | `@framework/state` | state | Reactive primitives |
| `packages/navigation/` | `@framework/navigation` | navigation | Router + linking |
| `packages/network/` | `@framework/network` | networking | fetch / Http / interceptors |
| `packages/storage/` | `@framework/storage` | platform | Storage surfaces |
| `packages/permissions/` | `@framework/permissions` | platform | Permissions API |
| `packages/notifications/` | `@framework/notifications` | platform | Push / local notifications |
| `packages/profiler/` | `@framework/profiler` | perf | Tracing hooks |
| `packages/devtools-protocol/` | `@framework/devtools-protocol` | devtools | CDP extensions |
| `packages/testing/` | `@framework/testing` | testing | Test renderer + utils |
| `packages/codegen/` | `@framework/codegen` | tooling | Spec → bindings generator |
| `packages/codemods/` | `@framework/codemods` | tooling | Migration scripts |

### 21.3 Boundary Rules

- **No circular package deps.** Enforced via `{{tool, e.g., dependency-cruiser / nx graph}}` in CI.
- `runtime` and `scheduler` are **leaf** packages — nothing depends *up* into framework features.
- `examples/*` may import any package; nothing else may import `examples/`.
- Native subdirs (`ios/`, `android/`) only consume from native distribution headers — they do not import package sources directly.

### 21.4 File Naming Conventions

| Kind | Convention | Example |
|------|------------|---------|
| Module | kebab-case | `event-system.ts` |
| Component | PascalCase | `BottomSheet.tsx` |
| Hook | camelCase + `use` prefix | `useNavigation.ts` |
| Spec (codegen) | `*.spec.ts` | `Camera.spec.ts` |
| Native module (iOS) | `<Module>Module.{h,m,mm,swift}` | `CameraModule.swift` |
| Native module (Android) | `<Module>Module.kt` | `CameraModule.kt` |
| Test | `*.test.ts` next to source | `event-system.test.ts` |
| E2E | `*.e2e.ts` under `e2e/` | `auth.e2e.ts` |

### 21.5 Cross-Cutting Folders

- `compat/` — OS / version branches.
- `internal/` — package-private; not exported.
- `__tests__/` or co-located `.test.*` — unit tests.
- `__fixtures__/` — golden / snapshot data.

### 21.6 Public vs. Internal Surfaces

Each package's `index.{ts,dart,etc}` re-exports only the **stable** API. Anything else is internal:

```ts
// packages/runtime/src/index.ts
export { startRuntime, NativeModules } from "./public";
// no re-export of ./internal/*
```

Tooling enforces that consumers can only import from the package root, not deep paths.

### 21.7 Generated Code

- Build-time generated code lives under `<package>/.gen/` and is **gitignored**.
- A pre-commit hook regenerates if specs changed.
- CI fails if checked-in generated artifacts drift from regeneration.
