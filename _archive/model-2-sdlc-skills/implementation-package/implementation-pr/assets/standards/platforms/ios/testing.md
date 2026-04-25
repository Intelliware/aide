# iOS Platform Testing Standards

## Purpose

These standards define iOS platform-specific testing practices covering UI automation, visual regression, performance measurement, and device-level validation. They supplement the Swift language testing standards — which cover how to write Swift tests — with rules governing Xcode-specific tooling, simulator vs. device testing, network conditioning, and CI test plan configuration.

## Applicability

All iOS applications targeting iOS 16+ with SwiftUI and Swift 5.9+. Uses XCTest (or Swift Testing for Swift 6.0+ projects). Projects targeting iOS 17+ can additionally test `@Observable` models and `SwiftData` persistence.

## Rules

### IOST-01: Use Accessibility Identifiers as Test Hooks

**Severity:** Error
**Rule:** Set `accessibilityIdentifier` on all testable UI elements — XCUITest locates elements through these identifiers; never rely on element text, index, or layout position.
**Why:** Text changes with localization, indices shift when views are reordered, and layout positions vary by device — accessibility identifiers are stable, explicit, and language-independent.

**Compliant:**

```swift
// In the view
struct LoginView: View {
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        VStack {
            TextField("Email", text: $email)
                .accessibilityIdentifier("login.emailField")
            SecureField("Password", text: $password)
                .accessibilityIdentifier("login.passwordField")
            Button("Sign In") {
                authenticate()
            }
            .accessibilityIdentifier("login.signInButton")
        }
    }
}

// In the UI test
func testSuccessfulLogin() throws {
    let app = XCUIApplication()
    app.launch()

    let emailField = app.textFields["login.emailField"]
    let passwordField = app.secureTextFields["login.passwordField"]
    let signInButton = app.buttons["login.signInButton"]

    emailField.tap()
    emailField.typeText("user@example.com")
    passwordField.tap()
    passwordField.typeText("password123")
    signInButton.tap()

    XCTAssertTrue(app.staticTexts["welcome.greeting"].waitForExistence(timeout: 5))
}
```

**Non-compliant:**

```swift
// Relying on button text — breaks when copy changes or app is localized
let signInButton = app.buttons["Sign In"]

// Relying on element index — breaks when views are reordered
let emailField = app.textFields.element(boundBy: 0)
let passwordField = app.secureTextFields.element(boundBy: 0)

// Relying on coordinates — breaks on different screen sizes
app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.8)).tap()
```

---

### IOST-02: Isolate UI Test Data

**Severity:** Error
**Rule:** Reset app state before each UI test using launch arguments or a test-specific data source — never depend on data from previous test runs or production data.
**Why:** Shared mutable state between tests causes ordering dependencies, flaky failures, and tests that pass locally but fail in CI.

**Compliant:**

```swift
// Pass launch arguments to signal test mode
class ShopUITests: XCTestCase {
    var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments = ["--uitesting", "--reset-state"]
        app.launchEnvironment = [
            "API_BASE_URL": "http://localhost:8080",
            "TEST_USER_TOKEN": "test-token-123",
        ]
        app.launch()
    }
}

// In the app, check for the flag and reset
@main
struct ShopApp: App {
    init() {
        if CommandLine.arguments.contains("--reset-state") {
            UserDefaults.standard.removePersistentDomain(
                forName: Bundle.main.bundleIdentifier!
            )
            try? FileManager.default.removeItem(at: cacheDirectory)
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

**Non-compliant:**

```swift
// Tests depend on state left by previous tests
func testAddItemToCart() {
    app.buttons["product.addToCart"].tap()
    // Assumes cart was empty — breaks if testDeleteItem ran before this
    XCTAssertEqual(app.staticTexts["cart.itemCount"].label, "1")
}

// Tests use production API — flaky, slow, and data may change
class ShopUITests: XCTestCase {
    override func setUpWithError() throws {
        app = XCUIApplication()
        // No reset, no mock data, hitting real server
        app.launch()
    }
}
```

---

### IOST-03: Use Snapshot Testing for Visual Regression

**Severity:** Convention
**Rule:** Use swift-snapshot-testing or a similar framework to capture view snapshots and compare against committed reference images — review snapshot changes intentionally as part of code review.
**Why:** Snapshot tests catch unintended visual changes (layout shifts, color regressions, font changes) that unit tests cannot detect.

**Compliant:**

```swift
import SnapshotTesting
import XCTest
@testable import Shop

