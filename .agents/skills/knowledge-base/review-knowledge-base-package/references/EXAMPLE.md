# Example — review-knowledge-base-package

End-to-end worked example showing the skill applied as a quarterly KB audit.

## Setup

Project: a multi-repo solution with eight repos in `[[project.repos]]`. KB has been live for nine months; last full review was three months ago. User wants a quarterly readiness check.

```
<knowledge_base_path>/
├── ARCHITECTURE.md
├── CLAUDE.md
├── graph.json
├── glossary.md
├── components/
│   └── (~80 leaves across 8 repos)
├── shared/
│   ├── solution-context/  (6 leaves)
│   ├── ai-rules/
│   └── operations/        (4 leaves + 2 split runbooks)
└── source-docs/           (8 repos)
```

## Invocation

User: "review the KB"

Skill creates `<KB>/_review/2026-04-29T16-00-00Z/` and begins.

## Sequence (truncated)

### Sub-review 1 — review-architecture-index

Reads `ARCHITECTURE.md`. Confirms all required sections (Section 0 Solution Overview present and links to `shared/solution-context/00-overview.md`, repository map matches `[[project.repos]]` 8/8, component catalog counts 80 leaves matching `components/` count). PASS.

### Sub-review 2 — review-component-coverage

Invokes `verify-knowledge-base-coverage` which produces a report. Findings:

- 1 orphan public artifact: `api-orders/src/jobs/refund-poller.ts` (added last sprint, no leaf)
- 3 stale-marked leaves

Verdict: FAIL on the orphan (must be addressed before APPROVED).

User runs `update-knowledge-base --scope=catalog-only` for `api-orders` to add the leaf. Re-runs sub-review 2. Now PASS WITH OBSERVATIONS (3 stale leaves remain). User accepts.

### Sub-review 3 — review-graph-integrity

`graph.json` parses. Symmetry check finds one mismatch: `web-portal/checkout-page` lists `api-orders/order-checkout-flow` in `depends_on`, but `order-checkout-flow` does not list `checkout-page` in `consumed_by`.

Verdict: FAIL.

User runs `update-knowledge-base` to regenerate `graph.json`. Re-runs sub-review 3. PASS.

### Sub-review 4 — review-frontmatter-integrity

Walks 80 component leaves + 11 shared leaves. Two component leaves missing `triggers` field. Three shared leaves with `description` not starting with "Use when".

Verdict: FAIL on the missing required fields. User adds `triggers` to the two leaves. Re-runs. Now PASS WITH OBSERVATIONS (3 stylistic violations). User accepts and tags for the next maintenance pass.

### Sub-review 5 — review-staleness

Invokes `detect-knowledge-base-drift` at L1 + L4. Output:

- 4 leaves with HIGH-severity drift (>20 commits behind source HEAD on file paths the leaf claims to describe)
- 1 solution-context leaf >120 days old (over threshold)

Verdict: FAIL on the 4 high-drift leaves. User runs `update-knowledge-base` for the affected repos. Re-runs. Now PASS WITH OBSERVATIONS (the solution-context staleness, advisory only). User accepts.

### Sub-review 6 — review-link-integrity

Walks every link in `ARCHITECTURE.md`, `CLAUDE.md`, 91 leaves. Finds 3 broken anchor links (sections renamed when ARCHITECTURE.md was updated last quarter, leaves still reference old anchors).

Verdict: PASS WITH OBSERVATIONS. User accepts and tags for maintenance.

### Sub-review 7 — review-solution-context-coverage

Checks `shared/`. All six solution-context leaves present, ai-rules present, four operations leaves + 2 split runbooks present. For each of 8 repos: at least one solution-context reference exists. PASS.

### Sub-review 8 — review-adversarial-pass

Invokes `meta/review-adversarial --target=<KB>/ARCHITECTURE.md --stage=knowledge-base --output-path=<KB>/_review/2026-04-29T16-00-00Z/adversarial-findings.md`.

Output:

```yaml
worst_severity: medium
severity_counts: { critical: 0, high: 0, medium: 4, low: 2 }
```

Verdict: PASS WITH OBSERVATIONS. User accepts. The findings flag four "ARCHITECTURE.md says 'the agent will figure out X' without specifying X" cases — the kind of hidden-assumption surfacing the lens is designed for.

### Sub-review 9 — review-edge-cases

Invokes `meta/review-edge-case-hunter --stage=knowledge-base`. Output:

```yaml
worst_severity: low
severity_counts: { critical: 0, high: 0, medium: 0, low: 3 }
```

Verdict: PASS.

### Sub-review 10 — review-kb-readiness

Reads all nine prior verdicts. Renders:

```markdown
# Readiness Verdict — Knowledge Base — 2026-04-29

**Verdict:** CONDITIONAL

## Conditions

1. 3 stale-marked component leaves accepted; tracked for next monthly maintenance pass.
2. 3 stylistic frontmatter violations (description missing "Use when" prefix) accepted; tracked.
3. 1 solution-context leaf over 120-day threshold; advisory only, tracked for next solution-context refresh.
4. 3 broken anchor links accepted; tracked for next maintenance pass.
5. 4 medium adversarial findings (ARCHITECTURE.md hidden assumptions) accepted for review at next ARCHITECTURE.md update.

## Recommendation

KB is healthy enough for continued use. Schedule a maintenance pass within the next 30 days to address conditions 1, 2, 4. Defer condition 3 to next solution-context refresh. Re-evaluate condition 5 at next major architecture decision.

## Next quarterly review

Schedule for 2026-07-29 or earlier if the KB sees a major change.
```

## How a clean run looks

If every sub-review returns PASS, the readiness verdict is APPROVED with no conditions, and a recommendation to maintain cadence.
