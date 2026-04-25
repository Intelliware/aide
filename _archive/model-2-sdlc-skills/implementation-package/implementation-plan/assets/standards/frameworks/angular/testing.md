# Angular Testing Standards

## Purpose

These rules define Angular-specific testing conventions for components, services, directives, routing, and state management. They supplement the common and TypeScript testing standards — general rules on test structure, naming, and assertion patterns are defined there and not repeated here.

## Applicability

All Angular 17+ projects (Jest or Karma, TypeScript 5.0+). Angular 16 and earlier require TestBed module-based setup instead of standalone component testing.

## Rules

### NGT-01: Configure TestBed Minimally

**Severity:** Error
**Rule:** Provide only the dependencies the component under test actually uses in `TestBed.configureTestingModule()` — never import the full `AppModule` or unrelated feature modules.
**Why:** Minimal TestBed configuration keeps tests fast, isolates the unit under test, and makes dependency failures obvious rather than masked by a large module graph.

**Compliant:**

```typescript
describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderListComponent],
      providers: [
        { provide: OrderService, useValue: jasmine.createSpyObj('OrderService', ['getOrders']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
  });
});
```

**Non-compliant:**

```typescript
// ❌ Importing the entire AppModule brings in every dependency
describe('OrderListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule],
    }).compileComponents();
  });
});
```

---

### NGT-02: Test Services Independently

**Severity:** Error
**Rule:** Inject the service directly with `TestBed.inject()` and mock its dependencies — test behavior through the service's public API, never mock the service itself when testing it.
**Why:** Testing through the public API validates real behavior; mocking the service under test only verifies your mocks.

**Compliant:**

```typescript
describe('OrderService', () => {
  let service: OrderService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrderService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(OrderService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should fetch orders for a given customer', () => {
    const mockOrders: Order[] = [{ id: '1', product: 'Widget', quantity: 3 }];

    service.getOrdersByCustomer('cust-42').subscribe(orders => {
      expect(orders).toEqual(mockOrders);
    });

    const req = httpController.expectOne('/api/customers/cust-42/orders');
    expect(req.request.method).toBe('GET');
    req.flush(mockOrders);
  });

  afterEach(() => httpController.verify());
});
```

**Non-compliant:**

```typescript
// ❌ Mocking the service under test — this tests the mock, not the service
describe('OrderService', () => {
  it('should fetch orders', () => {
    const mockService = jasmine.createSpyObj('OrderService', ['getOrdersByCustomer']);
    mockService.getOrdersByCustomer.and.returnValue(of([{ id: '1' }]));

    mockService.getOrdersByCustomer('cust-42').subscribe(orders => {
      expect(orders.length).toBe(1); // proves nothing about real OrderService
    });
  });
});
```

---

### NGT-03: Use Component Harnesses for UI Testing

**Severity:** Warning
**Rule:** Use Angular CDK test harnesses to interact with component DOM — prefer harnesses over direct `querySelector` or `nativeElement` access.
**Why:** Harnesses abstract DOM structure, handle async operations automatically, and provide a stable testing API that survives template refactors.

**Compliant:**

```typescript
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';

describe('CheckoutComponent', () => {
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(CheckoutComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should disable the submit button when the cart is empty', async () => {
    const button = await loader.getHarness(
      MatButtonHarness.with({ text: 'Place Order' })
    );
    expect(await button.isDisabled()).toBeTrue();
  });
});
```

**Non-compliant:**

```typescript
// ❌ Direct DOM queries — fragile and coupled to template structure
describe('CheckoutComponent', () => {
  it('should disable the submit button when the cart is empty', () => {
    const fixture = TestBed.createComponent(CheckoutComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button.submit-btn');
    expect(button.disabled).toBeTrue();
  });
});
```

---

### NGT-04: Use `fakeAsync`/`tick` for Timer-Based Tests

**Severity:** Error
**Rule:** Wrap tests that involve timers, debounces, or intervals in `fakeAsync()` and advance time with `tick()` — never use real `setTimeout` or arbitrary delays in tests.
**Why:** `fakeAsync` gives deterministic control over the passage of time, eliminating flaky tests caused by real timer races or insufficient wait times.

**Compliant:**

```typescript
it('should debounce search input by 300ms', fakeAsync(() => {
  const fixture = TestBed.createComponent(SearchComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  component.searchControl.setValue('angular');
  tick(200);
  expect(component.searchResults()).toEqual([]);

  tick(100);
  expect(component.searchResults().length).toBeGreaterThan(0);
}));
```

**Non-compliant:**

```typescript
// ❌ Real delay — slow and potentially flaky
it('should debounce search input by 300ms', (done) => {
  const fixture = TestBed.createComponent(SearchComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  component.searchControl.setValue('angular');
  setTimeout(() => {
    expect(component.searchResults().length).toBeGreaterThan(0);
    done();
  }, 500); // arbitrary extra wait
});
```

---

### NGT-05: Use `HttpClientTesting` for HTTP Tests

**Severity:** Error
**Rule:** Use `provideHttpClientTesting()` and `HttpTestingController` to intercept and mock HTTP requests — verify request URL, method, and headers, then flush the response.
**Why:** `HttpTestingController` provides deterministic, synchronous HTTP testing without real network calls and catches unexpected or unmatched requests.

**Compliant:**

