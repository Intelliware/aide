---
slug: generate-skill
sequence: 4
depends-on-prior: true
---

# Step: Generate Skill Artifacts

Generate the complete skill directory, composition YAMLs, and block templates based on the approved template structure.

## When to run

Run this step at the start of Stage 4 (Generate Skill Artifacts) of the parent generate-re-skill workflow, after the user has approved the template structure from Stage 3.

## Inputs

- Domain slug from Stage 1
- Research findings from Stage 2
- Approved block lists from Stage 3 (Part A, Part B if applicable)
- Elicitation questions from Stage 3
- Reference example repository from Stage 1

## Process

### 1. Generate SKILL.md

Create `.agents/skills/reverse-engineering/reverse-engineer-<domain>/SKILL.md` following the exact pattern of `reverse-engineer-api`:

**Frontmatter:**
```yaml
---
name: reverse-engineer-<domain>
description: "Use when the repository is a <description>. Produces Part A (internal docs) [and Part B (consumer guide)]."
---
```

**Required sections:**
- `# Reverse Engineer <Domain> Documentation` — main heading
- `## Overview` — what this domain type is and why it needs its own skill
- `## When to use` — bullet list of trigger conditions
- `## When NOT to use` — bullet list pointing to other skills
- `## Inputs` — repository path, version, elicitation reference
- `## Documentation Model` — table with Part A/B, audience, content, destination
- `## Workflow` — 5 stages matching existing RE skills:
  1. Discovery and Inventory
  2. Global Infrastructure / Common Patterns
  3. Feature-by-Feature Extraction
  4. Consumer Documentation (if Part B)
  5. Verification and Finalization
- `## Key Rules` — domain-specific extraction rules
- `## Compositions` — reference to the YAML compositions
- `## Output structure (mandatory)` — file naming and path conventions
- `## Next skill` — close-out gate, then `build-knowledge-base`
- `## Common mistakes` — domain-specific anti-patterns

### 2. Generate Reference Files

**references/OVERVIEW.md:**
- Purpose (extract structured documentation)
- Position in the flow (analyze-repository → this skill → build-knowledge-base)
- Canonical RE foundations
- Documentation model
- Extraction stages (summary)
- Hand-off

**references/INPUTS-OUTPUTS.md:**
- Required inputs (repository path, version)
- Optional inputs
- Elicitation reference
- Part A output structure
- Part B output structure (if applicable)
- Side artifacts (extraction-status.md, CHANGE-TRACKER.md)
- Hand-off contract

**references/EXAMPLE.md:**
- Use the actual reference repository from Stage 1
- Walk through each stage with sample outputs
- Show realistic inventory, scaffolding, extraction
- End with hand-off phrase

### 3. Generate Step Files

**steps/scaffold.md:**
Follow the pattern of existing `scaffold.md` files:
- Frontmatter with sequence: 1
- When to run (start of Stage 1)
- Process for gathering inventory, proposing structure, creating files
- Output (directory tree, empty files with headers)
- Halt conditions
- Common mistakes

**steps/verify.md:**
Follow the pattern of existing `verify.md` files:
- Frontmatter with sequence: 2
- When to run (Stage 5)
- Two modes: `automated` and `review-evidence`
- Verification checks (completeness, accuracy, consistency, domain-specific)
- Output format
- Halt conditions
- Common mistakes

### 4. Generate Composition YAMLs

**templates/compositions/re-<domain>-internal.yaml:**
```yaml
name: re-<domain>-internal
description: Reverse-engineering KB for the internal implementation of a <domain> codebase.
applies-to-flow: reverse-eng
package-type: re-internal

default-output-path: "docs/<domain>-internal/"
default-output-shape: tree

blocks:
  - slug: reverse-eng/<domain>/internal/<block-name>
    optional: <true|false>
    order: <110-400>
    include-if: "project.elicitation.<condition> == true"  # if gated

elicitation:
  - prompt: references/elicitation-patterns/repo-scope-discovery.md
    required: true

decision-gates:
  # Mirror include-if conditions from blocks
```

**templates/compositions/re-<domain>-consumer.yaml** (if Part B applies):
```yaml
name: re-<domain>-consumer
description: Consumer-facing documentation for <domain> codebases.
applies-to-flow: reverse-eng
package-type: re-consumer

default-output-path: "source-docs/<repo-slug>/<domain>-consumer/"
default-output-shape: tree

blocks:
  - slug: reverse-eng/<domain>/consumer/<block-name>
    optional: <true|false>
    order: <110-400>
```

### 5. Generate Block Templates

Create `templates/blocks/reverse-eng/<domain>/internal/` and `consumer/` directories.

For each block in the approved lists, generate a template file:

```markdown
---
slug: <domain>-<section-name>
title: "<Section Title>"
applies-to: [re-<domain>-internal]
requires-decision-from: [code-reader, architect]
optional: <true|false>
order-hint: <order>
---

## <N>. <Section Title>

<!-- Extraction guidance based on research findings -->

### <N>.1 <Subsection>

- **Field 1:** [placeholder]
- **Field 2:** [placeholder]

<!-- Additional subsections as appropriate for this block -->
```

Use research findings to inform:
- Subsection structure
- Field placeholders
- Extraction guidance comments

### 6. Summarize Generation

Present a summary of all generated artifacts:

```
## Generated Artifacts

### Skill Directory
`.agents/skills/reverse-engineering/reverse-engineer-<domain>/`
├── SKILL.md                    (<N> lines)
├── references/
│   ├── OVERVIEW.md             (<N> lines)
│   ├── INPUTS-OUTPUTS.md       (<N> lines)
│   └── EXAMPLE.md              (<N> lines)
└── steps/
    ├── scaffold.md             (<N> lines)
    └── verify.md               (<N> lines)

### Composition YAMLs
templates/compositions/
├── re-<domain>-internal.yaml   (<N> blocks)
└── re-<domain>-consumer.yaml   (<N> blocks)  # if Part B

### Block Templates
templates/blocks/reverse-eng/<domain>/
├── internal/                   (<N> templates)
└── consumer/                   (<N> templates)  # if Part B

Ready for Stage 5 (Iterative Review).
```

## Output

- Complete skill directory with SKILL.md, references/, steps/
- Composition YAMLs
- Block templates
- Summary of generated artifacts

## Halt conditions

- Halt if template structure was not approved (go back to Stage 3)
- Halt if file creation fails (directory permissions, disk space)
- Halt if generated content exceeds reasonable length (suggests scope creep)

## Common mistakes

- Not following the exact structure of existing RE skills
- Using inconsistent naming (slugs must match across SKILL.md, compositions, blocks)
- Forgetting decision-gates section in composition YAML
- Not including extraction guidance in block templates
- Generating Part B artifacts when Part B was marked as not applicable
