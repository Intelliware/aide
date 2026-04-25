# Create Solution Design Package - Training Info Dump

**Purpose:** Comprehensive reference for training new AI users on Phase 2 of the AI SDLC - Creating the Solution Design Package.

**Target Audience:** Technical Architects, Developers, Systems Analysts, DevOps Engineers, Database Administrators, and anyone involved in translating requirements into technical specifications.

**Source Documents:** AI-SDLC-Best-Practices-Info-Dump.md, AI-Assisted-Coding-Playbook.md, Solution-Requirements-Gathering-Guide.md, change-tracker-template.md, docs/solution-design/ examples.

---

## Table of Contents

- [What is the Solution Design Package?](#what-is-the-solution-design-package)
- [Why Solution Design Matters - Impact on Code Creation](#why-solution-design-matters---impact-on-code-creation)
- [How Requirements Drive Solution Design](#how-requirements-drive-solution-design)
- [Core AI Principles for Solution Design](#core-ai-principles-for-solution-design)
- [The 7-Step Workflow for Solution Design](#the-7-step-workflow-for-solution-design)
- [Solution Design Package Components](#solution-design-package-components)
- [Solution Requirements Gathering Process](#solution-requirements-gathering-process)
- [Scaffolding Approach - Structure Before Content](#scaffolding-approach---structure-before-content)
- [Best Practices for Solution Design](#best-practices-for-solution-design)
- [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
- [Prompt Templates and Examples](#prompt-templates-and-examples)
- [Quick Reference Checklist](#quick-reference-checklist)

---

## What is the Solution Design Package?

### Definition

The Solution Design Package is the **technical blueprint** that translates business requirements into a strategy for building the solution. It defines HOW the system will be built, bridging the gap between WHAT the system must do (requirements) and the actual CODE that implements it.

### Key Characteristics

- **Technical Strategy:** Defines architecture, technology stack, and implementation patterns
- **Changeable Details:** Contains information that may evolve (UI specifics, technology choices, implementation approaches) while requirements remain stable
- **Implementation-Ready:** Provides enough detail for developers to begin coding without ambiguity
- **Traceable to Requirements:** Every design decision should trace back to one or more requirements

### What Belongs in Solution Design vs. Requirements

| **Solution Design (Changeable)** | **Requirements (Stable)** |
| --- | --- |
| UI/UX details and layouts | Business objectives |
| Technology choices (frameworks, databases) | Functional requirements |
| API contracts and endpoints | Business rules |
| Database schemas and models | Data requirements (what data, sources) |
| Implementation patterns | Acceptance criteria |
| Screen designs and wireframes | Permissions and roles (what access) |
| Architecture decisions | Non-functional expectations |
| Security implementation | Stakeholders and personas |

**Guiding Principle:** Requirements define WHAT and WHY. Solution Design defines HOW.

### Solution Design Package vs. Traditional Technical Specs

The Solution Design Package is more comprehensive than a traditional technical specification:

- **Holistic View:** Covers frontend, backend, database, security, testing, deployment, and operations
- **AI-Enhanced Creation:** Structured for iterative, chunk-by-chunk development with AI assistance
- **Living Documentation:** Evolves through the scaffolding approach and serves as context for code generation
- **Traceable:** Explicitly maps back to requirements for validation and change impact analysis

---

## Why Solution Design Matters - Impact on Code Creation

Understanding how solution design influences code creation helps you create better technical specifications.

### Impact on Code Creation (Phase 3)

The Solution Design Package directly drives:

- **Architecture Implementation:** Solution architecture becomes the structure of the codebase (folder organization, module boundaries, component hierarchy)
- **Technology Choices → Code Patterns:** Framework and library decisions determine coding patterns, conventions, and available tools
- **API Contracts → Endpoint Implementation:** API design documents become the exact endpoints developers implement
- **Database Design → Models and Migrations:** Schema designs become database migration files and ORM entities
- **Security Design → Authentication/Authorization Code:** Security specifications become middleware, guards, and access control implementations
- **Testing Strategy → Test Suite Structure:** Testing approach defines what tests exist, how they're organized, and what's mocked

**Example:** If your solution design specifies "React 18 with TypeScript, React Router for navigation, TanStack Query for server state, and shadcn/ui for components," the code will:

- Use TypeScript types throughout
- Implement routing with React Router patterns
- Fetch data using TanStack Query hooks
- Build UI with shadcn/ui components

### Why Poor Solution Design Leads to Code Problems

Without proper solution design:

- **Inconsistent Implementation:** Developers make ad-hoc technology and pattern decisions
- **Integration Failures:** Components built in isolation don't work together
- **Security Gaps:** Security is added as an afterthought instead of by design
- **Performance Issues:** Scalability and performance not considered until too late
- **Rework:** Code must be rewritten when design decisions conflict

### The Persistent Memory Problem (Continued from Requirements)

AI does not retain information between sessions. Your Solution Design Package:

- Carries context from the Requirements phase forward
- Provides the technical blueprint AI needs to generate consistent code
- Ensures decisions made in solution design persist through implementation
- Acts as the authoritative source of truth for HOW the system is built

**Critical Insight:** At the start of each coding session, AI must re-read both requirements AND solution design to generate code that aligns with the established strategy.

---

## How Requirements Drive Solution Design

### Requirements → Solution Design Mapping

Every solution design decision should trace back to one or more requirements. Here's how different requirement types drive design:

| **Requirement Type** | **Drives These Design Decisions** |
| --- | --- |
| **Functional Requirements** | Features, components, modules, API endpoints, workflows |
| **Business Rules** | Validation logic, calculation engines, state machines, workflow automation |
| **Data Requirements** | Database schema, entity relationships, data models, storage strategy |
| **Permissions/Roles** | RBAC implementation, security guards, authorization middleware |
| **Non-Functional Requirements** | Architecture patterns, caching strategy, scalability approach, performance optimization |
| **Integration Requirements** | API contracts, protocols, authentication flows, error handling |
| **User Personas** | UI/UX design, user-role-based dashboards, workflow optimizations |

### Example: Requirements Driving Solution Design

**Requirement (FR3.1):** "The system shall allow Resource Managers to approve or reject allocation requests."

**Solution Design Implications:**

- **API Design:** `POST /api/allocations/{id}/approve`, `POST /api/allocations/{id}/reject`
- **Database Design:** Allocation table with status (Provisional/Approved/Rejected/Released), approver_id, approved_at, rejection_reason
- **Security Design:** RBAC rule - only Resource Manager role can access approve/reject endpoints
- **Frontend Design:** Approval queue view, approval dialog with comments field, status indicators
- **Notification Design:** Event triggers notification to requester on approval/rejection

### Reading Requirements Before Solution Design

**Critical Step:** Before creating solution design, always:

1. Have AI read the complete Requirements Package
2. Ask AI to summarize what it understood
3. Verify the summary is accurate
4. Correct any misunderstandings
5. Then proceed with solution design

**Example Prompt:**

```
We are going to create a solutions package. Please read the requirements documents 
in docs/requirements/ and summarize back to me:
1. What is this project about?
2. Who are the main user types?
3. What are the key functional areas?
4. What business rules should the solution implement?
5. What are the non-functional requirements?
```

---

## Core AI Principles for Solution Design

### 1. AI is Intelligent, But Not Smart

**What this means for solution design:**

- AI can generate impressive technical documentation but doesn't truly "understand" your technical constraints
- AI may suggest technologies or patterns that don't fit your environment
- Always verify AI understands your tech stack, infrastructure, and constraints before generating designs

**How to apply:**

- Before solution design, explicitly state all technology constraints
- Verify AI understands by asking it to summarize the tech stack
- Review AI-generated architecture for compatibility with your environment

### 2. Context is Critical

**What this means for solution design:**

- Solution design quality depends heavily on having the requirements context loaded
- AI needs to understand both business requirements AND technical constraints
- Missing context leads to designs that don't meet requirements or violate constraints

**How to apply:**

- Always have AI read requirements documents first
- Provide explicit technology constraints: "We must use Java 21, Spring Boot 3.x, PostgreSQL 16"
- Include organizational standards: "We follow RFC 7807 for API errors"
- Reference existing architecture if extending a system

### 3. AI Will Try to Do More Than Asked

**What this means for solution design:**

- AI may generate code when you only asked for design
- AI may include technologies you didn't specify
- AI may create designs for features not in requirements

**How to apply:**

- Be explicit about deliverables: "Create the API design document only. Do not write code."
- Start new conversations when switching between design and implementation
- Tell AI exactly what you want AND what you don't want

### 4. Token Limitations Affect Depth

**What this means for solution design:**

- Asking for the entire solution design at once yields shallow content
- AI produces better detail when focused on one design area at a time
- Complex designs benefit from chunk-by-chunk development

**How to apply:**

- Design one component at a time (database design, then API design, then frontend design)
- Use scaffolding approach: create structure first, then fill in each section
- Don't ask AI to generate the entire solution design in one prompt

### 5. Verification Prompts Are Essential

**What this means for solution design:**

- Verify AI understands requirements before designing
- Verify AI understands technology constraints before proposing architecture
- Verify each design section before moving to the next

**How to apply:**

- "Before we design the API, summarize the functional requirements for this feature"
- "Before we design the database, what entities and relationships do you understand?"
- "Summarize the security design before we move to implementation details"

### 6. AI Has Short Memory (Session Only)

**What this means for solution design:**

- Each session starts without knowledge of prior design decisions
- AI may contradict earlier design choices if not reminded
- Documentation becomes critical for consistency

**How to apply:**

- Commit solution design documents frequently
- At the start of each session, have AI read existing solution design documents
- Reference specific design decisions when building on them
- Document decisions as you make them so they can be re-loaded

---

## The 7-Step Workflow for Solution Design

The 7-Step Workflow is repeated within the Solution Design phase to ensure consistency and quality.

### Step 1: Set Context of Deliverable

**Purpose:** Establish that you're creating solution design and what it must achieve.

**For Solution Design Phase:**

```
"We are going to create a solution design package for [PROJECT NAME]. This will 
translate the requirements into technical specifications. The solution design 
will include architecture, technology stack, database design, API design, 
security, and other technical decisions needed to implement the requirements."
```

**What to include:**

- That you're in the Solution Design phase
- Reference to the requirements that drive this design
- High-level scope of the solution design

### Step 2: Set Context of Audience/Environment/Components

**Purpose:** Define who will use this design, what technical environment applies, and what components are needed.

**Example Prompts:**

- "Who is the usual audience for solution design documents?"
- "What components are typically included in a solution design package for a web application?"
- "What should be included in a solution design for a Spring Boot API with React frontend?"

**Have AI suggest:**

- Technical audience (developers, architects, DevOps)
- Required design components
- Standard sections for your technology stack

### Step 3: Refine the Feedback

**Purpose:** Customize AI's suggestions with your specific technology constraints.

**Example Prompts:**

- "We must use Java 21 with Spring Boot 3.x for the backend"
- "The frontend must use React 18 with TypeScript"
- "Database is PostgreSQL 16 hosted on Azure"
- "Authentication must use Microsoft Entra ID SSO"
- "We follow RFC 7807 for API error responses"
- "Remove the mobile app section - that's out of scope"

**What to refine:**

- Technology stack constraints
- Platform/infrastructure requirements
- Organizational standards
- Security requirements
- Scope boundaries

### Step 4: Create Scaffolding Structure

**Purpose:** Establish the file structure and headers for solution design WITHOUT content.

**Critical:** Do NOT let AI generate content at this stage. Only structure and headers.

**Example Prompt:**

```
"Based on the requirements and technology constraints, propose how you would 
structure the solution design package. What files would we need and what are 
the major headers in each file? Show me the structure only, do not create 
the content yet."
```

**Process:**

1. AI proposes structure
2. You negotiate/refine the structure
3. Once agreed, AI creates file structure and headers ONLY
4. Review structure before proceeding

### Step 5: Create Content Chunk-by-Chunk

**Purpose:** Build solution design content incrementally with verification at each step.

**Example Prompts:**

- "Now create the Solution Overview section"
- "Now design the database schema for the [ENTITY] tables"
- "Now design the API endpoints for [FEATURE AREA]"
- "Now document the security architecture"

**Process:**

1. Select one chunk (e.g., one design document section)
2. Ask AI to create it
3. Review the output
4. Refine/correct as needed
5. Move to next chunk

**Recommended Order for Solution Design:**

1. Solution Overview (master document)
2. Technology Stack
3. Solution Architecture
4. Database Design
5. Backend Design
6. API Design
7. Business Logic/Workflows
8. Frontend Design
9. Security Design
10. Integration Design
11. Dashboard/Reporting Design
12. Observability/Operations
13. Testing Strategy
14. Deployment/DevOps
15. Non-Functional Requirements
16. Risk Assessment

### Step 6: Add Supporting Documents

**Purpose:** Provide additional context AI needs for accurate design.

**Example Documents:**

- Requirements Package (all documents)
- Existing architecture diagrams
- Network diagrams
- Organizational standards documents
- API specifications from integrated systems
- Security policies

**How to add:**

- Reference files in the codebase
- Upload documents to the conversation
- Paste relevant excerpts

### Step 7: Verify Understanding

**Purpose:** Ensure AI has read and understood requirements and constraints.

**Example Prompts:**

- "Summarize the requirements document I just uploaded"
- "What are the key functional requirements that drive this API design?"
- "Do you understand the authentication flow from the requirements?"
- "Before we design the database, what entities did you identify from the requirements?"

**Why this matters:**

- Confirms AI has processed the information
- Reveals misunderstandings early
- Allows correction before investing in detailed design

---

## Solution Design Package Components

Based on real-world examples, a comprehensive solution design package typically includes these documents:

### 1. Solution Overview (Master Document)

**Purpose:** Executive-level view of the solution and business context.

**Contents:**

- Executive Summary
- Business Context & Problem Statement
- Solution Vision & Scope
- In-Scope Capabilities (from Requirements)
- High-Level User Experience/Navigation
- Data Ownership & Source of Truth
- Assumptions, Constraints & Out of Scope

### 2. Technology Stack

**Purpose:** Actionable, implementation-ready technology decisions.

**Contents:**

- Technology Stack Overview with pinned versions
- Frontend Technologies (framework, libraries, build tools, testing)
- Backend Technologies (language, framework, ORM, testing)
- Database Technologies
- Infrastructure & Hosting
- CI/CD & DevOps tools
- Observability & Monitoring tools
- Security & Identity tools
- Development Tools & Standards

**Example Structure:**

```markdown
## Pinned versions (baseline)
- React: 18.2.0
- Java: 21
- Spring Boot: 3.5.9
- PostgreSQL: 16.0

## Frontend Technologies
- Language: TypeScript
- Framework: React 18.2.0
- Routing: React Router
- State management: React Context API + TanStack Query
- UI: shadcn/ui + Tailwind CSS
- Build tool: Vite
- Testing: Vitest + Playwright
```

### 3. Solution Architecture

**Purpose:** High-level architecture and system design.

**Contents:**

- Architecture Overview
- Architectural Drivers (from requirements)
- High-level Architectural Approach
- System Context Diagram
- High-Level Architecture Diagram
- Component Architecture
- Deployment Architecture
- Architecture Principles & Patterns
- Scalability & Availability Strategy

### 4. Frontend Design

**Purpose:** React/web frontend architecture and implementation patterns.

**Contents:**

- Frontend Architecture Overview
- Technology Baseline
- Runtime & Deployment Model
- Integration with Backend API
- Authentication (SSO flow)
- Authorization Model (RBAC)
- Environment Configuration
- Data Freshness/Caching Strategy
- Browser Support & Accessibility
- Application Structure (folder organization)
- State Management Strategy
- Routing
- Frontend Security
- Performance Optimization
- Testing Strategy (Frontend)

### 5. Backend Design

**Purpose:** Spring Boot/API backend architecture and patterns.

**Contents:**

- Backend Architecture Overview
- Service Layer Design
- Domain Model
- Business Logic Placement
- Transaction Management
- Error Handling Strategy
- API Conventions
- Security Implementation
- Performance Considerations
- Testing Strategy (Backend)

### 6. Database Design

**Purpose:** PostgreSQL schema and data model.

**Contents:**

- Database Architecture Overview
- Deployment Model
- Data Integrity & Governance
- Schema Design Conventions (naming conventions, common columns, deactivation vs soft delete patterns, ID and concurrency conventions)
- Core Tables (with column definitions)
- Entity Relationship Diagram (ERD)
- Data Model descriptions
- Relationships & Constraints
- Indexing Strategy
- Data Dictionary (detailed column specs)
- Migration Strategy
- Data Retention & Archival
- Backup & Recovery
- Performance Optimization
- Security (Database Level)

### 7. API Design

**Purpose:** REST API contracts and endpoint specifications.

**Contents:**

- API Overview
- RESTful Conventions
- API Versioning Strategy
- Authentication/Authorization for APIs
- Request/Response Formats
- Error Response Format (RFC 7807)
- Pagination Standards
- Endpoint Specifications by Domain (Practitioners API, Projects API, Allocations API, Positions API, etc.)
- API Documentation Format (OpenAPI/Swagger)

### 8. Integration Design

**Purpose:** External system integrations.

**Contents:**

- Integration Overview
- SSO Integration (Entra ID)
- Email Integration
- Other System Integrations
- Integration Patterns
- Error Handling for Integrations

### 9. Security Design

**Purpose:** Security architecture and implementation.

**Contents:**

- Security Overview
- Authentication Strategy
- Authorization Model (RBAC)
- User Roles and Permissions
- Data Security (encryption at rest, encryption in transit, PII handling)
- API Security
- Session Management
- Audit Logging
- Security Headers
- Vulnerability Management

### 10. Workflow & Business Rules Design

**Purpose:** How business rules translate to system behavior.

**Contents:**

- Workflow Overview
- State Machines (status transitions)
- Approval Workflows
- Business Rule Implementation
- Event-Driven Behaviors
- Automation Rules

### 11. Dashboard & Reporting Design

**Purpose:** Information architecture for dashboards and reports.

**Contents:**

- Dashboard Overview
- Role-Based Dashboard Views
- Key Metrics and KPIs
- Reporting Requirements
- Data Visualization Patterns

### 12. Deployment & DevOps

**Purpose:** How the solution will be deployed and operated.

**Contents:**

- Deployment Overview
- Environment Strategy (dev/test/staging/prod)
- CI/CD Pipeline Design
- Container Strategy
- Infrastructure as Code
- Release Management
- Rollback Strategy

### 13. Observability & Operations

**Purpose:** Monitoring, logging, and operational concerns.

**Contents:**

- Observability Overview
- Logging Strategy
- Metrics and Monitoring
- Alerting Strategy
- Health Checks
- Operational Runbooks

### 14. Testing Strategy

**Purpose:** How the solution will be tested.

**Contents:**

- Testing Overview
- Testing Pyramid
- Unit Testing Strategy
- Integration Testing Strategy
- End-to-End Testing Strategy
- Performance Testing
- Security Testing
- Test Data Management
- Test Environment Strategy

### 15. Non-Functional Requirements (Technical)

**Purpose:** Technical specifications for NFRs.

**Contents:**

- Performance Requirements (specific targets)
- Scalability Requirements
- Availability Requirements
- Security Requirements (technical specs)
- Compliance Requirements

### 16. UX Design

**Purpose:** User experience specifications.

**Contents:**

- Design System
- Navigation Patterns
- Responsive Design
- Accessibility Requirements
- User Flows

### 17. Risk Assessment

**Purpose:** Technical risks and mitigation strategies.

**Contents:**

- Technical Risks
- Performance Risks
- Security Risks
- Integration Risks
- Mitigation Strategies

### 18. Glossary & Acronyms

**Purpose:** Terminology definitions.

**Contents:**

- Business Terms
- Technical Terms
- Acronym Definitions

---

## Solution Requirements Gathering Process

### Overview

The Solution Requirements Gathering Guide provides a structured process for gathering technical information needed to design and build the system. It is completed AFTER the Business Requirements Gathering and Review phases.

### Prerequisites

Before starting solution requirements gathering:

- Business Requirements Gathering Guide completed
- Business Requirements Review Guide completed
- Requirements documents are stable and committed

### Step-by-Step Process

#### Starting a Session

**Prompt:** "I'm starting a solution requirements gathering session. Please read the business requirements for this project and summarize back to me in chat, what this project is doing."

The AI will:

1. Read the business requirements document(s)
2. Summarize the project back to you in chat
3. Ask: "Is this summary correct?"

If correct: AI asks if you want scaffolding structure created. If incorrect: AI asks for clarification, then offers scaffolding.

#### Step 1: Architecture and Technology Stack

**Goal:** Define the technical architecture and technology choices.

**Questions to answer:**

- 1.1: What is the architecture approach? (Monolith, microservices, serverless, or hybrid? Architectural patterns? Constraints?)
- 1.2: What is the technology stack? (Programming languages/frameworks? Databases? Frontend/backend technologies? Constraints or preferences?)
- 1.3: What are the infrastructure requirements? (Cloud, on-premise, or hybrid? Which cloud provider? Constraints?)

#### Step 2: Integration Requirements (Technical Details)

**Goal:** Define technical integration specifications.

**Questions to answer:**

- 2.1: What are the integration points? (Systems, APIs/protocols, patterns, data formats)
- 2.2: What are the integration requirements? (Authentication, error handling, retry/timeout, rate limiting)
- 2.3: What are the API standards? (RESTful guidelines, request/response formats, HTTP status codes, versioning, endpoint naming, auth patterns, error response structure, documentation format, rate limiting and pagination)

#### Step 3: Data Requirements (Technical Details)

**Goal:** Define technical data specifications.

**Questions to answer:**

- 3.1: What are the data sources? (Where, formats, volumes, growth rate)
- 3.2: What are the data storage requirements? (Database types, retention, backup, archival)
- 3.3: What are the data privacy/security requirements? (Encryption, standards, masking, access controls)
- 3.4: What are the database standards? (Table/column naming, PK/FK naming, index naming, migration file naming, seed data standards, documentation standards, query complexity guidelines)

#### Step 4: Performance Requirements (Technical Specifications)

**Goal:** Define technical performance specifications.

**Questions to answer:**

- 4.1: What are the performance requirements? (Response time, throughput, concurrent users, peak load)
- 4.2: What are the scalability requirements? (Expected growth, scaling strategy, SLAs)

#### Step 5: Security Requirements (Technical Specifications)

**Goal:** Define technical security specifications.

**Questions to answer:**

- 5.1: What are the authentication requirements? (Methods, password policies, session management, MFA)
- 5.2: What are the authorization requirements? (Model, permissions, roles)
- 5.3: What are the security standards? (OWASP, ISO, encryption, audits)

#### Step 6: Availability and Reliability Requirements

**Goal:** Define technical availability specifications.

**Questions to answer:**

- 6.1: What are the availability requirements? (Uptime SLAs, maintenance windows, DR, RTO, RPO)
- 6.2: What are the reliability requirements? (Redundancy, failover, monitoring, alerting)

#### Step 7: Technology Constraints and Assumptions

**Goal:** Document technical limitations and assumptions.

**Questions to answer:**

- 7.1: What are the technology constraints? (Must-use, cannot-use, version constraints, platform constraints)
- 7.2: What are the technical assumptions? (Infrastructure, dependencies, future changes)

#### Step 8: Dependencies and Risks (Technical)

**Goal:** Identify technical dependencies and risks.

**Questions to answer:**

- 8.1: What are the technical dependencies? (Libraries/frameworks, external services/APIs, infrastructure, version dependencies)
- 8.2: What are the technical risks? (Technical, performance, security, integration risks; mitigation strategies)

#### Step 9: Development and Deployment Environment

**Goal:** Define development and deployment requirements.

**Questions to answer:**

- 9.1: Development environment requirements? (Tools, local dev, testing environment)
- 9.2: Deployment requirements? (Environments, processes, rollback)
- 9.3: Version control standards? (Branch naming, commit message format)
- 9.4: Configuration management standards? (Environment variables, config file formats, secrets management, environment-specific configs, feature flags)

#### Step 10: Monitoring and Observability

**Goal:** Define monitoring and logging requirements.

**Questions to answer:**

- 10.1: Monitoring requirements? (Metrics, alerting thresholds, tools)
- 10.2: Logging requirements? (What to log, retention, levels, format, standards)

#### Step 11: CI/CD Requirements

**Goal:** Define continuous integration and deployment requirements.

**Questions to answer:**

- 11.1: CI/CD requirements? (Tools, build requirements, test automation, deployment automation)

### Handling Skipped Questions

- If you say "skip this question" → AI tracks it and asks again after Step 11
- If you say "this is not a valid question" or "out of scope" → Treated as a valid answer, not asked again

### Version Control

After scaffolding and after each step, AI prompts to commit:

- Commit messages follow format: "Step X requirements" or "Step X-Y requirements"
- Commit frequently to avoid losing work

---

## Scaffolding Approach - Structure Before Content

### Why Scaffolding First for Solution Design?

- **Control:** Negotiate structure before investing in detailed design
- **Verification:** Ensure all required components are included before creating content
- **Prevents AI Overreach:** AI doesn't generate designs for features not in requirements
- **Quality:** Each design area gets proper attention
- **Consistency:** Ensures technology choices are consistent across documents
- **Traceability:** Structure can map to requirements for validation

### Scaffolding Process for Solution Design

```
1. AI Reads Requirements → 2. AI Summarizes Understanding → 3. You Verify/Correct
                                                                    ↓
4. Set Technology Constraints → 5. AI Proposes Structure → 6. You Negotiate/Refine
                                                                    ↓
7. Structure OK? → 8. AI Creates File Structure and Headers ONLY → 9. Review Structure
      ↓ No                                                              ↓
      ← Back to Step 6                                          10. Proceed to Content
```

### Example Scaffolding Prompt

```
"Now that we've confirmed the requirements understanding and set the technology 
constraints (Java 21, Spring Boot 3.x, React 18, PostgreSQL 16, Azure), we have 
enough information to create the scaffolding for the solution design documents.

Propose the structure of documents we'll need. Show me:
- What files should we create?
- What are the major section headers in each file?
- What is the recommended order for completing them?

Show structure and headers ONLY, do not create content yet."
```

### What Good Solution Design Scaffolding Looks Like

```
docs/solution-design/
├── README.md (Document Index + Document Relationships)
├── 01-solution-overview.md
├── 02-technology-stack.md
├── 03-solution-architecture.md
├── 04-frontend-design.md
├── 05-backend-design.md
├── 06-database-design.md
├── 07-api-design.md
├── 08-integration-design.md
├── 09-security-design.md
├── 10-workflow-business-rules.md
├── 11-dashboard-reporting-design.md
├── 12-deployment-devops.md
├── 13-observability-operations.md
├── 14-testing-strategy.md
├── 15-non-functional-requirements.md
├── 16-taxonomy-management-design.md (if applicable)
├── 17-risk-assessment.md
└── 18-glossary-acronyms.md
```

### Recommended Development Order

Complete solution design documents in this order for best results:

1. **Start:** Solution Overview (01)
2. **Technology Stack:** (02)
3. **Architecture:** (03)
4. **Database:** (06) - foundation for other designs
5. **Backend:** (05)
6. **API:** (07)
7. **Business Logic:** (10)
8. **Frontend:** (04)
9. **Security:** (09)
10. **Integration:** (08)
11. **Dashboards:** (11)
12. **Observability:** (13)
13. **Testing:** (14)
14. **Deployment:** (12)
15. **NFRs:** (15)
16. **Risk:** (17)
17. **Reference:** (18)

### When to Scaffold

**Recommended:** Immediately after confirming requirements understanding and setting technology constraints

**Before scaffolding, you should have:**

- AI has read and summarized the requirements correctly
- Technology constraints are defined (languages, frameworks, databases, infrastructure)
- High-level architecture approach is agreed upon

---

## Best Practices for Solution Design

### 1. Always Start with Requirements

**Principle:** Every solution design session should begin by loading requirements context.

**Do:**

```
"Read the requirements documents in docs/requirements/ and summarize:
1. What are we building?
2. Who are the users?
3. What are the key functional areas?
4. What are the non-functional requirements?"
```

**Don't:**

- Start designing without requirements context
- Assume AI remembers requirements from a previous session

### 2. Set Technology Constraints Early

**Principle:** Define technology constraints before AI proposes architecture.

**Do:**

- List specific versions: "Java 21, Spring Boot 3.5.9, React 18.2.0, PostgreSQL 16"
- State infrastructure: "Azure hosted, Azure Container Apps for compute"
- Include standards: "RFC 7807 for errors, OpenAPI for API documentation"
- Specify what NOT to use: "Do not use GraphQL, we're using REST APIs only"

**Don't:**

- Let AI choose technologies without constraints
- Say "use latest versions" (AI needs specific versions for consistency)

### 3. Design One Component at a Time

**Principle:** Chunk-by-chunk development produces better quality than broad requests.

**Do:**

```
"Now design the database schema for the Practitioner and Allocation entities."
```

**Don't:**

```
"Design the entire database for the application."
```

### 4. Verify Before Moving On

**Principle:** After completing each design section, verify and get confirmation before proceeding.

**Do:**

- Review each design section for completeness
- Check that design traces back to requirements
- Verify technology choices are consistent
- Get explicit confirmation before moving to next section

### 5. Keep Requirements Stable, Designs Changeable

**Principle:** If you discover a requirements gap during design, update requirements first.

**Do:**

- Document design decisions that may affect requirements
- Flag when requirements need clarification
- Keep requirements and solution design synchronized

**Don't:**

- Invent requirements during solution design
- Add features not in the requirements package

### 6. Document Decisions and Rationale

**Principle:** Record why decisions were made, not just what was decided.

**Do:**

```markdown
## Technology Stack

- **Database**: PostgreSQL 16
  - *Rationale*: Requirements specify relational data with complex relationships; 
    PostgreSQL provides strong ACID compliance and excellent JSON support for 
    flexible attributes. Azure managed service reduces operational overhead.
```

**Don't:**

- Just list technology choices without explanation
- Assume rationale is obvious

### 7. Commit Frequently

**Principle:** Protect your work with regular commits.

**Do:**

- Commit after scaffolding
- Commit after completing each major design section
- Use meaningful commit messages: "Solution design: database schema complete"

### 8. Cross-Reference Related Documents

**Principle:** Solution design documents should reference each other and requirements.

**Do:**

- Reference requirements: "Implements: FR3.1, FR3.2"
- Reference related design docs: "See 09-security-design.md for RBAC details"
- Maintain a document relationship map in README.md

### 9. Use Diagrams Where Appropriate

**Principle:** Visual representations enhance understanding.

**Do:**

- System context diagrams
- Entity relationship diagrams (ERD)
- Architecture diagrams
- Sequence diagrams for complex workflows
- Use Mermaid syntax for version-controllable diagrams

### 10. Start New Conversations for New Tasks

**Principle:** Prevent unwanted context carryover.

**Do:**

- Start fresh conversation when switching design areas significantly
- Start fresh conversation when switching from design to implementation

**Don't:**

- Continue a requirements conversation into solution design
- Mix frontend design and backend design in same conversation if getting confused

---

## Common Pitfalls and Solutions

### Pitfall 1: Designing Without Requirements Context

**Symptom:** AI generates designs that don't match business requirements.

**Solution:**

- Always have AI read requirements first
- Ask AI to summarize requirements before designing
- Verify understanding before proceeding

### Pitfall 2: Inconsistent Technology Choices

**Symptom:** Different documents specify different technologies or versions.

**Solution:**

- Define technology constraints in one place (Technology Stack document)
- Reference the Technology Stack document when designing other components
- Review all documents for consistency before finalizing

### Pitfall 3: Over-Engineering

**Symptom:** AI proposes complex architectures for simple requirements.

**Solution:**

- State complexity constraints: "This is an internal tool for ~100 users"
- Ask AI to justify complexity: "Is microservices necessary for these requirements?"
- Prefer simpler solutions that meet requirements

### Pitfall 4: Missing Traceability

**Symptom:** Designs can't be traced back to specific requirements.

**Solution:**

- Tag designs with requirement IDs: "Implements: FR3.1"
- Review each design element against requirements
- Flag designs that don't trace to requirements

### Pitfall 5: Designing UI in Requirements Phase (or Vice Versa)

**Symptom:** Requirements contain UI specifics, or solution design contains business rules.

**Solution:**

- Requirements = WHAT (stable business logic)
- Solution Design = HOW (changeable technical decisions)
- Move misplaced content to correct location

**Guideline:**

| **If it's about...** | **Put it in...** |
| --- | --- |
| What users can do | Requirements |
| What the screen looks like | Solution Design |
| Business calculation rules | Requirements |
| How calculations are implemented | Solution Design |
| What data is needed | Requirements |
| Database schema | Solution Design |

### Pitfall 6: Not Considering Operational Concerns

**Symptom:** Design works for development but not for production operations.

**Solution:**

- Include observability design (logging, monitoring, alerting)
- Include deployment design (CI/CD, rollback)
- Include error handling and recovery
- Consider how to troubleshoot issues in production

### Pitfall 7: Security as an Afterthought

**Symptom:** Security design is vague or missing implementation details.

**Solution:**

- Design security early in the process
- Be specific about authentication flows
- Define authorization rules precisely
- Document data protection measures

### Pitfall 8: Context Loss Across Sessions

**Symptom:** New sessions produce inconsistent designs.

**Solution:**

- At start of each session, have AI read existing solution design documents
- Verify AI understands previous decisions
- Commit frequently so documents are current
- Document decisions as you make them

### Pitfall 9: AI Generating Code During Design Phase

**Symptom:** AI includes code snippets when you only asked for design.

**Solution:**

- Be explicit: "Create the API design document. Do NOT write code."
- Start new conversations when switching to implementation
- If AI generates code, ask it to convert to design documentation

### Pitfall 10: Going Too Broad, Losing Detail

**Symptom:** AI generates high-level designs that lack implementation guidance.

**Solution:**

- Design one area at a time
- Ask for specific details: "What columns should the Allocation table have?"
- Request examples: "Show me an example API request/response for this endpoint"
- Verify completeness before moving on

---

## Prompt Templates and Examples

### Template 1: Starting Solution Design

```
We are going to create a solution design package for [PROJECT NAME].

First, please read the requirements documents in docs/requirements/ and summarize:
1. What is this project about?
2. Who are the main user types?
3. What are the key functional areas?
4. What are the non-functional requirements?

Once you've summarized, I'll verify the understanding before we proceed.
```

### Template 2: Setting Technology Constraints

```
For this solution design, we have the following technology constraints:

Frontend:
- React 18.2.0 with TypeScript
- React Router for routing
- TanStack Query for server state
- shadcn/ui + Tailwind CSS for UI
- Vite for build

Backend:
- Java 21
- Spring Boot 3.5.9
- Spring Data JPA
- Flyway for migrations

Database:
- PostgreSQL 16

Infrastructure:
- Azure hosted
- Azure Container Apps for compute
- Azure PostgreSQL for database
- Microsoft Entra ID for SSO

Standards:
- RFC 7807 for API errors
- OpenAPI/Swagger for API documentation
- WCAG 2.1 AA for accessibility

Please acknowledge these constraints before we proceed with architecture design.
```

### Template 3: Scaffolding Request

```
Based on the requirements and technology constraints, propose the scaffolding 
structure for the solution design package.

Show me:
- What files should we create (numbered list)?
- What are the major section headers in each file?
- What is the recommended order for completing them?
- How do the documents relate to each other?

Show me ONLY the structure and headers. Do NOT create content yet.
```

### Template 4: Creating a Specific Design Section

```
Now create the [SECTION NAME] section for [DOCUMENT NAME].

Requirements context:
- This section implements: [FR1.1, FR1.2, etc.]
- Key business rules: [List relevant rules]
- Constraints: [List relevant constraints]

Include:
- [Required element 1]
- [Required element 2]
- [Required element 3]

Do NOT include:
- [Exclusion 1]
- [Exclusion 2]
```

### Template 5: Database Design Request

```
Now design the database schema for [ENTITY/FEATURE AREA].

From the requirements, I understand we need:
- [Entity 1] with attributes [list]
- [Entity 2] with attributes [list]
- Relationship: [describe]

Following our database standards:
- PostgreSQL 16
- UUID primary keys with gen_random_uuid()
- snake_case naming
- Standard audit columns (created_at, updated_at, etc.)
- Status fields as text with CHECK constraints

Create:
- Table definitions with all columns
- Constraints and indexes
- ERD diagram (Mermaid format)

Do NOT create migration files yet - just the design documentation.
```

### Template 6: API Design Request

```
Now design the API endpoints for [FEATURE AREA].

Functional requirements:
- [FR X.X]: [Description]
- [FR X.Y]: [Description]

Following our API standards:
- RESTful conventions
- RFC 7807 error format
- Bearer token authentication
- RBAC authorization

For each endpoint, document:
- Method and path
- Request body (if applicable)
- Response body
- Query parameters (for lists)
- Authorization requirements
- Error responses

Do NOT write implementation code - just the API design documentation.
```

### Template 7: Security Design Request

```
Now design the security architecture.

Requirements context:
- Authentication: Microsoft Entra ID SSO
- User roles: [Administrator, Resource Manager, Delivery Manager, Practitioner]
- Permission requirements: [Reference relevant requirements]

Document:
- Authentication flow (how users authenticate)
- Authorization model (RBAC)
- Permission matrix (who can do what)
- Token handling
- Data security measures
- Audit logging requirements

Follow our technology constraints:
- Spring Security for backend
- MSAL for frontend
- Bearer tokens for API auth
```

### Template 8: Verification Prompt

```
Before we proceed to the next section, verify:

1. The [CURRENT SECTION] design correctly implements requirements [LIST]
2. Technology choices are consistent with our technology stack document
3. There are no conflicts with other design sections

Summarize:
- What requirements are addressed
- What design decisions were made
- What considerations were included

Let me verify before we move on.
```

### Template 9: Cross-Document Impact Check

```
I've made changes to [DOCUMENT/SECTION]:
[Describe changes]

Review all other solution design documents and identify:
1. What sections reference or depend on this design?
2. What needs to be updated for consistency?
3. Are there any conflicts introduced?

List all affected sections before making updates.
```

---

## Quick Reference Checklist

### Before Starting Solution Design

- [ ] Requirements Package is complete
- [ ] Requirements have been reviewed and approved
- [ ] New conversation started (fresh context)
- [ ] Technology constraints are defined

### Solution Design Kickoff

- [ ] AI has read requirements documents
- [ ] AI summary of requirements is verified
- [ ] Technology constraints communicated to AI
- [ ] Scaffolding structure proposed and approved
- [ ] File structure and headers created (no content yet)
- [ ] Scaffolding committed to version control

### For Each Design Section

- [ ] AI understands the relevant requirements
- [ ] Technology constraints are consistent
- [ ] Section content created
- [ ] Traceable to requirements (FR references)
- [ ] Reviewed for completeness
- [ ] Cross-references to related documents added
- [ ] Committed to version control

### Solution Design Components Checklist

- [ ] Solution Overview
- [ ] Technology Stack
- [ ] Solution Architecture
- [ ] Frontend Design
- [ ] Backend Design
- [ ] Database Design
- [ ] API Design
- [ ] Integration Design
- [ ] Security Design
- [ ] Workflow/Business Rules Design
- [ ] Dashboard/Reporting Design
- [ ] Deployment/DevOps
- [ ] Observability/Operations
- [ ] Testing Strategy
- [ ] Non-Functional Requirements
- [ ] Risk Assessment
- [ ] Glossary/Acronyms

### Solution Requirements Gathering Checklist

- [ ] Step 1: Architecture and Technology Stack
- [ ] Step 2: Integration Requirements
- [ ] Step 3: Data Requirements
- [ ] Step 4: Performance Requirements
- [ ] Step 5: Security Requirements
- [ ] Step 6: Availability and Reliability
- [ ] Step 7: Constraints and Assumptions
- [ ] Step 8: Dependencies and Risks
- [ ] Step 9: Development and Deployment
- [ ] Step 10: Monitoring and Observability
- [ ] Step 11: CI/CD Requirements
- [ ] All skipped questions revisited

### Final Verification

- [ ] All design documents complete
- [ ] Consistent technology choices across all documents
- [ ] All designs traceable to requirements
- [ ] No conflicting designs
- [ ] Cross-references verified
- [ ] Document relationships documented
- [ ] Committed to version control
- [ ] Ready for Code Creation phase

---

## Change Tracking for Solution Design Documentation

> **Common Structure:** See `../_shared/templates/change-tracker-template.md` for the universal Change Tracker file structure, versioning convention, and change types.

### Applicability

The Solution Design Package is a **forward engineering** deliverable — it creates technical specifications rather than extracting from existing source code. Change tracking for the Solution Design Package follows the same template structure but with different Parts Affected values.

### Parts Affected Values

When logging changes to solution design documentation in the Change Tracker, use the following values in the "Parts Affected" column:

| Value | Meaning |
| --- | --- |
| Architecture | Solution overview, C4 diagrams, technology stack |
| Frontend Design | Routing, state management, component structure, UI/UX |
| Backend Design | Layered architecture, domain model, API conventions |
| API Design | Endpoint specifications, request/response schemas |
| Database Design | Table definitions, ERD, migration strategy |
| Security Design | Authentication, authorization, data security |
| Integration Design | External service integration, workflows, state machines |
| Infrastructure | Deployment, DevOps, observability, environments |
| Testing Strategy | Test pyramid, environments, data management |
| NFR Specs | Non-functional requirement technical specifications |
| Multiple | When more than two components are affected, list them |

### When to Track Changes

- After each solution design session
- When architecture decisions change
- When technology stack is modified
- When requirements changes cascade into design changes
- When design review feedback is incorporated
- When API contracts are updated

---

## Key Takeaways

- **Solution Design bridges Requirements and Code** — it's the technical blueprint that translates WHAT into HOW
- **Always start with requirements context** — AI needs to understand what's being built before designing how
- **Technology constraints must be explicit** — AI won't guess your tech stack correctly; tell it exactly what to use
- **Scaffolding before content** gives you control and ensures consistency across design documents
- **Chunk-by-chunk development** produces better quality than asking for everything at once
- **Traceability matters** — every design decision should reference the requirements it implements
- **Solution Design is changeable; Requirements are stable** — UI details, technology choices, and implementation patterns belong here, not in requirements
- **Documentation is persistent memory** — AI forgets between sessions; your documents remember
- **Verify constantly** — always confirm AI understands before proceeding to the next section
- **Commit frequently** — protect your work and maintain version history

---

## Additional Resources

- **Solution Requirements Gathering Guide:** `Learning/future state/playbook/Solution-Requirements-Gathering-Guide.md`
- **AI-Assisted Development Playbook:** `Learning/future state/playbook/AI-Assisted-Coding-Playbook.md`
- **Requirements Info Dump:** `Learning/crash course contents/Create-Requirements-Package-Info-Dump.md`
- **Example Solution Design:** `docs/solution-design/` folder
- **AI-SDLC Best Practices:** `Learning/crash course contents/AI-SDLC-Best-Practices-Info-Dump.md`
- **Change Tracker Template:** `../_shared/templates/change-tracker-template.md`
