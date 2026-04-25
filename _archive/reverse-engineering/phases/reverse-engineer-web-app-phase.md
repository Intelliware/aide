# Reverse Engineer Web Application Documentation - Instructions

**Purpose:** Comprehensive reference for reverse-engineering an existing web front-end application's source code into structured, maintainable documentation. Produces two complementary documentation sets from a single source of truth: internal application documentation for app developers/maintainers and an application overview & integration guide for the knowledge repository.

**Target Audience:** Front-end developers, technical architects, technical writers, developers tasked with documenting an undocumented or under-documented web application, and AI assistants performing documentation extraction.

**Scope:** This guide applies to APPLICATION repositories (e.g., Angular, React, Vue, Svelte applications that serve end users), NOT framework/library repositories. See reverse-engineer-ui-framework-phase.md for documenting reusable frameworks.

**Source Documents:** canonical-reverse-engineering-shape.md, change-tracker-template.md, web-app-doc-template.md

---

## Table of Contents

- [What is Web Application Documentation Reverse Engineering?](#what-is-web-application-documentation-reverse-engineering)
- [The Two-Part Documentation Model](#the-two-part-documentation-model)
- [Why This Matters — Impact on Downstream Teams](#why-this-matters--impact-on-downstream-teams)
- [Core AI Principles for Web Application Documentation Extraction](#core-ai-principles-for-web-application-documentation-extraction)
- [The 7-Step Workflow for Web Application Documentation](#the-7-step-workflow-for-web-application-documentation)
- [Documentation Package Components](#documentation-package-components)
- [Phase-by-Phase Extraction Process](#phase-by-phase-extraction-process)
- [Change Tracking for Web Application Documentation](#change-tracking-for-web-application-documentation)
- [Scaffolding Approach — Structure Before Content](#scaffolding-approach--structure-before-content)
- [Best Practices](#best-practices)
- [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
- [Prompt Templates and Examples](#prompt-templates-and-examples)
- [Quick Reference Checklist](#quick-reference-checklist)

---

## What is Web Application Documentation Reverse Engineering?

### Definition

Reverse-engineering web application documentation is the disciplined process of **reading an existing web application's source code, configuration, routing, state management, component structure, API integration, and tests** and producing structured, accurate documentation that enables both application maintainers and consumers (downstream teams/integrators) to understand and work effectively with the application.

This is NOT:
- Guessing what the application does based on folder structure or component names
- Writing aspirational documentation for features that don't exist in the codebase
- Copying README snippets verbatim without verification against actual implementation
- Documenting only the "happy path" while ignoring error handling and edge cases

This IS:
- Systematically reading source code to extract the truth about every feature, route, component, API integration, and workflow
- Producing internal documentation that enables maintainers and new developers to understand the application architecture
- Producing an overview document that explains what the application does, which APIs it consumes, which frameworks/libraries it uses, and its deployment topology
- Creating living documentation that remains accurate as the application evolves
- Documenting not just the "what" but the "why" — design decisions, anti-patterns to avoid, and performance considerations

### Key Characteristics

- **Source-Code-Driven:** Every documented behavior must be verified against actual source code, not against requirements documents or outdated comments
- **Two-Part Output:** Internal Application Documentation (Part A) for app developers, and Application Overview & Integration Guide (Part B) for the knowledge repository
- **Template-Aligned:** Internal docs follow the Web App Documentation Template structure; overview docs follow a defined structure
- **Change-Tracked:** All documentation changes are logged for auditability and version alignment
- **Technology-Agnostic:** Covers React, Angular, Vue, Svelte, and other frameworks generically, without prescribing one approach
- **AI-Optimized:** Structured so AI assistants can consume the documentation and generate accurate code for both application maintenance and integration

### What Belongs in Web Application Documentation

| **Include in Documentation** | **Do NOT Include** |
| --- | --- |
| Every route with path, component, required auth, parameters | Planned routes or future features |
| Actual component structure and props/inputs (verified in code) | Assumed props based on naming conventions |
| Real API endpoints consumed (HTTP method, path, auth, error handling) | API endpoints from outdated documentation |
| Actual state management structure and data flows | Theoretical state management patterns |
| Authentication and authorization implementation as actually coded | Aspirational security schemes |
| Real styling approach and design tokens used in the app | Style tokens that aren't actually applied |
| Actual build and deployment configuration | Generic build steps |
| Performance considerations observed in implementation | Theoretical performance improvements |
| Environmental configuration options that exist in code | Configuration that "should" exist |
| Internationalization support actually implemented | i18n support from outdated features |
| Tested accessibility features and ARIA attributes | Assumed accessibility features |
| Error handling and validation logic as implemented | Placeholder error messages |

**Guiding Principle:** If you cannot point to the line of source code that proves a documented feature exists and works as documented, do not document it as fact. Flag it as "UNVERIFIED — needs source confirmation" instead.

---

## The Two-Part Documentation Model

### Overview

Web application documentation is managed centrally but produced in two parts. Both parts derive from the same extraction process but serve different audiences with fundamentally different needs.

```
Source Code (Single Source of Truth)
        │
        ├──→ Extraction Process (this guide)
        │         │
        │         ├──→ Part A: Internal Application Documentation
        │         │         (app developers, maintainers, contributors)
        │         │
        │         └──→ Part B: Application Overview & Integration Guide
        │                   (knowledge repository, other teams, integrators)
        │
        └──→ Change Tracker (logs all documentation changes)
```

### Part A: Internal Application Documentation (Full)

**Audience:** Front-end developers, maintainers, contributors — people who develop and maintain this application.

**Scope:** Everything — application architecture, component hierarchy, routing structure, state management implementation, styling approach, API integration patterns, build/deploy pipeline, environmental configuration, testing infrastructure, and complete implementation details for every feature.

**Template:** Follows the Web App Documentation Template structure.

**Includes (in addition to everything derivable from Part B):**
- Application architecture overview and design patterns
- Folder structure and how it's organized by feature
- Component hierarchy and dependency graph
- State management structure, stores, and data flows
- Routing configuration and navigation patterns
- Middleware, guards, and interceptors specific to the app
- API integration patterns and how the app consumes external services
- Form handling, validation, and submission logic
- Authentication and authorization implementation details
- Styling architecture (SCSS/CSS architecture, design tokens, theme implementation)
- Build configuration (webpack, Vite, build pipelines, optimization)
- Deployment configuration and environment-specific settings
- CI/CD pipeline and deployment procedures
- Performance optimization techniques and constraints
- Internal testing infrastructure and test utilities
- Accessibility implementation details
- Error handling and logging strategies
- Development tools, linting, and formatter configuration
- Git workflows and commit conventions

### Part B: Application Overview & Integration Guide

**Audience:** Other teams, external integrators, knowledge repository consumers — people who need to understand WHAT the application does and which APIs it consumes, but don't need internal implementation details.

**Scope:** Application purpose, feature inventory, API consumption, framework stack, deployment topology, external dependencies, team ownership, and integration points.

**Why This Exists:** Part B is designed to live in a knowledge repository where other teams need to quickly understand what this application is, without being overwhelmed by internal implementation details.

**Includes:**
- Application purpose and use case
- Key features and capabilities
- Architecture pattern (SPA, SSR, PWA, hybrid, etc.)
- Framework and technology stack with versions
- External APIs consumed (which services, which endpoints)
- Authentication and authorization model
- Deployment topology (environments, infrastructure)
- Team ownership and primary contacts
- How other systems integrate with this app
- Key links (repository, deployed instances, monitoring dashboards, docs)
- Known limitations or constraints
- Deployment frequency and process
- Dependency inventory (frameworks, libraries, external services)
- Data privacy and compliance considerations
- Performance characteristics and SLAs
- Disaster recovery and backup strategy

**Explicitly Excludes:**
- Component implementation details
- Internal state management structure
- Build system configuration
- Development-only tools and testing infrastructure
- Internal architecture decisions
- Git workflow specifics
- Development machine setup

### Relationship Between Parts

```
Part A (Internal Application Documentation)
├── Architecture Overview and Design Patterns
├── Project Structure and Folder Organization
├── Component Hierarchy and Dependencies
├── Routing Configuration and Navigation
├── State Management Implementation
├── API Integration Patterns
├── Styling and Design System Implementation
├── Build and Deployment Configuration
├── Testing Infrastructure
├── [And more internal details]
│
↓ (subset extracted from)
│
Part B (Application Overview & Integration Guide)
├── Application Purpose and Features
├── Technology Stack
├── External API Consumption
├── Deployment Topology
├── Integration Points
└── Team and Contact Information
```

**Rules:**
- Part B is always a **strict subset** of Part A
- Any information in Part B must also exist in Part A (unless deliberately chosen to stay internal)
- Part A may contain information that is explicitly excluded from Part B
- When Part A changes, evaluate whether Part B needs updating
- The Change Tracker records changes to both parts

### How to Decide Where Content Goes

| **Ask Yourself** | **If Yes → Part A Only** | **If No → Both Parts** |
| --- | --- | --- |
| Does this describe an internal implementation detail? | ✅ | |
| Does this describe how the app handles data internally? | ✅ | |
| Does this document the build or deployment process? | ✅ | |
| Does this describe development-only tools or testing? | ✅ | |
| Would external teams/integrators need to know this? | | ✅ Both Parts |
| Does this describe which external APIs the app uses? | | ✅ Both Parts |
| Does this describe the app's purpose or key features? | | ✅ Both Parts |
| Does this describe how other systems integrate with this app? | | ✅ Both Parts |
| Does this describe the technology stack? | | ✅ Both Parts |
| Does this describe authentication/authorization? | (internal impl) ✅ A only | (model/integration) ✅ both |

---

## Why This Matters — Impact on Downstream Teams

### Impact on Application Maintainers

Accurate internal application documentation directly enables:
- **Correct modifications** — developers understand the architecture before making changes
- **Consistent patterns** — teams follow the same approach instead of inventing ad-hoc solutions
- **Faster onboarding** — new developers understand the application from documentation, not by reading random source files
- **Safer refactoring** — understanding the routing, state, and component dependencies prevents breaking changes
- **AI-assisted development** — AI coding assistants generate correct code when given accurate documentation as context
- **Fewer bugs** — anti-patterns and gotchas are documented, preventing common mistakes

### Impact on External Teams and Integrators

Accurate application overview documentation directly enables:
- **Quick understanding** — teams instantly know what the app does, what it consumes, and how to integrate
- **Correct integration** — integrators call the right APIs with the right parameters
- **Fewer support requests** — external teams have answers without asking maintainers
- **System planning** — architects understand the dependency graph and deployment topology
- **Incident response** — oncall engineers know who owns the application and how it integrates with other systems

### Impact on AI-Assisted Development

AI assistants rely heavily on application documentation to generate code. Poor documentation leads to:
- AI inventing plausible but wrong component hierarchies
- AI using outdated or deprecated patterns
- AI generating code that works locally but fails in production
- AI missing required authentication, error handling, or configuration
- AI misunderstanding the state management approach

**Critical Insight:** The Web App Documentation Template is specifically structured to give AI assistants the information they need in the order they need it. Following the template structure is not optional — it is a functional requirement for AI-assisted development.

### The Quality Chain

```
Source Code Accuracy → Documentation Accuracy → Developer Productivity
     (Truth)              (Extracted Truth)    (Applied Truth)
```

If documentation drifts from source code, every downstream consumer — human and AI — produces incorrect work.

---

## Core AI Principles for Web Application Documentation Extraction

> **Universal Principles:** See `canonical-reverse-engineering-shape.md` § Core AI Principles for Documentation Extraction for the six universal principles. Below are the Web Application-specific applications.

### 1. AI is Intelligent, But Not Smart — Web App Application

**How to apply:**
- Have AI read feature modules one at a time, not the entire codebase at once
- After AI documents a route or component, verify against the source: "What does this component actually do? What are its real props used for?"
- Check for complete stories: not just data flow, but error handling, loading states, and edge cases
- Verify AI hasn't invented props that exist in code but are actually never used

### 2. Context is Critical — Web App Application

**How to apply:**
- Start with application overview, architecture, and key design decisions before diving into components
- Provide the package.json for dependency versions and framework choices
- Provide routing configuration before documenting individual route handlers
- Provide the state management structure before documenting how components consume state
- Read global error handling, authentication guards, and middleware before documenting feature-specific logic

### 3. AI Will Try to Do More Than Asked — Web App Application

**How to apply:**
- Be explicit: "Document ONLY the routes defined in this routing config. Do NOT invent routes."
- After documenting, verify: "For each route you documented, show me the exact path and component."
- State what NOT to do: "Do NOT generate example code beyond what's in the source."
- Ask for verification: "For each component you documented, list its actual @Input/@Output from the source code."

### 4. Token Limitations Affect Depth — Web App Application

**How to apply:**
- Document one feature module at a time
- For complex features, break into: routing structure first, then state management, then components, then API integration
- Document the global infrastructure once, then reference it for each feature
- When discussing a single component, include its template, logic, and styles in one session

### 5. Verification is Non-Negotiable — Web App Application

**How to apply:**
- After AI documents a route, cross-check the path and component against the routing file
- After AI documents a component, verify every @Input/@Output against the component class
- After AI documents a feature's API integration, verify the endpoints against the actual service code
- Flag anything that cannot be verified as "UNVERIFIED — needs source confirmation"

### 6. AI Has Short Memory (Session Only) — Web App Application

**How to apply:**
- At the start of each session, have AI read the documentation produced so far
- Reference the application overview and conventions before documenting new features
- Commit documentation frequently so it's always current
- Use the scaffolding structure as a map for what's done and what remains

---

## The 7-Step Workflow for Web Application Documentation

> **Universal Workflow:** See `canonical-reverse-engineering-shape.md` § The 7-Step Workflow for complete methodology, dependencies, and general process descriptions. Below are the Web Application-specific prompts and examples.

### Step 1: Set Context of Deliverable — Web App Prompt

```
"We are reverse-engineering documentation for [APPLICATION NAME] version [VERSION].

Technology stack:
- Framework: [React/Angular/Vue/Svelte/Other]
- State management: [Redux/Vuex/Context/Zustand/Other]
- API client: [Axios/Fetch/Angular HttpClient/Other]
- Styling: [CSS Modules/CSS-in-JS/SCSS/Tailwind/Other]
- Testing: [Jest/Vitest/Jasmine/Other]

We are producing two documentation sets:
- Part A: Internal Application Documentation (for app developers and maintainers)
- Part B: Application Overview & Integration Guide (for the knowledge repository)

We are currently extracting documentation for [FEATURE/MODULE].
Source files to read: [list files]

Document ONLY what exists in the source code. Do NOT invent routes,
components, API calls, or features that don't exist in the actual application."
```

### Step 3: Refine the Feedback — Web App Examples

**Example corrections for web applications:**
- "This app uses [framework] with [state management library] — note the data flow model"
- "All API calls go through the XyzApiService — do not document raw HTTP calls"
- "Authentication is enforced by the AuthGuard on protected routes — only document routes that apply it"
- "The styling uses CSS modules with design tokens — do not assume inline styles"
- "Error handling is centralized in the ErrorInterceptor — components should not have duplicate error logic"

### Step 5: Create Content Chunk-by-Chunk — Web App Extraction Order

**Recommended Extraction Order for Web Applications:**

1. **Foundation (Global Infrastructure First):**
   - Application overview and purpose
   - Technology stack and dependencies
   - Architecture pattern and design decisions
   - Project structure and folder organization
   - Global routing configuration
   - Global state management structure
   - API service/HTTP client configuration
   - Authentication and authorization mechanism
   - Global error handling and logging
   - Styling architecture and design tokens
   - Build and deployment configuration

2. **Feature-by-Feature (Repeat for each feature):**
   - Read routing configuration for this feature
   - Read all component files (TS/JS, templates, styles)
   - Read state management (if feature-specific)
   - Read API service methods used by this feature
   - Extract Part A: internal implementation documentation
   - Extract Part B: which external APIs this feature consumes, how it integrates
   - Verify all source code is accurately represented

3. **Cross-Cutting Concerns:**
   - Internationalization (i18n) implementation
   - Accessibility (a11y) features and ARIA attributes
   - Performance optimizations and constraints
   - Security practices and implementation
   - Testing strategy and test utilities
   - Anti-patterns to avoid
   - Development workflows and tools

4. **Integration and Deployment:**
   - Build pipeline and optimization strategies
   - Deployment environments and configuration
   - Environment-specific behavior
   - CI/CD pipeline and automation
   - Monitoring and observability

5. **Reference and Checklists:**
   - Glossary and key terminology
   - Quick reference guide
   - Component inventory
   - API endpoint inventory
   - Troubleshooting guide

### Step 6: Add Supporting Documents — Web App Critical Files

**Critical source files to provide for web applications:**
- `package.json` (dependency versions, scripts, configuration)
- Routing configuration files (with full paths, parameters, guards)
- Global middleware/guards/interceptors files
- State management setup (store configuration, root reducer/state)
- API service/HTTP client configuration
- Authentication service or module
- Global error handling service/interceptor
- Configuration files (environment.ts, app.config.ts, or equivalent)
- Test files (reveal expected behavior and edge cases)
- Build configuration (tsconfig.json, webpack/vite config, etc.)
- README and any existing documentation
- Git structure and branch naming conventions

### Step 7: Verify Understanding — Web App Prompts

**Example verification prompts for web applications:**
- "Before documenting the [Feature] module, list every route defined in its routing configuration"
- "For the [ComponentName] component, what props are defined? Show me the exact TypeScript interface or prop types."
- "What API endpoints does this feature call? List the exact HTTP method, path, and service method name."
- "What state management is used? Is it local component state, feature state, or global state?"
- "What are the authentication requirements? Are there guards applied?"

---

## Documentation Package Components

### File Structure

```
docs/app/
├── README.md                          # Index, relationships, how to maintain
├── CHANGE-TRACKER.md                  # All documentation changes logged here
│
├── part-a-internal/                   # Part A: Internal Application Documentation
│   ├── 01-app-overview.md
│   ├── 02-environment-configuration.md
│   ├── 03-project-structure.md
│   ├── 04-architecture-design-patterns.md
│   ├── 05-routing-navigation.md
│   ├── 06-state-management.md
│   ├── 07-component-hierarchy.md
│   ├── 08-api-integration.md
│   ├── 09-authentication-authorization.md
│   ├── 10-styling-design-system.md
│   ├── 11-forms-validation.md
│   ├── 12-error-handling-logging.md
│   ├── 13-build-deployment.md
│   ├── 14-testing-strategy.md
│   ├── 15-performance-optimization.md
│   ├── 16-accessibility.md
│   ├── 17-internationalization.md
│   ├── 18-security-implementation.md
│   ├── 19-feature-modules/             # One file per feature
│   │   ├── 19-01-[feature-name].md
│   │   ├── 19-02-[feature-name].md
│   │   └── ...
│   ├── 20-component-reference/        # Optional detailed component docs
│   │   ├── 20-01-[component-name].md
│   │   └── ...
│   ├── 21-anti-patterns.md
│   ├── 22-troubleshooting.md
│   ├── 23-development-workflows.md
│   ├── 24-glossary.md
│   └── appendix-a-architecture-diagram.md
│
├── part-b-overview/                   # Part B: Application Overview & Integration Guide
│   ├── 01-application-overview.md
│   ├── 02-key-features.md
│   ├── 03-technology-stack.md
│   ├── 04-external-api-consumption.md
│   ├── 05-deployment-topology.md
│   ├── 06-integration-points.md
│   ├── 07-team-contacts.md
│   ├── 08-related-systems.md
│   └── 09-quick-reference.md
│
└── reference/
    ├── extraction-status.md           # Tracks what has/hasn't been documented
    └── verification-log.md            # Records verification results
```

### Extraction Status Tracker

**Purpose:** Track which parts of the application have been documented across both deliverables.

**Location:** `docs/app/reference/extraction-status.md`

**Format:**

```markdown
# Extraction Status

## Summary
- Total features: [X]
- Total routes: [Y]
- Total components: [Z]
- Part A complete: [A/X] features
- Part B complete: [B/X] features
- Verified: [V]

## Features

| Feature | Source Path | Routes | Components | Part A | Part B | Verified | Notes |
|---------|-----------|--------|-----------|--------|--------|----------|-------|
| Dashboard | src/features/dashboard/ | 1 | 5 | ✅ | ✅ | ✅ | |
| User Management | src/features/users/ | 3 | 8 | ✅ | ✅ | ✅ | |
| Settings | src/features/settings/ | 2 | 4 | 🟡 In Progress | 🔵 Not Started | | |

## Global Infrastructure

| Section | Part A | Part B | Verified | Notes |
|---------|--------|--------|----------|-------|
| Routing | ✅ | ✅ | ✅ | |
| State Management | ✅ | ✅ | ✅ | |
| API Integration | ✅ | ✅ | ✅ | |
| Authentication | ✅ | ✅ | ✅ | |
| Error Handling | ✅ | ✅ | ✅ | |
| Styling | ✅ | 🔵 Not Started | | Only Part A needed |
| Build/Deploy | ✅ | 🔵 Not Started | | Part A only |

## Status Values
- 🔵 **Not Started** — Not yet extracted
- 🟡 **In Progress** — Extraction underway
- ✅ **Completed** — Extraction finished
- 🔴 **Blocked** — Source code unclear, needs team input
- ⚠️ **Needs Update** — Source code has changed since extraction
```

---

## Phase-by-Phase Extraction Process

### Phase 1: Application Discovery and Inventory

#### Phase Identity

**Phase ID:** WEBAPP-EXTRACT-001
**Phase Name:** Application Discovery and Inventory
**FR Mapping:** None (foundational)

#### Goal

A complete inventory of the application's routes, components, state management, API integrations, and infrastructure services exists, with source file paths identified for every artifact.

#### Dependencies

None

#### Plan

1. Read `package.json` to extract name, version, framework (React/Angular/Vue/Svelte), and all dependencies
2. Read the main entry point and bootstrap files to identify global setup, middleware, providers, and configuration
3. Read routing configuration to identify every route: path, component, guards, parameters
4. Walk the `src/` directory to create a file inventory categorized by: routes, components, services, state management, styles, utilities, tests, config
5. For each component, record: name, source file path, purpose, parent components, child components
6. For each route, record: path, component, guards/auth requirements, parameters, parent feature
7. Identify state management approach: Redux, Vuex, Pinia, Zustand, Context API, MobX, or other
8. Identify API integration approach: which service handles HTTP calls, global interceptors/middleware
9. Create the `extraction-status.md` file with all identified artifacts at "Not Started" status
10. Create the `CHANGE-TRACKER.md` file with initial structure
11. Create the scaffolding structure for Part A and Part B documentation

#### Outcome

- Complete route inventory (path, component, guards, parameters)
- Complete component inventory (hierarchy, purpose, file paths)
- Complete feature module inventory with source paths
- Global infrastructure inventory (state management, API service, authentication)
- Extraction status tracker created and populated
- Change tracker created
- Documentation scaffolding created for both parts

#### Automated Verification (AI Gate)

1. Compare registered routes against inventory — every route must be listed
2. Verify all source file paths in inventory resolve to actual files
3. Verify the component tree is hierarchically consistent

**Expected:**
- 100% of routes are inventoried
- All file paths resolve to actual files
- Component hierarchy is accurate

#### Human Verification (Human Gate)

1. Review inventory for completeness — any routes, components, or features missing?
2. Verify the scope classification is correct (what's in Part A vs. Part B)
3. Confirm application version and dependency versions are accurate

#### Success Criteria

✅ Route inventory complete
✅ Component inventory complete
✅ Feature module inventory complete
✅ Global infrastructure inventory complete
✅ Extraction status tracker created
✅ Change tracker created
✅ Scaffolding created for both parts
✅ Application version and dependencies recorded

---

### Phase 2: Foundation Extraction

#### Phase Identity

**Phase ID:** WEBAPP-EXTRACT-002
**Phase Name:** Foundation Extraction (Overview, Environment, Structure, Architecture)
**FR Mapping:** None (foundational)

#### Goal

Template sections 1–5 (Application Overview, Environment and Configuration, Project Structure, Architecture & Design Patterns, Routing & Navigation) are fully documented for both Part A and Part B where applicable.

#### Dependencies

WEBAPP-EXTRACT-001 Application Discovery and Inventory

#### Plan

1. **Application Overview (Part A + Part B):**
   - Document application purpose, key features, use case
   - Document the framework and technology stack with versions
   - Document architecture pattern (SPA, SSR, PWA, hybrid)
   - Document key design decisions and why they were made
   - For Part B: include what external APIs are consumed

2. **Environment and Configuration (Part A):**
   - Extract environment variables and their purposes
   - Document configuration for each environment (dev, staging, production)
   - Extract build configuration (source maps, optimization, bundle splitting)
   - Document how to set up a development environment
   - Extract testing environment configuration

3. **Project Structure (Part A + Part B):**
   - Document the folder structure and what goes where
   - Explain naming conventions for files and folders
   - Document how features are organized
   - For Part B: include the high-level structure and rationale

4. **Architecture & Design Patterns (Part A):**
   - Document the overall architecture (e.g., layered, modular, domain-driven)
   - Explain the component hierarchy and how it's organized
   - Document state management architecture
   - Explain the API integration strategy
   - Document the styling architecture
   - List key design patterns used and where

5. **Routing & Navigation (Part A):**
   - Document the complete routing structure with all routes
   - Explain how navigation works (navigation guards, lazy loading)
   - Document route parameters and their purposes
   - Document how authentication/authorization guards are applied
   - Explain any special routing patterns or conventions

6. Log all extracted content in the Change Tracker

#### Outcome

- Application overview documented (both parts)
- Environment and configuration documented (Part A)
- Project structure documented (both parts)
- Architecture and design patterns documented (Part A)
- Routing and navigation documented (Part A)
- Boilerplate/example app structure documented (Part A)

#### Automated Verification (AI Gate)

1. Verify all routes documented match the actual routing configuration
2. Verify folder structure documented matches actual file structure
3. Verify environment variables documented match actual configuration files

**Expected:**
- 100% of routes documented
- Folder structure matches actual structure
- All environment variables documented

#### Human Verification (Human Gate)

1. Review application overview for accuracy
2. Verify project structure explanation matches the team's mental model
3. Confirm architecture explanation is accurate and complete

#### Success Criteria

✅ Application overview complete
✅ Environment and configuration documented
✅ Project structure documented
✅ Architecture and design patterns documented
✅ Routing and navigation documented
✅ All versions verified against package.json
✅ Changes logged in Change Tracker

---

### Phase 3: Global Infrastructure Extraction

#### Phase Identity

**Phase ID:** WEBAPP-EXTRACT-003
**Phase Name:** Global Infrastructure Extraction (State, API, Auth, Styling)
**FR Mapping:** None (foundational — affects all features)

#### Goal

State management, API integration, authentication, error handling, and styling approaches are fully documented for Part A.

#### Dependencies

WEBAPP-EXTRACT-002 Foundation Extraction

#### Plan

1. **State Management (Part A):**
   - Read the state management setup (Redux store, Vuex modules, Context providers, etc.)
   - Document the state shape and key stores/slices
   - Document how state is accessed by components
   - Document state mutations and side effects (actions, effects, thunks)
   - Document any selectors or derived state logic

2. **API Integration (Part A):**
   - Read the HTTP client configuration and setup
   - Document global interceptors and middleware
   - Document how authentication tokens are attached to requests
   - Document error handling for API calls
   - Document any retry logic or caching strategy
   - Document the service structure for API calls

3. **Authentication & Authorization (Part A + Part B):**
   - Read the authentication implementation
   - Document how users authenticate (login, OAuth, API keys, etc.)
   - Document where authentication guards are applied (routes, components)
   - Document authorization checks (role-based, permission-based)
   - For Part B: document the authentication model

4. **Error Handling & Logging (Part A):**
   - Read the global error handling (error boundary, error interceptor)
   - Document how errors are caught and displayed
   - Document the error logging strategy
   - Document user-facing error messages
   - Document how network errors are handled

5. **Styling Architecture (Part A + Part B):**
   - Read the styling approach (CSS modules, CSS-in-JS, SCSS, Tailwind, etc.)
   - Document design tokens and their values
   - Document the color palette and typography
   - Document responsive breakpoints
   - For Part B: document the styling approach overview

6. Log all extracted content in the Change Tracker

#### Outcome

- State management documented (Part A)
- API integration documented (Part A)
- Authentication and authorization documented (Part A + Part B)
- Error handling and logging documented (Part A)
- Styling architecture documented (Part A + Part B)

#### Automated Verification (AI Gate)

1. Verify state management structure matches the actual code
2. Verify API service methods documented match the actual code
3. Verify styling tokens documented exist in the actual style files

**Expected:**
- State structure matches actual code
- All API service methods documented
- All design tokens exist in source

#### Human Verification (Human Gate)

1. Review state management documentation for clarity
2. Verify error handling strategy is accurately described
3. Confirm styling documentation is complete and accurate

#### Success Criteria

✅ State management documented
✅ API integration documented
✅ Authentication and authorization documented
✅ Error handling documented
✅ Styling architecture documented
✅ All changes logged in Change Tracker

---

### Phase 4: Feature Extraction (Repeat Per Feature)

#### Phase Identity

**Phase ID:** WEBAPP-EXTRACT-004.X (where X is the feature number)
**Phase Name:** Feature Extraction — [Feature Name]
**FR Mapping:** Maps to the functional requirements the feature implements

#### Goal

Every route, component, and API call for [Feature] is fully documented for Part A. Part B includes which external APIs this feature consumes.

#### Dependencies

WEBAPP-EXTRACT-003 Global Infrastructure Extraction

#### Plan

For each feature module:

**Step 1: Read All Source Files**
1. Read the feature routing configuration to extract: every route (path, component, guards, parameters)
2. Read all component files to extract: purpose, props/inputs, state, methods, event handlers
3. Read state management files (if feature-specific) to extract: initial state, actions, reducers
4. Read service files to extract: API methods, data transformation, business logic
5. Read template/view files to understand the component tree and user interactions

**Step 2: Document Feature Architecture**
1. Create a component hierarchy diagram
2. Document the data flow (how state flows through components)
3. Document API calls made by this feature (which endpoints, when they're called)
4. Document any special patterns or conventions used in this feature

**Step 3: Document Each Component**
1. Document purpose and when it's used
2. Document all props/inputs with types and defaults
3. Document all outputs/events emitted
4. Document internal state if applicable
5. Document how it integrates with the broader feature

**Step 4: Document Routes**
1. For each route in this feature: document path, parameters, guards, components
2. Document any special route behavior (guards, redirects, lazy loading)

**Step 5: Document API Integration**
1. For each API call: document the endpoint, method, authentication, error handling
2. Document how results are stored in state
3. Document loading states and error states

**Step 6: Extract Content**
1. Part A: document complete implementation details
2. Part B: document which external APIs this feature consumes, what it does
3. Log changes in Change Tracker

#### Outcome

- Feature routing documented
- Feature components documented
- Feature state management documented
- Feature API integration documented
- Feature interactions and workflows documented

#### Automated Verification (AI Gate)

1. Verify all routes in this feature are documented
2. Verify all components used in this feature are documented
3. Verify component props match the actual source code

**Expected:**
- 100% of routes documented
- 100% of components documented
- All props verified against source

#### Human Verification (Human Gate)

1. Review feature documentation for completeness
2. Verify component descriptions accurately represent their purpose
3. Confirm API calls and error handling are correctly documented

#### Success Criteria

✅ All routes documented
✅ All components documented
✅ State management documented
✅ API integration documented
✅ Changes logged in Change Tracker

---

### Phase 5: Cross-Cutting Concerns Extraction

#### Phase Identity

**Phase ID:** WEBAPP-EXTRACT-005
**Phase Name:** Cross-Cutting Concerns (i18n, a11y, Performance, Security, Testing)
**FR Mapping:** None (affects all features)

#### Goal

Internationalization, accessibility, performance optimization, security practices, and testing strategy are fully documented for Part A.

#### Dependencies

WEBAPP-EXTRACT-003 Global Infrastructure Extraction (or concurrent)

#### Plan

1. **Internationalization (i18n):**
   - Document the i18n framework/library used
   - Document how translations are organized
   - Document how components use translations
   - Document supported languages and how to add new ones

2. **Accessibility (a11y):**
   - Read components for ARIA attributes
   - Document accessibility features and patterns
   - Document keyboard navigation support
   - Document color contrast and visual accessibility
   - Document tested screen reader compatibility

3. **Performance:**
   - Document performance optimization techniques (code splitting, lazy loading, memoization)
   - Document performance constraints and bottlenecks
   - Document bundle size strategies
   - Document rendering performance considerations

4. **Security:**
   - Document security practices (CSRF protection, XSS prevention, etc.)
   - Document authentication and authorization implementation
   - Document sensitive data handling
   - Document security headers and policies

5. **Testing:**
   - Document testing strategy (unit, component, integration, E2E)
   - Document test structure and naming conventions
   - Document mock/stub patterns
   - Document test utilities and fixtures

6. Log all extracted content in the Change Tracker

#### Outcome

- Internationalization documented
- Accessibility features documented
- Performance optimization documented
- Security practices documented
- Testing strategy documented

#### Automated Verification (AI Gate)

1. Verify ARIA attributes documented exist in actual components
2. Verify performance optimization techniques are actually used
3. Verify testing utilities exist in the test infrastructure

**Expected:**
- All documented ARIA attributes are in source
- Performance techniques are actually implemented
- Testing utilities exist

#### Human Verification (Human Gate)

1. Review accessibility documentation for completeness
2. Verify performance considerations are accurately described
3. Confirm testing strategy matches team's actual practice

#### Success Criteria

✅ i18n documented
✅ a11y features documented
✅ Performance optimizations documented
✅ Security practices documented
✅ Testing strategy documented
✅ Changes logged in Change Tracker

---

### Phase 6: Build, Deployment, and Operations

#### Phase Identity

**Phase ID:** WEBAPP-EXTRACT-006
**Phase Name:** Build, Deployment, and Operations
**FR Mapping:** None (operational)

#### Goal

Build pipeline, deployment configuration, CI/CD, monitoring, and operations documentation is complete for Part A.

#### Dependencies

All previous phases

#### Plan

1. **Build Configuration:**
   - Read build configuration (webpack, Vite, Angular CLI, etc.)
   - Document build steps and optimization
   - Document environment-specific builds
   - Document build artifacts and output

2. **Deployment:**
   - Document deployment environments and infrastructure
   - Document deployment process and automation
   - Document environment-specific configuration
   - Document rollback procedures

3. **CI/CD:**
   - Document CI/CD pipeline and stages
   - Document testing automation
   - Document deployment automation
   - Document release process

4. **Monitoring & Operations:**
   - Document error tracking and logging
   - Document performance monitoring
   - Document health checks and alerting
   - Document runbooks for common issues

5. Log all extracted content in the Change Tracker

#### Outcome

- Build configuration documented
- Deployment process documented
- CI/CD pipeline documented
- Monitoring and operations documented

#### Success Criteria

✅ Build configuration documented
✅ Deployment process documented
✅ CI/CD pipeline documented
✅ Monitoring/operations documented
✅ Changes logged in Change Tracker

---

### Phase 7: Anti-Patterns, Troubleshooting, and Finalization

#### Phase Identity

**Phase ID:** WEBAPP-EXTRACT-007
**Phase Name:** Anti-Patterns, Troubleshooting, and Final Review
**FR Mapping:** None (reference)

#### Goal

Anti-patterns, troubleshooting guide, and final verification complete. All documentation is accurate, complete, and cross-linked.

#### Dependencies

All previous phases

#### Plan

1. **Anti-Patterns:**
   - Document patterns that exist in code but should be avoided
   - Explain why they're anti-patterns
   - Document the preferred pattern

2. **Troubleshooting:**
   - Document common issues developers encounter
   - Document solutions and where to find more information

3. **Quick Reference:**
   - Create a quick reference guide for common tasks
   - Document key terminology and glossary

4. **Final Verification:**
   - Cross-check all cross-references
   - Verify completeness of documentation
   - Update extraction status tracker

5. **Part B: Application Overview & Integration Guide**
   - Extract application overview for knowledge repository
   - Document external API consumption
   - Document integration points
   - Document team ownership and contacts

#### Outcome

- Anti-patterns documented
- Troubleshooting guide created
- Quick reference created
- Final verification complete
- Part B: Application Overview & Integration Guide complete

#### Success Criteria

✅ Anti-patterns documented
✅ Troubleshooting guide created
✅ Quick reference guide created
✅ All documentation cross-linked
✅ Part B complete
✅ Final verification passed

---

## Change Tracking for Web Application Documentation

> **Common Structure:** See `canonical-reverse-engineering-shape.md` § Change Tracking for the universal change tracking rules, versioning convention, change types, and version alignment process. See `../_shared/templates/change-tracker-template.md` for the full Change Tracker file structure.

**Parts Affected:**
- **A** — Internal App Docs (docs/app/part-a-internal/)
- **B** — Overview & Integration Guide (docs/app/part-b-overview/)
- **Both** — Changes to both parts simultaneously

Log all documentation changes in `docs/app/CHANGE-TRACKER.md` for auditability and version control, using the Parts Affected classification above.

---

## Scaffolding Approach — Structure Before Content

> **Universal Principle:** See `canonical-reverse-engineering-shape.md` § Scaffolding Approach for the three-phase scaffolding methodology. Below are the Web Application-specific file structure and example headers.

### Web Application File Structure

Create all planned files with only headers and section placeholders:

```bash
docs/app/part-a-internal/
├── 01-app-overview.md
├── 02-environment-configuration.md
├── 03-project-structure.md
├── 04-architecture-design-patterns.md
├── 05-routing-navigation.md
├── 06-state-management.md
├── 07-component-hierarchy.md
├── 08-api-integration.md
├── 09-authentication-authorization.md
├── 10-styling-design-system.md
├── ...

docs/app/part-b-overview/
├── 01-application-overview.md
├── 02-key-features.md
├── 03-technology-stack.md
├── ...
```

### Web Application Example Scaffolding

Example for 03-project-structure.md:

```markdown
# 03. Project Structure

## Overview

[PLACEHOLDER]

## Folder Organization

[PLACEHOLDER]

### Feature Modules

[PLACEHOLDER]

### Shared Components and Utilities

[PLACEHOLDER]

## Naming Conventions

[PLACEHOLDER]
```

---

## Best Practices

### 1. Verify Every Fact Against Source Code

**Before documenting:**
- Read the actual source code, not comments or README
- If documentation contradicts code, code is the source of truth
- Flag anything you cannot verify in code as "UNVERIFIED"

**Example:**
```
UNVERIFIED: The README states the app supports IE11, but
package.json shows @babel/preset-env targets ES2020.
Needs confirmation from the team.
```

### 2. Document the "Why" Not Just the "What"

**Instead of:**
```
The state is managed using Redux.
```

**Do:**
```
The app uses Redux for state management because:
- Centralized state allows complex workflows to be traced easily
- DevTools integration helps with debugging time-travel
- Multiple features (Dashboard, Reports, Analytics) need shared access to user permissions
```

### 3. Make Examples Accurate and Copy-Paste Ready

**Instead of:**
```
// Example of calling an API
const data = api.get('users');
```

**Do:**
```
// Example: Fetch a user by ID and handle errors
const response = await userService.getUserById(userId);
if (response.error) {
  errorHandler.handle(response.error);
  return;
}
const userData = response.data;
```

### 4. Document Error Cases, Not Just Happy Paths

**Incomplete documentation:**
```
Route: GET /dashboard
Returns: Dashboard data
```

**Complete documentation:**
```
Route: GET /dashboard
Guard: AuthGuard (user must be logged in)
Returns on success: Dashboard data object
Returns on unauthorized: Redirects to login
Error handling:
  - If user loses connection: ErrorBoundary catches and displays offline message
  - If API call fails: Toast notification with retry button
```

### 5. Use Tables for Reference Data

Tables are easier to scan than paragraphs:

```markdown
| Route | Purpose | Auth Required | Props |
|-------|---------|---------------|-------|
| /dashboard | Main page | Yes | none |
| /settings | Settings page | Yes | settingsModule? |
| /login | Login page | No | redirectUrl? |
```

### 6. Document Relationships Explicitly

**Instead of:**
```
UserService gets users from the API.
```

**Do:**
```
UserService
  ├── Used by: userActions (Redux actions)
  ├── Calls: /api/v1/users endpoint
  ├── Stores result in: Redux state.users
  └── Consumed by: UserListComponent, UserDetailComponent
```

### 7. Keep Part A and Part B Aligned

Whenever you update Part A, review Part B:
- If Part A documents a new feature, does Part B mention which external APIs it uses?
- If Part A changes how state is managed, does Part B still accurately describe the app?
- If Part A documents a new component, is Part B's feature overview still accurate?

### 8. Use Consistent Terminology

Establish a glossary early and stick to it:
- Don't mix "store" and "state" and "reducer" arbitrarily
- Don't mix "route," "path," and "URL" without clarifying which is which
- Define framework-specific terms: "component," "service," "guard," "interceptor," etc.

---

## Common Pitfalls and Solutions

### Pitfall 1: Documenting Code That Doesn't Exist

**What happens:** AI reads commented-out code or TODO comments and documents them as if they're real features.

**Solution:**
```
"Document ONLY features that are actually implemented and working in the current codebase.
Do NOT document commented-out code, TODO comments, or planned features.
Verify every documented feature by finding the actual code that implements it."
```

### Pitfall 2: Misunderstanding Component Props

**What happens:** AI documents all props in a component's class definition, even props that are never actually used because they're leftover from refactoring.

**Solution:**
```
"For each component prop, verify:
1. Is it actually passed by parent components?
2. Is it actually used in the component's template or logic?
If a prop is defined but never used, flag it as 'unused' or don't document it."
```

### Pitfall 3: Missing the Global Context

**What happens:** AI documents a component's error handling without realizing there's a global error interceptor that catches all errors, making the component-level handling moot.

**Solution:**
- Always read global infrastructure BEFORE documenting features
- When documenting a feature, ask: "What global middleware/guards/interceptors affect this?"

### Pitfall 4: Incorrect API Documentation

**What happens:** AI documents API endpoints based on comments in the service code, but those endpoints don't actually exist in the backend, or parameters are wrong.

**Solution:**
```
"Before documenting an API call:
1. Read the actual service code
2. Trace the HTTP client call (what URL is actually sent?)
3. If possible, verify the endpoint actually works (check postman history, API docs)
4. Check error handling to understand what can go wrong"
```

### Pitfall 5: Assuming Styling Exists

**What happens:** AI assumes responsive breakpoints or design tokens exist because they're mentioned in a config file, but they're never actually used.

**Solution:**
- Document only design tokens/breakpoints that are actually used in component styles
- Cross-reference token usage in the actual SCSS/CSS files

### Pitfall 6: Incomplete Feature Documentation

**What happens:** AI documents the happy path but misses loading states, error states, empty states, and edge cases.

**Solution:**
```
"When documenting a feature, explicitly check for:
- Loading state: How is loading shown to the user?
- Error state: What happens if the API call fails?
- Empty state: What if there's no data?
- Edge cases: What if user is unauthorized? Session expired? Network drops?"
```

### Pitfall 7: Confusing Part A and Part B Scope

**What happens:** Part B includes internal implementation details that belong only in Part A.

**Solution:**
- Part B is for "What does this app do and which external APIs does it use?"
- Part A is for "How is this app built and how does it work internally?"
- When in doubt, keep it in Part A. Part B should be readable by a non-developer.

---

## Prompt Templates and Examples

### Template 1: Set Initial Context

```
We are reverse-engineering documentation for [APP NAME] v[VERSION].

Technology stack:
- Framework: [React/Angular/Vue/Svelte/Other]
- State management: [Redux/Vuex/Context/Zustand/Other]
- API client: [Axios/Fetch/Angular HttpClient/Other]
- Styling: [CSS Modules/CSS-in-JS/SCSS/Tailwind/Other]
- Testing: [Jest/Vitest/Jasmine/Other]

We are producing two documentation sets:
- Part A: Internal Application Documentation (for developers maintaining this app)
- Part B: Application Overview & Integration Guide (for knowledge repository)

We are currently extracting documentation for [SECTION/FEATURE].

Document ONLY what actually exists in the source code.
Do NOT invent routes, components, APIs, or features.
```

### Template 2: Extract Foundation Documentation

```
Based on the source code, extract the Application Overview section:

1. What is the primary purpose of this application?
2. What are the 3-5 key features?
3. Who are the end users?
4. What problem does it solve?

Then extract the Architecture Overview:
1. Is this an SPA, SSR, PWA, or other pattern?
2. What are the major feature modules?
3. How does data flow from API to UI?
4. What are the key design decisions and why were they made?

Verify every statement against the actual source code.
```

### Template 3: Extract Feature Documentation

```
Extract complete documentation for the [FEATURE NAME] feature:

Step 1: Routing
- What routes are defined for this feature?
- List the exact path, component, and guards for each route

Step 2: Components
- What components make up this feature?
- For each component: purpose, props, outputs, and role in the feature

Step 3: State
- Does this feature have feature-specific state?
- How is state initialized, updated, and accessed?

Step 4: API Integration
- What API endpoints does this feature call?
- For each endpoint: method, path, when it's called, how errors are handled

Step 5: Workflows
- What are the typical user workflows in this feature?
- Document the happy path and key error cases

Verify everything against actual source code.
```

### Template 4: Verify Against Source

```
You have documented [Component/Feature/Route]. Now verify:

1. For every route documented, show me the exact route definition
2. For every component prop documented, show me where it's defined in the source
3. For every API endpoint documented, show me the exact fetch/http call in the service code
4. For every state documented, show me the reducer/store definition

If you cannot find the source for something you documented, flag it as UNVERIFIED.
```

---

## Quick Reference Checklist

> **Common Checklist Items:** See `canonical-reverse-engineering-shape.md` § Quick Reference Checklist for universal completion criteria. Below are Web Application-specific items to verify.

### Web Application Foundation Phase
- [ ] Application overview documented (purpose, features, users)
- [ ] Technology stack documented with versions
- [ ] Architecture pattern explained (SPA/SSR/PWA)
- [ ] Key design decisions documented with rationale
- [ ] Project structure documented (folder organization)
- [ ] All routes documented with paths, components, guards
- [ ] Naming conventions documented (files, components, services)

### Web Application Global Infrastructure Phase
- [ ] State management structure documented (Redux/Vuex/Context/etc.)
- [ ] API service/HTTP client documented
- [ ] Authentication mechanism documented
- [ ] Authorization approach documented
- [ ] Error handling strategy documented
- [ ] Styling architecture documented
- [ ] Design tokens/colors documented
- [ ] Responsive breakpoints documented

### Web Application Feature Phases (For Each Feature)
- [ ] Feature purpose documented
- [ ] All routes in feature documented
- [ ] All components documented (purpose, props, outputs)
- [ ] Feature-specific state documented
- [ ] API calls documented (endpoints, method, auth)
- [ ] Error cases documented
- [ ] Loading states documented
- [ ] Key workflows documented

### Web Application Cross-Cutting Concerns
- [ ] i18n support documented
- [ ] Accessibility features documented (ARIA, keyboard nav)
- [ ] Performance optimizations documented
- [ ] Security practices documented
- [ ] Testing strategy documented
- [ ] Anti-patterns documented

### Web Application Build & Deployment
- [ ] Build process documented
- [ ] Environment configuration documented
- [ ] Deployment process documented
- [ ] CI/CD pipeline documented
- [ ] Monitoring/logging documented

### Universal Quality Assurance
- [ ] All documentation verified against source code
- [ ] No contradictions between Part A and Part B
- [ ] All cross-references are accurate
- [ ] Glossary is complete and consistent
- [ ] Changes logged in CHANGE-TRACKER.md
- [ ] Extraction status tracker updated
- [ ] No "UNVERIFIED" flags remain (unless intentional)

### Web Application Part B Completeness (Knowledge Repository)
- [ ] Application purpose clearly stated
- [ ] Key features listed
- [ ] Technology stack documented
- [ ] External APIs consumed documented
- [ ] How other systems integrate documented
- [ ] Team ownership documented
- [ ] Related systems documented
- [ ] Quick reference guide created

---

## Additional Resources

- **canonical-reverse-engineering-shape.md** — Universal principles, 7-step workflow methodology, scaffolding approach, and quality criteria applicable to all domain types
- **change-tracker-template.md** — Standard format for logging all documentation changes with Parts Affected classification
- **web-app-doc-template.md** — Complete template structure for Part A (Internal Application Documentation) and Part B (Application Overview & Integration Guide)
- **AI-SDLC-Best-Practices-Info-Dump.md** — General AI and documentation best practices reference

---

## Conclusion

This phase guide provides a disciplined, systematic approach to reverse-engineering web application documentation. By following the 7-step workflow and phase-by-phase extraction process, you will produce accurate, maintainable, AI-optimized documentation that serves both internal teams and external integrators.

**Remember:**
- Source code is the single source of truth
- Verify everything against actual implementation
- Document both happy paths and error cases
- Keep Part A and Part B aligned
- Update documentation as the application evolves
