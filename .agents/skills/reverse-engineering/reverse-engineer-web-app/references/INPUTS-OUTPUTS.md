# reverse-engineer-web-app — Inputs and Outputs

## Inputs

### Required

- **Repository path** — absolute path to the web app's root.
- **Source version** — taken from `package.json` or git tag.

### Optional

- Existing app documentation, deployment runbooks
- Storybook stories (reveal component APIs)
- E2E tests (reveal real user flows)

### Elicitation

Reference: `references/elicitation-patterns/repo-scope-discovery.md`. Used to confirm:
- Repository path and version
- Framework (React/Angular/Vue/Svelte/etc.) and rendering mode (SPA, SSR, SSG, hybrid)
- Routing library and state-management approach
- API integration pattern (REST/GraphQL/tRPC)
- Authentication model (cookie, JWT, OAuth, SSO)
- Deployment target (S3+CDN, Vercel, Netlify, container, etc.)
- Scope exclusions (legacy v1 routes, planned features not yet built)

### Project.toml driving values

```toml
[[project.repos]]
code = "orderhub-web"
name = "OrderHub Web Portal"
path = "../orderhub-web"
role = "ui"
type = "react-vite"
```

## Outputs

### Part A — Internal documentation (stays in source repo)

Default location: `<repo>/docs/web-app-internal/` driven by `re-web-app-internal.yaml`. Coverage:

- App overview and purpose
- Architecture (rendering mode, framework choice, project structure)
- Routing (route map, guards, code splitting)
- State management (slices/stores/services, persistence)
- Component model (presentational vs container, composition patterns)
- API integration layer
- Authentication and authorization
- Styling system (CSS-in-JS / SCSS / utility classes / design tokens)
- Build tooling and bundling
- Performance (lazy loading, prefetch, perf budgets)
- Internationalization
- Accessibility
- Security (CSP, XSS protections, secret handling)
- Testing strategy
- Deployment shape

### Part B — Overview & integration guide

Location: `{paths.knowledge_base_path}/source-docs/<repo-slug>/web-app-consumer.md` driven by `re-web-app-consumer.yaml`. Coverage:

- App purpose and key features
- APIs consumed (which backends? which versions?)
- Authentication / SSO integration points
- Deployment and environments
- Team ownership and contact
- Quick-reference link to Part A for contributors

### Side artifacts

- `extraction-status.md` — inventory checklist
- `CHANGE-TRACKER.md` — Parts Affected = A / B / Both

## Hand-off contract

`build-knowledge-base` consumes:
- Part B path
- Repo-slug
- `last_verified_against_commit` SHA
- Cross-references to APIs consumed (so the KB can build dependency edges to the corresponding RE'd API repos)
