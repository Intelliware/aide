# theframework — Skills Test Results

Companion to `_docs/skills-test-plan.md`. Logs Fail / Partial verdicts and small improvements surfaced during the test pass.

## Index

| ID | Phase | Severity | Skill / Artifact | One-liner |
|---|---|---|---|---|
| F-001 | A.2 | Improvement (Resolved) | `scripts/validate.py` Check D | Per-file `<!-- validate: allow-phase-vocab -->` pragma added; pragma applied to 9 migration-doc files; validator now 0 errors / 2 (unrelated) warnings |
| F-002 | A.2 | Improvement (Resolved) | `scripts/validate.py` Check A | False-positive orphan warnings on direct-invocation per-instance KB blocks — fixed by widening Check A to scan skill markdown for direct path refs |
| F-003 | B.4 | Test-plan defect (Resolved) | `_docs/skills-test-plan.md` §B.4 | Pass criterion rewritten: "no UNRELATED lines touched (the override line itself may also gain the SKILL.md-mandated inline rationale comment)" |
| F-004 | B.5 | Framework defect (Resolved) | `scaffold-documentation` + `track-change` SKILL.md | Stale cross-references to `change-tracker-template.md`; canonical template already exists at `templates/blocks/shared/change-log.md`; cross-refs corrected |
| F-005 | C.4 | Framework defect (Resolved) | All 7 `reverse-engineer-*/SKILL.md` + 14 `re-*.yaml` compositions + `scaffold-documentation/SKILL.md` | RE output-structure binding added; validator Check H authored; tree-form locations and naming pinned |
| F-006 | C.9 | Mixed (Resolved) | `_docs/skills-test-plan.md` + `build-knowledge-base/steps/01-validate-target.md` | (a) test plan now populates `[[project.repos]]` before C.9; (b) build-knowledge-base step 1 fail-louds on empty repos array; source-docs/ fallback explicitly disallowed |
| F-007 | D.10 | Framework gap (Resolved) | project.toml schema + start-project step 03 + create-pr step 6 + new composition `project-change-log.yaml` + canonical block applies-to + new elicitation pattern | Project-level CHANGELOG.md now declared via `[project.change_log]`; same canonical block reused (no new block); start-project elicits, create-pr step 6 reads + appends |

---

## F-001 — Validator: stale-`phase` check has no allowlist

**Phase / step:** A.2
**Severity:** Improvement (not blocking; 0 errors emitted)
**Affected file:** `scripts/validate.py`, Check D
**Fix owner:** TBD

### Symptom
Phase A.2's run produced 16 "stale 'phase' language" warnings. On review, **all 16 are intentional migration-mapping mentions** that document the rename `Canonical Phase Shape → Canonical Increment Shape` and `PHASE-XXX → INC-XXX`. They appear in:

- `.agents/skills/execution/README.md` (1)
- `.agents/skills/planning/create-implementation-package/references/{OVERVIEW,canonical-increment-shape}.md` (5)
- `.agents/skills/planning/create-implementation-package/steps/plan-readiness-review.md` (1)
- `.agents/skills/planning/review-implementation-package/SKILL.md` (1)
- `.agents/skills/planning/review-implementation-package/references/{canonical-increment-shape-spec,review-workflow}.md` (6)
- `.agents/skills/requirements/create-requirements-package/references/process.md` (1)
- `templates/blocks/planning/README.md` (1)

These files have to reference the old vocabulary in order to explain the migration to readers who arrive with the legacy mental model.

### Recommended fix
Add an allowlist mechanism to Check D in `scripts/validate.py`. Two options, in order of preference:

1. **Per-file pragma** — let a file opt out of the stale-phase sweep with a `<!-- validate: allow-phase-vocab -->` HTML comment at the top. Cheap, explicit, no central list to drift.
2. **Path allowlist** — a small constant in the validator that exempts known migration-doc paths. Centralised but creates a list to maintain.

Either approach should keep the warning when "phase" appears in a *new* SKILL.md or block — that's the value of the check. We just want to silence it for the migration mappings.

### Why not fix now
Out of scope for the test pass. Logging here so it's tracked. Not blocking any subsequent test step.

---

## F-002 — Validator Check A reports false-positive orphans on per-instance KB blocks

