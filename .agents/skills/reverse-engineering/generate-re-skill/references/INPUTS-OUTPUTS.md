# generate-re-skill — Inputs and Outputs

## Inputs

### Required

- **Repository path** — absolute path to a repository of the target technology type. Used as the reference example for understanding the stack's structure and generating appropriate documentation patterns.

### Optional

- **Detected stack info from `analyze-repository`** — if routed from `analyze-repository`, includes the scan findings: detected language, framework signals, why no existing domain type matched.
- **User hints** — explicit guidance about the stack's characteristics, architectural patterns, or documentation needs.

### Elicitation

Reference: `references/elicitation-patterns/stack-discovery.md`. Used to gather:

1. What is this technology/framework called?
2. What architectural pattern does it follow?
3. Who are the primary consumers of this code?
4. What does typical documentation for this stack cover?
5. Any domain-specific concerns (security, performance, compliance)?

### Project.toml driving values

This skill may consult existing `[[project.repos]]` entries to understand the project context, but does not require a specific entry for the source repository.

## Outputs

### Generated Skill Directory

**Location:** `.agents/skills/reverse-engineering/reverse-engineer-<domain>/`

```
reverse-engineer-<domain>/
├── SKILL.md                    # Main skill definition
├── references/
│   ├── OVERVIEW.md             # Position and purpose
│   ├── INPUTS-OUTPUTS.md       # I/O specification
│   └── EXAMPLE.md              # Worked example using the source repo
└── steps/
    ├── scaffold.md             # Documentation scaffolding step
    └── verify.md               # Verification step
```

**SKILL.md structure:**
- Frontmatter with `name: reverse-engineer-<domain>` and description
- Overview section explaining the domain type
- When to use / When NOT to use sections
- Inputs section
- Documentation Model table (Part A, Part B if applicable)
- Workflow (5 stages matching existing RE skills)
- Key Rules section with domain-specific guidance
- Compositions reference
- Output structure section
- Next skill section
- Common mistakes section

### Composition YAMLs

**Location:** `templates/compositions/`

**re-<domain>-internal.yaml:**
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
  # Mirrors the include-if conditions from blocks
```

**re-<domain>-consumer.yaml** (if Part B applies):
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

### Block Templates

**Location:** `templates/blocks/reverse-eng/<domain>/`

```
<domain>/
├── internal/
│   ├── <block-1>.md
│   ├── <block-2>.md
│   └── ...
└── consumer/        # if Part B applies
    ├── <block-1>.md
    └── ...
```

**Block template structure:**
```markdown
---
slug: <domain>-<section-name>
title: "<Section Title>"
applies-to: [re-<domain>-internal]
requires-decision-from: [code-reader, architect]
optional: <true|false>
order-hint: <110-400>
---

## <N>. <Section Title>

### <N>.1 <Subsection>

<!-- Extraction guidance -->

- **Field 1:** [placeholder]
- **Field 2:** [placeholder]
```

### Registry Updates

The skill updates:
- `.agents/skills/_registry/workflow-graph.yaml` — adds `generate-re-skill` to the `anytime` section (if not already present) and adds the new `reverse-engineer-<domain>` to the dispatcher list

## Validation

After generation, the user should run:

```bash
python scripts/build-registry.py
```

This validates:
- SKILL.md frontmatter is parseable
- All skill references in workflow-graph.yaml resolve
- Composition YAML is valid
- Block slugs follow naming conventions

## Hand-off contract

The generated `reverse-engineer-<domain>` skill:
- Accepts repository path as input
- Produces Part A under `<repo>/docs/<domain>-internal/`
- Produces Part B under `<KB>/source-docs/<repo-slug>/<domain>-consumer/` (if applicable)
- Ends at the standard RE close-out gate
- Hands off to `build-knowledge-base` after attestation
