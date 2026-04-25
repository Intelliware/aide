---
slug: quick-reference-cheat-sheet
title: "Quick Reference Cheat Sheet"
applies-to: [re-ui-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 340
---

## 24. Quick Reference Cheat Sheet

<!-- A condensed, scannable reference for common tasks. AI models benefit from this as a fast lookup before generating code. -->

### Scaffolding
```bash
# New feature:          [command or file creation steps]
# New component:        [command]
# New service/store:    [command]
```

### Common Imports
```typescript
// Components
import { FwButton, FwCard, FwTable, FwDialog } from '@orgname/framework-components';

// Services
import { FwAuthService, FwToastService, FwDialogService } from '@orgname/framework-core';

// Types
import { FwColumnDef, FwPaginationConfig, FwMenuItem } from '@orgname/framework-core';

// Validators
import { FwValidators } from '@orgname/framework-forms';

// Testing
import { provideFwTestingModule, MockFwAuthService } from '@orgname/framework-testing';
```

### Common Template Patterns
```html
<!-- Button -->
<fw-button variant="primary" (clicked)="onSave()">Save</fw-button>

<!-- Table with columns -->
<fw-table [data]="items" [columns]="columns" (rowClicked)="onSelect($event)"></fw-table>

<!-- Form field with validation error display -->
<fw-form-field label="Email" [control]="form.controls.email">
  <input fwInput formControlName="email" />
</fw-form-field>

<!-- Dialog trigger -->
<!-- Show the framework's recommended pattern for opening a dialog -->

<!-- Toast -->
<!-- Show the one-liner for triggering a toast notification -->
```

### Route Template
```typescript
export const routes: Routes = [
  {
    path: '',
    component: FeatureShellComponent,
    children: [
      { path: '', component: ListComponent },
      { path: 'create', component: FormComponent },
      { path: ':id', component: DetailComponent },
      { path: ':id/edit', component: FormComponent },
    ],
  },
];
```
