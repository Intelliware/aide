# Step 2 — Apply attitude lens

Goal: walk the target artifact applying the six attitude lenses in sequence; collect findings with severity, triage, evidence, and recommendation.

This is the LLM-driven analytical core of the skill. The other two steps are mechanical.

## Inputs

- The Step 1 record (`target_path`, `target_artifact`, `stage`).
- The full content of `target_path` (read once at the start of this step).
- For directory targets: also read the supporting sibling files identified in Step 1.1 as evidence — but findings cite only the canonical entry file.

## The six lenses (apply in order)

For each lens, walk the artifact end-to-end and emit a finding for every match. Don't stop at the first match per lens.

### Lens 1 — Weasel-word audit

Scan for unfalsifiable adjectives and qualifiers used about behaviour, performance, or quality, with no quantitative threshold attached:

- Performance words: `performant`, `fast`, `responsive`, `snappy`, `low-latency`, `high-throughput`, `efficient`, `scalable` (without scale numbers)
- Quality words: `robust`, `resilient`, `reliable`, `production-grade`, `enterprise-grade`, `industrial-strength`, `bulletproof`
- UX words: `easy to use`, `intuitive`, `seamless`, `frictionless`, `delightful`, `polished`
- Quantity words: `many`, `most`, `typical`, `usually`, `often`, `generally`, `commonly`, `industry-standard` (without citation)
- Scope words: `comprehensive`, `complete`, `full`, `total`, `end-to-end` (without explicit boundary)

For each match: cite section and line; severity by **load-bearingness** — appears in an acceptance criterion or load-bearing requirement = `critical` or `high`; appears in a preamble / non-functional aside = `medium` or `low`.

### Lens 2 — Hidden-assumption hunt

For each major claim, ask: **what would have to be true for this claim to hold?** If the answer isn't stated in the artifact, it's a hidden assumption.

Common patterns:

- "Support all current devices" — assumes a device list and traffic distribution
- "Integrate with the partner API" — assumes uptime, rate limits, auth model, schema stability
- "Reuse the existing tax calc service" — assumes capacity, latency budget, contract stability
- "Idempotent retries" — assumes specific failure modes that are retryable
- "Backwards compatible" — assumes a definition of compatibility

Severity by impact: contradicts a stated requirement = `critical`; load-bearing for design = `high`; advisory = `medium`.

### Lens 3 — Unsupported-claim audit

For every assertion in the artifact, check whether it has internal evidence:

- A link to a doc, ADR, or external standard
- A data point or measurement
- A reference to an upstream artifact (analysis baseline, prior decision)
- A rationale paragraph

Findings of "industry standard X without citation", "we know users want Y" without research, "this performs well" without benchmark, "team agreed Z" without ADR. Severity by load-bearingness.

### Lens 4 — Missing-stakeholder check

Stage-specific list of stakeholders typically impacted by an artifact at this stage:

- Requirements: product, eng leads, ops/SRE, security, data, finance, legal, customer-success, partner integrators, mobile/desktop owners
- Design: above + ML/data platform owners, accessibility lead, on-call lead, dependent-team leads
- Planning: above + delivery owners for each downstream system
- Execution: above + tech writers (docs), translators (i18n)
- RE: source-repo maintainers, downstream consumers
- KB: every team that owns a `[[project.repos]]` entry
- Quick-dev: minimal — feature owner + reviewer

For every requirement / decision in the artifact, check whether the impacted stakeholders are named in the stakeholder list. Severity = `high` for unnamed direct-impact stakeholders; `medium` for indirect.

### Lens 5 — "Good news only" framing

Look for sections that should contain risk / failure-mode / alternatives content:

- Risk register present? Number of risks vs. expected for an artifact this size? Mitigation specificity?
- Alternatives-considered section in ADRs? More than one alternative?
- Failure modes addressed in design choices? Or only happy path?
- Competitor / prior-attempt analysis included?

Severity = `high` for absent risk register or single-mitigation-style risks; `medium` for shallow analysis.

### Lens 6 — Scope-inflation / -ambiguity

- Forward references that aren't enumerated: "Phase 2", "future work", "later iteration" — without explicit content.
- Out-of-scope items mentioned but not made firmly out-of-scope.
- In-scope items that quietly expand (e.g. requirement that says "checkout flow" but acceptance criteria touch payment, tax, and shipping).
- Vague ownership boundaries: "the team will handle X" without team named.

Severity by historical risk: prior packages from this team / repo with similar ambiguity → `high`; one-off → `medium`.

## Severity calibration (apply across all lenses)

The severity bar is intentionally conservative. Re-read each finding before confirming severity.

- `critical` — fact-level defect; if it ships unchanged, downstream skills will produce wrong outcomes. Examples: an acceptance criterion that cannot be tested; a hidden assumption that contradicts a requirement; a missing stakeholder who owns the system being relied on.
- `high` — significant risk; address before handoff. Examples: weasel words in acceptance criteria; missing direct-impact stakeholder; shallow risk register.
- `medium` — worth surfacing; not blocking. Examples: weasel words in non-load-bearing prose; minor unsupported claim; vague Phase-2 reference.
- `low` — minor / advisory. Examples: stylistic weasel words in headers or preamble.

## Triage assignment

Per finding, recommend a triage. Map by default:

- `critical` → `must-fix`
- `high` → `should-fix`
- `medium` → `consider`
- `low` → `wont-fix` (acknowledge but don't act)

Override only when a high finding is severe enough to be critical-equivalent in spirit but technically scored `high` (e.g. a single weasel word in *every* acceptance criterion). In that case set triage to `must-fix` even though severity is `high`.

## Stage-emphasis weights

If `stage` is set, emphasize the lenses listed in `references/OVERVIEW.md` § Stage-specific specializations. Emphasis means: spend more attention on those lenses; **do not** skip the others.

## Cap at `--max-findings`

If total findings exceed `--max-findings` (default 50), keep the highest severities and note truncation in the body's "All findings" section header: `(truncated to top 50 by severity; <N> additional findings omitted)`.

## Output of this step

An in-memory list of findings:

```yaml
findings:
  - id: ADV-001
    severity: critical
    triage: must-fix
    category: Weasel word
    one_line: '"performant under typical load" — neither term is defined'
    evidence: 'requirements-package.md § 4.2, line 87'
    risk: 'untestable; will pass review-measurability vacuously'
    recommendation: 'P95 < 250ms at 500 concurrent users'
    is_critical_section: true
  - id: ADV-002
    ...
```

`is_critical_section: true` flags findings that need a "Critical findings (claim vs counter)" entry in Step 3. All `critical` findings get one; `high` findings with `triage: must-fix` also get one.

This list feeds Step 3.
