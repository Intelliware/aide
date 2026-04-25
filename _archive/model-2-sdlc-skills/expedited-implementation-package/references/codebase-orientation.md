# Codebase Orientation

## Purpose

Lightweight, scoped read of the codebase areas affected by the change — not a full codebase audit. Reads the specific files that will be modified, identifies the patterns and conventions in those files (naming, error handling, state management, API layer, test approach), notes the test files that correspond to the affected source files, and checks for an existing project context document (if one exists from a prior full pipeline run, reuse it rather than regenerating). The goal is to understand enough about the affected area to produce an implementation plan that is idiomatic within the existing codebase — new code should look like it belongs, not like an alien graft. Includes an escape hatch: if orientation reveals the change touches more than ~5-7 files, crosses module or layer boundaries, requires new data models or API endpoint design, or has complex interdependencies that need architectural analysis, the agent stops and recommends switching to the full implementation package. The escape hatch prevents the expedited flow from being used for changes that are too large or too risky for lightweight planning. Output is written to `docs/<feature>/implementation-package/codebase-orientation.md` using the template at `../assets/codebase-orientation.md`. Persisting the orientation as a file ensures that AI sessions can be stopped and resumed without re-reading the codebase.

## What This Produces

A `docs/<feature>/implementation-package/codebase-orientation.md` file — a lightweight, persisted understanding of the affected code area that grounds the implementation plan in codebase reality. Writing this to disk means AI sessions can be stopped and restarted without re-reading the codebase; the planning skill reads the file rather than reconstructing context from conversation history.

The orientation produces:
- Technology versions extracted from build configuration files
- Applicable coding standards scoped to the project's stack
- Patterns and conventions in the affected files
- Standards compliance snapshot — which patterns to follow vs. override
- Test file locations, framework, versions, and test infrastructure
- An escape hatch evaluation (is this change too large for the expedited flow?)

## When to Use

- Second step of the expedited workflow — after the change spec is agreed
- Before producing the implementation plan
- Not a full codebase audit — only the files listed in the change spec's "Where" section

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Change spec | From Step 1 (change-spec) — what, where, why, ACs, delta | Yes |
| Codebase | Local filesystem — the actual source code | Yes |
| Coding standards | `../assets/standards/` — common, language, framework, and platform standards | Yes — scoped to the project's stack |
| Existing project context | `project-context.md` from a prior full pipeline run (if one exists) | No — reuse if available |

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  CODEBASE ORIENTATION — LIGHTWEIGHT SEQUENCE                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. EXTRACT VERSIONS ────► Technology + testing stack versions    │
│     Read build/config files to determine language, framework,    │
│     and testing tool versions. Filter version-gated standards.   │
│                                                                  │
│  2. LOAD STANDARDS ──────► Applicable coding standards           │
│     Read only the standards that match the project's stack.      │
│     Skip standards for technologies not in use.                  │
│                                                                  │
│  3. READ AFFECTED FILES ─► File-level understanding              │
│     Read each file in the change spec's "Where" list.            │
│     Note patterns, conventions, imports, structure.              │
│                                                                  │
│  4. COMPARE TO STANDARDS ► Compliance snapshot                   │
│     Compare observed patterns against loaded standards.          │
│     Determine what new code should follow.                       │
│                                                                  │
│  5. MAP TEST FILES ──────► Test infrastructure for affected area │
│     Locate test files, note framework + API, mocking approach.   │
│                                                                  │
│  6. CHECK FOR CONTEXT ───► Existing project context doc          │
│     If project-context.md exists, reuse it.                      │
│                                                                  │
│  7. ESCAPE HATCH ────────► Evaluate scope for expedited flow     │
│     Too many files? Cross-module? New data models?               │
│     If yes → recommend full pipeline and stop.                   │
│                                                                  │
│  8. WRITE + PRESENT ──────► docs/<feature>/implementation-package/                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Extract Technology and Testing Stack Versions

Read the project's build configuration files to determine the exact language, framework, and testing tool versions in use. These versions determine which standard rules apply and which test APIs the test-creator skills should use.

