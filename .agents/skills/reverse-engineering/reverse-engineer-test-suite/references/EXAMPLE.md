# Example — reverse-engineer-test-suite

> Illustrative only. Repo names, framework conventions, marker formats,
> and component IDs are placeholders. The skill is framework-agnostic;
> substitute what `analyze-repository` detected for the target suite.

## Scenario — Document the `outgoing-wires-e2e` suite

**User says:** "Reverse engineer the outgoing-wires-e2e test suite into
the knowledge base"

`analyze-repository` confirms: dedicated test-suite repo, framework
detected (`<framework>`), runner (`<runner>`), build tool
(`<build-tool>`). Routes to `reverse-engineer-test-suite`.

### Stage 1 — Discovery and inventory

- Runner: `<runner-class>` invoked via `<build-tool> <command>`
- Test framework: `<framework>` pinned at `<version>`
- Marker vocabulary: tag annotations of the form `@INC-<nnn>` and
  `@<feature-area>`
- Directory layout: specs under `src/test/specs/`, shared utilities
  under `src/test/utils/`, fixtures under `src/test/fixtures/`, page
  objects under `src/test/page-objects/`
- Application repos under test: `outgoing-wires-api`, `outgoing-wires-ui`

`steps/scaffold.md` lays down the Part A skeleton and the 8 Part B
component files under `{paths.knowledge_base_path}/components/outgoing-wires-e2e/`.

### Stage 2 — Global infrastructure

Extracted to Part A and Part B:

- `runner.md` — invocation, profiles (`local`, `pat`, `ci`),
  parallelism = 4 workers, tag filter syntax
- `shared-utilities.md` — 23 utilities catalogued, each with its
  signature and interaction-type tag (e.g. `[WAIT] WireConfirmation.untilCleared(timeout)`)
- `fixtures.md` — 7 fixture builders (no real data values — shape +
  refresh-procedure references only)
- `environment-matrix.md` — 4 environments × 6 capabilities each
- `ci-surface.md` — triggered on PR + nightly; gates merge on smoke
  tag; reporting paths match what the consuming quality package will
  pin in `automation-and-cicd`

### Stage 3 — Spec / feature inventory

`feature-inventory.md` populated with 17 spec files. For each:
scope, scenarios, markers, traceability map (`@INC-001` → INC-001 in
the `outgoing-wires-mvp2` feature's implementation package).

### Stage 4 — Cross-cutting

`marker-vocabulary.md` documents the full tag scheme + the AC/FR/NFR/INC
mapping. `ownership.md` records team + on-call + known anti-patterns
(2 specs use raw `sleep` calls — flagged as accepted tech debt with a
TC-XXX hardening increment scheduled).

### Stage 5 — Verification

- Every Part B file has `kind: test-suite` frontmatter ✅
- Marker vocabulary documented in Part B matches the suite's actual
  tag usage (grep verification) ✅
- `tests:` frontmatter on `feature-inventory.md` links to the
  application components in the KB ✅
- `last_verified_against_commit` set to the current HEAD ✅

### Hand-off

> "Reverse-engineering of `outgoing-wires-e2e` complete.
>
> - Part A: `outgoing-wires-e2e/docs/INTERNAL.md` (in the suite repo)
> - Part B: 8 components at `<kb>/components/outgoing-wires-e2e/`
> - Cross-links: 14 references to `outgoing-wires-api` /
>   `outgoing-wires-ui` components
>
> Next: run `/build-knowledge-base` (if first time) or
> `/update-knowledge-base` (to fold these into the live KB).
>
> After that, the merged quality stage's skills will be able to
> ground against this suite via
> `navigate-knowledge-base --profile=test-suite`."

## What downstream skills see

Once the KB is updated, `navigate-knowledge-base --profile=test-suite`
with the feature scope `outgoing-wires-mvp2` returns:

```
1. components/outgoing-wires-e2e/feature-inventory.md   [primary]
   why: kind=test-suite, triggers match "outgoing-wires"
2. components/outgoing-wires-e2e/shared-utilities.md   [primary]
   why: kind=test-suite, frequently consumed by feature-inventory
3. components/outgoing-wires-e2e/marker-vocabulary.md   [primary]
   why: kind=test-suite, declares the @INC-* scheme
4. components/outgoing-wires-e2e/fixtures.md   [one-hop]
   why: shared-utilities depends_on fixtures
```

`execute-quality-increments` then uses this list to find existing
producers / consumers before generating new ones (Step 2a reuse
cross-check). `audit-quality-coverage` uses `marker-vocabulary.md` +
`feature-inventory.md` to verify drift (Step 3). `review-test-failures`
uses `shared-utilities.md` to look up locator definitions (Step 3
classification).


