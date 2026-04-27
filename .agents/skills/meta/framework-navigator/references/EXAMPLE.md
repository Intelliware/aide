# Worked Examples — framework-navigator

Two realistic transcripts showing both operating modes. Both examples assume
the navigator runs the state probe before responding.

---

## Example 1 — Goal mode

### User says

> "I want a quick change to this project — what's my best option?"

### State probe finds

- `project.toml` exists with `[project].default_flow = "quick-dev"` and
  `[project].name = "checkout-fixups"`.
- `[project.paths].knowledge_base_path = "../knowledge-base"` (resolves to a
  KB folder containing `ARCHITECTURE.md`, `components/`, `graph.json`).
- Stage artifacts on disk: **no** `requirements_package/`, **no** `design_package/`,
  **no** `implementation_package/`, **no** `quick-change-spec.md`.
- One quick-dev increment closed two months ago (per
  `_meta/change-log.md` in the KB).

### Match step

The utterance keyword "quick change" + project flow `quick-dev` + the absence
of any active spec on disk converges on the **first** quick-dev skill.
Candidates from the catalog:

| Skill | Score | Why |
|---|---|---|
| `document-quick-change` | 0.92 | Direct keyword hit ("quick change", "small change", "fast-track this"); project flow matches; no spec yet on disk so this is the entry point. |
| `plan-quick-change` | 0.40 | Would only score higher if a spec already existed. |
| `execute-quick-change` | 0.20 | Requires a plan. Skipped. |
| `start-project` | 0.10 | `project.toml` already present — skipped. |

