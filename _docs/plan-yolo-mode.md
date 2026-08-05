# Plan — Add YOLO mode to SDLC skills

**Branch:** `mm/add-all` (Q1 answered 2026-04-30 — continue on `mm/add-all` rather than open a fresh release branch).
**Status:** Plan only — no source files modified yet.
**Authored:** 2026-04-30
**Last revised:** 2026-04-30 — Layer 3 (runtime trigger-phrase override) brought into scope (Q3 answered).
**Driver:** User feedback that the per-section acknowledgement work landed in 1.4.0 (`mm/add-ack`) is too chatty for some sessions. YOLO is the bypass: collapse the per-section / per-item / per-step ack gates added in 1.4.0 to a single per-document ack at assembly time. The pre-1.4.0 / `main` baseline already had a document-level ack — YOLO restores that as the only surviving gate.

**YOLO precedence (read at every skill entry):**

```
invocation-phrase override   >   project.toml   >   default (false)
```

- Layer 1 — `project.yolo_mode` in `project.toml`. Persistent project default.
- Layer 3 — runtime trigger-phrase override. The user's invocation phrase contains `YOLO` (case-insensitive) → force on for this run only. Or contains `step-by-step` / `no YOLO` → force off for this run only. Does not write `project.toml`.
- Layer 2 (per-skill toggles) remains explicitly out of scope (§8).

Prerequisite reading: `_docs/plan-restore-acknowledgement.md` (the 1.4.0 plan this proposal inverts on demand).

---

## 1. Goal

Introduce a single project-level toggle, `project.yolo_mode`, that bypasses the three 1.4.0 acknowledgement layers (Changes A / B / C) on the four SDLC create/execute skills. When the toggle is `true`, the skill runs as it did on `main` (one document-level ack at assembly time). When the toggle is `false` (default), 1.4.0 behaviour is preserved unchanged.

Four concrete deliverables:

- **(D1) Project-toml field.** Add `yolo_mode = false` (default) to `[project]` in `project.toml`; surfaced via `start-project` elicitation and overridable via `customize-framework`.
- **(D2) YOLO-override clauses.** Add a YOLO-override clause, byte-identically, at every 1.4.0 ack site. Sites: 4 SKILL.md, 9 step files, 2 process.md, 4 block templates, 2 workflow refs.
- **(D3) Runtime trigger-phrase override.** The four SDLC SKILL.md files honour `YOLO` / `step-by-step` (or `no YOLO`) keywords in the user's invocation phrase, applied for the duration of that single skill run, without writing `project.toml`.
- **(D4) Test-plan integration.** Rename `_docs/skills-test-plan.md §0` mode from "YOLO" to `step-by-step` / `unattended`; extend A.5 with YOLO sentinel greps; add four `D.x.Y` sub-step variants exercising YOLO behaviour, plus two `D.x.YR` sub-steps exercising the runtime override.

---

## 2. Scope

### In scope

| Layer | Files |
|---|---|
| Project-toml schema + start-project | `meta/start-project/SKILL.md` + the step file that writes `project.toml`; the `project.toml` example/snippet wherever it lives in `references/` |
| Customize override | `meta/customize-framework/SKILL.md` (only if it maintains an explicit list of overridable scalars; otherwise no edit needed since the skill is composition-aware) |
| SKILL.md (×4) | `requirements/create-requirements-package`, `design/create-design-package`, `planning/create-implementation-package`, `execution/execute-increments` |
| Step files (×9) | the 9 step files Stage A of `mm/add-ack` touched: `requirements/steps/{01-discovery,03-analysis,04-writing}.md`, `design/steps/{01-discovery,02-design}.md`, `planning/steps/{codebase-analysis,test-planning,plan-readiness-review}.md`, `execution/steps/02-execute-plan.md` |
| process.md (×2) | `requirements/.../references/process.md`, `design/.../references/process.md` |
| Block templates (×4) | `templates/blocks/requirements/{functional-requirements,business-logic-rules}.md`, `templates/blocks/design/{api-design,database-design}.md` |
| Workflow refs (×2) | `requirements/.../references/{discovery-workflow,analysis-workflow}.md` |
| CHANGELOG | bump to 1.5.0 |
| Test plan | `_docs/skills-test-plan.md` (§0 rename; A.5 extension; four `D.x.Y` sub-steps; §9 coverage-matrix footnote) |

