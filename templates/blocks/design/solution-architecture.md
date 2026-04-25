---
slug: solution-architecture
title: "Solution Architecture"
applies-to: [greenfield-design-package, brownfield-enhancement-spec]
requires-decision-from: [architect]
optional: false
order-hint: 3
---

## 3. Solution Architecture

<!-- High-level architecture and system design. This shapes the structure of the entire codebase. -->

### 3.1 Architecture Overview

<!-- One paragraph describing the overall architecture approach and rationale. -->

[e.g., "The system follows a modular monolith architecture with a React SPA frontend communicating with a Spring Boot REST API backend. PostgreSQL serves as the primary data store. Authentication is delegated to Microsoft Entra ID via OAuth2/OIDC."]

### 3.2 Architectural Drivers

<!-- Requirements that most influence architecture decisions. Reference specific FRs and NFRs. -->

| Driver | Requirement | Architecture Implication |
|--------|-----------|------------------------|
| [e.g., Concurrent users: 100] | [NFR-Perf-1] | [e.g., Stateless API, connection pooling] |
| [e.g., SSO required] | [FR1.9.1] | [e.g., OAuth2 Resource Server configuration] |
| | | |

### 3.3 System Context Diagram

<!-- C4 Level 1 — shows the system as a box and its relationships with users and external systems. Use Mermaid or ASCII. -->

```
[System Context Diagram]

┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Users     │────▶│  [System Name]   │────▶│ External    │
│ (Browser)   │◀────│  (Web App + API) │◀────│ Systems     │
└─────────────┘     └──────────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Database    │
                    └──────────────┘
```

### 3.4 High-Level Architecture Diagram

<!-- C4 Level 2 — shows containers (frontend, backend, database) and their interactions. -->

```
[Container Diagram]

┌──────────────────────────────────────────────────┐
│                   Client Browser                  │
│  ┌─────────────────────────────────────────┐     │
│  │         [Frontend SPA]                   │     │
│  │  (React / Angular / Vue)                 │     │
│  └──────────────┬──────────────────────────┘     │
└─────────────────┼────────────────────────────────┘
                  │ HTTPS / REST
                  ▼
┌──────────────────────────────────────────────────┐
│              [Backend API]                        │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐     │
│  │Controller │→│ Service   │→│Repository │     │
│  │  Layer    │ │  Layer    │ │  Layer    │     │
│  └───────────┘ └───────────┘ └─────┬─────┘     │
└────────────────────────────────────┼────────────┘
                                     │ SQL
                                     ▼
                              ┌──────────────┐
                              │  [Database]  │
                              │ (PostgreSQL) │
                              └──────────────┘
```

### 3.5 Component Architecture

<!-- How the system is organized internally — modules, feature slices, or layers. -->

[Describe the internal component organization and boundaries.]

### 3.6 Deployment Architecture

<!-- How components are deployed in each environment. -->

[Describe hosting, containers, networking, load balancing.]

### 3.7 Architecture Principles & Patterns

<!-- Key architectural principles guiding design decisions. -->

| Principle | Description | Example |
|-----------|------------|---------|
| [e.g., Layered Architecture] | [e.g., Strict separation of concerns: Controller → Service → Repository] | [e.g., Controllers never access repositories directly] |
| [e.g., Single Responsibility] | [e.g., Each service handles one domain area] | [e.g., AllocationService handles only allocation logic] |
| | | |
