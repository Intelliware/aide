---
slug: deep-linking-from-outside
title: "Deep Linking From Outside"
applies-to: [re-mobile-app-consumer]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 120
---

## 2. Deep Linking From Outside

This section is the **public contract** for any external party (email vendor, partner site, marketing automation tool, paid-ads attribution provider) that needs to link directly into a screen of this app.

### 2.1 Link Types Supported

| Type | Format | Intended Use | Falls Back To |
|------|--------|--------------|---------------|
| iOS Universal Link | `https://{{universal_link_host}}/{{path}}` | Any external surface (web, email, SMS) | Marketing landing page |
| Android App Link | `https://{{app_link_host}}/{{path}}` | Any external surface (web, email, SMS) | Marketing landing page |
| Custom URI scheme | `{{app_scheme}}://{{path}}` | In-app webviews, partner SDKs, push payloads | App Store / Play listing |
| Deferred deep link | Wrapped via `{{attribution_provider}}` link | Drive install + post-install routing | App Store / Play listing |

### 2.2 Universal Links / App Links — Domain Setup

**iOS — `apple-app-site-association` (AASA)** served at `https://{{universal_link_host}}/.well-known/apple-app-site-association`:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appIDs": ["{{apple_team_id}}.{{ios_bundle_id}}"],
        "components": [
          { "/": "/{{path_prefix}}/*", "comment": "Match all deep-link paths" }
        ]
      }
    ]
  }
}
```

**Android — `assetlinks.json`** served at `https://{{app_link_host}}/.well-known/assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "{{android_package_id}}",
      "sha256_cert_fingerprints": ["{{play_signing_sha256}}"]
    }
  }
]
```

> Both files MUST be served over HTTPS with a valid certificate, with `Content-Type: application/json`, and without redirects.

### 2.3 Public Link Routing Table

| External URL | Target Screen | Required Params | Optional Params | Auth Required? |
|--------------|---------------|-----------------|-----------------|----------------|
| `https://{{host}}/home` | Home tab | — | — | no |
| `https://{{host}}/p/{slug}` | Public profile | `slug` | — | no |
| `https://{{host}}/order/{orderId}` | Order detail | `orderId` | — | yes — prompts login |
| `https://{{host}}/invite/{code}` | Invite redemption | `code` | `ref`, `utm_*` | no |
| `https://{{host}}/promo/{campaign}` | Campaign landing | `campaign` | `utm_*` | no |
| `{{app_scheme}}://settings/notifications` | Notification settings | — | — | yes |

> Anything not matched by this table will route to `Home`. Partners SHOULD NOT depend on undocumented URL paths — those may change without notice.

### 2.4 Deferred Deep Linking (Install-Then-Route)

Used when the user clicks a link **before** the app is installed.

- **Provider:** {{e.g., "Branch / AppsFlyer OneLink / Adjust / Firebase Dynamic Links (deprecated)"}}
- **Wrapped link format:** `https://{{wrapped_link_host}}/{{path_or_token}}`
- **Resolution flow:**
  1. User taps wrapped link on a device without the app.
  2. They are redirected to the App Store / Play Store.
  3. After install, the app first-launches and queries the attribution SDK for the original deep link.
  4. App routes the user to the intended deep-link target as if they had clicked it post-install.
- **Attribution params surfaced to integrators:** `~campaign`, `~channel`, `~feature`, `$3p`.
- **Time-to-attribute window:** {{e.g., "7 days for iOS, 30 days for Android"}}.

### 2.5 Building Links — Quick Recipes

```bash
# Static deep link (no attribution)
https://{{host}}/p/{{slug}}?utm_source=email&utm_campaign=spring2025

# Wrapped link via attribution provider (deferred)
curl -X POST https://api.{{attribution_provider}}.com/v1/url \
  -H "Authorization: Bearer ${ATTRIBUTION_KEY}" \
  -d '{
    "data": { "$deeplink_path": "p/{{slug}}", "campaign": "spring2025" }
  }'
```

### 2.6 Testing a Deep Link Externally

| Platform | Command |
|----------|---------|
| iOS Simulator | `xcrun simctl openurl booted "https://{{host}}/p/foo"` |
| Android Emulator | `adb shell am start -a android.intent.action.VIEW -d "https://{{host}}/p/foo"` |
| iOS device | Open the URL in Notes / Messages / Safari (Universal Links require user-initiated tap) |
| Android device | Open from a chat or notes app; not from a browser address bar (which won't trigger an App Link) |

### 2.7 Known Gotchas for External Parties

- iOS Universal Links **do not fire** when a user types/pastes the URL into Safari address bar — they only fire from a tapped link in another app.
- Android App Links require auto-verification — re-publish `assetlinks.json` for every additional signing cert (e.g., upload key vs. Play app-signing key).
- Custom URI scheme (`{{app_scheme}}://`) has no install-fallback; if the app isn't installed, nothing happens. Use Universal Links / App Links for general public traffic.
- Emails routed through tracking redirectors (e.g., SendGrid click-tracking) will break Universal Links unless the redirector is itself associated with the app domain — coordinate with the email vendor.
