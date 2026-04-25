# Model 2 SDLC Skills

This folder contains portable Agent Skills for Model 2 SDLC packages. Skills are grouped by package type so the requirement package, solution package, implementation package, and expedited implementation package do not collide.

> Note: Cursor and GitHub Copilot commonly auto-discover skills from `.agents/skills/`, `.cursor/skills/`, or `.github/skills/`. If a tool does not scan this custom folder directly, copy or symlink the individual skill folders into that tool's configured skills directory.

## Requirements Skills

Location: `requirement-package/`

- `requirements-package`: parent coordinator and router.
- `requirements-discovery`: requirements-package discovery phase.
- `requirements-analysis`: requirements-package analysis phase.
- `requirements-writing`: requirements authoring and package assembly. Supports skipped discovery and skipped analysis paths.
- `requirements-review`: formal review sequence and architect handoff readiness gate.

## Solutions Skills

Location: `solution-package/`

- `solutions-package`: parent coordinator and router.
- `solution-discovery`: optional solution architecture discovery phase.
- `solution-design`: solution design authoring and package assembly. Supports skipped discovery and requirements-change updates.
- `solution-review`: formal architecture, security, and readiness review before implementation handoff.

## Implementation Skills

Location: `implementation-package/`

- `implementation-package`: parent coordinator and router.
- `implementation-plan`: implementation planning phase.
- `implementation-execution`: TDD implementation execution phase.
- `implementation-pr`: PR review, commit, description, and handoff phase.


## Expedited Implementation Skills

Location: `expedited-implementation-package/`

- `expedited-implementation-package`: single skill for small-to-medium spec-driven implementation without separate requirements or solution packages. Step logic lives in `references/`; templates and standards live in `assets/`.

## Structure

```text
model-2-sdlc-skills/
├── requirement-package/
│   ├── requirements-package/
│   ├── requirements-discovery/
│   ├── requirements-analysis/
│   ├── requirements-writing/
│   └── requirements-review/
├── solution-package/
│   ├── solutions-package/
│   ├── solution-discovery/
│   ├── solution-design/
│   └── solution-review/
├── implementation-package/
│   ├── implementation-package/
│   ├── implementation-plan/
│   ├── implementation-execution/
│   └── implementation-pr/
└── expedited-implementation-package/
```

Each skill keeps `SKILL.md` concise. Detailed workflows and step-specific guidance live in `references/`. Templates, standards, and static forms live in `assets/`.
