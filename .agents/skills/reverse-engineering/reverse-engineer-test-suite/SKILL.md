---
name: reverse-engineer-test-suite
description: "Use when the user asks to document a dedicated test-automation repository — E2E suite, integration suite, contract-test suite, BDD repo, or any standalone test project — regardless of stack (e.g., Cucumber/Java, Playwright, Cypress, Selenium, pytest, RestAssured, Karate, k6). Produces Part A (internal docs for test engineers maintaining the suite) and Part B (consumer docs for application developers and QE consumers calling the suite or relying on its components in the knowledge base). Do NOT use for application code with embedded tests — those are documented inside the application RE skill (`reverse-engineer-web-app` / `-mobile-app` / `-api`)."
---
# Reverse Engineer Test Suite
Drives a 5-stage extraction workflow that turns a dedicated test-automation
codebase into two documentation parts: Part A (full internals for test
engineers) and Part B (consumer-facing summary that lands in the knowledge
base for the quality stage to ground against).
## Overview
Test-suite repos are technology-agnostic in this skill — the workflow is
identical for Cucumber + Java, Playwright + TypeScript, Cypress, pytest +
RestAssured, k6, or any other standalone test stack. The substance is the
same: the runner, the shared utilities (producers / consumers / async
helpers / fixtures / page objects), the spec files / feature files, the
marker / tag vocabulary, the test data, the reporting, and the cross-cutting
concerns (auth, environments, parallelism).
The output's most important property: every Part B component carries
`kind: test-suite` in its frontmatter so `navigate-knowledge-base
--profile=test-suite` can find it. This is the foundation for KB-grounded
reuse cross-checks in `execute-quality-increments`, drift verification in
`audit-quality-coverage`, and category cross-referencing in
`review-test-failures`.
## When to use
- The repo is a **standalone test project** — its primary output is test
  artefacts, not production code
- The user asks to document a Cucumber / Playwright / Cypress / Selenium /
  pytest / k6 / RestAssured / Karate test suite
- The user wants the quality stage's skills (`execute-quality-increments`,
  `audit-quality-coverage`, `review-test-failures`) to ground in KB
  components describing the test suite, not just the application
- `analyze-repository` classified the repo as "test suite — dedicated test
  project" and routed here
## When NOT to use
- The repo is an **application** with embedded tests under `src/test/` or
  `__tests__/` or `tests/` — document inside the application's RE skill
  (`reverse-engineer-web-app` / `-mobile-app` / `-api`); the embedded
  tests get a `## Testing` section in Part A, no separate KB component
- The repo is a **test framework or library** (not a suite that runs
  tests, but reusable building blocks) — document via
  `reverse-engineer-api-framework` or `reverse-engineer-ui-framework`
  depending on the language layer it sits in
- The user wants to **author** a quality package — `create-quality-package`
- The user wants to **build the KB** from already-produced RE outputs —
  `build-knowledge-base`
- The user wants to **query** the existing KB — `navigate-knowledge-base`
  (with `--profile=test-suite` for test-aware ranking)
## Inputs
- Path to the test-suite repository
- Source version being documented (commit / branch / tag)
- The application repo(s) the suite tests against — paths only, not
  documented here; the suite's Part B will link to those teams' Part B
  components in the KB by name
