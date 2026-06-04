# Analysis: Three QE Skill Sets for AIDE

> Analysis of three candidate Quality Engineering skill sets being considered
> for inclusion in the AIDE framework. Produced 2026-05-31.

## Quick orientation

| Set | Where it lives | What it is | Skill count |
|---|---|---|---|
| **Branch / in-tree** | `.agents/skills/qe/` | A new "QE stage" that produces a **QE Package** (test-cases as `TC-XXX` increments), parallel to the implementation package. Backs the fail-fast POC. | 3 skills (`create-`, `review-`, `execute-qe-increments`) |
| **DCC-QE** | `_archive/DCC-QE-Skills/.agents/skills/qe/` | A team-internal toolkit tuned to **BB-DCC-QE** (Playwright + Cucumber + Java). Phased authoring workflow with KNOWLEDGE.md as cached repo intelligence, plus a Jira-integrated Atlassian CLI tool. | 5 skills + `setup-atlassian-cli` meta + ~85-file Node CLI |
| **EM-QE** | `_archive/EM-QE-Skills/.agents/skills/quality/` | A new **"quality" stage** (not "qe") that produces a **Quality Package** — QA strategy + test design + quality engineering — folded into AIDE's standard composition/block/template machinery, with a 6-step review gate. | 2 skills + 9 template blocks + 1 composition + workflow-graph wiring |

All three target the same general slot in the SDLC (post-planning,
pre/around-execution), but they answer different questions:

- **Branch QE** answers *"how do we turn test cases into executable increments
  the way we do features?"*
- **DCC-QE** answers *"how does the BB-DCC-QE team author and run tests every
  day?"*
- **EM-QE** answers *"what is the canonical Quality artefact, how does it gate
  execution, and how does it slot into the standard AIDE machinery?"*

---

## (a) Per-set capabilities, strengths, weaknesses, fit with AIDE

### 1. Branch in-tree set — `.agents/skills/qe/` (3 skills)

**Capabilities**

- `create-qe-package`: 9-step wizard that elicits source/scope → topology →
  tech → artifacts → harness → embedding → categorization → execution strategy
  → plan. Produces `qe-package.md`, `execution-strategy.md`,
  `qe-plan-overview.md`, per-test-case `TC-XXX.md` files (flat or
  categorized), and `test-case-status.md`.
- `review-qe-package`: 4 sequential reviews (completeness, consistency,
  execution-readiness, verdict). PASS / PASS WITH OBSERVATIONS / FAIL.
- `execute-qe-increments`: One TC-XXX at a time, mirroring
  `execute-increments`. Distinguishes **scaffolding** increments from
  **test-case** increments.
- A `qe-increment-shape.md` reference that maps the canonical 8-block
  increment shape onto QE artefacts.

**Strengths**

- **Shape-conformant.** Treats QE like the planning stage's twin — same
  `create / review / execute` triplet, same INC-XXX → TC-XXX increment shape,
  same SKILL.md conventions, same "verification rule (always-on)" pattern.
  Drops in cleanly.
- **Solution-agnostic in the skill text.** Steps 3, 5, 6 are pure elicitation
  — Cucumber/Playwright/pytest/Cypress all fall out as user answers, not
  hardcoded assumptions.
- **Explicit scaffolding-vs-test-case split.** A real pain point in QE
  planning solved cleanly (one of the few sets that addresses it).
- **Categorisation built in** (`plan/<category>/TC-XXX.md`) — supports E2E vs
  integration vs contract vs chaos in one package.
- **Traceability matrix** baked into Step 9g.
- The only set that gives QE its own *executable* increment loop.

**Weaknesses**

- **Stage-name collision risk.** Both this set ("qe" stage) and the EM set
  ("quality" stage) want the same spot in the SDLC. AIDE can have only one.
  EM's name aligns with broader QA + QE + testing.
- **No template blocks or composition.** It writes prose Markdown rather than
  assembling from `templates/blocks/qe/*` via a composition YAML, which is
  the framework's standard pattern (used by every other stage). Means it
  can't be customized via the four-layer config the same way.
- **No CI-gate / release-gate / coverage-threshold concept.** It plans test
  *cases* but doesn't define measurable release gates the way EM's
  `quality-strategy` + `automation-and-cicd` blocks do.
- **No QA-analysis discipline.** Skips defect-prevention / process activities
  entirely — purely test-design + execution.
- **Step 9 has lightly normative defaults** (Cucumber/Maven examples,
  `application-qe.yml`, Awaitility) that read like Java/Spring/Kafka
  assumptions even though phrased as examples; will need scrubbing.
- **No quick-dev story** — does the QE stage apply in quick-dev? Unclear.

**Fit with AIDE**: 8/10 — drops in by shape, but stage name conflicts with the
EM set and it doesn't use the templates/compositions machinery.

---

### 2. DCC-QE — `_archive/DCC-QE-Skills/` (5 skills + meta + CLI)

**Capabilities**

- `qe-code-scanner`: deep-scans the BB-DCC-QE repo and writes
  `docs/KNOWLEDGE.md` (24 numbered sections — utilities, step defs, page
  classes, locators, environments, BrowserStack modes, etc.). A *cached
  intelligence* model.
- `qe-development`: 7-phase authoring workflow (Phase 0/0c/0b/1–6) with
  approval checkpoints, lateral-thinking reuse checklist, FR/AC
  traceability, INC-aware entry path that resolves against a sibling
  `TDBC-knowledge-base/features/...` repo.
- `qe-execution`: builds and runs the exact Maven command, handles local +
  BrowserStack CDP + BrowserStack SDK modes, validates env against
  `environments.json`.
- `qe-defect-review`: one-failure-at-a-time interactive triage; classifies as
  script issue vs application defect; produces summary + action items.
- `qe-coverage-check`: cross-references implementation package INCs against a
  `qe-package/qe-increment-status.md` tracker and the live KNOWLEDGE.md tags;
  reports gaps + drift.
- `setup-atlassian-cli` + the **Node `atl` CLI tool** (~85 files): real
  Jira/Confluence integration with field mappings, caching, status
  transitions, page/issue fetch + create + update.

