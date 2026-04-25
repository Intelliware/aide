# reverse-engineer-api-framework — Inputs and Outputs

## Inputs

### Required

- **Repository path** — absolute path to the framework repository's root.
- **Source version** — taken from `package.json`, `pom.xml`, or git tag.

### Optional

- Existing implementer documentation (treat as input to verify, not as a replacement)
- Sample apps that use the framework (reveal expected usage patterns)
- Tests (reveal contract obligations)

### Elicitation

Reference: `references/elicitation-patterns/repo-scope-discovery.md`. Used to confirm:
- Repository path and version
- Distribution mechanism (npm, NuGet, Maven, etc.) and target consumers
- Whether the framework supports multiple platforms/runtimes
- Public-API-vs-internal-API boundary (which decorators/exports are stable?)
- Scope exclusions (experimental modules, deprecated APIs)
- Whether the framework ships testing utilities for consumers

### Project.toml driving values

```toml
[[project.repos]]
code = "orderhub-api-fw"
name = "OrderHub API Framework"
path = "../orderhub-api-framework"
role = "framework"
type = "node-typescript"
```

## Outputs

### Part A — Internal documentation (stays in source repo)

Default location: `<repo>/docs/api-framework-internal/` driven by `re-api-framework-internal.yaml`. Coverage:

- Framework overview
- Architecture and design philosophy
- Build / publish pipeline
- Request pipeline internals (middleware ordering, guard semantics, pipe transformation)
- DI internals (token resolution, lifetime, scoping)
- Configuration loading and merging
- Error handling internals
- Internal patterns and code-organization conventions
- Versioning and breaking-change policy

### Part B — Implementer documentation

Location: `{paths.knowledge_base_path}/source-docs/<repo-slug>/api-framework-consumer.md` driven by `re-api-framework-consumer.yaml`. Coverage:

- Getting started (install, hello-world)
- Public API reference
- Extension points (decorators, guards, interceptors, pipes, modules)
- Configuration options with defaults
- Common patterns and recipes
- Anti-patterns
- Testing utilities for consumer code
- Migration guides between framework versions
- Glossary

### Side artifacts

- `extraction-status.md` — inventory checklist
- `CHANGE-TRACKER.md` — Parts Affected = A / B / Both

## Hand-off contract

`build-knowledge-base` consumes:
- Part B path
- Repo-slug
- `last_verified_against_commit` SHA
