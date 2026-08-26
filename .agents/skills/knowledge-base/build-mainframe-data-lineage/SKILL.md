---
name: build-mainframe-data-lineage
description: "Use when the user asks to build mainframe data lineage, generate cross-program field-level traceability, build a where-used index for COBOL copybooks or fields, build the JCL → program → dataset chain, resolve EXEC SQL host variables back to copybook fields, or aggregate copybook + COBOL program + JCL Part A into a coherent lineage artefact in the knowledge base. Runs after reverse-engineer-copybook-library, reverse-engineer-cobol-program, and reverse-engineer-jcl-job have all completed Part A for the contributing repos."
---

# Build Mainframe Data Lineage

KB-stage aggregator. Consumes the per-repo Part A outputs from
`reverse-engineer-copybook-library`,
`reverse-engineer-cobol-program`, and
`reverse-engineer-jcl-job`, then emits a coherent cross-program
data-lineage artefact under `<knowledge_base_path>/lineage/mainframe/`.

This skill is the answer to "where is field X used" / "which jobs
write the dataset DSN consumed by program Y" — questions that
cannot be answered from any single contributing repo in isolation.

## Overview

Lineage is by definition cross-repo: a copybook lives in one repo,
the programs that include it live in another, and the JCL that runs
those programs lives in a third. This skill aggregates the canonical
feed-files (`copybook-record-graph.json`,
`program-data-bindings.json`, `program-exec-inventory.md`,
`job-flow.mmd`, `dataset-io.json`) that the per-repo RE skills
produced, and emits a single lineage artefact tree. The artefact is
markdown-first and traversed by agentic search like the rest of the
KB.

## When to use

- Mainframe stack with at least one of each: copybook library, COBOL
  programs, JCL jobs — all three Part A passes complete
- User asks for a "where is field X used" / "which jobs feed
  program Y" / "what's the lineage of dataset DSN" answer
- Periodic re-aggregation after one of the contributing RE passes is
  re-run (e.g. a new release has changed copybooks)

## When NOT to use

- Only one of the three contributing RE passes has completed —
  produce the missing Part A first
- The KB has not been built — `build-knowledge-base` runs first; this
  skill consumes its `source-docs/` tree
- The user wants per-repo documentation — that is the work of the
  three contributing RE skills
- The user wants forward-engineering / migration / refactoring — out
  of scope; this skill is read-only

## Inputs

| Input | Source | Required |
|---|---|---|
| `project.toml` | `{project-root}/project.toml` | Yes |
| Copybook library Part B feed-files | `<knowledge_base_path>/source-docs/<copybook-repo>/copybook-library-consumer/{copybook-record-graph.json, copybook-conflicts.md}` | Yes |
| COBOL program Part A feed-files | `<knowledge_base_path>/source-docs/<cobol-repo>/cobol-program-internal/{program-call-graph.mmd, program-data-bindings.json, program-exec-inventory.md}` | Yes (per cobol-repo) |
| JCL job Part A feed-files | `<knowledge_base_path>/source-docs/<jcl-repo>/jcl-job-internal/{job-flow.mmd, dataset-io.json}` | Yes (per jcl-repo) |
| KB block templates | `templates/blocks/knowledge-base/mainframe-lineage/` | Yes |
| Composition | `templates/compositions/kb-mainframe-data-lineage.yaml` | Yes |

See `references/INPUTS-OUTPUTS.md`.

## Documentation Model

Single artefact tree under `<KB>/lineage/mainframe/` produced from
the `kb-mainframe-data-lineage.yaml` composition. The artefact is
**KB-side**, not per-repo: it spans every contributing repo.

| Artefact | Content |
|---|---|
| `copybook-where-used.md` | Per copybook, every program / JCL step that includes or references it |
| `field-where-used.md` | Per canonical field (post-REDEFINES normalisation), every program section that reads / writes / `MOVE`s it |
| `move-chain.md` (+ `move-chain.json`) | Field-to-field `MOVE`/`COMPUTE`/`MOVE CORRESPONDING` graph |
| `job-program-dataset-chain.md` (+ `job-program-dataset-chain.mmd`) | Cross-system Mermaid graph: job → step → program → DD → dataset → copybook record |
| `db2-host-variable-bindings.md` | Every `EXEC SQL ... INTO :host-var` mapped back to copybook field; every host-var write back to DB2 column |
| `ims-segment-bindings.md` | Every IMS DBD segment mapped to its copybook record; PCB sensitivity vs. usage |
| `cics-commarea-bindings.md` | CICS `COMMAREA` / channel-container layouts traced through `LINK`/`XCTL` chains |
| `unbound-and-flagged-items.md` | Every unbound EXEC SQL host-var, every dynamic CALL with no candidate target, every divergent-copybook consumer, every unresolved INCLUDE |
| `lineage-overview.md` | Human-readable orientation: what's in the artefact, how to navigate |
| `lineage-summary.md` | Top-level index keyed by canonical field name |

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Execute one step at a time. Read the step file only when starting that step.