final class ProductCardSnapshotTests: XCTestCase {
    func testProductCardDefaultState() {
        let product = Product.fixture(name: "Running Shoes", price: 129.99)
        let view = ProductCard(product: product)
            .frame(width: 375)

        assertSnapshot(of: view, as: .image(layout: .device(config: .iPhone13)))
    }

    func testProductCardOutOfStock() {
        let product = Product.fixture(name: "Running Shoes", price: 129.99, inStock: false)
        let view = ProductCard(product: product)
            .frame(width: 375)

        assertSnapshot(of: view, as: .image(layout: .device(config: .iPhone13)))
    }

    func testProductCardDynamicType() {
        let product = Product.fixture(name: "Running Shoes", price: 129.99)
        let view = ProductCard(product: product)
            .frame(width: 375)
            .environment(\.sizeCategory, .accessibilityExtraExtraLarge)

        assertSnapshot(of: view, as: .image(layout: .device(config: .iPhone13)))
    }

    func testProductCardDarkMode() {
        let product = Product.fixture(name: "Running Shoes", price: 129.99)
        let view = ProductCard(product: product)
            .frame(width: 375)
            .environment(\.colorScheme, .dark)

        assertSnapshot(of: view, as: .image(layout: .device(config: .iPhone13)))
    }
}
```

**Non-compliant:**

```swift
// Only checking data correctness — visual regressions go undetected
func testProductCard() {
    let product = Product.fixture(name: "Running Shoes", price: 129.99)
    let view = ProductCard(product: product)

    // This verifies data binding, but layout could be completely broken
    XCTAssertEqual(view.product.name, "Running Shoes")
}

// Manual visual verification via previews — not automated, not reproducible
#Preview {
    ProductCard(product: .fixture())
}
```

---

### IOST-04: Use XCTMetric for Performance Testing

**Severity:** Warning
**Rule:** Use `measure(metrics:)` with `XCTClockMetric`, `XCTMemoryMetric`, and `XCTCPUMetric` to track startup time, memory usage, and scroll performance — set performance baselines and fail tests on regression.
**Why:** Performance regressions are invisible in code review but directly impact user retention; automated baselines catch regressions before they ship.

**Compliant:**

```swift
final class PerformanceTests: XCTestCase {
    func testAppLaunchPerformance() throws {
        measure(metrics: [XCTApplicationLaunchMetric()]) {
            XCUIApplication().launch()
        }
    }

    func testProductListScrollPerformance() throws {
        let app = XCUIApplication()
        app.launch()

        let productList = app.collectionViews["productList"]

        measure(metrics: [XCTOSSignpostMetric.scrollDecelerationMetric]) {
            productList.swipeUp(velocity: .fast)
        }
    }

    func testOrderCreationPerformance() throws {
        let service = OrderService(repository: InMemoryOrderRepository())
        let items = (0..<100).map { OrderItem.fixture(index: $0) }

        measure(metrics: [XCTClockMetric(), XCTMemoryMetric(), XCTCPUMetric()]) {
            _ = try? service.createOrderSync(items: items)
        }
    }
}
```

**Non-compliant:**

```swift
// Manual timing with Date — imprecise, no baselines, no CI integration
func testPerformance() {
    let start = Date()
    _ = OrderService().createOrderSync(items: largeItemList)
    let elapsed = Date().timeIntervalSince(start)
    print("Elapsed: \(elapsed)s") // printed, not asserted
}

// No performance tests at all — regressions discovered by users
```

---

### IOST-05: Configure Test Plans for CI

**Severity:** Warning
**Rule:** Use Xcode Test Plans to separate fast unit tests from slow UI tests — run unit tests on every PR, UI tests on merge to main; configure code coverage targets per plan.
**Why:** Running the full UI test suite on every PR slows developer feedback loops; test plans let CI run the right tests at the right time.

**Compliant:**

```swift
// UnitTests.xctestplan — fast, runs on every PR
// Configuration:
//   - Targets: ShopTests (unit tests only)
//   - Code Coverage: enabled, minimum 80%
//   - Execution Order: randomized
//   - Language: system default
//   - Retry on failure: 0

