---
slug: slot-projection-and-content-distribution
title: "Slot Projection and Content Distribution"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 220
---

## 12. Slot Projection and Content Distribution

<!-- How children passed by a parent reach the slot positions in the
child's template. Covers default, named, and scoped slots; SSR /
hydration concerns; and the compiler's slot-flag optimizations. -->

### 12.1 Slot Object Shape

```typescript
type SlotsObject = {
  default?: (scopedProps?: any) => VNode[];
  [name: string]: ((scopedProps?: any) => VNode[]) | undefined;

  // Internals
  _ctx: ComponentInternalInstance | null;       // owner of slot fns
  _: SlotFlags;                                 // STABLE | DYNAMIC | FORWARDED
};
```

- **Slot functions** are evaluated lazily inside the child's render — children are NOT instantiated until the slot is actually rendered.
- **`_ctx`** is the parent — important: slot content is owned by the parent, so its reactive deps belong to the parent's render effect.

### 12.2 Default and Named Slots

```typescript
// Authoring (parent)
<Card>
  <template #header>Title</template>
  Default body content
  <template #footer>Footer</template>
</Card>

// Compiler emit (parent)
h(Card, null, {
  header: () => [createTextVNode('Title')],
  default: () => [createTextVNode('Default body content')],
  footer: () => [createTextVNode('Footer')],
});

// Authoring (child)
<header><slot name="header" /></header>
<main><slot /></main>
<footer><slot name="footer" /></footer>

// Compiler emit (child)
function render(_ctx) {
  return [
    h('header', null, renderSlot(_ctx.$slots, 'header')),
    h('main',   null, renderSlot(_ctx.$slots, 'default')),
    h('footer', null, renderSlot(_ctx.$slots, 'footer')),
  ];
}
```

### 12.3 Scoped Slots

```typescript
// Child exposes data to parent's slot template
<slot name="row" :item="row" :index="i" />

// Parent uses the scope
<DataList>
  <template #row="{ item, index }">
    <Row :item="item" :index="index" />
  </template>
</DataList>
```

- The child calls the slot function with a props object; parent's render destructures it.
- The slot function is evaluated in the parent's reactive context; reads inside it track to the parent's render effect.

### 12.4 Slot Flags

| Flag | Compiler sets when… | Renderer behavior |
|------|---------------------|-------------------|
| `STABLE` | Slot set is known statically | Child can skip slot-presence checks |
| `DYNAMIC` | Slot keys may change (e.g., `<slot :name="dynamicName" />`) | Always re-evaluate slot map |
| `FORWARDED` | Parent itself forwards slots to its own child | Parent passes slot fn references through unchanged |

### 12.5 Slot Update Semantics

- A slot re-evaluates when the parent re-renders (its render effect runs).
- A child re-render does NOT cause the slot to re-evaluate by itself — the slot is part of the parent's effect tree.
- Reactive reads inside a scoped slot's expression (parent side) propagate as parent dependencies; reads inside the slot's *render* (child side, when invoking the fn) propagate as child dependencies of the value passed.

### 12.6 Forwarded Slots

```typescript
// Wrapper that just relays slots to its inner Card
<Card><slot /></Card>
```

The compiler flags this as `FORWARDED`; the runtime passes the parent's slot functions through without re-wrapping, preserving `_ctx` so reactive ownership stays correct.

### 12.7 Conditional and Multiple Slot Calls

- `<slot>` can be called multiple times; each call evaluates the slot function fresh — important for scoped slots that depend on per-call args.
- `<slot v-if="...">` short-circuits to nothing when condition is false — no slot fn invocation.

### 12.8 SSR and Hydration

- Slots render to string in SSR like any other VNode subtree.
- Hydration walks slot output and pairs DOM nodes with slot return values; mismatches log a warning and re-render the slot subtree on the client.

### 12.9 Pitfalls

- [e.g., "Calling a slot function during the parent's render but reading its return value lazily later: the closed-over reactive deps are bound at call time. Don't memoize slot results."]
- [e.g., "Default slot fallback content is supplied by the child via `<slot>fallback</slot>`; the runtime returns the fallback only when the slot fn is missing OR returns an empty array."]
- [e.g., "Forwarding slots manually with `() => $slots.default?.()` loses scoped-slot args — use the framework's forwarder helper."]
