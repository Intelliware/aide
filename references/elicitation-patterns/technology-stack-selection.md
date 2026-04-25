# Elicitation pattern: Technology stack selection

## Purpose

Captures the concrete technology choices for each container in the
architecture: language, framework, runtime, persistence, and supporting
infrastructure — all with **pinned versions**. Invoked from
`create-design-package` step 02-design so the `design/technology-stack`
block has reproducible build inputs that the implementation stage can
turn into pinned `package.json` / `pyproject.toml` / etc. entries.

## Inputs needed from user

- Per-container language + version
- Per-container application framework + version
- Runtime / process model (Node, JVM, .NET, Go, Python, browser, mobile)
- Persistence: database engine + version
- Cache layer (if any)
- Message broker / event bus (if any)
- Build & package manager
- Test frameworks
- CI/CD platform
- Container runtime / orchestration platform (Docker, k8s, ECS, Lambda)

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

1. **For each container in `design.architecture.containers`, confirm the language and pin a version.**
   - **Format:** structured `{container, language, version}`
   - **Validation:** version must be a concrete release (`20.11.1`, not `>=20`); accept `lts` ⇒ resolve to current LTS
   - **Maps to:** `design.tech_stack.containers[].language`

2. **For each container, choose the application framework and pin its version.**
   - **Format:** structured `{container, framework, version}`
   - **Validation:** framework name + concrete version
   - **Maps to:** `design.tech_stack.containers[].framework`

3. **What primary database engine?** (cross-check `project.elicitation.primary_database`)
   - **Format:** multiple-choice
   - **Options:** `postgres` / `mysql` / `mssql` / `mongodb` / `dynamodb` / `cockroachdb` / `sqlite` / `other`
   - **Validation:** version pin required (e.g. `postgres 16.1`)
   - **Maps to:** `design.tech_stack.persistence.primary`

4. **Are any secondary stores in play?** (search index, time-series, graph, blob)
   - **Format:** structured-list of `{kind, engine, version}`
   - **Validation:** kind ∈ `{search, timeseries, graph, blob, vector, kv-cache}`
   - **Maps to:** `design.tech_stack.persistence.secondary[]`

5. **Cache layer?**
   - **Format:** multiple-choice + version
   - **Options:** `redis` / `memcached` / `hazelcast` / `in-process` / `none`
   - **Maps to:** `design.tech_stack.cache`

6. **Message broker / event bus?** (cross-check `project.elicitation.event_bus`)
   - **Format:** multiple-choice + version
   - **Options:** `kafka` / `rabbitmq` / `sqs` / `sns` / `eventbridge` / `nats` / `none`
   - **Maps to:** `design.tech_stack.eventing`

7. **Build & package manager per container.**
   - **Format:** structured `{container, build_tool, package_manager}`
   - **Validation:** must match the chosen language conventions (e.g. `pnpm` for node, `uv` or `pip` for python, `gradle`/`maven` for jvm)
   - **Maps to:** `design.tech_stack.containers[].build`

8. **Test frameworks per container.**
   - **Format:** structured `{container, unit, integration, e2e}`
   - **Validation:** each slot is either a named framework or `none-yet`
   - **Maps to:** `design.tech_stack.containers[].testing`

9. **CI/CD platform.**
   - **Format:** multiple-choice
   - **Options:** `github-actions` / `gitlab-ci` / `circleci` / `azure-devops` / `buildkite` / `jenkins` / `other`
   - **Maps to:** `design.tech_stack.ci_cd`

10. **Container runtime / orchestration platform.**
    - **Format:** multiple-choice
    - **Options:** `docker-only` / `kubernetes` / `ecs-fargate` / `lambda` / `cloud-run` / `app-runner` / `bare-metal` / `vm`
    - **Validation:** if `kubernetes` chosen, ask cluster manager (EKS / GKE / AKS / self-hosted)
    - **Maps to:** `design.tech_stack.deployment`

**Wrap-up:** Confirm the answers in summary form before proceeding. Print a stack table per container plus the shared platform choices. Re-prompt for any version field that does not pin to a concrete release. Confirm before writing the technology-stack block.

## Output format

Answers feed `design/technology-stack`.

```toml
[design.tech_stack]
ci_cd = "github-actions"
deployment = "ecs-fargate"

[design.tech_stack.persistence]
primary = { engine = "postgres", version = "16.1" }

[design.tech_stack.cache]
engine = "redis"
version = "7.2"

[[design.tech_stack.containers]]
container = "Order Resolution Service"
language = { name = "node", version = "20.11.1" }
framework = { name = "nestjs", version = "10.3.0" }
build = { tool = "tsc", package_manager = "pnpm" }
testing = { unit = "vitest@1.2.0", integration = "supertest@6.3.4", e2e = "playwright@1.41.0" }
```

## Validation rules

- Every version is a concrete release (`semver` or vendor-equivalent). `latest`, `lts`, or `>=X` are re-prompted (LTS may resolve to the current LTS at write-time).
- Every container declared in `design.architecture.containers` must have a stack entry.
- `primary_database` must agree with `project.elicitation.primary_database` if both are set; conflicts surface to the user.
- Build tool / package manager pairing must be consistent with the chosen language conventions (warn on mismatch).
- Test-framework slots can be `none-yet` but the design-package readiness review will flag this.

## Reusable across

- `create-design-package` (step 02-design)
- `greenfield-design-package` composition (declared as required elicitation)
