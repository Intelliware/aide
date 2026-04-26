# reverse-engineer-api — Inputs and Outputs

## Inputs

### Required

- **Repository path** — absolute path to the API repository's root.
- **Source version** — the version of the source system being documented (typically taken from `package.json`, `pom.xml`, or git tag).

### Optional

- Existing OpenAPI spec at the repo (treat as input to verify against, not as a replacement for source-code-driven extraction)
- Existing READMEs, ADRs, or in-source documentation
- Test files (reveal expected behavior)

### Elicitation

Reference: `references/elicitation-patterns/repo-scope-discovery.md`. Used to confirm:
- Repository path and version
- Whether persistence is in-scope (drives `has_persistence` decision gate in the YAML composition)
- Whether an existing OpenAPI contract exists (drives `has_openapi_contract` decision gate)
- Scope exclusions (deprecated v1, third-party vendored code, internal-only endpoints not in scope)
- Authentication model (Bearer JWT? OAuth2? API key? mTLS?)
- Whether SDK/client libraries are produced from the spec

### Project.toml driving values

This skill consults `[[project.repos]]` entries with `role = "api"`:

```toml
[[project.repos]]
code = "orderhub-api"
name = "OrderHub Backend API"
path = "../orderhub-backend"
role = "api"
type = "node-typescript-nest"
primary = true
```

Per-repo elicitation answers (e.g. `has_persistence`, `has_openapi_contract`) live under `[project.elicitation]` keyed by repo code in the per-skill customization layer.

## Outputs

### Part A — Internal documentation (stays in source repo)

Default location: `<repo>/docs/api-internal/` containing one file per Part A section. Section coverage is driven by the `re-api-internal.yaml` composition; the block set covers:

- API overview
- Environment and configuration
- Mapping OpenAPI contract ↔ internal implementation (gated on `has_openapi_contract`)
- Layered architecture
- Project structure and conventions
- Dependency injection and service registration
- Middleware and request pipeline
- Authentication and authorization internals
- Request validation and transformation
- Error handling and problem details
- Service layer patterns
- Domain models and business rules
- Cross-cutting concerns
- Database and ORM (gated on `has_persistence`)
- Repository / data-access patterns (gated on `has_persistence`)
- Migrations and schema management (gated on `has_persistence`)

### Part B1 — OpenAPI specification

Location: `{paths.knowledge_base_path}/source-docs/<repo-slug>/openapi.yaml`. Must:

- Conform to OpenAPI 3.x
- Pass a linter (e.g. spectral) without errors
- Cover every endpoint in the source codebase
- Include shared schemas, security schemes, and server definitions

### Part B2 — Companion guide

Location: `{paths.knowledge_base_path}/source-docs/<repo-slug>/api-consumer-guide.md`. Driven by the `re-api-consumer.yaml` composition (currently a stub — block set TBD). Expected sections:

- API overview and base URLs
- Environments and credentials
- Authentication and authorization
- Request/response conventions
- Endpoints by capability
- Error handling and retry
- Rate limits and throttling
- Pagination, filtering, sorting
- Webhooks and callbacks
- SDKs and client libraries
- Common recipes
- Anti-patterns
- Changelog and deprecations
- Glossary
- Quick-reference cheat sheet

### Side artifacts

- `<repo>/docs/api-internal/extraction-status.md` — inventory checklist with completion/verification status
- `<repo>/docs/api-internal/CHANGE-TRACKER.md` — change log with Parts Affected = A / B1 / B2 / All

## Hand-off contract

The `build-knowledge-base` skill consumes:
- Part B1 path (OpenAPI spec)
- Part B2 path (companion guide)
- Repo-slug for indexing under `components/<repo-slug>/`
- The `last_verified_against_commit` SHA from CHANGE-TRACKER.md

Part A is intentionally NOT consumed by the KB — it stays internal to the source repo.
