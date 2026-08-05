# navigate-knowledge-base — Overview

## Purpose

`navigate-knowledge-base` is the **load-time selector** for the entire
framework. Every stage skill — requirements, design, planning, execution,
quick-dev — needs to ground itself in the KB before doing real work, but the
KB can hold hundreds of components and reading them all blows the agent's
context. This skill performs the read pattern the root `NAVIGATE.md`
mandates (legacy KBs: `CLAUDE.md` — readers resolve `NAVIGATE.md` first
and fall back to `CLAUDE.md` when it is absent): read `ARCHITECTURE.md`
first, hit the Capability Index, walk `graph.json` one hop, return a
minimal ranked list.

The skill never writes. It is **idempotent and side-effect-free** — call it
as often as needed during a stage. Callers consume the returned list how
they like: read all, read top-N, read just frontmatter, or use the list as
input to a follow-up call with a different feature description.

## When to use

- A stage skill is about to start work and needs grounding context. Call
  this skill with the user's feature description or the increment's
  text and feed the result to the stage's reading step.
- An agent in `execute-increments` is about to open source files and
  needs to confirm which components the increment is meant to touch.
- An impact-analysis question arrives ("if I change X, what breaks?") —
  call with `--seed-component-id=X --depth=two-hop`.

## When NOT to use

- The KB does not yet exist — run `build-knowledge-base` first.
- The user explicitly asked for the KB's high-level shape ("describe this
  system") — read `ARCHITECTURE.md` § 1–4 directly; this skill's
  selection-and-ranking machinery is overkill.
- You are about to write to the KB — use `update-knowledge-base`.

## Position in workflow

This skill is the universal pre-step. Typical invocation chain:

```
<stage skill, e.g. create-requirements-package>
   ↓
   navigate-knowledge-base(feature_description)
   ↓
   stage skill reads the returned components, then proceeds with its
   own workflow.
```

In `execute-increments`, the chain is:

```
execute-increments
   ↓
   for each INC-XXX:
     navigate-knowledge-base(increment.goal + increment.plan)
     ↓
     read the returned components for grounding
     ↓
     execute the increment
     ↓
     [at end of all increments] update-knowledge-base
```

## Cost shape

- `ARCHITECTURE.md` read: 5–15 KB. Always paid.
- Capability index match: cheap (string ops on already-loaded text).
- `graph.json` read: 5–50 KB depending on KB size. Paid once per call.
- Component frontmatter scan: O(component count) but only the
  frontmatter block is read via grep — typically <500 bytes per
  component.
- Component body reads: NOT performed by this skill. The caller decides.

Rough end-to-end latency: <1s for KBs with up to ~200 components.

## Profiles

Moved here from `SKILL.md` to keep that file inside the 200-line budget. The summary
there is authoritative on *what* a profile is; this section is the per-step detail.

A **profile** is a named query bias the caller selects with `--profile`.
It does not change the workflow steps; it changes how step 2 (capability
lookup) and step 6 (cap and rank) weight components.

### `default` profile

The behaviour described above. No frontmatter filtering; all components
in the capability index are eligible.

### `test-suite` profile

Used by the merged quality stage to ground in test-suite documentation
rather than application code.

- **Step 2 (capability lookup):** filter the capability index to
  components whose frontmatter declares `kind: test-suite` (produced
  by `reverse-engineer-test-suite`). Score and shortlist as usual,
  but draw the candidate pool from that filtered set.
- **Step 3 (graph expansion):** walk one hop on `depends_on` /
  `consumed_by` as usual; do **not** filter the expansion — the
  expansion correctly pulls in the application components the test
  suite tests (recorded in `tests:` frontmatter), which the caller
  typically wants to see alongside the suite components.
- **Step 6 (cap and rank):** within tiers, prefer `kind: test-suite`
  components over application components. The fan-out of one suite
  query to application components is expected and useful — but
  applications should never out-rank the suite components for a
  test-suite-profile query.
- **`--profile-subkind` filter (optional):** restrict the primary
  selection to the named subkind(s). Example:
  `--profile=test-suite --profile-subkind=shared-utilities` returns
  only `shared-utilities.md` components plus their one-hop
  expansion. Useful for `review-test-failures`'s locator lookup.

If no components carry `kind: test-suite` (the KB has not yet ingested
a `reverse-engineer-test-suite` output), the profile returns an empty
primary set and the caller is told:

> No test-suite components found in the KB. Run
> `/reverse-engineer-test-suite` against the suite repo, then
> `/build-knowledge-base` or `/update-knowledge-base` to fold the
> components in. Falling back to the `default` profile would return
> application components, which is not what a test-grounded query
> needs.

The caller (typically a quality-stage skill) then decides whether to
abort or proceed with a clearly-flagged "no KB grounding available"
note.



- **Returning more than `--max-components`.** The default cap exists for
  good reason; raise it consciously, not by default.
- **Reading component bodies during selection.** Bodies are expensive;
  selection reads frontmatter only (via grep against the YAML block).
- **Forgetting `consumed_by` (incoming edges).** A feature touching A
  often impacts everyone who calls A; one-hop must include both
  directions.
- **Greedy two-hop expansion.** Two-hop can balloon to 20+ components;
  use `--depth=two-hop` only on explicit caller request.
- **Skipping the capability index in favour of pure trigger grep.**
  Capability is the curated routing layer; it disambiguates trigger
  collisions (e.g. `pay` matches both checkout and refund flows).
- **Stale-component blindness.** This skill does NOT verify freshness.
  It returns components with their stated `last_verified_against_commit`
  and lets the caller decide. If freshness matters, the caller should
  run `detect-knowledge-base-drift --mode=gate` first.
- **Falling back to the `default` profile when `test-suite` returns
  empty.** A quality-stage caller that needs test-suite grounding
  should never silently substitute application components — that
  produces correct-looking but wrong results. Always surface the
  empty-profile case to the caller and let it decide.
- **Using `--profile=test-suite` for application-feature queries.**
  Profiles are not free filters — `test-suite` is for quality-stage
  callers grounding in test artefacts. A requirements or design skill
  should always use the `default` profile.
