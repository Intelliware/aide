# theframework — Skills Test Plan

**Owner:** mike.moerman@electricmind.com
**Authored:** 2026-04-26
**Scope:** End-to-end manual exercise of every skill shipped under `.agents/skills/` (32 skills, 8 stages). Anchored on Next.js as the framework being reverse-engineered into the central knowledge base.

## 1. Goals

1. Verify each of the 32 framework skills behaves per its `SKILL.md` description on a realistic input.
2. Validate the agentskills.io frontmatter, `references/` progressive-disclosure pattern, and `steps/` decomposition.
3. Exercise all three flows (greenfield, brownfield, quick-dev) end-to-end.
4. Build a usable Next.js-anchored knowledge base from open-source repos that span all 7 reverse-engineering domains.
5. Surface defects (missing files, broken cross-refs, ambiguous handoffs, schema mismatches) with reproducible repro steps.

## 2. Non-goals

- Performance / latency benchmarking of the host (Cursor / Copilot).
- Re-deriving the framework's design — we test the shipped artifacts as-is.
- Testing every elicitation branch of every skill — we exercise the **golden path** plus one edge case per skill.

## 3. Test environment

| Item | Value |
|---|---|
| Framework repo | `~/Dev/theframework` (this repo, `main` branch) |
| Test sandbox root | `~/Dev/framework-tests/` (created during Phase A) |
| Greenfield sandbox project | `~/Dev/framework-tests/recipes-app/` |
| Knowledge-base repo | `~/Dev/framework-tests/recipes-kb/` (sibling repo, separate from the sandbox app) |
| Brownfield clone root | `~/Dev/framework-tests/oss-clones/` |
| Host under test | Whatever Mike has open (Claude Code session, Cursor, or VSCode + Copilot — record per phase) |
| Python | system `python3` (for `scripts/build-registry.py` and `scripts/validate.py`) |

> **Sandbox layout invariant:** the framework folder, the application folder, and the KB folder are always **three sibling folders** in one multi-root workspace. We mirror that layout in `framework-tests/` so paths in `project.toml` resolve normally.

## 4. Reverse-engineering candidate repos (Next.js-anchored)

Selected to exercise all 7 domain RE skills with small-to-medium open-source codebases that share the Next.js / React ecosystem so the resulting KB is internally coherent.

| # | Domain | Skill | Candidate repo | Why |
|---|---|---|---|---|
| 1 | api | `reverse-engineer-api` | `gothinkster/node-express-realworld-example-app` | Small REST API with auth + CRUD. Standard reference. Optional alt: a Next.js `app/api/*` slice from candidate #3. |
| 2 | api-framework | `reverse-engineer-api-framework` | `honojs/hono` | Modern, compact JS API framework. Pairs naturally with Next.js Edge runtime. |
| 3 | web-app | `reverse-engineer-web-app` | `vercel/commerce` | Canonical Next.js (App Router) example. Well-known, manageable size. |
| 4 | ui-framework | `reverse-engineer-ui-framework` | `shadcn-ui/ui` | The dominant Next.js component library. Tests `peerDependencies` classification path. |
| 5 | database | `reverse-engineer-database` | `documenso/documenso` (Prisma schema only) | Real Prisma schema with migrations; we point the skill at `packages/prisma/`. |
| 6 | mobile-app | `reverse-engineer-mobile-app` | `bluesky-social/social-app` | Active React Native + Expo app. |
| 7 | mobile-framework | `reverse-engineer-mobile-framework` | `nativewind/nativewind` | Small RN library with `peerDependencies` — exercises framework-vs-app distinction. |

Mirror choices (used only if a primary candidate is unavailable / too large): `nestjs/nest` (api-framework), `makeplane/plane` (web-app), `mantinedev/mantine` (ui-framework), `expo/expo` (mobile-framework).

Clones live under `~/Dev/framework-tests/oss-clones/<repo>`. We **shallow-clone** (`--depth 1`) to minimize disk and network use.

## 5. Forward-engineering scenario

