# AI SDLC Stage Map — A.I.D.E. (new)

This reference shows the **on-disk output structure** produced by A.I.D.E.'s stages. It is the direct successor to `ai-sdlc-stage-map-old.md` — same shape (a tree of artifacts), updated for the new vocabulary and the new flows. Skill-level mechanics (which skill produces what, which steps exist, which blocks compose which package) live in `stage-mapping-full.md`.

## Naming Model

```text
A.I.D.E. Output
└── Stage
    └── Package                             (stage output artifact, e.g. requirements-package, design-package, implementation-package)
        ├── Section                         (single file or section inside the assembled package — used by requirements, design, quick-dev)
        ├── Increment                       (planning + execution only — INC-XXX, one file per implementation chunk)
        │   ├── Increment Section           (one of the 8 Canonical Increment Shape sections)
        │   └── Plan Step                   (numbered imperative step inside the Plan section)
        └── Support document                (change-tracker, bugs-and-issues-log, completeness-tracker, status tracker)
```

Vocabulary parallels to the old map:

| Old | New |
|---|---|
| Stage | Stage |
| Phase (intermediate work directory) | Package subdirectory (`discovery/`, `analysis/`, etc.) |
| Activity (a file in a Phase directory) | Section file (a file in a package subdirectory) |
| Output → Section | Package → Section |
| Implementation Plan | Implementation Package |
| Implementation Unit | Increment (`INC-XXX`) |
| Unit Section | Increment Section |
| Implementation Step | Plan Step |

## Full Stage Map

