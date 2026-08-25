---
slug: analyze-stack
sequence: 1
depends-on-prior: false
---

# Step: Analyze Stack

Perform preliminary analysis of the repository to understand the technology stack and propose a domain slug for the new RE skill.

## When to run

Run this step at the start of Stage 1 (Preliminary Stack Analysis) of the parent generate-re-skill workflow.

## Inputs

- Repository path (absolute)
- Optional: Findings from `analyze-repository` if routed from there

## Process

### 1. Read Package/Build Files

Check in order, stop when found:
- `package.json` → Node/JS/TS
- `pom.xml`/`build.gradle`/`build.gradle.kts` → Java/Kotlin
- `requirements.txt`/`setup.py`/`pyproject.toml` → Python
- `go.mod` → Go
- `Cargo.toml` → Rust
- `*.csproj`/`*.sln` → .NET
- `Podfile`/`Package.swift` → iOS
- `composer.json` → PHP
- `Gemfile` → Ruby

Extract:
- Primary language and version
- Framework dependencies
- Build/test commands
- Entry points

### 2. Read Directory Structure

Scan `ls -la` plus one level deep. Look for:
- Framework-specific directories (e.g., `schema/`, `resolvers/`, `handlers/`, `lambdas/`)
- Architectural patterns (e.g., hexagonal, clean architecture, serverless)
- Configuration files that reveal the stack (e.g., `serverless.yml`, `cdk.json`, `terraform/`)

### 3. Identify Distinguishing Characteristics

Compare against the eleven existing domain types and document:
- Why this repository doesn't fit any existing type
- What makes this technology pattern unique
- What documentation needs differ from existing types

Example distinguishing characteristics:
- **GraphQL server:** Schema introspection, resolver chains, DataLoaders, no OpenAPI
- **Serverless functions:** No persistent server, event-driven, cold starts, per-function config
- **ML pipeline:** Training vs. inference modes, model versioning, data lineage, experiment tracking
- **CLI tool:** Command structure, argument parsing, output formatting, shell integration

### 4. Propose Domain Slug

Generate a kebab-case domain slug that:
- Is 2-4 words
- Clearly identifies the technology pattern
- Does not conflict with existing domain types

Examples:
- `graphql-server`
- `serverless-lambda`
- `ml-pipeline`
- `cli-tool`
- `message-queue-consumer`
- `etl-job`
- `static-site-generator`

### 5. Present Findings

Show the user:

```
## Stack Analysis

**Repository:** <path>
**Primary Language:** <language> <version>
**Framework:** <framework> <version>

**Key Architectural Signals:**
- <signal 1>
- <signal 2>
- <signal 3>

**Why existing RE types don't fit:**
- Not `reverse-engineer-api` because: <reason>
- Not `reverse-engineer-<closest>` because: <reason>
- Closest match: `reverse-engineer-<type>` at ~<N>% fit

**Proposed domain slug:** `<slug>`

**Proposed skill name:** `reverse-engineer-<slug>`

Does this analysis look correct? Should I proceed with researching documentation patterns for this stack?
```

### 6. Get User Confirmation

Wait for user to confirm or correct:
- The detected stack characteristics
- The proposed domain slug
- Whether to proceed to Stage 2 (Web Research)

Do NOT proceed to Stage 2 without explicit user confirmation.

## Output

- Confirmed primary language and framework
- Confirmed architectural style
- Confirmed domain slug
- List of distinguishing characteristics

## Halt conditions

- Halt if the repository path doesn't exist or is empty
- Halt if no package/build file can be found (prompt user for hints)
- Halt if the user believes an existing domain type actually fits (route back to `analyze-repository`)
- Halt if the user wants to force-fit to the closest existing type

## Common mistakes

- Proposing a slug that conflicts with existing domain types (e.g., `api-server` when `api` exists)
- Not explaining WHY existing types don't fit — user needs this context to approve
- Proceeding without user confirmation of the domain slug
- Over-engineering the slug (keep it 2-4 words)
