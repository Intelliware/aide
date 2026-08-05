---
slug: verify
sequence: 5
depends-on-prior: true
---

# Step — Verify

Execute the mechanical half of the extraction close-out. This step runs after Stage 4
(Cross-Cutting Concerns), at the close-out gate. Goal: catch extraction errors *before*
the KB is updated — once Part B lands in the live KB, downstream skills will trust it.

## When to run

Run this step when the parent `reverse-engineer-test-suite` workflow reaches its
close-out gate — after all content extraction has completed and before the change-tracker
is finalized. The gate asks the user which mode to run in; this step is invoked with that
answer, not ahead of it.

## Modes

This step runs in one of two modes. The mode is decided by the user at the close-out
gate (`references/elicitation-patterns/re-verification-gate-selection.md`), never by
this step and never by inference.

| Mode | What it does | Verdict |
|---|---|---|
| `automated` | Runs the Tier M checks and reports the Tier J checks as UNVERIFIED. This is the whole gate — no human sign-off follows. | Issues `MECHANICAL: GO` / `MECHANICAL: NO-GO`, scoped to Tier M only. |
| `review-evidence` | Runs the same Tier M checks, then hands the report to `review-reverse-engineering-package` as evidence for its sub-reviews 1, 5, and 6. | **Issues no verdict.** The review skill's `review-re-readiness` owns the verdict. Two verdicts for one extraction is worse than one. |

The check content is identical in both modes. What differs is who concludes: in
`automated` the report is the final word; in `review-evidence` it is testimony.

If you reach this step without knowing the mode, you skipped the gate. Go back and ask.

## Two tiers

Every check below sits in exactly one tier, and the tier decides what the check is
allowed to conclude.

**Tier M — machine-checkable.** A command, a parse, or an exact comparison against an
unambiguous source construct decides it, and the report can quote both sides. These are
the only checks that may produce PASS, and the only ones that feed the mechanical
verdict.

**Tier J — model judgment.** Deciding it means reading the suite and forming a view —
whether a fixture procedure is genuinely reproducible, whether the suite really encodes
no AC mapping or the extraction just failed to find one. These are reported UNVERIFIED
with the reasoning attached. They never produce PASS and never contribute to GO.

If a check does not clearly belong in M, it is J. The bias is deliberate: an overstated
attestation is worse than an understated one.

## Procedure

### 1. Structural verification — Tier M

For each Part B component file, confirm:

- [ ] File exists at the planned path
- [ ] Frontmatter parses (YAML well-formed)
- [ ] `kind: test-suite` present
- [ ] `subkind` matches the file's role (runner / shared-utilities /
      fixtures / marker-vocabulary / feature-inventory /
      environment-matrix / ci-surface / ownership)
- [ ] `test_suite_id`, `source_repo`, `source_version`,
      `last_verified_against_commit` all populated (no placeholder
      values left), and `last_verified_against_commit` is a **full** SHA
- [ ] `tests:` array references at least one application component
      that exists in the KB (run a quick lookup to confirm)
- [ ] `triggers:` array non-empty (capability index needs them)

For Part A:

- [ ] Every workflow section (1–15) is present; "NOT FOUND" is a
      valid value but blank is not
- [ ] Source version + extraction date recorded at the top

### 2. Content verification (sampling)

Pick a random sample (default: 5 utilities, 3 fixtures, 3 specs) and
confirm the extracted documentation matches the actual code.

**Sampling is a declared bound, not coverage.** Record the sample size and the
population size in the report. A sampled pass says "the 5 utilities I checked matched",
never "the utilities match".

Tier M — exact comparisons:

- [ ] For each sampled utility: signature in `shared-utilities.md`
      matches the method signature in the source file
- [ ] For each sampled spec: marker tags in `feature-inventory.md` match
      the actual tags in the feature/spec file (grep verification)

Tier J — judgment:

- [ ] For each sampled fixture: refresh procedure in `fixtures.md` is
      reproducible (the team can re-derive the fixture from documented
      inputs). Whether a procedure is *reproducible by someone else* is a
      judgment about sufficiency, not a comparison — report what the
      procedure specifies and what it leaves implicit.

If any Tier M sample fails: re-run the extraction for that area and
re-sample. The framework's rule applies: *comments lie; code doesn't*.
Trust grep output, not docstrings.

### 3. Marker-vocabulary verification

The `marker-vocabulary.md` file is the bridge between this RE skill
and `audit-quality-coverage`'s Step 3 drift check.

Tier M:

- [ ] The marker scheme documented in `marker-vocabulary.md` matches
      what actually appears in the suite (grep one of each scheme)
- [ ] At least one example mapping is verifiable by following the
      thread: marker in spec file → entry in `marker-vocabulary.md`
      → AC / INC ID → application component in the KB

Tier J:

