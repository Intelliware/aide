# reverse-engineer-ui-framework — Inputs and Outputs

## Inputs

### Required

- **Repository path** — absolute path to the framework repository's root.
- **Source version** — taken from `package.json` or git tag.

### Optional

- Existing implementer documentation, Storybook stories, design tokens
- Sample apps that use the framework (reveal expected composition)

### Elicitation

Reference: `references/elicitation-patterns/repo-scope-discovery.md`. Used to confirm:
- Repository path and version
- Host framework (Angular / React / Vue / Web Components / standalone)
- Distribution mechanism (npm package, monorepo workspace, internal registry)
- Public API surface (which exports are stable?)
- Theming approach (CSS custom properties, theme service, runtime tokens, etc.)
- Whether the framework ships testing utilities for consumers
- Scope exclusions (deprecated v1 components, internal utilities)

### Project.toml driving values

```toml
[[project.repos]]
code = "orderhub-ui-fw"
name = "OrderHub Design System"
path = "../orderhub-ds"
role = "framework"
type = "angular-typescript"
```

## Outputs

### Part A — Internal documentation (stays in source repo)

Default location: `<repo>/docs/ui-framework-internal/` driven by `re-ui-framework-internal.yaml`. Coverage:

- Framework overview and philosophy
- Architecture (host framework, module boundaries, internal layering)
- Build / publish pipeline
- Theming internals (token resolution, theme inheritance, CSS-var mapping)
- Internal utility components and helpers
- Versioning and breaking-change policy

### Part B — Implementer documentation

Location: `{paths.knowledge_base_path}/source-docs/<repo-slug>/ui-framework-consumer.md` driven by `re-ui-framework-consumer.yaml`. Coverage:

- Getting started (install, theme provider setup)
- Component reference (one section per component) with inputs/outputs/props/slots/methods, defaults, examples
- Service reference (theme, notifications, dialogs, etc.)
- Directive and pipe reference
- DI token reference
- Design tokens reference
- Theming guide for consumers
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
- Cross-references to web/mobile apps that consume the framework (for KB dependency edges)
