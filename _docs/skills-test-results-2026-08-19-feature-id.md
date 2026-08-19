# A.I.D.E. — Skills Test Results — 2026-08-19 (feature-ID identity + path-token reconciliation)

**Branch:** `feat/feature-id-minimal-plan` (version **2.4.0**, PR !2051) **Mode:** YOLO / automated **Host:** Cursor (Claude Opus 5)
**Plan:** `_docs/feature-id-targeted-test-plan.md` — full plan, all tiers
**Head at start of run:** `9a91801` docs(create-design-package): renumber discovery sub-step 0a to 0
**Sandbox:** `~/Dev/feature-id-sandbox/` — created fresh, no clones, no knowledge base, no network
**Conventions:** inherited from `_docs/skills-test-plan.md` § 0 (result classes, `[auto]` / `[user]` tagging, halt taxonomy, ledger format)

**Pre-run decisions (operator):**

1. **Self-adjudication — ON.** The agent may self-adjudicate observable `[user]` criteria and record its own assessment, halting only on genuine ambiguity or FAIL. Without this the run halts at F.6, the first of ~18 `[user]` criteria across 12 of 22 steps.
2. **F.1 stale counts — repin the plan.** F.1 asserted 11 Mode-A / 5 Mode-B / 18 total; both the plan's own header table and `references/ai-principles/feature-precondition.md` say 7 / 10 / 19. Plan repinned before running F.1 (see Plan corrections below).
3. **Coverage debt — results doc only.** F.2–F.4 are exercised as a one-off this pass; folding them into `test_validate.py` / `test-validate.js` as permanent regression fixtures is recorded as a follow-up, not done here.
4. **F.19 adjudicated FAIL (post-run).** The one step escalated for human judgement. The operator ruled that a sole defence bypassed by the default path is functionally absent, and accepted the single-unconditional-question fix in F-4 as the remedy. Recorded so the verdict is not mistaken for self-adjudication.

## Result summary

**Run complete — 22 of 22 steps executed.** The identity layer's path algebra is verified and correct. Both failures are in *enforcement coverage*, not in path resolution.

| Tier | Steps | PASS | FAIL |
|---|---|---|---|
| 0 — baseline | T0.1 | 1 | — |
| 1 — static / validator non-vacuity | F.1–F.5 | 5 | — |
| 2 — runtime behaviour | F.6–F.15 | 10 | — |
| 3 — broken states & edges | F.16–F.21 | 3 | **3** |
| **Total** | **22** | **19** | **3** |

Every step landed in a terminal class; nothing was skipped at step level. One *criterion* was skipped — F.14's SoD `[user]` check, since neither sandbox is in SoD directory mode — and it is answered adversely by inspection via F-12 rather than left open. Note the ledger carries more rows than there are steps, because F.16–F.19 were each split into a validator half and a runtime half, and F.11/F.12 share one row as the plan specifies.

- **FAIL ×3** — F.17 (duplicate `id`) and F.18 (ghost repo), where both modes silently proceeded in each, sharing one cause (F-11); and F.19, adjudicated FAIL by the operator on 2026-08-19 because the only defence against adopting a hand-written `docs/` directory is bypassed by the default path (F-4). Continuing after F.17/F.18 was authorised by the plan's own stopping rule for this tier ("record and continue").
- **16 findings** (F-1…F-16): 4 HIGH, 8 MEDIUM, 4 LOW. Plus 15 out-of-scope observations preserved separately.
- **Python / Node parity: exact.** Every message compared across the two validators was byte-identical, including all three F.4 fence variants.

**Two corrections I made to my own earlier findings during the run**, both because later evidence contradicted them — recorded inline rather than silently revised: F-8 downgraded HIGH → MEDIUM (the working-tree routing does exist, in three create-side workflows), and a reported token-spelling defect dismissed entirely (Check M sanctions both spellings by design). A third reported finding was reframed after I found an instance beyond what was reported (F-12).

## Plan corrections applied before the run

| Step | Was | Now | Why |
|---|---|---|---|
| F.1 | "expect 18"; 11 Mode-A; 5 Mode-B; 19th hit = drift | "expect 19"; 7 Mode-A; 10 Mode-B; 20th hit = drift | Commit `16bf698` moved four select-style skills from Mode A to Mode B on 2026-08-18. The plan's header table and the contract were both updated; F.1's criteria were not. Verified against the tree: exactly 19 `SKILL.md` files cite the contract, and all 7 + 10 + 1 + `select-feature` are present by name. F.1's mechanism was correct; only its pinned numbers were stale. |

## Ledger

