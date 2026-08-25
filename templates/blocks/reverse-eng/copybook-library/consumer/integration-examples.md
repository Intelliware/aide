---
slug: integration-examples
title: "Integration Examples"
applies-to: [re-copybook-library-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 340
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 18. Integration Examples

End-to-end examples showing consumers how to integrate copybooks from this library into a COBOL program. Snippets are illustrative; actual code must be verified against the canonical record catalogue.

### 18.1 File Record Layout (IO- bucket)

```cobol
       FILE-CONTROL.
           SELECT CUST-FILE ASSIGN TO CUSTDD
                  ORGANIZATION SEQUENTIAL.

       DATA DIVISION.
       FILE SECTION.
       FD  CUST-FILE.
       01  CUST-RECORD COPY CUSTREC.
```

### 18.2 CICS COMMAREA (LS- bucket, REDEFINES variant)

```cobol
       LINKAGE SECTION.
       01  LK-COMMAREA COPY LSCOMM.

       PROCEDURE DIVISION USING LK-COMMAREA.
           IF BA-V2
              PERFORM 2000-PROCESS-V2
           ELSE IF BA-V1
              PERFORM 2100-PROCESS-V1
           ELSE
              PERFORM 9100-UNKNOWN-VERSION
           END-IF
           .
```

### 18.3 DB2 Host-Variable Copybook (DB2- bucket)

```cobol
       WORKING-STORAGE SECTION.
       01  CUSTOMER-HV COPY DB2-CUSTOMER.

       PROCEDURE DIVISION.
           EXEC SQL
                SELECT CUST_ID, CUST_NAME, CUST_STATUS
                  INTO :CUST-ID, :CUST-NAME :CUST-NAME-IND, :CUST-STATUS
                  FROM CUSTOMER
                 WHERE CUST_ID = :WS-CUST-ID
           END-EXEC
           PERFORM 9100-CHECK-SQL
           .
```

### 18.4 IMS Segment IO (IMS- bucket)

```cobol
       LINKAGE SECTION.
       01  CUST-PCB.
           02  CUST-PCB-DBNAME      PIC X(8).
           02  CUST-PCB-LEVEL       PIC X(2).
           02  CUST-PCB-STATUS      PIC X(2).
           02  ...                              (PCB layout)

       WORKING-STORAGE SECTION.
       01  CUST-IO-AREA COPY IMS-CUSTSEG.

       PROCEDURE DIVISION.
           EXEC DLI GU
                SEGMENT(CUSTSEG)
                INTO(CUST-IO-AREA)
                WHERE(CUST-ID = :WS-CUST-ID)
                USING PCB(CUST-PCB)
           END-EXEC
           PERFORM 9100-CHECK-DLI
           .
```

### 18.5 Variable-Length Record (OCCURS DEPENDING ON)

```cobol
       FILE SECTION.
       FD  BILL-FILE
           RECORDING MODE V
           RECORD VARYING FROM 4 TO 29974 CHARACTERS
                  DEPENDING ON WS-BILL-LEN.
       01  BILL-RECORD COPY BILLDETLS.

       WORKING-STORAGE SECTION.
       01  WS-BILL-LEN  PIC 9(9) COMP.

       PROCEDURE DIVISION.
           READ BILL-FILE INTO BILL-RECORD
           PERFORM VARYING IDX FROM 1 BY 1
                   UNTIL IDX > BILL-LINE-COUNT
              ...                          (process BILL-LINES(IDX))
           END-PERFORM
           .
```

### 18.6 COPY With REPLACING (specialised generic record)

```cobol
       01  CUSTOMER-CONTACT COPY :PFX:CONTACT REPLACING
              ==:PFX:== BY ==CUST==.
       *> Resulting fields: CUST-CONTACT-PHONE, CUST-CONTACT-EMAIL, ...
```
