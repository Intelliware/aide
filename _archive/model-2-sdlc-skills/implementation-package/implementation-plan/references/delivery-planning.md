# Delivery Planning

## Purpose

Plan how the feature is delivered to a live system, covering two concerns in a single skill: (1) migration planning — database migration scripts, rollback scripts, data backfill strategies, migration ordering relative to code deployment, and zero-downtime migration techniques; (2) phased delivery planning — deployment sequencing (schema first, API behind flag, then UI), inter-phase dependencies, rollback boundaries per phase, and validation criteria that gate progression to the next phase. Bridges the gap between the architect's deployment-strategy and data-model-design and the developer's implementation-plan-creator for brownfield delivery. Conditional — only runs when the feature involves database changes, multi-deployment rollout, or changes to a live system that require coordinated delivery sequencing. The developer's implementation-level response to the architect's deployment-strategy and migration-strategy.

## What This Produces

A concrete plan for safely delivering a feature to a live system — migration scripts and their ordering, phased deployment sequencing, rollback boundaries, and validation gates. This plan ensures that the implementation-plan-creator (Step 6) sequences tasks in a deployment-safe order and that each delivery phase is independently deployable and rollback-safe.

This is the developer's response to the architect's deployment strategy (Section 12) and data model design (Section 6). The architect defines *what* to deploy and the migration approach at a design level. This skill translates that into developer-level delivery steps — the actual migration files to write, the order to deploy them, what to validate between phases, and how to roll back if something fails.

## When to Use

- **Conditional** — Step 4 of implementation planning
- Only runs when the feature involves:
  - Database schema changes (new tables, modified columns, index changes)
  - Multi-deployment rollout (schema deployed separately from code, feature flag gating, phased rollout)
  - Changes to a live system that require coordinated delivery sequencing (API versioning, backward-compatible transitions)
- Skip this skill if the feature has no database changes, no multi-step deployment, and no live system coordination — simple code-only features do not need delivery planning
- When skipped, the implementation-plan-creator still consumes the architect's deployment strategy directly

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Codebase analysis | `docs/<feature>/implementation-package/plan/codebase-analysis.md` — Section 4 (Code Dependencies: migration tooling, ORM config) and Section 6 (Conventions: migration naming, versioning) | Yes |
| Test plan | `docs/<feature>/implementation-package/plan/test-plan.md` — regression coverage, integration test expectations | Yes |
| Prerequisites plan | `docs/<feature>/implementation-package/plan/prerequisites-plan.md` — infrastructure provisioning, CI/CD modifications | Yes |
| Solution design — data model design | `docs/<feature>/solutions-package/design/06-data-model-design.md` — entity changes, migration list, coexistence strategy, schema evolution approach (additive vs. breaking) | If database changes |
| Solution design — deployment strategy | `docs/<feature>/solutions-package/design/12-deployment-strategy.md` — deployment sequence, release strategy, rollout progression criteria, rollback triggers, migration coordination | Yes |
| Solution design — API design | `docs/<feature>/solutions-package/design/07-api-design.md` — breaking vs. non-breaking API changes, versioning approach | If API changes |
| Solution design — backend design | `docs/<feature>/solutions-package/design/05-backend-design.md` — new services, background jobs, queue consumers | If backend changes |
| Requirements package — assumptions/constraints/scope | `docs/<feature>/requirements-package/requirements/assumptions-constraints-scope.md` — zero-downtime requirement, maintenance windows, rollback conditions | Yes |
| Access to the codebase | Local filesystem — existing migration files, migration runner config, deployment scripts | Yes — the AI reads actual migration patterns |

