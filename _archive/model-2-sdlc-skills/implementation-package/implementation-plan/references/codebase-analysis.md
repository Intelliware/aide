# Codebase Analysis

## Purpose

Systematically analyze the existing codebase areas affected by a new feature — file/module mapping, existing patterns, code dependencies, and test structure. The developer's code-level complement to the BSA's current-capability-synthesiser and the architect's existing-architecture-assessment. Includes code integration strategy: maps new feature code to established conventions (DI framework, state management, API layer, error handling), identifies where new code extends vs. diverges from current patterns, plans adapter layers if architectural patterns differ, and documents integration points where new modules connect to existing ones. Ensures new code is idiomatic within the existing codebase rather than an alien graft. Feeds into the implementation plan and project context.

## What This Produces

A structured map of the existing codebase in the areas affected by the proposed change — which files exist, how they are organized, what patterns they follow, what they depend on, how they are tested, and how new feature code should integrate with them. This is the developer's "ground truth" about the code that the implementation plan will modify or extend.

This is the first step of implementation planning. Every subsequent planning step — test planning, prerequisites planning, project context generation, and implementation plan creation — depends on the codebase analysis. Without it, plans are structured around the design document's abstractions rather than the codebase's actual organization.

## When to Use

- Always the first step in implementation planning for brownfield projects
- Before any other implementation-planning reference runs (test-planning, prerequisites-planning, etc.)
- After receiving the architect's solution package (solution design has been reviewed and approved)
- Not needed for greenfield projects (the workflow skips this skill when there is no existing codebase)

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Solution design | `docs/<feature>/solutions-package/solution-package.md` — system design (`docs/<feature>/solutions-package/design/03-system-design.md`), technology stack (`docs/<feature>/solutions-package/design/02-technology-stack.md`), data model (`docs/<feature>/solutions-package/design/06-data-model-design.md`), API design (`docs/<feature>/solutions-package/design/07-api-design.md`), backend design (`docs/<feature>/solutions-package/design/05-backend-design.md`), frontend design (`docs/<feature>/solutions-package/design/04-frontend-design.md`) | Yes — identifies which components the feature touches and what the new code should do |
| Architecture baseline | `docs/<feature>/solutions-package/discovery/architecture-baseline.md` — if the architect ran discovery, this provides the high-level architecture (tech stack, data stores, deployment topology, integration points) | If available — narrows where to look in the codebase |
| Requirements package | `docs/<feature>/requirements-package/requirements-package.md` — functional requirements (`docs/<feature>/requirements-package/requirements/functional-requirements.md`), data requirements (`docs/<feature>/requirements-package/requirements/data-requirements.md`), business rules (`docs/<feature>/requirements-package/requirements/business-rules.md`), NFRs (`docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md`) | Yes — defines the scope of what the feature does, which determines what codebase areas are affected |
| Coding standards | `../assets/standards/` — common standards (`common/`), language-specific standards (`languages/{lang}/`), framework-specific standards (`frameworks/{framework}/`) | Yes — the organizational gold standard for how code should be written; discovered patterns are compared against these |
| Access to the codebase | Local filesystem or repository — the actual source code for the existing application | Yes — the AI reads the actual code; this skill cannot run without codebase access |

> **Missing input guard:** If the solution package cannot be found at `docs/<feature>/solutions-package/solution-package.md`, do not proceed. Ask the user to provide the location of the solution design package before beginning codebase analysis.

## How This Differs from the Architecture Baseline

The architect's `docs/<feature>/solutions-package/discovery/architecture-baseline.md` (if it exists) is a **high-level** assessment — tech stack versions, deployment topology, data stores, integration points, and high-level patterns. It tells you *what technologies are in use* and *how the system is deployed*.

Codebase analysis is **code-level** — it reads actual source files, extracts actual patterns from them, maps actual imports and dependencies, identifies actual test files and conventions. It tells you *how the code is actually organized* and *how to write code that fits*.

