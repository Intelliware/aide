---
slug: ux-design
title: "UX Design"
applies-to: [greenfield-design-package, brownfield-enhancement-spec]
requires-decision-from: [architect, lead-dev, product-owner]
optional: true
order-hint: 12
---

## 12. UX Design

<!-- User experience specifications that guide frontend implementation. -->

### 12.1 Design System

- **Component Library:** [e.g., shadcn/ui]
- **Styling Framework:** [e.g., Tailwind CSS]
- **Color Palette:** [Define primary, secondary, success, warning, error colors]
- **Typography:** [Define font family, sizes, weights]

### 12.2 Navigation Patterns

[Describe sidebar, top nav, breadcrumbs, and navigation behavior.]

### 12.3 Responsive Design

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| [e.g., Desktop] | [e.g., ≥ 1280px] | [e.g., Sidebar + content] |
| [e.g., Tablet] | [e.g., ≥ 1024px] | [e.g., Collapsible sidebar] |
| | | |

### 12.4 User Flows

<!-- Detailed interaction flows for key workflows. Use step-by-step descriptions, not wireframes. -->

#### [Flow Name, e.g., Create Allocation Request]

1. [e.g., User navigates to Projects → selects project → clicks "Request Resource"]
2. [e.g., Form appears with: Practitioner (searchable dropdown), Start/End dates, Percentage]
3. [e.g., System validates in real-time: availability check, over-allocation warning]
4. [e.g., User submits → success toast → redirects to allocation detail view]
