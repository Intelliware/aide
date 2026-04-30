---
slug: 08-verify-coverage
sequence: 8
depends-on-prior: true
---

# Step 8: Verify Coverage

Run the coverage-rule gate. The lineage build is GO only if every coverage rule passes (or every failure is a rule that explicitly tolerates flagging in `09-unbound-and-flagged-items.md`).

## Why

Lineage is consumed by every downstream A.I.D.E. stage that touches mainframe code. A silently-incomplete artefact (e.g. one program missing from `02-copybook-where-used.md`) corrupts every "where is this used" answer for the rest of the project's life. Verification is non-negotiable.

## Inputs

- The artefact tree from steps 1–7
- The accumulated flags from steps 2–6 (now consolidated in `09-unbound-and-flagged-items.md`)

## Process

### Coverage Rule 1: Every copybook documented

For every copybook in any contributing `copybook-record-graph.json`, confirm it has a section in `02-copybook-where-used.md`. A copybook with zero consumers is acceptable (rendered as "no consumers found"); a copybook missing entirely is a hard failure.

### Coverage Rule 2: Every program reachable

For every program in any contributing `program-data-bindings.json`, confirm one of:

- The program appears as a node in `05-job-program-dataset-chain.mmd` (i.e. invoked from documented JCL), OR
- The program appears in `09-unbound-and-flagged-items.md` § 5 ("Programs not invoked from documented JCL")

Missing in both is a hard failure.

### Coverage Rule 3: Every host-var resolved

For every host variable in every `EXEC SQL` block, confirm one of:

- The host-var resolves to a working-storage / linkage field documented in `06-db2-host-variable-bindings.md`, OR
- The host-var appears in `09-unbound-and-flagged-items.md` § 1 ("Unbound EXEC SQL host variables")

### Coverage Rule 4: Every IMS segment resolved

For every segment in every `EXEC DLI` block, confirm one of:

- The segment resolves to an `IMS-*` copybook documented in `07-ims-segment-bindings.md`, OR
- The segment appears in `09-unbound-and-flagged-items.md` § 2

### Coverage Rule 5: CICS COMMAREA shape consistency

For every CICS LINK / XCTL chain in `08-cics-commarea-bindings.md`, confirm one of:

- Caller LENGTH and callee LINKAGE 01-level byte sizes match, OR
- The mismatch appears in `09-unbound-and-flagged-items.md` § 9

### Coverage Rule 6: Dynamic CALLs flagged

Every dynamic CALL site in any contributing `program-call-graph.mmd` appears in `09-unbound-and-flagged-items.md` § 3.

### Coverage Rule 7: Symbolic DSNs flagged

Every JCL DSN containing `&` appears in `09-unbound-and-flagged-items.md` § 4.

### Coverage Rule 8: move-chain.json schema

`04-move-chain.json` validates against the schema in INPUTS-OUTPUTS.md.

### Coverage Rule 9: Mermaid render

`05-job-program-dataset-chain.mmd` parses as Mermaid (use a Mermaid CLI / parser; reject on syntax errors).

### Coverage Rule 10: Cross-references valid

Every link inside the artefact tree resolves (no broken file references; no broken section anchors).

## Reporting

Produce a verification report listing each rule, its pass/fail status, and a count of flagged items per rule (where applicable):

```
Coverage Rule 1 (every copybook documented):       PASS  (387/387)
Coverage Rule 2 (every program reachable):         PASS  (135 in JCL chain; 7 flagged)
Coverage Rule 3 (every SQL host-var resolved):     PASS  (217 resolved; 0 unbound)
Coverage Rule 4 (every IMS segment resolved):      PASS  (12 resolved; 0 unbound)
Coverage Rule 5 (CICS COMMAREA shape):             PASS  (14 chains matched; 0 mismatched)
Coverage Rule 6 (dynamic CALLs flagged):           PASS  (18/18 flagged)
Coverage Rule 7 (symbolic DSNs flagged):           PASS  (4/4 flagged)
Coverage Rule 8 (move-chain.json schema):          PASS
Coverage Rule 9 (Mermaid render):                  PASS
Coverage Rule 10 (cross-references valid):         PASS

Verdict: GO. All rules pass.
```

If any rule fails:

```
Coverage Rule 1 (every copybook documented):       FAIL  (1 missing: BILLAREA)
...
Verdict: NO-GO. Rule 1 must pass before lineage is published.
```

## Output

- A `verification-report.md` written to `<KB>/lineage/mainframe/`
- An entry in the change-tracker (Parts Affected: lineage; Verification: PASS / FAIL)

## Halt conditions

- Any coverage rule fails — NO-GO; do not declare the lineage build complete

## Common mistakes

- Treating a flag as if it satisfies a coverage rule by virtue of merely existing — flags must be in the canonical section of `09-unbound-and-flagged-items.md`, not buried elsewhere
- Skipping the Mermaid parse check — broken Mermaid silently fails to render in downstream consumers
- Skipping the cross-reference check — broken links in the artefact tree are a frequent post-rebuild regression
