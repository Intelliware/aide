# AI SDLC Stage Map — theframework (new)

This reference defines the navigation language for theframework's unified, skills-based SDLC. It supersedes `ai-sdlc-stage-map-old.md`. Vocabulary moved from "phase" (overloaded) to **stage** (SDLC grouping) and **increment** (implementation chunk); "package" remains the term for stage outputs but is no longer a navigation level — it is an output **composed** from blocks via a YAML composition.

## Naming Model

```text
theframework
├── Flow                                    (greenfield / brownfield / quick-dev — declared in project.toml)
│   └── Stage                               (requirements / design / planning / execution / reverse-engineering / quick-dev / knowledge-base / meta)
│       ├── Skill                           (independently invocable; one trigger phrase per skill)
│       │   └── Step                        (sequential sub-step inside a skill; never invoked alone)
│       └── Package                         (stage output artifact)
│           ├── Composition                 (templates/compositions/<name>.yaml — selects + orders blocks)
│           └── Block                       (templates/blocks/<stage>/<slug>.md — atomic section)
└── Increment                               (INC-XXX — implementation chunk)
    └── Increment Section                   (the 8 sections of the Canonical Increment Shape)
```

## Flow Map

theframework supports three flows. Stages adapt via composition selection rather than parallel skill trees.

```text
Flows
├── Greenfield                              (full SDLC, new project)
│   └── requirements → design → planning → execution
│
├── Brownfield                              (existing repos)
│   └── reverse-engineering → knowledge-base (build) → requirements (brownfield comp)
│       → design (brownfield comp) → planning → execution → knowledge-base (update)
│
└── Quick-dev                               (lightweight scoped change)
    └── document-quick-change → plan-quick-change → execute-quick-change → (optional) create-pr
```

## Full Stage Map

