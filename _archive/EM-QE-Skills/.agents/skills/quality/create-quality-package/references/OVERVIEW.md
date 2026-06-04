# Overview — create-quality-package

## Purpose

The quality stage produces the Quality Package: the single artifact that states
how a feature will be proven correct. It consolidates three disciplines —
quality assurance analysis (the strategy, risk model, and release gates),
software testing (the concrete test design traced to acceptance criteria), and
quality engineering (the automation, CI/CD gates, test data, and environments
that make that testing repeatable and scalable).

The package sits between the planning gate and execution so that test design can
trace to all three upstream artifacts at once: requirements acceptance criteria,
design NFRs, and the `INC-XXX` increments. `execute-increments` then implements
the package — its TDD loop writes the tests designed here, its AI/Human gates
check them, and the release gates defined here become the feature's exit
criteria.

## When to use

- An approved design package and a GO implementation package exist and the user
  wants the test/quality plan before coding begins
- User says any trigger phrase from the SKILL.md frontmatter
- Re-authoring after the requirements, design, or implementation change trackers
  recorded amendments (scope changes ripple into test design and gates)

## When NOT to use

- Quality package already assembled and only validation is wanted →
  `review-quality-package`
- Implementation plan not yet GO → `create-implementation-package` and
  `review-implementation-package`
- Trivial change → `quick-dev/document-quick-change` (quality folds into the
  combined spec; the full stage is bypassed, exactly as `review-requirements-package`
  is bypassed in quick-dev)
- Writing code or running tests → `execute-increments`

## Position in workflow

```
create-implementation-package -> review-implementation-package -> create-quality-package -> review-quality-package -> execute-increments -> ...
```

In brownfield mode the package additionally grounds itself in the knowledge base
via `navigate-knowledge-base` (existing test suites, coverage baselines, known
flaky areas). The skill may be re-invoked when an upstream change tracker records
amendments — in that case only the affected strategy, test-design, or
quality-engineering sections are revised.
