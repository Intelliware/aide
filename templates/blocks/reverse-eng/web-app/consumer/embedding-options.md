---
slug: embedding-options
title: "Embedding Options"
applies-to: [re-web-app-consumer]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 110
---

## 1. Embedding Options

<!-- Document every supported way an external party can place this web app
inside another product. The reader is an integrator who already knows the
business reason — they need to know which embedding modality to choose,
and the trade-offs of each. -->

### 1.1 Supported Embedding Modes

| Mode | Transport | Isolation | Best for | Constraints |
|------|-----------|-----------|----------|-------------|
| **iframe** | `<iframe src="{{embed-url}}">` | Full origin isolation | [e.g., "Quick drop-in, low coupling, multi-tenant SaaS hosts."] | [e.g., "Cross-origin postMessage required for two-way comms; no shared cookies without third-party cookie support."] |
| **Web Component** | `<{{tag-name}}>` custom element | Shadow DOM | [e.g., "Embedders that already use Web Components and want CSS isolation without a frame."] | [e.g., "Host page must be HTTPS; bundles a runtime of {{size}}."] |
| **JS SDK / Overlay** | Script tag + global init | Same-origin DOM | [e.g., "Floating widgets, side-panels, chat-style overlays."] | [e.g., "CSS leakage possible; host CSP must allow our script origin."] |
| **Reverse Proxy / Path Mount** | Mounted at `/{{path}}` of host domain | Same-origin | [e.g., "White-labeled experiences with shared auth cookies."] | [e.g., "Host owns DNS, TLS, CDN cache rules; routing collisions must be avoided."] |
| **[Other]** | [transport] | [isolation] | [use case] | [constraint] |

### 1.2 Choosing Between Modes

<!-- Decision guidance — answer the reader's question "which one do I pick?" -->

**Pick iframe when:**
- [e.g., "You cannot guarantee CSP / CSS isolation on the host page."]
- [e.g., "The host is a multi-tenant SaaS where customer pages are user-generated."]
- [e.g., "You want the simplest integration and accept the postMessage hop."]

**Pick web component when:**
- [e.g., "Host page is HTTPS and modern (last 2 years of evergreen browsers)."]
- [e.g., "You want shared scroll context with the host (no nested scrolling)."]

**Pick JS SDK / overlay when:**
- [e.g., "You need to render outside any container — toasts, floating panels, modals."]

**Pick reverse-proxy mount when:**
- [e.g., "Embedder wants the experience under their own domain for SEO / SSO reasons."]

### 1.3 Quick Start per Mode

**iframe:**

```html
<iframe
  src="https://{{embed-host}}/embed?tenant={{tenant-id}}&theme=light"
  width="100%"
  height="600"
  allow="clipboard-write; fullscreen"
  sandbox="allow-scripts allow-same-origin allow-forms"
></iframe>
```

**Web Component:**

```html
<script type="module" src="https://{{embed-host}}/wc/{{version}}/loader.mjs"></script>

<{{tag-name}}
  tenant="{{tenant-id}}"
  theme="light"
  api-base="https://api.example.com"
></{{tag-name}}>
```

**JS SDK / Overlay:**

```html
<script src="https://{{embed-host}}/sdk/{{version}}.js" async></script>
<script>
  window.{{global-name}}Ready = (sdk) => {
    sdk.init({
      tenantId: '{{tenant-id}}',
      anchor: '#widget-mount',
      theme: 'light',
    });
  };
</script>
```

### 1.4 Security and Sandboxing Defaults

- **iframe sandbox:** [e.g., "Recommended attributes: `allow-scripts allow-same-origin allow-forms allow-popups`. Do NOT add `allow-top-navigation` unless the embedder explicitly needs SSO redirects to escape the frame."]
- **CSP requirements on host:** [e.g., "`frame-src https://{{embed-host}}`, `script-src 'self' https://{{embed-host}}`, `connect-src https://api.{{embed-host}}`."]
- **Subresource Integrity:** [e.g., "SDK ships with SRI hashes published at `https://{{embed-host}}/sri.json`. Embedders SHOULD pin a major version + SRI hash."]

### 1.5 Lifecycle and Mount/Unmount

```typescript
// SDK example: explicit mount/unmount control for SPAs that route in/out
const widget = await {{global-name}}.create({
  tenantId: '{{tenant-id}}',
  anchor: '#widget-mount',
});

// Unmount on route change to avoid memory / event-listener leaks
widget.destroy();
```

### 1.6 Limitations and Caveats

- [e.g., "iframe mode cannot read host-page selection or clipboard without explicit permissions APIs."]
- [e.g., "Web Component mode cannot polyfill into IE or Safari < 14."]
- [e.g., "Multiple instances on the same page are supported in SDK and Web Component modes; iframe mode is also fine but each iframe pays the bootstrap cost."]