The architecture baseline tells you "this project uses NestJS with TypeORM." Codebase analysis tells you "services are in `src/modules/{feature}/`, use constructor injection, follow the pattern in `OrderService`, name test files `*.spec.ts`, and use `jest.mock()` for repository mocks."

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  1. LOAD — Read all inputs                                       │
│     Read solution design (component map, technology stack),      │
│     architecture baseline (if exists), requirements package      │
│     (functional requirements, data requirements).                │
│     Build a list of which components the feature touches.        │
│     1a. Extract language/framework versions from build files.    │
│     Record versions; determine which standard rules apply.       │
├──────────────────────────────────────────────────────────────────┤
│  2. SCOPE — Determine affected codebase areas                    │
│     From the solution design's component map and data flow       │
│     paths, identify which modules, directories, and layers      │
│     the feature will read from, write to, or integrate with.    │
│     Define the analysis boundary — what is in scope,             │
│     what is explicitly out of scope.                             │
├──────────────────────────────────────────────────────────────────┤
│  3. MAP FILES — Walk the codebase in affected areas              │
│     Read directory structures, identify files per module.        │
│     Classify files by role (controller, service, repository,     │
│     model, config, migration, test, utility, type definition).   │
│     Produce a file/module map.                                   │
├──────────────────────────────────────────────────────────────────┤
│  4. EXTRACT PATTERNS — Identify coding patterns in               │
│     affected areas                                               │
│     Read representative source files to extract: layering        │
│     approach, naming conventions, DI/wiring approach,            │
│     error handling, state management, data access patterns,      │
│     API layer conventions, response formatting.                  │
│     4a. Compare each discovered pattern against the applicable   │
│     coding standard. Produce a Standards Compliance Assessment.  │
├──────────────────────────────────────────────────────────────────┤
│  5. DEPENDENCIES — Map code dependencies in affected areas       │
│     Imports, shared utilities, shared types, shared config.      │
│     Which modules depend on which other modules?                 │
│     Which shared libraries or utilities are used?                │
│     Identify coupling points — where changes in one area         │
│     will ripple into others.                                     │
├──────────────────────────────────────────────────────────────────┤
│  6. TEST STRUCTURE — Map existing test suite in affected          │
│     areas                                                        │
│     Test file location convention, test framework, test          │
│     naming, mocking approach, fixture patterns, test             │
│     helpers. Identify existing test coverage in affected         │
│     areas. Note any tests that will break due to the             │
│     proposed change.                                             │
├──────────────────────────────────────────────────────────────────┤
│  7. CONVENTIONS — Document observed conventions                   │
│     Naming rules (files, classes, functions, variables),         │
│     import ordering, code organization within files,             │
│     comment style, formatting, linting/formatting tools,         │
│     commit message format (if visible in recent history).        │
│     7a. Compare observed conventions against coding standards.   │
│     Flag deviations — new code follows the standard.             │
├──────────────────────────────────────────────────────────────────┤
│  8. TECHNICAL DEBT — Note existing debt in affected areas        │
│     Inconsistencies, TODO/FIXME/HACK comments, deprecated        │
│     patterns, outdated dependencies, missing tests,              │
│     known issues, and standards deviations from Steps 4a/7a.     │
│     Only in the affected areas — this is not a full audit.       │
├──────────────────────────────────────────────────────────────────┤
│  9. INTEGRATION STRATEGY — Plan how new code integrates          │
│     For each solution design component, determine:               │
│     - Where the code goes (which directory, which module)        │
│     - Which pattern it follows (standard wins over deviating     │
│       codebase pattern; compliant codebase pattern wins over     │
│       abstract standard alone)                                   │
│     - Which existing files it extends vs. new files it creates   │
│     - Where new modules connect to existing modules              │
│     - Whether any adapter layers are needed                      │
│     - Three-way conformance: solution design vs. codebase        │
│       vs. coding standard                                        │
├──────────────────────────────────────────────────────────────────┤
│  10. VALIDATE — Check analysis completeness                      │
│      Every component in the solution design's component map      │
│      has a corresponding entry in the codebase analysis.         │
│      Integration points are identified.                          │
│      No "unknown" areas remain where code needs to go.           │
├──────────────────────────────────────────────────────────────────┤
│  11. ASSEMBLE — Write the codebase analysis document             │
│      Produce the structured output. Present for review.          │
└──────────────────────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Load Inputs

Read all inputs. If the solution design is not yet complete or has not been reviewed and approved (review-solution-readiness did not return GO), stop — this skill depends on the approved solution package.

From the solution design, note:
- **System design** (Section 3) — component map showing which components exist, their responsibilities, and how they communicate. This tells you which parts of the codebase the feature touches.
- **Technology stack** (Section 2) — backend language, framework, ORM, frontend framework, testing tools, build tools. This tells you what to look for in the codebase.
- **Data model** (Section 6) — which entities are new, which are modified, which are unchanged. This identifies data access code to examine.
- **API design** (Section 7) — new and modified endpoints. This identifies controller/handler code to examine.
- **Backend design** (Section 5) — service layer, domain model, data access patterns. This identifies backend code to examine.
- **Frontend design** (Section 8, if applicable) — components, state management, routing. This identifies frontend code to examine.

From the architecture baseline (if it exists), note:
- The high-level tech stack (confirms what the solution design says)
- Data stores and which components access them (narrows where to look for data access code)
- Integration points with external systems (identifies additional code areas to examine)

From the requirements package, note the scope of functional requirements — these define what the feature does, which determines the breadth of the codebase areas affected.

From the **coding standards** (`../assets/standards/`), read the applicable files based on the technology stack:
- `common/` — naming conventions, error handling, logging, security practices, code documentation, dependency management, REST API design
- `common/testing/` — unit testing, integration testing, contract testing, mocking strategy, test data management
- The language-specific standards for the project's language(s) — e.g., `languages/typescript/standards.md`
- The framework-specific standards for the project's framework(s) — e.g., `frameworks/react/standards.md`
- **Only read standards for technologies in the project's stack.** Do not read Java standards for a TypeScript project.

These standards are the **gold standard** — the organizational authority for how code should be written. Discovered codebase patterns will be compared against them in Steps 4, 7, and 9. When the codebase deviates from a standard, the standard wins for new code.

**Step 1a — Extract language and framework versions.**

Read the project's build configuration files to determine the exact language and framework versions in use. Some standard rules are version-gated (tagged with **Requires** in the standard files) — only enforce rules that are compatible with the project's actual versions.

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
| **JUnit** | `pom.xml` (`junit-jupiter` or `junit` dependency), `build.gradle` (`testImplementation`) | JUnit 4 vs JUnit 5 (Jupiter) | Annotations differ (`@Test` import path, `@BeforeEach` vs `@Before`), assertion API differs, extension model differs |
| **Mockito** | `pom.xml` / `build.gradle` (`mockito-core` version) | Mockito version (e.g., 4.x, 5.x) | Mockito 5+ requires Java 11+, changes default answer behavior, inline mock maker is default |
| **Jest** | `package.json` (`devDependencies.jest`) | Jest version (e.g., 28, 29) | Config format, module mocking API, fake timers API change between versions |
| **Vitest** | `package.json` (`devDependencies.vitest`) | Vitest version (e.g., 1.x, 2.x) | API compatibility, workspace support, browser mode |
| **Testing Library** | `package.json` (`@testing-library/react`, `@testing-library/jest-dom`) | Testing Library version (e.g., RTL 14, 15, 16) | Query API changes, `render` behavior, `act` handling differs |
| **Playwright** | `package.json` (`@playwright/test`) | Playwright version | Locator API, auto-waiting behavior, test runner config |
| **Cypress** | `package.json` (`cypress`) | Cypress version | Component testing support, query chaining, retry-ability |
| **XCTest / Swift Testing** | Xcode project, `Package.swift` dependencies | XCTest vs Swift Testing framework | Swift Testing (Swift 6+) uses `@Test` macro, `#expect` — entirely different API from XCTest |
| **Kotest** | `build.gradle.kts` (`kotest-runner-junit5` version) | Kotest version (e.g., 5.x) | DSL style, assertion library, property testing API |
| **AssertJ** | `pom.xml` / `build.gradle` (`assertj-core`) | AssertJ version (e.g., 3.x) | Fluent assertion API — often used alongside JUnit |
| **Testcontainers** | `pom.xml` / `build.gradle` / `package.json` (`testcontainers`) | Testcontainers version | Module availability, API changes between versions |