### Out of scope

- **Quick-dev skills** (`quick-dev/*`). Already low-ceremony; nothing to bypass.
- **Review skills** (`review-*-package`, `meta/review-adversarial`, `meta/review-edge-case-hunter`). Their gates are readiness gates, not author checkpoints. YOLO does not collapse them.
- **Knowledge-base and reverse-engineering skills.** Not affected by 1.4.0; nothing to bypass.
- **The document-level acknowledgement at assembled-package time.** Stays in YOLO — it's the surviving gate.
- **`--non-interactive` mode in `capture-solution-context` / `generate-ai-rules`.** Different concept (auto-fill vs. interactive elicitation); orthogonal to YOLO.
- **Per-skill YOLO toggles.** Single project-wide toggle only.
- **Runtime-only YOLO that does not persist to `project.toml`.** Future work; see §9 question 3.
- **Tooling: scripts, hooks, validators.** Reversion is git-only (same hygiene as `mm/add-ack`).

---

## 3. The concrete changes

### Change Y0 — `project.toml` toggle

Add to the `[project]` block in the project-toml schema/example:

```toml
[project]
# ...existing fields...
yolo_mode = false  # When true, SDLC skills (create-requirements-package, create-design-package, create-implementation-package, execute-increments) bypass per-section / per-item / per-step acknowledgement gates and only acknowledge the assembled package once at the end. Review skills are not affected. See _docs/plan-yolo-mode.md.
```

`start-project` elicitation: add one question after the existing `default_flow` elicitation:

> "Do you want to enable YOLO mode (skip per-section acknowledgement during requirements/design/planning/execution; ack once per document at assembly time)? [y/N]"

Default: `N`. If the user says yes, write `yolo_mode = true`.

`customize-framework`: standard scalar override — should work without code changes since the skill is composition-aware. Add `yolo_mode` to the example list of overridable scalars in the SKILL.md if such a list is maintained.

### Change Y1 — SKILL.md YOLO override paragraph

Insert immediately after the `## Verification rule (always-on)` section in each of the 4 SDLC SKILL.md files:

```markdown
### YOLO override

This skill resolves YOLO mode at entry using the precedence:

1. **Invocation-phrase override.** If the user's invocation phrase contains `YOLO` (case-insensitive, whole word), force YOLO on for this run only — do not write `project.toml`. If the phrase contains `step-by-step` or `no YOLO`, force YOLO off for this run only. Examples: "create the requirements package YOLO", "YOLO create the requirements package", "create the requirements package step-by-step".
2. **Project default.** Otherwise, read `project.yolo_mode` from `project.toml`. Default is `false`.

When YOLO is active (by either path), this skill bypasses per-section, per-item, and per-step acknowledgement gates. The Verification rule still applies, but only fires once per package — at the document-level acknowledgement at assembly time. Review skills (`review-*-package`) are unaffected.

**Announce the resolved mode at skill entry**, naming the source:
- "YOLO mode active (project default) — only the assembled-package acknowledgement will fire."
- "YOLO override accepted from invocation phrase — single-run only; `project.toml` unchanged."
- "Step-by-step override accepted from invocation phrase — single-run only; `project.toml` unchanged."

A runtime override applies for **this skill invocation only**. The next skill invocation re-resolves from `project.toml`.

**Edge cases.** If both `YOLO` and `step-by-step` appear in the invocation phrase, halt and ask the user which mode to use — do not assume. Match `YOLO` / `step-by-step` / `no YOLO` as whole words, case-insensitive, in the **invocation phrase only** (the user message that triggers the skill). Do not scan composition blocks, prior conversation, or files.
```

The text is **byte-identical** across the four SKILL.md files. Two greps verify consistency:

```
grep -rn "### YOLO override" .agents/skills/                              # → 4 hits
grep -rn "YOLO override accepted from invocation phrase" .agents/skills/  # → 4 hits (Layer 3)
```

