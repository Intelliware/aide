---
slug: performance-tuning
title: "Performance Tuning"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 280
---

## 18. Performance Tuning

Document the framework's performance posture: the published benchmarks, the typical bottlenecks, the runtime tuning knobs, and the profiling tools that ship with it. The goal is to give a maintainer the playbook for "the framework feels slow" or "regression detected" without a multi-day investigation. Verify each documented bottleneck with a current profile — performance characteristics drift quickly across releases.

Be honest about what's slow on purpose (e.g., per-request body limits, mandatory validation) vs. what's a regression to fix. Note the perf budget for the hot path: maintainers should refuse PRs that allocate inside the per-request inner loop without an offsetting win.

### Suggested template content

**Published benchmarks:**

- Suite: `{{benchmarks-path}}`
- Last published: {{date}}
- Baseline: {{baseline-numbers — e.g. "100k req/s on noop route, 8-core M1, Node 20"}}
- CI runs the suite on every PR; >= {{regression-threshold}} regression flags the PR.

**Hot path budget:**

| Phase | Budget per request | Allocations |
|---|---|---|
| Parse + route | < 50 µs | 1-2 small objects |
| Middleware kernel | < 10 µs / mw | 1 closure per mw |
| Handler dispatch + DI resolve | < 100 µs | per-scope resolution cache |
| Encode + write | < 50 µs (small body) | streaming for > 64 KiB |

**Common bottlenecks (from real triage):**

| Bottleneck | Symptom | Fix |
|---|---|---|
| Sync logging | tail latency spikes | Ensure async sinks; check for `console.*` in core |
| Validator allocations | high RSS, GC pressure | Use schema instances, not factories per-request |
| Plugin middleware before body limit | OOM on large bodies | Place body-limit before any allocating middleware |
| Per-request DI rebuilding | CPU pegged | Move stable services to singleton scope |
| Slow JSON encoder | latency on response | Pre-encode static portions; stream large arrays |

**Tuning knobs:**

| Config key | Default | Effect |
|---|---|---|
| `server.keep_alive_timeout_ms` | {{default}} | Influences load-balancer interaction |
| `server.headers_timeout_ms` | {{default}} | Slowloris protection |
| `server.body_limit_bytes` | {{default}} | Reject oversized early |
| `pipeline.precompile` | true | AOT compile middleware chain at bootstrap |
| `parser.json.max_depth` | {{default}} | Stack-overflow protection |
| `logger.batch_size` | {{default}} | Log throughput |
| `logger.flush_interval_ms` | {{default}} | Log latency floor |

**Source files for the hot path:**

- Pipeline kernel: `{{path}}`
- Router match: `{{path}}`
- DI resolve: `{{path}}`
- JSON encoder: `{{path}}`

**Profiling tools shipped:**

- `framework profile cpu` — emits a flamegraph from the dev server.
- `framework profile heap` — heap snapshot with annotations.
- `framework metrics dump` — current metrics counters/histograms.
- `framework trace --route <path>` — per-phase span breakdown for a route.

**Memory:**

- Per-connection overhead: ~{{bytes-per-conn}}.
- Long-lived caches: {{caches}} — bounded by {{bound}}.
- Watch for: per-request closures captured by long-lived listeners (classic leak).

**Concurrency:**

- Default model: {{concurrency-model}}.
- Maximum useful concurrency: tied to {{constraint — e.g. event loop or thread pool size}}.
- Backpressure: applied via {{mechanism — e.g. body-parsing pause, response stream}}.

**Regression process:**

1. CI flags a benchmark regression on a PR.
2. Author runs `framework profile cpu` against the affected benchmark.
3. Compare flamegraphs against the baseline (committed to repo).
4. Fix or justify; benchmark deltas appear in the changelog fragment.

**Common pitfalls:**

- Treating microbenchmarks as production behavior — always verify with realistic workload.
- Allocating Buffers / strings in the hot path "just for clean code" — the encoder shows up.
- Adding a plugin to all routes when it's needed on a few — pay the per-request cost everywhere.

**Cross-references:**

- See observability-hooks block for production-level telemetry.
- See middleware-pipeline block for the per-request kernel cost model.
