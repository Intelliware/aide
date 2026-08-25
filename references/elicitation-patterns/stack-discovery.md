# Elicitation pattern: Stack discovery

## Purpose

Gathers information about an unsupported technology stack when creating a new RE skill via `generate-re-skill`. Unlike `repo-scope-discovery` which scopes an existing skill's extraction, this pattern discovers the characteristics of a technology that needs a new skill entirely.

Invoked during Stage 1 of `generate-re-skill` to confirm the detected stack characteristics and propose a domain slug.

## Inputs needed from user

- Technology/framework name and version
- Architectural pattern the stack follows
- Primary consumers of codebases using this technology
- Typical documentation needs for this stack
- Domain-specific concerns (security, performance, compliance)
- Why existing RE domain types don't fit

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

1. **What is this technology/framework called?**
   - **Format:** free-text with auto-fill from detection
   - **Validation:** non-empty
   - **Example:** "Apollo Server GraphQL", "AWS Lambda with SAM", "scikit-learn ML pipeline"
   - **Maps to:** `stack.technology_name`

2. **What version/generation of this technology?**
   - **Format:** free-text
   - **Validation:** semver or major version number
   - **Example:** "4.x", "v3", "2024.1"
   - **Maps to:** `stack.version`

3. **What architectural pattern does this stack follow?**
   - **Format:** multiple-choice with other option
   - **Options:**
     - `schema-driven` — Schema/contract drives the implementation (GraphQL, gRPC, OpenAPI)
     - `event-driven` — Events/messages drive behavior (serverless, message queues, CQRS)
     - `pipeline` — Data flows through sequential stages (ETL, ML, CI/CD)
     - `command-driven` — CLI commands with subcommands and flags
     - `request-response` — Traditional request/response but not REST/HTTP (custom protocols)
     - `declarative-config` — Infrastructure/config as code (Terraform, K8s manifests)
     - `other` — Describe the pattern
   - **Maps to:** `stack.architectural_pattern`

4. **Who are the primary consumers of codebases using this technology?**
   - **Format:** multiple-choice (multiple answers allowed)
   - **Options:**
     - `internal-developers` — Other developers in the same org
     - `external-developers` — Third-party developers using your API/SDK
     - `operations` — DevOps/SRE teams managing deployments
     - `data-scientists` — ML/data teams training or evaluating models
     - `end-users` — Non-technical users (via CLI, UI, or reports)
     - `machines` — Automated systems consuming outputs
   - **Maps to:** `stack.consumers[]`

5. **What do consumers typically need documented for this technology?**
   - **Format:** structured-list of documentation needs
   - **Validation:** at least 3 items
   - **Prompt:** "List the key things someone new to this codebase would need to understand."
   - **Example:** ["Schema structure", "Resolver implementation patterns", "DataLoader usage", "Authentication flow", "Error handling"]
   - **Maps to:** `stack.documentation_needs[]`

6. **Are there domain-specific concerns that must be documented?**
   - **Format:** structured `{security, performance, compliance, other}`
   - **Each field:** free-text or "N/A"
   - **Example:**
     - Security: "Query complexity limits to prevent DoS"
     - Performance: "DataLoader batching for N+1 prevention"
     - Compliance: "N/A"
   - **Maps to:** `stack.domain_concerns`

7. **Why don't the existing eleven RE domain types fit?**
   - **Format:** structured-list of reasons
   - **Prompt:** "For each similar domain type, explain why it doesn't apply."
   - **Example:**
     - "Not `api` — no REST endpoints, no OpenAPI, schema is GraphQL"
     - "Not `api-framework` — not a reusable library, this is an application"
   - **Maps to:** `stack.why_not_existing[]`

8. **Proposed domain slug.**
   - **Format:** kebab-case, 2-4 words
   - **Auto-fill:** based on detected technology
   - **Validation:** must not conflict with existing slugs (api, api-framework, web-app, ui-framework, database, mobile-app, mobile-framework, cobol-program, copybook-library, jcl-job, test-suite)
   - **Example:** "graphql-server", "serverless-lambda", "ml-pipeline"
   - **Maps to:** `stack.domain_slug`

**Wrap-up:** Confirm the answers in summary form before proceeding. Echo the technology name, version, architectural pattern, consumers, documentation needs, domain concerns, why existing types don't fit, and proposed domain slug. Confirm before proceeding to web research.

## Output format

Answers feed into the `generate-re-skill` workflow to inform research queries and template structure.

```toml
[stack]
technology_name = "Apollo Server GraphQL"
version = "4.x"
architectural_pattern = "schema-driven"
domain_slug = "graphql-server"

consumers = ["internal-developers", "external-developers"]

documentation_needs = [
  "Schema structure",
  "Resolver implementation patterns",
  "DataLoader usage",
  "Authentication flow",
  "Error handling"
]

[stack.domain_concerns]
security = "Query complexity limits to prevent DoS"
performance = "DataLoader batching for N+1 prevention"
compliance = "N/A"

why_not_existing = [
  "Not `api` — no REST endpoints, no OpenAPI, schema is GraphQL",
  "Not `api-framework` — not a reusable library, this is an application"
]
```

## Validation rules

- `technology_name` MUST be non-empty and recognizable.
- `domain_slug` MUST be kebab-case, 2-4 words, and NOT conflict with existing domain slugs.
- `consumers` MUST have at least one selection.
- `documentation_needs` MUST have at least 3 items.
- `why_not_existing` MUST have at least 2 items explaining why existing types don't fit.
- `architectural_pattern` informs research queries — if "other", user must describe it.

## Reusable across

- `generate-re-skill` — primary consumer
- Future skills for meta-documentation (documenting how to document)

## Relationship to repo-scope-discovery

| Aspect | repo-scope-discovery | stack-discovery |
|--------|---------------------|-----------------|
| Purpose | Scope an existing skill's extraction | Discover characteristics for a new skill |
| When used | Every RE skill run | Only `generate-re-skill` |
| Output | `re_scope` object | `stack` object |
| Asks about | Paths, excludes, entry points | Patterns, consumers, documentation needs |

Both may be used in the same workflow:
1. `generate-re-skill` uses `stack-discovery` to create the new skill
2. The generated skill uses `repo-scope-discovery` when run on a repository