### Change Y2 — step file YOLO branch in `## Acknowledgement checkpoint`

Insert as the first line of every existing `## Acknowledgement checkpoint` section in the 9 step files:

```markdown
**YOLO branch:** Skip this checkpoint when `project.yolo_mode = true`; the document-level checkpoint at the end of the writing/execution step is the surviving gate.
```

Byte-identical across the 9 step files. Single grep:

```
grep -rn "Skip this checkpoint when" .agents/skills/   # → 9 hits (one per ack-checkpoint step file)
```

### Change Y3 — `process.md` YOLO branch on Step 0 row

In both `requirements/.../references/process.md` and `design/.../references/process.md`, replace the post-1.4.0 Step 0 row.

Before:
```
| 0 | Section relevance check (unconditional) | Ask Yes / No (with reason) / Skip / Not sure for every block. Record outcome in the completeness tracker before drafting. |
```

After:
```
| 0 | Section relevance check (unconditional unless YOLO) | Ask Yes / No (with reason) / Skip / Not sure for every block. Record outcome in the completeness tracker before drafting. **YOLO branch:** when `project.yolo_mode = true`, ask once at the start of the writing step in a single batch covering all blocks; do not loop per block. |
```

### Change Y4 — block templates YOLO branch in `AUTHORING RULE` HTML comment

Append to the existing HTML-commented authoring rule in each of the 4 block templates (the `-->` closing line moves down to wrap this paragraph too). The block remains hidden from the assembled package because it stays inside the HTML comment:

```
YOLO branch (`project.yolo_mode = true`): draft the block in one pass and present once at the end with a single ack. Do not loop per item.
```

Byte-identical across the four templates. Grep:

```
grep -rn "YOLO branch" templates/blocks/   # → 4 hits
```

### Change Y5 — workflow refs YOLO branch on per-sub-step ask

In both `requirements/.../references/discovery-workflow.md` and `requirements/.../references/analysis-workflow.md`, immediately after the post-1.4.0 sentence:

> Before each sub-step, ask the user whether the sub-step applies. If they say "Skip" or "No (with reason)", record the outcome and proceed to the next sub-step. Do not assume relevance.

Append:

> **YOLO branch:** when `project.yolo_mode = true`, ask once at the start of the workflow in a single batch covering all sub-steps; do not loop per sub-step.

### Change Y6 — Test-plan integration

Three edits to `_docs/skills-test-plan.md`:

**(a) §0 rename.** Replace "YOLO mode" with "Unattended mode" throughout §0. Update the "YOLO behaviour" column header in the result-class table to "Unattended behaviour". Approximately 30 occurrences. Add a one-paragraph note at the head of §0:

> **Naming note (added 1.5.0).** This document's continuous-execution mode is called `unattended` (not `YOLO`). The term "YOLO" is reserved for the skill-execution flag `project.yolo_mode` introduced in 1.5.0 (see `_docs/plan-yolo-mode.md`). The two are different toggles on different layers — this document tests the harness; the framework ships the skill flag.

**(b) A.5 extension.** Add five new pass criteria to the existing static-grep step:

- `[auto]` `grep -rn "### YOLO override" .agents/skills/` returns exactly 4 hits (the four SDLC SKILL.md files).
- `[auto]` `grep -rn "YOLO override accepted from invocation phrase" .agents/skills/` returns exactly 4 hits (the runtime-override clause from Layer 3 is present in each SDLC SKILL.md).
- `[auto]` `grep -rn "Skip this checkpoint when" .agents/skills/` returns the expected step-file count (9 unless the count drifts at landing — record the actual figure in the test-plan update).
- `[auto]` `grep -rn "YOLO branch" templates/blocks/` returns exactly 4 hits (the four large block templates).
- `[auto]` `grep -rn "yolo_mode" .agents/skills/` returns hits only inside the four SDLC skills + `start-project` elicitation; zero hits inside `quick-dev/`, `review-*`, `reverse-engineering/`, `knowledge-base/`. Confirms scope discipline.

**(c) Four new D.x.Y sub-steps.** D.2.Y, D.4.Y, D.6.Y, D.8.Y. Each follows the existing parent step but flips `project.yolo_mode = true` in setup and inverts the `(1.4.0 ack-restoration)` user criteria. Pattern (D.2.Y exemplar):