// UITests.xctestplan — slow, runs on merge to main
// Configuration:
//   - Targets: ShopUITests
//   - Code Coverage: disabled (measured separately)
//   - Execution Order: randomized
//   - Language: en, es, ja (tests localization)
//   - Retry on failure: 1

// CI pipeline configuration (e.g., GitHub Actions)
// on PR:
//   xcodebuild test -scheme Shop -testPlan UnitTests
// on merge to main:
//   xcodebuild test -scheme Shop -testPlan UITests
```

**Non-compliant:**

```swift
// Single test target with no plan — all tests run on every change
// xcodebuild test -scheme Shop
// Result: 45-minute CI on every PR because UI tests run every time

// No code coverage configuration — no visibility into untested code

// Tests run in fixed order — hides ordering dependencies
// Execution order: alphabetical (default without test plans)
```

---

### IOST-06: Test on Simulator and Device

**Severity:** Warning
**Rule:** Use simulators for fast iteration during development; test on real devices for performance, push notifications, camera, biometrics, and any hardware-dependent features — never ship without device testing for features that behave differently on hardware.
**Why:** Simulators don't replicate real-world performance, thermal throttling, or hardware-specific APIs; features that work perfectly in the simulator can fail on device.

**Compliant:**

```swift
// Development workflow:
// 1. Unit tests and most UI tests run on simulator for speed
// 2. Device-specific features tested on physical hardware

// Features that MUST be tested on device:
// - Push notification delivery and handling
// - Camera capture and barcode scanning
// - Face ID / Touch ID enrollment and authentication
// - Performance under thermal throttling
// - Network transitions (Wi-Fi → cellular)
// - Background task execution timing

// CI configuration
// PR pipeline:   iPhone 16 Simulator (fast)
// Nightly build:  Physical device pool via AWS Device Farm / BrowserStack

// Biometric test helper — behavior differs between simulator and device
func testBiometricAuthentication() throws {
    let app = XCUIApplication()
    app.launch()

    app.buttons["login.biometricButton"].tap()

    #if targetEnvironment(simulator)
    // Simulator: use Xcode menu to simulate biometric match
    // Features → Face ID → Matching Face
    #else
    // Device: actual Face ID / Touch ID prompt appears
    // Test user must authenticate or test must handle the system dialog
    #endif

    XCTAssertTrue(app.staticTexts["welcome.greeting"].waitForExistence(timeout: 10))
}
```

**Non-compliant:**

```swift
// Only testing on simulator — shipping biometric auth without device testing
func testFaceIDLogin() {
    let app = XCUIApplication()
    app.launch()
    app.buttons["login.biometricButton"].tap()
    // "Works on my simulator" — fails on device due to LAContext differences
}

// Never testing performance on device — smooth in simulator, janky on older hardware
// No testing on different screen sizes — layout breaks on iPhone SE
```

---

### IOST-07: Test Network Conditions

**Severity:** Error
**Rule:** Use `URLProtocol` subclassing for unit test mocking and Network Link Conditioner for manual/UI testing of slow and offline scenarios — the app must handle network failures gracefully; never assume always-online.
**Why:** Real-world users experience packet loss, high latency, and offline periods; apps that don't handle these conditions crash, show blank screens, or corrupt data.

**Compliant:**

```swift
// URLProtocol mock for unit tests
class MockURLProtocol: URLProtocol {
    static var requestHandler: ((URLRequest) throws -> (HTTPURLResponse, Data))?

    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }

    override func startLoading() {
        guard let handler = Self.requestHandler else {
            fatalError("requestHandler not set")
        }
        do {
            let (response, data) = try handler(request)
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: data)
            client?.urlProtocolDidFinishLoading(self)
        } catch {
            client?.urlProtocol(self, didFailWithError: error)
        }
    }

    override func stopLoading() {}
}

// Test that the app handles a network error gracefully
func testProductListShowsErrorOnNetworkFailure() async throws {
    MockURLProtocol.requestHandler = { _ in
        throw URLError(.notConnectedToInternet)
    }

    let service = ProductService(session: mockSession)
    let result = await service.fetchProducts()

    switch result {
    case .success:
        XCTFail("Expected failure")
    case .failure(let error):
        XCTAssertEqual(error, .networkUnavailable)
    }
}