```text
theframework Stage Map
│
├── Stage: Reverse-Engineering              (.agents/skills/reverse-engineering/)
│   │  Used in: brownfield flow, before requirements
│   │
│   ├── Skill: analyze-repository           (dispatcher — classifies the repo type)
│   │   └── Output: type recommendation + invocation phrase for the right RE skill
│   │
│   ├── Skill: reverse-engineer-api
│   ├── Skill: reverse-engineer-api-framework
│   ├── Skill: reverse-engineer-database
│   ├── Skill: reverse-engineer-mobile-app
│   ├── Skill: reverse-engineer-mobile-framework
│   ├── Skill: reverse-engineer-ui-framework
│   └── Skill: reverse-engineer-web-app
│       │   Each domain skill follows the canonical RE 5-stage workflow:
│       │   ├── Step: scaffold              (per-skill steps/scaffold.md — structure before content)
│       │   ├── Stage 1: Discovery and Inventory
│       │   ├── Stage 2: Global Infrastructure
│       │   ├── Stage 3: Feature-by-Feature Extraction
│       │   ├── Stage 4: Cross-cutting concerns + Verification
│       │   ├── Stage 5: Assembly and Handoff
│       │   └── Step: verify                (per-skill steps/verify.md — verify-source check)
│       │
│       └── Output: Part A (internal docs) + Part B (consumer docs)
│           Composed via templates/compositions/re-<domain>-{internal,consumer}.yaml
│           Blocks under templates/blocks/reverse-eng/<domain>/{internal,consumer}/
│
├── Stage: Knowledge-Base                   (.agents/skills/knowledge-base/)
│   │  Used in: brownfield flow (build, post-RE; update, after each shipped increment)
│   │
│   ├── Skill: build-knowledge-base
│   │   ├── Step: 01-validate-target
│   │   ├── Step: 02-scaffold-repos
│   │   ├── Step: 03-emit-components
│   │   ├── Step: 04-shared-pass            (entities + cross-cutting concerns)
│   │   ├── Step: 05-emit-graph             (graph.json)
│   │   ├── Step: 06-emit-architecture-index (ARCHITECTURE.md)
│   │   ├── Step: 07-emit-claude-md
│   │   └── Step: 08-validate-coverage
│   │
│   ├── Skill: navigate-knowledge-base       (selective component retrieval — minimal set per feature)
│   │
│   ├── Skill: update-knowledge-base
│   │   ├── Step: 01-classify-diff
│   │   ├── Step: 02-update-components
│   │   ├── Step: 03-append-change-tracker
│   │   ├── Step: 04-emit-adr-if-threshold
│   │   ├── Step: 05-update-graph
│   │   ├── Step: 06-update-architecture-index
│   │   └── Step: 07-validate
│   │
│   ├── Skill: detect-knowledge-base-drift
│   │   ├── Step: 01-l1-commit-stamp        (cheap commit-SHA staleness check)
│   │   ├── Step: 02-l2-structural-diff     (component-level structural drift)
│   │   ├── Step: 03-l3-llm-contradiction   (LLM-judged contradiction)
│   │   ├── Step: 04-l4-coverage-sweep      (full coverage re-validation)
│   │   └── Step: 05-compose-report
│   │
│   └── Skill: verify-knowledge-base-coverage
│       ├── Step: 01-enumerate-artifacts
│       ├── Step: 02-compute-gaps
│       ├── Step: 03-check-staleness
│       └── Step: 04-emit-report
│
│   └── Output: KB instance at <knowledge_base_path>/
│       ├── ARCHITECTURE.md                 (root index)
│       ├── CLAUDE.md                       (agent navigation instructions)
│       ├── graph.json                      (machine-readable component dep graph)
│       ├── glossary.md, change-tracker.md
│       ├── repos/<slug>/{README.md, CLAUDE.md}
│       ├── components/<slug>/<id>.md       (leaves with mandatory frontmatter)
│       ├── shared/{entities, cross-cutting, adrs, integration-patterns}/
│       ├── synthesized/01..10/             (preserved 10-folder structure from legacy aggregator)
│       └── source-docs/<slug>/             (symlinks to each repo's RE Part A/B docs)
│
├── Stage: Requirements                     (.agents/skills/requirements/)
│   │  Used in: greenfield (greenfield-requirements-package.yaml)
│   │            brownfield (brownfield-enhancement-spec.yaml)
│   │
│   ├── Skill: create-requirements-package
│   │   ├── Step: 01-discovery              (brownfield only — current-capability baseline)
│   │   ├── (Relevance Gate — implicit)     (decides which of the 14 sections apply)
│   │   ├── Step: 03-analysis               (scope, stakeholders, dependencies, impact, gaps, risks)
│   │   └── Step: 04-writing                (per-section 7-Step Workflow:
│   │                                        relevance check → scope → draft → verify
│   │                                        → traceability → refine → mark complete)
│   │
│   └── Skill: review-requirements-package  (GO / NO-GO before handoff to design)
│
│   └── Output: Requirements Package
│       Composition: templates/compositions/greenfield-requirements-package.yaml
│       Blocks (templates/blocks/requirements/):
│       ├── Block: executive-summary-business-context
│       ├── Block: stakeholders-personas
│       ├── Block: business-objectives-success-criteria
│       ├── Block: user-journeys
│       ├── Block: views-dashboards
│       ├── Block: functional-requirements
│       ├── Block: functional-specifications
│       ├── Block: business-logic-rules
│       ├── Block: data-requirements
│       ├── Block: permissions-access-control
│       ├── Block: non-functional-requirements
│       ├── Block: assumptions-constraints-out-of-scope
│       ├── Block: acceptance-criteria
│       ├── Block: glossary
│       ├── Block: traceability-matrix
│       ├── Block: index
│       └── Block: completeness-tracker     (support tracker)
│
├── Stage: Design                           (.agents/skills/design/ — renamed from "solution-design")
│   │  Used in: greenfield (greenfield-design-package.yaml)
│   │            brownfield (brownfield-enhancement-spec.yaml)
│   │
│   ├── Skill: create-design-package
│   │   ├── Step: 01-discovery              (brownfield architecture baseline:
│   │   │                                    architecture-discovery → tech-debt → existing-arch-assessment)
│   │   └── Step: 02-design                 (11-step assembly with C4 + tech pinning + traceability)
│   │
│   └── Skill: review-design-package        (GO / NO-GO before handoff to planning)
│
│   └── Output: Design Package
│       Composition: templates/compositions/greenfield-design-package.yaml
│       Blocks (templates/blocks/design/):
│       ├── Block: solution-overview
│       ├── Block: technology-stack         (every framework / language / database pinned to a version)
│       ├── Block: solution-architecture    (C4 diagrams)
│       ├── Block: ux-design
│       ├── Block: frontend-design
│       ├── Block: backend-design
│       ├── Block: database-design
│       ├── Block: api-design               (success + error contracts per endpoint)
│       ├── Block: integration-design
│       ├── Block: workflow-business-rules-design
│       ├── Block: dashboard-reporting-design
│       ├── Block: security-design
│       ├── Block: deployment-devops
│       ├── Block: observability-operations
│       ├── Block: testing-strategy
│       ├── Block: non-functional-requirements-technical
│       ├── Block: risk-assessment
│       └── Block: glossary-acronyms
│       Plus: ADR files (one per significant decision; KB shared/adrs/ if KB exists)
│
├── Stage: Planning                         (.agents/skills/planning/)
│   │  Used in: greenfield, brownfield
│   │
│   ├── Skill: create-implementation-package
│   │   ├── Step: codebase-analysis         (brownfield only)
│   │   ├── Step: test-planning
│   │   ├── Step: increment decomposition   (propose INC-XXX list + dependencies; user approval)
│   │   ├── Step: write each increment      (fill all 8 blocks of the Canonical Increment Shape)
│   │   ├── Step: support documents         (bugs-and-issues-log, change-tracker, increment-status)
│   │   └── Step: plan-readiness-review     (GO / NO-GO gate)
│   │
│   └── Skill: review-implementation-package
│
│   └── Output: Implementation Package
│       Composition: templates/compositions/greenfield-implementation-package.yaml
│       │
│       ├── Increment (INC-XXX)             (one file per increment; repeats per increment)
│       │   Composed from 8 blocks (templates/blocks/planning/):
│       │   ├── Increment Section: Increment Identity        (block: increment-identity)
│       │   │   ├── ID (INC-XXX), Name
│       │   │   └── FR Mapping (every increment maps to FRs or declares "None — foundational")
│       │   ├── Increment Section: Goal                      (block: goal)
│       │   ├── Increment Section: Dependencies              (block: dependencies — by INC ID)
│       │   ├── Increment Section: Plan                      (block: plan — imperative steps)
│       │   ├── Increment Section: Outcome                   (block: outcome)
│       │   ├── Increment Section: Automated Verification    (block: automated-verification — AI Gate)
│       │   ├── Increment Section: Human Verification        (block: human-verification — Human Gate)
│       │   └── Increment Section: Success Criteria          (block: success-criteria — binary checkboxes)
│       │
│       └── Support documents
│           ├── implementation-package.md   (overview: lists increments + dependencies)
│           ├── increment-status.md         (states: not-started, in-progress, completed, blocked, on-hold)
│           ├── bugs-and-issues-log.md      (initialised empty)
│           └── change-tracker.md           (initialised empty)
│
├── Stage: Execution                        (.agents/skills/execution/)
│   │  Used in: greenfield, brownfield (and create-pr is independently invocable from quick-dev too)
│   │
│   ├── Skill: execute-increments           (one increment at a time)
│   │   ├── Step: 01-load-increment         (verify dependencies completed; confirm prerequisites)
│   │   ├── Step: 02-execute-plan           (TDD: no production code without a failing test)
│   │   ├── Step: 03-ai-gate                (Automated Verification — fresh evidence in current turn)
│   │   ├── Step: 04-human-gate             (Human Verification — wait for sign-off)
│   │   ├── Step: 05-success-criteria       (every binary criterion passes)
│   │   └── Step: 06-status-update          (flip increment-status; hand off to update-knowledge-base)
│   │
│   ├── Skill: manage-bugs                  (independently invocable across stages)
│   │   ├── Mode: log
│   │   ├── Mode: triage
│   │   ├── Mode: review
│   │   └── Mode: close
│   │
│   └── Skill: create-pr                    (independently invocable; runs after execute-increments
│       │                                    OR after quick-dev/execute-quick-change OR ad-hoc)
│       ├── Step: Diff review               (adversarial 4-lens on UNCOMMITTED diff:
│       │                                    blind / spec / standards / integration)
│       ├── Step: Fix cycle                 (Critical + Important findings fixed in working tree)
│       ├── Step: Commit creation           (atomic, conventional commit messages, INC/FR cited)
│       ├── Step: PR description            (composed from templates/compositions/pr-description.yaml)
│       │   └── Blocks (templates/blocks/execution/pr/):
│       │       ├── Block: summary
│       │       ├── Block: change-list
│       │       ├── Block: test-plan
│       │       ├── Block: traceability
│       │       ├── Block: breaking-changes (conditional)
│       │       └── Block: rollout-notes    (conditional)
│       ├── Step: PR creation               (only with explicit user approval)
│       └── Step: Changelog entry           (conditional, project-dependent)
│
│   └── Output: working code + verification evidence + atomic commits + PR (+ optional changelog)
│
├── Stage: Quick-Dev                        (.agents/skills/quick-dev/)
│   │  Used in: quick-dev flow (compresses requirements + design + planning + execution
│   │            into a 3-skill spine; create-pr is reused from the execution stage)
│   │
│   ├── Skill: document-quick-change
│   │   └── Output: <feature-id>-quick-dev-spec.md
│   │       (composed via templates/compositions/quick-dev-spec.yaml — small composition over the
│   │        SAME requirements blocks; no parallel template tree)
│   │
│   ├── Skill: plan-quick-change
│   │   ├── Step: 01-orient                 (codebase orientation against affected files)
│   │   ├── Step: 02-escape-hatch           (bail to full pipeline if scope creep:
│   │   │                                    >5–7 files, cross-module, new data model, new endpoint)
│   │   └── Step: 03-populate-shape         (REDUCED increment shape — Identity, Goal, Plan,
│   │                                        AC mapping, AI Gate, Human Gate, Success Criteria;
│   │                                        Dependencies + Outcome inlined into Goal/Plan)
│   │   └── Output: <feature-id>-quick-dev-plan.md (typically 1–3 increments)
│   │
│   └── Skill: execute-quick-change
│       ├── Step: 01-tdd-loop
│       ├── Step: 02-verify
│       └── Step: 03-adversarial-pr-review
│       └── Output: working code (handoff to create-pr if separate PR step is desired)
│
└── Stage: Meta                             (.agents/skills/meta/)
    │  Cross-cutting utilities — invoked from any flow at any time
    │
    ├── Skill: start-project                (interactive bootstrap — selects flow, writes project.toml)
    │
    ├── Skill: framework-navigator          (help router — natural-language goal/catalog mode)
    │   ├── Step: 01-detect-mode            (Goal mode vs Catalog mode)
    │   ├── Step: 02-state-probe            (project.toml + on-disk artifacts + KB presence)
    │   ├── Step: 03-match-or-render
    │   └── Step: 04-recommend              (single-skill recommendation + exact trigger phrase)
    │
    ├── Skill: customize-framework
    │   ├── Step: 01-pick-scope             (framework / framework.user / project / project.user / per-skill)
    │   ├── Step: 02-pick-target
    │   ├── Step: 03-pick-operation         (override / suppress / append)
    │   ├── Step: 04-author-override
    │   └── Step: 05-verify-merge
    │
    ├── Skill: shard-document               (split a large markdown file at H2 boundaries)
    ├── Skill: track-change                 (append a structured row to CHANGE-TRACKER.md)
    ├── Skill: scaffold-documentation       (structure-before-content scaffolder; also folded into each RE skill)
    └── Skill: verify-source                (source-of-truth verification; also folded into each RE skill)
```

