# Reuse Analysis — reference
The canonical checklist + AI-Gate prompt + decision table for the
KB-grounded reuse cross-check (`steps/02a-reuse-cross-check.md`).
This reference is consulted *during* Step 2a. The step file is the
procedural spine; this reference is the substance the agent applies.
---
## 1. The reuse checklist (per shareable artifact)
For every artifact the increment will create or modify, walk this
checklist in order. A checklist failure does not halt the increment —
it triggers a disposition decision (3 below).
### 1.1 KB lookup (when a KB exists)
- [ ] Invoke `navigate-knowledge-base --profile=test-suite` with the
      relevant `--profile-subkind` filter:
      - `shared-utilities` for utilities, assertion helpers, async helpers
      - `fixtures` for test-data builders, factories, seed-data sources
      - `feature-inventory` when checking whether a similar scenario
        already exists (rare but legitimate)
- [ ] Read the frontmatter of every returned component. Read the body
      only for components whose frontmatter suggests a real match.
- [ ] Capture the candidate list with component IDs, paths, and
      one-line "why this is a candidate" notes.
### 1.2 Codebase scan (always)
- [ ] Identify the repos to scan (only repos listed in `project.toml`'s
      repo list — never wander).
- [ ] Identify the directories *within* those repos where utilities of
      this type live (the team's conventions; ask the user once if
      unclear and remember for future runs).
- [ ] Build the search signature:
      - **Interaction-type tag** from the team's tag vocabulary in
        `automation-and-cicd`
      - **Input shape** — a sentence describing what the method takes
      - **Output shape** — a sentence describing what it returns or
        side-effects
      - **Naming neighbourhood** — package / module / file patterns
- [ ] Grep / read for matches. Read method bodies, not method names.
      *Comments lie. Code doesn't.*
- [ ] Capture matches with file path, line range, and one-line
      "why this matches" notes.
### 1.3 Semantic gap analysis (per candidate)
For each candidate from 1.1 + 1.2, answer:
- [ ] Does the candidate's behaviour cover the increment's need
      **exactly**? -> eligible for `Reuse as-is`
- [ ] If not exactly, can the candidate be **extended without
      breaking existing callers**? -> eligible for `Extend in place`
- [ ] If the candidate's behaviour is right but the interface is
      wrong, can a **thin adapter** make it usable? -> eligible for
      `Wrap with adapter`
- [ ] If none of the above, the artifact must be created new — record
      the rationale **specifically**, citing what the candidate
      cannot do and why extending / wrapping is unacceptable
### 1.4 Cost calibration
- [ ] For `Extend in place`: estimate how many existing callers would
      need to be revisited if the extension changed semantics.
      Greater-than-3 = consider `Wrap with adapter` instead.
- [ ] For `Wrap with adapter`: estimate the adapter's complexity.
      Greater than the artifact-being-wrapped = consider `Create
      new` (the adapter has become the artifact).
- [ ] For `Create new`: estimate the maintenance surface added.
      Record it.
