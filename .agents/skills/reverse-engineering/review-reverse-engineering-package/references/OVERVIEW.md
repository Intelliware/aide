# Overview — review-reverse-engineering-package

## Purpose

`review-reverse-engineering-package` is the readiness gate between RE output and KB ingestion. RE output (Part A internal + Part B consumer) for a single repo can pass each individual RE skill's internal sanity checks and still ship a doc set that misrepresents the repo, glosses over hard cases, or has drifted since the last extraction.

This skill validates the RE output before it crosses the boundary into the KB, where its quality silently amplifies through every downstream stage.

## Why it exists

The KB is built from RE output. If RE output is wrong — fabricated claims, missing sections, drift — the KB inherits those defects and propagates them: into `navigate-knowledge-base` selections, into `update-knowledge-base` deltas, into every requirements package that grounds in the wrong description of an upstream system.

There was no RE-level review skill before this. RE skills produced their docs and `build-knowledge-base` ingested them. This skill closes that gap.

## Per-review depth

### 1. review-section-completeness

Every domain RE skill defines a required section list (e.g. for web-app: architecture, state-management, routing, build-system, testing-strategy, etc.). This review checks that every required section exists, is non-empty, and has been authored (not just stub-templated).

Verdict: FAIL if any required section is missing or stub-only; PASS WITH OBSERVATIONS if a section exists but is thin; PASS otherwise.

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

Verdict: FAIL if any public-surface artifact is unsurfaced; PASS otherwise.

### 5. review-freshness

`last_verified_against_commit` in any component frontmatter or doc frontmatter must match the source repo's current HEAD (or be within a configurable window per `[knowledge_base.re_max_drift_commits]` if set). Otherwise the doc is stale and the RE pass needs re-running before ingestion.

Verdict: FAIL if drift exceeds threshold; PASS WITH OBSERVATIONS at boundary; PASS otherwise.

### 6. review-traceability

Component frontmatter `paths` globs must resolve to real files at `target_commit`. Broken globs indicate either fabrication or a moved file the RE didn't catch.

Verdict: FAIL if any `paths` entry has zero matches; PASS otherwise.

### 7. review-adversarial-pass (wrapper)

Invokes `meta/review-adversarial --stage=reverse-engineering` against the canonical entry file. Findings file written to `<repo>/review/adversarial-findings.md`. Verdict per `references/review-patterns/review-verdict-mapping.md`.

For RE output, the adversarial lens emphasizes unsupported claims (every sentence should reference a source file) and hidden assumptions (Part A often asserts behaviour without citing the code path that proves it).

### 8. review-edge-cases (wrapper)

Invokes `meta/review-edge-case-hunter --stage=reverse-engineering` against the canonical entry file. Findings file written to `<repo>/review/edge-case-findings.md`. Verdict per the same mapping.

For RE output, the edge-case lens emphasizes error paths (does the source actually handle every documented case?) and data-shape edges (what does each parser actually accept?).

### 9. review-re-readiness

Final gate. Reads all eight prior verdicts plus the two adversarial findings files. Emits APPROVED / CONDITIONAL / BLOCKED with explicit conditions if any sub-review returned PASS WITH OBSERVATIONS.

KB ingestion only proceeds on APPROVED or CONDITIONAL with explicit user acceptance.

## What this skill does not do

- It does not re-run RE. Fixes are authored by the relevant RE skill.
- It does not modify the source repo.
- It does not write to the global KB. KB ingestion is `build-knowledge-base` / `update-knowledge-base`.
- It does not review the KB itself. Use `review-knowledge-base-package` for that.
