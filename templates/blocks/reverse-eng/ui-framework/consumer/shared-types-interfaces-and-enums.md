---
slug: shared-types-interfaces-and-enums
title: "Shared Types, Interfaces, and Enums"
applies-to: [re-ui-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 180
---

## 8. Shared Types, Interfaces, and Enums

<!-- AI models constantly invent plausible-but-wrong type names. This section is critical. List EVERY public type, interface, and enum that appears in any method signature, input, or output above. -->

### 8.1 Interfaces

```typescript
// List every public interface with full type definition

export interface FwColumnDef<T = any> {
  field: keyof T;
  header: string;
  sortable?: boolean;           // Default: false
  width?: string;               // e.g., '200px', '30%'
  cellRenderer?: TemplateRef<FwCellContext<T>>;
}

export interface FwCellContext<T> {
  $implicit: T;
  index: number;
  column: FwColumnDef<T>;
}

export interface FwFilterCriteria {
  field: string;
  operator: FwFilterOperator;
  value: any;
}

export interface FwPaginationConfig {
  pageSize: number;
  pageSizeOptions: number[];
  showFirstLastButtons?: boolean; // Default: true
}

export interface FwMenuItem {
  label: string;
  icon?: string;
  route?: string;
  children?: FwMenuItem[];
  badge?: string | number;
  disabled?: boolean;
  visible?: boolean | (() => boolean);
}

// ... list ALL public interfaces
```

### 8.2 Enums

```typescript
export enum FwFilterOperator {
  Equals = 'eq',
  NotEquals = 'neq',
  Contains = 'contains',
  GreaterThan = 'gt',
  LessThan = 'lt',
  Between = 'between',
  In = 'in',
}

export enum FwDialogSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
  FullScreen = 'fullscreen',
}

export enum FwToastSeverity {
  Success = 'success',
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
}

// ... list ALL public enums
```

### 8.3 Type Aliases

```typescript
export type FwSortDirection = 'asc' | 'desc' | null;
export type FwButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type FwSize = 'sm' | 'md' | 'lg';

// ... list ALL public type aliases
```