**Record the extracted versions** in the output document (Section 0 — Technology Versions). These versions determine:
1. **Which standard rules apply** — any rule tagged with `Requires: Java 21+` is skipped for a Java 17 project. The compliance assessment (Step 4a) should note: "Rule JV-15 (Virtual Threads) requires Java 21+ — project is on Java 17, rule not applicable."
2. **Which version-specific customizations apply** — the Customization section of each standard file contains fallback guidance for older versions.
3. **Whether the project's version is itself a concern** — if the project is on an end-of-life version (e.g., Java 11, Node 14, Angular 12), flag it as a technical debt item in Step 8.

**Version compatibility alert:** After extracting project versions and loading the applicable standards files, compare the project's actual versions against the **Applicability** baseline version stated in each standards file. If the project's version is older than the standards' baseline, alert the user:

**"The [language/framework/platform] coding standards are written for [standards baseline, e.g., TypeScript 5.0+], but the project is on [project version, e.g., TypeScript 4.9]. Some standard rules may reference features unavailable in your version. I've already filtered out rules with explicit `Requires` tags that exceed your version, but other rules may implicitly assume the baseline version's capabilities. I'll flag any version-gated recommendations as I encounter them in the compliance assessment. If you'd like, I can note the standards baseline mismatch as a technical debt item."**

If the project version is equal to or newer than the standards baseline, no alert is needed — proceed normally.

**Ask for project-specific standards:** After loading the built-in coding standards from `../assets/standards/`, ask the user:

**"Do you have any project-specific or organization-specific coding standards beyond those in the standards directory that I should also apply? This could include:**
- **Team coding guidelines** (additional rules, stricter thresholds, project-specific linting rules)
- **Architecture decision records (ADRs)** that mandate specific patterns or libraries
- **Regulatory or compliance standards** (security scanning requirements, data handling rules, audit trail requirements)
- **Code review checklists** (required checks that go beyond automated standards)
- **Custom linter/formatter configurations** (shared ESLint configs, Prettier presets, Checkstyle rules)

**If you have additional standards files, provide the path or link. I'll apply them alongside the built-in standards — project-specific standards take precedence where they conflict with built-in standards.**"

If the user provides project-specific standards:
- Load and read them before proceeding to Step 2
- In Steps 4a and 7a, use them as the **highest-priority** reference: project-specific standards > built-in language/framework/platform standards > built-in common standards
- Note any conflicts between project-specific and built-in standards; present the conflict and ask which takes precedence

If no project-specific standards exist, proceed with the built-in standards as the sole reference.

### Step 2 — Scope the Affected Areas

Using the solution design's component map and data flow paths, identify which codebase areas are in scope for analysis.

**Step 2a — List affected components.**

For each component in the solution design, determine which existing codebase module, directory, or service corresponds to it:

| Solution Design Component | Codebase Location | Relationship |
|--------------------------|-------------------|-------------|
| *(e.g., RefundService)* | *(src/modules/orders/ — extends existing order module)* | *(New code in existing module)* |
| *(e.g., NotificationService)* | *(src/modules/notifications/ — existing module)* | *(Modified — new event handler)* |
| *(e.g., RefundController)* | *(src/modules/orders/ — new controller in existing module)* | *(New file in existing module)* |

If a solution design component has no corresponding codebase location (i.e., it is entirely new and does not extend any existing module), note it as "new module — no existing code to analyze" and specify where it should be placed based on the project's module organization pattern.

**Step 2b — Define the analysis boundary.**

State explicitly what is in scope and what is out of scope:

- **In scope:** modules/directories/files that will be created, modified, or that the new feature depends on
- **Out of scope:** modules/directories that are unrelated to the feature, even if they share infrastructure (e.g., a billing module when the feature is about refunds — unless refunds depend on billing)

Present the scope to the user: **"Based on the solution design, the feature touches these areas of the codebase: [list]. I'll analyze the code in these areas. Are there any areas I've missed, or any areas I should exclude?"**

### Step 3 — Map Files in Affected Areas

Walk the codebase directories that are in scope. For each directory, list the files and classify them:

**Module-level file map:**

| Module / Directory | File | Role | Lines | Notes |
|-------------------|------|------|-------|-------|
| *(src/modules/orders/)* | *(order.controller.ts)* | *(Controller)* | *(85)* | *(REST endpoints for orders)* |
| *(src/modules/orders/)* | *(order.service.ts)* | *(Service)* | *(210)* | *(Business logic — create, update, cancel)* |
| *(src/modules/orders/)* | *(order.repository.ts)* | *(Repository)* | *(65)* | *(Data access via TypeORM)* |
| *(src/modules/orders/)* | *(order.entity.ts)* | *(Entity/Model)* | *(45)* | *(TypeORM entity definition)* |
| *(src/modules/orders/)* | *(order.module.ts)* | *(Module config)* | *(20)* | *(NestJS module — imports, providers, exports)* |
| *(src/modules/orders/)* | *(dto/create-order.dto.ts)* | *(DTO)* | *(25)* | *(Input validation)* |
| *(src/modules/orders/tests/)* | *(order.service.spec.ts)* | *(Test)* | *(150)* | *(Unit tests for OrderService)* |

**Directory structure summary:**

```
src/
├── modules/
│   ├── orders/
│   │   ├── dto/
│   │   ├── tests/
│   │   ├── order.controller.ts
│   │   ├── order.service.ts
│   │   ├── order.repository.ts
│   │   ├── order.entity.ts
│   │   └── order.module.ts
│   └── notifications/
│       ├── ...
```

Note the **module organization pattern** — how the project groups code. Is it grouped by feature/module (vertical slices) or by layer (all controllers together, all services together)? This determines where new feature code goes.

### Step 4 — Extract Coding Patterns from Affected Areas

