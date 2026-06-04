# Step — Verify

Execute the extraction-verification gate. This step runs after Stage 4
(Cross-Cutting Concerns) and before hand-off. Goal: catch
extraction errors *before* the KB is updated — once Part B lands in
the live KB, downstream skills will trust it.

## Procedure

### 1. Structural verification

For each Part B component file, confirm:

- [ ] File exists at the planned path
- [ ] Frontmatter parses (YAML well-formed)
- [ ] `kind: test-suite` present
- [ ] `subkind` matches the file's role (runner / shared-utilities /
      fixtures / marker-vocabulary / feature-inventory /
      environment-matrix / ci-surface / ownership)
- [ ] `test_suite_id`, `source_repo`, `source_version`,
      `last_verified_against_commit` all populated (no placeholder
      values left)
- [ ] `tests:` array references at least one application component
      that exists in the KB (run a quick lookup to confirm)
- [ ] `triggers:` array non-empty (capability index needs them)

For Part A:

- [ ] Every workflow section (1–15) is present; "NOT FOUND" is a
      valid value but blank is not
- [ ] Source version + extraction date recorded at the top

### 2. Content verification (sampling)

Pick a random sample (default: 5 utilities, 3 fixtures, 3 specs) and
confirm the extracted documentation matches the actual code:

- For each sampled utility: signature in `shared-utilities.md`
  matches the method signature in the source file
- For each sampled fixture: refresh procedure in `fixtures.md` is
  reproducible (the team can re-derive the fixture from documented
  inputs)
- For each sampled spec: marker tags in `feature-inventory.md` match
  the actual tags in the feature/spec file (grep verification)

If any sample fails: re-run the extraction for that area and
re-sample. The framework's rule applies: *comments lie; code doesn't*.
Trust grep output, not docstrings.

### 3. Marker-vocabulary verification

The `marker-vocabulary.md` file is the bridge between this RE skill
and `audit-quality-coverage`'s Step 3 drift check. Confirm:

- [ ] The marker scheme documented in `marker-vocabulary.md` matches
      what actually appears in the suite (grep one of each scheme)
- [ ] The AC / FR / NFR / INC → marker mapping table is populated
      where the suite encodes such mappings (and explicitly says
      "no mapping" where it doesn't)
- [ ] At least one example mapping is verifiable by following the
      thread: marker in spec file → entry in `marker-vocabulary.md`
      → AC / INC ID → application component in the KB

### 4. Cross-link verification

Confirm the KB graph will resolve correctly once `update-knowledge-base`
runs:

- [ ] Every component in `tests:` exists at the path implied by its
      ID (run `Test-Path` against the resolved KB path)
- [ ] No `tests:` entry references a path that no longer exists
      (would cause an orphan edge after graph regeneration)

### 5. Reporting-path consistency

The CI surface and reporting paths in `ci-surface.md` should match
what consuming quality packages will pin in their `automation-and-cicd`
block. If the team has an existing quality package for an application
the suite tests, cross-reference its `automation-and-cicd.md` paths
and confirm they match. If they don't match, surface the mismatch to
the user — likely the quality package or the suite documentation needs
an update.

### 6. Change-tracker

Invoke `track-change` with one entry per file finalised. Trigger
note: `Extraction verified by reverse-engineer-test-suite`.

### 7. Hand-off summary

```markdown
## Reverse-engineering complete — <test-suite-id>

**Part A:** <path> (in the suite repo)
**Part B:** 8 components at `<kb-root>/components/<test-suite-id>/`
**Source version:** <source-version>
**Last verified against commit:** <sha>

**Verification results:**
- Structural: ✅ all 8 components pass
- Content sampling: ✅ <N>/<N> samples verified
- Marker vocabulary: ✅ scheme matches; <M> example mappings verified
- Cross-links: ✅ <K> `tests:` references resolved
- Reporting paths: <✅ match | ⚠️ mismatch with <quality-package-id>>

**Next steps:**
- If the KB is uninitialised → `/build-knowledge-base`
- Otherwise → `/update-knowledge-base` to fold these components in
- Once the KB is updated, downstream quality skills can ground via
  `navigate-knowledge-base --profile=test-suite`
```

Wait for explicit user acknowledgement before declaring complete.

## Next

Hand off by name to `build-knowledge-base` (KB uninitialised) or
`update-knowledge-base` (KB already exists). Do not proceed past
this skill without one of those.

