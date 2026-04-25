---
slug: views-dashboards
title: "Views & Dashboards"
applies-to: [greenfield-requirements-package, brownfield-enhancement-spec]
requires-decision-from: [product-owner, stakeholder]
optional: true
order-hint: 8
---

# 8. Views & Dashboards

> **Part of:** [Project Name] — Requirements Package
>
> **Purpose:** Define the INFORMATION ARCHITECTURE — WHAT information to show and to whom. This is NOT UI design. Focus on data requirements, not layout or styling.

---

## 8.1 Navigation Structure

<!-- High-level information hierarchy. What major areas exist and who can see them? -->

| Area | Description | Accessible By |
|------|------------|---------------|
| [e.g., Dashboard] | [e.g., Role-specific overview with key metrics] | [e.g., All authenticated users] |
| [e.g., People] | [e.g., Practitioner profiles and availability] | [e.g., Resource Managers, Administrators] |
| | | |

## 8.2 Dashboard Views by Role

<!-- For each role, what information should their dashboard display? -->

### [Role Name] Dashboard

**Key Metrics:**
- [e.g., Number of pending allocation requests]
- [e.g., Team utilization rate]
- [e.g., Upcoming allocation expirations]

**Primary Data:**
- [e.g., List of pending approvals with priority indicators]
- [e.g., Team availability overview for next 4 weeks]

**Quick Actions:**
- [e.g., Approve/reject pending requests]
- [e.g., View practitioner details]

## 8.3 List Views

<!-- For each entity, what information should be visible in list/table views? -->

### [Entity Name] List View

| Column | Description | Sortable | Filterable |
|--------|------------|----------|-----------|
| [e.g., Name] | [e.g., Full name of practitioner] | Yes | Yes (text search) |
| [e.g., Status] | [e.g., Active/Inactive] | Yes | Yes (dropdown) |
| | | | |

## 8.4 Filter & Sort Requirements

<!-- What filtering and sorting capabilities are needed? -->

| Entity | Available Filters | Default Sort |
|--------|------------------|-------------|
| [e.g., Practitioners] | [e.g., Status, Skills, Availability, Department] | [e.g., Last Name ascending] |
| | | |