```typescript
describe('UserService', () => {
  let service: UserService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should send a PUT request to update user profile', () => {
    const updatedUser: User = { id: '1', name: 'Jane Doe', email: 'jane@example.com' };

    service.updateProfile(updatedUser).subscribe(user => {
      expect(user).toEqual(updatedUser);
    });

    const req = httpController.expectOne('/api/users/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedUser);
    req.flush(updatedUser);
  });

  afterEach(() => httpController.verify());
});
```

**Non-compliant:**

```typescript
// ❌ Mocking HttpClient directly — skips interceptors and loses request verification
describe('UserService', () => {
  it('should update user profile', () => {
    const mockHttp = jasmine.createSpyObj('HttpClient', ['put']);
    mockHttp.put.and.returnValue(of({ id: '1', name: 'Jane Doe' }));
    const service = new UserService(mockHttp);

    service.updateProfile({ id: '1', name: 'Jane Doe', email: 'jane@example.com' })
      .subscribe(user => expect(user.name).toBe('Jane Doe'));
  });
});
```

---

### NGT-06: Test NgRx Store with Mock Store

**Severity:** Warning
**Rule:** Use `provideMockStore` with defined initial state for component tests that depend on the store — test selectors and effects separately.
**Why:** Mock store isolates component behavior from store internals; testing selectors and effects independently makes failures precise and tests composable.

**Compliant:**

```typescript
describe('OrderDashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDashboardComponent],
      providers: [
        provideMockStore({
          initialState: { orders: { items: mockOrders, loading: false } },
          selectors: [
            { selector: selectAllOrders, value: mockOrders },
            { selector: selectOrdersLoading, value: false },
          ],
        }),
      ],
    }).compileComponents();
  });

  it('should display order count from the store', () => {
    const fixture = TestBed.createComponent(OrderDashboardComponent);
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('h2');
    expect(heading.textContent).toContain(`${mockOrders.length} Orders`);
  });
});

// Selectors tested separately
describe('Order Selectors', () => {
  it('should select pending orders', () => {
    const state = { orders: { items: mockOrders, loading: false } };
    const result = selectPendingOrders.projector(mockOrders);
    expect(result.every(o => o.status === 'pending')).toBeTrue();
  });
});
```

**Non-compliant:**

```typescript
// ❌ Using the real store in a component test — couples component to reducer logic
describe('OrderDashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDashboardComponent, StoreModule.forRoot({ orders: ordersReducer })],
    }).compileComponents();
  });
});
```

---

### NGT-07: Test Directives on Host Elements

**Severity:** Convention
**Rule:** Create a minimal test host component that applies the directive — test the directive's observable effect on the host element, not the directive class in isolation.
**Why:** Directives only have meaning in the context of a host element; testing without one misses DOM interaction, input binding, and lifecycle behavior.

**Compliant:**

```typescript
@Component({
  standalone: true,
  imports: [HighlightDirective],
  template: `<p appHighlight [color]="testColor">Hello</p>`,
})
class TestHostComponent {
  testColor = 'yellow';
}

describe('HighlightDirective', () => {
  it('should set background color on the host element', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const paragraph = fixture.nativeElement.querySelector('p');
    expect(paragraph.style.backgroundColor).toBe('yellow');
  });

  it('should update when input changes', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.testColor = 'cyan';
    fixture.detectChanges();

    const paragraph = fixture.nativeElement.querySelector('p');
    expect(paragraph.style.backgroundColor).toBe('cyan');
  });
});
```

**Non-compliant:**

```typescript
// ❌ Instantiating the directive class directly — misses DOM behavior entirely
describe('HighlightDirective', () => {
  it('should have a color input', () => {
    const directive = new HighlightDirective();
    directive.color = 'yellow';
    expect(directive.color).toBe('yellow'); // proves nothing about DOM behavior
  });
});
```

---

### NGT-08: Test Route Navigation with `provideRouter`

**Severity:** Warning
**Rule:** Configure test routes with `provideRouter()` and verify navigation behavior using `Router.navigate()` — validate route resolution, guard execution, and component loading.
**Why:** Route testing catches misconfigured paths, broken guards, and missing lazy-loaded components before they reach production.

**Compliant:**

```typescript
describe('App Routing', () => {
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([
          { path: '', component: HomeComponent },
          { path: 'orders', component: OrderListComponent, canActivate: [authGuard] },
          { path: '**', component: NotFoundComponent },
        ]),
        { provide: AuthService, useValue: { isAuthenticated: () => true } },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  });

  it('should navigate to the orders page when authenticated', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    router.navigate(['/orders']);
    tick();

    expect(location.path()).toBe('/orders');
  }));

  it('should redirect to home when route does not exist', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    router.navigate(['/nonexistent']);
    tick();

    expect(location.path()).toBe('/nonexistent');
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('app-not-found')).toBeTruthy();
  }));
});
```

**Non-compliant:**

```typescript
// ❌ Using deprecated RouterTestingModule
describe('App Routing', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'orders', component: OrderListComponent },
        ]),
        AppComponent,
      ],
    }).compileComponents();
  });
});
```

## Customization

- **NGT-03 (Component Harnesses):** Harnesses may not exist for all third-party component libraries. For components without official harnesses, create custom harnesses using `ComponentHarness` base class or fall back to direct DOM queries with a comment explaining why.
- **NGT-06 (NgRx Marble Testing):** Marble testing for effects has a learning curve. Teams may use promise-based or `fakeAsync`-based effect testing as an alternative, provided tests remain deterministic.
- **NGT-08 (Router Testing):** `RouterTestingModule` is deprecated in Angular 18+. Use `provideRouter()` with test route configurations. Projects on older Angular versions may continue using `RouterTestingModule` until they upgrade.
