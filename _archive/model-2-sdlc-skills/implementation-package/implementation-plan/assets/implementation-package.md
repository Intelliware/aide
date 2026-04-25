# Implementation Package

<!-- TODO: Add template content —

This is a single, self-contained document. All content is embedded inline — no links to external documents.
The implementation package is the complete input that AI coding agents consume. An agent loads this document
and executes it task-by-task without needing to reference the solution package, requirements package, or any
intermediate planning artifacts.

## Section 1: Project Context

### 1.1 Codebase Conventions
(Full content from project-context-generator — naming conventions with codebase examples, established code patterns
the new code must follow (DI, state management, API layer, error handling, logging), architectural boundaries,
import/dependency conventions, style/formatting rules)

### 1.2 Testing Conventions
(Testing subsection from project-context-generator — test file location, naming, fixture/factory patterns, assertion
style, mock approach, test runner configuration — sourced from existing-test-analysis)

### 1.3 Codebase Gotchas
(Gotchas subsection from project-context-generator — unusual patterns, legacy code that looks wrong but is intentional,
areas with implicit coupling, known quirks in the affected areas)

### 1.4 Feature-Specific Cross-Cutting Rules
(Rules from the solution package's error handling design, observability design, security architecture, and
cross-cutting concerns design that apply across multiple tasks in this feature. Stated once here rather than
repeated per task. Examples: error response format all new endpoints must use, logging/tracing standards all new
service methods must emit, permission model all new endpoints must enforce, caching strategy, rate limiting rules,
transaction management approach, i18n requirements. Each rule includes a concrete example showing the expected
pattern in the project's language/framework. For brownfield: distinguishes rules that match existing codebase
patterns from rules that introduce new patterns the feature requires)

## Section 2: Test Strategy

### 2.1 Test Approach
(Full content from test-strategy — test types required, coverage targets, mocking strategy and boundaries, test data
approach, integration test scope and isolation, test file structure and naming conventions, shared test utilities needed,
CI test execution expectations)

### 2.2 Regression Test Plan
(Full content from regression-test-planning — affected code paths mapped to existing tests, coverage gaps flagged,
new regression tests defined for the boundary between old and new code, smoke test suites for pre/post-deployment)

### 2.3 Existing Test Modifications
(Full content from existing-test-modification-planning — existing tests that will break due to intentional behavioral
changes, grouped by test file, with the specific modification needed for each: updated assertions, updated fixtures,
updated setup/teardown, or full replacement)

## Section 3: Prerequisites

### 3.1 Dependency Changes
(Full content from dependency-planning — new libraries to add with exact package names and version ranges, existing
libraries to upgrade, compatibility assessment, sequenced early so conflicts surface before dependent code)

### 3.2 Environment Setup
(Full content from environment-setup-planning — new environment variables and secrets, new service dependencies,
database migration scripts for local dev, local dev setup changes, CI/CD pipeline modifications, infrastructure
provisioning)

### 3.3 Configuration Changes
(Full content from configuration-planning — feature flag definitions and targeting rules, environment variables per
environment, config file changes, deployment ordering, secret management requirements, default values and fallback
behavior, cleanup plan for temporary flags)

### 3.4 Database Migrations
(Full content from migration-planning — schema changes summary, migration script inventory, execution order, rollback
script for each migration, data backfill strategy, zero-downtime approach, deployment ordering, verification queries,
rollback triggers)

## Section 4: Delivery Plan

### 4.1 Decomposition Rationale
(Full content from task-decomposition-strategy — decomposition strategy chosen and why, task granularity rules,
verification checkpoints)

### 4.2 Phased Delivery Plan
(Full content from phased-delivery-planning — deployment sequencing, inter-phase dependencies, rollback boundaries
per phase, validation criteria that gate progression — or "Single-phase delivery" with rationale)

## Section 5: Implementation Tasks

### 5.1 Task Inventory
(Full content from implementation-plan-creator — the ordered task list. Each task specifies:
- Task ID
- Files to create or modify with exact paths
- The specific change to make (what code to add, modify, or remove)
- Design specification — the relevant design detail embedded inline from the solution package (e.g., API contract
  with request/response schemas and error cases, data model definition with column types and constraints, security
  rules with permission checks, integration contract with message schemas). Embedded so the agent does not need to
  reference the solution package.
- Acceptance criteria — ALL testable pass/fail conditions embedded inline from the requirements package that this
  task must satisfy, including FR ACs (`AC-REQ-`), business rule ACs (`AC-BR-`), data ACs (`AC-DATA-`), permission
  ACs (`AC-ACR-`, `AC-PERM-`), NFR ACs (`AC-NFR-`), and error-path ACs from any artifact type. Embedded so
  test-creator skills have the behavioral specification needed to write meaningful tests without referencing the
  requirements package.
- Existing patterns to follow (with references to Section 1 and the cross-cutting rules in Section 1.4)
- Verification steps to confirm the task is complete (tests to run, behavior to check)
- Rollback approach if the change breaks something
- Traceability — the solution package section and requirement IDs this task implements (for audit, not for agent
  consumption — the operational content is already embedded above)

Tasks are sequenced per the decomposition rationale — prerequisites before dependent code, high-risk tasks
front-loaded, each task independently verifiable)

## Section 6: Traceability

### 6.1 Solution Package Coverage
(Each design decision from the solution package mapped to the implementation task(s) that realize it — confirms
no design decisions are missed)

### 6.2 Requirements Coverage
(Each requirement from the requirements package mapped to the implementation task(s) and test(s) that satisfy it —
confirms no requirements are missed)

## Section 7: Verification and Readiness

### 7.1 Plan Self-Review Results
(Full content from plan-self-review — spec coverage gaps resolved, placeholders removed, type/name consistency
across tasks confirmed, missing verification steps added)

### 7.2 Readiness Checklist
- [ ] All review gates passed (review-plan-readiness approved)
- [ ] No placeholder content remaining in any section
- [ ] All tasks have exact file paths (no abstract module references)
- [ ] All tasks have verification steps
- [ ] All tasks have design specification embedded inline (not just a reference to the solution package)
- [ ] All tasks have acceptance criteria embedded inline (not just a reference to the requirements package)
- [ ] All tasks have traceability back to solution package section and requirement IDs
- [ ] Prerequisite tasks (dependencies, config, migrations) are sequenced before dependent code
- [ ] High-risk tasks (migrations, integration points, shared code) are front-loaded
- [ ] Test modification tasks are sequenced alongside the code changes that cause breakage
- [ ] Regression test tasks cover all affected code paths identified in regression-test-planning
- [ ] Verification checkpoints are defined at phase boundaries
- [ ] Project context section has concrete codebase examples (no abstract descriptions)
- [ ] Decomposition rationale explains strategy choice for this specific feature and codebase

-->