| Step | Class | When | Auto-pass | User-pass | Notes |
|---|---|---|---|---|---|
| T0.1 | PASS | 2026-08-19T16:32Z | 3/3 | 0/0 | All four exit zero. Both validators report Check M, Check N1 and Check J in the default run. Suite counts **49 / 53** exactly as pinned — no reconciliation needed. 3 pre-existing Check-E warnings (empty `requires-decision-from` on three index/tracker blocks), documented as acceptable for index blocks; not a regression and not in scope. |
| F.1 | PASS | 2026-08-19T17:04Z | 3/3 | 1/1 | Exactly **19** `SKILL.md` files cite `feature-precondition`, and all 7 Mode-A + 10 Mode-B + `framework-navigator` + `select-feature` are present **by name** against the contract's own lists — no 20th hit. Independently corroborated by CHANGELOG 2.4.0 Fixed entry 12: "Mode A 11 → 7, Mode B 6 → 10; governed (17) and citing (19) unchanged." `[user]` spot-check run on **six** skills (one more than required): Mode A `create-requirements-package`, `create-design-package`, `manage-bugs`; Mode B `execute-increments`, `create-pr`, `plan-quick-change`. In all six, `## Precondition — active feature` sits after `## Inputs` and **before** `## Workflow` and before the write-discipline `## Preconditions`, and each states its ordering explicitly ("before the write-discipline preconditions below", "before Step 0", "before Step 1", "before determining the mode", "before the first read or write"). Each passes its own name as `caller`; all three Mode-B ones carry `select-only` **and** the "do not fall back to creating one" clause. Ran against repinned counts — see Plan corrections. |
| F.5 | PASS-w/-FINDINGS | 2026-08-19T17:12Z | 0/1 | 1/1 | Known-five status recorded below (4 still open, 1 mis-described) — the `[user]` criterion is satisfied by recording it. The `[auto]` new-entrant criterion **did not hold**: three files outside the known-five describe the flat shape in a way N1 does not catch (finding F-2). Per the step's own rule ("This step cannot FAIL on finding debt — it fails only by leaving the state unrecorded") this is recorded, not a FAIL; see the plan-wording note in finding F-2. |
| F.16–F.18 (validator half) | PASS | 2026-08-19T17:26Z | 2/2 | 1/1 | All three broken registries rejected by **both** validators, exit 1 each, one error each, right rule for the right reason. F.16 rule 15: "`[user].active_feature = 'no-such-feature'` resolves to no `id` in features.toml — a stale pointer sends every write to a feature that does not exist." F.17 rule 14: "`[[features]] #2`: duplicate `id` 'refunds' — first declared at #1. Two features cannot share a directory; differentiate the slug." F.18 rule 16: "`repos` entry 'ghost-repo' matches no `[[project.repos]].code` in project.toml — declared codes are api-billing, web-portal." `[user]` actionability: every message names the offending value, the file, and the consequence in plain language; no tracebacks. Skipped-sub-rule warnings fire correctly and name the missing companion flag. Only Python/Node divergence is quote style (`'x'` vs `"x"`, from `repr` vs `JSON.stringify`) — cosmetic, semantically identical. **Runtime half (skill behaviour on each state) still pending.** |
| F.19 (validator half) | PASS | 2026-08-19T17:28Z | 1/1 | — | Both validators **accept** a registry whose sole `id` is `architecture` (exit 0, zero errors), confirming nothing validates a slug colliding with a non-feature `docs/` directory. This establishes that `select-feature`'s mint-time warning is the **only** defence and must not be removed. `[user]` half (does the skill actually warn?) pending. |
| F.20 | EXPECTED-GAP | 2026-08-19T17:31Z | 1/1 | 1/1 | Recorded as **expected-gap, not PASS**, per the step's own instruction. A half-migrated project — `alert-customer` scoped under `.framework-output/requirements/alert-customer/`, `refund-fee-waiver` left flat beside it, both registered, `active_feature` valid — draws **zero findings and zero warnings** from both validators (exit 0). Stronger than the criterion asks: the gap is structural, not an oversight. No validator flag accepts a project artifact tree at all (`--summary-md`, `--project-toml`, `--cross-cutting-artifact`, `--framework-toml`, `--features-toml`, `--project-user-toml`), so the framework has no seam through which it could see a project's artifact layout. Matches `_docs/feature-id-minimal-plan.md` § 13.2: detection would have to live outside the precondition, or the cheap-exit guarantee for non-opted-in projects is lost. |
| F.7 | PASS | 2026-08-19T19:56Z | 4/4 | 0/0 | The bootstrap default behaves exactly as designed — minting here would have been the bug, and it did not. A `fresh` greenfield `start-project` wrote a comment-only `features.toml` byte-identical to the block in `steps/05-write-project-toml.md` sub-step 6b; it parses to `{}` under `tomllib` and `grep -c '^\[\[features\]\]'` returns **0**. No `docs/` directory was created at all, and no `project.user.toml` was written, so `[user].active_feature` is unset. Both validators (verified by me against the actual bootstrap output, not a fixture) exit 0 and emit the documented "legal, and means 'opted in, no features yet'" note as a WARN. The handoff stated feature-scoping as a **statement**, did not wait for a reply, and did not route to `select-feature` — matching the step doc's "A statement, not a question — do not wait for a reply." |
| F.15 | PASS-w/-FINDING | 2026-08-19T19:56Z | 2/2 | 1/2 | **Mode C's core contract holds completely**, which is what this step exists to verify. All three states completed with a recommendation; none halted. Side effects are none in all three — before/after `shasum` manifests are byte-identical **and** the directory sets are unchanged, so nothing was created that a file-only manifest would miss. State 2's `[user]` criterion passes cleanly: the unmet feature precondition rendered as a prerequisite note ("Before this skill runs you'll need: `select-feature` …"), with the recommendation still produced and no "error" / "blocked" / "cannot proceed" framing anywhere — exactly as an unmet flow gate renders, and with no score penalty. State 3's `[user]` criterion **does not hold**: the probe has no feature dimension, so it cannot report per-feature coverage. See finding F-7. |
| F.8 | PASS-w/-FINDING | 2026-08-19T19:48Z | 4/4 | 0/1 | Mint works. Proposed `alert-customer`, a valid rule-13 kebab slug; `features.toml` gained exactly one entry with `id`, `title` and `created = 2026-08-19` populated; `project.user.toml` was created from scratch with `[user].active_feature = "alert-customer"`. Fourth criterion verified independently by me: `validate.py --features-toml … --project-toml … --project-user-toml …` returns **no findings, 0 errors**. The `[user]` criterion **does not hold as worded**: the echo fired and named all four stage directories plus the working tree, but **after** both config files were on disk, because step 4 appends the entry and sets the pointer and the echo is step 5. Not agent error — it is the documented order. See finding F-3. |
| F.9 | PASS | 2026-08-19T19:48Z | 2/2 | 2/2 | The load-bearing proposal works. With `docs/refunds/` pre-existing and the title "Refund processing fixes", the proposed id was **`refunds`**, not the title-derived `refund-processing-fixes`. The reason quoted the SKILL.md:103-104 template verbatim and did state that the existing directory already matches so nothing has to move. Override to an unrelated slug was accepted, confirming the proposal is offered rather than imposed. After accepting `refunds`, `ls -1 docs/` returns exactly `refunds` — no second directory. Registry validates clean. Ranked second only to F.6/F.13 by the plan, and it holds. One observation, not a criterion failure: the override is **silent** — see finding F-4's second half. |
| F.10 | PASS-w/-FINDINGS | 2026-08-19T19:59Z | 1/2 | 2/2 | Run 1 halts correctly, quoting the contract's two options verbatim (`feature-precondition.md:63-68`) — (a) `git mv` the directory, (b) rename the feature in both `features.toml` and `active_feature` — with a "none of these" escape offered, and nothing renamed or created before an answer (checksums identical before/after: `564a97fe…` / `0a49c120…`, no `.framework-output/` at all). The **third `[auto]` criterion is not exercisable as the plan specifies it.** Placing artifacts on the working-tree side creates `docs/<feature-id>/`, which trips the resolution rule's unconditional case 1 ("exists → use it … stop here") and bypasses the reconciliation check entirely — so run 2 offered neither option and did not halt on reconciliation at all. The run built a corrected sub-variant (assembled artifact present, working tree absent) which does reach the check, and there option (b) is correctly withheld with (a) as the only answer and the reason stated. So the contract's option-(b) precondition works exactly as written; the plan's chosen state cannot reach it. See findings F-8. |
| F.11 / F.12 | PASS-w/-FINDINGS | 2026-08-19T19:59Z | 2/2 | 4/5 | **The core asymmetry holds, and this was a batch-4 stop condition that did not trigger.** Both modes halted on the same state with "No active feature. Run `select-feature`, then re-run this skill." — character-for-character as specified. Neither invented an id nor derived one from the request text ("Customers aren't notified when a refund is delayed" would plausibly have yielded `refund-delay-notification`; nothing of the sort appeared). `features.toml` is byte-identical at all three capture points (`062fb649…` before Mode A, after Mode A, after Mode B), so reviewing minted nothing. Mode A passed `caller: create-requirements-package` with create **reachable**; Mode B passed `select-only` with create **unreachable** (the listing omitted `[ create a new feature ]`). `select-feature` closed with `## Next skill\ncreate-requirements-package`, and select mode honoured its write contract — only `project.user.toml` changed. The one `[user]` criterion that is **partial**: with an empty registry the halt message does change, but it names no concrete skill — see F-10a. Mode B's correct behaviour also depended on reading a reference the implementing skill never cites; see F-9. |
| F.21 | PASS-w/-FINDING | 2026-08-19T19:59Z | 1/1 | 1/2 | Neither mode fell back to flat paths — answered explicitly for each — because both keyed on the file's *presence*, per the contract's "The signal is the file's presence and nothing else". Nothing was created at all: no `.framework-output/`, `docs/` still empty, `features.toml` unchanged (`57422218…`). Mode A routed to `select-feature`, which took step 2's empty-registry branch straight to create, checked `docs/` for a proposable directory, found none, and halted prompting for a title — **without** deriving `dispute-evidence-upload` or similar from the request text. Mode B did not offer create. Partial on the second `[user]` criterion for the same reason as F.11/F.12: the message points at "the stage's `create-*` skill" generically rather than naming it. |
| F.2 | PASS | 2026-08-19T20:18Z | 3/3 | — | **Check M is non-vacuous.** Injected `{paths.does_not_exist}` into `greenfield-requirements-package.yaml`'s `default-output-path`. Both validators exited **1**, both fired **Check M**, and both named the offending key *and* enumerated the five declared keys. The two messages are **byte-identical**, so the twin contract holds on this path. Restored via `git checkout --`; composition diff empty. |
| F.3 | PASS | 2026-08-19T20:19Z | 4/4 | — | **Check N1a is non-vacuous.** Stripped the `{feature-id}/` segment from the same composition; both validators exited **1**, named Check N1 and the composition, and explained the consequence ("two features' artifacts would collide in one directory"). Messages byte-identical. All **7** feature-scoped compositions carry the segment in the unmodified tree (checked individually). Criterion 3 confirmed by reading `check_n1()`: it globs *every* composition and filters on whether the output path's token is in `FEATURE_SCOPED_PATH_KEYS`, so an 8th feature-scoped composition is covered the day it is added — derived, not hard-coded. `git diff` empty after restore. |
| F.4 | PASS | 2026-08-19T20:22Z | 3/3 | — | **N1b's fence exemption is correct in both directions.** All three variants run from one probe path so only the fence placement varied. (a) retired `<feature>` in prose → both exit **1**, both name the retired placeholder. (b) same string inside a fence → both exit **0**, no findings — the exemption works. (c) same string *after* the fence closes → both exit **1**, and both correctly reported **line 10** (the post-fence prose) rather than the in-fence line, proving the guard does not leak past its terminator. Python and Node agreed on all three variants, in exit code and message text. |
| F.6 | PASS | 2026-08-19T20:11Z | 4/4 | 3/3 | **The opt-out invariant holds.** With `features.toml` absent the precondition stopped at its first rule and skipped the rest of the file. Nothing feature-related was put to the user; `select-feature` was never invoked or named; no `features.toml` and no `project.user.toml` were created; no `active_feature` was read, written, or inferred. The assembled artifact landed flat at `.framework-output/requirements/refund-delay-alert-requirements.md` — **zero** directory levels between the stage dir and the filename, `<name>-` prefix retained — which is exactly the contract's not-opted-in shape. 18 files created, all non-empty (774–7328 bytes). No unresolved `{feature-id}` token leaked into any path; the only occurrences are inside file *content* where the run quoted the composition and contract verbatim. Tree snapshotted to `~/Dev/feature-id-scratch/f14-snapshots/f6-sandbox/` (19 files) and the flat path re-verified by me independently for F.14. |
| F.13 | PASS | 2026-08-19T20:14Z | 4/4 | — | **Two-feature isolation holds — this is the result the whole layer exists to produce.** Both features ran end-to-end with no artifact path written by both. Normalising each feature's slug to a placeholder made the two trees *identical*, i.e. they differ only by the `{feature-id}` segment. Both increments are literally `INC-001.md` with **no** filename prefix, distinguished only by the enclosing `alert-customer/` and `refund-fee-waiver/` directories — exactly as the contract specifies for per-item files. `features.toml` and `project.user.toml` are written by both mints, which is the registry/pointer contract rather than a collision. Switching `active_feature` overwrote only that one key and touched no artifact. Tree snapshotted (65 files). |
| F.14 | PASS | 2026-08-19T20:15Z | 4/4 | 0/1 SKIP | **Run by me directly against both snapshots, not delegated.** (1) The trees differ by exactly one directory level and no filename: `requirements/refund-delay-alert-requirements.md` vs `requirements/alert-customer/alert-customer-requirements.md`. (2) The **filename** glob `*-requirements.md` matches in both layouts. (3) The **depth-sensitive** glob `requirements/*-requirements.md` matches F.6 and returns "no matches found" on F.13 — the documented breaking change is real and is scoped to depth only, as claimed. (4) The working-tree shape `docs/<ID>/requirements-package/{analysis,requirements}` is **identical** in both. The SoD `[user]` criterion is **SKIP** — neither sandbox is in SoD directory mode. It is, however, answered adversely by inspection: see F-12, where all three SoD paths in `steps/00-scope-target-repo.md` omit the segment. |
| F.16 (runtime half) | PASS | 2026-08-19T20:08Z | 1/1 | 0/1 | The stale pointer **halts in both modes** and routes to `select-feature` — Mode A with create reachable, Mode B with `select-only`. Nothing written (checksums identical). The `[user]` actionability criterion **fails**: the message says "No active feature" when `project.user.toml` plainly sets one, so it contradicts the file the user opens next and never names the offending value. See F-13. |
| F.17 (runtime half) | **FAIL** | 2026-08-19T20:08Z | 0/1 | — | **Both modes silently proceeded.** A duplicate `id` leaves the pointer *resolvable* — `refunds` is present, twice — and step 3 tests only presence, so the precondition passes and neither mode emitted anything about the duplicate. The two entries carried divergent titles and divergent `repos`, and no doc says which governs. See F-11. |
| F.18 (runtime half) | **FAIL** | 2026-08-19T20:08Z | 1/2 | 1/1 | **Both modes silently proceeded.** No skill reads the registry's `repos` field anywhere (verified by me across `requirements/`, `design/`, `planning/`), so `ghost-repo` was never loaded and could not be flagged. The advisory criterion technically passes — the run-time scope prompt did win, tested in a purpose-built SoD sandbox where the two could actually meet — but it won by walkover, not by resolving a conflict. `ghost-repo` is not even offerable, since the prompt's candidate list is built from `[[project.repos]]`. See F-11 and F-14. |
| F.19 | **FAIL** | 2026-08-19T19:48Z, adjudicated 20:26Z | 1/1 | 0/1 | `[auto]` criterion **confirmed twice**: both validators accept a registry whose sole `id` is `architecture` (my synthetic fixture, and again the registry the skill actually minted), establishing that the mint-time warning is the only defence and must not be removed. The `[user]` criterion is where this breaks down. A warning did fire and did explain the silent adoption — but only because the run volunteered, unprompted, that `docs/architecture/` was hand-written notes. SKILL.md:89 gates the warning on "a `docs/` directory **the user has just said is *not* this feature**", and **no step ever asks that question**. Worse, the warning text is not a doc-supplied template — lines 89-96 are rationale addressed to the implementer, with no blockquote, unlike the proposal at 103-104 and the reconciliation offer in `feature-precondition.md`. So this step adjudicates a warning the agent reconstructed, not one the skill supplies. **Operator adjudication (2026-08-19): FAIL.** A sole defence that the default path bypasses is functionally absent, so the `[user]` criterion is not met; the fix in F-4 is accepted as the intended remedy. |

