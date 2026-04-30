# Mainframe / COBOL Reverse-Engineering Layer

**Stage 1 deliverable.** Defines the design for three new
reverse-engineering domain skills (COBOL program, copybook library,
JCL job), one new knowledge-base aggregation skill that builds
cross-program data lineage, the `analyze-repository` extensions that
route mainframe repos into the new skills, and the block / composition
trees that back them.

This document is the contract for Stages 2–5: anything described here
must end up in the corresponding stage's outputs; anything left out is
intentionally NOT in scope.

## Why

A.I.D.E.'s reverse-engineering stage today recognises seven domain
types — API, API-framework, web-app, UI-framework, database,
mobile-app, mobile-framework. Detection signals in
`analyze-repository` are all modern-stack (`package.json`, `pom.xml`,
`go.mod`, `Cargo.toml`, `Podfile`, `*.csproj`, …). Nothing detects
`.cbl`, `.cob`, `.cpy`, `.pli`, `.jcl`, `.proc`, BMS maps, IMS
PSB/PCB, EXEC CICS / EXEC SQL / EXEC DLI, IDCAMS/SORT, or
Endevor/ChangeMan/Panvalet headers. A grep across the entire repo for
`cobol|copybook|mainframe|jcl|cics|vsam|ims|idms` returns one
incidental hit in a BMad files manifest — zero coverage in skills,
blocks, compositions, or templates.

The closest analog, `reverse-engineer-database`, doesn't stretch to
fit:

| DB skill assumes | Copybook reality |
|---|---|
| DDL is source of truth | Copybooks are record layouts, not declarations of relations |
| FKs define relationships → ERD | No FKs. Relationships exist only as program-mediated `MOVE`s and naming conventions |
| Tables / columns / types / constraints | `01/05/88` levels, `PIC`, `REDEFINES`, `OCCURS [DEPENDING ON]`, `FILLER`, group items |
| Stored procs as business logic | Logic lives in COBOL paragraphs, JCL chains, CICS transactions |
| Consumer guide = query patterns | Consumer guide = file open/close, `MOVE`/`COMPUTE`, `CALL` chains |

Coercing copybooks through `reverse-engineer-database` would produce
a flattened field list but lose REDEFINES variants, OCCURS repeating
groups, and would leave no way to render an ERD because there are no
foreign keys.

The bigger gap is **data traceability across copybooks**. The
"traceability" hits in the existing reverse-engineering stage are
documentation-traceability (do `paths` globs in frontmatter resolve
to real files), not field-level data lineage. Building lineage
requires program × copybook where-used analysis,
`MOVE`/`COMPUTE`/`MOVE CORRESPONDING` chain extraction, JCL DD
parsing, and EXEC SQL / IMS DBD host-variable binding — none of
which any current skill knows about.

This layer closes both gaps in one coherent addition.

## Scope at a glance

| Component | Type | New / Modified |
|---|---|---|
| `reverse-engineering/reverse-engineer-cobol-program/` | New domain skill | New |
| `reverse-engineering/reverse-engineer-copybook-library/` | New domain skill | New |
| `reverse-engineering/reverse-engineer-jcl-job/` | New domain skill | New |
| `knowledge-base/build-mainframe-data-lineage/` | New KB aggregation skill | New |
| `reverse-engineering/analyze-repository/` | Mainframe detection rules + 3 new dispatch targets | Modified |
| `templates/blocks/reverse-eng/cobol-program/{internal,consumer}/` | Block tree | New |
| `templates/blocks/reverse-eng/copybook-library/{internal,consumer}/` | Block tree | New |
| `templates/blocks/reverse-eng/jcl-job/{internal,consumer}/` | Block tree | New |
| `templates/blocks/knowledge-base/mainframe-lineage/` | Block tree | New |
| `templates/compositions/re-cobol-program-internal.yaml` + `-consumer.yaml` | Compositions | New |
| `templates/compositions/re-copybook-library-internal.yaml` + `-consumer.yaml` | Compositions | New |
| `templates/compositions/re-jcl-job-internal.yaml` + `-consumer.yaml` | Compositions | New |
| `templates/compositions/kb-mainframe-data-lineage.yaml` | Composition | New |
| `reverse-engineering/review-reverse-engineering-package/` | Coverage tables extended for new domains | Modified |
| `knowledge-base/review-knowledge-base-package/` | Add lineage-artifact integrity sub-review | Modified |
| `_registry/skills.{csv,json}` + `workflow-graph.yaml` | Rebuild | Modified |
| `CHANGELOG.md` + `README.md` version line | 1.2.0 → 1.3.0 | Modified |

