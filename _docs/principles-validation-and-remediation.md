# Principles Validation & Remediation

**Status: BACKLOG — not yet handled.** This document records an audit and a proposed
remediation plan. Nothing below has been implemented. No skill, template, or script
has been changed as a result of this document; treat every "Remediation" item as an
unscheduled candidate, not a committed roadmap.

Audited: `main` @ `5f8684d` (v2.2.0), 2026-08-17. Read-only review — no framework files
were modified to produce these findings.

## Why this exists

A.I.D.E. is one implementation of the broader "Spec-Driven Development" (SDD) pattern
shared by Spec-Kit, Kiro, and BMad. This audit checks A.I.D.E.'s own skills (under
`.agents/skills/`, not the reference-only `.claude/skills/bmad-*` methodology) against
eight principles common to that class of framework, to find where A.I.D.E. matches the
pattern, where it diverges, and what closing each gap would take.

## Summary

| # | Principle | Verdict |
|---|---|---|
| 1 | Specifications are durable artifacts, not throwaway prompts | Partially aligned |
| 2 | Phased workflows with discrete artifacts at each phase | Aligned |
| 3 | Separation of "what and why" from "how" | Aligned (minor exceptions) |
| 4 | Humans decide, AI agents implement | Aligned |
| 5 | End-to-end traceability | Partially aligned |
| 6 | Review gates between phases | Aligned |
| 7 | Non-negotiable principles get codified | **Not aligned** |
| 8 | Structured natural language as the spec medium | Aligned |

Five of eight are solidly realized. The two "partially aligned" verdicts are each
missing one link in an otherwise-strong chain. Principle 7 is the one substantive gap
and should be treated as the priority item if this backlog is ever picked up.

---

## Principle 1 — Specifications are durable artifacts, not throwaway prompts

**Verdict: Partially aligned.**

Evidence for:
- Every `create-*` skill is bound to `references/ai-principles/write-discipline.md`
  (cited in each `SKILL.md`'s `## Preconditions`, enforced by `scripts/validate.py`
  Check J). It mandates write-to-disk-immediately, a post-write read-back, and a
  closing inventory check that halts the skill if an expected artifact is missing.
- Artifacts land under `{project-root}/.framework-output/<stage>/` and
  `docs/<feature>/...` inside the real project repo. Root `.gitignore` has no rule
  excluding `.framework-output/`, `docs/`, or `specs/`.

Gap:
- Nothing in `AGENTS.md`, `README.md`, or any skill instructs that generated packages
  must be **committed** or routed through a **PR**. `execution/create-pr` is
  code-diff-scoped only — it reads the spec to check the diff against it, but never
  opens a PR for the requirements/design/plan package itself. Durability-on-disk is
  enforced; durability-in-git-history-with-team-review is assumed, not scaffolded.

Remediation:
- Add an explicit line to `write-discipline.md` or `AGENTS.md`: generated packages
  under `.framework-output/`/`docs/<feature>/` must be committed, not left untracked.
- Consider having the readiness-gate skills (`review-requirements-package`,
  `review-design-package`, `review-implementation-package`) optionally open/update a
  PR at their GO verdict, so the review that already happens in-chat also leaves a
  durable, team-visible record. This would also strengthen Principle 6's audit trail.

## Principle 2 — Phased workflows with discrete artifacts at each phase

**Verdict: Aligned.**

Evidence:
- `.agents/skills/_registry/workflow-graph.yaml` hard-codes three flows
  (greenfield/brownfield/quick-dev), each a strict phase sequence with
  `gates: required: true` on every major transition.
- Every phase emits a distinct, named artifact via composition manifests
  (`requirements-package.md`, `design-package.md`, `INC-XXX.md` — 8-section canonical
  shape). Even quick-dev keeps spec/plan/execute as three separate artifacts/skills.
- Phase-skipping is structurally blocked by handoff gates, not just discouraged in
  prose — e.g. `review-implementation-package/SKILL.md`: "Any unresolved
  `[NEEDS CLARIFICATION]` marker is an automatic NO-GO."

