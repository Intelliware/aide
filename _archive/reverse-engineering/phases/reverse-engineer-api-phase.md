# Reverse Engineer API Documentation - Instructions

**Purpose:** Comprehensive reference for reverse-engineering an existing API's source code into structured, maintainable documentation. Produces three complementary documentation deliverables from a single source of truth: internal implementation docs for API developers, an OpenAPI specification as the machine-readable contract, and a consumer companion guide for narrative content that OpenAPI cannot express.

**Target Audience:** API developers, technical architects, technical writers, developers tasked with documenting an undocumented or under-documented API, and AI assistants performing documentation extraction.

**Source Documents:** api-internal-doc-template.md, canonical-reverse-engineering-shape.md, change-tracker-template.md.

---

## Table of Contents

- [What is API Documentation Reverse Engineering?](#what-is-api-documentation-reverse-engineering)
- [The Three-Part Documentation Model](#the-three-part-documentation-model)
- [Why OpenAPI Alone is Not Enough for Consumers](#why-openapi-alone-is-not-enough-for-consumers)
- [Why This Matters — Impact on Downstream Consumers](#why-this-matters--impact-on-downstream-consumers)
- [Core AI Principles for API Documentation Extraction](#core-ai-principles-for-api-documentation-extraction)
- [The 7-Step Workflow for API Documentation](#the-7-step-workflow-for-api-documentation)
- [Documentation Package Components](#documentation-package-components)
- [Phase-by-Phase Extraction Process](#phase-by-phase-extraction-process)
- [OpenAPI Specification Extraction Guide](#openapi-specification-extraction-guide)
- [Consumer Companion Guide Extraction](#consumer-companion-guide-extraction)
- [Change Tracking for API Documentation](#change-tracking-for-api-documentation)
- [Scaffolding Approach — Structure Before Content](#scaffolding-approach--structure-before-content)
- [Best Practices](#best-practices)
- [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
- [Prompt Templates and Examples](#prompt-templates-and-examples)
- [Quick Reference Checklist](#quick-reference-checklist)

---

## What is API Documentation Reverse Engineering?

### Definition

Reverse-engineering API documentation is the disciplined process of **reading an existing API's source code, configuration, middleware, routes, database schemas, and tests** and producing structured, accurate documentation that enables both API maintainers and API consumers to work effectively.

This is NOT:
- Guessing what the API does based on endpoint naming
- Writing aspirational documentation for endpoints that don't exist
- Copying Swagger annotations verbatim without verifying they match implementation
- Generating only an OpenAPI spec and calling it "documented"

This IS:
- Systematically reading source code to extract the truth about every endpoint, validation rule, business rule, and error condition
- Producing an OpenAPI specification that accurately describes the external contract
- Producing a companion guide that teaches consumers how to actually use the API
- Producing internal documentation that enables maintainers to understand and extend the codebase
- Creating living documentation that can be maintained as the API evolves

### Key Characteristics

- **Source-Code-Driven:** Every documented behavior must be verified against actual source code, not against comments, README files, or outdated Swagger annotations
- **Three-Part Output:** Internal docs (Part A), OpenAPI spec (Part B1), and Consumer Companion Guide (Part B2)
- **Template-Aligned:** Internal docs follow the API Internal Documentation Template; OpenAPI follows the OAS 3.x standard; the companion guide follows a defined structure
- **Change-Tracked:** All documentation changes are logged for auditability and version alignment
- **AI-Optimized:** Structured so AI assistants can consume the documentation and generate accurate code for both API implementation and API consumption

### What Belongs in API Documentation

| **Include in Documentation** | **Do NOT Include** |
| --- | --- |
| Every endpoint with method, path, parameters, request/response schemas | Speculative endpoints or planned-but-unbuilt features |
| Actual validation rules extracted from DTOs/pipes/middleware | Assumed validations not verified against code |
| Real error responses and status codes thrown by the code | Error codes from outdated Swagger annotations |
| Actual authentication/authorization behavior | Security schemes that aren't enforced |
| Business rules implemented in service layer | Business rules from requirements docs that weren't implemented |
| Rate limiting, pagination, and filtering behavior | Behaviors that exist in docs but not in code |
| Database constraints that affect API behavior | Internal database details not relevant to consumers |
| Actual dependency versions from package.json/pom.xml | "Latest" or approximate version ranges |

**Guiding Principle:** If you cannot point to the line of source code that proves a documented behavior, do not document it as fact. Flag it as "UNVERIFIED — needs source confirmation" instead.

---

## The Three-Part Documentation Model

### Overview

API documentation is managed centrally but produced in three parts. All three derive from the same extraction process but serve different audiences with fundamentally different needs.

```
Source Code (Single Source of Truth)
        │
        ├──→ Extraction Process (this guide)
        │         │
        │         ├──→ Part A: Internal API Documentation
        │         │         (API developers, maintainers)
        │         │
        │         ├──→ Part B1: OpenAPI Specification
        │         │         (machine-readable contract, reference docs)
        │         │
        │         └──→ Part B2: Consumer Companion Guide
        │                   (getting started, tutorials, workflows)
        │
        └──→ Change Tracker (logs all documentation changes)
```

### Part A: Internal API Documentation (Full)

**Audience:** API developers, maintainers, contributors — people who work on the API codebase itself.

**Scope:** Everything — internal architecture, layered design, middleware pipeline, service patterns, repository patterns, database internals, DI configuration, deployment pipeline, and the complete implementation details behind every endpoint.

**Template:** Follows the API Internal Documentation Template structure.

**Includes (in addition to everything derivable from Parts B1/B2):**
- Layered architecture rules and dependency boundaries
- Internal service-to-service communication patterns
- Repository and data access patterns with actual SQL/ORM examples
- Middleware pipeline order and how to add new middleware
- Authentication and authorization implementation internals
- Transaction management patterns
- Domain model internals, entity relationships, and loading strategies
- Database migration conventions and tools
- Background job implementation
- Internal DI registration patterns and service lifetimes
- Build, deploy, and runtime configuration
- Feature flag implementation
- Internal test infrastructure, factories, and fixtures
- Performance patterns and constraints

### Part B1: OpenAPI Specification

**Audience:** API consumers (external developers, frontend teams, partner integrators), SDK generators, testing tools, API gateways, and documentation rendering tools (Swagger UI, Redoc).

**Scope:** The external contract — what the API exposes, not how it's implemented internally.

**Format:** OpenAPI 3.0.x or 3.1.x YAML/JSON specification file(s).

**Includes:**
- Every public endpoint (method, path, operationId)
- Path parameters, query parameters, header parameters
- Request body schemas with required/optional fields, types, formats, and examples
- Response schemas for every status code (success and error)
- Security schemes (Bearer, OAuth2, API key) and which endpoints require them
- Server URLs for each environment
- Component schemas (reusable data models)
- Tags for logical grouping
- Descriptions on every operation, parameter, schema, and property
- Examples for request bodies and responses

**Explicitly Excludes:**
- Internal implementation details
- Database schema information
- Service layer patterns
- Middleware pipeline details
- Deployment configuration

### Part B2: Consumer Companion Guide

**Audience:** The same audience as the OpenAPI spec — but this guide provides the **narrative context** that OpenAPI cannot express.

**Scope:** Everything a consumer needs to know to successfully integrate with the API that is NOT expressible in the OpenAPI format.

**Why This Exists:** See the next section for the full rationale.

**Includes:**
- Getting Started guide (authentication setup, first API call walkthrough)
- Authentication and authorization guide (how to obtain tokens, refresh flow, scope explanations)
- Common workflows and use cases (multi-step sequences of API calls)
- Pagination guide (how pagination works, cursor vs. offset, example sequences)
- Filtering and sorting guide (supported operators, query syntax)
- Error handling guide (error response format, common errors, retry strategies)
- Rate limiting guide (limits, headers, backoff strategies)
- Webhooks guide (if applicable — setup, payload formats, verification)
- SDK and client library references (if applicable)
- Versioning and deprecation policy
- Migration guides (between API versions)
- Changelog
- FAQ and troubleshooting
- Code examples for common languages (curl, Python, JavaScript, etc.)

**Explicitly Excludes:**
- Internal implementation details
- Database information
- Service/repository patterns
- Anything that belongs in Part A

---

## Why OpenAPI Alone is Not Enough for Consumers

### What OpenAPI Does Well

The OpenAPI specification is the industry standard for describing RESTful API contracts. It excels at machine-readable, structured descriptions of individual endpoints — parameters, schemas, status codes, and security requirements. It powers interactive documentation tools (Swagger UI, Redoc), SDK generation, contract testing, and API gateway configuration.

### What OpenAPI Cannot Express

OpenAPI is fundamentally an **endpoint-level reference**. It describes individual operations in isolation. It was never designed to express:

| **Consumer Need** | **OpenAPI Support** | **Where It Goes Instead** |
| --- | --- | --- |
| "How do I authenticate and get my first token?" | Security schemes exist, but no narrative walkthrough | Companion Guide — Authentication section |
| "What's the typical workflow to create an order?" | No concept of multi-step workflows | Companion Guide — Common Workflows |
| "How does pagination work? Show me a sequence." | `parameters` exist, but no tutorial | Companion Guide — Pagination Guide |
| "What happens when I hit the rate limit?" | No rate-limiting semantics | Companion Guide — Rate Limiting Guide |
| "How do I migrate from v1 to v2?" | `deprecated` flag exists, but no migration narrative | Companion Guide — Migration Guide |
| "What changed in the latest release?" | No changelog concept | Companion Guide — Changelog |
| "Show me a complete example in Python" | Examples for individual operations exist, but not multi-step | Companion Guide — Code Examples |
| "What error codes mean and how to handle them" | Status codes exist, but no strategy guidance | Companion Guide — Error Handling Guide |
| "How do I set up webhooks?" | Webhooks can be described, but setup is narrative | Companion Guide — Webhooks Guide |
| "What do I do when I get a 429?" | Status code can be listed, but not retry guidance | Companion Guide — Rate Limiting Guide |

### The Industry Standard

Modern API developer portals (Stripe, Twilio, GitHub, Shopify) all follow the same model: an OpenAPI-powered reference combined with rich narrative documentation. Tools like ReadMe, Redocly, and Mintlify are specifically built to combine auto-generated reference from OpenAPI specs with manually authored companion content. This two-deliverable approach for consumers (spec + guide) is not optional — it is the baseline expectation for a well-documented API.

### Relationship Between B1 and B2

```
Part B1 (OpenAPI Spec)              Part B2 (Companion Guide)
─────────────────────               ──────────────────────────
Individual endpoint reference       Multi-step workflows
Request/response schemas            Getting started tutorial
Parameter definitions               Authentication walkthrough
Status code listings                Error handling strategies
Security scheme definitions         Rate limiting guidance
Schema examples                     Pagination tutorial
Machine-readable                    Human-readable narrative
Auto-generates Swagger UI / Redoc   Manually authored markdown
```

**Rules:**
- B1 and B2 must never contradict each other
- When B1 changes (new endpoint, schema change), evaluate B2 for updates
- B2 references B1 for detailed schemas: "See the API reference for the full `CreateOrderRequest` schema"
- B1 references B2 via `externalDocs` links where appropriate

---

## Why This Matters — Impact on Downstream Consumers

### Impact on API Consumers

Accurate API documentation directly enables:
- **Correct integration** — consumers call the right endpoints with the right parameters
- **Faster onboarding** — getting started guide reduces time-to-first-call from hours to minutes
- **Fewer support tickets** — error handling guide and FAQ prevent common mistakes
- **SDK generation** — accurate OpenAPI spec produces working client libraries
- **Contract testing** — consumers can validate their integration against the spec
- **AI-assisted integration** — AI coding assistants generate correct client code when given accurate OpenAPI specs and companion guides

### Impact on API Maintainers

Accurate internal documentation directly enables:
- **Consistent implementation** — new endpoints follow established patterns
- **Safe refactoring** — understanding the middleware pipeline prevents breaking changes
- **Faster onboarding** — new developers understand the architecture without archaeological exploration
- **AI-assisted development** — AI assistants generate correct implementation code when given accurate internal docs

### The Quality Chain

```
Source Code Accuracy → Documentation Accuracy → Consumer Integration Accuracy
     (Truth)              (Extracted Truth)         (Applied Truth)
```

If the OpenAPI spec says a field is optional but the code requires it, every consumer who omits that field gets a 400 error. If the companion guide says to use Bearer tokens but the code expects API keys, every consumer fails at authentication.

---

## Core AI Principles for API Documentation Extraction

> **Universal Principles:** See `canonical-reverse-engineering-shape.md` § Core AI Principles for Documentation Extraction for the six universal principles that apply to all reverse engineering work. Below are the API-specific applications of each principle.

### 1. AI is Intelligent, But Not Smart — API Application

- Read the full request pipeline (middleware → guard → pipe → controller → service), not just the controller
- After AI documents an endpoint, verify: "What middleware runs before this handler? What guards? What validation pipes?"
- Check for implicit behavior: global exception filters, response interceptors, serialization rules

### 2. Context is Critical — API Application

- Start with the request pipeline and global middleware before documenting individual endpoints
- Read the global error handler to understand the error response format
- Check database migrations for constraints that produce error responses
- An endpoint's behavior depends on the entire request pipeline, not just its handler method

### 3. AI Will Try to Do More Than Asked — API Application

- Be explicit: "Document ONLY the routes defined in this controller file. Do NOT infer additional endpoints."
- After documenting, verify: "For each endpoint you documented, show me the route decorator and method signature."
- Verify examples against actual response DTOs, not against entity definitions
- AI may invent query parameters that don't exist based on entity field names

### 4. Token Limitations Affect Depth — API Application

- Document one feature module at a time (e.g., all product endpoints together)
- For complex endpoints, break into: route + parameters first, then request validation, then response schema, then error cases
- Document the global request pipeline once, then reference it for each endpoint

### 5. Verification is Non-Negotiable — API Application

- Every documented endpoint must be verified against the route definition
- Every documented parameter must be verified against the DTO/validation
- Every documented response schema must be verified against the response DTO/serializer
- Every documented error response must be verified against the exception handling
- After AI documents an endpoint, cross-check every field against the request DTO
- Verify response shapes against response DTOs, not against entities
- Flag anything that cannot be verified as "UNVERIFIED"

### 6. AI Has Short Memory — API Application

- At the start of each session, have AI read the documentation produced so far
- Reference the global conventions (error format, pagination format, auth scheme) before documenting new endpoints
- Commit documentation frequently so it's always current

---

## The 7-Step Workflow for API Documentation

> **Workflow Structure:** See `canonical-reverse-engineering-shape.md` § The 7-Step Workflow for the universal workflow structure, step purposes, and process. Below are the API-specific prompt templates and examples for each step.

### Step 1: Set Context of Deliverable — API Prompt

```
"We are reverse-engineering documentation for [API NAME] version [VERSION].

We are producing three documentation deliverables:
- Part A: Internal API Documentation (for maintainers)
- Part B1: OpenAPI 3.x Specification (machine-readable contract)
- Part B2: Consumer Companion Guide (narrative docs for consumers)

We are currently extracting documentation for [FEATURE/MODULE].
Source files to read: [list files]

Document ONLY what exists in the source code. Do NOT invent endpoints,
parameters, or behaviors."
```

### Step 2: Set Context of Audience/Environment/Components — API Specifics

**Have AI identify for the feature being documented:**
- Controller/route handler files
- DTOs (request and response)
- Service files (business logic, authorization)
- Repository files (data access)
- Entity/model files
- Middleware, guards, and pipes that apply
- Test files (reveal expected behavior)
- Migration files (reveal database constraints)

### Step 3: Refine the Feedback — API Examples

**Example corrections:**
- "This API uses RFC 7807 Problem Details for all errors — not a custom format"
- "The global auth guard runs on all routes except those decorated with @Public()"
- "Response serialization strips the `password` and `internalNotes` fields — never include those in B1"
- "Pagination uses cursor-based, not offset — the `page` parameter doesn't exist"

### Step 4: Create Scaffolding Structure — API Prompt

```
"Based on the API Internal Documentation Template and OpenAPI 3.x standard,
propose the scaffolding structure for [API NAME] documentation. Show me:
- Part A file structure and section headers
- Part B1: OpenAPI spec file organization (single file or split by tag?)
- Part B2: Consumer companion guide file structure and section headers
- Recommended extraction order

Show structure and headers ONLY, do not extract content yet."
```

### Step 5: Create Content Chunk-by-Chunk — API Extraction Order

**Recommended Extraction Order:**

1. **Global infrastructure first:**
   - API overview and architecture (Part A sections 1–3)
   - Request pipeline and middleware (Part A section 7)
   - Authentication internals (Part A section 8)
   - Error handling and exception classes (Part A section 10)
   - Global configuration (Part A section 2)

2. **OpenAPI foundation:**
   - `info`, `servers`, `security` objects (Part B1)
   - Reusable `components/schemas` for shared types: pagination, error response, sort (Part B1)
   - Security schemes (Part B1)

3. **Consumer guide foundation:**
   - Getting Started guide (Part B2)
   - Authentication guide (Part B2)
   - Error handling guide (Part B2)
   - Pagination and filtering guide (Part B2)

4. **Feature-by-feature (repeat for each feature module):**
   - Read controller, DTOs, service, repository, entity, tests
   - Extract Part A: internal implementation docs
   - Extract Part B1: OpenAPI paths and component schemas for this feature
   - Extract Part B2: workflow examples that involve this feature's endpoints
   - Verify all three parts for consistency

5. **Cross-cutting and reference:**
   - Anti-patterns (Part A section 27)
   - New endpoint checklist (Part A section 28)
   - Rate limiting guide (Part B2)
   - Versioning and deprecation (Part B2)
   - Changelog (Part B2)
   - Quick reference / glossary (Parts A and B2)

### Step 6: Add Supporting Documents — API Sources

**Critical source files to provide:**
- `main.ts` / bootstrap file (reveals global middleware, pipes, filters)
- Global exception filter (reveals error response format)
- Auth guard/middleware (reveals authentication mechanism)
- Base/shared DTOs (pagination, sort, filter patterns)
- `package.json` / `pom.xml` (dependency versions)
- Database migration files (reveals constraints)
- Existing Swagger annotations or OpenAPI fragments (may be partially correct)
- Test files, especially integration/E2E tests (reveal expected behavior)

### Step 7: Verify Understanding — API Prompts

**Example Prompts:**
- "Before documenting the products feature, list every route defined in ProductsController"
- "For POST /api/products, what fields are required vs optional in CreateProductDto?"
- "What status codes can this endpoint return? Show me the exception throws."
- "What middleware/guards run before this handler?"

---

## Documentation Package Components

### File Structure

```
docs/api/
├── README.md                          # Index, relationships, how to maintain
├── CHANGE-TRACKER.md                  # All documentation changes logged here
│
├── part-a-internal/                   # Part A: Internal API Documentation
│   ├── 01-api-overview.md
│   ├── 02-environment-configuration.md
│   ├── 03-openapi-mapping.md
│   ├── 04-layered-architecture.md
│   ├── 05-project-structure.md
│   ├── 06-dependency-injection.md
│   ├── 07-middleware-pipeline.md
│   ├── 08-auth-internals.md
│   ├── 09-validation-transformation.md
│   ├── 10-error-handling.md
│   ├── 11-service-patterns.md
│   ├── 12-domain-models.md
│   ├── 13-cross-cutting-concerns.md
│   ├── 14-database-orm.md
│   ├── 15-repository-patterns.md
│   ├── 16-migrations.md
│   ├── 17-caching.md
│   ├── 18-background-jobs.md
│   ├── 19-inter-service-communication.md
│   ├── 20-external-integrations.md
│   ├── 21-observability.md
│   ├── 22-testing.md
│   ├── 23-security-implementation.md
│   ├── 24-performance.md
│   ├── 25-build-deploy-runtime.md
│   ├── 26-feature-flags.md
│   ├── 27-anti-patterns.md
│   ├── 28-new-endpoint-checklist.md
│   ├── 29-internal-types.md
│   ├── 30-glossary.md
│   └── appendix-a-feature-walkthrough.md
│
├── part-b1-openapi/                   # Part B1: OpenAPI Specification
│   ├── openapi.yaml                   #   Main spec file (or split below)
│   ├── paths/                         #   Split paths by tag (optional)
│   │   ├── products.yaml
│   │   ├── users.yaml
│   │   └── orders.yaml
│   ├── components/                    #   Reusable components (optional split)
│   │   ├── schemas/
│   │   │   ├── product.yaml
│   │   │   ├── user.yaml
│   │   │   ├── pagination.yaml
│   │   │   └── error.yaml
│   │   ├── parameters/
│   │   │   └── common-params.yaml
│   │   ├── responses/
│   │   │   └── common-responses.yaml
│   │   └── security-schemes/
│   │       └── bearer-auth.yaml
│   └── VALIDATION-REPORT.md          #   Results of spec validation (Spectral, etc.)
│
├── part-b2-consumer-guide/            # Part B2: Consumer Companion Guide
│   ├── 01-getting-started.md
│   ├── 02-authentication.md
│   ├── 03-common-workflows.md
│   ├── 04-pagination-filtering.md
│   ├── 05-error-handling.md
│   ├── 06-rate-limiting.md
│   ├── 07-webhooks.md                 #   (if applicable)
│   ├── 08-sdks-client-libraries.md    #   (if applicable)
│   ├── 09-versioning-deprecation.md
│   ├── 10-migration-guides.md
│   ├── 11-code-examples.md
│   ├── 12-faq-troubleshooting.md
│   └── CHANGELOG.md
│
└── reference/
    ├── extraction-status.md           # Tracks what has/hasn't been documented
    └── verification-log.md            # Records verification results
```

### Extraction Status Tracker

**Purpose:** Track which parts of the API have been documented across all three deliverables.

**Location:** `docs/api/reference/extraction-status.md`

**Format:**

```markdown
# Extraction Status

## Summary
- Total feature modules: [X]
- Total endpoints: [Y]
- Part A complete: [Z/X] modules
- Part B1 complete: [W/Y] endpoints  
- Part B2 complete: [V] sections
- Verified: [U]

## Feature Modules

| Feature | Source Path | Part A | Part B1 (OpenAPI) | Part B2 (Guide) | Verified | Notes |
|---------|-----------|--------|--------------------|-----------------|----------|-------|
| Products | src/features/products/ | ✅ | ✅ 5/5 endpoints | ✅ CRUD workflow | ✅ | |
| Users | src/features/users/ | ✅ | ✅ 4/4 endpoints | ✅ Auth workflow | ✅ | |
| Orders | src/features/orders/ | 🟡 In Progress | 🔵 0/8 endpoints | 🔵 Not Started | | Complex module |

## Global Infrastructure

| Section | Part A | Part B1 | Part B2 | Verified | Notes |
|---------|--------|---------|---------|----------|-------|
| Request pipeline | ✅ | N/A | N/A | ✅ | |
| Error format | ✅ | ✅ components/schemas | ✅ Error guide | ✅ | |
| Auth mechanism | ✅ | ✅ securitySchemes | ✅ Auth guide | ✅ | |
| Pagination | ✅ | ✅ components/parameters | ✅ Pagination guide | ✅ | |

## Consumer Guide Sections

| Section | Status | Verified | Notes |
|---------|--------|----------|-------|
| Getting Started | ✅ | ✅ | Tested end-to-end |
| Authentication | ✅ | ✅ | |
| Common Workflows | 🟡 In Progress | | Missing order workflow |
| Error Handling | ✅ | ✅ | |
| Rate Limiting | 🔵 Not Started | | Need to read middleware |
```

---

## Phase-by-Phase Extraction Process

### Phase 1: API Discovery and Inventory

#### Phase Identity

**Phase ID:** API-EXTRACT-001
**Phase Name:** API Discovery and Inventory
**FR Mapping:** None (foundational)

#### Goal

A complete inventory of the API's endpoints, middleware pipeline, feature modules, entities, and infrastructure services exists, with source file paths identified for every artifact.

#### Dependencies

None

#### Plan

1. Read `package.json` / `pom.xml` / `go.mod` to extract name, version, runtime, framework, and all dependencies
2. Read the bootstrap file (`main.ts`, `Program.cs`, `main.go`) to identify global middleware, pipes, filters, interceptors, and configuration
3. Read the route registration (module imports, route files, controller decorators) to identify every endpoint: HTTP method, path, handler
4. Walk the `src/` directory to create a file inventory categorized by: controllers, services, repositories, entities, DTOs, middleware, guards, pipes, filters, migrations, tests, infrastructure
5. For each endpoint, record: HTTP method, path, controller class, handler method, applied guards/middleware, request DTO, response DTO
6. Identify shared/global infrastructure: error filter, auth guard, validation pipe, pagination DTO, sort DTO
7. Count total endpoints per feature module
8. Create the `extraction-status.md` file with all identified artifacts at "Not Started" status
9. Create the `CHANGE-TRACKER.md` file with initial structure
10. Create the scaffolding structure for Part A, Part B1, and Part B2
11. Decide OpenAPI file organization: single file vs. split by tag (recommend split if >20 endpoints)

#### Outcome

- Complete endpoint inventory (method, path, controller, handler, DTOs)
- Complete feature module inventory with source paths
- Global infrastructure inventory (middleware, guards, filters, pipes)
- Extraction status tracker created and populated
- Change tracker created
- Documentation scaffolding created for all three parts
- OpenAPI file organization decided

#### Automated Verification (AI Gate)

1. Compare registered routes against inventory — every route must be listed
2. Verify all source file paths in inventory resolve to actual files
3. Count endpoints and verify against route registration

**Expected:**
- 100% of registered routes are inventoried
- All file paths resolve to actual files
- Endpoint count matches route registration

#### Human Verification (Human Gate)

1. Review inventory for completeness — any endpoints, middleware, or features missing?
2. Verify the Part A / B1 / B2 scope classification is correct
3. Confirm API version and dependency versions are accurate
4. Approve OpenAPI file organization choice

#### Success Criteria

✅ Endpoint inventory complete (every route documented)
✅ Feature module inventory complete
✅ Global infrastructure inventory complete
✅ Extraction status tracker created
✅ Change tracker created
✅ Scaffolding created for all three parts
✅ OpenAPI file organization decided
✅ API version and dependencies recorded

---

### Phase 2: Global Infrastructure Extraction

#### Phase Identity

**Phase ID:** API-EXTRACT-002
**Phase Name:** Global Infrastructure Extraction (Pipeline, Auth, Errors, Shared DTOs)
**FR Mapping:** None (foundational — affects all endpoints)

#### Goal

The request pipeline, authentication mechanism, error handling strategy, and shared patterns (pagination, filtering, sorting) are fully documented for Part A, and the corresponding OpenAPI components and companion guide foundation sections are created for Parts B1 and B2.

#### Dependencies

API-EXTRACT-001 API Discovery and Inventory

#### Plan

1. **Request Pipeline (Part A):**
   - Read the bootstrap file to extract the exact middleware registration order
   - For each middleware: document purpose, configuration location, and what it adds to the request
   - Document the complete request lifecycle diagram
   - For Part A section 7: document how to add new middleware

2. **Authentication (Part A + B1 + B2):**
   - Read the auth guard/middleware to extract: token type, header format, payload structure, where user is attached to request
   - Read token generation code (if login endpoint exists) to extract: token format, expiration, refresh mechanism
   - For Part A section 8: document internal auth implementation
   - For Part B1: create `securitySchemes` component with exact scheme definition
   - For Part B2: write the Authentication Guide — how to obtain a token, how to include it in requests, token refresh flow, common auth errors

3. **Error Handling (Part A + B1 + B2):**
   - Read the global exception filter to extract the exact error response JSON shape
   - Read all custom exception classes: class name, HTTP status, when thrown
   - For Part A section 10: document all exception classes and the error logging behavior
   - For Part B1: create `components/schemas/ErrorResponse` (and variants) matching the actual error shape
   - For Part B1: create `components/responses` for common error responses (400, 401, 403, 404, 422, 500)
   - For Part B2: write the Error Handling Guide — error format, common errors by status code, retry strategies

4. **Validation (Part A + B1):**
   - Read the global validation pipe/middleware to understand how validation works
   - Document the validation library, error format, and how validation errors are serialized
   - For Part A section 9: document how to write DTOs with validation
   - For Part B1: ensure validation error schema matches actual validation error output

5. **Shared Patterns (Part A + B1 + B2):**
   - Read shared DTOs: pagination DTO (request params), paginated response envelope, sort DTO, filter patterns
   - For Part A section 13: document pagination, sorting, filtering implementation
   - For Part B1: create `components/schemas` for `PaginatedResponse`, `PaginationParams`, `SortParams`
   - For Part B1: create `components/parameters` for shared query parameters (page, limit, sort, etc.)
   - For Part B2: write the Pagination & Filtering Guide — how pagination works, example request sequences, cursor vs. offset

6. **OpenAPI Foundation (Part B1):**
   - Create the `info` object from package metadata
   - Create the `servers` object for each environment
   - Create `tags` from the feature module inventory
   - Apply the security requirement globally or per-operation as appropriate

7. Log all extracted content in the Change Tracker

#### Outcome

- Request pipeline documented (Part A)
- Authentication documented (Part A + B1 security scheme + B2 auth guide)
- Error handling documented (Part A + B1 error schemas/responses + B2 error guide)
- Validation documented (Part A + B1 validation error schema)
- Shared patterns documented (Part A + B1 shared components + B2 pagination guide)
- OpenAPI foundation created (info, servers, tags, security)
- Consumer companion guide foundation sections created

#### Automated Verification (AI Gate)

1. Verify error response schema in B1 matches the actual global exception filter output
2. Verify security scheme in B1 matches the actual auth guard implementation
3. Verify pagination parameters in B1 match the actual shared pagination DTO
4. Validate the OpenAPI spec with Spectral or swagger-cli

**Expected:**
- Error schema matches actual output exactly
- Security scheme matches actual implementation
- Pagination parameters match actual DTO
- OpenAPI spec passes validation

#### Human Verification (Human Gate)

1. Review the request pipeline diagram — does it match the actual middleware order?
2. Verify the authentication guide in B2 is followable by a new consumer
3. Confirm the error handling guide covers the most common error scenarios
4. Test the OpenAPI spec renders correctly in Swagger UI or Redoc

#### Success Criteria

✅ Request pipeline documented with correct middleware order
✅ Authentication documented across all three parts
✅ Error handling documented across all three parts
✅ Shared patterns (pagination, sort, filter) documented
✅ OpenAPI foundation (info, servers, tags, security) created
✅ OpenAPI spec validates successfully
✅ Consumer guide foundation sections written
✅ Changes logged in Change Tracker

---

### Phase 3: Feature Module Extraction (Repeat Per Feature)

#### Phase Identity

**Phase ID:** API-EXTRACT-003.X (where X is the feature module number)
**Phase Name:** Feature Extraction — [Feature Name] (e.g., Products, Users, Orders)
**FR Mapping:** Maps to the functional requirements the feature implements

#### Goal

Every endpoint in the [Feature] module is fully documented across all three parts: internal implementation (Part A), OpenAPI paths and schemas (Part B1), and relevant workflow examples (Part B2).

#### Dependencies

API-EXTRACT-002 Global Infrastructure Extraction

#### Plan

For each feature module:

**Step 1: Read All Source Files**
1. Read the controller file to extract: every route (method + path + decorators), applied guards/roles, parameter extraction, handler method signatures
2. Read all request DTOs to extract: every field with type, required/optional, validation rules, default values, type coercion rules
3. Read all response DTOs to extract: every field with type, serialization rules, excluded fields, transformed fields
4. Read the service file to extract: business logic, authorization checks, transaction usage, error throws, service-to-service calls
5. Read the repository file to extract: query patterns, joins, filtering implementation, pagination implementation
6. Read the entity/model file to extract: fields, relationships, constraints, computed properties
7. Read test files to extract: expected behaviors, edge cases, error conditions
8. Read relevant migration files to extract: database constraints that produce errors (unique violations, FK violations, check constraints)

**Step 2: Extract Part A — Internal Documentation**
9. Document the controller patterns for this feature (what the handler does, how it delegates)
10. Document the service patterns (business rules, authorization logic, transaction boundaries)
11. Document the repository patterns (queries, joins, performance considerations)
12. Document the entity and its relationships
13. Document integration points with other features

**Step 3: Extract Part B1 — OpenAPI Paths and Schemas**
14. For each endpoint, create the OpenAPI path item:
    - `operationId` following naming convention
    - `summary` (one line) and `description` (detailed)
    - `tags` for the feature
    - `security` requirements
    - `parameters` (path, query, header) with types, required, examples
    - `requestBody` with schema, required fields, and examples
    - `responses` for every status code: success response schema with example, and every error response this endpoint can produce
15. Create `components/schemas` for this feature's request and response models
16. Ensure all `$ref` references are correct
17. Validate the updated spec

**Step 4: Extract Part B2 — Consumer Guide Content**
18. If this feature has multi-step workflows (e.g., "create product → add images → publish"), document in the Common Workflows section
19. Add code examples for the most common operations (curl + one programming language)
20. Add FAQ entries for non-obvious behaviors discovered during extraction

**Step 5: Update Tracking**
21. Update `extraction-status.md` for this feature
22. Log changes in the Change Tracker

#### Outcome

- Feature fully documented in Part A (controller, service, repository, entity patterns)
- All endpoints documented in Part B1 OpenAPI spec with schemas and examples
- Relevant workflows and code examples added to Part B2
- All three parts are consistent with each other

#### Automated Verification (AI Gate)

1. For each endpoint: verify the OpenAPI path matches the actual route decorator (method + path)
2. For each request body: verify every required field in the OpenAPI schema matches the DTO's required validations
3. For each response: verify the OpenAPI response schema matches the response DTO's serialized output
4. For each error response: verify the status code and condition match an actual exception throw in the code
5. Validate the updated OpenAPI spec

**Expected:**
- 100% of routes match between code and spec
- 100% of required fields match between DTOs and schemas
- Response schemas match actual serialized output
- All documented error responses are actually thrown
- Spec validates successfully

#### Human Verification (Human Gate)

1. Review OpenAPI descriptions for clarity — would a consumer understand what each endpoint does?
2. Verify examples are realistic and useful
3. Confirm workflow documentation in B2 accurately represents the multi-step sequence
4. Test at least one endpoint against the spec using a tool like Postman

#### Success Criteria

✅ All endpoints in this feature documented in Part A
✅ All endpoints in this feature have complete OpenAPI path items in Part B1
✅ All request/response schemas created in Part B1
✅ Examples provided for all operations in Part B1
✅ Error responses documented for each endpoint in Part B1
✅ Relevant workflows documented in Part B2
✅ Code examples added to Part B2
✅ Extraction status updated
✅ Changes logged in Change Tracker
✅ OpenAPI spec validates successfully

---

### Phase 4: Database and Data Layer Extraction (Part A Only)

#### Phase Identity

**Phase ID:** API-EXTRACT-004
**Phase Name:** Database and Data Layer Extraction
**FR Mapping:** None (internal infrastructure — Part A only)

#### Goal

The database schema, ORM configuration, migration conventions, repository base patterns, caching strategy, and query patterns are fully documented for Part A.

#### Dependencies

API-EXTRACT-002 Global Infrastructure Extraction

#### Plan

1. Read database connection/configuration to extract: database type, version, connection pool settings, SSL configuration
2. Read ORM configuration to extract: naming strategy, logging, migration settings
3. Read migration files to extract: table naming conventions, column naming conventions, standard columns (audit fields, soft delete), constraint naming
4. Document the entity-to-table mapping conventions
5. Read the base repository (if any) to extract: shared query methods, pagination implementation, soft delete filtering
6. Document N+1 prevention patterns used in the codebase
7. Read caching configuration to extract: cache provider, TTL defaults, invalidation strategy
8. Document migration creation workflow and rules

#### Outcome

- Database and ORM configuration documented (Part A sections 14–17)
- Table and column naming conventions documented
- Standard column patterns documented
- Repository patterns documented
- Caching strategy documented
- Migration conventions documented

**Note:** This is entirely Part A. Database internals are never exposed to consumers.

---

### Phase 5: Infrastructure, Operations, and Quality Extraction (Part A Only)

Follow the same pattern for:
- Background jobs and async processing (Part A section 18)
- Inter-service communication (Part A section 19)
- External integrations (Part A section 20)
- Observability: logging, metrics, tracing (Part A section 21)
- Testing infrastructure (Part A section 22)
- Security implementation details (Part A section 23)
- Performance patterns (Part A section 24)
- Build, deploy, and runtime (Part A section 25)
- Feature flags (Part A section 26)

---

### Phase 6: Anti-Patterns, Checklists, and Reference (All Parts)

#### Plan

1. **Part A Anti-Patterns (section 27):** Document common implementation mistakes found in code review history, test failures, or observed patterns — organized by layer (controller, service, repository, data)
2. **Part A New Endpoint Checklist (section 28):** Create step-by-step checklist for adding a new endpoint, derived from the patterns observed during extraction
3. **Part A Feature Walkthrough (Appendix A):** Write a complete example of implementing a new feature end-to-end following the documented patterns
4. **Part B1 Final Validation:** Run Spectral/swagger-cli validation on the complete spec; fix any issues; generate Swagger UI and Redoc to verify rendering
5. **Part B2 Remaining Sections:**
   - Rate Limiting Guide (from rate-limiting middleware)
   - Webhooks Guide (if applicable)
   - SDK / Client Library references (if applicable)
   - Versioning and Deprecation Policy
   - FAQ and Troubleshooting (compiled from edge cases discovered during extraction)
   - Changelog (initial version)
6. **Part B2 Code Examples:** Ensure every major workflow has examples in curl and at least one programming language

---

## OpenAPI Specification Extraction Guide

### OpenAPI Best Practices for Extraction

When extracting the OpenAPI spec from source code, follow these practices:

**Structure:**
- Use OpenAPI 3.0.3 or 3.1.0 (match what your tooling supports)
- Split large specs into multiple files using `$ref` if >20 endpoints
- Define all schemas in `components/schemas`, never inline
- Define reusable parameters in `components/parameters`
- Define reusable responses in `components/responses`
- Use `tags` to group endpoints by feature module

**Descriptions:**
- Every `operation` must have both `summary` (one line, <50 chars) and `description` (detailed)
- Every `parameter` must have a `description`
- Every `schema` property must have a `description`
- Every `response` must have a `description`
- Descriptions must not be null or empty

**Examples:**
- Every request body must have at least one `example`
- Every success response must have at least one `example`
- Examples must be realistic (not "string", "0", or placeholder values)
- Examples must pass the schema's own validation rules

**Security:**
- Define security schemes in `components/securitySchemes`
- Apply security at the operation level (not globally) if different endpoints have different requirements
- Document which scopes/roles are required for each operation in the description

**Errors:**
- Document every error status code an endpoint can return
- Use `components/responses` for shared error responses (401, 403, 500)
- Use inline responses for endpoint-specific errors (409 for duplicate, 422 for business rule violation)
- Include error examples showing the actual error response body

### Extracting Schemas from DTOs

For each DTO in the source code, extract an OpenAPI schema:

```
Source DTO Property → OpenAPI Schema Property
─────────────────────────────────────────────
TypeScript `string`         → type: string
TypeScript `number`         → type: number (or integer)
TypeScript `boolean`        → type: boolean
TypeScript `Date`           → type: string, format: date-time
TypeScript `string[]`       → type: array, items: { type: string }
TypeScript `enum`           → type: string, enum: [values]
TypeScript optional `?`     → NOT in `required` array
Validation `@IsEmail()`     → type: string, format: email
Validation `@MinLength(3)`  → type: string, minLength: 3
Validation `@Min(0)`        → type: number, minimum: 0
Validation `@IsUUID()`      → type: string, format: uuid
Validation `@IsOptional()`  → NOT in `required` array
Validation `@IsNotEmpty()`  → IN `required` array
Default value `= 20`        → default: 20
```

### Validating the Spec

After extraction, validate the spec:

```bash
# Structural validation
npx @redocly/cli lint openapi.yaml

# Style/convention validation  
npx @stoplight/spectral-cli lint openapi.yaml

# Render and visually inspect
npx @redocly/cli preview-docs openapi.yaml
```

---

## Consumer Companion Guide Extraction

### Section-by-Section Guide

#### 01-getting-started.md

**Extract from:** Bootstrap file, auth middleware, a simple GET endpoint, package metadata.

**Must include:**
- Base URL for each environment
- How to authenticate (summary — full details in 02)
- A complete "first API call" example (curl + one language) that works end-to-end
- Common headers required on all requests
- Rate limiting summary

#### 02-authentication.md

**Extract from:** Auth guard/middleware, token generation code, token refresh code, RBAC guards.

**Must include:**
- Step-by-step: how to obtain a token
- How to include the token in requests (header format)
- Token expiration and refresh flow
- Scopes/roles and what they grant access to
- Common authentication errors and solutions

#### 03-common-workflows.md

**Extract from:** Service layer code (multi-step operations), integration tests (multi-call sequences).

**Must include:**
- For each major workflow: the sequence of API calls, with request/response examples for each step
- Prerequisites for each workflow
- Error handling at each step

#### 04-pagination-filtering.md

**Extract from:** Shared pagination DTO, filter DTOs, repository filter implementation.

**Must include:**
- Pagination type (cursor vs. offset)
- Pagination parameters and their defaults
- Paginated response envelope format
- How to iterate through all pages (complete example)
- Available filter operators
- Sort parameter format
- Complete example combining pagination + filter + sort

#### 05-error-handling.md

**Extract from:** Global exception filter, custom exception classes, validation error format.

**Must include:**
- Error response format (with annotated example)
- Error status codes table: code, meaning, common causes, what to do
- Validation error format and how to parse field-level errors
- Retry guidance: which errors are retryable, recommended backoff
- How to use the `traceId` (or equivalent) for support requests

#### 06-rate-limiting.md

**Extract from:** Rate limiting middleware, rate limit configuration.

**Must include:**
- Rate limit values (requests per window)
- Rate limit headers returned (`X-RateLimit-*`)
- What happens when limit is exceeded (status code, response body)
- Recommended backoff strategy
- Different limits for different endpoints (if applicable)

#### CHANGELOG.md

**Extract from:** Git history, release tags, package version history.

**Format:**
```markdown
## [1.2.0] — 2026-03-15

### Added
- `POST /api/orders/{id}/refund` — Partial refund support

### Changed
- `GET /api/products` — `category` filter now supports multiple values (comma-separated)

### Deprecated
- `GET /api/products?type=X` — Use `category` filter instead. Will be removed in v2.0.

### Fixed
- `POST /api/orders` — Now returns 409 (was 500) when duplicate order reference is submitted
```

---

## Change Tracking for API Documentation

> **Common Structure:** See `canonical-reverse-engineering-shape.md` § Change Tracking for the universal change tracking rules, versioning convention, change types, and version alignment process. See `../_shared/templates/change-tracker-template.md` for the full Change Tracker file structure.

### Parts Affected Values

This phase produces three documentation parts. When logging changes in the Change Tracker, use the following values in the "Parts Affected" column:

| Value | Meaning |
| --- | --- |
| A | Part A: Internal API Documentation (maintainers) |
| B1 | Part B1: OpenAPI Specification (machine-readable contract) |
| B2 | Part B2: Consumer Companion Guide (narrative docs) |
| All | All three parts affected |

### Cross-Part Synchronization Rules

When a change affects one part, always evaluate the other parts:

| If This Changes... | Check These Parts... |
| --- | --- |
| Part A: New exception class added | Part B1: Is a new error response needed? Part B2: Does the error guide need updating? |
| Part B1: New endpoint added to spec | Part A: Is the internal implementation documented? Part B2: Do workflows or examples need updating? |
| Part B1: Schema field changed | Part A: Does the DTO documentation match? Part B2: Do code examples need updating? |
| Part B2: Workflow updated | Part B1: Do the referenced endpoints still match? |
| Source code: Validation rule changed | Part A: DTO documentation. Part B1: Schema constraints. Part B2: Error examples. |

### API Version Alignment Process

When the API's source code changes:

1. Identify what changed (new endpoint, modified schema, removed endpoint, etc.)
2. For each change, determine which documentation parts are affected
3. Update Part A internal documentation first (it's the most detailed)
4. Update Part B1 OpenAPI specification
5. Update Part B2 companion guide (examples, workflows, changelog)
6. Validate the OpenAPI spec
7. Log all changes in the Change Tracker with the new API version
8. Update the documentation version
9. Update the CHANGELOG.md in Part B2

---

## Scaffolding Approach — Structure Before Content

> **Scaffolding Philosophy:** See `canonical-reverse-engineering-shape.md` § Scaffolding Approach for the universal scaffolding process and rationale. Below is the API-specific scaffolding prompt.

### API Scaffolding Prompt

```
"We have completed the API inventory. Based on the API Internal Documentation
Template, OpenAPI 3.x standard, and our inventory, propose the scaffolding for:
- Part A (internal API docs) — file structure and section headers
- Part B1 (OpenAPI spec) — file organization and component structure
- Part B2 (consumer companion guide) — file structure and section headers

For each file, show:
- File path
- Section headers
- Which inventory items (endpoints/features) map to each section

Show structure ONLY. Do NOT extract any content yet."
```

---

## Best Practices

### 1. Read the Full Request Pipeline, Not Just Controllers

**Principle:** An endpoint's behavior is defined by everything in the request pipeline, not just the handler method.

**Do:**
- Read global middleware, auth guards, validation pipes, and interceptors first
- Understand what's already on `request.user` before the handler runs
- Check for response interceptors that transform output after the handler returns

**Don't:**
- Document only what's in the controller method
- Assume the raw handler return value is what the client receives

### 2. Verify Response Shapes Against Response DTOs, Not Entities

**Principle:** Entities often have fields that are excluded from API responses (passwords, internal IDs, audit fields).

**Do:**
- Find the response DTO or serialization logic to determine the actual response shape
- Check for `@Exclude()` decorators, `select()` statements, or manual mapping
- Verify examples match the serialized output, not the raw entity

### 3. Document Error Responses From Exception Throws, Not Assumptions

**Principle:** The only error responses an endpoint produces are those explicitly thrown or caught.

**Do:**
- Search the controller and service for `throw new` statements
- Check for database constraint violations that produce specific errors
- Include errors from validation pipes (which run before the handler)

**Don't:**
- Assume every endpoint returns 400, 401, 403, 404, and 500
- Document error codes that no code path actually produces

### 4. Keep All Three Parts Synchronized

**Principle:** If the OpenAPI spec says one thing and the companion guide says another, consumers lose trust.

**Do:**
- When updating B1, check B2 for affected examples and workflows
- When updating Part A, check B1 for affected schemas
- Use the Change Tracker to record cross-impact

### 5. Write the OpenAPI Spec for Machines AND Humans

**Principle:** The spec powers both Swagger UI rendering and SDK generation.

**Do:**
- Every operation, parameter, and schema property needs a `description`
- Provide realistic `examples` (not "string" or "0")
- Use `$ref` for reusable components — never inline complex schemas
- Use meaningful `operationId` values — they become method names in generated SDKs

### 6. Write the Companion Guide for the "Day 1" Consumer

**Principle:** A new consumer should be able to make their first successful API call within 15 minutes of reading the Getting Started guide.

**Do:**
- Start with authentication — the #1 blocker for new consumers
- Provide complete, copy-paste-ready examples
- Show the full request AND response, not just the request
- Include common mistakes and how to fix them

### 7. Extract One Feature at a Time

**Principle:** Focused extraction produces accurate documentation.

**Do:** Document all endpoints in the Products module together — controller, DTOs, service, repository, OpenAPI paths, and companion guide workflows.

**Don't:** Jump between features or try to document the entire API at once.

### 8. Flag Uncertainties Rather Than Guess

**Principle:** "UNVERIFIED" is better than wrong.

**Do:**
- If source code is ambiguous, flag the documentation as needing verification
- Use `<!-- UNVERIFIED: [reason] -->` markers in Part A and B2
- Use `x-unverified: true` extension in OpenAPI for uncertain operations
- Track unverified items in the extraction status tracker

---

## Common Pitfalls and Solutions

### Pitfall 1: AI Documenting Endpoints That Don't Exist

**Symptom:** OpenAPI spec includes DELETE /api/products but no delete route exists in the controller.

**Solution:**
- After each extraction, verify: "For each path in the OpenAPI spec, show me the route decorator in the controller that registers this endpoint."
- Only document routes with actual route decorators/registrations
- Never infer CRUD operations — document only what's implemented

### Pitfall 2: OpenAPI Schema Doesn't Match Actual Response

**Symptom:** Consumers get fields in the response that aren't in the schema, or expect fields that are filtered out.

**Solution:**
- Always derive response schemas from response DTOs/serializers, not from entity definitions
- Check for `@Exclude()`, `select()`, `omit()`, or manual mapping that removes fields
- Test by calling the endpoint and comparing actual response with documented schema

### Pitfall 3: Missing Error Responses in OpenAPI Spec

**Symptom:** Consumers get unexpected 409 or 422 errors that aren't documented.

**Solution:**
- Read the full code path: controller → service → repository → database constraints
- Check for unique index violations (→ 409), check constraints (→ 422), FK violations (→ 400/422)
- Document every `throw` statement in the service layer

### Pitfall 4: Companion Guide Examples Don't Work

**Symptom:** Consumer follows the Getting Started guide but can't authenticate or make their first call.

**Solution:**
- Test every example in the companion guide against a running instance of the API
- Include complete requests (headers, body) and complete responses
- Include the authentication step in every example sequence

### Pitfall 5: Swagger Annotations Don't Match Implementation

**Symptom:** Existing Swagger/OpenAPI annotations in the code are outdated or wrong.

**Solution:**
- **Never trust annotations as the source of truth.** Always verify against the actual route handler, DTO, and service code
- Annotations are a useful starting point but must be verified
- Flag discrepancies as bugs to fix in the source code

### Pitfall 6: Documenting Business Rules in Wrong Part

**Symptom:** Part B2 companion guide explains internal implementation details; Part A internal docs contain consumer-facing workflow descriptions.

**Solution:**
- Part A = how the code works internally (for maintainers)
- Part B1 = what the API contract is (machine-readable)
- Part B2 = how to use the API effectively (for consumers)
- If a consumer doesn't need to know it to call the API, it belongs in Part A only

### Pitfall 7: OpenAPI Spec is One Giant File

**Symptom:** OpenAPI spec exceeds 5000 lines, is difficult to maintain, and causes tool performance issues.

**Solution:**
- Split by tag into separate path files using `$ref`
- Split component schemas into individual files
- Use a tool like Redocly CLI to bundle the split files into a single file when needed

### Pitfall 8: Not Documenting Pagination Sequences

**Symptom:** Consumers don't understand how to iterate through paginated results.

**Solution:**
- Part B2 must include a complete pagination example showing: first request → parse next cursor/page → subsequent request → detect last page
- Include both curl and at least one programming language example

---

## Prompt Templates and Examples

### Template 1: Starting a New Extraction Session

```
We are reverse-engineering documentation for [API NAME] version [VERSION].

Please read the following context:
- Extraction status: docs/api/reference/extraction-status.md
- Existing Part A docs: docs/api/part-a-internal/[relevant files]
- Existing OpenAPI spec: docs/api/part-b1-openapi/openapi.yaml
- Change tracker: docs/api/CHANGE-TRACKER.md

We are extracting documentation for the [FEATURE] module.
Source files to read:
- [controller path]
- [service path]
- [repository path]
- [DTO paths]
- [entity path]
- [test paths]

Produce documentation for ALL THREE parts:
- Part A: Internal implementation docs
- Part B1: OpenAPI paths and schemas
- Part B2: Consumer workflow examples (if applicable)

Document ONLY what exists in the source code. Do NOT invent endpoints or parameters.
```

### Template 2: Extracting a Single Endpoint

```
Read the source code for [METHOD] [PATH]:
- Controller handler: [path to method]
- Request DTO: [path]
- Response DTO: [path]
- Service method: [path]

Extract:
1. Part A: Internal documentation of this endpoint's implementation
2. Part B1: Complete OpenAPI path item including:
   - operationId, summary, description, tags
   - All parameters (path, query, header) with types, required, descriptions, examples
   - Request body schema with required fields, types, descriptions, example
   - All response status codes with schemas and examples
   - Security requirements
3. Part B2: Is this endpoint part of a multi-step workflow? If so, note it.

For each field in the request DTO, show me the validation decorator that proves 
it's required/optional. For each error response, show me the throw statement.
```

### Template 3: Extracting the Global Error Format

```
Read the global exception filter:
- [path to exception filter]

And all custom exception classes:
- [paths to exception classes]

Extract:
1. Part A (section 10): All exception classes with status codes, when thrown, logging behavior
2. Part B1: 
   - components/schemas/ErrorResponse (matching the actual JSON output)
   - components/responses/ for each common error (401, 403, 404, 500)
3. Part B2 (error handling guide): 
   - Error response format with annotated example
   - Table of status codes, meanings, and recommended consumer actions
   - Retry guidance

Show me the exact JSON output the filter produces for a validation error and 
for a NotFoundException. I need to verify the schema matches.
```

### Template 4: Writing the Getting Started Guide

```
Based on the documentation we've extracted so far, write the Getting Started 
guide for Part B2. This guide must enable a new consumer to make their first 
successful API call within 15 minutes.

Include:
1. Prerequisites (what the consumer needs: API key/credentials, base URL)
2. Step 1: Authentication (complete curl example showing how to get a token)
3. Step 2: First API call (complete curl example with auth header, to a simple GET endpoint)
4. Step 3: Understanding the response (annotated response body)
5. What's next (links to other companion guide sections)

Every example must include the complete request (headers, body) AND the 
complete response. No placeholders — use realistic example data.
```

### Template 5: Validating the OpenAPI Spec

```
The OpenAPI spec extraction for [FEATURE] is complete. 

Please verify:
1. Every path in the spec has a corresponding route in the controller
2. Every required field in request schemas has a @IsNotEmpty() or equivalent 
   validation in the DTO
3. Every response schema matches the response DTO's serialized output
4. Every error response is actually thrown somewhere in the code path
5. All $ref references resolve correctly

Report discrepancies between the spec and the source code.
```

### Template 6: Logging Changes

```
Log the following change in docs/api/CHANGE-TRACKER.md:

Change Type: [Initial Extraction / Correction / API Update]
Parts Affected: [Part A / B1 / B2 / All]
Section/File: [file path(s)]
API Version: [version]
Description: [what was documented or changed]
Verification: [how it was verified]
Cross-Impact:
- Part A: [affected sections or "None"]
- Part B1: [affected paths/schemas or "None"]  
- Part B2: [affected guide sections or "None"]

Increment the change number sequentially.
```

### Template 7: API Version Update Impact Assessment

```
The API source code has been updated from version [OLD] to version [NEW].

Changes identified:
- [list of code changes]

For each change, assess the impact on all three documentation parts:
1. Part A: What internal documentation needs updating?
2. Part B1: What OpenAPI paths, schemas, or components need updating?
3. Part B2: What companion guide sections need updating? Does the changelog 
   need a new entry?

Do NOT make updates yet — create the impact assessment only.
I will review and approve before we update documentation.
```

---

## Quick Reference Checklist

> **Common Checklist Items:** See `canonical-reverse-engineering-shape.md` § Quick Reference Checklist — Common Items for universal checklist items that apply to all reverse engineering phases. Below are the API-specific checklist items.

### API-Specific Pre-Extraction Preparation

- [ ] API source code accessible
- [ ] API version identified and recorded
- [ ] Request pipeline architecture understood (middleware, guards, pipes, filters)
- [ ] OpenAPI file organization decided (single vs. split by tag)

### API-Specific Extraction Session

- [ ] AI has read existing documentation and API conventions
- [ ] Source files for the feature/module are identified (controller, DTOs, service, repository)
- [ ] AI reads the full request pipeline (middleware → guard → pipe → controller → service)
- [ ] Part A: Internal implementation documented
- [ ] Part B1: OpenAPI paths and schemas extracted
- [ ] Part B2: Consumer workflows and examples updated (if applicable)
- [ ] All three parts are consistent with each other

### Endpoint Extraction Checklist (Per Endpoint)

**Part B1 (OpenAPI):**
- [ ] `operationId` is meaningful and follows naming convention
- [ ] `summary` is one line, <50 characters
- [ ] `description` explains what the endpoint does, when to use it, prerequisites
- [ ] `tags` assigned
- [ ] `security` requirements specified
- [ ] All `parameters` documented (path, query, header) with types, required, descriptions
- [ ] `requestBody` schema with all fields, types, required, descriptions, examples
- [ ] Success response with schema and example
- [ ] Every error response with status code, schema, description, and example
- [ ] All schemas use `$ref` to components (no inline complex schemas)
- [ ] Examples are realistic (not "string" or "0")

**Part A (Internal):**
- [ ] Handler delegation pattern documented
- [ ] Service method business logic documented
- [ ] Authorization checks documented
- [ ] Transaction boundaries documented (if applicable)
- [ ] Repository query patterns documented
- [ ] Error throws documented

### OpenAPI Spec Quality Checklist

- [ ] Every operation has `operationId`, `summary`, `description`
- [ ] Every parameter has `description`
- [ ] Every schema property has `description`
- [ ] Every request body has at least one `example`
- [ ] Every success response has at least one `example`
- [ ] All schemas defined in `components/schemas` (none inline)
- [ ] Reusable parameters in `components/parameters`
- [ ] Reusable responses in `components/responses`
- [ ] `servers` list is populated for all environments
- [ ] `security` is applied correctly (global and/or per-operation)
- [ ] Spec validates with Spectral/Redocly CLI
- [ ] Spec renders correctly in Swagger UI or Redoc

### Consumer Companion Guide Checklist

- [ ] Getting Started guide works end-to-end (tested)
- [ ] Authentication guide covers: obtain token, include in request, refresh, errors
- [ ] Common Workflows documented with complete request/response sequences
- [ ] Pagination guide includes iteration example
- [ ] Error handling guide covers: format, status code table, retry guidance
- [ ] Rate limiting guide covers: limits, headers, backoff
- [ ] Code examples in curl + at least one programming language
- [ ] CHANGELOG has entries for current version
- [ ] FAQ addresses the most common issues discovered during extraction

### Change Tracker Checklist

- [ ] Every extraction session logged
- [ ] Change type specified
- [ ] Parts affected specified (A / B1 / B2 / All)
- [ ] API version recorded
- [ ] Verification method documented
- [ ] Cross-part impact assessed and documented
- [ ] Change number incremented sequentially

### Final Verification

- [ ] All endpoints documented in all three parts
- [ ] Part A covers full internal architecture
- [ ] Part B1 OpenAPI spec validates and renders correctly
- [ ] Part B2 companion guide is followable by a new consumer
- [ ] All three parts are internally consistent (no contradictions)
- [ ] No internal details in Parts B1 or B2
- [ ] Extraction status shows 100% complete and verified
- [ ] Change tracker is up to date
- [ ] Documentation version aligned with API version

---

## Key Takeaways

- **Three-part model is mandatory** — Part A (internal) for maintainers, Part B1 (OpenAPI spec) as the machine-readable contract, Part B2 (companion guide) for narrative content OpenAPI cannot express. All three are necessary for a well-documented API.
- **OpenAPI alone is not enough** — it excels at individual endpoint reference but cannot express workflows, tutorials, getting started guides, error handling strategies, or migration paths. The companion guide fills this gap.
- **Source code is the single source of truth** — never trust Swagger annotations, README files, or outdated documentation without verifying against the actual route handlers, DTOs, services, and middleware.
- **Read the full request pipeline** — an endpoint's behavior is defined by middleware + guards + pipes + handler + interceptors + exception filters, not just the handler method.
- **Verify response shapes against response DTOs, not entities** — entities have fields excluded from API responses; the response DTO is what the consumer actually sees.
- **Document error responses from exception throws** — don't assume standard error codes; trace every `throw` statement and database constraint violation.
- **Keep all three parts synchronized** — the Change Tracker and cross-impact rules exist to prevent drift between internal docs, the OpenAPI spec, and the companion guide.
- **Extract one feature at a time** — focused extraction produces accurate documentation; breadth produces errors.
- **Write the companion guide for Day 1** — a new consumer should make their first successful API call within 15 minutes of reading the Getting Started guide.
- **Flag uncertainties** — "UNVERIFIED" is always better than confidently wrong documentation.

---

## Additional Resources

- **API Internal Documentation Template:** `docs/api/reference/api-internal-doc-template.md`
- **OpenAPI Specification 3.x:** https://spec.openapis.org/oas/v3.1.0
- **OpenAPI Best Practices:** https://learn.openapis.org/best-practices.html
- **Spectral (OpenAPI Linter):** https://github.com/stoplightio/spectral
- **Redocly CLI:** https://redocly.com/docs/cli/
- **Extraction Status:** `docs/api/reference/extraction-status.md`
- **Change Tracker:** `docs/api/CHANGE-TRACKER.md`
- **AI-SDLC Best Practices:** `Learning/crash course contents/AI-SDLC-Best-Practices-Info-Dump.md`
- **Canonical Phase Shape:** `docs/implementation/reference/CANONICAL-PHASE-SHAPE.md`