```text
A.I.D.E. Output Stage Map
│
├── Stage 1: Reverse-Engineering           (brownfield only — runs before requirements)
│   └── Per-repo Output Bundle             (one bundle per repo, per analyze-repository classification)
│       │
│       ├── Part A — Internal Docs         (stays inside the source repo)
│       │   <source-repo>/docs/<repo-type>-internal/
│       │   ├── Section: project-structure-and-conventions
│       │   ├── Section: domain-models-and-business-rules
│       │   ├── Section: api-overview                     (api / api-framework)
│       │   ├── Section: layered-architecture
│       │   ├── Section: middleware-and-request-pipeline  (api / api-framework)
│       │   ├── Section: authentication-and-authorization-internals
│       │   ├── Section: error-handling-and-problem-details
│       │   ├── Section: database-and-orm
│       │   ├── Section: caching
│       │   ├── Section: background-jobs-and-async-processing
│       │   ├── Section: inter-service-communication
│       │   ├── Section: file-storage-and-external-integrations
│       │   ├── Section: observability-logging-metrics-tracing
│       │   ├── Section: testing
│       │   ├── Section: security-implementation
│       │   ├── Section: performance-patterns-and-constraints
│       │   ├── Section: build-deploy-and-runtime
│       │   ├── Section: feature-flags-and-toggles
│       │   ├── Section: anti-patterns
│       │   ├── Section: new-endpoint-feature-checklist  (api)
│       │   ├── Section: internal-types-and-shared-models
│       │   ├── Section: glossary
│       │   ├── Section: appendix-a-complete-feature-implementation-walkthrough
│       │   ├── Support: extraction-status.md
│       │   └── Support: CHANGE-TRACKER.md
│       │       (sections vary by repo type — api / api-framework / database / web-app /
│       │        ui-framework / mobile-app / mobile-framework; see
│       │        templates/blocks/reverse-eng/<domain>/internal/)
│       │
│       └── Part B — Consumer Docs         (deposited into the KB at source-docs/<repo-slug>/)
│           <KB>/source-docs/<repo-slug>/
│           ├── For api repos:
│           │   ├── openapi.yaml           (Part B1 — machine-readable contract)
│           │   └── api-consumer-guide.md  (Part B2 — narrative companion: quickstart, auth, pagination, errors)
│           ├── For database repos:
│           │   ├── data-dictionary.md     (Part B1)
│           │   ├── erd.md                 (Part B1 — entity-relationship diagram)
│           │   └── consumer-guide.md      (Part B2)
│           └── For api-framework / ui-framework / web-app / mobile-app / mobile-framework:
│               └── consumer-guide.md      (Part B — narrative; sections per
│                                            templates/blocks/reverse-eng/<domain>/consumer/)
│
├── Stage 2: Knowledge-Base                (brownfield only — runs after Reverse-Engineering)
│   └── KB Instance                        (one per project; lives in its OWN repo, not inside A.I.D.E.)
│       <project.paths.knowledge_base_path>/   (typically "../my-project-kb")
│       ├── Section: ARCHITECTURE.md       (root index — capability map; selective load entry point)
│       ├── Section: CLAUDE.md             (agent navigation instructions)
│       ├── Section: graph.json            (machine-readable component dep graph; depends_on / consumed_by)
│       ├── Section: glossary.md
│       ├── Support: change-tracker.md
│       │
│       ├── repos/<repo-slug>/             (one per [[project.repos]] entry)
│       │   ├── Section: README.md
│       │   └── Section: CLAUDE.md
│       │
│       ├── components/<repo-slug>/        (per-component leaves; one file per component)
│       │   └── Section: <component-id>.md (mandatory frontmatter: description, triggers, paths,
│       │                                   depends_on, consumed_by, data_entities,
│       │                                   last_verified_against_commit)
│       │
│       ├── shared/                        (cross-repo concerns — promoted when ≥2 components reference them)
│       │   ├── entities/<entity>.md
│       │   ├── cross-cutting/<concern>.md
│       │   ├── adrs/ADR-NNN.md            (architecture decisions; append-only)
│       │   └── integration-patterns/<pattern>.md
│       │
│       ├── synthesized/                   (preserved 10-folder layout from legacy aggregator)
│       │   ├── 01-architecture-overview/
│       │   ├── 02-capability-catalog/
│       │   ├── 03-component-catalog/
│       │   ├── 04-data-catalog/
│       │   ├── 05-integration-catalog/
│       │   ├── 06-dependency-map/
│       │   ├── 07-decision-records/
│       │   ├── 08-onboarding-guide/
│       │   ├── 09-operations-runbook/
│       │   └── 10-repository-maintenance/
│       │
│       └── source-docs/<repo-slug>/       (RE Part B docs land here — symlinks/pointers, not copies)
│
├── Stage 3: Requirements Specification    (greenfield + brownfield)
│   └── Requirements Package
│       docs/<feature>/requirements-package/
│       │
│       ├── discovery/                     (brownfield only — current-state baseline files)
│       │   ├── Section: change-description.md
│       │   ├── Section: current-capability-baseline.md
│       │   ├── Section: existing-artifact-review.md
│       │   └── Section: discovery-synthesis.md
│       │
│       ├── analysis/                      (analysis artifacts — produced by Step 03-analysis)
│       │   ├── Section: scope-analysis.md
│       │   ├── Section: stakeholder-mapping.md
│       │   ├── Section: dependency-analysis.md
│       │   ├── Section: impact-analysis.md
│       │   ├── Section: gap-analysis.md
│       │   ├── Section: assumption-decision-capture.md
│       │   └── Section: risk-analysis.md
│       │
│       └── requirements/                  (assembled output + per-section files)
│           ├── Package: <feature-id>-requirements.md   (the assembled package — single doc)
│           ├── Section: executive-summary-business-context.md
│           ├── Section: stakeholders-personas.md
│           ├── Section: business-objectives-success-criteria.md
│           ├── Section: user-journeys.md
│           ├── Section: views-dashboards.md
│           ├── Section: functional-requirements.md
│           ├── Section: functional-specifications.md
│           ├── Section: business-logic-rules.md
│           ├── Section: data-requirements.md
│           ├── Section: permissions-access-control.md
│           ├── Section: non-functional-requirements.md
│           ├── Section: assumptions-constraints-out-of-scope.md
│           ├── Section: acceptance-criteria.md
│           ├── Section: glossary.md
│           ├── Section: traceability-matrix.md
│           ├── Section: index.md
│           ├── Support: completeness-tracker.md
│           └── Support: change-tracker.md
│
├── Stage 4: Solution Design               (greenfield + brownfield)
│   └── Design Package
│       docs/<feature>/solutions-package/
│       │
│       ├── discovery/                     (brownfield only)
│       │   └── Section: architecture-baseline.md
│       │
│       ├── design/                        (assembled output + per-section files)
│       │   ├── Package: <feature-id>-design.md         (the assembled package — single doc)
│       │   ├── Section: solution-overview.md
│       │   ├── Section: technology-stack.md            (every framework / language / DB pinned)
│       │   ├── Section: solution-architecture.md       (C4 diagrams)
│       │   ├── Section: ux-design.md
│       │   ├── Section: frontend-design.md
│       │   ├── Section: backend-design.md
│       │   ├── Section: database-design.md
│       │   ├── Section: api-design.md                  (success + error contracts per endpoint)
│       │   ├── Section: integration-design.md
│       │   ├── Section: workflow-business-rules-design.md
│       │   ├── Section: dashboard-reporting-design.md
│       │   ├── Section: security-design.md
│       │   ├── Section: deployment-devops.md
│       │   ├── Section: observability-operations.md
│       │   ├── Section: testing-strategy.md
│       │   ├── Section: non-functional-requirements-technical.md
│       │   ├── Section: risk-assessment.md
│       │   ├── Section: glossary-acronyms.md
│       │   └── Support: change-tracker.md
│       │
│       └── adr/                           (one ADR per significant design decision —
│           ├── Section: ADR-001.md         routed to KB shared/adrs/ when KB exists)
│           └── Section: ADR-NNN.md
│
│   └── Alias: docs/<feature>/solutions-package/solution-package.md
│       (pass-through to <feature-id>-design.md)
│
├── Stage 5: Implementation Planning       (greenfield + brownfield)
│   └── Implementation Package
│       <project.paths.implementation_package>/
│       │
│       ├── Package: implementation-package.md          (overview — lists increments and dependencies)
│       │
│       ├── Increment: INC-001.md                       (one file per increment — Canonical Increment Shape)
│       │   ├── Increment Section: Increment Identity   (ID, name, FR Mapping)
│       │   ├── Increment Section: Goal
│       │   ├── Increment Section: Dependencies         (other INC IDs)
│       │   ├── Increment Section: Plan
│       │   │   ├── Plan Step 1                         (imperative — "Create X")
│       │   │   ├── Plan Step 2
│       │   │   └── Plan Step n
│       │   ├── Increment Section: Outcome
│       │   ├── Increment Section: Automated Verification (AI Gate)
│       │   │   ├── Test command(s)
│       │   │   └── Expected results / assertions
│       │   ├── Increment Section: Human Verification (Human Gate)
│       │   └── Increment Section: Success Criteria     (binary checkboxes)
│       │
│       ├── Increment: INC-002.md
│       ├── Increment: INC-NNN.md
│       │
│       ├── Support: increment-status.md                (states: not-started / in-progress / completed / blocked / on-hold)
│       ├── Support: bugs-and-issues-log.md             (initialised empty)
│       └── Support: change-tracker.md                  (initialised empty)
│
├── Stage 6: Implementation Delivery       (execution — turns the Implementation Package into shipped code)
│   └── Per-increment Output (repeats per INC-XXX)
│       │
│       ├── Codebase artifacts             (in the target repo's working tree)
│       │   ├── Working code               (filesystem — production source)
│       │   └── Test artifacts             (filesystem — unit / integration / component / E2E)
│       │
│       ├── Verification evidence          (chat — fresh from current turn; not persisted to disk)
│       │   ├── AI Gate evidence           (test runner output, build output, command results)
│       │   ├── Human Gate sign-off
│       │   └── Success Criteria check     (every binary criterion confirmed)
│       │
│       ├── Updates to the Implementation Package
│       │   <project.paths.implementation_package>/
│       │   ├── increment-status.md        (this increment's row flipped to `completed`)
│       │   └── bugs-and-issues-log.md     (entries written by manage-bugs as needed)
│       │
│       └── KB update                      (queued via update-knowledge-base handoff —
│                                            updates components, graph.json, ARCHITECTURE.md)
│
│   └── Per-package Output (after all increments complete — produced by create-pr)
│       │
│       ├── Atomic commits                 (conventional commit messages; each cites INC ID / FR)
│       ├── PR description                 (composed from templates/compositions/pr-description.yaml)
│       │   ├── Section: summary
│       │   ├── Section: change-list
│       │   ├── Section: test-plan
│       │   ├── Section: traceability
│       │   ├── Section: breaking-changes  (conditional)
│       │   └── Section: rollout-notes     (conditional)
│       ├── PR (URL)                       (created with explicit user approval)
│       └── Optional: changelog entry      (project-dependent)
│
└── Stage *: Quick-Dev                     (alternate flow — compresses Stages 3+4+5+6 into a 3-skill spine)
    └── Quick-Dev Package
        docs/<feature>/quick-dev-package/
        │
        ├── Package: <feature-id>-quick-dev-spec.md     (combined mini-requirements + mini-design)
        │   ├── Section: overview
        │   ├── Section: executive-summary-business-context  (the "Why")
        │   ├── Section: functional-requirements             (the "What" + delta)
        │   ├── Section: acceptance-criteria
        │   └── Section: glossary
        │
        ├── Package: <feature-id>-quick-dev-plan.md     (lightweight plan, typically 1–3 increments
        │   │                                            using the REDUCED Canonical Increment Shape:
        │   │                                            Dependencies + Outcome inlined into Goal/Plan)
        │   ├── Increment: INC-001
        │   │   ├── Increment Section: Identity (INC-XXX, name, AC mapping)
        │   │   ├── Increment Section: Goal
        │   │   ├── Increment Section: Plan
        │   │   │   ├── Plan Step 1
        │   │   │   ├── Plan Step 2
        │   │   │   └── Plan Step n
        │   │   ├── Increment Section: Automated Verification (AI Gate)
        │   │   ├── Increment Section: Human Verification (Human Gate)
        │   │   └── Increment Section: Success Criteria
        │   ├── Increment: INC-002 (optional)
        │   └── Increment: INC-003 (optional)
        │
        ├── Support: CHANGE-TRACKER.md
        │
        └── Then: codebase artifacts + commits + PR via the SAME Stage 6 outputs
            (execute-quick-change drives TDD + verification + adversarial PR review;
             create-pr produces the commits and PR; update-knowledge-base --scope=catalog-only
             keeps the KB catalog current)
```

## Quick-Dev

Quick-Dev is a fast-track route for small-to-medium changes. It is **not** a fourth stage layered on top of greenfield; it is a separate **flow** chosen at `start-project` time. It compresses Stages 3+4+5+6 into a single quick-dev package (combined spec + plan, 1–3 increments under a reduced increment shape) and reuses Stage 6's commit/PR/changelog outputs verbatim. When orientation reveals scope creep (>5–7 files, cross-module, new data model, new endpoint), the escape hatch redirects the user back to the full pipeline (Stage 3 → 4 → 5 → 6).
