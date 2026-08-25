---
slug: code-examples
title: "Code Examples"
applies-to: [re-cobol-program-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 370
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 16. Code Examples

Curated illustrative snippets verified against the actual source. Each example cites source lines.

### 16.1 Standard Mainline (batch)

```cobol
       PROCEDURE DIVISION.
       0000-MAINLINE.
           PERFORM 1000-INIT
           PERFORM 2000-PROCESS UNTIL EOF-CUST
           PERFORM 9000-TERMINATE
           GOBACK
           .
```
Source: [path/to/program.cbl:N-M]

### 16.2 Standard Mainline (CICS pseudo-conversational)

```cobol
       PROCEDURE DIVISION USING DFHCOMMAREA.
       0000-MAINLINE.
           IF EIBCALEN = 0
              PERFORM 1000-FIRST-PASS
           ELSE
              PERFORM 2000-CONTINUATION
           END-IF
           EXEC CICS RETURN
                TRANSID('TXY1')
                COMMAREA(LK-COMMAREA)
           END-EXEC
           .
```
Source: [path/to/cicsprog.cbl:N-M]

### 16.3 Centralised SQLCODE Check

```cobol
       9100-CHECK-SQL.
           EVALUATE TRUE
              WHEN SQLCODE = 0
                 CONTINUE
              WHEN SQLCODE = +100
                 SET WS-NO-ROW TO TRUE
              WHEN SQLCODE = -805
                 DISPLAY 'DBRM not bound; abending'
                 CALL 'CEE3ABD' USING U4038-VALUE 0
              WHEN OTHER
                 DISPLAY 'SQLCODE: ' SQLCODE
                 EXEC SQL ROLLBACK END-EXEC
                 PERFORM 9999-ABEND
           END-EVALUATE
           .
```
Source: [path/to/program.cbl:N-M]

### 16.4 Centralised PCB Status Check (IMS)

```cobol
       9100-CHECK-DLI.
           EVALUATE TRUE
              WHEN CUST-PCB-STATUS = SPACES
                 CONTINUE
              WHEN CUST-PCB-STATUS = 'GE'
                 SET WS-NO-SEGMENT TO TRUE
              WHEN OTHER
                 DISPLAY 'PCB STATUS: ' CUST-PCB-STATUS
                 PERFORM 9999-ABEND
           END-EVALUATE
           .
```
Source: [path/to/imsprog.cbl:N-M]

### 16.5 Cursor Loop

```cobol
       2000-PROCESS.
           EXEC SQL OPEN CUST-CUR END-EXEC
           PERFORM 2100-FETCH UNTIL WS-NO-ROW OR ERROR
           EXEC SQL CLOSE CUST-CUR END-EXEC
           .
       2100-FETCH.
           EXEC SQL FETCH CUST-CUR INTO :CUST-RECORD END-EXEC
           PERFORM 9100-CHECK-SQL
           IF NOT WS-NO-ROW
              PERFORM 2200-PROCESS-ROW
           END-IF
           .
```
Source: [path/to/program.cbl:N-M]