## Branch dependency

`mm/add-cobol` is cut from `main` (currently 1.0.1). The two open
feature branches must land first because this layer reuses their
contracts:

1. `mm/add-context` (1.0.1 → 1.1.0) — adds `shared/{solution-context,
   ai-rules, operations}/` leaves to KB; lineage artifact lives in the
   KB and references operations leaves for batch schedulers
2. `mm/add-adverserial` (1.1.0 → 1.2.0) — adds the
   `review-reverse-engineering-package` and
   `review-knowledge-base-package` wrappers that this layer extends

Merge order: `mm/add-context` → `mm/add-adverserial` → `mm/add-cobol`.
This branch targets 1.3.0.

## The three new RE domain skills

All follow the existing domain-skill shape: 6-stage extraction
workflow producing Part A (internal) and Part B (consumer) docs,
self-documenting standard (SKILL.md ≤ 200 lines + references/{
OVERVIEW, INPUTS-OUTPUTS, EXAMPLE }.md + steps/{scaffold, verify}.md).

### `reverse-engineer-cobol-program/`

For repos that contain COBOL source programs (`.cbl`, `.cob`, `.pli`
where applicable). Drives extraction of the four DIVISIONs, the
SECTION/PARAGRAPH structure, and the program's runtime context.

| Part | Audience | Content | Destination |
|---|---|---|---|
| Part A | Mainframe developers, maintainers | DIVISION-by-DIVISION reference; PERFORM graph; CALL/LINK/XCTL graph; FILE-CONTROL ↔ FD bindings; embedded EXEC CICS/SQL/DLI inventories; copybook inclusion list (`COPY` statements with REPLACING); WORKING-STORAGE / LINKAGE / LOCAL-STORAGE breakdown | Stays in source repo |
| Part B | Application integrators, batch scheduler owners, downstream-system teams | Program contract: entry points, expected DD names, called subprograms, externally observable side effects (file I/O, CICS commareas, SQL writes, MQ puts) | Knowledge base |

**Mandatory extracted artifacts** (per program, beyond block-driven
content):
- `program-call-graph.mmd` — Mermaid graph of `CALL`/`PERFORM`/`XCTL`
- `program-data-bindings.json` — copybook → division-where-used → key
  fields (feeds the lineage skill in stage 4)

### `reverse-engineer-copybook-library/`

For repos whose primary content is copybooks (`.cpy`, sometimes
mixed with COBOL). The "data dictionary" producer the user asked
about lives here.

| Part | Audience | Content | Destination |
|---|---|---|---|
| Part A | Copybook maintainers, data architects | Per-copybook record dictionary: every level (`01–88`), `PIC`, `USAGE`, `OCCURS [DEPENDING ON]`, `REDEFINES`, `FILLER`, `VALUE` clauses; group hierarchy; naming-convention buckets (e.g. `WS-`, `IO-`, `LS-`, `DB2-`); duplicate / divergent copybook detection (same name, different layouts across folders or versions) | Stays in source repo |
| Part B | Application developers, integrators | Coherent **data dictionary** across the whole library: canonical record names; field index; "use this copybook for X" guidance; deprecated copybooks; naming-convention key | Knowledge base |

**Mandatory extracted artifacts**:
- `copybook-record-graph.json` — every copybook normalised into
  canonical records, with REDEFINES collapsed into named variants
  and OCCURS expanded into indexed positions
- `data-dictionary.md` — human-readable rendering, organised by
  naming-convention bucket
- `copybook-conflicts.md` — divergent-layout report (same name,
  different shapes)

### `reverse-engineer-jcl-job/`

For repos containing JCL job decks, PROCs, INCLUDE members, control
cards (IDCAMS, SORT, IEBGENER patterns).

