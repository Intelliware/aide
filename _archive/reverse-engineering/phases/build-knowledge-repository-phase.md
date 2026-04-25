# Build and Maintain Knowledge Repository - Instructions

**Purpose:** Comprehensive reference for assembling, synthesizing, and maintaining a central knowledge repository that aggregates public/consumer-facing documentation from all individual repositories and creates synthesized cross-cutting architecture documentation. This phase governs how to create a single source of truth for organization-wide technical understanding while keeping individual repository documentation current and specialized.

**Target Audience:** Technical architects, documentation coordinators, AI assistants performing documentation aggregation, and technical writers responsible for maintaining enterprise-wide technical knowledge.

**Source Documents:** Reverse-Engineer-API-Phase.md, Reverse-Engineer-UI-Framework-Phase.md, Create-Solution-Design-Package.md, Create-Requirements-Package.md, Change-Tracker.md, change-tracker-template.md, CANONICAL-PHASE-SHAPE.md.

---

## Table of Contents

- [What is the Knowledge Repository?](#what-is-the-knowledge-repository)
- [What the Knowledge Repository IS and IS NOT](#what-the-knowledge-repository-is-and-is-not)
- [The Knowledge Repository Structure](#the-knowledge-repository-structure)
- [What Feeds Into the Knowledge Repository](#what-feeds-into-the-knowledge-repository)
- [What is Synthesized](#what-is-synthesized)
- [Why This Matters — Impact on New Development](#why-this-matters--impact-on-new-development)
- [Core AI Principles for Knowledge Repository Assembly](#core-ai-principles-for-knowledge-repository-assembly)
- [The 7-Step Workflow for Knowledge Repository](#the-7-step-workflow-for-knowledge-repository)
- [Knowledge Repository Components — Detailed](#knowledge-repository-components--detailed)
- [Phase-by-Phase Assembly Process](#phase-by-phase-assembly-process)
- [Maintaining the Knowledge Repository](#maintaining-the-knowledge-repository)
- [Change Tracking](#change-tracking)
- [Scaffolding Approach — Structure Before Content](#scaffolding-approach--structure-before-content)
- [Best Practices](#best-practices)
- [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
- [Prompt Templates and Examples](#prompt-templates-and-examples)
- [Quick Reference Checklist](#quick-reference-checklist)

---

## What is the Knowledge Repository?

### Definition

The Knowledge Repository is a **curated, synthesized collection of public and consumer-facing documentation** from all individual repositories in an organization, plus **architecture documentation created through synthesis across repositories**. It is the central source of truth for how all systems in the organization relate to each other, communicate, and work together.

The Knowledge Repository is NOT a mirror of every repository's detailed internal documentation. It is a higher-level, cross-cutting synthesis that enables:

- New developers to understand the complete technical landscape
- Architects to make decisions that account for system interactions
- Teams to identify dependencies and integration points
- AI assistants to generate code that works correctly within the organization's ecosystem
- Leadership to understand technical capabilities and constraints

### Key Characteristics

- **Curated, Not Exhaustive:** Includes public/consumer-facing documentation from each repo, NOT internal implementation details
- **Cross-Cutting:** Documents relationships, dependencies, and interactions between systems
- **Synthesized:** Contains documentation created from aggregation (data flow diagrams, dependency maps, etc.) that no single repo documents
- **Maintained in Sync:** Updated whenever individual repositories change their public interfaces
- **Technology-Agnostic:** Focuses on "what" systems do and "how they interact," not technology implementation details
- **Enterprise-Focused:** Acknowledges compliance, scale, and operational complexity without being organization-specific

---

## What the Knowledge Repository IS and IS NOT

### IS

- A curated index of APIs, frameworks, and applications with links to their public documentation
- Architecture diagrams showing how systems relate (C4 Level 1 and 2 context and container diagrams)
- Data flow documentation showing how data moves between systems
- Cross-cutting concerns standards (authentication, logging, monitoring, error handling across ALL systems)
- Architecture Decision Records that affect multiple systems
- Dependency map showing which repo depends on which
- Synthesized onboarding guide for new developers
- Maintenance guide for keeping the repository in sync

### IS NOT

- A copy of every internal documentation file from every repo
- Detailed implementation guides (those stay in individual repos)
- Database schema details for specific systems (those stay in internal docs)
- Internal architecture of individual services (those stay in their Part A docs)
- Feature-specific business logic details (those stay in requirements/design packages)
- Individual repository changelogs (repo-specific changelogs stay in those repos)

---

## The Knowledge Repository Structure

The Knowledge Repository consists of these major components:

```
knowledge-repository/
├── README.md                          # Index and maintenance guide
├── CHANGE-TRACKER.md                  # All cross-repo doc changes
│
├── 01-architecture-overview/          # SYNTHESIZED: How all systems relate
│   ├── 01-system-context-diagram.md   # C4 Level 1: System boundaries
│   ├── 02-container-diagram.md        # C4 Level 2: Services, DBs, APIs
│   ├── 03-data-flow-diagram.md        # How data flows between systems
│   ├── 04-deployment-topology.md      # Infrastructure, environments
│   ├── 05-technology-landscape.md     # Tech stack across org
│   └── 06-system-interaction-matrix.md # Who talks to whom
│
├── 02-service-api-catalog/            # CURATED: All APIs with links
│   ├── services-registry.md           # Indexed list of all APIs
│   ├── api-1/
│   │   ├── overview.md                # Link to Part B1 OpenAPI
│   │   ├── link-to-consumer-guide.md  # Link to Part B2 Consumer Guide
│   │   └── dependencies.md            # What this API depends on
│   ├── api-2/
│   │   └── ...
│   └── [service-discovery-mapping.md] # How services discover each other
│
├── 03-framework-library-catalog/      # CURATED: All frameworks/libs
│   ├── frameworks-registry.md         # Indexed list of all frameworks
│   ├── framework-1/
│   │   ├── overview.md                # Quick intro
│   │   ├── link-to-implementer-docs.md # Link to Part B docs
│   │   └── usage-across-org.md        # Which apps use this
│   ├── framework-2/
│   │   └── ...
│   └── library-versions.md            # Approved versions of all deps
│
├── 04-application-catalog/            # CURATED: All apps
│   ├── applications-registry.md       # Indexed list of all apps
│   ├── application-1/
│   │   ├── overview.md                # What it does, who uses it
│   │   ├── api-dependencies.md        # Which APIs it calls
│   │   ├── framework-dependencies.md  # Which frameworks it uses
│   │   ├── team-ownership.md          # Who maintains it
│   │   └── documentation-links.md     # Links to detailed docs
│   ├── application-2/
│   │   └── ...
│   └── application-type-index.md      # Grouped by type (web/mobile/internal)
│
├── 05-data-dictionary-aggregated/     # SYNTHESIZED: Cross-repo data
│   ├── entities-and-relationships.md  # Master entity relationship diagram
│   ├── shared-types.md                # Types used across multiple APIs
│   ├── data-model-migrations.md       # How data schemas evolve together
│   ├── integration-data-mappings.md   # How data transforms between APIs
│   └── data-lineage.md                # Where data originates, flows
│
├── 06-cross-cutting-concerns/         # SYNTHESIZED: Standards across org
│   ├── authentication-authorization.md # Auth strategy org-wide
│   ├── observability-logging.md       # Logging standards
│   ├── monitoring-alerting.md         # Monitoring approach
│   ├── error-handling.md              # Error response standards
│   ├── security-standards.md          # Security practices
│   ├── performance-targets.md         # Performance SLOs org-wide
│   ├── rate-limiting-strategy.md      # Rate limiting across APIs
│   └── versioning-deprecation.md      # API versioning standards
│
├── 07-dependency-map/                 # SYNTHESIZED: Who depends on whom
│   ├── dependency-graph.md            # Complete dependency tree
│   ├── component-dependency-matrix.md # What depends on what (table)
│   ├── breaking-change-blast-radius.md # Impact analysis template
│   └── deployment-order.md            # Recommended deployment sequence
│
├── 08-architecture-decision-records/  # SYNTHESIZED: Important decisions
│   ├── adr-0001-api-versioning.md
│   ├── adr-0002-auth-strategy.md
│   ├── adr-0003-database-selection.md
│   ├── adr-0004-microservices-vs-monolith.md
│   └── adr-template.md
│
├── 09-onboarding-guide/               # SYNTHESIZED: New dev guide
│   ├── 01-welcome-orientation.md      # What is this org building?
│   ├── 02-system-overview.md          # Read architecture overview
│   ├── 03-core-apis.md                # Most important APIs to know
│   ├── 04-core-frameworks.md          # Most important frameworks
│   ├── 05-auth-and-security.md        # How to auth and secure code
│   ├── 06-common-tasks.md             # How to do common tasks
│   ├── 07-making-a-change.md          # How to modify systems safely
│   ├── 08-debugging-production.md     # How to troubleshoot
│   └── 09-frequently-asked.md         # FAQ from onboarding
│
├── 10-repository-maintenance/         # How to keep repo in sync
│   ├── 01-maintenance-workflow.md     # When to update what
│   ├── 02-who-maintains-what.md       # Ownership model
│   ├── 03-update-triggers.md          # What changes trigger repo updates
│   ├── 04-aggregation-process.md      # Steps to re-aggregate docs
│   ├── 05-verification-checklist.md   # Verify sync before publishing
│   └── 06-release-schedule.md         # When repo is published
│
└── reference/
    ├── index-of-all-repositories.md   # Pointer to all source repos
    ├── change-history.md              # Git history of changes
    ├── access-control.md              # Who can view/edit what
    └── tools-and-processes.md         # CI/CD, publishing, etc.
```

---

## What Feeds Into the Knowledge Repository

### From Individual Repositories

Each repository produces its own documentation per the Reverse-Engineer phase guides:

**API Repositories:**
- Part B1: OpenAPI Specification (machine-readable contract)
- Part B2: Consumer Companion Guide (narrative docs for users)
- The **Knowledge Repository curates** these B parts with an index and cross-references

**Framework/Library Repositories:**
- Part B: Implementer Documentation (for developers using the framework)
- The **Knowledge Repository curates** this with an index and usage patterns across org

**Application Repositories:**
- Public-facing overview documentation (what the app does, who uses it)
- API dependencies (which APIs does it call, in what scenarios)
- Framework dependencies (which frameworks does it use)
- The **Knowledge Repository curates** these with an app registry

### What is NOT Fed In

The Knowledge Repository explicitly does NOT include:

- Part A (Internal API Documentation) — stays in the API repo
- Part A (Full Framework Documentation) — stays in the framework repo
- Requirements Package — stays in the project/epic documentation
- Solution Design Package — stays in the project/epic documentation
- Internal implementation details — stay in individual repos

---

## What is Synthesized

The Knowledge Repository creates NEW documentation that no single repository produces:

| Document | Created From | Used By |
|----------|------------|---------|
| **Architecture Overview (C4 L1-L2)** | All service/app public interfaces | New developers, architects, AI assistants |
| **Data Flow Diagram** | Tracing how data moves between APIs | Integration teams, architects |
| **Dependency Map** | Analyzing imports/dependencies across repos | Architects, DevOps, change impact |
| **Cross-Cutting Concerns** | Standards from all repos' public APIs | All developers, security/ops teams |
| **Aggregate Data Dictionary** | APIs + frameworks + apps data models | Backend teams, integration teams |
| **Architecture Decision Records** | Decisions affecting multiple repos | Architects, decision makers |
| **Onboarding Guide** | All of the above synthesized | New developers, AI assistants |

---

## Why This Matters — Impact on New Development

### Impact on New Developers

An accurate, maintained Knowledge Repository directly enables:

- **Faster Onboarding:** New developers have a map of the entire landscape, not scattered docs
- **Correct Integration:** Teams understand which APIs to use for which purposes
- **Dependency Awareness:** Developers understand what their code depends on and the impact of changes
- **Standard Practices:** Teams follow consistent patterns across the organization instead of inventing variations
- **Reduced Rework:** Fewer "I didn't know that service existed" moments

### Impact on Architects and Decision Makers

The Knowledge Repository enables:

- **Informed Design:** Understanding the complete landscape before making architectural decisions
- **Impact Analysis:** Quick assessment of "what would break if we changed X?"
- **Consistency Enforcement:** Seeing where patterns diverge and where standardization is needed
- **Capability Planning:** Clear understanding of existing capabilities to avoid duplicate work

### Impact on AI-Assisted Development

AI code generation depends entirely on context. The Knowledge Repository:

- Provides AI with the complete system landscape
- Prevents AI from suggesting services that don't exist or patterns that don't fit
- Enables AI to generate code that integrates correctly with real systems
- Gives AI the cross-cutting concerns standards to follow

**Critical Insight:** When new requirements arrive, using the Knowledge Repository as context for design and implementation means the solution integrates correctly on day one, rather than requiring integration work later.

### Impact on Operations and Compliance

In enterprise environments (banking, healthcare, finance), the Knowledge Repository:

- Documents the complete system for audit purposes
- Enables impact analysis for compliance changes
- Supports disaster recovery planning (understanding all system relationships)
- Tracks architectural decisions for regulatory review

---

## Core AI Principles for Knowledge Repository Assembly

### 1. Synthesis is Not Copy-Paste

**What this means for knowledge repository assembly:**

- The Knowledge Repository is NOT created by copying each repo's documentation into a central location
- Synthesis means reading docs from multiple repos and creating NEW documentation that shows relationships
- AI may try to copy-paste from source repos when you ask it to "compile" documentation

**How to apply:**

- Explicitly instruct: "Create a NEW data flow diagram by analyzing what each API does. Do NOT copy diagrams from individual repos."
- Always ask AI to explain relationships, not to aggregate text
- Verify that synthesized docs add value beyond what individual repos provide

### 2. AI Needs the ENTIRE Landscape to Synthesize Correctly

**What this means for knowledge repository assembly:**

- AI cannot create accurate architecture diagrams without understanding all systems' public interfaces
- Creating a dependency map requires AI to understand every API dependency in every repo
- Creating cross-cutting concerns documentation requires reading standards across ALL repositories

**How to apply:**

- Before synthesizing, have AI read the index/catalog of all repositories
- Provide AI with the public interface of each system (Part B docs, not internal details)
- Ask AI to verify its understanding: "List all APIs, all frameworks, and all apps you found"

### 3. Synthesis Requires Validation Across Multiple Sources

**What this means for knowledge repository assembly:**

- A synthesized document (e.g., dependency map) must be validated against multiple sources
- If API A's OpenAPI spec says it calls API B, and API B's docs don't mention being called by A, that's a discrepancy
- Synthesized documents must be verified against reality

**How to apply:**

- Create synthesized docs, then validate by checking against source repo docs
- Example validation prompt: "I created a dependency map. For each dependency, show me where in the source repos this is documented."
- Flag discrepancies for investigation

### 4. AI May Over-Generalize or Miss Important Nuances

**What this means for knowledge repository assembly:**

- AI may smooth over important differences between similar systems
- AI may miss that two systems look related but are actually separate concerns
- AI may create over-simplified diagrams that hide important details

**How to apply:**

- After creating synthesis documents, have domain experts review
- Ask AI: "What assumptions are you making? What could be wrong?"
- Iterate on synthesized documents based on expert feedback

### 5. Context Switching Between Repos Requires Explicit Management

**What this means for knowledge repository assembly:**

- Jumping from one repo's documentation to another without explicit context can lead to confusion
- AI may mix up concepts, naming conventions, or patterns between repos
- The Knowledge Repository must be internally consistent despite source repos using different conventions

**How to apply:**

- Have AI read all Part B docs before synthesizing (context loading)
- Create a "glossary of terms" to normalize terminology across repos
- Be explicit: "Use THESE terms consistently in the synthesized document"

### 6. Timeliness is Critical

**What this means for knowledge repository assembly:**

- A month-old Knowledge Repository is dangerous — AI may generate code based on outdated APIs
- The repository must have a clear maintenance schedule and update process
- "Stale" documentation is worse than no documentation

**How to apply:**

- Define clear update triggers: "Every time an API changes its public interface, re-run synthesis"
- Use change tracking (see below) to identify what needs re-synthesis
- Have a release schedule and commit to it

---

## The 7-Step Workflow for Knowledge Repository

The 7-Step Workflow is executed to create and maintain the Knowledge Repository.

### Step 1: Set Context of Deliverable

**Purpose:** Establish what you're creating and what it must achieve.

```
"We are building a Central Knowledge Repository for [ORGANIZATION].

This repository:
- Curates public/consumer-facing documentation from all [N] repos
- Synthesizes architecture documentation showing how systems relate
- Becomes the single source of truth for developers, architects, and AI assistants
- Is kept in sync with changes to individual repositories

The repository will include:
- Architecture Overview (C4 diagrams, data flow)
- Service/API Catalog (index with links to public docs)
- Framework/Library Catalog (index with links to public docs)
- Application Catalog (index with links to public docs)
- Aggregated Data Dictionary (cross-repo data model)
- Cross-Cutting Concerns (standards across org)
- Dependency Map (what depends on what)
- Architecture Decision Records
- Onboarding Guide (synthesized for new developers)
- Maintenance Guide (how to keep it in sync)"
```

### Step 2: Set Context of Audience/Environment/Components

**Purpose:** Define who will use the repository and what systems it covers.

**Identify:**
- Complete inventory of all repositories (APIs, frameworks, applications)
- For each repo: what type it is (API, framework, app), team ownership, public documentation location
- Technology landscape (what frameworks, languages, databases are in use?)
- Organizational structure (teams, dependencies between teams)

**Example Prompt:**

```
"We have these repositories:
- 12 API services (list with names and teams)
- 3 UI frameworks (list with names)
- 8 applications (list with names and types)

For each, I need you to:
1. Confirm the location of public/consumer-facing documentation
2. Identify which other systems depend on it
3. List the main data types/entities it works with
4. Identify the team that owns it"
```

### Step 3: Refine the Feedback

**Purpose:** Correct AI's understanding of organizational standards and constraints.

**Example refinements:**

- "Our authentication standard is OAuth2 with Entra ID across ALL services"
- "All APIs follow RFC 7807 for error responses"
- "We have a data warehouse that many services feed data to — document this"
- "These two APIs are not currently integrated but should be in the architecture diagram"

**What to refine:**

- Organizational standards and patterns
- Known dependencies not apparent from documentation
- Scope boundaries (what's in scope vs. out of scope)
- Terminology and naming conventions to use

### Step 4: Create Scaffolding Structure

**Purpose:** Establish the file structure and headers WITHOUT content.

**Example Prompt:**

```
"Based on the repositories I've described, propose the structure for the
Central Knowledge Repository. What files should we create? What are the
major sections in each file? What is the recommended order for completing
them?

Show structure and headers ONLY. Do not extract content yet."
```

**Process:**

1. AI proposes structure
2. You review and refine
3. AI creates the scaffolding (file structure and section headers)

### Step 5: Create Content Chunk-by-Chunk

**Purpose:** Synthesize documentation incrementally with validation at each step.

**Recommended Synthesis Order:**

1. **Inventory Phase:** Catalog all APIs, frameworks, applications (registries only, no synthesis yet)
2. **Architecture Phase:** Create system context, container, and data flow diagrams
3. **Dependency Phase:** Build dependency map
4. **Standards Phase:** Extract cross-cutting concerns from public docs
5. **Data Phase:** Aggregate data models from all APIs/frameworks
6. **Integration Phase:** Document known integration patterns
7. **Decision Phase:** Synthesize Architecture Decision Records
8. **Onboarding Phase:** Create onboarding guide using all above
9. **Maintenance Phase:** Create guide for keeping repository in sync

**Process for each chunk:**

1. Identify which repos feed into this chunk
2. Have AI read the relevant public documentation from those repos
3. AI creates/synthesizes the documentation chunk
4. Validate against source docs
5. Expert review (domain expert or architect)
6. Correct and finalize
7. Log changes in Change Tracker

### Step 6: Add Supporting Documents

**Purpose:** Provide AI with complete context for accurate synthesis.

**Critical source documents:**

- Complete list of all repositories with their public docs locations
- Part B OpenAPI specifications from all API repos
- Part B Implementer Documentation from all framework repos
- Public overviews from all application repos
- Existing architecture diagrams (if any)
- Organizational standards documents (auth strategy, error format standards, etc.)
- Previous ADRs if this is an update
- Team contact list (for ownership documentation)

### Step 7: Verify Understanding

**Purpose:** Ensure AI has the correct context before synthesizing.

**Example prompts:**

- "List all [N] APIs you found and their primary purposes"
- "For each framework, describe which applications use it"
- "Create the dependency list: API A depends on [these systems], API B depends on [these systems]"
- "What are the 5 most important integration points in the system?"
- "Which systems are your 'core' systems that everything depends on?"

---

## Knowledge Repository Components — Detailed

### 01 - Architecture Overview

**Purpose:** Show how all systems in the organization relate, communicate, and depend on each other.

**What it includes:**

- **System Context Diagram (C4 L1):** The organizational system as a single box, with external systems it interacts with
- **Container Diagram (C4 L2):** Internal architecture showing all services, applications, databases, and their relationships
- **Data Flow Diagram:** How data flows between systems (requests, responses, event streaming, batch jobs)
- **Deployment Topology:** Where systems run (cloud regions, clusters, database instances)
- **Technology Landscape:** What languages, frameworks, databases are used and where
- **System Interaction Matrix:** Tabular view of "who calls whom" with protocol and frequency

**Created from:** All repos' public interfaces (Part B docs)

**Maintained by:** Architects, synthesized from repo changes

**Updated when:** New system added, major integration created, architecture changes

### 02 - Service/API Catalog

**Purpose:** Single index of all organization's APIs with links to their public documentation.

**What it includes:**

- **Service Registry:** Indexed list of all APIs with: name, purpose, team, status (active/deprecated/beta), links to OpenAPI spec and Consumer Companion Guide
- **Dependency View:** For each API: "What does this API depend on?" (other APIs, frameworks, databases)
- **Caller View:** For each API: "What systems call this API?"
- **Integration Patterns:** Common ways to call each API (REST, GraphQL, events, etc.)
- **Service Discovery:** How services discover each other (DNS, service mesh, manual config)

**Created from:** Part B1 OpenAPI specs and Part B2 Consumer Guides from each API repo

**Maintained by:** Each API team (via their Part B docs), aggregated by Knowledge Repo maintainer

**Updated when:** Any API's public interface changes (endpoints added/removed/changed, parameters changed)

### 03 - Framework/Library Catalog

**Purpose:** Single index of all approved frameworks and libraries with links to their public documentation.

**What it includes:**

- **Frameworks Registry:** List of all UI frameworks, backend frameworks, libraries: name, version, purpose, team, status
- **Usage Across Org:** Which applications use which frameworks
- **Approved Versions:** Recommended version for each framework (for consistency)
- **Getting Started:** For each framework, quick link to implementer documentation
- **Configuration Standards:** How each framework is configured in the org
- **Known Issues/Limitations:** Important constraints of each framework

**Created from:** Part B Implementer Documentation from each framework repo

**Maintained by:** Each framework team (via their Part B docs), aggregated by Knowledge Repo maintainer

**Updated when:** Framework versions change, new frameworks adopted, framework APIs change

### 04 - Application Catalog

**Purpose:** Single index of all organization's applications with their dependencies.

**What it includes:**

- **Applications Registry:** All apps: name, purpose, team, type (web/mobile/internal), status, team contact
- **For each app:** What APIs does it call? Which frameworks does it use? Who uses this app?
- **Ecosystem View:** How apps relate to each other, share data
- **Architecture Decisions:** Any app-specific architecture decisions
- **Onboarding Links:** Links to each app's documentation

**Created from:** Public overviews from each app repo, dependency analysis from codebase

**Maintained by:** Each app team (via their repo), aggregated by Knowledge Repo maintainer

**Updated when:** New app added, app's dependencies change, app is deprecated

### 05 - Aggregated Data Dictionary

**Purpose:** Show how data flows and transforms across the entire organization.

**What it includes:**

- **Entity-Relationship Diagram:** All entities across all systems and how they relate
- **Shared Types:** Data types (objects, enums) that appear in multiple APIs
- **Data Ownership:** Which system owns which data (the "source of truth")
- **Data Transformations:** How data is transformed when moving between systems
- **Data Lineage:** Where data originates and how it flows through systems
- **Integration Mappings:** When API A returns "user_id" and API B expects "userId", document the mapping

**Created from:** OpenAPI schemas from all APIs, integration patterns documentation

**Maintained by:** Architects, validated by API teams

**Updated when:** Data models change across systems

### 06 - Cross-Cutting Concerns

**Purpose:** Document standards and approaches used consistently across ALL systems.

**What it includes:**

**Authentication & Authorization:**
- Org-wide auth strategy (OAuth2, Entra ID, API keys, etc.)
- How to authenticate in each type of system (API, web app, mobile, internal service)
- Token/credential management standards
- Permission/role model (how roles are defined across systems)

**Observability (Logging, Monitoring, Tracing):**
- Logging standards (what to log, log levels, format)
- Monitoring approach (what metrics, alerting thresholds)
- Distributed tracing standards (correlation IDs, trace headers)
- Where logs/metrics are centralized

**Error Handling:**
- Standard error response format (RFC 7807 Problem Details, or custom)
- Common HTTP status codes and their meanings
- Error code registry (when systems need to communicate specific errors)
- Retry strategies across APIs

**Security:**
- Encryption standards (in-transit, at-rest)
- Certificate management
- Secrets management (how to handle API keys, passwords)
- Security scanning standards

**Performance & Resilience:**
- Rate limiting approach (how APIs handle overload)
- Caching strategy (what can be cached, TTLs)
- Timeout standards
- Circuit breaker / bulkhead patterns

**Versioning & Deprecation:**
- API versioning strategy (URL versioning, headers, etc.)
- Deprecation policy (how long before removal)
- Backward compatibility expectations

**Created from:** Standards extracted from all repos' Part B documentation and organizational standards

**Maintained by:** Architects, with input from each team

**Updated when:** Standards change (rare), new standards added

### 07 - Dependency Map

**Purpose:** Understand what depends on what and impact of changes.

**What it includes:**

- **Dependency Graph:** Visual or text representation of "A depends on B depends on C"
- **Dependency Matrix:** Table showing "row depends on column"
- **Blast Radius Analysis:** If we change API X, what will break? What needs to be tested?
- **Critical Path:** Which systems are most important/central?
- **Circular Dependency Detection:** If A depends on B and B depends on A, flag it
- **Version Compatibility Matrix:** Which versions of API X work with which versions of App Y?

**Created from:** Analyzing imports, API calls, and declared dependencies across all repos

**Maintained by:** Architects, automated scanning where possible

**Updated when:** Dependency structure changes (new integration, removal of integration)

### 08 - Architecture Decision Records (ADRs)

**Purpose:** Document important architectural decisions that affect multiple systems.

**What it includes:**

- **ADR for each major decision:** Following the standard ADR template
- **Status:** Proposed, Accepted, Deprecated, or Superseded
- **Impact Across Systems:** Which systems are affected by this decision
- **Related ADRs:** Links to related decisions (e.g., "ADR-0002 deprecated ADR-0001")

**Standard ADR Template:**

```
# ADR-[NUMBER]: [TITLE]

## Status: [Proposed|Accepted|Deprecated|Superseded]

## Context
Why did we need to make this decision? What forces were at play?

## Decision
What did we decide? (State in active voice)

## Consequences
What are the results of this decision?
- Positive impacts
- Negative impacts
- Neutral impacts

## Affected Systems
[List which systems must follow this decision]

## Implementation Examples
[How systems implement this decision]
```

**Created from:** Synthesis of decisions across repos that affect multiple systems

**Maintained by:** Architects

**Updated when:** Major architectural decisions are made, decisions are superseded

### 09 - Onboarding Guide

**Purpose:** Enable new developers to quickly understand the technical landscape and get productive.

**What it includes:**

**Welcome & Orientation:**
- What is our organization building?
- What are the key business objectives?
- What makes our architecture special?

**System Overview:**
- Read architecture overview section
- Understand the major components
- Learn the terminology

**Core APIs:**
- List of 3-5 most important APIs every developer should know
- Quick descriptions, links to public docs
- Common workflows involving these APIs

**Core Frameworks:**
- List of 3-5 most important frameworks
- What to use each one for
- Getting started links

**Authentication & Security:**
- How to authenticate in our systems
- Security standards you must follow
- Common security mistakes

**Common Tasks:**
- How to call an API from a web app
- How to integrate with another service
- How to add a new endpoint to an API
- How to deploy changes

**Making a Change Safely:**
- How to understand blast radius (use dependency map)
- How to coordinate with other teams
- Where to find documentation before changing

**Debugging Production:**
- Where are logs? How to access them?
- How to trace a request through multiple systems
- Common production issues and how to diagnose

**FAQ:**
- "I need to store user data — where do I do it?"
- "I need to call service X from service Y — what's the protocol?"
- "How do I handle authentication in a mobile app?"
- "What do I do if an integration fails?"

**Created from:** Synthesizing all other Knowledge Repository components into a learning path

**Maintained by:** Architects, updated when repository structure changes significantly

**Updated when:** Major new systems added, major standards change

### 10 - Repository Maintenance Guide

**Purpose:** Define the process for keeping the Knowledge Repository in sync with reality.

**What it includes:**

**Maintenance Workflow:**
- When do we update the repository? (Schedule)
- Who updates what? (Responsibilities)
- What process do we follow? (Steps)

**Change Triggers:**
- New API added → update Service Catalog
- API endpoint changed → update Service Catalog + Architecture (if public interface changed)
- Framework upgraded → update Framework Catalog
- New integration created → update Data Flow Diagram + Dependency Map
- Architecture decision made → add ADR

**Ownership Model:**
- Each API team maintains their public docs (Part B), maintainer aggregates
- Each app team maintains their public docs, maintainer aggregates
- Architects maintain synthesized docs (architecture, dependency map, ADRs)

**Verification Checklist:**
- Dependency map matches actual codebase
- Architecture diagrams reflect current integrations
- Data flow diagram matches current data movement
- Cross-cutting concerns documentation is still accurate
- No new APIs exist that aren't in Service Catalog
- Onboarding guide reflects current state

**Release Schedule:**
- Minor updates (single repo changes) → released immediately
- Major updates (new architecture, major refactor) → released quarterly
- Snapshot versions → keep "stable" version for reference

**Created from:** Process design for maintenance

**Maintained by:** Knowledge Repo maintainer

**Updated when:** Process changes

---

## Phase-by-Phase Assembly Process

### Phase 1: Inventory and Discovery

#### Phase Identity

**Phase ID:** KNOWLEDGE-001
**Phase Name:** Inventory and Discovery
**Goal:** Complete index of all repositories, their public documentation, and system overview

#### Plan

1. **Identify all repositories:**
   - Type (API, framework, application)
   - Team ownership
   - Location of public documentation (Part B for APIs/frameworks, overview for apps)
   - Status (active, beta, deprecated, retired)

2. **Create registries (no synthesis yet):**
   - Services Registry: name, owner, link to Part B docs
   - Frameworks Registry: name, owner, link to Part B docs
   - Applications Registry: name, owner, link to documentation

3. **Identify external systems:**
   - What does the organization call out to? (payment processors, identity providers, etc.)
   - How does it interact?

4. **Document technology landscape:**
   - What programming languages are in use?
   - What frameworks and libraries?
   - What databases and data stores?
   - What infrastructure (cloud providers, on-premise)?

#### Outcome

- Complete inventory of all systems
- All registries (service, framework, application) created with basic info
- Links verified (all point to real documentation)
- Technology landscape documented

---

### Phase 2: Architecture Synthesis

#### Phase Identity

**Phase ID:** KNOWLEDGE-002
**Phase Name:** Architecture Synthesis
**Goal:** Create diagrams showing how all systems relate

#### Plan

1. **Create System Context Diagram (C4 L1):**
   - The organization as a single box
   - External systems it interacts with
   - Protocols and data flows to external systems

2. **Create Container Diagram (C4 L2):**
   - All internal services, applications, databases
   - How they relate (dependencies)
   - Protocols and technologies

3. **Create Data Flow Diagram:**
   - Trace how data moves: request-response, events, batch jobs
   - What data entities flow between systems

4. **Create Deployment Topology:**
   - Where systems run (cloud regions, Kubernetes clusters, etc.)
   - Database deployment
   - Load balancers, caches, external services

5. **Document Technology Landscape:**
   - Summarize what's used and where
   - Approved versions

#### Outcome

- System Context Diagram (C4 L1)
- Container Diagram (C4 L2)
- Data Flow Diagram
- Deployment Topology
- Technology Landscape document

---

### Phase 3: Dependency Mapping

#### Phase Identity

**Phase ID:** KNOWLEDGE-003
**Phase Name:** Dependency Mapping
**Goal:** Understand what depends on what

#### Plan

1. **Analyze each API's public dependencies:**
   - From OpenAPI specs: does it reference other systems?
   - From documentation: what services does it call?

2. **Analyze each app's dependencies:**
   - Which APIs does it call?
   - Which frameworks does it use?

3. **Build dependency matrix:**
   - Create table: A depends on B?
   - Identify circular dependencies (should be rare)
   - Identify critical systems (everything depends on)

4. **Analyze blast radius:**
   - For each system: if we change it, what breaks?
   - Which changes are backward compatible vs. breaking?

#### Outcome

- Dependency graph visualization
- Dependency matrix
- Blast radius documentation
- Critical system identification

---

### Phase 4: Standards Extraction (Cross-Cutting Concerns)

#### Phase Identity

**Phase ID:** KNOWLEDGE-004
**Phase Name:** Cross-Cutting Concerns Extraction
**Goal:** Document standards used across all systems

#### Plan

1. **Extract authentication standards:**
   - Read how each API implements auth (from Part B docs)
   - Identify common approach
   - Document the standard

2. **Extract error handling standards:**
   - How do APIs return errors? (RFC 7807? Custom format?)
   - What HTTP status codes are used?
   - Extract error response format standard

3. **Extract observability standards:**
   - What do systems log?
   - What metrics do they expose?
   - How is distributed tracing done?

4. **Extract other standards:**
   - Rate limiting approach
   - Versioning strategy
   - Deprecation policy
   - Security standards

#### Outcome

- Authentication & Authorization standard documented
- Error Handling standard documented
- Observability standard documented
- Security standard documented
- Rate Limiting standard documented
- Versioning & Deprecation standard documented

---

### Phase 5: Data Dictionary Aggregation

#### Phase Identity

**Phase ID:** KNOWLEDGE-005
**Phase Name:** Data Dictionary Aggregation
**Goal:** Understand data models across systems

#### Plan

1. **Extract all data entities from APIs:**
   - From OpenAPI schemas: collect all data types
   - Identify shared types (User, Order, etc. that appear in multiple APIs)

2. **Map entity relationships:**
   - Which entity types relate to which?
   - Create cross-system entity-relationship diagram

3. **Document data ownership:**
   - Which system is the "source of truth" for each entity?
   - Document "if you want user data, call Service X"

4. **Document data transformations:**
   - When data flows from API A to API B, what fields change names?
   - What fields are derived vs. stored?

5. **Document data lineage:**
   - Where do data originate?
   - What systems consume this data?
   - Create data flow diagram focused on data (not requests)

#### Outcome

- Master Entity-Relationship Diagram
- Shared Types catalog
- Data Ownership map
- Data Transformation documentation
- Data Lineage diagram

---

### Phase 6: Integration Pattern Documentation

#### Phase Identity

**Phase ID:** KNOWLEDGE-006
**Phase Name:** Integration Pattern Documentation
**Goal:** Document how systems integrate

#### Plan

1. **Identify all integration points:**
   - Which API does Service A call?
   - Is it synchronous (request-response) or asynchronous (events)?
   - What's the frequency (on-demand, periodic, streaming)?

2. **Document integration patterns:**
   - Service-to-service REST calls
   - Event-driven integrations
   - Batch job integrations
   - Database replication

3. **Document known integration sequences:**
   - Multi-step workflows involving multiple services
   - Example: "To process an order: call API A to validate, then API B to charge payment, then API C to ship"

4. **Identify gaps and risks:**
   - What should integrate but doesn't?
   - What integrations are fragile?
   - What's missing (e.g., "User Service should be source of truth but isn't")

#### Outcome

- Integration patterns documented
- Known workflows documented
- Integration gaps identified
- Integration risks documented

---

### Phase 7: Architecture Decision Records

#### Phase Identity

**Phase ID:** KNOWLEDGE-007
**Phase Name:** Architecture Decision Records
**Goal:** Document important decisions that affect multiple systems

#### Plan

1. **Identify decision candidates:**
   - Major architectural choices (microservices, monolith, serverless, etc.)
   - Standards that affect all systems (auth, error format, versioning)
   - Technology choices (why these frameworks? why this database?)
   - Integration approaches (why REST vs. gRPC vs. events?)

2. **For each decision, create ADR:**
   - Status (Accepted, Deprecated, etc.)
   - Context (why did we need to decide?)
   - Decision (what did we choose?)
   - Consequences (what resulted?)
   - Affected systems

3. **Link related ADRs:**
   - If ADR-0002 supersedes ADR-0001, document the link
   - If multiple decisions are related, cross-reference

#### Outcome

- Set of ADRs covering major decisions
- ADR index
- Linked/superseded decisions documented

---

### Phase 8: Onboarding Guide Synthesis

#### Phase Identity

**Phase ID:** KNOWLEDGE-008
**Phase Name:** Onboarding Guide Synthesis
**Goal:** Create learning path for new developers

#### Plan

1. **Synthesize welcome section:**
   - Overview of what organization builds
   - Organizational context

2. **Synthesize system overview:**
   - Reference architecture diagrams created in Phase 2
   - Explain major components

3. **Identify core APIs and frameworks:**
   - Which 3-5 APIs should every developer know?
   - Which 3-5 frameworks should every developer know?
   - Create learning sequence

4. **Create task-based guides:**
   - "How to call an API"
   - "How to deploy a service"
   - "How to debug an issue"
   - Use actual examples from real systems

5. **Create FAQ:**
   - Common questions from previous new developers
   - Link to detailed documentation

#### Outcome

- Onboarding guide ready for new developers
- Task-based guides created
- FAQ populated

---

### Phase 9: Maintenance Guide Creation

#### Phase Identity

**Phase ID:** KNOWLEDGE-009
**Phase Name:** Maintenance Guide Creation
**Goal:** Define how to keep repository in sync

#### Plan

1. **Define change triggers:**
   - When does the repository need updating?

2. **Define responsibilities:**
   - Who updates what?

3. **Define process:**
   - Steps to update repository
   - Verification steps

4. **Define release schedule:**
   - How often is it published?
   - Version numbering

5. **Create verification checklist:**
   - Before publishing, verify that:
     - All dependencies documented
     - All integrations match diagrams
     - Standards are accurate

#### Outcome

- Maintenance workflow defined
- Responsibilities assigned
- Release schedule published
- Verification checklist created

---

## Maintaining the Knowledge Repository

### Update Triggers

The Knowledge Repository must be updated when:

| Trigger | Action | Timeline |
|---------|--------|----------|
| New API added | Add to Service Catalog, update Architecture diagram | Immediate |
| API endpoint added/removed/changed | Update Service Catalog, Architecture (if public interface) | Immediate |
| API deprecated | Mark in Service Catalog, plan sunset timeline | Immediate |
| New framework adopted | Add to Framework Catalog | Immediate |
| Framework version upgrade | Update Framework Catalog | Immediate |
| New application added | Add to Application Catalog | Immediate |
| New integration created | Update Data Flow Diagram, Dependency Map | Immediate |
| Data model changes | Update Data Dictionary | Next sync cycle |
| Architecture decision made | Add ADR | Next sync cycle |
| Standards change | Update Cross-Cutting Concerns | Next sync cycle |

### Sync Workflow

**Trigger:** Repository maintainer runs sync process (on schedule or on manual trigger)

1. **Identify changed repositories:**
   - Which repos have changed since last sync?
   - Which Part B docs have been updated?

2. **Update affected sections:**
   - If Service Catalog APIs changed, re-aggregate
   - If integrations changed, re-generate dependency map and data flow diagram
   - If standards changed, update cross-cutting concerns

3. **Verify consistency:**
   - Run verification checklist
   - Check for gaps and discrepancies

4. **Review changes:**
   - Have architect review changed sections
   - Confirm no errors introduced

5. **Update Change Tracker:**
   - Log all changes
   - Note what was updated and why

6. **Publish:**
   - Commit to repository
   - Tag with version
   - Notify stakeholders

### Ownership Model

| Component | Owner | Maintains |
|-----------|-------|-----------|
| Service Catalog | API teams | Their public interface (Part B docs) |
| Framework Catalog | Framework teams | Their public interface (Part B docs) |
| Application Catalog | App teams | Their public documentation |
| Architecture Overview | Architects | Synthesized from all repos |
| Data Dictionary | Data architects | Extracted from all APIs |
| Cross-Cutting Concerns | Architects | Standards from all repos |
| Dependency Map | Architects | Automated + manual verification |
| ADRs | Architects | Major decisions |
| Onboarding Guide | Technical writers | Updated as repository changes |
| Maintenance Guide | Knowledge Repo team | Process for keeping repo in sync |

---

## Change Tracking

> **Common Structure:** See `../_shared/templates/change-tracker-template.md` for the universal Change Tracker file structure, versioning convention, and change types.

### Change Tracker File

All changes to the Knowledge Repository are logged in `CHANGE-TRACKER.md` at the root of the knowledge repository directory.

### Parts Affected Values

The Knowledge Repository does not follow the Part A / Part B model used by individual repository documentation. Instead, changes are tracked by **component name**. Use the following values in the "Parts Affected" column:

| Value | Meaning |
| --- | --- |
| Architecture Overview | C4 diagrams, system context, container diagrams |
| Service/API Catalog | API and service registry entries |
| Framework/Library Catalog | Framework and library registry entries |
| Application Catalog | Application registry entries |
| Data Dictionary | Aggregated data dictionary and ERD |
| Cross-Cutting Concerns | Shared patterns, security, observability, etc. |
| Dependency Map | Inter-system dependency graph |
| ADRs | Architecture Decision Records |
| Onboarding Guide | New developer onboarding documentation |
| Maintenance Guide | Ongoing maintenance procedures |
| Multiple | When more than two components are affected, list them |

### Discrepancy Resolution

If the Knowledge Repository conflicts with source repositories:

1. **Identify the conflict:**
   - Which doc is wrong?
   - Source of truth is ALWAYS the source repo
   - Knowledge Repository is always downstream

2. **Correct the Knowledge Repository:**
   - Update based on source truth
   - Log in Change Tracker as "Correction" with reason "Discrepancy resolution"

3. **Notify the source team:**
   - If the source repo's Part B docs are inaccurate, the source team must fix them
   - Knowledge Repository depends on accurate Part B docs

---

## Scaffolding Approach — Structure Before Content

Following the pattern from other phase guides, Knowledge Repository assembly uses scaffolding:

### Step 1: Create File Structure

Before synthesizing ANY content, create all files with section headers only:

```
docs/knowledge-repository/
├── 01-architecture-overview/
│   ├── 01-system-context-diagram.md (empty except headers)
│   ├── 02-container-diagram.md (empty except headers)
│   └── ...
├── 02-service-api-catalog/
│   ├── services-registry.md (empty except headers)
│   └── ...
```

### Step 2: Populate Scaffolding

Then populate each section incrementally with verification at each step.

### Step 3: Cross-Link

Finally, add cross-references between sections.

**Critical:** Do NOT jump ahead to synthesize content before structure is agreed.

---

## Best Practices

### 1. Prioritize Accuracy Over Completeness

A small, accurate Knowledge Repository is more valuable than a large, partially inaccurate one. It's better to document 3 APIs perfectly than 10 APIs partially.

**How to apply:**
- Start with core systems
- Expand gradually
- Verify thoroughly before including

### 2. Make Dependencies Explicit

Instead of implying relationships, state them explicitly. "API X depends on API Y" is clear. "API X may need API Y" is ambiguous.

**How to apply:**
- Use "depends on" or "calls" language
- List dependencies explicitly in catalogs
- Update dependency map whenever dependencies change

### 3. Use Consistent Terminology

If one repo calls something "User" and another calls it "Account", pick one term for the Knowledge Repository and explain the mapping.

**How to apply:**
- Create a glossary of terms
- Define each term once
- Reference the glossary throughout

### 4. Keep Diagrams Current

Outdated diagrams are worse than no diagram. Prioritize keeping diagrams in sync.

**How to apply:**
- Make diagrams the highest priority in maintenance
- Regenerate on every major change
- Link diagrams to source of truth (dependency map, architecture code)

### 5. Link to Source Documentation

The Knowledge Repository links OUT to source repos, not vice versa. Service Catalog says "See [API docs] for details."

**How to apply:**
- Always include links to source Part B documentation
- Don't duplicate the detailed docs
- Point to the authoritative location

### 6. Review by Domain Experts

Synthesized documentation must be reviewed by people who understand the systems, not just the maintainer.

**How to apply:**
- Have architects review synthesis
- Have API teams review their Service Catalog entries
- Iterate based on feedback

### 7. Keep Maintenance Lightweight

If the maintenance process is too heavy, the repository becomes stale. Aim for maintainability over perfection.

**How to apply:**
- Automate what you can (dependency scanning, link validation)
- Make updates incremental, not batch
- Keep the process simple

---

## Common Pitfalls and Solutions

### Pitfall 1: Copy-Pasting Instead of Synthesizing

**Problem:** Maintainer copies Part B docs from each repo into Knowledge Repository instead of synthesizing relationships.

**Result:** Repository becomes 10x larger, harder to maintain, doesn't add value beyond what already exists.

**Solution:**
- Explicitly define what goes in the Knowledge Repository (see "What is NOT" section)
- Have maintainer explain what new value each synthesized document adds
- Review to ensure no duplication of source docs

### Pitfall 2: Repository Becomes Stale

**Problem:** No update process defined, so after initial creation, repository falls behind reality.

**Result:** Developers trust it, make decisions based on incorrect information, waste time.

**Solution:**
- Define clear update triggers and schedule (see "Update Triggers" section)
- Assign responsibility to specific person/team
- Publish update frequency (e.g., "synced weekly")
- Make updating easy (automation where possible)

### Pitfall 3: Over-Synthesizing Without Verification

**Problem:** Maintainer creates dependency map or data flow without verifying against source repos.

**Result:** Diagram shows relationships that don't exist or misses important relationships.

**Solution:**
- Always verify synthesized docs against source
- Have expert review before publishing
- Include "verified on date X against source Y" in docs

### Pitfall 4: Repository Only Reflects Current State, Not History

**Problem:** Repository doesn't explain WHY systems are the way they are, only what they are.

**Result:** New developers don't understand important constraints and accidentally break things.

**Solution:**
- Use ADRs to capture important decisions and WHY they were made
- Include "history" sections in Architecture Overview
- Document deprecated approaches and why they were replaced

### Pitfall 5: Forgetting the Maintenance Burden

**Problem:** Repository includes 20 sections that all need updating when something changes.

**Result:** Maintainer falls behind, updates skip some sections, inconsistency grows.

**Solution:**
- Start small (5-7 core sections)
- Expand gradually
- Automate high-maintenance sections if possible

### Pitfall 6: Not Communicating Updates

**Problem:** Repository is updated but nobody knows it's current or what changed.

**Result:** Developers rely on old cached version or distrust the new content.

**Solution:**
- Publish change log with each update
- Announce significant changes (new APIs, new architecture decisions)
- Include publication date and "next update date" in every document

---

## Prompt Templates and Examples

### Template 1: Initializing Inventory

```
"We are creating a Central Knowledge Repository for our organization.

Step 1: Inventory

I will provide you a list of all our repositories. For each, you will:
1. Note the type (API, Framework, Application)
2. Identify the team that owns it
3. Find the public documentation (Part B for APIs/frameworks, overview for apps)
4. Confirm the status (active, beta, deprecated)

Here are our repositories:

[PASTE FULL LIST WITH LOCATIONS]

For each, create a registry entry with: Name, Type, Owner, Public Docs Link, Status

Then summarize: How many APIs, frameworks, and applications do we have?"
```

### Template 2: Synthesizing Architecture Diagram

```
"Based on the APIs and applications I've described, create a C4 Level 2 Container
Diagram showing:
1. All services (APIs)
2. All applications
3. All databases/data stores
4. How they connect (request/response, events, etc.)

Format the diagram as Mermaid syntax.

Before you create the diagram, list what you understand:
- [N] APIs: [list them]
- [M] Applications: [list them]
- [K] Databases: [list them]

Are there any gaps? Any services you're unsure about?"
```

### Template 3: Creating Dependency Map

```
"Create a dependency matrix (table) for our systems.

Rows: all systems
Columns: all systems
Cell [A, B]: Does A depend on B?

If A depends on B, note what type of dependency (REST, events, database, framework, etc.)

Before creating, list all systems you found: [should match inventory from Step 1]

After creating, answer: Which systems have the most dependents? Which have the most dependencies?"
```

### Template 4: Extracting Cross-Cutting Concerns

```
"Read the public documentation (Part B docs) for these APIs:

[PROVIDE LINKS TO PART B1 OPENAPI SPECS AND PART B2 CONSUMER GUIDES]

Then answer:

1. Authentication: How do these APIs authenticate users? (OAuth2? JWT? API keys?)
2. Error Handling: What error response format do they use?
3. Rate Limiting: How do they handle rate limiting?
4. Versioning: How do they version their APIs?

For each answer, show me examples from the documentation."
```

### Template 5: Creating Onboarding Guide Section

```
"Create a 'Getting Started' section for our onboarding guide.

Our core systems are:
[LIST MOST IMPORTANT APIS/FRAMEWORKS]

The audience is a new developer with [SKILL LEVEL] experience.

Create a 'Getting Started' section that:
1. Explains our overall architecture (2-3 paragraphs)
2. Lists the 3 core APIs they'll use first (with links)
3. Lists the 3 core frameworks they'll use (with links)
4. Provides a step-by-step first task ('Call your first API from a web app')

Use the architecture and catalog documents I've provided as context."
```

---

## Quick Reference Checklist

### Before Creating Knowledge Repository

- [ ] Inventory all repositories (APIs, frameworks, applications)
- [ ] Verify all Part B documentation exists and is complete
- [ ] Identify the architect(s) who will oversee synthesis
- [ ] Determine update schedule (weekly? monthly?)
- [ ] Assign responsibility (who maintains it?)
- [ ] Decide on file structure and tools (Markdown? Diagrams as code?)

### Knowledge Repository Content Checklist

**Architecture Overview:**
- [ ] System Context Diagram (C4 L1) created
- [ ] Container Diagram (C4 L2) created
- [ ] Data Flow Diagram created
- [ ] Deployment Topology documented
- [ ] Technology Landscape summarized

**Catalogs:**
- [ ] Service Catalog complete with all APIs
- [ ] Framework Catalog complete with all frameworks
- [ ] Application Catalog complete with all applications
- [ ] Cross-references between catalogs verified

**Synthesized Documentation:**
- [ ] Dependency Map created and verified
- [ ] Data Dictionary aggregated
- [ ] Cross-Cutting Concerns documented
- [ ] Architecture Decision Records created

**Onboarding & Maintenance:**
- [ ] Onboarding Guide created
- [ ] Maintenance Guide created
- [ ] Change Tracker initialized
- [ ] Update schedule published

### Verification Checklist Before Publication

- [ ] All links in catalogs are valid (not broken)
- [ ] Dependency Map matches actual code dependencies (spot-check 5-10)
- [ ] Architecture diagrams show current integrations
- [ ] Cross-Cutting Concerns standards are consistent across systems
- [ ] Data Dictionary schemas match OpenAPI specs (spot-check)
- [ ] Onboarding Guide is followable by someone new to the organization
- [ ] Change Tracker is current
- [ ] Publication date and next update date are documented

### Maintenance Checklist

- [ ] Each month (or per schedule):
  - [ ] Check if any new repositories were added
  - [ ] Check if any APIs changed public interface
  - [ ] Check if any frameworks were upgraded
  - [ ] Run automated dependency scanning
  - [ ] Review and integrate changes
  - [ ] Publish updated version

- [ ] Each quarter:
  - [ ] Full verification of dependency map against codebase
  - [ ] Verify architecture diagrams still accurate
  - [ ] Review and update ADRs if needed
  - [ ] Refresh onboarding guide based on feedback

---

## Conclusion

The Central Knowledge Repository is the bridge between individual repository documentation and organization-wide understanding. It enables new developers to quickly grasp the landscape, architects to make informed decisions, and AI assistants to generate code that integrates correctly.

Success depends on:

1. **Accurate source documentation** — Each repository's Part B docs must be accurate and current
2. **Disciplined synthesis** — Creating new documentation that adds value beyond source docs
3. **Regular maintenance** — Keeping the repository in sync with reality
4. **Clear ownership** — Someone is responsible for each section
5. **Verification** — Synthesized docs must be validated against source

This is not a one-time effort but an ongoing process that evolves as the organization grows and changes. Treat it as infrastructure that enables all future development work.

