# Inputs and Outputs — reverse-engineer-test-suite

## Inputs

| Name | Required? | Source | Purpose |
|---|---|---|---|
| Path to the test-suite repository | yes | filesystem (typically a sibling workspace folder) | The repo to extract from |
| Source version | yes | Caller / git | The commit / branch / tag being documented; recorded in every Part A/B frontmatter |
| Test-suite ID | yes | Caller (or derived from repo name) | Short slug used in Part B paths under `{paths.knowledge_base_path}/components/<test-suite-id>/` |
| Application repo(s) the suite tests against | yes (at least one) | Caller | Recorded in Part B as `tests` frontmatter; the KB graph uses this to link suite components to application components via `consumed_by` |
| `{paths.knowledge_base_path}` | yes | `project.toml` `[project.paths]` | Where Part B is written |
| Existing suite documentation | optional | Repo or hand-off | Folded in; never trusted without verification (comments lie, code doesn't) |
| Runbooks / CI configs | optional | Repo or hand-off | Source of truth for the CI surface and environment matrix sections |

## Outputs

| Artifact | Destination | Format | Notes |
|---|---|---|---|
| Part A — internal docs | Test-suite repo (`docs/INTERNAL.md` or per-team convention) | Markdown | Stays with the team that owns the suite; never committed to the KB |
| Part B — runner component | `{paths.knowledge_base_path}/components/<test-suite-id>/runner.md` | Markdown with `kind: test-suite, subkind: runner` frontmatter | Build tool, framework, runner class / entry point, profile names, parallelism config |
| Part B — shared-utilities catalogue | `{paths.knowledge_base_path}/components/<test-suite-id>/shared-utilities.md` | Markdown with `kind: test-suite, subkind: shared-utilities` frontmatter | One row per utility (producer / consumer / async helper / page object / assertion helper / data builder) with signature + interaction-type tag |
| Part B — fixtures catalogue | `{paths.knowledge_base_path}/components/<test-suite-id>/fixtures.md` | Markdown with `kind: test-suite, subkind: fixtures` frontmatter | Fixture inventory with shape (not values) + refresh procedure |
| Part B — marker vocabulary | `{paths.knowledge_base_path}/components/<test-suite-id>/marker-vocabulary.md` | Markdown with `kind: test-suite, subkind: marker-vocabulary` frontmatter | The tag / marker / spec-naming scheme + mapping to AC / FR / NFR / INC IDs |
| Part B — feature inventory | `{paths.knowledge_base_path}/components/<test-suite-id>/feature-inventory.md` | Markdown with `kind: test-suite, subkind: feature-inventory` frontmatter | One row per spec / feature file: path, scope, markers, traceability |
| Part B — environment matrix | `{paths.knowledge_base_path}/components/<test-suite-id>/environment-matrix.md` | Markdown with `kind: test-suite, subkind: environment-matrix` frontmatter | What each environment provides, secret-handling pattern |
| Part B — CI surface | `{paths.knowledge_base_path}/components/<test-suite-id>/ci-surface.md` | Markdown with `kind: test-suite, subkind: ci-surface` frontmatter | Triggers, gates, reporting paths (same paths pinned in consuming quality packages) |
| Part B — ownership & known gaps | `{paths.knowledge_base_path}/components/<test-suite-id>/ownership.md` | Markdown with `kind: test-suite, subkind: ownership` frontmatter | Team, on-call, escalation, known anti-patterns, accepted tech debt |
| Change-tracker entries | per `track-change` skill | Markdown | One entry per Part B component written, plus one for Part A |

## Frontmatter contract for Part B

Every Part B file MUST include:

```yaml
---
kind: test-suite
subkind: <runner | shared-utilities | fixtures | marker-vocabulary | feature-inventory | environment-matrix | ci-surface | ownership>
test_suite_id: <slug>
source_repo: <repo path or URL>
source_version: <commit / branch / tag>
last_verified_against_commit: <sha>
tests: [<application-component-id-1>, <application-component-id-2>, ...]
triggers: [<keyword-1>, <keyword-2>, ...]
---
```

- `kind: test-suite` is what `navigate-knowledge-base --profile=test-suite` filters on.
- `subkind` lets downstream skills request specific component flavours (e.g. `review-test-failures` may want `shared-utilities` only for locator lookup).
- `tests` populates the KB graph's `tests` edge type so an application component can find every suite component that exercises it.
- `triggers` feeds the capability index used by `navigate-knowledge-base`.

## Side effects

- Writes Part A to the test-suite repo (one file per the team's
  convention — `docs/INTERNAL.md` by default).
- Writes Part B components to the KB at the paths above.
- Appends change-tracker entries via `track-change`.
- Does **not** modify the test-suite source code.
- Does **not** rebuild the KB (no graph regeneration, no capability-index
  rewrite). Hand off to `build-knowledge-base` or `update-knowledge-base`
  for that.

## Customisation hooks

- `config/customizations/reverse-engineer-test-suite.toml` may override:
  - The Part A destination filename (default `docs/INTERNAL.md`)
  - The Part B sub-component split (default 8 files as listed above; teams may collapse to fewer if their suite is small, or split further if it is large)
  - The interaction-type tag vocabulary used in `shared-utilities.md` (default `[CLICK] [INPUT] [SELECT] [WAIT] [ASSERT] [NAVIGATE] [TABLE] [UPLOAD] [DOWNLOAD] [API] [AUTH] [DATA] [SCREENSHOT] [NETWORK]` — overridable per team)
- The framework / runner / build tool are **detected**, never assumed.
- The marker vocabulary is **read from the suite**, never imposed.


