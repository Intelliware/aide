---
slug: component-model
title: "Component Model"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 120
---

## 2. Component Model

<!-- What a "component" actually is inside the framework: the data
structure, the lifecycle, and how it composes with reactivity. -->

### 2.1 Definition: What Is a Component, Really?

- **Authoring shape:** [e.g., "A function that returns a render function (closure-style) — or a class with a `render()` method — or a single-file `.{{ext}}` whose `<script>` block compiles to a setup function."]
- **Runtime shape:** an instance object, here called a `ComponentInternalInstance`, which holds:

```typescript
interface ComponentInternalInstance {
  uid: number;                  // Stable id for devtools / keys
  type: ComponentDefinition;    // The user-authored thing
  parent: ComponentInternalInstance | null;
  root: ComponentInternalInstance;

  props: Record<string, unknown>;
  attrs: Record<string, unknown>;
  slots: SlotsObject;
  refs: Record<string, unknown>;

  // Reactivity
  setupState: Record<string, unknown>;
  scope: EffectScope;           // Owns all effects created by setup
  update: ReactiveEffect;       // The render effect

  // Lifecycle hook arrays
  bm: Hook[]; m: Hook[]; bu: Hook[]; u: Hook[]; bum: Hook[]; um: Hook[];

  // VDOM
  vnode: VNode | null;          // Last rendered tree
  subTree: VNode | null;

  // Errors
  errorCaptured: ErrorHook[];

  // DI / context
  provides: Record<string | symbol, unknown>;
  appContext: AppContext;
}
```

### 2.2 Lifecycle Phases

```
   create ────► setup ────► mount ────► update* ────► unmount
                                            │
                                       (re-renders)
```

**Hook execution order:**

| Hook | When it fires | Sync/async-safe |
|------|---------------|-----------------|
| `beforeCreate` | After instance allocated, before setup | sync |
| `setup` (or constructor) | Once; runs the user's component body | sync; may return a Promise for `<Suspense>` |
| `beforeMount` | Before first DOM commit | sync |
| `mounted` | After first DOM commit | safe to read DOM |
| `beforeUpdate` | Reactive dependency dirtied; before patch | sync |
| `updated` | After patch | safe to read DOM |
| `beforeUnmount` | Before instance is torn down | sync; effects still active |
| `unmounted` | After teardown; scope disposed | no reactive reads |
| `errorCaptured` | Descendant threw | may return `false` to stop propagation |

### 2.3 The Render Effect

The render is itself a reactive effect:

```typescript
instance.update = effect(
  () => {
    const newTree = render(instance);
    if (instance.subTree) patch(instance.subTree, newTree, container);
    else mount(newTree, container);
    instance.subTree = newTree;
  },
  { scheduler: queueJob, scope: instance.scope }
);
```

- The first run mounts.
- Any read of a reactive source inside `render` registers a dependency.
- When a dep changes, the scheduler queues `instance.update` — see render-pipeline.

### 2.4 Props, Attrs, Slots, Refs

| Surface | Source | Reactive? | Notes |
|---------|--------|-----------|-------|
| `props` | Declared on the component | yes (each key) | Read inside `setup` and `render` |
| `attrs` | Inherited bindings not in `props` | yes (object identity) | Auto-applied to root or via `inheritAttrs: false` |
| `slots` | Children passed by parent | yes per slot | Functions, called in render |
| `refs` | `ref="…"` template attribute | yes | Resolved during patch |

### 2.5 Authoring Shapes Side-by-Side

```typescript
// Closure / setup shape
defineComponent({
  props: { count: Number },
  setup(props, { emit, slots, expose }) {
    const doubled = computed(() => props.count * 2);
    return () => h('div', doubled.value);
  },
});

// Class shape (if supported)
class Counter extends Component {
  static props = { count: Number };
  render() { return h('div', this.count * 2); }
}

// Single-file .{{ext}} compiles to the closure shape.
```

### 2.6 Composition Primitives

- **Composables / hooks:** plain functions that use reactivity primitives; bind to the current instance via `getCurrentInstance()`.
- **Mixins (legacy):** [e.g., "Supported but discouraged; merged into the component options at instance create."]
- **HOC pattern:** wrapping a component definition and returning another.
- **Slot composition:** named/scoped slots passed as functions.

### 2.7 Pitfalls Maintainers Hit

- [e.g., "Calling reactive APIs outside `setup` without `getCurrentInstance()` leaks effects across components."]
- [e.g., "Holding refs to `setupState` in module scope prevents garbage collection."]
- [e.g., "Lifecycle hooks registered after the first await in async setup are silently dropped — by design — confirm test coverage."]