```
### D.2.Y  create-requirements-package — YOLO mode
**Sandbox prep:** `customize-framework` sets `project.yolo_mode = true` in `project.toml`. Confirm via `grep yolo_mode project.toml`.
**Trigger:** "Create the requirements package for Recipes (YOLO)."
**Inputs:** Same as D.2.
**Expected outputs:** Same composition blocks as D.2.
**Pass criteria:**
- [ ] [auto] All composition blocks present (same as D.2)
- [ ] [auto] Each FR has at least one AC (same as D.2)
- [ ] [user] **(YOLO)** Skill announces "YOLO mode active — only the assembled-package acknowledgement will fire" at entry.
- [ ] [user] **(YOLO)** No per-step `Acknowledgement checkpoint` fires during the run (operator observes 0 mid-step pauses).
- [ ] [user] **(YOLO)** Section relevance asked once in a batch up front, NOT per block.
- [ ] [user] **(YOLO)** functional-requirements.md and business-logic-rules.md drafted in one pass each, single ack at end of block.
- [ ] [user] **(YOLO)** Document-level "User has acknowledged the assembled package" gate DOES fire at end of 04-writing.md.
- [ ] [auto] No [NEEDS CLARIFICATION:] markers left.
**Rollback:** rm -rf docs/requirements && customize-framework reset yolo_mode=false.
```

D.4.Y, D.6.Y follow the same template scoped to design and planning. D.8.Y is smaller — only one `(1.4.0 ack-restoration)` user criterion exists in D.8 (the Stage-1 reinforcement on `02-execute-plan.md`), so D.8.Y inverts that single criterion plus the announcement check.

**(c.2) Runtime-override sub-steps (D.2.YR, D.4.YR).** Two new sub-steps exercising Layer 3 — the trigger-phrase override that does not persist to `project.toml`. Pattern (D.2.YR exemplar):

```
### D.2.YR  create-requirements-package — YOLO via invocation phrase (no project.toml write)
**Sandbox prep:** Confirm `project.yolo_mode = false` (or absent) in `project.toml`. No customize-framework call.
**Trigger:** "Create the requirements package for Recipes YOLO."
**Expected outputs:** Same composition blocks as D.2.
**Pass criteria:**
- [ ] [user] **(YOLO Layer 3)** Skill announces "YOLO override accepted from invocation phrase — single-run only; project.toml unchanged."
- [ ] [user] **(YOLO Layer 3)** No per-step Acknowledgement checkpoint fires (same as D.2.Y).
- [ ] [user] **(YOLO Layer 3)** Single document-level "User has acknowledged the assembled package" gate fires.
- [ ] [auto] **(YOLO Layer 3)** project.toml is unchanged after the run: `grep yolo_mode project.toml` returns the original (false / absent), not `true`.
- [ ] [auto] **(YOLO Layer 3)** Re-running the skill without the YOLO keyword (e.g., "create the requirements package for Recipes") falls back to step-by-step behaviour — proves the override is single-run.
**Rollback:** rm -rf docs/requirements (project.toml needs no rollback — it was never written).
```

D.4.YR mirrors for design. Two sub-steps (not four) is enough — the runtime override is a single-mechanism behaviour and exercising it on two of the four SDLC skills proves the pattern; the other two (planning, execution) are covered by the SKILL.md sentinel grep in A.5.

Inverse-direction sub-step (optional, D.2.YS): "set `project.yolo_mode = true`, then invoke with `step-by-step` keyword, verify YOLO is bypassed for this run." Worth including if you want full coverage of the override-down case; can be deferred otherwise.

**(d) §9 coverage-matrix footnote.** Add a row (or footnote) noting that the four SDLC ack-affected skills are now tested in three configurations: step-by-step in D.2/D.4/D.6/D.8, YOLO via project.toml in D.2.Y/D.4.Y/D.6.Y/D.8.Y, and YOLO via invocation phrase in D.2.YR/D.4.YR.

---

## 4. Stage breakdown (one commit per stage; each independently revertible)

