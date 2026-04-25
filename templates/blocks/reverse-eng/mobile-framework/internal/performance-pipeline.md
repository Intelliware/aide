---
slug: performance-pipeline
title: "Performance Pipeline"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 250
---

## 15. Performance Pipeline

### 15.1 Frame Budget

| Refresh | Budget | Notes |
|---------|--------|-------|
| 60 Hz | 16.67 ms | Default target |
| 90 Hz | 11.11 ms | Tablets / premium devices |
| 120 Hz | 8.33 ms | ProMotion / high-refresh Android |

Anything that crosses the budget contributes to a missed frame; the perf overlay reports them.

### 15.2 Scheduler

- Cooperative scheduler with priority levels:
  - **Sync**: must run before next frame (input handling).
  - **High**: user interactions (animations).
  - **Normal**: typical updates.
  - **Low / Idle**: background work, prefetching.
- Time-slicing: long renders yield to the scheduler if more than `{{ms}}` ms elapsed.
- Microtasks drain at the end of every priority slice.

### 15.3 Render Scheduling

```
[ Vsync signal ]
   ↓
[ Scheduler — pull next batch of work in priority order ]
   ↓
[ Reconcile + layout ]
   ↓
[ Mount diff ]
   ↓
[ Compositor / GPU submit ]
   ↓
[ Frame presented ]
```

Frames that overrun spill into the next vsync; the scheduler logs the overrun.

### 15.4 Profiler / Tracing Hooks

| Surface | Output |
|---------|--------|
| In-app perf overlay | Per-frame CPU + GPU + JS-thread bars |
| Trace export | systrace / Perfetto / Chrome Trace JSON |
| APM SDK integration | RUM frame metrics streamed to provider |
| Ad-hoc `Tracing.scope("name", () => ...)` | Adds labelled spans |

### 15.5 Memory Profiling

- `Memory.snapshot()` captures heap, runtime, native bound buffers.
- Background pressure events trigger automatic snapshots when `{{n}}` MB resident is exceeded.
- Leak detector samples objects retained > `{{n}}` GC cycles and reports owners.

### 15.6 Startup Phases

```
T0  process spawn
T1  engine init complete
T2  app bundle loaded
T3  first JS execution
T4  first frame rendered (TTI candidate)
T5  first interactive (input responds within 100ms)
```

Each transition emits a `startup.phase` metric.

### 15.7 Common Performance Anti-Patterns Detected by Tooling

- Heavy synchronous bridge calls (`bridge.call.duration > {{n}}` ms).
- Layout thrash (>1 layout pass on the same frame for the same node).
- Deep tree without memoisation around frequently-changing inputs.
- Non-virtualised lists with > `{{n}}` items.
- Synchronous storage reads on the JS thread during render.

### 15.8 Concurrency Budget Enforcement

- Per-tick CPU budget for JS thread: `{{ms}}` ms.
- Idle prefetching: maximum `{{n}}` outstanding network requests; image decode pool size `{{n}}`.

### 15.9 Where the Code Lives

```
{{repo}}/
├── packages/scheduler/                 # priority queue + time-slicing
├── packages/profiler/                  # tracing hooks
├── tools/perf-overlay/                 # in-app overlay
└── tools/perf-suite/                   # CI perf benchmarks
```
