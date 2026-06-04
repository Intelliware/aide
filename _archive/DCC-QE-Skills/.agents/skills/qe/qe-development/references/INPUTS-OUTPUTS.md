# Inputs & Outputs — qe-development

## Inputs

| Input | Source | Required | Notes |
|---|---|---|---|
| JIRA issue or instructions | User-provided (chat) | Alternative entry point | Story, AC, or free-form instructions |
| INC file (e.g. `INC-001`) | `TDBC-knowledge-base/features/<feature>/implementation-package/plan/increments/INC-XXX.md` | Alternative entry point | Contains Goal, FR Mapping, Layer, ACs; no Atlassian CLI required |
| docs/KNOWLEDGE.md | `BB-DCC-QE/docs/KNOWLEDGE.md` | Yes (auto-seeded) | If missing, qe-code-scanner is invoked automatically |

## Outputs

| Output | Location | Format | Committed |
|---|---|---|---|
| Testability classification | Chat message | Summary of test type scope (UI/E2E, API, or none) and existing test count | — |
| test-cases.md | `BB-DCC-QE/features/<JIRA-ID-or-INC-ID>/test-cases.md` | Markdown + draft BDD scenario titles and Draft Feature Skeleton with TBD steps | Yes |
| scenarios.md | `BB-DCC-QE/features/<JIRA-ID-or-INC-ID>/scenarios.md` | Markdown + complete Gherkin (full Given/When/Then steps, entry point, background) | Yes |
| reuse-analysis.md | `BB-DCC-QE/features/<JIRA-ID-or-INC-ID>/reuse-analysis.md` | Markdown + table | Yes |
| code-output.md | `BB-DCC-QE/features/<JIRA-ID-or-INC-ID>/code-output.md` | Markdown + Java/Gherkin/properties | Yes |
| sign-off.md | `BB-DCC-QE/features/<JIRA-ID-or-INC-ID>/sign-off.md` | Markdown | Yes |
| Applied code changes | Various BB-DCC-QE source files | Java, Gherkin, properties | Yes |
| Updated KNOWLEDGE.md | `BB-DCC-QE/docs/KNOWLEDGE.md` | Markdown | Yes |
| Hand-off data | Chat output | Tag(s) + environment | — |

> **BDD progression:** `test-cases.md` (Phase 1) contains draft scenario titles and a skeleton `.feature` file with TBD steps — one scenario title per ✅/🟡 AC. `scenarios.md` (Phase 2) contains the complete Gherkin with full steps, entry point, locator references, and `@wip` tags for conditional ACs.

## Side Effects

- Creates `features/<JIRA-ID-or-INC-ID>/` directory
- Modifies/creates source files in BB-DCC-QE (Phase 5)
- Triggers qe-code-scanner (Phase 0 if missing, Phase 6 always)