### F.5 — known-five doc-debt status

The five files named by CHANGELOG 2.4.0 § "Known documentation debt", which that entry says "should be cleared before merge":

| # | File | Status | Evidence |
|---|---|---|---|
| 1 | `references/ai-principles/write-discipline.md` | **Mis-described** — nothing to fix as characterised | The CHANGELOG says "per-section paths still described as non-feature-scoped". The file is 116 lines and contains **no path examples at all**: zero occurrences of `docs/`, `{paths.`, or any `<feature*` placeholder. Its only filename references are bare names in prose (`raw-architectural-observations.md:57`, `04-functional-reqs.md:82`), not paths. There is no per-section path here to feature-scope. |
| 2 | `_docs/ai-sdlc-stage-map-new.md` | **Still open** | Retired `docs/<feature>/` at `:123` (requirements), `:163` (design), `:194` (design alias), `:260` (quick-dev). Assembled packages at `:141`, `:169`, `:262`, `:269` sit directly under their stage directory with **no intervening `<feature-id>/` level** — the pre-phase-3 flat shape. This is the document a reader consults *for* the layout. |
| 3 | `AGENTS.md` | **Still open** | Zero hits for `feature-id`, `features.toml`, or `select-feature`. Its `## Vocabulary` section defines Stage / Increment / Package and does not define Feature, so the framework's own orientation file omits the identity layer entirely. |
| 4 | `references/elicitation-patterns/project-bootstrap.md` | **Still open** (cosmetic) | Zero hits for `feature-id` / `features.toml`. |
| 5 | `config/framework.toml.example` | **Still open** (cosmetic) | Zero hits for `feature-id` / `features.toml` / `feature`. |

## Findings

### F-1 (MEDIUM) — Check N1b does not scan `references/`, where the behaviour-driving contract lives

N1b's retired-placeholder sweep targets exactly three roots (`scripts/validate.py:893-895`):

```
targets = sorted(SKILLS_ROOT.rglob("*.md")) + sorted(TEMPLATES_ROOT.rglob("*.md")) + sorted(COMPOSITIONS_ROOT.glob("*.yaml"))
```

with `SKILLS_ROOT = .agents/skills`, `TEMPLATES_ROOT = templates`. **`references/` is not scanned.** That tree holds `references/ai-principles/feature-precondition.md` — the contract 17 skills are governed by — plus `write-discipline.md` and every `references/elicitation-patterns/*.md`. A retired spelling reintroduced into the contract itself would not be caught by the check written to prevent exactly that.

Currently latent, not live: `rg 'docs/<feature>|<feature-folder>|<feature-name>' references/` returns **no hits**, so the tree is clean today. Recording it because the guardrail's value is preventing future regression, and this is the one tree where a regression would propagate to every governed skill.

Related and already self-reported: CHANGELOG 2.4.0 Fixed entry 11 notes "nothing enforces this binding, unlike write-discipline's `## Preconditions` check for `create-*` skills; a mirrored check is still outstanding, and is why the gap survived to review." Extending N1b's roots to include `references/` and adding the mirrored binding check are the same piece of work.

### F-2 (LOW–MEDIUM) — three files outside the known-five describe the flat shape; one is a live test plan

F.5's `[auto]` criterion asks that no file outside the known-five describe the flat shape in a way N1 misses. Three do. All sit in `_docs/`, which N1 does not scan.

| File | Hits | Why it is not a design record |
|---|---|---|
| `_docs/skills-test-plan.md` | `:1331`, `:1582` | **The most consequential.** `:1582` pins an expected output path as `<feature-folder>/quick-dev-package/<feature-id>-quick-dev-plan.md`, citing `plan-quick-change/SKILL.md` step 7. An operator running the main test plan would assert against a retired spelling — and `plan-quick-change` is one of the four skills moved to Mode B on 2026-08-18, so this row is doubly stale. |
| `_docs/solution-context-gap-audit.md` | `:23`, `:29` | An audit table describing the current requirements-package layout, not a superseded design. |
| `_docs/solution-context-layer.md` | `:68` | A scope/lifetime table describing the current layout. |

