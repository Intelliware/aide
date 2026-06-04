# Overview — create-qe-package

## Purpose

The QE stage produces the quality engineering test package that validates the implemented solution against real infrastructure. The QE package sits above development-owned unit and service tests in the test pyramid — it covers integration, end-to-end, and any additional test categories the team requires (performance, chaos, security, contract, etc.).

The skill runs as a guided wizard that elicits test scope, system topology, technology stack, expected artifacts, test harness design, embedding strategy, test case organization, and execution strategy. It consumes all prior SDLC packages (requirements, design, implementation) for full context before beginning elicitation. Every question attempts to infer a sensible default from the prior packages and presents it to the user for confirmation or override.

The final output is a QE implementation plan — a set of per-test-case increment files (TC-XXX.md) that mirror the planning stage's INC-XXX pattern. Each test case becomes an independently executable increment that can be implemented, verified, and tracked.

## When to use

- All prior packages exist and the user wants the QE/test package
- User says: "create the QE package", "build the test package", "create test cases", "generate test plan", "start the QE stage"
- Updating an existing QE package after design or implementation changes

## When NOT to use

- QE package already assembled and only validation is wanted → `review-qe-package`
- User wants to execute QE test increments → `execute-qe-increments`
- Requirements or design not yet approved → complete those stages first

## Position in workflow

```
create-requirements-package -> review-requirements-package -> create-design-package -> review-design-package -> create-implementation-package -> review-implementation-package -> execute-increments -> create-qe-package -> review-qe-package -> execute-qe-increments
```