**Strengths**

- **Genuinely battle-tested.** This is what production usage looks like —
  testability gate before authoring, reuse analysis, defect categorisation,
  drift detection, live Jira integration. Lots of QE-domain wisdom encoded.
- **Excellent reuse discipline.** Phase 3's lateral-thinking checklist
  ("does a GENERIC method exist for this TYPE?") prevents drift and bloat —
  a real pain in long-lived test suites.
- **KNOWLEDGE.md pattern is powerful.** A scanned, cached, structured
  codebase index for the test repo — solves the "agent needs to know what's
  already there before suggesting new code" problem.
- **Coverage check is a genuine asset.** None of the other sets have an
  explicit gap+drift audit against the implementation package.
- **Defect-review skill is a unique capability** — fills a gap none of the
  other sets cover (post-execution triage).
- **Testability check (Phase 0c) is a great upstream filter** — refuses to
  plan tests for L1 infrastructure work that has no UI/API surface. Worth
  lifting verbatim.

**Weaknesses**

- **Highly tool-specific.** BB-DCC-QE, Playwright, Cucumber, Java, Maven,
  BrowserStack CDP/SDK, `objectRepo.properties`,
  `TDBC-knowledge-base/features/...`, AssertJ, Awaitility, CucumberDebugger
  — all hardcoded into the skill text, not elicited.
- **Hardcoded paths**: `BB-DCC-QE/docs/KNOWLEDGE.md`,
  `BB-DCC-QE/features/<JIRA-ID>/`,
  `TDBC-knowledge-base/features/<feature>/implementation-package/...`.
  Cannot move to another project without rewriting the skills.
- **Layer vocabulary (L1/L2/L3/L4) is TD-specific** — depends on a
  test-pyramid table format peculiar to one team's implementation package.
- **`qe-code-scanner` overlaps with AIDE's KB skills**
  (`build-knowledge-base`, `update-knowledge-base`,
  `navigate-knowledge-base`, `detect-knowledge-base-drift`). KNOWLEDGE.md is
  essentially a per-test-repo private KB that duplicates the framework's
  general KB concept.
- **The Atlassian CLI is a real engineering artefact** — useful, but it's a
  tool, not a skill. Lives outside the AIDE skill discipline.
- **Phased workflow is custom**, doesn't use AIDE's `steps/<n>-name.md`
  convention uniformly; uses "phase" vocabulary that the framework
  explicitly bans.
- **No package artefact.** Outputs are working code + per-Jira intermediary
  docs, not a gated package the way every other AIDE stage produces.

**Fit with AIDE**: 5/10 as-is — incompatible patterns (phase vocabulary,
hardcoded toolchain, no package, KB duplication). 9/10 as a **source of
reusable patterns** to lift into generic skills.

---

### 3. EM-QE — `_archive/EM-QE-Skills/` (2 skills + templates + composition)

**Capabilities**

- A new **`quality` stage** with `create-quality-package` +
  `review-quality-package`.
- `create-quality-package`: 4-step (0+1+2+3) authoring covering quality
  strategy, test design, quality engineering. Three conceptual disciplines:
  **QA analysis**, **software testing**, **quality engineering**.
- `review-quality-package`: 6 sequential reviews (coverage → test-design
  quality → quality engineering → metrics/gates → traceability → readiness)
  ending in GO / CONDITIONAL GO / NO-GO.
- 9 template **blocks** (`templates/blocks/quality/*.md`): quality-strategy,
  test-approach, test-design, test-data-and-environments,
  automation-and-cicd, nonfunctional-quality, defect-management,
  quality-metrics-and-reporting, index.
- 1 **composition** (`templates/compositions/greenfield-quality-package.yaml`).
- Modifies `execute-increments` to *require* a GO quality package before
  running.
- Modifies `review-implementation-package` to hand off to
  `create-quality-package` (instead of straight to execution).
- Wires the new stage into `_registry/workflow-graph.yaml` and `skills.csv`.

**Strengths**

- **Architecturally native to AIDE.** Uses every framework convention:
  composition YAML, frontmatter'd blocks, decision-gates, SoD/legacy path
  resolution, `_cross-cutting/`, `affects-repos`, `requires-decision-from`,
  four-layer config customisability, "verification rule (always-on)",
  strict review sequence, `## Next skill` handoffs.
- **Properly modelled separation of concerns.** Cleanly articulates the
  three disciplines (QA analysis prevents, testing detects, QE scales) and
  assigns each one to a section group. The `quality-disciplines.md` and
  `quality-in-the-lifecycle.md` references are excellent stage-design
  documentation.
- **Wires into the rest of the framework.** Updates upstream
  `review-implementation-package` (planning → quality, not planning →
  execution) and downstream `execute-increments` (now requires GO quality
  package), plus the workflow graph. End-to-end coherent.
- **Release-gate discipline.** Every gate must be measurable + binary + map
  to a CI check. "Solid coverage" isn't allowed; "≥80% on changed files,
  zero open Critical defects" is.
- **Traceability matrix is a first-class output** (test ↔ AC ↔ FR/NFR ↔ INC).
- **Truly generic.** Examples in blocks are illustrative (Vitest, Playwright,
  Pact, c8) and obviously placeholder; the elicitation drives values.
- **Quick-dev integration is thought through** (stage is bypassed, quality
  folds inline).

**Weaknesses**

- **No execution-side skill.** Stops at the package; doesn't produce
  executable test increments. Assumes `execute-increments` (or
  `manage-bugs`) handles every test as part of regular implementation
  increments via TDD. That's clean in theory but loses the *parallel
  test-development workflow* the other two sets explicitly support.
- **No reuse / KB-of-the-test-suite pattern.** Doesn't address "what already
  exists, don't duplicate" — which is the biggest practical problem in QE.
- **No defect-triage skill.** Defects are punted to `manage-bugs` (generic
  bug log).
- **No coverage-audit / drift-detection skill.** No equivalent of
  `qe-coverage-check`.
- **No testability gate.** Doesn't have DCC-QE's Phase 0c "is this even
  automatable?" guard.
