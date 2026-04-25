---
slug: permissions-access-control
title: "Permissions & Access Control"
applies-to: [greenfield-requirements-package, brownfield-enhancement-spec]
requires-decision-from: [product-owner, security]
optional: false
order-hint: 10
---

# 10. Permissions & Access Control

> **Part of:** [Project Name] — Requirements Package
>
> **Purpose:** Define who can do what. This feeds directly into RBAC implementation in Solution Design.

---

## 10.1 User Roles

| Role | Description | User Count (Est.) |
|------|------------|------------------|
| [e.g., Administrator] | [e.g., Full system access, user management] | [e.g., 2-5] |
| [e.g., Resource Manager] | [e.g., Manages practitioner assignments and availability] | [e.g., 10-20] |
| [e.g., Delivery Manager] | [e.g., Manages projects and requests resources] | [e.g., 20-50] |
| [e.g., Practitioner] | [e.g., Views own profile and assignments] | [e.g., 200-500] |

## 10.2 Permission Matrix

<!-- For each major action, which roles can perform it? -->

| Action | Administrator | Resource Manager | Delivery Manager | Practitioner |
|--------|:---:|:---:|:---:|:---:|
| [e.g., Create Practitioner Profile] | ✅ | ✅ | ❌ | ❌ |
| [e.g., Edit Own Profile] | ✅ | ✅ | ✅ | ✅ |
| [e.g., View All Practitioners] | ✅ | ✅ | ❌ | ❌ |
| [e.g., Approve Allocation Request] | ✅ | ✅ | ❌ | ❌ |
| [e.g., Create Allocation Request] | ✅ | ✅ | ✅ | ❌ |
| | | | | |

## 10.3 Data Access Rules

<!-- Rules that govern data visibility beyond simple CRUD permissions. -->

- [e.g., Practitioners can only see their own profile and allocations]
- [e.g., Delivery Managers can only see projects they own]
- [e.g., Resource Managers can see all practitioners and allocations]
- [e.g., Administrators have unrestricted access]
