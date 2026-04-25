# Templates

Block-and-composition template library. Replaces the old per-folder template files with one trunk plus reusable blocks.

## `blocks/`

Reusable section blocks. Each block is a markdown file with YAML frontmatter (`slug`, `applies-to`, `requires-decision-from`, `optional`). Subdirectories group blocks by stage:

- `requirements/` — section blocks for requirements packages (FRs, personas, journeys, NFRs, …)
- `design/` — section blocks for solution design (architecture, API, DB, security, …)
- `planning/` — the canonical increment shape (8 mandatory blocks)
- `reverse-eng/` — RE-specific blocks (per-domain Part A internal + Part B consumer)
- `knowledge-base/` — KB blocks (architecture-index, repo-summary, component, shared-entity, ADR)
- `shared/` — cross-stage blocks (overview, glossary, change-log, traceability)

## `compositions/`

YAML manifests that pick blocks per artifact. One composition per intended output:

- `greenfield-requirements-package.yaml`
- `greenfield-design-package.yaml`
- `greenfield-implementation-package.yaml`
- `brownfield-enhancement-spec.yaml`
- `quick-dev-spec.yaml`
- `re-api-internal.yaml`, `re-api-consumer.yaml`, `re-web-app.yaml`, …

Quick-dev compositions select fewer blocks from the same trunk — no parallel template trees.