A small, realistic Next.js app, designed so requirements / design / planning / execution all have nontrivial content but the project finishes inside one sitting:

> **The Recipes app.** A single-user Next.js 15 (App Router) recipe manager backed by Prisma + SQLite. Authenticated user can: create recipes, list and search recipes, mark favorites, attach a photo URL, tag recipes, view a public read-only share link. No real users, no production deploy.

We pick this scenario because:
- Three FRs minimum, one NFR (auth), one cross-cutting concern (photo URLs as external content).
- Forces a real data model (recipes, tags, favorites) — exercises design and planning.
- Decomposes naturally into 3–4 increments — exercises `execute-increments` and `manage-bugs`.
- Small enough to build but large enough that the KB has real content to update.

## 6. Quick-dev scenario

After Phase D ships the Recipes app, we add **"Add a `cookTime` field to recipes and surface it on the list view"** as the quick-dev change. Single migration, single component edit, single test — exactly the size `document-quick-change` is designed for.

## 7. Test-step format

Every step below uses this header:

```
### <Phase>.<N>  <skill-name>  —  <one-line intent>
**Trigger phrase:** the exact natural-language phrase to fire the skill in-host.
**Inputs:** what's on disk / in context before the skill runs.
**Expected outputs:** files / artifacts / handoff messages we should see.
**Pass criteria:** bulleted checklist Mike marks Pass / Fail / Partial.
**Rollback:** how to undo what the step wrote (so steps stay independent).
```

We pause for Mike's verdict at the end of each step.

---

## Phase A — Static integrity (no skill invocations)

### A.1  Registry build  —  regenerate skills.csv + skills.json
**Trigger:** `python3 scripts/build-registry.py`
**Inputs:** Current `.agents/skills/**/SKILL.md` frontmatter.
**Expected outputs:** `.agents/skills/_registry/skills.csv` and `skills.json` written; 32 rows; exit code 0; no warnings about missing frontmatter.
**Pass criteria:**
- [ ] Exit code 0
- [ ] CSV contains 32 data rows
- [ ] Diff vs the committed CSV is empty (or only the rebuild-timestamp line)
**Rollback:** `git checkout -- .agents/skills/_registry/`.

### A.2  Validator  —  cross-references + workflow graph
**Trigger:** `python3 scripts/validate.py`
**Inputs:** Registry, `workflow-graph.yaml`, all SKILL.md frontmatter, all `templates/compositions/*.yaml`.
**Expected outputs:** `OK` summary; every flow skill resolves; every gate resolves; no orphaned compositions; no stale "phase" terminology.
**Pass criteria:**
- [ ] Exit code 0
- [ ] No "stale terminology" findings
- [ ] No unresolved skill references in workflow-graph
**Rollback:** none — read-only.

### A.3  Self-documenting standard  —  every skill has the trio
**Inputs:** `.agents/skills/<stage>/<skill>/references/{OVERVIEW,INPUTS-OUTPUTS,EXAMPLE}.md`
**Expected outputs:** all three files present for every skill except where the SKILL.md explicitly notes otherwise.
**Pass criteria:**
- [ ] Spot-check 4 skills (1 from meta, 1 from RE, 1 from KB, 1 from quick-dev) — trio present
- [ ] SKILL.md ≤ 200 lines (sample 4 same as above)
**Rollback:** none — read-only.

### A.4  Composition manifests resolve to existing blocks
**Trigger:** the validator already covers this; this step re-confirms by hand on one composition.
**Inputs:** `templates/compositions/greenfield-requirements-package.yaml`
**Expected outputs:** every block referenced exists under `templates/blocks/requirements/`.
**Pass criteria:**
- [ ] All listed blocks resolve to a real file
**Rollback:** none.

---

## Phase B — Meta skills (`/start-project`, `/framework-navigator`, `/customize-framework`, `/scaffold-documentation`, `/shard-document`, `/track-change`, `/verify-source`)

Sandbox prep (one-time before B.1):
```
mkdir -p ~/Dev/framework-tests/recipes-app
cd       ~/Dev/framework-tests/recipes-app
git init -q
```