**Status:** **Resolved during the test pass.**
**Phase / step:** A.2 (deep-dive triggered while reviewing the 2 orphan warnings)
**Severity:** Improvement (not blocking; 0 errors emitted)
**Affected file:** `scripts/validate.py`, Check A (lines 233-248)
**Fix owner:** Resolved by Mike + Claude during this test pass; uncommitted.

### Symptom
Check A reports two orphan blocks:

```
WARN templates/blocks/knowledge-base/repo-summary.md: orphan block (no composition references it)
WARN templates/blocks/knowledge-base/shared-entity.md: orphan block (no composition references it)
```

Both are false positives. The blocks are actively used by `build-knowledge-base` as direct-invocation per-instance templates — one render per repo (repo-summary) and one render per shared domain entity (shared-entity).

### Evidence the blocks are not orphans
- `kb-component.yaml` lines 34-44: an explicit "Related KB compositions / outputs (NOT covered here)" note that names both blocks as direct-invocation outputs, alongside `adr-template`.
- `kb-instance-root.yaml` lines 38-44: a note explaining that `repo-summary`, `component`, `shared-entity`, and `adr-template` all declare `applies-to: [kb-instance]` and that capability-index is the *only* kb-instance-scoped block intentionally promoted into the root composition.
- `build-knowledge-base/steps/02-scaffold-repos.md:19,53` — explicit "Render `templates/blocks/knowledge-base/repo-summary.md` …" instructions.
- `build-knowledge-base/steps/04-shared-pass.md:17,43` — explicit "Render `templates/blocks/knowledge-base/shared-entity.md` …" instructions.
- `build-knowledge-base/references/INPUTS-OUTPUTS.md:28,31` — both blocks declared as outputs of the skill.

### Root cause
Check A only counts a block as "used" if some composition's `blocks:` slug list mentions it. It does not consider direct path references in skill markdown (SKILL.md, steps/, references/). The framework explicitly supports a "no composition wrapper for one-file-per-instance outputs" pattern (kb-component.yaml line 39-43), so the validator's narrower view produces false positives on every block that follows that pattern.

### The asymmetry that makes it inconsistent
There are three blocks that play exactly the same role: `repo-summary`, `shared-entity`, `adr-template`. The first two are flagged; the third is not. The reason: `adr-template` is also listed in `greenfield-design-package.yaml:85` (the design package wraps an ADR section), which makes Check A see it as referenced. The first two aren't listed in any composition's `blocks:`, so Check A misses them. The validator's verdict on three structurally identical blocks is inconsistent.

### Recommended fix
Extend Check A's "referenced" set to also include any block whose path `templates/blocks/<slug>.md` is mentioned in any markdown file under `.agents/skills/` (SKILL.md, steps/, references/). Pseudocode:

```python
def check_a():
    referenced = set()
    # existing — composition blocks: lists
    for comp in discover_composition_files():
        for slug, _ in composition_block_slugs(comp):
            referenced.add(BLOCKS_ROOT / f"{slug}.md")
    # new — direct path references inside skills
    for md in SKILLS_ROOT.rglob("*.md"):
        text = md.read_text(...)
        for slug in re.findall(r"templates/blocks/([\w/-]+)\.md", text):
            referenced.add(BLOCKS_ROOT / f"{slug}.md")
    # rest unchanged
```

Effect:
- `repo-summary.md` and `shared-entity.md` clear (real direct uses found).
- `adr-template.md` continues to clear (now via direct refs *and* a composition).
- Genuinely orphaned blocks remain flagged, because nothing references them anywhere.

### Resolution
Implemented per the recommended fix above:
- Added `BLOCK_PATH_REF_RE` constant near the top of `scripts/validate.py`.
- Extended `check_a()` to walk every `.md` under `.agents/skills/` and add any `templates/blocks/<slug>.md` reference (where the target file exists) to the `referenced` set.
- Updated the orphan warning text from "(no composition references it)" to "(no composition or skill references it)" to reflect the wider check.

Re-run of `python3 scripts/validate.py` after the fix:
- Check A: `(no findings)` — the two false-positive warnings cleared.
- Total warnings: 20 → 18 (only the two cleared; everything else unchanged).
- Errors: still 0.

Genuine orphans would still be caught — nothing in the patch loosens detection; it widens the lookup of "what counts as a reference" in the direction the framework's own design notes documented.