---
## 2. AI-Gate prompt template
The exact prompt the agent renders in Step 2a.5. Substitute the
bracketed values; keep the structure.
```markdown
## Reuse Cross-Check — <artifact name>
**Increment:** TC-<project-code>-<nnn>
**Artifact:** <name and type — e.g. "WireEventPublisher (shared utility)">
**KB query:** <"navigate-knowledge-base --profile=test-suite --profile-subkind=shared-utilities" | "skipped — KB not configured" | "skipped — no test-suite components in KB yet (recommend reverse-engineer-test-suite)">
**Codebase scan:** <paths searched; N matches found>
### Candidates considered
| # | Candidate | Source | Match type | One-line rationale |
|---|---|---|---|---|
| 1 | <component or file path> | KB / codebase | exact / behaviour / interface-shape | <why this is a candidate> |
| 2 | ... | ... | ... | ... |
(If no candidates found, write: "**No candidates found.** Confirmed by KB query + codebase scan above.")
### Proposed disposition
**<Reuse as-is | Extend in place | Wrap with adapter | Create new>**
**Reasoning:** <2-4 sentences. For Create new, cite specifically what the existing candidates cannot do and why extending / wrapping is unacceptable.>
**Confidence:** <High | Medium | Low>
**Cost note:** <one line — callers impacted for Extend; adapter complexity for Wrap; maintenance surface for Create new>
---
Reply **APPROVED** to proceed with this disposition, propose an alternative (e.g. "Wrap @ <component>"), or ask for more evidence on a specific candidate.
```
The prompt is rendered **per shareable artifact** — never bundled.
---
## 3. Disposition decision table
The agent's first-pass decision rules. Use them to *propose* a
disposition; the user always has final say.
| Candidate found? | Candidate behaviour matches need? | Existing callers affected by extension | Adapter complexity | Proposed disposition |
|---|---|---|---|---|
| no | n/a | n/a | n/a | **Create new** (with explicit rationale) |
| yes (KB or code) | exact match | n/a | n/a | **Reuse as-is** |
| yes | needs minor behaviour addition | ≤ 3 callers, change is additive | n/a | **Extend in place** |
| yes | needs minor behaviour addition | > 3 callers, or change alters semantics | low | **Wrap with adapter** |
| yes | needs major behaviour addition | any | high | **Create new** (cite cost of extending / wrapping) |
| yes | right behaviour, wrong interface | any | low | **Wrap with adapter** |
| yes | right behaviour, wrong interface | any | high (adapter > artifact) | **Create new** (the adapter has become the artifact) |
**Tie-breaker:** when two dispositions look equally good, prefer the
one that grows the surface area least. Order from best to worst:
`Reuse as-is` > `Wrap with adapter` > `Extend in place` > `Create
new`.
**Default-to:** when in genuine doubt, **propose `Extend in place`**
and let the user redirect. Never default-propose `Create new` — that
disposition must be argued for, not defaulted to.
---
## 4. KB-empty fallback rules
When `navigate-knowledge-base --profile=test-suite` returns an empty
primary set (the KB has not yet ingested a
`reverse-engineer-test-suite` output):
1. **Surface the empty result explicitly** in the gate prompt
   (`KB query: skipped — no test-suite components in KB yet`).
2. **Recommend the path to enable KB grounding**: run
   `/reverse-engineer-test-suite` against the suite repo, then
   `/build-knowledge-base` or `/update-knowledge-base`.
3. **Do not skip the gate.** The codebase-grep scan from 1.2 still
   runs. The gate runs either way; it just runs slower / less
   accurately without the KB.
4. **Mark the disposition's confidence** as `Medium` at best — the
   absence of KB grounding means the agent may have missed
   higher-level reuse opportunities that only surface from the
   curated capability index.
