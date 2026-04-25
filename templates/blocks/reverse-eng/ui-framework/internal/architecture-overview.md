---
slug: architecture-overview
title: "Architecture Overview"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 110
---

## 1. Architecture Overview

<!-- The bird's-eye-view of the framework's runtime: what runs at compile
time vs. runtime, how user input becomes DOM, and the major subsystems
and their boundaries. Maintainers must read this before any of the
deeper sections make sense. -->

### 1.1 Framework Identity

- **Name:** {{Framework Name}}
- **Kind:** [e.g., "VDOM-based UI framework", "Signal-based reactive UI framework", "Compile-time fine-grained reactive framework", "Component framework over native Web Components."]
- **Languages:** [e.g., "TypeScript core; templates compiled to JS via {{compiler}}."]
- **Targeted runtimes:** [e.g., "Browser (evergreen), SSR (Node ≥ 20), edge runtimes (workerd)."]
- **Primary packages:**

| Package | Purpose |
|---------|---------|
| `@{{org}}/core` | Reactivity, scheduler, component runtime |
| `@{{org}}/compiler` | Template / JSX → JS code generation |
| `@{{org}}/runtime-dom` | DOM bindings: render, patch, event delegation |
| `@{{org}}/runtime-ssr` | Server rendering and hydration |
| `@{{org}}/router` | Routing |
| `@{{org}}/devtools` | Devtools bridge and inspector |
| `@{{org}}/cli` | Project scaffolding, dev server, build |
| [Other] | [purpose] |

### 1.2 Pipeline From Source to DOM

```
         AUTHOR-TIME                          RUN-TIME
─────────────────────────────────  ─────────────────────────────────

  Source files                                ┌─ Reactivity graph
  (.{{ext}}, .{{tpl}})                        │
        │                                     │     ┌─ Scheduler
        ▼                                     │     │
  ┌─────────────┐                             │     ▼
  │  Parser     │── AST ──┐                Signal/  Microtask
  └─────────────┘         │                Effect   queue
                          ▼                  │       │
  ┌──────────────────────────┐               │       ▼
  │  Compiler / Code-gen     │── render fn ─►│   Render fn ─► VDOM /
  │  (templates, slots,      │               │                IR
  │   directives, scopes)    │               │                  │
  └──────────────────────────┘               │                  ▼
                                             │           Reconciler /
                                             │           Patcher
                                             │                  │
                                             │                  ▼
                                             └────────────►   DOM
```

### 1.3 Subsystems and Boundaries

| Subsystem | Owns | Depends on |
|-----------|------|------------|
| Reactivity | Signal/effect/computed primitives, dependency tracking, batching | (none — leaf) |
| Component runtime | Component lifecycle, instance state, props/slots/refs | Reactivity |
| Compiler | Template/JSX → JS, static hoisting, optimizer flags | (build-time only) |
| Renderer (DOM) | Mount, patch, event binding, attribute handling | Component runtime, scheduler |
| Renderer (SSR) | String render, hydration markers | Component runtime |
| Router | Route matching, lazy chunks, navigation lifecycle | Component runtime, history API |
| DI / Context | Provider/consumer trees, scopes | Component runtime |
| Devtools bridge | Inspector protocol | Component runtime, reactivity |
| CLI | Dev server, HMR, production build | Compiler |

### 1.4 Compile-Time vs. Runtime Split

- **At compile time:** [e.g., "Templates are parsed; static nodes are hoisted; expressions are wrapped in tracked accessors; directives are lowered to runtime calls; bundle is split per route."]
- **At runtime:** [e.g., "Component instances are created; reactivity tracks reads inside `effect`; the scheduler flushes effects; the renderer patches the DOM."]
- **Why this matters for maintainers:** changes that look small at runtime (e.g., adding a directive) usually require a coordinated change in the compiler too.

### 1.5 Design Principles

- **Principle 1:** [e.g., "Reactivity primitive is the smallest reusable unit — everything else (effects, components, stores) composes from it."]
- **Principle 2:** [e.g., "The compiler does as much work as is sound; runtime stays small."]
- **Principle 3:** [e.g., "DOM operations are batched per microtask; never synchronous in user effects."]
- **Principle 4:** [e.g., "Errors are recovered locally — a thrown render does not bring down the tree."]
- **Principle 5:** [e.g., "Backward compatibility within a major; one minor of deprecation before removal."]

### 1.6 Where to Read Next

| If you're working on… | Start with |
|------------------------|------------|
| A reactivity bug | reactivity-system, render-pipeline |
| A new directive | template-or-jsx-compilation, directives-and-pipes |
| A renderer change | render-pipeline, performance-optimization-pipeline |
| Routing | routing-internals |
| SSR / hydration | render-pipeline, build-output-and-tree-shaking |