### B.1  start-project  —  greenfield bootstrap
**Trigger phrase:** "I want to start the framework on a new greenfield project here."
**Inputs:** Empty `~/Dev/framework-tests/recipes-app/`.
**Expected outputs:**
- `project.toml` written, with `[project] name`, `code`, `domain`, `[project.paths] knowledge_base_path = "../recipes-kb"`.
- `default_flow = "greenfield"`.
- Handoff message names `create-requirements-package` as the next skill.
**Pass criteria:**
- [ ] `project.toml` parses with `python3 -c "import tomllib; tomllib.loads(open('project.toml').read())"`
- [ ] All 6 elicitation phases ran one at a time (not bundled)
- [ ] Handoff phrase is unambiguous
**Rollback:** `rm project.toml project.user.toml 2>/dev/null`.

### B.2  framework-navigator  —  goal mode
**Trigger phrase:** "I have a Next.js app I'd like to reverse-engineer into the KB. What should I run?"
**Inputs:** No `project.toml` in CWD (run from `~/Dev/framework-tests/`).
**Expected outputs:** Recommendation = `start-project` (because no `project.toml` yet) or, if invoked from `recipes-app/` after B.1, `analyze-repository`.
**Pass criteria:**
- [ ] Recommendation is a single named skill
- [ ] Trigger phrase to invoke it is provided verbatim
- [ ] No work is performed by the navigator itself
**Rollback:** none.

### B.3  framework-navigator  —  catalog mode
**Trigger phrase:** "Show me all the skills."
**Expected outputs:** Stage-grouped list of all 32 skills with one-line descriptions.
**Pass criteria:**
- [ ] All 8 stages represented
- [ ] All 32 skills listed
**Rollback:** none.

### B.4  customize-framework  —  scalar override
**Trigger phrase:** "For this project I want `default_flow` to be `brownfield`."
**Inputs:** `project.toml` from B.1.
**Expected outputs:** edit applied via the customize-framework workflow (not a hand-edit by the user) into the right config layer (`project.toml`).
**Pass criteria:**
- [ ] Skill identifies the right config layer (`project.toml`, not `framework.user.toml`)
- [ ] Override visible in the file
- [ ] No unrelated lines touched (the override line itself may also gain the SKILL.md-mandated inline rationale comment — that is part of the override, not collateral damage; per F-003 fix)
**Rollback:** flip the value back manually.

### B.5  scaffold-documentation  —  set up RE doc skeleton
**Trigger phrase:** "Scaffold the docs structure for a brownfield reverse-engineering of `vercel/commerce`."
**Inputs:** `project.toml` (B.4 state).
**Expected outputs:** Empty doc tree under `docs/reverse-engineering/vercel-commerce/` with placeholders matching the RE composition.
**Pass criteria:**
- [ ] Folder tree matches the composition
- [ ] No content authored yet (structure only)
**Rollback:** `rm -rf docs/reverse-engineering`.

### B.6  shard-document  —  split a fat markdown file
**Setup:** Create a 400-line markdown file `docs/SAMPLE.md` with multiple H2 sections.
**Trigger phrase:** "Shard `docs/SAMPLE.md` at H2 boundaries."
**Expected outputs:** `docs/sample/<section-slug>.md` per H2; original file resolved (deleted, replaced with index, or left — skill should ask).
**Pass criteria:**
- [ ] One file per H2
- [ ] Section bodies preserved intact
- [ ] Original file resolution explicit (not silent)
**Rollback:** `git checkout -- docs/`.

### B.7  track-change  —  log an edit to the change tracker
**Trigger phrase:** "Log this scaffold work into the change tracker."
**Expected outputs:** `CHANGE-TRACKER.md` initialised at the right path with one entry.
**Pass criteria:**
- [ ] Entry has Parts Affected, source-version, verification status
- [ ] Format matches `templates/blocks/meta/` change-tracker block
**Rollback:** `git checkout -- CHANGE-TRACKER.md` (or delete).

