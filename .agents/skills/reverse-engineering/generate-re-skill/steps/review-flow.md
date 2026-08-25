---
slug: review-flow
sequence: 5
depends-on-prior: true
---

# Step: Review Flow

Walk through each generated artifact with the user, explain its purpose, and allow refinements before finalizing.

## When to run

Run this step at the start of Stage 5 (Iterative Review) of the parent generate-re-skill workflow, after all artifacts have been generated in Stage 4.

## Why review matters

- Generated artifacts are based on research and approved structure, but details may need adjustment
- User may have domain-specific knowledge not captured in research
- Explanations help user understand how the skill will work
- Iteration at this stage is cheaper than fixing issues during actual RE runs

## Inputs

- All generated artifacts from Stage 4
- Research findings from Stage 2 (for context)
- Reference repository from Stage 1

## Process

### 1. Review SKILL.md

Present SKILL.md section by section:

```
## Reviewing: SKILL.md

### Frontmatter

```yaml
---
name: reverse-engineer-<domain>
description: "..."
---
```

**Purpose:** This is how the skill appears in the registry and how other skills reference it.

**Review points:**
- Is the name clear and consistent with other RE skills?
- Does the description capture when to use this skill?

---

### Overview Section

```markdown
## Overview
<content>
```

**Purpose:** Explains what this domain type is and why it needs its own skill.

**Review points:**
- Is the explanation accurate for your technology?
- Should any terminology be adjusted?

---

[Continue for each section]
```

For each section, ask:
- Is this accurate?
- Should anything be added or removed?
- Is the wording appropriate for your team?

### 2. Review Reference Files

For each reference file (OVERVIEW.md, INPUTS-OUTPUTS.md, EXAMPLE.md):
- Present the content
- Explain its purpose
- Ask for corrections or additions

Special attention for EXAMPLE.md:
- This uses the reference repository
- Check that the sample outputs are realistic
- Ensure the walkthrough matches expected workflow

### 3. Review Step Files

For scaffold.md and verify.md:
- Present the content
- Explain when each step runs
- Ask if the process matches expected workflow

Key review points for scaffold.md:
- Are the inventory categories appropriate?
- Is the proposed file structure sensible?

Key review points for verify.md:
- Are the verification checks appropriate?
- Are domain-specific checks included?

### 4. Review Composition YAMLs

Present each composition file:
- Explain what the composition controls
- Review block order and decision gates
- Confirm the output path conventions

Key review points:
- Are all approved blocks present?
- Are decision gates correctly mirroring the block's include-if?
- Is the elicitation reference correct?

### 5. Sample Block Templates

Review 2-3 representative block templates:
- One required block (always included)
- One optional block with decision gate
- One domain-specific block unique to this skill

For each:
- Show the template structure
- Explain extraction guidance
- Ask if the field placeholders make sense

Don't review every block unless user requests — focus on representative samples.

### 6. Collect Feedback and Iterate

Track all requested changes:

```
## Requested Changes

1. SKILL.md: <change>
2. INPUTS-OUTPUTS.md: <change>
3. Block template <name>: <change>
...

Applying changes...

[Show updated content]

Is this correct now?
```

Iterate until user approves all sections.

### 7. Final Confirmation

After all changes are applied:

```
## Final Review

All artifacts have been generated and reviewed:

✓ SKILL.md — approved
✓ references/OVERVIEW.md — approved
✓ references/INPUTS-OUTPUTS.md — approved
✓ references/EXAMPLE.md — approved
✓ steps/scaffold.md — approved
✓ steps/verify.md — approved
✓ re-<domain>-internal.yaml — approved
✓ re-<domain>-consumer.yaml — approved (or N/A)
✓ Block templates (N internal, M consumer) — approved

Ready to proceed to Stage 6 (Execution Option)?
```

## Output

- All artifacts reviewed and approved
- Changes tracked and applied
- User confirmation to proceed to execution

## Halt conditions

- Halt if user wants to restart template definition (go back to Stage 3)
- Halt if fundamental issues are found that require research revision (go back to Stage 2)
- Halt if user decides an existing skill would actually fit (cancel skill generation)

## Common mistakes

- Overwhelming user with too much content at once — review section by section
- Not explaining the purpose of each artifact — context helps user evaluate
- Skipping block template review — these are the actual extraction guides
- Not tracking changes systematically — leads to missed updates
- Moving to execution before explicit approval of all sections
