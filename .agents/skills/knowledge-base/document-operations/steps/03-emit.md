---
slug: emit
sequence: 3
depends-on-prior: true
---

# Step 3 — Emit

## Goal

Render the four operations leaves, run the validation gate, write
cross-links, and stamp the change tracker.

## Inputs

- Completed operations record from Step 02.
- Existing files under `<KB>/shared/operations/`.

## Procedure

### 3.1 Render leaves

For each of the four leaves, compose with these section shapes:

**`00-deployment-topology.md`**
1. Frontmatter
2. § 1 Overview (one paragraph; cloud(s), region(s), orchestrator)
3. § 2 Topology diagram (mermaid `graph LR` if helpful)
4. § 3 Failover model
5. § 4 Auto-scaling
6. § 5 Release cadence + freeze windows
7. § 6 Cross-links

**`10-environments-and-secrets.md`**
1. Frontmatter
2. § 1 Environment matrix (table: env, account/project, owner, purpose)
3. § 2 Config layering
4. § 3 Secret stores (table: store, owner, rotation cadence,
   bootstrap procedure)
5. § 4 Cross-links

**`20-slos-and-monitoring.md`**
1. Frontmatter
2. § 1 SLOs (table: name, target, SLI definition, measurement tool,
   `measured` | `aspirational`, owner)
3. § 2 Error-budget policy
4. § 3 Alert routing (table: alert, severity, paging tool, on-call
   tier, escalation)
5. § 4 Dashboards (table: name, link, owner)
6. § 5 Cross-links

**`30-runbooks-and-oncall.md`**
1. Frontmatter
2. § 1 On-call rotations (table; sourced from solution-context § 3)
3. § 2 Escalation tiers
4. § 3 Incident-comms channels
5. § 4 Runbook index (table: trigger, runbook file, last reviewed)
6. § 5 Cross-links

If any single runbook exceeds 80 lines OR § 4 lists more than 6
runbooks, the skill SHALL split runbooks into individual files under
`<KB>/shared/operations/runbooks/<runbook-slug>.md` and replace § 4 of
`30-runbooks-and-oncall.md` with the runbook index pointing to those
files. Each split-out runbook is rendered against
`templates/blocks/knowledge-base/ops-runbook.md`.

### 3.2 Validation gate

Per `references/INPUTS-OUTPUTS.md`:

- Required leaves present.
- Frontmatter `description` fields start with `Use when `.
- Secret-pattern regex sweep passes (no inlined secrets).
- SLO sanity vs. constraints: every SLA in solution-context has a
  matching SLO row or aspirational tag.
- On-call cross-ref: `30-runbooks-and-oncall.md` § 1 references the
  rotations from solution-context § 3.
- Runbook size discipline: each runbook ≤ 80 lines (warn / split if
  exceeded), ≤ 150 lines (fail).
- Aspirational tagging: every unmeasured metric tagged
  `aspirational` with responsible team.

### 3.3 Cross-links

Each leaf's § "Cross-links" section gets:
- Pointer to relevant solution-context leaves
  (`30-constraints-and-compliance.md`, `50-ownership-and-raci.md`,
  `40-external-integrations.md`).
- Pointer to `shared/ai-rules/project-context.md` § 5 (workflow rules)
  and § 8 (must-nots).
- Pointer to ARCHITECTURE.md § 2 (repo map) and § 4 (capability index).

### 3.4 Update root navigation

Append a "Solution-level operations" section to `<KB>/CLAUDE.md`
listing the four leaves. Idempotent (append-only).

### 3.5 Stamp change-tracker

One row in `<KB>/change-tracker.md`:
- timestamp, user_id, action = "operations-captured", leaves-touched,
  runbooks-authored, runbooks-stubbed.

## Acceptance

- Validation gate passes.
- Cross-links written.
- Change-tracker row present.
- Print summary (line counts per leaf, runbooks-authored vs stubbed,
  aspirational SLOs flagged).

## Outputs

- Four leaves under `<KB>/shared/operations/`.
- Optional `<KB>/shared/operations/runbooks/*.md` if split was needed.
- Updated `<KB>/CLAUDE.md`.
- Change-tracker row.

## Hand-off

Caller routes to `create-requirements-package` (brownfield bootstrap end)
or to whichever skill the active flow specifies. The solution-context
layer is now complete:

```
<KB>/shared/
├── solution-context/   (6 leaves) — capture-solution-context
├── ai-rules/           (1 + N leaves) — generate-ai-rules
└── operations/         (4 + N leaves) — document-operations
```
