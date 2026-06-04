# build-knowledge-base — Synthesized 10-Folder Structure

The legacy aggregator (`reverse-engineering/phases/build-knowledge-repository-phase.md`)
defined 10 top-level folders for synthesised cross-cutting documentation:

```
01-architecture-overview/
02-service-api-catalog/
03-framework-library-catalog/
04-application-catalog/
05-data-dictionary-aggregated/
06-cross-cutting-concerns/
07-dependency-map/
08-architecture-decision-records/
09-onboarding-guide/
10-repository-maintenance/
```

The new schema-driven KB makes most of this redundant — `ARCHITECTURE.md`
subsumes 01/02/03/04/07, the per-component frontmatter subsumes 02/03/04,
`shared/entities/` subsumes 05, `shared/cross-cutting/` subsumes 06,
`shared/adrs/` subsumes 08, and `repos/<slug>/NAVIGATE.md` plus the root
`NAVIGATE.md` subsume 09 (legacy KBs may carry these as `CLAUDE.md` —
readers fall back automatically).

We preserve the 10-folder layout under `synthesized/` for two reasons:

1. **Tooling continuity.** Build scripts, CI checks, and external link
   targets that point at the legacy paths keep working.
2. **Onboarding ergonomics.** Humans who learned the legacy structure can
   still find content where they expect it.

## Mapping

| Legacy folder | New canonical home | What `synthesized/<n>/` contains |
|---|---|---|
| `01-architecture-overview/` | `ARCHITECTURE.md` (§ 1, 2, 5) | One pointer file `README.md` linking to `ARCHITECTURE.md` and `graph.json`. |
| `02-service-api-catalog/` | `ARCHITECTURE.md` § 3 (filtered to `type: api-feature`) | One `README.md` whose body is a filtered view of the Component Catalog limited to API components. |
| `03-framework-library-catalog/` | `ARCHITECTURE.md` § 3 (filtered to `type: framework` and `type: shared-library`) | Filtered-view `README.md`. |
| `04-application-catalog/` | `ARCHITECTURE.md` § 3 (filtered to `type: ui-feature` and `type: mobile-feature`) | Filtered-view `README.md`. |
| `05-data-dictionary-aggregated/` | `shared/entities/` | `README.md` listing every shared entity with one-line summaries; links to `shared/entities/<id>.md`. |
| `06-cross-cutting-concerns/` | `shared/cross-cutting/` and `ARCHITECTURE.md` § 6 | `README.md` indexing the pointer pages under `shared/cross-cutting/`. |
| `07-dependency-map/` | `graph.json` and `ARCHITECTURE.md` § 5 | `README.md` explaining how to query `graph.json` (jq snippets), pointing at the rendered Mermaid diagram. |
| `08-architecture-decision-records/` | `shared/adrs/` | `README.md` listing all ADRs by number and status; ADR files themselves live under `shared/adrs/`. |
| `09-onboarding-guide/` | Root `NAVIGATE.md` and per-repo `NAVIGATE.md` (legacy KBs: `CLAUDE.md`) | `README.md` for human readers; the agent-facing instructions live in `NAVIGATE.md` (legacy: `CLAUDE.md`). |
| `10-repository-maintenance/` | This skill's documentation, plus `change-tracker.md` | `README.md` describing the maintenance hooks (`update-knowledge-base`, `detect-knowledge-base-drift`, `verify-knowledge-base-coverage`). |

## Authoring rules

- The `synthesized/` folders contain **only** filtered views and pointers
  — never original content. Any synthesized file that grows substantive
  text is a smell; the content belongs in the canonical home and the
  synthesized file should link to it.
- Filtered views in `02–04` are regenerated whenever the Component
  Catalog changes. `update-knowledge-base` re-renders them.
- The legacy aggregator described an 8-step "phase-by-phase assembly
  process" (KNOWLEDGE-001 through KNOWLEDGE-009). That process is not
  preserved — it is fully superseded by the 8 steps under `steps/` of
  this skill, which are schema-driven rather than phase-driven.
