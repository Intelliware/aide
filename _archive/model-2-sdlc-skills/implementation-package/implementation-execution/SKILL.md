---
name: implementation-execution
description: Executes an approved implementation plan task-by-task with TDD, verification-before-completion, debugging, testing, and optional subagent-driven development. Use when the user says "execute implementation plan", "start implementation execution", "run TDD implementation", "implement the plan", "work through implementation tasks", "run implementation phase", or asks to turn an approved implementation plan into working code.
---

# Implementation Execution

Use this skill to execute the approved implementation plan.

## Instructions

1. Read [implementation-execution-workflow.md](references/implementation-execution-workflow.md).
2. Confirm the implementation plan and project context exist.
3. Ask the user to choose inline execution or subagent-driven execution.
4. Follow the workflow one task at a time.
5. Verify each task before marking it complete.

## Key Rules

- Do not write production code before a failing test. For non-code or genuinely test-inapplicable tasks, document why the TDD loop does not apply before executing.
- Do not claim completion without fresh verification evidence from the current turn.
- Do not proceed past failed verification; debug and fix first.
- Do not start PR/handoff until all implementation tasks are complete and verified.
