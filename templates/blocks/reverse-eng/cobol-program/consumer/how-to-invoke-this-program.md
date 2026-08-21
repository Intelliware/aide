---
slug: how-to-invoke-this-program
title: "How to Invoke This Program"
applies-to: [re-cobol-program-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 290
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 17. How to Invoke This Program

Per program, document the canonical invocation form for consumers. Forms differ by execution context (batch / CICS / IMS).

### 17.1 Batch Invocation (JCL)

```jcl
//STEP010 EXEC PGM=[PROGNAME],REGION=[size]M
//STEPLIB DD DSN=[load.library],DISP=SHR
//[DD-NAMES per expected-dd-bindings] DD ...
//SYSOUT  DD SYSOUT=*
//SYSUDUMP DD SYSOUT=*
```

| Program ID | Expected REGION | RC discipline | Notes |
|---|---|---|---|
| [PROGNAME] | [4M] | 0 = success; 4 = warnings; >4 = halt downstream | [JCL fragment to use] |

### 17.2 CICS Invocation

For CICS programs, list the entry mechanism: transaction-driven, LINK from another program, XCTL from another program.

| Program ID | Entry Form | Trigger | COMMAREA Required | Notes |
|---|---|---|---|---|
| [PROGNAME] | TRANSID | TXY1 | yes / no | first-pass and continuation paths |
| [PROGNAME] | LINK | from XYZ | yes — see commarea-and-linkage-contract | LINK returns; XCTL does not |

### 17.3 IMS Invocation

| Program ID | Region Type | Entry | Driver |
|---|---|---|---|
| [PROGNAME] | MPP | DLITCBL with PCB list | IMS message queue (transaction code TXYY) |
| [PROGNAME] | BMP | DLITCBL with PCB list | scheduled via JCL invoking BMP region |

### 17.4 Subroutine Invocation (callable from another COBOL program)

If callable from other COBOL, document the calling form:

```cobol
       CALL '[PROGNAME]' USING [LINKAGE-01-LEVELS in order]
           ON EXCEPTION
              [error-handling]
       END-CALL
```

| Program ID | Linkage Order | Required Caller Setup | Notes |
|---|---|---|---|
| [PROGNAME] | LK-INPUT, LK-OUTPUT, LK-STATUS | populate LK-INPUT before CALL | LK-STATUS returns 0 / 4 / 8 |
