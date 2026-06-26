---
slug: elicit-project-context
sequence: 3
depends-on-prior: true
---

# Step 3 — Elicit project context

Build the body of `[project]`, `[project.paths]`, `[project.testing]`,
`[project.glossary]`, and `[project.elicitation]`. Each sub-section is a discrete elicitation
pass — do not collapse them into one mega-prompt.

## Purpose

Capture every field the schema in `config/project.toml.example`
declares, anchored on the example as the prompt's reference point. The
user sees the example value alongside each prompt so the format is
unambiguous.

## Sub-steps (run in order)

| # | Section | Required fields | Optional fields |
|---|---|---|---|
| 1 | `[project]` | `name`, `code`, `domain` | `description`, `default_flow` (set from step 02) |
| 2 | `[project.paths]` | `knowledge_base_path` (greenfield/brownfield only) | `requirements_package`, `design_package`, `implementation_package` (defaults are fine) |
| 3 | `[project.testing]` | (none) | `qe_repo` — code of the dedicated QE/test-automation repo, when present |
| 4 | `[project.glossary]` | (none) | `references[]`, `entries[]` (term/definition/aliases/domain_specific) |
| 5 | `[project.change_log]` | (none — `enabled` defaulted by flow) | `enabled`, `path`, `versioning_strategy`, `format`, `parts_affected_vocabulary` |
| 6 | `[project.elicitation]` | (none) | answers to known decision-table codes — see list below |

### Sub-step 1 — `[project]`

Ask for `name` (free-form), `code` (validate against `^[a-z][a-z0-9-]*$`
in real time), `domain` (one line), and optionally `description`
(multi-paragraph; can be empty). The `default_flow` value is already
known from step 02 — do not re-ask.

### Sub-step 2 — `[project.paths]`

For each of the four paths, present the schema default and let the user
keep or override. Validate that any `{...}` token is one of the four in
`config/SCHEMAS.md` § 1.5.

For `knowledge_base_path`: required for greenfield and brownfield;
suppressed for quick-dev. Suggest `{project-root}/../<project-code>-knowledge-base`
as the default sibling-repo layout.

### Sub-step 3 — `[project.testing]`

Ask whether the project has a dedicated QE / test-automation repository
that should receive QE-owned executable test artifacts by default.

Prompt:

> Does this project have a dedicated QE or test-automation repo for
> feature files, step definitions, runners, fixtures, reports, or other
> QE-owned executable test artifacts? If yes, provide the repo code you
> want to use for `[project.testing].qe_repo`; if it is not listed yet,
> Step 04 will add it to `[[project.repos]]`. If no, leave unset and
> quality execution will fall back to the in-scope code repo.

If the user provides a value, validate it against
`^[a-z][a-z0-9-]*$` and carry it forward as `[project.testing].qe_repo`.
Do **not** require the repo to exist yet at this step; Step 04 is
responsible for ensuring a matching `[[project.repos]]` entry exists.

### Sub-step 4 — `[project.glossary]`

Two parallel sub-prompts:

- "Any glossary files to reference?" — list of paths.
- "Any inline terms to capture now?" — loop on `term`, `definition`,
  optional `aliases`, optional `domain_specific`.

Both are optional. Skip on `done`.

### Sub-step 5 — `[project.change_log]`

Conditional. Asks whether the project will maintain a release-stream
`CHANGELOG.md`. Distinct from per-package `CHANGE-TRACKER.md` (those
ship automatically with each authored package).

Defaults by flow:
- **greenfield** / **brownfield** → `enabled = true` (most projects benefit from a user-facing changelog)
- **quick-dev** → `enabled = false` (small scoped changes don't usually warrant project-level changelogs)

Prompt the user with the flow-appropriate default, accept yes/no.

If `enabled = true`, ask the four follow-ups (each with a sensible
default; offer to skip and accept all defaults):

1. `path` — default `{project-root}/CHANGELOG.md`. Override only when there's a strong reason.
2. `versioning_strategy` — `semver` (default) | `calver` | `none`.
3. `format` — `keep-a-changelog` (default) | `plain`.
4. `parts_affected_vocabulary` — list of project-level feature areas (`auth`, `cart`, `search`, `api`, `ui`, etc.). The user can supply now, or accept the framework's eight-item starter list (`api`, `ui`, `auth`, `data`, `config`, `build`, `infra`, `docs`).

Carry the resolved table forward to step 05.

### Sub-step 6 — `[project.elicitation]`

Pre-answers for decision-table codes used by composition gates. The
canonical list (mirroring `project.toml.example`):

- `compliance_regime` — none / pci-dss / hipaa / gdpr / soc2 / other
- `team_size` — solo / 2-5 / 5-10 / 10-25 / 25-100 / 100+
- `user_facing` — boolean
- `deployment_model` — saas-multi-tenant / saas-single-tenant / on-prem / mobile-app / desktop-app / library
- `data_residency` — single-region / multi-region / us-eu-split / sovereign
- `release_cadence` — continuous / weekly / biweekly / monthly / quarterly / on-demand
- `testing_strategy` — tdd-required / tests-after / minimal / none
- `observability_stack` — datadog / new-relic / elastic / prometheus-grafana / cloudwatch / none
- `identity_provider` — auth0 / okta / cognito / azure-ad / custom / none
- `primary_database` — postgres / mysql / mssql / mongodb / dynamodb / other
- `event_bus` — kafka / rabbit / sqs / sns / eventbridge / none
- `has_ui` — boolean (for composition gates)
- `has_authn` — boolean
- `has_external_integrations` — boolean

Treat unknown codes the user volunteers as forward-compat — write them
through. Treat skipped codes as "no answer recorded."

## Elicitation patterns referenced

- `references/elicitation-patterns/project-bootstrap.md` § identity
- `references/elicitation-patterns/project-bootstrap.md` § paths
- `references/elicitation-patterns/project-bootstrap.md` § glossary-seed
- `references/elicitation-patterns/project-bootstrap.md` § decision-table-prefill

(These section anchors do not exist yet — referenced by path so the
runner knows where to load them when authored.)

## Hard gates

- `project.code` validation is live (re-prompt on regex failure).
- `knowledge_base_path` MUST be supplied for greenfield/brownfield
  before this step exits.

## Exit criteria

- [ ] `[project]` required fields collected.
- [ ] `[project.paths]` finalized (with KB path when applicable).
- [ ] `[project.testing]` prompt run; `qe_repo` either captured or explicitly left unset.
- [ ] Glossary sub-step run to its `done` exit.
- [ ] Decision-table sub-step run; user offered the chance to skip
      remaining codes.

## Next

Step 04 — elicit-repos. Skip directly to step 05 if the user confirms
single-repo and the project root is the only repo.
