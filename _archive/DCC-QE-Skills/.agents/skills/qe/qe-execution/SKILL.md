---
name: qe-execution
description: "Use when the user asks to run tests, execute a feature, run a tag, run a scenario, execute the test suite, says 'run @smoke', 'execute my test', 'run it', 'how do I run this', or after qe-development hands off with tags to run. Executes BB-DCC-QE Playwright + Cucumber tests against a target environment (default PAT4), constructs the correct Maven command for local/BrowserStack modes, and summarises results with pass/fail counts and failure details."
---

# QE Execution

Execute BB-DCC-QE Playwright + Cucumber tests against a target environment and
summarise results. Supports local execution and BrowserStack (CDP and SDK modes).

## When to use

- User asks to run tests, execute a feature, or run a tag
- After `qe-development` hands off with tags to run
- User says "run @smoke", "execute my test", "run it for me"

## When NOT to use

- User wants to build new tests → use `qe-development`
- User wants to analyze past failures without re-running → use `qe-defect-review`

## Inputs

| Input | Source | Required |
|---|---|---|
| Tag(s) to run | User or qe-development hand-off | Yes |
| Environment | User-specified or default (PAT4) | No (defaults to PAT4) |
| Execution mode | User-specified or default (local) | No (defaults to local) |
| `docs/KNOWLEDGE.md` | `BB-DCC-QE/docs/KNOWLEDGE.md` | No (enhances output if present) |

## Outputs

| Output | Destination | Format |
|---|---|---|
| Test results summary | Chat | Structured markdown |
| Hand-off to qe-defect-review | Chat | Failure details for review |

## Execution Flow

### Step 1 — Confirm the tag

Read from context (qe-development hand-off or user message). If not clear, ask:
> "What is the Cucumber tag to run? (e.g. `@file_transfer`, `@smoke`, `@regression`)"

### Step 2 — Confirm the environment

Ask if not specified:
> "Which environment? Default is PAT4."

Valid environments (from `src/test/resources/testdata/environments.json`):
- `DEV11`, `DEV12`, `SIT4`, `SIT5`, `PAT4` (default), `PAT2`, `WBBPAT1`, `PROD`

**Validate:** Read `environments.json` and confirm the environment exists with
a `url` and at least one `connectIDs` entry. If invalid → block and inform user.

### Step 3 — Determine execution mode

| Mode | When | Setup |
|---|---|---|
| Local (default) | No flag or `-DexecutionMode=local` | None |
| BrowserStack CDP | `-DexecutionMode=browserstack` | Credentials in `src/main/resources/configs/browserstack.properties` |
| BrowserStack SDK | `-DexecutionMode=browserstack-sdk` | Credentials in `browserstack.yml` + MAVEN_OPTS javaagent |

If BrowserStack mode requested, ask:
> "Single browser (CDP) or parallel multi-browser (SDK)?"

For BrowserStack modes, verify credentials file exists and remind user to check.

### Step 4 — Surface run defaults

If `docs/KNOWLEDGE.md` exists, read PROJECT RUNTIME section for current defaults:
- Default environment, browser, execution mode
- Mobile/accessibility flags
- Any compatibility warnings (e.g. a11y + BrowserStack incompatible)

Present to user before running.

### Step 5 — Build and execute run command

**Base command:**
```powershell
Set-Location <BB-DCC-QE project root>
mvn compile exec:java "-Dexec.mainClass=debugger.CucumberDebugger" "-Dexec.classpathScope=test" "-Dexec.args=@TAG" "-Denv=ENV"
```

**For BrowserStack CDP, append:**
```
"-DexecutionMode=browserstack" "-DbsProfile=chrome-win11"
```

**For BrowserStack SDK:**
```powershell
# Step 1: Set MAVEN_OPTS (must be separate command)
$env:MAVEN_OPTS = "-javaagent:$env:USERPROFILE\.m2\repository\com\browserstack\browserstack-java-sdk\1.41.0\browserstack-java-sdk-1.41.0.jar"

# Step 2: Run with SDK mode
mvn compile exec:java "-Dexec.mainClass=debugger.CucumberDebugger" "-Dexec.classpathScope=test" "-Dexec.args=@TAG" "-Denv=ENV" "-DexecutionMode=browserstack-sdk"
```

Execute the command in a terminal.

### Step 6 — Report results

After execution completes, summarise:

```markdown
## Test Execution Results

**Tag:** @<tag>
**Environment:** <env>
**Mode:** <local/browserstack-cdp/browserstack-sdk>
**Duration:** <time>

### Summary
- ✅ Passed: N
- ❌ Failed: N
- ⏭️ Skipped: N

### Failures (if any)
| # | Scenario | Error | Category |
|---|---|---|---|
| 1 | <name> | <error message> | Element not found / Assertion / Timeout / ... |

### Reports
- HTML: `target/final-cucumber-report/`
- JSON: `target/final-cucumber-report-json/cucumber-report.json`
- Allure: `target/allure-results/`
- Screenshots: `screenshots/`
```

For BrowserStack modes, also show dashboard URL and build name.

## Hand-off to qe-defect-review

If there are failures, offer:
> "There were N test failure(s). Would you like to review them? Invoke
> `qe-defect-review` to walk through each failure and determine root cause."

Provide the failure details (scenario names, error messages, screenshots) as
hand-off data.

## Rules

- Always validate environment against environments.json before running
- Never run without confirming tag and environment with user
- For BrowserStack SDK, always set MAVEN_OPTS as a separate command first
- Always report results with pass/fail counts after execution
- If execution fails to start (Maven error, missing dependency), diagnose and inform user

