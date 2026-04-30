# Plan — Restore Per-Section Acknowledgement to Greenfield Skills

**Branch:** `mm/add-ack`
**Status:** Plan only — no skill files modified yet.
**Authored:** 2026-04-29
**Driver:** User feedback that the new greenfield skills under `.agents/skills/` request less per-section acknowledgement than the originals in `_archive/requirements-package/`, `_archive/solution-design-package/`, `_archive/implementation-planning/`. See the analysis in this conversation's preceding turn for the supporting evidence.

---

## 1. Goal

Bring the foreground reading path of the SDLC skills (`SKILL.md` + `steps/*.md`) back to a level of per-section acknowledgement comparable to the original archive playbooks, **without** rolling back the composition-aware / just-in-time architecture introduced in the unification effort.

Three concrete changes:

- **(A) Re-promote "verify understanding"** in every SKILL.md and step file so it appears as a top-level rule, not a single bullet inside a 7-step table.
- **(B) Make the Section Relevance Check unconditional** — ask Yes / No / Skip / Not sure for every section, not only when relevance "is in question."
- **(C) Add explicit "present, wait, confirm" loops between sub-sections of large blocks** — specifically `requirements/functional-requirements`, `requirements/business-logic-rules`, `design/api-design`, `design/database-design`. The current per-artifact acknowledgement is too coarse for these blocks because each contains many independent items.

## 2. Scope

### In scope

| Skill | Files in scope |
|---|---|
| `create-requirements-package` | `SKILL.md`, `steps/01-discovery.md`, `steps/03-analysis.md`, `steps/04-writing.md`, `references/process.md`, `references/discovery-workflow.md`, `references/analysis-workflow.md`, `references/requirements-writing-workflow.md` |
| `create-design-package` | `SKILL.md`, `steps/01-discovery.md`, `steps/02-design.md`, `references/process.md`, `references/solution-discovery-workflow.md`, `references/solution-design-workflow.md` |
| `create-implementation-package` | `SKILL.md`, `steps/codebase-analysis.md`, `steps/test-planning.md`, `steps/plan-readiness-review.md` |
| `execute-increments` | `SKILL.md`, `steps/02-execute-plan.md` (only — gates 03/04/05 are already strict; light reinforcement only) |
| Block templates | `templates/blocks/requirements/functional-requirements.md`, `business-logic-rules.md`; `templates/blocks/design/api-design.md`, `database-design.md` |

### Out of scope

- The `review-*` skills — they already operate section-by-section by nature; no acknowledgement gap observed.
- The `quick-dev/*` skills — quick-dev is intentionally low-ceremony.
- The `knowledge-base/*` and `reverse-engineering/*` skills — different interaction model; no user feedback received.
- The composition YAML files under `templates/compositions/` — block ordering and gates stay as-is.
- The `_archive/` tree — read-only reference; do not modify.
- The `bmad-*` skills under `.claude/skills/` — third-party plugin skills.

## 3. The three changes — concrete edit specifications

All inserted text MUST be wrapped between marker comments so reversion is grep-and-delete:

```
<!-- ack-restore:begin -->
... new content ...
<!-- ack-restore:end -->
```

Existing line edits (where content is replaced rather than added) MUST be preceded by a comment of the form:

```
<!-- ack-restore:edit was="<original-text-shortened>" -->
```

These marker comments are the single source of truth for reversion (see §5).

### Change A — Re-promote "verify understanding"

**Intent:** Move the verify-and-summarize-back rule out of step-4-of-7 obscurity and into a top-level section every reader sees.

**Edit per skill SKILL.md (requirements / design / planning / execution):**

Insert a new section immediately before `## Workflow`:

```markdown
<!-- ack-restore:begin -->
## Verification rule (always-on)

After every drafted artifact and before any file write, summarize back to the user what you understood and what you produced; wait for their explicit acknowledgement (or correction) before proceeding. This applies regardless of which step you are on. Halt the step if the user disagrees.
<!-- ack-restore:end -->
```

**Edit per step file (`steps/*.md`) that ends with "produce artifact and proceed":**

Add a final sub-section `## Acknowledgement checkpoint` (wrapped in markers) that lists the artifact name produced by the step and explicitly tells the runtime to wait for user sign-off before moving to the next step. Example for `requirements/.../steps/03-analysis.md`:

