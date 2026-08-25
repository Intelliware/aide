---
slug: integration-examples
title: "Integration Examples"
applies-to: [re-cobol-program-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 340
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 22. Integration Examples

End-to-end examples showing consumers how to integrate with each program. Snippets are illustrative; real integration must be verified against the program's documented contract.

### 22.1 Batch JCL Example

```jcl
//[STEPNAME] EXEC PGM=[PROGNAME],REGION=4M,COND=(0,LT)
//STEPLIB    DD DSN=PROD.LOAD.LIB,DISP=SHR
//CUSTDD     DD DSN=PROD.CUSTOMER.MASTER,DISP=SHR
//BILLDD     DD DSN=PROD.BILLING.OUTPUT(+1),DISP=(NEW,CATLG,DELETE),
//              DCB=(LRECL=200,RECFM=FB),
//              SPACE=(CYL,(50,10),RLSE)
//ERRDD      DD DSN=PROD.BILLING.ERR(+1),DISP=(NEW,CATLG,DELETE),...
//SYSOUT     DD SYSOUT=*
//SYSUDUMP   DD SYSOUT=*
```

### 22.2 CICS LINK from Calling Program

```cobol
       WORKING-STORAGE SECTION.
       01  LK-COMMAREA       COPY LSCOMM.
       01  LK-LENGTH         PIC S9(4) COMP VALUE +200.

       PROCEDURE DIVISION.
           SET BA-V2 TO TRUE
           MOVE WS-CUST-ID TO BA-CUST-ID

           EXEC CICS LINK
                PROGRAM('[PROGNAME]')
                COMMAREA(LK-COMMAREA)
                LENGTH(LK-LENGTH)
                RESP(WS-RESP)
           END-EXEC

           IF WS-RESP NOT = DFHRESP(NORMAL)
              PERFORM 9100-HANDLE-LINK-FAILURE
           END-IF

           IF BA-RESULT = 'OK'
              PERFORM 2000-PROCESS-RESULT
           ELSE
              PERFORM 9200-HANDLE-BUSINESS-FAILURE
           END-IF
           .
```

### 22.3 COBOL CALL Example

```cobol
       WORKING-STORAGE SECTION.
       01  WS-INPUT          COPY LSINPT.
       01  WS-OUTPUT         COPY LSOUT.
       01  WS-STATUS         PIC S9(9) COMP.

       PROCEDURE DIVISION.
           MOVE WS-CUST-ID    TO WI-CUST-ID
           MOVE WS-AMOUNT     TO WI-AMOUNT

           CALL '[PROGNAME]' USING WS-INPUT, WS-OUTPUT, WS-STATUS
                ON EXCEPTION
                   PERFORM 9100-HANDLE-CALL-FAILURE
           END-CALL

           EVALUATE WS-STATUS
              WHEN ZERO  PERFORM 2000-PROCESS-RESULT
              WHEN +4    PERFORM 9200-WARN
              WHEN OTHER PERFORM 9300-FAIL
           END-EVALUATE
           .
```

### 22.4 IMS MPP TRANSID Driver

For an IMS-MPP program, the consumer drives by sending a message with the program's TRANSID. Document the message format the program expects.

| Program ID | TRANSID | Message Layout Copybook | Notes |
|---|---|---|---|
| [PROGNAME] | TXY1 | LSTXY1IN | 80-byte fixed input |
