# Swift Testing Standards

## Purpose

These standards define Swift-specific testing patterns for unit, integration, and UI tests. They supplement the common testing standards with rules covering Swift's native testing frameworks, protocol-based test doubles, actor isolation, and Combine publisher verification. Following these rules ensures tests are expressive, maintainable, and compatible with Swift's concurrency model.

## Applicability

All Swift projects (iOS, macOS, server-side Swift).

## Rules

### SWT-01: Use Swift Testing Framework for New Tests

**Severity:** Convention
**Rule:** Write new test files using the Swift Testing framework (`@Test`, `#expect`, `#require`) — prefer it over XCTest for all new test suites.
**Why:** Swift Testing provides a more expressive API with parameterized tests, traits, and native `async` support, reducing boilerplate compared to XCTest.

**Compliant:**

```swift
import Testing

struct OrderServiceTests {
    let sut = OrderService(repository: MockOrderRepository())

    @Test("creates order with valid items")
    func createOrder() async throws {
        let items = [OrderItem(productID: "p1", quantity: 2, price: 9.99)]

        let order = try await sut.createOrder(for: "customer-1", items: items)

        #expect(order.status == .pending)
        #expect(order.items.count == 1)
        #expect(order.total == 19.98)
    }

    @Test("rejects empty item list", .tags(.validation))
    func rejectsEmptyItems() async {
        await #expect(throws: OrderError.emptyItems) {
            try await sut.createOrder(for: "customer-1", items: [])
        }
    }

    @Test("applies discount for each tier", arguments: [
        (tier: CustomerTier.silver, discount: 0.05),
        (tier: CustomerTier.gold, discount: 0.10),
        (tier: CustomerTier.platinum, discount: 0.15),
    ])
    func discountByTier(tier: CustomerTier, discount: Double) async throws {
        let order = try await sut.createOrder(for: "c1", items: sampleItems, tier: tier)
        #expect(order.discountRate == discount)
    }
}
```

**Non-compliant:**

```swift
// Using XCTest for a brand-new test file when Swift Testing is available
import XCTest

class OrderServiceTests: XCTestCase {
    func testCreateOrder() async throws {
        let sut = OrderService(repository: MockOrderRepository())
        let items = [OrderItem(productID: "p1", quantity: 2, price: 9.99)]

        let order = try await sut.createOrder(for: "customer-1", items: items)

        XCTAssertEqual(order.status, .pending)
        XCTAssertEqual(order.items.count, 1)
    }
}
```

---

### SWT-02: Use `@testable import` to Access Internal Members

**Severity:** Error
**Rule:** Import the module under test with `@testable import` to access `internal` types and methods — never change access control to `public` solely for testing.
**Why:** `@testable` grants test-only visibility without widening the module's public API surface or creating accidental external dependencies.

**Compliant:**

```swift
@testable import MyApp
import Testing

struct PaymentProcessorTests {
    @Test func chargeCallsGateway() async throws {
        let gateway = MockPaymentGateway()
        let processor = PaymentProcessor(gateway: gateway)

        _ = try await processor.charge(amount: 49.99, card: .stub)

        #expect(gateway.chargeCallCount == 1)
    }
}
```

**Non-compliant:**

```swift
// Made public just so tests can access it — leaks internal API
public struct PaymentProcessor {
    public let gateway: PaymentGateway  // was internal, made public for tests
    public func buildRequest(_ amount: Decimal) -> PaymentRequest { ... }  // implementation detail exposed
}

// Test imports normally without @testable
import MyApp

struct PaymentProcessorTests {
    @Test func chargeCallsGateway() async throws {
        let processor = PaymentProcessor(gateway: MockPaymentGateway())
        let request = processor.buildRequest(49.99)  // tests an internal detail
    }
}
```

---

### SWT-03: Use Protocol-Based Mocking

