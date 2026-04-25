---
slug: version-compatibility-and-os-support
title: "Version Compatibility and OS Support"
applies-to: [re-mobile-app-consumer]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 190
---

## 9. Version Compatibility and OS Support

### 9.1 Currently Supported OS Versions

| Platform | Minimum | Tested Through | Sunset Notice |
|----------|---------|----------------|---------------|
| iOS | `{{ios_min_version}}` (e.g., 15.0) | iOS `{{ios_max_version}}` | "iOS X.0 support ends in release `2.X.0`" |
| iPadOS | `{{ipados_min_version}}` | iPadOS `{{ipados_max_version}}` | Same as iOS |
| Android | API `{{android_min_api}}` (Android `{{android_min_label}}`) | API `{{android_max_api}}` | Track in `{{compat_doc_url}}` |
| watchOS / wearOS | n/a or version | n/a | n/a |

### 9.2 Device Class Coverage

| Class | Supported? | Notes |
|-------|------------|-------|
| iPhone | yes | Layouts tested at iPhone SE (375pt) through Pro Max (430pt) |
| iPad (multitasking) | {{yes/no}} | Split view + Stage Manager: {{supported / best-effort}} |
| Mac (Designed for iPad) | {{yes/no}} | Available on Apple Silicon Macs unless explicitly opted out |
| Android phone | yes | sw320dp through sw600dp |
| Android tablet | {{yes/no}} | sw600dp+ layouts; foldables supported via window-size classes |
| Foldables | {{yes/no}} | App handles `Configuration.screenLayout` and posture changes |
| ChromeOS / Android-on-Chrome | {{yes/no}} | Mouse + keyboard input handled |

### 9.3 Backend / API Version Compatibility

The mobile app speaks to the backend over a versioned API:

| App Version | Required API Version | Optional API Surface |
|-------------|----------------------|----------------------|
| `2.4.x` | `v3` | `v4-experimental` (feature-flag gated) |
| `2.5.x` (planned) | `v3` | `v4` |
| `2.6.x` (planned) | `v4` | — |

> When the API removes `v3`, app versions `2.4.x` and earlier will receive a forced-update notice and route the user to the store.

### 9.4 Forced-Update Strategy

```
[App cold start]
   ↓
[GET {{api_base_url}}/v1/client-policy]
   ↓
   { "min_supported_version": "2.3.0", "recommended_version": "2.5.1" }
   ↓
   ├─ App version < min_supported_version  →  full-screen "Update required" wall
   ├─ App version < recommended_version    →  dismissible banner
   └─ Otherwise                             →  no UI
```

Partners depending on a specific app version SHOULD pin to the **min_supported_version** for the integration window (typically 12 months) and watch the [client policy endpoint](#) for changes.

### 9.5 Deprecation Path for OS Versions

- Drop notice: announced one major release ahead in `{{public_changelog_url}}`.
- Last supported app version on a sunset OS remains downloadable from the store ("Last Compatible Version" mechanism — App Store does this automatically; Play Store via "minimum SDK at install").
- Critical-security patches are backported to the last supported app build for {{e.g., 6 months}} after deprecation.

### 9.6 Localisation and Region Support

| Locale | Status | Notes |
|--------|--------|-------|
| en-US | full | Primary |
| en-GB | full | Date/currency formatting |
| es-MX, es-ES | full | RTL: no |
| fr-FR, fr-CA | full | — |
| de-DE | full | — |
| ja-JP | full | — |
| ar-SA | partial | RTL layout enabled, content translation in progress |
| he-IL | partial | RTL layout enabled |

> RTL: layout mirrored where `forceRTL` is supported; bidi text editing tested per locale.

### 9.7 Accessibility Compliance

| Feature | iOS | Android |
|---------|-----|---------|
| Dynamic Type / Font scaling | yes (up to AX5) | yes (up to 2.0×) |
| VoiceOver / TalkBack | yes | yes |
| Reduce Motion | respected | respected |
| Increase Contrast | respected | respected |
| Switch Control / Switch Access | tested | tested |

Compliance target: WCAG 2.2 AA for all primary user journeys.

### 9.8 Hardware Capability Requirements

| Capability | Required? | Fallback Behaviour |
|------------|-----------|--------------------|
| Camera | optional | Scanner / capture screens are hidden if absent |
| Biometric (Face / Touch / Class-3 fingerprint) | optional | App-lock falls back to PIN |
| GPS | optional | Map screens fall back to manual entry |
| Cellular | optional | Wi-Fi-only operation supported |
| NFC | optional | Tap-to-pay / read flows hidden if absent |

### 9.9 Backwards-Compat Guarantees for Integrators

- Deep-link routes documented in section 2 are stable for **at least 12 months** after a removal announcement.
- Push payload `type` values documented in section 3 are stable for **at least 12 months**; new types may be added at any time.
- Analytics event names documented in section 6 are stable; renames are accompanied by a 6-month dual-emit period.
