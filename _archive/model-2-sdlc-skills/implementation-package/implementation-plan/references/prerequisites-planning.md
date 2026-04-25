# Prerequisites Planning

## Purpose

Plan all prerequisites that must be in place before feature code can be written, covering three concerns in a single skill: (1) dependency planning — new libraries to add, existing libraries to upgrade, version compatibility with existing dependencies and the project's language/framework version, license compatibility, bundle-size impact, redundancy checks against existing dependencies, and transitive dependency risks (vulnerabilities, conflicts, unmaintained transitives); (2) environment setup planning — new environment variables and secrets, new service dependencies (databases, message brokers, external APIs needing local stubs or sandbox accounts), database migration scripts and seed data for local development, local development setup changes (docker-compose, build steps, tooling versions), CI/CD pipeline modifications, and infrastructure provisioning that must happen before feature code can deploy; (3) configuration planning — feature flag setup, environment variable additions, config file changes, environment-specific settings, and deployment ordering since config often deploys before or independently from code. Produces prerequisite tasks that are sequenced at the beginning of the implementation plan, before any feature code tasks. For brownfield projects, identifies which prerequisites are additions vs. modifications of existing setup and verifies that additions don't conflict with existing configuration. The planning-phase complement to the dependency-manager and feature-flag-implementation skills in implementation/coding, which execute the plans.

## What This Produces

A concrete list of everything that must be in place before feature code can be written or deployed — new dependencies to install, environment changes to make, configuration to add, and infrastructure to provision. These become the first tasks in the implementation plan, sequenced before any feature code.

This is the developer's pre-flight checklist. Discovering a missing dependency, an unconfigured environment variable, or a missing infrastructure resource mid-implementation forces context switches and blocks progress. Planning prerequisites upfront prevents those interruptions.

## When to Use

- Step 3 of implementation planning — runs after `test-planning` and before `delivery-planning`
- Consumes the codebase analysis (dependency map, tooling conventions) and the solution design (technology stack, deployment strategy)
- Even if the feature requires no new dependencies or environment changes, this skill should run to explicitly confirm that — a deliberate "no prerequisites needed" is better than an implicit assumption

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Codebase analysis | `docs/<feature>/implementation-package/plan/codebase-analysis.md` — Section 4 (Code Dependencies: internal modules, external packages with versions) and Section 6 (Conventions: tooling, package manager, build tool) | Yes |
| Solution design — technology stack | `docs/<feature>/solutions-package/design/02-technology-stack.md` — all pinned versions, new technologies introduced for this feature, explicit exclusions | Yes |
| Solution design — system design | `docs/<feature>/solutions-package/design/03-system-design.md` — new components that may need new infrastructure or service dependencies | Yes |
| Solution design — data model design | `docs/<feature>/solutions-package/design/06-data-model-design.md` — migrations, new tables, schema changes requiring migration tooling | If data model changes |
| Solution design — backend design | `docs/<feature>/solutions-package/design/05-backend-design.md` — new services, background jobs, queue consumers needing infrastructure | If backend changes |
| Solution design — integration design | `docs/<feature>/solutions-package/design/08-integration-design.md` — new external API dependencies needing sandbox accounts or local stubs | If integrations change |
| Solution design — deployment strategy | `docs/<feature>/solutions-package/design/12-deployment-strategy.md` — CI/CD changes, environment promotion, feature flag approach | Yes |
| Requirements package — assumptions/constraints/scope | `docs/<feature>/requirements-package/requirements/assumptions-constraints-scope.md` — technology constraints, deployment constraints, compliance requirements | Yes |
| Access to the codebase | Local filesystem — package.json, requirements.txt, Gemfile, build.gradle, Dockerfile, docker-compose.yml, CI/CD configs, .env files, config files | Yes — the AI reads actual dependency and config files |

