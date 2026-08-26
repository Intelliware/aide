# Recommendation Rubric

How the navigator scores skill candidates in goal mode and decides whether to
ask a disambiguating question. Implementation-agnostic — the rubric is what
gets applied; the actual scorer is part of the navigator's prompt.

## Inputs to the rubric

For each candidate skill in `skills/_registry/skills.csv`:

- The skill's `description` (Use-when… form, includes trigger phrases).
- The skill's `stage`.
- The skill's flow position (from `workflow-graph.yaml`).

For the user's situation:

- The user utterance (full text).
- The state-probe dict (see `state-probe.md`).
- The disambiguation answers received so far (0, 1, or 2).

## Scoring components

Each candidate gets a score in `[0, 1]` from the weighted sum of these signals.

### 1. Trigger-phrase match (weight 0.45)

Compare the utterance against the **trigger phrases** embedded in the skill's
`description`. Trigger phrases are the quoted "Use when the user says…" tokens.
The match is loose substring-with-stem (so "documenting requirements" matches
"document requirements"). A direct trigger-phrase hit scores 1.0; a
keyword-overlap score is in `[0, 0.7]`; no overlap scores 0.

### 2. Stage relevance (weight 0.20)

If the user's utterance names a stage explicitly ("design", "implementation",
"requirements", "knowledge base", "quick change"), candidates in that stage
get a flat 1.0 boost on this signal; others get 0.0. If the utterance is
stage-neutral, all candidates get 0.5 here so this signal does not skew
matching.

### 3. State-probe alignment (weight 0.20)

The state probe biases candidates that are the **next reachable step** in the
active flow:

- Probe says `flow=greenfield`, no `requirements_package/` on disk → bias
  `create-requirements-package` heavily, penalize design/planning/execution.
- Probe says `flow=brownfield`, KB not built → bias
  `analyze-repository`/`build-knowledge-base`, penalize stage skills that
  consume the KB.
- Probe says `flow=quick-dev`, no spec on disk → bias `document-quick-change`,
  penalize `plan-quick-change` and `execute-quick-change`.
- Probe says `project.toml` missing → all candidates penalized, **only**
  `start-project` boosted.

Candidates whose prerequisites (per `workflow-graph.yaml` gates) are not yet
met are penalized by 0.3.

### 4. Specificity (weight 0.10)

Reverse-engineering domain skills (`reverse-engineer-api`,
`reverse-engineer-database`, etc.) get a +0.5 boost over `analyze-repository`
**only** when the user explicitly names the repo type ("my Postgres database",
"my React app"). Otherwise `analyze-repository` is preferred so the user
doesn't pick the wrong domain skill.

### 5. Anti-loop (weight 0.05, applied as a hard cap)

`framework-navigator` always scores 0 — never recommend itself.
`customize-framework`, `manage-presets`, and `start-project` are gated behind
explicit triggers: they only surface when the utterance matches their domain:

- `customize-framework` — "configuration", "overrides", "suppression",
  "customize", "change default", "add a hook", "before-hook", "after-hook",
  "chain skills".
- `manage-presets` — "preset", "install preset", "enable preset", "disable
  preset", "show presets", "discover presets", "preset bundle".
- `start-project` — "new project", "bootstrap", "initialize", "start project".

## Decision rules

After scoring, apply these rules in order:

1. **Single dominant candidate** — top score ≥ 0.55 **and** at least 0.10
   ahead of #2 → recommend immediately, no clarifying question.
2. **Two close candidates** — top two within 0.10 of each other → ask **one**
   disambiguating question chosen to discriminate them. Re-score with the
   answer.
3. **Still close after one question** — ask **one** more (cap at 2). If still
   tied, recommend the higher-stage-order candidate (closer to project start)
   and surface the runner-up as an alternative.
4. **No candidate above 0.30** — the goal is unrecognizable. Switch to a
   short list of probable skills (top 3) and ask the user to pick.
5. **Probe-imposed override** — if the probe says `project.toml` is missing
   and the user did not ask for `start-project`, **recommend `start-project`
   anyway** with a one-sentence rationale. This is the only override that
   bypasses scoring.

## Disambiguation question patterns

Pick the question that splits the top two candidates most cleanly:

- **New vs. extending** — splits `start-project` vs. any stage skill.
- **One repo or multiple** — splits `analyze-repository` (multi) vs. a domain
  RE skill (single, named).
- **Quick fix vs. full feature** — splits `document-quick-change` vs.
  `create-requirements-package`.
- **Document vs. build new** — splits any RE skill vs. any stage skill.
- **Currently in stage X — continue, review, or restart?** — splits
  `create-*-package` vs. `review-*-package`.

Never ask more than 2 questions; if scoring is still ambiguous after that,
recommend with explicit caveat ("I'm picking X because Y, but Z would also
fit — say 'do Z instead' if you prefer").

## Worked tie-break

User: "I want to design something."

| Skill | Trigger | Stage | State | Specificity | Score |
|---|---|---|---|---|---|
| `create-design-package` | 0.7 | 1.0 | 0.5 (no req package on disk → penalty) | 0.5 | 0.61 |
| `create-requirements-package` | 0.2 | 0.5 | 1.0 (greenfield, nothing on disk) | 0.5 | 0.43 |
| `review-design-package` | 0.4 | 1.0 | 0.2 (no design package yet) | 0.5 | 0.41 |

Top score 0.61 ahead of #2 by 0.18 → recommend `create-design-package`. But
because `review-requirements-package` is a gate (per `workflow-graph.yaml`)
and no requirements package exists, **flag the prerequisite explicitly**:
"You'll need a reviewed requirements package first — say 'create the
requirements package' to start there."
