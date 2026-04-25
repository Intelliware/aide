# Elicitation pattern: Repo scope discovery

## Purpose

Confirms exactly which directories within a target repo a reverse-engineering
(RE) skill should analyze, which to skip (vendored, generated, tests-only,
deprecated), the language/framework signals, the primary entry points, and
the consumer profile (internal team app vs. shipped framework / library).
Invoked at the start of every RE skill so Part A and Part B docs are scoped
to the right surface area — no time wasted RE-ing `node_modules/`, generated
protobuf, or legacy v1 folders.

## Inputs needed from user

- Repository path (absolute, or relative resolved to absolute)
- Confirmation of monorepo / single-repo
- For monorepos: which sub-trees to RE (allow-list)
- Globs / paths to EXCLUDE (vendored, generated, tests-only, deprecated)
- Primary language and framework (cross-checked against detection)
- Primary entry points (server start scripts, CLI binaries, exposed HTTP/gRPC routers, public API surface)
- Consumer profile (internal end-user app vs. published library/framework)
- Existing-documentation pointer (README, docs/, OpenAPI specs)
- Approximate size / age (for triage)

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

1. **Confirm the repository path.**
   - **Format:** path-with-validation
   - **Validation:** absolute path; must exist; must be a directory; must contain at least one of `package.json`, `pom.xml`, `build.gradle`, `Cargo.toml`, `*.csproj`, `Podfile`, `Package.swift`, `pyproject.toml`, `go.mod`, `composer.json`, `Gemfile`
   - **Maps to:** `re_scope.repo_path`

2. **Is this a monorepo (multiple independent packages under one root)?**
   - **Format:** yes/no
   - **Maps to:** `re_scope.is_monorepo`

3. **For monorepo: list the sub-paths to RE.** (e.g. `apps/orders-api`, `packages/shared-domain`)
   - **Format:** structured-list of relative paths
   - **Validation:** each path resolves under `repo_path`; must be a directory
   - **Maps to:** `re_scope.subpaths[]`

4. **What globs / paths should we EXCLUDE from RE?** (vendored, generated, tests-only, deprecated)
   - **Format:** structured-list of globs (relative to `repo_path` or each subpath)
   - **Validation:** glob syntax checked; auto-suggest `node_modules/`, `dist/`, `build/`, `.next/`, `target/`, `*.generated.*`, `__pycache__/`, `vendor/`, `tests/` (allow user to keep or drop suggestions)
   - **Maps to:** `re_scope.exclude_globs[]`

5. **Confirm the primary language.** (auto-detected from manifest; ask user to confirm or correct)
   - **Format:** multiple-choice
   - **Options:** `typescript` / `javascript` / `python` / `java` / `kotlin` / `go` / `rust` / `csharp` / `swift` / `kotlin-android` / `dart` / `ruby` / `php` / `other`
   - **Maps to:** `re_scope.language`

6. **Confirm the primary framework / stack.** (auto-detected; ask user to confirm or correct)
   - **Format:** free-text with auto-fill from detection (e.g. `nestjs@10`, `spring-boot@3`, `next@14`, `django@5`, `gin@1.9`)
   - **Validation:** non-empty
   - **Maps to:** `re_scope.framework`

7. **Identify primary entry points.** (server start scripts, CLI binaries, exposed routers, the public API surface)
   - **Format:** structured-list of `{kind, path, description}` where `kind` ∈ `{server-start, cli, http-router, grpc-service, exported-symbol, scheduled-job, message-handler}`
   - **Validation:** each `path` resolves to a real file
   - **Maps to:** `re_scope.entry_points[]`

8. **Consumer profile.** (drives the choice between *-app and *-framework RE skills)
   - **Format:** multiple-choice
   - **Options:**
     - `internal-app` — built for end users inside the company
     - `external-app` — customer-facing application
     - `internal-framework` — library/framework consumed by other engineers in the same org
     - `external-framework` — published library/framework (npm, PyPI, Maven Central, etc.)
   - **Maps to:** `re_scope.consumer_profile`

9. **Pointer to existing documentation.** (README, `docs/`, OpenAPI/protobuf specs, ADRs)
   - **Format:** structured-list of paths
   - **Validation:** each path resolves to a real file/dir
   - **Maps to:** `re_scope.existing_docs[]`

10. **Approximate size and age.** (lets the RE skill set expectations for the user)
    - **Format:** structured `{loc_estimate, age_years, last_active_year}` (auto-fill where possible)
    - **Validation:** `loc_estimate` numeric; `age_years` numeric; `last_active_year` 4-digit
    - **Maps to:** `re_scope.size_age`

**Wrap-up:** Confirm the answers in summary form before proceeding. Echo the absolute repo path, the included subpaths (or "single root"), the exclude globs, the language + framework, the consumer profile, and the entry-points list. Confirm before the calling RE skill begins its analysis pass.

## Output format

Answers seed the calling RE skill's scope object (passed in-process; not persisted to disk by this pattern, but the skill that called the pattern may serialize it into its Part A doc header).

```toml
[re_scope]
repo_path = "/Users/jane/dev/acme-orders-api"
is_monorepo = false
language = "typescript"
framework = "nestjs@10.3.0"
consumer_profile = "internal-app"

exclude_globs = ["node_modules/", "dist/", "*.generated.*", "tests/fixtures/legacy-v1/"]

[[re_scope.entry_points]]
kind = "server-start"
path = "src/main.ts"
description = "NestFactory bootstrap; binds port from APP_PORT env."

[[re_scope.entry_points]]
kind = "http-router"
path = "src/orders/orders.controller.ts"
description = "REST surface under /v1/orders."

existing_docs = ["README.md", "docs/api/openapi.yaml"]
```

## Validation rules

- `repo_path` MUST be an absolute path that exists and is a directory.
- For monorepos, at least one subpath required; each must resolve under `repo_path`.
- Exclude globs are validated for glob syntax; the skill auto-suggests common excludes (vendored / generated / build output) for the user to confirm or drop.
- `language` and `framework` come from manifest detection; user confirmation is required because heuristics misfire on hybrid stacks.
- `consumer_profile` is load-bearing — it routes the user to either the `*-app` or `*-framework` RE skill family. Re-prompt if user gives a value outside the four enum options.
- At least one entry point required.

## Reusable across

- `analyze-repository` (drives initial scope confirmation)
- `reverse-engineer-api`
- `reverse-engineer-api-framework`
- `reverse-engineer-web-app`
- `reverse-engineer-ui-framework`
- `reverse-engineer-mobile-app`
- `reverse-engineer-mobile-framework`
- `reverse-engineer-database`
- All RE composition YAMLs (`re-api-consumer`, `re-api-internal`, `re-api-framework-consumer`, `re-api-framework-internal`, `re-web-app-consumer`, `re-web-app-internal`, `re-mobile-app-consumer`, `re-mobile-app-internal`, `re-mobile-framework-consumer`, `re-mobile-framework-internal`, `re-ui-framework-consumer`, `re-ui-framework-internal`, `re-database-consumer`, `re-database-internal`)
