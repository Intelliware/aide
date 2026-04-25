---
slug: application-signing-and-distribution
title: "Application Signing and Distribution"
applies-to: [re-mobile-app-internal]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 310
---

## 21. Application Signing and Distribution

### 21.1 Android Signing

**Keystore Requirements:**
- Location: `./app/keystore/release.jks`
- Alias: [production alias]
- Key password: [stored in secure location]

**Building signed APK:**
```bash
./gradlew bundleRelease  # Create App Bundle for Play Store
./gradlew assembleRelease # Create signed APK
```

### 21.2 iOS Signing

**Certificate and Provisioning Profile:**
- Developer Certificate: [issued to team]
- Provisioning Profile: [for bundle ID]
- Distribution Certificate: [for App Store]

**Build for distribution:**
```bash
xcodebuild archive -scheme [AppName] -archivePath build/app.xcarchive
```

### 21.3 Distribution Channels

**Android:**
- Google Play Store (primary)
- [Other channels if applicable]

**iOS:**
- Apple App Store (primary)
- TestFlight (beta testing)
- [Other channels if applicable]
