# Meta skills

Cross-cutting orchestrators and utilities not tied to any one stage.

## Skills
- `start-project/` (NEW — task #7) — entry point: elicits flow + inputs, writes `project.toml`, hands off to first stage skill
- `customize-framework/` (NEW — task #7) — writes per-skill overrides under `config/customizations/` without hand-TOML
- `framework-navigator/` (LIFTED + UPGRADED — task #12) — natural-language help router with goal mode and catalog mode; consumes `skills/_registry/`
- `track-change/` (LIFTED — task #6) — universal change-log tracking
- `shard-document/` (LIFTED, renamed from `document-sharding` — task #6) — split large markdown artifacts
- `verify-source/` (NEW, generic version of `verify-extraction` — task #6) — verify content against cited sources for any package type
- `scaffold-documentation/` (LIFTED, promoted from RE-internal — task #6) — create document skeletons before content extraction
