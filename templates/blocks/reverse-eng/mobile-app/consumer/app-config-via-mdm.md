---
slug: app-config-via-mdm
title: "App Config via MDM (Managed App Configuration)"
applies-to: [re-mobile-app-consumer]
requires-decision-from: [code-reader, ops, security]
optional: true
order-hint: 180
---

## 8. App Config via MDM (Managed App Configuration)

> Mark this section N/A if the app is not distributed through enterprise / MDM channels.

Enterprise customers configuring this app via Mobile Device Management (Jamf, Intune, Workspace ONE, Kandji on iOS; Android Enterprise on Android) can push runtime configuration through **Managed App Configuration** (iOS) and **Managed Configuration / app restrictions** (Android).

### 8.1 Where Managed Config Lands in the App

| Platform | Source API | App-side Read |
|----------|------------|---------------|
| iOS | `UserDefaults.standard.dictionary(forKey: "com.apple.configuration.managed")` | Polled at app launch and on `UserDefaults.didChangeNotification` |
| Android | `RestrictionsManager.getApplicationRestrictions()` | Polled at app launch and on `Intent.ACTION_APPLICATION_RESTRICTIONS_CHANGED` broadcast |

### 8.2 Configuration Schema

```json
{
  "$schema": "https://{{schema_host}}/managed-config.schema.json",
  "version": "1",
  "api_base_url": "https://api.example.com",
  "feature_flags": {
    "allow_camera": true,
    "allow_clipboard": false,
    "force_biometric_lock": true,
    "block_screenshots": true
  },
  "auth": {
    "tenant_id": "{{tenant_uuid}}",
    "sso_provider": "saml | oidc | none",
    "sso_metadata_url": "https://idp.example.com/metadata",
    "preferred_username": "{{$user.email}}"
  },
  "branding": {
    "logo_url": "https://...",
    "primary_color": "#003366",
    "support_email": "support@example.com"
  },
  "policy": {
    "min_pin_length": 6,
    "session_timeout_minutes": 15,
    "allow_paste_to_other_apps": false,
    "allow_external_links": false
  }
}
```

### 8.3 Per-Key Reference

| Key | Type | Default | Required Permissions on App | Notes |
|-----|------|---------|------------------------------|-------|
| `api_base_url` | URL | (production) | Internet | Overrides backend; primarily for staging pilots |
| `feature_flags.allow_camera` | bool | `true` | Camera permission still prompted at JIT | If `false`, camera entry points are hidden |
| `feature_flags.allow_clipboard` | bool | `true` | n/a | If `false`, copy/paste between this and other apps is blocked (iOS pasteboard isolation; Android `FLAG_SECURE`) |
| `feature_flags.force_biometric_lock` | bool | `false` | `USE_BIOMETRIC` / Face ID | Forces app-lock on background |
| `feature_flags.block_screenshots` | bool | `false` | n/a | Sets `FLAG_SECURE` on Android; uses screen-capture observer + obfuscation on iOS |
| `auth.tenant_id` | UUID | — | n/a | Routes login to a specific tenant |
| `auth.sso_provider` | enum | `none` | n/a | Enforces SSO over username/password |
| `auth.preferred_username` | string | — | n/a | Pre-fills the login field; supports `{{$user.email}}` substitution |
| `policy.min_pin_length` | int | `4` | n/a | Enforced when user creates an in-app PIN |
| `policy.session_timeout_minutes` | int | `60` | n/a | Auto-logout after N minutes of inactivity |
| `policy.allow_paste_to_other_apps` | bool | `true` | n/a | When `false`, sensitive fields use UIPasteboard (no global paste) / Android `setCustomSelectionActionModeCallback` |
| `policy.allow_external_links` | bool | `true` | n/a | When `false`, in-app links never open external browsers |

### 8.4 iOS — Managed App Configuration Plist Sample

This is the plist a Jamf / Intune / Workspace ONE admin would deliver to the iOS device:

```xml
<dict>
  <key>api_base_url</key>
  <string>https://api.example.com</string>
  <key>feature_flags</key>
  <dict>
    <key>allow_camera</key><true/>
    <key>force_biometric_lock</key><true/>
    <key>block_screenshots</key><true/>
  </dict>
  <key>auth</key>
  <dict>
    <key>tenant_id</key><string>00000000-0000-0000-0000-000000000000</string>
    <key>sso_provider</key><string>oidc</string>
  </dict>
</dict>
```

### 8.5 Android — Managed Restrictions XML

Declared in the app's `res/xml/app_restrictions.xml` so EMMs discover and present the keys:

```xml
<restrictions xmlns:android="http://schemas.android.com/apk/res/android">
  <restriction
    android:key="api_base_url"
    android:title="API base URL"
    android:restrictionType="string"
    android:defaultValue="https://api.example.com" />
  <restriction
    android:key="force_biometric_lock"
    android:title="Force biometric lock"
    android:restrictionType="bool"
    android:defaultValue="false" />
  <restriction
    android:key="block_screenshots"
    android:title="Block screenshots"
    android:restrictionType="bool"
    android:defaultValue="false" />
  <restriction
    android:key="session_timeout_minutes"
    android:title="Session timeout (minutes)"
    android:restrictionType="integer"
    android:defaultValue="60" />
</restrictions>
```

### 8.6 AppConfig.org Schema

The app publishes a public AppConfig schema (`https://{{schema_host}}/managed-config.schema.json`) following the [AppConfig.org](https://www.appconfig.org/) format, so EMM products auto-render the configuration UI for admins.

### 8.7 Behavioural Notes

- Managed config is **read-only** to the app — it can't be modified at runtime.
- Re-evaluation of policy keys (e.g., `block_screenshots`) is applied at the next view transition; for hard policies (e.g., `force_biometric_lock`), an immediate re-lock is triggered.
- Keys not in the schema are ignored. Schema additions/deprecations are versioned via the `version` field; admins are warned in release notes 60 days ahead of deprecations.