- **Blocks/composition are aimed at a single feature package** — fine for
  greenfield/brownfield SDLC, less obvious how a long-lived test-automation
  repo is iteratively maintained.

**Fit with AIDE**: 10/10 architecturally — written by someone who knows the
framework deeply. Conceptually the right *shape*. Just incomplete on the
doing-side.

---

## (b) How generic each is

| Aspect | Branch QE | DCC-QE | EM-QE |
|---|---|---|---|
| Stack / tooling assumptions hardcoded? | **Mostly no** — examples nudge toward Java/Cucumber/Kafka but elicitation drives | **Heavily yes** — Playwright + Cucumber + Java + Maven + BrowserStack + AssertJ + Awaitility + BB-DCC-QE paths everywhere | **No** — pure illustrative placeholders |
| Paths hardcoded? | No (uses `{paths.qe_package}`) | Yes (`BB-DCC-QE/...`, `TDBC-knowledge-base/...`) | No (uses `{paths.quality_path}`, SoD-aware) |
| Vocabulary aligned with framework? | Yes (`increment`, `stage`, `package`) | No (uses "phase" everywhere, banned) | Yes |
| Customizable via four-layer config? | Partial (no composition/blocks) | No (skills must be rewritten) | Yes (composition, blocks, project.toml elicitation, customizations dir) |
| Team-portable as-is? | Yes | No (refactor required) | Yes |
| Generic skill / customisable for any team? | **Mostly generic** | **Specific to one team's toolchain** | **Fully generic** |

**Bottom line on genericity (matched to the stated goal):**

- **EM-QE** is the only one that is *structurally* generic in the AIDE sense
  — i.e. customisable through configuration without editing skill bodies.
- **Branch QE** is *textually* generic but doesn't expose the customisation
  surface (no blocks, no composition).
- **DCC-QE** is *not* generic. It's a team-specific implementation that
  happens to follow the agentskills.io shape. **However, the patterns it
  encodes (reuse analysis, KNOWLEDGE.md, testability gate, defect triage,
  coverage check) are themselves generic ideas** — they just need to be
  re-expressed as configurable skills.

---

## (c) Recommended merge — a single coherent set

The goal is generic, customisable skills that drop into AIDE. Below is the
proposed end-state, then the migration approach.

### Proposed target — **single `quality` stage** (5 skills, blocks-driven)

Use **EM-QE's stage name, frontmatter, composition/block discipline, and
review gate** as the architectural skeleton. Layer in **Branch QE's
per-test-case increment execution loop** as the doing-side. Layer in
**DCC-QE's operational patterns** as generic, configurable skills.

```
stage: quality

skills:
  create-quality-package      ← EM (Quality Strategy + Test Design + QE plan)
  review-quality-package      ← EM (6-step gate, GO/CONDITIONAL GO/NO-GO)
  execute-quality-increments  ← Branch (TC-XXX execution loop, generalised)
  audit-quality-coverage      ← DCC-generic (gap + drift report against impl pkg)
  review-test-failures        ← DCC-generic (one-at-a-time defect triage)
```

Plus **one cross-cutting decision**:

- `qe-code-scanner`'s job (KNOWLEDGE.md of the test suite) is **already**
  what AIDE's KB skills do for any repo. Don't make it a QE skill — instead,
  declare in docs that QE skills consume the KB for the test-suite repo via
  `navigate-knowledge-base`. If a project really wants a "test suite
  intelligence" view, run `reverse-engineer-*` + `build-knowledge-base` on
  the test repo itself. This eliminates duplication and reuses framework
  machinery.

### What each skill takes from where

| Target skill | EM contribution | Branch contribution | DCC contribution (generalised) |
|---|---|---|---|
| **create-quality-package** | Full skeleton: 3 disciplines, blocks, composition, SoD, traceability matrix, release gates, four-layer customisability | Test-category elicitation (E2E/integration/contract/chaos/etc.), topology/embedding/harness wizard steps as **optional deep-dive sub-steps**, scaffolding-vs-test-case split | **Testability check** as Step 0 (generalised from L1–L4 layers to "does this scope have any automatable surface?"); reuse-analysis sub-step grounded against the KB |
| **review-quality-package** | 6-step strict-order review with verdicts | Add a 7th review: increment-shape conformance on test-case files (only if execute-quality-increments is in use) | — |
| **execute-quality-increments** *(new, generic)* | — | Whole skill body (1-load → 2-implement → 3-verify → 4-user-review → 5-status-update), TC-XXX shape, status tracker. Generalise framework-specific examples to placeholders. | KNOWLEDGE-grounding step: before implementing, query the KB for reusable utilities; lateral-thinking checklist becomes the AI-Gate prompt |
| **audit-quality-coverage** *(new, generic)* | — | — | Whole skill body, with paths sourced from `project.toml` + KB component lookup. Inputs: implementation package + quality package + KB. Outputs: gap report + drift report + next-action recommendations |
| **review-test-failures** *(new, generic)* | Verification-rule pattern | — | Whole skill body — one-failure-at-a-time triage with classification + remediation. Categories table becomes a customisable block. Generalise away from Allure/screenshots/Maven |

### What is explicitly dropped or relocated

- **`qe-code-scanner`** → relocated. Use AIDE's existing `reverse-engineer-*`
  + `build-knowledge-base` against the test repo; surface
  `navigate-knowledge-base` as a dependency of the new quality skills.
- **`setup-atlassian-cli` + the Node `atl` CLI** → relocated to `tools/`.
  Either rewrap as a standalone tool that any skill can shell out to, or
  keep as DCC-team-internal until it's promoted. **Do not** make it a hard
  dependency of any merged skill — the quality skills must work without
  Jira. Allow it as an *optional* enrichment when configured in
  `project.toml`.
- **DCC's per-Jira `features/<JIRA-ID>/` directory layout** → replaced by
  AIDE's package-output paths resolved through `project.toml` + SoD rules.
- **All Java/Maven/Playwright/BrowserStack specifics** → demoted to
  template-block placeholders or removed.
- **"Phase" vocabulary throughout DCC** → renamed to "step" to comply with
  framework rules.

### Customisation hooks (this is how teams adapt the generic set)

