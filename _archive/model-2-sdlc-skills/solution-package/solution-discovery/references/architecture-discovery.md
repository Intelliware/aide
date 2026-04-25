# Architecture Discovery

## Purpose

Read and interpret an existing codebase at the architectural level to understand the system's structural design before proposing changes to it. Distinct from the BSA's codebase-discovery (which maps business capabilities and user-facing behavior) and the developer's codebase-analysis (which maps file structure, coding patterns, and test infrastructure). The architect's architecture discovery focuses on: project layout and module boundaries as component topology, dependency injection and service wiring as coupling indicators, framework conventions and middleware pipelines as architectural patterns, infrastructure-as-code and deployment manifests as deployment topology, database connection configuration and ORM setup as data-layer architecture, message broker and event bus configuration as integration patterns, authentication and authorization middleware as security architecture, and environment configuration and secrets management as operational boundaries. Produces raw architectural observations that feed into existing-architecture-assessment, which synthesizes them with all other discovery outputs into the single architecture-baseline document. Essential for brownfield projects where the architect must derive architectural constraints from the live codebase rather than from up-to-date documentation.

## What This Is

The AI reads the existing codebase and extracts its structural design — how the system is built, how its parts connect, what technology it uses, and what constraints the existing architecture imposes on any proposed change.

This is the architect's codebase read. It is distinct from:
- The BSA's **codebase-discovery**, which reads the same code but translates it into business capabilities for a non-technical audience
- The developer's **codebase-analysis**, which maps file structure, coding patterns, and test infrastructure for implementation planning

Architecture discovery answers: **"What is the structural reality of this system that any design change must operate within?"**

The output is raw architectural observations — not a polished baseline document. The synthesis happens in the next step (`existing-architecture-assessment`), which merges these observations with the technical debt assessment and the BSA's requirements package into a single architecture-baseline document.

## When to Use

- A feature request has arrived for an existing system and the architect needs to understand the current architecture before designing changes
- The existing system's architecture documentation is absent, incomplete, or potentially stale
- The architect needs to identify architectural constraints that the proposed change must respect

## Scope

The AI reads the codebase **scoped to the areas the proposed change will touch** — plus enough of the surrounding architecture to understand the constraints. This is not a full system audit.

Scope is determined by the BSA's requirements package:
- The **change scope** identifies which functional areas are affected
- The **functional requirements** identify what capabilities are being added or modified
- The **data requirements** identify which data entities are involved
- The **integration points** mentioned in requirements identify which external connections matter

### Scope Expansion

Initial scope is a starting estimate. The AI must expand scope when reading reveals that a component outside the initial area:
- **Is a shared dependency** used by components in scope (e.g., a common service layer, a shared data access module)
- **Enforces an architectural constraint** on components in scope (e.g., a middleware pipeline that all requests pass through, a transaction boundary that spans the change area)
- **Shares data stores** with components in scope (e.g., writes to the same database tables, reads from the same cache)

When scope expands, the AI documents the expansion explicitly in the output. Scope expansion stops when the AI reaches components with no shared dependencies, constraints, or data with the change area.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Requirements package | BSA handoff — `docs/<feature>/requirements-package/requirements-package.md`. Specifically: change scope (`docs/<feature>/requirements-package/analysis/change-scope.md`), functional requirements (`docs/<feature>/requirements-package/requirements/functional-requirements.md`), data requirements (`docs/<feature>/requirements-package/requirements/data-requirements.md`) | Yes — determines what areas of the codebase to scan. If the requirements package has gaps that prevent scoping the scan, the architect raises them with the BSA before proceeding. |
| Access to the codebase | Local filesystem or repository | Yes |

