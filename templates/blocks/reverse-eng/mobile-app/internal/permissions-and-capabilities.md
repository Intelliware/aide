---
slug: permissions-and-capabilities
title: "Permissions and Capabilities"
applies-to: [re-mobile-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 270
---

## 17. Permissions and Capabilities

### 17.1 Android Permissions

| Permission | Purpose | Type | Requested at |
|-----------|---------|------|--------------|
| `INTERNET` | Network access | Normal | Install time |
| `CAMERA` | Camera access | Dangerous | Runtime |
| `READ_CONTACTS` | Contact access | Dangerous | Runtime |

**AndroidManifest.xml:**
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_CONTACTS" />
```

### 17.2 iOS Capabilities

| Capability | Purpose | Info.plist Key |
|-----------|---------|---------|
| Camera | Camera access | `NSCameraUsageDescription` |
| Contacts | Contact access | `NSContactsUsageDescription` |

**Info.plist:**
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to take photos</string>
<key>NSContactsUsageDescription</key>
<string>We need contact access to share with friends</string>
```