**Where to find versions:**

| Technology | Version Source | What to Extract |
|---|---|---|
| **Java** | `pom.xml` (`<maven.compiler.source>`), `build.gradle(.kts)` (`java.sourceCompatibility` or `jvmToolchain`) | Java version (e.g., 17, 21) |
| **TypeScript** | `tsconfig.json` (`compilerOptions.target`), `package.json` (`devDependencies.typescript`) | TypeScript version (e.g., 5.2, 5.4) |
| **Kotlin** | `build.gradle.kts` (`kotlin("jvm")` plugin version), `gradle.properties` (`kotlin.version`) | Kotlin version (e.g., 1.9, 2.0) |
| **Swift** | `Package.swift` (`swift-tools-version`), Xcode project build settings (`SWIFT_VERSION`) | Swift version (e.g., 5.9, 6.0) |
| **iOS / Android deployment** | `Info.plist` or Xcode project (`IPHONEOS_DEPLOYMENT_TARGET`), `build.gradle` (`minSdk`, `targetSdk`) | Minimum deployment target (e.g., iOS 16, Android API 28) |
| **Spring Boot** | `pom.xml` (`spring-boot-starter-parent` version), `build.gradle` (`springBoot` plugin) | Spring Boot version (e.g., 3.2, 3.3) |
| **React / Next.js** | `package.json` (`dependencies.react`, `dependencies.next`) | Framework version (e.g., React 18, Next.js 14) |
| **Angular** | `package.json` (`dependencies.@angular/core`) | Angular version (e.g., 17, 18) |
| **NestJS** | `package.json` (`dependencies.@nestjs/core`) | NestJS version (e.g., 10, 11) |
| **Node.js** | `.nvmrc`, `.node-version`, `package.json` (`engines.node`) | Node.js version (e.g., 18, 20, 22) |

**Testing stack versions (extract from the same build files):**

| Testing Tool | Version Source | What to Extract | Why It Matters |
|---|---|---|---|
| **JUnit** | `pom.xml` / `build.gradle` (`junit-jupiter` or `junit`) | JUnit 4 vs JUnit 5 (Jupiter) | Annotations differ (`@Test` import path, `@BeforeEach` vs `@Before`), assertion API differs |
| **Mockito** | `pom.xml` / `build.gradle` (`mockito-core`) | Mockito version (e.g., 4.x, 5.x) | Mockito 5+ requires Java 11+, changes default answer behavior |
| **Jest** | `package.json` (`devDependencies.jest`) | Jest version (e.g., 28, 29) | Config format, module mocking API, fake timers API change |
| **Vitest** | `package.json` (`devDependencies.vitest`) | Vitest version (e.g., 1.x, 2.x) | API compatibility, workspace support |
| **Testing Library** | `package.json` (`@testing-library/react`, `@testing-library/jest-dom`) | Testing Library version (e.g., RTL 14, 15, 16) | Query API changes, `render` behavior, `act` handling |
| **Playwright** | `package.json` (`@playwright/test`) | Playwright version | Locator API, auto-waiting behavior |
| **Cypress** | `package.json` (`cypress`) | Cypress version | Component testing support, query chaining |
| **XCTest / Swift Testing** | Xcode project, `Package.swift` | XCTest vs Swift Testing | Swift Testing (Swift 6+) uses `@Test` macro, `#expect` — entirely different API |
| **Kotest** | `build.gradle.kts` (`kotest-runner-junit5`) | Kotest version (e.g., 5.x) | DSL style, assertion library |
| **AssertJ** | `pom.xml` / `build.gradle` (`assertj-core`) | AssertJ version (e.g., 3.x) | Fluent assertion API |
| **Testcontainers** | `pom.xml` / `build.gradle` / `package.json` | Testcontainers version | Module availability |

**Record the extracted versions.** These versions determine:
1. **Which standard rules apply** — any rule tagged `Requires: Java 21+` is skipped for a Java 17 project
2. **Which test APIs to use** — JUnit 4 annotations vs JUnit 5, Jest vs Vitest APIs
3. **Whether the version is itself a concern** — flag end-of-life versions as a note

