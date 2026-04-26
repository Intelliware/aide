# Blocks

Reusable section blocks composed by manifests in `templates/compositions/`.

Each block file has YAML frontmatter plus the section template content below it:

```yaml
---
slug: functional-requirements
title: "Functional Requirements"
applies-to: [requirements, brownfield-enhancement]
requires-decision-from: [stakeholder, product-owner]
optional: false
---

## Functional Requirements

…template content with `{{placeholder}}` markers…
```

Blocks are content-stable; compositions choose which blocks to include and in what order. Subdirectory naming mirrors `.agents/skills/<stage>/` for traceability.

## Stage coverage

Block subdirectories exist for stages whose artifacts are **authored** by
composition: `requirements/`, `design/`, `planning/`, `reverse-eng/`,
`knowledge-base/`, `shared/`, and `execution/pr/`.

Note on the execution stage: only the **PR description** is composed from
blocks. The other execution-stage outputs — `increment-status` (runtime
state file) and `bug-log` (append-only log) — are machine-emitted and
authored inline by their owning skills (`execute-increments`,
`manage-bugs`). They deliberately do not have block libraries; composing
short-lived state files from human-authored blocks adds ceremony without
payoff. See the rationale in `_archive/skill-disposition.md`.
