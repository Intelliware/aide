# Inputs & Outputs — qe-execution

## Inputs

| Input | Source | Required | Notes |
|---|---|---|---|
| Tag(s) to run | User or qe-development hand-off | Yes | e.g. `@smoke`, `@BZC-5678` |
| Environment | User-specified | No | Defaults to PAT4. Validated against environments.json |
| Execution mode | User-specified | No | local (default), browserstack, browserstack-sdk |
| BrowserStack profile | User-specified | Only for CDP mode | e.g. chrome-win11, safari-macos |
| docs/KNOWLEDGE.md | BB-DCC-QE/docs/KNOWLEDGE.md | No | Used for run defaults if present |

## Outputs

| Output | Destination | Format | Notes |
|---|---|---|---|
| Test results summary | Chat | Structured markdown | Pass/fail/skip counts, failure table |
| Report file paths | Chat | File paths | HTML, JSON, Allure, Screenshots |
| Hand-off data | Chat | Failure details | Scenario names, errors, categories — for qe-defect-review |

## Side Effects

- Compiles and executes BB-DCC-QE test suite via Maven
- Generates report files in `BB-DCC-QE/target/`
- For BrowserStack: creates sessions on remote cloud