> **Missing input guard:** If the solution package, requirements package, or any required upstream planning output cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[path]` but it was not found. This input is required. Please provide it or confirm I should proceed without it."*

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  DELIVERY PLANNING — INTERNAL SEQUENCE                            │
├──────────────────────────────────────────────────────────────────┤
│  1. LOAD — Read all inputs                                       │
│     Read codebase analysis (migration patterns, ORM config),     │
│     solution design (data model, deployment strategy, API),      │
│     prerequisites plan (infrastructure timing),                  │
│     requirements (constraints).                                   │
├──────────────────────────────────────────────────────────────────┤
│  2. MIGRATIONS — Plan database migration scripts                 │
│     Migration files to write, naming, ordering,                  │
│     rollback scripts, data backfills,                            │
│     zero-downtime techniques.                                    │
├──────────────────────────────────────────────────────────────────┤
│  3. PHASES — Define delivery phases                              │
│     Slice the delivery into independently deployable phases.     │
│     Each phase is a logical unit — deployable, testable,         │
│     and rollback-safe on its own.                                │
├──────────────────────────────────────────────────────────────────┤
│  4. DEPENDENCIES — Map inter-phase dependencies                  │
│     Which phases block which. No forward dependencies.           │
│     Infrastructure before schema, schema before code,            │
│     code before UI.                                              │
├──────────────────────────────────────────────────────────────────┤
│  5. ROLLBACK — Define rollback boundaries                        │
│     Per-phase rollback strategy. What can be independently       │
│     rolled back. What requires coordinated rollback.             │
│     Data-loss risk per rollback.                                 │
├──────────────────────────────────────────────────────────────────┤
│  6. GATES — Define validation criteria per phase                 │
│     What must pass before progressing to the next phase.         │
│     Automated checks, manual checks, monitoring signals.        │
├──────────────────────────────────────────────────────────────────┤
│  7. VALIDATE — Check completeness and safety                     │
│     Every migration has a rollback. Every phase is               │
│     independently deployable. No orphaned phases.               │
├──────────────────────────────────────────────────────────────────┤
│  8. ASSEMBLE — Write the delivery plan                           │
│     Produce the structured output. Present for review.           │
└──────────────────────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Load Inputs

Read all inputs. If the codebase analysis, test plan, and prerequisites plan are not yet complete, stop — this skill depends on all three.

From the **codebase analysis** (Section 4 — Code Dependencies and Section 6 — Conventions), note:
- Migration tool and runner (e.g., TypeORM migrations, Flyway, Alembic, ActiveRecord migrations, Goose, Entity Framework migrations)
- Migration naming convention (timestamp prefix, sequential numbering, descriptive suffix)
- Migration file location (e.g., `src/migrations/`, `db/migrate/`, `migrations/`)
- Existing migration patterns — read 2-3 recent migration files to understand the structure, rollback approach, and any project-specific conventions
- ORM configuration — auto-run vs. explicit migration execution

From the **solution design — data model design** (Section 6), note:
- Migration list — each migration the architect defined
- Coexistence strategy — can old code and new code run against the same schema during deployment?
- Schema evolution approach — additive (safe to deploy before code) vs. breaking (requires expand-contract or phased approach)

From the **solution design — deployment strategy** (Section 12), note:
- Deployment sequence — what deploys in what order
- Release strategy — rolling, canary, blue-green, feature flags
- Rollout progression criteria — what must pass before expanding
- Rollback triggers — what triggers rollback and how fast
- Migration coordination — how schema changes coordinate with code deployment

From the **prerequisites plan**, note:
- Infrastructure provisioning timing — new databases, caches, queues must exist before migrations run
- CI/CD pipeline changes — migration steps in the pipeline
- Lead time items — anything that blocks the delivery timeline

### Step 2 — Plan Database Migrations

Translate the architect's migration list (from data model design, Section 6) into concrete migration files the developer will write. Read existing migration files in the codebase to match the project's conventions.

**Step 2a — Migration inventory.**

For each schema change the data model design specifies:

| Migration | File Name | Type | Reversible? | Coexistence | Deploy Phase |
|-----------|-----------|------|-------------|-------------|-------------|
| *(Create refunds table)* | *(YYYYMMDDHHMMSS_create_refunds_table)* | *(Additive — new table)* | *(Yes — drop table)* | *(Safe — old code ignores new table)* | *(Phase 1 — deploy before code)* |
| *(Add refund_status to orders)* | *(YYYYMMDDHHMMSS_add_refund_status_to_orders)* | *(Additive — new nullable column)* | *(Yes — drop column)* | *(Safe — old code ignores new column)* | *(Phase 1 — deploy before code)* |
| *(Add NOT NULL constraint to refund_status)* | *(YYYYMMDDHHMMSS_add_refund_status_not_null)* | *(Breaking — requires data backfill first)* | *(Yes — remove constraint)* | *(Unsafe — old code cannot write NULL)* | *(Phase 3 — after backfill and code deployment)* |

**Migration naming:** Follow the project's existing convention. If the project uses timestamp prefixes, use timestamps. If sequential numbers, use the next number in sequence. If descriptive suffixes, match the style.

**Step 2b — Migration ordering.**

Order migrations based on two constraints:

1. **Schema dependencies** — a migration that adds a foreign key must run after the migration that creates the referenced table
2. **Coexistence requirements** — additive migrations (new tables, new nullable columns) can safely run before code deployment; breaking migrations (NOT NULL on existing columns, column type changes, column renames) must wait until code handles both states

```
Migration ordering rules:
1. Additive migrations FIRST — safe to run before code
2. Code deployment — code handles both old and new schema
3. Data backfill — populate new columns/tables with existing data
4. Constraint migrations LAST — only after all code writes correct values
```

**Step 2c — Rollback scripts.**

For each migration, define the corresponding rollback:

| Migration | Rollback Action | Data Loss Risk | Rollback Ordering |
|-----------|----------------|---------------|-------------------|
| *(Create refunds table)* | *(Drop refunds table)* | *(Yes — all refund data lost)* | *(Rollback last — after code rollback)* |
| *(Add refund_status to orders)* | *(Drop refund_status column)* | *(Yes — status data lost)* | *(Rollback after removing code references)* |
| *(Add NOT NULL constraint)* | *(Remove NOT NULL constraint)* | *(No — data preserved)* | *(Rollback first — before code rollback)* |

**Rollback ordering is the reverse of migration ordering.** Constraint rollbacks happen first, then code rollback, then additive rollbacks last.

**Step 2d — Data backfill strategy.**

If any migration requires populating existing rows with new data:

| Backfill | What It Does | Row Count Estimate | Strategy | Timing |
|----------|-------------|-------------------|---------|--------|
| *(Set refund_status = 'none' for existing orders)* | *(Populate new column with default value)* | *(~500K rows)* | *(Batched UPDATE — 1000 rows per batch with 100ms sleep)* | *(After additive migration, before NOT NULL constraint)* |

**Backfill sizing matters.** For large tables, a single `UPDATE ... SET column = value` can lock the table and block writes. Plan batched updates with explicit batch size and sleep interval. For very large tables (millions of rows), consider background job processing.

**Step 2e — Zero-downtime migration techniques.**

If the coexistence strategy (from the data model design) requires zero-downtime, identify which technique applies to each breaking change:

| Technique | When to Use | Example |
|-----------|------------|---------|
| **Expand-contract** | Renaming a column, changing a column type | Add new column → deploy code that writes to both → backfill → deploy code that reads from new only → drop old column |
| **Additive-only** | Adding new tables, new nullable columns | Deploy migration before code — old code ignores new schema elements |
| **Dual-write** | Splitting a table, moving data to a new service | Code writes to both old and new locations → backfill → switch reads → stop old writes |
| **Ghost table** | Large-table schema changes (e.g., pt-online-schema-change) | Tool creates shadow table, copies data, swaps atomically |

For each breaking migration, specify which technique applies and what the expand-contract (or equivalent) phases look like.

### Step 3 — Define Delivery Phases

Slice the overall delivery into phases. Each phase is a logical unit that can be deployed, tested, and rolled back independently. A delivery phase may map to one or more implementation plan phases (the implementation-plan-creator makes that mapping).

**Phasing principles:**

- **Each phase is independently deployable** — deploying phase N does not break the system if phase N+1 never ships. This is the single most important rule.
- **Each phase delivers value or enables value** — a phase either delivers user-visible functionality or provides infrastructure that a later phase depends on. No phase exists purely to "prepare" without being independently useful or stable.
- **No forward dependencies** — phase N never depends on phase N+1. If deploying phase N would break without phase N+1, they are the same phase.
- **Smaller phases are safer** — a phase that changes 5 files is easier to review, deploy, and roll back than a phase that changes 50. When in doubt, split.
- **Each phase is one logical unit** — focused scope makes it easier to review, independently shippable, and simpler to roll back if needed.

**Step 3a — Phase inventory.**

Define each delivery phase:

| Phase | Name | What It Contains | Deployable Independently? | User-Visible? |
|-------|------|-----------------|--------------------------|---------------|
| *(1)* | *(Schema expansion)* | *(Additive migrations: create refunds table, add refund_status column)* | *(Yes — old code ignores new schema)* | *(No — no UI or API changes)* |
| *(2)* | *(Backend API behind flag)* | *(Refund API endpoints, business logic, feature flag check — all gated by FEATURE_REFUNDS_ENABLED=false)* | *(Yes — endpoints exist but flag is off)* | *(No — flag is disabled in prod)* |
| *(3)* | *(Data backfill)* | *(Backfill refund_status for existing orders, add NOT NULL constraint)* | *(Yes — backfill is idempotent)* | *(No — data change only)* |
| *(4)* | *(Frontend UI)* | *(Refund UI components, routing, API integration — behind same feature flag)* | *(Yes — flag still off)* | *(No — flag is disabled)* |
| *(5)* | *(Flag enablement)* | *(Enable FEATURE_REFUNDS_ENABLED in production via gradual rollout)* | *(Yes — toggle only)* | *(Yes — users see refund functionality)* |

**Step 3b — Phase sizing.**

Each phase should be reviewable in a single PR (or a small number of related PRs). If a phase would require more than ~20 changed files, consider splitting it into smaller phases. A large phase is harder to review, harder to debug if deployment fails, and harder to roll back.

However, do not split phases so small that they create excessive deployment overhead. The right granularity is a single logical unit — one concern, one deployment, one rollback boundary.

### Step 4 — Map Inter-Phase Dependencies

Define the dependency graph between delivery phases. Dependencies flow forward only — no phase depends on a future phase.

**Step 4a — Dependency table.**

| Phase | Depends On | Blocks | Why |
|-------|-----------|--------|-----|
| *(1 — Schema expansion)* | *(Prerequisites complete: Redis provisioned, CI/CD updated)* | *(2, 3)* | *(Backend code needs tables to exist; backfill needs columns to exist)* |
| *(2 — Backend API)* | *(1 — Schema expansion)* | *(4)* | *(Frontend needs API endpoints to call)* |
| *(3 — Data backfill)* | *(1 — Schema expansion, 2 — Backend API)* | *(Nothing — NOT NULL constraint is optional hardening)* | *(Backfill runs after code writes correct values to new column)* |
| *(4 — Frontend UI)* | *(2 — Backend API)* | *(5)* | *(UI calls API endpoints; flag enablement needs UI deployed)* |
| *(5 — Flag enablement)* | *(2, 3, 4)* | *(Nothing — this is the final phase)* | *(All code and data must be in place before users see the feature)* |

**Step 4b — Dependency visualization.**

```
Prerequisites ──► Phase 1 (Schema) ──► Phase 2 (Backend API) ──► Phase 4 (Frontend UI) ──► Phase 5 (Flag on)
                         │                      │
                         └──────► Phase 3 (Backfill) ────────────────────────────────────────────┘