---

## F-003 — Test-plan §B.4 pass criterion conflicts with `customize-framework` SKILL.md

**Phase / step:** B.4
**Severity:** Test-plan defect (cosmetic — does not affect framework correctness)
**Affected file:** `_docs/skills-test-plan.md` § Phase B.4 pass criteria
**Fix owner:** Test plan author (revise on next test pass)

### Symptom
Test plan §B.4 lists three pass criteria, the third of which is:

> [ ] No other lines touched

The `customize-framework` SKILL.md, in its Output section, requires:

> Each individual override carries an inline comment explaining the intent (why this is overridden, what would happen otherwise).

If the skill is run faithfully, the override line itself gains a trailing inline comment alongside the value change. Strictly read, "no other lines touched" excludes that. So a faithful skill execution would mark B.4 as Partial / Fail under a strict reading even though the skill behaved correctly.

### Resolution observed during the run
On B.4 the override line was first edited to change the value, then edited a second time to add the SKILL.md-mandated rationale comment. The wider TOML diff shows only `default_flow` changed semantically; no unrelated line was modified. We marked B.4 PASS under the more reasonable reading "no UNRELATED line touched".

### Recommended fix
Update test plan §B.4 pass criteria from:

```
- [ ] No other lines touched
```

to:

```
- [ ] No unrelated lines touched (the override line itself may also gain
      the SKILL.md-mandated inline rationale comment)
```

Alternative (equivalent, more verbose): split into two criteria — "value of `default_flow` is the new value" and "no line outside the override line is modified".

### Why this matters
A pass-criterion that conflicts with the SKILL.md spec means a faithful skill run looks like a defect. That's exactly the wrong outcome for a test plan; the criteria should fail when the skill misbehaves, not when it behaves correctly.

### Why not fix the test plan now
We're mid-pass; rewriting the plan during the run would invalidate everything ahead of us. Logging here so it's reflected in the next iteration of `_docs/skills-test-plan.md`.

---

## F-004 — Stale cross-references to a missing change-tracker template

**Status:** **Resolved during the test pass.**
**Phase / step:** B.5
**Severity:** Framework defect (broken cross-reference, not blocking)
**Affected files:**
- `.agents/skills/meta/scaffold-documentation/SKILL.md:38`
- `.agents/skills/meta/track-change/SKILL.md:24`
- `.agents/skills/meta/track-change/SKILL.md:36`

### Symptom
Three places in two SKILL.md files cite `references/change-tracker-template.md` (or `skills/meta/track-change/references/change-tracker-template.md`). That file does not exist anywhere under `.agents/skills/`.

### Root cause
Stale cross-references from the migration. `_docs/mapping.md:162` documents that the legacy template was generalised, not deleted:

> `_shared/templates/change-tracker-template.md` → `templates/blocks/shared/change-log.md` (generalized)

The canonical template **does** exist — it's `templates/blocks/shared/change-log.md`, a comprehensive block with `applies-to: [greenfield-requirements-package, greenfield-design-package, greenfield-implementation-package, brownfield-enhancement-spec, quick-dev-spec, kb-instance]`, designed for cross-stage use. Its own provenance note records the migration. The two SKILL.md files were simply never updated to point at the new location.

### Resolution
Updated all three cross-references to point at the canonical block:

```
templates/blocks/shared/change-log.md
```

Files changed:
- `scaffold-documentation/SKILL.md` (Step 5)
- `track-change/SKILL.md` (When NOT to use; Workflow step 2)

### Verification
- `grep -rn "change-tracker-template" .agents/` → no matches.
- `python3 scripts/validate.py` → 0 errors, 18 warnings (unchanged).
- Both SKILL.md files still ≤ 200 lines.

### Why this fix path
Creating a duplicate template under `track-change/references/` would have produced two sources of truth and inevitable drift. The canonical block already exists, is well-structured, and its `applies-to:` list explicitly enumerates every package type — exactly the cross-stage role the SKILL.md cross-references needed. Fixing the reference is the smaller, lower-risk change.

---

## F-006 — Empty `[[project.repos]]` during build-knowledge-base; skill fell back silently