Deliberately excluded as legitimate: `_docs/feature-id-path-segment-plan-superseded.md` and `_docs/feature-id-minimal-plan.md` (design records — CHANGELOG entry 13 states these keep the literal form on purpose, "naming what was superseded is the purpose of a superseded plan"), `_docs/pr-2051-review-replies.md:188` (quotes N1's own retired list), and `scripts/validate.{py,js}` + both test suites (regex definitions and fixtures).

**Plan-wording note.** F.5 tags the new-entrant check `[auto]` while its prose says the step "cannot FAIL on finding debt — it fails only by leaving the state unrecorded". Those conflict when an entrant is actually found. Recorded here as PASS-w/-FINDINGS on the prose reading, which is clearly the intent; the criterion would be better tagged `[user]` or reworded to "new entrants are enumerated".

### F-3 (MEDIUM) — the output-path echo cannot precede the write in create mode, and the docs claim twice that it does

`select-feature`'s workflow orders the write before the echo. Step 4 (`SKILL.md:79-80`) ends:

> Append the entry to `features.toml` and set it as `[user].active_feature`.

Step 5 (`:116-120`) is the echo. So in create mode both config files are on disk before the user sees a single resolved path. Two statements in the same file assert the opposite:

- `:119-120` — "This is the cheapest possible guard against writing to the wrong place — the user sees it **before any work starts**."
- `:154-155`, Common mistakes — "**Skipping the output-path echo.** It is the one moment a wrong resolution is cheap to catch, **before anything is written to disk**."

The second is false in create mode, which is the mode where a wrong resolution is actually possible — in select mode the paths derive from an entry the user just picked from a list. Verified against the live tree, not inferred from the run.

**Independently reproduced at runtime by F.13, which raises confidence from "found by inspection" to "observed twice, in two mints."** F.13 minted two features and reported the ordering defect without being pointed at it, reaching the same reading of the same step numbers and quoting the same two guarantee sentences. Its echoes were verbatim and correct in content — five resolved paths each, covering all four stage roots plus the working tree — but both landed *after* `features.toml` and `project.user.toml` were on disk. Two independent runs converging on this is the strongest-evidenced finding in the set.

**Impact is real but bounded, and worth stating precisely rather than overstating.** What lands before the echo is two reversible config lines, not artifacts; the fix is deleting an entry. The echo still precedes every *artifact* write, so the expensive failure the guard exists to prevent is still prevented. What is lost is the stronger guarantee the text advertises, and the plan's F.8 criterion inherited that overclaim verbatim ("fired … before anything was written").

**Recommend** one of: move the echo ahead of the append in step 4 (echoing a *proposed* path before committing costs nothing and would make both claims true), or reword `:154-155` to "before any artifact is written". The first is preferable — it makes create mode's echo a genuine pre-write confirmation, which is what the Common-mistakes bullet is selling.

### F-4 (HIGH) — the collision warning's trigger is never asked, and the proposal rule recommends the very collision it warns about

Two rules inside `select-feature` step 4 read the same `docs/` listing and reach opposite conclusions, and which one fires depends on whether the user volunteered something the skill never asks for.

- **The warning** (`SKILL.md:89`): "Also warn if the slug matches a `docs/` directory **the user has just said is *not* this feature**." Nothing in step 4 — or anywhere in the workflow — asks the user whether a `docs/` directory is theirs.
- **The proposal** (`SKILL.md:98-104`): if a `docs/<name>/` matches no registered feature and plausibly covers the work, propose *that directory's name* and say "that directory already matches, so nothing has to move."

On a project with a hand-written `docs/architecture/` and the title "Architecture refresh", the proposal rule fires first, finds `architecture` unregistered and plausibly covering the work, and **recommends it — using the warning's own subject matter as the selling point.** A user who simply accepts the recommendation never sees the warning, and the resolution rule then adopts their architecture notes as the feature's working tree without asking.

**Why this is HIGH rather than MEDIUM.** F.19's premise, which I verified from both sides, is that the mint-time warning is the *only* defence: both validators accept a registry whose id is `architecture`, and `config/SCHEMAS.md` § 2.8 confirms the asymmetry ("a convention rather than a validated rule … `select-feature` warns at mint time"). A sole defence that the default path bypasses is functionally absent. The plan says this warning "must not be removed"; it does not need removing.

Compounding it, the warning has **no user-facing template.** Lines 89-96 are rationale addressed to the implementer. The adjacent proposal gets a quotable blockquote (`:103-104`) and the reconciliation offer in `feature-precondition.md` gets a fully drafted two-option blockquote (`:63-68`). So even on the path where the warning does fire, its wording is left to the agent, and the load-bearing clause — that adoption happens *silently, without asking* — can be dropped without violating any doc.

**The inverse gap, same root cause.** Declining a proposed matching directory — the override F.9 exercised — is what actually produces two trees for one feature, the failure the whole mechanism exists to prevent. That path is completely silent: no warning, and no record that the matching directory was considered and rejected. Warning coverage is inverted relative to risk, with the louder case being the safer one.

**Recommend** replacing both rules with one unconditional question whenever the proposed id matches a `docs/` directory: "`architecture` matches `docs/architecture/` — is that directory this feature's work, or something else?" That single question distinguishes the two cases the two rules are currently racing to classify, and it makes the warning reachable by default instead of by user initiative. Pair it with a drafted blockquote for each branch.

### F-5 (MEDIUM) — no slug-derivation rule exists, so the title branch still resolves the id by agent discretion

`SKILL.md:78` says only "propose a kebab slug as the `id`". `config/features.toml.example:23-26` adds only that it is "used verbatim as the directory name, so keep it short and recognisable". There is no stop-word list, word limit, or truncation guidance anywhere.

"Alert customer when a refund is delayed" can defensibly yield `alert-customer`, `alert-customer-refund-delayed`, `refund-delay-alert`, or a literal kebab-casing of all nine words. Nothing prefers one. This sits exactly on the skill's stated purpose — `references/OVERVIEW.md` opens by describing the defect as an ID "resolved by whatever the agent decided in the moment", which for the title branch remains true.

Note the test-design consequence, which is why this is recorded rather than waved through: the F.8 run's `alert-customer` is defensible only because the plan's test title is copied verbatim from the skill's own `references/EXAMPLE.md`, where that slug is the worked answer. The step therefore cannot distinguish a correct derivation rule from a lucky match against an example. Two agents minting from the same title on different days can produce different ids — the drift the registry exists to eliminate, displaced one level up into the naming step.

### F-6 (LOW) — four documentation defects around the registry, one of them user-facing

| # | Defect | Evidence |
|---|---|---|
| a | **`config/SCHEMAS.md` § 2.8.3 does not exist, and the validators cite it in output.** § 2.8 has no subsections (`rg '^#+ *2\.8' config/SCHEMAS.md` → single heading at `:528`). The citation appears in `config/features.toml.example:14`, `scripts/validate.py:954`, `scripts/validate.js:1092`, and `scripts/test_validate.py:754`. | The two validator hits are the ones that matter: **every project with an empty registry is told to consult a section that does not exist.** Confirmed live — it appeared in F.7's own output this run. The content is real (§ 2.8's "Absence vs. emptiness" paragraph); only the pointer dangles. |
| b | **`created` is required by the schema but absent from the skill's write-time checks.** `INPUTS-OUTPUTS.md`'s "Validation rules" section mirrors rules 13-16 "so a bad entry is caught before it lands", and never mentions `created`; its only appearance (`:32`) is a rule about never mutating it. § 2.8 concedes the field is "required by convention rather than by any check". | `select-feature` is the field's only writer, so its check list is the right place to require it. A mint omitting `created` yields an entry the schema calls invalid and every check calls fine. |
| c | **`references/EXAMPLE.md:59` cites the wrong workflow step.** "Empty registry → skipped straight to create (step 2 of the workflow)." Create is step 4; step 2 is the branch that routes to it, and `SKILL.md:63` itself says "skip straight to create (step 4)". | Two files in one skill disagree on the step number for the same transition. |
| d | **`select-feature` creates `project.user.toml` without the `.gitignore` append its peer guarantees.** `start-project` lists the `.gitignore` patch as an output row fired "Always when `project.user.toml` is written" (`steps/05-write-project-toml.md` step 6). `select-feature` has no `.gitignore` handling anywhere; `INPUTS-OUTPUTS.md`'s side effects mention only creating the `[user]` block, not the file. | Confirmed by the F.8/F.9/F.19 runs: all three sandboxes started with no `project.user.toml` and `select-feature` created the whole file. On any project where `select-feature` is the file's first creator — every project predating the pointer — a file documented as "GITIGNORED / personal / machine-local" is left committable. Note F.7 confirms the other side: `start-project` correctly made **no** `.gitignore` when the user declined the personal layer. |

### F-7 (MEDIUM) — the contract promises a per-feature state probe that the navigator's own spec does not define

`references/ai-principles/feature-precondition.md` § "Mode C" says `framework-navigator` resolves the active feature "purely to inform its recommendation and its **per-feature state-probe output**."

No such output exists. `references/state-probe.md`'s "Output shape (in-memory)" (`:117-135`) carries a flat `stage_artifacts` dict of six **project-level** booleans with no feature dimension, and a single `active_feature: <string | None>`. The same file contradicts the contract directly at `:43-45`, saying the active feature "only informs the recommendation (step 03 may add `select-feature` as a prerequisite ahead of a feature-aware skill) and the **catalog-mode footer**" — recommendation and footer, not a coverage report.

**Observed consequence in State 3.** The probe reported `requirements_package = true` for the active feature, and it was right — but only because `alert-customer` is the sole registered feature. Step 3's stage-artifact check resolves `[project.paths].requirements_package` (`.framework-output/requirements`) and asks whether it "exists and is non-empty", with **no `{feature-id}/` segment in the check**. On a two-feature project it would report `true` for a freshly-minted feature that owns nothing, because a *different* feature's directory makes the stage root non-empty. That is a confidently wrong answer about the wrong feature — the same class of failure `feature-precondition.md` Mode B's echo requirement exists to prevent for reviews.

**Second half: the working tree is invisible on greenfield.** `docs/` is examined only in Step 5, explicitly headed "(brownfield only)" (`state-probe.md:86`). But `feature-precondition.md` § "Resolving the working-tree directory" makes `docs/<feature-id>/` the per-section working tree for **every** opted-in project regardless of flow. So on a greenfield project the navigator is structurally blind to half of a feature's on-disk state. Confirmed in State 3: `docs/alert-customer/requirements-package/requirements/index.md` was present and the probe never looked at it.

**Third: unset and stale collapse into one value.** `state-probe.md:40` records `None` both when no pointer is set and when a pointer names an absent feature ("otherwise record `None` and note the stale-pointer case"), and the output shape has only `string | None` to carry it. `config/SCHEMAS.md:656-659` is explicit that these are different: a pointer "set but unresolvable (typo, or the feature was never committed) … is an **error**, not a silent fallback — inventing a directory for an unregistered feature is exactly the drift this mechanism exists to prevent." The navigator therefore cannot tell a user "your pointer is a typo" differently from "you haven't picked a feature yet". Mode C correctly never *halts* on either, but it also cannot report them apart.

**Why this is MEDIUM and not HIGH.** Nothing here breaks the identity layer or misplaces a file — the navigator writes nothing, and its recommendation was correct in all three states. What fails is a reporting capability the contract advertises. It becomes materially misleading only on a project with two or more features, which is precisely the situation this whole release exists to support.

**Recommend** either giving `stage_artifacts` a feature dimension and ungating the `docs/` glob for opted-in projects, or — cheaper and honest — reducing Mode C's claim to what the probe actually does ("to inform its recommendation and its catalog-mode footer"), matching `state-probe.md:43-45`. The second is a one-line edit and removes the contradiction; the first is the real fix. Splitting `active_feature` into a value plus a resolution state (`unset` / `resolved` / `stale`) is a separate small change worth doing alongside either.

