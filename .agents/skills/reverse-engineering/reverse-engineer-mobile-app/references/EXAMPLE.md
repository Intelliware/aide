# reverse-engineer-mobile-app — Worked Example

## Scenario

User has an Android app at `~/code/orderhub-android` (Kotlin, Jetpack Compose, MVVM, Hilt for DI, Retrofit for networking, Room for local storage, FCM for push). Version `5.2.0`.

User says: *"Document the Android app at ~/code/orderhub-android."*

## Stage 1 — Discovery and Inventory

```
Platform: Android (minSdk 24, targetSdk 34)
Language: Kotlin
UI: Jetpack Compose
Architecture: MVVM + Clean (data / domain / ui layers per feature)
DI: Hilt
Networking: Retrofit + OkHttp + Moshi
Local storage: Room (8 entities, 4 DAOs)
Push: FCM (4 topics, 2 channels)
Navigation: androidx.navigation.compose — 32 destinations
Screens: 32 (Login, Dashboard, OrderList, OrderDetail, Cart, Checkout, ...)
API integration: 6 service interfaces, 78 endpoints consumed
Deep links: 12 patterns registered in AndroidManifest (https://orderhub.app/order/{id} etc.)
Permissions: INTERNET, POST_NOTIFICATIONS, CAMERA (barcode scan), ACCESS_FINE_LOCATION (delivery)
```

`steps/scaffold.md` proposes Part A as 16 files under `docs/mobile-app-internal/` and Part B as a single `mobile-app-consumer.md`. User approves.

## Stage 2 — Global Infrastructure

- Architecture: feature modules (`feature-orders`, `feature-checkout`, ...) + shared `core-network`, `core-database`, `core-design`.
- Navigation: nav graph in `app/src/main/java/.../navigation/AppNavGraph.kt` — 32 destinations, 7 nested graphs.
- State: per-feature `ViewModel` exposing `StateFlow<UiState>`. UI collects with `collectAsStateWithLifecycle`.
- API service: Retrofit with auth interceptor (adds JWT, refreshes on 401).
- Auth: `SessionManager` holds tokens, refresh via `core-network.AuthInterceptor`.
- Errors: `Result<T, ApiError>` sealed class; UI maps to user-facing strings via `ErrorMapper`.

## Stage 3 — Feature-by-Feature Extraction

For `feature-checkout`:

- **Part A:** 4 screens (CheckoutAddress, CheckoutPayment, CheckoutReview, CheckoutSuccess). Single `CheckoutViewModel`. Calls `OrdersApi.placeOrder`, `PaymentsApi.tokenize`. Saves draft to Room (`CheckoutDraftEntity`). Navigation: enters from Cart, exits to Dashboard or Order Detail.
- **Part B:** Checkout feature consumes `POST /orders` and `POST /payments/*`. Auth required. Persists in-progress checkout to local DB for resume-after-kill.

## Stage 4 — Platform-Specific Concerns

- **Lifecycle:** ViewModel survives config change; `SavedStateHandle` preserves form input across process death; checkout draft survives via Room.
- **Deep links:** 12 patterns including `https://orderhub.app/order/{id}`, `orderhub://verify-email/{token}`. Verified against AndroidManifest intent-filter blocks.
- **Push:** FCM topics `orders`, `promotions`, `system`; channels `order_updates`, `marketing`. Verified against `FcmService.kt` and channel-creation code.
- **Permissions:** documented runtime-permission flow for camera and location, including denied-fallback UI.
- **Background:** WorkManager job to retry failed order submissions when network returns.
- **Offline:** read-only browsing of last cached order list; checkout requires online.

## Stage 5 — Verification and Finalization

`steps/verify.md`:

- Completeness: 32/32 screens, 6/6 services, 4/4 DAOs, 12/12 deep links. Pass.
- Accuracy: spot-checked 5 features. 1 failure — `CheckoutViewModel` documented as injecting `OrdersRepository`, but actually injects `OrdersApi` directly (Repository pattern is used elsewhere but bypassed here). Corrected.
- Consistency: no internal details leaked into Part B. Pass.
- Domain checks:
  - Platform identified (Android) — Pass.
  - Navigation graph: 32/32 destinations. Pass.
  - Permissions match manifest: 3/3. Pass.
  - Push setup verified: 4/4 topics, 2/2 channels. Pass.
  - Deep links: 12/12 patterns in manifest. Pass.
  - Lifecycle: kill-restore documented. Pass.

Verification report: 1 failure, 0 warnings. GO after correction.

## Outputs

```
~/code/orderhub-android/docs/mobile-app-internal/      ← Part A
  ├── 01-app-overview.md
  ├── 02-architecture.md
  ├── 03-navigation.md
  ├── ... (13 more)
  ├── extraction-status.md
  └── CHANGE-TRACKER.md

~/code/orderhub-knowledge-base/source-docs/orderhub-android/
  └── mobile-app-consumer.md                           ← Part B
```

## Hand-off

> "Reverse-engineering of orderhub-android is complete. Next, run `build-knowledge-base` to aggregate Part B into the central KB index."