## Per-Increment Detail (Canonical Increment Shape)

The 8-section Canonical Increment Shape is the load-bearing artifact of the planning stage. It is single-sourced as 8 blocks under `templates/blocks/planning/` and assembled by the implementation-package composition.

```text
Increment (INC-XXX)
├── Increment Section: Identity
│   ├── ID (INC-XXX)
│   ├── Name
│   └── FR Mapping (e.g. FR2.1, FR3.4) or "None (foundational)"
├── Increment Section: Goal                 (single, cohesive purpose — no "and also…")
├── Increment Section: Dependencies         (explicit by INC ID — no implicit ordering)
├── Increment Section: Plan
│   ├── Plan Step 1                         (imperative — "Create X", "Configure Y")
│   ├── Plan Step 2
│   └── Plan Step n
├── Increment Section: Outcome              (the system state that exists when this increment ships)
├── Increment Section: Automated Verification (AI Gate)
│   ├── Specific test command(s)
│   └── Expected results / assertions
├── Increment Section: Human Verification (Human Gate)
└── Increment Section: Success Criteria     (binary checkboxes — every one must pass)
```

The reduced shape used by quick-dev drops `Dependencies` and `Outcome`, inlining them into `Goal` and `Plan` when the change is genuinely small (1–3 increments).

