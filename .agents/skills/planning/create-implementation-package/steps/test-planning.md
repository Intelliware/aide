---
slug: test-planning
sequence: 2
depends-on-prior: true
---

# Step 2 — Test Planning

## Purpose

Define the test strategy that the AI Gate of every increment will reference.
Test planning runs before increment decomposition because:

- Tests that break due to intentional changes must be paired with the
  increments that cause them.
- Test strategy defines coverage expectations each AI Gate must satisfy.
- Regression coverage affects increment sequencing — incrementsthat could
  destabilize existing behavior must include the regression tests up front.

## Inputs

| Input | Source | Required |
|---|---|---|
| Codebase analysis | output of Step 1 (brownfield) | Brownfield |
| Solution Design Package | `{project.paths.design_package}/{feature-id}/` | Yes |
| Requirements Package | `{project.paths.requirements_package}/{feature-id}/` | Yes — drives coverage targets |
| Existing test suite | filesystem (brownfield) | Brownfield |
| Coding standards | `_assets/standards/` (testing standards if present) | If present |

## Output

`{project.paths.implementation_package}/{feature-id}/plan/test-plan.md` covering:

- **Test strategy** — unit vs. integration vs. component vs. E2E split, with
  rationale for each layer
- **Coverage targets** — expected coverage per layer (with explicit
  exceptions)
- **Regression coverage** — which existing tests are at risk and which must
  be re-run after each increment
- **Test modifications** — which existing tests need updating and the
  increment that drives the change
- **New test fixtures / data** — fixtures, factories, seed data the new tests
  need
- **Mocking and isolation rules** — what to mock, what to use real
  implementations for
- **Test environment** — Testcontainers, in-memory DBs, sandbox APIs
- **Verification commands** — exact commands the AI Gate sections will cite

## Procedure

1. **READ inputs.** Codebase analysis (brownfield), solution design,
   requirements package (functional + non-functional), existing test suite
   structure.
2. **MAP requirements to test layers.** For each FR or NFR, decide which
   test layer is the appropriate proof: unit, integration, component, E2E.
   Some FRs require multiple layers.
3. **IDENTIFY at-risk existing tests.** From the codebase analysis, list
   tests that exercise the modules the new code will modify. Note which are
   likely to need updating and which must be re-run as regression.
4. **DEFINE fixture / data strategy.** What test data does the new feature
   need? Seeds? Factories? Fixtures? Where do they live?
5. **DEFINE verification commands.** The exact commands an agent or human
   will run during the AI Gate of each increment (e.g.,
   `pnpm test --filter @feature/orders`, `mvn -pl api test -Dtest=Order*`).
6. **WRITE** `test-plan.md`. Present to user. Get acknowledgement before
   proceeding to increment decomposition.

## Halt conditions

- Coverage targets in `_assets/standards/` cannot be met given existing test
  infrastructure — surface to user; may require prerequisite increments to
  set up test infrastructure.
- Required test environment (e.g., a sandbox API) is not available — log as
  a prerequisite that must be in place before any increment relying on it.

## Acknowledgement checkpoint

Before proceeding to increment decomposition:

1. Summarize the test strategy, coverage targets, and verification commands in chat.
2. Ask: "Is the test plan correct and sufficient for the AI Gates?"
3. Wait for explicit confirmation. Do not infer.
4. If the user requests changes, revise the test plan and repeat the summary.

## How this feeds increment writing

When writing each increment's **AI Gate** section (block
`templates/blocks/planning/automated-verification.md`), pull the verification
commands and expected results from this test plan. Vague AI Gates ("tests
pass") usually mean test planning was skipped or rushed.
