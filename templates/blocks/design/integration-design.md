---
slug: integration-design
title: "Integration Design"
applies-to: [greenfield-design-package, brownfield-enhancement-spec]
requires-decision-from: [architect, lead-dev]
optional: true
order-hint: 9
---

## 9. Integration Design

<!-- External system integrations and their technical specifications. -->

### 9.1 Integration Overview

| System | Direction | Protocol | Purpose |
|--------|-----------|----------|---------|
| [e.g., Microsoft Entra ID] | [Bidirectional] | [OAuth2/OIDC] | [e.g., SSO authentication] |
| [e.g., SMTP Server] | [Outbound] | [SMTP/TLS] | [e.g., Email notifications] |
| | | | |

### 9.2 [Integration Name] Integration

**Purpose:** [What this integration does]
**Protocol:** [How they communicate]
**Authentication:** [How the systems authenticate to each other]
**Error Handling:** [What happens when the integration fails]
**Retry Strategy:** [How failures are retried]

<!-- Repeat for each integration -->