```

**Step 4c — Parallel opportunities.**

Identify phases that can be developed (not necessarily deployed) in parallel:

| Parallel Track | Phases | Why They Can Parallel | Constraint |
|---------------|--------|----------------------|-----------|
| *(Backend + Frontend development)* | *(2 and 4)* | *(Different codebases / files; API contract agreed)* | *(Phase 4 cannot deploy until Phase 2 is deployed)* |

### Step 5 — Define Rollback Boundaries

For each delivery phase, define what happens if it needs to be rolled back after deployment.

| Phase | Rollback Method | What Gets Rolled Back | Data Impact | Time to Rollback | Coordinated? |
|-------|----------------|----------------------|-------------|-----------------|-------------|
| *(1 — Schema expansion)* | *(Run rollback migration)* | *(Drop new table and column)* | *(Data loss — any data written to new table is lost)* | *(< 1 minute)* | *(No — independent of code)* |
| *(2 — Backend API)* | *(Redeploy previous version)* | *(Remove API endpoints)* | *(No data impact — flag was off, no user data written)* | *(< 5 minutes)* | *(No — schema stays; old code ignores it)* |
| *(3 — Data backfill)* | *(Remove NOT NULL constraint; data stays)* | *(Remove constraint only)* | *(No data loss — backfilled data stays, just constraint removed)* | *(< 1 minute)* | *(No — code handles NULL values)* |
| *(4 — Frontend UI)* | *(Redeploy previous frontend version)* | *(Remove refund UI pages)* | *(No data impact)* | *(< 5 minutes)* | *(No — backend stays)* |
| *(5 — Flag enablement)* | *(Disable feature flag)* | *(Hide feature from users)* | *(Potential in-flight refunds — handle gracefully)* | *(Immediate — flag toggle)* | *(No — fastest rollback)* |

**Rollback rules:**

- **Every phase must have a defined rollback.** If a phase cannot be rolled back, it must be flagged as a high-risk phase with mitigation (e.g., backup before deployment, extended monitoring window).
- **Rollback order is the reverse of deployment order.** If you deployed 1 → 2 → 3, you roll back 3 → 2 → 1.
- **Data-destructive rollbacks require explicit acknowledgement.** If rolling back a migration deletes data, flag it. The user must decide whether to back up the data before the migration or accept the risk.
- **Feature flag rollback is always the fastest.** If the feature is gated behind a flag, disabling the flag is the first line of defense — it's immediate, no deployment required. Code and schema rollback are secondary.

### Step 6 — Define Validation Gates

For each delivery phase, define what must pass before progressing to the next phase. These are the "checkpoints" that gate forward progress.

| Phase | Gate Type | Validation Criteria | Who Validates | Pass/Fail |
|-------|-----------|-------------------|--------------|-----------|
| *(1 — Schema expansion)* | *(Automated)* | *(Migration runs without error; rollback runs without error; existing tests pass; no table locks exceed threshold)* | *(CI pipeline)* | *(All must pass)* |
| *(1 — Schema expansion)* | *(Manual)* | *(Review migration SQL; confirm coexistence — old application still works against new schema)* | *(Developer / DBA)* | *(Approval required)* |
| *(2 — Backend API)* | *(Automated)* | *(All unit tests pass; integration tests pass; API contract tests pass; feature flag correctly gates endpoints)* | *(CI pipeline)* | *(All must pass)* |
| *(2 — Backend API)* | *(Monitoring)* | *(No increase in error rate after deployment; no increase in latency; health checks pass)* | *(Observability dashboard)* | *(Monitor for 15 minutes post-deploy)* |
| *(3 — Data backfill)* | *(Automated)* | *(Backfill completes without error; row count matches expected; NOT NULL constraint applies without failures)* | *(Migration runner / script)* | *(All must pass)* |
| *(4 — Frontend UI)* | *(Automated)* | *(Build succeeds; E2E tests pass with flag enabled in test environment)* | *(CI pipeline)* | *(All must pass)* |
| *(5 — Flag enablement)* | *(Monitoring)* | *(Error rate stable; refund API response times within SLA; no payment gateway errors; customer-facing smoke test passes)* | *(Observability + on-call)* | *(Monitor for 1 hour at 1% rollout, then expand)* |

**Gate rules:**

- **Automated gates are non-negotiable.** If a CI check fails, the phase does not progress.
- **Monitoring gates have time windows.** Define how long to monitor before declaring success (e.g., 15 minutes, 1 hour, 24 hours).
- **Manual gates require explicit sign-off.** Document who approves and what they check.
- **Failing a gate does not mean rollback.** It means pause — investigate the failure, fix if possible, then retry the gate. Rollback only if the fix is not feasible or the failure impacts users.

### Step 7 — Validate

Check the delivery plan for completeness and safety:

- **Migration coverage** — does every schema change in the data model design (Section 6) have a corresponding migration in Step 2?
- **Rollback coverage** — does every migration have a rollback script? Does every phase have a rollback strategy?
- **Coexistence safety** — is the migration ordering compatible with the coexistence strategy? Can old code run against the new schema during the deployment window?
- **Phase independence** — can each phase be deployed without breaking the system if the next phase never ships?
- **No forward dependencies** — does any phase depend on a future phase?
- **Gate completeness** — does every phase have at least one validation gate?
- **Data safety** — are data-destructive rollbacks flagged? Are backfill strategies batched for large tables?
- **Prerequisites alignment** — are infrastructure resources from the prerequisites plan available before the first delivery phase?
- **Test plan alignment** — do the regression tests from the test plan cover the delivery phases? Are integration tests planned for each phase?
- **Deployment strategy alignment** — does the phased delivery match the architect's deployment strategy (Section 12)?

If any check fails, flag it as **NEEDS CLARIFICATION** with a specific question for the user.

**Readiness assessment:**

| Status | Meaning | Action |
|--------|---------|--------|
| **READY** | All checks pass, no NEEDS CLARIFICATION remaining | Proceed to hand-off gate |
| **NEEDS WORK** | One or more items need user input | Present questions, resolve, re-validate |
| **BLOCKED** | A delivery constraint cannot be met (e.g., zero-downtime required but migration is inherently breaking with no expand-contract path) | Escalate to user and architect |

### Step 8 — Assemble

Combine all sections into the delivery plan document. This becomes the fourth artifact of the implementation planning phase.

### File Output

Write the completed delivery plan to `docs/<feature>/implementation-package/plan/delivery-plan.md`.

---

## Output Structure

**1. Migration Plan** — migration inventory, ordering, rollback scripts, data backfill strategies, zero-downtime techniques (from Step 2)

**2. Delivery Phases** — phase inventory with contents, sizing, independent deployability (from Step 3)

**3. Phase Dependencies** — dependency table, visualization, parallel opportunities (from Step 4)

**4. Rollback Boundaries** — per-phase rollback strategy, data impact, coordinated rollbacks (from Step 5)

**5. Validation Gates** — per-phase validation criteria, gate types, pass/fail rules (from Step 6)

---

## Hand-off Gate

Before proceeding to `project-context-generator` (Step 5), you must:

1. Write the completed delivery plan in full.
2. Present it to the user for review with the following questions:
   - **Migrations:** Are the migration files named correctly for your project? Is the migration ordering correct? Are there existing data constraints I didn't account for?
   - **Coexistence:** Can your production code genuinely run against the expanded schema? Are there queries that would break?
   - **Backfills:** Are the row count estimates realistic? Is the batching strategy appropriate for your database (batch size, sleep interval)?
   - **Delivery phases:** Is the phasing correct? Should any phases be split further or combined? Is the phase ordering right?
   - **Rollback:** Are the rollback strategies feasible? Are there data-destructive rollbacks you want to mitigate with pre-deployment backups?
   - **Validation gates:** Are the gate criteria realistic? Are the monitoring time windows appropriate for your system?
   - **Dependencies:** Are there deployment dependencies I missed (e.g., external API changes, third-party coordination)?
   - **Timeline:** Do the delivery phases align with your timeline? Are there hard deadlines that constrain the phasing?
3. If the user identifies corrections, update and re-present before proceeding.
4. Do not proceed until the user explicitly confirms the delivery plan is accurate.

## Completion Criteria

- [ ] Every schema change in the data model design has a corresponding migration with a defined file name
- [ ] Migration ordering respects schema dependencies and coexistence requirements
- [ ] Every migration has a rollback script with documented data impact
- [ ] Data backfills for large tables use batched strategies with explicit batch size and sleep interval
- [ ] Zero-downtime techniques are specified for every breaking schema change (if zero-downtime is required)
- [ ] Delivery is sliced into independently deployable phases
- [ ] No delivery phase has a forward dependency (phase N never depends on phase N+1)
- [ ] Each delivery phase can be deployed without breaking the system if the next phase never ships
- [ ] Phase sizing is reasonable — no phase changes more than ~20 files unless justified
- [ ] Inter-phase dependencies are mapped with a clear dependency graph
- [ ] Parallel development opportunities are identified (phases that can be developed concurrently even if deployed sequentially)
- [ ] Every delivery phase has a defined rollback strategy
- [ ] Data-destructive rollbacks are flagged with mitigation options
- [ ] Every delivery phase has at least one validation gate (automated, manual, or monitoring)
- [ ] Monitoring gates have defined time windows
- [ ] The delivery plan aligns with the architect's deployment strategy (Section 12)
- [ ] The delivery plan aligns with the prerequisites plan (infrastructure available before first phase)
- [ ] The user has explicitly confirmed the delivery plan is accurate

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| A migration runs in production but breaks the running application because old code cannot handle the new schema | Step 2a documents coexistence for each migration; Step 2b orders additive migrations before code deployment; Step 2e specifies expand-contract for breaking changes |
| A migration is deployed but cannot be rolled back, leaving the database in an inconsistent state after a failed deployment | Step 2c requires a rollback script for every migration with documented data impact |
| A data backfill on a large table locks the table for minutes, blocking all writes and causing an outage | Step 2d requires batched updates with explicit batch size and sleep interval for large tables |
| A column is renamed in a single migration, breaking all queries that reference the old name during the deployment window | Step 2e specifies expand-contract: add new column → dual-write → backfill → switch reads → drop old column |
| Code is deployed before the database migration runs, causing immediate errors on first query to a missing table | Step 3 defines delivery phases with explicit ordering — schema expansion phase deploys before code phase |
| A feature is partially deployed (backend but no frontend) and the partial state breaks user workflows | Step 3a ensures each phase is independently deployable — partial deployment is a valid system state |
| A deployment fails but there is no clear rollback path because multiple changes were bundled into one deployment | Step 5 defines per-phase rollback boundaries — each phase can be independently rolled back |
| A deployment to production succeeds but causes subtle performance degradation that is only noticed hours later | Step 6 defines monitoring gates with time windows — the deployment is monitored for a defined period before progressing |
| The developer merges backend and schema changes into a single PR, making rollback impossible without reverting both | Step 3b recommends splitting phases to keep PR scope reviewable and rollback boundaries clean |
| Phase 3 is deployed but Phase 2 hasn't been deployed yet, causing errors because Phase 3 depends on Phase 2's API | Step 4 maps inter-phase dependencies so the implementation plan creator can enforce deployment ordering |
| A backfill is run but the NOT NULL constraint fails because some rows were missed by the backfill query | Step 2d plans backfill strategies with row count estimates; Step 6 validates backfill completeness before applying constraints |
| A feature flag is enabled in production before all phases are deployed, exposing an incomplete feature to users | Step 3a sequences flag enablement as the final phase, after all code and data phases are complete |