Per AIDE's four-layer config:

1. **`project.toml`** declares the test stack (`testing_strategy`, framework
   name, runner, env list, naming conventions, tag vocabulary).
2. **`config/customizations/create-quality-package.toml`** lets a team pin
   defaults — e.g. BB-DCC-QE team pins Playwright/Cucumber/Java/Maven;
   another team pins Vitest/Playwright/TypeScript.
3. **`templates/blocks/quality/*.md`** ships generic; teams can add
   team-specific blocks (e.g. `quality/browserstack-execution.md`) under
   `templates/blocks/quality/_user/` and include them via a project-scoped
   composition.
4. **DCC's KNOWLEDGE.md sections** become a generic block template
   `templates/blocks/quality/test-suite-intelligence.md` that the test-suite
   KB component populates.

### Recommended order of work

1. **Adopt EM-QE wholesale into `.agents/skills/quality/`** (rename current
   branch `.agents/skills/qe/` content out of the way). This becomes the
   structural baseline. Also adopts the workflow-graph wiring, the
   upstream/downstream skill amendments, and the composition+blocks set.
2. **Port the branch's `execute-qe-increments` to
   `execute-quality-increments`** under the same stage. Generalise
   framework-specific language to placeholders. Wire it into
   `review-quality-package`'s "if execute-quality-increments is enabled"
   branch and into the workflow graph as an optional path after
   `review-quality-package` GO.
3. **Port the branch's TC-XXX increment shape** (`qe-increment-shape.md`)
   into the `templates/blocks/quality/` set as a `test-case-increment.md`
   block that `create-quality-package` Step 2 (`02-test-design.md`) can
   produce. Make it optional via a decision-gate in the composition: teams
   that run TC-XXX execution get the block; teams that fold tests directly
   into INC-XXX execution don't.
4. **Generalise DCC's `qe-coverage-check` → `audit-quality-coverage`**. Cut
   the BB-DCC-QE-specific paths, use `project.toml` repo list, use KB
   lookup for tag verification, keep the gap+drift report format.
5. **Generalise DCC's `qe-defect-review` → `review-test-failures`**. Cut
   Allure/Maven/Playwright specifics. Move the failure-category table into
   a customisable template block.
6. **Generalise DCC's Phase 0c testability check** into Step 0 of
   `create-quality-package` (sits before scope elicitation; classifies the
   scope as automatable / not / unclear and offers a clean exit). Replace
   the L1–L4 vocab with a generic question about the increment's exposed
   surface.
7. **Generalise DCC's Phase 3 reuse checklist** into a reusable reference at
   `references/reuse-analysis.md` consumed by both `create-quality-package`
   (planning new cases) and `execute-quality-increments` (writing
   artifacts).
8. **Don't merge `qe-code-scanner`.** Document the test-suite-KB pattern in
   `.agents/skills/quality/README.md` and point to the existing KB skills.
9. **Don't merge the Atlassian CLI as a skill.** Either drop it from scope
   or relocate to `tools/atlassian-cli/` as an optional companion. If kept,
   write one thin `jira-fetch` *meta* skill (analogous to `verify-source`)
   that any skill can call optionally, controlled by `project.toml`.
10. **Update the registry**: run `scripts/build-registry.py`, hand-edit
    `_registry/workflow-graph.yaml` to reflect the merged stage, and update
    `AGENTS.md` + `README.md` stages section.

### Net result

- **One stage** (`quality`) with **5 skills**: 3 from EM/Branch fusion + 2
  lifted-and-generalised from DCC.
- **All skills generic and customisable** via the four-layer config — no
  team-specific paths, tools, or vocabulary in skill bodies.
- **DCC's operational wisdom preserved** (reuse, testability gate, coverage
  audit, defect triage) but expressed in generic form.
- **No duplication with AIDE's KB skills**.
- **The fail-fast POC pattern survives** (TC-XXX execution loop is an
  optional branch after `review-quality-package` GO).
- **Atlassian CLI / KNOWLEDGE.md scanner stay available** as tools / KB
  applications, not as skills, so teams that need them aren't penalised but
  teams that don't aren't burdened.

---

## (d) Quick-dev integration

The quick-dev flow (`document-quick-change` → `plan-quick-change` →
`execute-quick-change`) is deliberately lightweight: a single combined spec
(mini-requirements + mini-design), a reduced increment shape (1–3
increments), and an executor that already carries its own quality
machinery — TDD with iron rules, 3-dimension verification (Completeness /
Correctness / Coherence), Solution Pivot Gate, adversarial 4-lens PR
review, Completion Confirmation Gate, and §12.2a Solution Constraints that
survive any pivot.

### How each set handles quick-dev today

| Set | Quick-dev story |
|---|---|
| **Branch QE** | Not addressed. The "When NOT to use" of `create-qe-package` says "trivial change → `quick-dev/document-quick-change`" but no further integration. Quick-dev would have no concept of a QE package and the `execute-qe-increments` loop wouldn't fire. |
| **DCC-QE** | Not addressed. The whole flow assumes a JIRA ticket or an INC ID from a full implementation package; there's no quick-dev entry path. A quick-dev change would either bypass DCC's QE skills entirely (the developer hand-writes the test) or shoehorn into `qe-development` with a "plain instructions" Phase 0 fallback. |
| **EM-QE** | **Explicitly addressed.** `quality-in-the-lifecycle.md` and the `quality/README.md` both state: *"For the lightweight quick-dev flow this stage is bypassed (like the requirements and design review gates are). Quality folds inline into the quick-dev spec and the 3-dimension verification in `execute-quick-change`."* The same model as `review-requirements-package` / `review-design-package` — generic skills don't run, but their *concerns* are folded into the quick-dev spec section §12.2a (Solution Constraints) and into the executor's verification dimensions. |

EM-QE has the right answer. The merged 5-skill quality stage should adopt
it verbatim and extend it with a couple of optional, lightweight bridges.

### Quick-dev integration policy for the merged quality stage

**Default rule (matches EM-QE):**

