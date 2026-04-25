# Architecture Baseline

> Single, self-contained document. All content is embedded inline — no links to external documents.
> Populated by `existing-architecture-assessment.md`. Do not fill in directly without running the skill first.

## 1. System Context

<!-- Source: requirements package Section 1 -->

System name, purpose, primary users, deployment environment.

## 2. Component Architecture

<!-- Source: architecture-discovery observations — component topology -->

Component topology, module boundaries, inter-component communication patterns, service dependencies.

## 3. Tech Stack and Frameworks

<!-- Source: architecture-discovery observations — framework conventions -->

Languages, frameworks, libraries with versions, build tools, package managers — observed from codebase.

## 4. Deployment Topology

<!-- Source: architecture-discovery observations — deployment manifests -->

Infrastructure-as-code findings, container configuration, environment structure, CI/CD pipeline architecture, health check mechanisms.

## 5. Data Architecture

<!-- Source: architecture-discovery observations — data layer -->

Database types and schemas at the architectural level, ORM configuration, connection pooling, caching layers, data flow between components.

## 6. Integration Points

<!-- Source: architecture-discovery observations — integration patterns -->

Message brokers, event buses, external API integrations, webhook configurations, scheduled jobs, async workflows.

## 7. Security Architecture

<!-- Source: architecture-discovery observations — security boundaries -->

Authentication middleware, authorization model, trust boundaries, secrets management, encryption configuration.

## 8. Performance Characteristics

<!-- Source: architecture-discovery observations — performance -->

Known bottlenecks, resource utilization patterns, scaling configuration, performance-relevant architecture decisions.

## 9. Technical Debt Assessment

<!-- Source: technical-debt-assessment — full categorization -->

Categorized as:
- **Must-fix before feature** — debt that blocks the proposed change
- **Should-fix during feature** — debt that will worsen if ignored
- **Defer to backlog** — debt unrelated to the change area

With type classification: code, architecture, infrastructure, test, documentation.

## 10. Architectural Constraints

<!-- Source: architecture-discovery + must-fix debt items -->

Constraints the existing architecture imposes on the proposed change — framework limitations, deployment boundaries, data-layer restrictions, integration pattern commitments.

Must-fix debt items from Section 9 are included here as constraints the design phase must account for.

## 11. Areas Affected by Proposed Change

<!-- Source: requirements package Section 2.1 + architecture-discovery scope -->

Which architectural components, integration points, and data stores the proposed feature will touch.

## 12. Open Questions

<!-- Source: all unresolved items from discovery -->

Architectural unknowns that discovery could not resolve — requiring further investigation or stakeholder clarification.
