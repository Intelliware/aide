# Follow-up — PR !2028 (Hook System + Preset Bundles)

**Captured:** 2026-08-18 · **Re-verified:** 2026-08-25 · **Re-checked after binding commit:** 2026-08-26
**Branch:** `feature/hooks-and-presets` @ `3716612` (Mike Moerman, 2026-08-26)
**Target:** `main` @ `5c7da4e` · **status:** active · **ships version:** 2.6.0
**Disposition:** **approved 2026-08-25**; merge-ready on `3716612`. Remaining work is a follow-up PR, not a hold.

This file is the leftover list. !2028 ships the schema, the `manage-presets` skill, the hook-runtime contract, and the Check O binding. It does **not** ship schema enforcement or a behavioural test of hooks/presets.

---

## What's left (follow-up PR)

### 1. Validation rules 17–28 are documented but unenforced

`config/SCHEMAS.md` § 4 states twelve constraints. Neither `validate.py` nor `validate.js` implements any of them. Check O (added in `3716612`) only proves every `SKILL.md` cites `hook-runtime.md` — it does not parse `[[hooks]]` or preset manifests.

Nothing currently catches:

| Rule | Failure mode that ships silently |
|---|---|
| 17 | Duplicate hook `code` after layer merge |
| 18 | `[[hooks]].skill` naming a skill that is not in the catalog |
| 19 | `event` other than `before` / `after` |
| 20 | `priority` outside `[1, 999]` (e.g. 5000) |
| 21 | `optional = true` with no `prompt` |
| 22 | Syntactically invalid `condition` expression |
| 23 | Circular hook chain A→B→A (direct or transitive) |
| 24 | `[[presets]].name` ≠ `[preset].name` in the referenced manifest |
| 25 | `[[presets]].source` not a resolvable path with a valid `preset.toml` |
| 26 | `conflicts_with` naming a preset that is also enabled |
| 27 | `extends` cycle, or an `extends` target that is not registered |
| 28 | `[[preset.files]].skill` naming an unregistered skill |

Implement in **both** validators, with tests in both suites. Check N2 (`features.toml`) is the pattern to copy: companion-file rules that skip-and-announce when the file is absent, fail loud when it is present and malformed.

Rule 22 is the expensive one — `hook-runtime.md` lists a few expression shapes (dot-path, `==`, `!=`, boolean) but there is no grammar. Either pin a grammar in `SCHEMAS.md` and parse it, or drop the rule until one exists. Do not add a regex that pretends to be a parser.

### 2. No behavioural test, and no test plan

Check O tests the citation, not the feature. There is still no evidence that a configured hook actually fires.

Needed:

- A configured `before` hook announces `Running before-hook: <skill> (code: <code>)` and invokes the target skill ahead of Step 0
- Same for `after`, before the `## Next skill` handoff
- `optional = true` prompts; decline skips
- Falsy `condition` skips silently
- `_suppress = true` drops the hook
- `manage-presets` end to end: discover, install, enable, disable, show, and a deliberate `conflicts_with` collision
- Hand-check `config/customizations/hooks.toml.example` against § 2.5.1, and both preset examples against § 2.10–2.11 — nothing parses them, so an error there ships to every user
- Author `_docs/hooks-presets-test-plan.md` covering the above. `_docs/feature-id-targeted-test-plan.md` from !2051 is the model

The PR description still has two unchecked boxes ("Test hook schema parsing with example TOML", "Test preset discovery via manage-presets skill") with no mechanism behind either.

### 3. Hygiene that landed with the binding commit

`3716612` inserted a four-line `## Precondition — hooks` block into every `SKILL.md`. That pushed two files over the 200-line **warning** cap (not an error; validators stay green):

| File | On `main` / `65879ca` | On `3716612` |
|---|---|---|
| `.agents/skills/meta/select-feature/SKILL.md` | 199 | **203** |
| `.agents/skills/quality/execute-quality-increments/SKILL.md` | 200 | **204** |

Trim four lines from each, or accept the warning. Validators now report **5 warnings** (the original 3 `requires-decision-from` template warnings, plus these two).

`generate-re-skill/steps/generate-skill.md` "Required sections" still does not list `## Precondition — hooks`. The exemplar `reverse-engineer-api` now has the section, and Check O will fail a generated skill that omits it — but the generator's own section list should name it so a later author does not have to discover that from a validator error.

### 4. Cosmetic (this PR's description / changelog, fold into the follow-up or fix on the way out)

- **PR title still reads `(v2.3.0)`** — the branch ships 2.6.0.
- **PR description** still cites schema § 2.8–2.9 and validation rules 13–24; those are now § 2.10–2.11 and 17–28. Test plan still says "50 skills"; the registry has 52.
- **CHANGELOG `2.6.0` heading is dated 2026-08-11** and sits above the `2.5.0` entry dated 2026-08-25. Row 7 under 2.6.0 records the 2026-08-26 binding fix; the heading date was never re-bumped.

---

## Closed on this PR — do not re-open

