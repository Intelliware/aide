---
slug: security-and-racf-considerations
title: "Security and RACF Considerations"
applies-to: [re-jcl-job-internal]
requires-decision-from: [architect]
optional: false
order-hint: 190
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 9. Security and RACF Considerations

Document the RACF (or Top Secret / ACF2) controls that apply to these jobs and their datasets. Consumers and ops need this to understand who can submit, override, or read job output.

### 9.1 Submitter Identity

| Job | Authorised Submitter Group | NOTIFY Default | Notes |
|---|---|---|---|
| [JOBNAME] | BILLOPS | &SYSUID | runs unattended via Control-M |
| [JOBNAME] | BILLOPS, BILLDEV | &SYSUID | dev can submit in test region only |

### 9.2 USER and SUBSYS

For jobs that override the default user via `USER=` or run under a specific subsystem (`SUBSYS=`), document.

| Job | USER= | SUBSYS= | Reason |
|---|---|---|---|
| [JOBNAME] | BILLBATCH | (default) | runs as service user with elevated DB2 privileges |

### 9.3 Dataset Class Permissions

| DSN Class | Read | Write | Allocate | Delete |
|---|---|---|---|---|
| PROD.BILLING.* | BILLOPS, BILLDEV (read-only in TEST) | BILLOPS | BILLOPS | BILLOPS |
| PROD.CUSTOMER.* | BILLOPS (read-only) | CUSTOPS | CUSTOPS | CUSTOPS |
| PROD.AUDIT.* | AUDITOR | (none — append-only) | AUDITOR | (none) |

### 9.4 Program-Level Authorities

For programs that require special RACF authorities (e.g. APF-authorised library, BPX user, surrogate authority), document.

| Program | Required Authority | Reason |
|---|---|---|
| [PROGNAME] | APF-authorised | uses SVC 99 dynamic allocation |
| [PROGNAME] | SURROGAT BILLBATCH | runs as BILLBATCH for DB2 BIND |

### 9.5 DB2 Authorities

For jobs that BIND or run authorised DB2 utilities, document the package / collection authorities required.

| Job | DB2 Authority | Reason |
|---|---|---|
| [JOBNAME] | BIND PACKAGE BILLING.* | nightly bind step |
| [JOBNAME] | EXEC ON COLLECTION BILLING | run-time access |

### 9.6 Sensitive Data in JCL

Hard-coded passwords, encryption keys, or personally-identifying values in JCL are flagged. Use ICSF / PassPhrase / RACF-managed credentials instead.

| Job | Sensitive Item | Recommendation |
|---|---|---|
| (none found) | — | — |
| [example] | PASS=hardcoded | move to RACF-managed credential store |

### 9.7 Audit Trail

| Audit Source | Captured | Retained |
|---|---|---|
| SMF type 30 (job summary) | yes | 1 year |
| SMF type 80 (RACF) | yes | 7 years |
| BILLDD audit fields written by program | yes | indefinite (PROD.AUDIT) |
