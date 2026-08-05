# Solution-Context Gap Audit

**Stage 1 deliverable.** Maps every section produced by BMAD's
`document-project` and `generate-project-context` workflows against the current
A.I.D.E. RE → KB pipeline output, classifies each gap, and assigns each
remediation to one of the three new skills proposed for Stage 2.

The audit is the contract for Stages 2–3: anything classified `new-skill`
must end up in the new skill's outputs; anything classified `extend-existing`
must end up as a patch to an existing KB skill; anything classified `covered`
is intentionally NOT duplicated.

## Scope boundary (read first)

The new layer is **project-scoped, KB-resident, persistent across features**.
It is *not* a substitute for the requirements stage:

| Layer | Scope | Lifetime | Lives in |
|---|---|---|---|
| Solution context (NEW) | One project (whole solution) | Years; refreshed on major change | `<KB>/shared/solution-context/` |
| AI rules (NEW) | One project | Updated when stack/conventions change | `<KB>/shared/ai-rules/` |
| Operations (NEW) | One project | Updated on infra change | `<KB>/shared/operations/` |
| Requirements package | One feature | One feature lifecycle | `docs/<feature>/requirements-package/` |
| Reverse-engineering Part B | One repo | Re-extracted on drift | `<KB>/source-docs/<repo>/` |
| Components | One artifact | Updated per feature | `<KB>/components/<repo>/<id>.md` |

The requirements stage already has a brownfield discovery step (`steps/01-discovery.md`)
that produces `current-capability-baseline.md` — but that artifact is **feature-scoped**
(under `docs/<feature>/requirements-package/discovery/`). It does not produce
project-level context, and it is recomputed each feature. No overlap.

## Section-by-section gap matrix

### From BMAD `document-project` (`project-overview-template.md`)

| BMAD section | Existing coverage in A.I.D.E. | Gap | Assigned to |
|---|---|---|---|
| Executive Summary (mission, value prop) | None | full | `capture-solution-context` → `00-overview.md` |
| Project Classification (type, languages, arch pattern) | Partial — derivable from RE Part A `analyze-repository` output | full | `capture-solution-context` → `00-overview.md` (auto-fill from RE) |
| Multi-Part Structure (parts list, integration) | Partial — `[[project.repos]]` enumerates parts; ARCHITECTURE.md § 2 covers structure | partial | extend `build-knowledge-base/steps/06-emit-architecture-index.md` to add § 0 link to overview |
| Technology Stack Summary (table) | Yes — RE Part A captures this per-repo | covered | (skip) |
| Key Features (business capabilities) | Partial — Capability Index in ARCHITECTURE.md § 4 lists capabilities, but as triggers not as user-visible features | partial | `capture-solution-context` → `10-personas-and-use-cases.md` (links forward to Capability Index) |
| Architecture Highlights | Yes — ARCHITECTURE.md § 1–3 + RE Part A architecture sections | covered | (skip) |
| Development Overview (prerequisites, getting started, key commands) | Partial — RE Part A captures dev commands per-repo; no consolidated solution-level view | partial | `document-operations` → `00-deployment-topology.md` aggregates per-repo dev commands |
| Repository Structure | Yes — `repos/<repo>/README.md` + RE Part A source-tree sections | covered | (skip) |
| Documentation Map | Yes — root `CLAUDE.md` + ARCHITECTURE.md | covered | (skip) |

### From BMAD `document-project` (architecture/component/api templates)

| BMAD section | Existing coverage | Gap | Assigned to |
|---|---|---|---|
| `source-tree-analysis.md` (annotated tree) | Yes — RE Part A per-repo | covered | (skip) |
| `architecture.md` (deep arch) | Yes — RE Part A per-repo + ARCHITECTURE.md aggregate | covered | (skip) |
| `component-inventory.md` | Yes — `components/<repo>/<id>.md` leaves + graph.json | covered | (skip) |
| `api-contracts.md` (OpenAPI) | Yes — RE produces `<KB>/source-docs/<repo>/openapi.yaml` | covered | (skip) |
| `data-models.md` (ERD + dictionary) | Yes — RE database skill produces `data-dictionary.md` + `erd.mmd` | covered | (skip) |
| `development-guide.md` | Partial — fragmented across RE Part A | partial | `document-operations` → `00-deployment-topology.md` consolidates |
| `integration-architecture.md` (multi-part comm) | Partial — `shared/integration-patterns/` exists but is feature-led | partial | extend `build-knowledge-base/steps/04-shared-pass.md` to also seed solution-level integration if user-supplied |

### From BMAD `generate-project-context` (`project-context.md`)

