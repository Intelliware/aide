---
slug: implement-artifacts
sequence: 2
depends-on-prior: true
---

# Step 2 — Implement Artifacts

## Purpose

Implement the artifacts specified in the increment's plan into the target codebase.

## Procedure

### For scaffolding increments

Read the increment's **Implementation Plan** section. Execute each instruction in order:

- Modify build files (e.g., add dependencies to `pom.xml`, `build.gradle`, `package.json`)
- Create configuration files (e.g., `cucumber.properties`, `application-qe.yml`, test profiles)
- Create runner classes (e.g., Cucumber runner, TestNG suite, pytest conftest)
- Create shared test utilities (e.g., test producers, test consumers, assertion helpers, test data builders)
- Create directory structures for test artifacts

Each instruction is imperative — follow it precisely. Do not improvise beyond what the plan specifies. If the plan is ambiguous, ask the user before proceeding.

### For test case increments

Read the increment's **Artifact Plan** section. For each artifact listed:

1. **Identify the target path** — the exact file path in the codebase where the artifact will be created
2. **Generate the content** — following the plan's description of what the file should contain, the test scenario, test steps, and expected results
3. **Write the file** — create or modify the file at the target path
4. **Cross-reference** — ensure the artifact references the correct shared utilities, test data builders, and configuration from the scaffolding increments

Apply the verification rule: summarize what you're about to create, wait for acknowledgement, then write.

### Framework-specific conventions

Respect the framework conventions documented in the QE package overview and execution strategy:
- Tag annotations match the declared tag vocabulary
- Package/module structure matches the embedding strategy
- Import paths and class names follow the project's naming conventions
- Test data uses the builders/factories created in scaffolding

## Next

Proceed to `steps/03-verify.md`.
