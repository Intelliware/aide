---
slug: runtime-engine
title: "Runtime Engine"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 120
---

## 2. Runtime Engine

### 2.1 What Engine / VM the Framework Embeds

| Platform | Default Engine | Alternatives | Where Embedded |
|----------|----------------|--------------|----------------|
| iOS | [Hermes / JSC / V8 / Dart AOT] | [JSC / V8] | `[ios/Engine.framework / DartVM / ...]` |
| Android | [Hermes / V8 / Dart AOT] | [JSC] | `[android/.../JSExecutor.so / libflutter.so]` |

### 2.2 Engine Initialisation Sequence

```
1. Native shell `application:didFinishLaunchingWithOptions:` / `Application.onCreate`
2. Load native engine library (`dlopen` / `System.loadLibrary`)
3. Allocate engine instance (heap, GC, internal threads)
4. Register intrinsic native bindings (timers, console, fetch, ...)
5. Load runtime polyfills / framework bootstrap script
6. Load app bundle (JS / Dart kernel / managed assemblies)
7. Begin event loop / vsync subscription
8. First-frame readiness signalled to native shell
```

### 2.3 Memory Layout

| Region | Size policy | GC behaviour |
|--------|-------------|--------------|
| Runtime heap | [grows up to 2× working set, soft cap `{{n}}` MiB] | [generational / mark-sweep / Cheney] |
| Native code cache | [JIT or AOT — N MiB per process] | [LRU eviction / fixed] |
| String table / atom pool | [interned, shared across modules] | [retained] |
| Compiled bytecode | [memory-mapped from bundle] | [paged in by OS] |
| External / native bound buffers | [refcounted via FinalizationRegistry / Finalizer] | Released on GC pass |

> The native shell reports memory pressure via `applicationDidReceiveMemoryWarning` / `onTrimMemory` — the engine responds with a forced GC + cache flush.

### 2.4 Bytecode / AOT Strategy

- **Build-time compile:** [e.g., "Hermes compiles JS to bytecode at packager time", "Dart kernel compiled to AOT machine code on iOS, JIT on debug"]
- **Bundle format:** [e.g., `.hbc`, `.dilp`, `.dart_app.dill`, `.bundle`]
- **Code-signing requirements:** [e.g., "Must be embedded in `.ipa` at build time; OTA bundle replacement only allowed for assets, not code, on iOS"]

### 2.5 Hot Reload / Fast Refresh Internals

| Mode | Triggered by | What happens |
|------|--------------|--------------|
| Live reload | File save (dev) | Rebuild full bundle, reload runtime, lose state |
| Hot reload / Fast Refresh | File save (dev) | Compute changed modules, hot-swap exports, retain state where safe |
| Hot restart | Manual | Reset runtime, retain native shell |

**State preservation rules during fast refresh:**
- Pure components / functions: state is preserved.
- Components whose constructor identity changes: state is reset.
- Side-effectful initialisers (timers, subscriptions): re-run on next render.
- Non-component modules: re-evaluated; existing references retain old closure.

**Implementation outline:**
1. Dev server detects file change → emits HMR payload (changed module IDs + new code).
2. Runtime receives payload via the dev WebSocket / dev-mode bridge.
3. Module registry replaces the changed module's exports; downstream modules invalidated.
4. Framework triggers a re-render of the affected component subtree.

### 2.6 Source Maps and Symbolication

- Source maps are emitted during build and uploaded to `{{symbolication_service}}` (e.g., Sentry, Crashlytics, custom).
- Native crashes are symbolicated via dSYM (iOS) and `.so` symbols + ProGuard mapping (Android).
- Production symbol server: `{{symbol_server_url}}` — credentials in `{{secrets_path}}`.

### 2.7 Engine Upgrade Cadence

- Tracked-upstream version: `{{upstream_repo}}@{{commit_or_tag}}`.
- Cherry-picked patches live in `patches/` and are re-applied via `{{patch_tool}}` on every upgrade.
- Engine bumps require: full perf-suite green, sample-app smoke tests on top {{n}} devices, ABI-compat check for native modules.

### 2.8 Where the Code Lives

```
{{repo}}/
├── packages/runtime/                  # JS-side runtime initialisation
├── ReactCommon/jsi/                   # (RN-specific) C++ JSI interfaces
├── engine/                            # native engine sources
│   ├── ios/                           # iOS embedding glue
│   └── android/                       # Android embedding glue (JNI)
└── third_party/{{engine}}/            # vendored upstream engine
```
