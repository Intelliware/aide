---
slug: define-templates
sequence: 3
depends-on-prior: true
---

# Step: Define Templates

Propose the block structure for Part A (internal) and Part B (consumer) documentation based on research findings, then get user approval before generating artifacts.

## When to run

Run this step at the start of Stage 3 (Define Template Structure) of the parent generate-re-skill workflow, after the user has acknowledged the research findings from Stage 2.

## Why define before generate

- Block structure determines the documentation skeleton
- Changes after generation require updating multiple files
- User approval ensures the template matches their actual needs
- Iteration is cheap at the definition stage, expensive after generation

## Inputs

- Domain slug from Stage 1
- Research findings from Stage 2 (documentation patterns, architectural conventions, consumer needs)
- Reference example repository from Stage 1

## Process

### 1. Draft Part A Block List

Based on research findings, propose blocks for internal documentation. Each block needs:

| Field | Description |
|-------|-------------|
| **Order** | 110-400 range, spaced by 10 for insertions |
| **Slug** | `reverse-eng/<domain>/internal/<block-name>` |
| **Title** | Human-readable section title |
| **Optional** | true if block may not apply to all repos of this type |
| **Decision Gate** | `include-if` condition for optional blocks |

**Standard blocks to consider:**
- Overview (always first, order 110)
- Architecture/Structure (order ~120-140)
- Configuration/Environment (order ~150)
- Core functionality blocks (order ~160-250)
- Cross-cutting concerns (order ~260-300)
- Testing (order ~320)
- Build/Deploy (order ~350)
- Anti-patterns/Gotchas (order ~370)
- Checklists/Appendices (order ~380-400)

### 2. Draft Part B Block List (if applicable)

Part B applies when there are external consumers. If this technology is internal-only (e.g., internal CLI tool, batch job), Part B may not be needed.

For Part B, propose blocks for consumer-facing documentation:
- Getting Started
- Authentication/Authorization
- Core usage patterns
- Error handling
- Best practices
- Reference/Glossary

### 3. Draft Elicitation Questions

For each optional block with a decision gate, draft the elicitation question:

```
Block: dataloaders
Gate: has_dataloaders
Question: "Does this codebase use DataLoaders or similar batching/caching patterns for N+1 prevention?"
```

### 4. Present Proposal

Format the proposal clearly:

```
## Proposed Template Structure for `reverse-engineer-<domain>`

### Part A — Internal Documentation

| Order | Block Slug | Title | Optional | Decision Gate |
|-------|------------|-------|----------|---------------|
| 110 | <slug> | <title> | false | — |
| 120 | <slug> | <title> | false | — |
| 130 | <slug> | <title> | true | has_<feature> |
| ... | ... | ... | ... | ... |

**Total: N blocks (M required, P optional)**

### Part B — Consumer Documentation

| Order | Block Slug | Title | Optional |
|-------|------------|-------|----------|
| 110 | <slug> | <title> | false |
| ... | ... | ... | ... |

**Total: N blocks**

*Or: Part B is not applicable for this domain type because <reason>.*

### Elicitation Questions

For repos using this skill, the following questions will be asked to determine which optional blocks to include:

1. **has_<feature>**: "<question>"
2. **has_<feature>**: "<question>"

### Comparison to Existing Skills

Structurally similar to `reverse-engineer-<closest>`:
- Adds: <new blocks>
- Removes: <inapplicable blocks>
- Modifies: <blocks with different focus>

---

Please review this template structure. You can:
- **Approve** — Proceed to artifact generation
- **Add blocks** — Request additional sections
- **Remove blocks** — Remove unnecessary sections
- **Modify blocks** — Change titles, order, or decision gates
- **Adjust Part B** — Add/remove Part B entirely
```

### 5. Iterate Until Approved

Process user feedback:
- Add requested blocks (assign appropriate order values)
- Remove blocks user marks as unnecessary
- Modify titles or decision gates as requested
- Re-present the updated proposal

Do NOT proceed to generation until user explicitly approves.

## Output

- Approved Part A block list with order, optional flags, and decision gates
- Approved Part B block list (or confirmation that Part B is not applicable)
- Elicitation questions for optional blocks
- User approval to proceed to generation

## Halt conditions

- Halt if user wants to reconsider whether a new skill is actually needed
- Halt if user identifies that an existing skill could be extended instead
- Halt if the block list grows beyond ~25 blocks for Part A (suggests scope creep)

## Common mistakes

- Proceeding to generation without explicit user approval
- Not including order values (causes unpredictable output order)
- Not defining decision gates for optional blocks (causes irrelevant sections)
- Making too many blocks optional (if most are optional, the template is too generic)
- Copying existing templates without adapting to the research findings