No material gap. Caveat (shared with 4, 6, 7): "structurally blocked" means "the LLM
is instructed to halt," not "the tooling makes it impossible" — see the cross-cutting
note below.

## Principle 3 — Separation of "what and why" from "how"

**Verdict: Aligned, with two minor documented exceptions.**

Evidence:
- `templates/blocks/requirements/index.md:14`: *"What this package is NOT: This is not
  a Solution Design document... If it would change during a rebrand or technology
  migration, it does not belong here."*
- A dedicated review sub-check, `review-implementation-leakage`, exists solely to
  catch spec/plan boundary violations.
- Design/planning templates are unambiguously implementation-scoped (pinned versions,
  architecture diagrams); plans must reference FRs/design elements rather than
  restate them (`review-implementation-package` runs FR-coverage and design-coverage
  checks specifically to catch invented or leaked content).

Nuances (not violations):
- `assumptions-constraints-out-of-scope.md` §12.2a ("Solution Constraints")
  deliberately embeds technique-level guardrails (forbidden dependencies, required
  patterns) inside the spec artifact — justified as preventing silent drift, but it is
  technique content living in the "what" document.
- Only the requirements block set has an explicit "what this package is NOT" guard.
  Design and planning have no reverse guard document — the boundary is enforced
  one-directionally by name.

Remediation:
- Add a short symmetric boundary clause to the design and planning template indexes
  (e.g., "not a place to restate business justification or write new requirements").

## Principle 4 — Humans decide, AI agents implement

**Verdict: Aligned.** No gap found.

Evidence:
- `references/elicitation-patterns/architecture-discovery.md` and
  `technology-stack-selection.md` force multiple-choice-plus-justification questions
  to the human for architecture pattern and every technology choice, with validation
  rejecting vague answers ("`latest` is not a version").
- `create-design-package/references/process.md:46`: *"If a new design decision cannot
  be traced, flag it and confirm with the user before inclusion."*
- No instruction anywhere grants the agent autonomous authority over architecture or
  stack choices.

## Principle 5 — End-to-end traceability

**Verdict: Partially aligned.**

Evidence for:
- A closed, mandatory ID schema (`references/traceability/README.md`) —
  `FR`/`NFR`/`BR`/`UJ`/`DR`/`AC`/`DES`/`ADR`/`INC`/`IMP`/`TC`/`KBC`/`BUG`/`CR` — governs
  requirement → design → increment → commit (footer: `Implements: INC-XXX`,
  `Traceability: FR-A.B.C`) → test case.
- Coverage gaps (`gap_unverified`) are hard gates, not warnings.

Gap:
- The prefix table is closed by design: *"These are the only prefixes the framework
  recognises. New prefixes require an ADR; do not invent ad-hoc."* There is no prefix
  for business objectives/KPIs or compliance constraints — the exact content
  `capture-solution-context` produces in `20-goals-and-kpis.md` and
  `30-constraints-and-compliance.md`. The requirements traceability matrix's own
  `source-id` is defined as "typically a stakeholder need" — prose, not a resolvable
  ID. A production bug traces backward cleanly to an FR and a commit, but the FR does
  not trace forward, by ID, to the business/compliance justification that mandated
  it — the one hop Principle 5 explicitly names.

Remediation (schema extension, not new data collection — the content already exists):
- Add `BIZ-X` (business objective/KPI) and `COMP-X` (compliance constraint) prefixes
  via the framework's own required ADR process.
- Extend the requirements traceability matrix's `source-id` column to accept these IDs.
- Add a coverage check (mirroring the existing FR→INC "or `None (foundational)`"
  pattern) requiring non-foundational FRs to cite a `BIZ`/`COMP` id.

## Principle 6 — Review gates between phases

**Verdict: Aligned.** Best-realized principle in the audit; no gap found.