> In quick-dev mode, the dedicated `quality` stage is bypassed. None of the
> 5 quality skills run as gates. Quality concerns fold inline into the
> quick-dev spec and into `execute-quick-change`'s built-in verification
> machinery (3-dimension verification, Solution Pivot Gate, adversarial PR
> review, Completion Confirmation Gate, §12.2a Solution Constraints).

**Per-skill behaviour in quick-dev:**

| Quality skill | Quick-dev behaviour |
|---|---|
| `create-quality-package` | **Bypassed.** No package authored. Test-design content (what proves this works) collapses into the quick-dev spec's ACs + §12.2a constraints. The skill's frontmatter "When NOT to use" lists "trivial change → quick-dev/document-quick-change" and is non-invocable from quick-dev. |
| `review-quality-package` | **Bypassed.** Replaced by the quick-dev clarity gate inside `plan-quick-change` and the 4-lens adversarial review inside `execute-quick-change`. |
| `execute-quality-increments` | **Bypassed.** Tests are written inside the regular `execute-quick-change` TDD loop, one task at a time, against the existing test suite. No TC-XXX increments. |
| `audit-quality-coverage` | **Optional, anytime-invocable.** A small quick-dev change can still warrant a coverage sanity-check against the surrounding feature — the skill should remain callable on demand (it's listed in the workflow graph's `anytime:` block), but it is never auto-invoked in the quick-dev sequence. |
| `review-test-failures` | **Optional, anytime-invocable.** Same rationale. If the quick-dev change's tests start failing in CI, this skill triages them. Listed under `anytime:`. |

**Spec-side touchpoints to add (minor `document-quick-change` extension):**

The quick-dev spec already captures §12.2a Solution Constraints. To fully
absorb quality into the quick-dev flow, two **lightweight prompts** should be
added to `document-quick-change` Step 5 (block population) — not as new
sections, but as in-block prompts:

1. **In the AC block** — "How will this AC be proven? (existing test
   updated / new test added / manual smoke / N/A — config only)". This is
   the quick-dev equivalent of the test-design block and surfaces exactly
   the kind of testability question DCC-QE's Phase 0c asks at heavier
   weight.
