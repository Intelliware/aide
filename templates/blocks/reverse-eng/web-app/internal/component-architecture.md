---
slug: component-architecture
title: "Component Architecture"
applies-to: [re-web-app-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 170
---

## 7. Component Architecture

### 7.1 Component Hierarchy

<!-- Show the component tree for the main layout. -->

```
<App>
  ├── <MainLayout>
  │   ├── <Header>
  │   │   ├── <Logo>
  │   │   ├── <Navigation>
  │   │   └── <UserMenu>
  │   ├── <Sidebar>
  │   │   ├── <NavLink> (Dashboard)
  │   │   ├── <NavLink> (Tickets)
  │   │   ├── <NavLink> (Users)
  │   │   └── <NavLink> (Settings)
  │   └── <MainContent>
  │       └── <Router Outlet> → Current Feature
  │
  └── <ModalProvider>
      └── <ToastContainer>
```

### 7.2 Component Documentation Template

<!-- Use this for documenting each major component. -->

**Component: `[ComponentName]`**

- **Location:** `src/features/[feature]/components/[ComponentName]`
- **Purpose:** [One sentence describing what it does]
- **Type:** [Presentational / Container / Layout]

**Props:**

| Prop Name   | Type         | Default | Required | Purpose                              |
|-------------|--------------|---------|----------|--------------------------------------|
| `prop1`     | `string`     | —       | Yes      | What this prop controls              |
| `prop2`     | `number`     | `10`    | No       | What this prop controls              |
| `onAction`  | `() => void` | —       | No       | Callback fired when action happens   |

**State (if applicable):**
- `[stateName]`: [Type and purpose]

**Outputs/Events (if applicable):**
- `onActionName`: Fired when [event] happens. Payload: [type]

**Usage Example:**

```typescript
<[ComponentName]
  prop1="value"
  prop2={20}
  onAction={() => console.log('Action!')}
/>
```

**Edge Cases:**
- [e.g., "If prop1 is empty string, component shows placeholder text."]
- [e.g., "Maximum 100 items in list; longer lists must use pagination."]

---

# Part 3 — Integration
