# Overview — create-design-package

## Purpose

The design stage produces the technical blueprint that translates an approved requirements package into implementation-ready specifications. The design package covers solution overview (architecture pattern + C4 diagrams), pinned technology stack, frontend/backend/API/database designs, security, integration, deployment, observability, testing strategy, and technical NFRs. Every design decision traces back to a specific requirement, constraint, or architecture-baseline observation; if it does not trace, either the requirement is missing (return to `create-requirements-package`) or the design is speculative (drop it).

The skill is the primary lift target for greenfield-elaborate design (per `_archive/skill-disposition.md` row 5). It folds in two model-2 sub-phase skills (solution-discovery and solution-design) — that DNA now lives as steps + references inside this single skill, supporting multiple entry paths: discovery-first, design-only (skip discovery), and design-update (after requirements changed). Folder name was changed from `create-solution-design-package` to `create-design-package` to align with the new stage name "design".

## When to use

- An approved requirements package exists (run `review-requirements-package` first if not yet validated)
- User says: "create the design package", "design the solution", "build the technical blueprint", "create the architecture", "design the API/database/frontend/backend", "choose the technology stack", "start the design stage"
- Updating an existing design after requirements changed (use the requirements `change-tracker.md` to scope updates)
- Brownfield enhancement that warrants explicit architecture-baseline discovery

## When NOT to use

- Design package already assembled and only validation is wanted → `review-design-package`
- Requirements not yet approved → `create-requirements-package` and `review-requirements-package`
- Planning the implementation → `create-implementation-package`
- Trivial change → `quick-dev/document-quick-change`

## Position in workflow

```
create-requirements-package -> review-requirements-package -> create-design-package -> review-design-package -> create-implementation-package -> ...
```

In brownfield mode, the architecture-baseline discovery step (Step 1) runs first; greenfield projects skip directly to scoping and design assembly. The skill is invoked once per design-baseline cycle and may be re-invoked when the requirements change tracker records amendments — in that case, only the affected design sections are revised (per the Requirements Version Tracking protocol in `references/solution-design-workflow.md`).