| Part | Audience | Content | Destination |
|---|---|---|---|
| Part A | Schedulers, ops, batch developers | Per-job step list; PROC expansion (with overrides resolved); DD inventory (DSN, DISP, GDG generation); INCLUDE chain; condition codes; restart points; IDCAMS / SORT / IEBGENER usage; scheduler integration markers | Stays in source repo |
| Part B | Application teams, downstream consumers, data ops | Job-flow guide: which datasets the job reads/writes; predecessor / successor jobs (where derivable); data-set lifecycle (GDG roll, retention); consumer-visible failure modes | Knowledge base |

**Mandatory extracted artifacts**:
- `job-flow.mmd` — Mermaid step→step graph with DD I/O annotated
- `dataset-io.json` — job → step → DD → DSN → DISP → program
  invoked (feeds the lineage skill)

## The new knowledge-base aggregation skill

### `knowledge-base/build-mainframe-data-lineage/`

This is the **data-traceability skill the user explicitly asked
for**. It is qualitatively different from the per-repo RE skills:
lineage cannot be derived from one repo in isolation because a
copybook lives in one repo, the programs that include it live in
another, and the JCL that runs those programs lives in a third. The
skill is therefore a KB-level aggregator, in the same shape as
`build-knowledge-base` (which already aggregates Part B docs across
repos).

