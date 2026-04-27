---
slug: build-system
title: "Build System"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect, ops]
optional: false
order-hint: 290
---

## 19. Build System

<!-- Mobile-framework build pipelines vary sharply by approach (native-only, JS-bridge,
Dart/Flutter, Kotlin Multiplatform, Xamarin/.NET MAUI). The schematic below is a
generic shape — many stages may be absent or replaced. Document what this
framework actually does. -->

### 19.1 Top-Level Build Pipeline

```
[ Source ]
   ↓ (lint + static analysis + type check)
[ Codegen ]                      ← e.g., bridge / FFI specs, route tables, asset registries, generated bindings
   ↓
[ Compile / bundle ]             ← language compile (Swift / Kotlin / Dart / Rust / Java / C# / TS),
                                   tree-shake, minify, intermediate-representation generation
   ↓
[ Native compile / link ]        ← e.g., Xcode build, Gradle build, AOT compile, NDK compile, .NET runtime build
   ↓
[ Asset packing ]                ← per-platform resource folders, embedded fonts/images/strings
   ↓
[ Sign + package ]
   ↓
[ Artifacts ]                    ← e.g., .ipa, .apk, .aab, .xcframework, .aar, .so/.dylib, .nupkg, npm/pub package
```

### 19.2 Tooling Per Platform

| Platform / approach | Build tool(s) | Package output |
|----------|-----------|----------------|
| iOS (native) | Xcode + xcodebuild; SPM and/or CocoaPods | `.framework`, `.xcframework`, `.ipa` |
| Android (native) | Gradle (AGP), or Bazel | `.aar`, `.apk`, `.aab` |
| React Native | Metro / Hermes + native (Xcode + Gradle) | npm package + native binaries |
| Flutter | Flutter SDK (Dart compiler + native toolchains) | pub package + `.ipa`/`.apk`/`.aab` |
| Kotlin Multiplatform | Gradle (KMP) + native targets (Konan for iOS) | Maven artifacts + `.framework`/`.aar` |
| Xamarin / .NET MAUI | dotnet CLI + MSBuild + native toolchains | NuGet packages + `.ipa`/`.apk`/`.aab` |
| Cross-platform monorepo orchestration (optional layer above the above) | [e.g., Bazel, Buck2, Nx, Turborepo, Melos for Dart, Lerna] | n/a — produces the platform artifacts above |

### 19.3 Codegen Stages

<!-- Codegen is heavy in JS-bridge frameworks (React Native turbomodules), Flutter
(asset bundling), KMP (binding generation). Many native or .NET frameworks have
little or no codegen step beyond resource compilation. Record what's actually
present here. -->

### 19.3 Codegen Stages

<!-- Examples below cover common stages in JS-bridge frameworks (React Native turbomodules,
asset registries) and Flutter/KMP equivalents. Document the stages this framework
actually runs — many native iOS/Android frameworks have only resource compilation. -->

| Stage (illustrative) | Inputs (example) | Outputs (example) |
|-------|--------|---------|
| FFI / bridge codegen | [e.g., RN turbomodule `*.spec.ts`, Flutter pigeon `.dart`, KMP `expect/actual`, .NET P/Invoke source generators] | [native glue — C++ / Obj-C / Java / Kotlin / Swift] |
| Asset registry | Asset folder scan | [e.g., `assets.json`, generated `R.swift` / `R.kt`, Flutter asset manifest] |
| Route / navigation table | Route definitions | [typed navigator + deep-link / linking schema] |
| Localisation | [e.g., `*.po` / ARB / `Localizable.strings` / `strings.xml` / `*.resx`] | per-locale resource files |
| Component / type bindings | Component / API definitions | runtime + IDE typings |

Codegen runs **before** language compilers; output is either checked-in or written to a generated directory [e.g., `.gen/`, `build/generated/`, `Generated.swift`] that's excluded from VCS.

### 19.4 Bundler / Compiler

<!-- Replace with the actual entry-point convention, plugin chain, and output format of
this framework. The list below is React Native-flavoured; Flutter, KMP, and native
frameworks have very different shapes. -->

