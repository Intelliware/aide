---
slug: layout-engine-internals
title: "Layout Engine Internals"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect]
optional: true
order-hint: 170
---

## 7. Layout Engine Internals

> Mark this section N/A if the framework defers layout entirely to the host platform (e.g., direct UIKit / View hierarchy without flexbox).

### 7.1 Layout Algorithm

| Algorithm | Used For | Notes |
|-----------|----------|-------|
| Flexbox (Yoga / Taffy / custom) | Default for cross-platform component layout | Two-pass: measure then arrange |
| Constraint solver (Cassowary / Auto-layout) | Where bidirectional constraints needed | More expressive, more expensive |
| Intrinsic sizing | Text / image content | Asks the rendered backend for natural size |
| Manual / absolute | Escape hatch | Component opts out of flex parent |

### 7.2 Layout Tree vs. Element Tree

The element tree (from reconciliation) is mapped 1:1 to a layout tree of nodes that hold style + computed size. Layout runs on the layout tree only, then results are applied during the mount phase.

```
[ Element tree ] ──→ [ Layout nodes ] ──→ [ Layout pass ] ──→ [ Computed frames ]
                                                                      ↓
                                                       [ Mount onto native views ]
```

### 7.3 Style → Layout Properties

| Style key | Layout effect | Edge cases |
|-----------|---------------|------------|
| `width / height` | Fixed size | `auto` defers to intrinsic |
| `flex` | Grow / shrink share | Treats `0` as no participation |
| `flexDirection` | row / column / row-reverse / column-reverse | Affects main axis interpretation |
| `justifyContent`, `alignItems` | Main / cross axis alignment | `space-evenly` is supported but expensive |
| `padding`, `margin` | Box model | Negative margins allowed (use sparingly) |
| `aspectRatio` | Ratio constraint | Resolved during measure |
| `position: absolute` | Removes from flow | Anchor relative to nearest positioned ancestor |

### 7.4 Performance Characteristics

| Tree size | Typical layout pass duration |
|-----------|------------------------------|
| < 100 nodes | sub-ms |
| 100 – 1000 nodes | a few ms |
| > 1000 nodes | risks 16ms frame budget — virtualise or split |

**Hotspots flagged in code review:**
- Deep wrapper trees that exist only for layout (collapse with `display: contents` equivalent).
- `aspectRatio` + percentage parents (force re-measure).
- Frequent style mutations on a parent that drives child layouts.

### 7.5 Caching and Invalidation

- Each layout node caches last `Size × MeasureMode → Result`.
- Invalidation flags propagate up on style change; siblings unaffected.
- Subtree-skipping: measured children with unchanged style + parent constraints are re-used.

### 7.6 Direction (RTL) and Writing Mode

- Layout direction is inherited; explicit `direction: "rtl"` flips main-axis interpretation.
- Logical edges (`marginStart`, `marginEnd`) are preferred over physical (`marginLeft`, `marginRight`).
- Bidi text layout is delegated to the platform text engine (CoreText / Android text).

### 7.7 Native Container Integration

When a framework view sits inside a native scroll view / list, the framework reports its computed size to the host using:
- iOS: `intrinsicContentSize` / `systemLayoutSizeFitting`.
- Android: `onMeasure` overrides reporting `MeasureSpec` results.

Hosts that ignore intrinsic size will clip content — surface a warning in dev builds.

### 7.8 Where the Code Lives

```
{{repo}}/
├── third_party/yoga/                   # vendored layout solver
├── packages/layout/                    # framework-level wrappers
└── packages/renderer/src/layout/       # mounting-layer integration
```