### F-8 (MEDIUM, downgraded from HIGH) — reconciliation is reachable only from the three create-side workflows, and cannot see a split that already exists

> **Corrected after the F.6 run.** I first recorded 8a as "nothing routes through the working-tree rule." That is wrong and the correction lowers the severity. Three create-side workflow files route through it explicitly — `create-requirements-package/references/requirements-writing-workflow.md` sub-step 0a item 3, `create-design-package/references/solution-discovery-workflow.md` sub-step 0 item 3, and `document-quick-change/SKILL.md` item 1 — each in the same form: "resolve the feature directory itself through the precondition's *Resolving the working-tree directory* order first. If a pre-opt-in directory exists under the feature's bare slug, that rule halts to ask rather than letting you create a second tree beside it." So the mechanism **is** wired up for requirements, design, and quick-dev. 8a's real scope is narrower and is stated below. 8b is unaffected and is the defect that actually bit in F.10.

**8a. The routing lives in per-skill workflow files, not in the contract's mode steps — so it covers the three create skills and nothing else.** Mode A (`feature-precondition.md:196-212`) runs: 1 presence check → 2 resolve pointer → 3 halt if unresolved → 4 echo and write. Mode B is defined as "Identical to Mode A, with one difference at step 3." Neither sequence references *Resolving the working-tree directory* or its reconciliation check; the only bridge inside the contract is the scope note at the top of the file, 160 lines earlier.

That matters because the compensating routing is per-skill, and the three files that carry it are all `create-*` workflows. The **ten Mode B skills** never route through the rule — they have no equivalent sub-step, and Mode B's definition inherits only "identical to Mode A." A review skill therefore resolves its working-tree directory with no reconciliation check anywhere in its path. That is a defensible design (reviews don't create directories), but it is nowhere stated, and it means the coverage of the framework's split-prevention backstop is: 3 skills wired, 16 not. Placing the step in the contract between Mode A steps 3 and 4 would make the coverage uniform and would not depend on each new skill author remembering to re-add the routing.

**8b. Case 1's unconditional "stop here" means reconciliation can never detect an existing split.** The resolution rule (`:35-43`):

```35:43:references/ai-principles/feature-precondition.md
## Resolving the working-tree directory

Both Mode A and Mode B need the per-section working-tree directory, and on an
opted-in project that directory is `docs/<feature-id>/`. Resolve it in this order:

1. `docs/<feature-id>/` exists → use it. This is the steady state and the common
   case; stop here.
2. It does not exist → apply the reconciliation check below, then create
   `docs/<feature-id>/`.
```

The reconciliation check lives inside case 2 only. So it runs at most once in a feature's lifetime — before its working-tree directory exists — and never again. **Demonstrated directly in F.10 run 2:** with `docs/refund-processing/` and `docs/refunds/` both present, `create-requirements-package` resolved to `docs/refund-processing/`, echoed, and continued. One feature's work living in two trees is the exact failure this mechanism was built to prevent, and once that state exists nothing surfaces it again on any subsequent run.

**Interaction with the plan's F.10 criterion.** This also explains why F.10's third `[auto]` criterion is unexercisable as written. The contract says option (b) is unsafe when artifacts exist "on either the working-tree or the assembled side" (`:77-79`), but putting them on the working-tree side *creates the directory*, tripping case 1 and skipping the check. The only state that reaches the check with the precondition live is assembled-artifacts-present / working-tree-absent. Tested there, (b) is correctly withheld.

**Relationship to F.20.** This is the same structural hole as the § 13.2 migration gap — nothing inspects a project's artifact layout once the precondition's cheap-exit fires — but unlike F.20 it is **not** documented as a known limitation, and unlike F.20 it defeats a mechanism the plan bills as a backstop rather than a nice-to-have.

**Recommend**, in priority order: (1) insert an explicit working-tree-resolution step between Mode A steps 3 and 4, referenced from Mode B — this is the single highest-value fix and is a doc edit; (2) either give case 1 a cheap companion check ("and no unregistered `docs/` directory plausibly holds this feature's work") or state plainly in the contract that a split predating opt-in is out of scope, so nobody expects the halt.

### F-9 (HIGH) — ten Mode B skills depend on a create-suppression that the implementing skill's own workflow contradicts

`select-feature/SKILL.md` is the single place that implements select-only. It **never mentions it.**

| String | Where it appears |
|---|---|
| `caller_mode` (the parameter) | Exactly **2** files: `select-feature/references/INPUTS-OUTPUTS.md` and `references/ai-principles/feature-precondition.md`. |
| `select-only` (the concept) | **14** files — including all 10 Mode B `SKILL.md` files, each declaring it invokes `select-feature` "in select-only mode". |
| Either, in `select-feature/SKILL.md` | **None.** `rg 'caller_mode\|select-only'` exits 1. |

Worse than silence, the workflow instructs the opposite. Step 3 (`:71-77`): "Offer 'create a new feature' as a **permanently visible option** in the same list, not buried beneath it." Unconditional — no select-only guard. Step 4 (Create) has no guard either. So the primary document an agent reads tells it to always offer create, while ten callers rely on it not doing so.

F.12 got the correct behaviour, but only because the run went and read `INPUTS-OUTPUTS.md`. An agent following `SKILL.md` — which is what the progressive-disclosure convention encourages, since references load on demand — would offer create on a `review-*` invocation and let a reviewer mint a feature with nothing to review. That is the precise defect Mode B exists to close, and it is reachable by reading the more authoritative of the two documents.

**Second, narrower gap on the same path.** Step 2's no-match branch (`:65-69`) says that when a caller supplies a description matching nothing, "skip straight to create rather than making the user reject a list first." Under select-only that routes to a suppressed step with no documented fallback. It did not bite in F.12 because the description matched, but it is reachable by any `review-*` invocation whose description doesn't resemble a feature title — which is most of them, since "review the requirements package" describes an action, not a feature.

**Recommend** adding select-only to `SKILL.md` explicitly: gate step 3's create offer on `caller_mode`, gate step 4's reachability, and give step 2's no-match branch a select-only fallback (present the full list, or halt naming the producing `create-*` skill). Also worth noting that `references/EXAMPLE.md` has no select-only scenario — both its scenarios exercise select-and-create — which is plausibly why this went unnoticed despite Mode B being the larger set at 10 skills versus 7.

### F-10 (LOW) — three halt-message defects that leave wording to the agent

| # | Defect | Evidence |
|---|---|---|
| a | **The empty-registry halt promises to name a skill, then names none.** `feature-precondition.md:234` says "the halt message changes to name the producing skill instead", but the template two lines below reads "Run the stage's `create-*` skill first." — which names nothing. Observed in both F.11/F.12's variant and F.21. | Either drop the claim from the prose or give the template a placeholder (`Run \`<producing-skill>\` first.`). The runs emitted it verbatim rather than substituting, which is the doc-faithful reading. |
| b | **The "none of these" escape has no wording and sits outside the quoted halt.** The two reconciliation options are given verbatim at `:63-68`; the escape is prose at `:84` ("offer 'none of these' and move on"), 16 lines later. | The plan's F.10 checklist expects the escape *in* the halt. It should be a third bullet inside the quoted block, since everything else in that halt is scripted. |
| d | **`select-feature` supplies no message template for the duplicate rejection.** Step 4 states the rule ("Reject a slug already in the registry and ask for another") and `## Common mistakes` restates the rationale, but there is no quoted block — so the wording of the framework's *only* runtime duplicate defence (F-11) is improvised per session. The skill's one quoted string is the `docs/refunds/` slug proposal at `:104-106`. | With F-10(b), the pattern is that `select-feature`'s user-facing strings are systematically unspecified while the precondition contract's are verbatim. |
| c | **Option (a) says "one `git mv`" with no fallback for an untracked directory or a non-repo project.** `:65` states it unconditionally, and `select-feature`'s scope note confirms nothing else touches the artifact tree. | Option (b) can be simultaneously unavailable (F.10 run 2b), leaving a project with no offered path. Reword to "`git mv` where the directory is tracked, a plain move otherwise." |

### F-11 (HIGH) — the precondition is a resolvability check, not a validity check, so three of four registry rules have no runtime enforcement

F.17 and F.18 both failed, in both modes, for one shared structural reason. Mode A step 3 halts when the pointer is "unset, or set to a value **not present** in `features.toml`" — presence is the entire test. Every defect that leaves the pointer *resolvable* therefore passes through untouched:

| `SCHEMAS.md` § 4 rule | Defect | Pointer still resolves? | Runtime enforcement |
|---|---|---|---|
| 13 | malformed `id` (bad slug shape) | yes | **none** (inferred — not run) |
| 14 | duplicate `id` | yes — twice over | **none** (F.17, observed) |
| 15 | stale pointer | **no** | halts correctly (F.16, observed) |
| 16 | ghost repo in `repos` | yes | **none** (F.18, observed) |

For the duplicate case the contract makes its own coverage gap explicit, and the delegation is unreachable:

```257:261:references/ai-principles/feature-precondition.md
## Explicitly not this precondition's job

- **Minting logic.** All of it — slug proposal, the uniqueness check, registry
 writes — lives in `select-feature`. This precondition only decides *whether* to
 call it and in which mode.
```

