---
name: analyze-repository
description: >
  Analyze an existing code repository to determine what type(s) it contains and which reverse engineering
  skill(s) to apply. Use this skill whenever the user points at a repository and asks "what is this",
  "how should I document this", "analyze this repo", "what kind of project is this", "which documentation
  strategy should I use", or when they have a codebase but aren't sure which reverse engineering approach
  fits. Also trigger when the user mentions a monorepo, multi-project repo, or says something like
  "I have this codebase and I need to document it" without specifying the type. This is the diagnostic
  step between having code and knowing which skill to invoke.
---

# Analyze Repository

You are helping a user understand what kind of repository they have and which reverse engineering
skill(s) to use for documenting it. This is the diagnostic bridge between "I have code" and "I know
which documentation process to follow."

## When This Skill Is Needed

Users often don't neatly categorize their repos as "API" or "UI framework." They say things like:
- "I have this repo, can you document it?"
- "This is our main backend — figure out what's in there"
- "We have a monorepo with a bunch of stuff"
- "I'm not sure if this is a framework or an application"

Your job is to inspect the repo and make that determination for them.

## Step 1: Locate and Scan the Repository

Ask the user for the repository path (or identify it from context). Then perform a structural scan:

### 1a. Read the Package/Build File

Look for these files (check in order, stop when found):

| File | What It Reveals |
| --- | --- |
| `package.json` | Node/JS/TS project — name, dependencies, scripts reveal purpose |
| `pom.xml` / `build.gradle` / `build.gradle.kts` | Java/Kotlin project — packaging type, dependencies |
| `Podfile` / `Package.swift` / `.podspec` | iOS project or framework |
| `build.gradle` (with `com.android.*` plugins) | Android project or library |
| `requirements.txt` / `setup.py` / `pyproject.toml` | Python project |
| `go.mod` | Go project |
| `Cargo.toml` | Rust project |
| `*.csproj` / `*.sln` | .NET project |

### 1b. Read the Directory Structure

List the top-level directory structure (`ls -la` and one level deep). Key signals:

| Pattern | Likely Type |
| --- | --- |
| `src/routes/`, `src/controllers/`, `src/services/`, `src/middleware/` | API repository |
| `src/components/`, `src/pages/`, `src/views/`, `public/index.html` | Web application |
| `src/lib/`, `projects/components/`, published package name | UI framework / component library |
| `migrations/`, `stored-procedures/`, `schemas/`, `*.sql` | Database repository |
| `app/src/main/java/`, `AndroidManifest.xml` | Android application |
| `*.xcodeproj`, `AppDelegate.swift`, `Info.plist` | iOS application |
| `android/`, `ios/`, `App.tsx` or `App.js` | React Native application |
| `src/lib/` + `package.json` with `"main"` or `"exports"` | Framework/library (any platform) |
| Multiple `apps/` or `packages/` directories | Monorepo — analyze each sub-project |

### 1c. Check for Telltale Dependencies

Read the dependency file and look for signals:

| Dependency | Signal |
| --- | --- |
| `express`, `fastify`, `nestjs`, `spring-boot`, `flask`, `django` | API / backend application |
| `react`, `angular`, `vue`, `svelte` (in app context) | Web application |
| `react`, `angular`, `vue` (in library context with `peerDependencies`) | UI framework |
| `react-native` | React Native app or library |
| `sequelize`, `typeorm`, `prisma`, `knex`, `flyway` | Database-related (may be embedded in API repo) |
| `retrofit`, `okhttp`, `alamofire`, `urlsession` | Mobile app (consuming APIs) |

### 1d. Check for Existing Documentation

Look for `docs/`, `README.md`, existing OpenAPI specs, Swagger annotations, or JSDoc/Javadoc. This
reveals both what exists and what's missing.

## Step 2: Classify the Repository

Based on your scan, classify into one or more of these types:

| Type | Key Distinguisher | Skill to Use |
| --- | --- | --- |
| **API Repository** | Exposes HTTP endpoints for external consumers | `reverse-engineer-api` |
| **Web Application** | Serves a UI to end users via a browser | `reverse-engineer-web-app` |
| **UI Framework / Component Library** | Publishes reusable UI components consumed by other apps | `reverse-engineer-ui-framework` |
| **API Framework / Backend Library** | Publishes reusable backend components (middleware, auth, etc.) | `reverse-engineer-api-framework` |
| **Database Repository** | Contains DDL, migrations, stored procedures, schema definitions | `reverse-engineer-database` |
| **Mobile Application (Android)** | Android app targeting end users | `reverse-engineer-mobile-app` |
| **Mobile Application (iOS)** | iOS app targeting end users | `reverse-engineer-mobile-app` |
| **Mobile Application (React Native)** | Cross-platform mobile app | `reverse-engineer-mobile-app` |
| **Mobile Framework / Library** | Publishes reusable mobile components (AAR, Pod, npm) | `reverse-engineer-mobile-framework` |

### The Application vs. Framework Distinction

This is the most common ambiguity. The key question is: **who consumes this code?**

- If **end users** consume it through a UI or API → it's an **application** (web app, API, mobile app)
- If **other developers** consume it as a dependency in their own projects → it's a **framework/library**

Concrete signals:

| Signal | Application | Framework/Library |
| --- | --- | --- |
| Has its own deployment pipeline | Yes | Maybe (publish pipeline instead) |
| Listed as a dependency in other projects | No | Yes |
| Has `peerDependencies` in package.json | Rare | Common |
| Has a `"main"` or `"exports"` field | No (uses `"start"`) | Yes |
| Has route definitions / controllers | Yes | Provides base classes for them |
| Has database connections | Yes | Provides abstractions for them |

## Step 3: Handle Special Cases

### Monorepos

If the repo contains multiple projects (e.g., `apps/api/`, `apps/web/`, `packages/shared-ui/`):

1. List each sub-project
2. Classify each independently
3. Recommend an order: typically frameworks/libraries first (they're dependencies), then apps, then
   the knowledge repository to tie everything together
4. Note shared dependencies between sub-projects

### Hybrid Repos

Some repos blur the lines:

- **API + Database migrations** — Common. Recommend `reverse-engineer-api` as the primary skill, but
  also note the database components. If the migrations are complex (many tables, stored procedures),
  recommend `reverse-engineer-database` as a secondary pass.
- **Web app that also serves an API** — If the API is primarily for the app's own frontend, treat as
  `reverse-engineer-web-app`. If external consumers also use the API, add `reverse-engineer-api`.
- **Mobile app with a shared library** — If the library is extracted into its own package, treat
  separately. If it's internal to the app, treat as one `reverse-engineer-mobile-app` effort.

### Already-Documented Repos

If documentation already exists (e.g., existing OpenAPI spec, README, Javadoc):

1. Note what exists and its likely quality
2. Recommend the appropriate RE skill anyway — existing docs become input to verify against,
   not a replacement for source-code-driven extraction
3. Suggest starting with a gap analysis: what does the existing documentation cover vs. what the
   template expects?

## Step 4: Present Recommendation

Format your recommendation clearly:

```
## Repository Analysis: [Repo Name]

**Repository Path:** [path]
**Primary Language:** [language]
**Framework/Stack:** [what you found]
**Version:** [from package/build file]

### Classification

| Component | Type | Skill | Priority |
| --- | --- | --- | --- |
| [component] | [type] | [skill name] | [1/2/3] |

### Recommended Approach

1. Start with [skill] because [reason]
2. Then [skill] because [reason]
3. Finally, feed Part B docs into `build-knowledge-repository`

### Existing Documentation

- [what exists and its quality assessment]

### To begin, say:

> "[exact trigger phrase for the first skill to invoke]"
```

## Step 5: Hand Off

Once the user understands the recommendation, tell them the exact phrase to use to invoke the
first skill. For example:

> "Your repo is an API built on NestJS with database migrations. I'd start with `reverse-engineer-api`
> — just say: *'I need to reverse engineer the documentation for my API repository.'*
> After that, we can do a secondary pass on the database with `reverse-engineer-database`."
