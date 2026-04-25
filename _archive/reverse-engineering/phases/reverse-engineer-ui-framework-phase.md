# Reverse Engineer UI Framework Documentation - Instructions

**Purpose:** Comprehensive reference for reverse-engineering an existing UI framework's source code into structured, maintainable documentation. Produces two complementary documentation sets from a single source of truth.

**Target Audience:** Framework maintainers, technical writers, developers tasked with documenting an undocumented or under-documented UI framework, and AI assistants performing documentation extraction.

**Source Documents:** canonical-reverse-engineering-shape.md, change-tracker-template.md, UI-Framework-Doc-Template.md, AI-SDLC-Best-Practices-Info-Dump.md.

---

## Table of Contents

- [What is Framework Documentation Reverse Engineering?](#what-is-framework-documentation-reverse-engineering)
- [The Two-Part Documentation Model](#the-two-part-documentation-model)
- [Why This Matters — Impact on Downstream Consumers](#why-this-matters--impact-on-downstream-consumers)
- [Core AI Principles for Documentation Extraction](#core-ai-principles-for-documentation-extraction)
- [The 7-Step Workflow for Framework Documentation](#the-7-step-workflow-for-framework-documentation)
- [Documentation Package Components](#documentation-package-components)
- [Phase-by-Phase Extraction Process](#phase-by-phase-extraction-process)
- [Change Tracking for Framework Documentation](#change-tracking-for-framework-documentation)
- [Scaffolding Approach — Structure Before Content](#scaffolding-approach--structure-before-content)
- [Best Practices](#best-practices)
- [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
- [Prompt Templates and Examples](#prompt-templates-and-examples)
- [Quick Reference Checklist](#quick-reference-checklist)

---

## What is Framework Documentation Reverse Engineering?

### Definition

Reverse-engineering framework documentation is the disciplined process of **reading an existing UI framework's source code, configuration, and tests** and producing structured, accurate documentation that enables both framework maintainers and framework consumers to work effectively.

This is NOT:
- Guessing what the framework does based on its name
- Writing aspirational documentation for features that don't exist
- Copying README snippets verbatim without verification

This IS:
- Systematically reading source code to extract the truth
- Organizing findings into a known template structure
- Producing two audience-specific views of the same source of truth
- Creating living documentation that can be maintained as the framework evolves

### Key Characteristics

- **Source-Code-Driven:** Every documented behavior must be verified against actual source code
- **Two-Part Output:** One document set for framework maintainers, one for framework consumers/implementers
- **Template-Aligned:** Output follows the UI Framework Documentation Template structure
- **Change-Tracked:** All documentation changes are logged for auditability and version alignment
- **AI-Optimized:** Structured so AI assistants can consume the documentation and generate accurate code

### What Belongs in Framework Documentation

| **Include in Documentation** | **Do NOT Include** |
| --- | --- |
| Public API surfaces (components, services, directives, pipes) | Speculative features or planned-but-unbuilt functionality |
| Actual default values extracted from source code | Assumed defaults not verified against code |
| Real type signatures, interfaces, and enums | Invented or simplified type signatures |
| Verified behavior from tests and source | Behavior inferred from naming conventions alone |
| Configuration options with their actual defaults | Configuration options from outdated README files |
| Actual dependency versions from package.json | "Latest" or approximate version ranges |
| Extension points and hooks that exist in code | Extension points that "should" exist |

**Guiding Principle:** If you cannot point to the line of source code that proves a documented behavior, do not document it as fact. Flag it as "needs verification" instead.

---

## The Two-Part Documentation Model

### Overview

Framework documentation is managed centrally but published in two parts. Both parts derive from the same extraction process but serve different audiences with different needs.

### Part A: Framework Documentation (Full)

**Audience:** Framework developers, maintainers, contributors.

**Scope:** Everything — internals, architecture decisions, private APIs, build system, testing infrastructure, internal state management, change detection strategies, and the complete public API.

**Purpose:**
- Enable maintenance and evolution of the framework itself
- Document internal architecture so future maintainers understand WHY decisions were made
- Record internal patterns, conventions, and constraints
- Provide the complete source of truth from which Part B is derived

**Includes (in addition to everything in Part B):**
- Internal service implementations and their state management
- Private methods and their contracts
- Internal component communication mechanisms
- Build and publish pipeline details
- Internal test utilities and testing patterns
- Performance internals (change detection strategy, rendering pipeline)
- Migration and deprecation implementation details
- Internal DI token usage and provider chains

### Part B: Implementer Documentation (Consumer-Facing)

**Audience:** Developers who USE the framework to build applications. They do NOT develop the framework itself.

**Scope:** Public interfaces, classes, components, services, directives, pipes, extension points, configuration options, theming, patterns, recipes, anti-patterns, and testing utilities for consumers.

**Purpose:**
- Enable application developers to use the framework correctly and efficiently
- Document how to extend, configure, and customize the framework
- Provide recipes and patterns for common use cases
- Define anti-patterns to prevent misuse
- Serve as context for AI-assisted code generation

**Explicitly Excludes:**
- Internal implementation details (how a component renders internally)
- Private methods and properties
- Internal state management mechanisms
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
| Does this describe a private API or method? | ✅ | |
| Would changing this require modifying the framework source? | ✅ (internals) | ✅ (public API changes affect both) |
| Does an app developer need to know this to use the framework? | | ✅ Both Parts |
| Does this describe a public @Input, @Output, or method? | | ✅ Both Parts |
| Does this describe how to extend or configure the framework? | | ✅ Both Parts |
| Does this describe a DI token that consumers can override? | | ✅ Both Parts |
| Does this describe the framework's build system? | ✅ | |

---

## Why This Matters — Impact on Downstream Consumers

### Impact on Application Developers

Accurate framework documentation directly enables:
- **Correct usage** — developers use components as designed, not by trial-and-error
- **Consistent patterns** — teams follow the same approach instead of inventing ad-hoc solutions
- **Faster onboarding** — new developers learn the framework from documentation, not by reading source code
- **AI-assisted development** — AI assistants generate correct code when given accurate documentation as context
- **Fewer bugs** — anti-patterns are documented, preventing common mistakes

### Impact on AI-Assisted Code Generation

AI assistants rely heavily on framework documentation to generate code. Poor documentation leads to:
- AI inventing plausible but wrong API surfaces
- AI using deprecated patterns
- AI generating code that compiles but doesn't follow framework conventions
- AI missing required providers, imports, or configuration

**Critical Insight:** The UI Framework Documentation Template is specifically structured to give AI assistants the information they need in the order they need it. Following the template structure is not optional — it is a functional requirement for AI-assisted development.

### The Quality Chain

```
Source Code Accuracy → Documentation Accuracy → AI Code Generation Accuracy
     (Truth)              (Extracted Truth)         (Applied Truth)
```

If documentation drifts from source code, every downstream consumer — human and AI — produces incorrect work.

---

## Core AI Principles for Documentation Extraction

> **Universal Principles:** See `canonical-reverse-engineering-shape.md` § Core AI Principles for Documentation Extraction for the six universal principles. Below are the UI Framework-specific applications.

### 1. AI is Intelligent, But Not Smart — UI Framework Application

**How to apply:**
- Have AI read component source code files one at a time, not the entire component directory at once
- After AI documents a component, verify every @Input, @Output, and method against the source
- Check default values in component property initializers — AI frequently invents plausible but wrong defaults
- Verify type signatures exactly — AI may simplify complex union types or generic types

### 2. Context is Critical — UI Framework Application

**How to apply:**
- Start with the framework's architecture document and build configuration before documenting components
- Provide the framework's package.json for dependency versions and peer dependencies
- Provide configuration files (angular.json, tsconfig.json) for environment context and path aliases
- Have AI read the shared types file (e.g., shared.types.ts) before documenting components that use those types
- Reference the framework's change detection strategy before documenting component lifecycle

### 3. AI Will Try to Do More Than Asked — UI Framework Application

**How to apply:**
- Be explicit: "Document ONLY the public API that exists in the source code. Do NOT invent component features based on the component name."
- After documenting inputs, ask: "For each @Input you documented, show me the exact line in the source file where it's declared with @Input()."
- State what NOT to do: "Do NOT generate example code that uses @Input properties not present in the source. Only use real inputs."

### 4. Token Limitations Affect Depth — UI Framework Application

**How to apply:**
- Document one component at a time, not an entire category at once
- For complex components (many @Inputs/@Outputs), break into: API surface first, then usage patterns, then edge cases
- If a component spans multiple files (TS, HTML, SCSS, spec), prioritize the .ts file for API extraction first
- For services, read the .ts file before any test files if space is limited

### 5. Verification is Non-Negotiable — UI Framework Application

**How to apply:**
- After AI documents a component, cross-check every @Input declaration against the source
- Verify default values by checking the property initializer in the component class
- Check @Output types against the EventEmitter generic type parameter
- Verify content projection slots exist in the component template with matching select attributes
- Run framework test files to confirm documented behavior

### 6. AI Has Short Memory (Session Only) — UI Framework Application

**How to apply:**
- At the start of each session, have AI read the framework overview and conventions document first
- Reference the extraction status tracker to see what components have been completed and their conventions
- Reference previously documented components when documenting similar components
- Commit documentation after each component extraction so conventions carry forward
- Use the scaffolding structure as a map for what's done and what remains

---

## The 7-Step Workflow for Framework Documentation

> **Workflow Structure:** See `canonical-reverse-engineering-shape.md` § The 7-Step Workflow for the universal workflow structure and step purposes. Below are the UI Framework-specific prompt templates and examples.

### Step 1: Set Context of Deliverable — Framework Prompt

```
"We are reverse-engineering documentation for [FRAMEWORK NAME] version [VERSION].
We are producing two documentation sets: Part A (full framework docs for maintainers)
and Part B (implementer docs for app developers). We are currently documenting
[COMPONENT/SERVICE/SECTION].

We are in the Documentation Extraction phase. The source files we will read:
- [file path 1]
- [file path 2]

For Part A: document the complete implementation details.
For Part B: document only the public API that app developers need.
Do NOT invent features that don't exist in the source code."
```

### Step 2: Set Context of Audience/Environment/Components — Framework Prompt

```
"Identify the technical context for documenting [COMPONENT/SERVICE]:
1. What framework version and Angular version are we documenting?
2. What source files make up this [component/service]?
3. What shared types and interfaces does it depend on?
4. What framework-wide conventions apply (e.g., change detection strategy, naming prefixes)?
5. What test files reveal expected behavior?"
```

### Step 3: Refine the Feedback — Framework Examples

- "This framework uses OnPush change detection for all components — note this"
- "All component selectors have the prefix 'fw-', not 'app-'"
- "Only document the current API in /src/current/ — ignore the deprecated /src/legacy/ folder"
- "DI tokens are exported from core/tokens/ but imported in components via the public API"

### Step 4: Create Scaffolding Structure — Framework Prompt

```
"Based on the UI Framework Documentation Template, propose the scaffolding structure
for [FRAMEWORK NAME] Part A (full) and Part B (implementer) documentation.

Show me for each part:
- What files should we create?
- What are the major section headers?
- Which components/services/features map to each section?
- What is the recommended extraction order?

Show structure and headers ONLY — do not extract any content yet."
```

### Step 5: Create Content Chunk-by-Chunk — Framework Extraction Order

1. Framework overview and architecture (from README, main module, core config)
2. Environment and configuration (from package.json, angular.json, tsconfig.json)
3. Project structure and conventions (from folder structure, component naming patterns)
4. Shared types, interfaces, and enums (from model/type files in public API)
5. Theming and design tokens (from SCSS variables, theme configuration files)
6. Components — one category at a time, one component per session (from component source files)
7. Services — one at a time (from service source files)
8. Directives and pipes (from directive/pipe source files)
9. DI tokens and providers (from token definitions, provider functions)
10. Patterns and recipes (from examples, demos, test files)
11. Anti-patterns (from test files and code review history)
12. Testing utilities (from testing module/helpers, only consumer-facing)
13. Accessibility features (from component templates, ARIA attributes)
14. Migration and upgrade notes (from CHANGELOG, breaking change history)

### Step 6: Add Supporting Documents — Framework Examples

- Framework README and CHANGELOG
- Existing documentation (conversion reference)
- Framework demo/example applications
- Test files for the specific component/service
- package.json (exact dependency and peer dependency versions)
- Framework's build configuration (angular.json, tsconfig.json)
- Framework's own style guide or contribution guide

### Step 7: Verify Understanding — Framework Verification Prompts

For components:
- "Before documenting [ComponentName], list every @Input() property found in the source file with its type and default value"
- "What are ALL the @Output() properties? Show the EventEmitter payload type for each"
- "What content projection slots exist in the template? Show the select attribute for each ng-content"

For services:
- "List every public method with its full signature (parameters and return type)"
- "Does this service expose any public Observables? List them with their emission type"
- "Is this service stateful? What state does it maintain?"

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
│   ├── 04-internal-architecture.md    # Part A ONLY
│   ├── 05-build-publish-pipeline.md   # Part A ONLY
│   ├── 06-theming-styling.md
│   ├── 07-components/
│   │   ├── 07-00-component-index.md
│   │   ├── 07-01-[category]-components.md
│   │   └── ...
│   ├── 08-services/
│   │   ├── 08-00-service-index.md
│   │   ├── 08-01-[service-name].md
│   │   └── ...
│   ├── 09-directives-pipes.md
│   ├── 10-shared-types-interfaces-enums.md
│   ├── 11-di-tokens-providers.md
│   ├── 12-inter-component-communication.md
│   ├── 13-routing-navigation.md
│   ├── 14-forms-validation.md
│   ├── 15-data-fetching.md
│   ├── 16-i18n.md
│   ├── 17-performance-patterns.md
│   ├── 18-security-conventions.md
│   ├── 19-internal-patterns.md        # Part A ONLY
│   ├── 20-common-patterns-recipes.md
│   ├── 21-anti-patterns.md
│   ├── 22-error-handling.md
│   ├── 23-testing.md
│   ├── 24-internal-testing.md         # Part A ONLY
│   ├── 25-accessibility.md
│   ├── 26-migration-upgrade.md
│   ├── 27-glossary.md
│   ├── 28-quick-reference.md
│   └── appendix-a-reference-app.md
│
├── part-b-implementer/                # Part B: Implementer Documentation
│   ├── 01-framework-overview.md
│   ├── 02-environment-configuration.md
│   ├── 03-project-structure.md
│   ├── 04-theming-styling.md
│   ├── 05-components/
│   │   ├── 05-00-component-index.md
│   │   ├── 05-01-[category]-components.md
│   │   └── ...
│   ├── 06-services/
│   │   ├── 06-00-service-index.md
│   │   ├── 06-01-[service-name].md
│   │   └── ...
│   ├── 07-directives-pipes.md
│   ├── 08-shared-types-interfaces-enums.md
│   ├── 09-di-tokens-providers.md
│   ├── 10-inter-component-communication.md
│   ├── 11-routing-navigation.md
│   ├── 12-forms-validation.md
│   ├── 13-data-fetching.md
│   ├── 14-i18n.md
│   ├── 15-performance-patterns.md
│   ├── 16-security-conventions.md
│   ├── 17-common-patterns-recipes.md
│   ├── 18-anti-patterns.md
│   ├── 19-error-handling.md
│   ├── 20-testing.md
│   ├── 21-accessibility.md
│   ├── 22-migration-upgrade.md
│   ├── 23-glossary.md
│   ├── 24-quick-reference.md
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
- Total components: [X]
- Documented: [Y]
- Verified: [Z]
- Remaining: [W]

## Components

| Component | Source Path | Part A | Part B | Verified | Notes |
|-----------|-----------|--------|--------|----------|-------|
| FwButton | src/components/button/ | ✅ | ✅ | ✅ | |
| FwTable | src/components/table/ | ✅ | ✅ | 🔵 Pending | Complex — needs second pass |
| FwDialog | src/components/dialog/ | 🔵 Not Started | 🔵 Not Started | | |

## Services

| Service | Source Path | Part A | Part B | Verified | Notes |
|---------|-----------|--------|--------|----------|-------|
| FwAuthService | src/core/auth/ | ✅ | ✅ | ✅ | |
| FwToastService | src/core/toast/ | 🟡 In Progress | 🔵 Not Started | | |

## Other Artifacts

| Artifact | Source Path | Part A | Part B | Verified | Notes |
|----------|-----------|--------|--------|----------|-------|
| Design tokens | src/styles/_variables.scss | ✅ | ✅ | ✅ | |
| DI Tokens | src/core/tokens/ | 🔵 Not Started | 🔵 Not Started | | |
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

1. Read the framework's `package.json` to extract name, version, dependencies, and peer dependencies
2. Read `angular.json` or equivalent to identify build configuration and entry points
3. Read `tsconfig.json` and `tsconfig.lib.json` to identify compilation settings and path aliases
4. Read the framework's `public-api.ts` or barrel export files to identify the complete public API surface
5. Walk the `src/` directory to create a file inventory, categorizing by: components, services, directives, pipes, models/types, tokens, utilities, tests, styles
6. For each public export, record: export name, source file path, type (component/service/directive/pipe/type/token)
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

1. Compare public-api.ts exports against inventory — every export must be listed
2. Verify all source file paths in inventory are valid
3. Verify scaffolding files exist with correct headers

**Expected:**
- 100% of public exports are inventoried
- All file paths resolve to actual files
- Scaffolding structure matches the template

#### Human Verification (Human Gate)

1. Review inventory for completeness — any components, services, or types missing?
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

Template sections 1–3 (Framework Overview, Environment and Configuration, Project Scaffolding and Structure) are fully documented for both Part A and Part B.

#### Dependencies

EXTRACT-001 Framework Discovery and Inventory

#### Plan

1. Read the framework's main module/config files to extract the architectural overview
2. Read README, CONTRIBUTING.md, and any existing documentation for stated philosophy and design principles
3. Extract prerequisite versions from `package.json` (Node, Angular, TypeScript, RxJS, peer deps)
4. Extract browser compatibility from browserslist config or documentation
5. Document installation commands from package.json or existing docs
6. Extract required Angular configuration changes by comparing a vanilla Angular app with the framework's starter/example
7. Extract runtime configuration options from the framework's config interface/token
8. Document the recommended project structure from the framework's schematics, example apps, or conventions
9. Extract naming conventions from existing code patterns
10. Extract module/dependency registration patterns from the framework's setup code
11. Create the minimal boilerplate app by identifying the minimum files needed for a working app
12. For Part A: additionally document internal architecture, module boundaries, and build pipeline
13. Log all extracted content in the Change Tracker

#### Outcome

- Framework Overview documented (both parts)
- Environment and Configuration documented (both parts)
- Project Structure and Conventions documented (both parts)
- Internal Architecture documented (Part A only)
- Build Pipeline documented (Part A only)
- Minimal boilerplate app documented (both parts)

#### Automated Verification (AI Gate)

1. Verify all dependency versions match package.json exactly
2. Verify configuration options match the framework's config interface
3. Verify minimal boilerplate app compiles and runs

**Expected:**
- Zero discrepancies between documented versions and package.json
- Every configuration option has a verified default value
- Boilerplate app runs successfully

#### Human Verification (Human Gate)

1. Review framework overview for accuracy — does it correctly describe what the framework is?
2. Verify design principles match the framework team's intent
3. Confirm project structure matches the framework's recommended patterns

#### Success Criteria

✅ Template sections 1–3 complete for Part A
✅ Template sections 1–3 complete for Part B
✅ All versions verified against package.json
✅ Configuration options verified against source
✅ Minimal boilerplate app works
✅ Changes logged in Change Tracker

---

### Phase 3: Design Token and Theming Extraction

#### Phase Identity

**Phase ID:** EXTRACT-003
**Phase Name:** Design Token and Theming Extraction
**FR Mapping:** None (foundational — design tokens are used by all components)

#### Goal

All design tokens (colors, spacing, typography, borders, shadows, z-index, breakpoints), icon system, theming mechanism, and utility CSS classes are fully documented for both parts.

#### Dependencies

EXTRACT-002 Foundation Extraction

#### Plan

1. Read all SCSS/CSS variable files (typically `_variables.scss`, `_tokens.scss`, or similar)
2. Extract every CSS custom property and SCSS variable with its default value
3. Categorize tokens: colors, spacing, typography, borders/radii, shadows/elevation, z-index
4. Read breakpoint definitions and document the responsive breakpoint scale
5. Extract the icon system: how icons are registered, used, and customized
6. Document the theming mechanism: how themes are applied and switched
7. Extract all utility CSS classes with their effects
8. Document styling do's and don'ts based on framework conventions and anti-patterns observed
9. For Part A: additionally document the token build pipeline and how tokens are compiled/distributed
10. Log all extracted content in the Change Tracker

#### Outcome

- Complete design token reference (both parts)
- Responsive breakpoint documentation (both parts)
- Icon system documentation (both parts)
- Theming mechanism documentation (both parts)
- Utility CSS class reference (both parts)
- Token build pipeline documentation (Part A only)

#### Automated Verification (AI Gate)

1. Verify every documented token exists in the source SCSS files
2. Verify default values match source exactly
3. Cross-reference utility classes against the compiled CSS

**Expected:**
- 100% of documented tokens exist in source
- Zero incorrect default values
- All utility classes verified

#### Human Verification (Human Gate)

1. Review token categorization for logical grouping
2. Verify the styling do's and don'ts reflect actual framework conventions
3. Confirm the theming mechanism documentation is accurate

#### Success Criteria

✅ All design tokens documented with verified defaults
✅ Breakpoints documented
✅ Icon system documented
✅ Theming mechanism documented
✅ Utility classes documented
✅ Changes logged in Change Tracker

---

### Phase 4: Shared Types and DI Token Extraction

#### Phase Identity

**Phase ID:** EXTRACT-004
**Phase Name:** Shared Types, Interfaces, Enums, and DI Tokens
**FR Mapping:** None (foundational — types and tokens are used throughout)

#### Goal

Every public interface, enum, type alias, and DI token is documented with exact type signatures, default values, and usage context.

#### Dependencies

EXTRACT-002 Foundation Extraction

#### Plan

1. Read all model/type/interface files exported from the public API
2. For each interface: extract every property with its type, optionality, and default value
3. For each enum: extract every member with its string/numeric value
4. For each type alias: extract the full type definition
5. Read all DI token definitions from the framework's token files
6. For each token: extract the token name, type, default provider, and purpose
7. Document provider override patterns with exact code examples
8. Document provider convenience functions (e.g., `provideFwConfig()`)
9. For Part A: additionally document internal types not in the public API
10. Log all extracted content in the Change Tracker

#### Outcome

- Complete interface reference (both parts for public, Part A only for internal)
- Complete enum reference (both parts)
- Complete type alias reference (both parts)
- Complete DI token reference (both parts for public, Part A only for internal)
- Provider override examples (both parts)

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
✅ Internal types documented (Part A only)
✅ Type signatures verified against source
✅ Changes logged in Change Tracker

---

### Phase 5: Component Extraction (Repeat Per Component Category)

#### Phase Identity

**Phase ID:** EXTRACT-005.X (where X is the component category number)
**Phase Name:** Component Extraction — [Category Name]
**FR Mapping:** Maps to whatever functional areas the components serve

#### Goal

Every component in the [Category] category is fully documented following the component documentation template, for both Part A and Part B.

#### Dependencies

EXTRACT-003 Design Token and Theming Extraction
EXTRACT-004 Shared Types and DI Token Extraction

#### Plan

For each component in the category:

1. Read the component's TypeScript source file
2. Extract: selector, all @Input() properties (name, type, default, required), all @Output() properties (name, emitted type), all public methods
3. Read the component's HTML template to extract: content projection slots (ng-content with selectors), template context for ng-template usage
4. Read the component's SCSS/CSS to extract: exposed CSS custom properties, ::part selectors, host bindings
5. Extract generic type parameters if the component is generic
6. Read the component's test file to extract: expected behaviors, edge cases, error conditions
7. Write minimal usage example (simplest possible, required inputs only)
8. Write realistic usage example (common optional inputs, events, content projection)
9. Document edge cases and gotchas discovered from source and tests
10. For Part A: additionally document internal state management, lifecycle hooks, private methods, and change detection behavior
11. Mark the component as "Completed" in extraction-status.md
12. Log changes in the Change Tracker

#### Outcome

- Component documented following the template structure (both parts)
- All @Inputs documented with verified defaults (both parts)
- All @Outputs documented with payload types (both parts)
- Content projection slots documented (both parts)
- CSS custom properties documented (both parts)
- Usage examples provided (both parts)
- Internal implementation documented (Part A only)

#### Automated Verification (AI Gate)

1. For each @Input: verify name, type, and default against source
2. For each @Output: verify event name and emitted type against source
3. Verify content projection selectors exist in the template
4. Verify CSS custom properties exist in the SCSS

**Expected:**
- 100% of @Inputs match source
- 100% of @Outputs match source
- All content projection slots verified
- All CSS custom properties verified

#### Human Verification (Human Gate)

1. Review minimal and realistic usage examples — do they compile and make sense?
2. Verify edge cases and gotchas are accurate and complete
3. Confirm Part A internal documentation is useful for maintainers

#### Success Criteria

✅ All components in category documented
✅ All @Inputs verified against source
✅ All @Outputs verified against source
✅ Content projection documented
✅ CSS custom properties documented
✅ Usage examples provided
✅ Edge cases documented
✅ Extraction status updated
✅ Changes logged in Change Tracker

---

### Phase 6: Service Extraction (Repeat Per Service)

Follow the same structure as Phase 5 but adapted for services:

**Plan specifics for services:**
1. Read the service's TypeScript source file
2. Extract: providedIn value, public properties (especially Observables), public methods with full signatures
3. Determine if the service is stateful (holds internal state)
4. Extract generic type parameters
5. Read the service's test file for expected behaviors
6. Document minimal and realistic usage
7. For Part A: additionally document internal state management, private methods, and subscription handling

---

### Phase 7: Directive, Pipe, and Remaining Artifact Extraction

Follow the same structure for directives, pipes, and any remaining public API artifacts.

---

### Phase 8: Patterns, Recipes, and Anti-Patterns Extraction

#### Plan

1. Read the framework's example/demo application (if it exists)
2. Extract common patterns: CRUD module, auth flow, dialog pattern, toast pattern, table with server-side pagination, dashboard, file upload, master-detail layout
3. Read the framework's issue tracker or code review comments for common mistakes
4. Document anti-patterns by category: component, data/state, styling, form, routing
5. For each pattern: provide complete, copy-paste-ready code files
6. For each anti-pattern: document what's wrong, why it's wrong, and the correct approach

---

### Phase 9: Testing, Accessibility, and Reference Extraction

#### Plan

1. Extract test environment setup from the framework's test utilities
2. Document framework-provided test harnesses, mock services, and helpers
3. Extract accessibility features from component templates (ARIA attributes, focus management)
4. Document required developer actions for accessibility
5. Create the quick reference cheat sheet
6. Create or document the reference app

---

## Change Tracking for Framework Documentation

> **Common Structure:** See `canonical-reverse-engineering-shape.md` § Change Tracking and `../_shared/templates/change-tracker-template.md` for the universal structure, versioning convention, change types, and rules.

### Parts Affected Values

| Value | Meaning |
| --- | --- |
| A | Part A: Full Framework Documentation (maintainers) |
| B | Part B: Implementer Documentation (app developers) |
| Both | Both parts affected |

### Cross-Part Synchronization Rules

**Rule 1: Part B is always a subset of Part A**
- If content is added to Part A (private APIs, internal implementation), evaluate whether it should also be in Part B
- If content is removed from Part A, it must be removed from Part B
- If content changes in Part A (e.g., a public component's API changes), it must be updated in Part B

**Rule 2: Public API changes affect both parts**
- New @Input, @Output, or method on a public component → update Part A and Part B
- Changes to component selector or import path → update Part A and Part B
- Type signature changes for public APIs → update Part A and Part B

**Rule 3: Internal-only content in Part A only**
- Private methods, internal state management, internal service implementations → Part A only
- Build pipeline changes, framework development documentation → Part A only
- Internal DI tokens or provider implementations → Part A only

### Framework Version Alignment Process

When the framework releases a new version:

1. Read the CHANGELOG or release notes
2. Identify breaking changes, new features, deprecated features, and removed features
3. For each change, determine which documentation sections are affected and whether it affects Part A, Part B, or both
4. Update affected sections following the Part A/Part B rules above
5. Log all changes in the Change Tracker with the new framework version and affected parts
6. Update the "Current Framework Version" at the top of the Change Tracker
7. Increment the documentation version following the `[framework-version]-doc.[revision]` format
8. Update the extraction status tracker if new components/services were added or if existing components have breaking changes

---

## Scaffolding Approach — Structure Before Content

> **Scaffolding Philosophy:** See `canonical-reverse-engineering-shape.md` § Scaffolding Approach for the universal process and rationale. Below is the UI Framework-specific scaffolding prompt.

### Framework Scaffolding Prompt

```
"We have completed the framework inventory (Phase 1). Based on the UI Framework
Documentation Template and our inventory, propose the scaffolding for:
- Part A (full framework docs, including internal architecture and build pipeline)
- Part B (implementer docs, public API only)

For each file, show:
- File path and purpose
- Major section headers
- Which inventory items (components, services, types, DI tokens, etc.) map to each section
- Rough page count estimate

Show structure ONLY — do not extract any content yet. I will review and approve
before we begin extraction in Phase 2."
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
- Trust JSDoc comments without verifying against implementation
- Trust README examples without verifying they compile

### 2. Extract One Artifact at a Time

**Principle:** Focused extraction produces accurate documentation.

**Do:**
```
"Read the source code for FwButton (src/components/button/button.component.ts) 
and extract: selector, all @Inputs with types and defaults, all @Outputs with 
payload types, all public methods, and content projection slots."
```

**Don't:**
```
"Document all the layout components."
```

### 3. Verify Default Values Obsessively

**Principle:** Wrong default values are the most common documentation error.

**Do:**
- For each @Input, find the property declaration and its initializer
- If no initializer, check `ngOnInit` or constructor for assignments
- If the default is `undefined`, document it as such — don't invent a value

### 4. Maintain Part A / Part B Discipline

**Principle:** Implementers should never see internal details.

**Do:**
- After extracting a component, explicitly separate public API from internals
- Review Part B to ensure no internal details leaked through
- Ask: "Would an app developer need to know this to use the component?"

### 5. Use Tests as Documentation Source

**Principle:** Test files reveal edge cases, error conditions, and expected behavior.

**Do:**
- Read `*.spec.ts` files alongside source files
- Extract test descriptions as documented behaviors
- Use test data as examples for documentation

### 6. Log Changes Immediately

**Principle:** Logging changes after the fact leads to inaccurate or missing entries.

**Do:**
- Log each extraction session in the Change Tracker before committing
- Include verification status for each change
- Record cross-impact immediately

### 7. Commit After Each Extraction Phase

**Principle:** Protect progress and enable session continuity.

**Do:**
- Commit after completing each phase
- Use meaningful commit messages: "docs: Extract FwButton component (Part A + Part B)"
- Update extraction-status.md in the same commit

### 8. Flag Uncertainties Rather Than Guess

**Principle:** "UNVERIFIED" is better than wrong.

**Do:**
- If source code is ambiguous, flag the documentation as needing verification
- Use `<!-- UNVERIFIED: [reason] -->` markers in documentation
- Track unverified items in the extraction status tracker
- Resolve unverified items with the framework team

---

## Common Pitfalls and Solutions

### Pitfall 1: AI Inventing API Surfaces

**Symptom:** Documentation includes @Inputs, methods, or events that don't exist in source code.

**Solution:**
- After each extraction, ask AI to cite the source line for every documented property
- Cross-reference against the public-api.ts barrel exports
- Verify with: "List ONLY the @Input() decorators you found in the source. Do NOT infer additional inputs."

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
- Search for: private method names, internal service references, build tool references
- Ask: "Would an app developer ever call this method or need to know about this?"

### Pitfall 4: Default Values from Comments Instead of Code

**Symptom:** Documented defaults don't match runtime behavior.

**Solution:**
- For every default value, find the actual property initializer in the source code
- Check for defaults set in `ngOnInit()` or `ngOnChanges()`
- Check for defaults set via DI tokens or configuration

### Pitfall 5: Missing Content Projection Documentation

**Symptom:** Consumers can't figure out how to project content into components.

**Solution:**
- Read every component template for `<ng-content>` tags
- Document every `select` attribute on `<ng-content>`
- Include projection slot examples in usage code

### Pitfall 6: Incomplete Type Documentation

**Symptom:** AI generates code that fails to compile due to missing or wrong types.

**Solution:**
- Extract EVERY public interface, enum, and type alias
- Document ALL properties, not just the commonly used ones
- Include optional properties and their defaults

### Pitfall 7: Context Loss Across Sessions

**Symptom:** New sessions produce documentation that contradicts earlier sessions.

**Solution:**
- At the start of each session, have AI read existing documentation and conventions
- Reference the extraction status tracker for what's been completed
- Commit frequently so documentation is always current

### Pitfall 8: Not Documenting What the Framework Does NOT Support

**Symptom:** Consumers attempt to use the framework in ways it doesn't support, leading to frustration.

**Solution:**
- Document anti-patterns explicitly
- Include "When NOT to use" sections
- Document known limitations alongside features

---

## Prompt Templates and Examples

### Template 1: Starting a New Extraction Session

```
We are reverse-engineering documentation for [FRAMEWORK NAME] version [VERSION].

Please read the following context:
- Extraction status: docs/framework/reference/extraction-status.md
- Existing documentation: docs/framework/part-b-implementer/[relevant files]
- Change tracker: docs/framework/CHANGE-TRACKER.md

We are extracting documentation for [COMPONENT/SERVICE/SECTION].
Source files to read:
- [file path 1]
- [file path 2]

Produce documentation for BOTH Part A (full) and Part B (implementer).
Document ONLY what exists in the source code. Do NOT invent features.
```

### Template 2: Extracting a Component

```
Read the source code for [ComponentName]:
- TypeScript: [path to .ts file]
- Template: [path to .html file]
- Styles: [path to .scss file]
- Tests: [path to .spec.ts file]

Extract and document following the UI Framework Documentation Template:
1. Import path and selector
2. Purpose (one sentence)
3. Generic type parameters (if any)
4. ALL @Input() properties with: name, type, default value, required (yes/no), description
5. ALL @Output() properties with: name, emitted type, description
6. Content projection slots (from ng-content elements in template)
7. Exposed CSS custom properties
8. Public methods (callable via @ViewChild)
9. Minimal usage example (required inputs only)
10. Realistic usage example (common optional inputs, events, content projection)
11. Edge cases and gotchas (from source code and tests)

For Part A additionally document:
- Internal state management
- Lifecycle hook usage
- Change detection considerations
- Private method contracts

For each @Input, show me the exact line of source code where it is declared.
Do NOT infer inputs that are not explicitly decorated with @Input().
```

### Template 3: Extracting Shared Types

```
Read all type/model/interface files exported from the framework's public API:
- [path to types/interfaces files]
- [path to public-api.ts or barrel exports]

For each public type, extract:
1. Full type definition with ALL properties
2. Property types (exact, not simplified)
3. Optional vs required properties
4. Default values (if discoverable from usage)
5. JSDoc comments (if present)

Organize into: Interfaces, Enums, Type Aliases.

Document ONLY types that appear in the public API exports.
Flag any types referenced in public APIs but not directly exported.
```

### Template 4: Verifying Extracted Documentation

```
I need to verify the documentation we extracted for [COMPONENT/SERVICE].

Please re-read the source file: [path]

For each documented item, confirm:
1. @Input [name]: Is the type [documented type]? Is the default [documented default]?
2. @Output [name]: Is the emitted type [documented type]?
3. Method [name]: Is the signature [documented signature]?
4. Content slot [selector]: Does this exist in the template?

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

### Template 6: Framework Version Update

```
The framework has been updated from version [OLD] to version [NEW].

Read the CHANGELOG or release notes: [path or content]

For each change listed:
1. Identify which documentation sections are affected
2. Determine if the change affects Part A, Part B, or both
3. List the specific documentation updates needed

Do NOT make the updates yet — just create the impact assessment.
I will review and approve before we update documentation.
```

### Template 7: Part B Review (Removing Internal Details)

```
Review the following Part B (implementer) documentation file:
[file path]

Check for any content that should NOT be in implementer documentation:
- References to private methods or properties
- Internal state management details
- Build pipeline or compilation details
- Framework source code organization
- Internal DI tokens not available to consumers

List any items that should be moved to Part A only or removed from Part B.
```

---

## Quick Reference Checklist

> **Common Checklist Items:** See `canonical-reverse-engineering-shape.md` § Quick Reference Checklist for universal pre-extraction and session items.

### Framework-Specific Before Starting Extraction

- [ ] Angular version and key dependencies identified from package.json
- [ ] Build configuration identified (angular.json, tsconfig.json)
- [ ] Component naming conventions documented (e.g., "fw-" prefix)
- [ ] Change detection strategy identified for the framework (e.g., OnPush)
- [ ] Framework overview and architecture document available
- [ ] Shared types file(s) identified (e.g., shared.types.ts)

### Framework-Specific For Each Extraction Session

- [ ] AI has read the framework overview and conventions document
- [ ] For components: AI found every @Input() with exact type and default value
- [ ] For components: AI found every @Output() with payload type
- [ ] For components: AI verified content projection slots in the template
- [ ] For services: AI found every public method with complete signature
- [ ] For services: AI identified stateful vs. stateless behavior
- [ ] For types: AI extracted all properties with exact types and optionality
- [ ] CSS custom properties (if any) verified against SCSS source
- [ ] Part B reviewed for absence of private methods, internal implementation details
- [ ] Extraction status updated with verification status
- [ ] Changes logged in Change Tracker with framework version and verification method

### Component Extraction Checklist

- [ ] Import path documented
- [ ] Selector documented
- [ ] Purpose (one sentence) documented
- [ ] Generic type parameters documented (if any)
- [ ] All @Inputs documented (name, type, default, required, description)
- [ ] All @Outputs documented (name, emitted type, description)
- [ ] Content projection slots documented
- [ ] CSS custom properties documented
- [ ] Public methods documented
- [ ] Minimal usage example provided
- [ ] Realistic usage example provided
- [ ] Edge cases and gotchas documented
- [ ] Part A: internal details documented
- [ ] Part B: verified no internal details present

### Service Extraction Checklist

- [ ] Import path documented
- [ ] providedIn value documented
- [ ] Stateful/stateless identified
- [ ] Purpose documented
- [ ] Generic type parameters documented (if any)
- [ ] Public properties documented (especially Observables)
- [ ] Public methods documented with full signatures
- [ ] Minimal usage example provided
- [ ] Realistic usage example provided
- [ ] Edge cases and gotchas documented

### Change Tracker Checklist

- [ ] Every extraction session logged
- [ ] Change type specified
- [ ] Affected parts specified (A/B/Both)
- [ ] Framework version recorded
- [ ] Verification method documented
- [ ] Cross-impact assessed
- [ ] Change number incremented sequentially

### Final Verification

- [ ] All framework exports are documented
- [ ] Extraction status shows 100% complete and verified
- [ ] Part A contains all information (public + internal)
- [ ] Part B contains only public/consumer information
- [ ] No internal details in Part B
- [ ] All types, interfaces, and enums documented
- [ ] All DI tokens documented
- [ ] Design tokens complete and verified
- [ ] Change tracker up to date
- [ ] Documentation version aligned with framework version

---

## Key Takeaways

- **Source code is the single source of truth** — never document from memory, comments alone, or outdated README files
- **Two-part model is mandatory** — Part A (full) for maintainers, Part B (implementer) for consumers; Part B is always a strict subset of Part A
- **Verify obsessively** — every @Input, @Output, default value, and type signature must be checked against source code
- **Extract one artifact at a time** — focused extraction produces accurate documentation; breadth produces errors
- **Change tracking is non-negotiable** — every documentation change is logged with framework version, verification method, and cross-impact
- **Flag uncertainties** — "UNVERIFIED" is always better than confidently wrong documentation
- **AI augments, doesn't replace** — AI reads code and proposes documentation; humans verify and approve
- **Scaffolding before content** — negotiate structure, then fill it in chunk by chunk
- **Part B discipline** — after every extraction, review Part B specifically for leaked internal details
- **Tests are documentation** — test files reveal expected behavior, edge cases, and error conditions that source code alone may not make obvious
- **Documentation drifts** — when the framework updates, documentation must update too; the change tracker and version alignment process exist for this reason

---

## Additional Resources

- **Canonical Reverse Engineering Shape:** `canonical-reverse-engineering-shape.md` — Universal principles, workflow, scaffolding, and change tracking for all reverse engineering projects
- **Change Tracker Template:** `../_shared/templates/change-tracker-template.md` — Template structure and rules for change tracking
- **UI Framework Documentation Template:** `docs/framework/reference/ui-framework-doc-template.md`
- **Extraction Status:** `docs/framework/reference/extraction-status.md`
- **Change Tracker:** `docs/framework/CHANGE-TRACKER.md`
- **AI-SDLC Best Practices:** `Learning/crash course contents/AI-SDLC-Best-Practices-Info-Dump.md`
