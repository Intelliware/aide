# Inputs and Outputs — framework-navigator

## Inputs

| Name | Required? | Source | Example |
|---|---|---|---|
| user utterance | yes | conversation | "I want to RE this API project into the global knowledge base, how do I go about that?" |
| operating mode | yes | inferred from utterance per `steps/01-detect-mode.md` | `goal` or `catalog` |
| `project.toml` | optional but probed | `{project-root}/project.toml` | flow=`greenfield`, paths.requirements_package=`./.framework-output/requirements`, knowledge_base_path=`../knowledge-base` |
| stage artifacts on disk | probed | filesystem | presence of `requirements_package/`, `design_package/`, `implementation_package/`, KB index |
| skill catalog | yes | `skills/_registry/skills.csv` (or `skills.json`) | full skill list — read every data row at runtime; do not assume a fixed count |
| workflow graph | yes | `skills/_registry/workflow-graph.yaml` | flows, gates, anytime list |
| decision-table answers | optional | `project.toml.[project.elicitation]` | `compliance_regime = "pci-dss"` |
| disambiguation answers | sometimes | conversation (up to 2 questions) | "new project or extending existing one?" |

## Outputs

### Goal mode

| Artifact | Format | Downstream consumer |
|---|---|---|
| skill recommendation | conversation message naming exactly one skill from the catalog | the user |
| exact trigger phrase | quoted English sentence the user can paste | the user, who invokes the recommended skill next |
| prerequisite list | bullet list of any gates that must complete first | the user |
| position-in-workflow note | one-sentence "you are in stage X; next is Y" | the user |
| ambiguity flag | only when on-disk state is contradictory (e.g. two flows half-done) | the user |

### Catalog mode

| Artifact | Format | Downstream consumer |
|---|---|---|
| stage-grouped catalog | markdown table: Stage \| Skill \| Description \| When to use this | the user |
| flow sequences | three labelled lists (greenfield / brownfield / quick-dev) of skills in order | the user |
| anytime list | bullet list of cross-cutting skills | the user |
| pointer | one-line "run framework-navigator with a goal for a personalized recommendation" | the user |

## Side effects

**None.** The navigator does not write files, does not invoke other skills,
does not modify `project.toml`, and does not start work. It only emits text to
the conversation.

## Validation rules

- Goal-mode recommendation must name **exactly one** skill present in
  `skills/_registry/skills.csv`.
- The trigger phrase must be quoted and self-contained (the user can paste it
  back without editing).
- If multiple skills score within ~10% of each other on the recommendation
  rubric (`references/recommendation-rubric.md`), ask one disambiguating
  question rather than guessing.
- Never recommend `framework-navigator` itself.
- Catalog-mode output must include every row from the registry; missing skills
  indicate a stale registry, not a navigator decision.
- If the state probe finds an ambiguous state (e.g. both `requirements_package/`
  and `quick-change-spec.md` present, or `flow=greenfield` in `project.toml`
  but no requirements artifacts on disk), surface that explicitly before
  recommending.
