# Overview — reverse-engineer-test-suite
## Purpose
Document a dedicated test-automation repository — E2E suite, integration
suite, contract-test suite, BDD repo, performance-test repo, or any
standalone test project — and produce KB components that the merged
quality stage's skills can ground against.
## Scope
This skill is for **test-suite repositories that are their own repo**.
Test code that lives *inside* an application repo (under `src/test/`,
`__tests__/`, `tests/`, etc.) is documented inside that application's
RE skill, not here. Use `analyze-repository` if the repo's nature is
unclear.
## Position in workflow
```
analyze-repository ──(test-suite detected)──> reverse-engineer-test-suite
                                                          |
                                                          v
                                          Part A (in-repo) + Part B (KB-ready)
                                                          |
                                                          v
                                          build-knowledge-base  -OR-  update-knowledge-base
                                                          |
                                                          v
                                          KB components with kind: test-suite
                                                          |
                          +-------------------------------+-------------------------------+
                          v                               v                               v
            create-quality-package         execute-quality-increments     audit-quality-coverage
            (Step 2b reuse hints)          (Step 2a reuse cross-check)    (Step 3 drift verify)
                                                          |
                                                          v
                                          review-test-failures (Step 3 classify)
```
All four downstream consumers query via the same
`navigate-knowledge-base --profile=test-suite` call.
## Two documentation parts
| Part | Reader | Question it answers |
|---|---|---|
| Part A | Test engineers maintaining the suite | "How is this suite organised? What does every utility do? How do I extend it without breaking things?" |
| Part B | Application developers, QE consumers, downstream KB skills | "What does this suite test? What shared building blocks does it expose? What's the marker vocabulary? Where does it run? Who owns it?" |
Part A stays in the repo for the team that owns the suite. Part B lives
in the knowledge base for everyone else to grep.
## What this skill does NOT do
- Author quality packages — that's `create-quality-package`
- Build the KB itself — that's `build-knowledge-base`
- Query the existing KB — that's `navigate-knowledge-base`
- Update the KB after the suite changes — that's `update-knowledge-base`
- Detect KB drift — that's `detect-knowledge-base-drift`
- Run tests, triage failures, or fix script issues — those are
  `execute-quality-increments` / `review-test-failures`
- Document a test *framework* or *library* (reusable building blocks
  that other test suites depend on) — those are
  `reverse-engineer-api-framework` or `reverse-engineer-ui-framework`
  depending on the layer
## Relationship to the merged quality stage
This skill is the **input gate** to the merged quality stage's KB
grounding. Until the test suite is reverse-engineered into the KB:
- `execute-quality-increments`'s reuse cross-check has nothing to
  search — it falls back to grepping the repo, which is slower and
  less accurate.
- `audit-quality-coverage`'s drift check has no canonical source for
  "what markers / tags actually exist" — it falls back to direct
  codebase grep.
- `review-test-failures`'s classification has no shared-helper
  catalogue to reference — it can't say "this locator is documented
  in component X".
After this skill ships, all four quality skills get cleaner, more
accurate grounding with no per-skill code changes — the
`navigate-knowledge-base --profile=test-suite` call they already
make starts returning useful results.

## Block rosters

Moved here from `SKILL.md` to keep that file inside the 200-line budget, and
because it is reference material: `templates/compositions/re-test-suite-internal.yaml`
and `re-test-suite-consumer.yaml` are the authority on the block list. If this
roster and a composition disagree, the composition wins and the roster needs
fixing.

### Part A — internal (16 blocks, order 110..260)

1. `suite-overview` — identity, scope, application(s) under test, what's deliberately out of scope
2. `runner-and-entry-points` — stack pins, canonical invocations, reports / artefacts
3. `project-structure-and-conventions` — directory layout, naming rules, canonical examples
4. `configuration-and-profiles` — config files, profiles, env-var overrides, secret handling, timeouts
5. `shared-utilities-catalogue` — actions / waits / assertions / data / navigation / network / fixtures (full inventory)
6. `fixtures-and-test-data` — static fixtures, builders, seed-data lifecycle, per-scenario state contract
7. `page-objects-and-step-defs` — POs + step-defs with duplicate-phrasing remediation queue
8. `spec-feature-inventory` — every spec mapped to INC / FR / AC, orphan + near-duplicate roster
9. `marker-tag-vocabulary` — controlled + free-form tags, mandatory tag policy, vocabulary change procedure
10. `auth-and-environment-entry` — auth paths, forbidden patterns, environment-entry contract
11. `environment-matrix` — per-env URL / auth / seed / mutating-policy / safe tag-subsets
12. `parallelism-and-isolation` — worker model, per-worker resources, isolation contract, race-condition history
13. `reporting-and-analytics` — reports, dashboards, integrations, trace policy
14. `ci-integration` — pipelines, gating semantics, artefact upload, quarantine workflow
15. `known-gaps-and-anti-patterns` — coverage gaps, anti-patterns, flake roster, architectural debt
16. `glossary` — suite-specific terms (distinct from project-level glossary)

### Part B — consumer / KB (10 blocks, order 110..200)

1. `suite-purpose-and-scope` — application-oriented purpose; what the suite proves; what it doesn't
2. `runner-and-invocation` — consumer-grade stack + canonical commands + report locations
3. `shared-utilities-catalogue` — public reusable helpers grouped by interaction type (the reuse-analysis target)
4. `fixtures-catalogue` — static fixtures + runtime builders + seed-data contract
5. `page-objects-and-step-defs-catalogue` — canonical PO methods and step-def phrasings (the duplicate-prevention surface)
6. `marker-tag-vocabulary` — controlled + free-form tags; mandatory tag policy binding on consuming skills
7. `environment-and-data-contract` — per-env capability contract + seed-data guarantees + binding forbiddances
8. `feature-inventory` — what's covered, mapped to INC / FR / AC; coverage roll-ups; gap list
9. `ci-surface` — gating pipelines, artefact paths, dashboards, notification channels
10. `ownership` — per-area + per-role ownership, review routing, issue-filing surface
