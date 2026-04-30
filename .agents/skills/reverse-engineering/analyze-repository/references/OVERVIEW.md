# analyze-repository — Overview

## Purpose

The dispatcher at the front of the reverse-engineering stage. Brownfield projects start here when the user doesn't already know which RE skill to invoke. It performs a structural scan, applies the classification table, handles monorepos / hybrids / already-documented repos, and produces an exact next-skill invocation phrase.

## Position in the flow

```
[brownfield entry]  ──▶  analyze-repository  ──▶  reverse-engineer-<type>  ──▶  build-knowledge-base
                                            (one or more, ordered)
```

For monorepos, `analyze-repository` recommends an ordered set of RE skills (typically frameworks/libraries first because apps depend on them, then apps, then KB build).

## What it does

1. Locates the repo and scans its package/build files, directory structure, dependency manifests, and existing documentation.
2. Classifies the repo into one of ten domain types (api, api-framework, web-app, ui-framework, database, mobile-app, mobile-framework, cobol-program, copybook-library, jcl-job) — or in the hybrid/monorepo case, into multiple types with priority ordering. Mainframe repos commonly combine all three of cobol-program / copybook-library / jcl-job under one root and are handled like a monorepo.
3. Resolves the application-vs-framework ambiguity using consumer-question heuristics (end users → application; other developers → framework).
4. Hands off by name to the matching `reverse-engineer-<type>` skill with an exact trigger phrase.

## What it does NOT do

- Does not extract any documentation from the source code — that is the job of the domain RE skills.
- Does not produce Part A or Part B artifacts — only a recommendation document.
- Does not modify the source repository.
- Does not aggregate into the knowledge base — that is `build-knowledge-base`.

## Why a dispatcher exists

The seven domain RE skills overlap in vocabulary ("document my repo") but differ enormously in workflow. A user who says "document my code" without specifying the type can't be served by any single domain skill. The dispatcher absorbs that ambiguity and emits the precise trigger phrase the user needs.

## Composition

The classification logic is referenced by the brownfield flow YAML composition, which calls this skill first when no `[[project.repos]]` table exists in `project.toml` yet, or when the user wants to validate a manually entered classification.

## Hand-off

Dynamic. Based on the classification result, hand off by name to one or more of:

- `reverse-engineer-api` / `reverse-engineer-api-framework`
- `reverse-engineer-web-app` / `reverse-engineer-ui-framework`
- `reverse-engineer-database`
- `reverse-engineer-mobile-app` / `reverse-engineer-mobile-framework`
- `reverse-engineer-cobol-program` / `reverse-engineer-copybook-library` / `reverse-engineer-jcl-job`

All RE skills hand off to `build-knowledge-base` after extraction completes. Mainframe stacks additionally hand off to `build-mainframe-data-lineage` for cross-program field-level data traceability.