> **Missing input guard:** If the solution package cannot be found at `docs/<feature>/solutions-package/solution-package.md`, do not proceed. Ask the user to provide the location of the solution design package before beginning prerequisites planning.

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  PREREQUISITES PLANNING — INTERNAL SEQUENCE                       │
├──────────────────────────────────────────────────────────────────┤
│  1. LOAD — Read all inputs                                       │
│     Read codebase analysis (dependencies, tooling),              │
│     solution design (technology stack, deployment strategy),      │
│     requirements (constraints).                                   │
├──────────────────────────────────────────────────────────────────┤
│  2. DEPENDENCIES — Plan dependency changes                       │
│     New packages to add, existing packages to upgrade,           │
│     version compatibility, license check, redundancy check,      │
│     transitive dependency risks, bundle-size impact.             │
├──────────────────────────────────────────────────────────────────┤
│  3. ENVIRONMENT — Plan environment setup changes                 │
│     New environment variables and secrets, new service            │
│     dependencies, local development setup changes,               │
│     CI/CD pipeline modifications, infrastructure provisioning.   │
├──────────────────────────────────────────────────────────────────┤
│  4. CONFIGURATION — Plan configuration changes                   │
│     Feature flags, config file changes,                          │
│     environment-specific settings, deployment ordering.          │
├──────────────────────────────────────────────────────────────────┤
│  5. SEQUENCING — Order prerequisites                             │
│     Determine the correct execution order. Some prerequisites    │
│     depend on others. Infrastructure before config,              │
│     config before code.                                          │
├──────────────────────────────────────────────────────────────────┤
│  6. VALIDATE — Check completeness and conflicts                  │
│     Every new technology in the solution design has a             │
│     corresponding prerequisite. No conflicts with existing       │
│     setup. No missing infrastructure.                            │
├──────────────────────────────────────────────────────────────────┤
│  7. ASSEMBLE — Write the prerequisites plan                      │
│     Produce the structured output. Present for review.           │
└──────────────────────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Load Inputs

Read all inputs. If the codebase analysis and test plan are not yet complete, stop — this skill depends on both.

From the **codebase analysis** (Section 4 — Code Dependencies), note:
- External packages already in use with their versions
- Package manager and lock file (npm/pnpm/yarn with lock, pip with requirements.txt, etc.)
- Build tool and configuration

From the **solution design — technology stack** (Section 2), note:
- New technologies introduced for this feature (libraries, frameworks, tools)
- Version constraints and pinning
- Explicit exclusions (technologies NOT to use)

From the **solution design — deployment strategy** (Section 12), note:
- CI/CD pipeline changes needed
- Feature flag approach
- Environment promotion flow
- Infrastructure provisioning needed

### Step 2 — Plan Dependency Changes

Read the project's dependency files (package.json, requirements.txt, Gemfile, build.gradle, Cargo.toml, go.mod, pubspec.yaml, Package.swift, etc.) and compare against the solution design's technology stack.

**Step 2a — New dependencies to add.**

For each new dependency the solution design introduces, evaluate it before committing. Do not add a dependency without understanding its health — an unmaintained or poorly documented package creates long-term risk even if it solves the immediate problem.

| Package | Version | Purpose | Manager | License | Bundle Impact |
|---------|---------|---------|---------|---------|--------------|
| *(e.g., @nestjs/bull)* | *(^10.0.0)* | *(Queue processing for async refund jobs)* | *(npm)* | *(MIT)* | *(+45KB gzipped)* |
| *(e.g., ioredis)* | *(^5.3.0)* | *(Redis client for Bull queue backend)* | *(npm)* | *(MIT)* | *(+120KB gzipped)* |

**Dependency health evaluation.** For each new dependency, assess health signals before adding it to the plan. Flag any dependency that scores poorly — it may need a "research task" to find an alternative before implementation begins.

| Signal | What to check | Red flag |
|--------|--------------|----------|
| **Maintenance activity** | Last release date, commit frequency, open PRs | No release in 12+ months; hundreds of unanswered issues |
| **Documentation quality** | README, API docs, migration guides | No usage examples; undocumented breaking changes between versions |
| **Adoption** | Weekly downloads / stars, used-by count | Very low adoption for a general-purpose library |
| **Transitive weight** | Number of transitive dependencies pulled in | Package pulls in 100+ transitive dependencies for a simple task |
| **Type support** | Built-in types, DefinitelyTyped, or none | No TypeScript types available (for TypeScript projects) |