**Severity:** Error
**Rule:** Define a protocol for each dependency, then create a lightweight mock conforming to that protocol — never subclass concrete types to override methods for testing.
**Why:** Swift has no reflection-based mocking; protocol-based mocks are explicit, type-safe, and work with both structs and classes.

**Compliant:**

```swift
protocol OrderRepository: Sendable {
    func find(_ id: String) async throws -> Order?
    func save(_ order: Order) async throws
}

// Production implementation
struct PostgresOrderRepository: OrderRepository {
    func find(_ id: String) async throws -> Order? { ... }
    func save(_ order: Order) async throws { ... }
}

// Test mock — records calls and returns stubbed data
final class MockOrderRepository: OrderRepository, @unchecked Sendable {
    var savedOrders: [Order] = []
    var stubbedOrder: Order?

    func find(_ id: String) async throws -> Order? {
        stubbedOrder
    }

    func save(_ order: Order) async throws {
        savedOrders.append(order)
    }
}

@Test func savesOrderOnCheckout() async throws {
    let repository = MockOrderRepository()
    let service = CheckoutService(repository: repository)

    try await service.checkout(cartID: "cart-1")

    #expect(repository.savedOrders.count == 1)
    #expect(repository.savedOrders.first?.status == .confirmed)
}
```

**Non-compliant:**

```swift
// Subclass mock — overrides concrete methods, fragile if base class changes
class MockOrderRepository: PostgresOrderRepository {
    var savedOrders: [Order] = []

    override func save(_ order: Order) async throws {
        savedOrders.append(order)
        // skips actual database call
    }
}
// If PostgresOrderRepository adds a required initializer or changes
// internal behavior, this mock silently breaks
```

---

### SWT-04: Test Async Code with Swift Concurrency

**Severity:** Error
**Rule:** Use `async` test functions and `await` directly — never use `XCTestExpectation` with `waitForExpectations` for testing async Swift code.
**Why:** Native `async/await` in tests is deterministic, readable, and eliminates arbitrary timeout values that cause flaky tests.

**Compliant:**

```swift
@Test func fetchUserReturnsProfile() async throws {
    let client = MockHTTPClient(stubbedResponse: userJSON)
    let service = UserService(client: client)

    let user = try await service.fetchUser(id: "u-123")

    #expect(user.name == "Ada Lovelace")
    #expect(user.email == "ada@example.com")
}

@Test func fetchUserThrowsOnNotFound() async {
    let client = MockHTTPClient(stubbedStatusCode: 404)
    let service = UserService(client: client)

    await #expect(throws: UserError.notFound(id: "u-999")) {
        try await service.fetchUser(id: "u-999")
    }
}
```

**Non-compliant:**

```swift
// XCTestExpectation for async Swift code — arbitrary 5-second timeout, brittle
func testFetchUser() {
    let expectation = XCTestExpectation(description: "fetch completes")
    let service = UserService(client: MockHTTPClient(stubbedResponse: userJSON))

    Task {
        let user = try await service.fetchUser(id: "u-123")
        XCTAssertEqual(user.name, "Ada Lovelace")
        expectation.fulfill()
    }

    wait(for: [expectation], timeout: 5.0)
}
```

---

### SWT-05: Use XCUITest for UI Testing

**Severity:** Warning
**Rule:** Write UI tests using XCUITest and interact with elements via accessibility identifiers — never use element indices or layout-dependent queries.
**Why:** Accessibility identifiers are stable across design changes and screen sizes, and they double as accessibility support for users with assistive technologies.

**Compliant:**

```swift
import XCTest

final class CheckoutUITests: XCTestCase {
    let app = XCUIApplication()

    override func setUp() {
        continueAfterFailure = false
        app.launchArguments = ["--uitesting"]
        app.launch()
    }

    func testCompletePurchase() {
        app.buttons["addToCartButton"].tap()
        app.tabBars.buttons["cartTab"].tap()

        let checkoutButton = app.buttons["checkoutButton"]
        XCTAssertTrue(checkoutButton.waitForExistence(timeout: 3))
        checkoutButton.tap()

        app.textFields["cardNumberField"].typeText("4242424242424242")
        app.buttons["payButton"].tap()

        let confirmation = app.staticTexts["confirmationMessage"]
        XCTAssertTrue(confirmation.waitForExistence(timeout: 5))
        XCTAssertEqual(confirmation.label, "Order confirmed!")
    }
}
```

