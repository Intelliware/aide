# Codebase Orientation

## Change Reference
<!-- Link or inline reference to the change spec this orientation supports -->

## Technology Versions

| Technology | Version | Source File |
|------------|---------|-------------|
| Language | <!-- e.g. TypeScript 5.4 --> | <!-- e.g. tsconfig.json --> |
| Framework | <!-- e.g. React 18 --> | <!-- e.g. package.json --> |
| Platform | <!-- e.g. Node.js 20, iOS 17 → if applicable --> | <!-- e.g. .nvmrc --> |
| Test framework | <!-- e.g. Jest 29 / JUnit 5 / XCTest --> | <!-- e.g. package.json --> |
| Assertion library | <!-- e.g. jest-dom, AssertJ --> | <!-- e.g. package.json --> |
| Mocking library | <!-- e.g. jest.mock, Mockito 5 --> | <!-- e.g. package.json --> |

## Build, Test, and Lint Commands

| Command | Value |
|---------|-------|
| Build | <!-- e.g. npm run build / ./gradlew build --> |
| Test | <!-- e.g. npm test / ./gradlew test --> |
| Lint | <!-- e.g. npm run lint / ./gradlew ktlintCheck --> |

## Standards Loaded

<!-- List only the standards files that were read and apply to this project's stack -->

- **Common**: <!-- e.g. naming-conventions.md, error-handling.md, logging.md, clean-code.md -->
- **Common testing**: <!-- e.g. unit-testing.md, integration-testing.md -->
- **Language**: <!-- e.g. standards/languages/typescript/standards.md -->
- **Language testing**: <!-- e.g. standards/languages/typescript/testing.md -->
- **Framework**: <!-- e.g. standards/frameworks/react/standards.md -->
- **Framework testing**: <!-- e.g. standards/frameworks/react/testing.md -->
- **Platform** (if applicable): <!-- e.g. standards/platforms/ios/standards.md -->
- **Version-gated rules excluded**: <!-- List any rules skipped because they require a newer version than the project uses -->

## Affected Files

<!-- One entry per file listed in the change spec's "Where" section -->

### `[file path]`

- **Role**: <!-- Controller / Service / Component / Hook / Utility / Test / Config -->
- **Naming patterns**: <!-- How files, classes, functions, variables are named -->
- **Import style**: <!-- Framework → third-party → local → relative? -->
- **Error handling**: <!-- How errors are thrown, caught, propagated -->
- **DI / wiring**: <!-- Constructor injection, module registration, provider patterns -->
- **State management** (frontend): <!-- Hooks, stores, context, signals -->
- **API layer** (controller/handler): <!-- Route style, validation, response format -->
- **Logging**: <!-- Which logger, format, how injected -->

<!-- Repeat this block for each affected file -->

## Standards Compliance Snapshot

| Area | Observed Pattern | Standard | Compliant? | New Code Should |
|------|-----------------|----------|-----------|-----------------|
| <!-- Error handling --> | <!-- e.g. Typed exceptions via NestJS built-ins --> | <!-- error-handling.md --> | Yes | Follow codebase pattern |
| <!-- Naming — files --> | <!-- e.g. kebab-case with role suffix --> | <!-- naming-conventions.md --> | Yes | Follow codebase pattern |
| <!-- Logging --> | <!-- e.g. Mix of console.log and NestJS Logger --> | <!-- logging.md --> | **No** | Follow standard — use NestJS Logger |

<!-- Add a row for each pattern area inspected. When compliant: "Follow codebase pattern". When non-compliant: "Follow standard — [standard name]" -->

## Test Infrastructure

| Item | Value |
|------|-------|
| Test file location | <!-- Co-located (*.spec.ts) / Separate (__tests__/ or tests/) --> |
| Test file naming | <!-- e.g. NotificationCard.test.tsx --> |
| Test naming pattern | <!-- e.g. it('does X when Y'), should_do_x_when_y() --> |
| Test organization | <!-- describe/it blocks, nested suites, flat --> |
| Fixture / setup pattern | <!-- beforeEach, factory functions, fixture files --> |
| Mocking approach | <!-- jest.mock(), Mockito @MockBean, manual test doubles --> |

### Existing test files for affected source files

- <!-- src/components/__tests__/NotificationCard.test.tsx -->
- <!-- (none if no test file exists yet) -->

## Gotchas

<!-- Anything non-obvious about the affected area that affects implementation -->

- 

## Reference File

<!-- If a reference file was nominated as a pattern baseline, record it here -->

**Reference file**: <!-- e.g. src/components/ActionButton.tsx — used as pattern baseline for new handler code -->

## Escape Hatch Evaluation

| Trigger | Threshold | Status |
|---------|-----------|--------|
| File count | More than ~5–7 files affected | <!-- PASS / FAIL: N files affected --> |
| Module boundaries | Change crosses module or layer boundaries | <!-- PASS / FAIL --> |
| New data models | Requires new database entities or schema changes | <!-- PASS / FAIL --> |
| New API endpoints | Requires designing new API contracts | <!-- PASS / FAIL --> |
| Architectural decisions | Introduces new patterns or technology choices | <!-- PASS / FAIL --> |
| Complex interdependencies | Deep dependency chains needing architectural analysis | <!-- PASS / FAIL --> |

**Overall**: <!-- PASS — change is appropriate for expedited flow → OR → FAIL — recommend full implementation package -->
