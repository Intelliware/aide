---
slug: partner-sdks-consumed
title: "Partner SDKs Consumed"
applies-to: [re-mobile-app-consumer]
requires-decision-from: [code-reader, security, ops]
optional: false
order-hint: 150
---

## 5. Partner SDKs Consumed

This section is the public-ish inventory of third-party SDKs embedded in the app. Partner integrations teams use it to understand which providers already have a foothold, what data they touch, and how new partners hook in.

### 5.1 SDK Inventory

| Category | Vendor / SDK | iOS Version | Android Version | Initialised Where | Data Sent | Opt-Out |
|----------|--------------|-------------|-----------------|-------------------|-----------|---------|
| Crash reporting | {{e.g., Crashlytics}} | `{{ios_ver}}` | `{{android_ver}}` | `AppDelegate` / `Application.onCreate` | crash stacks, device model, OS, app version | DNT toggle in Settings → Privacy |
| Analytics | {{e.g., Amplitude / Mixpanel / Segment}} | `{{ios_ver}}` | `{{android_ver}}` | `App` init | event names, opaque user_id, device class | "Share usage analytics" toggle |
| Attribution | {{e.g., AppsFlyer / Branch / Adjust}} | `{{ios_ver}}` | `{{android_ver}}` | First-launch | install referrer, ATT status, IDFA/AAID | ATT-prompt response on iOS |
| Payments | {{e.g., Stripe / Apple Pay / Google Pay}} | `{{ios_ver}}` | `{{android_ver}}` | Checkout screen | tokenised payment data only | n/a |
| Auth / Social | {{e.g., Sign in with Apple / Google / Facebook}} | `{{ios_ver}}` | `{{android_ver}}` | Login screen | OAuth identity tokens | n/a |
| Maps | {{e.g., MapKit / Google Maps / Mapbox}} | `{{ios_ver}}` | `{{android_ver}}` | Map screen | viewport bounds | location permission |
| Customer support | {{e.g., Intercom / Zendesk}} | `{{ios_ver}}` | `{{android_ver}}` | Help screen | conversation contents, opaque user_id | n/a |
| Feature flags / RC | {{e.g., LaunchDarkly / Firebase RC}} | `{{ios_ver}}` | `{{android_ver}}` | App init | flag-evaluation context | n/a |
| Performance | {{e.g., Firebase Performance / New Relic}} | `{{ios_ver}}` | `{{android_ver}}` | App init | network timings, screen timings | DNT toggle |

### 5.2 How a New Partner SDK Gets Integrated

A net-new SDK request follows this checklist:

1. **Privacy review** — partner provides DPA + data inventory; tracked in `{{privacy_review_tool}}`.
2. **Security review** — SDK binary scanned (`{{sast_tool}}`), checked for known CVEs, network destinations enumerated.
3. **App Store / Play data declarations** — partner data handling added to App Privacy / Data Safety forms.
4. **Size budget** — added size on iOS (`.ipa`) and Android (`.aab`) must stay within `{{size_budget_kb}}` deltas.
5. **Initialisation lifecycle** — confirm SDK supports lazy init / can be deferred to user opt-in.
6. **Kill switch** — wired through `{{feature_flag_namespace}}.{{partner_slug}}_enabled` so we can disable the SDK remotely without an app release.
7. **Versioning policy** — partner commits to semver and a 90-day deprecation notice on breaking changes.

### 5.3 SDK Initialisation Order

```
[App cold start]
   ↓
[Crashlytics — first, so subsequent inits get reported]
   ↓
[Logger / Sentry]
   ↓
[Remote Config / Feature Flags]
   ↓
[Conditional inits — only if flag enabled AND user has consented]
   ├─ Analytics
   ├─ Attribution (after ATT prompt response on iOS)
   ├─ Performance monitoring
   └─ Marketing / push provider
```

> Any SDK that touches PII must wait for the user's consent / ATT decision before initialising.

### 5.4 Consent and Privacy

- **iOS App Tracking Transparency (ATT):** prompted on first launch; partners that depend on IDFA receive `00000000-0000-...` until granted.
- **Android Privacy Sandbox:** the app supports `AdServicesAttribution` API; partners using legacy advertising ID should plan for deprecation.
- **GDPR / CCPA banners:** the app shows a region-aware consent banner. Partners receive consent state via `setConsentMode` calls (`granted` / `denied` for `analytics_storage`, `ad_storage`, `personalization_storage`).
- **Children / COPPA:** the app declares "Not directed at children". SDKs that cannot guarantee child-data compliance MUST NOT be integrated.

### 5.5 Partner Hook-In Points

These extension points are exposed to *trusted* partner SDKs (i.e. partners already on the SDK inventory):

| Hook | What It Does | Used By |
|------|--------------|---------|
| `AppLifecycleObserver` | Notifies on foreground/background | Analytics, attribution |
| `DeepLinkInterceptor` | First chance to handle a deep link before in-app routing | Attribution providers |
| `PushTokenObserver` | Notified on token rotation | Push providers, marketing |
| `NetworkRequestObserver` | Read-only timing info per request | APM / RUM SDKs |
| `ConsentObserver` | Notified on user's consent state changes | All consented SDKs |

### 5.6 SDK Removal / Sunset Policy

- An SDK may be removed in any release. Partners receive **30 days notice** via `{{partner_changelog_url}}`.
- Stale SDKs (no commits in upstream for 12 months, or unsupported on current OS) are flagged in the next quarterly partner review.