| Stage | Commit message | Files | Approx delta |
|---|---|---|---|
| **0** | `docs(plan): add YOLO mode plan (mm/add-yolo)` | `_docs/plan-yolo-mode.md` (new) | +~250 |
| **1** | `feat(yolo): add project.yolo_mode toggle + start-project elicitation` | `start-project` SKILL + step; `project.toml` schema/example | +~30 |
| **2** | `feat(yolo): add YOLO override section to 4 SDLC SKILL.md files (project default + invocation-phrase override)` | 4 SKILL.md | +~60 |
| **3** | `feat(yolo): add YOLO branch to 9 step-file Acknowledgement checkpoints` | 9 step files | +~18 |
| **4** | `feat(yolo): add YOLO branch to process.md + 2 workflow refs` | 2 process.md + 2 workflow refs | +~12 |
| **5** | `feat(yolo): add YOLO branch to 4 large block-template authoring rules` | 4 block templates | +~12 |
| **6** | `docs(test-plan): rename §0 YOLO→unattended; extend A.5; add D.x.Y + D.x.YR YOLO cases` | `_docs/skills-test-plan.md` | +~110 |
| **7** | `chore(release): bump 1.5.0 — YOLO mode` | `CHANGELOG.md`, version files | +~15 |

Stages 1–5 are independent and can land in any order or partially. Stage 0 lands first. Stage 6 should land after Stages 1–5 so the static greps in A.5 actually pass. Stage 7 lands last.

**Hygiene rules** (same as `mm/add-ack`):

- One stage = one commit.
- Each commit message references this plan file (`_docs/plan-yolo-mode.md`).
- Each commit body lists the files touched.

---

## 5. Reversion strategy — git-only

Same model as `mm/add-ack`. No inline markers; sentinels are grep-locatable:

```bash
grep -rln "### YOLO override" .agents/skills/                              # Stage 2 — Layer 1 + 3 clause heading
grep -rln "YOLO override accepted from invocation phrase" .agents/skills/  # Stage 2 — Layer 3 (runtime override)
grep -rln "Skip this checkpoint when" .agents/skills/                       # Stage 3
grep -rln "unconditional unless YOLO" .agents/skills/                       # Stage 4 (process.md row)
grep -rln "YOLO branch" .agents/skills/ templates/blocks/                   # Stages 4 + 5 (combined)
grep -rln "yolo_mode" .                                                     # Stages 1 + everything
```

**Full revert:** `git revert <stage-7-sha> ... <stage-1-sha>` in reverse order of landing.

**Partial revert:** each stage is one commit; revert any individual stage independently.

**Verification after revert:** zero matches from the stage-specific grep above.

---

## 6. Risks

| Risk | Mitigation |
|---|---|
| Drift between the YOLO override sentence and the existing 1.4.0 ack text. | One canonical sentence per gate type; copy-pasted byte-identically. Each grep above must return the expected file count exactly. |
| Silent-skip foot-gun: user toggles `yolo_mode` and forgets. | Stage-2 SKILL.md text mandates announcement at entry. Recorded in the change tracker the first time the skill fires under YOLO. |
| Adversarial-review interaction. | Stage-2 SKILL.md text states "Review skills are unaffected." A.5 grep confirms zero `yolo_mode` hits in `review-*` and `meta/`. |
| Document-level ack accidentally suppressed. | The pre-1.4.0 "User has acknowledged the assembled package" checkbox in `04-writing.md` / `02-design.md` / `plan-readiness-review.md` is NOT touched by Stages 1–5. D.x.Y test cases assert it fires. |
| Naming clash with test-plan §0 mode. | Stage 6 renames §0 mode to "unattended" before 1.5.0 ships. Verified via §0 lead-paragraph note. |
| YOLO leaks into quick-dev or review skills. | Stage 2 text scopes to the four SDLC skills explicitly. A.5 grep assertion catches any leak. |
| Handoff phrases auto-chain into the next stage without surfacing the package. | Stage 2 SKILL.md text + step-file YOLO branch both name the document-level checkpoint as the surviving gate; handoff still routes through it. D.x.Y user criterion explicitly verifies. |
| **(Layer 3)** False positive on the `YOLO` keyword — e.g., a feature description contains the word "YOLO" and triggers the override unintentionally. | Match `YOLO` as a whole word, case-insensitive, in the **invocation phrase only** (the user message that triggers the skill). Do not scan composition blocks, prior conversation, or files. The trigger surface is one string: the launching message. Documented in Stage 2 SKILL.md text. |
| **(Layer 3)** Override silently persists or leaks into the next skill invocation. | Stage 2 SKILL.md text mandates "single-run only" announcement and re-resolves precedence at every skill entry. D.2.YR pass criterion verifies `project.toml` unchanged after the run. |
| **(Layer 3)** Conflicting keywords in one phrase (`YOLO` and `step-by-step` both present). | Stage 2 SKILL.md text adds: "If both YOLO and step-by-step appear, halt and ask the user which mode to use. Do not assume." Edge case; halts cleanly rather than guessing. |

