# Overview — create-requirements-package

## Purpose

The requirements stage produces the stable business foundation that drives every downstream stage in A.I.D.E.: design, planning, execution, and (in brownfield mode) knowledge-base updates. A requirements package is more than a traditional BRD — it captures business context, functional requirements (with FR[Area].[Feature].[Detail] numbering), business rules, user journeys, data requirements, NFRs, permissions, and acceptance criteria, plus traceability and a change tracker. It is intentionally larger than what a single agent or human can hold in working memory at once; the skill therefore decomposes the work into discovery → analysis → writing → assembly, sequenced as `steps/01-discovery.md` through assembly in the SKILL.md workflow, with each step's deeper how-to in a dedicated `references/<workflow>.md` file.

The skill is the **primary lift target for greenfield-elaborate** (per `_archive/skill-disposition.md` row 4). It folds in three model-2 sub-phase skills (requirements-discovery, requirements-analysis, requirements-writing) — that DNA now lives as steps + references inside this single skill, so users can enter at any phase, skip phases that do not apply, and always end up with the same assembled package shape. The composition layer (`templates/compositions/greenfield-requirements-package.yaml`, `brownfield-enhancement-spec.yaml`, `quick-dev-spec.yaml`) is what determines which sections are required, optional, or gated for the active flow — the skill resolves blocks against that YAML rather than hard-coding the 14 sections.

## When to use

- Starting a new feature or project that needs a real requirements package before design
- Re-baselining or extending an existing requirements package after major scope change
- User says: "create requirements", "gather requirements", "build the requirements package", "document the business requirements", "start the requirements stage", "write functional requirements", "what does the system need to do"
- Brownfield enhancement that warrants a structured (not quick-dev) artifact — composition resolves to `brownfield-enhancement-spec.yaml`

## When NOT to use

- Package already assembled and only validation is wanted → `review-requirements-package`
- Trivial change → `quick-dev/document-quick-change` and the `quick-dev-spec.yaml` composition
- The work is design or planning, not requirements → `create-design-package` / `create-implementation-package`
- Extracting documentation from an existing repo → `reverse-engineering/reverse-engineer-*` skills

## Position in workflow

```
[start-project] → create-requirements-package → review-requirements-package → create-design-package → review-design-package → create-implementation-package → ...
```

Brownfield variant injects discovery using the knowledge base (via `knowledge-base/navigate-knowledge-base`) and the brownfield discovery step. Greenfield skips Step 1 entirely and goes from project setup directly into the relevance gate and analysis.

The skill is invoked once per feature (or once per requirements-baseline cycle) and is expected to be long-running — every step pauses for user acknowledgement before reading the next reference. The handoff is always by name to `review-requirements-package`; the YAML composition runner picks up there.
