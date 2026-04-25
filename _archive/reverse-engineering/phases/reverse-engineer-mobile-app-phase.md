# Reverse Engineer Mobile Application Documentation - Instructions

**Purpose:** Comprehensive reference for reverse-engineering existing mobile applications (Android, iOS, and React Native) into structured, maintainable documentation. Produces two complementary documentation deliverables from a single source of truth: internal application documentation for mobile developers and maintainers, and an application overview and integration guide for the knowledge repository.

**Target Audience:** Mobile app developers, technical architects, technical writers, developers tasked with documenting an undocumented or under-documented mobile application, and AI assistants performing documentation extraction.

**Source Documents:** Mobile-App-Doc-Template.md, canonical-reverse-engineering-shape.md, change-tracker-template.md.

---

## Table of Contents

- [What is Mobile Application Documentation Reverse Engineering?](#what-is-mobile-application-documentation-reverse-engineering)
- [The Two-Part Documentation Model](#the-two-part-documentation-model)
- [Why This Matters — Impact on Development Teams](#why-this-matters--impact-on-development-teams)
- [Core AI Principles for Mobile Documentation Extraction](#core-ai-principles-for-mobile-documentation-extraction)
- [The 7-Step Workflow for Mobile Documentation](#the-7-step-workflow-for-mobile-documentation)
- [Documentation Package Components](#documentation-package-components)
- [Phase-by-Phase Extraction Process](#phase-by-phase-extraction-process)
- [Platform-Specific Considerations](#platform-specific-considerations)
- [Change Tracking for Mobile Documentation](#change-tracking-for-mobile-documentation)
- [Scaffolding Approach — Structure Before Content](#scaffolding-approach--structure-before-content)
- [Best Practices](#best-practices)
- [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
- [Prompt Templates and Examples](#prompt-templates-and-examples)
- [Quick Reference Checklist](#quick-reference-checklist)

---

## What is Mobile Application Documentation Reverse Engineering?

### Definition

Reverse-engineering mobile application documentation is the disciplined process of **reading an existing mobile app's source code, configuration, architecture, navigation, state management, API integration, build configuration, and tests** and producing structured, accurate documentation that enables both mobile app developers and stakeholders to understand and maintain the application effectively.

This is NOT:
- Guessing what the app does based on its app store listing
- Writing aspirational documentation for features that don't exist
- Documenting platform-specific code without understanding the shared architecture
- Creating only a basic feature list without covering architecture, navigation, state management, or build/distribution

This IS:
- Systematically reading source code to extract the truth about app architecture, navigation patterns, state management, and API integration
- Producing internal documentation that enables maintainers to understand, extend, and evolve the codebase
- Producing an overview and integration guide suitable for knowledge repositories and stakeholder reference
- Creating living documentation that can be maintained as the app evolves across platform versions
- Documenting platform-specific concerns (Android SDK, iOS SDK, React Native bridge) while maintaining a unified view of the shared application logic

### Key Characteristics

- **Source-Code-Driven:** Every documented behavior must be verified against actual source code, not against app store descriptions or outdated READMEs
- **Two-Part Output:** Internal docs (Part A), Application Overview & Integration Guide (Part B)
- **Template-Aligned:** Internal docs follow the Mobile App Documentation Template structure
- **Platform-Aware:** Acknowledges Android, iOS, and React Native specifics while maintaining unified documentation where the logic is shared
- **Change-Tracked:** All documentation changes are logged for auditability and version alignment
- **AI-Optimized:** Structured so AI assistants can consume the documentation and generate accurate code for feature development and bug fixes

### What Belongs in Mobile Application Documentation

| **Include in Documentation** | **Do NOT Include** |
| --- | --- |
| App purpose, supported platforms, minimum OS versions | Aspirational features or planned-but-unbuilt functionality |
| Complete project structure and module organization | Internal build tool configuration that doesn't affect the app behavior |
| App architecture pattern (MVVM, MVI, Clean, Redux, etc.) with evidence from code | Architecture diagrams that don't reflect actual code organization |
| Navigation structure: screens, routes, deep linking setup | Platform-level technical details irrelevant to developers (e.g., internal gradle plugin versioning) |
| State management implementation with actual examples | Deprecated patterns no longer used in the codebase |
| API integration: endpoints consumed, authentication, token management, error handling | Marketing or product roadmap content |
| Local storage and persistence strategies (SQLite, Room, Core Data, Realm) | Sensitive credentials or API keys |
| Push notification setup and handling | Outdated implementation details |
| Build variants, flavors, schemes: what they are and when to use them | Temporary debugging code or feature branches |
| Signing and distribution process: certificates, provisioning profiles, app store metadata | Build machine setup instructions (use separate CI/CD docs) |
| Testing strategy: unit tests, instrumentation tests, UI tests | Personal development machine preferences |
| Platform-specific concerns: permissions, app lifecycle, deep linking, native modules | External services documentation (that belongs in API docs, not app docs) |
| Actual dependency versions from package files | "Latest" or approximate version ranges |

**Guiding Principle:** If you cannot point to the line of source code that proves a documented behavior, do not document it as fact. Flag it as "UNVERIFIED — needs source confirmation" instead.

---

## The Two-Part Documentation Model

### Overview

Mobile application documentation is managed centrally but published in two parts. Both parts derive from the same extraction process but serve different audiences with fundamentally different needs.

```
Source Code (Single Source of Truth)
        │
        ├──→ Extraction Process (this guide)
        │         │
        │         ├──→ Part A: Internal Application Documentation
        │         │         (app developers, maintainers)
        │         │
        │         └──→ Part B: Application Overview & Integration Guide
        │                   (stakeholders, knowledge repository)
        │
        └──→ Change Tracker (logs all documentation changes)
```

### Part A: Internal Application Documentation (Full)

**Audience:** Mobile app developers, platform engineers, maintainers, contributors — people who work on the app codebase itself.

**Scope:** Everything needed to understand, modify, and extend the application. Includes architecture, navigation, state management, API integration, local storage, native modules, build variants, signing, testing infrastructure, performance patterns, and platform-specific implementation details.

**Template:** Follows the Mobile App Documentation Template structure.

**Includes (in addition to everything derivable from Part B):**
- Complete project structure and directory organization rationale
- App architecture pattern implementation with examples: MVVM, MVI, Clean, Redux, BLoC, Riverpod
- View/Screen layer: component composition, lifecycle management, state observation
- State management implementation: stores, reducers, effects, side effects
- Navigation structure: route definitions, deep linking implementation, navigation guards
- API integration: HTTP client setup, request/response interceptors, authentication token management, error handling and retry logic
- Offline-first strategies: local caching, queue persistence, synchronization logic
- Local storage and persistence: database schemas, query patterns, data access layer
- Dependency injection: configuration, scopes, provider setup
- Native module integration: bridge setup, method channels, native callback handling
- Build variants/flavors/schemes: development, staging, production configurations
- App signing: certificate/provisioning profile requirements, keystore management
- CI/CD integration points: build triggers, artifact naming, distribution channels
- Testing infrastructure: test project setup, test data factories, mock implementations
- Platform-specific lifecycle hooks and their implementation
- Performance considerations: startup time optimizations, memory management, battery efficiency
- Feature flag implementation and rollout strategies
- Crash reporting and analytics integration

### Part B: Application Overview & Integration Guide

**Audience:** Product managers, stakeholders, team leads, knowledge base maintainers — people who need to understand what the app does and how it works without reading the source code.

**Scope:** High-level overview of the application: what it is, what platforms it supports, which APIs it consumes, key features, deployment topology, and the technologies/frameworks it uses.

**Why This Exists:** Stakeholders need to understand the application at a business and technical level without having to read source code. The knowledge repository needs a summary-level reference of what the app is, not how to build it.

**Includes:**
- Application purpose and target platforms
- Supported OS versions and device types
- High-level feature inventory
- Architecture pattern used (MVVM, Redux, etc.) without implementation details
- List of APIs/backend services consumed and their purpose
- Key mobile frameworks and libraries used (Jetpack Compose, SwiftUI, React Native)
- Persistence strategy (what data is stored locally)
- Authentication and authorization model
- Deployment topology: how the app reaches users (app stores, internal distribution, MDM)
- Current version and version history
- Known limitations or platform-specific constraints
- Related systems or dependencies
- Quick links to detailed internal documentation

**Explicitly Excludes:**
- Implementation details and code patterns
- Development setup instructions
- Build process and CI/CD configuration
- Testing strategies and test code
- Internal service patterns and abstractions
- Platform-specific code details (native modules, permissions)
- Step-by-step guides for building features

### Relationship Between Parts

**Rules:**
- Part B is always a **strict subset** of Part A
- Any information in Part B must also exist (in more detail) in Part A
- Part A may contain information that is deliberately excluded from Part B
- When Part A changes, evaluate whether Part B needs updating
- The Change Tracker records changes to both parts

---

## Why This Matters — Impact on Development Teams

### Impact on Mobile App Developers

Accurate mobile documentation directly enables:
- **Correct architecture understanding** — developers understand the pattern used and follow it consistently
- **Faster feature development** — understanding existing state management, navigation, and API patterns prevents reinventing solutions
- **Consistent code quality** — developers follow established patterns for testing, error handling, and logging
- **Safer refactoring** — understanding dependencies and change impact reduces bugs
- **Faster onboarding** — new developers learn the app structure from documentation, not by reading code
- **AI-assisted development** — AI assistants generate correct code when given accurate documentation as context

### Impact on Stakeholders

Accurate application overview enables:
- **Informed decision-making** — product managers understand technical constraints and dependencies
- **Accurate roadmapping** — knowing what APIs and backend services exist informs feature planning
- **Risk assessment** — understanding platform support and version constraints informs go-to-market decisions
- **Vendor/contractor communication** — external teams can onboard faster with clear documentation

### Impact on AI-Assisted Code Generation

AI assistants rely heavily on mobile app documentation to generate features. Poor documentation leads to:
- AI inventing plausible but wrong navigation patterns
- AI using deprecated state management approaches
- AI generating code that compiles but doesn't follow app architecture
- AI missing required platform-specific permissions or lifecycle handling
- AI implementing features inconsistently across platforms

**Critical Insight:** The Mobile App Documentation Template is specifically structured to give AI assistants the information they need in the order they need it. Following the template structure is not optional — it is a functional requirement for AI-assisted development.

### The Quality Chain

```
Source Code Accuracy → Documentation Accuracy → Developer Productivity
     (Truth)              (Extracted Truth)      (Applied Truth)
```

If documentation drifts from source code, every downstream consumer — human and AI — produces incorrect work.

---

## Core AI Principles for Mobile Application Documentation Extraction

> **Universal Principles:** See `canonical-reverse-engineering-shape.md` § Core AI Principles for Documentation Extraction for the six universal principles. Below are the Mobile Application-specific applications.

### 1. AI is Intelligent, But Not Smart — Mobile App Application

**How to apply:**
- Have AI read architecture files and comments first to understand the intended pattern
- After AI documents the state management, verify every reducer, effect, and observable against the source
- Check that platform-specific code (iOS vs Android vs RN) is documented separately where it differs
- Flag anything that cannot be verified as "needs verification"

### 2. Context is Critical — Mobile App Application

**How to apply:**
- Start with the app's entry point and app lifecycle before documenting individual screens
- Read the navigation structure early to understand how screens interact
- Document the state management pattern globally before documenting individual features
- Consider platform differences throughout — don't assume code is shared

### 3. AI Will Try to Do More Than Asked — Mobile App Application

**How to apply:**
- Be explicit: "Document ONLY the screens that are reachable from the main navigation. Do NOT include disabled screens."
- After documenting state management, ask: "Show me every place this store is injected and used. Are there any stores that exist but are unused?"
- Verify deep linking against actual URL schemes and route registration
- Check that every API endpoint mentioned in documentation is actually called from the app code

### 4. Platform Differences Are Subtle But Critical — Mobile App Application

**How to apply:**
- Document platform-specific code (Android Activities, iOS ViewControllers, React Native modules) separately
- When a feature is implemented across multiple platforms, show the platform-specific differences
- Note platform-specific lifecycle hooks and when they're called
- Document permission requirements per-platform

### 5. Token Limitations Affect Depth — Mobile App Application

**How to apply:**
- Document one feature module at a time (e.g., all authentication-related screens together)
- For complex features, break into: navigation routes first, then state management, then screens, then API integration
- Document the global app structure and lifecycle once, then reference it for each feature
- Use separate sessions for platform-specific documentation

### 6. Verification is Non-Negotiable — Mobile App Application

**How to apply:**
- After AI documents a screen, cross-check the inputs and navigation against the route definition
- Verify state mutations against the reducer code, not the test mocks
- Check that API calls documented actually exist in the API service layer
- Flag anything that cannot be verified as "UNVERIFIED"

---

## The 7-Step Workflow for Mobile Documentation

> **Universal Workflow:** See `canonical-reverse-engineering-shape.md` § The 7-Step Workflow for the standard workflow structure. Below are the Mobile Application-specific prompts and extraction order.

### Mobile-Specific Extraction Order

1. **App foundation first:**
   - App overview and purpose (Part A section 1)
   - Supported platforms and OS versions (Part A section 2)
   - Project structure and module organization (Part A section 3)
   - Build configuration, variants, and schemes (Part A section 4)

2. **Architecture and core patterns:**
   - App architecture pattern and rationale (Part A section 5)
   - Navigation structure and route definitions (Part A section 6)
   - State management implementation (Part A section 7)
   - Dependency injection setup (Part A section 8)

3. **Feature-independent infrastructure:**
   - API integration and networking (Part A section 9)
   - Authentication and authorization (Part A section 10)
   - Local storage and persistence (Part A section 11)
   - Push notifications and deep linking (Part A section 12)

4. **Feature-by-feature (repeat for each major feature):**
   - Read navigation routes for this feature
   - Read all screens/activities/viewcontrollers for this feature
   - Read state management code for this feature
   - Read API service calls for this feature
   - Read database queries for this feature
   - Extract Part A: internal implementation docs
   - Extract Part B: feature overview if user-facing

5. **Platform-specific documentation:**
   - Platform-specific lifecycle handling (Part A section 15)
   - Platform-specific permissions and capabilities (Part A section 16)
   - Platform-specific UI patterns (Part A section 17)

6. **Quality and maintenance:**
   - Testing strategy and test infrastructure (Part A section 18)
   - Signing and distribution (Part A section 19)
   - CI/CD integration (Part A section 20)
   - Performance patterns (Part A section 21)
   - Common patterns and anti-patterns (Part A section 22)

7. **Reference:**
   - Glossary and acronym definitions (Part A section 23)
   - Quick reference checklist (Part A section 24)

### Mobile-Specific Context Prompt (Step 1)

```
"We are reverse-engineering documentation for [APP NAME] version [VERSION].

We are producing two documentation deliverables:
- Part A: Internal Application Documentation (for developers and maintainers)
- Part B: Application Overview & Integration Guide (for stakeholders and knowledge repository)

We are currently extracting documentation for [FEATURE/SECTION].
Source files to read: [list files]
Platforms covered: [Android/iOS/React Native/All]

Document ONLY what exists in the source code. Do NOT invent screens, features,
or behaviors."
```

### Mobile-Specific Environment Inventory (Step 2)

**Have AI identify:**
- App entry points (MainActivity, AppDelegate, App.js)
- Navigation/routing files and route definitions
- State management files (stores, reducers, viewmodels, services)
- Screen/Activity/ViewController component files
- API service and networking client files
- Database and local storage implementations
- Authentication and authorization implementations
- Build configuration files and build variants
- Manifest and Info.plist (platform-specific configuration)
- Test files (unit, integration, UI tests)

### Mobile-Specific Refinements (Step 3)

**Example corrections:**
- "This app uses MVVM with LiveData, not Redux — state is held in ViewModels, not a global store"
- "Navigation uses Compose Navigation, not the traditional NavHostFragment"
- "API authentication uses JWT tokens stored in SharedPreferences (Android) and Keychain (iOS)"
- "The app has three build variants: debug, staging, and production with different API base URLs"
- "Deep linking is configured in the app manifest and handled by this specific Activity"

### Mobile-Specific Scaffolding Prompt (Step 4)

```
"Based on the Mobile App Documentation Template, propose the scaffolding structure
for [APP NAME] documentation. Show me:
- Part A file structure and section headers
- Part B file structure and section headers
- Recommended extraction order for features
- Platform-specific documentation approach

Show structure and headers ONLY, do not extract content yet."
```

### Mobile-Specific Verification Prompts (Step 7)

- "List every screen in the app that a user can navigate to from the home screen"
- "For the [Feature] state management, what data is stored in the store? What actions trigger mutations?"
- "What API endpoints does the [Feature] call? When are they called?"
- "How is authentication handled? Where are tokens stored? How are they refreshed?"
- "What are the build variants and how do they differ?"

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
│   ├── 02-platform-support.md
│   ├── 03-project-structure.md
│   ├── 04-build-configuration.md
│   ├── 05-app-architecture.md
│   ├── 06-navigation-structure.md
│   ├── 07-state-management.md
│   ├── 08-dependency-injection.md
│   ├── 09-api-integration.md
│   ├── 10-authentication-authorization.md
│   ├── 11-local-storage-persistence.md
│   ├── 12-push-notifications-deeplinks.md
│   ├── 13-features/
│   │   ├── feature-authentication.md
│   │   ├── feature-home.md
│   │   ├── feature-profile.md
│   │   └── [feature-name].md
│   ├── 14-shared-components.md
│   ├── 15-platform-specific-concerns.md
│   ├── 16-permissions-capabilities.md
│   ├── 17-ui-patterns.md
│   ├── 18-testing-strategy.md
│   ├── 19-signing-distribution.md
│   ├── 20-ci-cd-integration.md
│   ├── 21-performance-patterns.md
│   ├── 22-common-patterns-anti-patterns.md
│   ├── 23-glossary.md
│   ├── 24-quick-reference.md
│   └── appendix-a-feature-walkthrough.md
│
├── part-b-overview/                   # Part B: Application Overview & Integration Guide
│   ├── 01-application-overview.md     # Purpose, platforms, key features
│   ├── 02-architecture-summary.md     # High-level pattern summary
│   ├── 03-api-consumption.md          # List of APIs consumed
│   ├── 04-technology-stack.md         # Frameworks and libraries
│   ├── 05-deployment-topology.md      # How app reaches users
│   └── 06-quick-links.md              # Links to detailed internal docs
│
└── reference/
    ├── extraction-status.md           # Tracks what has/hasn't been documented
    └── verification-log.md            # Records verification results
```

### Extraction Status Tracker

**Purpose:** Track which parts of the app have been documented across both deliverables.

**Location:** `docs/app/reference/extraction-status.md`

**Format:**

```markdown
# Extraction Status

## Summary
- Total features: [X]
- Total screens: [Y]
- Part A complete: [Z/X] features
- Part B complete: [complete/in-progress/not-started]
- Verified: [U/Y] screens

## Features

| Feature | Screens | Part A | Part B | Verified | Notes |
|---------|---------|--------|--------|----------|-------|
| Authentication | Login, Signup, ForgotPassword | ✅ | ✅ | ✅ | |
| Home | Home, Feed | ✅ | ✅ | ✅ | |
| Profile | Profile, Settings, Edit | 🟡 In Progress | 🔵 Not Started | | Settings screen incomplete |

## Architecture & Infrastructure

| Section | Part A | Part B | Verified | Notes |
|---------|--------|--------|----------|-------|
| App Architecture | ✅ | ✅ | ✅ | MVVM documented |
| Navigation | ✅ | N/A | ✅ | |
| State Management | ✅ | ✅ | ✅ | |
| API Integration | ✅ | ✅ | ✅ | |
| Authentication | ✅ | ✅ | ✅ | |
| Local Storage | ✅ | ✅ | ✅ | |
| Push Notifications | ✅ | N/A | ✅ | |
| Testing | 🟡 In Progress | N/A | | Need test fixtures |
| Signing/Distribution | 🔵 Not Started | N/A | | |
```

---

## Phase-by-Phase Extraction Process

### Phase 1: App Discovery and Inventory

#### Phase Identity

**Phase ID:** MOBILE-EXTRACT-001
**Phase Name:** App Discovery and Inventory
**FR Mapping:** None (foundational)

#### Goal

A complete inventory of the app's screens, features, navigation structure, state management, API endpoints consumed, build variants, and key infrastructure components exists, with source file paths identified for every artifact.

#### Dependencies

None

#### Plan

1. Read the app manifest/plist and build configuration files to extract: app name, package name, supported OS versions, build variants/schemes, dependencies
2. Read the app entry point(s) to identify: how the app initializes, global setup, app lifecycle management
3. Read the navigation configuration to create a complete screen inventory: every screen/activity/viewcontroller, navigation routes, deep links
4. Walk the source directory to create a file inventory categorized by: screens, state management, services, networking, database, utilities
5. Identify the app architecture pattern: MVVM, MVI, Clean, Redux, BLoC, etc.
6. For each screen, record: route/identifier, purpose, inputs/navigation parameters, navigation targets
7. For each major feature, record: screens involved, state management, API endpoints called
8. Identify API integration: API base URL, endpoints consumed, authentication approach
9. Identify state management pattern: store structure, reducers, effects, viewmodels
10. Identify local storage and persistence: database, SharedPreferences/UserDefaults/async storage, caching strategy
11. Identify build variants and their differences (API URL, feature flags, behavior changes)
12. Create the extraction-status.md file with all identified artifacts at "Not Started" status
13. Create the CHANGE-TRACKER.md file with initial structure
14. Create the scaffolding structure for Part A and Part B

#### Outcome

- Complete screen inventory (route, purpose, navigation inputs, navigation targets)
- Complete feature inventory with screens and source paths
- App architecture pattern identified
- Navigation structure documented
- State management pattern identified
- API endpoints inventory created
- Build variants and configuration documented
- Local storage strategy documented
- Extraction status tracker created and populated
- Change tracker created
- Documentation scaffolding created for both parts

#### Automated Verification (AI Gate)

1. Compare registered routes/navigation against screen inventory — every route must be listed
2. Verify all source file paths in inventory resolve to actual files
3. Count screens and verify against route registration
4. Identify any screens not reachable from navigation

**Expected:**
- 100% of registered routes are inventoried
- All file paths resolve to actual files
- Screen count matches route registration
- All reachable screens are documented

#### Human Verification (Human Gate)

1. Review inventory for completeness — any screens, features, or API endpoints missing?
2. Verify the app architecture pattern identification is correct
3. Confirm supported platforms and OS versions are accurate
4. Approve feature grouping and extraction order

#### Success Criteria

✅ Screen inventory complete (every reachable screen documented)
✅ Feature inventory complete with source paths
✅ Navigation structure documented
✅ App architecture pattern identified
✅ State management pattern identified
✅ API endpoints inventory created
✅ Build variants and configuration documented
✅ Local storage strategy documented
✅ Extraction status tracker created
✅ Change tracker created
✅ Scaffolding created for both parts

---

### Phase 2: Architecture and Infrastructure Extraction

#### Phase Identity

**Phase ID:** MOBILE-EXTRACT-002
**Phase Name:** Architecture and Infrastructure Extraction
**FR Mapping:** None (foundational — affects all features)

#### Goal

The app's architecture pattern, navigation structure, state management implementation, dependency injection setup, API integration, authentication, and local storage strategy are fully documented for Part A, and the corresponding overview information is extracted for Part B.

#### Dependencies

MOBILE-EXTRACT-001 App Discovery and Inventory

#### Plan

1. **App Architecture (Part A + B):**
   - Read the app's core architecture files to understand the pattern used
   - Document the architecture pattern with UML/ASCII diagrams
   - Identify core abstractions: Models, ViewModels/ViewControllers, Views, Services, Repositories
   - For Part A section 5: document the complete architecture with code examples
   - For Part B section 2: summarize the architecture pattern used

2. **Navigation (Part A):**
   - Read the navigation configuration completely
   - Document every screen: identifier, purpose, navigation parameters, navigation graph
   - Document deep linking setup and URL scheme
   - Document navigation guards and conditional routing
   - Create navigation flow diagrams
   - Document the complete navigation architecture

3. **State Management (Part A + B):**
   - Read the state management implementation completely
   - Document the pattern: stores, actions, reducers, effects, selectors
   - Show the state tree structure
   - Document state mutations and side effects
   - For Part A section 7: complete state management documentation with code
   - For Part B section 2: summarize the state management approach

4. **Dependency Injection (Part A):**
   - Read the DI configuration
   - Document all singletons, factories, and scoped providers
   - Document how to add new services/dependencies
   - Show the DI container setup

5. **API Integration (Part A + B):**
   - Read the HTTP client setup
   - Document: base URL, headers, authentication, interceptors, error handling
   - List every API endpoint called from the app
   - Document request/response transformation
   - For Part A section 9: complete API integration documentation
   - For Part B section 3: list of APIs consumed and their purpose

6. **Authentication (Part A + B):**
   - Read the authentication implementation
   - Document: token storage, token refresh, logout, session management
   - Document the authentication flow
   - For Part A section 10: complete authentication implementation
   - For Part B section 2: high-level authentication approach

7. **Local Storage (Part A + B):**
   - Read the database/persistence implementation
   - Document the data model and schema
   - Document access patterns and queries
   - Document caching strategy
   - For Part A section 11: complete persistence documentation
   - For Part B section 2: summary of data persistence approach

8. Log all extracted content in the Change Tracker

#### Outcome

- App architecture documented (Part A)
- Navigation structure documented (Part A)
- State management documented (Part A + B)
- Dependency injection documented (Part A)
- API integration documented (Part A + B)
- Authentication documented (Part A + B)
- Local storage strategy documented (Part A + B)
- Application overview partially complete (Part B)

#### Automated Verification (AI Gate)

1. Verify navigation routes in documentation match actual route registration
2. Verify state management in documentation matches actual implementation
3. Verify API endpoints listed match actual HTTP calls in code
4. Verify authentication flow matches actual implementation

**Expected:**
- All navigation routes documented
- All state management patterns documented accurately
- All API endpoints listed and matched to code
- Authentication flow accurate

#### Human Verification (Human Gate)

1. Review navigation diagrams — do they accurately represent the app flow?
2. Verify state management documentation with a state flow diagram
3. Confirm API endpoints list is complete
4. Review authentication flow documentation for completeness
5. Validate local storage schema documentation

#### Success Criteria

✅ App architecture documented with pattern and examples
✅ Navigation structure documented with diagrams
✅ State management documented with examples
✅ Dependency injection documented
✅ API integration documented with complete endpoint list
✅ Authentication documented with flow diagrams
✅ Local storage strategy documented with schema
✅ Part B application overview foundation created
✅ Changes logged in Change Tracker

---

### Phase 3: Feature Module Extraction (Repeat Per Feature)

#### Phase Identity

**Phase ID:** MOBILE-EXTRACT-003.X (where X is the feature module number)
**Phase Name:** Feature Extraction — [Feature Name] (e.g., Authentication, Profile, Settings)
**FR Mapping:** Maps to the functional requirements the feature implements

#### Goal

Every screen in the [Feature] module is fully documented across both parts: internal implementation (Part A) and feature overview (Part B if user-facing).

#### Dependencies

MOBILE-EXTRACT-002 Architecture and Infrastructure Extraction

#### Plan

For each feature module:

**Step 1: Read All Source Files**
1. Read the navigation route definitions for this feature
2. Read all screen components/activities/viewcontrollers for this feature
3. Read state management code specific to this feature (stores, viewmodels, reducers)
4. Read all service/API calls specific to this feature
5. Read database queries specific to this feature
6. Read tests for this feature

**Step 2: Document Screens and Navigation**
1. For each screen: document identifier, purpose, navigation inputs, displayed data, user actions, navigation outputs
2. Document the feature's navigation graph
3. Document transitions between screens in this feature

**Step 3: Document State Management**
1. Document feature-specific state structure
2. Document how state is mutated (actions, reducers, viewmodel methods)
3. Document side effects and asynchronous operations
4. Document how the feature's state integrates with global state

**Step 4: Document API Integration**
1. List every API endpoint called by this feature
2. Document when each endpoint is called (on screen load, on user action, etc.)
3. Document request and response handling
4. Document error handling specific to this feature

**Step 5: Document Data Flow**
1. Create a data flow diagram: user action → state change → API call → state update → UI update
2. Highlight asynchronous operations and their handling

**Step 6: Document Testing**
1. Document test structure for this feature
2. Document key test scenarios
3. Document mock/test data

**Step 7: Verify Complete**
1. Ensure every screen in the feature is documented
2. Ensure every navigation path is covered
3. Ensure every API call is documented
4. Ensure state management is fully documented

#### Outcome

- All screens in [Feature] documented (Part A)
- Feature navigation documented (Part A)
- Feature state management documented (Part A)
- Feature API integration documented (Part A)
- Feature testing documented (Part A)
- Feature overview created if user-facing (Part B)

#### Automated Verification (AI Gate)

1. Verify every screen in feature is documented
2. Verify every navigation route for feature is documented
3. Verify every API call for feature is documented
4. Verify state management for feature is complete

**Expected:**
- 100% of feature screens documented
- 100% of feature navigation documented
- 100% of feature API calls documented
- State management fully documented

#### Human Verification (Human Gate)

1. Review feature screens documentation — are all user interactions covered?
2. Verify navigation paths match actual implementation
3. Confirm API integrations are correct
4. Review state management documentation for clarity
5. Verify test coverage is documented

#### Success Criteria

✅ All screens in feature documented
✅ Feature navigation complete
✅ Feature state management documented
✅ Feature API integration documented
✅ Feature data flow documented
✅ Feature testing documented
✅ Changes logged in Change Tracker

---

### Phase 4: Platform-Specific Documentation

#### Phase Identity

**Phase ID:** MOBILE-EXTRACT-004
**Phase Name:** Platform-Specific Documentation (Android, iOS, React Native)
**FR Mapping:** None (foundational for all platforms)

#### Goal

Platform-specific concerns, permissions, lifecycle handling, native modules, and platform-specific UI patterns are documented so developers understand the platform-specific implementation details.

#### Dependencies

MOBILE-EXTRACT-002 Architecture and Infrastructure Extraction

#### Plan

**For Android:**
1. Document AndroidManifest.xml configuration
2. Document required and optional permissions and their usage
3. Document Activity and Fragment lifecycle management
4. Document platform-specific UI patterns (Material Design, Compose, etc.)
5. Document native module integration (if any)
6. Document hardware integration (camera, microphone, location, sensors)

**For iOS:**
1. Document Info.plist configuration
2. Document required and optional permissions and their usage
3. Document UIViewController and SwiftUI lifecycle management
4. Document platform-specific UI patterns (Human Interface Guidelines, SwiftUI, UIKit)
5. Document native module integration (if any)
6. Document hardware integration (camera, microphone, location, sensors)

**For React Native:**
1. Document platform-specific code organization
2. Document native module integration
3. Document platform-specific APIs and bridge calls
4. Document Android-specific and iOS-specific implementations
5. Document hardware integration patterns

#### Outcome

- Platform-specific configuration documented (Part A)
- Permissions and capabilities documented per platform (Part A)
- Lifecycle management documented per platform (Part A)
- Platform-specific UI patterns documented (Part A)
- Native module integration documented (Part A)

#### Success Criteria

✅ Platform-specific configuration documented
✅ Permissions documented with usage
✅ Platform lifecycle documented
✅ Platform-specific UI patterns documented
✅ Native modules documented
✅ Changes logged in Change Tracker

---

### Phase 5: Testing and Quality Documentation

#### Phase Identity

**Phase ID:** MOBILE-EXTRACT-005
**Phase Name:** Testing and Quality Documentation
**FR Mapping:** None (foundational for all features)

#### Goal

Testing strategy, test infrastructure, test patterns, signing, distribution, CI/CD integration, and performance patterns are fully documented.

#### Dependencies

MOBILE-EXTRACT-002 Architecture and Infrastructure Extraction

#### Plan

1. **Testing Strategy (Part A):**
   - Document test pyramid: unit tests, integration tests, UI tests
   - Document testing frameworks used (XCTest, Espresso, Detox, etc.)
   - Document test project structure and organization
   - Document test data and fixtures

2. **Signing and Distribution (Part A):**
   - Document build signing requirements
   - Document certificate and provisioning profile setup
   - Document app store metadata and configuration
   - Document version management and release process

3. **CI/CD Integration (Part A):**
   - Document CI/CD pipeline triggers and stages
   - Document artifact management
   - Document deployment to test and production environments
   - Document rollback procedures

4. **Performance Patterns (Part A):**
   - Document startup time optimization
   - Document memory management patterns
   - Document battery efficiency considerations
   - Document performance testing and profiling

5. **Logging and Crash Reporting (Part A):**
   - Document logging infrastructure
   - Document crash reporting setup
   - Document analytics integration

#### Outcome

- Testing strategy documented (Part A)
- Test infrastructure documented (Part A)
- Signing and distribution documented (Part A)
- CI/CD integration documented (Part A)
- Performance patterns documented (Part A)
- Logging documented (Part A)

#### Success Criteria

✅ Testing strategy documented with examples
✅ Test infrastructure documented
✅ Signing and distribution documented
✅ CI/CD pipeline documented
✅ Performance patterns documented
✅ Logging and crash reporting documented
✅ Changes logged in Change Tracker

---

## Platform-Specific Considerations

### Android (Kotlin/Java)

**Architecture Patterns:**
- MVVM with LiveData/StateFlow
- Clean Architecture with layers (presentation, domain, data)
- MVI (Model-View-Intent) with Redux-like stores
- Compose with state holders

**Key Concepts:**
- Activity and Fragment lifecycle
- ViewModel and SavedStateHandle
- LiveData and StateFlow for reactive updates
- Room database for local storage
- Retrofit for API integration
- Jetpack Compose or XML-based layouts
- Dependency injection with Hilt or Dagger

**Documentation Focus:**
- Android-specific lifecycle hooks and their timing
- Permission handling (runtime permissions)
- SavedState and process death handling
- Fragment and Activity back stack management
- Compose state management and recomposition

### iOS (Swift)

**Architecture Patterns:**
- MVVM with Combine and SwiftUI
- Clean Architecture with layers
- VIPER pattern
- MVC with UIKit

**Key Concepts:**
- UIViewController and SwiftUI View lifecycle
- Combine frameworks for reactive updates
- Core Data for local storage
- URLSession for API integration
- SwiftUI or UIKit for UI
- Dependency injection patterns

**Documentation Focus:**
- View lifecycle and state initialization
- Combine publisher/subscriber patterns
- Core Data model and fetching
- SwiftUI property wrappers (@State, @StateObject, @EnvironmentObject)
- Navigation and app delegation

### React Native

**Architecture Patterns:**
- Redux with thunks or sagas
- MobX for state management
- Context API with hooks
- BLoC pattern
- Riverpod or Provider for state management

**Key Concepts:**
- Component-based architecture
- State and props management
- React Navigation for routing
- AsyncStorage for local persistence
- Redux or alternative state management
- Native modules for platform integration
- Bridge communication between JS and native

**Documentation Focus:**
- Navigation stack and screen transitions
- State management and Redux store structure
- Native module integration and bridge communication
- Platform-specific code organization (Android/ and ios/ directories)
- Performance optimization for React Native

---

## Change Tracking for Mobile Documentation

> **Universal Structure:** See `canonical-reverse-engineering-shape.md` § Change Tracking for the standard versioning, change types, and rules. Mobile Application change tracking uses the template from `../_shared/templates/change-tracker-template.md`.

**Parts Affected Values:** A (Internal App Docs), B (App Overview & Integration Guide), Both

---

## Scaffolding Approach — Structure Before Content

> **Universal Approach:** See `canonical-reverse-engineering-shape.md` § Scaffolding Approach for the rationale and universal process.

### Mobile-Specific Scaffolding Prompt

```
"Based on the Mobile App Documentation Template and the Phase 1 inventory, propose
the scaffolding structure for [APP NAME] documentation:

- Show the part-a-internal/ directory structure with all section files and headers
- Show the part-b-overview/ directory structure with all section files and headers
- Map each inventory item (screens, features, infrastructure components) to the sections where they belong
- Suggest the extraction order based on dependencies

Generate ONLY structure and headers. Do not extract content yet."
```

**Then create:**
1. part-a-internal/ directory with all section files (headers + TODO comments)
2. part-b-overview/ directory with all section files (headers + TODO comments)
3. reference/extraction-status.md with initial structure
4. CHANGE-TRACKER.md with initial entry
5. README.md with navigation and maintenance instructions

---

## Best Practices

### 1. Verify Early and Often

**Practice:** After AI documents a component or pattern, immediately verify it against the source code before moving on.

**Why:** Small inaccuracies compound. A misunderstood state management pattern will create errors in every feature documented afterward.

**How:**
- Ask AI to quote the source code that supports each claim
- Check that code examples match the actual implementation
- Verify that every API endpoint listed is actually called
- Trace navigation routes through the actual navigation config

### 2. Document in Focused Sessions

**Practice:** Limit each documentation session to one feature module or architectural component, not the entire app.

**Why:** Context window limits mean covering too much in one session leads to shallow, inaccurate documentation.

**How:**
- Document authentication feature completely in one session
- Document home feature completely in next session
- Document state management completely in its own session
- Refer to previously documented sections rather than re-explaining

### 3. Use Concrete Examples from Source Code

**Practice:** Every behavioral description should include a code example from the actual codebase.

**Why:** Concrete examples eliminate ambiguity and serve as verification of correctness.

**How:**
```markdown
**GOOD:** "When a user taps the Add button, the AddItemViewModel's `onAddClick()` method is called, which creates an `AddItemAction.Add(item)` action dispatched to the store. The reducer then adds the item to the state and triggers a `fetchItems()` side effect."

**BAD:** "Clicking the button adds the item to the list."
```

### 4. Keep Part A and Part B in Sync

**Practice:** When updating Part A, evaluate whether Part B needs updating.

**Why:** Part B is derived from Part A; if they diverge, stakeholders get stale or inaccurate information.

**How:**
- After each Part A update, explicitly ask: "Does Part B need to change?"
- Use the change tracker to document impacts on both parts
- Do not delete information from Part A without reviewing Part B

### 5. Document the "Why" Not Just the "What"

**Practice:** Explain architectural decisions, not just implementation details.

**Why:** Developers need to understand why a pattern was chosen to make consistent decisions in the future.

**How:**
```markdown
**GOOD:** "We chose MVVM because [platform framework] has first-class support for reactive updates with LiveData/StateFlow. The ViewModel holds all mutable state and business logic, and the View observes ViewModel properties and updates automatically."

**BAD:** "The app uses MVVM. There is a ViewModel class for each screen."
```

### 6. Test Your Documentation

**Practice:** After documenting a feature, have a developer unfamiliar with that feature implement a small change using only the documentation.

**Why:** If the documentation is unclear or incomplete, they'll find the gaps.

**How:**
- Have them add a small feature to a documented screen
- Have them modify state management for a documented feature
- Have them add an API integration to a documented endpoint
- Collect feedback and update documentation based on their experience

### 7. Use Consistent Terminology

**Practice:** Define terms in a glossary and use them consistently throughout.

**Why:** Inconsistent terminology (sometimes "store," sometimes "state manager") confuses readers.

**How:**
- Create a glossary section with all domain-specific terms
- Refer to the glossary when first introducing terms
- Use the exact same term every time (not synonyms)
- Call out when a term has platform-specific meanings

### 8. Keep Documentation Current

**Practice:** When source code changes, update documentation in the same PR/commit.

**Why:** Documentation drift is the leading cause of documentation becoming useless.

**How:**
- Make documentation updates mandatory in code reviews
- Treat documentation like code: it must be reviewed and approved
- Use the change tracker to mark what was recently updated
- Periodically audit documentation against source code

---

## Common Pitfalls and Solutions

### Pitfall 1: Documenting Implementation Instead of Behavior

**Problem:** Documentation focuses on "here's what the code does" rather than "here's what the feature accomplishes and why."

**Example of BAD documentation:**
```
"The AuthViewModel creates an AuthStore which extends StateFlow. When the login
button is tapped, the ViewModel calls authRepository.login(email, password)
which returns a Flow<Result<User>>."
```

**Example of GOOD documentation:**
```
"When a user enters their email and password and taps Login, the app makes
a POST /api/auth/login request with the credentials. If successful, the user's
session token is stored in Keychain (iOS) / SharedPreferences (Android) and
the app navigates to the Home screen. If unsuccessful, an error message is
displayed and the user remains on the Login screen."
```

**Solution:** Focus on user-facing behavior and app-level flows. Implementation details should illustrate behavior, not replace it.

### Pitfall 2: Mixing Platform-Specific Code Without Clarity

**Problem:** Documentation treats Android, iOS, and React Native code as identical when they're actually platform-specific.

**Example of BAD documentation:**
```
"The app stores the user token. The UserStore has a setToken() method
that saves the token."
```

**Example of GOOD documentation:**
```
"The app stores the user session token securely:
- Android: SharedPreferences (API 23+) or Encrypted SharedPreferences
- iOS: Keychain (secureItem, standard access control)
- React Native: AsyncStorage with encryption library

The AuthService.setToken(token) method handles platform-specific storage."
```

**Solution:** Explicitly call out which code is shared and which is platform-specific. Document platform-specific implementations separately.

### Pitfall 3: Documenting Unreachable Code

**Problem:** Documentation includes screens or features that exist in the codebase but are disabled or unreachable.

**Example of BAD documentation:**
```
"The app has the following screens: Login, Home, Profile, AdminPanel, Settings"
[But AdminPanel is unreachable from normal navigation; it's only for testing]
```

**Example of GOOD documentation:**
```
"The app has the following user-facing screens:
- Login
- Home
- Profile
- Settings

There is also an AdminPanel screen in the codebase that is for internal testing only
and is not reachable in production builds."
```

**Solution:** Document what's actually accessible in normal app flow. Flag test/debug screens separately.

### Pitfall 4: Assuming API Behavior Without Verification

**Problem:** Documentation describes API behavior based on assumptions rather than testing against actual implementation.

**Example of BAD documentation:**
```
"The login endpoint probably returns a token and user data."
```

**Example of GOOD documentation:**
```
"POST /api/auth/login request:
{
  "email": "user@example.com",
  "password": "password"
}

Response (200):
{
  "token": "eyJhbGc...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}

Response (401):
{
  "error": "Invalid credentials"
}

Response (400):
{
  "error": "Email and password are required"
}
```

**Solution:** Verify every API endpoint by actually calling it or reading the API documentation. Don't assume.

### Pitfall 5: Documentation That Only Works for One Platform

**Problem:** Documentation is written for one platform (usually iOS or Android) and doesn't account for React Native or the other platform.

**Solution:** When documenting cross-platform apps, always ask: "How does this work on [other platform]? Is the code the same or different?"

### Pitfall 6: Missing Navigation Details

**Problem:** Documentation doesn't explain how to navigate between screens, making it hard to understand the user flow.

**Example of BAD documentation:**
```
"After logging in, the user is on the Home screen. The Home screen has a Profile button."
```

**Example of GOOD documentation:**
```
"After successful login, the AuthService redirects the app to the Home screen
by calling navigationController.setRoot(HomeScreen). From the Home screen,
the user can tap the Profile button in the bottom navigation to navigate to
/profile/self. From the Profile screen, the user can tap Edit to navigate to
/profile/edit. From the Edit screen, the user can tap Save to update their
profile and return to the Profile screen (via pop navigation)."
```

**Solution:** Document the complete navigation graph and show how screens connect.

### Pitfall 7: Outdated Terminology

**Problem:** Documentation uses terms that don't match the codebase (e.g., "Redux store" when the app uses BLoC, or "ViewModel" when the app uses Controllers).

**Solution:** Use the exact terminology used in the actual codebase. If the codebase has inconsistent terminology, establish a glossary and use it consistently.

---

## Prompt Templates and Examples

### Template 1: Initial App Discovery

```
We are reverse-engineering documentation for [APP NAME] v[VERSION].

The app targets [platforms: Android/iOS/React Native].

First, let's create a complete inventory of the app:

1. Read the following files to extract basic app information:
   - [manifest/plist/package.json file]
   - [main entry point file]
   - [build configuration file]

2. Identify and list:
   - App purpose (what does it do?)
   - Supported platforms and OS versions
   - Build variants/schemes and their purpose
   - Key dependencies (state management, API client, database, etc.)

3. Create a preliminary screen inventory:
   - Read [navigation config file]
   - List every screen/activity/viewcontroller: identifier, purpose
   - Create a simple navigation graph showing screen connections

4. Verify:
   - Are there any screens in the codebase that aren't in the navigation graph?
   - Are there any build variants mentioned in config that we haven't accounted for?

Show the results in a structured format we can use as a foundation for detailed documentation.
```

### Template 2: State Management Documentation

```
We are documenting the state management for [APP NAME].

The app uses [state management pattern: MVVM/Redux/BLoC/etc].

Read the following files:
- [State management root/setup file]
- [Store/reducer/viewmodel files]
- [Any other state management related files]

Then document:

1. **State Structure:** What data is stored in state? Show the complete state tree/schema.

2. **State Mutations:** How does state change?
   - What actions/methods trigger state changes?
   - What is the complete flow from user action → state mutation?

3. **Side Effects:** What async operations happen?
   - Where are API calls made?
   - What triggers these side effects?
   - How are side effect results handled?

4. **Global vs Feature State:**
   - What state is global?
   - What state is feature-specific?
   - How do features access global state?

5. **Observable/Reactive Updates:**
   - What mechanism notifies the UI of state changes?
   - What are developers expected to observe?

For each major feature, show a complete example of a state flow:
user action → dispatch/call → mutation → effect → API call → mutation → UI update

Verify every example against the actual implementation.
```

### Template 3: Navigation Documentation

```
We are documenting the navigation structure for [APP NAME].

Read the navigation configuration files:
- [Navigation files]

Then document:

1. **Navigation Graph:** Create an ASCII or markdown diagram showing:
   - Every screen and its route/identifier
   - Navigation paths between screens
   - Which screens are entry points

2. **Screen Details:** For each screen, document:
   - Route identifier
   - Purpose (what does the user do here?)
   - Navigation inputs (what parameters does it accept?)
   - Navigation outputs (where can the user go from here?)

3. **Deep Linking:**
   - What URL schemes are supported?
   - How are deep links mapped to screens?
   - Are there any guarded routes?

4. **Navigation Guards:**
   - Are there any screens that require authentication?
   - Are there any conditional navigations?

5. **Tab/Bottom Navigation:**
   - If applicable, what are the main navigation tabs?
   - Can users navigate between tabs?

Verify the navigation graph by tracing through the actual route registration.
```

### Template 4: API Integration Documentation

```
We are documenting the API integration for [APP NAME].

Read the following files:
- [HTTP client setup]
- [API service files]
- [Any interceptor or middleware files]
- [Authentication implementation]

Then document:

1. **HTTP Client Setup:**
   - What HTTP client library is used?
   - What is the base URL?
   - What default headers are set?
   - What interceptors are configured?

2. **API Endpoints:** For each endpoint the app calls:
   - Method (GET, POST, etc.)
   - Path
   - When is this called?
   - What parameters does it send?
   - What does it expect back?
   - What errors can it return?

3. **Authentication:**
   - How does the app authenticate API requests?
   - Where is the token stored?
   - How is it included in requests?
   - How is token refresh handled?

4. **Error Handling:**
   - How are API errors handled?
   - What happens when the network is unavailable?
   - What happens on timeout?

5. **Request/Response Transformation:**
   - Does the app transform request data before sending?
   - Does the app transform response data after receiving?

List every API endpoint called, and verify each against the actual implementation.
```

---

## Quick Reference Checklist

> **Common Items:** See `canonical-reverse-engineering-shape.md` § Quick Reference Checklist for the standard items that apply to all reverse engineering phases. Below are mobile application-specific additions.

### Mobile App-Specific Checks

**Before Starting Documentation:**
- [ ] App source code is accessible and readable
- [ ] Build configuration files are understood (gradle, Build Settings, package.json)
- [ ] Architecture pattern is identified (MVVM, Redux, BLoC, etc.)
- [ ] Supported platforms are documented (Android, iOS, React Native)
- [ ] Key dependencies are documented
- [ ] Navigation structure is explored
- [ ] State management approach is understood
- [ ] API integration is mapped

**Part A Documentation:**
- [ ] App overview written (section 1)
- [ ] Platform support documented (section 2)
- [ ] Project structure documented (section 3)
- [ ] Build configuration documented (section 4)
- [ ] App architecture documented (section 5)
- [ ] Navigation structure documented (section 6)
- [ ] State management documented (section 7)
- [ ] Dependency injection documented (section 8)
- [ ] API integration documented (section 9)
- [ ] Authentication documented (section 10)
- [ ] Local storage documented (section 11)
- [ ] Push notifications/deep linking documented (section 12)
- [ ] All features documented (section 13)
- [ ] Shared components documented (section 14)
- [ ] Platform-specific concerns documented (section 15-17)
- [ ] Testing documented (section 18)
- [ ] Signing and distribution documented (section 19)
- [ ] CI/CD documented (section 20)
- [ ] Performance patterns documented (section 21)
- [ ] Common patterns and anti-patterns documented (section 22)
- [ ] Glossary created (section 23)
- [ ] Quick reference created (section 24)

**Part B Documentation:**
- [ ] Application overview written (section 1)
- [ ] Architecture summary written (section 2)
- [ ] API consumption list created (section 3)
- [ ] Technology stack documented (section 4)
- [ ] Deployment topology documented (section 5)
- [ ] Quick links provided (section 6)

**Mobile-Specific Verification:**
- [ ] Every screen documented is reachable in the app
- [ ] Every navigation route documented matches actual route registration
- [ ] Every API endpoint documented is actually called from app code
- [ ] Every state mutation documented matches actual implementation
- [ ] Platform-specific code (Android/iOS) is documented separately where it differs
- [ ] Build variants and their differences are documented
- [ ] Lifecycle handling is documented per platform
- [ ] Permissions are documented with their purpose and platform requirements

---

## Additional Resources

### Canonical References

- `canonical-reverse-engineering-shape.md` — Shared foundations for all reverse engineering phases
- `../_shared/templates/change-tracker-template.md` — Standard change tracking template and structure

### Mobile App Architecture and Documentation Standards

- [Architecture Patterns in Mobile Development (2026): MVVM, MVI, and Clean Architecture](https://medium.com/@jyc.dev/architecture-patterns-in-mobile-development-2026-mvvm-mvi-and-clean-architecture-f26583f53522)
- [MVVM in SwiftUI for a Better Architecture](https://matteomanferdini.com/swiftui-mvvm/)
- [Clean Architecture for SwiftUI](https://nalexn.github.io/clean-architecture-swiftui/)
- [Introducing MVVM into your SwiftUI project](https://www.hackingwithswift.com/books/ios-swiftui/introducing-mvvm-into-your-swiftui-project)
- [Modern MVVM iOS App Architecture with Combine and SwiftUI](https://www.vadimbulavin.com/modern-mvvm-ios-app-architecture-with-combine-and-swiftui/)

### React Native Architecture Standards

- [React Native Architecture Overview](https://reactnative.dev/architecture/overview)
- [React Native's New Architecture - Expo Documentation](https://docs.expo.dev/guides/new-architecture/)
- [Structure your React Native app for Scale](https://medium.com/@malikchohra/structure-your-react-native-app-for-scale-part-1-patterns-and-principles-to-master-a3b24b6acf97)
- [Architecting React and React Native Applications for Scalability and Maintainability](https://medium.com/@sagar.hudge/architecting-react-and-react-native-applications-for-scalability-and-maintainability-de054039b50d)

### Android Architecture Standards

- [Android Architecture Components - Google Developers](https://developer.android.com/guide/navigation)
- [Jetpack Compose Navigation](https://developer.android.com/jetpack/compose/navigation)

### Mobile Testing Standards

- [Guide to End-to-End Detox Testing](https://dev.to/berthaw82414312/guide-to-end-to-end-detox-testing-2hcb)
- [Espresso - Android Developers](https://developer.android.com/training/testing/espresso)
- [Complete Guide to Mobile App Test Automation](https://maestro.dev/insights/complete-guide-to-mobile-app-test-automation)
- [Introduction to Test Automation with Espresso and XCUITest](https://reintech.io/blog/introduction-to-test-automation-with-espresso-and-xcuitest)

### Mobile CI/CD and Distribution

- [Android CI/CD with Fastlane and Play Store Deployment](https://medium.com/rocknnull/android-ci-cd-part-1-locally-building-and-pushing-to-play-store-using-fastlane-cfc28032d8ed)
- [Mobile CI/CD: Fastlane, GitHub Actions, and App Store Deployment](https://calmops.com/mobile/mobile-ci-cd-fastlane-github-actions/)
- [CI-CD Pipeline for iOS and Android Apps: A Step-by-Step Guide](https://www.linkedin.com/pulse/ci-cd-pipeline-ios-android-apps-step-by-step-guide-zia-tahir-loe5f)
- [CI/CD for mobile apps: the complete guide](https://blog.codemagic.io/the-complete-guide-to-ci-cd/)

