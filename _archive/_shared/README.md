# AI SDLC Framework — Skills, Phases & Templates

This framework provides the shared artifacts used to drive documentation through AI-assisted workflows in Claude Code — the Skills, Phase guides, and Templates that enable systematic documentation of existing systems and structured design and development of new ones.

The framework is organized into **five domain folders** plus a **shared resources** layer, each containing its own Skills, Phases, and Templates.

---

## Domain Folders

Each domain folder lives directly under `SharedResources/` and contains `skills/`, `phases/`, and/or `templates/` subfolders relevant to that domain.

| Folder | Purpose | Contents |
|---|---|---|
| **`reverse-engineering/`** | Document and extract knowledge from existing codebases | 9 phases, 7 templates, 11 skills |
| **`requirements-package/`** | Create requirements packages for new systems | 1 phase, 1 template, 1 skill |
| **`solution-design-package/`** | Create solution design packages from requirements | 1 phase, 1 template, 1 skill |
| **`implementation-planning/`** | Create phased implementation plans from solution designs | 4 phases, 1 skill |
| **`implementation-execution/`** | Execute implementation phases (runtime workflow) | 1 phase |
| **`_shared/`** | Cross-cutting resources used by all domains | 1 template, 3 skills, framework docs |

---

## What's in Each Domain

### `reverse-engineering/`

Seven specialized reverse engineering workflows plus supporting skills:

| Sub-group | Contents |
|---|---|
| **Domain phases** | API, API Framework, Web App, UI Framework, Mobile App, Mobile Framework, Database |
| **Canonical shape** | `canonical-reverse-engineering-shape.md` — shared foundations for all RE phases |
| **Knowledge repository** | `build-knowledge-repository-phase.md` — assembling consumer-facing docs |
| **Templates** | One output template per domain (7 total) |
| **Skills** | One skill per domain (7), plus `analyze-repository`, `scaffold-documentation`, `verify-extraction` |

### `requirements-package/`

Single-phase workflow: requirements gathering via AI-assisted interviews.

### `solution-design-package/`

Single-phase workflow: solution design from a completed requirements package.

### `implementation-planning/`

Plan authoring, the canonical phase shape, and plan refactoring tools:
- `canonical-phase-shape.md` — mandatory 8-section structure for implementation phases
- `create-implementation-package.md` — full plan creation process
- `implementation-plan-refactoring-guide.md` and `phase-refactoring-checklist.md`

### `implementation-execution/`

Runtime execution of implementation phases:
- `phase-execution-guide.md` — the phase execution workflow, bug logging, phase status

### `_shared/`

Cross-cutting resources referenced by multiple domains:
- `templates/change-tracker-template.md` — universal change tracking (used by all domains)
- `skills/framework-navigator/` — routes users to the right skill across all domains
- `skills/track-change/` — logs documentation changes using the change tracker
- `skills/document-sharding/` — splits large Markdown files (domain-agnostic utility)
- `SKILL-VALIDATION-TRACKER.md` — rollout/validation status for all skills

---

## How It All Fits Together

```
User invokes a Skill (in a domain folder or _shared)
       │
       ▼
Skill reads the corresponding Phase guide for step-by-step instructions
       │
       ▼
Skill produces output shaped by the corresponding Template
       │
       ▼
Output lives in the target repository (internal) or Knowledge Repository (consumer-facing)
```

**Part A vs Part B documentation model** (applies to reverse-engineering):
- **Part A** — Internal implementation details. Stays in the source repository alongside the code it describes.
- **Part B** — Consumer-facing documentation. Aggregated into a central Knowledge Repository for cross-team visibility.

---

## Path Reference Convention

Within any domain folder:
- **Same-domain references** use short paths: `phases/x.md`, `templates/y.md`
- **Cross-domain references** use `../` relative paths: `../_shared/templates/change-tracker-template.md`, `../implementation-planning/phases/canonical-phase-shape.md`

---

## Core Framework Principles

1. **Structure before content** — Scaffold all documentation files and section headers before extracting any content. This prevents gaps and enforces completeness.
2. **Source-verified facts only** — If you cannot point to the line of source code that proves a documented behaviour, do not document it as fact.
3. **Canonical shapes** — Every implementation phase and every reverse engineering process follows a mandatory common structure so documentation is predictable and reviewable.
4. **Change tracking** — All documentation changes are logged using the change tracker template, with parts affected, versioning, and cross-impact assessment.
5. **AI + Human gates** — Every implementation phase includes an AI verification gate and a human approval gate before the next phase begins.