Read representative source files — at least one file per role (controller, service, repository, entity, test) in the affected areas. Extract the actual patterns used.

**What to extract per layer:**

| Layer | What to Look For | Example Observations |
|-------|-----------------|---------------------|
| **Controllers / Handlers** | Route definition style, request validation approach, response formatting, error handling in controllers, authentication/authorization decorators | *Uses `@Controller` with `@Get`/`@Post`; validation via class-validator DTOs; responses wrapped in `{ data, meta }` envelope* |
| **Services** | Method signatures, dependency injection style, transaction management, business rule enforcement, error throwing patterns | *Constructor injection; `@Transactional()` on write methods; throws typed exceptions (NotFoundException, ConflictException)* |
| **Repositories / Data Access** | ORM usage pattern (repository pattern vs. direct ORM), query style, eager/lazy loading, pagination approach | *TypeORM custom repository extending `Repository<Entity>`; uses QueryBuilder for complex queries; cursor-based pagination* |
| **Entities / Models** | ORM decorators, relationship definitions, column types, validation decorators, computed properties | *TypeORM `@Entity` with `@Column`, `@ManyToOne`; UUID primary keys via `@PrimaryGeneratedColumn('uuid')`* |
| **DTOs / Validation** | Validation library, decorator patterns, transformation pipes | *class-validator decorators (`@IsString`, `@IsOptional`); class-transformer for serialization* |
| **Configuration** | Config loading approach, environment variable usage, feature flags | *NestJS ConfigModule with `.env` files; `@Inject(ConfigService)` in services* |
| **Middleware / Guards** | Auth middleware, request context propagation, logging middleware | *JWT auth guard via `@UseGuards(JwtAuthGuard)`; roles via `@Roles('admin')` decorator* |
| **Views / Screens (mobile)** | View/screen composition, navigation patterns, lifecycle handling, state observation, styling approach | *SwiftUI Views with `@Observable` models; NavigationStack with typed destinations; Compose screens with `collectAsState()`* |
| **ViewModels (mobile)** | State management, UI event handling, domain logic delegation, coroutine/async patterns | *Android ViewModel with `StateFlow`; iOS ObservableObject with `@Published`; unidirectional data flow* |
| **Networking (mobile)** | API client abstraction, request/response models, auth token management, error mapping | *Retrofit with Moshi on Android; URLSession wrapper on iOS; centralized auth interceptor* |

**Framework-specific pattern extraction:**

| Framework | Key Files to Read for Patterns |
|-----------|-------------------------------|
| **NestJS** | Any `*.module.ts` (DI wiring), any `*.controller.ts` (route/validation style), any `*.service.ts` (business logic style), `main.ts` (global pipes/filters/interceptors) |
| **Spring Boot** | Any `@Service` class (transaction/DI style), any `@RestController` (endpoint style), `@Configuration` beans, `@ControllerAdvice` (error handling) |
| **Django** | Any `views.py` / ViewSet (request handling), `models.py` (ORM style), `serializers.py` (validation), `urls.py` (routing), middleware |
| **Express** | Route handlers (middleware chain style), error handling middleware, service modules, request validation approach |
| **FastAPI** | Route functions (dependency injection via `Depends`), Pydantic models, middleware, exception handlers |
| **React / Next.js** | Component structure (functional vs. class), state management approach, data fetching pattern, routing, styling approach |
| **Angular** | Module structure, service injection, component architecture, state management (NgRx/signals), routing |
| **Rails** | Controller style, model concerns, service objects pattern, job definitions, initializers |
| **SwiftUI (iOS)** | View struct patterns (`body` composition), `@Observable` / `ObservableObject` / `@StateObject` usage, navigation approach (NavigationStack, NavigationSplitView), data persistence (SwiftData, Core Data, API-driven), dependency injection pattern, project target structure |
| **UIKit (iOS)** | ViewController lifecycle, storyboard vs. programmatic layout, coordinator/router pattern, delegation vs. closures vs. Combine, dependency injection approach, networking layer abstraction |
| **Jetpack Compose (Android)** | Composable function patterns, ViewModel usage (`StateFlow`, `MutableState`), navigation (NavHost/NavController), Hilt/Dagger DI modules, repository pattern, Room/Retrofit setup, Gradle module structure |
| **Android XML (legacy)** | Activity/Fragment lifecycle, ViewBinding/DataBinding, ViewModel + LiveData, navigation component, Dagger/Hilt setup, repository pattern, resource organization |
| **React Native** | Component structure, navigation library (React Navigation), native module bridge pattern, state management (Redux, Zustand, Context), platform-specific code (`*.ios.ts` / `*.android.ts`), metro bundler config |
| **Flutter** | Widget tree composition, state management (Riverpod, Bloc, Provider), navigation approach (GoRouter, Navigator 2.0), platform channels for native code, `pubspec.yaml` dependencies, directory structure (`lib/`, `test/`, platform folders) |

**Ask for a reference implementation.** Before completing this step, ask the user:

*"Which existing module or feature in this codebase do you consider the best example of how new code should be structured? I'll use it as the primary reference for conventions."*

If the user nominates one, read that module thoroughly and use it as the convention source. Compare it against other modules in the affected area — note any deviations.

**Step 4a — Standards Compliance Assessment.**

After extracting patterns from the codebase, compare each discovered pattern against the applicable coding standards (loaded in Step 1). Produce a **Standards Compliance Assessment** — a table that evaluates whether the patterns found in the codebase comply with organizational standards.

