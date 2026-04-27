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

<!-- Capture the framework's actual rules. Values below are illustrative — different
ecosystems land on different conventions, so replace each row with what the repo
enforces, not what's typical elsewhere. -->

- **Language / language level:** [e.g., "TypeScript strict mode, ES2022", "Swift 5.9, strict concurrency", "Kotlin 1.9 with explicit-API mode", "Dart 3.x null-safe", "Rust edition 2021"]
- **Module system:** [e.g., "ESM only; named exports only", "CommonJS interop allowed at boundaries", "Swift modules", "Kotlin packages", "Dart libraries", "Rust crates with `pub(crate)` internals"]
- **Formatting:** [e.g., "Prettier", "Biome", "rustfmt", "gofmt", "ktlint", "swift-format", "dart format", "Black + isort"] — enforced in CI.
- **Linting / static checks:** [e.g., "ESLint with framework-specific rules", "clippy", "detekt", "SwiftLint", "analyzer + custom_lint", "Ruff"] — typically with rules covering cycle detection, internal-import boundaries, side-effect discipline.
- **Naming:**
  - Files: [convention — e.g., `camelCase.ts`, `snake_case.py`, `PascalCase.swift`, `kebab-case.dart`]
  - Types / classes: [e.g., `PascalCase`]
  - Constants: [e.g., `SCREAMING_SNAKE` for compile-time constants only]
  - Internal symbols: [e.g., `_underscore` prefix, `internal` modifier, `pub(crate)` visibility]

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

<!-- Capture the actual type-system idioms the framework relies on. Examples below are
TypeScript-flavoured because that's the most common UI-framework language, but the
principles apply with each language's own primitives — replace with the codebase's
actual idioms. -->

- **Generic / parametric type constraints:** [e.g., TS: `extends object` over `extends Record<string, unknown>` for prop types; Swift: `where T: Hashable`; Kotlin: `<T : Any>`; Rust: trait bounds; Dart: bound type parameters]
- **Nominal / branded / phantom types** for IDs and tokens that must not mix [e.g., TS: `type ScopeId = number & { __brand: 'ScopeId' }`; Swift: dedicated wrapper struct; Kotlin: value class; Rust: newtype pattern].
- **Readonly / immutable contract types** for any data structure exposed to consumers [e.g., TS `Readonly<T>`, Swift `let`, Kotlin `val` + immutable collections, Rust shared references, Dart `final`/`const`].

### 22.5 Error Messages

- Dev warnings use a stable prefix: `[{{prefix}} warn]: …`.
- Each warning has a unique numeric ID; docs page maps IDs → explanations.
- Errors include a `component` field where the runtime can determine it.

### 22.6 Documentation Conventions

- Public APIs have inline doc-comments [e.g., JSDoc / TSDoc, Swift documentation comments, KDoc, Rustdoc, Dartdoc, JavaDoc, Python docstrings] with: short description, parameter descriptions, return value, example, `since`/`available` info, cross-references.
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

<!-- Capture the framework's actual house-preferred patterns. Examples below mix
language-agnostic principles with language-specific tactics — adjust the
language-specific rows to whatever this codebase actually uses. -->

- **Early returns** over deep nesting.
- **Iteration with explicit indices** in hot paths over higher-level iterators (when the language allows the optimisation).
- **Predicate / assertion helpers** [e.g., `is*` / `assert*` functions] in a shared module over inline checks.
- **Bitmask flag tests** [e.g., `Flags & FLAG` over `(flags >> bit) & 1`] in patch and codegen helpers.
- [Other framework-specific idiom — record what you find in the codebase]

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
