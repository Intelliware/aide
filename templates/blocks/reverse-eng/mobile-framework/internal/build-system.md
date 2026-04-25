---
slug: build-system
title: "Build System"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect, ops]
optional: false
order-hint: 290
---

## 19. Build System

### 19.1 Top-Level Build Pipeline

```
[ Source ]
   ↓ (lint + typecheck)
[ Codegen — bridge specs, route tables, asset registry ]
   ↓
[ Bundler — JS / Dart compile, tree-shake, minify ]
   ↓
[ Native compile — Xcode / Gradle invocation ]
   ↓
[ Asset packing — platform-specific resource folders ]
   ↓
[ Sign + package ]
   ↓
[ Artifacts: .ipa, .apk / .aab, framework distributables ]
```

### 19.2 Tooling Per Platform

| Platform | Build Tool | Package Output |
|----------|-----------|----------------|
| iOS | Xcode + xcodebuild + CocoaPods / SPM | `.framework`, `.xcframework`, `.ipa` |
| Android | Gradle (AGP) | `.aar`, `.apk`, `.aab` |
| Cross-platform | Custom orchestrator (Bazel / Buck / Turborepo / Nx / Melos) | npm / pub package |

### 19.3 Codegen Stages

| Stage | Inputs | Outputs |
|-------|--------|---------|
| Bridge codegen | `*.spec.ts` (turbomodules) | C++/Obj-C/Java glue |
| Asset registry | Asset folder scan | `assets.json` + per-platform manifests |
| Route table | App route definitions | typed navigator + linking schema |
| Localisation | `*.po` / ARB / strings | per-locale resource files |
| Component types | Component definitions | runtime + IDE typings |

Codegen runs **before** language compilers; output is checked-in or generated to a `.gen/` directory excluded from VCS.

### 19.4 Bundler

- Entry-point resolution: `index.{ios,android}.{ts,tsx,js,jsx}` → `index.{ts,tsx,js,jsx}`.
- Plugins: typescript / babel / swc, asset transformer, source-map writer.
- Splitting: optional chunk-per-route for large apps.
- Output: framework / engine-friendly bytecode (`.hbc`, `.dill`, `.bundle`).

### 19.5 Native Compile Integration

- iOS: framework's Xcode project consumed by the host app via CocoaPods spec or Swift Package.
- Android: AAR published to a Maven repo (or Composite Builds for monorepos).
- ABI policy: ship `arm64-v8a` (mandatory), `armeabi-v7a` (legacy phones), `x86_64` (emulators only).
- C++ library compatibility: `c++_shared` STL, RTTI on, exceptions per-module.

### 19.6 Reproducibility

- Pinned tool versions: Xcode `{{ver}}`, AGP `{{ver}}`, JDK `{{ver}}`, NDK `{{ver}}`, Node `{{ver}}`.
- Build container image: `{{ci_image}}`.
- All inputs (source + transitive deps) hashed; cache key includes hash so PRs reuse main's cache.

### 19.7 Distribution

- iOS: `.xcframework` published to a CDN; CocoaPods spec / SPM manifest references the `.xcframework` URL + checksum.
- Android: `.aar` + `.pom` published to Maven Central / internal artifactory.
- JS: published to npm under the framework org.

### 19.8 Local Development

- Single-command bootstrap: `{{cmd}}` (e.g., `pnpm install && pod install && ./bootstrap.sh`).
- Watch mode that reruns codegen on spec changes.
- Sample apps under `examples/` are first-class citizens — used as smoke tests.

### 19.9 Where the Code Lives

```
{{repo}}/
├── packages/codegen/                   # bridge / asset / route generators
├── packages/bundler/                   # bundler config + plugins
├── ios/Frameworks/                     # Xcode project per framework module
├── android/                            # Gradle modules
└── tools/build/                        # CI orchestrator scripts
```
