# Inputs and Outputs — select-feature

## Inputs

| Name | Required? | Source | Example |
|---|---|---|---|
| `features.toml` | conditional | `{project-root}/features.toml` | see `config/features.toml.example` |
| `project.user.toml` | conditional | `{project-root}/project.user.toml` | read for the current `[user].active_feature`; created if absent and a value needs writing |
| `caller` | no | the halted skill's own name, when invoked as a precondition redirect | `create-requirements-package` |
| `caller_mode` | no | `select-and-create` (default) or `select-only` — the Mode B skills named in `references/ai-principles/feature-precondition.md` suppress create, since needing something to read or run is not a reason to mint a feature that has nothing in it yet. That roster is the single source of truth; how much a skill writes does not determine its mode | `select-only` |
| `description` | no | the user's own request text, forwarded by a halted skill or typed directly | "customers aren't notified when a refund is delayed" |
| title (create mode) | yes, in create mode | user input | "Alert customer when a refund is delayed" |
| slug override (create mode) | no | user input; a kebab slug is proposed from the title and may be accepted or overridden | `alert-customer` |
| `ticket` (create mode) | no | user input | `ACME-1247` |
| `repos` (create mode) | no | user input; codes from `[[project.repos]]` in `project.toml` | `["api-billing"]` |
| selection (select mode) | yes, in select mode | user's choice from the listed features | `refund-fee-waiver` |

## Outputs

| Artifact path | Format | Downstream consumer |
|---|---|---|
| `{project-root}/features.toml` | TOML, `[[features]]` array-of-tables | Every feature-aware skill's registry resolution; validator rules 13-16 (`config/SCHEMAS.md` § 4) |
| `{project-root}/project.user.toml` `[user].active_feature` | TOML string | Every feature-aware skill's active-feature resolution |
| Chat summary | prose | The user — echoes the resolved feature ID and the output path each in-use stage will write to |

## Side effects

- Creates `features.toml` on first opt-in, after explicit user confirmation —
  never silently
- Creates the `[user]` block in `project.user.toml` if it does not yet exist
- In create mode, appends exactly one `[[features]]` entry per invocation —
  never mutates an existing entry's `id` or `created` field (title, `ticket`,
  and `repos` may be updated later by a caller that detects drift, per
  `config/SCHEMAS.md` § 2.8's `repos` field description)
- In select mode, overwrites only `[user].active_feature`; never touches
  `features.toml`

## Validation rules

Enforced by `config/SCHEMAS.md` § 4 rules 13-16 and mirrored here as the
skill's own write-time checks, so a bad entry is caught before it lands
rather than only at the next `validate.py` run:

- `id` matches `^[a-z0-9]+(-[a-z0-9]+)*$` — a lowercase kebab slug, used
  verbatim as the directory name
- `id` is unique. Two features cannot share a directory and there is no ordinal
  to tell same-named ones apart, so a duplicate is rejected at mint time and the
  user is asked for a different slug
- `active_feature`, once written, resolves to a declared `id` — this skill
  never writes a pointer it did not just mint or select from the registry
- `repos` entries (when set) resolve to a declared `[[project.repos]].code`
  in `project.toml`
