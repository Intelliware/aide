---
slug: compatibility-strategy
title: "Compatibility Strategy"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 310
---

## 21. Compatibility Strategy

Define the public-API contract: what is stable, what is unstable, and what the policy is for evolving each. Without an explicit compatibility contract, every internal refactor risks breaking downstream consumers; with it, maintainers can move quickly inside boundaries and slowly across them. Verify against the most recent two majors — if real breakages don't fit the policy here, the policy is a fiction and needs updating.

Cover backporting, codemod policy, deprecation timelines, and what version skew is supported between core and plugins. The compatibility-strategy block also explains *why* certain refactors require a major bump, so contributors can anticipate during PR review.

### Suggested template content

**Public surface (stable, semver-bound):**

- All exports from the package's documented entry points (see build-and-packaging block).
- Behavior of every documented config key.
- The plugin contract and `PluginContext` API.
- The wire-level behavior: HTTP request handling, error envelope, default headers.
- The CLI command surface (`{{cli}} <commands>`).

**Internal surface (unstable, may change in any release):**

- Anything imported from `<pkg>/dist/internal/*` or marked `@internal` in source.
- Source file paths (refactors don't trigger major bumps).
- Private fields on framework types.
- Plugin-context internals beyond the documented methods.

**Versioning:**

- Semver: `MAJOR.MINOR.PATCH`.
- Pre-release: `-rc.N`, `-next.N`.
- Major bump triggers (breaking):
  - Removing or renaming a public export.
  - Changing the signature/behavior of a documented method.
  - Removing or renaming a config key (after deprecation window).
  - Changing the plugin contract incompatibly.
  - Changing the wire-level error envelope.
- Minor bump triggers (additive):
  - New exports, new methods, new config keys (with sensible defaults).
  - New plugin extension points.
  - New optional middleware.
- Patch bump triggers:
  - Bug fixes that preserve documented behavior.
  - Performance fixes without behavior change.
  - Documentation-only changes.

**Deprecation policy:**

- Mark with `@deprecated` (or ecosystem equivalent) at least one minor before removal.
- Runtime deprecation warning emitted to the logger at `warn` level (de-duped per process).
- Removal occurs only at a major bump, ≥ {{deprecation-window — e.g. 12 months}} after announcement.
- Migration path documented in the changelog and a dedicated migration doc.

**Backport policy:**

- Active major: all bug fixes, perf fixes, security fixes.
- Previous major: security fixes only, for {{previous-major-window}}.
- Older majors: unsupported.

**Plugin compatibility:**

- Plugins declare `peerDependencies`: `core@<range>`.
- The framework enforces the range at registration; mismatched plugins fail loudly.
- Plugin contract is part of the public surface — breaking it requires a major bump on `core`.

**Source files:**

- Internal-marker convention: `{{convention — e.g. /** @internal */ JSDoc tag, or `_internal/` folder}}`
- Public surface API report (auto-generated): `{{path}}`
- Compatibility CI job: `{{path}}`

**API report:**

- A tool ({{tool — e.g. api-extractor}}) generates a textual report of the public surface on every PR.
- Diffs to the report are reviewed; unintended changes block the PR.

**Migration codemods:**

- See cli-and-scaffolding block (`{{cli}} upgrade`).
- Codemods cover mechanical renames; semantic changes are flagged for manual review with a comment marker.

**Version skew (multi-package monorepo):**

- All first-party packages release in lockstep with the same version.
- Across-major mixing in user projects is unsupported (e.g., `core@2` + `plugin-x@1` may break).

**Common pitfalls:**

- Adding a new optional parameter that changes default behavior — semver-minor in spec, semver-major in practice; mitigate by leaving defaults unchanged.
- Internal refactor that accidentally re-exports a private type — appears as new public API; caught by API report.
- Removing a config key in a minor release because "it was unused" — counts as breaking; needs deprecation window.

**Cross-references:**

- See release-process block for how the policy is enforced at release time.
- See build-and-packaging block for the export map that defines the public surface.
- See plugin-extension-system block for the plugin contract.
