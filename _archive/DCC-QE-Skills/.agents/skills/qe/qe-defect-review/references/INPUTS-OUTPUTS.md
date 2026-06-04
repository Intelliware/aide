# Inputs & Outputs — qe-defect-review

## Inputs

| Input | Source | Required | Notes |
|---|---|---|---|
| Failure details | qe-execution hand-off or user-provided | Yes | Scenario names, error messages, categories |
| docs/KNOWLEDGE.md | BB-DCC-QE/docs/KNOWLEDGE.md | No | Enhances analysis with codebase context |
| Allure results | BB-DCC-QE/target/allure-results/ | No | Detailed per-test JSON results |
| Screenshots | BB-DCC-QE/screenshots/FAILED_*.png | No | Visual evidence |
| Execution log | BB-DCC-QE/target/logs/latest-run.log | No | Full execution trace |

## Outputs

| Output | Destination | Format | Notes |
|---|---|---|---|
| Per-failure analysis | Chat (interactive) | Markdown block per failure | Presented one at a time |
| Final summary table | Chat | Markdown table | After all failures reviewed |
| Action items | Chat | Checklist | Script fixes + JIRA ticket recommendations |
| Hand-off to qe-development | Chat (optional) | Fix instructions | If script issues identified |

## Side Effects

- None — this skill is read-only. It does not modify any files.

