# Inputs and Outputs — start-project

## Inputs

| Name | Required? | Source | Example |
|---|---|---|---|
| `project_root` | yes | inferred from `{cwd}` at invocation | `/Users/mike/work/acme-checkout` |
| `flow` | yes | user input — one of `greenfield`, `brownfield`, `quick-dev` | `brownfield` |
| `project.name` | yes | user input | `Acme Checkout Platform` |
| `project.code` | yes | user input — kebab-case, `^[a-z][a-z0-9-]*$` | `acme-checkout` |
| `project.domain` | yes | user input | `B2B SaaS checkout, billing, refunds` |
| `project.description` | no | user input — multi-line allowed | (paragraph) |
| `project.default_flow` | no | derived from `flow` (or framework default) | `brownfield` |
| `project.paths.requirements_package` | no | user input — defaults to `{project-root}/.framework-output/requirements` | `{project-root}/docs/requirements` |
| `project.paths.design_package` | no | user input — defaults to `{project-root}/.framework-output/design` | `{project-root}/docs/design` |
| `project.paths.implementation_package` | no | user input — defaults to `{project-root}/.framework-output/implementation` | `{project-root}/docs/implementation` |
| `project.paths.knowledge_base_path` | yes (when flow ≠ quick-dev) | user input — sibling-repo path | `{project-root}/../knowledge-base-repo` |
| `project.testing.qe_repo` | no | user input — code of dedicated QE/test-automation repo | `qe-automation` |
| `project.glossary.references` | no | user input — list of paths | `["{project-root}/docs/glossary.md"]` |
| `project.glossary.entries[]` | no | user input — `term`, `definition`, `aliases`, `domain_specific` | (see `EXAMPLE.md`) |
| `project.elicitation.<code>` | no | user input — answers to known decision-table codes | `compliance_regime = "pci-dss"` |
| `[[project.repos]]` | yes when multi-repo | user input — looped via step 04 | (see `EXAMPLE.md`) |
| `personal_overrides` | no | user input — fields written to `project.user.toml` | `default_flow = "quick-dev"` |

## Outputs

| Artifact path | Format | Downstream consumer |
|---|---|---|
| `{project-root}/project.toml` | TOML (per `config/project.toml.example`) | every skill in every flow |
| `{project-root}/project.user.toml` (optional) | TOML (per `config/project.user.toml.example`) | merged at higher precedence than `project.toml` |
| `{project-root}/.gitignore` (line append) | text | git |

## Side effects

- Creates `project.toml` if absent. Aborts (or asks for explicit overwrite confirmation) when present — the detect-existing step is a hard gate.
- Creates `project.user.toml` only when the user supplies at least one personal override.
- Appends `project.user.toml` to `.gitignore` (creating `.gitignore` if absent).
- Triggers the next skill in the flow chain by name (no file output for the handoff).

## Validation rules (enforced before write)

- `project.code` matches `^[a-z][a-z0-9-]*$`.
- Every `[[project.repos]]` entry has a unique `code`.
- At most one `[[project.repos]]` entry has `primary = true`.
- `project.default_flow`, when set, is one of `greenfield`, `brownfield`, `quick-dev`.
- All path-token references use one of `{project-root}`, `{framework-root}`, `{home}`, `{cwd}`.
- `knowledge_base_path` is mandatory for greenfield and brownfield; optional (and unused) for quick-dev.
- `project.testing.qe_repo`, when set, matches one declared `[[project.repos]].code`.
- `[[project.repos]]` entries' `role` is one of: `api`, `ui`, `mobile`, `framework`, `database`, `infra`, `shared-library`, `tooling`, `test-automation`, `qe`.

The full validation list lives in `config/SCHEMAS.md` § 4. The skill
checks each rule before writing; on failure, it surfaces the offending
field and re-elicits.
