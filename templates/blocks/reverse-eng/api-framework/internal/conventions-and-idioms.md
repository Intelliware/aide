---
slug: conventions-and-idioms
title: "Conventions and Idioms"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 320
---

## 22. Conventions and Idioms

Capture the project-specific coding standards, naming rules, and recurring patterns that contributors are expected to follow. The aim is to let a new contributor (or AI assistant) write code that visually and structurally matches existing code on the first try. Verify by sampling several recent merged PRs and confirming the conventions match what was actually accepted in review.

Distinguish between mechanical conventions (linted, auto-fixable) and judgment conventions (taste, reviewer-enforced). For the latter, give concrete examples — abstract guidelines like "be consistent" don't help. Cross-link to the lint config so contributors can see the source of truth for the mechanical rules.

### Suggested template content

**Mechanical conventions (lint-enforced):**

- Formatter: {{tool — e.g. Prettier, gofmt, ktlint}}.
- Linter: {{tool — e.g. ESLint, ruff, golangci-lint}}.
- Lint config: `{{path}}`.
- Pre-commit: {{tool}}.
- CI gate: lint + typecheck + format-check on every PR.

**Naming:**

| Artifact | Convention | Example |
|---|---|---|
| Source files | `kebab-case.ts` | `error-renderer.ts` |
| Public exports | `PascalCase` for types, `camelCase` for fns | `class HttpError`, `function compose()` |
| Internal helpers | `camelCase` with `_` prefix discouraged | `function buildPipeline()` |
| Constants | `SCREAMING_SNAKE_CASE` | `DEFAULT_BODY_LIMIT` |
| Test files | `<source>.test.ts` next to source | `router.test.ts` |
| Type-only files | `<name>.types.ts` | `request.types.ts` |
| Tokens (DI) | `PascalCase` ending in `Token` | `LoggerToken` |

**File / module structure:**

- One subsystem per directory; one canonical `index.ts` per directory.
- `_internal/` for non-exported helpers; never re-exported.
- Tests colocated with source under the same directory.
- Benchmarks in `benchmarks/` at repo root.

**Imports:**

- Use the package alias (`@framework/core`) inside the monorepo, not deep relative imports.
- Within a subsystem, relative imports are fine.
- Forbidden: cross-subsystem deep imports (`../../router/internal/...`); use the subsystem's index.
- Lint rule {{rule-name}} enforces these.

**Error handling idioms:**

- Always throw `Error` subclasses; never strings or numbers.
- Inside core, prefer typed framework errors (`HttpError`, `InternalError`).
- Result types vs. exceptions: {{policy — e.g. "exceptions for unexpected, results for routine validation"}}.
- Catch-and-rethrow only with `cause:` chaining: `throw new InternalError({ cause: err })`.

**Async idioms:**

- All public APIs that may do I/O return `Promise`s.
- Top-level `await` allowed in scripts and tests; not in library code.
- Use `AbortSignal` for cancellation; thread through `ctx.signal`.
- Prefer `Promise.allSettled` over `Promise.all` when partial failure is meaningful.

**Logging idioms:**

- Always use `ctx.logger` inside requests; module logger only for module-scope events.
- Structured fields, no string interpolation: `logger.info("request done", { route, duration_ms })`.
- Levels: warn for 4xx, error for 5xx, info for lifecycle, debug for dev-only.
- See logging-architecture block.

**DI idioms:**

- Inject dependencies via the container; never `new` a service inside another.
- Singletons hold no per-request state; request-scoped services own per-request state.
- See dependency-injection block.

**Testing idioms:**

- Integration tests over unit tests for public behavior.
- One assertion focus per test; helpers for setup, not for assertions.
- Use the test client (`app.inject`); never start a real server in unit/integration tests.
- See testing-harness block.

**Comments:**

- TSDoc / JSDoc on every public export.
- `@internal` tag on anything not part of the public surface.
- Avoid comments that restate the code; comment the *why*.

**Pull-request expectations:**

- Linked changelog fragment (mandatory for non-internal changes).
- One concern per PR; refactor + behavior change in separate PRs.
- New public API requires a doc update + an API-report change explanation.
- Tests cover both the happy path and at least one error path.

**Common pitfalls:**

- Adding deep imports to "fix a circular dependency" — paper over the design issue; raise it in review instead.
- Throwing strings — bypasses the error pipeline's stack capture.
- Using `console.*` — banned by lint rule.
- Module-scope side effects (network, disk, time) — break tests and tree shaking.

**Cross-references:**

- See source-layout block for the directory boundaries these conventions live within.
- See plugin-extension-system block for plugin author conventions.
- See testing-harness block for the recommended test patterns.
