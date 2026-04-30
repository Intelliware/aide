<!-- validate: allow-phase-vocab -->

# Process — create-requirements-package

The deep how-to for the skill's macro workflow. Lifted and adapted from `requirements-package/skills/create-requirements-package/SKILL.md` and its embedded 9-step gathering process.

## The 9-step gathering process (macro)

Each step maps to one or more blocks declared by the active composition (`templates/compositions/greenfield-requirements-package.yaml` is the canonical reference; brownfield-enhancement-spec drops some blocks; quick-dev-spec drops most).

1. **Set context** — project scope, objectives, constraints. Block: `requirements/executive-summary-business-context`.
2. **Identify stakeholders and personas** — who uses the system and how. Block: `requirements/stakeholders-personas`. Use `references/elicitation-patterns/stakeholder-discovery.md`.
3. **Gather functional requirements** — what the system must do. Numbering: `FR[Area].[Feature].[Detail]`. Blocks: `requirements/functional-requirements` + `requirements/functional-specifications`. Use `references/elicitation-patterns/functional-requirements-discovery.md`.
4. **Document business rules** — calculations, validations, state machines, conditional logic. Block: `requirements/business-logic-rules`.
5. **Create user journeys** — end-to-end functional flow stories, more comprehensive than typical user stories. Block: `requirements/user-journeys`.
6. **Define data requirements** — entities, attributes, relationships, sources. Block: `requirements/data-requirements`. Use `references/elicitation-patterns/data-and-permissions-discovery.md`.
7. **Specify permissions and access control** — role-based access matrix. Block: `requirements/permissions-access-control` (gated by `project.elicitation.has_authn_authz`).
8. **Define non-functional requirements** — performance, security, scalability, compliance. Block: `requirements/non-functional-requirements`. Use `references/elicitation-patterns/non-functional-discovery.md`.
9. **Establish acceptance criteria** — testable conditions for each FR. Block: `requirements/acceptance-criteria`.

The macro workflow runs concurrently with the analysis sequence in `references/analysis-workflow.md` — analysis produces the foundation; the gathering process produces the writeup.

## The 7-step per-file workflow (micro)

Applied to every block when filling content:

| # | Step | Halt condition |
|---|---|---|
| 0 | Section relevance check (unconditional) | Ask Yes / No (with reason) / Skip / Not sure for every block. Record outcome in the completeness tracker before drafting. |
| 1 | Define scope of the section | If scope is unclear, elicit before drafting |
| 2 | Draft content from the block template under `templates/blocks/requirements/<slug>.md` | If template is missing, halt and report — do not invent structure |
| 3 | Verify understanding by summarizing back | If user disagrees, return to step 1 |
| 4 | Trace every item to an analysis artifact (constraint, risk, dependency, decision) | If a tracked item cannot be traced, flag and confirm with user |
| 5 | Refine based on feedback | Continue until user acknowledges |
| 6 | Mark complete; append `Added` row to change tracker | Tracker append must succeed before moving to next block |

**Step 3 (Verify understanding) is non-skippable.** Even if the section seems trivially correct, summarize back what you understood and what you produced and wait for acknowledgement. Skipping this step is the most common cause of late-stage drift between artifact and intent.

## Composition awareness

Always resolve which blocks apply by reading the active composition's `blocks:` list and `decision-gates:` list. Honor `optional: true` (offer to skip; do not auto-include) and `include-if: <expr>` (skip when expr resolves false against `project.elicitation.*`).

## File relevance recommendation

After Step 1 discovery (or directly after Step 0 in greenfield), run this once over the full block list: AI surveys gathered context, recommends `Fill` / `Skip` / `N/A` per block, presents to user. User confirms or overrides. Result is recorded in `completeness-tracker.md`. Re-evaluate per-block during writing using the Section Relevance Check (Step 0 of the 7-step workflow).

## Key rules

- **Requirements are STABLE, solution details are CHANGEABLE** — UI specifics and tech choices belong in `create-design-package`.
- **FR numbering convention** — `FR[Area].[Feature].[Detail]` for traceability through design and implementation.
- **One section per file** — easier AI consumption, easier maintenance, cleaner change-tracker rows.
- **Scaffolding before content** — copy block templates, run relevance check, then fill section by section.
- **Verify understanding constantly** — summarize back before drafting.
- **Knowledge base provides context** — in brownfield, query the KB before reading source repos directly.

## Internal step naming

This skill uses "Step N" inside its workflow (Step 1 / Step 2 / …). It does **not** use "Phase 1/2/3/4" — `phase` is reserved for the macro stage shape (requirements / design / planning / execution / …) and `increment` is reserved for the implementation chunk in `create-implementation-package`. The terminology rename from `phase` → `increment` (PHASE-XXX → INC-XXX) applies to the planning/execution stages; this skill never authors INC-XXX artifacts.
