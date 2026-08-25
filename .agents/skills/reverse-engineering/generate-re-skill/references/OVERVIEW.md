# generate-re-skill — Overview

## Purpose

Create a complete, reusable reverse-engineering skill for technology stacks not covered by the existing eleven domain types. The generated skill follows the exact structure and patterns of built-in RE skills, ensuring consistency across the framework.

## Position in the flow

```
analyze-repository  ──▶  generate-re-skill  ──▶  reverse-engineer-<new-domain>
     (no match)           (this skill)              (generated skill)
                              │
                              ├─ SKILL.md + references/ + steps/
                              ├─ Composition YAMLs
                              └─ Block templates
```

This skill is invoked when:
1. `analyze-repository` cannot match a repository to any existing domain type
2. The user explicitly requests a new RE skill for an unsupported stack
3. The user rejects force-fitting to the closest existing type

## Design principles

### Creates skills, not documentation

This skill generates **reusable RE skills** — not one-off documentation for a single repo. The output is a skill directory that can be invoked on any repository of the same technology type.

### Follows existing patterns exactly

Generated skills are structurally indistinguishable from the eleven built-in domain types:
- Same SKILL.md structure (frontmatter, Overview, When to use, Workflow, Key Rules, etc.)
- Same references/ content (OVERVIEW.md, INPUTS-OUTPUTS.md, EXAMPLE.md)
- Same steps/ structure (scaffold.md, verify.md)
- Same composition YAML format
- Same block template format with frontmatter

### Research-driven

Before generating templates, the skill researches current documentation patterns for the target technology via WebSearch. This prevents outdated or incorrect documentation structures.

### User-approved at every stage

1. Stack analysis findings — user confirms the domain slug and characteristics
2. Template structure — user approves block lists before generation
3. Generated artifacts — user reviews and can request changes
4. Final review — user approves before the skill is registered

## Canonical RE foundations

Generated skills inherit the canonical RE principles:

- **Guiding Principle:** "If you cannot point to the line of source code that proves a documented behavior, do not document it as fact."
- **Six AI Principles:** AI is Intelligent But Not Smart; Context is Critical; AI Will Try to Do More Than Asked; Token Limitations Affect Depth; Verification is Non-Negotiable; AI Has Short Memory.
- **7-Step Workflow:** Set context of deliverable → Set context of audience/components → Refine feedback → Create scaffolding → Create content chunk-by-chunk → Add supporting documents → Verify understanding.

## Compositions

This skill does not consume compositions — it **generates** them:

- `templates/compositions/re-<domain>-internal.yaml` — Part A (internal implementation) blocks
- `templates/compositions/re-<domain>-consumer.yaml` — Part B (consumer-facing) blocks (if applicable)

## Hand-off

After generation completes:
- If user chose immediate execution: hand off by name to `reverse-engineer-<domain>`
- Otherwise: no automatic handoff; user invokes the new skill later

The generated skill then follows standard RE flow: extraction → close-out gate → `build-knowledge-base`.