1. **Validate inputs** — `steps/01-validate-inputs.md`
2. **Build copybook-where-used** — `steps/02-build-copybook-where-used.md`
3. **Build field-where-used** — `steps/03-build-field-where-used.md`
4. **Build MOVE chain** — `steps/04-build-move-chain.md`
5. **Build job → program → dataset chain** — `steps/05-build-job-program-dataset-chain.md`
6. **Build EXEC SQL / IMS / CICS bindings** — `steps/06-build-exec-bindings.md`
7. **Emit unbound-and-flagged + summary + overview** — `steps/07-emit-summary-and-flags.md`
8. **Verify coverage** — `steps/08-verify-coverage.md`

## Coverage Rules (verification gate)

The verify step (8) enforces:

- Every copybook in any repo's `copybook-record-graph.json` appears
  in `copybook-where-used.md` (with empty list allowed if unused,
  but explicitly noted)
- Every program in `program-data-bindings.json` appears as a node in
  `job-program-dataset-chain.mmd` if any JCL references it,
  otherwise is flagged "not invoked from documented JCL" in
  `unbound-and-flagged-items.md`
- Every host-var name in any program's EXEC SQL resolves to a
  copybook field or is flagged "unbound"
- Every IMS PCB segment in any program's EXEC DLI resolves to an
  `IMS-*` copybook in the matched copybook library or is flagged
- Every CICS COMMAREA copybook used in `LINK`/`XCTL` chains has a
  byte-stable shape (size matches across caller and callee)
- `move-chain.json` validates against the schema in INPUTS-OUTPUTS.md

## Output structure

The artefact renders as a tree under
`<knowledge_base_path>/lineage/mainframe/`:

```
<KB>/lineage/mainframe/
├── 01-lineage-overview.md
├── 02-copybook-where-used.md
├── 03-field-where-used.md
├── 04-move-chain.md
├── 04-move-chain.json                     ← side artefact (machine-readable)
├── 05-job-program-dataset-chain.md
├── 05-job-program-dataset-chain.mmd       ← side artefact (rendered Mermaid)
├── 06-db2-host-variable-bindings.md
├── 07-ims-segment-bindings.md
├── 08-cics-commarea-bindings.md
├── 09-unbound-and-flagged-items.md
└── 10-lineage-summary.md
```

Per-block file naming follows the same `<NN>-<bare-slug>.md` rule
used by every other composition in the framework.

## Re-Run Discipline

This skill is idempotent. Re-running after one of the contributing
RE passes has changed:
- Reads the latest feed-files from the contributing repos
- Overwrites the lineage artefact in place
- Logs a change-tracker entry (Parts Affected: lineage)

The lineage artefact is never hand-edited. All edits propagate from
the contributing RE passes, so re-running is the only legitimate way
to update lineage.

## Next skill

After lineage is built, the recommended follow-ups depend on intent:

- For an audit cycle: `verify-knowledge-base-coverage` (cross-checks
  lineage coverage against the broader KB)
- For drift detection: `detect-knowledge-base-drift` (cheap per-PR
  signal that any contributing repo has moved since lineage was last
  built)
- For a feature task: `navigate-knowledge-base` reads lineage
  alongside the rest of the KB

## Common mistakes

- **Running before all three contributing RE passes complete** —
  lineage is fundamentally cross-repo; partial inputs produce
  misleading "where-used" claims. Step 1 enforces this.
- **Hand-editing the lineage artefact** — every edit must propagate
  from a contributing RE pass; otherwise drift is silent.
- **Treating dynamic CALL resolution as a black box** — flag in
  `unbound-and-flagged-items.md`; do not invent a single resolved
  target.
- **Symbolic-DSN auto-resolution** — JCL DSNs containing `&` are
  flagged, not auto-resolved; consumers must apply site-specific
  defaults.
- **Skipping the verify step (8)** — coverage rules are the gate
  that holds the chain together; failing them silently corrupts
  every consumer of the lineage artefact.