---

## 7. Acceptance check (definition of done)

- [ ] `project.toml` schema includes `yolo_mode = false` (default) under `[project]`.
- [ ] `start-project` elicitation asks the YOLO question and writes the chosen value.
- [ ] All four SDLC SKILL.md files contain the byte-identical `### YOLO override` section, including both the Layer-1 (project default) and Layer-3 (invocation-phrase override) sub-clauses.
- [ ] All four SDLC SKILL.md files contain the byte-identical "YOLO override accepted from invocation phrase" announcement string (Layer 3 sentinel).
- [ ] All nine ack-step files contain the byte-identical `**YOLO branch:**` first line in their Acknowledgement checkpoint.
- [ ] Both process.md files show the post-Y3 Step 0 row (`unconditional unless YOLO`).
- [ ] All four large block templates carry the appended YOLO branch inside the existing HTML comment (no leakage into the assembled package).
- [ ] Both workflow refs carry the post-Y5 sentence.
- [ ] CHANGELOG records 1.5.0 with a one-line entry pointing at this plan.
- [ ] No file outside §2 In Scope is modified.
- [ ] Test plan §0 reads "step-by-step" / "unattended" — no remaining "YOLO" references that mean the test-runner mode.
- [ ] Test plan A.5 has the four new YOLO sentinel checks.
- [ ] D.2.Y, D.4.Y, D.6.Y, D.8.Y exist and assert the inverted ack behaviour (Layer 1 — project.toml default).
- [ ] D.2.YR, D.4.YR exist and assert the runtime-override behaviour (Layer 3 — invocation phrase, no project.toml write).
- [ ] §9 coverage matrix footnotes the tri-configuration coverage (step-by-step + Layer 1 + Layer 3) of the four ack-affected skills.

---

## 8. Out of scope (explicitly NOT doing)

- **Layer 2 — per-skill YOLO toggles** (e.g., on for design, off for requirements). Single project-wide toggle plus single runtime override only. Granularity below the project level not in scope.
- A dedicated `--yolo` CLI flag. The runtime override (Layer 3) is keyword-driven from the natural-language invocation phrase, not a structured CLI argument. Skills are invoked through trigger phrases, not flags.
- Quick-dev YOLO. Already low-ceremony.
- Review-skill YOLO. Readiness gates, not author checkpoints.
- New tooling, hooks, or validators. Reversion is git-only (same hygiene as `mm/add-ack`).
- Touching `_archive/` (read-only reference tree).
- Touching the `bmad-*` plugin skills.

---

## 9. Open questions — resolved

| # | Question | Answer (2026-04-30) |
|---|---|---|
| 1 | Branch strategy — fresh `mm/add-yolo` or continue on `mm/add-all`? | **Continue on `mm/add-all`.** |
| 2 | Version bump — 1.5.0 (minor) or 1.4.1 (patch)? | **1.5.0** — new `project.toml` field + new user-facing behaviour mode. |
| 3 | Bring Layer 3 (runtime trigger-phrase override) into scope, or defer? | **In scope.** Folded into Stage 2 SKILL.md edits and Test-plan §6 D.x.YR sub-steps. |

No remaining open questions. Plan is ready for Stage 1 work to begin pending operator go-ahead.
