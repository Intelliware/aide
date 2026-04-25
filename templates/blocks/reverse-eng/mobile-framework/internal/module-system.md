---
slug: module-system
title: "Module System"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 140
---

## 4. Module System

### 4.1 Module Categories

| Category | Authored In | Discovered Via | Lifecycle |
|----------|-------------|----------------|-----------|
| Core framework modules | Native + runtime language | Static registry compiled into engine | Engine lifetime |
| Native modules (1st-party) | Native (Obj-C / Swift / Java / Kotlin / C++) | Auto-link manifest in `package.json` / Podspec / Gradle | Engine lifetime, lazy-init |
| App modules (consumer-authored) | Runtime language | App entrypoint imports | App lifetime |
| Plugin / extension modules | Either | Manifest scan at build | Engine lifetime |

### 4.2 Native Module Registration

#### iOS (Obj-C / Swift)

```objc
@interface CameraModule : NSObject <RCTBridgeModule>
@end

@implementation CameraModule
RCT_EXPORT_MODULE();   // becomes `Camera` on the JS side

RCT_EXPORT_METHOD(takePhoto:(NSDictionary *)opts
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  // implementation
}
@end
```

#### Android (Java / Kotlin)

```kotlin
class CameraModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "Camera"

  @ReactMethod
  fun takePhoto(opts: ReadableMap, promise: Promise) {
    // implementation
  }
}

class CameraPackage : ReactPackage {
  override fun createNativeModules(ctx: ReactApplicationContext) =
    listOf<NativeModule>(CameraModule(ctx))

  override fun createViewManagers(ctx: ReactApplicationContext) = emptyList<ViewManager<*, *>>()
}
```

### 4.3 JS-side Module Registry

```ts
// Generated or hand-written facade
import { NativeModules } from '@framework/runtime';
const { Camera } = NativeModules;

export const takePhoto = (opts: TakePhotoOptions) => Camera.takePhoto(opts);
```

- The runtime exposes `NativeModules` as a lazy proxy — modules are only instantiated on first access.
- A developer-mode warning fires if a JS facade is imported but the corresponding native module is missing (auto-link miss).

### 4.4 Auto-Linking Manifest

Auto-linking discovers native modules at build time so app developers don't have to hand-edit native projects.

```json
// package.json of a 3rd-party module
{
  "name": "@vendor/camera",
  "framework": {
    "ios": { "podspec": "VendorCamera.podspec" },
    "android": { "package": "com.vendor.camera.CameraPackage" }
  }
}
```

Build-time tooling scans `node_modules/` (or its equivalent), produces a generated registry file, and merges it with the embedder's compile inputs.

### 4.5 Module Lifecycle Hooks

| Hook | Called When | Typical Use |
|------|-------------|-------------|
| `init` | Engine boot | Allocate state, register listeners |
| `onAppForeground` | Native shell foreground | Resume timers |
| `onAppBackground` | Native shell background | Flush state, release resources |
| `onLowMemory` | Memory warning | Drop caches |
| `onTerminate` | App teardown | Persist state |

### 4.6 Code-Generated Bindings (TurboModules / Channel Codegen / equivalent)

The framework supports generating typed bindings from a single source of truth:

```ts
// camera.spec.ts
export interface Spec extends TurboModule {
  takePhoto(opts: { quality: number }): Promise<{ uri: string }>;
}
```

The generator emits:
- A C++ Host Object header that the iOS/Android implementations subclass.
- A TypeScript declaration file consumed by the JS facade.
- A registration shim added to the auto-linking manifest.

> Specs are the **canonical contract**. Hand-writing the bridge code is allowed only for legacy modules.

### 4.7 Module Versioning

- Each module declares `frameworkApiLevel` in its manifest. The engine refuses to load a module whose API level is newer than the engine's.
- Deprecated modules emit a runtime warning for one minor version, then become a build-time error.

### 4.8 Where the Code Lives

```
{{repo}}/
├── packages/codegen/                  # Spec → bindings generator
├── packages/runtime/src/modules/      # JS module registry
├── ios/Modules/                       # Built-in native modules (iOS)
├── android/.../modules/               # Built-in native modules (Android)
└── third_party/                       # Vendored modules
```
