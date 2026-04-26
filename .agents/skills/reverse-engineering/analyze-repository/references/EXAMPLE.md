# analyze-repository — Worked Example

## Scenario

A user types: *"I have this repo at `~/code/orderhub-backend`. Can you figure out what's in there and tell me how to document it?"*

## Stage 1 — Locate and Scan

The skill reads the package file and structure:

```
$ ls ~/code/orderhub-backend
README.md       package.json    src/            tsconfig.json
nest-cli.json   migrations/     test/           Dockerfile

$ cat package.json | head -30
{
  "name": "@orderhub/backend",
  "version": "2.4.1",
  "scripts": { "start": "nest start", ... },
  "dependencies": {
    "@nestjs/core": "^10.3.0",
    "@nestjs/common": "^10.3.0",
    "typeorm": "^0.3.17",
    "pg": "^8.11.3"
  }
}
```

Signals detected:
- `package.json` → Node/TypeScript
- `@nestjs/*` deps → NestJS-based API framework usage
- `nest-cli.json` + `src/` → NestJS application layout (controllers, services, modules)
- `typeorm` + `migrations/` + `pg` → relational persistence with migrations
- `"start": "nest start"` → application, not a published library
- No `peerDependencies`, no `main`/`exports` field → not a framework
- README mentions "REST API for the OrderHub product"

## Stage 2 — Classify

Primary classification: **API Repository** (matches `reverse-engineer-api`).

Secondary classification: the `migrations/` folder contains 47 migration files and 12 stored procedures — this is non-trivial database content. Flag for a follow-up `reverse-engineer-database` pass.

Application-vs-framework check: the repo has its own `start` script, no `main`/`exports`, and no `peerDependencies`. It is consumed by end users via HTTP, not by other developers as a dependency. → **application**.

## Stage 3 — Special Cases

- Not a monorepo (no `apps/` or `packages/` directories at root).
- Hybrid (API + DB migrations) — flagged above.
- Existing documentation: README is high-level, no OpenAPI spec, no JSDoc — minimal pre-existing docs.

## Stage 4 — Recommendation Output

```
## Repository Analysis: orderhub-backend

**Repository Path:** ~/code/orderhub-backend
**Primary Language:** TypeScript (Node.js)
**Framework / Stack:** NestJS 10.3, TypeORM, PostgreSQL
**Version:** 2.4.1

### Classification

| Component | Type | Skill | Priority |
| --- | --- | --- | --- |
| HTTP API surface (controllers, services, DTOs) | API Repository | reverse-engineer-api | 1 |
| Migrations + stored procedures (47 + 12 files) | Database Repository | reverse-engineer-database | 2 |

### Recommended Approach

1. Start with `reverse-engineer-api` because the API surface is the primary consumer-facing artifact and most of the request pipeline lives there.
2. Then run `reverse-engineer-database` as a secondary pass because the stored-procedure logic is non-trivial and Part A of the API alone won't capture it.
3. Finally, feed both Part B outputs into `build-knowledge-base` to aggregate into the central KB.

### Existing Documentation

- README.md exists but is high-level (deployment instructions only).
- No OpenAPI spec was found.
- No JSDoc / TSDoc comments in source.
- Recommendation: no pre-existing docs to verify against; the RE pass will produce the first comprehensive set.

### To begin, say:

> "I need to reverse engineer the documentation for my API repository at ~/code/orderhub-backend."
```

## Stage 5 — Hand Off

The user copies the trigger phrase, which invokes `reverse-engineer-api`. After that skill completes, the hand-off chain continues:

1. `reverse-engineer-api` produces Part A (in-repo) + Part B1 (OpenAPI) + Part B2 (companion guide).
2. User runs `reverse-engineer-database` as the secondary pass.
3. User runs `build-knowledge-base` to aggregate Part B artifacts into the KB.

## Variant — Monorepo Example

If `~/code/orderhub-platform` had this layout:

```
apps/
  api/             ← NestJS API
  web/             ← Next.js front-end
  mobile/          ← React Native app
packages/
  shared-ui/       ← React component library
  shared-types/    ← TypeScript types
```

The recommendation would list five components with priority order:

1. `shared-types` → no RE skill (just a types package, KB-only)
2. `shared-ui` → `reverse-engineer-ui-framework` (frameworks first)
3. `api` → `reverse-engineer-api`
4. `web` → `reverse-engineer-web-app`
5. `mobile` → `reverse-engineer-mobile-app`

Then `build-knowledge-base` aggregates all five.

## Variant — Already-Documented Repo

If the API repo already shipped a published OpenAPI spec at `openapi.yaml`, the analysis flags it under "Existing Documentation":

> *Existing OpenAPI 3.0 spec found at openapi.yaml. Likely partial coverage — does not include workflow examples or error-handling narratives. Recommendation: run `reverse-engineer-api` anyway; treat the existing spec as input to verify against, not as a replacement. Begin with a gap analysis: which paths in the spec lack request/response examples?*