**Phase / step:** C.9
**Severity:** Mixed — test-plan defect (didn't populate the array) + framework gap (skill didn't fail-loud).
**Affected files:**
- `_docs/skills-test-plan.md` (Phase B.1 / B.4 setup did not populate `[[project.repos]]` for the 7 OSS targets after switching to brownfield)
- `.agents/skills/knowledge-base/build-knowledge-base/SKILL.md` Step 1 / `steps/01-validate-target.md` (the validate-target gate did not surface the empty-repo case clearly)

### Symptom
At C.9, `build-knowledge-base` was invoked against the test KB. The SKILL.md "Inputs" section lists `[[project.repos]] array` as **required**, but the project.toml at `recipes-app/project.toml` had no repos enumerated. The build proceeded by treating `source-docs/<slug>/` subdirs as the canonical repo list — an undocumented fallback.

### Two interpretations of the fix

#### (a) Test-plan defect

The B.1 elicitation captured a single-repo greenfield project. B.4 flipped the flow to `brownfield` but did not also enumerate the 7 OSS source repos. A real brownfield run would have populated `[[project.repos]]` immediately after picking the brownfield flow.

**Fix in test plan:** insert a "populate `[[project.repos]]` for the 7 OSS targets" step between B.4 (customize-framework) and the start of Phase C. Or include it in a new `start-project` re-bootstrap step at the start of C.

#### (b) Framework gap

The `build-knowledge-base` SKILL.md declares `[[project.repos]]` required but the `steps/01-validate-target.md` doesn't (or didn't visibly) surface the empty-repos case as a hard halt with a clear message like:

> Halt: `project.toml` has no `[[project.repos]]` enumerated. The KB build needs each repo listed with its `path`, `code`, `name`, and `role`. Run `customize-framework` to add them, or re-run `start-project` with multi-repo mode.

A silent fallback to scanning `source-docs/<slug>/` is convenient for tests but masks a real production problem (e.g. an operator forgetting to populate repos and getting a partially-built KB).

### What I did during the test

Used `source-docs/<slug>/` as the canonical repo list. Hard-coded the 7 SHAs (one per CHANGE-TRACKER.md) as the `last_verified_against_commit` values. Domain inferred per-repo from the `<re-domain>-consumer/` subdirectory name. The build completed with 7 repos × ~15 components = 107 components.

### Recommended fix (priority order)

1. **Update the test plan** to include populating `[[project.repos]]` before C.9. Cheap, prevents recurrence.
2. **Tighten the framework**: `steps/01-validate-target.md` should hard-halt with a copyable error message when `[[project.repos]]` is empty AND `--use-source-docs-as-repos` is not explicitly passed. This makes silent fallbacks impossible.
3. **Document the source-docs fallback** in the SKILL.md if the team wants to keep it as a feature — e.g., a brownfield-onboarding pattern where `source-docs/` is what the operator started from.

### Why not fix now
Out of scope for the test pass. We're already mid-Phase-C; rewriting the project.toml's repo enumeration retroactively would invalidate the C.2-C.8 RE outputs (which were keyed by the on-disk source-docs/ structure, not by project.toml). Captured here for the next iteration of the test plan AND a small framework follow-up.

---

## F-007 — Project-level CHANGELOG.md unsupported by the framework

