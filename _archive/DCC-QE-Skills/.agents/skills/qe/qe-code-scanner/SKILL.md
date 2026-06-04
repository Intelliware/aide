---
name: qe-code-scanner
description: "Use when the user asks to scan the BB-DCC-QE codebase, refresh KNOWLEDGE.md, says 'rescan', 'update knowledge', 'scan the code', 'I just pulled', 'code changed', or when qe-development detects that docs/KNOWLEDGE.md is missing or stale. Deep-scans the BB-DCC-QE Playwright + Cucumber + Java test project and writes all findings to docs/KNOWLEDGE.md as the single source of truth for all QE skills."
---

# QE Code Scanner

Deep-scan the BB-DCC-QE test automation codebase and write all findings to
`docs/KNOWLEDGE.md`. This file becomes the single source of truth for
`qe-development`, `qe-execution`, and `qe-defect-review`.

## When to use

- `docs/KNOWLEDGE.md` is missing, empty, or stale
- User says "rescan", "I just pulled", "code changed", "refresh knowledge"
- Called automatically by `qe-development` at start (if missing) and at end
  (after code changes)
- User explicitly invokes this skill

## When NOT to use

- KNOWLEDGE.md is fresh and no code has changed — skip the scan

## Inputs

| Input | Source | Required |
|---|---|---|
| BB-DCC-QE repository | filesystem (sibling repo) | Yes |

## Outputs

| Output | Location | Committed |
|---|---|---|
| `docs/KNOWLEDGE.md` | `BB-DCC-QE/docs/KNOWLEDGE.md` | Yes |

## Scanning Rules — NEVER VIOLATE

- Never assume a framework — detect everything from actual files
- Never skip a file because it has no comments — read the code and infer purpose
- Never populate KNOWLEDGE.md with guesses — only write what was actually found
- Never overwrite KNOWLEDGE.md partially — always do a full rescan and full rewrite
- If a section has nothing to report, write `NOT FOUND` — do not leave it blank
- Do not pad — every line in KNOWLEDGE.md must be actionable knowledge
- **Comments lie. Code doesn't.** Always read the actual method body, not just
  its name or javadoc. Infer what a method does from what it actually executes.

## Scan Process — Follow In Order

### STEP 1 — Detect project foundation

Read config files first:
- `pom.xml` → framework, language, dependencies
- `browserstack.yml` → BrowserStack SDK config
- Any `.properties` / `.yaml` / `.json` config files → environment and test data
- Runner classes → how tests are executed and tagged

### STEP 2 — Map folder structure

Scan root directory and identify where each category lives:
- Step definitions, page/component classes, utility/generic action classes
- Hooks/fixtures/setup, feature/spec files, test data, environment config
- Locator files (objectRepo.properties, backupRepo.properties)
- API client classes, validator/assertion classes

Ignore: `node_modules`, `target`, `build`, `dist`, `.git`, `.idea`,
`allure-results`, `playwright-report`, `__pycache__`, `coverage`, `docs/`

### STEP 3 — Deep scan utility and generic classes

**Do this before anything else — these are the most reused.**

For every utility/generic/helper/actions class:
- Read every method — not just names
- Tag each method by interaction TYPE:
  `[CLICK]` `[INPUT]` `[SELECT]` `[DIALOG]` `[WAIT]` `[ASSERT]` `[NAVIGATE]`
  `[TABLE]` `[PAGINATION]` `[UPLOAD]` `[DOWNLOAD]` `[SCROLL]` `[FRAME]`
  `[API]` `[AUTH]` `[DATA]` `[SCREENSHOT]` `[NETWORK]`
- Note exact method signature
- Note edge-case handling (frames, retries, dynamic elements)

### STEP 4 — Scan step definitions

For every step definition class:
- Extract EXACT Gherkin annotation strings — copy verbatim
- Read method body — what page methods or utilities does it call
- Note parameters and how they're used
- Group by domain/feature area
- Flag duplicates or near-duplicates

### STEP 5 — Scan page and component classes

