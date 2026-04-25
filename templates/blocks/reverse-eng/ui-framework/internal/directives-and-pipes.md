---
slug: directives-and-pipes
title: "Directives and Pipes (Internals)"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader]
optional: true
order-hint: 170
---

## 7. Directives and Pipes (Internals)

<!-- Optional. Frameworks that have a directive concept (Vue's v-*, Angular's
@Directive) and/or pipes/filters need this section. React-style frameworks
typically do not. -->

### 7.1 Directive Model

- **Definition:**

```typescript
interface ObjectDirective<T = unknown, V = unknown> {
  beforeMount?(el: T, binding: DirectiveBinding<V>): void;
  mounted?(el: T, binding: DirectiveBinding<V>): void;
  beforeUpdate?(el: T, binding: DirectiveBinding<V>, vnode, prevVNode): void;
  updated?(el: T, binding: DirectiveBinding<V>, vnode, prevVNode): void;
  beforeUnmount?(el: T, binding: DirectiveBinding<V>): void;
  unmounted?(el: T, binding: DirectiveBinding<V>): void;
}

interface DirectiveBinding<V> {
  value: V;
  oldValue: V | null;
  arg?: string;
  modifiers: Record<string, boolean>;
  instance: ComponentInternalInstance | null;
  dir: Directive;
}
```

- **Registration:** globally via `app.directive('focus', dir)` or locally via component options / `<script setup>` auto-import.
- **Resolution:** at compile time the directive name is looked up; if global-only, the runtime resolves via `appContext.directives`.

### 7.2 Compiler Lowering

```
Source:    <input v-model.lazy="msg" />

Compiled:  withDirectives(
             createElement('input', { 'onUpdate:modelValue': $event => msg.value = $event }),
             [[ vModelText, msg, undefined, { lazy: true } ]]
           )
```

- Built-in directives (`v-if`, `v-for`, `v-model`, `v-show`) compile to specialized runtime helpers — no generic `withDirectives` wrapper.
- Custom directives (`v-myDir`) compile to `withDirectives(vnode, [[dir, value, arg, mods]])`.

### 7.3 Lifecycle Wiring

- During `patch`, after the element is mounted/updated, the runtime walks the directive list and invokes the matching hook with bindings.
- Hooks run synchronously in source order on the element; they are NOT batched.
- Directive errors propagate through the same `errorCaptured` chain as components.

### 7.4 Built-in Directives Map

| Directive | Compiler emit | Runtime helper |
|-----------|----------------|----------------|
| `v-if` / `v-else-if` / `v-else` | `if/else` in render fn | (none — pure JS) |
| `v-for` | `renderList(source, (item, idx) => …)` | `renderList` |
| `v-show` | binds `style.display` | (inline) |
| `v-model` (input) | `vModelText` | `vModelText` |
| `v-model` (checkbox/radio/select) | `vModelCheckbox` etc. | dedicated helpers |
| `v-on` | `on{Event}` prop | (inline) |
| `v-bind` | property/attribute branch via `patchProp` | (inline) |
| `v-html` / `v-text` | `innerHTML` / `textContent` | (inline) |
| `v-slot` | slot function | (compile-time only) |

### 7.5 Pipes / Filters (If Supported)

- **Definition:** a function `(input, ...args) => output`.
- **Registration:** `app.pipe('uppercase', s => s.toUpperCase())` or local.
- **Compiler:** `{{ message | uppercase }}` → `_resolveFilter('uppercase')(_ctx.message)`.
- **Resolution:** scope walk — local pipes first, then app pipes.
- **Stateful pipes:** [e.g., "Pipes can be stateful classes implementing `transform()` with a `pure: false` flag — they hold instance state across calls."]

### 7.6 Custom Directive Authoring Hooks

- `directive('focus', { mounted(el) { el.focus(); } })`
- Function shorthand: `directive('color', (el, { value }) => el.style.color = value)`. Calls only on `mounted` and `updated`.

### 7.7 Common Pitfalls

- [e.g., "Forgetting to clean up listeners in `beforeUnmount` causes leaks across re-renders if the element is reused."]
- [e.g., "Custom directives that rely on element layout MUST run in the post-flush queue — synchronous reads in `mounted` cause forced layout."]
- [e.g., "Directive `binding.value` is the new value; `oldValue` is set only in `beforeUpdate` / `updated`."]
- [e.g., "Component-level directives (`v-myDir` on a component tag) bind to the component's root element and re-bind if that root changes; tests should cover root-element swap."]
