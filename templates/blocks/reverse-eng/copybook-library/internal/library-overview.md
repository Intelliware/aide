---
slug: library-overview
title: "Library Overview"
applies-to: [re-copybook-library-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 110
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 1. Library Overview

### 1.1 What This Library Is

- **Library:** [Library Name]
- **Path:** [path/to/COPYBOOK]
- **Source-control system:** [Endevor / ChangeMan / Panvalet / Git]
- **Source version of record:** [package / commit / tag]
- **Audience:** [maintainers, data architects, downstream COBOL programs]

### 1.2 Library Statistics

| Metric | Value |
|---|---|
| Total `.cpy` files | [N] |
| Distinct naming-convention buckets | [N] |
| Copybooks with REDEFINES | [N] |
| Copybooks with OCCURS DEPENDING ON | [N] |
| Copybooks with level-88 condition names | [N] |
| Auto-generated copybooks (DCLGEN, DBD-derived) | [N] |
| Divergent copybooks (same name, different content) | [N] |
| Deprecated copybooks (header-marked) | [N] |

### 1.3 Library Organisation

| Directory / Pattern | Purpose | Example |
|---|---|---|
| [COPYBOOK/IO-*] | file record layouts | IO-CUSTREC |
| [COPYBOOK/WS-*] | shared working-storage groups | WS-COUNTERS |
| [COPYBOOK/LS-*] | linkage / commareas | LS-COMMAREA |
| [COPYBOOK/DB2-*] | DCLGEN-generated | DB2-CUSTOMER |
| [COPYBOOK/IMS-*] | IMS DBD-derived segment layouts | IMS-CUSTSEG |

### 1.4 Maintenance Posture

| Aspect | Convention |
|---|---|
| Edits to canonical copybooks | go through architectural review |
| Edits to DCLGEN copybooks | regenerate from DDL; never edit by hand |
| Edits to IMS-derived copybooks | regenerate from DBD; never edit by hand |
| Adding new copybooks | new file; assign naming-convention bucket |
| Deprecating copybooks | header-mark `*DEPRECATED*`; do not delete |
