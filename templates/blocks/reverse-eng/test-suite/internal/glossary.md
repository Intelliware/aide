---
slug: glossary
title: "Glossary"
applies-to: [re-test-suite-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 260
---

## 16. Glossary

Domain + suite-specific terms appear here. The glossary's job is to defuse ambiguity — "fixture" means three different things across pytest, Cucumber, and Playwright; "scenario" means one thing in Gherkin and another in pytest; "tag" and "marker" are sometimes synonymous and sometimes not. Pin the meaning each term carries inside *this* suite, and cross-reference the project-level glossary (`{project-root}/docs/glossary.md` or the KB's `_meta/glossary.md`) for application-domain terms.

Keep entries terse. One sentence. Cross-reference rather than re-explain.

### Suggested template content

| Term | Meaning inside this suite | Synonyms / aliases to avoid |
|---|---|---|
| Scenario | A single Gherkin `Scenario:` block, or — outside BDD — a single test function | "test case" (ambiguous; prefer "scenario") |
| Feature file | A `.feature` file containing one or more scenarios sharing a Background | "spec" (when not in a BDD context) |
| Step definition | A function that implements a Gherkin step's natural-language phrasing | "step", "glue code" |
| Page object | A class encapsulating the locators + actions of one UI surface; exposes intention-revealing methods only | "PO" |
| Fixture | A loaded or pre-built test resource: a JSON file, a seeded DB row, or a runner-provided context object | (don't conflate with "factory" or "builder") |
| Builder / factory | A function that *generates* a test object at runtime — distinct from a static fixture | (distinct from "fixture") |
| Tag / marker | A `@name` annotation used by the runner to include / exclude scenarios | (synonymous in this suite) |
| Profile | A named bundle of config values selecting a target environment + runner overrides | (don't confuse with "environment" — profile is the lever, environment is the target) |
| Environment | A live deployment of the application under test (dev / qa / stage / prod-readonly) | (don't confuse with "profile") |
| Quarantine | The `@flaky-quarantine` tag + open ticket workflow for known-flaky scenarios | |
| Smoke run | A `@smoke`-filtered invocation; sub-5-minute critical-path coverage | (not a synonym for "shallow") |
| Critical path | Revenue / auth / compliance flows that, if broken, block deploy | |
| Worker | A parallel-execution unit (process or thread depending on runner) | |
| Trace | The runner's detailed step-by-step recording, opened in `{{trace-viewer}}` | (Playwright-specific term in this suite) |

**Project-level glossary:** `{{project-glossary-path}}` — application-domain terms (Order, Refund, Settlement, etc.) live there; this glossary covers only test-suite-specific terms.

**KB cross-reference:** every term documented here that the consumer view (Part B) re-exports should appear in this table — keeps the two views in sync.