## Cross-stage Support Artifacts

```text
Support documents (live alongside packages — not a stage, but cross-cutting state)
├── change-tracker.md                       (every stage appends; managed by meta/track-change)
├── bugs-and-issues-log.md                  (managed by execution/manage-bugs)
├── completeness-tracker.md                 (requirements package only)
├── increment-status.md                     (planning + execution; replaces legacy phase-status.md)
└── ADRs                                    (design + KB shared/adrs/ — append-only)
```

## Configuration & Customization

Four-layer TOML model with deep merge (later layers override earlier; per-skill overrides apply on top).

```text
Configuration
├── Layer 1: framework.toml                 (installer-managed defaults — shipped, committed)
├── Layer 2: framework.user.toml            (personal global — gitignored)
├── Layer 3: project.toml                   (project super-context — committed; declares flow,
│                                            paths, repos, glossary, decision-table answers)
├── Layer 4: project.user.toml              (personal project — gitignored)
└── Per-skill: config/customizations/<skill>.toml  (and .user.toml)

Authored interactively by meta/customize-framework — no hand-TOML editing required.
Suppression: any layer can use `_suppress: true` to remove (not just override) a base entry.
```

## Quick-Dev vs the Elaborate Flows

Quick-dev is **not** a fourth stage on top of greenfield/brownfield. It is a separate **flow** chosen at `start-project` time when the change is small enough that separate Requirements / Design / Planning / Execution stages are not warranted. It compresses those four into a 3-skill spine, uses a reduced increment shape, and consumes smaller compositions (`quick-dev-spec.yaml`) over the **same** block trunks — no parallel template tree.

## Vocabulary Quick-Reference

| Old (in `_archive/`) | New (in this map) |
|---|---|
| Phase (SDLC-level) | Stage |
| Phase (implementation chunk) | Increment |
| `PHASE-XXX` | `INC-XXX` |
| Canonical Phase Shape | Canonical Increment Shape |
| `phase-status.md` | `increment-status.md` |
| Solution-Design (stage + skill) | Design |
| Expedited Implementation Delivery | Quick-Dev (a flow) |
| Knowledge Repository | Knowledge Base |
| Activity (inside a Phase) | Step (inside a Skill) |
| Output → Section | Package → Block (via Composition) |
| Implementation Plan / Implementation Unit / Unit Section / Implementation Step | Implementation Package / Increment / Increment Section / Plan Step |
| Parent-coordinator "package" skills (req-package / solutions-package / impl-package) | YAML compositions in `templates/compositions/` |
