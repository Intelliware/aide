---
slug: execute-skill
sequence: 6
depends-on-prior: true
---

# Step: Execute Skill

Offer to run the newly generated skill on the reference repository and handle registry updates.

## When to run

Run this step at the start of Stage 6 (Execution Option) of the parent generate-re-skill workflow, after all artifacts have been reviewed and approved in Stage 5.

## Inputs

- Approved skill artifacts from Stage 5
- Domain slug
- Reference repository path from Stage 1

## Process

### 1. Update Registry

Before offering execution, ensure the new skill is registered:

**Update workflow-graph.yaml:**

Add the new skill to the brownfield dispatcher comment in the sequence section:

```yaml
# analyze-repository selects ONE of the <N> domain skills at runtime:
#   reverse-engineer-api, reverse-engineer-api-framework,
#   ...
#   reverse-engineer-<new-domain>.
```

If `generate-re-skill` is not already in the `anytime` section, add it:

```yaml
anytime:
  - ...
  - generate-re-skill
```

**Run registry validation:**

```bash
python scripts/build-registry.py
```

Report any validation errors. Common issues:
- SKILL.md frontmatter parse errors
- Slug naming inconsistencies
- Missing block templates referenced in compositions

### 2. Present Execution Options

```
## Skill Generation Complete

The `reverse-engineer-<domain>` skill is now registered and ready to use.

**Registry validation:** PASSED / FAILED (with details)

Would you like to:

**A) Run the skill now**
   I'll document `<repository-path>` using the new `reverse-engineer-<domain>` skill.
   This will:
   - Run the 5-stage extraction workflow
   - Create Part A documentation in `<repo>/docs/<domain>-internal/`
   - Create Part B documentation in `<KB>/source-docs/<repo-slug>/<domain>-consumer/` (if applicable)
   - End at the close-out gate for attestation

**B) Save for later**
   The skill is ready. Invoke it later with:
   > "Reverse engineer my <domain> at <path>."

   Or let `analyze-repository` route to it automatically when it detects a <domain> codebase.
```

### 3. Handle User Choice

**If user chooses A (run now):**

Hand off by name to the newly generated skill:

```
Handing off to `reverse-engineer-<domain>` to document `<repository-path>`.

The extraction will follow the standard 5-stage workflow:
1. Discovery and Inventory — scan the codebase, create scaffolding
2. Global Infrastructure — document common patterns
3. Feature-by-Feature Extraction — document each component
4. Consumer Documentation — complete Part B (if applicable)
5. Verification and Finalization — verify, then close-out gate

At the end, you'll choose between automated verification or human review.
```

Then invoke `reverse-engineer-<domain>` with the repository path.

**If user chooses B (save for later):**

```
The `reverse-engineer-<domain>` skill is saved and ready.

**To invoke directly:**
> "Reverse engineer my <domain> at <path>."

**Via analyze-repository:**
> "Analyze this repository at <path>."
If it detects a <domain> codebase, it will route to `reverse-engineer-<domain>`.

**Manual invocation:**
The skill is located at:
`.agents/skills/reverse-engineering/reverse-engineer-<domain>/`

The compositions are at:
`templates/compositions/re-<domain>-internal.yaml`
`templates/compositions/re-<domain>-consumer.yaml` (if Part B)
```

### 4. Update analyze-repository Dispatcher List

Remind user (or automatically update if appropriate):

The `analyze-repository` skill references the eleven domain types in its classification table. To make it aware of the new type, update:

1. Stage 2 classification table — add row for new type
2. Stage 5 hand-off list — add new skill name

This can be done manually or via a future `extend-analyze-repository` helper.

## Output

- Registry updated with new skill
- Validation passed
- User informed of invocation options
- If run immediately: hand-off to the new skill

## Halt conditions

- Halt if registry validation fails — fix errors before proceeding
- Halt if user wants to revise the skill before using it (go back to Stage 5)

## Common mistakes

- Not running registry validation before offering execution
- Forgetting to update workflow-graph.yaml dispatcher comment
- Not providing clear invocation instructions for "save for later"
- Running the skill without user explicitly choosing option A
- Forgetting that analyze-repository needs manual update to route to new skill
