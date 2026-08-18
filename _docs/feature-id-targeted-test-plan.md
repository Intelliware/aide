# A.I.D.E. — Targeted Test Plan — feature-ID identity + path-token reconciliation

**Authored:** 2026-08-18
**Branch under test:** `feat/feature-id-minimal-plan` (version **2.4.0**, PR !2051 — carries the retargeted `path-token-reconciliation` work as an ancestor)
**Scope:** The two bodies of work combined in !2051 — the `{paths.<key>}` token reconciliation and the feature-ID identity layer (`features.toml`, `[user].active_feature`, `select-feature`, the shared active-feature precondition, and the `{feature-id}/` path segment).
**Design docs:** `_docs/path-token-reconciliation-plan.md`, `_docs/feature-id-minimal-plan.md`, `references/ai-principles/feature-precondition.md`, `config/SCHEMAS.md` § 2.8–2.9.

## Why this is separate from `_docs/skills-test-plan.md`

The main plan is a full end-to-end exercise of every skill: 6–11 hours, nine cloned repos, a built knowledge base. It also predates this branch, so it covers none of this work — Checks M / N1 / N2, `select-feature`, and the `{feature-id}` segment appear nowhere in it, and it never invokes `validate.js` or `test-validate.js`.

This plan is the narrow complement: **~2–3 hours, no clones, no knowledge base.** Everything below runs against the branch tree plus one throwaway project directory. It exists to answer a single question — *does the identity layer behave correctly, and does opting out still work?* — not to re-verify the framework at large.

**Conventions are inherited, not restated.** Result classes (PASS / FAIL / NEEDS-REVIEW / SKIP), the `[auto]` / `[user]` tagging rule, the halt taxonomy, and the results-ledger format are defined in `_docs/skills-test-plan.md` § 0 and apply here unchanged. Record results in a dated `_docs/skills-test-results-<date>-feature-id.md`, following the shape of `skills-test-results-2026-07-26-targeted.md`.

## What is under test, precisely

Getting the contract right matters more than step count, because two of its properties are counter-intuitive:

1. **Both precondition modes halt.** Mode A (write-side, 11 skills) and Mode B (read-side, 5 skills) *both* stop when no feature resolves. The difference is only whether `select-feature`'s **create path is reachable**: Mode B invokes it with `caller_mode = select-only`, making create unreachable for that call. Neither mode mints silently, and neither derives an ID from the request text — that silent guess is the defect the precondition exists to close. Any test asserting "Mode A mints automatically" is testing the wrong contract.
2. **There are two paths, resolved by two separate rules.** The per-section **working tree** is `docs/<feature-id>/`; the **assembled artifact** gains a `<feature-id>/` directory immediately above it (`{paths.requirements_package}/{feature-id}/…`). They have different resolution rules and different failure modes, so they need separate assertions.

Mode membership, as declared in `references/ai-principles/feature-precondition.md`:

| Mode | Count | Skills |
|---|---|---|
| **A** — write-side, create reachable | 11 | `create-requirements-package`, `create-design-package`, `create-implementation-package`, `create-quality-package`, `execute-increments`, `execute-quality-increments`, `document-quick-change`, `plan-quick-change`, `execute-quick-change`, `manage-bugs`, `create-pr` |
| **B** — read-side, create suppressed | 5 | `review-requirements-package`, `review-design-package`, `review-implementation-package`, `review-quality-package`, `audit-quality-coverage` |
| **C** — probe-only, never halts | 1 | `framework-navigator` (recommends `select-feature`; a recommendation is a legitimate answer, not a failure) |

`select-feature` itself references the precondition without being bound by it, so **18** `SKILL.md` files cite the contract while **16** are governed by it. Tests must pin the exact sets — a bare count of 16 passes with the wrong sixteen.

## Environment

- Branch tree, read-only except where a step says otherwise.
- Python 3.11+ (for `tomllib`), Node 18+.
- One throwaway project dir, `~/Dev/feature-id-sandbox/`, recreated per tier. No clones, no KB, no network.

