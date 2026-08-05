# Overview — review-reverse-engineering-package

## Purpose

`review-reverse-engineering-package` is the readiness gate between RE output and KB ingestion. RE output (Part A internal + Part B consumer) for a single repo can pass each individual RE skill's internal sanity checks and still ship a doc set that misrepresents the repo, glosses over hard cases, or has drifted since the last extraction.

This skill validates the RE output before it crosses the boundary into the KB, where its quality silently amplifies through every downstream stage.

## Why it exists

The KB is built from RE output. If RE output is wrong — fabricated claims, missing sections, drift — the KB inherits those defects and propagates them: into `navigate-knowledge-base` selections, into `update-knowledge-base` deltas, into every requirements package that grounds in the wrong description of an upstream system.

There was no RE-level review skill before this. RE skills produced their docs, self-issued
their own GO/NO-GO from `steps/verify.md`, and `build-knowledge-base` ingested the result.
This skill closes that gap for the runs where a human should sign off.

## Where this sits in the close-out gate

An RE run ends by asking the user how to close out (see
`references/elicitation-patterns/re-verification-gate-selection.md`). Two legal answers:

- **automated** — `steps/verify.md` runs in `automated` mode and issues a mechanical
  GO/NO-GO. Model-judgment items are reported UNVERIFIED and never counted toward GO.
  This skill does not run.
- **review** — `steps/verify.md` runs in `review-evidence` mode (no verdict), then this
  skill runs the nine sub-reviews with per-verdict human acceptance and owns the
  readiness verdict.

The review path is strictly additive: it keeps every mechanical check the automated path
performs and adds human judgment on top. What the automated path cannot give is an
accepted, written verdict — that is this skill's product.

## Per-review depth

### 1. review-section-completeness

The required block list is not prose — it is the two compositions,
`templates/compositions/re-<domain>-internal.yaml` and `re-<domain>-consumer.yaml`. This
review resolves both, sorts by `order`, assigns the 1-based `<NN>` index over the **full**
list before decision-gating, and confirms that every surviving block has a rendered
`<NN>-<bare-slug>.md` that is authored rather than stub-templated.

Numbering gaps are legal only where a block's `decision-gates: include-if:` evaluated
false — survivors keep their full-list index and are not renumbered. An unexplained gap
means a block was silently dropped, which is a finding, not a formatting quirk.

Verdict: FAIL if any non-gated block is missing or stub-only, or if a gap has no gating
explanation; PASS WITH OBSERVATIONS if a block exists but is thin; PASS otherwise.

### 2. review-grounding

Every assertion in Part A and Part B must reference a source file, commit, or external standard. Patterns to flag:

- Statements about behaviour with no `path/to/file.ext` reference
- "The system uses X" without code citation
- API contract entries with no source-file backing
- Config values described without referencing the config file

Verdict: FAIL if more than 5% of substantive claims lack grounding; PASS WITH OBSERVATIONS for 1–5%; PASS for <1%.

### 3. review-consistency

Part A (internal) describes the system from inside; Part B (consumer) describes how the system is consumed externally. They must agree on:

- API contracts (schemas, endpoints, error semantics)
- Data models (entity names, relationships)
- Integration points (which systems the repo talks to)

This review reads both and flags contradictions.

Verdict: FAIL on any contradiction in load-bearing content; PASS WITH OBSERVATIONS for terminology drift only; PASS otherwise.

### 4. review-coverage

The repo's public surface (exported APIs, database schemas, routes, CLI commands, scheduled jobs, public events) must all appear somewhere in Part A or Part B. This review reads the source repo at `target_commit` and cross-checks.

It also covers the domain's **supplementary artifacts** — the ones written outside the
block list (`openapi.yaml` for api; the mainframe feed files for cobol-program,
copybook-library, jcl-job). Each must exist and parse against the schema its producing
skill declares. See `references/review-workflow.md` § per-domain coverage expectations for
the table.

Verdict: FAIL if any public-surface artifact is unsurfaced, or any supplementary artifact
is missing or malformed; PASS otherwise.

### 5. review-freshness

`last_verified_against_commit` in any component frontmatter or doc frontmatter must be
present, recorded as a **full** SHA (short hashes are rejected — the KB schema requires
full), and correspond to a commit within `[knowledge_base] staleness_warning_days` of the
source repo's current HEAD. Otherwise the doc is stale and the RE pass needs re-running
before ingestion.

Verdict: FAIL if the field is missing, short-form, or outside the window; PASS WITH
OBSERVATIONS at the boundary; PASS otherwise.

### 6. review-traceability

Component frontmatter `paths` globs must resolve to real files at `target_commit`. Broken globs indicate either fabrication or a moved file the RE didn't catch.

Verdict: FAIL if any `paths` entry has zero matches; PASS otherwise.

### 7. review-adversarial-pass (wrapper)

Invokes `meta/review-adversarial --stage=reverse-engineering` against the Part A tree. Findings file written to `<PART-A>/review/adversarial-findings.md`. Verdict per `references/review-patterns/review-verdict-mapping.md`.

For RE output, the adversarial lens emphasizes unsupported claims (every sentence should reference a source file) and hidden assumptions (Part A often asserts behaviour without citing the code path that proves it).

### 8. review-edge-cases (wrapper)

Invokes `meta/review-edge-case-hunter --stage=reverse-engineering` against the Part A tree. Findings file written to `<PART-A>/review/edge-case-findings.md`. Verdict per the same mapping.

For RE output, the edge-case lens emphasizes error paths (does the source actually handle every documented case?) and data-shape edges (what does each parser actually accept?).

### 9. review-re-readiness

Final gate. Reads all eight prior verdicts plus the two adversarial findings files. Emits APPROVED / CONDITIONAL / BLOCKED with explicit conditions if any sub-review returned PASS WITH OBSERVATIONS.

The verdict also records whether a mechanical verification report was available as evidence.
A readiness verdict reached without one is still valid, but the record matters: it tells a
later reader which sub-review conclusions rested on tooling and which on reading alone.

KB ingestion only proceeds on APPROVED or CONDITIONAL with explicit user acceptance.

## What this skill does not do

- It does not re-run RE. Fixes are authored by the relevant RE skill.
- It does not modify the source repo.
- It does not write to the global KB. KB ingestion is `build-knowledge-base` / `update-knowledge-base`.
- It does not review the KB itself. This skill is per-repo and runs before ingestion; the global KB coverage sweep is `verify-knowledge-base-coverage`, and per-PR drift is `detect-knowledge-base-drift`.
