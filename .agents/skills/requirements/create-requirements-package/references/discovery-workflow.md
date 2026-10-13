# Discovery Workflow

Folded from `model-2-sdlc-skills/requirement-package/requirements-discovery/references/discovery-workflow.md`. Run as Step 1 of `create-requirements-package` (brownfield mode only).

## Purpose

Define the entry-point sequence for a brownfield feature: the BA/PO's discovery skills are sequenced so the AI reads the existing system and the knowledge base first, then asks the BA/PO targeted questions only about gaps. Produces a unified `current-capability-baseline.md` that feeds analysis (Step 3) and the requirements writing step (Step 4).

## Sequential execution rule

Before each sub-step, ask the user whether the sub-step applies. If they say "Skip" or "No (with reason)", record the outcome and proceed to the next sub-step. Do not assume relevance.

**Execute one step at a time. Do not pre-read all reference files before starting.**

After each sub-step:
1. Produce the output artifact in full (plain, non-technical language for the BA/PO to review).
2. Present the artifact to the BA/PO.
3. Wait for acknowledgement before reading the next reference file.

DO NOT:
- Pre-read all reference files and execute from memory.
- Skip a sub-step because "the questions answered it."
- Proceed to requirements-elicitation before sub-steps 1–4 are complete.
- Begin Step 3 (Analysis) before the current-capability-baseline from sub-step 6 is presented and acknowledged.
- Proceed past sub-step 0 without an explicit, confirmed feature request description.

If a sub-step's output cannot be produced (e.g., no documentation exists for sub-step 2), explicitly state that, write a minimal artifact recording what was found, present it, and proceed.

## Sub-step 0 — Capture the feature request (hard gate)

Ask the user for the feature request. The description must identify:
- **Who** — the user, role, or system actor affected
- **What** — the action, capability, or behaviour being added or changed
- **Why** — the intended outcome or business goal

Present these three explicitly and ask the user to provide them. Do not infer from context.

If incomplete, identify which of the three is missing and ask for it specifically.

Once confirmed, record as a single Change Description: *"[Who] needs to be able to [what] so that [why]."*

Present and ask: *"Is this an accurate description of what you want to build?"* Wait for confirmation. If they correct it, update and ask again.

Write to `{paths.requirements_package}/<feature-id>/discovery/change-description.md`. The file write must succeed before sub-step 1 starts. Containing:
- The confirmed Change Description statement
- The three elements separately: Who / What / Why

This file is the anchor for every subsequent step — every discovery activity, every elicitation question, every analysis artifact, the requirements package itself.

## The sequence

| # | Sub-step | Output | Key rule |
|---|---|---|---|
| 0 | feature-request capture | `change-description.md` | All three elements (who/what/why) confirmed and written before sub-step 1 |
| 1 | codebase-discovery | `codebase-discovery.md` | Plain-English business capability inventory — no technical language in output |
| 2 | existing-artifact-review | `existing-artifact-review.md` | Flag what is current, what is outdated, what conflicts with the system |
| 3 | process-mapping | `process-map.md` | Derive as-is workflows from system+docs; BA/PO confirms before elicitation |
| 4 | user-journey-mapping | `user-journey-map.md` | Derive journeys from interface evidence; BA/PO marks where the change lands |
| 5 | requirements-elicitation | `requirements-elicitation.md` | One question at a time; only ask what the system+docs cannot answer |
| 6 | current-capability-synthesis | `current-capability-baseline.md` | Write file first, then present and wait for acknowledgement |

## Why this order

- **Sub-steps 1–2 (system + docs) before 3–4 (process + journey maps):** Process and journey maps are derived from the system and its docs. The AI builds them from evidence — the BA/PO is not asked to explain what the system already shows.
- **Sub-steps 3–4 before 5 (elicitation):** Elicitation is targeted because the AI already knows what the system does. Each question traces to a specific gap.
- **Sub-step 5 before 6 (synthesis):** Confidence ratings in the baseline depend on what was stakeholder-confirmed vs. AI-inferred. Elicitation confirms before synthesis locks them in.
- **Sub-step 6 last:** Synthesis assembles all prior outputs into one coherent baseline.

## Knowledge base integration

When `project.paths.knowledge_base_path` is set, query the KB via `knowledge-base/navigate-knowledge-base` before reading source repos directly. The KB encodes synthesized truth at the component-id level; raw repos are the fallback when the KB is silent.

For each affected area:
1. Resolve the change description against the KB's Capability Index (in `ARCHITECTURE.md`) → list of `component_id`s.
2. Read the matched components' `.md` files in `components/<repo>/<id>.md`.
3. Cross-check `last_verified_against_commit` against `staleness_warning_days` (`framework.toml`); if stale, flag in `existing-artifact-review.md`.

## Entry criteria

- [ ] AI has read access to the existing system (project repository or codebase)
- [ ] (Optional) KB exists and is reachable

Sub-step 0 captures the feature request — do not require it upfront.

If the AI does not have access to the existing system, sub-step 1 cannot run; record the gap, base subsequent sub-steps on the KB and elicitation, treat all system claims as assumptions.

## Exit criteria

- [ ] `change-description.md` written and acknowledged
- [ ] All six sub-steps executed in sequence
- [ ] `current-capability-baseline.md` written and acknowledged
- [ ] All confirmed requirements from elicitation recorded
- [ ] Open questions logged with interim assumptions and owners

## Failure modes this prevents

| Failure mode | How the sequence prevents it |
|---|---|
| BA/PO asked to explain the whole system from scratch | Sub-steps 1–4 build the system picture first |
| AI assumes existing-system behavior and designs against it | Sub-step 5 confirms assumptions before they enter the baseline |
| Downstream consumers receive five disjoint discovery docs | Sub-step 6 assembles one coherent baseline |
| Requirements contradict settled prior decisions | Sub-step 2 surfaces them; sub-step 6 prevents contradiction |
| Elicitation lacks focus | Sub-steps 1–4 narrow what is truly unknown |
| Team builds on fragile foundations unknowingly | Sub-step 6 catalogues known issues and uncertainty in the change area |

## Phase handoff

After `current-capability-baseline.md` is complete and acknowledged, return to `SKILL.md` Step 2 (relevance gate), then proceed to `steps/03-analysis.md`.