**Non-compliant:**

```swift
func testCompletePurchase() {
    // Element index — breaks when UI layout changes
    app.buttons.element(boundBy: 3).tap()

    // Matching on visible text — breaks with localization or copy changes
    app.buttons["Add to Cart"].tap()

    // Static sleep instead of waitForExistence — flaky and slow
    sleep(2)
    app.buttons.firstMatch.tap()
}
```

---

### SWT-06: Test Combine Publishers with Expectations

**Severity:** Warning
**Rule:** Verify Combine publishers by collecting emitted values with `sink` and `XCTestExpectation` or the `values(of:)` helper — test both value delivery and completion, and always test error paths.
**Why:** Publishers are asynchronous streams that require explicit subscription and lifecycle management in tests to avoid false passes from uncollected emissions.

**Compliant:**

```swift
import XCTest
import Combine
@testable import MyApp

final class StockPriceViewModelTests: XCTestCase {
    var cancellables = Set<AnyCancellable>()

    func testPriceUpdatesPublished() {
        let mockService = MockStockService()
        let viewModel = StockPriceViewModel(service: mockService)
        let expectation = XCTestExpectation(description: "prices received")
        var receivedPrices: [Decimal] = []

        viewModel.$currentPrice
            .dropFirst()
            .prefix(3)
            .sink(
                receiveCompletion: { _ in expectation.fulfill() },
                receiveValue: { receivedPrices.append($0) }
            )
            .store(in: &cancellables)

        mockService.send(prices: [150.00, 151.25, 149.75])

        wait(for: [expectation], timeout: 2)
        XCTAssertEqual(receivedPrices, [150.00, 151.25, 149.75])
    }

    func testErrorPropagation() {
        let mockService = MockStockService()
        let viewModel = StockPriceViewModel(service: mockService)
        let expectation = XCTestExpectation(description: "error received")

        viewModel.$error
            .compactMap { $0 }
            .sink { error in
                XCTAssertEqual(error as? StockError, .connectionLost)
                expectation.fulfill()
            }
            .store(in: &cancellables)

        mockService.sendError(.connectionLost)

        wait(for: [expectation], timeout: 2)
    }
}
```

**Non-compliant:**

```swift
// No subscription — publisher emits but test never observes
func testPriceUpdates() {
    let viewModel = StockPriceViewModel(service: MockStockService())
    viewModel.startUpdates()
    // nothing collected, test passes vacuously
    XCTAssertTrue(true)
}

// No error path test — only tests the happy path
func testPriceUpdatesHappyOnly() {
    let expectation = XCTestExpectation()
    viewModel.$currentPrice
        .sink { _ in expectation.fulfill() }
        .store(in: &cancellables)
    wait(for: [expectation], timeout: 2)
    // what happens when the service fails?
}
```

---

### SWT-07: Handle Actor Isolation in Tests

**Severity:** Warning
**Rule:** Test actors through their async interface using `await` — never add `nonisolated` to actor members solely to make tests synchronous.
**Why:** Actors protect mutable state through isolation; bypassing isolation in tests masks real concurrency bugs that will surface in production.

**Compliant:**

