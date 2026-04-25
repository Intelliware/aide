# reverse-engineer-mobile-framework — Worked Example

## Scenario

User has an OrderHub mobile SDK at `~/code/orderhub-mobile-sdk` (Kotlin Multiplatform Mobile core, with Android AAR + iOS XCFramework + React Native bridge npm package). Version `2.5.0`. Used by the OrderHub Android app, OrderHub iOS app, and a partner RN app.

User says: *"Document the mobile SDK at ~/code/orderhub-mobile-sdk."*

## Stage 1 — Discovery and Inventory

```
Architecture: Kotlin Multiplatform Mobile (KMM) core + per-platform glue
Platforms: Android, iOS, React Native
Distribution:
  Android — Maven coords: com.orderhub:mobile-sdk:2.5.0 (Maven Central)
  iOS — CocoaPod: OrderHubSDK ~> 2.5 ; SPM: github.com/orderhub/mobile-sdk-spm @ 2.5.0
  React Native — npm: @orderhub/mobile-sdk@2.5.0 (peer: react-native >= 0.71)
Public API surface (KMM core, exposed per platform):
  OrderHubClient (init, configure, getOrders, placeOrder, ...)
  Session (login, refresh, logout)
  Tracker (track, identify, flush)
  ErrorHandler protocol (1 extension point)
  ConfigBuilder (12 configuration options)
Internal-only: ~30 utility classes, omitted from Part B
```

`steps/scaffold.md` proposes Part A as 12 files under `docs/mobile-framework-internal/` (including per-platform build/publish files) and Part B as a single `mobile-framework-consumer.md` with per-API per-platform example placeholders. User approves.

## Stage 2 — Foundation

- Architecture: KMM `commonMain` carries domain logic; `androidMain`, `iosMain` carry platform glue. RN bridge is a thin layer over the Android/iOS native targets.
- Platform support matrix: Android (minSdk 24+), iOS (15+), RN (0.71+).
- Public API surface enumerated. Configuration options verified against `ConfigBuilder.kt` defaults.

## Stage 3 — Component-by-Component Extraction

For each public API (e.g. `OrderHubClient.placeOrder`):

- **Source:** `commonMain/.../OrderHubClient.kt:142` — `suspend fun placeOrder(request: PlaceOrderRequest): Result<Order, OrderError>`.
- **Per-platform behavior:**
  - Android: directly callable from coroutine; suspending function exposed via Kotlin coroutines.
  - iOS: exposed as completion-handler API via `OrderHubSDK.placeOrder(_:completion:)` (KMM-generated bridge).
  - React Native: Promise-based JS API via the bridge module: `OrderHubSDK.placeOrder({...})`.
- **Per-platform code examples:**
  ```kotlin
  // Android
  val result = orderHub.placeOrder(PlaceOrderRequest(...))
  ```
  ```swift
  // iOS
  OrderHubSDK.shared.placeOrder(request) { result in ... }
  ```
  ```js
  // React Native
  const order = await OrderHubSDK.placeOrder({ ... });
  ```

Subset rule check: every Part B fact (signature, defaults, error model) is also in Part A. Pass.

## Stage 4 — Integration, Patterns, Migration

- Integration guide per platform (install, initialize, configure, first call).
- Common pattern: "Wrap calls in a UI-thread-safe error handler"; per-platform examples included.
- Anti-pattern: "Don't call `init()` from app-launch path on Android — defer to first user interaction" (verified rationale in source comments).
- Migration: v1.x → v2.x — `Tracker.event()` renamed to `Tracker.track()`; auth model changed from API key to OAuth2.

## Stage 5 — Verification and Finalization

`steps/verify.md`:

- Completeness: all public APIs documented per platform. Pass.
- Accuracy: spot-checked 4 APIs on each of 3 platforms. 1 failure — RN code example for `Tracker.identify` showed a callback-style API, but the actual JS bridge returns a Promise. Corrected.
- Consistency / Subset: every Part B item in Part A. Pass.
- Domain checks:
  - Platform support matrix documented and verified.
  - Distribution mechanism documented per platform: AAR coords, Pod name, SPM URL, npm package — all verified against published artifacts.
  - Per-platform code examples present for all public APIs. Pass.
  - Configuration option defaults verified against `ConfigBuilder.kt`. Pass.
  - Migration guide v1→v2 verified against actual breaking changes.

Verification report: 1 failure, 0 warnings. GO after correction.

## Outputs

```
~/code/orderhub-mobile-sdk/docs/mobile-framework-internal/   ← Part A
  ├── 01-framework-overview.md
  ├── 02-platform-support-matrix.md
  ├── 03-architecture-kmm-core.md
  ├── 04-build-and-publish-android.md
  ├── 05-build-and-publish-ios.md
  ├── 06-build-and-publish-rn.md
  ├── ... (6 more)
  ├── extraction-status.md
  └── CHANGE-TRACKER.md

~/code/orderhub-knowledge-base/source-docs/orderhub-mobile-sdk/
  └── mobile-framework-consumer.md                           ← Part B
```

## Hand-off

> "Reverse-engineering of orderhub-mobile-sdk is complete. Next, run `build-knowledge-base` to aggregate Part B into the central KB index."
