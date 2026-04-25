---
slug: customization-extension-points
title: "Customization and Extension Points"
applies-to: [re-web-app-consumer]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 130
---

## 3. Customization and Extension Points

<!-- The supported "seams" — slots, plugin hooks, custom panels, and
configuration that lets an embedder tailor behavior without forking. -->

### 3.1 Available Extension Surfaces

| Surface | Mechanism | When to use |
|---------|-----------|-------------|
| **Named slots** | DOM slot / projection point | [e.g., "Replace or augment a region of the UI (header, empty state, row actions)."] |
| **Plugin hooks** | Registered handlers in the SDK | [e.g., "Run code when domain events fire (item created, user signed in)."] |
| **Custom panels** | Register a sidebar/tab | [e.g., "Add a new top-level section visible only to your embedded users."] |
| **Action interceptors** | Around-style middleware | [e.g., "Veto or transform a user action before it commits."] |
| **Config flags** | Static boolean / enum settings | [e.g., "Turn features on/off without code."] |

### 3.2 Named Slots

| Slot name | Where it renders | Default content | Constraints |
|-----------|-------------------|-----------------|-------------|
| `header-actions` | Right side of top bar | [Default actions] | Must fit in `{{px}}` height; max 3 children recommended |
| `empty-state` | Empty list view body | [Default empty state] | None |
| `row-actions` | Per-row action menu | [Default actions] | Children receive `row` context via slot props |
| `footer` | Below main content | (none) | Fixed height when present |
| [slot] | [where] | [default] | [constraints] |

**Slot usage (Web Component):**

```html
<{{tag-name}}>
  <div slot="header-actions">
    <button>{{Embedder action}}</button>
  </div>

  <div slot="empty-state">
    <p>No items yet — create one to get started.</p>
  </div>
</{{tag-name}}>
```

**Slot usage (SDK):**

```typescript
sdk.slots.set('header-actions', (ctx) => {
  const el = document.createElement('button');
  el.textContent = 'Embedder action';
  el.onclick = () => ctx.emit('embedder:action');
  return el;
});
```

### 3.3 Plugin Hooks

```typescript
// Register a plugin that listens to internal events and can mutate
// (where allowed) or veto.
sdk.plugins.register({
  name: 'my-embedder-plugin',
  version: '1.0.0',

  install(api) {
    api.on('item:before-create', async (ev) => {
      // ev.payload is the candidate item
      // return false to veto; throw to surface as a user-visible error
    });

    api.on('item:created', (ev) => {
      // fire-and-forget side effects (analytics, cache warmup)
    });
  },
});
```

**Lifecycle of a hook:**

1. [e.g., "User invokes action."]
2. [e.g., "`*:before-*` event fires; sync handlers run, async handlers awaited."]
3. [e.g., "If any handler returns `false`, the action is canceled with reason."]
4. [e.g., "Action commits to backend."]
5. [e.g., "`*:created` / `*:updated` / `*:deleted` event fires."]

### 3.4 Custom Panels

```typescript
// Register a new tab in the side navigation
sdk.panels.register({
  id: 'my-panel',
  label: 'My Panel',
  icon: 'star',
  position: 'sidebar',           // 'sidebar' | 'inspector' | 'modal'
  visibleTo: ['admin', 'editor'], // Role gating, optional
  render(container, ctx) {
    container.innerHTML = `<h2>Hello, ${ctx.user.displayName}</h2>`;
    return () => { /* cleanup on unmount */ };
  },
});
```

### 3.5 Action Interceptors

| Action | When it fires | What you can do |
|--------|---------------|-----------------|
| `navigate` | Before route change | Cancel, redirect, log |
| `save` | Before persisting form | Validate, mutate payload (where allowed), cancel |
| `export` | Before exporting data | Add columns, change format |
| [action] | [when] | [capabilities] |

### 3.6 Configuration Flags

```typescript
sdk.init({
  features: {
    showHeader: true,
    enableExport: false,
    showAdvancedFilters: 'auto', // 'auto' | true | false
  },
});
```

### 3.7 Stability of Extension Points

- **Named slots and plugin hooks** are part of the public API and follow [semver / deprecation policy referenced in the deprecation-policy block].
- **Internal events** (prefixed with `_internal:`) are not stable — do not depend on them.
- **Slot props** for each named slot are documented in the SDK reference; new optional fields may be added in minor releases.