| Layer / Area | Discovered Pattern | Applicable Standard | Standard Reference | Compliant? | Deviation Detail |
|---|---|---|---|---|---|
| *(Error handling)* | *(Throws bare `new Error('...')` with string messages)* | *(Use typed error classes extending a base AppError; include error code, HTTP status, and context)* | *(`../assets/standards/common/error-handling.md`)* | **No** | *(No typed errors, no error codes — new code must use typed error classes per standard)* |
| *(Naming — files)* | *(kebab-case with role suffix: `order.service.ts`)* | *(kebab-case with role suffix)* | *(`../assets/standards/common/naming-conventions.md`)* | **Yes** | *(Codebase matches standard)* |
| *(Validation)* | *(class-validator DTOs with ValidationPipe)* | *(Use validation library decorators on DTOs; apply at framework boundary)* | *(`../assets/standards/languages/typescript/standards.md`)* | **Yes** | *(Codebase matches standard)* |
| *(Logging)* | *(Inconsistent — some services use `console.log`, others use NestJS Logger)* | *(Use framework-provided structured logger; never use `console.log` in production code)* | *(`../assets/standards/common/logging.md`)* | **No** | *(Mixed usage — new code must use NestJS Logger per standard; existing `console.log` calls are debt)* |

For each **non-compliant** entry:
1. Record it in the Standards Compliance Assessment table (output section 3a).
2. Note the severity: does the deviation affect correctness, maintainability, security, or just style?
3. The pattern to follow for **new code** is the **standard**, not the discovered codebase pattern.
4. The deviation in the existing code is flagged as technical debt (feeds into Step 8).

For each **compliant** entry:
1. The codebase pattern is a proven implementation of the standard. New code follows the codebase pattern — it's both standards-compliant and consistent with the existing codebase.

### Step 5 — Map Code Dependencies in Affected Areas

For each module in scope, map what it imports and what imports it:

**Internal dependencies:**

| Module | Depends On | Used By | Shared Types / Utilities |
|--------|-----------|---------|------------------------|
| *(orders)* | *(common/guards, common/filters, users, products)* | *(invoices, dashboard)* | *(Pagination utility, BaseEntity, ApiResponse type)* |
| *(notifications)* | *(common/config, users)* | *(orders, payments)* | *(EventEmitter, NotificationType enum)* |

**External dependencies relevant to the feature:**

| Package | Version | Used For | Used In |
|---------|---------|----------|---------|
| *(typeorm)* | *(0.3.x)* | *(ORM)* | *(All entities and repositories)* |
| *(class-validator)* | *(0.14.x)* | *(DTO validation)* | *(All DTOs)* |
| *(@nestjs/swagger)* | *(7.x)* | *(API documentation)* | *(All controllers)* |

**Coupling points — where the feature change will ripple:**

For each dependency, assess whether the proposed change will affect the dependent:

| Dependency | Impact of Proposed Change | Action Needed |
|-----------|--------------------------|---------------|
| *(invoices module imports OrderEntity)* | *(Adding refund_eligible column to OrderEntity — Invoice module reads orders but does not use this column)* | *(No action — additive change, no impact on invoices)* |
| *(dashboard module imports OrderService.getStats)* | *(Refund status counts need to appear in dashboard stats)* | *(Dashboard module will need modification — in scope)* |

### Step 6 — Map Existing Test Structure in Affected Areas

Read test files in the affected areas and document the testing approach:

**Test infrastructure:**

| Aspect | Observed Pattern |
|--------|-----------------|
| **Test framework + version** | *(e.g., Jest 29.7, JUnit Jupiter 5.10, Vitest 2.1, XCTest, Swift Testing, Kotest 5.8)* |
| **Assertion library + version** | *(e.g., jest-dom 6.1, AssertJ 3.25, Hamcrest 2.2, Chai 5.x — or "built-in" if using framework assertions)* |
| **Mocking library + version** | *(e.g., Mockito 5.8, jest.fn() built-in, ts-mockito 2.x, nock 13.x for HTTP)* |
| **Test file location** | *(e.g., co-located `*.spec.ts` next to source, or separate `tests/` directory mirroring `src/`)* |
| **Test file naming** | *(e.g., `order.service.spec.ts`, `test_order_service.py`, `OrderServiceTest.java`)* |
| **Test organization** | *(e.g., `describe`/`it` blocks, nested suites by method)* |
| **Mocking approach** | *(e.g., `jest.mock()`, manual mocks, dependency injection of test doubles)* |
| **Fixture / factory pattern** | *(e.g., factory functions, fixture files, inline test data)* |
| **Database test strategy** | *(e.g., in-memory database, Testcontainers 1.19, transaction rollback, mocked repository)* |
| **API / integration test approach** | *(e.g., supertest 6.x with test server, Playwright 1.42 for E2E, no integration tests)* |
| **Coverage tool** | *(e.g., jest --coverage, coverage.py, JaCoCo 0.8)* |
| **Test runner command** | *(e.g., `npm test`, `./gradlew test`, `swift test`, `npx vitest`)* |

**Critical:** Cross-reference the testing stack versions from Step 1a with what existing test files actually import. If the codebase has both JUnit 4 and JUnit 5 dependencies (a common migration state), note which is primary and which is legacy. The test creator skills use these versions to generate tests with the correct API — using JUnit 4 annotations on a JUnit 5 project (or vice versa) produces tests that fail to compile.

**Existing tests that will be affected by the proposed change:**

| Test File | What It Tests | Impact |
|-----------|--------------|--------|
| *(order.service.spec.ts)* | *(OrderService.create, OrderService.cancel)* | *(Tests create orders without refund_eligible — will need updating)* |
| *(order.controller.spec.ts)* | *(POST /orders, GET /orders/:id)* | *(Response shape tests may need refund_eligible field added)* |

This feeds directly into the test-planning skill (Step 2 of the planning workflow).

### Step 7 — Document Observed Conventions

Compile the naming and style conventions observed across all files read in the affected areas:

**Naming conventions:**

| Element | Convention | Examples from Codebase |
|---------|-----------|----------------------|
| **File names** | *(e.g., kebab-case with role suffix)* | *`order.service.ts`, `create-order.dto.ts`* |
| **Class names** | *(e.g., PascalCase with role suffix)* | *`OrderService`, `CreateOrderDto`* |
| **Method names** | *(e.g., camelCase, verb-first)* | *`createOrder`, `findByStatus`* |
| **Variable names** | *(e.g., camelCase)* | *`orderItems`, `isEligible`* |
| **Constants** | *(e.g., SCREAMING_SNAKE_CASE)* | *`MAX_RETRIES`, `DEFAULT_PAGE_SIZE`* |
| **Database columns** | *(e.g., snake_case)* | *`created_at`, `order_id`* |
| **API endpoints** | *(e.g., kebab-case, plural nouns)* | *`/orders`, `/order-items`* |

