---
slug: asset-pipeline
title: "Asset Pipeline"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 200
---

## 10. Asset Pipeline

### 10.1 Asset Categories

| Category | Build-time Handling | Runtime Resolution |
|----------|---------------------|--------------------|
| Static images (`.png`, `.jpg`, `.webp`, `@2x`, `@3x`) | Hashed, scaled variants emitted | Resolved by display scale |
| Vector graphics (`.svg`, `.pdf`) | Inlined as XML or rasterised at chosen DPIs | Renderer chooses crispest |
| Fonts (`.ttf`, `.otf`) | Registered with native font system at app launch | Looked up by family name |
| JSON / config | Bundled as-is or compiled into bytecode | `require('./config.json')` |
| Localisations | Per-locale resource sets | OS locale → fallback chain |
| Lottie / animations | Bundled JSON + atlases | Streamed by animation runtime |
| Pre-rendered shaders | Compiled offline where supported | Loaded lazily |

### 10.2 Build-Time Pipeline

```
[ Source assets in repo (images, fonts, locales, ...) ]
        ↓
[ Asset scanner (manifest of all assets + their hashes) ]
        ↓
[ Per-platform packing ]
   ├─ iOS: Asset Catalog + Bundle resources
   ├─ Android: res/drawable-* + assets/
   └─ JS bundle: optional inline data URIs for tiny assets
        ↓
[ Final artifacts embedded in .ipa / .aab ]
```

### 10.3 Asset Reference Resolution

```ts
// What user code writes
import logo from './assets/logo.png';

// What the asset registry stores
{
  uri: "asset:///packages/app/assets/logo",
  scales: [1, 2, 3],
  hash: "ab12...",
  width: 200, height: 60,
}

// What the renderer selects at runtime
display.scale === 2 ? logo@2x.png : logo@3x.png
```

### 10.4 Hash and Cache Busting

- Every asset is suffixed with a content hash at build time so OTA / CDN caches invalidate cleanly.
- The hash is included in the asset registry, so refs are stable across builds when content is unchanged.

### 10.5 Localised Assets

- Per-locale folders (`en.lproj`, `fr.lproj`, `values-fr/`) participate in the platform's lookup chain.
- The framework augments this with a `Locale → fallback list` (e.g., `fr-CA → fr → default`).
- String tables can be loaded from a remote source for OTA-style copy updates.

### 10.6 Custom Fonts

- Fonts are registered:
  - iOS: `UIAppFonts` array in `Info.plist` (or runtime `CTFontManagerRegisterFontsForURL`).
  - Android: copied to `assets/fonts/` and registered via `Typeface.createFromAsset`.
- Family names are normalised to the framework's font-family API to avoid platform inconsistencies (e.g., "Helvetica Neue" vs. "HelveticaNeue").

### 10.7 Streaming / Lazy Assets

- Heavy assets (videos, large images) MAY be streamed from a CDN at runtime instead of bundled.
- The framework provides a uniform API (`Asset.fromUri(...)`) so user code doesn't differentiate.
- Streamed assets are cached on disk via the same LRU as image cache.

### 10.8 Asset Budgeting

- Per-platform size budgets enforced in CI:
  - `.ipa`: `{{ios_budget_mb}}` MiB total, `{{ios_assets_mb}}` MiB assets.
  - `.aab`: `{{android_budget_mb}}` MiB base APK, larger via dynamic delivery.
- Reports broken down by package + asset type, surfaced in PR checks.

### 10.9 Where the Code Lives

```
{{repo}}/
├── packages/asset-registry/            # build-time scan + manifest
├── packages/runtime/src/assets/        # runtime resolver
├── tools/asset-scaler/                 # @2x / @3x / vector → raster
└── ios/Assets/, android/.../res/       # platform-specific output dirs
```
