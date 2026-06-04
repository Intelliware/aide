---
slug: runner-and-entry-points
title: "Runner and Entry Points"
applies-to: [re-test-suite-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 120
---

## 2. Runner and Entry Points

Document every way the suite can be invoked: the canonical CI invocation, the developer-local invocation, the per-tag / per-file targeted invocation, the headed-vs-headless modes, and the parallel-vs-serial modes. For each, show the exact command and what it produces (reports, traces, screenshots). The reader should be able to copy any of these commands and run them as-is.

Pin the runner versions. A test suite drifts dangerously fast when "we use Playwright" is the only thing documented; record the major + minor in use, the lockfile that owns it, and the upgrade procedure.

### Suggested template content

**Runner stack:**

- **Test runner:** `{{runner}}` (e.g. `Playwright Test 1.45`, `JUnit 5.10 + Cucumber 7.18`, `pytest 8.2`)
- **Build tool:** `{{build-tool}}` (e.g. `pnpm 9.0`, `Maven 3.9`, `Gradle 8.7`, `uv 0.4`)
- **Language pin:** `{{language-pin}}` (e.g. `Node.js 20.11 LTS`, `Java 21.0.3`, `Python 3.12.4`)
- **Lockfile of record:** `{{lockfile-path}}` (e.g. `pnpm-lock.yaml`, `pom.xml`, `uv.lock`)
- **Upgrade procedure:** {{upgrade-procedure — short paragraph or link}}

**Canonical invocations:**

| Mode | Command | Output location |
|---|---|---|
| CI (full suite, headless, parallel) | `{{ci-cmd}}` | `{{ci-report-path}}` |
| Local (full suite, headed) | `{{local-headed-cmd}}` | `{{local-report-path}}` |
| Local (single feature/spec) | `{{single-cmd}}` | `{{local-report-path}}` |
| Local (single scenario by name) | `{{by-name-cmd}}` | same |
| Tag-targeted | `{{tag-cmd}}` (e.g. `npx playwright test --grep @smoke`) | same |
| Debug (paused on failure) | `{{debug-cmd}}` | trace viewer |

**Profiles / environments:** {{profiles — table or list mapping a `--profile`, `-Dprofile=`, or env-var value to a target environment}}

**Reports and artefacts:**

| Artefact | Path / format | Lifetime |
|---|---|---|
| HTML report | `{{html-path}}` | per run |
| JUnit XML / JSON | `{{junit-path}}` | per run; CI uploads |
| Traces | `{{trace-path}}` | retained on failure only |
| Screenshots | `{{screenshot-path}}` | retained on failure only |
| Videos | `{{video-path}}` | optional; gated by `{{video-flag}}` |

**Gotchas:** {{gotchas — known footguns: e.g. "Do not run with `--workers=1` against the shared QA env, the suite assumes parallel execution and the seed data setup races"}}