> **Missing input guard:** If a required input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[full path]` but it was not found. This input is required for this skill. Should I proceed without it, or can you provide it?"*

## What the AI Reads

The AI reads the following categories of technical artifacts. Each category maps to a section of the architecture-baseline template that the synthesis step will populate.

### Category 1: Component Topology

**What to look for:**
- Project root structure — top-level directories and modules that reveal how the system is decomposed
- Module or package boundaries — what constitutes a distinct component (a service, a module, a bounded context)
- Entry points — where requests enter the system (HTTP servers, message consumers, scheduled job runners, CLI commands)
- Inter-component communication — how components call each other (direct function calls, HTTP, gRPC, message queues, event buses, shared databases)
- Dependency direction — which components depend on which, and whether dependencies flow in one direction or form cycles

**What to record:**
- A component map: each distinct component, its responsibility, and what it communicates with
- The communication pattern between each pair of connected components (synchronous vs. asynchronous, protocol used)
- Coupling indicators: shared libraries, shared data access, circular dependencies, tightly coupled modules

### Category 2: Tech Stack and Frameworks

**What to look for:**
- Language and runtime versions — from configuration files (package.json, pom.xml, build.gradle, Gemfile, requirements.txt, go.mod, etc.)
- Framework and library versions — both core frameworks and significant libraries
- Build tooling — build systems, bundlers, transpilers, code generators
- Package managers and dependency resolution approach

**What to record:**
- Every significant technology with its version as observed in the codebase
- Framework conventions the codebase follows (e.g., Next.js App Router vs. Pages Router, Spring Boot with annotations vs. XML configuration, NestJS module pattern)
- Any technology that appears outdated or at end-of-life — note the current version and the latest stable version

### Category 3: Deployment Topology

**What to look for:**
- Infrastructure-as-code files — Terraform, CloudFormation, Pulumi, CDK, Helm charts, Kubernetes manifests
- Container configuration — Dockerfiles, docker-compose files, container registry references
- CI/CD pipeline definitions — GitHub Actions, GitLab CI, Jenkins, CircleCI, Azure DevOps pipelines
- Environment configuration — how environments are defined (dev, staging, production), environment variable management, configuration file structure
- Health check and readiness probe definitions
- Scaling configuration — auto-scaling rules, replica counts, resource limits

**What to record:**
- Where and how the application is deployed (cloud provider, container workflow, serverless, bare metal)
- How many environments exist and how they differ
- The deployment pipeline: what happens from code commit to production
- Infrastructure constraints that affect the design (e.g., single-region deployment, specific cloud services in use, network boundaries)

### Category 4: Data Architecture

**What to look for:**
- Database connection configuration — which databases are used, how connections are managed (connection pooling, read replicas)
- ORM or data access layer setup — what abstraction sits between the application and the database
- Schema definitions — migration files, schema files, entity definitions that reveal the data model at the architectural level
- Caching layers — what is cached, where (in-memory, Redis, CDN), cache invalidation approach
- Data flow between components — which components read from and write to which data stores

**What to record:**
- Each data store: type (relational, document, key-value, search, file), purpose, which components access it
- The data access pattern: direct SQL, ORM, repository pattern, CQRS, event sourcing
- Schema management approach: migration tool, migration history, schema versioning
- Caching architecture: what caching layers exist, what they cache, how they are invalidated

### Category 5: Integration Points

**What to look for:**
- External API clients — HTTP clients, SDK usage, API keys, webhook handlers
- Message broker configuration — RabbitMQ, Kafka, SQS, NATS connections, topic/queue definitions, consumer/producer setup
- Event bus or event-driven patterns — internal event publishing and subscribing
- Scheduled jobs and background workers — cron jobs, job queues, worker processes
- File-based integrations — SFTP, S3, shared file systems

**What to record:**
- Each external system the application integrates with: what it is, what protocol is used (REST, GraphQL, gRPC, AMQP, etc.), whether the integration is synchronous or asynchronous
- Message/event patterns: topic naming conventions, message formats, consumer group patterns, dead-letter queue configuration
- Retry and error handling for integrations: circuit breakers, retry policies, timeout configuration, fallback behavior

### Category 6: Security Architecture

**What to look for:**
- Authentication middleware — how users are identified (session-based, JWT, OAuth2, SAML, API keys)
- Authorization model — how permissions are enforced (role-based, attribute-based, policy-based), where authorization checks happen (middleware, service layer, data layer)
- Trust boundaries — where authenticated vs. unauthenticated zones exist, internal vs. external API boundaries
- Secrets management — how secrets are stored and accessed (environment variables, vault, cloud secrets manager)
- Encryption configuration — data at rest, data in transit, field-level encryption
- Security headers and CORS configuration
- Audit logging — what security-relevant events are recorded

**What to record:**
- The authentication flow: how a user proves their identity and how that identity propagates through the system
- The authorization model: how the system decides whether a user can perform an action
- Trust boundaries: which components are inside vs. outside the trust boundary, and how the boundary is enforced
- Secrets management approach and any constraints it imposes

### Category 7: Performance and Operational Characteristics

**What to look for:**
- Logging configuration — what logging framework, what levels, structured vs. unstructured, where logs are sent
- Monitoring and metrics — what metrics are collected, what monitoring tools are configured (Prometheus, Datadog, New Relic, CloudWatch)
- Alerting configuration — what conditions trigger alerts
- Distributed tracing — whether tracing is configured, what tool (Jaeger, Zipkin, OpenTelemetry)
- Rate limiting or throttling configuration
- Resource-intensive operations — batch processing, report generation, large data queries

**What to record:**
- The observability stack: logging, metrics, tracing, alerting — what exists and what is missing
- Known performance-relevant architecture decisions (e.g., synchronous processing of large payloads, N+1 query patterns visible in data access code, unbounded queries)
- Scaling constraints visible in the architecture (e.g., single-threaded event loop, stateful sessions, shared mutable state)

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  1. SCOPE — Determine reading boundaries                         │
│     Read the requirements package change scope, functional       │
│     requirements, and data requirements. Identify which          │
│     areas of the codebase to scan. Start from the entry          │
│     points and components that the proposed change will touch.   │
├──────────────────────────────────────────────────────────────────┤
│  2. TOPOLOGY — Map component structure                           │
│     Read project layout, module boundaries, and entry points.    │
│     Build the component map. Identify inter-component            │
│     communication patterns and dependency direction.             │
├──────────────────────────────────────────────────────────────────┤
│  3. STACK — Identify technologies and versions                   │
│     Read dependency files, framework configuration, and build    │
│     tooling. Record every significant technology with its        │
│     version. Note framework conventions the codebase follows.    │
├──────────────────────────────────────────────────────────────────┤
│  4. DEPLOYMENT — Map infrastructure and pipeline                 │
│     Read IaC files, container configuration, CI/CD pipelines,    │
│     and environment configuration. Record deployment topology    │
│     and infrastructure constraints.                              │
├──────────────────────────────────────────────────────────────────┤
│  5. DATA — Map data stores and access patterns                   │
│     Read database configuration, ORM setup, migration files,     │
│     caching configuration. Record each data store, access        │
│     pattern, and data flow between components.                   │
├──────────────────────────────────────────────────────────────────┤
│  6. INTEGRATIONS — Map external connections                      │
│     Read API clients, message broker configuration, event bus    │
│     setup, scheduled jobs. Record each integration with its      │
│     protocol, sync/async nature, and error handling approach.    │
├──────────────────────────────────────────────────────────────────┤
│  7. SECURITY — Map authentication, authorization, trust          │
│     Read auth middleware, permission checks, secrets management, │
│     encryption configuration. Record the auth flow,              │
│     authorization model, and trust boundaries.                   │
├──────────────────────────────────────────────────────────────────┤
│  8. OPERATIONS — Map observability and performance               │
│     Read logging, monitoring, tracing, and alerting              │
│     configuration. Note performance-relevant patterns and        │
│     scaling constraints.                                         │
├──────────────────────────────────────────────────────────────────┤
│  9. CONSTRAINTS — Identify architectural constraints             │
│     From all observations, extract constraints the proposed      │
│     change must operate within — framework limitations,          │
│     deployment boundaries, data-layer restrictions, integration  │
│     pattern commitments, security model boundaries.              │
├──────────────────────────────────────────────────────────────────┤
│  10. ASSEMBLE — Write the raw observations document              │
│      Produce the structured observations. Write the file to      │
│      disk. Present to the user for review.                       │
└──────────────────────────────────────────────────────────────────┘
```

