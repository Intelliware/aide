---
slug: testing-harness
title: "Testing Harness"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 270
---

## 17. Testing Harness

### 17.1 Test Layers

| Layer | What It Covers | Runner |
|-------|----------------|--------|
| Pure-runtime unit | Reducers, hooks, utilities | Jest / Vitest / dart test |
| Component / widget | Single component rendered in a test renderer | Test renderer |
| Integration / golden | Pixel-snapshot comparison | Golden runner |
| E2E (real device / simulator) | Full app | Detox / Maestro / Patrol |
| Performance benchmarks | Throughput / latency | Custom harness |
| Native module unit | Module logic in native test runner | XCTest / JUnit |

### 17.2 Test Renderer

The framework ships a renderer that produces a serialisable element tree without touching any native view:

```ts
const tree = render(<MyScreen />);
expect(tree.findByLabel("Sign in")).toBeVisible();
fireEvent.press(tree.findByLabel("Sign in"));
expect(tree.findByText("Welcome")).toBeVisible();
```

Properties:
- No real layout — bounds are calculated by a stubbed layout solver if needed.
- Animations advance via a virtual clock.
- Network and storage are mockable at the module-registry level.

### 17.3 Mock Module Registry

In tests, the runtime registers a mock module map instead of the production bridge:

```ts
mockNativeModule("Camera", {
  takePhoto: jest.fn(async () => ({ uri: "file://test.jpg" })),
});
```

Useful for verifying the cross-bridge contract without launching the OS dialog.

### 17.4 Golden / Snapshot Tests

- Render output is serialised (JSON tree or pixel-bitmap).
- Pixel goldens use `{{golden_diff_threshold}}`% tolerance.
- Goldens are platform-specific where rendering differs (text metrics, anti-aliasing).

### 17.5 E2E Harness

| Tool | Strengths | Notes |
|------|-----------|-------|
| Detox | Tight integration with React Native, sync-aware | Requires app instrumentation |
| Maestro | Black-box, easier setup | Less control over async waits |
| Patrol | Flutter / native interop tests | Combines Flutter test + native test |
| XCUITest / Espresso | Native baseline | Used for harness sanity checks |

### 17.6 Sync / Idle Tracking

E2E reliability depends on knowing when the app is idle. The framework exposes idle signals:
- "All network requests complete."
- "No pending animations."
- "No pending render work."

E2E runners poll these signals before each interaction.

### 17.7 Test Utilities Provided

```ts
// Wait for idle
await waitForIdle();

// Simulate state injection
mockStore.set({ user: { id: "..." } });

// Time travel
await advanceTime(2000);
```

### 17.8 CI Topology

- Unit + component: run on PR for every package touched.
- E2E: run on a device farm matrix (`{{matrix}}`) on `main` and release branches.
- Perf benchmarks: nightly + on release tags.
- Flake quarantine: tests that fail intermittently are auto-tagged `@flaky` and routed to a separate report.

### 17.9 Where the Code Lives

```
{{repo}}/
├── packages/testing/                   # test renderer + mocks
├── packages/test-utils/                # idle waiters, time travel, store mocks
├── e2e/                                # E2E suites
└── tools/perf-suite/                   # benchmarks
```
