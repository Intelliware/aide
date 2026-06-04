---
slug: execution-strategy
sequence: 8
depends-on-prior: true
---

# Step 8 — Execution Strategy

## Purpose

Capture how QE tests are executed across all environments. Produce an execution strategy document as a first-class artifact of the QE package.

## Procedure

Ask the user:

> How do you execute (or plan to execute) these tests across environments? Please provide detail for each:
>
> **Local development:**
> - How are tests triggered locally? (IDE, CLI command, script?)
> - What infrastructure must be running? (local broker, Docker containers, stubs?)
> - Any special configuration or profiles?
>
> **Lower environments (e.g., DEV, SIT, QA):**
> - How are tests triggered? (CI pipeline, manual, scheduled?)
> - How is infrastructure provisioned?
> - Any environment-specific configuration?
>
> **Upper environments (e.g., UAT, staging, pre-prod, production):**
> - How are tests triggered?
> - Are there restrictions (e.g., read-only, subset of tests, smoke only)?
> - Any approval gates before execution?

If the user has existing test execution processes, ask them to describe those. If they don't yet have a process, help them define one based on the topology and tech stack gathered earlier.

### Produce execution-strategy.md

Once the information is gathered, draft `{paths.qe_package}/execution-strategy.md` covering:

1. **Overview** — summary of the execution approach
2. **Prerequisites** — infrastructure, services, configuration required per environment
3. **Local Execution** — step-by-step instructions for running tests locally
4. **Lower Environment Execution** — CI/CD integration, triggers, configuration
5. **Upper Environment Execution** — gates, restrictions, subset selection
6. **Tag-Based Filtering** — how to run subsets (smoke, regression, specific categories)
7. **Reporting** — where results go, how to interpret them

Present the draft to the user for review.

## Acknowledgement checkpoint

Present the execution strategy document. Ask: "Does this execution strategy capture how tests should be run?" Wait for confirmation. Write the file on approval.

## Next

Proceed to `steps/09-generate-plan.md`.
