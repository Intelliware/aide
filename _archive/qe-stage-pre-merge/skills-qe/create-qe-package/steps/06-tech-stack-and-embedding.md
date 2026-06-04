---
slug: tech-stack-and-embedding
sequence: 6
depends-on-prior: true
---

# Step 6 — Tech Stack Integration & Embedding

## Purpose

Determine specifically how the QE test suite integrates with the existing service codebase(s). This goes beyond the technology list (Step 3) into the mechanics of where the tests live and how they're wired up.

## Procedure

Attempt to infer the embedding approach from the project's existing structure (read the repo layout via `project.toml` repos). Present an example:

> Based on the project structure, here's a suggested approach for embedding the QE tests:

Example approaches (present whichever fits):
- Cucumber runner embedded into existing Java Spring Boot application (same repo, separate source set)
- Separate test project / module within the same repository
- Standalone test repository
- Test container orchestration layer wrapping existing services

Then ask:

> How do you want to embed the QE tests into your existing service(s)?
>
> - Same repo, separate source set (e.g., `src/test/java/qe/`)?
> - Separate Maven/Gradle module within the same project?
> - Standalone test project?
> - Other?
>
> Please also specify any framework-specific wiring (e.g., "Cucumber runner class in the Spring Boot test classpath", "pytest with conftest.py at repo root").

Record the user's response.

## Acknowledgement checkpoint

Present the embedding strategy. Ask: "Does this integration approach work for your setup?" Wait for confirmation.

## Next

Proceed to `steps/07-test-case-organization.md`.
