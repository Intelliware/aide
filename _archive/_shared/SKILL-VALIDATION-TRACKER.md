# Skill Validation Tracker

Tracks the rollout and validation status of each Claude Code skill in this framework. Update this file as skills progress through validation.

**Last updated:** 2026-04-09

---

## Status Key

| Status | Meaning |
|---|---|
| `Not Started` | Skill exists but validation has not begun |
| `In Progress` | Validation is actively underway |
| `Validated` | Skill has passed all validation checks and is cleared for use |
| `Blocked` | Validation is blocked — see Notes column |
| `Deferred` | Rollout deliberately postponed |

---

## Reverse Engineering Skills

Skills that document and extract knowledge from existing codebases.

| # | Skill | Status | Validated By | Date | Notes |
|---|---|---|---|---|---|
| 1 | `reverse-engineer-api` | `Not Started` | | | |
| 2 | `reverse-engineer-api-framework` | `Not Started` | | | |
| 3 | `reverse-engineer-web-app` | `Not Started` | | | |
| 4 | `reverse-engineer-ui-framework` | `Not Started` | | | |
| 5 | `reverse-engineer-database` | `Not Started` | | | |
| 6 | `reverse-engineer-mobile-app` | `Not Started` | | | |
| 7 | `reverse-engineer-mobile-framework` | `Not Started` | | | |

---

## Forward Engineering Skills

Skills that create requirements, solution designs, and implementation plans for new systems.

| # | Skill | Status | Validated By | Date | Notes |
|---|---|---|---|---|---|
| 8 | `create-requirements-package` | `Not Started` | | | |
| 9 | `create-solution-design-package` | `Not Started` | | | |
| 10 | `create-implementation-package` | `Not Started` | | | |
| 11 | `build-knowledge-repository` | `Not Started` | | | |

---

## Quality & Support Skills

Skills that scaffold documentation, verify extraction quality, track changes, and analyse repositories.

| # | Skill | Status | Validated By | Date | Notes |
|---|---|---|---|---|---|
| 12 | `analyze-repository` | `Not Started` | | | |
| 13 | `scaffold-documentation` | `Not Started` | | | |
| 14 | `verify-extraction` | `Not Started` | | | |
| 15 | `track-change` | `Not Started` | | | |

---

## Navigation & Utility Skills

Skills that route users and handle document management tasks.

| # | Skill | Status | Validated By | Date | Notes |
|---|---|---|---|---|---|
| 16 | `framework-navigator` | `Not Started` | | | |
| 17 | `document-sharding` | `Not Started` | | | |

---

## Validation Checklist

When validating a skill, work through the following checks before marking it `Validated`.

**Functional checks**
- [ ] Skill can be invoked successfully in Claude Code
- [ ] Skill reads and follows the corresponding phase guide correctly
- [ ] All required workflow steps are executed in the correct order
- [ ] Skill produces output conforming to the correct template
- [ ] Part A and Part B outputs (where applicable) are correctly separated

**Quality checks**
- [ ] Output does not contain hallucinated or unverified facts
- [ ] All section headers from the template are present in output
- [ ] Change tracker is populated where applicable
- [ ] AI gate and human gate steps are present (forward engineering skills)

**Edge case checks**
- [ ] Skill handles incomplete or ambiguous input gracefully
- [ ] Skill correctly identifies and flags gaps rather than fabricating content
- [ ] Monorepo or hybrid repository handled correctly (where applicable)

---

## Rollout Progress

| Category | Total | Validated | In Progress | Blocked |
|---|---|---|---|---|
| Reverse Engineering | 7 | 0 | 0 | 0 |
| Forward Engineering | 4 | 0 | 0 | 0 |
| Quality & Support | 4 | 0 | 0 | 0 |
| Navigation & Utilities | 2 | 0 | 0 | 0 |
| **Total** | **17** | **0** | **0** | **0** |

> Update the counts above manually as validation progresses, or replace with a link to your team's tracking board if you move to a richer tool.

---

## Validation Log

Use this section to record a brief note each time a skill's status changes. Most recent entry first.

| Date | Skill | Change | By | Notes |
|---|---|---|---|---|
| — | — | — | — | — |
