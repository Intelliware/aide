# Elicitation pattern: Project bootstrap

## Purpose

Captures everything needed to write a new `project.toml` from scratch:
the user's flow choice, the `[project]` identity fields, the `[project.paths]`
overrides (including `knowledge_base_path` for greenfield/brownfield), the
`[project.glossary]` seed, and pre-answers for the `[project.elicitation]`
decision-table codes that gate downstream compositions. Invoked exclusively
by `start-project` during initial scaffolding (or rebaseline) — it is the
one place every other skill's defaults are pinned.

## Inputs needed from user

- Flow choice (greenfield / brownfield / quick-dev)
- Project identity: `name`, `code` (kebab-case), `domain`, optional `description`
- Path overrides (or accept defaults): `requirements_package`, `design_package`, `implementation_package`, `knowledge_base_path`
- Glossary seed: any reference files, optional inline term/definition entries
- Decision-table answers (each optional): `compliance_regime`, `team_size`, `user_facing`, `deployment_model`, `data_residency`, `release_cadence`, `testing_strategy`, `observability_stack`, `identity_provider`, `primary_database`, `event_bus`, `has_ui`, `has_authn`, `has_external_integrations`
- For multi-repo: an array of `[[project.repos]]` entries (`code`, `name`, `path`, `role`, optional `type`, `primary` flag)

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

### Section: flow-choice

1. **Which flow describes this project?**
   - **Format:** multiple-choice
   - **Options:**
     - `greenfield` — net-new product with no existing code to reverse-engineer
     - `brownfield` — existing code; reverse-engineer first, then enhance
     - `quick-dev` — a single small change, skip the formal stages
   - **Validation:** must be exactly one of the three enum values
   - **Maps to:** `project.default_flow`

### Section: identity

2. **What is the human-readable project name?**
   - **Format:** free-text
   - **Validation:** non-empty; <=120 chars
   - **Maps to:** `project.name`

3. **What kebab-case code identifies this project?**
   - **Format:** free-text with regex validation
   - **Validation:** must match `^[a-z][a-z0-9-]*$`; re-prompt on failure
   - **Maps to:** `project.code`

4. **What domain or business area does this project serve?** (one line)
   - **Format:** free-text
   - **Validation:** non-empty; <=200 chars
   - **Maps to:** `project.domain`

5. **Optional: provide a short description.** (multi-paragraph allowed; can be empty)
   - **Format:** free-text (optional)
   - **Validation:** none
   - **Maps to:** `project.description`

### Section: paths

6. **For each output package path, accept the schema default or override?** (asked once per path: requirements, design, implementation)
   - **Format:** path-with-validation
   - **Validation:** any `{...}` token must be one of the four declared in `config/SCHEMAS.md` § 1.5
   - **Maps to:** `project.paths.requirements_package`, `project.paths.design_package`, `project.paths.implementation_package`

7. **Where will the knowledge base live?** (greenfield/brownfield only — suppress for quick-dev)
   - **Format:** path-with-validation
   - **Validation:** absolute path or `{project-root}`-prefixed token; suggest `{project-root}/../<project-code>-knowledge-base` as the default
   - **Maps to:** `project.paths.knowledge_base_path`

### Section: glossary-seed

8. **Any glossary files to reference?** (optional, list of paths)
   - **Format:** structured-list (paths)
   - **Validation:** each entry resolves to an existing file (warn if not)
   - **Maps to:** `project.glossary.references[]`

9. **Any inline glossary terms to capture now?** (loop until `done`)
   - **Format:** structured-list of `{term, definition, aliases?, domain_specific?}`
   - **Validation:** `term` non-empty; `definition` non-empty
   - **Maps to:** `project.glossary.entries[]`

### Section: decision-table-prefill

For each known code, ask once and allow `skip`. Treat skipped codes as "no answer recorded." Forward-write any unknown codes the user volunteers.

10. **`compliance_regime`?**
    - **Format:** multiple-choice
    - **Options:** `none` / `pci-dss` / `hipaa` / `gdpr` / `soc2` / `other` / `skip`
    - **Maps to:** `project.elicitation.compliance_regime`

11. **`team_size`?**
    - **Format:** multiple-choice
    - **Options:** `solo` / `2-5` / `5-10` / `10-25` / `25-100` / `100+` / `skip`
    - **Maps to:** `project.elicitation.team_size`

12. **`user_facing`?**
    - **Format:** yes/no
    - **Maps to:** `project.elicitation.user_facing`

13. **`deployment_model`?**
    - **Format:** multiple-choice
    - **Options:** `saas-multi-tenant` / `saas-single-tenant` / `on-prem` / `mobile-app` / `desktop-app` / `library` / `skip`
    - **Maps to:** `project.elicitation.deployment_model`

