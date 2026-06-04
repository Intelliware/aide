# QE stage

Skills for creating, reviewing, and executing quality engineering (QE) test packages.

## Produces
A QE package containing test case implementation plans, execution strategy, and supporting documentation — organized by optional category sub-folders.

## Consumes
- Approved requirements package
- Approved design package
- Implementation package (increment status)
- `project.toml` for flow detection, paths, repo list

## Skills
- `create-qe-package` — guided wizard that elicits QE scope, topology, tech stack, artifacts, harness design, execution strategy, and generates a QE implementation plan with per-test-case increments
- `review-qe-package` — validates the assembled QE package for completeness, traceability, and readiness
- `execute-qe-increments` — executes QE test case increments one at a time, implementing the actual test artifacts (feature files, step definitions, etc.)
