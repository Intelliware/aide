# Path token reconciliation — prerequisite plan

**Status:** draft
**Date:** 2026-08-12
**Framework version at authoring:** 2.2.0 (`R2.2.0`)
**Relationship to other plans:** predecessor to `_docs/feature-id-minimal-plan.md`. Also
extracts and completes the prerequisite that `_docs/feature-id-path-segment-plan.md` carries
internally as its §2.6. Neither feature-ID plan should start until this lands.

---

## 1. Why this goes first

Both feature-ID plans insert a directory segment into artifact output paths. The full plan
makes the token fix a **blocking internal tier**, so nothing ships until it lands. The minimal
plan **defers** it and accepts a narrower outcome: feature *isolation* without feature
*findability*, because a segment added to a path that does not resolve is still a path that
does not resolve.

Extracting the fix as a standalone predecessor removes that trade entirely. It is not a
blocker when it is a separate merged change — it is simply the thing that happens first. And
it is far smaller than either plan assumed: **30 files, 42 occurrences**, of which four fifths
are renames to keys that already exist.

It is also worth doing on its own merits. Forty-two references naming configuration keys that
were never added is a live defect regardless of whether feature IDs ever happen.

---

## 2. The defect, measured

`[project.paths]` declares exactly four keys (`config/SCHEMAS.md:297-300`,
`config/project.toml.example:50-52`):

```
requirements_package   design_package   implementation_package   knowledge_base_path
```

Against those, artifact paths are written with a `{paths.<stage>_path}` naming scheme that was
designed and never added to config. Counting the active tree (excluding `_archive/`, `_bmad/`,
`.claude/skills/bmad-*`, and the `_docs/` planning documents):

| Token | Occurrences | Resolves? |
|---|---|---|
| `{paths.quality_path}` | 16 | No — and no candidate key exists |
| `{paths.requirements_path}` | 13 | No — `requirements_package` is the intended target |
| `{paths.design_path}` | 11 | No — `design_package` is the intended target |
| `{paths.planning_path}` | 1 | No — `implementation_package` is the intended target |
| `{paths.implementation_path}` | 1 | No — `implementation_package` is the intended target |

**42 phantom occurrences across 30 files.**

Two things bound the problem usefully:

- **The planning and execution stages are already correct.** They use
  `{project.paths.implementation_package}` — 44 occurrences, the single most-used token form
  in the tree. Nothing there needs touching.
- **`{paths.knowledge_base_path}` resolves perfectly** (64 occurrences), which proves the short
  `{paths.}` prefix is not the defect. The **key names** are.

### 2.1 There is no runtime, and that sets the severity

`config/SCHEMAS.md:131-141` declares five legal tokens — `{project-root}`,
`{framework-root}`, `{home}`, `{cwd}`, `{workspace}` — "expanded at config-load time." No
config loader exists. The only scripts in the repository are `build-registry` and `validate`;
neither expands `{paths.*}`. By that standard `{feature-id}` and `{increment-id}` are not
tokens either. Every one of these strings is instruction text interpreted by an AI agent.

So this is a **legibility** defect, not a crash. `{paths.requirements_path}` sitting beside a
`project.toml` containing `requirements_package` is a near-miss an agent maps correctly almost
every time. That is why it has survived unnoticed, and it is why this work is low-risk.

The residual harm is **silent divergence**: a mis-resolved base writes a real file to a
plausible place and nothing complains until a later skill globs for it and finds nothing.
Resolution is per-session judgement, so two runs on different hosts can disagree — and for a
path, "usually right" still yields two trees.

`{paths.quality_path}` is the exception that cannot be interpreted at all, because there is no
candidate key to find. That one is a genuine hole rather than a near-miss.

---

## 3. The mapping

| Phantom | → Target | Key status |
|---|---|---|
| `{paths.requirements_path}` | `requirements_package` | Exists |
| `{paths.design_path}` | `design_package` | Exists |
| `{paths.planning_path}` | `implementation_package` | Exists |
| `{paths.implementation_path}` | `implementation_package` | Exists |
| `{paths.quality_path}` | `quality_package` | **New — added by this plan** |

`quality_package` is added to `[project.paths]` with a default of
`"{project-root}/.framework-output/quality"`, matching the shape of its three siblings. This is
backward compatible: an absent key falls back to the default, so no existing `project.toml`
breaks. Note `{project.paths.quality_package}` is *already written* in one place in the tree,
anticipating a key that was never added — this makes that reference correct rather than
aspirational.

**`{paths.planning_path}` is the one non-mechanical case.** There is no `planning` anything in
config, so this is not a spelling fix — it is a statement about which stage owns the artifact.
The owning skill settles it: `create-implementation-package/references/INPUTS-OUTPUTS.md:29`
documents `{project.paths.implementation_package}/INC-XXX.md` and line 22 **halts** when that
key is unset. One side is bound to config and enforced; the other points at nothing. The
composition adopts the skill's key.

### 3.1 Explicitly not in scope — prefix normalisation

The same real key is cited with both `{paths.<key>}` and `{project.paths.<key>}`. Among
correctly-named occurrences the split is roughly 92 short-form to 66 fully-qualified.

**Leave both alone.** Neither form is declared in §1.5 today, so both are equally informal, and
both are equally legible to an agent. Normalising would touch ~100 additional occurrences of
text that already works, tripling this change for zero behavioural gain. This plan fixes
**names**, not prefixes.

Instead, §1.5 gains a short subsection legalising the `{paths.<key>}` and
`{project.paths.<key>}` families as synonyms referring to `[project.paths]` keys, alongside a
note that `{feature-id}`, `{increment-id}`, `{repo-slug}` and `{component-slug}` are
skill-supplied runtime substitutions rather than config-load tokens. That closes the gap where
the schema's token table describes only five tokens while the tree uses a dozen.

