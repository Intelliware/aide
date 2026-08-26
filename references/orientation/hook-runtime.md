# Hook Runtime — Execution Procedure

> **Audience:** Skill implementations. This document defines the hook execution
> contract that every A.I.D.E. skill must follow when hooks are configured.

## Overview

Hooks enable automatic skill chaining at skill boundaries. When a skill is
invoked and hooks are configured in `customizations/<skill>.toml`, the skill
must execute them at the appropriate points in its lifecycle.

This document specifies:
1. When hooks fire
2. How to evaluate hook conditions
3. How to handle optional hooks
4. What to announce to the user
5. Error handling

For the hook schema, see `config/SCHEMAS.md` § 2.5.1.

## Execution Lifecycle

```
1. Skill invoked
2. Load hooks from merged config (customizations/<skill>.toml)
3. Filter to before-hooks, sort by priority ascending
4. FOR each before-hook:
   a. Evaluate condition (skip if falsy)
   b. If optional, prompt user (skip if declined)
   c. Announce: "Running before-hook: <skill> (code: <code>)"
   d. Invoke the hooked skill
   e. Handle errors (see Error Handling below)
5. Execute Steps 0..N of this skill
6. Execute gates from workflow-graph.yaml (if any)
7. Filter to after-hooks, sort by priority ascending
8. FOR each after-hook:
   a. Evaluate condition (skip if falsy)
   b. If optional, prompt user (skip if declined)
   c. Announce: "Running after-hook: <skill> (code: <code>)"
   d. Invoke the hooked skill
   e. Handle errors
9. ## Next skill handoff
```

## Loading Hooks

Hooks are declared in `customizations/<skill>.toml` as a `[[hooks]]` array.
After layer merge (framework → project → presets → customizations), extract
the hooks array and partition by `event`:

```
merged_config = load_merged_config(skill_name)
all_hooks = merged_config.hooks or []
before_hooks = [h for h in all_hooks if h.event == "before"]
after_hooks = [h for h in all_hooks if h.event == "after"]
```

Sort each partition by `priority` ascending. Default priority is 500.

## Evaluating Conditions

The `condition` field is an expression evaluated against the merged config.
Supported syntax:

| Expression | Example | Semantics |
|---|---|---|
| Dot-path existence | `project.paths.knowledge_base_path` | Truthy if path exists and value is non-empty |
| Equality | `project.default_flow == 'brownfield'` | String/number/boolean comparison |
| Inequality | `project.elicitation.team_size != 'solo'` | Negated equality |
| Boolean | `project.elicitation.uses_test_case_increments == true` | Explicit boolean check |

**Falsy values:** empty string `""`, `false`, `0`, `null`, missing path.

**Evaluation pseudocode:**

```
function evaluate_condition(condition, config):
    if condition is empty or null:
        return true  # No condition means always run

    # Parse expression (simplified)
    if "==" in condition:
        path, value = split(condition, "==")
        actual = get_path(config, path.strip())
        return actual == parse_value(value.strip())
    elif "!=" in condition:
        path, value = split(condition, "!=")
        actual = get_path(config, path.strip())
        return actual != parse_value(value.strip())
    else:
        # Existence check
        return is_truthy(get_path(config, condition.strip()))
```

## Handling Optional Hooks

When `optional = true`, the skill must prompt the user before running:

```
[Hook: navigate-knowledge-base]
Check KB first? [Y/n]: _
```

The prompt text comes from the hook's `prompt` field (required when optional).

- User presses Enter or types 'y'/'Y': run the hook
- User types 'n'/'N': skip the hook with announcement

**Announcement for skipped optional hook:**

```
Skipped before-hook: navigate-knowledge-base (code: kb-check) — user declined
```

## Announcements

Every hook must be announced before execution. Every skipped hook must also
be announced with the reason.

**Running a hook:**

```
Running before-hook: navigate-knowledge-base (code: kb-context-load)
```

**Skipped due to condition:**

```
Skipped before-hook: navigate-knowledge-base (code: kb-context-load) — condition not met
```

**Skipped due to user declining optional:**

```
Skipped after-hook: review-adversarial (code: adversarial-review-optional) — user declined
```

**Format:**

```
<Running|Skipped> <event>-hook: <skill> (code: <code>)[ — <reason>]
```

## Error Handling

**Hook skill not found:**

If `[[hooks]].skill` does not resolve to a registered skill, the loader rejects
the config at merge time (validation rule 18). This is a hard error.

**Hook skill fails during execution:**

If the invoked skill returns an error or halts:

1. Announce: `Hook failed: <skill> (code: <code>) — <error summary>`
2. **Before-hooks:** halt the parent skill. Do not proceed to Step 0.
3. **After-hooks:** log the failure but allow the parent skill to complete its
   handoff. The parent skill's work is already done.

**Rationale:** Before-hooks are preconditions — if they fail, the skill should
not run. After-hooks are side effects — if they fail, the main work is already
complete and should not be rolled back.

## Circular Dependency Detection

The loader must detect circular hook dependencies at config-merge time:

- Skill A hooks skill B
- Skill B hooks skill A (directly or transitively)

This is validation rule 23. The loader rejects the config with:

```
Error: Circular hook dependency detected: create-requirements-package →
navigate-knowledge-base → create-requirements-package
```

## Interaction with `per-increment-closing-skill`

The `per-increment-closing-skill` field in `workflow-graph.yaml` is a separate
mechanism that runs a skill after each increment within `execute-increments`.
It is **not** a hook — it is workflow-graph configuration.

Hooks apply at skill boundaries (before Step 0, after final step). The
`per-increment-closing-skill` runs within the skill's step loop.

**Coexistence:** Both mechanisms coexist. A hook on `execute-increments` fires
once before/after the entire skill. The `per-increment-closing-skill` fires
after each INC-XXX within the skill.

## Example: Full Hook Execution Trace

**Configuration:**

```toml
# customizations/create-requirements-package.toml

[[hooks]]
code = "kb-load"
event = "before"
skill = "navigate-knowledge-base"
priority = 100
condition = "project.paths.knowledge_base_path != ''"

[[hooks]]
code = "track-change"
event = "after"
skill = "track-change"
priority = 500
```

**Execution trace:**

```
> /create-requirements-package

Evaluating before-hooks...
  kb-load: condition "project.paths.knowledge_base_path != ''" → true
Running before-hook: navigate-knowledge-base (code: kb-load)

[navigate-knowledge-base executes and completes]

Proceeding to create-requirements-package Step 0...

[Steps 0..N execute]

[Review gate from workflow-graph.yaml]

Evaluating after-hooks...
  track-change: no condition → runs unconditionally
Running after-hook: track-change (code: track-change)

[track-change executes and completes]

## Next skill: review-requirements-package
```

## Implementation Checklist

For skill implementers adding hook support:

- [ ] Load hooks from merged config at skill start
- [ ] Partition hooks by `event` and sort by `priority`
- [ ] Evaluate `condition` before each hook
- [ ] Prompt user for `optional` hooks
- [ ] Announce every hook (running or skipped)
- [ ] Invoke hooked skills with proper error handling
- [ ] Halt on before-hook failure; log-and-continue on after-hook failure
- [ ] Do not confuse hooks with `per-increment-closing-skill`
