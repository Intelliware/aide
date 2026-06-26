---
slug: reuse-cross-check
sequence: 2.5
depends-on-prior: true
---
# Step 2a — KB-Grounded Reuse Cross-Check (AI Gate)
## Purpose
Before any artifact is written by Step 2, perform a **lateral-thinking
reuse pass**: identify every shared utility, fixture, builder, page
object, assertion helper, or step-definition that already exists in the
KB or the test suite and could be reused, extended, or wrapped instead
of duplicated.
Reuse failures — duplicate utilities, parallel fixtures, divergent
assertion helpers, near-identical page objects — are the **largest
single source of long-term test-suite rot**. Once duplicates land,
they survive forever because no single failure is bad enough to drive
the consolidation. This gate exists to stop the duplicate from being
written in the first place.
This step is an **AI Gate**: the executing agent must present its
reuse analysis to the user and obtain explicit approval of the
disposition (`Reuse` / `Extend in place` / `Wrap with a thin adapter`
/ `Create new`) before Step 2 may write any artifact.
The full checklist, AI-Gate prompt template, and decision rules live
in `references/reuse-analysis.md`. This step file is the procedural
spine; load the reference when actually performing the analysis.
## Procedure
### 2a.1 Decide whether the cross-check applies
Reuse cross-check applies whenever Step 2 is about to **create or
modify a shareable artifact**. Those artifacts are:
- Shared test utilities (producers, consumers, async / wait helpers,
  assertion helpers, navigation helpers, screenshot helpers)
- Test-data builders / factories / fixtures
- Page objects / component objects / screen objects
- Shared step-definitions / step-libraries
- Shared configuration (test profiles, runner settings)
- Marker / tag vocabulary (when introducing a new marker)
It does **not** apply when Step 2 is about to:
- Author a single-use feature / spec file body whose scenarios cannot
  be shared (the *step-defs* it calls are shareable; the spec text
  itself is not)
- Modify a fixture value (data refresh, not artifact creation)
- Modify a build-file pin (dependency bump, not artifact creation)
For each artifact in the increment's Implementation Plan / Artifact
Plan section, decide once whether the cross-check applies; record the
decision so Step 5 can show it in the change-tracker row.
### 2a.2 Query the knowledge base
If `{paths.knowledge_base_path}` is configured in `project.toml` and
the KB has been built (`build-knowledge-base` has run), invoke:
```
/navigate-knowledge-base --profile=test-suite \
  --profile-subkind=shared-utilities \
  --profile-subkind=fixtures
```
Use the increment's scope (TC ID, scenario description, application
component being tested) as the query.
The expected return is a ranked list of `kind: test-suite` components
produced by `reverse-engineer-test-suite` (typically the
`shared-utilities.md` and `fixtures.md` files of one or more suite
KB entries). Read the frontmatter and the top-N body rows; do not
load the whole component.
If the navigator returns an empty primary set (no test-suite
components in the KB yet), surface this explicitly:
> No test-suite KB components found. Reuse cross-check will fall
> back to direct codebase grep, which is slower and less accurate.
> Recommend running `/reverse-engineer-test-suite` against your test
> suite, then `/build-knowledge-base` or `/update-knowledge-base`,
> before continuing.
Ask the user whether to proceed with codebase-grep fallback or
pause to set up the KB.
### 2a.3 Scan the test suite (KB fallback / supplement)
Whether or not the KB returned components, perform a focused
codebase scan against the resolved test-suite repo from `project.toml`
(`[project.testing].qe_repo` when configured; otherwise the in-scope code
repo fallback).
The scan must be **type-based, not name-based** — duplicates rarely
share a name. Match on:
- **Interaction type** (e.g. `[WAIT]` / `[ASSERT]` / `[INPUT]`) — read
  the tag vocabulary pinned in `automation-and-cicd`