**Code organization conventions:**

| Convention | Observed Pattern |
|-----------|-----------------|
| **Import ordering** | *(e.g., framework imports → third-party → local modules → relative imports)* |
| **File structure within a module** | *(e.g., entity → DTO → repository → service → controller → module)* |
| **Export style** | *(e.g., named exports, re-exported from module index.ts)* |
| **Error handling style** | *(e.g., throw typed exceptions, no try/catch in services — global filter handles all)* |
| **Logging style** | *(e.g., `@nestjs/common Logger` with class name context)* |
| **Comment style** | *(e.g., JSDoc on public methods, no inline comments otherwise)* |

**Tooling conventions:**

| Tool | Config |
|------|--------|
| **Linter** | *(e.g., ESLint with @typescript-eslint, config file location)* |
| **Formatter** | *(e.g., Prettier with project .prettierrc)* |
| **Build tool** | *(e.g., tsc via nest build, webpack, vite)* |
| **Package manager** | *(e.g., npm with package-lock.json, pnpm with pnpm-lock.yaml)* |

**Step 7a — Compare Conventions Against Standards.**

After documenting the observed conventions, compare them against the applicable coding standards — particularly `../assets/standards/common/naming-conventions.md` and the language/framework-specific standards.

| Convention Area | Observed in Codebase | Standard Requires | Compliant? | Note for New Code |
|---|---|---|---|---|
| *(File naming)* | *(kebab-case with role suffix)* | *(kebab-case with role suffix)* | **Yes** | *(Follow codebase convention — it matches the standard)* |
| *(Import ordering)* | *(No consistent order — varies by file)* | *(Framework → third-party → local → relative, separated by blank lines)* | **No** | *(New code follows the standard import ordering; flag existing inconsistency as debt)* |
| *(Error handling style)* | *(Mix of bare throws and typed exceptions)* | *(Typed exceptions only)* | **No** | *(New code uses typed exceptions per standard)* |

Where the codebase convention matches the standard, state "follow codebase convention" — it's both compliant and consistent. Where they diverge, state "follow the standard" and flag the codebase convention as a deviation. New code always follows the standard.

### Step 8 — Note Technical Debt in Affected Areas

Only document debt in the areas the feature will touch — this is not a full codebase audit.

**Observed debt:**

| Location | Type | Description | Impact on Feature |
|----------|------|-------------|------------------|
| *(order.service.ts:45-80)* | *(Large method)* | *(`createOrder` is 35 lines with nested conditionals)* | *(Adding refund eligibility logic will make it worse — consider extracting)* |
| *(order.entity.ts)* | *(Missing index)* | *(No index on `status` column — queried frequently)* | *(Refund queries by status will be slow without it)* |
| *(order.service.spec.ts)* | *(Low coverage)* | *(Only tests happy path for create — no error cases)* | *(Need to add error case tests when modifying)* |
| *(Various)* | *(TODO comments)* | *(3 TODO comments in affected files)* | *(Review whether any are relevant to this feature)* |

**Standards deviations as technical debt:**

In addition to the traditional debt categories above, include every non-compliant entry from the Standards Compliance Assessment (Step 4a) and the conventions comparison (Step 7a) as technical debt. These are patterns or conventions in the affected areas that work but violate organizational standards.

| Location | Type | Description | Impact on Feature |
|---|---|---|---|
| *(order.service.ts)* | *(Standards deviation)* | *(Uses bare `throw new Error()` instead of typed error classes per `../assets/standards/common/error-handling.md`)* | *(New code in this file must use typed errors per standard; existing throws are debt)* |
| *(Various services)* | *(Standards deviation)* | *(Inconsistent `console.log` usage instead of structured logger per `../assets/standards/common/logging.md`)* | *(New code uses framework logger; existing `console.log` calls are debt)* |

