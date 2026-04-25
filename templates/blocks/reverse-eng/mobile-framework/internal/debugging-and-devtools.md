---
slug: debugging-and-devtools
title: "Debugging and DevTools"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 260
---

## 16. Debugging and DevTools

### 16.1 Tools Provided

| Tool | Purpose | Surface |
|------|---------|---------|
| Element inspector | Pick-and-inspect a UI node | In-app overlay + dev panel |
| Network inspector | Request/response trace | Dev panel |
| Performance overlay | Per-frame metrics | In-app HUD |
| State / store inspector | Browse atoms / signals / store | Dev panel |
| Logger | Filter/colour console output | Dev panel |
| Layout inspector | Visualise bounds + flex distribution | In-app overlay |
| Crash reporter | Capture + symbolicate crashes | Dev panel + APM |
| Fast Refresh status | Show last refresh result | Dev menu badge |

### 16.2 Connection Channels

- **Local dev panel**: launches a desktop app / browser window connected over a WebSocket on `{{port}}`.
- **Device discovery**: mDNS / IP-LAN broadcast for desktop tools to find running app instances.
- **Inspector protocol**: typically Chrome DevTools Protocol (CDP) for the JS engine; framework extends with custom domains (`Renderer.*`, `Layout.*`, `Storage.*`).

### 16.3 Element Inspector Implementation

- Touch in inspector mode is intercepted before any user gesture handler.
- Inspector walks the renderer's element tree to find the topmost element under the touch.
- Element node's source position is encoded at build time (Babel / kernel transform stamps `__source`).

### 16.4 Logging API

```ts
import { Log } from '@framework/logger';

const log = Log.scope("auth");
log.info("login attempt", { user: "..." });
log.warn("deprecated path used");
log.error("failed", err);
```

- Scopes form a tree (`auth.tokens.refresh`).
- Sinks: console, dev panel, on-device file, APM provider.
- Filter expressions: `auth.* warn+`.

### 16.5 Source-Map Loading

- Dev: source maps fetched from the dev server alongside bundles.
- Prod: stack-frames symbolicated server-side via the symbol service.

### 16.6 Conditional / Build-Time Debug Code

- Code wrapped in `if (__DEV__)` is removed by the bundler in production builds.
- Native debug code wrapped in `#if DEBUG` (iOS) / `BuildConfig.DEBUG` (Android).

### 16.7 Crash Capture

- Native crashes captured via:
  - iOS: signal handler + `MetricKit` for symbolicated reports.
  - Android: `Thread.UncaughtExceptionHandler` + breakpad / Crashlytics for native libs.
- JS / Dart exceptions captured by the runtime and forwarded to the same APM channel.

### 16.8 Reproducible Test Harness

- "Save a crash session": dev tools can dump device logs, frame trace, store snapshot, and last-N requests into a single archive for filing bugs.

### 16.9 Where the Code Lives

```
{{repo}}/
├── packages/devtools-protocol/         # CDP extensions
├── packages/devtools-client/           # in-app inspector hooks
├── tools/devtools-frontend/            # desktop UI
└── ios/Inspector/, android/.../inspector/
```
