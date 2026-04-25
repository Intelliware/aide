# Reverse-engineering stage

Skills for documenting existing repositories. Seven domain skills plus a thin dispatcher.

## Produces
Per repo, a Part A (internal implementation docs) and Part B (consumer-facing docs) artifact set under the user's KB repo's `source-docs/<repo-slug>/`. The KB index aggregator (`skills/knowledge-base/build-knowledge-base/`) consumes these.

## Consumes
- Source repository path (elicited from user)
- Repo type identification (api / api-framework / web-app / ui-framework / database / mobile-app / mobile-framework — the dispatcher routes)

## Skills (populated in task #6)
- `analyze-repository/` — thin dispatcher: detects repo type, recommends a domain skill
- `reverse-engineer-api/`
- `reverse-engineer-api-framework/`
- `reverse-engineer-web-app/`
- `reverse-engineer-ui-framework/`
- `reverse-engineer-database/`
- `reverse-engineer-mobile-app/`
- `reverse-engineer-mobile-framework/`

Internal section headers within each skill use "Stage 1/2/…" (renamed from "Phase 1/2/…" to avoid colliding with the new outer "stage" vocabulary).
