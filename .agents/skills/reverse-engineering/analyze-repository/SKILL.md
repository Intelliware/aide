---
name: analyze-repository
description: "Use when the user points at a code repository and asks what kind of project it is, which reverse-engineering skill to apply, how to document it, or when they describe a monorepo / hybrid / multi-project codebase without specifying the type. The diagnostic step between having code and knowing which reverse-engineer-* skill to invoke."
---

# Analyze Repository

Diagnostic skill that scans a repository, classifies it into one of the seven reverse-engineering domain types, handles monorepos and hybrid repos, and recommends the next skill by name.

## Overview

Users rarely categorize their repos as "API" or "UI framework" — they say "document this thing" or "what is this monorepo." This skill performs the structural scan, applies the classification rules, and returns the exact next-skill invocation phrase. It is the entry point for the reverse-engineering stage in brownfield mode.

## When to use

- User points at a repository and asks "what is this" / "what kind of project is this" / "how should I document this"
- User says "I have this repo, can you document it?" without specifying type
- User mentions a monorepo, multi-project repo, or hybrid (API + DB migrations, web app + API)
- User says "I'm not sure if this is a framework or an application"

## When NOT to use

- User already knows the repo type and asks for `reverse-engineer-<type>` directly — invoke that skill
- The work is greenfield (no existing source) — use the requirements stage instead
- The repository is a knowledge base itself — that is `skills/knowledge-base/`, not RE

## Inputs

- Repository path (elicit from user if not in context)
- Optional: existing documentation that may exist at the path
- Optional: hint from user about repo's intended consumer (end users vs. other developers)

## Workflow

### Stage 1: Locate and Scan the Repository

Ask the user for the repository path (or identify from context). Then perform a structural scan:

**1a. Read the package/build file** — check in order, stop when found: `package.json` → Node/JS/TS; `pom.xml`/`build.gradle` → Java/Kotlin; `Podfile`/`Package.swift`/`*.podspec` → iOS; `build.gradle` with `com.android.*` → Android; `requirements.txt`/`setup.py`/`pyproject.toml` → Python; `go.mod` → Go; `Cargo.toml` → Rust; `*.csproj`/`*.sln` → .NET.

**1b. Read the directory structure** — `ls -la` plus one level deep. Key signals: `src/routes/` + `src/controllers/` → API; `src/components/` + `public/index.html` → web app; `src/lib/` + published package → UI framework; `migrations/` + `*.sql` → database; `app/src/main/java/` + `AndroidManifest.xml` → Android; `*.xcodeproj` + `Info.plist` → iOS; `android/` + `ios/` + `App.tsx` → React Native; multiple `apps/` or `packages/` → monorepo.

**1c. Check telltale dependencies** — read the dependency manifest and look for framework signals: `express`/`fastify`/`nestjs`/`spring-boot`/`flask`/`django` → API; `react`/`angular`/`vue`/`svelte` (in app context) → web app; same in library context with `peerDependencies` → UI framework; `react-native` → RN app or library; `sequelize`/`typeorm`/`prisma`/`flyway` → database-related; `retrofit`/`okhttp`/`alamofire` → mobile app.

**1d. Check for existing documentation** — look for `docs/`, README.md, OpenAPI specs, JSDoc/Javadoc. Reveals what exists and what's missing.

### Stage 2: Classify the Repository

Apply the classification table. The seven types are:

| Type | Key Distinguisher | Skill to Invoke |
| --- | --- | --- |
| API Repository | Exposes HTTP endpoints for external consumers | `reverse-engineer-api` |
| Web Application | Serves a UI to end users via a browser | `reverse-engineer-web-app` |
| UI Framework / Component Library | Publishes reusable UI components | `reverse-engineer-ui-framework` |
| API Framework / Backend Library | Publishes reusable backend components | `reverse-engineer-api-framework` |
| Database Repository | Contains DDL, migrations, stored procedures | `reverse-engineer-database` |
| Mobile Application | Android / iOS / React Native end-user app | `reverse-engineer-mobile-app` |
| Mobile Framework / Library | Publishes reusable mobile components | `reverse-engineer-mobile-framework` |

**The application-vs-framework distinction** — most common ambiguity. Ask: who consumes this code? End users → application; other developers as a dependency → framework/library. Concrete signals: presence of `peerDependencies` (framework), `main`/`exports` field without a `start` script (framework), being listed as a dependency in other repos (framework), having its own deployment pipeline (application).

### Stage 3: Handle Special Cases

**Monorepos** — If repo contains multiple projects (`apps/`, `packages/`):
1. List each sub-project
2. Classify each independently
3. Recommend an order: frameworks/libraries first (they're dependencies), then apps, then knowledge-base aggregation
4. Note shared dependencies between sub-projects

**Hybrid repos** — common patterns:
- API + DB migrations → primary `reverse-engineer-api`, secondary `reverse-engineer-database`
- Web app that also serves an API for its frontend → `reverse-engineer-web-app`; if external consumers exist, add `reverse-engineer-api`
- Mobile app with shared library → if extracted as own package, treat separately; if internal, one `reverse-engineer-mobile-app` effort

**Already-documented repos** — note what exists, recommend the appropriate RE skill anyway (existing docs become input to verify against, not a replacement). Suggest a gap analysis first.

### Stage 4: Present Recommendation

Produce a structured analysis covering: repository path, primary language, framework/stack, version, classification table (one row per detected component), recommended approach (ordered list of skill invocations), existing documentation assessment. See `references/EXAMPLE.md` for the full output format.

### Stage 5: Hand Off

Tell the user the exact phrase to use to invoke the first recommended skill. Recommendations are dynamic — based on classification, you hand off by name to one of:

- `reverse-engineer-api`
- `reverse-engineer-api-framework`
- `reverse-engineer-web-app`
- `reverse-engineer-ui-framework`
- `reverse-engineer-database`
- `reverse-engineer-mobile-app`
- `reverse-engineer-mobile-framework`

After the recommended RE skill(s) complete, the user proceeds to `build-knowledge-base` to aggregate Part B docs into the knowledge base.

## Output

A repository analysis document containing:
- Identified repo type(s) and primary classification
- Recommended skill invocation order (with reasons)
- Existing-documentation assessment
- Exact trigger phrase for the next skill

## Next skill

Dynamic — depends on classification:
- Single-type repos → the matching `reverse-engineer-<type>` skill
- Monorepos → first the framework/library RE skill, then app RE skills, then `build-knowledge-base`
- Hybrid repos → primary RE skill first, then secondary RE skill(s)

After all RE work completes: `build-knowledge-base` (aggregates Part B docs into the central KB).

## Common mistakes

- Recommending an RE skill without first reading the package file and dir structure — guessing leads to wrong classification
- Treating a monorepo as a single repo — each sub-project must be classified independently
- Ignoring the application-vs-framework distinction and defaulting to "application" — check `peerDependencies`, `main`/`exports`, and consumer questions
- Skipping existing-documentation assessment — pre-existing OpenAPI/Javadoc affects the workflow
- Forgetting to emit the exact next-skill trigger phrase — handoff must be unambiguous
