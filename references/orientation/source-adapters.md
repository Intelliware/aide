# Source adapters — importing flow inputs from add-on tools

A **source adapter** lets a flow optionally pull its starting input from an
external system (JIRA, Confluence, SharePoint, …) instead of eliciting it
from scratch — for example, seeding a quick-dev spec from a JIRA story, or a
brownfield discovery from a Confluence page.

The integrations themselves live in **add-on repos**, not in core (see
`_docs/pluggable-tool-addons-proposal.md` and `config/SCHEMAS.md` § 2.6). This
convention is the seam that connects a core flow to whatever adapter skill a
project has installed — **without** the core skill naming any specific tool.

## The config key

A consuming skill reads a single scalar from its own customization namespace
(`skills.<skill-name>.<key>`, i.e. a top-level scalar in
`customizations/<skill-name>.toml`):

| Consuming skill | Key | Names an add-on skill that produces… |
|---|---|---|
| `document-quick-change` | `requirements_source` | a structured requirements/ticket package to seed the quick-dev spec |
| `create-requirements-package` | `discovery_source` | a discovery input to seed the brownfield change-description / baseline |

The value is the **name** of an installed adapter skill (e.g.
`jira-extract-requirements`, `confluence-extract-package`). Unset is the
default and means "no adapter — behave exactly as before."

## Resolution the consuming skill MUST follow

1. **Unset** → proceed with normal elicitation. No change; this is the default
   and the only behavior when no add-on is installed.
2. **Set and the named skill is discoverable** → hand off **by name** (the
   standard `## Source adapter\n<name>` handoff — never an `@`-include, to
   preserve context budget). The adapter fetches its content and **writes a
   structured package to its cache on disk** (e.g. `cache/jira/<KEY>/…`); the
   consuming skill then reads that package from disk and folds it into its
   normal intake step, continuing through every existing gate unchanged.
3. **Set but not discoverable** (add-on not installed) → **surface the gap,
   name the add-on to install, and offer to proceed with manual elicitation.**
   Never silently skip and never fail hard. Example message:
   > `requirements_source` is set to `jira-extract-requirements`, but no such
   > skill is discoverable. Clone the Atlassian add-on to enable it, or say
   > "continue manually" to capture the change by hand.

## Invariants

- The adapter **seeds** intake; it does not replace gates. A brownfield
  `discovery_source` still runs Step 1 discovery and still hands off to
  `review-requirements-package`. A quick-dev `requirements_source` still runs
  the clarity gate.
- Written-to-cache, not in-memory: the pulled input is inspectable and
  survives a context reset, consistent with the write-on-acknowledge invariant
  (`references/ai-principles/write-discipline.md`).
- Core ships **no** adapter skills and **no** stubs. An adapter exists only
  when its add-on repo is installed and discovered; the "install the add-on"
  hint is surfaced here (step 3), where the user has expressed intent, not by a
  core stub skill.