- **Entry-point resolution:** [e.g., RN: `index.{ios,android}.{ts,tsx,js,jsx}` → `index.{ts,tsx,js,jsx}`; Flutter: `lib/main.dart`; KMP: `commonMain` source set; native iOS/Android: per-module entry]
- **Compile / transform chain:** [e.g., RN: TypeScript / Babel / SWC + asset transformer + source-map writer; Flutter: Dart frontend + AOT/JIT compiler; KMP: Kotlin compiler with platform backends; native: standard language compilers]
- **Splitting:** [e.g., chunk-per-route, dynamic feature modules (Android Play Feature Delivery), on-demand resources (iOS), deferred components (Flutter)]
- **Output format:** [e.g., RN: Hermes bytecode `.hbc` / Metro bundle; Flutter: AOT snapshot / `.dill`; native: standard binaries (`.dylib`/`.so`/`.framework`/`.aar`); .NET: assemblies/AOT-compiled native]

### 19.5 Native Compile Integration

- **iOS:** framework consumed by the host app via [SPM, CocoaPods, Carthage, manual `.xcframework`].
- **Android:** [e.g., AAR published to Maven repo (Maven Central / internal artifactory / Composite Builds for monorepos)].
- **ABI policy:** [e.g., ship `arm64-v8a` (mandatory), `armeabi-v7a` (legacy phones), `x86_64` (emulators only); plus iOS `arm64` device + `arm64`/`x86_64` simulator slices].
- **Native dependency / runtime compatibility:** [e.g., C++ STL choice, exception handling, RTTI; Swift ABI stability; .NET runtime version; Dart embedder version].

### 19.6 Reproducibility

- **Pinned tool versions:** [e.g., Xcode `{{ver}}`, Android Gradle Plugin `{{ver}}`, JDK `{{ver}}`, NDK `{{ver}}`, Node `{{ver}}`, Flutter SDK `{{ver}}`, Kotlin `{{ver}}`, .NET SDK `{{ver}}`, Ruby `{{ver}}`].
- **Build container image:** `{{ci_image}}`.
- **All inputs (source + transitive deps) hashed;** cache key includes hash so PRs reuse main's cache.

### 19.7 Distribution

<!-- Distribution channels vary by approach — adjust to what this framework actually publishes. -->

- **iOS artifact:** [e.g., `.xcframework` published to a CDN with CocoaPods spec / SPM manifest referencing URL + checksum; or SPM-only via Git tags; or CocoaPods source pod].
- **Android artifact:** [e.g., `.aar` + `.pom` published to Maven Central / Google Maven / internal artifactory; or jitpack source build].
- **Cross-platform package (if applicable):** [e.g., npm package (RN), pub.dev package (Flutter), Maven (KMP), NuGet (.NET MAUI / Xamarin)].

### 19.8 Local Development

- **Single-command bootstrap:** `{{cmd}}` [e.g., `pnpm install && pod install && ./bootstrap.sh` for RN; `flutter pub get && flutter precache` for Flutter; `./gradlew build` for native Android; `pod install && open *.xcworkspace` for native iOS; `dotnet restore && dotnet workload restore` for .NET MAUI].
- **Watch mode** that reruns codegen / hot-reload on source changes.
- **Sample apps** under [e.g., `examples/`, `example/`, `samples/`] are first-class citizens — used as smoke tests.

### 19.9 Where the Code Lives

<!-- Layout below is illustrative for a JS-bridge framework. Replace with this
codebase's actual top-level layout. -->

```
{{repo}}/
├── [packages/codegen/]                 # bridge / asset / route generators (if codegen-heavy)
├── [packages/bundler/]                 # bundler config + plugins (if applicable)
├── [ios/ or apple/]                    # Xcode project / SPM manifest per framework module
├── [android/]                          # Gradle modules
├── [lib/ or src/common/]               # platform-shared code (Flutter, KMP, RN)
├── [examples/ or example/]             # sample apps used as smoke tests
└── [tools/build/ or scripts/]          # CI orchestrator scripts
```
