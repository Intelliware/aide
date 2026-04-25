---
slug: permissions-and-capabilities
title: "Permissions and Capabilities"
applies-to: [re-mobile-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 190
---

## 9. Permissions and Capabilities

### 9.1 Android Permissions

**Required Permissions:**

| Permission | Purpose | Where to declare |
|-----------|---------|------------------|
| `android.permission.INTERNET` | [e.g., "API requests"] | `AndroidManifest.xml` |
| `android.permission.CAMERA` | [e.g., "Camera access"] | `AndroidManifest.xml` + runtime request |

**AndroidManifest.xml:**
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />

<!-- If targeting Android 6.0+, also request at runtime -->
```

**Runtime Permission Request (Android 6.0+):**
```kotlin
if (ContextCompat.checkSelfPermission(
        this,
        Manifest.permission.CAMERA
    ) != PackageManager.PERMISSION_GRANTED
) {
    ActivityCompat.requestPermissions(
        this,
        arrayOf(Manifest.permission.CAMERA),
        REQUEST_CODE
    )
}
```

### 9.2 iOS Permissions and Capabilities

**Required Permissions (Info.plist):**

| Key | Value | Purpose |
|-----|-------|---------|
| `NSCameraUsageDescription` | [User-facing reason] | Camera access |
| `NSPhotoLibraryUsageDescription` | [User-facing reason] | Photo library access |

**Info.plist entries:**
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to capture photos</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to select images</string>
```

**Requesting Permissions at Runtime:**
```swift
import AVFoundation

AVCaptureDevice.requestAccess(for: .video) { granted in
    if granted {
        // Camera access granted
    }
}
```

### 9.3 React Native Permissions

**Permission Platform Mapping:**

| Feature | Android | iOS |
|---------|---------|-----|
| Camera | `CAMERA` | `NSCameraUsageDescription` |
| Photos | `READ_EXTERNAL_STORAGE` | `NSPhotoLibraryUsageDescription` |
| Location | `ACCESS_FINE_LOCATION` | `NSLocationWhenInUseUsageDescription` |

**Requesting Permissions (using `react-native-permissions`):**
```typescript
import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import { Platform } from 'react-native';

async function requestCameraPermission() {
  const permission = Platform.select({
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA,
  });

  const result = await request(permission);
  return result === RESULTS.GRANTED;
}
```

---

# Part 4 — Patterns and Guides
