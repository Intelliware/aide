---
slug: 01-validate-inputs
sequence: 1
depends-on-prior: false
---

# Step 1: Validate Inputs

Confirm `project.toml` declares the contributing repos and that every required feed-file exists and parses.

## Why

Lineage joins three independent feed-file streams. Any missing or malformed feed-file silently corrupts every downstream where-used claim. Validate up front; refuse to proceed on partial inputs.

## Inputs

- `project.toml`
- `<knowledge_base_path>/source-docs/<repo-slug>/...` for each contributing repo
- The `[[project.repos]]` array (each repo's `role` declares whether it is `copybook-library`, `cobol-program`, `jcl-job`, or something else — non-mainframe repos are skipped here)

## Process

### 1. Read project.toml

Identify every `[[project.repos]]` whose `role` is one of `copybook-library`, `cobol-program`, `jcl-job`. Record the repo-slug for each.

### 2. Confirm contributing-repo feed-files exist

For each repo identified:

| Role | Required Feed-Files |
|---|---|
| copybook-library | `<KB>/source-docs/<slug>/copybook-record-graph.json`, `<KB>/source-docs/<slug>/copybook-conflicts.md` |
| cobol-program | `<KB>/source-docs/<slug>/program-call-graph.mmd`, `<KB>/source-docs/<slug>/program-data-bindings.json`, `<KB>/source-docs/<slug>/program-exec-inventory.md` |
| jcl-job | `<KB>/source-docs/<slug>/job-flow.mmd`, `<KB>/source-docs/<slug>/dataset-io.json` |

> **Feed-file location (canonical).** All mainframe RE feed-files live at the **Part-B directory root** — `<KB>/source-docs/<slug>/` — alongside the `*-consumer/` tree, not inside a `*-consumer/` or `*-internal/` subdirectory. This matches `reverse-engineer-copybook-library`/`-cobol-program`/`-jcl-job` INPUTS-OUTPUTS and the universal RE "supplementary artifacts at the Part-B root" rule.

### 3. Parse the JSON feed-files

- `copybook-record-graph.json` — validate against the schema in `reverse-engineer-copybook-library/references/INPUTS-OUTPUTS.md`
- `program-data-bindings.json` — validate against the schema in `reverse-engineer-cobol-program/references/INPUTS-OUTPUTS.md`
- `dataset-io.json` — validate against the schema in `reverse-engineer-jcl-job/references/INPUTS-OUTPUTS.md`

### 4. Confirm cross-repo coverage

At least one of each role must be present. If only two of the three roles have contributing repos, halt — lineage requires all three.

### 5. Record provenance

For each contributing repo, record `last_verified_against_commit` (full 40-char SHA) for change-tracking.

### 6. Derive middleware-presence flags (drives the composition gates)

This is a KB-stage aggregator with no elicitation phase, so the `has_db2` /
`has_ims` / `has_cics` flags that gate the DB2/IMS/CICS binding blocks are
**derived from the feeds**, not read from `project.toml`:

- `has_db2 = true` iff any contributing `program-exec-inventory` reports one or more `EXEC SQL` statements.
- `has_cics = true` iff any contributing `program-exec-inventory` reports one or more `EXEC CICS` commands.
- `has_ims = true` iff any contributing `program-exec-inventory` reports one or more `EXEC DLI` calls.

Set these before rendering; the `db2-host-variable-bindings` /
`cics-commarea-bindings` / `ims-segment-bindings` blocks render exactly when
their derived flag is true. Do **not** halt or omit a binding block merely
because `project.toml` lacks the flag.

## Output

A validation report listing each contributing repo, the feed-files found, the JSON parse status, and the per-repo SHA. Step 2 reads this report.

## Halt conditions

- `project.toml` not found, or no `[project.paths] knowledge_base_path` declared
- No contributing repos of any of the three roles
- Any required feed-file missing or unparseable
- Only one or two of the three roles represented (lineage requires all three)

## Common mistakes

- Treating partial inputs as acceptable — produce the missing Part A first
- Reading short SHAs instead of full 40-char SHAs
- Skipping the JSON-parse validation — schema-violating feed-files crash later steps with confusing errors
