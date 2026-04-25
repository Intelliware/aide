---
slug: framework-overview
title: "Framework Overview"
applies-to: [re-ui-framework-consumer]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 110
---

## 1. Framework Overview

### 1.1 What This Framework Is

- **Name:** [Framework Name]
- **Built on:** Angular [specify version range, e.g., 17.x–18.x]
- **Purpose:** [One or two sentences — e.g., "A component library and application shell for building enterprise admin dashboards."]
- **Package(s):**

| Package                            | Purpose                                    |
|------------------------------------|--------------------------------------------|
| `@orgname/framework-core`          | [e.g., "Core services, DI tokens, shell."] |
| `@orgname/framework-components`    | [e.g., "UI component library."]            |
| `@orgname/framework-forms`         | [e.g., "Form utilities and validators."]   |
| <!-- Add all publishable packages --> |                                          |

### 1.2 Key Concepts and Architecture

<!-- This is the MENTAL MODEL section. AI models need to understand the core abstractions before they see any API. Describe the 3–7 foundational concepts that everything else builds on. Use a short paragraph per concept, not just a bullet. -->

**[Concept 1, e.g., "The Application Shell"]**
[Explain what it is, what it controls, and how every app interacts with it. e.g., "Every application is wrapped in a `FwShell` component that manages the top nav, sidebar, and content area. You never create your own root layout — the Shell provides it. Your app's routed views render inside the Shell's content outlet."]

**[Concept 2, e.g., "Feature Modules"]**
[Explain the concept and how it differs from or extends vanilla Angular modules/standalone components.]

**[Concept 3, e.g., "Data Stores"]**
[e.g., "The framework provides `FwStore<T>` as the standard way to manage server-fetched data. Components bind to stores, not raw HTTP calls. Stores handle caching, refresh, and error states internally."]

**[Concept 4, e.g., "The Action System"]**
[If the framework has a specific pattern for user actions, commands, etc.]

<!-- Add as many concepts as needed. This section should give the AI enough context to make correct high-level architectural decisions. -->

**How they fit together:**
<!-- A brief paragraph or ASCII diagram showing how the core concepts relate. -->

```
[Shell]
  ├── [Navigation / Routing]
  ├── [Feature A]
  │     ├── [Components] ←→ [Store] ←→ [API Service]
  │     └── [Forms]
  └── [Feature B]
        └── ...
```

### 1.3 Core Philosophy and Design Principles

- **Principle 1:** [e.g., "Convention over configuration — most behaviors have sensible defaults."]
- **Principle 2:** [e.g., "Composition over inheritance — build complex UIs by composing small components."]
- **Principle 3:** [e.g., "Framework-managed state — avoid direct DOM manipulation or standalone state libraries unless explicitly required."]
- **Principle 4:** [e.g., "Explicit over magic — no hidden side effects; all behaviors are opt-in via inputs or providers."]

### 1.4 When to Use / When NOT to Use

**Use this framework when:**
- [e.g., "Building internal CRUD-heavy admin applications."]
- [e.g., "You need consistent theming across a suite of apps."]

**Do NOT use this framework when:**
- [e.g., "Building public-facing marketing sites — it adds unnecessary overhead."]
- [e.g., "The app requires a non-Angular rendering layer."]