- Optional: existing suite documentation, runbooks, CI configuration
See `references/INPUTS-OUTPUTS.md` for the full table.
## Documentation Model
| Part | Audience | Content | Destination |
|---|---|---|---|
| Part A | Test engineers maintaining the suite | Full internals: runner config, project structure, shared utilities, fixtures, page-objects / step-defs, feature/spec inventory, naming conventions, framework patterns, CI integration, environment matrix, known gaps | Stays in the test-suite repo (`docs/INTERNAL.md` or per-team convention) |
| Part B | Application developers, QE consumers, downstream KB skills | Suite purpose, scope, marker / tag vocabulary, shared-utility catalogue, fixture catalogue, environment / data contract, CI surface, ownership | Knowledge base — every Part B file frontmatter declares `kind: test-suite` |
Part B is the single source of truth that downstream skills query via
`navigate-knowledge-base --profile=test-suite`. Specifically:
- `execute-quality-increments` queries Part B during Step 2a (reuse cross-check) to find existing shared utilities, fixtures, builders, and page objects before generating duplicates.
- `audit-quality-coverage` queries Part B during Step 3 (live drift check) to verify the markers / tags / spec-names that the quality package claims exist.
- `review-test-failures` queries Part B during Step 3 (classify and remediate) to look up locator definitions, fixture sources, and known patterns for the failing artefact.
- `create-quality-package` queries Part B during Step 2b (test-case-increment plan) to source reuse hints when planning scaffolding.
## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow
### Stage 1: Discovery and Inventory
- Inventory the runner / build tool, test framework, language pins
- Inventory the directory layout (specs, step-defs, page-objects, fixtures, shared utilities, configs)
- Inventory the marker / tag vocabulary
- Identify the application repo(s) the suite tests against (record their KB component IDs for cross-linking in Part B)
- Run `steps/scaffold.md` to lay down Part A + Part B file structure BEFORE any content extraction
### Stage 2: Global Infrastructure
- Runner and entry point (commands, profiles, parallelism)
- Project structure and directory conventions
- Configuration management (test profiles, environment selection, secret handling)
- Reporting (paths, formats — the same paths pinned in the consuming quality package's `automation-and-cicd` block)
- Shared utilities organised by interaction type (action / wait / assertion / data / navigation / network / fixture)
- State / context sharing (thread-local, fixtures, hooks, page objects)
- Auth and environment-entry patterns
### Stage 3: Spec / Feature Inventory
- For every feature / spec file: scope, scenarios / specs, markers / tags, shared backgrounds, dependencies on shared utilities
- Map each marker / tag back to the application's INC / FR / AC IDs where the suite documents the mapping
- Flag duplicates, near-duplicates, and orphaned files
### Stage 4: Cross-Cutting Concerns
- Environment matrix (dev / test / pre-prod / prod-readonly; what each environment provides)
- Test-data strategy (fixtures, builders, factories, seed-data refresh procedures)
- Parallelism and isolation strategy
- CI integration (where the suite runs, on what trigger, with what gating)
- Reporting and analytics integrations
- Known gaps, anti-patterns (hardcoded waits, static state, missing teardown), and accepted technical debt
### Stage 5: Verification and Finalization
- **Close-out gate — ask, then route.** Do NOT run `steps/verify.md`
  unconditionally. Ask the user how this extraction should be closed out, per
  `references/elicitation-patterns/re-verification-gate-selection.md`:
  - **automated** — run `steps/verify.md` in `automated` mode. It issues the
    mechanical GO/NO-GO; checks only the model can judge are reported
    UNVERIFIED and never counted toward GO.
  - **review** — run `steps/verify.md` in `review-evidence` mode (mechanical
    checks only, no verdict), then hand off by name to
    `review-reverse-engineering-package`, which owns the readiness verdict.

  Halt until the user answers; do not infer a mode.
  `[project.elicitation].re_verification_gate` may pre-answer it (`ask` is the
  default, or `review` / `automated`); an unattended run left on `ask` fails
  fast rather than picking for the user.
- Confirm every Part B file frontmatter carries `kind: test-suite`
- Confirm the marker / tag vocabulary documented in Part B matches what the consuming quality package's `automation-and-cicd` block expects
- Log all changes via the `track-change` skill
## Output structure (mandatory)

This skill binds its two output parts to the following compositions, located
under `templates/compositions/`:

| Part | Composition file | Default output path | Shape |
|---|---|---|---|
| Part A — internal docs | `re-test-suite-internal.yaml` | `docs/test-suite-internal/` (under the test-suite repo root) | `tree` — one `.md` per block (named `NN-<bare-slug>.md`) |
| Part B — consumer / KB | `re-test-suite-consumer.yaml` | `{paths.knowledge_base_path}/source-docs/<repo-slug>/test-suite-consumer/` | `tree` — one `.md` per block (named `<NN>-<bare-slug>.md`), sibling to the other RE `*-consumer/` trees; every file declares `kind: test-suite` in frontmatter |

The per-block rosters for both parts live in `references/OVERVIEW.md`
§ Block rosters. The compositions above are the authority — the roster is a
reading aid, and a disagreement between the two is a composition bug, not a
roster bug.

### Block source

Internal blocks live under `templates/blocks/reverse-eng/test-suite/internal/`;
consumer blocks under `templates/blocks/reverse-eng/test-suite/consumer/`. Each
block carries the canonical frontmatter (`slug`, `title`, `applies-to`,
`requires-decision-from`, `optional`, `order-hint`) and a "Suggested template
content" section with `{{tokens}}` for the RE skill to substitute during
authoring.

## Output
| Artifact | Path | Format |
|---|---|---|
| Part A — internal docs | Test-suite repo (`docs/INTERNAL.md` or per-team convention) | Markdown |
| Part B — consumer / KB | `{paths.knowledge_base_path}/source-docs/<repo-slug>/test-suite-consumer/<NN>-<bare-slug>.md` | Markdown with `kind: test-suite` frontmatter (one file per block: suite-purpose-and-scope, runner-and-invocation, shared-utilities-catalogue, …, ownership), sibling to the other RE `*-consumer/` trees |
| Change-tracker entries | Per the `track-change` skill | Markdown |
## Next skill

Depends on the close-out mode elected at the gate:

- **review** → `review-reverse-engineering-package` — the per-repo readiness gate.
  KB ingestion follows its APPROVED / CONDITIONAL verdict, not this skill's completion.
- **automated** → straight to KB ingestion once the mechanical gate returns GO. The
  UNVERIFIED list travels with the extraction; it is not cleared by ingestion.

Then, in either case:

- After completion, hand off by name to `build-knowledge-base` if the KB
  has not yet been initialised; otherwise hand off to
  `update-knowledge-base` to fold the new components into the live KB.
- Downstream quality stage skills then consume Part B via
  `navigate-knowledge-base --profile=test-suite` — no further action
  required from this skill.
## Common mistakes
- **Running `steps/verify.md` without asking.** The close-out gate is a user
  decision; picking the mode yourself reinstates the self-attested gate the
  routing pattern replaced.
- **Reporting a model-judgment check as PASS in `automated` mode.** Those items
  are UNVERIFIED. A GO with a non-empty UNVERIFIED list is the honest and
  expected outcome — it means well-formed, not attested as correct.
- **Issuing a GO/NO-GO in `review-evidence` mode.** The review skill owns the
  verdict there; two verdicts for one extraction is worse than one.
- **Treating the test suite as an application.** Test suites have no
  end-users; their "API" is the marker vocabulary, the fixture catalogue,
  and the CI surface. Document those, not "what does this product do".
- **Reading method names instead of bodies.** Shared utilities lie in
  their javadoc; read the actual code. The framework's iron rule.
- **Hard-coding the framework name into Part B.** Part B is consumed by
  skills that must work across stacks; pin the stack in
  `automation-and-cicd` of the *consuming* quality package, not in the
  RE output.
- **Forgetting `kind: test-suite` in Part B frontmatter.** Without it,
  `navigate-knowledge-base --profile=test-suite` cannot find the
  components and downstream quality skills silently fall back to scanning
  application components — which never produces correct results.
- **Bundling spec content into Part B.** Part B is the *catalogue* of
  what exists, not the scenarios themselves. Spec / feature file
  contents stay in Part A and in the repo; Part B carries the inventory
  + marker mapping + ownership.
- **Documenting test data values.** Never put real test-account
  credentials, tokens, or production-derived data in Part B. Document
  the *shape* and the *refresh procedure*; the data itself lives in the
  secret store the team's automation-and-cicd block points to.
- **Skipping `analyze-repository` first** when the repo is a hybrid
  (application + tests in one repo). The diagnostic step matters; this
  skill is for *dedicated* test repos.