If a dependency scores poorly on multiple signals, flag it as **NEEDS CLARIFICATION** — the user should decide whether to adopt it, find an alternative, or build the functionality in-house. Do not silently include a risky dependency in the plan.

**Step 2b — Existing dependencies to upgrade.**

If the solution design requires a newer version of an existing dependency:

| Package | Current Version | Required Version | Reason | Breaking Changes? |
|---------|----------------|-----------------|--------|------------------|
| *(e.g., typeorm)* | *(0.3.17)* | *(0.3.20)* | *(Needed for new migration feature used in data model)* | *(No — patch upgrade)* |

**Step 2c — Version compatibility check.**

For each new or upgraded dependency, verify compatibility:

| Check | Status | Details |
|-------|--------|---------|
| **Language/runtime version** | *(e.g., Node 20.x — compatible)* | *(Package requires Node ≥ 18)* |
| **Framework version** | *(e.g., NestJS 10.x — compatible)* | *(Package is designed for NestJS 10)* |
| **Peer dependency conflicts** | *(None / Conflict with X)* | *(Check npm ls or pip check output)* |
| **Existing dependency overlap** | *(None / Overlaps with X)* | *(e.g., project already uses `bull` — `@nestjs/bull` wraps it; no conflict)* |

**Step 2d — Redundancy check.**

Does the project already have a dependency that does what the new one does?

| New Dependency | Existing Alternative | Redundant? | Resolution |
|---------------|---------------------|-----------|------------|
| *(e.g., axios)* | *(node-fetch already installed)* | *(Yes — both are HTTP clients)* | *(Use node-fetch to avoid two HTTP clients; or ask user which to standardize on)* |
| *(e.g., @nestjs/bull)* | *(No existing queue library)* | *(No)* | *(Proceed with addition)* |

**Step 2e — Transitive dependency risks.**

For each new dependency, check for known risks:

| Dependency | Transitive Risk | Severity | Mitigation |
|-----------|----------------|----------|------------|
| *(e.g., ioredis)* | *(No known vulnerabilities as of [date])* | *(None)* | *(N/A)* |
| *(e.g., some-package)* | *(Depends on unmaintained `leftpad@1.0.0`)* | *(Medium)* | *(Override transitive version or use alternative package)* |

**Step 2f — License compatibility.**

| Dependency | License | Compatible with Project? | Notes |
|-----------|---------|------------------------|-------|
| *(e.g., @nestjs/bull)* | *(MIT)* | *(Yes)* | |
| *(e.g., some-gpl-lib)* | *(GPL-3.0)* | *(No — project is proprietary)* | *(Find MIT/Apache alternative)* |

For each license incompatibility, flag it as a blocker and propose an alternative.

**Step 2g — Dev dependencies.**

New dev dependencies (test libraries, build tools, linters) that are needed:

| Package | Version | Purpose | Manager |
|---------|---------|---------|---------|
| *(e.g., @types/bull)* | *(^4.10.0)* | *(TypeScript types for Bull queue)* | *(npm — devDependencies)* |

### Step 3 — Plan Environment Setup Changes

Identify everything that must change in the development, CI/CD, and production environments before feature code can run.

**Step 3a — New environment variables and secrets.**

For every new environment variable, plan how the application validates it at startup. A missing or misconfigured variable should fail fast with a clear error message rather than silently using a wrong default and causing hard-to-diagnose bugs at runtime. Note the validation approach in the table.

