# Project Context Generator

## Purpose

Create a condensed context document that AI coding agents load before executing implementation plan tasks. For brownfield projects, the context captures what a human developer would absorb through osmosis over weeks of working in the codebase. Includes: naming conventions (file naming, variable naming, class/function naming patterns with examples from the actual codebase), established code patterns the new code must follow (DI registration, state management approach, API layer conventions, error handling patterns, logging patterns — each with a codebase reference the agent can read), testing conventions (test file location, naming, fixture/factory patterns, assertion style, mock approach — from existing-test-analysis), architectural boundaries the agent must not cross (module boundaries, layer separation rules, what belongs where), codebase gotchas and known quirks (unusual patterns, legacy code that looks wrong but is intentional, areas with implicit coupling), import/dependency conventions (how modules reference each other, barrel files, path aliases), and style/formatting rules (linter config, formatter config, any team-specific rules beyond tool defaults). Each entry includes a concrete codebase example rather than abstract description. For greenfield projects, captures the project's chosen conventions rather than discovered ones. Produces the document that implementation plan tasks reference as their operating context.

## What This Produces

A condensed context document that AI coding agents load before executing any implementation plan task. This document captures the unwritten knowledge a human developer absorbs through osmosis — naming conventions, code patterns, testing approaches, architectural boundaries, and codebase gotchas — distilled into a format an AI agent can read in a single pass.

Without this context, AI agents default to generic patterns: standard naming that doesn't match the codebase, framework-default approaches where the team uses custom ones, and test structures that don't follow established conventions. The result is code that works but looks like it was written by someone who has never seen the codebase before.

**The cardinal rule: only include things that are unobvious.** Every entry in this document should capture something the agent wouldn't know from reading a single file in isolation. Universal best practices ("use meaningful variable names") waste context window. Project-specific conventions ("service files are named `*.service.ts` and registered in `src/services/index.ts`") save the agent from guessing.

## When to Use

- Step 5 of implementation planning — runs after `delivery-planning` (or `prerequisites-planning` if delivery planning was skipped) and before `implementation-plan-creator`
- Consumes all prior implementation-planning artifacts (codebase analysis, test plan, prerequisites plan) plus direct codebase reading
- Even for greenfield projects this skill runs — to capture the project's chosen conventions rather than discovered ones

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Codebase analysis | `docs/<feature>/implementation-package/plan/codebase-analysis.md` — Section 3 (Coding Patterns), Section 4 (Code Dependencies), Section 6 (Conventions) | Yes — the primary source of discovered patterns |
| Test plan | `docs/<feature>/implementation-package/plan/test-plan.md` — Section 1 (Existing Test Analysis: file structure, naming, fixtures, mocking) | Yes — testing conventions |
| Prerequisites plan | `docs/<feature>/implementation-package/plan/prerequisites-plan.md` — Section 1 (Dependency Changes: new packages) | Yes — new dependencies the agent needs to know about |
| Solution design — technology stack | `docs/<feature>/solutions-package/design/02-technology-stack.md` — pinned versions, framework choices | Yes — the authoritative stack reference |
| Coding standards | `../assets/standards/` — common standards (`common/`), language-specific standards (`languages/{lang}/`), framework-specific standards (`frameworks/{framework}/`) | Yes — organizational rules that apply regardless of what the codebase currently does |
| Access to the codebase | Local filesystem — actual source files, config files, linter config, formatter config | Yes — the AI reads real code to extract concrete examples |

