---
name: generate-re-skill
description: "Use when analyze-repository cannot match a repository to any of the eleven existing RE domain types, when the user wants to create documentation patterns for an unsupported technology stack (e.g., GraphQL servers, serverless functions, ML pipelines, CLI tools), or when they say 'create a new RE skill for this stack'. Creates a complete reverse-engineering skill with compositions and block templates."
---

# Generate RE Skill

Generates a complete reverse-engineering skill for technology stacks not covered by the existing eleven domain types. Produces a full skill directory with SKILL.md, references, steps, compositions, and block templates.

## Overview

The framework ships with eleven reverse-engineering domain types (api, api-framework, web-app, ui-framework, database, mobile-app, mobile-framework, cobol-program, copybook-library, jcl-job, test-suite). When a repository doesn't fit any of these — GraphQL servers, serverless functions, ML pipelines, CLI tools, ETL jobs, message queue consumers, etc. — this skill creates a new tailored RE skill rather than forcing a poor-fit mapping.

The generated skill follows the exact structure and patterns of the existing eleven, ensuring consistency across the framework.

## When to use

- `analyze-repository` could not match the repository to any of the eleven domain types
- User explicitly asks to create an RE skill for a new technology stack
- User says "this is a GraphQL server, none of your domain types fit"
- User wants to document a technology pattern not covered by existing skills (serverless, ML pipeline, CLI tool, message queue consumer, etc.)
- User wants to extend the framework's RE coverage for their organization's specific stack

## When NOT to use

- The repository fits one of the eleven existing domain types — even if imperfectly, force-fit is often better than creating a new skill for a single repo
- The user wants one-off documentation, not a reusable skill pattern
- The repository is a hybrid that can be decomposed into existing types (e.g., API + Database)

## Inputs

- Repository path (used as the reference example for the new skill)
- Detected stack info from `analyze-repository` (if routed from there)
- Reference: `references/elicitation-patterns/stack-discovery.md` for discovering the new stack's characteristics

## Documentation Model

The generated skill follows the standard RE documentation model:

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | Internal maintainers, contributors | Full internal implementation docs | Stays in the source repository |
| Part B | External consumers (if applicable) | Consumer-facing documentation | Knowledge base |

Not all domain types have a Part B (e.g., internal-only tooling). The skill generation process determines which parts apply based on the stack's consumer profile.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

### Stage 1: Preliminary Stack Analysis

Run `steps/analyze-stack.md`:

1. Read the repository's package/build files and directory structure
2. Detect primary language, framework, architectural style
3. Identify characteristics that distinguish this from existing domain types
4. Propose a kebab-case domain slug (e.g., `graphql-server`, `serverless-lambda`, `ml-pipeline`)
5. Confirm with user before proceeding

### Stage 2: Web Research

Run `steps/research-stack.md`:

1. Use WebSearch to find current documentation patterns for this technology
2. Research common architectural patterns and terminology
3. Identify what consumers typically need documented for this stack
4. Gather up-to-date framework conventions and best practices
5. Present findings to user for context

### Stage 3: Define Template Structure

Run `steps/define-templates.md`:

1. Propose Part A (internal) block list with:
   - Block slugs and titles
   - Order hints (110-400 range)
   - Decision gates (include-if conditions) for optional blocks
   - Elicitation questions to determine which blocks apply
2. Propose Part B (consumer) block list similarly (if applicable)
3. Present to user for approval before generation
4. Iterate until user approves the template structure

### Stage 4: Generate Skill Artifacts

Run `steps/generate-skill.md`:

1. Generate `SKILL.md` following the `reverse-engineer-api` pattern:
   - Frontmatter with name and description
   - Overview, When to use, When NOT to use
   - Inputs, Documentation Model table
   - Workflow (5 stages)
   - Key Rules, Compositions reference
   - Output structure (bound to compositions)
   - Next skill, Common mistakes
2. Generate `references/OVERVIEW.md`, `INPUTS-OUTPUTS.md`, `EXAMPLE.md`
3. Generate `steps/scaffold.md` and `steps/verify.md`
4. Generate composition YAMLs:
   - `templates/compositions/re-<domain>-internal.yaml`
   - `templates/compositions/re-<domain>-consumer.yaml` (if Part B applies)
5. Generate block templates in `templates/blocks/reverse-eng/<domain>/`

### Stage 5: Iterative Review

Run `steps/review-flow.md`:

1. Present each major section with explanation of purpose
2. Format: skill text clearly separated from rationale
3. Allow user to request changes, additions, removals
4. Re-generate affected sections until approval
5. Confirm all artifacts are consistent with each other

### Stage 6: Execution Option

Run `steps/execute-skill.md`:

1. Ask if user wants to run the new skill immediately on the source repository
2. If yes, hand off by name to `reverse-engineer-<domain>`
3. If no, provide trigger phrase for later invocation
4. Update `workflow-graph.yaml` to add the new skill to the brownfield dispatcher list

## Key Rules

- **Follow existing patterns exactly** — generated skills must be indistinguishable in structure from the eleven built-in domain types
- **Research before generating** — WebSearch for current best practices prevents outdated or incorrect documentation patterns
- **User approval at every stage** — template structure, generated artifacts, and final review all require explicit approval
- **Compositions drive output** — block lists in the YAML composition are the single source of truth for what gets documented
- **Decision gates reduce noise** — optional blocks gated on elicitation answers prevent irrelevant sections
- **Generated skills are first-class** — they appear in the registry, can be invoked by name, and route through `analyze-repository`

## Output Structure

The skill generates the following artifacts:

```
.agents/skills/reverse-engineering/reverse-engineer-<domain>/
├── SKILL.md
├── references/
│   ├── OVERVIEW.md
│   ├── INPUTS-OUTPUTS.md
│   └── EXAMPLE.md
└── steps/
    ├── scaffold.md
    └── verify.md

templates/compositions/
├── re-<domain>-internal.yaml
└── re-<domain>-consumer.yaml    # if Part B applies

templates/blocks/reverse-eng/<domain>/
├── internal/
│   ├── <block-1>.md
│   ├── <block-2>.md
│   └── ...
└── consumer/                     # if Part B applies
    ├── <block-1>.md
    └── ...
```

## Next skill

After generation completes:

- If user chose to run the skill immediately: `reverse-engineer-<domain>` (the newly generated skill)
- Otherwise: no automatic handoff; user invokes the new skill later

After the new skill runs (whenever that is): its close-out gate, then `build-knowledge-base`.

## Common mistakes

- **Generating without research** — documentation patterns change; WebSearch ensures current best practices
- **Skipping user approval** — template structure must be approved before generating hundreds of lines of artifacts
- **Inconsistent block slugs** — slugs must follow the exact pattern `reverse-eng/<domain>/internal/<block-name>`
- **Missing decision gates** — optional blocks without `include-if` conditions get included everywhere
- **Forgetting to update the registry** — new skill must be added to `workflow-graph.yaml` and pass `build-registry.py` validation
- **Generating Part B when not applicable** — internal-only tools have no external consumers; skip Part B
- **Force-generating when existing type fits** — a 70% fit to `reverse-engineer-api` is often better than a new skill
