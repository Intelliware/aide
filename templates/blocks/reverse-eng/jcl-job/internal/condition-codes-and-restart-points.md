---
slug: condition-codes-and-restart-points
title: "Condition Codes and Restart Points"
applies-to: [re-jcl-job-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 160
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 6. Condition Codes and Restart Points

Per-job execution control: `COND=`, `IF (RC=…)`, `EVEN`, `ONLY` clauses; restart points after step failure.

### 6.1 COND= and IF/ELSE Inventory

For each step that executes conditionally, document the predicate.

| Job | Step | Predicate Form | Predicate Meaning | Effect |
|---|---|---|---|---|
| [JOBNAME] | STEP020 | COND=(0,LT,STEP010) | run STEP020 unless STEP010 RC > 0 | STEP020 is the "happy path" continuation |
| [JOBNAME] | STEP030 | COND=(0,GE,STEP010) | run STEP030 unless STEP010 RC < 0 (always for COBOL programs) | STEP030 is the "always-run cleanup" step |
| [JOBNAME] | STEP040 | IF (STEP020.RC > 4) THEN ... ENDIF | run only if STEP020 emitted warnings | STEP040 is the "warnings handler" |
| [JOBNAME] | STEP050 | EVEN | run even if any prior step abended | STEP050 is the unconditional cleanup |
| [JOBNAME] | STEP060 | ONLY | run only if any prior step abended | STEP060 is the abend-only handler |

### 6.2 Step Inversion in COND=

COND=(value,operator,STEP) is read inversely: `COND=(0,LT,STEP)` means "skip this step IF STEP RC < 0." Document the convention for new readers.

### 6.3 Restart Points

For each job, document the restart-from-checkpoint discipline.

| Job | Restart From | Mechanism | Required Prior State |
|---|---|---|---|
| [JOBNAME] | STEP010 | re-run from start; generation roll-back | PRIORDD (-1) generation present |
| [JOBNAME] | STEP020 | resume after STEP010 succeeds; STEP010 not re-run | STEP010 output already produced |

### 6.4 Restart-Forbidden Steps

Some steps must never be re-run (e.g. an `IDCAMS DELETE` of the predecessor's output). Flag them.

| Job | Step | Reason |
|---|---|---|
| [JOBNAME] | STEP030 | DELETE non-recoverable; would destroy STEP020 output if re-run after STEP020 succeeded |

### 6.5 Restart Operator Procedure

Document the operator-side procedure for restarts:

1. Identify the failed step and the RC
2. Cross-reference this block to find the restart point
3. Verify the prior-state requirement is met
4. Re-submit the job with `RESTART=` parameter or as appropriate

### 6.6 Catastrophic Abend Handling

For abends that cannot follow the normal restart path (e.g. data corruption detected mid-step), document the escalation path.

| Job | Abend Code | Escalation |
|---|---|---|
| [JOBNAME] | U4038 | rebind DBRM; notify oncall; re-run from STEP010 |
| [JOBNAME] | S0C7 | bad input data; notify ops; correct and re-submit |