> **Missing input guard:** If any required input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[path]` but it was not found. This input is required. Please provide it or confirm I should proceed without it."*

### Coding Standards — How They Interact with Discovered Patterns

The `../assets/standards/` directory contains the organization's coding standards organized at three levels:

| Level | Path | Examples |
|-------|------|---------|
| **Common** | `../assets/standards/common/` | `naming-conventions.md`, `error-handling.md`, `logging.md`, `security-practices.md`, `code-documentation.md`, `dependency-management.md`, `rest-api-design.md` |
| **Common — testing** | `../assets/standards/common/testing/` | `unit-testing.md`, `integration-testing.md`, `contract-testing.md`, `mocking-strategy.md`, `test-data-management.md`, `accessibility-testing.md` |
| **Language** | `../assets/standards/languages/{lang}/` | `standards.md`, `testing.md` — for TypeScript, Java, Kotlin, Swift |
| **Framework** | `../assets/standards/frameworks/{framework}/` | `standards.md`, `testing.md` — for React, Angular, Spring Boot |

**Read the applicable standards files based on the technology stack.** If the project uses TypeScript and React, read `common/`, `languages/typescript/`, and `frameworks/react/`. Do not read standards for languages or frameworks the project does not use.

**Standards vs. discovered patterns — precedence rules:**

1. **Standards define the rules.** The coding standards are the organization's authoritative conventions. They are not suggestions.
2. **Discovered patterns show how the rules are applied.** The codebase analysis reveals how the team has implemented the standards in practice — naming, structure, error handling patterns.
3. **When discovered patterns match standards:** Include the entry with the standard's rule and the codebase's example. The standard provides the "why"; the codebase provides the "how it looks here."
4. **When discovered patterns deviate from standards: the standard wins for new code.** The context document records the standard as the rule the agent must follow. The deviation is flagged in the "Standards Deviations" section (Section 7) for the reviewer's awareness — this is informational, not a prompt to follow the deviating pattern. The user may override a specific standard for this project (e.g., the team intentionally uses a non-standard pattern for a documented reason), but the **default is always the standard.** If no explicit override is given, the standard applies.
5. **When standards cover something not visible in the codebase:** Include the standard. The agent needs to know the rule even if no existing code demonstrates it (e.g., a testing standard for a pattern the codebase hasn't needed yet).

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  PROJECT CONTEXT GENERATOR — INTERNAL SEQUENCE                    │
├──────────────────────────────────────────────────────────────────┤
│  1. LOAD — Read all implementation-planning artifacts                          │
│     Codebase analysis (patterns, conventions),                   │
│     test plan (testing conventions),                             │
│     prerequisites plan (new dependencies),                      │
│     solution design (technology stack).                          │
├──────────────────────────────────────────────────────────────────┤
│  2. EXTRACT — Read the codebase for concrete examples            │
│     For each convention and pattern discovered,                  │
│     find a real code example in the codebase.                   │
│     No abstract descriptions — only examples.                   │
├──────────────────────────────────────────────────────────────────┤
│  3. CATEGORIZE — Organize into context sections                  │
│     Stack, naming, patterns, testing, boundaries,               │
│     imports, gotchas, style.                                    │
├──────────────────────────────────────────────────────────────────┤
│  4. TRIM — Remove obvious and universal entries                  │
│     Delete anything a competent developer would                 │
│     already know. Keep only project-specific rules.             │
│     Exception: keep entries from coding standards even          │
│     if they seem obvious — standards are authoritative.         │
├──────────────────────────────────────────────────────────────────┤
│  5. VALIDATE — Check completeness and conciseness                │
│     Every entry has a codebase reference.                       │
│     No entry is a universal best practice.                      │
│     Document fits within context window budget.                 │
├──────────────────────────────────────────────────────────────────┤
│  6. ASSEMBLE — Write the context document                        │
│     Produce the structured output. Present for review.          │
└──────────────────────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Load Implementation Planning Artifacts and Coding Standards

Read all prior implementation-planning artifacts and the applicable coding standards. This step synthesizes — it does not repeat what was already discovered. The codebase analysis (Step 1) already mapped patterns and conventions. The coding standards define the organizational rules. This skill distills both into agent-consumable rules.

From the **codebase analysis** (Section 3 — Coding Patterns):
- Per-layer patterns (controllers, services, repositories, models, views)
- Framework-specific patterns
- Error handling approach
- Logging patterns
- State management approach (frontend)

From the **codebase analysis** (Section 6 — Conventions):
- File naming conventions
- Variable/function/class naming conventions
- Code organization conventions
- Import ordering conventions
- Formatting and style conventions

From the **test plan** (Section 1 — Existing Test Analysis):
- Test file location and naming
- Test structure (describe/it, test classes, test functions)
- Fixture and factory patterns
- Mocking approach
- Assertion style

From the **solution design — technology stack** (Section 2):
- Pinned versions for all technologies
- Framework-specific configuration

From the **coding standards** (`../assets/standards/`):
- Read `common/` standards — naming conventions, error handling, logging, security, code documentation, dependency management, REST API design
- Read `common/testing/` standards — unit testing, integration testing, contract testing, mocking strategy, test data management, accessibility testing
- Read the language-specific standards for the project's language(s) — e.g., `languages/typescript/standards.md` and `languages/typescript/testing.md`
- Read the framework-specific standards for the project's framework(s) — e.g., `frameworks/react/standards.md` and `frameworks/react/testing.md`
- **Only read standards files for technologies in the project's stack.** Do not read Java standards for a TypeScript project.

### Step 2 — Extract Concrete Examples from the Codebase

For each convention and pattern from Step 1, find a real example in the codebase. This is the step that makes the context document useful — abstract rules ("use PascalCase for components") are less effective than concrete examples ("see `src/components/UserProfile.tsx`").

**What to extract for each entry:**

| Convention/Pattern | What the Agent Needs | Example |
|-------------------|---------------------|---------|
| A naming rule | The pattern + a real filename or identifier from the codebase | *"Service files: `{name}.service.ts` — see `src/services/user.service.ts`"* |
| A code pattern | The pattern + a file path the agent can read | *"All API endpoints use the `ApiResponse<T>` wrapper — see `src/types/api-response.ts` and `src/controllers/user.controller.ts:34`"* |
| A testing convention | The convention + a test file reference | *"Integration tests use Testcontainers for DB — see `test/integration/user.repository.test.ts`"* |
| An architectural boundary | The rule + what's on each side | *"Controllers call services, never repositories directly — `src/controllers/` → `src/services/` → `src/repositories/`"* |
| A gotcha | The trap + why it exists | *"`src/utils/legacy-auth.ts` uses a non-standard token format — do not refactor; external system depends on this format"* |

**How to find examples:**

1. For each pattern in the codebase analysis, read the specific files referenced in Section 3 (Coding Patterns).
2. Pick the clearest, most representative example — not the most complex one.
3. Note the file path and, if helpful, the line number.
4. If the convention is about structure (e.g., test file location), show the directory layout.

### Step 3 — Categorize

Organize all entries into the following sections. Each section serves a specific purpose for the AI coding agent.

**Section 1 — Technology Stack.**

Pinned versions for everything the agent might reference. The agent uses this to ensure it doesn't suggest incompatible APIs or deprecated features.

| Technology | Version | Notes |
|-----------|---------|-------|
| *(Node.js)* | *(20.x)* | *(LTS — do not use Node 22 features)* |
| *(NestJS)* | *(10.3.x)* | *(Uses module-based DI — not standalone API)* |
| *(TypeORM)* | *(0.3.20)* | *(Uses DataSource pattern, not legacy Connection)* |
| *(Jest)* | *(29.x)* | *(With ts-jest transform)* |

Include new dependencies from the prerequisites plan that the agent will use during implementation.

**Section 2 — Naming Conventions.**

How things are named in this codebase. Combines rules from `../assets/standards/common/naming-conventions.md` and the language/framework standards with concrete examples discovered in the codebase analysis. Organized by what's being named.

| What | Convention | Example |
|------|-----------|---------|
| **Files — components** | *(PascalCase: `ComponentName.tsx`)* | *`src/components/UserProfile.tsx`* |
| **Files — services** | *(kebab-case: `name.service.ts`)* | *`src/services/user.service.ts`* |
| **Files — tests** | *(mirror source: `name.service.spec.ts`)* | *`test/unit/user.service.spec.ts`* |
| **Files — migrations** | *(timestamp prefix: `YYYYMMDDHHMMSS_description`)* | *`src/migrations/20240115120000_create_users_table.ts`* |
| **Variables** | *(camelCase for locals, UPPER_SNAKE for constants)* | *`const maxRetries = 3; const MAX_TIMEOUT_MS = 5000;`* |
| **Classes** | *(PascalCase, suffixed by role)* | *`UserService`, `OrderRepository`, `RefundController`* |
| **Interfaces** | *(PascalCase, no I- prefix)* | *`UserProfile` not `IUserProfile` — see `src/types/`* |
| **Enums** | *(PascalCase name, PascalCase members)* | *`enum OrderStatus { Pending, Confirmed, Shipped }`* |
| **Database tables** | *(snake_case, plural)* | *`user_accounts`, `order_items`* |
| **Database columns** | *(snake_case)* | *`created_at`, `refund_status`* |
| **API endpoints** | *(kebab-case, plural nouns)* | *`/api/v1/order-items`, `/api/v1/refunds`* |
| **Environment variables** | *(UPPER_SNAKE_CASE)* | *`DATABASE_URL`, `REDIS_URL`, `FEATURE_REFUNDS_ENABLED`* |

**Section 3 — Code Patterns.**

Established patterns the new code must follow. Each entry has a file reference the agent can read to see the full pattern. Combines rules from the applicable coding standards (`../assets/standards/common/error-handling.md`, `../assets/standards/common/logging.md`, `../assets/standards/common/security-practices.md`, `../assets/standards/common/rest-api-design.md`, and language/framework-specific standards) with concrete implementations discovered in the codebase.

Organize by concern:

- **API layer** — controller structure, request validation, response wrapping, error handling (ref: `../assets/standards/common/rest-api-design.md`)
- **Service layer** — business logic patterns, transaction handling, event emission
- **Data access layer** — repository pattern, query builders, entity mapping
- **Error handling** — error classes, error codes, error responses, logging on error (ref: `../assets/standards/common/error-handling.md`)
- **Logging** — logger instantiation, log levels, structured logging format (ref: `../assets/standards/common/logging.md`)
- **Authentication / Authorization** — guards, decorators, role checks (ref: `../assets/standards/common/security-practices.md`)
- **State management** (frontend) — store structure, action patterns, selector patterns
- **Dependency injection** — registration patterns, module structure

For each pattern, provide:
1. **The rule** — one sentence describing what the agent must do
2. **The reference** — a file path (and optionally a line range) where the agent can see the pattern in action
3. **Anti-pattern** (optional) — what NOT to do, if the wrong approach is a common AI agent mistake

**Section 4 — Testing Conventions.**

How tests are written in this codebase. Combines rules from `../assets/standards/common/testing/` and language/framework-specific testing standards with conventions discovered in the test plan (Section 1 — Existing Test Analysis).

| Aspect | Convention | Reference |
|--------|-----------|-----------|
| **Test file location** | *(Co-located: `src/services/__tests__/` OR separate: `test/unit/`)* | *directory layout* |
| **Test file naming** | *(`.spec.ts` / `.test.ts` / `_test.go`)* | *existing test files* |
| **Test structure** | *(`describe('ServiceName', () => { describe('methodName', () => { it('should ...') })})`)* | *specific test file* |
| **Fixture approach** | *(Factory functions in `test/factories/` OR inline fixtures)* | *factory file path* |
| **Mocking approach** | *(`jest.mock()` for modules; manual mocks in `__mocks__/`)* | *mock example file* |
| **Database in tests** | *(Testcontainers / in-memory SQLite / test database with cleanup)* | *integration test setup file* |
| **Assertion style** | *(`expect(x).toBe(y)` / `assert.equal(x, y)` / `should`)* | *any test file* |
| **Test data cleanup** | *(Transaction rollback per test / truncate tables in `beforeEach`)* | *test setup file* |

**Section 5 — Architectural Boundaries.**

Rules about what belongs where. The agent must not cross these boundaries.

| Boundary | Rule | Consequence if Violated |
|----------|------|------------------------|
| *(Controller → Service)* | *(Controllers call services, never repositories or database directly)* | *(Bypasses business logic, validation, and transaction management)* |
| *(Service → Repository)* | *(Services call repositories, never raw SQL or query builders)* | *(Bypasses entity mapping and query optimization)* |
| *(Module boundaries)* | *(Modules import from each other's public API only — never reach into internal files)* | *(Creates tight coupling; breaks when internal structure changes)* |
| *(Frontend → Backend)* | *(Frontend calls backend through API client only — never imports backend types directly)* | *(Couples frontend build to backend; breaks independent deployment)* |

**Section 6 — Import and Dependency Conventions.**

How modules reference each other. This prevents the agent from using the wrong import style.

| Convention | Rule | Example |
|-----------|------|---------|
| **Path aliases** | *(Use `@/` for `src/` root — configured in tsconfig.json)* | *`import { UserService } from '@/services/user.service'`* |
| **Barrel files** | *(Each module has `index.ts` exporting public API — import from directory, not file)* | *`import { UserService } from '@/services'` not `from '@/services/user.service'`* |
| **Import ordering** | *(1. Node builtins, 2. External packages, 3. Internal modules, 4. Relative imports — blank line between groups)* | *see any controller file* |
| **Circular dependency avoidance** | *(Types shared via `@/types/` — never import a service into a type file)* | *`src/types/` contains shared interfaces* |

**Section 7 — Codebase Gotchas.**

Things that look wrong but are intentional, or areas with implicit coupling the agent must be aware of.

| Gotcha | What It Looks Like | Why It Exists | What to Do |
|--------|-------------------|--------------|-----------|
| *(Legacy auth token format)* | *(`src/utils/legacy-auth.ts` uses non-standard JWT with extra fields)* | *(External partner system depends on this exact format)* | *(Do not refactor; new auth code in `src/auth/` uses standard format)* |
| *(Implicit event coupling)* | *(`OrderService.complete()` emits `order.completed` event — `InventoryService` and `NotificationService` listen)* | *(Event-driven architecture for cross-module communication)* | *(If modifying order completion, check all event listeners in `src/events/handlers/`)* |
| *(Database column naming inconsistency)* | *(`users` table uses `createdAt` but `orders` table uses `created_at`)* | *(Legacy table predates naming convention; migration to fix would be breaking)* | *(New tables use `snake_case`; existing tables keep their current naming)* |

**Section 8 — Style and Formatting.**

Linter and formatter configuration the agent should respect. Only include rules that deviate from defaults or that agents commonly violate.

| Tool | Config File | Non-Default Rules |
|------|------------|-------------------|
| *(ESLint)* | *(`.eslintrc.js`)* | *(`@typescript-eslint/no-explicit-any: error`, `import/order: [error, { groups: [...] }]`)* |
| *(Prettier)* | *(`.prettierrc`)* | *(`printWidth: 100`, `singleQuote: true`, `trailingComma: 'all'`)* |

Only list non-default rules. If the project uses default ESLint/Prettier/Black/Rubocop configuration with no overrides, state: "Default configuration — no project-specific overrides."

### Step 4 — Trim

Review every entry and remove anything that is:

- **Universal best practice** — "use descriptive variable names," "handle errors," "write tests." Every competent developer and AI agent already knows this. **Exception: do NOT remove entries that come from the organization's coding standards (`../assets/standards/`), even if they seem like universal best practices.** The standards are the organization's authoritative rules. An entry like "use typed error classes" might seem obvious, but if it's in the standards, it stays — because the codebase may not follow it, and the agent needs the explicit instruction to follow the standard rather than the codebase pattern.
- **Inferable from a single file** — if the agent can figure it out by reading the file it's editing, it doesn't need to be in the context document.
- **Duplicated from the solution design** — the context document supplements the design, not repeats it.
- **Too verbose** — each entry should be 1-2 sentences plus a file reference. If an entry needs a paragraph, it's too complex for a context document — consider linking to a dedicated ADR or documentation file instead.

**Context window budget.** This document is loaded into every task execution. A 5,000-word context document consumes ~6,500 tokens of the agent's context window on every task. Target a document that fits within 2,000-3,000 words (roughly 2,500-4,000 tokens). If the document exceeds this, prioritize: naming (agents get this wrong most often) > code patterns > testing > boundaries > gotchas > style.

### Step 5 — Validate

Check the context document for:

- **Every entry has a codebase reference** — a file path (or directory path) the agent can read to see the convention in action. No entry should be an abstract rule without a concrete example.
- **No universal best practices** — scan every entry and ask: "Would this be true of any project using this technology?" If yes, remove it.
- **Consistency with implementation-planning artifacts** — do the naming conventions match what the codebase analysis found? Do the testing conventions match the test plan?
- **Coding standards coverage** — are all applicable standards from `../assets/standards/` reflected in the context document? Are deviations between codebase patterns and standards flagged?
- **New dependencies included** — are new packages from the prerequisites plan mentioned in the technology stack section?
- **No contradictions** — does any entry contradict another? Does any entry contradict the solution design?
- **Length check** — is the document within the 2,000-3,000 word target? If over, what can be trimmed?

### Step 6 — Assemble

Combine all sections into the project context document. This becomes the fifth artifact of the implementation planning phase.

### File Output

Write the completed project context to `docs/<feature>/implementation-package/plan/project-context.md`.

Add a **Usage Guidelines** section at the end:

**For AI agents:**
- Read this document before implementing any task
- Follow every convention listed — prefer the stricter interpretation when ambiguous
- **When a codebase example contradicts a standard listed in this document, follow the standard.** The codebase example shows context and demonstrates the pattern's shape, but it is not necessarily best practice. The standard is the authority for new code.
- When a convention conflicts with a task instruction, the task instruction wins (the task is more specific)
- When in doubt about a pattern, read the referenced file to see the full implementation
- Do not restructure code outside your current task's scope, even if it doesn't match these conventions

**For humans:**
- Keep this document lean — it is loaded into every task execution and consumes context window
- Update when conventions change (e.g., new linter rules, renamed patterns)
- Review quarterly — remove entries that are no longer relevant
- This is a living document, not a frozen spec

---

## Output Structure

**1. Technology Stack** — pinned versions, framework notes, new dependencies (from Step 3, Section 1)

**2. Naming Conventions** — file, variable, class, database, API, env var naming with examples (from Step 3, Section 2)

**3. Code Patterns** — per-concern patterns with file references and anti-patterns (from Step 3, Section 3)

**4. Testing Conventions** — file location, naming, structure, fixtures, mocking, assertions (from Step 3, Section 4)

**5. Architectural Boundaries** — layer rules, module boundaries, coupling rules (from Step 3, Section 5)

**6. Import and Dependency Conventions** — aliases, barrel files, ordering, circular dependency rules (from Step 3, Section 6)

**7. Codebase Gotchas** — intentional quirks, implicit coupling, naming inconsistencies (from Step 3, Section 7)

**8. Style and Formatting** — non-default linter/formatter rules (from Step 3, Section 8)

**9. Usage Guidelines** — how agents and humans should use this document (from Step 6)

---

## Hand-off Gate

Before proceeding to `implementation-plan-creator` (Step 6), you must:

1. Write the completed project context document in full.
2. Present it to the user for review with the following questions:
   - **Naming:** Are the naming conventions accurate? Are there conventions I missed or got wrong?
   - **Patterns:** Are the code patterns correct? Are there established patterns I should have included?
   - **Testing:** Are the testing conventions accurate? Are there testing patterns specific to your team that I missed?
   - **Boundaries:** Are the architectural boundaries correct? Are there boundaries I missed?
   - **Gotchas:** Are there codebase gotchas or known quirks I should add? Are there areas where the agent is likely to make mistakes?
   - **Completeness:** Is there anything a new developer would need to know on their first day that isn't captured here?
   - **Accuracy:** Is anything in this document wrong or outdated?
3. If the user identifies corrections or additions, update and re-present before proceeding.
4. Do not proceed until the user explicitly confirms the context document is accurate.

## Completion Criteria

- [ ] Technology stack section lists all relevant technologies with pinned versions
- [ ] New dependencies from the prerequisites plan are included
- [ ] Naming conventions cover files, variables, classes, database objects, API endpoints, and environment variables
- [ ] Every naming convention has at least one concrete example from the codebase
- [ ] Code patterns cover all relevant concerns (API layer, service layer, data access, error handling, logging)
- [ ] Every code pattern has a file reference the agent can read
- [ ] Testing conventions cover file location, naming, structure, fixtures, mocking, and assertions
- [ ] Architectural boundaries are defined with consequences for violation
- [ ] Import and dependency conventions are documented (aliases, barrel files, ordering)
- [ ] Codebase gotchas are documented (intentional quirks, implicit coupling, naming inconsistencies)
- [ ] Style and formatting rules only include non-default configurations
- [ ] Applicable coding standards from `../assets/standards/` are reflected in the context document
- [ ] Deviations between codebase patterns and coding standards are flagged and resolved with the user
- [ ] No entry is a universal best practice — every entry is project-specific or standard-specific
- [ ] Every entry has a codebase reference (file path or directory)
- [ ] Document is within the 2,000-3,000 word target (or justified if longer)
- [ ] Usage guidelines are included for both agents and humans
- [ ] The user has explicitly confirmed the context document is accurate

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| The AI agent creates files named `UserService.ts` when the project uses `user.service.ts` | Section 2 documents file naming conventions with examples from the actual codebase |
| The AI agent writes a controller that queries the database directly, bypassing the service and repository layers | Section 5 documents architectural boundaries with explicit consequences for violation |
| The AI agent uses `import { UserService } from '../services/user.service'` when the project uses `@/services` path aliases | Section 6 documents import conventions with examples |
| The AI agent writes tests with inline data when the project uses factory functions in `test/factories/` | Section 4 documents testing conventions including fixture approach with file references |
| The AI agent refactors `src/utils/legacy-auth.ts` to use standard JWT because the current implementation looks wrong | Section 7 documents gotchas — intentional quirks that should not be changed |
| The AI agent uses `interface IUserProfile` when the project convention is `interface UserProfile` (no I- prefix) | Section 2 documents naming conventions for interfaces with examples |
| The AI agent creates a 10,000-word context document that consumes half the context window on every task | Step 4 enforces a 2,000-3,000 word target and removes universal best practices |
| The AI agent writes error handling inline instead of using the project's custom error classes | Section 3 documents error handling patterns with file references to the actual error classes |
| The AI agent uses `any` types in TypeScript when the project has `@typescript-eslint/no-explicit-any: error` | Section 8 documents non-default linter rules |
| The AI agent imports from an internal module file instead of the barrel file, creating tight coupling | Section 6 documents barrel file conventions with import examples |
| Different tasks produce code with inconsistent naming because each task's agent guesses differently | The context document is loaded for every task, ensuring all agents follow the same conventions |
| The organization has coding standards (error handling, logging, security) but the AI agent ignores them because it only sees codebase patterns | Step 1 reads the applicable `../assets/standards/` files and incorporates organizational rules alongside discovered patterns |
| The codebase deviates from the coding standards but the agent follows the codebase pattern, perpetuating the deviation | Precedence rule 4 establishes that the standard wins for new code by default. Deviations are flagged for awareness, but the agent follows the standard unless the user has explicitly overridden it for this project |
| The AI agent writes code that works but looks like it was written by someone unfamiliar with the codebase | Every section provides concrete codebase examples the agent can reference to match the existing style |