---
## 5. Examples (illustrative)
### 5.1 Reuse as-is
> **Artifact:** A utility that waits for a Kafka topic message matching a predicate.
> **KB query:** Returned `<suite>/shared-utilities.md` row "`[WAIT] KafkaConsumerHelper.untilMatching(topic, predicate, timeout)`".
> **Codebase scan:** confirmed at `<repo>/.../KafkaConsumerHelper.java:142-178`.
> **Disposition:** **Reuse as-is.** Signature and behaviour match exactly.
> **Confidence:** High.
### 5.2 Extend in place
> **Artifact:** A test-data builder for a wire payload with a new optional `correlationId` field.
> **KB query:** Returned `<suite>/fixtures.md` row "`WireBuilder.aValidWire()` produces a wire without correlationId".
> **Codebase scan:** `WireBuilder` at `<repo>/.../WireBuilder.java` has 11 callers, all consume a `Wire` POJO; adding `withCorrelationId(String)` is additive.
> **Disposition:** **Extend in place.** New method is additive; 0 existing callers affected.
> **Confidence:** High.
### 5.3 Wrap with adapter
> **Artifact:** A test-step that asserts an HTTP 202 with `Location` header points at a saga endpoint.
> **KB query:** Returned `<suite>/shared-utilities.md` row "`HttpAssertions.statusAndHeader(status, headerName, predicate)`" — generic, behaviour matches.
> **Codebase scan:** confirmed; the generic helper is exactly right, but the increment's test reads naturally as `assertSagaAccepted(response)`.
> **Disposition:** **Wrap with adapter.** New method `assertSagaAccepted(response) := HttpAssertions.statusAndHeader(202, "Location", v -> v.startsWith("/sagas/"))`. Adapter is 2 lines.
> **Confidence:** High.
### 5.4 Create new (justified)
> **Artifact:** A page object for a brand-new dashboard screen introduced by INC-014.
> **KB query:** Returned 3 page objects — Login, Wires, Dashboard — none of which cover the new dashboard's components.
> **Codebase scan:** confirmed — no existing page object touches the new components; the increment introduces them.
> **Disposition:** **Create new.** No candidate exists; the dashboard is new in INC-014.
> **Confidence:** High.
> **Cost note:** +1 page object; will be the canonical source for the screen for future tests.
### 5.5 Create new (justified, harder case)
> **Artifact:** A confirmation-screen polling utility that waits for the success modal to render after a wire submit.
> **KB query:** Returned a generic `[WAIT] PageHelper.untilVisible(selector, timeout)`.
> **Codebase scan:** the generic helper exists; however the confirmation flow involves an iframe, a CSP nonce reload, and a 2-phase render. A thin adapter would have to encode all three; the adapter would become ~40 lines and would carry behaviour the generic helper doesn't.
> **Disposition:** **Create new.** `ConfirmationScreenPoller.untilSuccess(orderId, timeout)`. Adapter cost ~ artifact cost; the new utility is the right level of abstraction for the iframe / CSP / 2-phase behaviour.
> **Confidence:** Medium — keep an eye on this; if a second test needs the same poller, this disposition is vindicated.
---
## 6. Change-tracker integration
Step 5 (`05-status-update.md`) writes a per-increment row to
`change-tracker.md` whose **Reuse** column summarises the
dispositions taken during this gate. Format:
| Field | Value |
|---|---|
| Reuse | `<N> Reuse / <M> Extend / <K> Wrap / <L> Create new` (e.g. `2 Reuse / 1 Extend / 0 Wrap / 1 Create new`) |
The detailed per-artifact list lives in the increment's status entry
in `test-case-status.md` `Notes` column (or in `Notes` of the
ad-hoc dispositions block when the team does not use the TC-XXX
flow). Auditable; surfacable by `audit-quality-coverage`.
---
## 7. When the gate is not applicable
The cross-check still runs as a one-line skip note. The note must
explicitly state *why* — never silently omit. Valid skip reasons:
- "Artifact is a single-use feature/spec body — no shareable surface"
- "Artifact is a fixture-value refresh — not a new artifact"
- "Artifact is a build-file pin change — not a new artifact"
Any skip beyond these three categories must be a user-approved
override, recorded with the increment.
---
## 8. Anti-patterns to call out
- **The "we'll consolidate later" lie.** No team has ever consolidated
  duplicate utilities after the fact. The cross-check is the only
  time consolidation is cheap.
- **The "this is faster" trap.** Creating new is faster *for this
  increment*. Reusing is faster *for the suite over time*. The team's
  KPI is the second one.
- **The "I didn't know" excuse.** If the KB has the component and the
  agent didn't query it, that is a process bug — the gate exists to
  prevent exactly this.
- **The "subtle difference" excuse.** Most "subtle differences" are
  the agent not understanding the candidate. Read the body, ask the
  user, and if the difference really is irreducible, choose `Wrap
  with adapter` not `Create new`.