- **Input shape** (e.g. "a method that takes a JSON payload and
  publishes it" — search for that *behaviour*, not for `publish*`)
- **Output shape** (e.g. "a method that returns an
  `Optional<Confirmation>` when polling for an event")
- **Naming neighbourhood** — utilities live in the same packages /
  directories as the artifact you are about to write; scan those
  paths first
Cap the scan to the resolved QE repo or fallback code repo listed in
`project.toml`; do not traverse arbitrary paths or silently scan all repos.
### 2a.4 Decide the disposition
For each candidate match, the agent assigns one of four dispositions
(see `references/reuse-analysis.md` §3 for the decision table):
| Disposition | When to choose |
|---|---|
| **Reuse as-is** | An existing artifact does exactly what the increment needs, with no semantic gaps |
| **Extend in place** | An existing artifact does most of what is needed; missing behaviour can be added without breaking existing callers |
| **Wrap with a thin adapter** | An existing artifact does the heavy lifting but its interface is wrong for this caller; a thin shim makes it usable without invasive changes |
| **Create new (with rationale)** | No reusable artifact exists, OR existing artifacts cannot be reused / extended / wrapped without unacceptable cost — record the rationale explicitly |
The default disposition when in doubt is **Extend in place** (the
team can revisit later); the disposition the agent must work hardest
to justify is **Create new** (it is the only disposition that grows
the surface area).
### 2a.5 Present the AI Gate prompt
Render the canonical AI-Gate prompt from
`references/reuse-analysis.md` §2 (the "Reuse Cross-Check Report"
template). The prompt summarises every candidate considered, the
disposition the agent proposes, the rationale, and the call to
action:
> ## Reuse Cross-Check — <artifact name>
>
> **Increment:** TC-XXX-NNN
> **Artifact:** <name and type>
> **KB query:** <profile + subkind used; or "skipped — no KB">
> **Codebase scan:** <paths searched; matches found>
>
> ### Candidates considered
> | # | Candidate (KB component / file path) | Match type | Rationale |
> |---|---|---|---|
> | 1 | ... | ... | ... |
>
> ### Proposed disposition
> **<Reuse | Extend in place | Wrap with adapter | Create new>**
>
> **Reasoning:** <2-4 sentences>
>
> **Confidence:** <High | Medium | Low>
>
> ---
> Reply `APPROVED`, propose an alternative disposition (e.g.
> `Wrap @ <component>`), or ask for more evidence.
### 2a.6 Wait for explicit approval
This is the AI Gate. Step 2 may **not** write the artifact until the
user has approved the disposition (or supplied an alternative). The
approved disposition is recorded with the increment for Step 5's
change-tracker row (see §6 of `references/reuse-analysis.md`).
If the user asks for more evidence, fetch what was asked (component
body, source file, prior uses) and re-present the prompt. Do not
skip the gate by appealing to time pressure or "obvious" reuse.
### 2a.7 Record the disposition
Append a structured note to the running execution state:
```yaml
reuse_dispositions:
  - artifact: <name>
    disposition: <Reuse | Extend in place | Wrap with adapter | Create new>
    candidate: <KB component ID or file path; null for Create new>
    rationale: <2-4 sentences>
    confidence: <High | Medium | Low>
    user_response: <APPROVED | overridden — see notes>
```
Step 5 (status update) reads this list when writing the change-tracker
row; the row's `Reuse` column shows the per-artifact decisions for
audit.
## Common errors to avoid
- **Searching by name, not by behaviour.** Duplicates rarely share a
  name. The cross-check has to ask *what shape of work is being
  done?*, not *is there a method called `publishWire`?*.
- **Defaulting to `Create new`.** Every `Create new` grows the
  surface area for future maintainers. Make the agent justify it.
- **Skipping the KB query when a KB exists.** The whole point of
  `reverse-engineer-test-suite` + `navigate-knowledge-base
  --profile=test-suite` is to make this step fast and accurate. Use
  it.
- **Treating "no KB available" as permission to skip the gate.** The
  codebase-grep fallback still applies. The gate runs either way; it
  just runs slower without the KB.
- **Bundling several artifacts into one gate prompt.** Each
  shareable artifact deserves its own prompt with its own
  disposition. Mixing them produces compromise dispositions that
  satisfy no artifact well.
- **Re-running the gate when the increment's scope didn't change.**
  If the increment is being re-executed (e.g. after a Step 4
  user-override loop), the dispositions from the prior run still
  apply unless the user explicitly opens them up.
## Next
Proceed to `steps/02-implement-artifacts.md`. The dispositions
captured here drive how Step 2 writes each artifact:
- **Reuse as-is** -> Step 2 does not write a new artifact; it adds
  the import / reference and proceeds.
- **Extend in place** -> Step 2 modifies the existing artifact (and
  records the modification in the change-tracker scope for the
  artifact's owning component).
- **Wrap with adapter** -> Step 2 writes a thin adapter (whose
  Artifact Plan section the agent must propose to the user as a
  small inline amendment).
- **Create new** -> Step 2 writes the artifact as planned.