| Item | Closed by |
|---|---|
| Merge conflicts vs current `main`; 58 commits behind | `65879ca` (merge of `main`) |
| Preset sections colliding with !2051's § 2.8 / § 2.9 | Renumbered to **§ 2.10 / § 2.11** |
| Validation rules colliding with !2051's 13–16 | Renumbered to **17–28** |
| Duplicate section / rule numbers in `SCHEMAS.md` | None remain |
| `main` mis-versioned ( !2047 shipped with no bump / no CHANGELOG) | `7e08f99` backfills **2.5.0**; this PR ships **2.6.0** |
| Registry stale at 50 skills | **52 skills**, regenerates with zero drift |
| **No skill bound to the hook runtime** (original finding 2) | `3716612` — `AGENTS.md` obligation, `## Precondition — hooks` on all 52 `SKILL.md` files, Check O in both validators |

Finding 2 was the silent no-op: a user could author a conforming `[[hooks]]` block and nothing would tell the running skill to look for it. That binding is now in place. What remains is enforcement of the *contents* of those blocks (finding 1) and proof that a bound skill actually fires a hook (finding 2's behavioural half, listed above as leftover #2).

### Verified mechanically on `3716612`

- `validate.py` / `validate.js` — **0 errors, 5 warnings** (3 pre-existing `requires-decision-from`; 2 new 200-line cap warnings, see leftover #3)
- `test_validate.py` — **58 tests OK** (was 54; +4 Check O)
- `test-validate.js` — **62 passed, 0 failed** (was 58; +4 Check O)
- `build-registry.py` — **52 skills**, registry byte-identical to a fresh rebuild
- vs `main` (`5c7da4e`): 4 commits ahead, **0 behind**; `git merge-tree --write-tree` exits 0
- ADO `mergeStatus: succeeded` against `lastMergeTargetCommit` `5c7da4e` (current `main`)
- Reviewer votes: Jack Cooney 10, Mike Moerman 10 (thread 9621 is the 2026-08-25 approval comment)

---

## Follow-up PR checklist

- [ ] Implement rules 17–28 in **both** `validate.py` and `validate.js`, with tests in both suites. Pin a grammar for rule 22 or drop the rule
- [ ] Behavioural test: configured `before` hook fires and announces `Running before-hook: <skill> (code: <code>)`; repeat for `after`, `optional` (prompts), falsy `condition` (skips silently), and `_suppress`
- [ ] Exercise `manage-presets` end to end: discover, install, enable, disable, show, and a deliberate `conflicts_with` collision
- [ ] Hand-check `config/customizations/hooks.toml.example` against § 2.5.1, and both preset examples against § 2.10–2.11
- [ ] Author `_docs/hooks-presets-test-plan.md` covering the above
- [ ] Trim `select-feature/SKILL.md` and `execute-quality-increments/SKILL.md` back under 200 lines (or explicitly accept the warnings)
- [ ] Add `## Precondition — hooks` to `generate-re-skill/steps/generate-skill.md` required-sections list
- [ ] Re-date the `2.6.0` CHANGELOG heading so it is not older than the `2.5.0` entry beneath it
- [ ] (Optional, this PR or follow-up) Fix the ADO title `(v2.3.0)` → `(v2.6.0)`, and the description's stale § 2.8–2.9 / rules 13–24 / "50 skills"

---

## What !2028 adds (reference)

**Hook System.** A `[[hooks]]` array-of-tables in `customizations/<skill>.toml` (Layer 5) that chains skills at boundaries. Fields: `code` (stable merge key), `event` (`before` fires ahead of Step 0, `after` fires after the final step but before the `## Next skill` handoff), `skill`, `priority` (1–999, default 500, ascending), `optional` + `prompt`, `condition`, `_suppress`. Execution contract in `references/orientation/hook-runtime.md`. Binding: `AGENTS.md` "Operational contract for hook execution" plus `## Precondition — hooks` on every `SKILL.md`, enforced by Check O.

**Preset Bundles.** Reusable bundles of customization files installable as a unit. `config/preset.toml.example` is the bundle manifest (`extends`, `conflicts_with`, `files`), `config/presets.toml.example` the project registry. Presets merge between Layer 4 and Layer 5, so project-local customizations still win. New `manage-presets` skill (SKILL.md + 4 steps + 3 references).

Supporting: `customize-framework` steps 03–05 gain hook authoring; `framework-navigator` routing + rubric; `SCHEMAS.md` § 2.5.1 / § 2.10 / § 2.11 and validation rules 17–28; `workflow-graph.yaml` adds `manage-presets` to `anytime`.

---

## Historical note — the renumbering that was required, and was done

!2051 (merged 2026-08-25, `e15f4af`) took § 2.8, § 2.9, rules 13–16 and versions 2.3.0 + 2.4.0.
!2047 (merged 2026-08-25, `5c7da4e`) added `generate-re-skill`, taking the skill count to 51.
Mike's `65879ca` absorbed both. Cross-references that moved, all confirmed updated:
`manage-presets/SKILL.md`, its `EXAMPLE.md` and `steps/02-install.md`, `AGENTS.md`,
`config/customizations/README.md`, two internal back-references in `config/SCHEMAS.md`, and
`CHANGELOG.md`. In-prose rule citations shifted 14 → 18 and 19 → 23 in
`customize-framework/steps/03-pick-operation.md` and `references/orientation/hook-runtime.md`.

`_docs/mapping.md` lines 170, 286, 295 cite `§2.8` / `§2.9` of a *requirements* document, not
`SCHEMAS.md`. They were correctly left alone.
