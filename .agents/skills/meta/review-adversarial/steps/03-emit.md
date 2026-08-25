# Step 3 — Emit Format 4 findings file

Goal: render the in-memory findings list to a file at `output_path` conforming exactly to `references/review-patterns/review-output-format.md` schema `aide-adversarial-findings@1`.

This step is mechanical — no further analysis. If the previous step's findings are correct, this step is just templating.

## 3.1 Compute frontmatter aggregates

```python
severity_counts = {
  'critical': sum(1 for f in findings if f.severity == 'critical'),
  'high':     sum(1 for f in findings if f.severity == 'high'),
  'medium':   sum(1 for f in findings if f.severity == 'medium'),
  'low':      sum(1 for f in findings if f.severity == 'low'),
}
triage_counts = {
  'must-fix':   sum(1 for f in findings if f.triage == 'must-fix'),
  'should-fix': sum(1 for f in findings if f.triage == 'should-fix'),
  'consider':   sum(1 for f in findings if f.triage == 'consider'),
  'wont-fix':   sum(1 for f in findings if f.triage == 'wont-fix'),
}
worst_severity = first non-zero of [critical, high, medium, low] OR 'none' if all zero.
finding_ids = [f.id for f in findings]
```

Validate: `sum(severity_counts.values()) == sum(triage_counts.values()) == len(finding_ids)`. If not, halt — Step 2 produced inconsistent data.

## 3.2 Render frontmatter

```yaml
---
schema: aide-adversarial-findings@1
target_artifact: <from Step 1>
target_path: <from Step 1>
target_commit: <from Step 1>
produced_by: review-adversarial
produced_at: <ISO 8601 UTC, current time>
stage: <from Step 1>
severity_counts: { critical: <c>, high: <h>, medium: <m>, low: <l> }
triage_counts:    { must-fix: <a>, should-fix: <b>, consider: <c>, wont-fix: <d> }
worst_severity: <computed>
finding_ids: [<id1>, <id2>, ...]
---
```

Render `severity_counts` and `triage_counts` on single lines (flow-style YAML). Render `finding_ids` on a single line if ≤ 10 ids; otherwise a YAML list.

## 3.3 Render body

Title line:

```markdown
# Adversarial findings — <human title>
```

`<human title>` is derived from the target:
- `requirements-package` → `Requirements Package <feature-id>`
- `design-package` → `Design Package <feature-id>`
- `implementation-package` → `Implementation Package <feature-id>`
- `reverse-engineering-doc` → `RE <Part A | Part B> — <repo-slug>`
- `knowledge-base-component` → `KB Component <component-id>`
- `knowledge-base-instance` → `Knowledge Base — <project-slug>`
- `quick-change-brief` → `Quick-Change Brief <change-id>`
- `other` → `<basename of target>`

Then in order:

### 3.3a Empty case

If `worst_severity == 'none'`:

```markdown
No findings.
```

Stop here — no triage table, no critical section, no all-findings section.

### 3.3b Triage summary

```markdown
## Triage summary

| ID | Severity | Category | Finding (one line) | Action |
|---|---|---|---|---|
| ADV-001 | critical | Weasel word | "performant under typical load" — neither term is defined | must-fix |
| ...
```

One row per finding, in finding-id order. Severity column lower-case. Category is the lens label from Step 2. `Finding (one line)` is `f.one_line`. `Action` is `f.triage`.

### 3.3c Critical findings (claim vs counter)

Include this section ONLY if any finding has `is_critical_section: true`.

```markdown
## Critical findings (claim vs counter)

### <ID> · <SEVERITY-UPPER> · <Category>

> **Original claim** (<f.evidence>)
> "<verbatim quote from target artifact>"

> **Adversarial counter**
> <2–4 sentences explaining what's wrong with the claim, citing what the artifact would have to say to fix it>

**Recommended fix:** <f.recommendation>
```

Repeat per critical-section finding.

### 3.3d All findings

```markdown
## All findings

### ADV-001 · critical · Weasel word
- **Evidence:** requirements-package.md § 4.2, line 87
- **Risk:** untestable; will pass review-measurability vacuously
- **Recommendation:** P95 < 250ms at 500 concurrent users

### ADV-002 · high · Hidden assumption
- **Evidence:** ...
- **Risk:** ...
- **Recommendation:** ...

```

One H3 per finding, in finding-id order. Severity column lower-case in headers (matches the triage table).

If truncation happened in Step 2, prepend the section with:

```markdown
*(Truncated to top 50 findings by severity; <N> additional findings omitted.)*
```

## 3.4 Write file

Write the assembled string to `output_path`. Use UTF-8, LF line endings.

After writing, print the path to stdout and a one-line summary:

```
Wrote findings to <output_path>
worst_severity: <s> · severity_counts: <c>/<h>/<m>/<l> · finding_ids: <N>
```

Wrappers parse this output to detect success.

## 3.5 Validation gate

After writing, re-read the file and verify:

- Frontmatter parses as YAML
- `schema` value is exactly `aide-adversarial-findings@1`
- `severity_counts` sums equal `len(finding_ids)`
- Every `finding_ids` entry has a corresponding H3 in the All findings section (unless empty case)
- `worst_severity` matches the highest non-zero severity in counts

If any check fails, halt with: `Format 4 schema violation in <output_path>: <reason>`. Do not silently produce a malformed file — wrappers depend on the schema.
