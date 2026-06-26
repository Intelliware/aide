---
slug: implement-artifacts
sequence: 2
depends-on-prior: true
---

# Step 2 — Implement Artifacts

## Purpose

Implement the artifacts specified in the increment's plan into the resolved
test-artifact target repo, **after** Step 2a's KB-grounded reuse cross-check has been
completed and a disposition approved for every shareable artifact.

## Precondition

Step 2a (`steps/02a-reuse-cross-check.md`) must have run for this
increment and produced an approved disposition (`Reuse as-is` /
`Extend in place` / `Wrap with adapter` / `Create new`) for every
shareable artifact in the increment's plan. This step **must not**
write a shareable artifact for which no disposition was recorded.

If a disposition is missing, halt and re-enter Step 2a for the
missing artifact. If the user explicitly chose to skip the gate for
a non-shareable artifact, the skip note from Step 2a §7 stands and
this step proceeds.

## Procedure

### 2b.0 Disposition-driven write rule

For every shareable artifact in this step's scope, the disposition
recorded in Step 2a drives **what gets written**, not whether to
write. Apply this matrix before producing any file:

| Step 2a disposition | What Step 2 does |
|---|---|
| **Reuse as-is** | Do **not** create a new file. Add the import / reference / dependency declaration to the consuming artifact's file (the test spec, the runner, the build file). Skip to verification at the end of the step. |
| **Extend in place** | Open the existing artifact's file. Add the new behaviour as an *additive* change (new method / parameter overload / branch). Do not change the signature of existing callers' entry points. |
| **Wrap with adapter** | Create a small new file (or extend the consumer's local helpers) containing the thin adapter the user approved. The adapter delegates to the existing artifact; it does not re-implement behaviour. |
| **Create new** | Proceed with the increment's Implementation Plan / Artifact Plan instructions exactly as specified. |

If no disposition was recorded for an artifact (e.g. the artifact is
not shareable per Step 2a §7), Step 2 may proceed without
reuse-driven adjustment; the artifact follows the plan as written.

### 2b. Scaffolding increments

Read the increment's **Implementation Plan** section. Execute each
instruction in order:

- Modify build / dependency files per the plan
- Create configuration files (test profiles, framework configuration,
  runner properties)
- Create runner classes / suite definitions / test entry points
- Create shared test utilities (test producers, test consumers,
  assertion helpers, test-data builders, fixtures)
- Create directory structures for test artifacts

Each instruction is imperative — follow it precisely. Do not improvise
beyond what the plan specifies. If the plan is ambiguous, ask the user
before proceeding. Record any approved deviation for step 5b
(change-tracker).

All paths are resolved relative to the test-artifact target repo selected in
Step 1 (`[project.testing].qe_repo` when configured; otherwise the code repo
fallback) unless the increment explicitly names another repo. If the plan's
path points outside the resolved target, present the mismatch and wait for
explicit confirmation before writing.

### 2c. Test-case increments

Read the increment's **Artifact Plan** section. For each artifact listed:

1. **Identify the target path** — the exact file path in the resolved
   test-artifact target repo where the artifact will be created. Paths must
   respect the embedding strategy declared in the quality package.
2. **Generate the content** — following the plan's description of what
   the file should contain, the test scenario, the test steps, and the
   expected results. Use the framework conventions documented in the
   quality package's automation-and-cicd block.
3. **Write the file** — create or modify the file at the target path.
4. **Cross-reference** — ensure the artifact references the correct
   shared utilities, test-data builders, fixtures, and configuration
   from earlier scaffolding increments. Do not re-create equivalents
   inline.

Apply the verification rule: summarise what you are about to create, wait
for acknowledgement, then write.

### 2d. Framework-specific conventions

Respect the framework conventions documented in the quality package:

- Tag annotations match the declared tag vocabulary
- Package / module / directory structure matches the embedding strategy and
   resolved target repo
- Import paths and class / module / file names follow the project's
  naming conventions
- Test data uses the builders / factories / fixtures created in
  scaffolding (not ad-hoc literals)
- Logging / reporting hooks match the automation-and-cicd block

Never assume a default toolchain (Java, Maven, Cucumber, Playwright, etc.).
Read the pinned values from `project.toml`, the quality package, and the team's
`config/customizations/execute-quality-increments.toml` if present.

## Next

Proceed to `steps/03-verify.md`.
