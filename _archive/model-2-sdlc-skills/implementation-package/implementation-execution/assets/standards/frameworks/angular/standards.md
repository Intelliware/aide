# Angular Standards

## Purpose

These rules define Angular-specific conventions for component architecture, reactivity, routing, forms, and project organization. They supplement the common and TypeScript standards — general rules on error handling, naming, and typing are defined there and not repeated here.

## Applicability

All Angular 17+ projects using standalone components, signals, and TypeScript. Angular 16 projects can follow most rules but lack signal-based reactivity; Angular 15 and earlier require NgModules instead of standalone components.

## Rules

### NG-01: Use Standalone Components

**Severity:** Error
**Rule:** Create all new components, directives, and pipes as standalone (`standalone: true` is the default in Angular 17+) — do not create new NgModules.
**Why:** Standalone components simplify the dependency graph, eliminate module boilerplate, and enable fine-grained lazy loading.

**Compliant:**

```typescript
@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, OrderItemComponent],
  templateUrl: './order-list.component.html',
})
export class OrderListComponent {
  orders = input.required<Order[]>();
}
```

**Non-compliant:**

```typescript
// ❌ Creating a new NgModule to declare the component
@NgModule({
  declarations: [OrderListComponent],
  imports: [CommonModule],
  exports: [OrderListComponent],
})
export class OrderListModule {}

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
})
export class OrderListComponent {}
```

---

### NG-02: Use Signals for Reactive State

**Severity:** Warning
**Rule:** Use `signal()`, `computed()`, and `effect()` for component-level reactive state — reserve RxJS for async streams, HTTP calls, and cross-component event coordination.
**Why:** Signals provide fine-grained reactivity with simpler mental models and better change detection integration than BehaviorSubject patterns.

**Compliant:**

```typescript
@Component({ /* ... */ })
export class CartComponent {
  private readonly cartService = inject(CartService);

  items = signal<CartItem[]>([]);
  totalPrice = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  addItem(item: CartItem): void {
    this.items.update(current => [...current, item]);
  }
}
```

**Non-compliant:**

```typescript
// ❌ Using BehaviorSubject for simple component state
@Component({ /* ... */ })
export class CartComponent {
  private items$ = new BehaviorSubject<CartItem[]>([]);
  totalPrice$ = this.items$.pipe(
    map(items => items.reduce((sum, item) => sum + item.price * item.quantity, 0))
  );

  addItem(item: CartItem): void {
    this.items$.next([...this.items$.getValue(), item]);
  }
}
```

---

### NG-03: Use Typed Injection with `inject()`

**Severity:** Error
**Rule:** Use the `inject()` function with typed tokens for dependency injection — never use `any` for injected services.
**Why:** `inject()` provides better type inference, works naturally with standalone components, and avoids constructor parameter ordering issues.

**Compliant:**

```typescript
@Component({ /* ... */ })
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly analyticsService = inject(AnalyticsService);
  private readonly config = inject<AppConfig>(APP_CONFIG_TOKEN);
}
```

**Non-compliant:**

```typescript
// ❌ Constructor injection with untyped token
@Component({ /* ... */ })
export class DashboardComponent {
  constructor(
    private authService: AuthService,
    @Inject(APP_CONFIG_TOKEN) private config: any,  // untyped
  ) {}
}
```

---

### NG-04: Lazy Load Route Modules

**Severity:** Error
**Rule:** Use `loadComponent` or `loadChildren` in route configuration — never eagerly import feature modules or components in the root route config.
**Why:** Lazy loading is critical for bundle size; eagerly importing feature code increases initial load time and defeats tree shaking.

**Compliant:**

```typescript
export const appRoutes: Routes = [
  {
    path: 'orders',
    loadComponent: () =>
      import('./orders/order-list.component').then(m => m.OrderListComponent),
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./settings/settings.routes').then(m => m.settingsRoutes),
  },
];
```

**Non-compliant:**

```typescript
// ❌ Eagerly importing feature components at the root level
import { OrderListComponent } from './orders/order-list.component';
import { SettingsComponent } from './settings/settings.component';

export const appRoutes: Routes = [
  { path: 'orders', component: OrderListComponent },
  { path: 'settings', component: SettingsComponent },
];
```

---

### NG-05: Use Route Guards for Authorization

**Severity:** Error
**Rule:** Implement `CanActivateFn` guards for authorization checks — never check permissions inside component lifecycle hooks or templates.
**Why:** Guards centralize authorization logic, prevent unauthorized components from rendering at all, and keep permission checks testable in isolation.

**Compliant:**

```typescript
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasRole('admin')) {
    return true;
  }
  return router.createUrlTree(['/unauthorized']);
};

// In route config:
{
  path: 'admin',
  loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
  canActivate: [adminGuard],
}
```

**Non-compliant:**

```typescript
// ❌ Checking permissions inside the component
@Component({ /* ... */ })
export class AdminComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (!this.authService.hasRole('admin')) {
      this.router.navigate(['/unauthorized']);
    }
  }
}
```

---

### NG-06: Use `OnPush` Change Detection Strategy

**Severity:** Warning
**Rule:** Set `changeDetection: ChangeDetectionStrategy.OnPush` on all components — pair with signals or immutable data patterns.
**Why:** `OnPush` reduces unnecessary change detection cycles by only checking components when their inputs change or signals update, improving runtime performance.

**Compliant:**