The sandbox project is minimal: a `project.toml` declaring one or two `[[project.repos]]`, an empty `docs/`, and — depending on the step — a `features.toml` and a `project.user.toml`.

---

## Tier 0 — the existing automated layer (~30 seconds)

### T0.1  Baseline — run everything that already exists
**Trigger:**
```
python3 scripts/validate.py
node       scripts/validate.js
python3 scripts/test_validate.py
node       scripts/test-validate.js
```
**Inputs:** Read-only over the branch tree.
**Expected outputs:** All four exit zero. Python suite reports **49** tests, Node **53** (the delta is Node's four `parseSimpleToml` tests, which have no Python counterpart because Python uses `tomllib`).

**Pass criteria:**
- [ ] [auto] All four commands exit zero.
- [ ] [auto] Both validators report Check M, Check N1, and Check J in their default run.
- [ ] [auto] Suite counts are 49 / 53. A different count means a test was added or lost since authoring — reconcile before proceeding, since every later tier assumes this baseline.

**Rollback:** none — read-only.

> **What Tier 0 does not do.** It never runs a skill, never resolves a real path, and never sees a real project. It is a precondition for the rest of the plan, not a substitute for it.

---

## Tier 1 — static sentinels (~20 min, no sandbox)

### F.1  Precondition binding — pin the exact skill sets, not a count
**Trigger:**
```
# every SKILL.md citing the contract (expect 18)
rg -l "feature-precondition" .agents/skills/ --glob 'SKILL.md' | sort

# the two that cite it without being governed by it
rg -l "feature-precondition" .agents/skills/meta/select-feature/SKILL.md \
                             .agents/skills/meta/framework-navigator/SKILL.md
```
**Inputs:** Read-only.
**Expected outputs:** 18 `SKILL.md` hits; the 11 Mode-A and 5 Mode-B skills from the table above all present by name.

**Pass criteria:**
- [ ] [auto] All 11 Mode-A skills cite the contract, **by name** against the table above.
- [ ] [auto] All 5 Mode-B skills cite it, by name.
- [ ] [auto] `framework-navigator` cites it and `select-feature` cites it — 18 total, no more and no fewer. An 19th hit means a skill was bound without being added to the contract's own mode lists, which is a drift the contract cannot self-detect.
- [ ] [user] Spot-check three Mode-A and two Mode-B skills: the precondition is invoked **before** the skill's first write / read, not buried mid-workflow. A precondition that fires after the first write cannot prevent a misplaced one.

**Rollback:** none — read-only.

### F.2  Check M non-vacuity — a phantom `{paths.<key>}` token must be rejected
**Trigger:** inject a token naming no key in the `paths` table into one live composition, run both validators, restore.
```
cp templates/compositions/greenfield-requirements-package.yaml /tmp/f2.bak
# edit default-output-path to reference {paths.does_not_exist}
python3 scripts/validate.py ; echo "py exit=$?"
node       scripts/validate.js ; echo "js exit=$?"
cp /tmp/f2.bak templates/compositions/greenfield-requirements-package.yaml
```
**Inputs:** One transient edit to a committed composition.
**Expected outputs:** Both validators exit non-zero, naming Check M and the phantom key.

**Pass criteria:**
- [ ] [auto] Both validators exit non-zero while the injection is in place.
- [ ] [auto] Both error messages name Check M **and** the offending key. Rejecting for an unrelated reason is a FAIL — the right check must fire for the right reason.
- [ ] [auto] After restore, both exit zero again and `git diff` is empty.

**Rollback:** restore from `/tmp/f2.bak`; confirm `git diff --exit-code` on the composition.

> This is the technique already used to validate Check M by hand during the PR (a phantom token injected into a live composition, confirmed to fail closed). F.2–F.4 generalise it: a green check proves nothing until it has been shown capable of going red.

### F.3  Check N1a non-vacuity — a feature-scoped composition missing its segment
**Trigger:** strip the `{feature-id}/` segment from one of the 7 feature-scoped compositions (`brownfield-enhancement-spec`, `brownfield-quality-package`, `greenfield-{design,implementation,quality,requirements}-package`, `quick-dev-spec`), run both validators, restore.

**Pass criteria:**
- [ ] [auto] Both validators exit non-zero and name Check N1 plus the composition.
- [ ] [auto] All 7 feature-scoped compositions carry the segment in the unmodified tree.
- [ ] [auto] The set of compositions N1a *checks* is derived from the feature-scoped path keys rather than hard-coded — confirm by reading the check, so that adding an 8th feature-scoped composition is covered automatically.
- [ ] [auto] `git diff` empty after restore.

**Rollback:** `git checkout --` the composition.

### F.4  Check N1b non-vacuity + the fence exemption
**Trigger:** three variants, each run through both validators:

| Variant | Placement | Expected |
|---|---|---|
| a | a retired `FEAT-NNNN-` placeholder in prose, outside any code fence | **rejected**, naming Check N1 |
| b | the same placeholder inside a ` ``` ` fenced block | **accepted** — fences exempt historical examples |
| c | the same placeholder after a fence has closed | **rejected** — the fence guard must not leak past its terminator |

**Pass criteria:**
- [ ] [auto] Variants (a) and (c) exit non-zero in **both** validators; variant (b) exits zero in both.
- [ ] [auto] Python and Node agree on all three. A divergence is a FAIL even if both are individually defensible — the two validators are contracted to be functionally identical.
- [ ] [auto] `git diff` empty after restore.

**Rollback:** `git checkout --` the edited file.

> Variants (b) and (c) are the fence guard added to N1b on this branch (CHANGELOG 2.4.0 correction 8). They are covered by unit tests in both suites; this step re-verifies them against the **live tree** rather than a fixture, which is where the asymmetry originally hid.

### F.5  Doc-debt status — record it, don't discover it later
**Trigger:** grep the five files the 2.4.0 CHANGELOG entry names as still describing the pre-feature-ID path shape (`references/ai-principles/write-discipline.md`, `_docs/ai-sdlc-stage-map-new.md`, `AGENTS.md`, and the two cosmetic ones) for flat-path examples.
**Inputs:** Read-only.

**Pass criteria:**
- [ ] [user] For each of the five, record **fixed** or **still open** in the ledger with a line reference. This step cannot FAIL on finding debt — it fails only by leaving the state unrecorded.
- [ ] [auto] No file outside that known-five set describes the flat shape in a way N1 does not catch. New entrants are the actual signal here.

**Rollback:** none — read-only.

> No regex can police prose that *describes* the old shape without using a retired placeholder, which is precisely why N1 misses these five and why they need a human row rather than a check.

---

## Tier 2 — runtime behaviour (~2 hours, the core of the plan)

Every step here needs the sandbox project. Order matters: F.6 first, because it is the promise made to every existing project, and F.13 early, because it is the defect the whole mechanism exists to prevent. **If either fails, stop — the branch is not mergeable regardless of the rest.**

### F.6  Opt-out invariant — a project with no `features.toml` is untouched
**Trigger:** sandbox with `project.toml`, an empty `docs/`, and **no** `features.toml`. Invoke `create-requirements-package` and let it write at least one section plus the assembled artifact.
**Inputs:** the sandbox; a one-line feature request as the elicitation seed.
**Expected outputs:** artifacts on the **flat** path, byte-for-byte where the project would have written them before this branch existed.

**Pass criteria:**
- [ ] [auto] The assembled artifact lands at `{paths.requirements_package}/<name>-requirements.md` with **no** intervening directory.
- [ ] [auto] No `{feature-id}` or literal `feature-id` string appears in any produced path.
- [ ] [auto] No `features.toml` was created as a side effect, and `project.user.toml` gained no `active_feature`.
- [ ] [auto] The filename retains its `<name>-` prefix — opting out changes depth only, never filenames.
- [ ] [user] The skill never mentioned features, never prompted about them, and never routed to `select-feature`. The precondition is contracted to return on its first line here; any visible trace of it means the cheap-exit property has been lost.

**Rollback:** `rm -rf ~/Dev/feature-id-sandbox/`.

### F.7  `start-project` fresh — writes an empty registry, mints nothing
**Trigger:** empty sandbox dir; run `start-project` and elect the greenfield/fresh path.

**Pass criteria:**
- [ ] [auto] `features.toml` exists and parses.
- [ ] [auto] It contains **no** `[[features]]` entries.
- [ ] [auto] No `docs/<slug>/` directory was created and `[user].active_feature` is unset.
- [ ] [auto] `validate.py --features-toml <path>` accepts it and emits the "legal, means opted in with no features yet" note rather than an error.

**Rollback:** `rm -rf` the sandbox.

> Minting here would be the bug: brownfield does substantial work before there is a feature to name, so the bootstrap default opts a project *in* without inventing an identity for it.

### F.8  `select-feature` create mode — mint an identity
**Trigger:** sandbox with an empty `features.toml`; run `select-feature`, supply the title "Alert customer when a refund is delayed".

**Pass criteria:**
- [ ] [auto] A proposed slug is offered and is a valid kebab slug per rule 13.
- [ ] [auto] On acceptance, `features.toml` gains one `[[features]]` entry with `id`, `title`, and a populated `created` date.
- [ ] [auto] `[user].active_feature` in `project.user.toml` equals the new `id`; the `[user]` block is created if it was absent.
- [ ] [auto] `validate.py --features-toml … --project-toml … --user-toml …` accepts the result.
- [ ] [user] Step 5's **output-path echo** fired, naming the resolved directory for each stage the project uses, before anything was written. It is the one moment a wrong resolution is cheap to catch.

**Rollback:** `rm -rf` the sandbox.

### F.9  The `docs/` proposal — the primary collision defence
**Trigger:** sandbox with an empty `features.toml` **and** a pre-existing `docs/refunds/` holding a stub file. Run `select-feature` with the title "Refund processing fixes".
**Expected outputs:** it proposes **`refunds`**, with the reason stated, *before* the title-derived `refund-processing-fixes` wins by default.

**Pass criteria:**
- [ ] [auto] The proposed id is `refunds`, not `refund-processing-fixes`.
- [ ] [user] The proposal states *why* — that the existing directory already matches, so nothing has to move.
- [ ] [user] The user can still override to an unrelated slug; the proposal is offered, not imposed.
- [ ] [auto] On accepting `refunds`, no second directory is created — `docs/` still holds exactly `refunds/`.

**Rollback:** `rm -rf` the sandbox.

> **Rank this second only to F.6 and F.13.** The contract calls this proposal load-bearing rather than a convenience: when the id matches an existing directory, the resolution rule takes its first branch and the feature continues in place with no rename and no question. Deriving from the title is the likeliest way to miss that — and the failure it prevents is reachable through the single most likely path a real user takes.

### F.10  Reconciliation halt — the backstop, and its precondition
**Trigger:** sandbox with `docs/refunds/` populated and `active_feature = "refund-processing"` (a hand-written registry, i.e. the case F.9's proposal did not catch). Invoke any Mode-A skill.

**Pass criteria:**
- [ ] [user] The skill **halts** and offers exactly two options — (a) rename the directory via `git mv`, (b) rename the feature in `features.toml` and `active_feature`.
- [ ] [user] It never resolves silently in either direction, and offers a "none of these" escape, since `docs/` legitimately holds hand-written folders too.
- [ ] [auto] With artifacts already present under `refund-processing`, option **(b) is not offered** — the rename would strand them, making (a) the only correct answer. Run the step twice, with and without those artifacts, and confirm the offer changes.
- [ ] [auto] Nothing is renamed or created until the user answers.

**Rollback:** `rm -rf` the sandbox.

### F.11 / F.12  The Mode A / Mode B asymmetry — test as a pair
**Trigger:** one sandbox state — `features.toml` present, `[user].active_feature` **unset** — exercised twice: `create-requirements-package` (Mode A), then `review-requirements-package` (Mode B).

**Pass criteria:**
- [ ] [user] **Both** halt with "No active feature. Run `select-feature`, then re-run this skill." Neither proceeds.
- [ ] [auto] Neither invents an id nor derives one from the request text. Any minted-without-asking id is a FAIL and is the precise defect this layer closes.
- [ ] [user] Mode A invokes `select-feature` with its own name as `caller` and the request text as `description`, and create **is reachable**.
- [ ] [user] Mode B invokes it with `caller_mode = select-only` and create **is unreachable**.
- [ ] [auto] After the Mode-B halt, `features.toml` is unchanged — reviewing is not a reason to mint a feature with nothing to review.
- [ ] [user] With an **empty** registry, Mode B's halt message changes to name the producing `create-*` skill instead.
- [ ] [user] `select-feature` closes with `## Next skill\n<caller>`, carrying the user back to the skill that halted.

**Rollback:** `rm -rf` the sandbox.

### F.13  Two-feature isolation — the reason this work exists
**Trigger:** mint two features (`alert-customer`, `refund-fee-waiver`); produce a requirements package and one `INC-001.md` under each.

**Pass criteria:**
- [ ] [auto] The two assembled trees do not overlap: no path is written by both features.
- [ ] [auto] Both `INC-001.md` files exist, at `…/alert-customer/INC-001.md` and `…/refund-fee-waiver/INC-001.md`, and neither gained a filename prefix — the enclosing segment is what disambiguates per-item files.
- [ ] [auto] Filenames *within* each tree are unchanged from the flat layout; the trees differ from F.6's output by exactly one directory level.
- [ ] [auto] Switching `active_feature` between the two and re-running a Mode-B skill produces a verdict about the correct feature's artifacts.

**Rollback:** `rm -rf` the sandbox.

### F.14  Path-shape properties — what opting in does and does not break
**Trigger:** diff F.6's flat tree against F.13's scoped tree.

**Pass criteria:**
- [ ] [auto] The trees differ by exactly one directory level and no filename.
- [ ] [auto] A **filename** glob (`*-requirements.md`) matches in both layouts.
- [ ] [auto] A **depth-sensitive** glob breaks under the scoped layout — confirming the documented breaking change is real and correctly scoped to depth only.
- [ ] [auto] The working-tree directory `docs/<feature-id>/` is identical in both layouts.
- [ ] [user] If the sandbox is configured for SoD directory mode, the segment lands **inside** `<repo-code>/` (`<repo-code>/<feature-id>/`), never outside it — the role check must keep corresponding to a subtree. Cross-cutting nests as `_cross-cutting/<feature-id>/`.

**Rollback:** none beyond the sandbox teardown.

### F.15  Mode C — `framework-navigator` recommends, never halts
**Trigger:** run `framework-navigator` in three states: no `features.toml`; registry present with `active_feature` unset; registry present with a valid active feature.

**Pass criteria:**
- [ ] [auto] All three runs complete; none halts.
- [ ] [auto] Side effects are none — no file created or modified in any of the three.
- [ ] [user] In state 2 the answer *recommends* `select-feature` rather than reporting a failure.
- [ ] [user] In state 3 the per-feature state probe reports that feature's on-disk stage coverage.

**Rollback:** none — read-only by contract.

---

## Tier 3 — negatives and known gaps (~30 min)

Rules 13–16 (`config/SCHEMAS.md` § 2.8) are already unit-tested as **files**. F.16–F.18 re-test them as **skill behaviour**, which is a different question: a validator that rejects a bad registry in CI does not help if the skill proceeds on it at runtime.

### F.16–F.18  Runtime enforcement of the registry rules
**Trigger:** three sandbox states, each exercised with one Mode-A and one Mode-B skill:

| Step | Broken state | Rule | Expected |
|---|---|---|---|
| F.16 | `active_feature` names an id absent from the registry | 15 (stale pointer) | skill halts; routes to `select-feature` |
| F.17 | two `[[features]]` share an `id` | 14 (uniqueness) | rejected; `select-feature` refuses the duplicate **at mint time** rather than deferring to Check N2 |
| F.18 | `repos = ["ghost-repo"]`, undeclared in `project.toml` | 16 (repos resolve) | flagged; and `repos` stays **advisory** — the run-time scope prompt still wins |

**Pass criteria:**
- [ ] [auto] Each state produces a halt or an explicit rejection, never a silent proceed.
- [ ] [auto] `validate.py --features-toml` and `validate.js --features-toml` both reject all three, with matching messages.
- [ ] [user] Each message would be actionable to someone seeing it for the first time — no raw tracebacks.
- [ ] [auto] F.18's divergence resolves in favour of the run-time prompt, confirming `repos` is advisory and not authoritative.

**Rollback:** `rm -rf` the sandbox.

### F.19  A slug colliding with a non-feature `docs/` directory
**Trigger:** sandbox with a hand-written `docs/architecture/`; attempt to mint a feature named `architecture`.

**Pass criteria:**
- [ ] [user] `select-feature` **warns** before accepting, explaining that the id is the directory name so the resolution rule would adopt `docs/architecture/` as this feature's working tree without asking.
- [ ] [auto] Nothing validates this elsewhere — confirm both validators accept the registry, establishing that the mint-time warning is the *only* defence and must not be removed.

**Rollback:** `rm -rf` the sandbox.

### F.20  The §13.2 migration gap — an expected gap, recorded as such
**Trigger:** sandbox with `features.toml` present, one package moved under `<feature-id>/` and a second left flat — a half-finished hand migration.
**Expected outputs:** **nothing detects it.**

**Pass criteria:**
- [ ] [auto] Both validators exit zero. No skill reports the inconsistency.
- [ ] [user] Record as **expected-gap**, not PASS. Every precondition returns on its first line once the registry is present, and nothing validates a project's artifact layout, so the framework structurally cannot see this today.

**Rollback:** `rm -rf` the sandbox.

> `_docs/feature-id-minimal-plan.md` § 13.2 documents this as scheduled follow-up: nothing detects a flat layout, because detection would have to live *outside* the precondition or the cheap-exit property that guarantees existing projects are unaffected is lost. Logging it as PASS would convert a known hole into apparent coverage — which is why it gets its own step.

### F.21  Empty registry at runtime — opted in, nothing minted
**Trigger:** sandbox with an empty `features.toml`; invoke one Mode-A and one Mode-B skill.

**Pass criteria:**
- [ ] [auto] Neither falls back to flat paths — an empty-but-present registry means opted in.
- [ ] [user] Mode A routes to `select-feature`, which per its own step 2 skips **straight to create** (there is nothing to select from).
- [ ] [user] Mode B names the producing `create-*` skill instead of offering create.

**Rollback:** `rm -rf` the sandbox.

---

## Two decisions to make before starting

1. **Self-adjudication policy.** Most Tier 2 criteria are inherently `[user]` — "the skill halted with the right message and offered the right two options" is not a grep. Under the inherited halt semantics, an agent run stops at the first `[user]` criterion, which is F.6. Decide up front whether the agent may self-adjudicate observable `[user]` criteria and record its own assessment, or whether you intend to sit with the run.
2. **Coverage debt to fold back.** Tier 1 could largely become permanent tests rather than a one-off run: F.2–F.4 are non-vacuity checks that belong in `test_validate.py` / `test-validate.js` as committed regression fixtures, in the same spirit as `scripts/test_fixtures/sod-negatives/`. Decide whether this run produces only a results doc, or a results doc plus that test-suite addition.

## Suggested order and stopping rules

| Order | Steps | Time | Stop if |
|---|---|---|---|
| 1 | T0.1 | 30 s | anything is non-zero — later tiers assume a clean baseline |
| 2 | F.6, F.13 | ~35 min | either fails — the branch is not mergeable |
| 3 | F.1–F.5 | ~20 min | F.2–F.4 pass vacuously (a check that cannot go red) |
| 4 | F.7–F.12, F.14, F.15 | ~60 min | F.9 or F.11/F.12 fails — the identity mechanics are the layer |
| 5 | F.16–F.21 | ~30 min | — record and continue; F.20 is an expected gap |

The 2026-07-26 targeted run is worth reading first as a model. Its findings were all of one shape: *the fix works, but sibling docs still describe the old layout*, so an agent following the stale doc reproduces the original bug. That is exactly the failure mode to watch for here — and F.5 already tells you five such files exist.