**Inputs** (collected from KB after each contributing repo's RE pass):
- `program-data-bindings.json` from every COBOL repo
- `copybook-record-graph.json` from every copybook library
- `dataset-io.json` from every JCL repo
- DB2 EXEC SQL inventories and IMS PSB/PCB inventories from RE Part A

**Outputs** (one composition `kb-mainframe-data-lineage.yaml`,
written under `<KB>/lineage/mainframe/`):

| Artifact | Content |
|---|---|
| `copybook-where-used.md` | Per copybook, every program / JCL step that includes or references it |
| `field-where-used.md` | Per canonical field (post-REDEFINES normalisation), every program section that reads / writes / `MOVE`s it |
| `move-chain.md` + `move-chain.json` | Field-to-field `MOVE` / `COMPUTE` / `MOVE CORRESPONDING` graph; sources, derivations, sinks |
| `job-program-dataset-chain.mmd` | Cross-system Mermaid graph: job → step → program → DD → dataset → copybook record |
| `db2-host-variable-bindings.md` | Every `EXEC SQL ... INTO :host-var` mapped back to copybook field; every host-var write back to DB2 column |
| `ims-segment-bindings.md` | Every IMS DBD segment mapped to its copybook record; PCB sensitivity vs. usage |
| `cics-commarea-bindings.md` | CICS `COMMAREA` / channel-container layouts traced through `LINK` / `XCTL` chains |
| `lineage-summary.md` | Top-level index keyed by canonical field name |

**Coverage rules** (verification gate, see Stage 4):
- Every copybook in any repo's `copybook-record-graph.json` must
  appear in `copybook-where-used.md` (with empty list allowed if
  unused, but explicitly noted)
- Every program in `program-data-bindings.json` must appear as a
  node in `job-program-dataset-chain.mmd` if any JCL references it,
  otherwise be flagged as "not invoked from documented JCL"
- Every host-var name in any program's EXEC SQL must resolve to a
  copybook field or be flagged "unbound"

## `analyze-repository` extensions

Add mainframe detection signals to Stage 1 ("Locate and Scan the
Repository") and three new dispatch rows to Stage 2 ("Classify the
Repository"). The dispatcher contract — emit the exact next-skill
trigger phrase — is unchanged.

**New 1a/1b/1c signals:**
- File extensions: `*.cbl`, `*.cob`, `*.cpy`, `*.pli`, `*.jcl`,
  `*.proc`, `*.bms`, `*.dbd`, `*.psb`
- Directory shapes: `COBOL/` + `COPYBOOK/`, `SRC/CBL/`, `JCL/PROCLIB/`,
  `SOURCE.PDS.*`, Endevor / ChangeMan staging dirs
- Source-line markers: `IDENTIFICATION DIVISION`, `EXEC CICS`,
  `EXEC SQL`, `EXEC DLI`, `//STEP[0-9]* EXEC`, `//SYSIN DD`,
  `IDCAMS`, `IEBGENER`, `SORT FIELDS=`
- Header-comment markers: Endevor `*ENDEVOR*`, ChangeMan `*CHANGEMAN*`,
  Panvalet `++USE`, JES2 `/*JOBPARM`

**New rows in the classification table:**

| Type | Key Distinguisher | Skill to Invoke |
|---|---|---|
| COBOL Program | Repo's primary content is `.cbl/.cob/.pli` source | `reverse-engineer-cobol-program` |
| Copybook Library | Repo's primary content is `.cpy` (record layouts, no PROCEDURE DIVISION) | `reverse-engineer-copybook-library` |
| JCL / Batch Repo | Repo's primary content is `.jcl/.proc` and control cards | `reverse-engineer-jcl-job` |

**Mainframe monorepo handling** (added to Stage 3):
Mainframe shops commonly mix all three types in one PDS-as-Git repo.
Detection:
1. List sub-trees by extension density
2. Recommend the order copybook-library → cobol-program → jcl-job
   (data layouts first, then programs that include them, then jobs
   that run the programs)
3. After all three have produced Part A, recommend
   `build-mainframe-data-lineage` rather than the standard
   `build-knowledge-base` (which still runs, but lineage is the
   mainframe-specific aggregator)

## Block trees

Each new domain gets `internal/` (Part A) and `consumer/` (Part B)
block sets, mirroring how `templates/blocks/reverse-eng/database/`
is laid out. Per-block file naming continues to follow the existing
convention (`<NN>-<bare-slug>.md`, sorted by `order`).

### `templates/blocks/reverse-eng/cobol-program/internal/`

`identification-and-environment.md`,
`procedure-division-overview.md`,
`paragraph-and-section-graph.md`,
`call-and-perform-graph.md`,
`file-control-and-fd-bindings.md`,
`working-storage-and-linkage.md`,
`copy-statements-and-replacing-rules.md`,
`exec-cics-inventory.md`,
`exec-sql-inventory.md`,
`exec-dli-inventory.md`,
`error-handling-and-abend-codes.md`,
`performance-and-runtime-considerations.md`,
`naming-conventions.md`,
`anti-patterns-and-pitfalls.md`,
`faq-and-troubleshooting.md`,
`code-examples.md`

### `templates/blocks/reverse-eng/cobol-program/consumer/`

`how-to-invoke-this-program.md`,
`expected-dd-bindings.md`,
`commarea-and-linkage-contract.md`,
`called-subprograms-and-side-effects.md`,
`error-and-abend-contract.md`,
`integration-examples.md`

### `templates/blocks/reverse-eng/copybook-library/internal/`

`library-overview.md`,
`naming-convention-buckets.md`,
`per-copybook-record-reference.md`,
`redefines-and-variant-handling.md`,
`occurs-and-depending-on.md`,
`level-88-condition-names.md`,
`db2-and-ims-host-variable-copybooks.md`,
`cics-commarea-copybooks.md`,
`duplicate-and-divergent-detection.md`,
`deprecated-copybooks.md`,
`maintenance-rules.md`,
`anti-patterns-and-pitfalls.md`

### `templates/blocks/reverse-eng/copybook-library/consumer/`

`how-to-pick-the-right-copybook.md`,
`canonical-record-catalogue.md`,
`field-index.md`,
`naming-convention-key.md`,
`copy-with-replacing-patterns.md`,
`integration-examples.md`

### `templates/blocks/reverse-eng/jcl-job/internal/`

`job-overview.md`,
`step-by-step-reference.md`,
`proc-and-include-expansion.md`,
`dd-inventory-and-disp.md`,
`gdg-and-dataset-lifecycle.md`,
`condition-codes-and-restart-points.md`,
`idcams-sort-iebgener-patterns.md`,
`scheduler-integration.md`,
`security-and-racf-considerations.md`,
`anti-patterns-and-pitfalls.md`,
`faq-and-troubleshooting.md`

### `templates/blocks/reverse-eng/jcl-job/consumer/`

`what-this-job-does.md`,
`input-and-output-datasets.md`,
`predecessor-and-successor-jobs.md`,
`failure-modes-and-recovery.md`,
`integration-examples.md`

### `templates/blocks/knowledge-base/mainframe-lineage/`

`lineage-overview.md`,
`copybook-where-used.md`,
`field-where-used.md`,
`move-chain.md`,
`job-program-dataset-chain.md`,
`db2-host-variable-bindings.md`,
`ims-segment-bindings.md`,
`cics-commarea-bindings.md`,
`unbound-and-flagged-items.md`,
`lineage-summary.md`

## Review-package integration

The adversarial layer (1.2.0) already added
`review-reverse-engineering-package` and
`review-knowledge-base-package` with adversarial wrappers. This
layer extends both rather than introducing new review-package skills:

**`review-reverse-engineering-package`** — coverage tables and
section-completeness rules expand to cover the three new domains.
The existing nine sub-reviews apply unchanged. New per-domain
expectations (e.g. `program-call-graph.mmd` exists, `copybook-record-
graph.json` is well-formed) join `review-coverage`.

**`review-knowledge-base-package`** — gains one new sub-review:

| # | Sub-review | What it checks |
|---|---|---|
| 7.5 | review-mainframe-lineage-integrity | Every contributing repo's `program-data-bindings.json` / `copybook-record-graph.json` / `dataset-io.json` is present and consumed by `build-mainframe-data-lineage`; `field-where-used.md` covers every canonical field; unbound EXEC SQL host-vars are listed |

Inserted after `review-solution-context-coverage`, before the two
adversarial sub-reviews. (The skill stays a periodic, on-demand
audit — not gate-blocking on every change.)

## Stages of work

| Stage | Deliverable |
|---|---|
| 1 | This design note |
| 2 | `analyze-repository` mainframe-detection extension + the three new RE domain skills (full self-documenting set: SKILL.md ≤ 200 lines + references/{OVERVIEW, INPUTS-OUTPUTS, EXAMPLE}.md + steps/{scaffold, verify}.md) |
| 3 | The block trees + compositions for the three RE domains (`templates/blocks/reverse-eng/{cobol-program, copybook-library, jcl-job}/{internal, consumer}/` + the six new compositions) |
| 4 | `build-mainframe-data-lineage` skill + its block tree + composition; review-package integration (extend coverage tables in `review-reverse-engineering-package`; add `review-mainframe-lineage-integrity` sub-review to `review-knowledge-base-package`) |
| 5 | Registry rebuild, `workflow-graph.yaml` entries (new domain skills wired into the reverse-engineering stage flow; lineage skill wired into the knowledge-base flow), version bump (1.2.0 → 1.3.0), CHANGELOG entry |

## Non-goals (explicitly NOT in this layer)

- **Forward engineering of COBOL.** This layer is read-only
  documentation extraction. Generating COBOL, modifying programs,
  or producing migration plans (e.g. COBOL → Java) is out of scope.
- **Live mainframe connectivity.** Skills consume source files in a
  Git working copy. No FTP-to-mainframe, no z/OSMF, no Db2 catalog
  queries — those are operations problems, not RE problems.
- **Compiler-grade parsing.** Block extraction is structural
  (paragraph names, level numbers, EXEC blocks, DD statements) — not
  a full COBOL grammar. Where structural extraction is ambiguous
  (macro substitutions, complex REPLACING), flag "UNVERIFIED" per
  the existing RE convention rather than guess.
- **Non-IBM mainframe dialects.** Unisys MCP, Bull GCOS, Tandem
  NonStop are out of scope for 1.3.0. The block / composition shape
  is generic enough to extend later if needed.
- **Replacing `reverse-engineer-database` for DB2.** A DB2 schema
  repo continues to be RE'd by the database skill. The new skills
  cover **EXEC SQL embedded in COBOL** (a binding, not a schema).
  Where both apply (e.g. a hybrid repo with DDL + COBOL +
  copybooks), `analyze-repository` recommends the multi-pass order
  the same way it already handles other hybrids.
- **PL/I as a first-class domain.** PL/I files share enough
  structure with COBOL that they are accepted by
  `reverse-engineer-cobol-program` on a best-effort basis, but a
  dedicated `reverse-engineer-pli-program` skill is deferred.
- **Auto-fixing lineage gaps.** Unbound host-vars / orphan copybooks
  are flagged in the lineage output. Fixes are authored by the
  contributing repo's RE pass (re-run the relevant
  `reverse-engineer-*` skill, then re-aggregate).

## Acceptance check

Stage 1 is done when this design note exists, every skill in scope
appears in the matrices above, the block / composition trees are
enumerated, the lineage outputs and coverage rules are described,
the review-package integration is specified, and the staged
delivery plan is set.