```typescript
@Component({
  selector: 'app-product-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="product-card">
      <h3>{{ product().name }}</h3>
      <span>{{ formattedPrice() }}</span>
    </div>
  `,
})
export class ProductCardComponent {
  product = input.required<Product>();
  formattedPrice = computed(() => `$${this.product().price.toFixed(2)}`);
}
```

**Non-compliant:**

```typescript
// ❌ Default change detection with mutable state
@Component({
  selector: 'app-product-card',
  standalone: true,
  // missing changeDetection: ChangeDetectionStrategy.OnPush
  template: `
    <div class="product-card">
      <h3>{{ product.name }}</h3>
      <span>{{ getFormattedPrice() }}</span>
    </div>
  `,
})
export class ProductCardComponent {
  @Input() product!: Product;

  getFormattedPrice(): string {
    return `$${this.product.price.toFixed(2)}`;
  }
}
```

---

### NG-07: Use Directive Composition API

**Severity:** Convention
**Rule:** Compose shared behaviors using `hostDirectives` — prefer composition over inheritance for reusable component behaviors.
**Why:** Directive composition avoids deep class hierarchies, makes behavior explicit in metadata, and allows fine-grained reuse without tight coupling.

**Compliant:**

```typescript
@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective {
  text = input.required<string>({ alias: 'appTooltip' });
}

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective {
  color = input<string>('yellow');
}

@Component({
  selector: 'app-action-button',
  standalone: true,
  hostDirectives: [
    { directive: TooltipDirective, inputs: ['appTooltip: tooltip'] },
    { directive: HighlightDirective, inputs: ['color: highlightColor'] },
  ],
  template: `<button><ng-content /></button>`,
})
export class ActionButtonComponent {}
```

**Non-compliant:**

```typescript
// ❌ Using inheritance to share behavior
class TooltipBase {
  showTooltip(text: string): void { /* ... */ }
}

class HighlightBase extends TooltipBase {
  highlight(color: string): void { /* ... */ }
}

@Component({
  selector: 'app-action-button',
  standalone: true,
  template: `<button><ng-content /></button>`,
})
export class ActionButtonComponent extends HighlightBase {}
```

---

### NG-08: Use Typed Reactive Forms

**Severity:** Error
**Rule:** Define forms using `FormGroup<T>` with typed controls — never use untyped `FormGroup` or `any` for form values.
**Why:** Typed forms catch structural and type errors at compile time, preventing runtime bugs from mismatched control names or incorrect value types.

**Compliant:**

```typescript
interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
  rememberMe: FormControl<boolean>;
}

@Component({ /* ... */ })
export class LoginComponent {
  loginForm = new FormGroup<LoginForm>({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    rememberMe: new FormControl(false, { nonNullable: true }),
  });

  onSubmit(): void {
    const { email, password } = this.loginForm.getRawValue();
    // email and password are typed as string
  }
}
```

**Non-compliant:**

```typescript
// ❌ Untyped FormGroup — no compile-time safety
@Component({ /* ... */ })
export class LoginComponent {
  loginForm = new FormGroup({
    email: new FormControl(''),
    pasword: new FormControl(''),  // typo not caught at compile time
  });

  onSubmit(): void {
    const values = this.loginForm.value;  // Partial<{ email: string | null; pasword: string | null }>
  }
}
```

---

### NG-09: Use Pure Pipes for Transforms

**Severity:** Error
**Rule:** Use pure pipes for value transformations in templates — never call component methods in templates for formatting or filtering.
**Why:** Pure pipes are cached by Angular and only re-evaluated when inputs change; methods in templates execute on every change detection cycle, causing performance degradation.

**Compliant:**

```typescript
@Pipe({
  name: 'fileSize',
  standalone: true,
  pure: true,
})
export class FileSizePipe implements PipeTransform {
  transform(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }
}

// In template: {{ file.size | fileSize }}
```

**Non-compliant:**

```typescript
// ❌ Method call in template — runs on every change detection cycle
@Component({
  template: `<span>{{ formatFileSize(file.size) }}</span>`,
})
export class FileListComponent {
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }
}
```

---

### NG-10: Organize by Feature, Not by Type

**Severity:** Convention
**Rule:** Group files by feature domain (`orders/`, `settings/`, `auth/`) — never organize by technical type (`components/`, `services/`, `pipes/`).
**Why:** Feature-based organization keeps related code co-located, making features easier to find, navigate, refactor, and lazy load as cohesive units.

**Compliant:**

```
src/app/
├── orders/
│   ├── order-list.component.ts
│   ├── order-list.component.html
│   ├── order-detail.component.ts
│   ├── order.service.ts
│   ├── order.model.ts
│   └── orders.routes.ts
├── auth/
│   ├── login.component.ts
│   ├── auth.service.ts
│   ├── auth.guard.ts
│   └── auth.routes.ts
└── shared/
    ├── file-size.pipe.ts
    └── loading-spinner.component.ts
```

**Non-compliant:**

```
src/app/
├── components/
│   ├── order-list.component.ts
│   ├── order-detail.component.ts
│   └── login.component.ts
├── services/
│   ├── order.service.ts
│   └── auth.service.ts
├── pipes/
│   └── file-size.pipe.ts
├── guards/
│   └── auth.guard.ts
└── models/
    └── order.model.ts
```

## Customization

- **NG-01 (Standalone Components):** Existing module-based code may coexist during migration. New components must be standalone; modules are only acceptable when wrapping legacy third-party libraries that require them.
- **NG-02 (Signals vs RxJS):** Signal adoption is ongoing in most projects. Teams currently using RxJS patterns for component state should migrate incrementally. RxJS remains the correct choice for HTTP interceptors, WebSocket streams, and complex async coordination.
- **NG-06 (OnPush):** Requires discipline with immutable data patterns. Teams adopting OnPush should audit existing components for direct mutation of `@Input()` objects or arrays and refactor to signal-based inputs or immutable updates.