```swift
actor Inventory {
    private var stock: [String: Int] = [:]

    func restock(_ productID: String, quantity: Int) {
        stock[productID, default: 0] += quantity
    }

    func available(_ productID: String) -> Int {
        stock[productID, default: 0]
    }

    func reserve(_ productID: String, quantity: Int) throws -> Reservation {
        guard available(productID) >= quantity else {
            throw InventoryError.insufficientStock(productID: productID)
        }
        stock[productID, default: 0] -= quantity
        return Reservation(productID: productID, quantity: quantity)
    }
}

@Test func reserveDecreasesStock() async throws {
    let inventory = Inventory()
    await inventory.restock("widget", quantity: 10)

    let reservation = try await inventory.reserve("widget", quantity: 3)

    #expect(reservation.quantity == 3)
    let remaining = await inventory.available("widget")
    #expect(remaining == 7)
}

@Test func reserveThrowsWhenInsufficient() async {
    let inventory = Inventory()
    await inventory.restock("widget", quantity: 2)

    await #expect(throws: InventoryError.insufficientStock(productID: "widget")) {
        try await inventory.reserve("widget", quantity: 5)
    }
}
```

**Non-compliant:**

```swift
actor Inventory {
    private var stock: [String: Int] = [:]

    // nonisolated added just for test convenience — breaks actor safety guarantees
    nonisolated func availableSync(_ productID: String) -> Int {
        // This cannot safely access `stock` — compiler error or undefined behavior
        stock[productID, default: 0]
    }
}

// Synchronous test ignores actor isolation entirely
func testReserve() {
    let inventory = Inventory()
    // No await — would not compile with proper isolation
}
```

---

### SWT-08: Configure Test Plans for CI

**Severity:** Convention
**Rule:** Use Xcode Test Plans (`.xctestplan`) to separate fast unit tests from slow integration and UI tests — configure code coverage collection and environment variables per plan.
**Why:** Running all tests in a single undifferentiated suite slows CI feedback loops; test plans enable targeted test execution with appropriate timeouts and environment configuration.

**Compliant:**

```json
// UnitTests.xctestplan — runs on every PR, fast feedback
{
  "configurations": [{
    "name": "Unit Tests",
    "options": {
      "codeCoverageEnabled": true,
      "testTimeoutsEnabled": true,
      "defaultTestExecutionTimeAllowance": 10
    }
  }],
  "testTargets": [
    { "target": { "name": "MyAppTests" } },
    { "target": { "name": "CoreLibraryTests" } }
  ]
}
```

```json
// IntegrationTests.xctestplan — runs nightly or on merge to main
{
  "configurations": [{
    "name": "Integration Tests",
    "options": {
      "codeCoverageEnabled": false,
      "environmentVariableEntries": [
        { "key": "API_BASE_URL", "value": "https://staging.api.example.com" }
      ],
      "defaultTestExecutionTimeAllowance": 120
    }
  }],
  "testTargets": [
    { "target": { "name": "MyAppIntegrationTests" } },
    { "target": { "name": "MyAppUITests" } }
  ]
}
```

**Non-compliant:**

```swift
// All tests lumped together with no plan — CI runs everything on every PR
// No timeout configuration — a hanging test blocks the pipeline indefinitely
// No coverage configuration — coverage is either always collected (slow) or never collected

// xcodebuild test -scheme MyApp  ← runs unit, integration, and UI tests together
```

## Customization

- **SWT-01 (Swift Testing framework)** requires Xcode 16+ and is available from Swift 6.0. Projects on older Xcode versions should continue using XCTest. Both frameworks can coexist in the same test target during migration — XCTest classes and `@Test` functions run side by side.

- **SWT-03 (Protocol-based mocking)** is the standard Swift approach, but some teams adopt code-generation tools like Mockolo or Sourcery to auto-generate mock implementations from protocol definitions. These tools are valid as long as the generated mocks still conform to protocols rather than subclassing concrete types.

- **SWT-06 (Combine testing)** can benefit from third-party libraries like CombineExpectations or Entwine that provide test schedulers and value recording helpers. These are optional conveniences — the core rule of subscribing, collecting, and asserting on published values applies regardless of tooling.

- **SWT-05 (UI test scope)** varies by project. Some teams run XCUITests only for critical user flows (login, checkout, onboarding) while covering other screens with snapshot tests or SwiftUI preview-based testing. The key requirement is that UI tests use accessibility identifiers, not layout-dependent queries.