**Phase / step:** D.10
**Severity:** Framework gap (not blocking; `create-pr` step 6 silently no-ops)
**Affected files:**
- `config/project.toml.example` (no `[project.change_log]` slot)
- `config/SCHEMAS.md` (schema docs don't define a project changelog convention)
- `.agents/skills/meta/start-project/SKILL.md` + step files (don't elicit changelog choice)
- `.agents/skills/execution/create-pr/SKILL.md` (step 6 says "Conditional — only if the project maintains a changelog" but doesn't specify how to detect)
- `templates/compositions/pr-description.yaml` (no changelog block)

### Symptom
At D.10 (`create-pr`), step 6 ("Changelog entry") is gated on "if the project maintains a changelog". The framework provides **no canonical signal** for that gate to test. So in our test pass, step 6 silently skipped.

The framework already has a canonical change-log block (`templates/blocks/shared/change-log.md`) used for per-package CHANGE-TRACKER.md files. That block is artifact-agnostic by design. **What's missing is the wiring to apply it at project scope and the schema slot to declare the project does so.**

### Distinction: CHANGE-TRACKER.md vs. CHANGELOG.md
Both can be rendered from the **same canonical block**. They differ in what gets populated:

| Dimension | CHANGE-TRACKER.md (today) | CHANGELOG.md (proposed) |
|---|---|---|
| Scope | Per-package artifact | Per-project release stream |
| Audience | SDLC participants (BSAs, architects, reviewers) | End users, downstream developers |
| Granularity | Per-section / per-edit | Per release |
| Anchor | `0.1.0-doc.N` documentation version | `v1.2.0` semver release tag |
| Categories | Initial Extraction / Source Update / Correction / Restructure / Addition / Deprecation / Removal | Same Addition / Deprecation / Removal categories happen to align with Keep-a-Changelog |
| Cardinality per project | Many (one per package) | One |

The block's "Parts Affected" reference table is a **per-artifact vocabulary**; for a project-level CHANGELOG the values become user-facing feature areas (`auth`, `cart`, `search`).

### Recommended fix (no new block needed)

| Layer | Change |
|---|---|
| `templates/blocks/shared/change-log.md` | Add `project-change-log` to the `applies-to:` frontmatter list (1-line edit) |
| `templates/compositions/project-change-log.yaml` (new) | Single-block composition wrapping the canonical block. `default-output-path: "{project-root}/CHANGELOG.md"`. `default-output-shape: consolidated`. |
| `config/project.toml.example` + `SCHEMAS.md` | Add `[project.change_log]` table: `enabled` (bool), `path` (default `CHANGELOG.md`), `versioning_strategy` (semver / calver), optional `format` (`keep-a-changelog`). |
| `.agents/skills/meta/start-project/steps/03-elicit-project-context.md` | Add a sub-step asking "Does this project maintain a release-facing CHANGELOG.md?" with the schema fields above. Default: enabled = true for greenfield, false for quick-dev (small scoped changes don't usually warrant project-level changelogs). |
| `.agents/skills/execution/create-pr/SKILL.md` step 6 + `references/implementation-pr-workflow.md` | Read `[project.change_log]`. If `enabled = true`: render a new entry against the project-level composition, prepend to the file's "Unreleased" section (or create one). If `enabled = false`: skip silently (current behaviour, but now intentional rather than gap-driven). |
| `.agents/skills/execution/create-pr/references/INPUTS-OUTPUTS.md` | Document the new `[project.change_log]` input + the conditional CHANGELOG.md output. |
| `scripts/validate.py` | Optional new check: when `[project.change_log].enabled` is true, the project's CHANGELOG.md must exist and parse as the canonical block. |

### Why this matters
Two reasons:

1. **`create-pr` step 6 is currently undefined behaviour.** The skill's text gates on a condition the framework can't actually evaluate. Either the gate becomes determinate or the step gets removed; "silently skip" is the worst outcome because operators don't know whether they should have a changelog and aren't told.

2. **Schema reuse showcases the framework's principle.** The block-based architecture exists precisely so we can reapply one canonical block at multiple scopes. Adding a project-level CHANGELOG via schema + composition + skill wiring (no new block) is exactly the pattern theframework wants to demonstrate.

### Why not fix now
Out of scope for the test pass — implementing F-007 means a small composition + schema additions + start-project elicitation + create-pr step 6 wiring. ~30-60 minutes of focused work. Captured here for the framework follow-up alongside F-001, F-003, and F-006.

### Related
- F-006 (`[[project.repos]]` empty + silent fallback) is structurally identical — `create-pr` step 6's vague gate is a sibling of `build-knowledge-base` Step 1's vague required-input.
- F-004 (resolved) showed how the canonical block has wide reach via its `applies-to:` list — F-007's fix extends the same pattern.

---

## Resolution notes — post-test-pass batch (F-001 / F-003 / F-006 / F-007)

After Phase E closed, all four open findings were addressed in a single follow-up pass.

### F-001 — Resolution

`scripts/validate.py` Check D now honours a per-file pragma:

```
<!-- validate: allow-phase-vocab -->
```

Files containing the pragma are entirely exempt from the stale-phase sweep. The pragma works in both `.md` (HTML comment) and `.yaml` (#-flavoured comment via the same string match) — the check tests `if PHASE_VOCAB_ALLOW_PRAGMA in text`.

The pragma was applied to the 9 known migration-doc files:

- `.agents/skills/execution/README.md`
- `.agents/skills/planning/create-implementation-package/references/canonical-increment-shape.md`
- `.agents/skills/planning/create-implementation-package/references/OVERVIEW.md`
- `.agents/skills/planning/create-implementation-package/steps/plan-readiness-review.md`
- `.agents/skills/planning/review-implementation-package/references/canonical-increment-shape-spec.md`
- `.agents/skills/planning/review-implementation-package/references/review-workflow.md`
- `.agents/skills/planning/review-implementation-package/SKILL.md`
- `.agents/skills/requirements/create-requirements-package/references/process.md`
- `templates/blocks/planning/README.md`

**Validator state:** 18 → 2 warnings (the remaining 2 are pre-existing block-frontmatter notes, unrelated to F-001).

Genuine new uses of "phase" vocabulary in *new* SKILL.md or block files would still be flagged — the pragma opt-out is per-file, intentional, and visible in the source.

### F-003 — Resolution

`_docs/skills-test-plan.md` §B.4 pass criterion was rewritten from:

> [ ] No other lines touched

to:

> [ ] No unrelated lines touched (the override line itself may also gain the SKILL.md-mandated inline rationale comment — that is part of the override, not collateral damage; per F-003 fix)

The wording change preserves the original intent (catch accidental side-effects) while honouring `customize-framework`'s mandate to annotate overrides with intent-comments.

### F-006 — Resolution

Two-part fix:

**Framework side:** `build-knowledge-base/steps/01-validate-target.md` step 6 now opens with an explicit fail-loud guard:

```
if [[project.repos]] is empty:
  halt with copyable error explaining how to populate
  (customize-framework or re-run start-project with multi-repo)
  do NOT scan source-docs/ subdirectories as a fallback
```

The acceptance criteria block was also updated to require non-empty `[[project.repos]]`.

**Test-plan side:** `_docs/skills-test-plan.md` Phase C now contains an explicit "F-006 fix — `[[project.repos]]` enumeration step" inserted between sandbox prep and C.1, with all 7 `[[project.repos]]` blocks pre-authored. Operators following the test plan now populate the array before reaching C.9.

The two parts together close the gap on both axes: a real production user can no longer hit the silent fallback (framework fail-loud), and a future test-pass operator following this plan won't reproduce the test-time stumble.

### F-007 — Resolution

Six artifacts touched / authored to wire project-level CHANGELOG.md support:

1. **`templates/blocks/shared/change-log.md`** — `applies-to:` list extended with `project-change-log` (1-line frontmatter edit). No new block.
2. **`templates/compositions/project-change-log.yaml`** (new) — single-block composition wrapping the canonical change-log block. `default-output-path: "{project-root}/CHANGELOG.md"`, `default-output-shape: consolidated`.
3. **`config/project.toml.example`** — new `[project.change_log]` table with `enabled` / `path` / `versioning_strategy` / `format` / `parts_affected_vocabulary` fields, all with defaults.
4. **`config/SCHEMAS.md`** — new `[project.change_log]` schema section documenting each field, distinguishing it from per-package CHANGE-TRACKER.md, and noting the canonical-block reuse.
5. **`.agents/skills/meta/start-project/steps/03-elicit-project-context.md`** — new sub-step 4 elicits the changelog choice. Defaults: `enabled = true` for greenfield/brownfield, `enabled = false` for quick-dev. Sub-step ordering renumbered (decision-table elicitation moved to sub-step 5).
6. **`.agents/skills/execution/create-pr/SKILL.md`** — step 6 rewritten to read `[project.change_log]` from project.toml: silent skip when `enabled = false` or table absent; render-and-prepend-entry when `enabled = true`.
7. **`references/elicitation-patterns/project-change-log.md`** (new) — full elicitation script for sub-step 4: primary yes/no question, four follow-ups for each field, gotchas, edit-don't-elicit modes.

The validator's Check G (elicitation-pattern resolution) initially flagged the new composition's pointer at the elicitation file as missing — the pattern file was authored to close that error. Final validator state: 0 errors, 2 warnings (the same two pre-existing block-frontmatter notes).

**Architectural principle preserved:** zero new blocks; the canonical change-log block is reused at a new scope via `applies-to:` extension. F-007's fix is the simplest possible expression of "blocks are reusable; new scopes mean new compositions, not new blocks".
