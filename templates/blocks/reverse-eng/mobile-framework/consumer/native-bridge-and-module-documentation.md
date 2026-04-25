---
slug: native-bridge-and-module-documentation
title: "Native Bridge and Module Documentation"
applies-to: [re-mobile-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 250
---

## 15. Native Bridge and Module Documentation

### 15.1 [Feature, e.g., "Camera Integration"]

**JavaScript / TypeScript API:**
```typescript
export async function openCamera(): Promise<PhotoResult> {
  // Returns Promise because it crosses the native bridge
}
```

**Native Bridge (Android, Kotlin):**
```kotlin
@ReactMethod
fun openCamera(promise: Promise) {
    // Native implementation
    try {
        // Launch camera activity
        promise.resolve(/* photo URI */)
    } catch (e: Exception) {
        promise.reject("CAMERA_ERROR", e)
    }
}
```

**Native Bridge (iOS, Swift):**
```swift
@objc func openCamera(_ resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
    // Native implementation
    DispatchQueue.main.async {
        // Present camera picker
        resolve(/* photo URI */)
    }
}
```

**Why Async?**
[Explain that the React Native bridge is asynchronous and serializes data across platform boundaries.]
