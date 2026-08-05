# COBOL/Mainframe RE Layer — Review-Package Integration

**Partially applied.** This document recorded patches that the
`mm/add-cobol` branch needed against review-package skills that did
not yet exist on `main`.

## Status

| Target skill | Status |
|---|---|
| `reverse-engineering/review-reverse-engineering-package/` | **Applied.** The skill landed on `main` with the RE close-out gate work; Patches 1–3 below were folded in at port time. |
| `knowledge-base/review-knowledge-base-package/` | **Pending.** The skill still does not exist on `main`. Its patches remain below, unapplied. |

## Why this is a separate document

The design doc (`_docs/cobol-mainframe-re-design.md`) declares the
merge order: `mm/add-context` (1.1.0) → `mm/add-adverserial` (1.2.0)
→ `mm/add-cobol` (1.3.0). `mm/add-adverserial` never merged as a
whole; its RE-review half was ported onto `main` selectively, and the
KB-review half was left out of scope.

Rather than blocking on a merge, this document records the exact
patches in human-readable form. The remaining ones become a small,
mechanical follow-up commit whenever `review-knowledge-base-package`
lands.

## Patches to `review-reverse-engineering-package` — APPLIED

The three patches below are already reflected in the skill on `main`;
they are retained for provenance only. Do not re-apply.

- **Patch 1 (description)** — the `description` field enumerates the
  domains. Applied with **eleven** domains, not the ten listed in the
  original patch: `test-suite` was added to the RE layer after this
  document was written and belongs in the same list.
- **Patch 2 (review-coverage expectations)** — the per-domain
  coverage table lives in
  `review-reverse-engineering-package/references/review-workflow.md`
  § per-domain coverage expectations, with the cobol-program,
  copybook-library, and jcl-job rows as specified, plus rows for api,
  database, and test-suite.
- **Patch 3 (domain detection)** — the skill's `## Step 0 — Resolve
  domain and paths` resolves domain from `[[project.repos]]` and the
  Part-A directory name, deferring to `analyze-repository`'s
  extension and source-line-marker signals, and **halts** rather than
  guessing when the two disagree.

## Patches to `review-knowledge-base-package/SKILL.md` — PENDING

The KB review skill gains one new sub-review covering lineage
integrity, plus minor updates to the coverage tables.

### Patch 1: new sub-review row

Insert a new sub-review at position 7.5 (after
`review-solution-context-coverage`, before the two adversarial
sub-reviews):

```diff
 | 7   | review-solution-context-coverage | shared/{solution-context, ai-rules, operations}/ leaves present |
+| 7.5 | review-mainframe-lineage-integrity | If `<KB>/lineage/mainframe/` exists: every contributing repo's `program-data-bindings.json` / `copybook-record-graph.json` / `dataset-io.json` is present and consumed by `build-mainframe-data-lineage`; `field-where-used.md` covers every canonical field; unbound EXEC SQL host-vars are listed in `09-unbound-and-flagged-items.md`; coverage rules 1–10 (per `build-mainframe-data-lineage/steps/08-verify-coverage.md`) all PASS |
 | 8   | review-adversarial-pass | Wrapper around meta/review-adversarial with --stage=knowledge-base |
```

### Patch 2: condition-gated sub-review

The new sub-review only runs if `<KB>/lineage/mainframe/` exists.
For non-mainframe projects the sub-review is skipped (PASS by default).

### Patch 3: description expansion

The skill's `description` field gains a mention of mainframe lineage
integrity so the skill correctly routes when invoked on a KB that
includes a lineage artefact:

```diff
-description: "Use when the user asks to review the knowledge base — periodic audit ..."
+description: "Use when the user asks to review the knowledge base — periodic audit (architecture index, component coverage, graph integrity, frontmatter integrity, staleness, link integrity, solution-context coverage, mainframe lineage integrity if present, adversarial pass, edge cases, readiness) ..."
```

## Patches to `review-reverse-engineering-package/references/OVERVIEW.md`

Update the per-domain tables to include the three new domains
alongside the seven original. Cosmetic — the substance is in the
SKILL.md patches above.

## Patches to `review-knowledge-base-package/references/OVERVIEW.md`

Add a section explaining the lineage-integrity sub-review:

```
### 7.5. review-mainframe-lineage-integrity

When `<KB>/lineage/mainframe/` exists (i.e. this project includes
mainframe components and `build-mainframe-data-lineage` has run),
this sub-review confirms:

- Every contributing repo's feed-files are present and parse
  (cross-checks against `build-mainframe-data-lineage`'s
  step 1 outputs)
- Coverage rules 1–10 (per the lineage skill's verify step) all PASS
- Unbound items in `09-unbound-and-flagged-items.md` are categorised
  (each entry has a triage class — investigate / accept / mitigate)
- Provenance SHAs in `01-lineage-overview.md` match each
  contributing repo's `last_verified_against_commit` (cross-checks
  against the per-repo Part A/B `last_verified_against_commit`)
- The artefact tree has been re-built within an acceptable freshness
  window (configured by `[knowledge_base.lineage_max_drift_commits]`
  in project.toml; default: 25)
```

## Apply-Time Checklist

Steps 1–2 and 4 (RE half) are done. Remaining work, to be run whenever
`review-knowledge-base-package` lands on `main`:

1. Read this document end to end
2. ~~Apply Patches 1–3 to `review-reverse-engineering-package`~~ — **done**
3. Apply Patch 1, Patch 2, Patch 3 to
   `.agents/skills/knowledge-base/review-knowledge-base-package/SKILL.md`
4. Apply the `review-knowledge-base-package/references/OVERVIEW.md` patch
   (the RE OVERVIEW.md patch is already applied)
5. Run `scripts/build-registry.py` and `scripts/validate.py`; expect zero errors
6. Update `CHANGELOG.md` with a "Modified review-package skills for mainframe" entry
7. Delete this document once the KB half is also reflected in the skills

## Why these patches are minimal

The adversarial-review wrapper architecture is intentionally generic:
the same nine sub-reviews apply to any RE package regardless of
domain. Adding three new RE domains does not require new sub-reviews
— only domain-aware coverage expectations.

The single new sub-review on the KB side
(`review-mainframe-lineage-integrity`) is necessary because lineage
is a KB-stage artefact distinct from the per-repo `source-docs/`
trees the existing seven sub-reviews already cover. Without it, the
KB readiness gate would silently accept a KB whose lineage artefact
is out of sync with the contributing repos.
