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