14. **`data_residency`?**
    - **Format:** multiple-choice
    - **Options:** `single-region` / `multi-region` / `us-eu-split` / `sovereign` / `skip`
    - **Maps to:** `project.elicitation.data_residency`

15. **`release_cadence`?**
    - **Format:** multiple-choice
    - **Options:** `continuous` / `weekly` / `biweekly` / `monthly` / `quarterly` / `on-demand` / `skip`
    - **Maps to:** `project.elicitation.release_cadence`

16. **`testing_strategy`?**
    - **Format:** multiple-choice
    - **Options:** `tdd-required` / `tests-after` / `minimal` / `none` / `skip`
    - **Maps to:** `project.elicitation.testing_strategy`

17. **`observability_stack`?**
    - **Format:** multiple-choice
    - **Options:** `datadog` / `new-relic` / `elastic` / `prometheus-grafana` / `cloudwatch` / `none` / `skip`
    - **Maps to:** `project.elicitation.observability_stack`

18. **`identity_provider`?**
    - **Format:** multiple-choice
    - **Options:** `auth0` / `okta` / `cognito` / `azure-ad` / `custom` / `none` / `skip`
    - **Maps to:** `project.elicitation.identity_provider`

19. **`primary_database`?**
    - **Format:** multiple-choice
    - **Options:** `postgres` / `mysql` / `mssql` / `mongodb` / `dynamodb` / `other` / `skip`
    - **Maps to:** `project.elicitation.primary_database`

20. **`event_bus`?**
    - **Format:** multiple-choice
    - **Options:** `kafka` / `rabbit` / `sqs` / `sns` / `eventbridge` / `none` / `skip`
    - **Maps to:** `project.elicitation.event_bus`

21. **`has_ui`?**
    - **Format:** yes/no
    - **Maps to:** `project.elicitation.has_ui`

22. **`has_authn`?**
    - **Format:** yes/no
    - **Maps to:** `project.elicitation.has_authn`

23. **`has_external_integrations`?**
    - **Format:** yes/no
    - **Maps to:** `project.elicitation.has_external_integrations`

### Section: repos (run only in multi-repo case)

24. **Is this a multi-repo project?**
    - **Format:** yes/no
    - **Validation:** if `no`, skip the rest of this section
    - **Maps to:** drives whether `[[project.repos]]` is emitted

25. **Loop per repo until `done`:**
    - **`code`** — kebab-case ID (regex `^[a-z][a-z0-9-]*$`, unique within the array)
    - **`name`** — human-readable title
    - **`path`** — filesystem path (`"."` or `{project-root}/...` token)
    - **`role`** — multiple-choice: `api` / `ui` / `mobile` / `framework` / `database` / `infra` / `shared-library` / `tooling`
    - **`type`** — optional free-form tech hint (e.g. `node-typescript-nest`)
    - **`primary`** — boolean (at most one entry true)
   - **Maps to:** `[[project.repos]]`

**Wrap-up:** Confirm the answers in summary form before proceeding. Echo the chosen flow, identity fields, finalized paths, glossary seed count, recorded decision-table answers, and the repo list — then ask the user to approve or amend before `start-project` writes `project.toml`.

## Output format

Answers are recorded as `project.toml` entries.

```toml
[project]
name = "Acme Orders"
code = "acme-orders"
domain = "Order management"
description = ""
default_flow = "greenfield"

[project.paths]
requirements_package = "{project-root}/docs/requirements"
design_package = "{project-root}/docs/design"
implementation_package = "{project-root}/docs/implementation"
knowledge_base_path = "{project-root}/../acme-orders-knowledge-base"

[project.glossary]
references = []
entries = []

[project.elicitation]
has_ui = true
has_authn = true
has_external_integrations = false

[[project.repos]]
code = "acme-orders-api"
name = "Acme Orders API"
path = "."
role = "api"
type = "node-typescript-nest"
primary = true
```

## Validation rules

- `project.code` must match `^[a-z][a-z0-9-]*$`.
- `project.default_flow` must be one of `greenfield` / `brownfield` / `quick-dev`.
- `knowledge_base_path` MUST be supplied for greenfield/brownfield; suppressed for quick-dev.
- Path-token validation: any `{...}` token must be one of the four declared in `config/SCHEMAS.md` § 1.5.
- `[[project.repos]].code` regex `^[a-z][a-z0-9-]*$`, unique within the array.
- `[[project.repos]].role` ∈ enum `{api, ui, mobile, framework, database, infra, shared-library, tooling}`.
- At most one `[[project.repos]]` entry may have `primary = true`.
- Glossary `entries[].term` and `entries[].definition` are both required when an entry is added.
- Decision-table values that match the documented enums are written through; unknown codes are forward-compat (written as-is); skipped codes are omitted entirely.

## Reusable across

- `start-project` — step 02 (flow-choice), step 03 (identity, paths, glossary-seed, decision-table-prefill), step 04 (repos)