### Step 2 — Load Applicable Coding Standards

Read the coding standards that match the project's technology stack. Standards live in `../assets/standards/`.

**Standard hierarchy:**

| Level | Path | When to Load |
|-------|------|-------------|
| **Common** | `../assets/standards/common/` | Always — applies to all projects |
| **Common testing** | `../assets/standards/common/testing/` | Always — applies to all test code |
| **Language** | `../assets/standards/languages/{lang}/standards.md` | Match the project's language(s) |
| **Language testing** | `../assets/standards/languages/{lang}/testing.md` | Match the project's language(s) |
| **Framework** | `../assets/standards/frameworks/{framework}/standards.md` | Match the project's framework(s) |
| **Framework testing** | `../assets/standards/frameworks/{framework}/testing.md` | Match the project's framework(s) |
| **Platform** | `../assets/standards/platforms/{platform}/standards.md` | If iOS or Android project |
| **Platform testing** | `../assets/standards/platforms/{platform}/testing.md` | If iOS or Android project |

**Only load standards for technologies in the project's stack.** Do not load Java standards for a TypeScript project.

**Standards are the organizational gold standard.** When the codebase deviates from a standard, the standard wins for new code. Existing deviations are technical debt, not acceptable precedent.

**Filter version-gated rules.** Rules tagged with `Requires:` that exceed the project's actual version (from Step 1) are noted as not applicable.


### Step 2a — Project-Specific Standards and Version Compatibility

After loading built-in standards from `../assets/standards/`, ask the user:

> Do you have any project-specific or organization-specific coding standards beyond the bundled standards that I should apply? This could include team coding guidelines, review checklists, lint configs, formatter configs, or other local rules.

If the user provides additional standards, read them before planning and treat precedence as: project-specific standards > built-in language/framework/platform standards > built-in common standards. If project-specific standards conflict with built-in standards, present the conflict and ask which source takes precedence.

Compare the project's actual versions against each standards file's applicability baseline. If the project version is older than the standards baseline, warn the user that some rules may assume newer features and document the mismatch as a technical debt note if requested. Continue filtering all explicit `Requires:` rules so unavailable features are not enforced, such as Java records, virtual threads, sequenced collections, TypeScript `satisfies`, or newer testing framework APIs when the project version does not support them.

### Step 3 — Read the Affected Files

Read each file listed in the change spec's "Where" section. For each file:

| What to Extract | Why |
|----------------|-----|
| **File role** | Controller, service, model, component, utility, config, test |
| **Naming patterns** | How files, classes, functions, and variables are named |
| **Import style** | Framework imports → third-party → local → relative? |
| **Error handling** | How errors are thrown, caught, propagated |
| **DI / wiring** | Constructor injection, module registration, provider patterns |
| **State management** | If frontend: hooks, stores, context, signals |
| **API layer** | If controller/handler: route style, validation, response format |
| **Logging** | Which logger, what format, how it's injected |

**Ask for a reference file.** If the change adds new functionality similar to something that already exists:

> "Is there an existing [component/service/module] in this codebase that is a good example of how you'd like this to be structured? I'll use it as the primary pattern reference."

If the developer nominates one, read it and use its patterns as the baseline for new code — provided those patterns comply with coding standards (Step 4).

### Step 4 — Compare Observed Patterns to Standards

For each pattern extracted in Step 3, compare it against the applicable standard loaded in Step 2. Produce a lightweight compliance snapshot:

| Area | Observed Pattern | Standard | Compliant? | New Code Should |
|------|-----------------|----------|-----------|-----------------|
| *(Error handling)* | *(Typed exceptions via NestJS built-ins)* | *(`../assets/standards/common/error-handling.md`)* | **Yes** | Follow codebase pattern |
| *(Naming — files)* | *(kebab-case with role suffix)* | *(`../assets/standards/common/naming-conventions.md`)* | **Yes** | Follow codebase pattern |
| *(Logging)* | *(Mix of console.log and NestJS Logger)* | *(`../assets/standards/common/logging.md`)* | **No** | Follow standard — use NestJS Logger |