### File Output

Write the completed observations to `docs/<feature>/solutions-package/discovery/architecture-discovery-observations.md`.

Create the `docs/<feature>/solutions-package/discovery/` directory if it does not exist.

## Handling Uncertainty

Not everything in a codebase is unambiguous at the architectural level. When the AI cannot determine the architectural significance of something with confidence, it assigns a confidence level:

- **Observed** — directly visible in the codebase with clear evidence (e.g., a Dockerfile explicitly using PostgreSQL 15, a Kafka consumer configuration with specific topic names)
- **Inferred** — derived from indirect evidence (e.g., a connection string referencing a host named `redis-cache` suggests a Redis caching layer, but the AI did not find explicit Redis client configuration)
- **Unknown** — cannot be determined from the codebase (e.g., the deployment target is configured via CI/CD variables not visible in the repository)

Unknown items must be recorded as open questions. They are never stated as architectural facts.

## Output — Raw Architectural Observations

The AI produces a structured document organized by the seven categories above. Each category contains:

### Per-Category Structure

**What was observed** — factual statements about what the codebase reveals, with evidence references (file paths or patterns observed). Written at the architectural level — not code-level detail, but not so abstract that it loses precision.

**Confidence** — Observed / Inferred / Unknown for each significant finding.

**Architectural implications for the proposed change** — what each observation means for the feature being designed. This is where the architect's lens applies: not just "PostgreSQL 15 is used" but "the data layer uses PostgreSQL 15 with Prisma ORM and migration-based schema management — any new tables or schema changes must go through the migration pipeline."