`select-feature` is invoked **only** when the pointer fails to resolve. A duplicate is a state where it resolves fine, so the one component that owns the uniqueness check never runs. I confirmed the word "duplicate" appears nowhere in `feature-precondition.md`. The mint-time refusal *does* work — verified in a separate sandbox, rejected before any append, checksum unchanged — but it is the only non-CI defence, and it is bypassed by every route that isn't minting: a hand-edit, a bad merge resolution, or `features.toml` being append-only across two branches that both minted.

This is worse than a missing check, because the resulting state is *ambiguous rather than broken*: F.17's two `refunds` entries carried different titles and different `repos`, and nothing says which governs. A skill must pick one to populate a title, and either choice is arbitrary — against `references/ai-principles/README.md` Principle 7 ("halts with the specific question, not a best guess"), whose listed anti-pattern of "burying a halt-worthy ambiguity in a `Notes` cell" is the gentler version of what happens here, where it is not even noted. Mode B is the sharper risk: it returns a *verdict*, and its own precondition warns that reviewing the wrong feature "returns a confident verdict about the wrong artifacts."

**Fix options:** narrow step 3 to "resolves to **exactly one** entry" (cheap, catches rule 14), or state plainly that registry validity is CI's job alone. The current text implies coverage it does not provide.

### F-12 (HIGH) — the `{feature-id}/` segment is missing from five path strings across three files, and Check N1 is structurally unable to see any of them

Reported from the F.16–F.18 run as two instances; **my own sweep of `.agents/skills/`, `templates/`, `references/` and `config/` found a third file the run did not reach.** This is the most consequential finding of the run, because it is a live artifact-location split in exactly the layer the plan exists to test.

Two review gates drop the segment in their "Legacy mode" branch, and a third has it right:

| Skill | Legacy-mode path | Segment |
|---|---|---|
| `review-requirements-package/SKILL.md:46` | `{project.paths.requirements_package}/{feature-id}-requirements.md` | **missing** |
| `review-design-package/SKILL.md:46` | `{project.paths.design_package}/{feature-id}-design.md` | **missing** ← *not reported by the run; found by my sweep* |
| `review-quality-package/SKILL.md:63` | `{paths.quality_package}/{feature-id}/{feature-id}-quality.md` | correct |

`review-quality-package` is the control case: it proves the correct form was known and applied in one of the three, so the other two are an oversight rather than a design decision. (`review-implementation-package` has no such bullet — its package is a directory, a different shape.)

The consequence is a broken stage handoff. `create-requirements-package`'s Output table writes the scoped form, so on **any opted-in non-SoD project** the create skill writes to `…/requirements/<id>/<id>-requirements.md` while the review gate looks in `…/requirements/<id>-requirements.md` and finds nothing. That configuration is not exotic: it is the F.16/F.17/F.18 sandbox, it is the `project.toml` this plan itself specifies, and per the 2.4.0 bootstrap change it is what a new project gets by default. The root cause is a terminology collision — "Legacy mode" here means *non-SoD*, **not** *not-opted-in* — so the branch that fires for opted-in projects carries the pre-opt-in path.

Separately, `create-requirements-package/steps/00-scope-target-repo.md` omits the segment from all three of its modes (`:27` single-repo, `:31` cross-cutting, `:44` colocate), contradicting both its own `SKILL.md` Output table and the contract's explicit ruling that in SoD mode "the segment goes *inside* the `<repo-code>/` directory". Note `:44` also falsifies the contract's claim that colocate mode "is already correct and changes nothing — it has always nested under `<feature-id>/`". The requirements stage therefore has **three** path resolvers and two of them drop the segment. This pre-answers part of F.14's SoD criterion.

**Why nothing caught it — confirmed by reading `check_n1()` rather than inferred.** The segment assertion and the skill-file scan are two separate loops, and only the narrower one carries the assertion:

| Sub-check | Files walked | What it asserts |
|---|---|---|
| N1a | `templates/compositions/*.yaml` only | the **first** `default-output-path` match per file carries `/{feature-id}/` |
| N1b | `.agents/skills/**/*.md`, `templates/**/*.md`, compositions | only that no **retired spelling** (`<feature>`, `<feature-folder>`, `<feature-name>`) survives |

The segment test `if f"/{FEATURE_SEGMENT}/" not in out_path` lives exclusively inside N1a's loop over composition YAML. N1b walks every skill markdown file but checks *only* for retired placeholders. So a path in a skill `.md` that is rooted at a per-feature key, spells `{feature-id}` correctly, and omits the directory segment is checked by **nothing** — which is precisely all five defects above. Two narrower notes: N1a uses `DEFAULT_OUTPUT_PATH_RE.search()`, so only the first output path in a composition is ever tested; and fenced blocks are exempt from N1b by deliberate design.

**The validator's own self-description overstates its coverage.** `check_m()`'s docstring reads: "Pairs with Check N1: M asserts every path token names a real key, N1 asserts every feature-scoped path carries a feature segment. Together they close both halves of the routing contract." The second clause is true only of composition `default-output-path` values, not of feature-scoped paths generally — and the two halves are therefore not closed. A maintainer reading that docstring would reasonably believe the class of defect in F-12 is impossible.

**F.3 is the controlled proof of this, and it is worth stating as the single clearest result of the run.** F.3's injection stripped the segment from a composition, producing `{paths.requirements_package}/{feature-id}-requirements.md` — **the same string, to the character, as the real defect at `review-requirements-package/SKILL.md:46`.** In the composition both validators rejected it immediately, with an error explaining that "two features' artifacts would collide in one directory." In the skill markdown file the identical string ships today and the validators are green. Same defect, same spelling, same consequence; caught in one location and invisible in the other, purely because of which glob it falls under. Nothing about the defect changed — only the file extension.

CHANGELOG entry 4 records ~33 occurrences mechanically updated across these stages; these five are what the sweep missed, and by construction the validator could not tell you. Compounding F-1: N1's blind spot is not just *which directories* it scans but *which defect class* it can express. Extending N1a's assertion to any path in a skill `.md` that is rooted at one of the four `FEATURE_SCOPED_PATH_KEYS` would catch all five, and needs no new concept — only a wider glob.

### F-13 (MEDIUM) — one halt message serves two different causes and is factually false for one of them

Mode A step 3 fires on "unset, **or** set to a value not present in `features.toml`" but emits a single string: "No active feature." For the stale-pointer case that sentence is untrue — a feature *is* active, it just doesn't resolve — and it contradicts the file the user opens next, where `active_feature = "no-such-feature"` sits in plain sight. `SCHEMAS.md` § 4 rule 15 already draws the distinction ("Unset is valid… set-but-unresolvable is an error"); the message loses it.

The comparison that makes this concrete: the **validator** says the pointer "resolves to no `id` in features.toml — a stale pointer sends every write to a feature that does not exist," naming cause and consequence. The CI message is markedly more actionable than the runtime one, which is backwards — the runtime reader is the one with no other context.

A second gap compounds it: `select-feature`, the halt's destination, has no stale-pointer branch. Step 3 says only "Mark the current `[user].active_feature`, if any", which with a stale value silently marks nothing. The broken pointer is never surfaced, explained, or cleaned up, so the user sees a normal-looking list and never learns why they were sent there. In Mode B it is worse: `select-only` leaves selecting the one unrelated feature as the only reachable move, and the halt never says that reviewing needs an artifact to already exist.

### F-14 (MEDIUM) — the "offer to update `repos` on divergence" obligation is implemented nowhere

`config/SCHEMAS.md` § 2.8 requires it: "When the run-time answer diverges from `repos`, the skill should offer to update this field rather than let the two drift apart silently." I verified across `requirements/`, `design/` and `planning/` that **no skill reads the registry's `repos` field at all** — so none can detect divergence, and none can offer. The outcome is precisely the silent drift the sentence forbids.

`repos` is therefore not advisory-but-reconciled; it is write-only data with no runtime consumer, and rule 16 is its only reader anywhere in the framework. F.18's SoD sub-variant demonstrated this directly: the scope prompt offered `api-billing` and `web-portal` from `[[project.repos]]`, `ghost-repo` was not even offerable, and answering `web-portal` diverged from the registry with no comment. Either add the comparison to `steps/00-scope-target-repo.md` or drop the clause.

### F-15 (MEDIUM) — opting out means opting back into the defect the layer exists to close, and the prohibition against it is written unscoped

`feature-precondition.md:203-204` is emphatic about the framework's core defect:

> **do not** invent an ID and **do not** fall back to a slug derived from the request — that silent-guess behaviour is the exact defect this precondition exists to close.

On the not-opted-in path that behaviour is **mandated**. `create-requirements-package/references/requirements-writing-workflow.md` sub-step 0a:

```40:41:.agents/skills/requirements/create-requirements-package/references/requirements-writing-workflow.md
1. The feature folder is the **registry's feature ID**, already resolved by this skill's active-feature precondition (`references/ai-principles/feature-precondition.md`). Read it; do not infer one, and do not put the folder name to the user as a question — negotiating it per-session is how the same work acquired two directories.
2. **Not opted in** (no `features.toml`): fall back to the prior behaviour — check for an existing `docs/*/requirements-package/` and reuse it if present, else infer a kebab-case name from the change description and confirm it with the user.
```

Item 2 instructs both actions item 1 prohibits — infer a name, and put it to the user. The F.6 run took exactly that branch and produced `refund-delay-alert` by inference, which is why F.6 passes: the flat shape is correct, and the id it used is a per-session guess.

**This is a scoping defect rather than a flat contradiction, and the distinction is the actionable part.** Read charitably the two items are sequential branches — item 1 for opted-in, item 2 for not. But item 1's prohibition is phrased unconditionally, and more importantly its *rationale* — "negotiating it per-session is how the same work acquired two directories" — is condition-independent. A not-opted-in project can acquire two directories for one piece of work just as easily; it has less protection, not more. So the exemption is granted on a rationale that does not survive it. Item 1 should say "on an opted-in project", and item 2 should acknowledge that the fallback knowingly re-admits the drift, which is the price of backward compatibility.

The framework-level point worth putting to the operator: **backward compatibility here is not neutral.** "Opt out" reads like "keep today's paths" but it also means "keep today's identity ambiguity," and no doc says so. Given F.20 already records that no migration path exists, a project that never opts in never gets the guarantee at all. That is a legitimate design choice; it is currently an undocumented one.

Same pattern confirmed verbatim in `create-design-package/references/solution-discovery-workflow.md` sub-step 0 items 1–2, so this is not isolated to requirements.

**Addendum — the fallback's reuse heuristic is self-satisfying, for an ordering reason.** Item 2's first clause ("check for an existing `docs/*/requirements-package/` and reuse it if present") is meant to stop a second directory appearing for work that already has one. But `steps/03-analysis.md:17` requires analysis artifacts under `docs/<feature-id>/requirements-package/analysis/` — written in Step 3 — while sub-step 0a, which resolves `<feature-id>`, is read in Step 4. So by the time the reuse check runs, Step 3 has already created the very directory it is checking for, and the check finds a tree the same run just made. Under strict progressive disclosure Step 3 also cannot know the directory it is required to write into, since the resolution rule sits in a reference file it has not opened. On the not-opted-in path this means the anti-drift clause is inert: it can only ever confirm the guess already committed to disk one step earlier.

### F-16 (MEDIUM) — the Mode A list contradicts the rule stated directly beneath it, and F.1's pinned counts are pinned to an explicitly undecided state

`feature-precondition.md:182-183` lists seven Mode A skills, the last two being `execute-quick-change` and `manage-bugs`. The very next paragraph then says of those two:

```192:194:references/ai-principles/feature-precondition.md
`execute-quick-change` and `manage-bugs` sit here pending a decision. Both read artifacts that
must already exist, so by the rule above both are Mode B candidates; `manage-bugs` is the
harder call because it is independently invocable and may be the first thing run on a project.
```

So both are *listed* as Mode A while the prose applies the file's own A/B rule and concludes both belong in Mode B. The rule is unambiguous — "A skill operating on an artifact that must already exist … belongs in Mode B even though it writes plenty" — and by it, `execute-quick-change` plainly qualifies. The consequence for an agent is concrete: Mode A and Mode B differ precisely in whether minting is reachable, so an agent invoking either skill has no determinate answer to whether it may mint a feature. That is an unresolved decision sitting in a file whose stated purpose is that "a change to the resolution logic … ripples through every consuming skill via a single edit."

**This bears directly on a correction I made to the plan, so stating the arithmetic explicitly.** F.1's repinned counts (7 Mode A / 10 Mode B / 19 `SKILL.md` citations) are correct as of today, and the totals close exactly once the citation count is separated from the governed count:

| Quantity | Count | Source |
|---|---|---|
| Mode A skills | 7 | `:182-183` list, *including* the two undecided |
| Mode B skills | 10 | `:222-229` list |
| **Governed skills** | **17** | 7 + 10 |
| Cite the contract without being governed by it | 2 | `select-feature`, `framework-navigator` — the plan's own second F.1 command |
| **`SKILL.md` files citing `feature-precondition`** | **19** | 17 + 2 |

7 + 10 ≠ 19 is therefore not an error in the repin; it is the two Mode C citations. Worth writing down because the mismatch looks like a defect on every future reading.

**But the pin is fragile in a specific, predictable way.** If the pending decision resolves the way the doc's own rule points, both skills move to Mode B and the counts become **5 Mode A / 12 Mode B**, with 19 unchanged. F.1 would then fail on the mode breakdown while passing on the citation count. Recommend either resolving the decision or having F.1 assert the 19 citations and the two Mode C exclusions as the stable part, with the A/B split recorded as a snapshot that is expected to move.

## Out-of-scope observations (recorded so they are not lost)

The F.7 / F.15 run surfaced seven further doc defects that are **not** part of the feature-ID or path-token work and do not bear on this plan's verdict. Logged here rather than as findings, for whoever owns `start-project` and `framework-navigator`.

| Area | Observation |
|---|---|
| `start-project` | `steps/03` elicits the whole `[project.change_log]` table and says "carry the resolved table forward to step 05", but `steps/05` sub-step 2's render list omits `[project.change_log]`. Following the render list verbatim silently discards data the user was just asked for — the F.7 run's `project.toml` has no change-log section despite the prompt being answered. |
| `start-project` | `config/project.toml.example:104` states "`start-project` scaffolds the file" for `CHANGELOG.md`. No sub-step creates it, it is absent from the SKILL.md Output table and from step 05's exit criteria, and the F.7 run produced none. |
| `start-project` | `steps/02` and `steps/03` both claim `references/elicitation-patterns/project-bootstrap.md` and its section anchors "do not exist yet", but the file exists and contains every anchor named. This had a live effect: `SKILL.md:48` says to use those prompts, the step files said not to look, so the authored elicitation script was never loaded and the run improvised. **Cross-reference:** this file is known-five doc-debt item #4 in F.5 — it exists and is reachable, it simply carries no feature vocabulary. |
| `start-project` | `steps/05` numbers two sub-steps `6` (`.gitignore` patch, then `6b` for the `features.toml` write), implying the registry write is a sub-item of the gitignore step — which it contradicts, since it ends by insisting `features.toml` must *not* be gitignored. |
| `framework-navigator` | `steps/03` says prerequisites are unmet "prerequisites in the active flow" while `steps/04` rule 4 says unmet "**gates**". Different sets: greenfield's `sequence` puts `capture-solution-context` before `create-requirements-package` without it being a `gates:` entry. The run followed the narrower gate-only reading. |
| `framework-navigator` | `references/recommendation-rubric.md`'s decision rules have an unhandled band: rule 1 needs top ≥ 0.55, rule 2 needs the top two within 0.10, rule 4 needs all below 0.30. A top score in `[0.30, 0.55)` with a gap > 0.10 satisfies none. F.15 State 3 landed exactly there (0.485 vs 0.358). |
| Path tokens — **reported as a defect, and it is not** | F.13 flagged `{paths.requirements_package}` vs `{project.paths.implementation_package}` as two spellings that "a resolver keyed on the literal token would fail on." I checked, and **Check M sanctions both by design**: its docstring and `PATHS_TOKEN_RE` treat "`{paths.<name>}` or `{project.paths.<name>}`" as equivalent and validate only that `<name>` is a declared `[project.paths]` key. Any conforming resolver must accept both. What remains is cosmetic: 23 compositions use the short form and exactly one — `greenfield-implementation-package.yaml`, 2 occurrences — uses the long form. A one-file normalisation if consistency is wanted; **not** a resolution risk, and not a finding. |
| `create-implementation-package` | **Cannot be reached from requirements alone, by design, and F.13 had to override a hard halt to produce `INC-001.md`.** `references/INPUTS-OUTPUTS.md` says to "halt and instruct the user to run `design/review-design-package` first"; `SKILL.md` lists the approved design package as required; `steps/plan-readiness-review.md` makes it structural, since its design-coverage and version-stamp checks are unsatisfiable without one and "a NO-GO verdict on any check blocks handoff." This does not affect F.13's verdict — the isolation criteria are about path shape, and the override is disclosed — but the plan should say F.13 requires a halt override, because a doc-faithful run cannot produce the increments F.13 asks for. Note also the stamp check has no N/A escape for a legitimately design-free increment. |
| `feature-precondition.md` | **The working-tree change tracker has two homes and two spellings.** The contract's worked example puts it at the feature root as `docs/<id>/CHANGE-TRACKER.md` (upper case); `create-requirements-package/SKILL.md`'s Output table puts it at `docs/<id>/requirements-package/requirements/change-tracker.md` (lower case). F.13 followed the skill, so the path the shared contract advertises does not exist in either sandbox tree. |
| `create-requirements-package` | **Five non-optional composition blocks have no output file assigned.** `steps/04-writing.md` maps 11 blocks to 11 files, while the composition declares `requirements/index`, `shared/overview`, `shared/glossary`, `shared/traceability` and `shared/change-log` as `optional: false` — none of which appear in that table. `write-discipline.md`'s closing inventory check says to enumerate expected artifacts from the composition and halt on any gap, which would halt **every** greenfield run. Both runs invented a resolution (folding them into the assembled index); neither was instructed to. |
| `create-requirements-package` | `templates/blocks/planning/increment-identity.md` specifies the FR ID format three ways — its Format block writes `FR-X.Y.Z` (hyphenated), its own Example immediately below uses `FR1.9.1` (unhyphenated), and `steps/04-writing.md` sub-step 5 specifies `FR[Area].[Feature].[Detail]`. The same block rules that "FRs must appear exactly as authored (IDs and names unchanged)", so a package and an increment authored to different conventions cannot both comply. |
| `create-requirements-package` | `greenfield-requirements-package.yaml` carries a stale shipped TODO — "elicitation prompts referenced above will land in a later task" — but all five referenced prompts exist under `references/elicitation-patterns/`. The TODO invites an agent to skip elicitation it could have run. Same root cause as the F.5 item on `project-bootstrap.md`: the file arrived and the pointer was never updated. |
| `write-discipline.md` | **"Combined" output structure is self-contradictory.** Prompt 2 offers "B) Combined — all content assembled into a single document", while invariant item 3 says that in Combined mode "the assembly step still writes incrementally per-section (not all-at-once at the end)." Whether Combined yields one file or per-section files plus a merge is unresolved. Both runs chose Full structure, so neither was bound by it — meaning **this path is untested by this plan** and would bind anyone who picks B. |
| `select-feature` | Nothing in the create path revisits `features.toml`'s preamble. F.13's seeded header comment ("No entries yet.") was left in place above two appended entries, so the file's own comment is now false. Cosmetic, but it is the first thing a human reads in that file. |
| `create-requirements-package` | **Three mutually incompatible per-section filename conventions.** `steps/04-writing.md` and `templates/blocks/requirements/completeness-tracker.md` disagree on both ordinals and names for the same blocks — `04-` means *User Journeys* in one and *Functional Requirements* in the other; Stakeholders is `02-` vs `03-`. `templates/blocks/requirements/index.md` follows the tracker; `write-discipline.md:82` introduces a third spelling (`04-functional-reqs.md`). The F.6 run followed `steps/04-writing.md` (the step that performs the writes) and recorded the conflict in the tracker rather than silently picking one. Bears on any tooling that globs section files by ordinal. |
| `create-requirements-package` | **A composition gate forbids the file that records the gate's own outcome.** `requirements/completeness-tracker` is gated `include-if: "project.policies.track_completeness == true"` (unset in the sandbox), yet `steps/04-writing.md`, `process.md` § File relevance recommendation, and Step 4's exit criteria all require the tracker unconditionally. Separately `requirements/permissions-access-control` is declared `optional: false` *and* carries an `include-if` — mandatory and conditional at once. |
| `create-requirements-package` | **The index template's links cannot resolve from the composition's output path.** `templates/blocks/requirements/index.md` emits bare co-located links (`[01-…](01-…)`), but the composition sends the assembled index to `{paths.requirements_package}/` while sections live under `docs/<feature-id>/requirements-package/requirements/`. Used verbatim every link is broken. The run wrote links resolving from the artifact's real location and flagged the deviation inline. |
| `create-requirements-package` | **"14 sections" is asserted four times and matched by no artifact.** `SKILL.md` (lines 10, 12, 62, 64) says to "review the 14 section blocks defined in the active composition's `blocks:` list" — that list has **20**; `steps/04-writing.md` has **12** sub-steps; only `completeness-tracker.md` actually has 14 rows. The instruction cannot be followed literally. |
| `create-requirements-package` | Two smaller items: `steps/04-writing.md` sub-step 12 calls the assembly output `requirements-package.md` "(alias to …`{feature-id}-requirements.md`)" without saying whether "alias" means one file or a copy plus pointer; and `analysis-workflow.md:30` decides whether discovery ran by checking for `discovery/requirements-elicitation.md`, a file never listed as a discovery output (`SKILL.md` names `current-capability-baseline.md`). |
| `write-discipline.md` | Line 67 mandates independent read-back verification after *every* write, which roughly doubles tool calls across a 20-block package. The F.6 run honoured it. Worth acknowledging as a known cost, or scoping to artifacts above some size. |
| `review-requirements-package` | Miscounts its own reviews in three places: `SKILL.md:12` and `:79` say **twelve** ("After Review 12, immediately create `review/readiness-verdict.md`"), `:115` says the verdict "MUST be written after Review **10**", and `references/INPUTS-OUTPUTS.md:19` says "one per review, **ten** total". Verified directly. Tangential to the feature-ID layer, but the readiness gate's position is load-bearing for the design handoff. |
| Test fixture (mine) | The sandbox `project.toml` I authored declares `default_flow = "greenfield"` with no `knowledge_base_path`, which `start-project steps/03` § "Hard gates" makes mandatory for greenfield/brownfield. It did not affect any result (the probe's KB branch only acts on brownfield), but the fixture is not a valid greenfield bootstrap output. Worth fixing if these sandboxes are reused. |

## Sandbox state / teardown

**Framework tree — verified clean.** F.2–F.4 were the only steps that touched committed content. After restore:

- `git status --porcelain --untracked-files=no` reports exactly one entry, `_docs/feature-id-targeted-test-plan.md` — the intentional F.1 repin, not test residue.
- No composition or template diff remains; both F.4 probe files are deleted and no `*f4-probe*` path survives.
- **Both validators re-run green (`py exit=0`, `js exit=0`)**, re-establishing the T0.1 baseline after the injections.

**Sandboxes — retained deliberately, not abandoned.** The plan's rollback for several steps is `rm -rf`, which would have destroyed F.14's inputs, so the two trees F.14 diffs are preserved:

| Path | Contents | Disposition |
|---|---|---|
| `~/Dev/feature-id-scratch/f14-snapshots/f6-sandbox/` | F.6 not-opted-in tree, 19 files | **Keep** until F.14's result is accepted |
| `~/Dev/feature-id-scratch/f14-snapshots/f13-sandbox/` | F.13 opted-in tree, 65 files | **Keep** until F.14's result is accepted |
| `~/Dev/feature-id-sandbox/`, `-f13/` | live F.6 / F.13 runs | Safe to delete — snapshotted |
| `~/Dev/feature-id-sb-f16/`, `-f17/`, `-f17-mint/`, `-f18/`, `-f18b/` | broken-state fixtures | Safe to delete |
| `~/Dev/feature-id-scratch/` (fixtures) | validator fixtures for F.16–F.20 | Safe to delete |

Nothing was written outside `~/Dev/feature-id-*` and this repo. One teardown caveat worth recording: the F.7 sandbox `project.toml` I authored is not a valid greenfield bootstrap output (see the out-of-scope table), so these fixtures should be regenerated rather than reused if the plan is re-run.

## Recommended next action

The identity layer's **core promise is verified and holds.** F.13 and F.14 together are the load-bearing result: two features produce trees that differ by exactly one directory level and nothing else, per-item files stay unprefixed, filename globs survive opt-in, and only depth-sensitive globs break — precisely as documented. F.6 confirms the opt-out path is genuinely inert. The validators are non-vacuous on every rule they cover (F.2–F.4), and Python and Node agree byte-for-byte everywhere they were compared.

The failures are not in the path algebra. They are in **enforcement coverage** — what the layer notices when the registry or the docs are wrong. In priority order:

1. **F-12 (HIGH) — fix the five missing segments, then widen Check N1a.** This is the only finding with a live wrong-path consequence today: `review-requirements-package` and `review-design-package` look for artifacts where the create skills do not write them, on the default configuration for new projects. The five string fixes are minutes of work. The durable fix is extending N1a's assertion from composition YAML to any path in a skill `.md` rooted at a `FEATURE_SCOPED_PATH_KEYS` key — no new concept, just a wider glob. Do the check with the fix, or the next sweep will miss the next five. Also correct `check_m()`'s docstring, which currently claims N1 closes this half of the contract.
2. **F-11 (HIGH) — decide whether registry validity is enforced at runtime or only in CI, and say so.** Narrowing Mode A step 3 to "resolves to exactly one entry" is a one-line change that closes the duplicate-id hole. If the answer is that CI owns validity, that is defensible, but the contract should stop implying otherwise and the "uniqueness check lives in `select-feature`" delegation should be marked mint-time-only.
3. **F-9 (HIGH) — reconcile `select-feature` with the ten Mode B skills that depend on `select-only`.** The implementing skill documents neither the parameter nor the suppression its callers rely on.
4. **F-4 (HIGH) — adjudicated FAIL; fix accepted, ready to implement.** Replace the gated warning *and* the competing proposal rule with **one unconditional question** whenever a proposed id matches a `docs/` directory: "`architecture` matches `docs/architecture/` — is that directory this feature's work, or something else?" That single question distinguishes the two cases the two rules currently race to classify, makes the defence reachable by default rather than by user initiative, and closes the inverse gap too (declining a proposed match is what actually produces two trees, and is today completely silent). Pair it with a drafted blockquote for each branch, since the warning currently has no template at all.
5. **F-16 (MEDIUM) — resolve the `execute-quick-change` / `manage-bugs` mode decision.** It is a live ambiguity about whether those skills may mint, and it makes F.1's pinned A/B counts expire the moment it is settled.
6. **F-3, F-8, F-13, F-14, F-15, F-1, F-2, F-5, F-7 (MEDIUM/LOW)** — doc and message defects; batch them. F-3 is the cheapest high-confidence win, being the only finding reproduced independently by two runs.

**On the plan itself.** It found real defects and is worth keeping, with three amendments: F.10's Run 2 state cannot reach the option-(b) precondition as written (use assembled-artifacts-present / working-tree-absent instead); F.13 requires overriding a hard halt in `create-implementation-package`, which should be stated up front; and F.1's mode counts should be recorded as a snapshot expected to move, with the 19 citations and 2 Mode C exclusions as the stable assertion. The `write-discipline.md` "Combined" output mode was never exercised by any step and remains untested.