**Resolution logic:**
- **Codebase complies with standard** → follow codebase pattern (it's both correct and consistent)
- **Codebase deviates from standard** → follow the **standard** for new code; note the deviation

### Step 5 — Map Test Files

Locate and read the test files that correspond to the affected source files:

| What to Record | Why |
|---------------|-----|
| **Test file location convention** | Co-located (`*.spec.ts`) or separate (`__tests__/`, `tests/`) |
| **Test framework + version** | Jest 29, Vitest 2.x, JUnit 5, XCTest, Swift Testing, etc. (from Step 1) |
| **Assertion library + version** | jest-dom, AssertJ, Hamcrest, built-in, etc. (from Step 1) |
| **Mocking approach** | `jest.mock()`, Mockito, manual test doubles, DI-based |
| **Test naming pattern** | `should_do_x_when_y`, `it('does x when y')`, etc. |
| **Test organization** | `describe`/`it` blocks, nested suites, flat |
| **Fixture / setup pattern** | `beforeEach`, factory functions, fixture files |
| **Test runner command** | `npm test`, `./gradlew test`, `swift test`, `npx vitest` |
| **Build command** | `npm run build`, `./gradlew build`, `swift build` |
| **Lint command** | `npm run lint`, `./gradlew ktlintCheck`, `swiftlint` |

**Cross-reference testing stack versions from Step 1** with what test files actually import. If multiple test frameworks coexist (e.g., JUnit 4 and 5), note which is primary.

### Step 6 — Check for Existing Project Context

Look for a `project-context.md` from a prior full pipeline run. If one exists and is up to date, reuse it rather than regenerating. The project context document provides broader codebase conventions that supplement the orientation.

If no project context exists, the orientation's inline context serves the same purpose at a narrower scope.

### Step 7 — Escape Hatch Evaluation

Evaluate whether the change is appropriate for the expedited flow:

| Escape Hatch Trigger | Threshold | Recommendation |
|---------------------|-----------|----------------|
| File count | More than ~5–7 files affected | Full pipeline |
| Module boundaries | Change crosses module or layer boundaries | Full pipeline |
| New data models | Requires new database entities or schema changes | Full pipeline |
| New API endpoints | Requires designing new API contracts (not just modifying existing) | Full pipeline |
| Architectural decisions | Introduces new patterns, technology choices, or infrastructure | Full pipeline |
| Complex interdependencies | Affected files have deep dependency chains that need analysis | Full pipeline |

**If any trigger fires, stop and recommend the full pipeline:**

> "During orientation, I found that this change [specific trigger — e.g., 'touches 12 files across 3 modules']. This exceeds the scope of the expedited flow. I recommend switching to the full implementation package (`implementation-package/`) for proper discovery and planning. Want to proceed with the full pipeline?"

**If no triggers fire, proceed.**

### Step 8 — Write docs/<feature>/implementation-package/codebase-orientation.md and Present

Write `docs/<feature>/implementation-package/codebase-orientation.md` using the template at `../assets/codebase-orientation.md`. Populate every section with the findings from Steps 1–7.

**Why a file:** Persisting the orientation means the planning skill reads the file directly, and any future AI session can resume from the file rather than re-reading the codebase. This is essential for AI SDLC stop-and-resume workflows.

After writing the file, present a summary to the developer:

```
## Codebase Orientation — [Change Name]

### Technology Versions
- Language: [language] [version]
- Framework: [framework] [version]
- Test framework: [test framework] [version]
- Assertion library: [library] [version]
- Mocking: [approach/library] [version]
- Build: [command]
- Test: [command]
- Lint: [command]

### Standards Loaded
- Common: naming, error handling, logging, clean code, [others applicable]
- Language: [language]/standards.md
- Framework: [framework]/standards.md
- Testing: common/testing/unit-testing.md, [language]/testing.md, [framework]/testing.md
- Version-gated rules excluded: [list any rules that don't apply due to version]

### Patterns in Affected Files
- File structure: [how files are organized]
- Naming: [file naming, class naming, variable naming]
- Error handling: [approach — compliant/non-compliant with standard]
- DI / wiring: [approach]
- Logging: [approach — compliant/non-compliant with standard]
- State management: [if frontend]
- API layer: [if controller/handler]

### Standards Compliance Snapshot
| Area | Compliant? | New Code Should |
|------|-----------|-----------------|
| [area] | Yes / No | Follow codebase / Follow standard |

### Test Infrastructure
- Test location: [co-located / separate directory]
- Test naming: [pattern]
- Mocking: [approach]
- Existing tests for affected files: [list]

### Gotchas
- [Anything non-obvious about the affected area]

### Escape Hatch: PASS — change is appropriate for expedited flow
```

Full detail is in `docs/<feature>/implementation-package/codebase-orientation.md`.

---

## Hand-off Gate

Before proceeding to planning (`implementation-plan-creator`):

1. Technology and testing stack versions have been extracted.
2. Applicable coding standards have been loaded and compared against codebase patterns.
3. All affected files have been read and patterns documented.
4. Test infrastructure is documented — framework, versions, commands, naming.
5. Escape hatch evaluation has passed.
6. `docs/<feature>/implementation-package/codebase-orientation.md` has been written to disk using `../assets/codebase-orientation.md`.
7. Present the orientation summary to the developer: "Here's what I found in the affected area — full details in `docs/<feature>/implementation-package/codebase-orientation.md`. Does this match your understanding? Anything I missed?"
8. Do not proceed until the developer acknowledges.

---

## Completion Criteria

- [ ] Language, framework, and deployment target versions extracted from build configuration files
- [ ] Testing stack versions extracted — test framework, assertion library, mocking library with specific versions
- [ ] Version-gated standard rules filtered — rules whose version requirements exceed the project's versions are excluded
- [ ] Applicable coding standards loaded — common, language, framework, platform (scoped to the project's stack only)
- [ ] All files in the change spec's "Where" section have been read
- [ ] Patterns extracted — naming, error handling, DI, logging, state management, API layer (as applicable)
- [ ] Standards compliance snapshot produced — each pattern compared against the applicable standard
- [ ] Non-compliant patterns flagged — new code will follow the standard, not the deviation
- [ ] Test files located and test infrastructure documented — framework, versions, naming, mocking, commands
- [ ] Build, test, and lint commands identified
- [ ] Existing project context document checked (reused if available)
- [ ] Escape hatch evaluation completed — change is confirmed appropriate for expedited flow
- [ ] `docs/<feature>/implementation-package/codebase-orientation.md` written to disk using `../assets/codebase-orientation.md`
- [ ] Developer has acknowledged the orientation summary

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| New code uses different patterns from existing code — alien graft | Step 3 extracts actual patterns; Step 4 determines whether to follow codebase or standard |
| Agent generates tests using wrong API (JUnit 4 on JUnit 5 project, Jest on Vitest project) | Step 1 extracts testing stack versions; Step 5 cross-references with actual imports |
| Agent enforces a standard rule that requires a newer version than the project uses | Step 1 extracts actual versions; Step 2 filters version-gated rules |
| Expedited flow used for a change that is too large — plan is inadequate, execution fails | Step 7 escape hatch evaluates scope against thresholds and recommends full pipeline |
| Agent does not know the test command and skips running tests during TDD | Step 5 records build, test, and lint commands explicitly |
| New code follows a bad pattern from the codebase instead of the organizational standard | Step 4 compares patterns against standards; standard wins for new code when codebase deviates |
| Agent guesses at naming conventions instead of reading actual code | Step 3 reads the actual files and extracts naming with concrete examples |
| Agent regenerates project context that already exists from a prior full pipeline run | Step 6 checks for existing project-context.md and reuses it |
| AI session is stopped and restarted — orientation context is lost and must be reconstructed | `docs/<feature>/implementation-package/codebase-orientation.md` is written to disk; new session reads the file instead of re-reading the codebase |
