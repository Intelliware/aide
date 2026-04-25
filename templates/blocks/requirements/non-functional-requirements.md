---
slug: non-functional-requirements
title: "Non-Functional Requirements"
applies-to: [greenfield-requirements-package, brownfield-enhancement-spec]
requires-decision-from: [product-owner, architect, ops, security]
optional: false
order-hint: 11
---

# 11. Non-Functional Requirements

> **Part of:** [Project Name] — Requirements Package
>
> **Purpose:** Define system qualities — HOW the system should perform, not WHAT it does. These drive architecture decisions in Solution Design.

---

## 11.1 Performance Requirements

| Requirement | Target | Measurement |
|------------|--------|-------------|
| [e.g., Page load time] | [e.g., < 2 seconds] | [e.g., 95th percentile] |
| [e.g., API response time] | [e.g., < 500ms] | [e.g., 95th percentile, excluding batch operations] |
| [e.g., Concurrent users] | [e.g., 100 simultaneous] | [e.g., During peak hours] |

## 11.2 Scalability Requirements

- [e.g., System must support growth from 500 to 2,000 practitioners without redesign]
- [e.g., Data volume expected to grow 20% year-over-year]

## 11.3 Security Requirements

- [e.g., All data must be encrypted at rest and in transit]
- [e.g., Single Sign-On via corporate identity provider]
- [e.g., Session timeout after 30 minutes of inactivity]
- [e.g., Audit logging for all data modifications]

## 11.4 Usability Requirements

- [e.g., System must be usable without training for basic tasks]
- [e.g., Must support modern browsers (Chrome, Firefox, Safari, Edge — latest 2 versions)]
- [e.g., Must meet WCAG 2.1 AA accessibility standards]

## 11.5 Reliability Requirements

- [e.g., 99.5% uptime during business hours]
- [e.g., Planned maintenance windows: weekends only]
- [e.g., Maximum acceptable data loss: 1 hour (RPO)]
- [e.g., Maximum acceptable downtime: 4 hours (RTO)]

## 11.6 Compliance Requirements

- [e.g., PII handling must comply with organizational data policy]
- [e.g., Financial data must comply with SOX requirements]
- [e.g., All audit records must be retained for 7 years]
