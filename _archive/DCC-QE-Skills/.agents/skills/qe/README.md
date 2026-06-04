# QE stage

Skills for QE automation development, test execution, and defect review targeting the BB-DCC-QE Playwright + Cucumber + Java test framework.

## Produces
- Automated test code (feature files, step definitions, page methods, locators) in BB-DCC-QE
- `docs/KNOWLEDGE.md` — codebase knowledge index (single source of truth)
- `docs/qe-development/<JIRA-ID>/` — per-ticket development artifacts (test cases, scenarios, reuse analysis, code output, sign-off)
- Test execution results with pass/fail summary
- Defect analysis with classified failures and remediation recommendations

## Consumes
- JIRA issues or user-provided test instructions
- `docs/KNOWLEDGE.md` (seeded and refreshed by `qe-code-scanner`)
- BB-DCC-QE source code, configuration, and test data
- Test execution output (allure results, logs, screenshots)

## Skills
- `qe-code-scanner/` — deep-scan BB-DCC-QE codebase, write findings to `docs/KNOWLEDGE.md`
- `qe-development/` — phased test authoring workflow (understand → BDD → reuse analysis → code → sign-off → rescan)
- `qe-execution/` — run tests via Maven, validate environment, report results
- `qe-defect-review/` — interactive one-at-a-time failure walk-through with classification and remediation
- `qe-coverage-check/` — audit BB-DCC-QE test coverage against an implementation package; report gaps and drift per INC

## Workflow

```
qe-development ──► qe-code-scanner ──► docs/KNOWLEDGE.md
       │                                      ▲
       │◄─────────────────(reads)──────────────┘
       │
       └──(tags)──► qe-execution ──(failures)──► qe-defect-review
qe-coverage-check (independently invocable at any point)
       │
       └── reads: implementation-package + qe-increment-status.md + KNOWLEDGE.md
       └── gaps found ─► /qe-development INC-XXX
       └── drift found ─► /qe-code-scanner```

Each skill is independently invocable. The flow above is the recommended sequence.