// Test timeout handling
func testProductListHandlesSlowNetwork() async throws {
    MockURLProtocol.requestHandler = { _ in
        try await Task.sleep(for: .seconds(10))
        return (HTTPURLResponse(), Data())
    }

    let service = ProductService(session: mockSession, timeout: 5)
    let result = await service.fetchProducts()

    guard case .failure(.timeout) = result else {
        XCTFail("Expected timeout error")
        return
    }
}
```

**Non-compliant:**

```swift
// Tests hit the real network — flaky, slow, and untestable offline scenarios
func testFetchProducts() async throws {
    let service = ProductService() // uses real URLSession
    let products = try await service.fetchProducts()
    XCTAssertFalse(products.isEmpty) // fails when API is down
}

// No offline testing — app crashes when network is unavailable
// No timeout testing — app hangs on slow connections
```

---

### IOST-08: Test Push Notification Handling

**Severity:** Warning
**Rule:** Test notification registration, foreground display, background delivery, and notification-launched app state — use mock `UNNotificationResponse` in unit tests and simulate notification payloads for integration tests.
**Why:** Push notifications cross multiple app states (foreground, background, terminated); untested paths lead to missed notifications, crashes on launch, or incorrect navigation.

**Compliant:**

```swift
// Unit test notification payload parsing
struct NotificationPayloadTests {
    @Test("parses order update notification")
    func parseOrderUpdate() throws {
        let payload: [AnyHashable: Any] = [
            "aps": ["alert": ["title": "Order Shipped", "body": "Your order is on the way"]],
            "orderId": "order-123",
            "type": "orderUpdate",
        ]

        let notification = try AppNotification(payload: payload)

        #expect(notification.type == .orderUpdate)
        #expect(notification.orderID == "order-123")
    }

    @Test("handles malformed payload without crashing")
    func malformedPayload() {
        let payload: [AnyHashable: Any] = [
            "aps": ["alert": "Simple string alert"],
            // Missing type and orderId
        ]

        let notification = try? AppNotification(payload: payload)
        #expect(notification == nil)
    }
}

// Integration test for notification-driven navigation
final class NotificationNavigationTests: XCTestCase {
    func testNotificationOpensOrderDetail() throws {
        let coordinator = MockNavigationCoordinator()
        let handler = NotificationHandler(coordinator: coordinator)

        let payload: [AnyHashable: Any] = [
            "type": "orderUpdate",
            "orderId": "order-123",
        ]

        handler.handleNotificationTap(payload: payload)

        XCTAssertEqual(coordinator.lastNavigatedRoute, .orderDetail(id: "order-123"))
    }

    func testNotificationWithUnknownTypeNavigatesToInbox() throws {
        let coordinator = MockNavigationCoordinator()
        let handler = NotificationHandler(coordinator: coordinator)

        let payload: [AnyHashable: Any] = [
            "type": "unknownFutureType",
        ]

        handler.handleNotificationTap(payload: payload)

        XCTAssertEqual(coordinator.lastNavigatedRoute, .notificationInbox)
    }
}
```

**Non-compliant:**

```swift
// No tests for notification handling — relies on manual testing
// "I'll just send a push from the dashboard and see if it works"

// Only testing the happy path — missing edge cases
func testNotification() {
    let payload: [AnyHashable: Any] = [
        "type": "orderUpdate",
        "orderId": "order-123",
    ]
    handler.handleNotificationTap(payload: payload)
    // No assertion on navigation
    // No test for malformed payloads
    // No test for notification arriving while app is in foreground
    // No test for cold launch from notification
}
```

## Customization

- **IOST-03 (Snapshot testing)** reference images must be regenerated when the OS version, simulator device, or rendering engine changes. Teams should pin snapshot tests to a specific simulator model and OS version in CI to avoid false failures. Some teams prefer snapshot testing only for critical UI components (design system primitives, checkout flow) rather than every view.

- **IOST-06 (Device testing)** can be supplemented with cloud device farm services (AWS Device Farm, BrowserStack, Firebase Test Lab) when maintaining a physical device inventory is impractical. These services provide access to a range of device models and OS versions but add latency to the feedback loop compared to local testing.

- **IOST-05 (Test plan granularity)** depends on suite size and team workflow. Small apps with fast UI tests may not need separate plans. Large teams may add additional plans for smoke tests, accessibility audits, or localization verification. The key principle is that developer feedback on PRs should be fast (under 10 minutes ideally).
