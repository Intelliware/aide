# Elicitation pattern: KB root discovery

## Purpose

Confirms the target knowledge-base path, the list of repos that will be
indexed inside it, and the architectural shape of the KB root document
(ARCHITECTURE.md). Invoked from `build-knowledge-base` when authoring the
KB instance root (and from `kb-instance-root` composition) so the root
ARCHITECTURE.md is anchored on a confirmed repo list and a chosen overall
architecture pattern.

## Inputs needed from user

- Target KB repo path (verifies / overrides `project.paths.knowledge_base_path`)
- The full list of repos to be indexed in this KB (verifies / extends `[[project.repos]]`)
- Per-repo: confirmation of slug, role, primary-flag
- Overall architecture pattern that the KB root narrates
- Top-level system context (actors, external systems)
- The chosen anchor diagrams (C4 Level 1, optional Level 2, optional deployment)
- Any KB-wide conventions (naming, folder structure overrides)

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

1. **Confirm the KB path.** (auto-fill from `project.paths.knowledge_base_path`)
   - **Format:** path-with-validation
   - **Validation:** absolute path; must exist and be either empty OR contain only the source-docs/ subtree (warn and require explicit overwrite confirmation otherwise)
   - **Maps to:** drives where the skill writes ARCHITECTURE.md, repos/, components/, shared/, graph.json

2. **Confirm the repo list.** (auto-fill from `[[project.repos]]`; allow add/remove)
   - **Format:** structured-list of `{code, name, path, role, primary}`
   - **Validation:** each entry's `path` resolves to a directory; each `code` matches `^[a-z][a-z0-9-]*$`; at most one `primary = true`
   - **Maps to:** drives the per-repo subtree the KB scaffolds

3. **For each repo, confirm Part A/B docs are present.**
   - **Format:** verification step (no input from user unless docs are missing)
   - **Validation:** `<knowledge_base_path>/source-docs/<repo-slug>/` exists and contains at least one Part A doc and one Part B doc per repo
   - **Maps to:** abort with a clear error if missing — `build-knowledge-base` cannot proceed

4. **Overall architecture pattern.** (the narrative anchor for ARCHITECTURE.md)
   - **Format:** multiple-choice (auto-fill from `design.architecture.pattern` if available)
   - **Options:** `monolith` / `modular-monolith` / `micro-services` / `event-driven` / `serverless` / `hybrid` / `unknown-pre-RE`
   - **Maps to:** ARCHITECTURE.md `## Architecture pattern` section

5. **System Context (C4 Level 1).** Confirm the actor list — humans and external systems that touch the bounded context as a whole.
   - **Format:** structured-list of `{name, kind, role}` where `kind` ∈ `{user-persona, external-system, scheduled-trigger, third-party-service}`
   - **Validation:** at least one actor required
   - **Maps to:** ARCHITECTURE.md `## System context` section

6. **Anchor diagrams.** Which diagrams do you want included?
   - **Format:** multiple-choice (multi-select)
   - **Options:** `c4-level-1` (always required) / `c4-level-2` / `deployment-topology` / `data-flow` / `sequence-key-flows`
   - **Validation:** `c4-level-1` is required and pre-selected
   - **Maps to:** ARCHITECTURE.md `## Anchor diagrams` section

7. **KB-wide naming / folder conventions.** Any overrides to the default folder structure (`repos/`, `components/<repo-slug>/`, `shared/`, `synthesized/01..10/`)?
   - **Format:** yes/no, then structured-list `{convention, override}` if yes
   - **Validation:** overrides must not collide with the schema-mandated paths declared in `config/SCHEMAS.md` § 3
   - **Maps to:** ARCHITECTURE.md `## Conventions` section + skill behavior during scaffolding

8. **Will the KB index a multi-repo system, a single repo, or a mixed framework + apps stack?**
   - **Format:** multiple-choice
   - **Options:** `single-repo` / `multi-repo-internal` / `framework-plus-consumers` / `mixed`
   - **Maps to:** drives whether the KB groups by repo, by capability, or both

**Wrap-up:** Confirm the answers in summary form before proceeding. Print the KB path, the repo list with slugs and roles, the architecture pattern, the actor list, the chosen diagrams, and any convention overrides. Confirm before scaffolding ARCHITECTURE.md and the per-repo subtrees.

## Output format

Answers feed the `knowledge-base/architecture-index` block which composes ARCHITECTURE.md (per `kb-instance-root` composition).

```markdown
# Architecture — Acme Orders

## Architecture pattern
modular-monolith — single deployable, module boundaries protect future extraction.

## System context (C4 Level 1)
- Order Operator (user-persona) — daily user resolving stuck orders
- Customer Portal (external-system) — submits orders via REST
- Stripe (third-party-service) — billing capture
- Hourly Reconciliation Job (scheduled-trigger) — reconciles ledger

## Repos indexed
| slug | role | path | primary |
|---|---|---|---|
| acme-orders-api | api | ./apps/orders-api | true |
| acme-orders-ui | ui | ./apps/orders-ui |  |

## Anchor diagrams
- C4 Level 1: ./diagrams/c4-l1.md
- C4 Level 2: ./diagrams/c4-l2.md
- Deployment topology: ./diagrams/deployment.md
```

## Validation rules

- KB path must exist and be either empty or contain only `source-docs/` (anything else requires explicit overwrite confirmation).
- Every repo declared must have Part A and Part B docs under `source-docs/<repo-slug>/`.
- C4 Level 1 is required; other diagrams are optional but encouraged.
- Convention overrides must not collide with schema-mandated paths.
- The architecture-pattern choice should match `design.architecture.pattern` when both exist; conflicts are surfaced.

## Reusable across

- `build-knowledge-base` (step 02-scaffold-repos seeds; step 06-emit-architecture-index finalizes)
- `kb-instance-root` composition (declared as required elicitation)
