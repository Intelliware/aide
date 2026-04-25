---
slug: conventions-and-idioms
title: "Conventions and Idioms"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 320
---

## 22. Conventions and Idioms

<!-- House rules within the framework's own codebase. The patterns
maintainers see again and again, and the deviations that get pushed
back in code review. -->

### 22.1 Coding Style

- **Language level:** [e.g., "TypeScript strict mode; ES2022 syntax; no decorators in core."]
- **Modules:** ESM; no default exports for runtime helpers; named exports only.
- **Formatting:** Prettier (project config); enforced in CI.
- **Linting:** ESLint with framework-specific rules (cycle detection, internal-import boundaries, sideEffects discipline).
- **Naming:**
  - Files: `camelCase.ts`.
  - Types: `PascalCase`.
  - Constants: `SCREAMING_SNAKE` only for true compile-time constants.
  - Internal symbols: prefix with `_`.

### 22.2 Performance-First Patterns

- **Hot paths use plain objects, not classes.** The render loop, scheduler, and reactivity primitives avoid `class` syntax to keep megamorphic dispatch low.
- **Avoid closures in inner loops.** Inline lookups; pre-compute outside the loop.
- **Allocate-once.** Reuse arrays and objects where possible; `pushOrCreate` helpers exist in `shared`.
- **Bitmask flags** instead of object-shaped option bags in patch and codegen helpers.

### 22.3 Defensive Coding Conventions

- **Never trust user-supplied callbacks** — wrap in `callWithErrorHandling` so throws route to the boundary chain (see error-boundary-system).
- **Always dispose effects in matched scope** — every `effect()` either lives in a `scope` you own OR is returned for the caller to manage.
- **Asserts are dev-only.** Use `__DEV__ &&` guards so the assert disappears from production bundles.

### 22.4 Type Patterns

- **Generic constraints:** prefer `extends object` over `extends Record<string, unknown>` for prop types — better inference.
- **Branded types** for IDs and tokens that must not mix (e.g., `type ScopeId = number & { __brand: 'ScopeId' }`).
- **Readonly contract types** for any data structure exposed to consumers.

### 22.5 Error Messages

- Dev warnings use a stable prefix: `[{{prefix}} warn]: …`.
- Each warning has a unique numeric ID; docs page maps IDs → explanations.
- Errors include a `component` field where the runtime can determine it.

### 22.6 Documentation Conventions

- Public APIs have a JSDoc with: short description, `@param`s, `@returns`, `@example`, `@since`, `@see` cross-refs.
- Internal helpers comment WHY, not WHAT.
- Architecture-relevant comments link to the corresponding internals doc section by anchor.

### 22.7 Test Conventions

- One behavior per test; descriptive `it('does X when Y')`.
- Use the framework's test-utils, not the internal renderer, in component-level tests.
- Snapshot tests must include human-readable assertions before the snapshot to catch incidental changes.

### 22.8 Commit and PR Conventions

- **Commits:** Conventional Commits (`feat(scope): …`, `fix(scope): …`, `refactor(scope): …`, `docs(scope): …`).
- **PRs:** title follows commit format; body has "What/Why/How tested" template.
- **Squash-merge** to keep main linear; release notes generated from commit titles.
- **Breaking changes** require a `BREAKING CHANGE:` footer AND a migration note added to the next-major doc.

### 22.9 Idioms to Prefer

- **Early returns** over deep nesting.
- **Iteration with explicit indices** in hot paths over `for…of`.
- **`is*` predicates** and **`assert*` helpers** in `shared` over inline checks.
- **`PatchFlags & FLAG`** rather than `(patchFlag >> bit) & 1`.

### 22.10 Idioms to Avoid

- [e.g., "Re-exporting from internal modules through public entries — leaks unstable surface."]
- [e.g., "Optional chains hiding `null` propagation in render math — surface the branch explicitly."]
- [e.g., "Synchronous DOM reads inside watchers — schedule for `post` flush or `nextTick`."]
- [e.g., "Adding a method to `ComponentInternalInstance` instead of a free function in a helper module — bloats per-instance memory."]

### 22.11 Code Review Checklist

When reviewing a PR, verify:

- [ ] Public API additions have docs and a changelog entry.
- [ ] Removed/renamed APIs went through the deprecation cycle.
- [ ] Tests added for new branches; coverage thresholds hold.
- [ ] Bundle-size budget unchanged or justified.
- [ ] Hot-path code does not allocate per-call.
- [ ] No internal-symbol leakage in public typings.
- [ ] HMR / SSR not broken (CI suites green).
