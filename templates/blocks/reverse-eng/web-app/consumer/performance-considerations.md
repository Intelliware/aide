---
slug: performance-considerations
title: "Performance Considerations"
applies-to: [re-web-app-consumer]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 190
---

## 9. Performance Considerations

<!-- How the embed affects host-page performance and the levers embedders
have to keep load times, interaction latency, and memory in check. -->

### 9.1 Load Cost Per Mode

| Mode | Initial JS (gz) | CSS (gz) | Network requests | First interactive |
|------|-----------------|----------|------------------|-------------------|
| iframe | {{kb}} (in iframe; does not block host) | {{kb}} | {{n}} | {{ms}} |
| Web Component | {{kb}} | {{kb}} | {{n}} | {{ms}} |
| SDK / Overlay | {{kb}} (lazy after `init`) | {{kb}} | {{n}} | {{ms}} |

These are budget targets; CI gates fail builds that regress more than {{%}}.

### 9.2 Lazy Loading and Deferred Work

- **Defer the SDK loader:** add `async` or `defer` to the script tag.
- **Mount on demand:** call `sdk.create()` only when the user navigates to the section that needs it.
- **Iframe lazy load:** `loading="lazy"` keeps off-screen iframes from competing with above-the-fold work.
- **Code splitting:** [e.g., "Heavy panels (export, settings) load on first interaction, not on mount."]

### 9.3 Caching and CDN

- **Versioned URLs:** [e.g., "All static assets are served from `https://{{cdn}}/v{{semver}}/…` with `Cache-Control: public, max-age=31536000, immutable`. Pin to a major version for stability."]
- **Pre-connect:** add `<link rel="preconnect" href="https://{{cdn}}" crossorigin>` to the host page to shave the TLS handshake.
- **Service workers:** the embed does NOT register a service worker. Hosts may pre-cache embed assets via their own SW.

### 9.4 Runtime Cost on the Host Page

- **Memory:** {{mb}} per active SDK instance; iframe mode is fully isolated and does not count against host heap.
- **Main thread:** [e.g., "Scheduling uses `requestIdleCallback` for non-critical work. Long tasks > 50 ms are tracked in our perf telemetry."]
- **Layout thrash:** the embed reads then writes; embedders should avoid forcing synchronous layout in slot render functions.

### 9.5 Network and API Cost

- **API request volume:** [e.g., "Idle embed makes ~{{n}} requests / minute (heartbeat + token renewal). Active flows depend on user behavior."]
- **WebSocket / SSE:** [e.g., "Real-time updates use a single shared connection. Multiple embed instances on one page share it."]
- **Backend rate limits:** see data-integration §4.5.

### 9.6 Multiple Instances on One Page

- All modes support N>1 instances on a single page.
- Shared singletons: realtime connection, theme/locale registries, font loading.
- **Recommendation:** keep total active instances under {{n}} — beyond that, dedicate iframes or aggregate UI.

### 9.7 Performance Budgets and Telemetry

- **Core Web Vitals contribution:** [e.g., "The embed targets ≤ {{ms}} INP and ≤ {{ms}} LCP impact at the 95th percentile."]
- **RUM / RUM-opt-in:** [e.g., "The SDK reports anonymous timing data unless `telemetry: false` is set in `sdk.init`."]
- **Local profiling hooks:** [e.g., "Set `?{{prefix}}_perf=1` in the URL to enable a perf overlay."]

### 9.8 Performance Anti-Patterns

- [e.g., "Don't load the SDK script synchronously in `<head>` — it blocks host parsing."]
- [e.g., "Don't mount/unmount the embed across every host route change — keep it mounted and call `sdk.setRoute()` to swap views."]
- [e.g., "Don't subscribe to high-frequency events (e.g., scroll-position) and proxy them across postMessage — debounce or filter at the source."]