### B.8  verify-source  —  audit one assembled artifact
**Setup:** Use the scaffolded RE structure from B.5 + a one-paragraph stub Part A doc with one fabricated claim.
**Trigger phrase:** "Verify this Part A doc against source."
**Expected outputs:** Findings split into completeness / accuracy / consistency / change-tracking.
**Pass criteria:**
- [ ] Fabricated claim flagged
- [ ] No false positives on the verifiable claim
**Rollback:** delete stub.

---

## Phase C — Brownfield: RE + Knowledge Base

Sandbox prep (one-time before C.1):
```
mkdir -p ~/Dev/framework-tests/oss-clones
mkdir -p ~/Dev/framework-tests/recipes-kb
```

Then shallow-clone the 7 candidate repos under `oss-clones/` (we'll do this on demand, one repo at a time, to keep disk use bounded — `--depth 1` and `git gc` after).

**F-006 fix — `[[project.repos]]` enumeration step.** Before reaching C.9 (`build-knowledge-base`), populate the project.toml with one `[[project.repos]]` block per cloned repo. Run `customize-framework` against the existing `recipes-app/project.toml` (in scope = `project-team`) to add seven entries:

```toml
[[project.repos]]
code    = "realworld-api"
name    = "RealWorld Node Express API"
path    = "{project-root}/../oss-clones/realworld-api"
role    = "api"

[[project.repos]]
code = "hono"
name = "Hono — multi-runtime API framework"
path = "{project-root}/../oss-clones/hono"
role = "api-framework"

[[project.repos]]
code = "commerce"
name = "vercel/commerce — Next.js storefront"
path = "{project-root}/../oss-clones/commerce"
role = "web-app"

[[project.repos]]
code = "shadcn-ui"
name = "shadcn/ui — UI component scaffold"
path = "{project-root}/../oss-clones/shadcn-ui"
role = "ui-framework"

[[project.repos]]
code = "documenso"
name = "Documenso — Prisma schema only"
path = "{project-root}/../oss-clones/documenso"
role = "database"

[[project.repos]]
code = "bluesky-social"
name = "Bluesky social-app — RN+Expo client"
path = "{project-root}/../oss-clones/bluesky-social"
role = "mobile-app"

[[project.repos]]
code = "nativewind"
name = "NativeWind — Tailwind for React Native"
path = "{project-root}/../oss-clones/nativewind"
role = "mobile-framework"
```

This step is **mandatory before C.9** — `build-knowledge-base/steps/01-validate-target.md` halts with a copyable error if the array is empty (the post-F-006 fail-loud guard). Without these entries the brownfield flow doesn't reach the KB stage.

> **Note on running RE skills inside Claude Code:** the framework declares Claude Code "currently not supported" in `README.md`. We exercise the skills here by treating the assistant as the agent and reading each `SKILL.md` + `steps/*` as the playbook — exactly what a Cursor / Copilot agent would do. If a step relies on `/`-discovery in the host (e.g., elicitation prompts), we simulate it inline.

### C.1  analyze-repository  —  classify all 7 candidate repos
**Trigger phrase per repo:** "What kind of project is `<repo>`? Which RE skill should I run?"
**Inputs:** A clone of each candidate at `~/Dev/framework-tests/oss-clones/<repo>/`.
**Expected outputs:** For each repo a structured classification (type, language, stack, recommended skill, monorepo handling). For monorepos (e.g., `shadcn-ui/ui`) sub-projects classified independently.
**Pass criteria:**
- [ ] 7 repos × 1 classification each = 7 verdicts
- [ ] No misclassifications (you adjudicate)
- [ ] Monorepo cases produce ordered skill list
- [ ] Each verdict ends with the exact next-skill trigger phrase
**Rollback:** none.

### C.2  reverse-engineer-api  —  RealWorld Express backend
**Trigger phrase:** "Reverse-engineer this API repo at `~/Dev/framework-tests/oss-clones/node-express-realworld-example-app`."
**Expected outputs:** Part A internal docs + Part B1 OpenAPI + Part B2 consumer guide under `recipes-kb/source-docs/realworld-api/`.
**Pass criteria:**
- [ ] Part A covers controllers, models, middleware
- [ ] Part B1 OpenAPI validates (use `npx @redocly/cli lint`)
- [ ] Part B2 has at least one end-to-end consumer flow
**Rollback:** `rm -rf recipes-kb/source-docs/realworld-api`.

### C.3  reverse-engineer-api-framework  —  Hono
**Trigger:** "Reverse-engineer the API framework at `~/Dev/framework-tests/oss-clones/hono`."
**Expected outputs:** Part A framework docs + Part B implementer docs under `recipes-kb/source-docs/hono/`.
**Pass criteria:**
- [ ] Part B explains: install, write a route, add middleware, deploy targets
- [ ] Internal vs implementer split is clean (no implementer-detail leakage in Part B)
**Rollback:** `rm -rf recipes-kb/source-docs/hono`.

### C.4  reverse-engineer-web-app  —  vercel/commerce
**Trigger:** "Reverse-engineer the web app at `~/Dev/framework-tests/oss-clones/commerce`."
**Expected outputs:** Part A internal docs + Part B app overview & integration guide.
**Pass criteria:**
- [ ] App-Router page structure documented
- [ ] Server vs client component split called out
- [ ] Cart / product / checkout flows traced
**Rollback:** `rm -rf recipes-kb/source-docs/commerce`.

### C.5  reverse-engineer-ui-framework  —  shadcn-ui/ui
**Trigger:** "Reverse-engineer the UI framework at `~/Dev/framework-tests/oss-clones/ui`."
**Expected outputs:** Part A full framework docs + Part B implementer docs (component catalog, theming, install model).
**Pass criteria:**
- [ ] At least 5 component pages produced
- [ ] Theming / dark-mode story documented
- [ ] `peerDependencies` model called out
**Rollback:** `rm -rf recipes-kb/source-docs/shadcn-ui`.

### C.6  reverse-engineer-database  —  documenso Prisma schema
**Trigger:** "Reverse-engineer the database under `~/Dev/framework-tests/oss-clones/documenso/packages/prisma`."
**Expected outputs:** Part A internal DB docs + Part B1 data dictionary & ERD + Part B2 consumer guide.
**Pass criteria:**
- [ ] Every model from `schema.prisma` has a data-dictionary entry
- [ ] FK edges form a coherent ERD
- [ ] Migration history acknowledged
**Rollback:** `rm -rf recipes-kb/source-docs/documenso-db`.

### C.7  reverse-engineer-mobile-app  —  bluesky/social-app
**Trigger:** "Reverse-engineer the mobile app at `~/Dev/framework-tests/oss-clones/social-app`."
**Expected outputs:** Part A internal app docs + Part B app overview & integration guide.
**Pass criteria:**
- [ ] iOS + Android entry points documented
- [ ] Navigation graph captured
- [ ] State-management approach identified
**Rollback:** `rm -rf recipes-kb/source-docs/bluesky`.

### C.8  reverse-engineer-mobile-framework  —  nativewind
**Trigger:** "Reverse-engineer the mobile framework at `~/Dev/framework-tests/oss-clones/nativewind`."
**Expected outputs:** Part A internal framework docs + Part B implementer docs.
**Pass criteria:**
- [ ] `peerDependencies` framework signal classification confirmed
- [ ] Public API surface documented
- [ ] Setup-in-an-Expo-app walk-through included
**Rollback:** `rm -rf recipes-kb/source-docs/nativewind`.

### C.9  build-knowledge-base  —  scaffold the KB
**Trigger:** "Build the knowledge base from the source-docs we just produced."
**Inputs:** All 7 RE outputs deposited under `recipes-kb/source-docs/<repo>/`. `project.toml` declares `knowledge_base_path = "../recipes-kb"`.
**Expected outputs:** Full KB layout under `recipes-kb/`:
- `ARCHITECTURE.md`
- `CLAUDE.md`
- `graph.json`
- `glossary.md`, `change-tracker.md`
- `repos/<slug>/`
- `components/<slug>/<component-id>.md` per public artifact
- `shared/{entities,cross-cutting,adrs,integration-patterns}/`
- `synthesized/01..10/`
**Pass criteria:**
- [ ] Every public artifact in source-docs maps to ≥1 component file
- [ ] `graph.json` parses, edges are bidirectionally consistent
- [ ] Each component has the mandatory frontmatter (description, triggers, paths, depends_on, consumed_by, last_verified_against_commit with full 40-char SHA)
- [ ] No source-doc content duplicated into component bodies
**Rollback:** `rm -rf recipes-kb/{ARCHITECTURE.md,CLAUDE.md,graph.json,glossary.md,change-tracker.md,repos,components,shared,synthesized}`.

### C.10  verify-knowledge-base-coverage  —  baseline coverage report
**Trigger:** "Verify KB coverage."
**Expected outputs:** Orphan + stale + warning report; baseline run, no deltas.
**Pass criteria:**
- [ ] No orphans (every component traces to source-docs)
- [ ] No KB-only entries lacking source backing
**Rollback:** report is informational; nothing to roll back.

### C.11  navigate-knowledge-base  —  feature-grounding query
**Trigger:** "Find the minimal KB component set needed to add OAuth login to a Next.js app like `vercel/commerce`."
**Expected outputs:** A ranked list of component file paths to load, no full-KB read.
**Pass criteria:**
- [ ] List is ranked
- [ ] All listed files exist
- [ ] Top-3 are obviously the most relevant (you adjudicate)
- [ ] The skill does **not** read the entire KB itself
**Rollback:** none.

### C.12  detect-knowledge-base-drift  —  inject a drift signal
**Setup:** Touch a file inside `oss-clones/commerce/` (e.g., add a route) and commit, so the source HEAD differs from the KB's `last_verified_against_commit`.
**Trigger:** "Run a drift sweep."
**Expected outputs:** Drift report flagging the affected component(s) with severity and recommended action.
**Pass criteria:**
- [ ] Affected component flagged
- [ ] Untouched repos report no drift
- [ ] Severity assigned per the layered detection rules
**Rollback:** `git -C oss-clones/commerce reset --hard HEAD~1` (re-clone is fine too).

### C.13  update-knowledge-base  —  apply the drift fix (catalog scope)
**Trigger:** "Update the KB for the change we just detected."
**Expected outputs:** Only the matched components edited; `change-tracker.md` appended; `graph.json` incrementally regenerated; ADR emitted only if a threshold is crossed.
**Pass criteria:**
- [ ] No full rebuild
- [ ] Affected component frontmatter updated (`last_verified_against_commit`)
- [ ] Graph delta consistent
**Rollback:** `git -C recipes-kb checkout -- .`.

---

## Phase D — Greenfield SDLC on the Recipes app

Sandbox prep (one-time before D.1) — flip flow back to greenfield via `customize-framework` or by re-running `start-project` in a fresh sibling. Easiest is a fresh sibling:
```
mkdir -p ~/Dev/framework-tests/recipes-app-gf
cd       ~/Dev/framework-tests/recipes-app-gf
git init -q
```

### D.1  start-project  —  greenfield (re-run, clean slate)
**Trigger phrase:** "Bootstrap a greenfield Next.js project called Recipes."
**Expected outputs:** `project.toml` with `default_flow = "greenfield"`, paths set, glossary seeded with `Recipe`, `Tag`, `Favorite`. Handoff to `create-requirements-package`.
**Pass criteria:**
- [ ] `project.toml` parses
- [ ] Glossary contains the three project terms
- [ ] Handoff phrase emitted
**Rollback:** `rm -rf ~/Dev/framework-tests/recipes-app-gf`.

### D.2  create-requirements-package  —  full requirements stage
**Trigger:** "Create the requirements package for Recipes."
**Inputs:** Scenario from §5 of this plan.
**Expected outputs:** Requirements package on disk per `templates/compositions/greenfield-requirements-package.yaml` — overview, exec summary, FRs (≥3), NFRs (auth + perf), ACs, glossary, change-log.
**Pass criteria:**
- [ ] All composition blocks present
- [ ] FRs are testable (each has at least one AC)
- [ ] No `[NEEDS CLARIFICATION:]` markers left
**Rollback:** `rm -rf docs/requirements`.

### D.3  review-requirements-package  —  gate
**Trigger:** "Review the requirements package."
**Expected outputs:** GO / NO-GO verdict with findings on scope, completeness, consistency, measurability, testability.
**Pass criteria:**
- [ ] One verdict
- [ ] Findings cite specific sections / FR IDs
**Rollback:** none.

### D.4  create-design-package  —  full design stage
**Trigger:** "Create the design package."
**Expected outputs:** Design package per `templates/compositions/greenfield-design-package.yaml` — C4 L1 + L2 (and L3 for the recipe service), tech-stack pin (Next.js version, Prisma version, SQLite), API design (Next.js Route Handlers), data model, NFR strategies, traceability matrix back to FRs.
**Pass criteria:**
- [ ] C4 diagrams render (Mermaid syntax valid)
- [ ] Every FR appears in the traceability matrix
- [ ] Tech-stack versions pinned, not "latest"
**Rollback:** `rm -rf docs/design`.

### D.5  review-design-package  —  gate
**Trigger:** "Review the design."
**Expected outputs:** GO / NO-GO with architecture, security posture, NFR-strategy verdicts.
**Pass criteria:**
- [ ] At least one finding (no rubber-stamp)
- [ ] Verdict is unambiguous
**Rollback:** none.

### D.6  create-implementation-package  —  decompose into INC-XXX
**Trigger:** "Create the implementation package."
**Expected outputs:** Implementation package with 3–4 `INC-XXX` increments conforming to the Canonical Increment Shape (8 sections).
**Pass criteria:**
- [ ] Each increment has all 8 canonical sections
- [ ] Order is executable (no forward dependencies)
- [ ] FR coverage matrix complete
**Rollback:** `rm -rf docs/planning`.

### D.7  review-implementation-package  —  pre-execution gate
**Trigger:** "Review the implementation package."
**Expected outputs:** GO / NO-GO + per-increment findings.
**Pass criteria:**
- [ ] Per-increment verdict
- [ ] Increment-shape compliance confirmed
**Rollback:** none.

### D.8  execute-increments  —  ship INC-001
**Trigger:** "Execute INC-001."
**Expected outputs:** Increment INC-001 implemented under `recipes-app-gf/` with TDD (tests-first), AI Gate result, Human Gate result, increment-status updated.
**Pass criteria:**
- [ ] Tests written before code
- [ ] Tests pass
- [ ] Increment-status file updated
- [ ] Closing handoff to `update-knowledge-base` emitted
**Rollback:** `git -C ~/Dev/framework-tests/recipes-app-gf reset --hard <pre-d8-sha>`.

### D.9  manage-bugs  —  log + triage
**Setup:** Inject a deliberate bug during D.8 review (e.g., a known failing edge case).
**Trigger:** "Log a bug for the failing case." then "Triage open bugs."
**Expected outputs:** `bugs-and-issues-log.md` with the entry; triage produces severity + assignee.
**Pass criteria:**
- [ ] Entry has the canonical fields (id, title, repro, severity, status)
- [ ] Skill works whether or not an increment is currently being executed
**Rollback:** `rm bugs-and-issues-log.md`.

### D.10  create-pr  —  package the diff
**Trigger:** "Create a PR for INC-001."
**Expected outputs:** Atomic conventional commits (one per logical change) + PR description with summary + test plan.
**Pass criteria:**
- [ ] Commit messages are conventional
- [ ] No "WIP" or noise commits
- [ ] PR body has both Summary and Test plan sections
**Rollback:** `git reset --soft <pre-d10-sha>` to un-commit; do **not** push.

---

## Phase E — Quick-dev on the Recipes app

Sandbox: continues from D.10's repo state.

### E.1  document-quick-change  —  spec the cookTime feature
**Trigger phrase:** "Quick change: add a `cookTime` field to recipes and surface it on the list view."
**Expected outputs:** `docs/cook-time/quick-dev-package/<feature-id>-quick-dev-spec.md` with overview, exec-summary, FRs, ACs, glossary delta.
**Pass criteria:**
- [ ] Single artifact (not split into requirements + design)
- [ ] At least one Acceptance Criterion is a trigger + observable
- [ ] No `[NEEDS CLARIFICATION:]` markers left
**Rollback:** `rm -rf docs/cook-time`.

### E.2  plan-quick-change  —  break into 1–3 increments
**Trigger:** "Plan the quick change."
**Expected outputs:** Lightweight plan (reduced increment shape), 1–3 increments, clarity-gate verdict.
**Pass criteria:**
- [ ] Increments are sized to fit the change (likely 2: schema migration + UI surface)
- [ ] Clarity gate either PASS or with a small list of asks
**Rollback:** `rm <plan file>`.

### E.3  execute-quick-change  —  implement, verify, commit
**Trigger:** "Execute the quick change."
**Expected outputs:** Code change with TDD, 3-dimension verification (unit, behaviour, integration), atomic commits, handoff to `update-knowledge-base --scope=catalog-only`.
**Pass criteria:**
- [ ] Tests written before code
- [ ] All three verification dimensions covered
- [ ] Final commit clean; PR-ready
- [ ] KB update handoff fires (we don't need to actually run it for this scenario unless the KB exists in this sandbox)
**Rollback:** `git reset --hard <pre-e3-sha>`.

---

## 8. Test-execution conventions

- We pause at the **end of every step** for Mike's verdict: Pass / Fail / Partial / Skip + free-form notes.
- A **Fail** records the issue in `_docs/skills-test-results.md` (created on first Fail), names the skill, names the affected artifact, names the fix-owner.
- A **Partial** records the partial-pass note plus what's missing; we do not block the next step on a partial unless it would cascade.
- A **Skip** records the reason (out of scope today, environment unavailable, etc.) and we move on.
- After each Phase ends, we summarise verdicts as a small table.

## 9. Coverage matrix

| Skill | Phase.Step |
|---|---|
| start-project | B.1, D.1 |
| framework-navigator | B.2, B.3 |
| customize-framework | B.4 |
| scaffold-documentation | B.5 |
| shard-document | B.6 |
| track-change | B.7 |
| verify-source | B.8 |
| analyze-repository | C.1 (×7) |
| reverse-engineer-api | C.2 |
| reverse-engineer-api-framework | C.3 |
| reverse-engineer-web-app | C.4 |
| reverse-engineer-ui-framework | C.5 |
| reverse-engineer-database | C.6 |
| reverse-engineer-mobile-app | C.7 |
| reverse-engineer-mobile-framework | C.8 |
| build-knowledge-base | C.9 |
| verify-knowledge-base-coverage | C.10 |
| navigate-knowledge-base | C.11 |
| detect-knowledge-base-drift | C.12 |
| update-knowledge-base | C.13 |
| create-requirements-package | D.2 |
| review-requirements-package | D.3 |
| create-design-package | D.4 |
| review-design-package | D.5 |
| create-implementation-package | D.6 |
| review-implementation-package | D.7 |
| execute-increments | D.8 |
| manage-bugs | D.9 |
| create-pr | D.10 |
| document-quick-change | E.1 |
| plan-quick-change | E.2 |
| execute-quick-change | E.3 |

32 / 32 skills covered.

## 10. Out-of-band utilities not separately listed as steps

`framework-navigator` is exercised twice (B.2 + B.3); the registry/validator scripts (`scripts/build-registry.py`, `scripts/validate.py`) are exercised in A.1 + A.2.

---

**End of plan.** Begin with Phase A.1.