- [ ] The AC / FR / NFR / INC → marker mapping table is populated
      where the suite encodes such mappings (and explicitly says
      "no mapping" where it doesn't). Distinguishing "the suite encodes no
      mapping" from "the extraction did not find the mapping" requires
      reading the suite's intent — say which one you concluded and why.

### 4. Cross-link verification — Tier M

Confirm the KB graph will resolve correctly once `update-knowledge-base`
runs:

- [ ] Every component in `tests:` exists at the path implied by its
      ID (run `Test-Path` against the resolved KB path)
- [ ] No `tests:` entry references a path that no longer exists
      (would cause an orphan edge after graph regeneration)

### 5. Reporting-path consistency — Tier M

The CI surface and reporting paths in `ci-surface.md` should match
what consuming quality packages will pin in their `automation-and-cicd`
block. If the team has an existing quality package for an application
the suite tests, cross-reference its `automation-and-cicd.md` paths
and confirm they match. Quote both paths in the report. If they don't
match, surface the mismatch to the user — likely the quality package or
the suite documentation needs an update.

### 6. Change-tracker — Tier M

Invoke `track-change` with one entry per file finalised. Trigger
note: `Extraction verified by reverse-engineer-test-suite`. Record the
close-out mode and its outcome in the `Verification` cell.

### 7. Report Results

Produce a verification report. The shape is fixed in both modes; only the verdict line
differs.

```markdown
## Verification Report — <test-suite-id>

**Date:** YYYY-MM-DD
**Mode:** automated | review-evidence
**Part A:** <path> (in the suite repo)
**Part B:** 8 components at `<kb-root>/components/<test-suite-id>/`
**Source commit:** <full-sha>

### Verdict

MECHANICAL: GO | NO-GO          <- automated mode only; omit entirely in review-evidence
                                   mode, where the review skill issues the verdict

Scope of this verdict: Tier M checks only. It attests that the extraction is
well-formed — components present, frontmatter valid, cross-links resolve, sampled
signatures and markers match. It does NOT attest that the documentation is correct.

### Tier M — checked (<P> passed / <F> failed)

| Check | Result | Evidence |
|---|---|---|
| Structural (8 components) | PASS / FAIL | <fields checked; failures named> |
| Content sampling — signatures | PASS / FAIL | <N>/<N> sampled of <population>; both sides quoted |
| Content sampling — markers | PASS / FAIL | grep output cited |
| Marker scheme | PASS / FAIL | scheme grep'd; one thread followed end to end |
| Cross-links | PASS / FAIL | <K> `tests:` references resolved |
| Reporting paths | PASS / FAIL | both paths quoted; match or mismatch |

Every row cites evidence. A Tier M row without quotable evidence is a Tier J check
misfiled — move it.

### UNVERIFIED — Tier J, not attested (<U> items)

| Check | Why it needs judgment | What I observed |
|---|---|---|
| Fixture reproducibility | sufficiency for a third party is interpretive | <observation, explicitly not a pass> |
| AC/marker mapping completeness | "suite encodes none" vs "extraction missed it" | <which, and why> |

These are reported, not passed. A GO above with a non-empty list here is the normal and
honest outcome: well-formed, not attested as correct.

### Sampling bounds

- Utilities: <N> of <population>
- Fixtures: <N> of <population>
- Specs: <N> of <population>

### Failures
<Each Tier M failure: what was wrong, where, recommended fix>

### Recommendations
<Priority-ordered list of actions>
```

Do not collapse the UNVERIFIED table into the Tier M table, and do not report a count of
"checks passed" that sums the two. The two numbers mean different things and adding them
is how a self-attested gate ends up looking like a verified one.

## Output

Both modes:

- Verification report (Tier M results with evidence; Tier J items listed UNVERIFIED;
  sampling bounds declared)
- List of corrections made during verification
- Updated change-tracker entries reflecting the verification activity and the mode

`automated` mode additionally:

- A `MECHANICAL: GO / NO-GO` determination, scoped to Tier M
- Wait for explicit user acknowledgement of the report before declaring the extraction
  complete

`review-evidence` mode additionally:

- The report is handed to `review-reverse-engineering-package`. No verdict is issued
  here, and no acknowledgement is collected here — the review skill collects acceptance
  per sub-review.

## Halt conditions

- Halt if the mode is unknown — that means the close-out gate was skipped. Ask the user
  before running anything.
- Halt if the suite source is not accessible — verification requires comparison against
  source.
- Halt if the Part B component inventory is missing — completeness cannot be assessed
  without it.

Failure handling differs by mode:

- `automated`: any unresolved Tier M failure is `MECHANICAL: NO-GO` and hand-off is
  blocked. Present the failures and ask whether to fix and re-run the gate, or escalate
  to the review path.
- `review-evidence`: a Tier M failure is a **finding handed up**, not a halt. Record it
  in the report and continue to the handoff — `review-reverse-engineering-package` will
  weigh it in sub-reviews 1, 5, and 6. Halting here would deny the review the very
  evidence it was invoked to consider.

## Next

Depends on the close-out mode:

- **review** → `review-reverse-engineering-package`, which owns the readiness verdict.
  KB ingestion follows that verdict.
- **automated** → on `MECHANICAL: GO`, hand off by name to `build-knowledge-base` (KB
  uninitialised) or `update-knowledge-base` (KB already exists). Do not proceed past this
  skill without one of those.

Once the KB is updated, downstream quality skills can ground via
`navigate-knowledge-base --profile=test-suite`.

## Common mistakes

- **Running without a mode.** The mode comes from the user at the close-out gate. Assuming one reinstates the self-attested gate this design replaced.
- **Reporting a Tier J item as PASS**, or folding Tier J counts into the Tier M pass count. Tier J is UNVERIFIED; the two tiers are not addable.
- **Issuing a GO/NO-GO in `review-evidence` mode.** The review skill owns that verdict.
- **Halting on a Tier M failure in `review-evidence` mode.** Hand the finding up; the review needs it.
- **A Tier M row with no quotable evidence.** If you cannot show both sides of the comparison, it was never a Tier M check.
- **Reporting a sampled pass as coverage.** Declare the sample and the population; "3 of 47 specs checked" is the finding, not "specs match".