**Open questions** — things the codebase cannot answer that will need to be resolved before or during design.

### Summary Section

After all categories, a summary section containing:

**Component map** — a concise list of all components identified, their responsibilities, and their connections.

**Scope expansion record** — what areas were added to scope beyond the initial reading boundaries, and why.

**Constraints register** — a consolidated list of every architectural constraint identified, cross-referenced to the category where it was found. These are the non-negotiable boundaries the design must respect.

**Open questions register** — a consolidated list of all open questions across categories, each with enough context that the user or a subject matter expert can answer it without re-reading the codebase.

## Output File

The completed observations are written to **`docs/<feature>/solutions-package/discovery/architecture-discovery-observations.md`** in the project repository. If the directory does not exist, it is created.

This document feeds into: **`technical-debt-assessment`** (next step) and **`existing-architecture-assessment`** (synthesis step). Its completeness directly affects the quality of the architecture baseline.

---

## Hand-off Gate

Before proceeding to `technical-debt-assessment`, you must:

1. Write the completed architectural observations in full — not a summary, the full populated document with all seven categories.
2. Write the document to `docs/<feature>/solutions-package/discovery/architecture-discovery-observations.md`. The file write must succeed before proceeding.
3. Present the observations to the user.
4. Ask explicitly: **"Do these architectural observations match your understanding of the system? Are there architectural aspects — components, integrations, data stores, security mechanisms, or deployment patterns — that are missing or described incorrectly?"**
5. If the user identifies corrections or additions, update the observations, overwrite the file, and re-present before proceeding.
6. Do not interpret silence, a "thank you," or general acknowledgement as acceptance. Wait for an explicit confirmation before proceeding to `technical-debt-assessment`.

## Completion Criteria

- [ ] The scan is scoped to the areas identified in the requirements package change scope — not a full system audit
- [ ] Component topology is mapped: every component in the affected area is identified with its responsibility, communication patterns, and dependencies
- [ ] Tech stack is documented with observed versions for every significant technology
- [ ] Deployment topology is mapped: how and where the application is deployed, environment structure, and CI/CD pipeline
- [ ] Data architecture is mapped: every data store in the affected area, access patterns, caching layers, and schema management approach
- [ ] Integration points are mapped: every external system connection in the affected area with protocol, sync/async nature, and error handling
- [ ] Security architecture is mapped: authentication flow, authorization model, trust boundaries, and secrets management
- [ ] Observability and performance characteristics are documented
- [ ] Architectural constraints the proposed change must operate within are explicitly listed in the constraints register
- [ ] Every significant finding has a confidence level (Observed / Inferred / Unknown)
- [ ] All Unknown items have a corresponding open question
- [ ] Scope expansions are documented with rationale
- [ ] The observations document is written to `docs/<feature>/solutions-package/discovery/architecture-discovery-observations.md` and the file write has succeeded
- [ ] The user has explicitly confirmed the observations are accurate enough to proceed

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Design decisions made against assumed or documented architecture that doesn't match reality | The AI reads the actual codebase — the architect designs against what is actually built |
| Architect misses a shared dependency that the proposed change will break | Scope expansion follows shared dependencies, data stores, and constraint enforcement beyond the initial area |
| Design proposes a technology the existing system already uses differently | Tech stack observations record actual versions and framework conventions |
| Design proposes an integration pattern incompatible with the existing approach | Integration point observations record the established patterns (sync/async, protocol, error handling) |
| Design proposes a security model that conflicts with the existing authentication/authorization architecture | Security observations record the actual auth flow, authorization model, and trust boundaries |
| Design ignores deployment constraints (e.g., single-region, specific cloud services, pipeline limitations) | Deployment topology observations record infrastructure constraints |
| Design introduces a new data store without understanding the existing data architecture | Data architecture observations record all data stores, access patterns, and caching layers in the affected area |
| Architectural unknowns are silently resolved by the AI rather than surfaced | Unknown items are explicitly recorded as open questions for human resolution |