---

## 4. Scope — 30 files

| Area | Files | Notes |
|---|---|---|
| `.agents/skills/quality/` | 10 | `create-quality-package` 3, `audit-quality-coverage` 3, `execute-quality-increments` 2, `review-quality-package` 2. Highest-touch, and the only stage needing a new key |
| `templates/compositions/` | 7 | One `default-output-path` line each — see below |
| `.agents/skills/design/` | 6 | `create-design-package` 4 (incl. `steps/02-design.md` ADR fallback), `review-design-package` 2 |
| `.agents/skills/requirements/` | 4 | `create-requirements-package` 3, `review-requirements-package` 1 |
| `.agents/skills/quick-dev/` | 2 | `document-quick-change` SKILL + INPUTS-OUTPUTS |
| `config/` | 1 | `customizations/review-implementation-package.toml.example:96` `findings_path_pattern` |

Plus the two contract surfaces this plan authors rather than edits mechanically:
`config/SCHEMAS.md` (the new key, the §1.5 token subsection) and
`config/project.toml.example` (the `quality_package` entry).

The seven compositions, exhaustively:

| File | Line | Current | After |
|---|---|---|---|
| `greenfield-requirements-package.yaml` | 13 | `{paths.requirements_path}/{feature-id}-requirements.md` | `{paths.requirements_package}/…` |
| `brownfield-enhancement-spec.yaml` | 22 | `{paths.requirements_path}/{feature-id}-enhancement-spec.md` | `{paths.requirements_package}/…` |
| `quick-dev-spec.yaml` | 14 | `{paths.requirements_path}/{feature-id}-quick-dev-spec.md` | `{paths.requirements_package}/…` |
| `greenfield-design-package.yaml` | 13 | `{paths.design_path}/{feature-id}-design.md` | `{paths.design_package}/…` |
| `greenfield-quality-package.yaml` | 15 | `{paths.quality_path}/{feature-id}-quality.md` | `{paths.quality_package}/…` |
| `brownfield-quality-package.yaml` | 13 | `{paths.quality_path}/{feature-id}-quality.md` | `{paths.quality_package}/…` |
| `greenfield-implementation-package.yaml` | 23 | `{paths.planning_path}/{increment-id}.md` | `{project.paths.implementation_package}/{increment-id}.md` |

**No feature-ID segment is inserted by this plan.** Every path keeps its current shape and
depth; only the key name changes. That is what keeps the two changes independently reviewable.

---

## 5. The guardrail — validator check M

One new check, in both `scripts/validate.py` and `scripts/validate.js`:

> Every `{paths.<name>}` and `{project.paths.<name>}` reference, in
> `templates/compositions/**` and `.agents/skills/**`, names a key declared in the
> `[project.paths]` schema.

Letters `A`–`L` are taken (`L` went to the RE close-out gate binding in 2.2.0), so this is
**M**. The feature-ID plans' proposed check moves to **N**.

**A hard error, not a warning.** The usual argument for warnings — don't fail the build on
pre-existing debt — does not apply, because this plan fixes every existing violation in the
same change. The check lands green and stays green, and a warning would simply invite the
scheme to drift back.

It must cover `.agents/skills/` as well as `templates/compositions/`. Scoping it to
compositions would reproduce exactly the gap that let this drift survive, since
`config/SCHEMAS.md:647` rule 5 governs only tokens inside `project.toml` values.

Fixtures: a negative case per phantom form, and a positive case confirming
`{paths.knowledge_base_path}` and both prefix forms of a real key pass.

---

## 6. Sequencing

Small enough to land as one change, but it splits cleanly if preferred:

| Step | Content | Files |
|---|---|---|
| 1 | `quality_package` in `SCHEMAS.md` + `project.toml.example`; §1.5 token subsection | 2 |
| 2 | The 7 composition `default-output-path` lines | 7 |
| 3 | The 22 skill / config-example references | 22 |
| 4 | Check M in both validators, plus fixtures | 5 |

Step 1 must precede step 3, because the quality references have nowhere to point until the key
exists. Step 4 must be last, or it fails on the files not yet fixed.

**Verification:** `python3 scripts/validate.py` and `python3 scripts/test_validate.py` green;
zero matches for `rg '\{paths\.(requirements|design|planning|quality|implementation)_path\}'`
in the active tree.

---

## 7. What this unlocks

For `_docs/feature-id-minimal-plan.md`:

- **§2.5 disappears.** Its entire hedge — "most tokens phase 3 edits do not resolve" — is
  what this plan removes. The feature-ID work becomes pure segment insertion into tokens that
  resolve, and it can claim findability rather than only isolation.
- **§10 Q7 stops being a carve-out.** `quality_package` moves here, where it belongs, instead
  of being an awkward exception to that plan's deferral.
- **§10 item 1 folds in** — the `greenfield-implementation-package.yaml` fix is the same class
  of change and is listed above as composition 7.
- **Its validator check becomes N**, and gains a cleaner job: assert the `{feature-id}`
  segment, on paths already known to resolve.

For `_docs/feature-id-path-segment-plan.md`: its §2.6 prerequisite is satisfied externally,
so its Tier 2 unblocks without the plan having to carry a blocking tier at all.

**Cost, honestly stated.** These 30 files are a subset of the ~97 the feature-ID work touches,
so about a third of that work's files get edited twice, and there is one extra merge. Total
diff grows slightly. The gain is that each pass is one kind of edit — rename a key, then insert
a segment — rather than both to the same line at once, which is materially easier to review and
to revert.
