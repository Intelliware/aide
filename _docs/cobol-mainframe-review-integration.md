# COBOL/Mainframe RE Layer — Review-Package Integration

**Stage 4 (partial) deliverable.** Documents the patches that the
`mm/add-cobol` branch applies to the review-package skills introduced
by the adversarial-review layer (`mm/add-adverserial`, 1.2.0). These
patches are intentionally NOT applied on this branch because the
target review-package skills do not yet exist on `main`.

## Why this is a separate document

The design doc (`_docs/cobol-mainframe-re-design.md`) declares the
merge order: `mm/add-context` (1.1.0) → `mm/add-adverserial` (1.2.0)
→ `mm/add-cobol` (1.3.0). Until `mm/add-adverserial` lands on `main`,
the two skills this stage extends —
`reverse-engineering/review-reverse-engineering-package/` and
`knowledge-base/review-knowledge-base-package/` — do not exist on
this branch.

Rather than blocking 1.3.0 on a merge, this document records the
exact patches in human-readable form. They become a small, mechanical
follow-up commit applied either:
- During `mm/add-cobol`'s own merge to `main` (squash + apply),
- Or in a small follow-up PR immediately after `mm/add-cobol` lands.

## Patches to `review-reverse-engineering-package/SKILL.md`

The skill's coverage / completeness tables expand to cover the three
new domains. The existing nine sub-reviews (review-section-completeness,
review-grounding, review-consistency, review-coverage,
review-freshness, review-traceability, review-adversarial-pass,
review-edge-cases, review-readiness) all apply unchanged — the
patches add per-domain expectations to `review-coverage` and update
the description / overview tables.

### Patch 1: description

The skill's `description` field expands to mention the three new
domains, so the skill correctly routes when invoked on a mainframe RE
package:

```diff
-description: "Use when the user asks to review reverse-engineered package(s) — Part A + Part B docs ..."
+description: "Use when the user asks to review reverse-engineered package(s) — Part A + Part B docs for any of the ten domains (api, api-framework, web-app, ui-framework, database, mobile-app, mobile-framework, cobol-program, copybook-library, jcl-job) ..."
```

### Patch 2: review-coverage expectations

The `review-coverage` sub-review's per-domain expectations table gains
three new rows:

| Domain | Coverage Expectations Added |
|---|---|
| cobol-program | `program-call-graph.mmd`, `program-data-bindings.json`, `program-exec-inventory.md` exist and are well-formed (per the schemas in `reverse-engineer-cobol-program/references/INPUTS-OUTPUTS.md`) |
| copybook-library | `copybook-record-graph.json`, `data-dictionary.md`, `copybook-conflicts.md` exist and are well-formed |
| jcl-job | `job-flow.mmd`, `dataset-io.json` exist and are well-formed |

Phrased as additions to the existing coverage matrix in the SKILL.md.

### Patch 3: domain detection

If the skill auto-detects domain from the source package, the
detection rules expand to include the three new domains using the
same signals as `analyze-repository` (file extensions and source-line
markers).

## Patches to `review-knowledge-base-package/SKILL.md`

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

When applying these patches (post-merge of `mm/add-adverserial`):

1. Read this document end to end
2. Apply Patch 1, Patch 2, Patch 3 to
   `.agents/skills/reverse-engineering/review-reverse-engineering-package/SKILL.md`
3. Apply Patch 1, Patch 2, Patch 3 to
   `.agents/skills/knowledge-base/review-knowledge-base-package/SKILL.md`
4. Apply the OVERVIEW.md patches
5. Run `scripts/build-registry.py` and `scripts/validate.py`; expect zero errors
6. Update `CHANGELOG.md` with a "Modified review-package skills for mainframe" entry
7. Delete this document (its content is now reflected in the skills)

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