No disambiguation needed (top score >0.5 ahead of #2).

### Navigator output

> Detected: this project is configured for the **quick-dev flow** (per
> `project.toml`) and there is no active quick-change spec on disk. The KB at
> `../knowledge-base` is populated, so any new spec can ground itself in the
> existing components.
>
> **Recommended skill:** `document-quick-change` — first of the three
> quick-dev skills. It captures one combined lightweight spec (mini-requirements +
> mini-design) per `templates/compositions/quick-dev-spec.yaml`.
>
> **Trigger phrase to paste back:**
>
> > *"Document a quick change for `<scope of the change in 1 sentence>`."*
>
> **Position in workflow:** quick-dev stage, step 1 of 3. After this skill
> finishes you would run `plan-quick-change`, then `execute-quick-change`
> (which closes by handing off to `update-knowledge-base --scope=catalog-only`).
>
> No prerequisites. Ready to run.

---

## Example 2 — Catalog mode

### User says

> "Show me what's here."

### State probe finds

- `project.toml` exists with `[project].default_flow = "brownfield"`.
- `knowledge_base_path = "../knowledge-base"` — KB folder exists, **empty**
  (no `ARCHITECTURE.md`).
- No stage artifacts on disk yet.
- One repo entry in `[[project.repos]]` with `role = "api"`.

The navigator does not need disambiguation; catalog mode just renders the
catalog. But the state probe lets the navigator add a contextual footer.

### Navigator output (excerpt — truncated for brevity)

> ## Catalog
>
> | Stage | Skill | Description | When to use this |
> |---|---|---|---|
> | meta | `start-project` | Single entry point that elicits flow choice, captures project super-context, writes `project.toml`, and hands off to the first skill of the chosen flow. | First time you invoke A.I.D.E. on a repository. |
> | meta | `framework-navigator` | This skill — routes to the right skill based on workspace state and goal description. | When you don't know which skill to run. |
> | meta | `customize-framework` | Walks the user through writing overrides without hand-TOML editing. | When you want to change a default, suppress an artifact, or pin an elicitation answer. |
> | meta | `track-change` | Logs the change in CHANGE-TRACKER.md with Parts Affected and verification status. | After finishing any tracked change. |
> | meta | `verify-source` | Generic content-vs-source verifier. | Before declaring any package done. |
> | meta | `scaffold-documentation` | Cross-stage utility — enforces "structure before content". | After discovery, before content writing. |
> | meta | `shard-document` | Splits a single .md at H2 boundaries. | When a document grows too large to navigate. |
> | requirements | `create-requirements-package` | Drives the full requirements stage end-to-end. | When starting a new feature. |
> | requirements | `review-requirements-package` | Validates an assembled requirements package. | Before architect handoff. |
> | design | `create-design-package` | Drives the full design stage. | After requirements review passes. |
> | design | `review-design-package` | Validates an assembled design package. | Before implementation planning. |
> | planning | `create-implementation-package` | Decomposes design into INC-XXX increments. | After design review passes. |
> | planning | `review-implementation-package` | Validates increment readiness. | Before execution starts. |
> | execution | `execute-increments` | TDD loop with AI gate, human gate, increment-status updates. | After implementation review passes. |
> | execution | `manage-bugs` | Operates on bugs-and-issues-log.md. | Anytime during or independent of execution. |
> | execution | `create-pr` | Atomic conventional commits + PR description. | When ready to merge. |
> | reverse-engineering | `analyze-repository` | Diagnostic step — picks which RE skill to run. | When you have code but don't know its type. |
> | reverse-engineering | `reverse-engineer-api` | Documents an API repository → Part A + Part B1 (OpenAPI) + Part B2. | After analyze-repository classifies a repo as `api`. |
> | reverse-engineering | `reverse-engineer-api-framework` | Documents a backend framework. | For server-side libraries / middleware / reusable backend components. |
> | reverse-engineering | `reverse-engineer-database` | Documents a database. | For schemas, sprocs, triggers, views. |
> | reverse-engineering | `reverse-engineer-mobile-app` | Documents a mobile application. | For Android/iOS/React-Native apps. |
> | reverse-engineering | `reverse-engineer-mobile-framework` | Documents a mobile framework/library. | For mobile SDKs (AAR, pod, SPM). |
> | reverse-engineering | `reverse-engineer-ui-framework` | Documents a UI framework. | For component libraries / design systems. |
> | reverse-engineering | `reverse-engineer-web-app` | Documents a web app / SPA. | For React/Angular/Vue/Svelte apps. |
> | knowledge-base | `build-knowledge-base` | Builds the KB structure (ARCHITECTURE.md + components/ + graph.json). | First-time KB scaffold after RE outputs land. |
> | knowledge-base | `verify-knowledge-base-coverage` | Coverage sweep — emits orphan + stale + warning reports. | After build, and on schedule. |
> | knowledge-base | `navigate-knowledge-base` | Returns the ranked component file list for a stage to load. | Before any stage skill that needs KB grounding. |
> | knowledge-base | `update-knowledge-base` | Incremental update after a feature ships. | As the closing step of execute-increments / execute-quick-change. |
> | knowledge-base | `detect-knowledge-base-drift` | Layered drift detection. | PR-gate or weekly cron sweep. |
> | quick-dev | `document-quick-change` | Lightweight combined spec. | For small changes that don't warrant full requirements + design. |
> | quick-dev | `plan-quick-change` | 1–3 increments using the reduced shape. | After the quick spec is agreed. |
> | quick-dev | `execute-quick-change` | TDD + adversarial review + atomic commits + KB catalog-only update. | After the quick plan exists. |
>
> ### Flow sequences
>
> **greenfield:** `start-project` → `create-requirements-package` ⟶ gate `review-requirements-package` → `create-design-package` ⟶ gate `review-design-package` → `create-implementation-package` ⟶ gate `review-implementation-package` → `execute-increments` (closes each increment with `update-knowledge-base`) → `create-pr`.
>
> **brownfield:** `start-project` → `analyze-repository` → `reverse-engineer-<dynamic>` (one of the seven RE skills, picked at runtime by analyze-repository) → `build-knowledge-base` → `verify-knowledge-base-coverage` → `create-requirements-package` ⟶ gate `review-requirements-package` → `create-design-package` ⟶ gate `review-design-package` → `create-implementation-package` ⟶ gate `review-implementation-package` → `execute-increments` (closes each increment with `update-knowledge-base`) → `create-pr`.
>
> **quick-dev:** `start-project` → `document-quick-change` → `plan-quick-change` → `execute-quick-change` (closes with `update-knowledge-base --scope=catalog-only`) → `create-pr`.
>
> ### Anytime skills
>
> `framework-navigator`, `customize-framework`, `shard-document`, `track-change`, `verify-source`, `manage-bugs`, `navigate-knowledge-base`, `detect-knowledge-base-drift`.
>
> ### Context (from the state probe)
>
> Your project is configured for the **brownfield** flow. The KB at
> `../knowledge-base` is empty, so the natural next step is `analyze-repository`
> against your `api` repo, then a domain RE skill, then `build-knowledge-base`.
>
> Run `framework-navigator` with a specific goal (e.g. "I want to RE this API
> into the KB") to get a personalized recommendation.
