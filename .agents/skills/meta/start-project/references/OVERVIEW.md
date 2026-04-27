# Overview — start-project

## Purpose

`start-project` is the single front door to A.I.D.E. Before any stage
skill runs, the project needs a `project.toml` — that's the
super-context every subsequent skill reads to know who the user is, what
the product is, where outputs go, and which flow applies. This skill is
the only one in the catalog that authors `project.toml` from a blank
slate. It elicits the answers in a sequenced, schema-aware order, writes
the file, optionally writes a personal `project.user.toml`, and then
delegates to the first skill of the chosen flow.

The goal is to make bootstrapping *boring*: the user answers concrete
questions about identity, repos, paths, glossary terms, and decision-
table answers, and the skill produces a working configuration without
the user ever editing TOML by hand. Skipping the bootstrap leads to two
failure modes the framework is built to avoid: skills mid-stage asking
"what's your project name again?" and conflicting answers between flows
that should have been pinned once.

## When to use

- First-time bootstrap on a repository
- Re-baselining after a major project restructure (new repos, renamed components)
- Adding a repo to an existing multi-repo enumeration
- Switching the default flow from greenfield to brownfield mid-product

## When NOT to use

- `project.toml` exists and the user wants a small override → use `customize-framework`
- The user wants per-skill overrides → use `customize-framework` with scope `skill-specific`
- The user wants to author a YAML composition → that's a separate authoring workflow (not yet built)
- The user is partway through a flow and wants to resume → direct them to the next skill in the chain

## Position in workflow

Stage: meta. Cross-stage entry point.

Pre-conditions:
- The user is in the intended `{project-root}` directory
- `framework.toml` exists in the framework installation (default values are read from it)

Post-conditions:
- `project.toml` written and valid against `config/SCHEMAS.md`
- (Optional) `project.user.toml` written and `.gitignore` updated
- Control passes to the first skill of the chosen flow:
  - greenfield → `create-requirements-package`
  - brownfield → `analyze-repository`
  - quick-dev → `document-quick-change`

This skill is invoked at most once per project under normal operation.
Re-runs are explicit (re-baseline) and the detect-existing step makes
that explicit by gating destructive overwrites behind user confirmation.