**Decision for the feature:** For each debt item, state whether the feature should:
- **Fix it** as part of the feature work (if it directly affects the feature or the new code must interact with the deviating pattern)
- **Leave it** (if fixing it is out of scope and won't impact the feature)
- **Flag it** for the user's attention (if it is borderline)

For standards deviations specifically: even when the decision is "leave it," the new code must still follow the standard. The deviation in existing code is left as-is, but the new code does not perpetuate it.

### Step 9 — Define the Code Integration Strategy

This is the core output that makes codebase analysis actionable for the implementation plan. For each component from the solution design, specify exactly how it fits into the existing codebase.

**Integration mapping:**

The "Pattern to Follow" column uses the Standards Compliance Assessment (Step 4a) to determine what the new code should do. The logic is:
- **If the codebase pattern is standards-compliant:** follow the codebase pattern. It's a proven implementation of the standard and provides consistency with existing code.
- **If the codebase pattern deviates from the standard:** follow the **standard**, not the codebase pattern. Note the deviation so the reviewer is aware that new code will look different from surrounding code in this aspect.

| Solution Design Component | Integration Approach | Codebase Location | Extends / Creates | Pattern to Follow |
|--------------------------|---------------------|-------------------|-------------------|-------------------|
| *(RefundService)* | *(New service in existing orders module)* | *(src/modules/orders/refund.service.ts)* | *(Creates new file)* | *(Follow OrderService pattern — constructor injection, @Transactional on writes — ✅ compliant with standards)* |
| *(Refund entity)* | *(New entity in existing orders module)* | *(src/modules/orders/refund.entity.ts)* | *(Creates new file)* | *(Follow OrderEntity pattern — UUID PK, timestamps, TypeORM decorators — ✅ compliant with standards)* |
| *(RefundController)* | *(New controller in existing orders module)* | *(src/modules/orders/refund.controller.ts)* | *(Creates new file)* | *(Follow OrderController for route/guard structure — ✅ compliant. But use typed error classes per standard, NOT bare throw pattern seen in controller — ⚠️ deviation)* |
| *(OrderService modifications)* | *(Add refund eligibility check to existing service)* | *(src/modules/orders/order.service.ts)* | *(Modifies existing file)* | *(Add isRefundEligible method. Use typed errors per standard, even though existing methods use bare throws — ⚠️ standard wins)* |
| *(OrderModule wiring)* | *(Register new providers in existing module)* | *(src/modules/orders/order.module.ts)* | *(Modifies existing file)* | *(Add RefundService, RefundRepository to providers array — ✅ compliant)* |

**Pattern conformance assessment:**

For each area where the solution design introduces something new, assess whether it aligns with existing patterns **and** with the coding standards. There are now three reference points: the solution design, the existing codebase pattern, and the coding standard.

| Area | Solution Design Approach | Existing Codebase Pattern | Coding Standard | Resolution |
|------|------------------------|--------------------------|-----------------|------------|
| *(Error handling)* | *(Typed exceptions with HTTP mapping)* | *(Mix — some typed, some bare throws)* | *(Typed error classes with error codes — `../assets/standards/common/error-handling.md`)* | *(Solution design + standard agree → follow standard. Flag bare throws in codebase as deviation)* |
| *(Validation)* | *(class-validator DTOs)* | *(Same — class-validator with ValidationPipe)* | *(Use validation library decorators at boundary)* | *(All three agree → follow codebase pattern — it implements the standard)* |
| *(State management)* | *(State machine for refund status)* | *(No formal state machine — ad hoc transitions)* | *(No specific standard on state machines)* | *(Discuss with user: introduce state machine pattern or follow existing ad hoc approach?)* |

**Resolution logic:**
1. **All three agree** → follow the codebase pattern (it's a proven, standards-compliant implementation).
2. **Solution design + standard agree, codebase deviates** → follow the standard. The codebase deviation is flagged as debt.
3. **Codebase + standard agree, solution design diverges** → discuss with user. The solution design may be proposing an improvement, but the standard should still be met.
4. **Solution design + codebase agree, standard differs** → follow the **standard**. Both the solution design and the codebase are deviating; the standard is the authority.
5. **No applicable standard** → present the choice to the user: follow the codebase pattern for consistency, or adopt the solution design's proposed approach if it's an improvement.

For each divergence, present the choice to the user: **"The solution design proposes [X], the existing codebase uses [Y], and the coding standard requires [Z]. The standard takes precedence for new code. Should we also fix the existing code to match the standard, or leave it as-is and only apply the standard to new code?"**

**Integration points — where new modules connect to existing ones:**

| Connection | From (New) | To (Existing) | Interface | Notes |
|-----------|-----------|--------------|-----------|-------|
| *(Refund reads order data)* | *(RefundService)* | *(OrderService.findById)* | *(Method call — same module)* | *(No new interface needed — same module, direct injection)* |
| *(Refund triggers notification)* | *(RefundService)* | *(NotificationService.send)* | *(Event emission via EventEmitter2)* | *(Follow existing event pattern — see OrderService.create for example)* |
| *(Dashboard shows refund stats)* | *(DashboardService)* | *(RefundService.getStats)* | *(Method call — cross-module import)* | *(DashboardModule must import OrderModule)* |

### Step 10 — Validate Analysis Completeness

Check the codebase analysis against:

- **Component coverage** — does every component in the solution design's component map have a corresponding entry in the integration strategy (Step 9)?
- **File map completeness** — are all files in the affected directories listed (Step 3)?
- **Pattern extraction** — was at least one representative file per role read and patterns extracted (Step 4)?
- **Dependency map** — are the dependency relationships between affected modules documented (Step 5)?
- **Test coverage** — is the existing test structure documented and affected tests identified (Step 6)?
- **Convention documentation** — are naming, organization, and tooling conventions documented (Step 7)?
- **Integration strategy** — does every new or modified component have a clear "where it goes" and "what pattern to follow" entry (Step 9)?
- **No unknowns** — are there any areas where the AI could not determine the pattern or location? If yes, flag them as `[NEEDS CLARIFICATION]`.

### Step 11 — Assemble

Combine all sections into the codebase analysis document. This becomes the first artifact of the implementation planning phase.

### File Output

Write the completed codebase analysis to `docs/<feature>/implementation-package/plan/codebase-analysis.md`.

---

## Output Structure

**0. Technology Versions** — extracted language, framework, and deployment target versions with their sources (from Step 1a). Version-gated standard rules that are not applicable are listed here.

**1. Analysis Scope** — which codebase areas were analyzed and why (from Step 2)

**2. File / Module Map** — directory structure and file classification for affected areas (from Step 3)

**3. Coding Patterns** — patterns extracted from representative files in each layer (from Step 4)

**3a. Standards Compliance Assessment** — comparison of each discovered pattern and convention against the applicable coding standard, with compliant/non-compliant determination and deviation details (from Steps 4a and 7a)

**4. Code Dependencies** — internal module dependencies, shared types/utilities, external packages, coupling points (from Step 5)

**5. Test Structure** — test infrastructure, conventions, and tests affected by the proposed change (from Step 6)

**6. Conventions** — naming, organization, and tooling conventions (from Step 7)

**7. Technical Debt** — debt in affected areas with impact assessment, including standards deviations as a debt category (from Step 8)

**8. Code Integration Strategy** — integration mapping (with standards-aware "Pattern to Follow"), pattern conformance (three-way assessment against solution design, codebase, and standard), and integration points (from Step 9)

---

## Hand-off Gate

Before proceeding to `test-planning`, you must:

1. Write the completed codebase analysis in full.
2. Present it to the user for review with the following questions:
   - **Scope:** Are the affected areas correctly identified? Are any modules missing that the feature will touch?
   - **File map:** Does the file classification match how the codebase is actually organized?
   - **Patterns:** Do the extracted patterns accurately reflect how the codebase works? Are there patterns the code doesn't fully reflect (e.g., a convention that was adopted recently and not yet applied everywhere)?
   - **Reference implementation:** Is the nominated reference module the right one? Are there other modules that better exemplify the desired patterns?
   - **Integration strategy:** Are the "where it goes" decisions correct? Should any component be placed differently?
   - **Pattern divergences:** For areas where the solution design diverges from existing patterns, does the user's chosen resolution make sense?
   - **Standards compliance:** Are the standards deviations accurately identified? Are there any deviations the user considers intentional (i.e., the team deliberately chose a non-standard approach for a documented reason)?
   - **Technical debt:** Are there debt items I missed that are relevant to this feature?
3. If the user identifies corrections, update and re-present before proceeding.
4. Do not proceed until the user explicitly confirms the codebase analysis is accurate.

## Completion Criteria

- [ ] Language, framework, and deployment target versions have been extracted from build configuration files and recorded
- [ ] Testing stack versions have been extracted — test framework, assertion library, mocking library, test runner, and integration test infrastructure (e.g., Testcontainers) with specific versions
- [ ] Version-gated standard rules have been filtered — rules whose version requirements exceed the project's actual versions are excluded from the compliance assessment
- [ ] The analysis boundary is defined — in-scope and out-of-scope areas are explicit
- [ ] All files in affected directories are listed and classified by role
- [ ] At least one representative file per role (controller, service, repository, entity, test) has been read and patterns extracted
- [ ] If the user nominated a reference implementation, it was read thoroughly and used as the primary convention source
- [ ] Internal module dependencies are mapped — what depends on what, and where changes will ripple
- [ ] External dependencies relevant to the feature are listed with versions
- [ ] Existing test infrastructure is documented — framework + version, assertion library + version, mocking library + version, file location, naming, mocking approach, test runner command
- [ ] Tests that will be affected by the proposed change are identified
- [ ] Naming and code organization conventions are documented with concrete examples from the codebase
- [ ] Applicable coding standards have been read and a Standards Compliance Assessment produced — every extracted pattern and convention compared against the relevant standard
- [ ] Non-compliant patterns are flagged with deviation details, severity, and the standard that new code must follow
- [ ] Standards deviations are included as technical debt entries with impact assessment for the feature
- [ ] Technical debt in affected areas is noted with impact assessment for the feature
- [ ] Every solution design component has a code integration strategy — where it goes, what pattern it follows, what it extends or creates
- [ ] The "Pattern to Follow" for each integration entry is standards-aware — codebase patterns are recommended only when they comply with standards; otherwise the standard is recommended
- [ ] Pattern conformance is assessed using the three-way comparison (solution design, codebase, standard) — divergences are identified and resolved with the user, with the standard as the default authority
- [ ] Integration points between new and existing modules are documented with interface details
- [ ] No `[NEEDS CLARIFICATION]` markers remain unresolved
- [ ] The user has explicitly confirmed the codebase analysis is accurate

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Implementation plan is structured around the design document's abstractions rather than the codebase's actual organization | The file/module map (Step 3) and integration strategy (Step 9) ground the plan in the real codebase structure |
| New code uses different patterns from existing code — different naming, different layering, different DI approach | Pattern extraction (Step 4) and convention documentation (Step 7) establish the patterns new code must follow |
| New service is placed in the wrong directory or module, breaking the project's organizational pattern | The integration mapping (Step 9) specifies exactly where each new file goes, based on the observed module organization |
| Implementation discovers mid-way that a module it depends on doesn't work the way the plan assumed | Dependency mapping (Step 5) documents what each module provides and how it is used, before the plan is created |
| Tests break unexpectedly because the plan didn't account for existing tests on modified code | Test structure analysis (Step 6) identifies every existing test that will be affected by the proposed change |
| AI agent guesses at naming conventions and produces inconsistent code (camelCase in a snake_case codebase) | Convention documentation (Step 7) captures actual naming rules with concrete examples from the codebase |
| New code introduces a pattern that conflicts with existing code (e.g., event-driven in a synchronous codebase) | Pattern conformance assessment (Step 9) flags divergences and resolves them with the user before planning begins |
| Technical debt in affected areas makes the feature harder to implement than expected, discovered mid-implementation | Step 8 identifies debt in affected areas and assesses its impact on the feature before the plan is created |
| Reference implementation is outdated or non-representative, leading new code to follow the wrong patterns | Step 4 asks the user to nominate the best reference module and cross-references it against other modules |
| The codebase is described from memory rather than read from the actual code — and the description is wrong | Every step reads the actual source files; the AI never describes the codebase from memory or guessing |
| New code perpetuates a codebase pattern that violates organizational coding standards | The Standards Compliance Assessment (Step 4a) compares every discovered pattern against the applicable standard. Non-compliant patterns are flagged, and the integration strategy (Step 9) recommends the standard for new code, not the deviating codebase pattern |
| AI agent treats a reference implementation as authoritative without checking whether it meets standards | Step 4a evaluates the reference implementation against standards — even the "best" module may have deviations that should not be carried into new code |
| AI agent enforces a standard rule that requires a newer language/framework version than the project uses (e.g., enforcing virtual threads on a Java 17 project) | Step 1a extracts actual versions from build files and filters version-gated rules — rules tagged with `Requires` that exceed the project's version are excluded from the compliance assessment and noted as not applicable |
| Project is on an end-of-life or significantly outdated language/framework version and no one notices | Step 1a records the version and Step 8 flags outdated versions as technical debt, making them visible before implementation begins |
| AI agent generates tests using JUnit 4 annotations (`@Before`, `org.junit.Test`) on a JUnit 5 project, or JUnit 5 on a JUnit 4 project — tests fail to compile | Step 1a extracts testing stack versions (test framework, assertion library, mocking library); Step 6 records these versions alongside test infrastructure patterns, ensuring the test creator skills generate tests with the correct API |
| AI agent uses `@testing-library/react` v14 API patterns on a v16 project (or vice versa), or generates Vitest tests on a Jest project | Step 6 records specific testing tool versions; test creator skills match the detected framework and version |
| Standards deviations in the codebase are invisible — no one knows they exist until a PR review or audit | Standards deviations are surfaced as technical debt (Step 8) and included in the output structure (Section 3a), making them visible before implementation begins |
