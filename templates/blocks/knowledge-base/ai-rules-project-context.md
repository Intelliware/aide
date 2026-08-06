---
slug: ai-rules-project-context
title: "AI Rules — Project Context (KB)"
applies-to: [kb-instance]
requires-decision-from: [eng-leadership, architect]
optional: false
order-hint: 60
---

```yaml
---
ai_rules_id: project-context
description: >-
  Use when an AI agent is about to write or modify code in any repo of
  this project; this document is the contract for tech stack, language
  conventions, testing discipline, and architectural must-nots.
triggers:
  - coding rules
  - ai rules
  - project context
  - tech stack
  - language conventions
  - testing rules
  - branch naming
  - commit conventions
last_generated: {{generation_date}}
last_generated_by: {{generated_by}}
covers_repos:
{{covers_repos_yaml_list}}
divergence_overrides:
{{divergence_overrides_yaml_list}}
---
```

# AI Rules — Project Context for AI Agents

<!-- Contract for AI agents writing code in this project. Rules are
imperatives. Soft advice is filtered out. Target ≤ 300 lines. -->

## 1. Technology Stack & Versions

| Repo | Language | Framework | Test framework | Package manager | Build cmd | Test cmd | Dev cmd |
|---|---|---|---|---|---|---|---|
{{tech_stack_rows}}

## 2. Language-Specific Rules

{{language_rules_imperatives}}

## 3. Framework Rules

{{framework_rules_imperatives}}

## 4. Testing Rules

{{testing_rules_imperatives}}

| Verification signal | Required test type |
|---|---|
{{verification_signal_test_rows}}

## 5. Development Workflow Rules

- Branch naming: {{branch_naming_rule}}
- Commit format: {{commit_format_rule}}
- PR title / body: {{pr_format_rules}}
- Required CI checks before merge: {{ci_must_pass_list}}
- Squash / rebase / merge policy: {{merge_policy}}

## 6. Error-Handling Rules

{{error_handling_imperatives}}

## 7. Import / Export & Module Rules

{{module_rules_imperatives}}

## 8. Architectural Must-Nots

<!-- Mirrored from solution-context/30-constraints-and-compliance.md § 5. -->

{{architectural_prohibitions}}

## 9. Cross-Links

- Solution context: [`30-constraints-and-compliance.md`](../solution-context/30-constraints-and-compliance.md) (source of § 8)
- Solution context: [`00-overview.md`](../solution-context/00-overview.md) (mission this ruleset serves)
- Operations: [`30-runbooks-and-oncall.md`](../operations/30-runbooks-and-oncall.md)
- Decisions: [`adrs/`](../adrs/) (ADRs that supersede specific rules)
