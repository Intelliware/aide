---
slug: app-permissions-from-os
title: "App Permissions From the OS"
applies-to: [re-mobile-app-consumer]
requires-decision-from: [code-reader, security, ops]
optional: false
order-hint: 170
---

## 7. App Permissions From the OS

This section enumerates every OS-level permission and capability the app requests, so integrators (especially MDM administrators and partner apps invoking us via deep link) can plan around them.

### 7.1 iOS Permission Manifest

| Permission | `Info.plist` Key | Purpose String (current) | When Prompted | MDM Pre-Grant Possible? |
|------------|------------------|--------------------------|---------------|--------------------------|
| Camera | `NSCameraUsageDescription` | "{{purpose_string}}" | First time the user opens scanner / capture flow | yes — `com.apple.app-sandbox.read-write` profile |
| Photo Library | `NSPhotoLibraryUsageDescription` / `NSPhotoLibraryAddUsageDescription` | "{{purpose_string}}" | First photo pick / save | yes |
| Microphone | `NSMicrophoneUsageDescription` | "{{purpose_string}}" | First voice recording | yes |
| Location (when-in-use) | `NSLocationWhenInUseUsageDescription` | "{{purpose_string}}" | First map / location feature | yes |
| Location (always) | `NSLocationAlwaysAndWhenInUseUsageDescription` | "{{purpose_string}}" | Only if user opts into background features | partial |
| Push notifications | n/a (`UNUserNotificationCenter`) | — | First launch (or deferred to onboarding) | yes — `com.apple.notificationsettings` |
| App Tracking Transparency | `NSUserTrackingUsageDescription` | "{{purpose_string}}" | Session 1 or 2, after first meaningful screen | no (Apple disallows pre-grant) |
| Contacts | `NSContactsUsageDescription` | "{{purpose_string}}" | First "Find friends" tap | yes |
| Calendar | `NSCalendarsUsageDescription` | "{{purpose_string}}" | First "Add to calendar" tap | yes |
| Bluetooth | `NSBluetoothAlwaysUsageDescription` | "{{purpose_string}}" | First peripheral scan | yes |
| Local Network | `NSLocalNetworkUsageDescription` | "{{purpose_string}}" | First mDNS discovery | yes |
| Face ID | `NSFaceIDUsageDescription` | "{{purpose_string}}" | First biometric unlock | n/a |
| HealthKit | `NSHealthShareUsageDescription` / `NSHealthUpdateUsageDescription` | "{{purpose_string}}" | First fitness flow | partial |

### 7.2 Android Permission Manifest

| Permission | Manifest Entry | Protection Level | When Prompted |
|------------|----------------|------------------|---------------|
| Internet | `android.permission.INTERNET` | Normal | Install time |
| Network state | `android.permission.ACCESS_NETWORK_STATE` | Normal | Install time |
| Camera | `android.permission.CAMERA` | Dangerous (runtime) | First scanner / capture |
| Microphone | `android.permission.RECORD_AUDIO` | Dangerous (runtime) | First voice recording |
| Fine location | `android.permission.ACCESS_FINE_LOCATION` | Dangerous (runtime) | First map feature |
| Coarse location | `android.permission.ACCESS_COARSE_LOCATION` | Dangerous (runtime) | First map feature |
| Background location | `android.permission.ACCESS_BACKGROUND_LOCATION` | Dangerous (separate prompt, 11+) | Only if user opts in |
| Photos / Media (13+) | `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO` | Dangerous (runtime) | First photo pick |
| External storage (≤12) | `READ_EXTERNAL_STORAGE` | Dangerous (runtime) | First photo pick |
| Notifications (13+) | `android.permission.POST_NOTIFICATIONS` | Dangerous (runtime) | Onboarding / first-meaningful-prompt |
| Contacts | `android.permission.READ_CONTACTS` | Dangerous (runtime) | First "Find friends" tap |
| Bluetooth scan / connect (12+) | `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT` | Dangerous (runtime) | First device pairing |
| Foreground service | `android.permission.FOREGROUND_SERVICE` (+ specialised types on 14+) | Normal | Install time |
| Exact alarms (12+) | `android.permission.SCHEDULE_EXACT_ALARM` | Dangerous (special) | First reminder schedule |
| Biometric | `android.permission.USE_BIOMETRIC` | Normal | Install time |
| Query all packages | `QUERY_ALL_PACKAGES` | Restricted | Install time, declared with policy justification |

### 7.3 Permission Prompt Strategy

- **Just-in-time** by default — prompt at the moment the user attempts the feature.
- **Pre-prompt rationale** — for high-friction permissions (location-always, contacts, mic), the app shows a custom rationale screen first. Tapping "Continue" triggers the OS prompt.
- **Denied-twice handling** — if the user denies twice on Android, the next attempt routes them to system settings instead of re-prompting.
- **Push notifications (iOS / Android 13+)** — prompted after the user has completed onboarding **and** seen one screen with a notification context.

### 7.4 Capabilities and Entitlements

| Platform | Capability / Entitlement | Required For |
|----------|--------------------------|--------------|
| iOS | `aps-environment = production` | Push notifications |
| iOS | `com.apple.developer.associated-domains = applinks:{{host}}` | Universal Links |
| iOS | `com.apple.security.application-groups` | Sharing data with extensions / widgets |
| iOS | `com.apple.developer.in-app-payments` | Apple Pay |
| iOS | `keychain-access-groups` | Shared keychain for SSO |
| Android | `<intent-filter>` auto-verify | App Links |
| Android | Biometric | `USE_BIOMETRIC` + secure flag on relevant activities |
| Android | Targeted package queries | Specific packages declared in `<queries>` |

### 7.5 Working With MDM (Managed Devices)

Enterprise admins can pre-grant most runtime permissions via MDM profiles. Common profiles we are tested against:

- iOS: Apple Configurator / Jamf / Intune — managed app + privacy preferences profile.
- Android: Android Enterprise (EMM) — work profile or fully-managed device, with permission auto-grant policy `permissionGrants[].policy = "PERMISSION_POLICY_GRANT"`.

The full list of pre-grantable permissions per platform is captured in section 8 (`app-config-via-mdm`), if applicable.

### 7.6 What Partners Need to Know

- Universal Link / App Link partners do **not** need any permission to deep-link into us — that pathway never prompts.
- Push partners do not interact with the OS permission directly; the app is the only entity that can request `POST_NOTIFICATIONS` / APNs.
- A partner SDK that itself requests a permission MUST be reviewed (see `partner-sdks-consumed`); we will not ship an SDK that triggers an additional system prompt without product sign-off.