```markdown
<!-- ack-restore:begin -->
## Acknowledgement checkpoint

Before proceeding to `steps/04-writing.md`:

1. Summarize the risk register, constraint register, and gap analysis in chat.
2. Ask: "Have I captured the analysis correctly? Anything missing or wrong?"
3. Wait for explicit confirmation. Do not infer.
4. If the user requests changes, revise the affected artifact(s) and repeat the summary.
<!-- ack-restore:end -->
```

**Edit per references/process.md (in each skill):**

In the "7-step per-file workflow" table, promote the existing "Verify understanding by summarizing back" row from one bullet to a paragraph immediately under the table that restates: *"Step 3 (Verify understanding) is non-skippable. Even if the section seems trivially correct, summarize back and wait for acknowledgement."* Wrap in markers.

### Change B — Make Section Relevance Check unconditional

**Current state (problem):** `references/process.md` and `steps/04-writing.md` say *"if relevance is in question, ask Yes / No (with reason) / Skip / Not sure."* The conditional clause means the check is often skipped.

**Edit per `references/process.md` of `create-requirements-package` and `create-design-package`:**

Replace step 0 of the 7-step per-file workflow.

Before:
```
| 0 | Section relevance check | If user says "Skip" or "No (with reason)", record in completeness tracker and exit |
```

After:
```
<!-- ack-restore:edit was="conditional relevance check" -->
| 0 | Section relevance check (unconditional) | Ask Yes / No (with reason) / Skip / Not sure for every block. Record outcome in the completeness tracker before drafting. |
```

**Edit per `steps/04-writing.md` (requirements) and `steps/02-design.md` (design):**

Replace the "Section relevance check — if relevance is in question, ask…" line with the unconditional form. Mark with `ack-restore:edit` comment as above.

**Edit per `references/discovery-workflow.md` and `references/analysis-workflow.md`:**

Add a sentence (wrapped in markers) at the top of the "Sequential execution rule" section:

```markdown
<!-- ack-restore:begin -->
Before each sub-step, ask the user whether the sub-step applies. If they say "Skip" or "No (with reason)", record the outcome and proceed to the next sub-step. Do not assume relevance.
<!-- ack-restore:end -->
```

### Change C — Per-sub-section acknowledgement loops in large blocks

**Targets (the four blocks where the per-artifact acknowledgement is too coarse):**

1. `templates/blocks/requirements/functional-requirements.md` — many FRs per file
2. `templates/blocks/requirements/business-logic-rules.md` — many rules per file
3. `templates/blocks/design/api-design.md` — many endpoints per file
4. `templates/blocks/design/database-design.md` — many tables per file

**Edit per target block template:**

Add a new authoring-rules section at the top of each (wrapped in markers):

```markdown
<!-- ack-restore:begin -->
## Authoring rule — sub-section acknowledgement

Do not draft this entire block in one pass. The block contains multiple independent items (FRs / rules / endpoints / tables). For each item:

1. State the item heading and one-sentence scope.
2. Draft the item.
3. Present it to the user.
4. Ask: "Approve, change, or skip?"
5. Apply the answer; do not move to the next item until you have one.

Only after every item has its own acknowledgement, mark the block complete in the completeness tracker.
<!-- ack-restore:end -->
```

**Edit per skill step file that drives these blocks** (`requirements/.../steps/04-writing.md` and `design/.../steps/02-design.md`):

In the sub-step table, add a column or footnote (wrapped in markers) flagging the four large blocks as "iterative — apply per-item loop from block template".

## 4. Stage breakdown (one commit per stage; each stage is independently revertible)

| Stage | Commit message | Files touched | Approx. line delta |
|---|---|---|---|
| **0** | `docs(plan): add acknowledgement-restore plan (mm/add-ack)` | `_docs/plan-restore-acknowledgement.md` (new) | +~250 (this file) |
| **1** | `feat(re): restore per-section ack — Change A (verify-understanding promotion)` | 4 SKILL.md files, 4-6 step files, 3 process.md files | +~120 |
| **2** | `feat(re): restore per-section ack — Change B (unconditional relevance check)` | 2 process.md files, 2 step files, 2 workflow refs | +~40, ~6 edits |
| **3** | `feat(re): restore per-section ack — Change C (per-sub-section loops)` | 4 block templates, 2 step files | +~80 |
| **4** | `chore(release): bump 1.4.0 — acknowledgement restoration` | `CHANGELOG.md`, version files (per existing release pattern) | +~15 |