Evidence:
- Every transition in every flow — including quick-dev, the lightest path — has a
  named, explicit wait-point: package-level GO/NO-GO verdicts, per-increment Human
  Gates (`execute-increments/steps/04-human-gate.md`: *"Wait for user response. Do not
  infer answers. Do not proceed."*), a Completion Confirmation Gate that "cannot
  self-close," and `create-pr`'s commit/PR-creation gates.
- No global auto-approve flag exists. The one config knob that toggles gate mode
  (`re_verification_gate`) is scoped only to reverse-engineering doc close-out, and
  even its "automated" setting refuses to let the AI self-certify judgment-tier
  checks — unattended runs left on "ask" fail fast rather than defaulting to
  autonomous.

Note (enhancement, not a compliance gap): BMad's `bmad-checkpoint-preview` offers a
curated, sequenced walkthrough UX (grouping a diff into "concerns," ordering stops for
comprehension) that AIDE's own gates lack an equivalent of. AIDE's gates ask for
approve/reject against a findings list; they don't curate what order a human reads the
underlying diff in. Worth considering as a pattern to port, not required for alignment.

## Principle 7 — Non-negotiable principles get codified

**Verdict: Not aligned. The one substantive gap in this audit.**

Verified directly: no file or concept named "constitution" exists anywhere in the
repo, and "SAGE" (cited as an existing pre-commit-linter pattern) does not appear
anywhere in this codebase either — not present, not referenced, not aspirational.

Three partial analogs exist, none of which satisfies the principle:

1. **`references/ai-principles/README.md`** — self-describes as constitution-like
   ("operational constraints baked into how each skill is authored, validated, and
   run") and claims enforcement via `validate.py`. Verified: zero skills anywhere
   reference this file. Its claimed enforcement doesn't hold up either — the checks it
   cites validate unrelated structural hygiene (SKILL.md phrasing, stale vocabulary),
   not its own numbered principles. This is worse than a gap: it's documentation
   asserting enforcement that does not exist.
2. **`write-discipline.md`** — genuinely wired (all three `create-*` skills cite it;
   `validate.py` Check J hard-fails if the citation is missing) — but it governs
   file-persistence *process*, not substantive project/engineering rules.
3. **`project-context.md`** (from `generate-ai-rules`) — AIDE's self-identified answer
   to "codify once, inherit everywhere," explicitly modeled on BMad's equivalent. But
   it's read only conditionally ("if present") by `create-pr` and quick-dev's plan
   step, and **zero references exist in the three primary package-authoring skills**
   (`create-requirements-package`, `create-design-package`,
   `create-implementation-package`) — exactly where non-negotiable rules would need to
   apply to stop a violation from being drafted in the first place.

No commit-time or CI backstop exists anywhere: confirmed no `.github/workflows/`, no
`.pre-commit-config.yaml`, no active `.git/hooks/*`, no `.claude/settings.json`. The
only automation, `scripts/validate.py`, is manually run per the README's own
maintenance instructions — nothing forces it pre-commit or in CI.

For contrast (BMad is explicitly reference-only per this repo's `CLAUDE.md`, not part
of A.I.D.E., but instructive): every BMad agent/skill's `customize.toml` ships a
default `persistent_facts = ["file:{project-root}/**/project-context.md"]`,
auto-loaded into every skill's context out of the box, durable across framework
updates ("DO NOT EDIT — overwritten on every update"). That's the shape AIDE's own
mechanism is reaching for but doesn't yet achieve.

Remediation (highest priority in this document):
1. Pick one canonical file (formalize `project-context.md`, or a new
   `principles.md`) as *the* non-negotiable-principles artifact.
2. Make it a mandatory `## Preconditions` citation in the three primary `create-*`
   skills, exactly like `write-discipline.md` today, and add a `validate.py` Check K
   mirroring Check J to keep it from decaying.
3. Either wire `ai-principles/README.md` into real enforcement or rewrite it to stop
   claiming enforcement it doesn't have.
4. Ship an optional pre-commit/CI template that at minimum runs `validate.py`, and
   ideally lints against the structured rows already captured in §12.2a Solution
   Constraints (`forbidden-technique`, `required-pattern`) — that table is real
   structured data sitting unused as a lint source.
5. Resolve the "SAGE" naming question: clarify whether it's a planned Electric Mind
   capability A.I.D.E. should adopt, or a separate product — it was cited as an
   existing enforcement pattern and isn't present here.

## Principle 8 — Structured natural language as the spec medium

**Verdict: Aligned.** No gap found.

Evidence:
- 374 markdown files under `.agents/skills/` with zero non-markdown content files;
  465 markdown vs. 37 YAML under `templates/` (the YAML is composition manifests —
  schema/config, not spec content, the same role as Spec-Kit's own template config).
- The few JSON/TOML artifacts found (`program-data-bindings.json`, `kb-graph.json`,
  `project.toml`) are auxiliary machine-readable side-data or config, clearly
  distinct from deliverable content, which is uniformly markdown + YAML frontmatter.

---

## Cross-cutting caveat (applies to Principles 2, 4, 6, 7)

Every enforcement mechanism in this framework — halt-on-NO-GO, wait-for-human-gate,
cite-the-precondition — is prose instructing the executing LLM, checked at most by
`scripts/validate.py` against the framework's own shipped skill *definitions* (not
against a live session's actual behavior). There is no OS-, git-, or CI-level backstop
that stops a mis-instructed or non-compliant agent run from skipping a gate. This is
common across SDD tooling generally, not unique to A.I.D.E., but it's why Principle 7
matters most: it's the principle that explicitly calls for moving enforcement out of
prose and into commit-time tooling, and A.I.D.E. already has the structured data
(Solution Constraints, the traceability schema) to do that without having built the
linter yet.

## Scope notes

- `generate-re-skill` (present on `feature/re-skill-generator`, not on `main`) was out
  of scope for this audit. On `main`, `analyze-repository` has no escape hatch for a
  tech stack outside its 11 known domains — not a principle violation, just a gap this
  audit didn't need to cover since the skill isn't shipped yet.
- **Incidental finding, same failure pattern as Principle 7:** `.agents/skills/README.md`
  lines 34–43 ("Host discovery (slash commands)") describes an abandoned design — a
  script (`scripts/build-skill-shims.py`/`.js`) "invoked automatically by the registry
  build," producing shims that are "gitignored." Verified both claims are stale: that
  script does not exist under `scripts/` (only `build-registry.*` and `validate.*`
  do), and root `.gitignore` has no shim-related rule. The more detailed and
  authoritative `.agents/skills/_registry/SHIMS.md` documents the actual current
  design (script-free; shims are generated by hand by whatever coding agent runs the
  `INSTRUCTIONS.md` install runbook, written only into a *consuming* project's
  workspace root, never into this repo). This is a second, independent instance of
  "documentation asserts a mechanism that isn't real" — worth a one-line fix
  (update or delete `.agents/skills/README.md:36-43` to match `SHIMS.md`) whenever
  this backlog item is picked up.

## Suggested priority order

1. **P0 — Principle 7**: canonical principles file, made mandatory in the three
   `create-*` skills, backed by a `validate.py` check.
2. **P1 — Principle 5**: add `BIZ-X`/`COMP-X` traceability prefixes and a coverage
   check.
3. **P1 — Principle 1**: explicit commit/PR instruction for generated packages.
4. **P2 — Principle 3**: symmetric boundary guards on design/planning templates.
5. **P2 — doc hygiene**: fix the stale shim-discovery section in
   `.agents/skills/README.md`.
6. **P3 — strategic**: a real pre-commit/CI enforcement layer, which would
   retroactively strengthen Principles 2, 6, and 7 all at once.

## Status

Nothing in this document has been actioned. No increment, ADR, or skill change exists
yet for any item above. This is parked here so the analysis isn't lost between
sessions — treat it the same way `_docs/exploration-queue.md` treats an open item: it
stays until someone runs it through the framework's own flow (e.g. as a quick-dev
change per remediation item, or a proper increment set for the P0 item) and marks it
done here with a pointer to where the work landed.
