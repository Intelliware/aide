---
slug: architecture-overview
title: "Architecture Overview"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 110
---

## 1. Architecture Overview

### 1.1 What This Framework Is (From the Inside)

- **Name:** [Framework Name]
- **Maintainer organisation:** [Org / team]
- **Mission statement (one sentence):** [e.g., "Render a tree of declarative UI nodes onto every supported mobile platform with consistent semantics and competitive frame budgets."]
- **Repository layout type:** [monorepo / multi-repo / hybrid]

### 1.2 Execution Model at a Glance

<!-- Pick the one that matches; delete the others. -->

**A. Native ↔ Bridge ↔ JavaScript (e.g., React Native, NativeScript)**

```
[ Native App Shell (iOS / Android) ]
            │
   [ Native Modules ] ←→ [ JS Bridge / JSI / Turbo Modules ] ←→ [ JS Runtime (Hermes / JSC / V8) ]
            │                                                              │
   [ UI Renderer (Fabric / Yoga / native views) ]                     [ JS App Code ]
```

**B. Native ↔ FFI ↔ Managed VM (e.g., Flutter)**

```
[ Native Embedder (iOS / Android shells) ]
            │
   [ Engine (C++) ] ──→ [ Skia / Impeller renderer → Metal / Vulkan / OpenGL ]
            │
   [ Dart VM / AOT runtime ] ←→ [ Framework (Dart) ] ←→ [ App Code (Dart) ]
```

**C. Native ↔ Managed Runtime (e.g., Xamarin / .NET MAUI / Kotlin Multiplatform)**

```
[ Platform-specific UI Bindings ]
            │
   [ Managed Runtime (CLR / Kotlin/Native) ]
            │
   [ Shared business logic (cross-platform) ]
```

### 1.3 Process and Thread Model

| Thread / Queue | Owner | Lifetime | What runs there |
|----------------|-------|----------|-----------------|
| Main / UI thread | OS | App lifetime | View hierarchy mutation, gesture dispatch |
| Render thread | Engine | App lifetime | Compositor, GPU command submission |
| JS / VM thread | Runtime | App lifetime | All app-level JavaScript / Dart / managed code |
| Background workers | App / framework | On-demand | Network, image decode, IO |
| Native module queue(s) | Each module declares | Module lifetime | Camera, audio, BLE — typically serial dispatch queues |

### 1.4 Boundaries and Responsibilities

| Layer | Responsibility | Out-of-Scope |
|-------|----------------|--------------|
| Embedder (native shell) | App lifecycle, OS integration, view hosting | Business logic, layout |
| Engine / runtime core | Execution, rendering pipeline, scheduling | Platform-specific UI |
| Framework code (in the runtime's language) | Widget/component library, layout, state primitives | Bridge wiring |
| App code (consumer-authored) | Product UI and behaviour | Engine internals |

### 1.5 Public Contract (What External Callers Depend On)

- **API surface:** [link to consumer composition `re-mobile-framework-consumer`]
- **Stability tiers:** `stable` / `experimental` / `internal`
- **Semantic versioning policy:** [e.g., "MAJOR for breaking API; MINOR for additive; PATCH for fixes"]

### 1.6 Architectural Tenets

- [Tenet 1: e.g., "Declarative-first — imperative escape hatches require explicit opt-in."]
- [Tenet 2: e.g., "60fps default budget — anything that risks the frame budget must be measured."]
- [Tenet 3: e.g., "Single source of truth: Framework drives layout; native views render only."]
- [Tenet 4: e.g., "Platform parity over platform purity — same behaviour everywhere unless a hard OS limit prevents it."]

### 1.7 Reading Map for Maintainers

| If you want to understand … | Start here |
|-----------------------------|-----------|
| How a button click ends up in user code | `gesture-and-event-system` → `native-bridge` → `module-system` |
| Why a layout pass is slow | `ui-rendering-pipeline` → `layout-engine-internals` → `performance-pipeline` |
| How the runtime starts | `runtime-engine` → `module-system` → `architecture-overview` |
| How the framework releases | `build-system` → `release-channel-and-codepush-or-ota` → `compatibility-strategy` |