Stages 1, 2, 3 are independent and can land in any order or partially. Stage 0 is this plan and must land first.

## 5. Reversion strategy

The marker-comment convention is the load-bearing piece. To revert:

### Full revert (back out everything)

```bash
# All inserted blocks
grep -rln "ack-restore:begin" .agents/ templates/ | while read -r f; do
  perl -i -0pe 's/<!--\s*ack-restore:begin\s*-->.*?<!--\s*ack-restore:end\s*-->\n?//gs' "$f"
done

# All single-line edits (restore via git)
grep -rln "ack-restore:edit" .agents/ templates/  # locate
# then either git checkout the affected lines from the pre-Stage-1 commit,
# or remove the ack-restore:edit comment and revert that line by hand.
```

Or simply:

```bash
git revert <stage-3-sha> <stage-2-sha> <stage-1-sha>
```

Each stage is one commit; reverting a single stage backs out only that change.

### Partial revert (keep some changes, drop others)

Because each stage is one commit, `git revert <stage-N-sha>` removes exactly the changes from that stage. The marker comments still help locate residue if a revert merge conflicts.

### Verification after revert

```bash
# Should return zero matches:
grep -rln "ack-restore:" .agents/ templates/
```

If the grep returns matches, revert is incomplete.

## 6. Risks

| Risk | Mitigation |
|---|---|
| Skills become slower / chattier in long sessions, especially for FR-heavy blocks. | Change C explicitly only applies to the 4 largest blocks. Other blocks keep current cadence. |
| Marker comments leak into rendered docs in tools that don't strip HTML comments. | All four target file types (`.md` step files, SKILL.md, references, block templates) are consumed by the skill runtime which already tolerates HTML comments; the markers do not appear in user-rendered output. |
| Acknowledgement language drifts between skills as we copy-paste. | Stage 1's verification rule is identical text across the four SKILL.md files — keep it byte-identical so a single grep can verify consistency. |
| Conflict with adversarial-review work on other branches. | `mm/add-ack` is downstream of `mm/add-cobol`. Coordinate merge order: `mm/add-context` → `mm/add-adverserial` → `mm/add-cobol` → `mm/add-ack`. |
| Reviewers see the marker comments and assume they're permanent. | This plan file documents them as deliberate-but-removable; link to `_docs/plan-restore-acknowledgement.md` from the PR description. |

## 7. Acceptance check (definition of done)

- [ ] All four SKILL.md files in scope contain the byte-identical "Verification rule (always-on)" section.
- [ ] All step files in scope end with an "Acknowledgement checkpoint" sub-section.
- [ ] `references/process.md` for both create-requirements-package and create-design-package shows step 0 of the 7-step workflow as **unconditional**.
- [ ] The four large block templates each carry the "Authoring rule — sub-section acknowledgement" section.
- [ ] `grep -rln "ack-restore:" .agents/ templates/` returns a non-zero count after Stages 1-3, and zero after a full revert.
- [ ] `CHANGELOG.md` records 1.4.0 with a one-line entry pointing at this plan file.
- [ ] No file outside §2 In Scope is modified.

## 8. Out of scope (explicitly NOT doing)

- Restoring the example dialogue (*"AI: Now for Question 1.2: ... User: ..."*) from the archive playbooks. Too prescriptive; runs against the just-in-time loading model.
- Reintroducing the `phases/create-*-package.md` 1,300-1,500-line playbooks. The reference structure (one ref file per workflow) is preserved.
- Adding acknowledgement gates to the elicitation patterns under `references/elicitation-patterns/`. They already say "ask one question at a time" and "wrap-up: confirm." No change needed.
- Tooling: no scripts, no hooks, no validators. The marker convention is plain-text and grepable; no automation required to enforce or revert.

## 9. Open questions for the user (block Stage 1)

1. Should Stage 4 (the version bump) happen as part of this branch, or does versioning land separately per the existing release flow?
2. Is `mm/add-cobol` the correct base, or should `mm/add-ack` rebase onto `main` once the upstream chain (`mm/add-context` → `mm/add-adverserial` → `mm/add-cobol`) lands?
3. Are there other large blocks (beyond FRs / rules / API / DB) where the per-sub-section loop should also apply? Candidates considered but excluded: `user-journeys`, `non-functional-requirements`. Confirm or expand.