2. **In §12.2a Solution Constraints** — explicitly include
   "test/quality constraints" as a constraint type (e.g. "must keep p95
   latency ≤ 200ms", "must not require new test infrastructure", "must run
   in existing CI gate"). The constraints survive any Solution Pivot and
   are checked by `execute-quick-change`'s constraint-cross-check.

These two edits are surgical, additive, and don't break the existing
quick-dev shape. They give the quality stage a **fold-in story** rather
than a **bypass-only** story — quality concerns become first-class even
when the stage doesn't run.

**Executor-side touchpoints (no change required, but document):**

`execute-quick-change` already enforces:

- TDD ("no production code without a failing test first") — covers software
  testing
- 3-dimension verification (Completeness / Correctness / Coherence) — covers
  QA analysis
- Solution Pivot Gate with constraint cross-check — covers test/quality
  constraints surviving pivots
- Adversarial 4-lens PR review — covers test-design quality + standards
  compliance
- Completion Confirmation Gate — covers release-gate equivalent for a
  small change
- KB catalog-only update on close — covers the quality-signal-recording
  touchpoint

No new behaviour needed; the merged quality stage's `README.md` should
include a short "Quality in quick-dev" section pointing at these existing
mechanisms, mirroring EM-QE's `quality-in-the-lifecycle.md` row for
quick-dev.

### Recommended doc updates

When the merged stage lands:

1. Add a `## Quality in quick-dev` section to
   `.agents/skills/quality/README.md` (lifted verbatim from EM-QE's existing
   text).
2. Extend `references/quality-in-the-lifecycle.md` with an explicit
   quick-dev row enumerating which executor mechanisms carry which quality
   concern.
3. Add the two surgical prompts to `document-quick-change` Step 5 (AC-block
   "how proven" prompt + §12.2a "quality constraints" prompt). Track this
   as a one-line change via `track-change`.
4. Add `audit-quality-coverage` and `review-test-failures` to the
   `anytime:` block of `_registry/workflow-graph.yaml` so they're callable
   from quick-dev when the user wants them, without being part of the
   default sequence.

**Net:** quick-dev keeps its lightweight character (no new gates, no new
mandatory packages), the merged quality stage stays bypassed by default,
but quality concerns are explicitly woven into the quick-dev spec and the
quick-dev executor — and the two anytime-invocable quality skills (audit +
failure-triage) are available when a quick-dev change needs them.

---

## (e) Target file tree

End-state of the merged stage. New / moved / amended paths are marked.
Paths are repo-relative (root = `TD-EM-AIDE/`).

```
.agents/skills/
├── quality/                                                ← NEW stage folder (replaces .agents/skills/qe/)
│   ├── README.md                                           ← NEW (lifted from EM-QE + Quick-dev section)
│   │
│   ├── create-quality-package/                             ← from EM-QE, extended with Branch + DCC patterns
│   │   ├── SKILL.md
│   │   ├── references/
│   │   │   ├── OVERVIEW.md
│   │   │   ├── INPUTS-OUTPUTS.md
│   │   │   ├── EXAMPLE.md
│   │   │   ├── quality-disciplines.md                      ← from EM-QE (unchanged)
│   │   │   ├── quality-in-the-lifecycle.md                 ← from EM-QE + quick-dev row
│   │   │   ├── reuse-analysis.md                           ← NEW (generalised DCC Phase 3 checklist)
│   │   │   └── testability-classification.md               ← NEW (generalised DCC Phase 0c)
│   │   └── steps/
│   │       ├── 00-scope-target-repo.md                     ← from EM-QE (SoD)
│   │       ├── 00b-testability-check.md                    ← NEW (generalised DCC Phase 0c)
│   │       ├── 01-quality-strategy.md                      ← from EM-QE
│   │       ├── 02-test-design.md                           ← from EM-QE + Branch test-category elicitation
│   │       ├── 02b-test-case-increments.md                 ← NEW (optional, gated; from Branch step 9 + qe-increment-shape)
│   │       └── 03-quality-engineering.md                   ← from EM-QE + Branch harness/embedding/execution-strategy as deep-dive
│   │
│   ├── review-quality-package/                             ← from EM-QE, +1 optional review
│   │   ├── SKILL.md                                        ← amend to add 7th optional review for TC-XXX shape conformance
│   │   ├── references/
│   │   │   ├── OVERVIEW.md
│   │   │   ├── INPUTS-OUTPUTS.md
│   │   │   ├── EXAMPLE.md
│   │   │   └── review-workflow.md                          ← from EM-QE + TC-XXX-shape review
│   │
│   ├── execute-quality-increments/                         ← from Branch execute-qe-increments, generalised
│   │   ├── SKILL.md                                        ← rename + scrub Java/Maven/Cucumber specifics
│   │   ├── references/
│   │   │   ├── OVERVIEW.md
│   │   │   ├── INPUTS-OUTPUTS.md
│   │   │   └── EXAMPLE.md
│   │   └── steps/
│   │       ├── 01-load-increment.md
│   │       ├── 02-implement-artifacts.md                   ← add KB-grounded reuse step (lateral-thinking checklist)
│   │       ├── 03-verify.md
│   │       ├── 04-user-review.md
│   │       └── 05-status-update.md
│   │
│   ├── audit-quality-coverage/                             ← NEW (generalised DCC qe-coverage-check)
│   │   ├── SKILL.md
│   │   ├── references/
│   │   │   ├── OVERVIEW.md
│   │   │   ├── INPUTS-OUTPUTS.md
│   │   │   ├── EXAMPLE.md
│   │   │   └── coverage-report-format.md
│   │   └── steps/
│   │       ├── 01-locate-package-and-tracker.md
│   │       ├── 02-cross-reference.md
│   │       ├── 03-kb-tag-verification.md                   ← uses navigate-knowledge-base, not KNOWLEDGE.md
│   │       ├── 04-produce-report.md
│   │       └── 05-next-actions.md
│   │
│   └── review-test-failures/                               ← NEW (generalised DCC qe-defect-review)
│       ├── SKILL.md
│       ├── references/
│       │   ├── OVERVIEW.md
│       │   ├── INPUTS-OUTPUTS.md
│       │   ├── EXAMPLE.md
│       │   └── failure-categories.md                       ← generic categories; team-specific via customization
│       └── steps/
│           ├── 01-gather-failure-data.md
│           ├── 02-walk-failures.md
│           ├── 03-classify-and-remediate.md
│           └── 04-final-summary.md
│
├── planning/
│   └── review-implementation-package/
│       └── SKILL.md                                        ← AMEND (already done in EM-QE: GO routes to create-quality-package)
│
├── execution/
│   └── execute-increments/
│       └── SKILL.md                                        ← AMEND (already done in EM-QE: requires GO quality package)
│
├── quick-dev/
│   ├── document-quick-change/
│   │   └── SKILL.md                                        ← AMEND (Step 5 prompts: "how proven?" per AC + quality constraints in §12.2a)
│   └── execute-quick-change/
│       └── SKILL.md                                        ← (no behaviour change; doc-only note pointing at quality README)
│
├── qe/                                                     ← DELETE entire folder (superseded by quality/)
│
└── _registry/
    ├── skills.csv                                          ← REGENERATE via scripts/build-registry.py
    ├── skills.json                                         ← REGENERATE
    └── workflow-graph.yaml                                 ← AMEND: add quality stage, add anytime: audit-quality-coverage, review-test-failures

templates/
├── blocks/
│   └── quality/                                            ← NEW (from EM-QE)
│       ├── index.md
│       ├── quality-strategy.md
│       ├── test-approach.md
│       ├── test-design.md
│       ├── test-data-and-environments.md
│       ├── automation-and-cicd.md
│       ├── nonfunctional-quality.md
│       ├── defect-management.md
│       ├── quality-metrics-and-reporting.md
│       ├── test-case-increment.md                          ← NEW (from Branch qe-increment-shape; optional via composition gate)
│       ├── testability-classification.md                   ← NEW (generic Phase 0c output block)
│       └── failure-categories.md                           ← NEW (team-overridable categories table)
│
└── compositions/
    └── greenfield-quality-package.yaml                     ← NEW (from EM-QE + decision-gate for test-case-increment block)

config/
├── customizations/
│   ├── create-quality-package.toml.example                 ← NEW (test stack pinning, category vocab, framework defaults)
│   ├── execute-quality-increments.toml.example             ← NEW (artifact target-path conventions, runner command template)
│   ├── audit-quality-coverage.toml.example                 ← NEW (per-team trackers, status vocab)
│   ├── review-test-failures.toml.example                   ← NEW (team failure-category overrides)
│   ├── create-qe-package.toml.example                      ← DELETE (superseded)
│   └── README.md                                           ← AMEND (list the new examples)

_docs/
└── qe-analysis-3-methods.md                                ← (this file; reference during implementation)

_archive/
└── qe-stage-pre-merge/                                     ← NEW (snapshot of old .agents/skills/qe/ before deletion)
    └── README.md                                           ← brief: "what was here, why archived, where it went"
```

---

## (f) Create / Amend / Delete checklist

Use this as the implementation checklist. Items grouped by migration step
from section (c). Each item is one file (or one shell action). Check off
as you go.

### Step 1 — Adopt EM-QE wholesale into `.agents/skills/quality/`

**Create:**
- [ ] `.agents/skills/quality/README.md` (copy from EM-QE, add quick-dev section)
- [ ] `.agents/skills/quality/create-quality-package/SKILL.md` (copy from EM-QE)
- [ ] `.agents/skills/quality/create-quality-package/references/OVERVIEW.md`
- [ ] `.agents/skills/quality/create-quality-package/references/INPUTS-OUTPUTS.md`
- [ ] `.agents/skills/quality/create-quality-package/references/EXAMPLE.md`
- [ ] `.agents/skills/quality/create-quality-package/references/quality-disciplines.md`
- [ ] `.agents/skills/quality/create-quality-package/references/quality-in-the-lifecycle.md`
- [ ] `.agents/skills/quality/create-quality-package/steps/00-scope-target-repo.md`
- [ ] `.agents/skills/quality/create-quality-package/steps/01-quality-strategy.md`
- [ ] `.agents/skills/quality/create-quality-package/steps/02-test-design.md`
- [ ] `.agents/skills/quality/create-quality-package/steps/03-quality-engineering.md`
- [ ] `.agents/skills/quality/review-quality-package/SKILL.md`
- [ ] `.agents/skills/quality/review-quality-package/references/OVERVIEW.md`
- [ ] `.agents/skills/quality/review-quality-package/references/INPUTS-OUTPUTS.md`
- [ ] `.agents/skills/quality/review-quality-package/references/EXAMPLE.md`
- [ ] `.agents/skills/quality/review-quality-package/references/review-workflow.md`
- [ ] `templates/blocks/quality/index.md`
- [ ] `templates/blocks/quality/quality-strategy.md`
- [ ] `templates/blocks/quality/test-approach.md`
- [ ] `templates/blocks/quality/test-design.md`
- [ ] `templates/blocks/quality/test-data-and-environments.md`
- [ ] `templates/blocks/quality/automation-and-cicd.md`
- [ ] `templates/blocks/quality/nonfunctional-quality.md`
- [ ] `templates/blocks/quality/defect-management.md`
- [ ] `templates/blocks/quality/quality-metrics-and-reporting.md`
- [ ] `templates/compositions/greenfield-quality-package.yaml`

**Amend (already done in EM-QE — copy those amendments in too):**
- [ ] `.agents/skills/planning/review-implementation-package/SKILL.md` (GO → `create-quality-package`)
- [ ] `.agents/skills/execution/execute-increments/SKILL.md` (require GO from `review-quality-package`)

### Step 2 — Port Branch `execute-qe-increments` → `execute-quality-increments`

**Create:**
- [ ] `.agents/skills/quality/execute-quality-increments/SKILL.md` (port from Branch; rename; scrub Java/Maven/Cucumber to placeholders)
- [ ] `.agents/skills/quality/execute-quality-increments/references/OVERVIEW.md`
- [ ] `.agents/skills/quality/execute-quality-increments/references/INPUTS-OUTPUTS.md`
- [ ] `.agents/skills/quality/execute-quality-increments/references/EXAMPLE.md`
- [ ] `.agents/skills/quality/execute-quality-increments/steps/01-load-increment.md`
- [ ] `.agents/skills/quality/execute-quality-increments/steps/02-implement-artifacts.md` (+ KB-grounded reuse step)
- [ ] `.agents/skills/quality/execute-quality-increments/steps/03-verify.md`
- [ ] `.agents/skills/quality/execute-quality-increments/steps/04-user-review.md`
- [ ] `.agents/skills/quality/execute-quality-increments/steps/05-status-update.md`

**Amend:**
- [ ] `.agents/skills/quality/review-quality-package/SKILL.md` (add optional 7th review for TC-XXX shape conformance, conditional on execute-quality-increments being enabled)
- [ ] `.agents/skills/quality/review-quality-package/references/review-workflow.md` (document the 7th review)

### Step 3 — Port TC-XXX increment shape as an optional block

**Create:**
- [ ] `templates/blocks/quality/test-case-increment.md` (lifted from Branch `qe-increment-shape.md`, generalised)
- [ ] `.agents/skills/quality/create-quality-package/steps/02b-test-case-increments.md` (optional sub-step; gated by composition decision)

**Amend:**
- [ ] `templates/compositions/greenfield-quality-package.yaml` (add `test-case-increment` block + decision-gate keyed on `project.elicitation.uses_test_case_increments`)
- [ ] `.agents/skills/quality/create-quality-package/SKILL.md` (announce the optional sub-step in the workflow list)

### Step 4 — Generalise DCC `qe-coverage-check` → `audit-quality-coverage`

**Create:**
- [ ] `.agents/skills/quality/audit-quality-coverage/SKILL.md`
- [ ] `.agents/skills/quality/audit-quality-coverage/references/OVERVIEW.md`
- [ ] `.agents/skills/quality/audit-quality-coverage/references/INPUTS-OUTPUTS.md`
- [ ] `.agents/skills/quality/audit-quality-coverage/references/EXAMPLE.md`
- [ ] `.agents/skills/quality/audit-quality-coverage/references/coverage-report-format.md`
- [ ] `.agents/skills/quality/audit-quality-coverage/steps/01-locate-package-and-tracker.md`
- [ ] `.agents/skills/quality/audit-quality-coverage/steps/02-cross-reference.md`
- [ ] `.agents/skills/quality/audit-quality-coverage/steps/03-kb-tag-verification.md` (uses `navigate-knowledge-base`)
- [ ] `.agents/skills/quality/audit-quality-coverage/steps/04-produce-report.md`
- [ ] `.agents/skills/quality/audit-quality-coverage/steps/05-next-actions.md`

### Step 5 — Generalise DCC `qe-defect-review` → `review-test-failures`

**Create:**
- [ ] `.agents/skills/quality/review-test-failures/SKILL.md`
- [ ] `.agents/skills/quality/review-test-failures/references/OVERVIEW.md`
- [ ] `.agents/skills/quality/review-test-failures/references/INPUTS-OUTPUTS.md`
- [ ] `.agents/skills/quality/review-test-failures/references/EXAMPLE.md`
- [ ] `.agents/skills/quality/review-test-failures/references/failure-categories.md` (generic; team-overridable)
- [ ] `.agents/skills/quality/review-test-failures/steps/01-gather-failure-data.md`
- [ ] `.agents/skills/quality/review-test-failures/steps/02-walk-failures.md`
- [ ] `.agents/skills/quality/review-test-failures/steps/03-classify-and-remediate.md`
- [ ] `.agents/skills/quality/review-test-failures/steps/04-final-summary.md`
- [ ] `templates/blocks/quality/failure-categories.md` (categories table block, team-overridable)

### Step 6 — Testability check as Step 0 of `create-quality-package`

**Create:**
- [ ] `.agents/skills/quality/create-quality-package/steps/00b-testability-check.md`
- [ ] `.agents/skills/quality/create-quality-package/references/testability-classification.md`
- [ ] `templates/blocks/quality/testability-classification.md` (the output block)

**Amend:**
- [ ] `.agents/skills/quality/create-quality-package/SKILL.md` (insert step 00b in the workflow list, before 01)

### Step 7 — Reuse-analysis reference

**Create:**
- [ ] `.agents/skills/quality/create-quality-package/references/reuse-analysis.md` (generalised DCC Phase 3 lateral-thinking checklist)

**Amend:**
- [ ] `.agents/skills/quality/create-quality-package/steps/02-test-design.md` (reference reuse-analysis.md when authoring new cases)
- [ ] `.agents/skills/quality/execute-quality-increments/steps/02-implement-artifacts.md` (reference reuse-analysis.md as the AI-Gate cross-check)

### Step 8 — Do NOT merge `qe-code-scanner`; document the KB-as-test-suite-intelligence pattern

**Amend:**
- [ ] `.agents/skills/quality/README.md` (add "Test-suite intelligence via KB" section; point at `reverse-engineer-*` + `build-knowledge-base` + `navigate-knowledge-base`)

**No new files; no skill rename. DCC's `qe-code-scanner` is not ported.**

### Step 9 — Atlassian CLI: do NOT promote to a skill

**Decision options (pick one):**
- [ ] **Option A (recommended):** drop from scope entirely; DCC team keeps it in their own repo.
- [ ] **Option B:** move to `tools/atlassian-cli/` as an optional companion; add `tools/atlassian-cli/README.md` explaining it's optional and not framework-required.
- [ ] **Option C:** add a thin `jira-fetch` meta skill (mirror of `verify-source` shape) under `.agents/skills/meta/` that any skill may optionally invoke; gated on `project.toml` declaring Jira credentials.

**No skill in the quality stage may hard-depend on the CLI.** This is the test.

### Step 10 — Quick-dev integration (additive, surgical)

**Amend:**
- [ ] `.agents/skills/quick-dev/document-quick-change/SKILL.md` (Step 5: add per-AC "How will this be proven?" prompt; add "quality constraints" to §12.2a prompt list)
- [ ] `.agents/skills/quick-dev/execute-quick-change/SKILL.md` (doc-only: reference the quality stage's bypass policy)
- [ ] `.agents/skills/quality/README.md` (add "Quality in quick-dev" section, lifted from EM-QE)
- [ ] `.agents/skills/quality/create-quality-package/references/quality-in-the-lifecycle.md` (add explicit quick-dev row mapping each quality concern to its quick-dev carrier)

**Workflow-graph amendments:**
- [ ] `.agents/skills/_registry/workflow-graph.yaml`:
  - Add `quality` stage (order 4) — copy from EM-QE
  - Insert `create-quality-package` (gated by `review-quality-package`) between `review-implementation-package` and `execute-increments` in **both** `greenfield` and `brownfield` sequences
  - Add `audit-quality-coverage` and `review-test-failures` to the `anytime:` block
  - Add `execute-quality-increments` to the `anytime:` block (it's invoked on-demand after a GO quality package when the team uses TC-XXX flow)

### Registry + validation (after everything else)

- [ ] `python scripts/build-registry.py` → regenerates `_registry/skills.csv` + `skills.json`
- [ ] `python scripts/validate.py` → composition / workflow-graph / description-discipline / no-"phase"-leakage checks
- [ ] Verify slash-picker shows: `/create-quality-package`, `/review-quality-package`, `/execute-quality-increments`, `/audit-quality-coverage`, `/review-test-failures`
- [ ] Verify all 5 are reachable from `/framework-navigator`

### Config + customisation surface

**Create:**
- [ ] `config/customizations/create-quality-package.toml.example`
- [ ] `config/customizations/execute-quality-increments.toml.example`
- [ ] `config/customizations/audit-quality-coverage.toml.example`
- [ ] `config/customizations/review-test-failures.toml.example`

**Amend:**
- [ ] `config/customizations/README.md` (list the four new examples)
- [ ] `config/project.toml.example` (add `[project.elicitation]` keys: `testing_strategy`, `uses_test_case_increments`, `test_framework`, `test_runner`)

### Delete + archive (last, after everything green)

- [ ] `git mv .agents/skills/qe/ _archive/qe-stage-pre-merge/skills-qe/` (preserve history)
- [ ] Create `_archive/qe-stage-pre-merge/README.md` explaining what was here, why archived, where it went
- [ ] `git rm config/customizations/create-qe-package.toml.example` (superseded)
- [ ] Verify no remaining references to `.agents/skills/qe/` anywhere: `grep -r "skills/qe" .agents/ templates/ config/ scripts/ _docs/`

### Top-level doc updates

**Amend:**
- [ ] `README.md` (stages table: add `quality` row if not already there; remove any old `qe` row)
- [ ] `AGENTS.md` (no change expected — orientation is stage-agnostic; verify)
- [ ] `CHANGELOG.md` (entry: "Merged three QE skill candidates into single `quality` stage; see `_docs/qe-analysis-3-methods.md`")

---

## (g) Implementation session-plan (suggested chunking)

10 steps is too much for one focused session. Suggested split:

| Session | Steps covered | Rough scope |
|---|---|---|
| **A** | Steps 1, 10 (workflow-graph piece only) | Adopt EM-QE wholesale; wire upstream/downstream; wire workflow graph. Pause for review — the framework will be functional with just 2 quality skills. |
| **B** | Steps 2, 3 | Port `execute-quality-increments` and the optional `test-case-increment` block + composition gate. Now the fail-fast POC flow works end-to-end. |
| **C** | Steps 4, 5 | Generalise DCC's two operational skills (`audit-quality-coverage`, `review-test-failures`). Now the full 5-skill set exists. |
| **D** | Steps 6, 7, 8 | Add the testability gate, the reuse-analysis reference, and the KB-as-test-suite-intelligence docs. Polish. |
| **E** | Step 9 (decision), Step 10 (remaining quick-dev amendments), config + customisation surface, registry rebuild, validation, archive | Finalise, validate, archive the old `qe` folder. Final review. |

Each session ends with `scripts/build-registry.py` + `scripts/validate.py`
green and a checkpoint for human review.

