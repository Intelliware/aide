---
slug: compatibility-strategy
title: "Compatibility Strategy"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 300
---

## 20. Compatibility Strategy

<!-- The framework's own contract with its consumers across versions:
semver, deprecation cycle, migration tooling, and how to develop new
features without breaking existing apps. -->

### 20.1 Versioning Contract

- **Semver applied to:** the public API surface listed in §20.2.
- **Major:** breaking removal / behavior change.
- **Minor:** additive features, deprecations.
- **Patch:** bug fixes that don't change documented behavior.

### 20.2 Public API Surface

In scope of semver:

- Exported APIs from each package's main entry and documented sub-paths.
- Compiler-emitted runtime helper names AND signatures.
- VNode/component instance fields documented in the maintainer reference.
- HMR protocol ID and message shapes (consumed by devtools and bundler plugins).
- CLI flags and config schema.
- Generated `.d.ts` shapes for public types.

NOT in scope:

- File paths inside packages other than the documented entries.
- Internal class/function names.
- Snapshot output format.
- Performance numbers (best-effort, not contractual).
- Dev-only warnings' wording.

### 20.3 Deprecation Cycle

```
   announce in MINOR ─► runtime warning in MINORs ─► remove in next MAJOR
```

- **Window:** at least one full minor cycle (and {{n}} months) before removal.
- **Marker:** `@deprecated` JSDoc with `@since` and `@removeIn`. Runtime emits a single warning per deprecated symbol per app instance.
- **Removal:** only at major; bundles ship a "compat" build for one major to soften migration where feasible.

### 20.4 Compat Build

- A separate package or build mode (e.g., `@{{org}}/compat`) re-exposes removed APIs as adapter shims.
- Shim emits a warning on use; runs alongside the modern runtime.
- Lifecycle: shipped at major N, sunset at major N+1 unless a critical deprecation requires extension.

### 20.5 Codemods (Migration Tooling)

- Per-major codemod set, run via `{{cli}} upgrade`.
- AST-based; round-trip safe through SFC and JSX parsers.
- Coverage: every breaking change SHOULD have a codemod; if a change is too contextual to automate, the docs surface a "manual fix" entry.

### 20.6 Browser / Runtime Baseline Changes

- Drops a browser version only at a major.
- Announce at least one minor in advance; runtime adds a build-time check for the dropped target so consumers see the requirement loud and clear.

### 20.7 Forward Compatibility

- New features arrive as additions; existing call sites unchanged.
- Optimizer flag bits are append-only; the runtime tolerates unknown flags by routing through the slow path.
- Feature gating via opt-in (`createApp({ futureFlags: { … } })`) lets early adopters preview behavior changes.

### 20.8 Internal Refactors

- Allowed in any release as long as the public surface is unchanged.
- Internal APIs prefixed with `_` are NOT public, even if exported, and may change at any time.

### 20.9 Cross-Version Coexistence

- Two MAJORs in one app is unsupported; lockfile dedupe required.
- Two MINORs of the same major MUST coexist correctly (e.g., a host shell and a federated remote on different patch releases).

### 20.10 Communication

| Channel | Audience | Cadence |
|---------|----------|---------|
| Release notes | All consumers | per release |
| Migration guide | Major-version adopters | per major |
| Blog post / RFC | Major design changes | as needed |
| Maintainer-facing changelog | Framework contributors | per merge |

### 20.11 Pitfalls

- [e.g., "Adding a parameter to a runtime helper used by emitted code breaks every previously-compiled app on disk. Helpers must accept new params optionally."]
- [e.g., "Renaming a `.d.ts` exported type breaks downstream consumers' type-only imports — count as breaking even if runtime is unchanged."]
- [e.g., "Shipping a stricter dev warning in a minor breaks consumers who treat warnings as errors. Phrase as future-warnings-by-flag, escalate at next major."]
