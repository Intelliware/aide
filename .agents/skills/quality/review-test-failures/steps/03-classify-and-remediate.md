---
slug: classify-and-remediate
sequence: 3
depends-on-prior: true
---

# Step 3 — Classify and Remediate (Per Failure)

## Purpose

For the failure currently in focus (presented by Step 2), assign a
category from the failure-categories taxonomy, propose a concrete
remediation routed to a named framework skill, and obtain explicit
user approval before recording the verdict.

## Procedure

### 3a. Match against the taxonomy

Apply the failure-categories taxonomy in this order:

1. **Team override.** If the project has shadowed the taxonomy under
   `templates/blocks/quality/_user/failure-categories.md` or via
   `config/customizations/review-test-failures.toml`, use that.
2. **Quality-package block.** If the quality package included the
   `quality/failure-categories.md` block (assembled per the team's
   composition), use that.
3. **Framework default.** Fall back to
   `references/failure-categories.md`.

For each category, match the failure's:
- Error message (full first line + up to 3 lines of context)
- Failed step / assertion text
- Stack trace (if present)
- Log excerpt around the failure
- Screenshot context (rendered? blank? partial?)

against the category's signature. The first match wins; if multiple
match, present the candidates to the user.

### 3b. Cross-reference the KB

If a KB is configured, look up the component(s) referenced in the
failure (scenario name, locator, fixture, page-object). Use the KB
to:

- Confirm whether the locator / fixture / contract documented in the
  KB matches what the test expects
- Surface any recent changes that landed since the last green run
- Identify known issues recorded against the component (e.g. flaky-
  area history)

If no KB is configured, search the test-suite repo directly for the
relevant artifact (the shared selector source, the fixture file,
the shared step-definition). Prefer `[project.testing].qe_repo` when it is
configured; otherwise use the in-scope code repo fallback. Cap the search to
that resolved repo; do not traverse arbitrary paths or silently scan all
repos.

### 3c. Compute disposition + routing

Every category maps to exactly one of four dispositions and one
routing target:

| Disposition | Routing target (default) |
|---|---|
| Script issue | `execute-quality-increments` (TC flow) or `execute-increments` (inline tests). Choose based on whether the team uses the TC-XXX flow. |
| Application defect | `manage-bugs` |
| Environment / data | Recommend environment fix; if recurring across runs, route to `manage-bugs` as an environment-issue bug |
| Flaky / non-deterministic | `execute-quality-increments` (harden the test). Never silently retry. |

If the team has overridden the routing target in
`config/customizations/review-test-failures.toml`, use that instead.

### 3d. Present classification + remediation

Render to chat:

```markdown
### Classification

**Category:** <category name>
**Disposition:** <Script issue | Application defect | Environment / data | Flaky>
**Confidence:** <High | Medium | Low>

**Reasoning:**
<2–4 sentences explaining the match, citing the specific evidence
that drove it. Reference KB component names or codebase paths when
relevant. State explicitly which signature(s) matched.>

### Proposed remediation

**Action:** <one-line summary>
**Routing:** `/<skill-name>` (with concrete inputs the downstream
skill needs)
**Details:** <2–4 sentences with the specific fix or investigation
to perform>

**Confidence checks:**
- [ ] Evidence sufficient? <yes / no — what's missing>
- [ ] Alternative categories ruled out? <yes / which>
- [ ] Routing target appropriate? <yes / why this target>

---
Do you agree with this classification? Reply APPROVED, propose an
alternative cause, or ask for more evidence.
```

### 3e. Handle user response

- **APPROVED** → record the verdict (category, disposition, routing,
  approved-as-presented). Return control to Step 2 (advance loop).
- **Alternative cause provided** → record the user's category +
  disposition + remediation (mark as `user-override`). Return
  control to Step 2.
- **More evidence requested** → fetch what was asked (log lines,
  source file, KB component body, prior-run history), re-present,
  loop back to 3a if the new evidence changes the analysis.
- **Reclassification requested** → re-run 3a with the user's hint
  (e.g. "I think this is actually a timing issue"). Present the
  revised classification. Wait for approval.

Never advance to the next failure without explicit `APPROVED` or
`user-override`.

### 3f. Confidence handling

- **Low confidence** → present **two** candidate classifications, with
  evidence for each, and ask the user to pick. Do not guess.
- **No confident match at all** → say so plainly:

> No category matches this failure cleanly. The evidence suggests
> either <X> or <Y>. Possible reasons: <list>. How would you like
> to classify it?

Record the user's choice with `confidence: low — user-judged`.

### 3g. Append to the running summary

After approval, append a row to the running summary table that
Step 2 maintains:

| # | Scenario | Category | Disposition | Cause | Routing | Status |
|---|---|---|---|---|---|---|
| N | … | … | … | … | `/<skill>` | Approved / user-override |

## Next

Return control to `steps/02-walk-failures.md` for the next failure.
After the loop closes, Step 2 advances to `steps/04-final-summary.md`.

