---
slug: verify
sequence: 5
depends-on-prior: true
---

# Step: Verify Extracted Documentation Against Source

Run verification checklists against the extracted documentation to ensure accuracy and completeness.

## When to run

Run this step when the parent `reverse-engineer-jcl-job` workflow reaches its close-out
gate — after all content extraction has completed and before the
change-tracker is finalized. The gate asks the user which mode to run in;
this step is invoked with that answer, not ahead of it.

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

## Why verification is non-negotiable

```
Source Code Accuracy → Documentation Accuracy → Downstream Consumer Accuracy → Lineage Accuracy
```

JCL verification is critical because: (a) consumers wire downstream jobs against the documented dataset I/O graph; (b) the lineage skill consumes `dataset-io.json` and amplifies any error across every job→program→dataset chain it produces; (c) GDG generation errors silently destroy data when downstream jobs read the wrong generation.

## Inputs

- All extracted documentation (Part A, Part B)
- The two mandatory feed-files (`job-flow.mmd`, `dataset-io.json`)
- Access to the JCL / PROC / INCLUDE source
- The job inventory from `extraction-status.md`
- The change-tracker
- The matched COBOL program repo's Part A (if it exists in this project) for resolving `EXEC PGM=` claims

## Process

### 1. Determine Scope

Confirm full vs. job-scoped verification, and source accessibility.

### 2. Run the Universal Checks — two tiers

These apply to ALL extractions regardless of repo type. Every check sits in exactly
one tier, and the tier decides what the check is allowed to conclude.

**Tier M — machine-checkable.** A command, a parse, or an exact comparison against an
unambiguous source construct decides it, and the report can quote both sides. These are
the only checks that may produce PASS, and the only ones that feed the mechanical
verdict.

**Tier J — model judgment.** Deciding it means reading the source and forming a view:
which construct counts as "the default", whether two parts contradict each other,
whether a type signature was simplified for readability. These are reported UNVERIFIED
with the reasoning attached. They never produce PASS and never contribute to GO —
in `automated` mode nobody has attested them. Reporting a Tier J item as PASS is the
precise dishonesty this tiering exists to prevent.

If a check does not clearly belong in M, it is J. The bias is deliberate: an overstated
attestation is worse than an understated one.

#### Tier M — machine-checkable (may PASS)

**Completeness Check**
- [ ] All inventoried jobs have corresponding documentation
- [ ] All inventoried PROCs have expansion documentation
- [ ] All inventoried INCLUDE members are resolved or flagged unresolved
- [ ] Extraction status tracker shows 100% complete
- [ ] No placeholder/TODO markers remain
- [ ] Both documentation parts are populated
- [ ] Both feed-files exist and are non-empty

**Accuracy Check**
- [ ] Every documented step matches the JCL source (stepname, EXEC kind, PGM/PROC name)
- [ ] Every documented DD matches source (DDNAME, DSN, DISP, DCB, SPACE)
- [ ] Every PROC override at an EXEC PROC site matches source override syntax
- [ ] Every GDG reference (`+N` / `0` / `-N`) matches source
- [ ] Every condition code (`COND=`, `IF (RC=…)`, `EVEN`, `ONLY`) matches source
- [ ] No "UNVERIFIED" markers remain unresolved

**Consistency Check**
- [ ] Cross-references valid

**Change Tracking Check**
- [ ] Every extraction session logged
- [ ] Source version recorded
- [ ] Verification status recorded

#### Tier J — model judgment (reported UNVERIFIED, never PASS)

**Consistency Check**
- [ ] No contradictions between Part A and Part B
- [ ] Part B is a strict subset of Part A
- [ ] No ops-internal commentary (paging contacts, Control-M operator notes) leaked into Part B
- [ ] Terminology consistent across jobs

**Change Tracking Check**
- [ ] Parts Affected values correct (A / B / All)

### 3. Run Domain-Specific Checks (JCL Job)

**Tier every check below before reporting it.** The domain checks are heterogeneous, so
they are not pre-split the way § 2 is — you assign the tier using § 2's rule, and the
report format enforces the assignment: a Tier M row must quote both sides of the
comparison, so a check you cannot show evidence for is Tier J by construction.

Three recurring families, to save you re-deriving them:

