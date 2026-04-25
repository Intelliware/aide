---
slug: event-system
title: "Event System"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 210
---

## 11. Event System

<!-- DOM event handling, custom component events, and the delegation
strategy. Maintainers debugging "why did my handler not fire" or
"why are listeners leaking" land here. -->

### 11.1 Event Routing Modes

| Mode | Used for | Mechanism |
|------|----------|-----------|
| **Direct** | Most native DOM events | `addEventListener` on the element |
| **Delegated** | High-volume events (click, input, focusin) | Single listener at app root; dispatches via path-walk |
| **Synthetic** | Cross-browser normalization | Wrapped event object |
| **Component (custom)** | `emit('foo', payload)` | Handler lookup on parent's props (`onFoo`) |

### 11.2 Native Event Binding

- Compiler converts `@click="…"` into a prop named `onClick` (camelCase) on the VNode.
- During patch, `patchEvent` reads/writes `el._vei` (Vue Event Invokers cache) keyed by event name; replaces the invoker's `value` rather than re-attaching the listener.

```typescript
// Pseudocode
function patchEvent(el, name, prevValue, nextValue) {
  const invokers = el._vei ??= {};
  const existing = invokers[name];
  if (nextValue && existing) {
    existing.value = nextValue;             // hot-swap handler — no re-bind
  } else if (nextValue) {
    const invoker = createInvoker(nextValue);
    invokers[name] = invoker;
    el.addEventListener(toKebab(name), invoker, getOptions(name));
  } else if (existing) {
    el.removeEventListener(toKebab(name), existing);
    delete invokers[name];
  }
}
```

The invoker pattern means handler swaps don't re-bind, so micro-thrash is avoided in render-heavy loops.

### 11.3 Modifiers

| Modifier | Compiler emit |
|----------|----------------|
| `.stop` | `e.stopPropagation()` prefix |
| `.prevent` | `e.preventDefault()` prefix |
| `.self` | guard: `if (e.target !== e.currentTarget) return` |
| `.capture` | `addEventListener` with `{ capture: true }` |
| `.once` | `{ once: true }` |
| `.passive` | `{ passive: true }` |
| `.exact` | guard: only fire when modifier set matches exactly |
| Key modifiers (`.enter`, `.esc`, …) | guard on `e.key` |

### 11.4 Component Custom Events

```typescript
// Authoring
emit('change', newValue);

// Compiler: on parent
<MyInput @change="onChange" />
// → component vnode props: { onChange: handler }

// Runtime
function emit(instance, event, ...args) {
  const handler = instance.vnode.props?.[`on${capitalize(event)}`];
  if (handler) handler(...args);
}
```

- `defineEmits(['change'])` (or equivalent) declares the contract; emitting an undeclared event warns in dev.
- Validators: `defineEmits({ change: (v) => typeof v === 'string' })` runs in dev and fails loudly if violated.

### 11.5 Event Delegation

- Click and a few high-volume events go through a delegating root listener attached to `document` (configurable).
- The dispatcher walks `e.composedPath()` and invokes each `_vei` invoker found, respecting `stopPropagation`.
- Disabled by default for events whose semantics differ from native bubbling (`focus`, `blur`); use `focusin`/`focusout` instead.

### 11.6 Listener Cleanup

- Per-element listeners are removed automatically on unmount via `_vei` cleanup.
- The component scope captures any handler-internal `effect()` calls; disposal is automatic.
- Manual `addEventListener` outside the framework MUST be cleaned up in `beforeUnmount` — the runtime cannot see them.

### 11.7 Synthetic Event Object

- Most native events are passed through unchanged.
- For pointer/touch events, the framework normalizes a few properties (e.g., `e.movementX` polyfill) — documented in [reference link].
- Synthetic objects are NOT pooled; reading them after handler return is safe.

### 11.8 Pitfalls

- [e.g., "Adding `.once` and `.capture` on the same handler creates a SEPARATE listener with different options — they cannot share an invoker. The runtime handles this; tests cover the dual-binding path."]
- [e.g., "`@click.passive` on an element that calls `preventDefault()` warns in dev; the warning links to the docs page."]
- [e.g., "Delegated handlers see events from inside `<iframe>` only via `composed: true`; native iframes do not bubble — by design."]
