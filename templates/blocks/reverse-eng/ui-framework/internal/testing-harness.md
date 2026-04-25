---
slug: testing-harness
title: "Testing Harness"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 270
---

## 17. Testing Harness

<!-- The framework's official testing utilities — the abstractions
maintainers and downstream apps both use. Includes the renderer-test
shim, the unit-test runner, and the patterns for testing each subsystem. -->

### 17.1 Test Targets

| Target | Tooling | Where it runs |
|--------|---------|---------------|
| Reactivity unit tests | Vitest / Jest | Node |
| Compiler snapshot tests | Vitest, fixture files | Node |
| Renderer DOM tests | Vitest + JSDOM (or @vitest/browser) | Node or browser |
| SSR tests | Vitest (Node) | Node |
| E2E | Playwright / Cypress | Real browser |

### 17.2 Mounting API

```typescript
import { mount } from '@{{org}}/test-utils';

const wrapper = mount(MyComponent, {
  props: { count: 1 },
  slots: { default: '<span>hi</span>' },
  global: {
    provide: { [TOKEN]: mockService },
    plugins: [router, store],
    stubs: { ChildComponent: true },
  },
  attachTo: document.body,
});

expect(wrapper.text()).toContain('1');
await wrapper.find('button').trigger('click');
expect(wrapper.emitted('change')).toEqual([[2]]);
wrapper.unmount();
```

- `mount` returns a `Wrapper` with traversal helpers (`find`, `findAll`, `findComponent`), event helpers (`trigger`, `setValue`), and assertions on `emitted`, `props`, `attributes`, `classes`.
- `shallowMount` stubs all child components — useful for isolation tests.

### 17.3 Async Coordination

```typescript
await wrapper.setProps({ count: 2 });   // returns after the next flush
await flushPromises();                   // resolves microtasks
await nextTick();                        // resolves the framework's flush
```

- Setters auto-await; raw signal writes need an explicit `nextTick`.
- `vi.useFakeTimers()` integrates: scheduler still flushes on microtask boundaries; advance timers for `setTimeout`-driven code.

### 17.4 Testing Reactivity

```typescript
import { effect, ref } from '@{{org}}/reactivity';

it('tracks reads and triggers writes', () => {
  const count = ref(0);
  let runs = 0;
  effect(() => { runs++; void count.value; });
  expect(runs).toBe(1);
  count.value = 1;
  expect(runs).toBe(2);
});
```

### 17.5 Testing the Compiler

- Fixtures live in `__tests__/fixtures/{name}.input.{{ext}}` with sibling `{name}.output.js` snapshots.
- Tests run the compiler on each input and assert deep equality with the snapshot.
- A separate suite executes the produced render fn against the runtime in JSDOM to catch semantic regressions invisible at the snapshot level.

### 17.6 Testing the Renderer

- Custom renderers (`createRenderer`) let tests target an in-memory tree instead of the DOM, asserting on patch operations directly.

```typescript
const ops: Op[] = [];
const renderer = createRenderer({
  createElement: (tag) => { ops.push({ kind: 'create', tag }); return { tag, children: [] }; },
  patchProp: (el, key, _prev, next) => ops.push({ kind: 'prop', el, key, next }),
  insert: (el, parent, anchor) => ops.push({ kind: 'insert', el, parent, anchor }),
  remove: (el) => ops.push({ kind: 'remove', el }),
  // …
});
renderer.render(h(MyComponent), { tag: 'root', children: [] });
expect(ops).toMatchSnapshot();
```

### 17.7 SSR Tests

```typescript
import { renderToString } from '@{{org}}/server-renderer';

it('renders a static page', async () => {
  const html = await renderToString(createSSRApp(MyApp));
  expect(html).toMatchInlineSnapshot('<div><h1>Hello</h1></div>');
});
```

- Hydration tests pair an SSR string with a client `mount(... , { attachTo: ssrContainer })` and assert no warnings.

### 17.8 Stubbing Patterns

| Need | Helper |
|------|--------|
| Replace child component | `global.stubs: { ChildComponent: true }` |
| Replace `<router-link>`/`<router-view>` | `global.stubs: { 'router-link': RouterLinkStub }` |
| Provide a token | `global.provide: { [TOKEN]: mock }` |
| Mock a composable | manual `vi.mock('./useThing', () => …)` |

### 17.9 Test Selectors

- Prefer `wrapper.findByRole('button', { name: 'Save' })` (a11y-driven) over class selectors.
- `data-testid` is supported but discouraged for production-facing components.

### 17.10 CI Integration

- Coverage thresholds per package, gating PRs.
- Flake detection: tests retry once; second-failure reports a flake bug.
- Visual regression for the component library uses Playwright snapshots stored alongside fixtures.

### 17.11 Pitfalls

- [e.g., "Forgetting to `wrapper.unmount()` leaks effects between tests; the harness logs a warning if active scopes outlive a test."]
- [e.g., "Asynchronous DOM updates need `await nextTick()` even after `setProps` if the change triggers cascading watchers."]
- [e.g., "SSR tests that import top-level reactive state share it across tests — always create the app inside the test."]
