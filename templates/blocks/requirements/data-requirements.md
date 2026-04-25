---
slug: data-requirements
title: "Data Requirements"
applies-to: [greenfield-requirements-package, brownfield-enhancement-spec, quick-dev-spec]
requires-decision-from: [product-owner, data-engineer]
optional: false
order-hint: 9
---

# 9. Data Requirements

> **Part of:** [Project Name] — Requirements Package
>
> **Purpose:** Define WHAT data the system needs from a BUSINESS perspective. This is not a database schema — it defines entities, attributes, and relationships that Solution Design will translate into technical specifications.

---

## 9.1 Core Entities

<!-- List the main data objects the system must manage. -->

| Entity | Description | Key Attributes | Relationships |
|--------|------------|----------------|---------------|
| [e.g., Practitioner] | [e.g., A person who can be assigned to projects] | [e.g., Name, Email, Skills, Status] | [e.g., Has many Allocations, Has many Skills] |
| [e.g., Project] | [e.g., A work engagement requiring resources] | [e.g., Name, Client, Status, Dates] | [e.g., Has many Allocations, Has many Open Roles] |
| | | | |

## 9.2 Entity Details

<!-- For each core entity, detail the required attributes. -->

### [Entity Name]

| Attribute | Description | Required | Type | Constraints |
|-----------|------------|----------|------|-------------|
| [e.g., First Name] | [e.g., Legal first name] | Yes | Text | [e.g., Max 100 chars] |
| [e.g., Email] | [e.g., Corporate email address] | Yes | Email | [e.g., Unique, case-insensitive] |
| [e.g., Status] | [e.g., Active/Inactive] | Yes | Enum | [e.g., Default: Active] |
| | | | | |

## 9.3 Relationships

<!-- Define how entities relate to each other. -->

| Entity A | Relationship | Entity B | Cardinality | Description |
|----------|-------------|----------|-------------|-------------|
| [e.g., Practitioner] | [has many] | [Allocations] | [1:N] | [e.g., One practitioner can have multiple allocations] |
| [e.g., Allocation] | [belongs to] | [Project] | [N:1] | [e.g., Each allocation is for one project] |
| | | | | |

## 9.4 Historical Data Requirements

<!-- What data must be kept historically? What are the retention needs? -->

- [e.g., All allocation changes must maintain an audit trail]
- [e.g., Practitioner profile changes must be tracked with timestamp and user]
- [e.g., Data retention: Active records indefinite, deactivated records 7 years]

## 9.5 External Data Sources

<!-- What existing systems or databases must data come from or go to? -->

| Source/Destination | Data | Direction | Frequency |
|-------------------|------|-----------|-----------|
| [e.g., HR System] | [e.g., Employee records] | [Inbound] | [e.g., Nightly sync] |
| [e.g., Entra ID] | [e.g., User authentication] | [Bidirectional] | [e.g., Real-time] |
| | | | |
