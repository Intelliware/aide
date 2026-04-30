---
slug: derive-from-re
sequence: 1
depends-on-prior: false
---

# Step 1 — Auto-derive rules from RE Part A

## Goal

Populate everything `project-context.md` can prove from existing RE
Part A docs and the source repos' lock files, without inventing
content. This step is read-only against the source and writes only to
an in-memory derivation record.

## Inputs

- `[[project.repos]]` from `project.toml`.
- RE Part A docs at `<KB>/source-docs/<repo>/part-a/**`, especially:
  - `package.json`, `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`
  - `*.csproj`, `Directory.Build.props`, `paket.dependencies`
  - `pyproject.toml`, `requirements*.txt`, `Pipfile.lock`
  - `go.mod`, `go.sum`
  - `Cargo.toml`, `Cargo.lock`
  - `pubspec.lock`
  - `Gemfile.lock`
  - `tsconfig.json`, `.eslintrc*`, `.prettierrc*`, `vitest.config.*`,
    `jest.config.*`, `babel.config.*`, build scripts
- Existing `<KB>/shared/ai-rules/project-context.md` if any.

## Procedure

1. **Detect refresh-vs-create.** If `project-context.md` exists:
   - Interactive: prompt "[r] refresh auto sections, [R] replace
     entire document, [c] cancel".
   - Non-interactive: default `r`.
   - On cancel: stop.
2. **For each repo in `[[project.repos]]`** load RE Part A and extract:
   - Primary language(s) and exact versions.
   - Framework(s) and versions (NestJS, FastAPI, Spring, .NET, React,
     Vite, Next, etc.).
   - Test framework(s) and versions.
   - Lint / format tools and configurations.
   - Package manager + lockfile.
   - Build / dev / test commands (read from `scripts:` in `package.json`,
     `dotnet`/`go`/`cargo` defaults, or RE Part A `commands.md`).
   - Module style (CommonJS / ESM / mixed).
3. **Detect observed patterns** by scanning RE Part A `patterns.md`
   sections (when present) for:
   - Validation library use (class-validator, Joi, Zod, FluentValidation,
     pydantic).
   - Error-handling style (exceptions vs Result types vs middleware-
     based).
   - Test layout convention (co-located vs `tests/` directory).
   - Mocking style (`jest.mock`, vi.mock, Moq, MagicMock, …).
4. **Build the derivation record** (in-memory, no writes yet):
   ```
   {
     "per_repo": [
       {
         "code": "api-orders",
         "language": "TypeScript 5.4.5",
         "framework": "NestJS 10.3.7",
         "test_framework": "Jest 29.7",
         "package_manager": "pnpm",
         "build_cmd": "pnpm build",
         "test_cmd": "pnpm test",
         "dev_cmd": "pnpm dev",
         "lint": "ESLint airbnb-typescript",
         "module_style": "ESM",
         "observed": { "validators": "class-validator", … }
       },
       …
     ],
     "divergence_signals": [...]
   }
   ```
5. **Compute divergence signals** (input to Step 03):
   - Different primary languages across repos? mark `lang-diff`.
   - Different test framework families? mark `test-diff`.
   - Different package managers? mark `pkg-diff`.
   - Different validation libraries? mark `validator-diff`.

## Acceptance

- A derivation record is built with one entry per repo.
- Every version captured has a lock-file or build-config citation
  (recorded in the derivation record for the Step 03 audit print).
- Divergence signals computed.

## Outputs

- In-memory derivation record. No disk writes.

## Hand-off

`steps/02-elicit-unobvious-rules.md`.