| BMAD section | Existing coverage | Gap | Assigned to |
|---|---|---|---|
| Technology Stack & Versions (exact) | Yes — RE Part A captures exact versions | covered | (skip — `generate-ai-rules` reads from RE, doesn't re-derive) |
| Language-specific rules | None — no skill captures coding-style rules | full | `generate-ai-rules` → `project-context.md` § 2 |
| Framework rules (e.g., React hooks, API routes, middleware) | None | full | `generate-ai-rules` → `project-context.md` § 3 |
| Testing rules (structure, mocks, coverage) | None — RE captures *test patterns observed*; not *rules to follow* | full | `generate-ai-rules` → `project-context.md` § 4 |
| Development workflow rules (branch naming, commits, PR) | Partial — `_docs/` and root README mention some; nothing per-project | partial | `generate-ai-rules` → `project-context.md` § 5 |
| Error-handling patterns | Partial — RE describes patterns observed; no rule for new code | partial | `generate-ai-rules` → `project-context.md` § 6 |
| Import/export conventions | None | full | `generate-ai-rules` → `project-context.md` § 7 |

### Gaps not covered by either BMAD skill but valuable

| Topic | Existing coverage | Gap | Assigned to |
|---|---|---|---|
| Personas / users / use cases | None | full | `capture-solution-context` → `10-personas-and-use-cases.md` |
| Goals & KPIs (measurable business outcomes) | None | full | `capture-solution-context` → `20-goals-and-kpis.md` |
| Constraints & compliance (regulatory, contractual, NFR ceilings) | None | full | `capture-solution-context` → `30-constraints-and-compliance.md` |
| External integrations / vendor catalog (SaaS, third-party APIs) | Partial — RE captures *what code consumes*; not org-level vendor relationships | partial | `capture-solution-context` → `40-external-integrations.md` |
| Ownership / RACI / on-call | None | full | `capture-solution-context` → `50-ownership-and-raci.md` |
| Deployment topology (envs, regions, scaling shape) | Partial — per-repo CI/CD config; no aggregated topology | partial | `document-operations` → `00-deployment-topology.md` |
| Environments & secrets (env matrix, secret stores) | None | full | `document-operations` → `10-environments-and-secrets.md` |
| SLOs / monitoring / dashboards | None | full | `document-operations` → `20-slos-and-monitoring.md` |
| Runbooks / on-call / incident response | None | full | `document-operations` → `30-runbooks-and-oncall.md` |
| Glossary enrichment from interview | Partial — initialised from `project.toml.glossary`, never enriched | partial | `capture-solution-context` final step appends glossary delta |

## Summary of remediation by skill

**`capture-solution-context`** (interactive discovery; 6 outputs)
- `00-overview.md` — mission, value prop, classification, multi-part summary
- `10-personas-and-use-cases.md` — who uses it, key journeys
- `20-goals-and-kpis.md` — measurable outcomes, success metrics
- `30-constraints-and-compliance.md` — regulatory, contractual, NFR ceilings
- `40-external-integrations.md` — SaaS, vendors, third-party APIs at org level
- `50-ownership-and-raci.md` — teams, on-call, decision authority
- Side effect: glossary delta appended to `<KB>/glossary.md`

**`generate-ai-rules`** (auto-derive + interactive refine; 1 main output, 0–N overrides)
- `<KB>/shared/ai-rules/project-context.md` — sections 1–7 above
- Optional `<KB>/shared/ai-rules/per-repo/<repo-slug>.md` only when a repo's stack diverges enough that the project-level rules no longer fit. Skill detects divergence by comparing RE-derived tech-stack metadata across repos.

**`document-operations`** (read CI/CD + interactive fill; 4 outputs)
- `00-deployment-topology.md` — environments, regions, deploy targets
- `10-environments-and-secrets.md` — env matrix, secret stores, config layering
- `20-slos-and-monitoring.md` — SLOs, dashboards, alert routing
- `30-runbooks-and-oncall.md` — runbooks, escalation, on-call rotation

## Patches to existing skills (Stage 3 work, scoped here)

1. `build-knowledge-base/steps/02-scaffold-repos.md` — also scaffold `shared/{solution-context,ai-rules,operations}/` directories with stubs.
2. `build-knowledge-base/steps/06-emit-architecture-index.md` — add a `§ 0 Solution Overview` section header at top of `ARCHITECTURE.md` linking to the three new shared subtrees, so navigation lands on intent before structure.
3. `navigate-knowledge-base/SKILL.md` — extend trigger walk to `shared/{solution-context,ai-rules,operations}/`. New flag `--include-solution-context` (default `true`).
4. `detect-knowledge-base-drift` — new L4 layer entry: solution-context staleness; default threshold 90 days configurable via `[knowledge_base.solution_context_max_age_days]` in `project.toml`.
5. `verify-knowledge-base-coverage` — new warning: a repo joins `[[project.repos]]` but has no solution-context references touching it.

## Greenfield/brownfield placement (Stage 4)

| Flow | Insertion point | Rationale |
|---|---|---|
| `brownfield` | After `verify-knowledge-base-coverage`, before `create-requirements-package` | Solution context grounds the first feature's discovery |
| `greenfield` | After `start-project`, before `create-requirements-package` | Solution context informs the first requirements package; `generate-ai-rules` is empty until a stack is chosen so it stays optional in greenfield |
| `quick-dev` | Not inserted | Quick-dev assumes context is already captured; it is the wrong place to gather it |
| All flows | All three skills also added to the `anytime` list | A team can refresh solution context, AI rules, or operations docs at any time |

## Non-goals (explicitly NOT in this layer)

- Feature requirements — those live in the requirements package, per feature.
- Code-level patterns (architecture, components, data models) — already covered by RE.
- Decision history — ADRs already cover that under `<KB>/shared/adrs/`.
- Test strategy at the project level — could be added later but is not in scope here; `generate-ai-rules` covers *testing rules* (how to write a test), not *test strategy* (which test types to invest in).

## Acceptance check

Stage 1 is done when this audit exists, every BMAD section appears in exactly one of the matrices above, and every `full`/`partial` gap is assigned to one of the three new skills or one of the five existing-skill patches.
