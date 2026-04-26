# reverse-engineer-mobile-framework — Inputs and Outputs

## Inputs

### Required

- **Repository path** — absolute path to the mobile framework repo's root.
- **Source version** — taken from `build.gradle` AAR version, `Podspec`, `Package.swift`, `package.json`, or git tag.
- **Platform support matrix** — which platforms (Android / iOS / React Native) does this framework support?

### Optional

- Existing implementer documentation, sample integration apps
- Published Maven Central / CocoaPods Trunk / SPM / npm registry metadata (verifies distribution coordinates)

### Elicitation

Reference: `references/elicitation-patterns/repo-scope-discovery.md`. Used to confirm:
- Repository path and version
- Platform(s) supported and platform parity (is iOS ahead of Android? same release cadence?)
- Distribution mechanism: AAR (Maven coords), CocoaPod (pod name + version), SPM (URL + version), npm (package + peer deps)
- Public API surface (which classes / protocols / interfaces are stable?)
- Whether the framework ships testing utilities for consumers
- ABI / API stability policy (semver? semver-major API?)
- Scope exclusions (deprecated public APIs, internal utilities)

### Project.toml driving values

```toml
[[project.repos]]
code = "orderhub-mobile-sdk"
name = "OrderHub Mobile SDK"
path = "../orderhub-mobile-sdk"
role = "framework"
type = "kotlin-multiplatform"
```

## Outputs

### Part A — Internal documentation (stays in source repo)

Default location: `<repo>/docs/mobile-framework-internal/` driven by `re-mobile-framework-internal.yaml`. Coverage:

- Framework overview and philosophy
- Platform support matrix
- Architecture (per-platform internals)
- Build and publish pipeline (per platform: AAR build, Pod publish, SPM tag, npm publish)
- Internal patterns and code-organization conventions
- Cross-platform shared core (if applicable — e.g. KMM)
- Versioning, ABI, and breaking-change policy

### Part B — Implementer documentation

Location: `{paths.knowledge_base_path}/source-docs/<repo-slug>/mobile-framework-consumer.md` driven by `re-mobile-framework-consumer.yaml`. Coverage:

- Getting started (install + initialize per platform)
- Distribution mechanism reference (Maven coords / Pod / SPM / npm)
- Platform support matrix
- Public API reference (with per-platform code examples)
- Configuration options with defaults
- Common patterns and recipes (per platform)
- Anti-patterns
- Testing utilities for consumer code
- Migration guides between framework versions
- Glossary

### Side artifacts

- `extraction-status.md` — inventory checklist with per-platform coverage
- `CHANGE-TRACKER.md` — Parts Affected = A / B / Both

## Hand-off contract

`build-knowledge-base` consumes:
- Part B path
- Repo-slug
- `last_verified_against_commit` SHA
- Cross-references to mobile apps that consume the framework (so KB can build dependency edges)
