# C4 Diagram Hooks

Lifted from the design package's "Phase 2: Architecture and Technology" guidance in `solution-design-package/skills/create-solution-design-package/SKILL.md`. The design package uses C4 (Context / Container / Component / Code) at Levels 1, 2, and 3; Level 4 (code) is intentionally out of scope for design and lives in the implementation stage.

## What goes in which level

| Level | Purpose | Where it appears in the design package |
|---|---|---|
| 1 — System Context | Show the system as a black box, its users, and the external systems it interacts with | `design/solution-overview` (always) |
| 2 — Container | Show the runtime containers (services, apps, databases, queues) and how they communicate | `design/solution-overview` (always) and `design/solution-architecture` (always) |
| 3 — Component | Show components inside a container — modules, layers, controllers, services | `design/backend-design`, `design/frontend-design`, `design/integration-design` (when applicable) |
| 4 — Code | Class-level diagrams | NOT in design; deferred to implementation if used at all |

## Pinned versions

Every container shown in a Level 2 diagram must reference the same pinned version that appears in `design/technology-stack`. Drift between the diagram and the stack is a bug — review-design-package will catch it.

Examples:
- "Spring Boot 3.2.1 (api-orders)" — correct
- "Spring Boot (latest)" — wrong; reject in review
- "Spring Boot 3.x" — wrong; reject in review

## Knowledge base integration

When the project has a knowledge base with existing C4 diagrams (`{paths.knowledge_base_path}/components/<repo>/*.md` and `{paths.knowledge_base_path}/ARCHITECTURE.md`), reuse them as the starting point. The architecture baseline produced by `steps/01-discovery.md` synthesizes the KB diagrams plus the technical-debt categorization into a baseline that the design then extends.

For each new/modified container or component:
1. Cite the KB component_id in the design block (`See: knowledge-base/components/api-orders/order-checkout-flow.md`).
2. When the design adds a new container or component, propose a new component_id and flag it for KB sync after design review.
3. Update `graph.json` edges (`calls`, `consumes`, `depends-on`, `derives-from`) when the design changes inter-component communication patterns. Actual updates happen during `knowledge-base/update-knowledge-base`; the design just records the proposed deltas in the design change tracker.

## Diagram format

Mermaid is the default rendering format because the requirements and design packages are markdown-first and Mermaid renders inline in GitHub, GitLab, VS Code, and most note tools without external dependencies. PlantUML is acceptable when the project's existing artifacts use it (record the choice in the technology stack).

## Common mistakes

- Mixing levels in one diagram (e.g., a Level 2 with class-level boxes). Each level has its own diagram.
- Showing every external system at Level 1 even if only one or two are relevant. Show only what matters for the change.
- Drawing components without naming the container they live in.
- Omitting the trust boundary (security boundary) in Level 2. Always show.
- Versions in diagram boxes that disagree with `design/technology-stack`.
- Diagrams that drift from the architecture baseline without an ADR explaining the change.