- **Tier M — tooling and resolution.** Anything decided by a linter, a parse, a path
  resolution, or a name lookup ("spec passes a linter", "every INCLUDE resolves to a
  member", "every host-var resolves to a WORKING-STORAGE field"). Quote the command and
  its output.
- **Tier M — source-line parity.** "Traces to a specific source line" is mechanical when
  you actually cite the line. Cite it, or drop the check to Tier J.
- **Tier J — "verified against".** Where the check reads "X verified against Y", ask
  whether picking Y was itself a judgment. "Response shapes verified against response
  DTOs (not entities)" requires deciding which type is the response DTO — that is
  interpretation, so it is Tier J even though the final comparison looks exact.

Presence checks ("documented", "section present") are Tier M — the section exists or it
does not. Do not upgrade a presence check into a quality claim: that a Getting Started
section exists is Tier M; that it is *adequate* is Tier J and usually not worth asserting.

- [ ] **Source parity:** every documented step, DD, DSN, DISP, GDG ref, COND clause traces to a specific JCL or PROC source line
- [ ] **PROC expansion correct:** for each EXEC PROC site, the resolved view matches the PROC source with overrides applied
- [ ] **INCLUDE chain resolved:** every INCLUDE reference resolves to a member, or is flagged unresolved (no silent dropping)
- [ ] **Symbolic substitution flagged:** every DSN containing `&` is recorded with the symbolic name, not auto-resolved
- [ ] **EXEC PGM= resolves:** when a matched COBOL program repo Part A exists, every PGM name resolves; unresolved PGM names are flagged (utility / vendor program acceptable, mystery program is not)
- [ ] **GDG generations consistent:** when job X writes `GDG(+1)` and job Y reads `GDG(0)`, the predecessor/successor relationship is documented in Part B
- [ ] **Scheduler edges:** when scheduler exports were supplied, every edge appears in Part B; when no exports were supplied, predecessor/successor is marked "derived from GDG / DD coupling, not scheduler-confirmed"
- [ ] **Feed-file integrity:**
  - `job-flow.mmd` parses as Mermaid; every node corresponds to a documented step
  - `dataset-io.json` validates against the schema in INPUTS-OUTPUTS.md

### 4. Spot-Check Against Source

**This entire step is Tier J, plus a declared bound.** Spot-checking is how you form a
view about material you did not exhaustively verify — the sample cannot attest the
population.

Record the sample size and the population size in the report, and phrase the finding
accordingly: "the 5 endpoints I compared matched" is a finding; "endpoints match" is not
one this step can produce. A discrepancy found in the sample is still a real failure and
is reported as such under Failures.

For 5-7 representative jobs (mix of: simple PGM-only, PROC-heavy, IDCAMS-driven, SORT-driven, DB2-utility-driven, GDG-rolling):
1. Read the documentation
2. Read the actual JCL source (and any PROC / INCLUDE sources it pulls in)
3. Compare every step, DD, DSN, DISP, GDG ref, override, and COND clause
4. Flag discrepancies

### 5. Report Results

Produce a verification report. The shape is fixed in both modes; only the verdict line
differs.

```
## Verification Report — <System Name>

**Date:** YYYY-MM-DD
**Mode:** automated | review-evidence
**Scope:** Full / Section: X
**Source commit:** <full-sha>

### Verdict

MECHANICAL: GO | NO-GO          <- automated mode only; omit entirely in review-evidence
                                   mode, where the review skill issues the verdict

Scope of this verdict: Tier M checks only. It attests that the extraction is
well-formed — inventory reconciled, no unresolved markers, cross-references resolve,
declared source constructs match. It does NOT attest that the documentation is
correct. See UNVERIFIED below for what nobody has checked.

### Tier M — checked (<P> passed / <F> failed)

| Check | Result | Evidence |
|---|---|---|
| <check> | PASS / FAIL | <command run, or both sides of the comparison quoted> |

Every row cites evidence. A Tier M row without quotable evidence is a Tier J check
misfiled — move it.

### UNVERIFIED — Tier J, not attested (<U> items)

| Check | Why it needs judgment | What I observed |
|---|---|---|
| <check> | <e.g. "which construct counts as the default is interpretive"> | <observation, explicitly not a pass> |

These are reported, not passed. A GO above with a non-empty list here is the normal
and honest outcome: well-formed, not attested as correct.

### Failures
<Each Tier M failure: what was wrong, where, recommended fix>

### Recommendations
<Priority-ordered list of actions>
```

Do not collapse the UNVERIFIED table into the Tier M table, and do not report a count
of "checks passed" that sums the two. The two numbers mean different things and adding
them is how a self-attested gate ends up looking like a verified one.

### 6. Log Verification

Use `track-change` to record the verification activity.

## Output

Both modes:

- Verification report (Tier M results with evidence; Tier J items listed UNVERIFIED)
- List of corrections made during verification
- Updated change-tracker entries reflecting the verification activity and the mode

`automated` mode additionally:

- A `MECHANICAL: GO / NO-GO` determination, scoped to Tier M

`review-evidence` mode additionally:

- The report is handed to `review-reverse-engineering-package`. No verdict is issued
  here.

## Halt conditions

- Halt if the mode is unknown — that means the close-out gate was skipped. Ask the user
  before running anything.
- Halt if the source code is not accessible — verification requires comparison against
  source.
- Halt if the inventory is missing — completeness cannot be assessed without it.

Failure handling differs by mode:

- `automated`: any unresolved Tier M failure is `MECHANICAL: NO-GO` and finalization is
  blocked. Present the failures and ask whether to fix and re-run the gate, or escalate
  to the review path.
- `review-evidence`: a Tier M failure is a **finding handed up**, not a halt. Record it
  in the report and continue to the handoff — `review-reverse-engineering-package` will
  weigh it in sub-reviews 1, 5, and 6. Halting here would deny the review the very
  evidence it was invoked to consider.

## Common mistakes

- **Running without a mode.** The mode comes from the user at the close-out gate. Assuming one reinstates the self-attested gate this design replaced.
- **Reporting a Tier J item as PASS**, or folding Tier J counts into the Tier M pass count. Tier J is UNVERIFIED; the two tiers are not addable.
- **Issuing a GO/NO-GO in `review-evidence` mode.** The review skill owns that verdict.
- **Halting on a Tier M failure in `review-evidence` mode.** Hand the finding up; the review needs it.
- **A Tier M row with no quotable evidence.** If you cannot show both sides of the comparison, it was never a Tier M check.
- Verifying against a Control-M flow export instead of the JCL source
- Treating PROC expansion as optional — every PROC EXEC site must show the resolved view
- Auto-resolving symbolic DSNs (`&LYY` etc.) instead of flagging them
- Missing GDG generation roll between predecessor / successor jobs
- Skipping INCLUDE-chain resolution
- Spot-checking only the simple PGM-only jobs and skipping PROC / IDCAMS / SORT / DB2-utility cases
