---
slug: permissions-system
title: "Permissions System"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect, security]
optional: false
order-hint: 240
---

## 14. Permissions System

### 14.1 Goals of the Permissions Subsystem

- Provide a uniform `Permissions` API across platforms.
- Hide the OS-version skew (Android 6 runtime model, 11 background-location split, 13 notifications, etc.).
- Enable just-in-time prompts with rationale screens.
- Surface a stable internal contract that other framework subsystems can depend on (camera, location, push, BLE).

### 14.2 Permission Identifiers

```ts
type Permission =
  | "camera"
  | "microphone"
  | "photoLibrary" | "photoLibraryAddOnly"
  | "locationWhenInUse" | "locationAlways"
  | "contacts"
  | "calendar"
  | "bluetoothScan" | "bluetoothConnect"
  | "notifications"
  | "tracking"          // iOS ATT
  | "biometric"
  | "mediaLibrary"
  | "motion"
  | "speechRecognition";
```

### 14.3 Status Lifecycle

```
notDetermined ──request──▶ ┬─→ granted
                           ├─→ denied
                           ├─→ restricted        (parental / MDM)
                           └─→ provisional       (iOS notifications)
```

- `denied` is sticky on iOS — second call returns same status without prompt.
- `denied`-twice on Android is functionally sticky; the API exposes `shouldShowRationale`.
- Re-evaluation on app foreground is automatic so user-flips in Settings are picked up.

### 14.4 OS-Version Branching

| Permission | Android Skew | iOS Skew |
|------------|--------------|----------|
| Notifications | runtime-prompt only on 13+ | UNUserNotification framework on 10+, provisional on 12+ |
| Location | background split on 11+, separate prompt | always-vs-when-in-use prompt sequence on 13+ |
| Bluetooth | runtime scan/connect on 12+ | Always usage description on 13+ |
| Photos | scoped media on 13+ (images vs video vs all) | limited / full library on 14+ |
| Tracking (ATT) | n/a | required on 14.5+ before IDFA access |

The framework normalises these so user code calls a single `request("location.always")`.

### 14.5 Rationale Screen API

```ts
permissions.request("camera", {
  rationale: {
    title: "Allow camera",
    body: "We need the camera to scan QR codes.",
    primaryActionLabel: "Continue",
    secondaryActionLabel: "Not now",
  }
});
```

- Rationale screen shown **before** the OS prompt on first call.
- On `denied`, second call routes to system Settings via deep link to app prefs.

### 14.6 Permission Bundles

Some features need multiple permissions atomically (e.g., BLE peripheral discovery on Android: `BLUETOOTH_SCAN` + `BLUETOOTH_CONNECT` + sometimes `ACCESS_FINE_LOCATION`). The framework offers permission bundles:

```ts
permissions.requestBundle("ble.discovery");
```

Bundles fail closed: if any underlying permission is denied, the whole bundle is denied.

### 14.7 Diagnostics and Telemetry

For each `request()` call, emits:

```
metric: permission.request
labels: permission, prior_status, new_status, prompt_shown, os_version
```

This allows analyses like "What % of users grant location at first prompt vs. after rationale".

### 14.8 Where the Code Lives

```
{{repo}}/
├── packages/permissions/               # JS/Dart API + bundles
├── ios/Permissions/                    # iOS PHPhotoLibrary / CLLocationManager / etc. wrappers
└── android/.../permissions/            # ActivityResultContracts wrappers
```
