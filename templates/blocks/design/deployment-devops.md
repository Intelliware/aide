---
slug: deployment-devops
title: "Deployment & DevOps"
applies-to: [greenfield-design-package, brownfield-enhancement-spec]
requires-decision-from: [architect, ops]
optional: false
order-hint: 13
---

## 13. Deployment & DevOps

### 13.1 Environment Strategy

| Environment | Purpose | URL | Deployment |
|------------|---------|-----|-----------|
| [e.g., Development] | [e.g., Active development] | [e.g., localhost] | [e.g., Local Docker Compose] |
| [e.g., Staging] | [e.g., Pre-production testing] | [e.g., staging.example.com] | [e.g., Auto-deploy on merge to main] |
| [e.g., Production] | [e.g., Live system] | [e.g., app.example.com] | [e.g., Manual approval gate] |

### 13.2 CI/CD Pipeline

[Describe the build, test, and deployment pipeline stages.]

### 13.3 Container Strategy

[Describe Dockerfiles, image registry, container orchestration.]

### 13.4 Rollback Strategy

[How to roll back a failed deployment.]
