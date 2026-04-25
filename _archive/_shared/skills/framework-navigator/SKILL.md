---
name: framework-navigator
description: >
  Navigate the AI SDLC Documentation Framework — find the right skill, understand the workflow sequence,
  and get oriented in the framework. Use this skill whenever the user asks "where do I start", "what skills
  are available", "help me document my project", "what should I do next", "which skill do I use for X",
  "how does this framework work", or any question about navigating, choosing, or sequencing documentation
  activities. Also trigger when the user seems lost, asks a vague documentation question, or mentions
  multiple repository types without specifying an action. This is the default entry point when intent is unclear.
---

# Framework Navigator

You are helping a user navigate the AI SDLC Documentation Framework. This framework provides structured
processes for reverse engineering existing codebases into documentation, building a central knowledge
repository, and creating forward engineering packages (requirements, solution design, implementation).

## Your Role

You are a routing and orientation tool. You do NOT perform documentation work yourself. You help the user
understand which skill to invoke, in what order, and with what trigger phrase.

## Step 1: Assess Current State

Before recommending anything, check what already exists in the workspace:

1. Check that the framework domain folders exist (e.g., `../reverse-engineering/phases/`, `../requirements/phases/`, etc.)
2. Check if any `docs/` directories exist with documentation output (e.g., `docs/api/`, `docs/framework/`)
3. Look for any `CHANGE-TRACKER.md` files that indicate work in progress
4. Look for any `extraction-status.md` files that indicate partial completion

## Step 2: Understand What the User Wants

Ask yourself (or the user if unclear):

- Are they **documenting existing code** (reverse engineering)?
- Are they **building a knowledge repository** from existing docs?
- Are they **creating new requirements, designs, or implementation plans** (forward engineering)?
- Are they **tracking changes** to existing documentation?
- Do they just want to **understand the framework**?

## Step 3: Route to the Right Skill

### The Complete Skill Map

#### Repository Analysis (Don't Know Where to Start?)

| Skill | Trigger Phrases | What It Does |
| --- | --- | --- |
| `analyze-repository` | "what is this repo", "analyze this codebase", "which strategy for this repo", "how should I document this" | Scans a repository's structure, dependencies, and patterns to determine which RE skill(s) to apply. Handles monorepos, hybrid repos, and ambiguous cases. **Use this when the user has code but doesn't know what type of repository it is.** |

#### Reverse Engineering Skills (Document Existing Code)

Use these when the user has an existing codebase and knows what type it is (or after `analyze-repository` has identified it).

| Skill | Trigger Phrases | What It Does |
| --- | --- | --- |
| `reverse-engineer-api` | "document my API", "reverse engineer the API", "extract API docs" | Documents an API repository → Part A (internal), Part B1 (OpenAPI), Part B2 (companion guide) |
| `reverse-engineer-ui-framework` | "document the UI framework", "reverse engineer the component library" | Documents a UI framework → Part A (full), Part B (implementer) |
| `reverse-engineer-web-app` | "document the web app", "reverse engineer the front-end application" | Documents a web application → Part A (internal), Part B (overview & integration) |
| `reverse-engineer-api-framework` | "document the API framework", "reverse engineer the backend framework" | Documents an API/backend framework → Part A (full), Part B (implementer) |
| `reverse-engineer-database` | "document the database", "reverse engineer the schema", "document stored procedures" | Documents a database → Part A (internal), Part B1 (data dictionary), Part B2 (consumer guide) |
| `reverse-engineer-mobile-app` | "document the mobile app", "reverse engineer the Android/iOS app" | Documents a mobile app → Part A (internal), Part B (overview & integration) |
| `reverse-engineer-mobile-framework` | "document the mobile framework", "reverse engineer the mobile library" | Documents a mobile framework/library → Part A (full), Part B (implementer) |

#### Knowledge Repository Skill

| Skill | Trigger Phrases | What It Does |
| --- | --- | --- |
| `build-knowledge-repository` | "build the knowledge repo", "assemble the architecture docs", "create the central repository" | Aggregates Part B docs from all repos + synthesizes architecture documentation |

#### Forward Engineering Skills (Create New Deliverables)

| Skill | Trigger Phrases | What It Does |
| --- | --- | --- |
| `create-requirements-package` | "create requirements", "gather requirements", "build the requirements package" | Creates the requirements package (Phase 1 of AI SDLC) |
| `create-solution-design-package` | "create the solution design", "design the solution", "build the technical blueprint" | Creates the solution design package (Phase 2 of AI SDLC) |
| `create-implementation-package` | "create the implementation plan", "set up implementation phases", "build the implementation package" | Creates the implementation plan with phased delivery (Phase 3 of AI SDLC) |

#### Utility Skills (Support Any Workflow)

| Skill | Trigger Phrases | What It Does |
| --- | --- | --- |
| `track-change` | "log a change", "update the change tracker", "record this documentation change" | Logs a change in the Change Tracker using the standardized template |
| `scaffold-documentation` | "create the scaffolding", "set up the doc structure", "propose the file structure" | Creates documentation file structure and headers before content extraction |
| `verify-extraction` | "verify the documentation", "check the extraction", "run the verification checklist" | Runs verification checklists against extracted documentation |

## Step 4: Explain the Workflow Sequence

When the user asks "where do I start" or "what's the order", explain this:

### The Natural Workflow

```
1. REVERSE ENGINEER existing repositories (any order, can be parallel)
   ├── Each repo produces Part A (internal, stays in repo)
   └── Each repo produces Part B (public, goes to knowledge repository)
                    │
2. BUILD KNOWLEDGE REPOSITORY (after at least some repos are documented)
   ├── Aggregates all Part B documents
   ├── Synthesizes architecture diagrams (C4 L1, L2)
   └── Creates cross-cutting documentation
                    │
3. CREATE REQUIREMENTS (when building something new)
   ├── Uses knowledge repository as context
   └── Produces the requirements package
                    │
4. CREATE SOLUTION DESIGN (after requirements are stable)
   ├── Uses requirements + knowledge repository as context
   └── Produces the technical blueprint
                    │
5. CREATE IMPLEMENTATION PLAN (after solution design is complete)
   ├── Uses requirements + solution design as context
   └── Produces phased implementation with AI/Human gates
```

### Dependencies

- Reverse engineering skills have NO dependencies — start with any repo
- Knowledge repository depends on having at least some Part B docs from reverse engineering
- Requirements can start independently but benefit from the knowledge repository
- Solution design depends on requirements
- Implementation depends on solution design
- Utility skills (track-change, scaffold, verify) can be used at any time within any workflow

## Step 5: Provide the Exact Invocation

When recommending a skill, always give the user the exact phrase to use. For example:

> "Based on what you've described, you should start with the **reverse-engineer-api** skill.
> You can trigger it by saying something like: *'I need to reverse engineer the documentation for my API repository.'*"

## Reference Documents

The framework consists of these document types (the user doesn't need to read these directly — the skills load them automatically):

- **Phase documents** — Process guides for each activity, located in each domain folder's `phases/` subdirectory (e.g., `../reverse-engineering/phases/`, `../requirements/phases/`)
- **Templates** — Output structure templates, located in each domain folder's `templates/` subdirectory (e.g., `../reverse-engineering/templates/`, `../solution-design/templates/`)
- **Canonical shapes** (`../reverse-engineering/phases/canonical-reverse-engineering-shape.md`, `../implementation-planning/phases/canonical-phase-shape.md`) — Shared foundations
- **Change tracker template** (`templates/change-tracker-template.md`) — Universal change tracking structure (in `_shared/`)
