# Deployment / DevOps

## Purpose

Design how the feature ships safely to a live system — CI/CD pipeline, environments, and release strategy. Consumes: the existing-architecture-assessment (existing deployment topology, CI/CD pipeline, rollback capabilities), the system-design (new components requiring deployment), the data-model-design (migration sequencing relative to code deployment), and the requirements package (assumptions-constraints-scope for rollout constraints and rollback conditions). For brownfield projects, designs deployment to minimize risk to the running system — canary rollouts, blue/green deployments, feature flag gating, backward-compatible API versioning, database migration ordering relative to code deployment, and rollback triggers with defined criteria. Covers: CI/CD pipeline changes, environment configuration, deployment sequence (what deploys in what order), rollout progression criteria (what metrics must pass before expanding), rollback triggers and procedures, coordination with data migration execution, and monitoring during rollout (what to watch, when to halt). Produces deployment/DevOps design that is Section 12 of the solution design package.

## What This Produces

The deployment strategy for the feature — how the code, infrastructure, and data changes get from development to production safely. This section designs the deployment pipeline, environment promotion, release strategy, migration coordination, and rollback plan. The goal is to ship changes with minimal risk to the running system and a clear path to recovery if something goes wrong.

This is Section 12 of the solution design package. It consumes outputs from all prior sections:
- **System design** (Section 3) — new and modified components that need to be deployed
- **Data model design** (Section 6) — database migrations that must be coordinated with code deployment
- **Backend design** (Section 5) — background jobs, new services, infrastructure dependencies
- **Frontend design** (Section 4) — static assets, CDN invalidation, client-side deployment
- **Integration design** (Section 8) — external system dependencies that affect deployment ordering
- **API design** (Section 7) — breaking vs. non-breaking API changes that affect rollout strategy

**What this section covers vs. what other sections cover:**

| Concern | Where It Lives |
|---------|---------------|
| How services are structured and what they do | Section 3 — System Design |
| Database schema changes and migration scripts | Section 6 — Data Model Design |
| Health check endpoints and readiness probes | Section 5 — Backend Design |
| Runtime monitoring, logging, and alerting | Section 13 — Observability Design |
| **CI/CD pipeline changes for the feature** | **Section 12 — This section** |
| **Environment promotion (dev → staging → prod)** | **Section 12 — This section** |
| **Release strategy (rolling, canary, blue-green, feature flags)** | **Section 12 — This section** |
| **Deployment sequence (what deploys in what order)** | **Section 12 — This section** |
| **Migration coordination (schema changes vs. code deployment)** | **Section 12 — This section** |
| **Rollout progression criteria (what must pass before expanding)** | **Section 12 — This section** |
| **Rollback triggers and procedures** | **Section 12 — This section** |
| **Post-deployment verification** | **Section 12 — This section** |

**Boundary with Observability (Section 13):** This section defines *what to watch during rollout* and *when to halt/rollback*. The observability section defines the full monitoring, logging, and alerting strategy for steady-state production. There is natural overlap at the rollout monitoring point — this section specifies the deployment-specific signals, and observability specifies the long-term monitoring infrastructure.

## When to Use

- Always included unless the change is documentation-only
- Runs after all detail design sections (Steps 4–11) and before `observability-design` (Step 13)
- Even simple changes need a deployment section — if only to confirm "follows existing deployment process, no changes needed"

## Inputs

| Input | Source | Required | If discovery was skipped |
|-------|--------|----------|--------------------------|
| System design | `docs/<feature>/solutions-package/design/03-system-design.md` — component map, new/modified components | Yes | Yes |
| Technology stack | `docs/<feature>/solutions-package/design/02-technology-stack.md` — container runtime, orchestration platform, CI/CD tooling | Yes | Yes |
| Data model design | `docs/<feature>/solutions-package/design/06-data-model-design.md` — migrations, migration ordering, coexistence strategy | If data model changes | If data model changes |
| Backend design | `docs/<feature>/solutions-package/design/05-backend-design.md` — new services, background jobs, health checks | If backend changes | If backend changes |
| Frontend design | `docs/<feature>/solutions-package/design/04-frontend-design.md` — static assets, CDN, client deployment | If frontend changes | If frontend changes |
| API design | `docs/<feature>/solutions-package/design/07-api-design.md` — breaking vs. non-breaking changes, versioning | If API changes | If API changes |
| Integration design | `docs/<feature>/solutions-package/design/08-integration-design.md` — external dependencies, circuit breakers | If integrations change | If integrations change |
| Architecture baseline | `docs/<feature>/solutions-package/discovery/architecture-baseline.md` — Section 4 (Deployment Topology: CI/CD pipeline, environment structure, container configuration, health checks, scaling configuration, infrastructure constraints) | If discovery ran — identifies existing deployment infrastructure at the architectural level; specific pipeline configurations are derived from the codebase in Step 2 | Identifies patterns from codebase or user input |
| Requirements package — assumptions/constraints/scope | `docs/<feature>/requirements-package/requirements/assumptions-constraints-scope.md` — deployment constraints (maintenance windows, zero-downtime requirement, regional rollout), rollback conditions | Yes | Yes |
| Requirements package — NFRs | `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md` — availability targets (uptime SLA), deployment frequency targets, recovery time objectives (RTO) | Yes | Yes |
| Access to the codebase | Local filesystem or repository — CI/CD pipeline files, Dockerfiles, Kubernetes manifests, Terraform/Pulumi configs, deployment scripts | Yes (brownfield) — the AI reads existing deployment infrastructure | Yes if available; otherwise user provides description |