| Variable | Purpose | Environments | Secret? | Default (Dev) | Source | Validation |
|----------|---------|-------------|---------|--------------|--------|------------|
| *(REDIS_URL)* | *(Connection string for Bull queue backend)* | *(All)* | *(Yes in prod, no in dev)* | *(redis://localhost:6379)* | *(Backend design — queue infrastructure)* | *(Required — fail startup if missing; validate URL format)* |
| *(REFUND_WEBHOOK_SECRET)* | *(HMAC secret for payment gateway refund webhooks)* | *(Staging, Prod)* | *(Yes)* | *(test-secret-do-not-use)* | *(Integration design — payment gateway)* | *(Required in staging/prod — fail startup; optional in dev with test default)* |
| *(FEATURE_REFUNDS_ENABLED)* | *(Feature flag for refund functionality)* | *(All)* | *(No)* | *(true)* | *(Deployment strategy — feature flag gating)* | *(Optional — defaults to false if unset)* |

**Fail-fast config validation.** If the project uses a configuration validation library (e.g., Zod schemas, joi, class-validator, Pydantic settings), plan to add the new environment variables to the validation schema. If no validation library exists, recommend adding one — or at minimum, add startup assertions that check for required variables and log a clear error message before the application crashes with an opaque connection error.

**Step 3b — New service dependencies.**

Services the feature depends on that must be running locally and in CI:

| Service | Purpose | Local Setup | CI Setup | Provisioning Needed |
|---------|---------|------------|---------|-------------------|
| *(Redis)* | *(Bull queue backend)* | *(Add to docker-compose.yml)* | *(Add Redis service to CI pipeline)* | *(Staging/prod: provision Redis instance)* |
| *(Payment gateway sandbox)* | *(Refund API integration)* | *(Use mock server locally)* | *(Configure sandbox credentials in CI secrets)* | *(Obtain sandbox API keys from payment provider)* |

**Step 3c — Local development setup changes.**

| Change | File | What to Modify |
|--------|------|---------------|
| *(Add Redis service)* | *(docker-compose.yml)* | *(Add redis service: image redis:7-alpine, port 6379, volume for persistence)* |
| *(Add env vars)* | *(.env.example)* | *(Add REDIS_URL, REFUND_WEBHOOK_SECRET, FEATURE_REFUNDS_ENABLED with example values)* |
| *(Update seed data)* | *(scripts/seed.ts or similar)* | *(Add refund seed data for local development — orders with refund_eligible flag)* |
| *(Update README)* | *(README.md — development setup section)* | *(Document new Redis dependency and env vars)* |

**Step 3d — CI/CD pipeline modifications.**

| Change | File | What to Modify | Why |
|--------|------|---------------|-----|
| *(Add Redis service)* | *(.github/workflows/ci.yml or equivalent)* | *(Add Redis container as a service for integration tests)* | *(Integration tests need Bull queue with real Redis)* |
| *(Add env vars to CI)* | *(CI secrets / environment config)* | *(Add REDIS_URL, REFUND_WEBHOOK_SECRET as CI secrets)* | *(Tests and staging deployment need these values)* |
| *(Add migration step)* | *(CI pipeline)* | *(Run database migrations before integration tests)* | *(New refund table must exist for tests)* |

**Step 3e — Infrastructure provisioning.**

Infrastructure that must be provisioned in staging/production before the feature can deploy:

| Resource | Environment | How to Provision | Who Provisions | Lead Time |
|----------|------------|-----------------|---------------|-----------|
| *(Redis instance)* | *(Staging, Production)* | *(Terraform/Pulumi or cloud console)* | *(DevOps / Platform team)* | *(1–2 days)* |
| *(Payment gateway sandbox account)* | *(Staging)* | *(Request from payment provider)* | *(Developer / Finance)* | *(2–5 days)* |

Flag any infrastructure with lead time > 1 day as an **early action item** — it should be initiated immediately, not blocked by other prerequisite tasks.

### Step 4 — Plan Configuration Changes

Identify configuration changes that must be in place before feature code can use them.

**Step 4a — Feature flag setup.**

If the deployment strategy (Section 12) specifies feature flag gating:

| Flag | Purpose | Default (Dev) | Default (Staging) | Default (Prod) | Managed By |
|------|---------|--------------|------------------|---------------|-----------|
| *(FEATURE_REFUNDS_ENABLED)* | *(Gate refund feature until ready for production)* | *(true — enabled for development)* | *(true — enabled for testing)* | *(false — disabled until launch)* | *(Environment variable / feature flag service)* |

**Flag implementation approach:** State whether the flag is a simple environment variable boolean, a configuration file entry, or managed by a feature flag service (LaunchDarkly, Unleash, etc.). Reference the deployment strategy's feature flag approach.

**Step 4b — Config file changes.**

| File | Change | Environment-Specific? | Deploy Order |
|------|--------|---------------------|-------------|
| *(app.config.ts or equivalent)* | *(Add refund module configuration: queue name, retry count, webhook path)* | *(Queue name varies by environment)* | *(Deploy config before code)* |
| *(ormconfig.ts or equivalent)* | *(Add refund entity to entity list if not auto-discovered)* | *(No — same in all environments)* | *(Deploy with code)* |

**Step 4c — Environment-specific settings.**

| Setting | Development | Staging | Production | Notes |
|---------|------------|---------|-----------|-------|
| *(REDIS_URL)* | *(redis://localhost:6379)* | *(redis://staging-redis:6379)* | *(redis://prod-redis-cluster:6379)* | *(Production uses Redis cluster)* |
| *(REFUND_MAX_AMOUNT)* | *(10000)* | *(10000)* | *(50000)* | *(Higher limit in production)* |
| *(REFUND_WEBHOOK_PATH)* | */api/webhooks/refund* | */api/webhooks/refund* | */api/webhooks/refund* | *(Same across environments)* |

**Step 4d — Deployment ordering for configuration.**

Configuration often deploys before or independently from code. Identify the correct ordering:

| What Deploys | When | Why | Risk if Out of Order |
|-------------|------|-----|---------------------|
| *(Infrastructure: Redis instance)* | *(Before code — separate provisioning)* | *(Code depends on Redis being available)* | *(Application crashes on startup — cannot connect to Redis)* |
| *(Environment variables)* | *(Before or with code — same deployment)* | *(Application reads env vars on startup)* | *(Missing env var — application fails to start or uses wrong default)* |
| *(Feature flag: disabled in prod)* | *(Before code — flag exists but disabled)* | *(Code deploys but feature is gated until launch)* | *(Feature is immediately visible to users before it's ready)* |
| *(Database migrations)* | *(Before code — migration runs first)* | *(Code depends on new tables/columns existing)* | *(Application errors on first query to missing table/column)* |

### Step 5 — Sequencing

Order all prerequisites so they can become the first tasks in the implementation plan. Dependencies flow downward — later tasks depend on earlier ones.

**Prerequisite task order:**

| Order | Task | Category | Depends On | Blocks |
|-------|------|---------|-----------|--------|
| *(1)* | *(Initiate infrastructure provisioning — Redis, sandbox accounts)* | *(Environment)* | *(None)* | *(Local setup, CI/CD changes)* |
| *(2)* | *(Add new dependencies to package.json / requirements.txt)* | *(Dependencies)* | *(None)* | *(All feature code)* |
| *(3)* | *(Add dev dependencies)* | *(Dependencies)* | *(None)* | *(Tests)* |
| *(4)* | *(Update docker-compose.yml — add Redis)* | *(Environment)* | *(None)* | *(Local development)* |
| *(5)* | *(Add environment variables to .env.example)* | *(Configuration)* | *(None)* | *(Local development, CI/CD)* |
| *(6)* | *(Update CI/CD pipeline — add Redis service, migration step)* | *(Environment)* | *(2, 5)* | *(CI tests)* |
| *(7)* | *(Add feature flag configuration)* | *(Configuration)* | *(5)* | *(Feature code — flag check)* |
| *(8)* | *(Run database migrations — create new tables)* | *(Environment)* | *(2, 4)* | *(All feature code that touches new tables)* |
| *(9)* | *(Add seed data for local development)* | *(Environment)* | *(8)* | *(Local testing)* |
| *(10)* | *(Verify local development setup works end-to-end)* | *(Verification)* | *(All above)* | *(Feature code — cannot start until dev setup is verified)* |

**Clean baseline verification.** The final verification task (Order 10) is not optional. After all prerequisites are installed, the developer must confirm:

1. **The application starts** — all new service dependencies are reachable, all new env vars are loaded, no startup crashes.
2. **Existing tests still pass** — installing new dependencies and changing configuration must not break the existing test suite. If any existing tests fail after prerequisite changes, that is a prerequisite bug to fix before feature code begins.
3. **New infrastructure is reachable** — local services (e.g., Redis in docker-compose) accept connections; CI pipeline runs with the new services.

This verification pattern ensures the codebase is in a known-good state before feature code is written. If verification fails, the prerequisite plan has a gap that must be fixed.

### Step 6 — Validate

Check the prerequisites plan against each item below. For any item that cannot be fully resolved with available information, mark it **NEEDS CLARIFICATION** with a specific question for the user — do not guess or leave it ambiguous. Every NEEDS CLARIFICATION item must be resolved before the plan is finalized.

- **Technology stack coverage** — does every new technology in the solution design (Section 2) have a corresponding dependency in Step 2?
- **Infrastructure coverage** — does every new service dependency (from the system design, backend design, and integration design) have a provisioning plan in Step 3?
- **Environment variable coverage** — does every configuration value referenced in the solution design have an environment variable planned in Step 3a or Step 4c?
- **CI/CD alignment** — do the CI/CD changes in Step 3d align with the deployment strategy (Section 12)?
- **No conflicts** — do any new dependencies conflict with existing ones (version, peer dependency, license)?
- **No redundancy** — are any new dependencies redundant with existing ones? If so, is the resolution documented?
- **Dependency health** — do any new dependencies have health red flags (unmaintained, poorly documented, excessive transitive weight)? If so, are alternatives identified?
- **Feature flag consistency** — if the deployment strategy specifies feature flag gating, is the flag setup documented in Step 4a?
- **Config validation** — are new environment variables added to the project's config validation schema (if one exists)?
- **Sequencing** — are all dependency relationships between prerequisite tasks captured in Step 5?
- **Lead time items** — are infrastructure resources with lead time > 1 day flagged as early action items?
- **Clean baseline** — does the final verification task confirm that existing tests still pass after prerequisites are installed?

**Readiness assessment.** After validation, assign a readiness status:

| Status | Meaning | Action |
|--------|---------|--------|
| **READY** | All items resolved, no NEEDS CLARIFICATION remaining, no blockers | Proceed to hand-off gate |
| **NEEDS WORK** | One or more NEEDS CLARIFICATION items remain, or non-blocking concerns exist | Present concerns to user, resolve, re-validate |
| **BLOCKED** | A prerequisite cannot be resolved without external action (e.g., license incompatibility with no alternative, infrastructure lead time exceeds project timeline) | Escalate blockers to user before proceeding |

### Step 7 — Assemble

Combine all sections into the prerequisites plan document. This becomes the third artifact of the implementation planning phase.

### File Output

Write the completed prerequisites plan to `docs/<feature>/implementation-package/plan/prerequisites-plan.md`.

---

## Output Structure

**1. Dependency Changes** — new and upgraded packages, version compatibility, redundancy check, license check, transitive risks, dev dependencies (from Step 2)

**2. Environment Setup** — new environment variables and secrets, new service dependencies, local development changes, CI/CD modifications, infrastructure provisioning (from Step 3)

**3. Configuration Changes** — feature flags, config file changes, environment-specific settings, deployment ordering (from Step 4)

**4. Prerequisite Task Sequence** — ordered list of prerequisite tasks with dependencies, ready to become the first phase of the implementation plan (from Step 5)

---

## Hand-off Gate

Before proceeding to `delivery-planning` (or `project-context-generator` if delivery planning is skipped), you must:

1. Write the completed prerequisites plan in full.
2. Present it to the user for review with the following questions:
   - **Dependencies:** Are the new packages correct? Are there alternatives you'd prefer? Are there internal/private packages not visible in the public registry?
   - **Version compatibility:** Do the version constraints look right for your project?
   - **Environment variables:** Are the variable names consistent with your naming conventions? Are there existing env vars I should use instead of creating new ones?
   - **Service dependencies:** Are the local setup changes (docker-compose, etc.) compatible with your current development workflow?
   - **CI/CD:** Are the pipeline modifications correct for your CI/CD platform? Are there platform-specific constraints I missed?
   - **Infrastructure:** Is the provisioning approach correct? Who handles provisioning in your organization? Are the lead time estimates realistic?
   - **Feature flags:** Is the feature flag approach correct? Do you use a feature flag service or simple environment variables?
   - **Sequencing:** Is the prerequisite task order correct? Are there dependencies I missed?
3. If the user identifies corrections, update and re-present before proceeding.
4. Do not proceed until the user explicitly confirms the prerequisites plan is accurate.

## Completion Criteria

- [ ] Every new technology in the solution design (Section 2) has a corresponding dependency entry with pinned version
- [ ] Version compatibility is checked against the project's language/runtime version and framework version
- [ ] Peer dependency conflicts are identified (if any)
- [ ] Redundancy check is complete — no new dependency duplicates functionality of an existing one without documented resolution
- [ ] License compatibility is checked for every new dependency
- [ ] Transitive dependency risks are assessed for every new dependency
- [ ] Every new environment variable is documented with purpose, environments, secret status, and default value
- [ ] Every new service dependency has local setup, CI setup, and production provisioning plans
- [ ] Local development setup changes are documented (docker-compose, .env.example, seed data, README)
- [ ] CI/CD pipeline modifications are documented with the specific files and changes
- [ ] Infrastructure resources with lead time > 1 day are flagged as early action items
- [ ] Feature flag setup is documented if the deployment strategy specifies feature flag gating
- [ ] Config file changes are documented with environment-specific variations
- [ ] Deployment ordering for configuration is defined — what deploys before code, what deploys with code
- [ ] Prerequisite tasks are sequenced with explicit dependencies
- [ ] A verification task confirms the local development setup works end-to-end before feature code begins
- [ ] The user has explicitly confirmed the prerequisites plan is accurate

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| A dependency is added mid-implementation because it wasn't planned, forcing a context switch to resolve version conflicts and lock file changes | Step 2 identifies all dependencies upfront from the solution design; they are installed as the first task |
| A new dependency conflicts with an existing one (peer dependency, version constraint), discovered when the install command fails | Step 2c checks version compatibility before the dependency is added |
| A new dependency duplicates functionality already available in the project (two HTTP clients, two validation libraries) | Step 2d checks for redundancy against existing dependencies |
| A new dependency has a license incompatible with the project (GPL dependency in a proprietary project) | Step 2f checks license compatibility for every new dependency |
| A feature depends on a Redis instance that doesn't exist in the CI environment, causing all integration tests to fail | Step 3b identifies service dependencies and Step 3d plans CI/CD modifications to include them |
| Environment variables are missing in staging/production because they were only added to the local .env file | Step 3a documents every env var across all environments; Step 4c defines environment-specific values |
| Infrastructure provisioning (Redis instance, sandbox account) takes 5 days, but this is discovered on the day the feature is supposed to deploy | Step 3e flags resources with lead time > 1 day as early action items, initiated at the start of implementation |
| The application crashes in staging because database migrations haven't been run — code was deployed before schema changes | Step 4d defines deployment ordering: migrations run before code that depends on new tables |
| A feature flag is not set up, so the feature is immediately visible to all users when the code deploys | Step 4a plans feature flag setup with per-environment defaults, deployed before feature code |
| The developer starts writing feature code but cannot run the application locally because Redis isn't in docker-compose | Step 3c documents local development setup changes; Step 5 sequences them before feature code |
| Configuration changes are scattered across multiple PRs with no clear sequence, causing partial deployments to break | Step 5 sequences all prerequisites with explicit dependencies so they can be executed in order |
| A new dependency introduces a transitive dependency with a known vulnerability, failing security scans in CI | Step 2e assesses transitive dependency risks before the dependency is added |
| A dependency with poor maintenance (no releases in 18 months, hundreds of open issues) is adopted, and a critical bug is discovered during implementation with no upstream fix available | Step 2a evaluates dependency health signals before adoption; poorly maintained packages are flagged as NEEDS CLARIFICATION with alternatives |
| A required environment variable is missing in production but the application starts anyway and silently uses a wrong default, causing subtle data corruption discovered days later | Step 3a requires fail-fast config validation for every new env var — the application must crash on startup with a clear error rather than silently degrading |
| Existing tests break after installing new dependencies due to version conflicts or changed transitive behavior, but this is only discovered after feature code is half-written | Step 5 includes a clean baseline verification task — existing tests must pass after prerequisites are installed, before any feature code begins |
