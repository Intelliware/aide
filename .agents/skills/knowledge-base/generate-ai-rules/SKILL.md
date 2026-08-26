---
name: generate-ai-rules
description: "Use when the user wants to author the project-context.md that AI agents must follow when implementing code in this project — exact tech-stack versions, language-specific rules, framework rules, testing rules, workflow rules; says 'generate AI rules', 'create project-context', 'set up agent guardrails', 'document coding rules for the AI'. Hybrid: auto-derives rules from RE Part A (versions, build/test commands, lint configs), then interactively elicits the unobvious rules. Output is one canonical project-context.md plus optional per-repo overrides only when stacks diverge enough to warrant them."
---

# Generate AI Rules

Captures the **implementation guardrails** AI agents must respect when
writing code in this project. Equivalent in spirit to BMAD's
`generate-project-context`, adapted to the multi-repo, KB-resident
shape of A.I.D.E. Output lives at `<KB>/shared/ai-rules/project-
context.md` (single canonical doc) with optional per-repo override
files only when the project's repos diverge in stack enough that one
ruleset would be misleading.

The skill is **hybrid**: auto-derivation from RE Part A handles the
parts the code already proves (versions, lint config, build/test
commands), while interactive elicitation captures the unobvious parts
(naming conventions, error handling patterns, mock conventions,
import/export style, branch/commit rules).

## Overview

Four steps:

| Step | Purpose | Output contribution |
|---|---|---|
| 01 | Auto-derive rules from RE Part A | Tech stack table, build/test commands |
| 02 | Elicit unobvious rules | Language, framework, testing, workflow rules |
| 03 | Detect stack divergence + emit | `project-context.md` + optional per-repo overrides |
| 04 | Cross-link to operations & solution context | Links forward to `document-operations` outputs and `30-constraints-and-compliance.md` |

The single doc favours brevity (<300 lines for project-context.md is
the target) and LLM-optimised phrasing — short imperatives, no prose
padding, no advice unless tied to a concrete pitfall.

## When to use

- After `capture-solution-context` and before
  `create-requirements-package` in any flow.
- Stack changes (framework upgrade, language switch, new repo joining
  the project).
- Recurring AI agent mistakes the user wants encoded as rules.

## When NOT to use

- The user wants high-level solution context (mission, KPIs, vendors)
  → use `capture-solution-context`.
- The user wants deployment / on-call docs → use `document-operations`.
- The KB is unbuilt or RE has not run — `project-context.md` derived
  without RE Part A would be misleading.
- The user wants per-feature instructions, not project-wide rules —
  those belong in the requirements package's standards section.

## Inputs

| Input | Source | Required | Notes |
|---|---|---|---|
| `project.toml` | `{project-root}/project.toml` | Yes | `[[project.repos]]` drives per-repo loop. |
| RE Part A docs | `<KB>/source-docs/<repo>/part-a/**` | Yes | Source for tech stack, lint, build/test commands, observed patterns. |
| `<KB>/shared/solution-context/30-constraints-and-compliance.md` | KB | No | § 5 Architectural prohibitions feeds the "must-not" rules. |
| `<KB>/components/<repo>/<id>.md` (frontmatter) | KB | No | `verification_signal` distribution informs the testing-rules section. |
| Existing `project-context.md` | `<KB>/shared/ai-rules/` | No | Step 01 detects and asks: refresh / replace. |
| Elicitation pattern | `references/elicitation-patterns/coding-rules.md` (NEW) | Yes (interactive mode) | Drives Step 02. |

See `references/INPUTS-OUTPUTS.md`.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

1. **Auto-derive from RE** — `steps/01-derive-from-re.md`
2. **Elicit unobvious rules** — `steps/02-elicit-unobvious-rules.md`
3. **Emit (with divergence check)** — `steps/03-emit.md`
4. **Cross-link** — `steps/04-cross-link.md`

## Output

Mandatory:

```
<knowledge_base_path>/shared/ai-rules/
└── project-context.md
```

Conditional (only when Step 03 detects divergence ≥ threshold):

```
<knowledge_base_path>/shared/ai-rules/per-repo/
├── <repo-slug-1>.md
├── <repo-slug-2>.md
└── ...
```

`project-context.md` sections:

1. Technology stack & versions (auto-filled)
2. Language-specific rules
3. Framework rules
4. Testing rules
5. Development workflow rules (branches, commits, PRs)
6. Error-handling rules
7. Import/export & module rules
8. Architectural must-nots (from solution context § 5)
9. Cross-links (to operations, solution context, ADRs)

## Next skill

`document-operations`.

## Common mistakes

- **Generating advice rather than rules.** Each entry should be a
  concrete imperative tied to a pitfall: "Always X / Never Y because
  Z." Soft suggestions belong in design docs, not here.
- **Letting per-repo overrides proliferate.** Step 03's divergence
  check is the gatekeeper — emit overrides only when one rule is
  actively wrong for one repo, not when it's redundantly true.
- **Forgetting to feed must-nots from solution context.**
  `30-constraints-and-compliance.md` § 5 is a required input; skipping
  it produces an AI-rules doc that contradicts compliance constraints.
- **Hand-editing the auto-derived sections.** Regenerate from RE Part A
  when stacks change; do not patch versions inline.
- **Producing a 1000-line document.** Target < 300 lines for the
  canonical doc. Long rules don't get followed.