> **Missing input guard:** If the requirements package or any required input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[path]` but it was not found. This input is required. Please provide it or confirm I should proceed without it."*

## Did Discovery Run?

**Discovery ran** if `docs/<feature>/solutions-package/discovery/architecture-baseline.md` exists:

- Read Section 4 (Deployment Topology) — where and how the application is deployed (cloud provider, container workflow, serverless), environment structure (dev, staging, production), CI/CD pipeline architecture, health checks, scaling configuration, and infrastructure constraints.
- This tells the AI what deployment infrastructure exists at the architectural level (e.g., "Kubernetes on AWS EKS, GitHub Actions CI/CD, 3 environments, rolling deployments"). The AI then reads the actual codebase (Step 2) to extract specific pipeline configurations, Dockerfiles, manifests, and deployment scripts.

**Discovery was skipped:**

- For brownfield projects with codebase access: the AI reads CI/CD pipeline files, Dockerfiles, Kubernetes manifests, and deployment scripts directly.
- For brownfield projects without codebase access: ask the user to describe the existing deployment infrastructure. Record as `user-stated`.
- For greenfield projects: no existing deployment infrastructure. Design from scratch using the technology stack.

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  DEPLOYMENT / DEVOPS DESIGN — INTERNAL SEQUENCE                  │
├──────────────────────────────────────────────────────────────────┤
│  1. LOAD — Read all inputs                                       │
│     Read system design (components to deploy), data model        │
│     (migrations), backend (services, jobs), frontend (assets),   │
│     API (breaking changes), integration (dependencies),          │
│     technology stack (CI/CD tooling, container runtime),         │
│     requirements (constraints, NFRs).                            │
│     If discovery ran: read baseline Section 4.                   │
├──────────────────────────────────────────────────────────────────┤
│  2. EXTRACT EXISTING — Read the codebase to extract existing     │
│     deployment infrastructure (Brownfield only)                  │
│     Read CI/CD pipelines, Dockerfiles, K8s manifests,            │
│     deployment scripts, environment configs.                     │
├──────────────────────────────────────────────────────────────────┤
│  3. DEPLOYMENT UNITS — Identify what needs to be deployed        │
│     Map design sections to deployable units: services,           │
│     migrations, static assets, infrastructure changes.           │
├──────────────────────────────────────────────────────────────────┤
│  4. ENVIRONMENTS — Define environment promotion path             │
│     Dev → Staging → Production (or project-specific path).       │
│     Environment-specific configuration.                          │
├──────────────────────────────────────────────────────────────────┤
│  5. PIPELINE — Design CI/CD pipeline changes                     │
│     Build, test, package, deploy stages.                         │
│     New pipeline jobs or modifications to existing.              │
├──────────────────────────────────────────────────────────────────┤
│  6. RELEASE STRATEGY — Choose release approach                   │
│     Rolling, blue-green, canary, feature flags, or               │
│     combination. Matched to risk profile.                        │
├──────────────────────────────────────────────────────────────────┤
│  7. DEPLOYMENT SEQUENCE — Define deployment ordering             │
│     Infrastructure → Migrations → Backend → Frontend.            │
│     Dependencies between deployment steps.                       │
├──────────────────────────────────────────────────────────────────┤
│  8. MIGRATION COORDINATION — Coordinate schema changes with      │
│     code deployment (if data model changes)                      │
│     Pre-deploy vs. post-deploy migrations, coexistence.          │
├──────────────────────────────────────────────────────────────────┤
│  9. ROLLOUT & ROLLBACK — Define progression criteria and         │
│     rollback procedures                                          │
│     What must pass to proceed, what triggers rollback,           │
│     how to rollback each deployment unit.                        │
├──────────────────────────────────────────────────────────────────┤
│  10. POST-DEPLOYMENT — Define verification and stabilization     │
│      Smoke tests, canary monitoring window, sign-off.            │
├──────────────────────────────────────────────────────────────────┤
│  11. VALIDATE — Check against constraints and requirements       │
├──────────────────────────────────────────────────────────────────┤
│  12. ASSEMBLE — Write the deployment strategy section            │
│      Produce the structured output. Present for review.          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Load Inputs

Read all inputs. This skill runs after all detail design sections are complete. Collect:

From the **system design** (Section 3):
- All new components requiring deployment (new services, new databases, new queues, new caches)
- Modified components requiring redeployment
- Component dependencies that determine deployment ordering

From the **data model** (Section 6, if applicable):
- Migration list (from the migration strategy section)
- Coexistence strategy (can old code and new code run against the same schema?)
- Whether migrations are additive (safe to run before code) or breaking (require phased approach)

From the **technology stack** (Section 2):
- Container runtime (Docker, Podman)
- Orchestration platform (Kubernetes, ECS, App Runner, serverless)
- CI/CD tooling (GitHub Actions, GitLab CI, Jenkins, CircleCI, ArgoCD)
- IaC tooling (Terraform, Pulumi, CloudFormation, CDK)

From the **requirements package**:
- Deployment constraints (maintenance windows, zero-downtime requirement, regional rollout requirements)
- Availability targets (uptime SLA — determines whether rolling/canary/blue-green is needed)
- Recovery time objectives (RTO — determines how fast rollback must complete)
- Deployment frequency targets (how often the team ships)

### Step 2 — Extract Existing Deployment Infrastructure from the Codebase (Brownfield Only)

Read deployment-related code to understand existing patterns.

| Pattern Area | What to Read |
|-------------|-------------|
| **CI/CD pipeline** | Pipeline configuration files (`.github/workflows/*.yml`, `.gitlab-ci.yml`, `Jenkinsfile`, `circle.yml`, `buildspec.yml`) |
| **Container configuration** | `Dockerfile`, `docker-compose.yml`, `.dockerignore` — note multi-stage build patterns, base images, health checks |
| **Orchestration** | Kubernetes manifests (`deployment.yaml`, `service.yaml`, `ingress.yaml`, `configmap.yaml`, `hpa.yaml`), Helm charts, Kustomize overlays |
| **Infrastructure as Code** | Terraform files (`.tf`), Pulumi configs, CloudFormation templates, CDK code |
| **Environment configuration** | `.env.example`, environment-specific config files, secrets management setup (Vault, AWS Secrets Manager, SOPS) |
| **Deployment scripts** | Shell scripts for deployment, database migration runners, rollback scripts |
| **Release tooling** | Feature flag configuration (LaunchDarkly, Unleash, custom), release tagging conventions, changelog automation |

**Present the extracted patterns:** **"I've read the existing deployment infrastructure and identified the following patterns. Please confirm these are accurate, and let me know if there are deployment processes that aren't captured in the codebase (e.g., manual steps, external CI/CD, infrastructure managed by a platform team)."**

For greenfield projects, skip this step.

### Step 3 — Identify Deployment Units

Map the design sections to concrete deployment units — the things that actually get deployed:

| Deployment Unit | Type | Source Section | New or Modified | Depends On |
|----------------|------|---------------|----------------|-----------|
| *(refund-service)* | *(Application container)* | *(Backend Design — Section 5)* | *(New)* | *(Database migration, config secrets)* |
| *(database migration v42)* | *(Schema migration)* | *(Data Model Design — Section 6)* | *(New)* | *(Nothing — runs first)* |
| *(web-frontend)* | *(Static assets / CDN)* | *(Frontend Design — Section 4)* | *(Modified — new refund pages)* | *(API endpoints available)* |
| *(notification-worker)* | *(Background worker)* | *(Backend Design — Section 5)* | *(New)* | *(Message queue, config)* |
| *(API gateway config)* | *(Infrastructure config)* | *(API Design — Section 7)* | *(Modified — new routes)* | *(Backend service deployed)* |

For each unit, note:
- **Build artifact** — container image, static bundle, migration file, config file
- **Configuration** — environment variables, secrets, feature flags needed
- **Infrastructure** — any infrastructure provisioning required before deployment (new database, queue, cache)

### Step 4 — Define Environment Promotion Path

**Step 4a — Define environments:**

| Environment | Purpose | Data | Access | Deploys From |
|------------|---------|------|--------|-------------|
| *(Development)* | *(Local development and integration)* | *(Synthetic seed data)* | *(Developers)* | *(Local build)* |
| *(CI)* | *(Automated testing)* | *(Test fixtures)* | *(Automated only)* | *(Every PR push)* |
| *(Staging)* | *(Pre-production verification)* | *(Anonymized production snapshot or realistic synthetic)* | *(Development team, QA)* | *(Merge to main)* |
| *(Production)* | *(Live system)* | *(Real data)* | *(Operations, on-call)* | *(Promotion from staging)* |

**Step 4b — Environment-specific configuration for the feature:**

| Config Key | Development | Staging | Production | Notes |
|-----------|-------------|---------|------------|-------|
| *(REFUND_SERVICE_URL)* | *(http://localhost:3001)* | *(https://refund.staging.internal)* | *(https://refund.prod.internal)* | *(Service discovery / DNS)* |
| *(PAYMENT_GATEWAY_MODE)* | *(sandbox)* | *(sandbox)* | *(live)* | *(Never test against live payments)* |
| *(FEATURE_FLAG_REFUNDS)* | *(enabled)* | *(enabled)* | *(disabled — enabled via gradual rollout)* | *(Feature flag for rollout control)* |
| *(DB_MIGRATION_AUTO_RUN)* | *(true)* | *(true)* | *(false — migrations run as a separate step)* | *(Production migrations are explicit)* |

**Step 4c — Secrets management:**

For each new secret the feature introduces, define:

| Secret | Where Stored | Who Can Access | Rotation | Injected How |
|--------|-------------|---------------|----------|-------------|
| *(PAYMENT_GATEWAY_API_KEY)* | *(AWS Secrets Manager)* | *(Service role only)* | *(90 days)* | *(Environment variable via ECS task definition / K8s external-secrets)* |
| *(DB_PASSWORD)* | *(Vault)* | *(Service role, DBA)* | *(30 days)* | *(Sidecar injection / init container)* |

### Step 5 — Design CI/CD Pipeline Changes

**Step 5a — Pipeline stages for the feature:**

Define what the CI/CD pipeline looks like for this feature. For brownfield projects, specify *changes* to the existing pipeline:

| Stage | Trigger | What It Does | Gate to Next Stage | New or Existing |
|-------|---------|-------------|-------------------|----------------|
| *(Lint + Typecheck)* | *(PR push)* | *(Run linter, type checker on changed files)* | *(All pass)* | *(Existing — no changes)* |
| *(Unit tests)* | *(After lint)* | *(Run unit tests with coverage)* | *(All pass, coverage ≥ threshold)* | *(Existing — add new test suites)* |
| *(Integration tests)* | *(After unit)* | *(Run integration tests against test DB)* | *(All pass)* | *(Modified — add refund service integration tests)* |
| *(Build container)* | *(Merge to main)* | *(Build Docker image, tag with SHA)* | *(Image builds, vulnerability scan passes)* | *(Existing — add refund-service build)* |
| *(Deploy staging)* | *(After build)* | *(Deploy to staging, run migrations)* | *(Health checks pass)* | *(Modified — add refund-service deployment)* |
| *(Smoke tests)* | *(After staging deploy)* | *(Run smoke tests against staging)* | *(All pass)* | *(Modified — add refund smoke tests)* |
| *(Deploy production)* | *(Manual approval or auto-promote)* | *(Deploy to production per release strategy)* | *(Rollout criteria met)* | *(Modified — add refund-service deployment)* |

**Step 5b — New pipeline jobs (if any):**

If the feature requires entirely new CI/CD jobs (not just modifications to existing ones):

| Job | Purpose | When It Runs | Runtime Requirements |
|-----|---------|-------------|---------------------|
| *(Migration dry-run)* | *(Validate migration against staging schema without applying)* | *(Before staging deploy)* | *(Database access, migration tool)* |
| *(Contract tests)* | *(Verify API contracts between refund-service and web-frontend)* | *(After integration tests)* | *(Pact broker or similar)* |

**Step 5c — Container build changes (if containerized):**

If the feature introduces new containers or modifies existing ones:

| Container | Base Image | Build Target | Health Check | Resource Limits |
|-----------|-----------|-------------|-------------|----------------|
| *(refund-service)* | *(node:22-alpine)* | *(Production stage of multi-stage Dockerfile)* | *(GET /health → 200)* | *(CPU: 0.5, Memory: 512Mi)* |
| *(notification-worker)* | *(node:22-alpine)* | *(Worker stage)* | *(Process alive check)* | *(CPU: 0.25, Memory: 256Mi)* |

### Step 6 — Choose Release Strategy

Based on the risk profile of the change and the availability requirements, choose the release approach:

**Step 6a — Risk assessment:**

| Factor | Assessment | Impact on Strategy |
|--------|-----------|-------------------|
| *(Data model changes?)* | *(Yes — new table, new column on existing table)* | *(Requires migration coordination; additive changes allow pre-deploy migration)* |
| *(Breaking API changes?)* | *(No — new endpoints only)* | *(No API versioning needed; old clients unaffected)* |
| *(User-facing changes?)* | *(Yes — new refund UI)* | *(Feature flag to control rollout visibility)* |
| *(External integration changes?)* | *(Yes — payment gateway integration)* | *(Must verify in staging with sandbox; canary in production)* |
| *(Availability SLA?)* | *(99.9% — 8.7 hours downtime/year max)* | *(Zero-downtime deployment required)* |
| *(Blast radius if broken?)* | *(Medium — refund flow affected, but core order flow unaffected)* | *(Canary or feature flag sufficient; full blue-green not needed)* |

**Step 6b — Strategy selection:**

| Strategy | When to Use | Trade-offs |
|----------|------------|------------|
| **Rolling deployment** | Standard, backward-compatible changes; low risk | Two versions run simultaneously during rollout; requires backward compatibility |
| **Blue-green deployment** | Critical services, zero-tolerance for issues; need instant rollback | Requires 2x infrastructure during deployment; clean cutover |
| **Canary deployment** | High-traffic services, risky changes; want to validate with real traffic before full rollout | Requires traffic splitting and monitoring infrastructure; slower rollout |
| **Feature flags** | User-facing changes that should be controllable independent of code deployment | Feature can be disabled without redeployment; adds code complexity (flag cleanup) |
| **Rolling + feature flags** | Most common combination — deploy code via rolling update, control feature visibility via flags | Best of both: safe deployment + user-level rollout control |

Present the recommendation: **"Based on the risk assessment, I recommend [strategy]. Here's why: [rationale]. The rollback path is: [rollback approach]. Does this match your risk tolerance?"**

### Step 7 — Define Deployment Sequence

Define the exact order in which deployment units are deployed, with dependencies:

```
┌──────────────────────────────────────────────────────────────┐
│  DEPLOYMENT SEQUENCE                                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Phase 1: INFRASTRUCTURE                                      │
│  ├─ Provision new resources (queue, cache, DNS)               │
│  └─ Update infrastructure config (API gateway routes)         │
│      Gate: Infrastructure provisioned and healthy              │
│                                                               │
│  Phase 2: DATABASE                                            │
│  ├─ Run pre-deploy migrations (additive only)                 │
│  └─ Verify migration success                                  │
│      Gate: Migrations applied, old code still works            │
│                                                               │
│  Phase 3: BACKEND                                             │
│  ├─ Deploy backend services (rolling/canary/blue-green)       │
│  ├─ Deploy background workers                                 │
│  └─ Verify health checks pass                                 │
│      Gate: All services healthy, error rate normal             │
│                                                               │
│  Phase 4: FRONTEND                                            │
│  ├─ Deploy static assets / CDN                                │
│  ├─ Invalidate CDN cache                                      │
│  └─ Verify frontend loads correctly                           │
│      Gate: Frontend accessible, no console errors              │
│                                                               │
│  Phase 5: ACTIVATION                                          │
│  ├─ Enable feature flags (gradual: 5% → 25% → 100%)          │
│  └─ Monitor rollout metrics                                   │
│      Gate: Error rate stable, latency within bounds            │
│                                                               │
│  Phase 6: CLEANUP (post-stabilization)                        │
│  ├─ Run post-deploy migrations (if any)                       │
│  ├─ Remove old API versions (if deprecated)                   │
│  └─ Remove feature flag code (in a subsequent release)        │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

For each phase, define the detailed sequence:

| Order | Unit | Action | Pre-condition | Verification | Rollback |
|-------|------|--------|--------------|-------------|---------|
| *(1.1)* | *(SQS queue for notifications)* | *(Create via Terraform apply)* | *(None)* | *(Queue exists, IAM policies attached)* | *(Terraform destroy)* |
| *(2.1)* | *(Migration: create refunds table)* | *(Run migration)* | *(Queue exists)* | *(Table exists, old code unaffected)* | *(DROP TABLE — reversible)* |
| *(2.2)* | *(Migration: add refund_eligible to orders)* | *(Run migration)* | *(refunds table exists)* | *(Column exists, nullable, old code unaffected)* | *(DROP COLUMN)* |
| *(3.1)* | *(refund-service)* | *(Rolling deploy with new container image)* | *(Migrations complete)* | *(Health check passes, logs show startup)* | *(Rolling update to previous image tag)* |
| *(3.2)* | *(notification-worker)* | *(Deploy worker)* | *(refund-service deployed, queue exists)* | *(Worker consuming messages)* | *(Scale to 0, redeploy previous)* |
| *(4.1)* | *(web-frontend)* | *(Deploy static bundle to CDN)* | *(API endpoints available)* | *(Pages load, no 404s on new routes)* | *(Redeploy previous bundle)* |
| *(5.1)* | *(Feature flag: REFUNDS_ENABLED)* | *(Enable for 5% of users)* | *(All services healthy)* | *(Monitor error rate, user feedback)* | *(Disable flag — instant)* |

### Step 8 — Coordinate Database Migrations (If Data Model Changes)

Cross-reference the migration strategy from the data model design (Section 6) and define the deployment coordination:

**Step 8a — Classify each migration by deployment phase:**

| Migration | Type | Deploy Phase | Can Old Code Coexist? | Rollback |
|-----------|------|-------------|----------------------|---------|
| *(Create refunds table)* | *(Additive — new table)* | *(Pre-deploy — Phase 2)* | *(Yes — old code ignores it)* | *(DROP TABLE)* |
| *(Add refund_eligible column)* | *(Additive — new nullable column)* | *(Pre-deploy — Phase 2)* | *(Yes — old code ignores it)* | *(DROP COLUMN)* |
| *(Backfill refund_eligible)* | *(Data migration)* | *(Post-deploy — Phase 6)* | *(Yes — column is nullable)* | *(No — data transformation)* |
| *(Add NOT NULL constraint)* | *(Breaking — requires backfill first)* | *(Post-deploy — Phase 6, after backfill)* | *(No — requires column to be populated)* | *(DROP CONSTRAINT)* |

**Step 8b — For breaking migrations, define the phased approach:**

Breaking migrations require multiple deployment cycles:

| Cycle | What Deploys | Schema State | Code State |
|-------|-------------|-------------|-----------|
| *(Cycle 1)* | *(Add column as nullable + deploy code that writes to both old and new)* | *(Old + new column, both populated)* | *(Writes both, reads from old)* |
| *(Cycle 2)* | *(Backfill historical data in new column)* | *(New column fully populated)* | *(Same — writes both, reads from old)* |
| *(Cycle 3)* | *(Deploy code that reads from new column)* | *(Same)* | *(Reads from new, writes both for safety)* |
| *(Cycle 4)* | *(Add NOT NULL constraint, remove old column)* | *(Only new column, NOT NULL)* | *(Reads/writes new column only)* |

If all migrations are additive, state: **"All migrations are additive — they run before code deployment (Phase 2) and old code can coexist safely."**

### Step 9 — Define Rollout Progression and Rollback

**Step 9a — Rollout progression criteria:**

Define what must be true before expanding the rollout at each stage:

| Rollout Stage | Traffic % | Duration | Criteria to Advance | Criteria to Halt |
|--------------|----------|---------|--------------------|-----------------| 
| *(Canary)* | *(5%)* | *(30 minutes)* | *(Error rate ≤ baseline + 0.1%, p99 latency ≤ baseline + 50ms, no critical alerts)* | *(Error rate > baseline + 1%, any 5xx spike, critical alert fires)* |
| *(Partial)* | *(25%)* | *(2 hours)* | *(Same as above, sustained for 2 hours)* | *(Same as above)* |
| *(Majority)* | *(75%)* | *(4 hours)* | *(Same as above, sustained)* | *(Same as above)* |
| *(Full)* | *(100%)* | *(24 hours stabilization)* | *(Stable for 24 hours — deployment complete)* | *(Rollback per procedure below)* |

**Step 9b — Rollback triggers:**

Define the specific conditions that trigger an automatic or manual rollback:

| Trigger | Severity | Detection | Action | Automated? |
|---------|----------|-----------|--------|-----------|
| *(Error rate > 5% on new endpoints)* | *(Critical)* | *(Monitoring alert)* | *(Immediate rollback — disable feature flag + revert deployment)* | *(Yes — automated)* |
| *(p99 latency > 3x baseline)* | *(Critical)* | *(Monitoring alert)* | *(Halt rollout, investigate. Rollback if not resolved in 15 min)* | *(Semi — halt automated, rollback manual)* |
| *(Database connection pool exhaustion)* | *(Critical)* | *(Health check failure)* | *(Immediate rollback)* | *(Yes — K8s readiness probe fails, traffic stops)* |
| *(User-reported data corruption)* | *(Critical)* | *(Support ticket, user report)* | *(Immediate rollback + incident)* | *(No — manual)* |
| *(Elevated error rate 1–5%)* | *(Warning)* | *(Monitoring alert)* | *(Halt rollout, do not expand to next stage, investigate)* | *(Semi — halt automated, decision manual)* |

**Step 9c — Rollback procedure per deployment unit:**

| Unit | Rollback Method | Time to Rollback | Data Impact | Verification |
|------|----------------|-----------------|-------------|-------------|
| *(Feature flag)* | *(Disable flag in management UI)* | *(< 1 minute — instant)* | *(None — code still deployed, feature hidden)* | *(Confirm flag disabled, feature not accessible)* |
| *(Backend service)* | *(Rolling update to previous image tag)* | *(2–5 minutes)* | *(None — previous code resumes)* | *(Health checks pass, error rate returns to baseline)* |
| *(Frontend)* | *(Redeploy previous static bundle to CDN, invalidate cache)* | *(5–10 minutes)* | *(None)* | *(Previous UI loads, no 404s)* |
| *(Database migration)* | *(Run reverse migration if reversible; if not, forward-fix only)* | *(Varies — minutes for DDL, hours for data migration)* | *(Additive migrations: safe to leave in place. Breaking migrations: cannot be easily reversed)* | *(Schema matches expected state, application connects)* |
| *(Infrastructure)* | *(Terraform apply of previous state, or manual resource cleanup)* | *(5–15 minutes)* | *(None if additive; may orphan resources)* | *(Resources match expected state)* |

**Rollback ordering:** Reverse the deployment sequence — disable feature flags first (instant), then rollback frontend, then backend, then infrastructure. Database migrations are typically left in place if additive (new tables/columns don't break old code).

### Step 10 — Define Post-Deployment Verification

**Step 10a — Smoke tests:**

Define the automated checks that run immediately after deployment:

| Test | Endpoint / Action | Expected Result | Blocks Rollout If Fails |
|------|------------------|----------------|----------------------|
| *(Health check)* | *(GET /health)* | *(200 OK, all dependency checks pass)* | *(Yes — critical)* |
| *(API smoke — create refund)* | *(POST /api/refunds with test data)* | *(201 Created, valid response body)* | *(Yes — critical)* |
| *(API smoke — list refunds)* | *(GET /api/refunds)* | *(200 OK, paginated response)* | *(Yes — critical)* |
| *(Frontend smoke — refund page)* | *(Navigate to /refunds, verify page loads)* | *(Page renders, no console errors)* | *(Yes — if frontend is deployed)* |

**Step 10b — Canary monitoring window:**

What to watch during the initial canary period:

| Signal | Source | Baseline | Alert Threshold | Dashboard Link |
|--------|--------|----------|----------------|---------------|
| *(Error rate — refund endpoints)* | *(Application metrics)* | *(< 0.1%)* | *(> 1%)* | *(Observability Section 13)* |
| *(p50 / p95 / p99 latency)* | *(Application metrics)* | *(p50: 50ms, p95: 200ms, p99: 500ms)* | *(p99 > 1500ms)* | *(Observability Section 13)* |
| *(Database query duration)* | *(Database metrics)* | *(< 50ms avg)* | *(> 200ms avg)* | *(Observability Section 13)* |
| *(Queue depth — notification queue)* | *(Queue metrics)* | *(< 100 messages)* | *(> 1000 messages — consumer can't keep up)* | *(Observability Section 13)* |
| *(HTTP 5xx count)* | *(Load balancer metrics)* | *(0)* | *(> 5 in 5 minutes)* | *(Observability Section 13)* |

**Step 10c — Sign-off checklist:**

Before declaring the deployment complete:

- [ ] All smoke tests pass
- [ ] Canary monitoring window passed with no alerts
- [ ] Feature flag fully enabled (100% of users)
- [ ] No elevated error rates or latency
- [ ] Post-deploy migrations completed (if Phase 6 work exists)
- [ ] Team notified of successful deployment
- [ ] Runbook updated (if new operational procedures exist)

### Step 11 — Validate

Check the completed deployment strategy against:

- **System design** — does every new or modified component from Section 3 have a deployment unit?
- **Data model** — is the migration coordination consistent with the coexistence strategy from Section 6?
- **API design** — if there are breaking API changes, is the rollout strategy safe for existing clients?
- **Requirements** — does the strategy meet the availability SLA (zero-downtime if required)? Does the rollback procedure meet the RTO?
- **NFRs** — are deployment frequency targets achievable with the designed pipeline?
- **Consistency** — does the pipeline follow the existing CI/CD patterns (from Step 2)?
- **Traceability** — does every deployment unit trace to a design section and ultimately to requirements?

### Step 12 — Assemble

Combine all sections into the deployment strategy output. This becomes Section 12 of the solution design package.

### File Output

Write the completed section to `docs/<feature>/solutions-package/design/12-deployment-strategy.md` using the template at `../assets/deployment-strategy-doc.md` as the output structure.

If this section was determined to be not applicable in the design workflow's Step 0, write a stub file containing: **"Not applicable — [rationale from scoping step]."**

---

## Output Structure

### For Brownfield Projects

**1. Existing Deployment Infrastructure** — current CI/CD pipeline, deployment topology, container strategy, release approach (from Step 2)

**2. Deployment Units** — what needs to be deployed, build artifacts, configuration, infrastructure dependencies (from Step 3)

**3. Environment Promotion** — environment definitions, environment-specific configuration, secrets management (from Step 4)

**4. CI/CD Pipeline Changes** — new or modified pipeline stages, new pipeline jobs, container build changes (from Step 5)

**5. Release Strategy** — risk assessment, strategy selection (rolling, canary, blue-green, feature flags), rationale (from Step 6)

**6. Deployment Sequence** — ordered deployment phases with dependencies, pre-conditions, and verification (from Step 7)

**7. Migration Coordination** — migration classification by phase, breaking migration phased approach (from Step 8, if applicable)

**8. Rollout and Rollback** — rollout progression criteria, rollback triggers, rollback procedure per unit (from Step 9)

**9. Post-Deployment Verification** — smoke tests, canary monitoring signals, sign-off checklist (from Step 10)

**10. Requirements Traceability** — every deployment decision traces to a constraint, NFR, or design section requirement

### For Greenfield Projects

Same structure, omitting Section 1 (Existing Deployment Infrastructure). The pipeline, environments, and release strategy are designed from scratch.

---

## Requirements Traceability

Every deployment decision must trace to the requirement, constraint, or design output that drives it.

| Design Element | Type | Requirement ID | Requirement Summary |
|---------------|------|---------------|---------------------|
| *(Zero-downtime rolling deployment)* | *(release strategy)* | *(NFR-01)* | *(99.9% availability SLA — no maintenance windows)* |
| *(Feature flag for refund UI)* | *(rollout control)* | *(CONSTRAINT-04)* | *(Business requires gradual rollout to monitor refund volume)* |
| *(Pre-deploy migration for refunds table)* | *(deployment sequence)* | *(Section 6 — Data Model)* | *(Additive migration that must exist before backend service starts)* |
| *(Canary deployment with 5% initial traffic)* | *(rollout progression)* | *(NFR-01, NFR-03)* | *(Availability SLA + payment gateway integration risk)* |
| *(Automated rollback on error rate > 5%)* | *(rollback trigger)* | *(NFR-01)* | *(RTO of 5 minutes — manual rollback too slow)* |

If a deployment decision cannot be traced to a requirement, constraint, or design output, it must be flagged and confirmed with the user before inclusion.

---

## Hand-off Gate

Before proceeding to `observability-design`, you must:

1. Write the completed deployment strategy in full.
2. Present it to the user for review with the following questions:
   - **Deployment units:** Are all new and modified components accounted for? Are there deployment units I've missed?
   - **Environments:** Is the environment promotion path correct? Is the environment-specific configuration complete?
   - **Pipeline:** Are the CI/CD changes correct? Are there pipeline stages that need to be added or modified?
   - **Release strategy:** Is the chosen release approach appropriate for the risk profile? Is the rollout progression acceptable?
   - **Sequence:** Is the deployment ordering correct? Are the dependencies between phases right?
   - **Migration coordination:** Is the migration phasing safe? Can old code and new code coexist during the rollout?
   - **Rollback:** Are the rollback triggers appropriate? Are the rollback procedures complete and achievable within the RTO?
   - **Post-deployment:** Are the smoke tests sufficient? Is the monitoring window appropriate?
   - **Traceability:** Is every deployment decision connected to a requirement or constraint?
3. If the user identifies corrections, update and re-present before proceeding.
4. Do not proceed until the user explicitly confirms the deployment strategy is accurate.

## Completion Criteria

- [ ] For brownfield: existing deployment infrastructure is extracted from the codebase (CI/CD pipelines, Dockerfiles, K8s manifests, deployment scripts) and confirmed by the user
- [ ] Every new or modified component from the system design (Section 3) has a corresponding deployment unit
- [ ] Environment promotion path is defined with environment-specific configuration
- [ ] New secrets are documented with storage location, access control, rotation policy, and injection method
- [ ] CI/CD pipeline changes are defined — new or modified stages, gates between stages
- [ ] Container builds (if containerized) specify base image, build target, health check, and resource limits
- [ ] Release strategy is chosen based on a documented risk assessment, with rationale
- [ ] Deployment sequence is defined with explicit ordering, dependencies, pre-conditions, and verification per step
- [ ] If data model changes: migration coordination specifies pre-deploy vs. post-deploy classification and coexistence strategy (consistent with Section 6)
- [ ] If breaking migrations: phased approach is defined with multiple deployment cycles
- [ ] Rollout progression criteria are defined — what must pass to advance to the next rollout stage
- [ ] Rollback triggers are defined — specific conditions that halt or reverse the deployment
- [ ] Rollback procedure is defined per deployment unit with estimated time and data impact
- [ ] Rollback ordering is the reverse of deployment ordering
- [ ] Post-deployment smoke tests are defined with expected results
- [ ] Canary monitoring window is defined with specific signals, baselines, and alert thresholds
- [ ] Sign-off checklist is complete
- [ ] The deployment strategy meets the availability SLA and RTO from the NFRs
- [ ] Requirements traceability is complete — every deployment decision traces to a requirement, constraint, or design output
- [ ] The user has explicitly confirmed the deployment strategy is accurate

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Database migration runs after code deployment, and the new code fails because the schema hasn't changed yet | Step 7 defines explicit deployment sequencing — migrations run in Phase 2 before backend deployment in Phase 3; Step 8 classifies each migration as pre-deploy or post-deploy |
| A breaking database migration is applied, and old code (still running during rolling deployment) crashes | Step 8 classifies migrations by coexistence safety; breaking migrations require a phased multi-cycle approach |
| Feature ships to 100% of users immediately, and a bug in the payment gateway integration causes mass refund failures | Step 6 selects canary or feature flag strategy based on risk assessment; Step 9 defines progressive rollout (5% → 25% → 100%) with criteria to advance |
| An error is detected after deployment, but no one knows how to rollback, or the rollback takes too long | Step 9c defines rollback procedure per deployment unit with method, estimated time, and verification; rollback ordering is the reverse of deployment |
| The deployment is "successful" but no one verifies the feature actually works — users discover it's broken | Step 10 defines post-deployment smoke tests that must pass before the rollout progresses |
| A new service is deployed but its required infrastructure (queue, cache, DNS) doesn't exist yet | Step 3 maps each deployment unit's dependencies; Step 7 sequences infrastructure provisioning (Phase 1) before service deployment (Phase 3) |
| Secrets for the new feature are hardcoded in the codebase or missing from production config | Step 4c defines every new secret with storage location, access control, rotation policy, and injection method |
| The CI/CD pipeline runs the existing test suite but doesn't include tests for the new feature | Step 5a defines new or modified pipeline stages including new test suites |
| A rollout is expanded to 100% even though latency has increased significantly — no one checked | Step 9a defines explicit progression criteria — latency thresholds must be met before advancing |
| A canary deployment looks healthy, but no one defined what "healthy" means for this feature | Step 10b defines specific signals to monitor with baselines and alert thresholds |
| The deployment process for the new feature differs from the existing process, confusing operations | Step 2 (brownfield) extracts existing deployment patterns and Step 5 designs pipeline changes that extend — not replace — the existing approach |
| Infrastructure changes are made manually with no IaC, making them unreproducible and unrollbackable | Step 3 identifies infrastructure dependencies; Step 7 requires infrastructure provisioning via IaC (Phase 1) with rollback via IaC |
