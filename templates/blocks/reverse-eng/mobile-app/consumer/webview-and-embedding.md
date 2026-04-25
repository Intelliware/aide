---
slug: webview-and-embedding
title: "Webview and Embedding Contract"
applies-to: [re-mobile-app-consumer]
requires-decision-from: [code-reader, architect, security]
optional: true
order-hint: 140
---

## 4. Webview and Embedding Contract

> Mark this section N/A if the app does not embed third-party web content or expose a JS bridge to embedded pages.

### 4.1 Where Webviews Are Used

| Surface | Hosting Component | URL Pattern Allowed | Why |
|---------|-------------------|---------------------|-----|
| In-app help center | `WKWebView` / `WebView` | `https://help.{{host}}/*` | Hosted content under our control |
| Partner offer pages | `SFSafariViewController` / Custom Tab | `https://partner.{{host}}/*` | Partner-rendered, isolated browser session |
| Auth/OAuth | ASWebAuthenticationSession / Custom Tabs | `https://auth.{{host}}/*` | Session isolation, system credentials |
| Marketing campaigns | `WKWebView` | `https://campaigns.{{host}}/*` | Editorial content updated without app release |

### 4.2 Allowlist for Embeddable Hosts

Embedded pages **must** be served from one of:

```
help.{{host}}
partner.{{host}}
campaigns.{{host}}
{{add additional hosts here}}
```

Loads outside this list are rejected by the webview's `shouldOverrideUrlLoading` / `decidePolicyFor` logic. Partners requesting allowlisting submit a request to `{{webview_admin_contact}}` with their domain + content security review.

### 4.3 JS Bridge — What the Page Can Call

The app injects a global `window.{{bridge_global}}` (e.g., `window.AppBridge`) into pages loaded from allowlisted hosts.

```typescript
interface AppBridge {
  // Identity (read-only — no PII beyond opaque IDs)
  getAppInfo(): Promise<{ version: string; platform: "ios" | "android"; locale: string }>;
  getUserId(): Promise<string | null>;

  // Navigation
  closeWebview(): void;
  navigateTo(deepLink: string): void;

  // UX
  hapticFeedback(kind: "light" | "medium" | "heavy" | "success" | "warning" | "error"): void;
  showToast(message: string): void;

  // Analytics — events are logged in the app's analytics pipeline as origin="webview"
  track(event: string, properties?: Record<string, string | number | boolean>): void;

  // Auth handoff (for tightly-coupled help / billing flows only)
  requestAuthToken(scope: string[]): Promise<{ token: string; expiresIn: number }>;
}
```

> The bridge is **only injected into allowlisted origins**. Pages on non-allowlisted origins will see `window.{{bridge_global}} === undefined` and must degrade gracefully.

### 4.4 What Pages CANNOT Do

- Read arbitrary native storage / cookies / keychain.
- Make outbound calls outside their origin's CSP.
- Trigger purchases, IAP, or subscription state changes (must use native flows).
- Capture biometrics, camera frames, or microphone audio (must use native flows).
- Access location data directly — page may call `bridge.getCoarseLocation()` only if the user has already granted location to the app.

### 4.5 Security Headers Embeddable Pages Must Set

```
Content-Security-Policy: default-src 'self' https://{{host}}; script-src 'self' 'unsafe-inline'
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
```

Pages embedded inside the app's webview are also pinned via {{cert_pinning_strategy}} — partners requesting embedding MUST share their cert SHA-256 with mobile.

### 4.6 Lifecycle and Visibility

| Event | What the Page Receives |
|-------|------------------------|
| Webview opened | `pageshow` + `bridge.getAppInfo()` available immediately |
| App backgrounded | `visibilitychange → hidden` (page should pause timers, video) |
| App foregrounded | `visibilitychange → visible` (page may refresh data) |
| Webview closed by user | `unload` followed by webview teardown — pages should not block on `beforeunload` |

### 4.7 Embedding Our Content in a Host Page

If a third party wants to embed *our* content (rare):
- Provide an `<iframe>` snippet at `https://embed.{{host}}/{{path}}`.
- Hosts must list themselves in our `Content-Security-Policy: frame-ancestors` allowlist.
- Embedding partners receive a signed JWT (`X-Embed-Token`) for personalised content.

### 4.8 Debugging an Embedded Page

| Platform | How |
|----------|-----|
| iOS | Connect device to Mac, enable "Web Inspector" in app settings, open Safari → Develop → {{device_name}} |
| Android | `chrome://inspect/#devices` after enabling `WebView.setWebContentsDebuggingEnabled(true)` in non-prod builds |

> Web Inspector / WebView debugging is **disabled in production builds** for security. Test against a staging variant.
