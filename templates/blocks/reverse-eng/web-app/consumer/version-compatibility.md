---
slug: version-compatibility
title: "Version Compatibility"
applies-to: [re-web-app-consumer]
requires-decision-from: [code-reader, ops, architect]
optional: false
order-hint: 200
---

## 10. Version Compatibility

<!-- Which browsers, host frameworks, and embed-versions are supported, and
how versions interact across the public surface. -->

### 10.1 Versioning Scheme

- **Versioning:** [e.g., "Semantic versioning. `MAJOR.MINOR.PATCH`."]
- **Public surface:** [e.g., "SDK API, Web Component attributes/slots/events, postMessage envelopes, REST API, theme tokens."]
- **What's NOT public:** [e.g., "Internal class names, undocumented globals, `_internal:*` events."]

### 10.2 Support Window

| Major version | Released | Active support | Security-only | EOL |
|---------------|----------|----------------|---------------|-----|
| v3.x | {{date}} | yes | — | — |
| v2.x | {{date}} | — | yes (until {{date}}) | — |
| v1.x | {{date}} | — | — | {{date}} |

- **Active support:** all bug fixes, all security fixes, new features.
- **Security-only:** critical security fixes only; {{n}} months after the next major.
- **EOL:** no fixes; tracking sunset announcements for embedders.

### 10.3 Browser Compatibility

| Browser | Minimum version | Notes |
|---------|-----------------|-------|
| Chrome / Edge (Chromium) | last 2 stable | Full support |
| Firefox | last 2 stable | Full support |
| Safari (macOS) | 15+ | Full support |
| Safari (iOS) | 15+ | Full support |
| [Other] | [version] | [notes] |

- **Polyfills:** [e.g., "None bundled. The embed targets baseline 2022 and assumes ES2022, fetch, Web Components v1, CSS custom properties."]
- **Mobile:** [e.g., "Touch-first interactions supported. iframe mode subject to mobile Safari iframe quirks (see below)."]

### 10.4 Host Framework Compatibility

| Host framework | Verified | Notes |
|----------------|----------|-------|
| Vanilla / no framework | yes | All modes |
| React 18+ | yes | Web Component requires `customElements`-aware refs |
| Vue 3+ | yes | Use `:custom-element="true"` Vue config |
| Angular 16+ | yes | `CUSTOM_ELEMENTS_SCHEMA` required for the Web Component tag |
| Svelte 4+ | yes | — |
| [Framework] | [yes/no] | [notes] |

### 10.5 Pinning Strategy

**Recommended:** pin a major version, accept minors and patches.

```html
<!-- SDK -->
<script src="https://{{cdn}}/sdk/v3/loader.js"></script>

<!-- Web Component loader -->
<script type="module" src="https://{{cdn}}/wc/v3/loader.mjs"></script>
```

**Strict pin (for high-stakes embeds):**

```html
<script
  src="https://{{cdn}}/sdk/3.4.2/loader.js"
  integrity="sha384-…"
  crossorigin="anonymous"
></script>
```

### 10.6 Compatibility Matrix Across Surfaces

| SDK / WC version | REST API version | postMessage envelope version |
|------------------|------------------|------------------------------|
| 3.x | v2 (preferred), v1 (compat) | 2.x |
| 2.x | v1 | 1.x |

**Cross-version embedding on one page:** running two different MAJORS on the same page is unsupported. Two MINORS of the same major are supported.

### 10.7 Known Compatibility Quirks

- [e.g., "Mobile Safari < 16 sometimes throttles `postMessage` from background tabs — use the `auth:signed-out` event with `reason='expired'` to recover."]
- [e.g., "Safari intelligent tracking prevention may purge the embed's storage; the SDK detects this and re-authenticates silently when possible."]
- [e.g., "Old Edge (non-Chromium) is not supported."]

### 10.8 Upgrading

- **Minor / patch:** drop in; CI runs visual regression and a11y suites against latest.
- **Major:** [e.g., "Follow the migration guide for the target version. Each major ships a codemod for SDK call sites where possible."]
- **Compatibility mode:** [e.g., "v3 ships a `legacy: true` flag that re-exposes the v2 event names with deprecation warnings, valid for one major."]
