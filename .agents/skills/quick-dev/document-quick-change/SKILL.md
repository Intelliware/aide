---
name: document-quick-change
description: "Use when the user says \"quick change\", \"small change\", \"fast-track this\", \"expedited spec\", \"write a change spec\", or \"document a small fix/feature\" and the change does not warrant a full requirements + design package. Captures one combined lightweight spec (mini-requirements + mini-design in a single artifact) per `templates/compositions/quick-dev-spec.yaml`. First of three quick-dev skills."
---

# Document Quick Change

## Overview

Captures a small-to-medium change as a single combined lightweight spec — mini-requirements + mini-design in one artifact — so the developer can move to a lightweight plan and execution without authoring a full requirements package and design package. The spec is the source of truth for the rest of the quick-dev flow.

Derived from the legacy `expedited-implementation-package`'s change-spec step and built against `templates/compositions/quick-dev-spec.yaml` (overview, FRs, ACs, glossary, change log).

## When to use

- Small-to-medium change that does not need separate requirements + design packages
- Developer can describe the change in a few sentences
- No new data models, complex API endpoints, or architectural decisions
- No cross-team coordination needed
- The user asked for "expedited", "quick", "fast-track", or "small change"

## When NOT to use

- Change touches many files across module boundaries — switch to the full pipeline (`create-requirements-package` → `create-design-package` → `create-implementation-package`)
- Requires new data models or new API endpoints — full pipeline
- Needs architectural decisions or BSA/architect input — full pipeline
- High risk or high ambiguity — full pipeline
- A change spec already exists — use `plan-quick-change` directly

## Inputs

See `references/INPUTS-OUTPUTS.md`.

## Precondition — active feature

Follow `references/ai-principles/feature-precondition.md` Mode A, before step 1. If `features.toml` is absent, skip feature resolution: determine the change's `<name>` as step 1 describes below. Either way, write paths follow that file's *Quick-dev layout*, not the § *Not opted in* table. If present and `[user].active_feature` does not resolve, halt and invoke `select-feature` (`caller: document-quick-change`, passing the user's description if one exists this turn) rather than inventing a feature ID or slug. If it resolves, the resolved feature ID **is** the feature folder for step 1 — do not separately infer a kebab-case name.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

1. **Resolve feature folder** — the folder is the registry's feature ID, already resolved by the precondition above; read it rather than inferring one. **Not opted in** (no `features.toml`): reuse an existing folder for this change if one exists, otherwise infer a kebab-case `<name>` from the user's description and confirm it. Then run the precondition's *Quick-dev layout* legacy-tree check, which halts to ask when this change's files already sit in `docs/<name>/quick-dev-package/` or a 2.7.0 quick-dev directory. The spec's directory is resolved at step 7, once the spec names the repositories the change touches.
2. **Listen** — capture the user's description: what they want, why, where, what done looks like, what's explicitly out of scope.
3. **Existing-artifact intake** — first, check the optional **source adapter**: read `requirements_source` from this skill's customization (`customizations/document-quick-change.toml`). If set, follow the resolution rules in `references/orientation/source-adapters.md` — hand off by name to the named adapter (e.g. `jira-extract-requirements`) to pull the story/ticket into a structured package on disk, then seed the spec from it. If unset (the default), or if the adapter is set but not installed, fall back to asking the user directly. Then, either way, ask whether the user has additional tickets, incident notes, screenshots, prior PRs, ADRs, or other artifacts to seed the spec. Read them if provided; reconcile conflicts before drafting.
4. **Classify rigor** — trivial (one sentence + 1 AC, inline) / small (short spec on disk) / medium (full template). Confirm with the user.
5. **Structure against the composition** — populate the five blocks from `templates/compositions/quick-dev-spec.yaml`: overview, executive-summary-business-context (the "Why"), functional requirements (the "What" + delta), acceptance criteria, and assumptions-constraints-out-of-scope (which carries §12.2 environmental/regulatory/organisational constraints **and** §12.2a Solution Constraints — the implementation guardrails the executor must honor across every iteration and any Solution Pivot, captured by the change-scope-discovery elicitation pattern). §12.2a Solution Constraints must explicitly cover, at minimum: implementation guardrails (no regex, no hardcoded maps, no new dependencies, etc.), **quality constraints** (test framework / runner to use, coverage floor, lint/format rules, mandated NFR thresholds, security/compliance rules, prohibited test patterns), environmental constraints, and organisational constraints. For each acceptance criterion authored in step 5, add a one-line **"How will this be proven?"** note alongside it — name the verification method (unit test, integration test, manual check, log/metric inspection, existing automated gate). The note may be terse ("unit test on `parseFoo()`", "manual smoke in the staging UI") but it must exist for every AC. This is the quick-dev substitute for a full quality package. Add glossary entries if any new term appears. If the user reports no solution constraints, render §12.2a with a single "None known at spec time" row rather than omitting it. For trivial inline specs, the same fields are still captured (inline, not on disk) — including the per-AC proof note — and the executor's fallback prompt is a substitute for the on-disk section, not a licence to skip the question.
6. **Mark uncertainty** — insert `[NEEDS CLARIFICATION: …]` for any ambiguity that affects implementation. Resolve markers one at a time with the user.
7. **Finalize and confirm** — resolve the requirements-stage directory per the precondition's *Quick-dev layout* (`[stages.requirements]`, repo scope derived from the spec's affected repositories — never asked), run its `write_role` check, then write to `{paths.requirements_package}/<feature-id>/<feature-id>-quick-dev-spec.md` (or stay inline for trivial) and initialize `CHANGE-TRACKER.md` beside it if missing. For a `_cross-cutting/` spec, write `affects_repos` into its frontmatter. Get explicit user confirmation before handoff.

Detailed marker-resolution rules and rigor decision logic are not separately stepped — the workflow is short enough to keep inline.

## Output

See `references/INPUTS-OUTPUTS.md`. A single combined spec at `{paths.requirements_package}/<feature-id>/<feature-id>-quick-dev-spec.md` (small/medium) or inline (trivial), plus an initialized `CHANGE-TRACKER.md` if it didn't exist.

## Next skill

`plan-quick-change`

## Common mistakes

- Writing code or planning before the spec is agreed (no code before clarity gate)
- Vague ACs ("notifications work correctly") — each AC must be a specific trigger + observable outcome
- Bundling multiple questions in one `[NEEDS CLARIFICATION]` marker
- Skipping "Out of Scope" — the explicit boundary prevents downstream scope creep
- Using the full template for a trivial config rename — match rigor to scope
- Failing to ask about existing artifacts (tickets, PRs) — the user usually has more than they volunteered
- Authoring an AC without a "How will this be proven?" note — every AC must name its verification method, even if the note is one line ("manual smoke", "unit test on `X`")
- Listing only implementation guardrails in §12.2a and forgetting quality constraints (test framework, coverage floor, lint rules, prohibited test patterns)
