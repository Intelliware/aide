# Stage 0: Repository Registration Check

Before classification, check if this repository is registered in `project.toml`:

1. Read `project.toml` and look for a `[[project.repos]]` entry matching the given path
2. If found:
   - Note any `type` field as a classification hint
   - Note the `role` field if present (api, web-app, framework, etc.)
   - Continue to Stage 1
3. If not found:
   - Ask user: "This repository is not registered in project.toml. Would you like to add it?"
   - If yes, elicit:
     - `code` (kebab-case slug, e.g., `orderhub-api`)
     - `name` (human-readable, e.g., `OrderHub Backend API`)
     - `role` (api, web-app, ui-framework, api-framework, database, mobile-app, mobile-framework, cobol-program, copybook-library, jcl-job, test-suite)
     - `type` (optional, e.g., `node-typescript-nest`, `java-spring-boot`)
     - `primary` (optional, boolean — is this the main repo?)
   - Append the entry to `project.toml`
   - Continue to Stage 1

Registration helps track which repos have been analyzed and documented, and provides hints for classification.
