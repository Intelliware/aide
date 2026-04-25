# Reverse Engineer API Framework Documentation - Instructions

**Purpose:** Comprehensive reference for reverse-engineering an existing API framework's source code into structured, maintainable documentation. Produces two complementary documentation sets from a single source of truth: internal framework documentation for framework developers/maintainers, and implementer documentation for API developers who consume the framework.

**Target Audience:** Framework maintainers, technical writers, API developers tasked with documenting an undocumented or under-documented API framework, and AI assistants performing documentation extraction.

**Source Documents:** canonical-reverse-engineering-shape.md, canonical-phase-shape.md, API-Framework-Doc-Template.md, change-tracker-template.md.

---

## Table of Contents

- [What is API Framework Documentation Reverse Engineering?](#what-is-api-framework-documentation-reverse-engineering)
- [The Two-Part Documentation Model](#the-two-part-documentation-model)
- [Why This Matters — Impact on Downstream Consumers](#why-this-matters--impact-on-downstream-consumers)
- [Core AI Principles for Documentation Extraction](#core-ai-principles-for-documentation-extraction)
- [The 7-Step Workflow for API Framework Documentation](#the-7-step-workflow-for-api-framework-documentation)
- [Documentation Package Components](#documentation-package-components)
- [Phase-by-Phase Extraction Process](#phase-by-phase-extraction-process)
- [Change Tracking for API Framework Documentation](#change-tracking-for-api-framework-documentation)
- [Scaffolding Approach — Structure Before Content](#scaffolding-approach--structure-before-content)
- [Best Practices](#best-practices)
- [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
- [Prompt Templates and Examples](#prompt-templates-and-examples)
- [Quick Reference Checklist](#quick-reference-checklist)

---

## What is API Framework Documentation Reverse Engineering?

### Definition

Reverse-engineering API framework documentation is the disciplined process of **reading an existing API framework's source code, configuration, middleware, base classes, dependency injection setup, and tests** and producing structured, accurate documentation that enables both framework maintainers and framework consumers to work effectively.

An API framework is a shared library of base controllers/handlers, middleware components, request/response processing infrastructure, security utilities, validation utilities, error handling conventions, and other reusable patterns that API applications consume as a dependency.

This is NOT:
- Guessing what the framework does based on class or function names
- Writing aspirational documentation for features that don't exist
- Copying framework code comments verbatim without verification
- Documenting only the happy path

This IS:
- Systematically reading source code to extract the truth about every base class, middleware, utility, configuration option, and integration point
- Producing structured documentation that teaches API developers how to use and extend the framework
- Producing internal documentation that enables framework maintainers to understand and evolve the codebase
- Creating living documentation that can be maintained as the framework evolves

### Key Characteristics

- **Source-Code-Driven:** Every documented behavior must be verified against actual source code
- **Two-Part Output:** Internal framework docs (Part A) and implementer docs (Part B)
- **Technology-Agnostic:** Covers Spring Boot, NestJS, Express, ASP.NET Core, FastAPI, Gin, and other frameworks generically
- **Template-Aligned:** Output follows the API Framework Documentation Template structure
- **Change-Tracked:** All documentation changes are logged for auditability and version alignment
- **AI-Optimized:** Structured so AI assistants can consume the documentation and generate correct API implementations

### What Belongs in API Framework Documentation

| **Include in Documentation** | **Do NOT Include** |
| --- | --- |
| Base controller/handler classes with abstract methods and hooks | Speculative features or planned-but-unbuilt functionality |
| Middleware pipeline order and extension points | Assumed middleware that doesn't exist |
| Request/response transformation pipeline | Transformations inferred from naming alone |
| DI/IoC registration patterns with actual syntax | Invented patterns not present in code |
| Error handling conventions and exception base classes | Error handling from outdated documentation |
| Authentication/authorization utilities and their integration points | Security schemes that aren't actually implemented |
| Validation utilities, decorators, and pipes with verified behavior | Validation options not in the source code |
| Database/ORM integration utilities and patterns | Generic ORM docs not specific to the framework |
| Configuration management patterns with actual config keys | Configuration options that don't exist in code |
| Health check and observability utilities | Monitoring features that aren't present |
| Request lifecycle hooks and extension points | Hooks that "should" exist but don't |
| Actual dependency versions from package.json/pom.xml | "Latest" or approximate version ranges |
| Testing utilities and fixtures provided by the framework | Testing tools not included in the framework |

**Guiding Principle:** If you cannot point to the line of source code that proves a documented behavior, do not document it as fact. Flag it as "UNVERIFIED — needs source confirmation" instead.

---

## The Two-Part Documentation Model

### Overview

API framework documentation is managed centrally but published in two parts. Both parts derive from the same extraction process but serve different audiences with different needs.

### Part A: Framework Documentation (Full)

**Audience:** Framework developers, maintainers, contributors — people who work on the framework codebase itself.

**Scope:** Everything — internal architecture, layered design, request pipeline, service patterns, testing infrastructure, DI/IoC patterns, configuration management, database integration utilities, and the complete implementation details behind every public API.

**Purpose:**
- Enable maintenance and evolution of the framework itself
- Document internal architecture so future maintainers understand WHY decisions were made
- Record internal patterns, conventions, and constraints
- Provide the complete source of truth from which Part B is derived

**Includes (in addition to everything in Part B):**
- Internal middleware implementations and their state management
- Private base class methods and their contracts
- Internal request/response transformation mechanisms
- Build and publish pipeline details
- Internal test utilities and testing patterns
- Internal DI token usage and provider chains
- Framework configuration and environment setup
- Performance internals and optimization strategies
- Migration and deprecation implementation details

### Part B: Implementer Documentation (Consumer-Facing)

**Audience:** API developers who USE the framework to build applications. They do NOT develop the framework itself.

**Scope:** Public interfaces, abstract base classes, public middleware, configuration options, DI tokens available to consumers, extension points, utilities, patterns, recipes, anti-patterns, and integration guides.

**Purpose:**
- Enable application developers to use the framework correctly and efficiently
- Document how to extend, configure, and customize the framework
- Provide recipes and patterns for common API scenarios
- Define anti-patterns to prevent misuse
- Serve as context for AI-assisted code generation

**Explicitly Excludes:**
- Internal implementation details (how a base class works internally)
- Private methods and properties
- Internal request pipeline transformations not available to consumers
- Build and publish pipeline details
- Framework-internal test utilities (only consumer-facing test helpers)
- Source code organization of the framework itself (only the recommended app structure)

### Relationship Between Parts

```
Source Code (Single Source of Truth)
        │
        ├──→ Extraction Process (this guide)
        │         │
        │         ├──→ Part A: Full Framework Documentation
        │         │         (maintainers, contributors)
        │         │
        │         └──→ Part B: Implementer Documentation
        │                   (app developers, AI assistants)
        │
        └──→ Change Tracker (logs all documentation changes)
```

**Rules:**
- Part B is always a **strict subset** of Part A
- Any information in Part B must also exist in Part A
- Part A may contain information that is deliberately excluded from Part B
- When Part A changes, evaluate whether Part B needs updating
- The Change Tracker records changes to both parts

### How to Decide Where Content Goes

| **Ask Yourself** | **If Yes → Part A Only** | **If No → Both Parts** |
| --- | --- | --- |
| Does this describe an internal implementation detail? | ✅ | |
| Does this describe a private method or class? | ✅ | |
| Would changing this require modifying the framework source? | ✅ (internals) | ✅ (public API changes affect both) |
| Does an API developer need to know this to use the framework? | | ✅ Both Parts |
| Does this describe a public abstract method or hook? | | ✅ Both Parts |
| Does this describe how to extend or configure the framework? | | ✅ Both Parts |
| Does this describe a public utility, decorator, or middleware? | | ✅ Both Parts |
| Does this describe the framework's build system? | ✅ | |
| Does this describe DI tokens available to consumers? | | ✅ Both Parts |
| Does this describe request/response pipeline extension points? | | ✅ Both Parts |

---

## Why This Matters — Impact on Downstream Consumers

### Impact on API Developers

Accurate framework documentation directly enables:
- **Correct usage** — developers use base classes and utilities as designed, not by trial-and-error
- **Consistent patterns** — teams follow the same approach instead of inventing ad-hoc solutions
- **Faster onboarding** — new developers learn the framework from documentation, not by reading source code
- **AI-assisted development** — AI assistants generate correct API implementations when given accurate documentation
- **Fewer bugs** — anti-patterns are documented, preventing common mistakes

### Impact on AI-Assisted Code Generation

AI assistants rely heavily on framework documentation to generate correct API implementation code. Poor documentation leads to:
- AI inventing plausible but wrong extension patterns
- AI using deprecated base classes or utilities
- AI generating code that compiles but doesn't follow framework conventions
- AI missing required middleware registration or DI setup
- AI implementing features incorrectly due to missing documentation about request pipeline hooks

**Critical Insight:** The API Framework Documentation Template is specifically structured to give AI assistants the information they need in the order they need it. Following the template structure is not optional — it is a functional requirement for AI-assisted development.

### The Quality Chain

```
Source Code Accuracy → Documentation Accuracy → API Implementation Accuracy
     (Truth)              (Extracted Truth)         (Applied Truth)
```

If documentation drifts from source code, every downstream consumer — human and AI — produces incorrect work.

---

## Core AI Principles for API Framework Documentation Extraction

> **Universal Principles:** See `canonical-reverse-engineering-shape.md` § Core AI Principles for Documentation Extraction for the six universal principles. Below are the API Framework-specific applications.

### 1. AI is Intelligent, But Not Smart — API Framework Application

**How to apply:**
- Have AI read base class source code one at a time, not the entire framework at once
- After AI documents a base class, verify every abstract method, virtual method, and hook against the source
- Check for internal methods that might be overridden despite being private
- Verify what the base class does before extension points are called

### 2. Context is Critical — API Framework Application

**How to apply:**
- Start with the request pipeline and middleware order before documenting individual middleware
- Read configuration management patterns before documenting configuration options
- Provide the DI/IoC container setup for dependency versions
- Have AI read shared types/interfaces before documenting components that use them

### 3. AI Will Try to Do More Than Asked — API Framework Application

**How to apply:**
- Be explicit: "Document ONLY what exists in the source code. Do NOT invent extension points or configuration options."
- After documenting, ask: "For each extension point you documented, show me the line of code where it is defined."
- Verify examples against actual framework code, not against what seems logical
- State what the framework does NOT support

### 4. Token Limitations Affect Depth — API Framework Application

**How to apply:**
- Document one middleware or base class at a time
- For complex components, break into: overview first, then configuration options, then extension points, then usage examples
- Document the global request pipeline once, then reference it for each component
- For large frameworks, chunk the documentation by feature area or module

### 5. Verification is Non-Negotiable — API Framework Application

**How to apply:**
- After AI documents a base class, cross-check every abstract/virtual method
- Verify configuration option names and types against the configuration schema
- Check that documented extension points are actually called by the framework
- Flag anything that cannot be verified as "UNVERIFIED — needs source confirmation"

### 6. AI Has Short Memory (Session Only) — API Framework Application

**How to apply:**
- At the start of each session, have AI read the documentation produced so far
- Reference the framework overview and conventions before documenting new components
- Commit documentation frequently so it's always current
- Use the extraction status tracker as a map for what's done and what remains

---

## The 7-Step Workflow for API Framework Documentation

> **Universal Workflow:** See `canonical-reverse-engineering-shape.md` § The 7-Step Workflow for the standard workflow structure. Below are the API Framework-specific prompts and extraction order.

The workflow is repeated for each documentation section/component being extracted. Use these prompts for API framework-specific guidance:

### API Framework-Specific Prompts by Step

**Step 1 (Context of Deliverable):**
```
"We are reverse-engineering documentation for [FRAMEWORK NAME] version [VERSION].
We are producing:
- Part A (full framework docs for maintainers)
- Part B (implementer docs for API developers)

Currently documenting [COMPONENT/MIDDLEWARE/SECTION].
Source files: [list]

Document ONLY what exists in source code. Do NOT invent features, extension points, or configuration options."
```

**Step 2 (Context of Audience/Environment):**
- "What source files make up the [MiddlewareName] middleware?"
- "What shared interfaces and types does this base class depend on?"
- "What is the framework's language/runtime version and key dependencies?"

**Step 3 (Refine Feedback):**
- "This framework uses constructor-based DI — note this"
- "Middleware runs in this order: [list] — document this"
- "Only document the current API — ignore deprecated v1 APIs"

**Step 5 (Extraction Order for API Frameworks):**
1. Framework overview and architecture
2. Environment and configuration (package.json, config files)
3. Project structure and conventions
4. Request pipeline and middleware order
5. Shared types, interfaces, and enums
6. Base controllers/handlers
7. Middleware components — one at a time
8. Service layer utilities
9. DI/IoC registration patterns
10. Validation utilities and decorators
11. Error handling utilities
12. Authentication/authorization utilities
13. Database integration utilities
14. Testing utilities and fixtures
15. Logging and observability utilities
16. Configuration management patterns
17. Health check and monitoring utilities
18. Patterns and recipes
19. Anti-patterns

**Step 7 (Verify Understanding):**
- "List every abstract and virtual method you found. For each, show the source file line number."
- "What are the configuration options? Show source lines for each."
- "What extension points exist? Show the code that calls them."
- "List the middleware order and what each middleware does."

---

## Documentation Package Components

### File Structure

```
docs/framework/
├── README.md                          # Index, relationships, how to maintain
├── CHANGE-TRACKER.md                  # All documentation changes logged here
│
├── part-a-full/                       # Part A: Full Framework Documentation
│   ├── 01-framework-overview.md
│   ├── 02-environment-configuration.md
│   ├── 03-project-structure.md
│   ├── 04-request-pipeline.md         # Middleware order and extensions
│   ├── 05-base-controllers-handlers.md
│   ├── 06-service-layer-patterns.md
│   ├── 07-dependency-injection.md
│   ├── 08-validation-utilities.md
│   ├── 09-error-handling.md
│   ├── 10-authentication-authorization.md
│   ├── 11-database-utilities.md
│   ├── 12-configuration-management.md
│   ├── 13-health-checks-monitoring.md
│   ├── 14-logging-observability.md
│   ├── 15-testing-utilities.md
│   ├── 16-internal-architecture.md    # Part A ONLY
│   ├── 17-build-deploy-pipeline.md    # Part A ONLY
│   ├── 18-common-patterns-recipes.md
│   ├── 19-anti-patterns.md
│   ├── 20-migration-upgrade.md
│   ├── 21-glossary.md
│   ├── 22-quick-reference.md
│   └── appendix-a-reference-app.md
│
├── part-b-implementer/                # Part B: Implementer Documentation
│   ├── 01-framework-overview.md
│   ├── 02-environment-configuration.md
│   ├── 03-project-structure.md
│   ├── 04-request-pipeline.md
│   ├── 05-base-controllers-handlers.md
│   ├── 06-service-layer-patterns.md
│   ├── 07-dependency-injection.md
│   ├── 08-validation-utilities.md
│   ├── 09-error-handling.md
│   ├── 10-authentication-authorization.md
│   ├── 11-database-utilities.md
│   ├── 12-configuration-management.md
│   ├── 13-health-checks-monitoring.md
│   ├── 14-logging-observability.md
│   ├── 15-testing-utilities.md
│   ├── 16-common-patterns-recipes.md
│   ├── 17-anti-patterns.md
│   ├── 18-migration-upgrade.md
│   ├── 19-glossary.md
│   ├── 20-quick-reference.md
│   └── appendix-a-reference-app.md
│
└── reference/
    ├── extraction-status.md           # Tracks what has/hasn't been documented
    └── verification-log.md            # Records verification results
```

### Extraction Status Tracker

**Purpose:** Track which parts of the framework have been documented.

**Location:** `docs/framework/reference/extraction-status.md`

**Format:**

```markdown
# Extraction Status

## Summary
- Total middleware: [X]
- Documented: [Y]
- Verified: [Z]
- Remaining: [W]

## Base Classes / Abstract Controllers

| Class | Source Path | Part A | Part B | Verified | Notes |
|-------|-----------|--------|--------|----------|-------|
| BaseController | src/base/ | ✅ | ✅ | ✅ | |
| ApiGateway | src/gateway/ | ✅ | ✅ | 🔵 Pending | Complex — needs second pass |

## Middleware

| Middleware | Source Path | Part A | Part B | Verified | Notes |
|-----------|-----------|--------|--------|----------|-------|
| AuthMiddleware | src/middleware/auth/ | ✅ | ✅ | ✅ | |
| LoggingMiddleware | src/middleware/logging/ | 🟡 In Progress | 🔵 Not Started | | |

## Utilities

| Utility | Source Path | Part A | Part B | Verified | Notes |
|---------|-----------|--------|--------|----------|-------|
| ValidationDecorators | src/validation/ | ✅ | ✅ | ✅ | |
| ErrorHandling | src/errors/ | 🔵 Not Started | 🔵 Not Started | | |

## Configuration

| Item | Source Path | Part A | Part B | Verified | Notes |
|------|-----------|--------|--------|----------|-------|
| Environment Config | src/config/ | ✅ | ✅ | ✅ | |
```

**Status Values:**
- 🔵 **Not Started** — Not yet extracted
- 🟡 **In Progress** — Extraction underway
- ✅ **Completed** — Extraction finished
- 🔴 **Blocked** — Source code unclear, needs framework team input
- ⚠️ **Needs Update** — Source code has changed since extraction

---

## Phase-by-Phase Extraction Process

### Phase 1: Framework Discovery and Inventory

#### Phase Identity

**Phase ID:** EXTRACT-001
**Phase Name:** Framework Discovery and Inventory
**FR Mapping:** None (foundational)

#### Goal

A complete inventory of the framework's public and internal API surface exists, organized by category, with source file paths identified for every artifact.

#### Dependencies

None

#### Plan

1. Read the framework's main config/bootstrap files to extract startup setup and initialization
2. Read `package.json` or equivalent to extract name, version, dependencies, and peer dependencies
3. Read the framework's build configuration to identify entry points and public exports
4. Read the framework's `public-api.ts`, barrel export files, or index files to identify the complete public API surface
5. Walk the `src/` directory to create a file inventory, categorizing by: base classes, middleware, utilities, services, decorators, configuration, models/types, tests, validation
6. For each public export, record: export name, source file path, type (base class/middleware/utility/service/decorator/type)
7. Identify internal (non-exported) artifacts that exist in source but are not in the public API
8. Create the `extraction-status.md` file with all identified artifacts at "Not Started" status
9. Create the `CHANGE-TRACKER.md` file with initial structure
10. Create the scaffolding structure for Part A and Part B documentation

#### Outcome

- Complete inventory of all framework exports (public API)
- Complete inventory of internal artifacts (Part A only)
- Extraction status tracker created and populated
- Change tracker created
- Documentation scaffolding (files and headers) created for both parts

#### Automated Verification (AI Gate)

1. Compare public exports against inventory — every export must be listed
2. Verify all source file paths in inventory are valid
3. Verify scaffolding files exist with correct headers

**Expected:**
- 100% of public exports are inventoried
- All file paths resolve to actual files
- Scaffolding structure matches the template

#### Human Verification (Human Gate)

1. Review inventory for completeness — any base classes, middleware, or utilities missing?
2. Verify Part A vs. Part B classification is correct
3. Confirm framework version and dependency versions are accurate

#### Success Criteria

✅ Public API inventory complete
✅ Internal artifacts inventory complete (Part A)
✅ Extraction status tracker created
✅ Change tracker created
✅ Scaffolding structure created for both parts
✅ Framework version and dependencies recorded

---

### Phase 2: Foundation Extraction

#### Phase Identity

**Phase ID:** EXTRACT-002
**Phase Name:** Foundation Extraction (Overview, Environment, Structure)
**FR Mapping:** None (foundational)

#### Goal

Template sections 1–3 (Framework Overview, Environment and Configuration, Project Structure and Conventions) are fully documented for both Part A and Part B.

#### Dependencies

EXTRACT-001 Framework Discovery and Inventory

#### Plan

1. Read the framework's main documentation and README for stated purpose and philosophy
2. Read configuration/initialization code to understand architecture style
3. Extract prerequisite versions from build files and config (language runtime, package manager, dependent frameworks)
4. Extract supported platforms/runtimes
5. Document installation commands from package.json or build setup
6. Extract required application configuration changes by reading example apps or getting started guides
7. Extract runtime configuration options from the framework's configuration classes/schemas
8. Document the recommended project structure from the framework's conventions, examples, or schematics
9. Extract naming conventions from existing code patterns
10. Extract module/dependency registration patterns from the framework's bootstrap code
11. Document how to bootstrap an application using the framework
12. For Part A: additionally document internal architecture, module boundaries, and build pipeline
13. Log all extracted content in the Change Tracker

#### Outcome

- Framework Overview documented (both parts)
- Environment and Configuration documented (both parts)
- Project Structure and Conventions documented (both parts)
- Internal Architecture documented (Part A only)
- Build Pipeline documented (Part A only)
- Application bootstrapping guide documented (both parts)

#### Automated Verification (AI Gate)

1. Verify all dependency versions match package.json/pom.xml exactly
2. Verify configuration options match the framework's config schema
3. Verify bootstrap documentation compiles and runs

**Expected:**
- Zero discrepancies between documented versions and package files
- Every configuration option has a verified default value
- Bootstrap example works successfully

#### Human Verification (Human Gate)

1. Review framework overview for accuracy — does it correctly describe what the framework is?
2. Verify design principles match the framework team's intent
3. Confirm project structure matches the framework's recommended patterns

#### Success Criteria

✅ Template sections 1–3 complete for Part A
✅ Template sections 1–3 complete for Part B
✅ All versions verified against package files
✅ Configuration options verified against source
✅ Bootstrap example works
✅ Changes logged in Change Tracker

---

### Phase 3: Request Pipeline and Middleware Extraction

#### Phase Identity

**Phase ID:** EXTRACT-003
**Phase Name:** Request Pipeline and Middleware Extraction
**FR Mapping:** None (foundational — pipeline affects all endpoints)

#### Goal

The complete request pipeline (middleware order, hooks, configuration) is documented, and each middleware component is fully documented with configuration options and extension points.

#### Dependencies

EXTRACT-002 Foundation Extraction

#### Plan

1. Read bootstrap/application startup code to extract middleware registration order
2. For each middleware in the pipeline: document when it runs, what it does, configuration options
3. Document how the framework handles requests before they reach application code
4. Document how the framework handles responses after application code produces them
5. Document how to add custom middleware to the pipeline
6. Document middleware lifecycle hooks if available
7. Document error handling in the middleware pipeline
8. Read test files to understand middleware behavior in different scenarios
9. For Part A: additionally document middleware internal state management and performance considerations
10. Log all extracted content in the Change Tracker

#### Outcome

- Request pipeline documentation (both parts)
- Middleware order and dependencies documented (both parts)
- Middleware configuration options documented (both parts)
- Middleware extension points documented (both parts)
- Error handling pipeline documented (both parts)
- Internal middleware implementation details (Part A only)

#### Automated Verification (AI Gate)

1. Verify middleware order matches the actual code execution order
2. Verify all configuration options exist in the source
3. Verify extension points are actually called by the framework

**Expected:**
- 100% of middleware documented
- All configuration options verified
- All extension points verified as extensible

#### Human Verification (Human Gate)

1. Review pipeline documentation for logical flow and clarity
2. Verify middleware configuration options are accurate and complete
3. Confirm extension points are practically useful

#### Success Criteria

✅ Request pipeline documented
✅ All middleware documented with verified configuration
✅ Extension points documented and verified
✅ Error handling pipeline documented
✅ Changes logged in Change Tracker

---

### Phase 4: Shared Types, Interfaces, and DI Patterns Extraction

#### Phase Identity

**Phase ID:** EXTRACT-004
**Phase Name:** Shared Types, Interfaces, and Dependency Injection Patterns
**FR Mapping:** None (foundational — types and DI are used throughout)

#### Goal

Every public interface, enum, type alias, DTO base class, and DI registration pattern is documented with exact type signatures, default values, and usage context.

#### Dependencies

EXTRACT-002 Foundation Extraction

#### Plan

1. Read all model/type/interface files exported from the public API
2. For each interface: extract every property with its type, optionality, and default value
3. For each enum: extract every member with its string/numeric value
4. For each type alias: extract the full type definition
5. Read all DI token definitions and provider registration patterns
6. For each DI token: extract the token name, type, default provider, and purpose
7. Document provider override patterns with exact code examples
8. Document DI convenience functions and decorators (e.g., `@Inject()`, `provides()`)
9. Document service lifetimes and scoping (singleton, transient, request-scoped)
10. For Part A: additionally document internal DI tokens and internal types
11. Log all extracted content in the Change Tracker

#### Outcome

- Complete interface reference (both parts for public, Part A only for internal)
- Complete enum reference (both parts)
- Complete type alias reference (both parts)
- Complete DI token reference (both parts for public, Part A only for internal)
- DI registration pattern documentation (both parts)
- Service lifetime and scoping documentation (both parts)

#### Automated Verification (AI Gate)

1. Verify every documented interface exists in the public API exports
2. Verify every property type matches the source exactly
3. Verify every enum value matches the source exactly
4. Verify every DI token exists and its default provider is correct

**Expected:**
- 100% match between documented types and source types
- Zero type signature errors
- All DI tokens verified with correct defaults

#### Human Verification (Human Gate)

1. Review interface documentation for completeness — any missing properties?
2. Verify DI token descriptions accurately convey their purpose
3. Confirm the Part A/Part B classification of types is correct

#### Success Criteria

✅ All public interfaces documented
✅ All public enums documented
✅ All public type aliases documented
✅ All public DI tokens documented
✅ Internal types and tokens documented (Part A only)
✅ Type signatures verified against source
✅ DI patterns documented and verified
✅ Changes logged in Change Tracker

---

### Phase 5: Base Controller/Handler Extraction

#### Phase Identity

**Phase ID:** EXTRACT-005
**Phase Name:** Base Controller/Handler Classes
**FR Mapping:** None (foundational)

#### Goal

All base controller/handler classes are fully documented following the component documentation template, for both Part A and Part B.

#### Dependencies

EXTRACT-003 Request Pipeline Extraction
EXTRACT-004 Shared Types and DI Extraction

#### Plan

1. Read the base controller/handler source file
2. Extract: class name, purpose, abstract methods (which must be overridden), virtual/hook methods (which may be overridden)
3. For each method: extract signature, parameters with types, return type, description, when it's called in the request lifecycle
4. Document lifecycle hooks and their timing relative to request processing
5. Extract protected/public properties available to subclasses
6. Document inherited methods from parent classes
7. Document any decorators required when extending this class
8. Document any DI requirements (what must be injected)
9. Read test files to extract: expected behaviors, edge cases, error conditions
10. Write minimal implementation example (simplest possible)
11. Write realistic implementation example (common overrides and patterns)
12. Document edge cases and gotchas discovered from source and tests
13. For Part A: additionally document internal state, lifecycle implementation details
14. Log changes in the Change Tracker

#### Outcome

- Base class documented (both parts)
- All abstract/virtual methods documented (both parts)
- Lifecycle and hooks documented (both parts)
- Usage examples provided (both parts)
- Extension patterns documented (both parts)

#### Automated Verification (AI Gate)

1. For each method: verify name, signature, and parameters against source
2. Verify lifecycle hooks are actually called by the framework
3. Verify inheritance relationships are correct

**Expected:**
- 100% of abstract/virtual methods documented
- All methods verified against source
- All lifecycle hooks verified

#### Human Verification (Human Gate)

1. Review minimal and realistic usage examples — are they correct?
2. Verify edge cases and gotchas are accurate
3. Confirm Part B has no internal implementation details

#### Success Criteria

✅ Base class documented
✅ All methods verified
✅ Lifecycle documented
✅ Usage examples provided
✅ Extension patterns documented
✅ Extraction status updated
✅ Changes logged in Change Tracker

---

### Phase 6: Utilities, Decorators, and Validation Extraction (Repeat Per Category)

#### Phase Identity

**Phase ID:** EXTRACT-006.X (where X is the utility category)
**Phase Name:** Utility/Decorator/Validation Extraction — [Category Name]
**FR Mapping:** Maps to whatever functional areas the utilities serve

#### Goal

All utilities, decorators, and validation components in the [Category] are fully documented.

#### Dependencies

EXTRACT-004 Shared Types Extraction
EXTRACT-005 Base Controller Extraction (if utilities depend on it)

#### Plan

For each utility/decorator/validation component:

1. Read the source file
2. Extract: exported function/class name, purpose, all parameters (name, type, default, optional/required)
3. For function utilities: extract return type and possible exceptions
4. For decorators: document how to apply them, what they do, when they run
5. For validation: document what is validated, error messages, how to use with the framework
6. Document framework-specific requirements (e.g., must use with HttpModule)
7. Extract any configuration options
8. Read test files to extract edge cases and expected behavior
9. Write minimal usage example
10. Write realistic usage example with options/configuration
11. Document when to use vs. when not to use
12. For Part A: additionally document internal implementation patterns

#### Outcome

- Utilities documented (both parts)
- Decorators documented with application patterns (both parts)
- Validation rules documented (both parts)
- Configuration options documented (both parts)
- Usage examples provided (both parts)

#### Automated Verification (AI Gate)

1. Verify all parameters and return types match source
2. Verify configuration options exist in source
3. Verify usage examples compile and work

**Expected:**
- 100% of utilities documented
- All parameters and return types verified
- Examples work correctly

#### Human Verification (Human Gate)

1. Review usage examples for clarity and correctness
2. Verify that practical usage patterns are documented
3. Confirm Part B has no internal details

#### Success Criteria

✅ All utilities in category documented
✅ All parameters verified
✅ All configuration options verified
✅ Usage examples provided
✅ When/when-not-to-use guidance provided
✅ Changes logged in Change Tracker

---

### Phase 7: Error Handling, Authentication, and Database Integration

Follow the same structure as Phase 6 but focused on:
- Error handling base classes and utilities
- Authentication and authorization utilities and decorators
- Database integration utilities and patterns
- Configuration and environment management utilities

---

### Phase 8: Patterns, Recipes, and Anti-Patterns Extraction

#### Plan

1. Read the framework's example/demo application (if it exists)
2. Extract common patterns: CRUD endpoints, authentication flow, validation, error handling, database transactions, testing
3. Read the framework's issue tracker or code review comments for common mistakes
4. Document anti-patterns by category: controller structure, service layer, error handling, testing, middleware usage
5. For each pattern: provide complete, copy-paste-ready code snippets
6. For each anti-pattern: document what's wrong, why it's wrong, and the correct approach

---

### Phase 9: Testing, Observability, and Reference Extraction

#### Plan

1. Extract test environment setup from the framework's test utilities
2. Document framework-provided test helpers, mocks, and fixtures
3. Extract observability/monitoring patterns (logging, metrics, tracing)
4. Document health check implementation patterns
5. Create the quick reference cheat sheet
6. Create or document the reference app

---

## Change Tracking for API Framework Documentation

> **Common Structure:** See `canonical-reverse-engineering-shape.md` § Change Tracking for the universal change tracking rules, versioning convention, change types, and version alignment process. See `../_shared/templates/change-tracker-template.md` for the full Change Tracker file structure.

**Location:** `docs/framework/CHANGE-TRACKER.md`

**Parts Affected Values:**
- A = Internal Framework Docs
- B = Implementer Docs
- Both = Affects both Part A and Part B

**Every documentation modification must be logged** with:
- Change type (Initial Extraction, Correction, Framework Update, Restructure, Addition, Deprecation, Removal)
- Affected part(s): A / B / Both
- Framework version and documentation version
- Verification method (how accuracy was confirmed)
- Cross-impact (other sections affected)

---

## Scaffolding Approach — Structure Before Content

> **Standard Process:** See `canonical-reverse-engineering-shape.md` § Scaffolding Approach for the standard scaffolding workflow.

**API Framework-Specific Scaffolding Prompt:**
```
"Based on the API Framework Documentation Template and our inventory of [FRAMEWORK NAME],
propose the file structure for Part A and Part B:

Part A Files:
- Which numbered sections do we need (01-framework-overview through 22-quick-reference)?
- Which sections are Part A-only (e.g., 16-internal-architecture)?

Part B Files:
- Which numbered sections do we need (01-framework-overview through 20-quick-reference)?
- How does Part B map to Part A sections?

Show structure and headers ONLY. Do not extract content."
```

---

## Best Practices

### 1. Read Source Code, Not Just Comments

**Principle:** Comments may be outdated. The code is the truth.

**Do:**
- Verify every documented behavior against actual code
- Check default values in the code, not in comments
- Read test files to understand expected behavior

**Don't:**
- Trust docstring comments without verifying against implementation
- Trust README examples without verifying they work with the current code

### 2. Extract One Artifact at a Time

**Principle:** Focused extraction produces accurate documentation.

**Do:**
```
"Read the source code for AuthMiddleware (src/middleware/auth.ts)
and extract: all parameters, configuration options, hooks/extension points,
and how it integrates with the request pipeline."
```

**Don't:**
```
"Document all the authentication components."
```

### 3. Verify Method Signatures Obsessively

**Principle:** Wrong parameter types are the most common documentation error.

**Do:**
- For each method, find the exact function/method signature
- If overloaded, document all overloads
- Verify parameter types and return types exactly

### 4. Maintain Part A / Part B Discipline

**Principle:** Implementers should never see internal details.

**Do:**
- After extracting a utility, explicitly separate public API from internals
- Review Part B to ensure no internal details leaked through
- Ask: "Would an app developer need to know this to use this utility?"

### 5. Use Tests as Documentation Source

**Principle:** Test files reveal edge cases, error conditions, and expected behavior.

**Do:**
- Read test files alongside source files
- Extract test descriptions as documented behaviors
- Use test data as examples for documentation

### 6. Document Extension Points Explicitly

**Principle:** Framework consumers need to know what they can override or extend.

**Do:**
- List every override point a base class provides
- Document lifecycle hooks clearly
- Document how to register custom middleware or components

### 7. Flag Uncertainties Rather Than Guess

**Principle:** "UNVERIFIED" is better than wrong.

**Do:**
- If source code is ambiguous, flag the documentation as needing verification
- Use `<!-- UNVERIFIED: [reason] -->` markers in documentation
- Track unverified items in the extraction status tracker
- Resolve unverified items with the framework team

---

## Common Pitfalls and Solutions

### Pitfall 1: AI Inventing Extension Points

**Symptom:** Documentation includes override points or configuration options that don't exist in source code.

**Solution:**
- After each extraction, ask AI to cite the source line for every documented hook/option
- Cross-reference against the actual framework code
- Verify with: "List ONLY the methods that can be overridden in this base class. Do NOT infer additional ones."

### Pitfall 2: Documenting Deprecated/Removed Features

**Symptom:** Documentation includes features from an older version of the framework.

**Solution:**
- Always check the current source code, not historical versions
- Check for `@deprecated` JSDoc tags
- If README mentions features not in the current source, verify before documenting

### Pitfall 3: Leaking Internal Details into Part B

**Symptom:** Implementer documentation references private methods, internal state, or build internals.

**Solution:**
- After completing Part B for any section, review specifically for internal references
- Search for: private method names, internal utility references, build tool references
- Ask: "Would an app developer ever call this or need to know about this?"

### Pitfall 4: Wrong Parameter Types or Signatures

**Symptom:** Documented method signatures don't match implementation.

**Solution:**
- For every method parameter, find the actual parameter declaration in source
- Check type hints/annotations in the source code
- Verify against test files that call the method

### Pitfall 5: Missing Error Cases and Exceptions

**Symptom:** Documentation doesn't mention errors that the code actually throws.

**Solution:**
- Read error handling code in the utility/middleware
- Check what exceptions can be thrown
- Document error conditions and how to handle them

### Pitfall 6: Incomplete Configuration Documentation

**Symptom:** Documented configuration options miss optional parameters or defaults.

**Solution:**
- Extract configuration from actual source interfaces/classes
- For each option, find the default value in the code
- Include optional parameters and their defaults

### Pitfall 7: Context Loss Across Sessions

**Symptom:** New sessions produce documentation that contradicts earlier sessions.

**Solution:**
- At the start of each session, have AI read existing documentation and conventions
- Reference the extraction status tracker for what's been completed
- Commit frequently so documentation is always current

---

## Prompt Templates and Examples

### Template 1: Starting a New Extraction Session

```
We are reverse-engineering documentation for [FRAMEWORK NAME] version [VERSION].

Please read the following context:
- Extraction status: docs/framework/reference/extraction-status.md
- Existing documentation: docs/framework/part-b-implementer/[relevant files]
- Change tracker: docs/framework/CHANGE-TRACKER.md

We are extracting documentation for [COMPONENT/MIDDLEWARE/SECTION].
Source files to read:
- [file path 1]
- [file path 2]

Produce documentation for BOTH Part A (full) and Part B (implementer).
Document ONLY what exists in the source code. Do NOT invent features.
```

### Template 2: Extracting a Middleware Component

```
Read the source code for [MiddlewareName]:
- TypeScript/Python/Java: [path to source file]
- Tests: [path to test file]

Extract and document:
1. Middleware name and purpose (one sentence)
2. What this middleware does in the request pipeline
3. When it runs (relative to other middleware)
4. ALL configuration options with: name, type, default value, required (yes/no), description
5. ALL extension points/hooks that consumers can use
6. Lifecycle (init, request processing, response, cleanup)
7. Error handling and how this middleware handles errors
8. Integration with other framework components (DI, configuration, etc.)
9. Minimal usage example (required configuration only)
10. Realistic usage example (with optional configuration and extensions)
11. Edge cases and gotchas (from source code and tests)

For Part A additionally document:
- Internal state management
- How it integrates with the request lifecycle
- Performance considerations

For each configuration option, show me the exact line of source code where it is defined.
Do NOT invent configuration options.
```

### Template 3: Extracting Shared Types and DI Patterns

```
Read all type/interface files exported from the framework's public API:
- [path to types/interfaces files]
- [path to index/barrel exports]

For each public type, extract:
1. Full type/interface definition with ALL properties
2. Property types (exact, not simplified)
3. Optional vs required properties
4. Default values (if discoverable)
5. JSDoc comments (if present)

For DI patterns, extract:
1. How to register services/dependencies
2. Available scopes/lifetimes
3. How to override default providers
4. Available DI tokens and what they provide

Organize into: Interfaces, Enums, Type Aliases, and DI Patterns.

Document ONLY types and patterns that appear in the public API.
Flag any types referenced in public APIs but not directly exported.
```

### Template 4: Verifying Extracted Documentation

```
I need to verify the documentation we extracted for [COMPONENT/UTILITY].

Please re-read the source file: [path]

For each documented item, confirm:
1. Configuration option [name]: Is the type [documented type]? Is the default [documented default]?
2. Method [name]: Is the signature [documented signature]?
3. Hook [name]: Is it actually called by the framework?
4. Error [type]: Does the code actually throw this error?

Report any discrepancies between our documentation and the current source code.
```

### Template 5: Logging Changes

```
Log the following change in docs/framework/CHANGE-TRACKER.md:

Change Type: [Initial Extraction / Correction / Framework Update]
Affected Parts: [Part A / Part B / Both]
Section/File: [file path]
Framework Version: [version]
Description: [what was documented or changed]
Verification: [how it was verified]
Cross-Impact: [other affected sections, or None]

Increment the change number sequentially.
```

---

## Quick Reference Checklist

> **Common Items:** See `canonical-reverse-engineering-shape.md` § Quick Reference Checklist — Common Items for universal checklist items. Below are API Framework-specific items.

### Before Starting Extraction

- [ ] Framework source code accessible
- [ ] Framework version identified and recorded
- [ ] Extraction status tracker created
- [ ] Change tracker created
- [ ] Scaffolding structure approved for both parts
- [ ] New conversation started (fresh context)

### For Each Extraction Session

- [ ] AI has read existing documentation and conventions
- [ ] Source files for the artifact are identified
- [ ] AI reads source code (not just comments/README)
- [ ] Documentation produced for Part A (if applicable)
- [ ] Documentation produced for Part B (if applicable)
- [ ] Every method/function parameter verified against source with exact type
- [ ] Every configuration option verified against source with exact default
- [ ] Extension points verified as actually extensible
- [ ] Error cases identified and documented
- [ ] Usage examples are accurate and work
- [ ] Part B reviewed for absence of internal details
- [ ] Extraction status updated
- [ ] Changes logged in Change Tracker
- [ ] Documentation committed

### Middleware Extraction Checklist

- [ ] Middleware name and purpose documented
- [ ] Pipeline position documented
- [ ] All configuration options documented (name, type, default, required)
- [ ] All extension points/hooks documented
- [ ] Lifecycle documented
- [ ] Error handling documented
- [ ] DI requirements documented (what must be injected)
- [ ] Minimal usage example provided
- [ ] Realistic usage example provided
- [ ] Edge cases and gotchas documented

### Base Class Extraction Checklist

- [ ] Class name and purpose documented
- [ ] All abstract methods documented
- [ ] All virtual/hook methods documented
- [ ] Method signatures verified (exact parameters and return types)
- [ ] Lifecycle and when methods are called documented
- [ ] Extension patterns documented
- [ ] Usage examples provided
- [ ] Part A: internal implementation details documented
- [ ] Part B: verified no internal details present

### Final Verification

- [ ] All framework exports are documented
- [ ] Extraction status shows 100% complete and verified
- [ ] Part A contains all information (public + internal)
- [ ] Part B contains only public/consumer information
- [ ] No internal details in Part B
- [ ] All types, interfaces, and enums documented
- [ ] All DI tokens and patterns documented
- [ ] All middleware and utilities documented
- [ ] Change tracker up to date
- [ ] Documentation version aligned with framework version

---

## Key Takeaways

- **Source code is the single source of truth** — never document from memory, comments alone, or outdated README files
- **Two-part model is mandatory** — Part A (full) for maintainers, Part B (implementer) for consumers; Part B is always a strict subset of Part A
- **Verify obsessively** — every method signature, parameter type, and configuration option must be checked against source code
- **Extract one artifact at a time** — focused extraction produces accurate documentation; breadth produces errors
- **Change tracking is non-negotiable** — every documentation change is logged with framework version, verification method, and cross-impact
- **Flag uncertainties** — "UNVERIFIED" is always better than confidently wrong documentation
- **Document extension points** — API developers need to know what they can override or extend
- **Framework is technology-agnostic** — guide applies to Spring Boot, NestJS, Express, ASP.NET Core, FastAPI, Gin, etc.
- **Configuration and DI are critical** — app developers need to understand how to configure and bootstrap with the framework
- **Tests are documentation** — test files reveal expected behavior, edge cases, and error conditions
- **Middleware order matters** — document when middleware runs relative to others

---

## Additional Resources

- **Canonical Reverse Engineering Shape:** `canonical-reverse-engineering-shape.md` (universal RE principles, workflow, and change tracking)
- **Canonical Phase Shape:** `canonical-phase-shape.md` (8-section phase structure for forward engineering)
- **Change Tracker Template:** `change-tracker-template.md` (full change tracker structure and rules)
- **API Framework Documentation Template:** `api-framework-doc-template.md` (template for both Part A and Part B)
- **Extraction Status Tracker:** `docs/framework/reference/extraction-status.md` (tracks completion status)