For every page/component class:
- List all public methods with signatures
- Note what UI area it covers
- Flag methods that could be more generic

### STEP 6 — Scan feature files

For every feature file:
- Record file name and path
- Note what user journey or feature it tests
- Extract Background steps (shared entry points)
- Note tags used

### STEP 7 — Scan environment and test data config

- Detect all environment names from `environments.json`
- Note what each env contains (URLs, credentials, test data keys)
- Detect how active environment is selected at runtime (`-Denv=`)
- Note available user roles/personas/credentials

### STEP 8 — Scan auth and entry point patterns

- How authentication is handled (hooks, background steps, base class)
- Exact reusable login/entry step or method
- Available roles/personas
- Shared Background steps across feature files

### STEP 9 — Detect naming conventions

By reading actual files:
- Class naming (PascalCase, suffixes like Page/Steps/Component)
- Method naming (camelCase verbs)
- File naming (kebab-case, snake_case)
- Step wording style and tense
- Tag/marker format
- Locator naming pattern (`{page}.{element}.{type}`)

### STEP 10 — Detect framework patterns

By reading actual code:
- Wait and retry handling
- Locator definition and access (ConfigManager, objectRepo.properties)
- Assertion structure (AssertJ)
- State sharing (context objects, thread-local)
- API call structure (BackendFacade pattern)
- Base classes and abstract layers
- Execution modes (local, BrowserStack CDP, BrowserStack SDK)
- Report locations and formats

## KNOWLEDGE.md Structure

Write findings to `BB-DCC-QE/docs/KNOWLEDGE.md` using this structure:

```
# KNOWLEDGE.md
## SCAN METADATA          — timestamp, totals
## 0. PROJECT RUNTIME      — Maven commands, entry point, BrowserStack modes
## 1. PROJECT FOUNDATION   — framework, language, dependencies
## 2. PROJECT STRUCTURE    — full folder tree
## 3. UTILITY & GENERIC ACTIONS — every method with signature and type tag
## 4. MANAGERS & CONTEXT   — state management classes
## 5. COMPONENT CLASSES    — reusable UI components
## 6. PAGE & SERVICE CLASSES — page methods
## 7. API CLIENT CLASSES   — backend API interaction
## 8. STEP DEFINITIONS     — exact Gherkin strings, grouped by domain
## 9. VALIDATOR CLASSES    — assertion encapsulation
## 10. FEATURE FILES       — BDD scenarios by suite
## 11. HOOKS & TEST CYCLE  — lifecycle management
## 12. ENVIRONMENT & TEST DATA — config, environments, test data
## 13. NAMING CONVENTIONS  — detected patterns
## 14. FRAMEWORK PATTERNS  — reuse patterns
## 15. ACCESSIBILITY TESTING — A11y integration
## 16. MOBILE TESTING      — Appium integration
## 17. REPORTING & ANALYTICS — Allure, Omniture, defect reporting
## 18. DEBUGGING & UTILITIES — CucumberDebugger, performance
## 19. FACTORY PATTERN     — driver initialization
## 20. QUICK REFERENCE     — most-used classes
## 21. LOCATOR STRATEGY    — where stored, naming, access patterns
## 22. KNOWN GAPS & RISKS  — hardcoded waits, static state, etc.
## 23. ENVIRONMENTS & TEST DATA — valid environments table
## 24. BROWSERSTACK EXECUTION MODES — mode comparison, setup steps
```

Format rules:
- Every entry must be actionable — something a skill can directly use
- Include exact method signatures, not summaries
- Include exact file paths relative to BB-DCC-QE root
- Tag utility methods by interaction TYPE
- No padding, no generic descriptions
- If something wasn't found, write `NOT FOUND`

## Ensure docs/ directory exists

Before writing, ensure `BB-DCC-QE/docs/` directory exists. Create it if missing.

## Hand-off

After scan completes, report to the user:
> "Scan complete. KNOWLEDGE.md updated at `docs/KNOWLEDGE.md`. Found [N] step
> defs, [N] utility methods, [N] feature files. Ready."

See `references/` for detailed documentation.

