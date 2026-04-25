---
slug: ui-rendering-pipeline
title: "UI Rendering Pipeline"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 150
---

## 5. UI Rendering Pipeline

### 5.1 Pipeline Stages

```
[ App code emits/updates UI tree ]
            ↓
[ Reconciler / Element tree diff ]
            ↓
[ Shadow tree (immutable per commit) ]
            ↓
[ Layout pass (flexbox / constraint solver) ]
            ↓
[ Mounting instructions (create/update/delete views) ]
            ↓
[ UI thread applies mutations to native view hierarchy / canvas ]
            ↓
[ Compositor / GPU draws frame ]
```

### 5.2 Renderer Variants

| Variant | Approach | Trade-off |
|---------|----------|-----------|
| **Native widgets** | Map each component to a UIKit / View subclass | Authentic platform look; harder to customise |
| **Canvas / Skia / Impeller** | Draw every pixel via a portable graphics layer | Pixel-perfect parity; reimplements platform widgets |
| **Hybrid** | Native widgets for inputs + canvas for custom UI | Complexity in event routing across surfaces |

The framework's choice: [pick one and explain].

### 5.3 Reconciler Algorithm

- **Element tree** — immutable description produced by app code each render.
- **Fiber / Element pairing** — reconciler walks both old and new trees, computes `placement`, `update`, `deletion` ops.
- **Keys** — drive identity within siblings; missing keys cause unnecessary unmounts.
- **Memoisation hooks** — `memo` / `const` widgets short-circuit re-render where inputs unchanged.

### 5.4 Mounting Layer

| Mutation | Native effect (iOS) | Native effect (Android) |
|----------|---------------------|--------------------------|
| Create | `[parent addSubview:]` | `parent.addView(...)` |
| Update | Property setters via type-tagged operations | Same |
| Reorder | `bringSubviewToFront:` / index move | `removeView` + `addView` at index |
| Delete | `removeFromSuperview` | `parent.removeView(...)` |

> Mutations are batched per commit and flushed on the UI thread to avoid mid-frame tearing.

### 5.5 Compositor / GPU Submission

- iOS: backed by `CALayer`; `CAMetalLayer` for canvas paths.
- Android: backed by `View` + `RenderNode`; `SurfaceView` / `TextureView` for canvas paths.
- Frame is presented at vsync (`CADisplayLink` / `Choreographer`).

### 5.6 Async vs. Sync Rendering Modes

| Mode | When | Behaviour |
|------|------|-----------|
| Concurrent | Default in new architecture | Reconciliation can be interrupted; lower-priority work yields |
| Sync | Inside an event handler that demands an immediate visual response (e.g., text input) | Fully synchronous reconcile + mount before returning |
| Off-screen / hidden | Pre-warming a view tree | Reconciled but not mounted |

### 5.7 Image and Asset Drawing

- Image decode runs on a worker queue; bitmaps are uploaded to GPU on render thread.
- Cache: in-memory LRU + on-disk LRU (`NSCache` / `LruCache`).
- Asset paths resolved via the asset registry from `asset-pipeline`.

### 5.8 Hit Testing

Hit testing reuses the rendered shadow tree: a touch is mapped to native coordinates, then the renderer walks the tree to find the topmost view at that point that has not opted out (`pointerEvents="none"`).

### 5.9 Where the Code Lives

```
{{repo}}/
├── packages/renderer/                  # platform-agnostic renderer + reconciler
├── packages/renderer-{ios,android}/    # platform mounting layers
├── ReactCommon/yoga/ or layout/        # layout solver
└── tools/devtools/renderer/            # debug overlays
```
