# Elicitation pattern: Stakeholder discovery

## Purpose

Identifies who cares about the system being built, what they need from it,
and which of them holds decision authority. Invoked at the start of the
requirements stage so the resulting `requirements/stakeholders-personas`
block has named primary stakeholders, end users, supporting teams, and
their goals/constraints — the input every later requirements block (FRs,
NFRs, data, ACs) is anchored against.

## Inputs needed from user

- Primary stakeholders (named individuals or roles): goals, success measures
- Decision-makers / sign-off authorities for the package
- End users / personas: who they are, what they're trying to accomplish, frequency of use
- Supporting / adjacent teams (ops, security, compliance, support) and their constraints
- Known anti-stakeholders or blocking parties (optional)
- Stakeholder communication channel (review cadence, sign-off mechanism)

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

1. **Who is the primary business sponsor for this work?** (name + role)
   - **Format:** free-text
   - **Validation:** non-empty; flag if "not sure" so the package can be marked `[NEEDS CLARIFICATION]`
   - **Maps to:** `requirements.stakeholders[0]` (role: sponsor)

2. **Who has final sign-off authority on the requirements package?**
   - **Format:** free-text (single name/role) or `same as sponsor`
   - **Validation:** must be a named role
   - **Maps to:** `requirements.stakeholders[].sign_off = true`

3. **Loop: who else will provide input or review this package?** (add until `done`)
   - **Format:** structured-list of `{name_or_role, contribution, constraints}`
   - **Validation:** each entry has a non-empty role
   - **Maps to:** `requirements.stakeholders[]`

4. **Loop: list the end-user personas.** For each: name, one-line description, primary goal, key pain point. (add until `done`)
   - **Format:** structured-list of `{persona_name, description, goal, pain_point, frequency_of_use?}`
   - **Validation:** at least one persona required for user-facing systems
   - **Maps to:** `requirements.personas[]`

5. **Are there supporting teams that impose constraints on this work?** (security, compliance, ops, support, data) — list those that apply.
   - **Format:** multiple-choice (multi-select) + free-text per selected
   - **Options:** `security` / `compliance` / `ops` / `support` / `data` / `legal` / `finance` / `none`
   - **Maps to:** `requirements.stakeholders[]` (role: supporting-team)

6. **Are there any anti-stakeholders or known blockers — parties whose objections could halt the project?** (optional)
   - **Format:** free-text
   - **Validation:** none
   - **Maps to:** `requirements.stakeholders[]` (role: blocker)

7. **What is the review and sign-off cadence?**
   - **Format:** multiple-choice
   - **Options:** `weekly-review` / `milestone-only` / `async-async` / `gate-by-gate` / `other`
   - **Maps to:** `requirements.stakeholders.cadence`

**Wrap-up:** Confirm the answers in summary form before proceeding. Read back the named sponsor, sign-off authority, full stakeholder list grouped by role, persona list, supporting-team constraints, and review cadence. Get explicit approval before writing the stakeholders-personas block.

## Output format

Answers populate the `requirements/stakeholders-personas` block in the requirements package, and (where relevant) seed `requirements/executive-summary-business-context`.

```toml
# illustrative — actual artifact is markdown under {paths.requirements_package}/
[requirements.stakeholders]
sponsor = "Director of Operations (Jane Smith)"
sign_off = "VP Engineering (Mark Patel)"
cadence = "milestone-only"

[[requirements.stakeholders.entries]]
role = "ops-lead"
name = "Ops Manager"
contribution = "validates runbook readiness"
constraints = "must not impact on-call rotation"

[[requirements.personas]]
name = "Order Operator"
description = "Daily user resolving stuck orders"
goal = "Identify and unstick orders within 2 minutes"
pain_point = "Five-tab workflow today"
frequency = "every 15 minutes during shift"
```

## Validation rules

- At least one named sponsor or decision-maker is required before exit.
- For user-facing systems (`project.elicitation.has_ui == true` or `user_facing == true`), at least one persona is required.
- Each stakeholder entry must have a role; "not sure" is allowed and is recorded as `[NEEDS CLARIFICATION]`.
- Supporting-team constraints, when listed, must include at least one constraint sentence so the NFR pass can pick them up.

## Reusable across

- `create-requirements-package` (step 01-discovery; step 03-analysis re-uses the persona list to derive non-functional requirements and data-permission scopes)
- `requirements/README` (lists this pattern as the canonical stakeholder-input source for the requirements stage)
