---
slug: render-pipeline
title: "Render Pipeline"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 140
---

## 4. Render Pipeline

<!-- From "a signal changed" to "the DOM matches the new tree": the
render → reconcile → commit/patch sequence. Maintainers debugging
flicker, double-render, or wrong-order updates start here. -->

### 4.1 Pipeline Stages

```
  signal change
        │
        ▼
   trigger(deps)              ◄── reactivity-system
        │
        ▼
   scheduler.queueJob(eff)    ◄── batch into microtask
        │
        ▼
   flushJobs()
        │
        ├─► pre-flush jobs
        │
        ├─► render effect runs:
        │      newVNode = render(instance)
        │      patch(oldVNode, newVNode, container)
        │
        └─► post-flush jobs (refs, mounted/updated hooks)
```

### 4.2 The Render Function

`render(instance)` produces an immutable VNode tree (or, in fine-grained frameworks, schedules direct DOM updates without a VNode). The output of compilation is a `render` function with stable shape.

```typescript
// VNode shape
interface VNode {
  type: string | ComponentDefinition | typeof Fragment;
  key?: string | number;
  props: Record<string, unknown> | null;
  children: VNodeChildren;
  // optimizer hints from the compiler
  patchFlag: number;     // bitmask: TEXT, CLASS, STYLE, PROPS, FULL_PROPS, …
  dynamicProps?: string[];
  shapeFlag: number;     // ELEMENT | COMPONENT | TEXT_CHILDREN | ARRAY_CHILDREN | …
  // runtime-bound after mount
  el?: Node | null;
  component?: ComponentInternalInstance | null;
}
```

### 4.3 Reconciliation (Patch)

`patch(oldVNode, newVNode, container, anchor)` decides:

1. If types differ → unmount old, mount new.
2. If types match → process by `shapeFlag`:
   - **ELEMENT:** diff props (using `patchFlag` to skip work), recurse into children.
   - **COMPONENT:** update props, mark child instance dirty (does not call `render` directly — it queues the child's render effect).
   - **TEXT:** update `nodeValue` if changed.
   - **FRAGMENT:** diff children with the keyed/unkeyed list strategy.

### 4.4 Keyed List Reconciliation

```
Two-ended diff with longest-increasing-subsequence on the unmatched middle.

   old: [A B C D E F G]
   new: [A B X D F E G]
                ▲
             LIS over remaining old indices to minimize moves.

Cases handled in order:
  1. Common prefix scan (A,B match — skip).
  2. Common suffix scan (G matches — skip).
  3. Old exhausted → mount remaining new.
  4. New exhausted → unmount remaining old.
  5. Unknown middle:
        - build keyToNewIndex map
        - walk old; if found, patch + record newIndex; else unmount
        - LIS over the recorded new indices → DOM moves only for non-LIS
```

### 4.5 Patch Flags (Compiler-Driven Fast Path)

| Flag | Compiler emits when… | Patch shortcut |
|------|----------------------|----------------|
| `TEXT` | Only the text child is dynamic | only update `textContent` |
| `CLASS` / `STYLE` | Only class/style is dynamic | skip prop diff, set directly |
| `PROPS` (with `dynamicProps`) | Some props dynamic, others static | iterate only dynamic keys |
| `FULL_PROPS` | Spread or unknown dynamic shape | full prop diff |
| `STABLE_FRAGMENT` | Children list shape stable | skip keyed reorder |
| `KEYED_FRAGMENT` | Keyed `v-for` | full keyed diff |
| `UNKEYED_FRAGMENT` | Unkeyed `v-for` | length-based diff |
| `HOISTED` | Static subtree | skip entirely |

### 4.6 Mount and Unmount

- **Mount:** `createElement` → set props → recurse children → insert before anchor → queue `mounted` post-flush.
- **Unmount:** call `beforeUnmount`, stop instance scope (drops every effect), unmount children, `removeChild`, queue `unmounted`.
- **Move:** child Fragment moves use `insertBefore` of the first child; descendants follow naturally.

### 4.7 SSR and Hydration

- **SSR:** `render` produces a string; component setups run; reactivity is set up but **not** patched (no DOM).
- **Hydration:** client mounts traverse existing DOM nodes, attach event listeners, and reconcile with the live VNode tree. Mismatches log a warning and fall back to client render of the affected subtree.

### 4.8 Synchronous Escape Hatches

- `nextTick(fn)`: resolves after the current flush — used to read updated DOM.
- `flushSync(fn)`: forces an immediate flush around `fn`. Discouraged in product code; useful in tests.

### 4.9 Where Pipeline Bugs Hide

- [e.g., "A new patchFlag must be wired in BOTH the compiler emit and the runtime fast path; mismatches cause silent stale UI."]
- [e.g., "Unkeyed list with insertions can re-bind state to wrong nodes — always require keys for collections of stateful components."]
- [e.g., "Hydration mismatch logs are throttled; a single warning can mask many sites."]
