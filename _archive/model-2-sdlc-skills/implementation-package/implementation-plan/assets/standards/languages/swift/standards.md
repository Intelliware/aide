# Swift Standards

## Purpose

These standards establish Swift-specific coding patterns and idioms that produce safe, expressive, and performant code. They supplement the common standards (error handling, logging, etc.) with rules that leverage Swift's type system, value semantics, concurrency model, and protocol-oriented design. Following these rules ensures consistency across Swift projects and aligns with the conventions expected by the broader Swift ecosystem.

## Applicability

All Swift projects (Swift 5.9+) — iOS, macOS, server-side Swift. Rules that require a specific Swift version or minimum deployment target are tagged with a **Requires** annotation — the codebase analysis step extracts the project's Swift version from `Package.swift` or the Xcode project and applies only compatible rules.

## Rules

### SW-01: Prefer Value Types

**Severity:** Convention
**Rule:** Use `struct` by default; use `class` only when identity matters, inheritance is needed, or reference semantics are required.
**Why:** Value types are copied on assignment, preventing shared mutation bugs and making data flow easier to reason about.

**Compliant:**

```swift
struct Address {
    var street: String
    var city: String
    var postalCode: String
}

struct Order {
    let id: UUID
    var items: [OrderItem]
    var shippingAddress: Address
    var status: OrderStatus
}

// Class is appropriate here — UIKit view controllers require inheritance
class OrderDetailViewController: UIViewController {
    private let order: Order
    // ...
}
```

**Non-compliant:**

```swift
// Unnecessary class — this is pure data with no identity semantics
class Address {
    var street: String
    var city: String
    var postalCode: String

    init(street: String, city: String, postalCode: String) {
        self.street = street
        self.city = city
        self.postalCode = postalCode
    }
}

// Shared mutation bug: both variables point to the same instance
let home = Address(street: "123 Main", city: "Springfield", postalCode: "62704")
let shipping = home
shipping.street = "456 Oak"  // also changes home.street
```

---

### SW-02: Use `guard let` for Early Exits

**Severity:** Warning
**Rule:** Use `guard let` to unwrap optionals at the top of a function and exit early on failure — never use nested `if let` pyramids.
**Why:** Guard clauses keep the happy path unindented and make preconditions immediately visible.

**Compliant:**

```swift
func processOrder(_ orderID: String?) throws -> Receipt {
    guard let orderID else {
        throw AppError.missingInput("orderID")
    }

    guard let order = orderRepository.find(by: orderID) else {
        throw AppError.notFound(entity: "Order", id: orderID)
    }

    guard order.status == .pending else {
        throw AppError.invalidState("Order \(orderID) is not pending")
    }

    return try paymentService.charge(order)
}
```

**Non-compliant:**

```swift
func processOrder(_ orderID: String?) throws -> Receipt {
    if let orderID = orderID {
        if let order = orderRepository.find(by: orderID) {
            if order.status == .pending {
                return try paymentService.charge(order)
            } else {
                throw AppError.invalidState("Order is not pending")
            }
        } else {
            throw AppError.notFound(entity: "Order", id: orderID)
        }
    } else {
        throw AppError.missingInput("orderID")
    }
}
```

---

### SW-03: Use Swift Concurrency

**Severity:** Error
**Rule:** Use `async/await`, `actor`, `Sendable`, and structured concurrency (`TaskGroup`) for all new concurrent code — never use raw GCD `DispatchQueue` in new code.
**Why:** Swift Concurrency provides compile-time safety against data races, structured task lifetimes, and cooperative cancellation that GCD cannot enforce.

**Compliant:**

```swift
actor ShoppingCart {
    private var items: [CartItem] = []

    func add(_ item: CartItem) {
        items.append(item)
    }

    func total() -> Decimal {
        items.reduce(0) { $0 + $1.price * Decimal($1.quantity) }
    }
}

func fetchDashboard(userID: String) async throws -> Dashboard {
    async let profile = userService.fetchProfile(userID)
    async let orders = orderService.fetchRecent(userID)
    async let recommendations = recommendationService.fetch(userID)

    return Dashboard(
        profile: try await profile,
        orders: try await orders,
        recommendations: try await recommendations
    )
}
```

**Non-compliant:**

```swift
// Raw GCD with manual synchronization — no compile-time race detection
class ShoppingCart {
    private var items: [CartItem] = []
    private let queue = DispatchQueue(label: "cart.sync")

    func add(_ item: CartItem) {
        queue.sync { items.append(item) }
    }

    func total() -> Decimal {
        queue.sync { items.reduce(0) { $0 + $1.price * Decimal($1.quantity) } }
    }
}

// Callback-based concurrency — no structured cancellation, easy to leak tasks
func fetchDashboard(userID: String, completion: @escaping (Result<Dashboard, Error>) -> Void) {
    let group = DispatchGroup()
    var profile: UserProfile?
    var orders: [Order]?

    group.enter()
    userService.fetchProfile(userID) { result in
        profile = try? result.get()
        group.leave()
    }
    // ... more group.enter()/leave() pairs
}
```

---

### SW-04: Use Protocol-Oriented Design

**Severity:** Convention
**Rule:** Define behavior with protocols and provide default implementations via extensions — prefer protocol conformance over class inheritance for shared behavior.
**Why:** Protocol-oriented design enables composition without the rigidity of class hierarchies, and works with both value and reference types.

**Compliant:**

```swift
protocol Cacheable {
    var cacheKey: String { get }
    var cacheDuration: TimeInterval { get }
}

extension Cacheable {
    var cacheDuration: TimeInterval { 300 }
}

struct UserProfile: Cacheable {
    let id: String
    let name: String

    var cacheKey: String { "user_\(id)" }
}

struct ProductListing: Cacheable {
    let id: String
    let title: String

    var cacheKey: String { "product_\(id)" }
    var cacheDuration: TimeInterval { 60 }
}

func cache<T: Cacheable & Codable>(_ item: T, in store: CacheStore) throws {
    let data = try JSONEncoder().encode(item)
    store.set(data, forKey: item.cacheKey, duration: item.cacheDuration)
}
```

**Non-compliant:**

```swift
// Deep class hierarchy for code sharing — rigid and fragile
class CacheableEntity {
    var cacheKey: String { fatalError("Subclass must override") }
    var cacheDuration: TimeInterval { 300 }
}

class UserProfile: CacheableEntity {
    let id: String
    let name: String

    override var cacheKey: String { "user_\(id)" }

    init(id: String, name: String) {
        self.id = id
        self.name = name
        super.init()
    }
}
// UserProfile is now forced to be a class, cannot be a struct
```

---

### SW-05: Use Proper Access Control

**Severity:** Warning
**Rule:** Mark implementation details `private`, use `internal` (the default) within a module, and expose only intentional API as `public` — never leave everything `public`.
**Why:** Minimizing the visible API surface prevents accidental coupling, makes refactoring safe, and clearly communicates which types and methods are stable contracts.

**Compliant:**

```swift
public struct PaymentProcessor {
    public let merchantID: String

    public init(merchantID: String) {
        self.merchantID = merchantID
    }

    public func charge(_ amount: Decimal, card: CardToken) async throws -> Receipt {
        let request = buildRequest(amount: amount, card: card)
        let response = try await send(request)
        return try parseReceipt(response)
    }

    private func buildRequest(amount: Decimal, card: CardToken) -> PaymentRequest {
        PaymentRequest(merchantID: merchantID, amount: amount, token: card.value)
    }

    private func send(_ request: PaymentRequest) async throws -> HTTPResponse {
        try await httpClient.post(endpoint, body: request)
    }

    private func parseReceipt(_ response: HTTPResponse) throws -> Receipt {
        try JSONDecoder().decode(Receipt.self, from: response.data)
    }
}
```

**Non-compliant:**

```swift
// Everything is public — callers can depend on internal helpers
public struct PaymentProcessor {
    public let merchantID: String

    public func charge(_ amount: Decimal, card: CardToken) async throws -> Receipt {
        let request = buildRequest(amount: amount, card: card)
        let response = try await send(request)
        return try parseReceipt(response)
    }

    public func buildRequest(amount: Decimal, card: CardToken) -> PaymentRequest {
        PaymentRequest(merchantID: merchantID, amount: amount, token: card.value)
    }

    public func send(_ request: PaymentRequest) async throws -> HTTPResponse {
        try await httpClient.post(endpoint, body: request)
    }

    public func parseReceipt(_ response: HTTPResponse) throws -> Receipt {
        try JSONDecoder().decode(Receipt.self, from: response.data)
    }
}
```

---

### SW-06: Use `Codable` for Serialization

**Severity:** Error
**Rule:** Conform types to `Codable` for JSON serialization and use `CodingKeys` for custom field mapping — never manually parse JSON with dictionaries and casts.
**Why:** `Codable` provides compile-time type safety, eliminates `as?` cast chains, and handles nested structures, optionals, and dates consistently.

**Compliant:**

```swift
struct User: Codable {
    let id: String
    let fullName: String
    let emailAddress: String
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case fullName = "full_name"
        case emailAddress = "email_address"
        case createdAt = "created_at"
    }
}

func fetchUser(id: String) async throws -> User {
    let (data, _) = try await URLSession.shared.data(from: userURL(id))
    let decoder = JSONDecoder()
    decoder.dateDecodingStrategy = .iso8601
    return try decoder.decode(User.self, from: data)
}
```

**Non-compliant:**

```swift
func fetchUser(id: String) async throws -> [String: Any] {
    let (data, _) = try await URLSession.shared.data(from: userURL(id))
    guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
        throw AppError.parseError("Invalid JSON")
    }

    // Fragile cast chain — no compile-time safety, silent nil on type mismatch
    let name = json["full_name"] as? String ?? ""
    let email = json["email_address"] as? String ?? ""
    return ["name": name, "email": email]
}
```

---

### SW-07: Use Property Wrappers for Reusable Patterns

**Severity:** Convention
**Rule:** Encapsulate reusable property behavior in property wrappers (`@Published`, `@AppStorage`, `@State`, or custom wrappers) — never repeat the same getter/setter logic across types.
**Why:** Property wrappers eliminate boilerplate, centralize validation or transformation logic, and make intent explicit at the declaration site.

**Compliant:**

```swift
@propertyWrapper
struct Clamped<Value: Comparable> {
    private var value: Value
    private let range: ClosedRange<Value>

    var wrappedValue: Value {
        get { value }
        set { value = min(max(newValue, range.lowerBound), range.upperBound) }
    }

    init(wrappedValue: Value, _ range: ClosedRange<Value>) {
        self.range = range
        self.value = min(max(wrappedValue, range.lowerBound), range.upperBound)
    }
}

struct AudioSettings {
    @Clamped(0...100) var volume: Int = 50
    @Clamped(0...100) var bass: Int = 50
    @Clamped(0...100) var treble: Int = 50
}

var settings = AudioSettings()
settings.volume = 150  // clamped to 100
```

**Non-compliant:**

```swift
// Same clamping logic duplicated across every property
struct AudioSettings {
    private var _volume: Int = 50
    var volume: Int {
        get { _volume }
        set { _volume = min(max(newValue, 0), 100) }
    }

    private var _bass: Int = 50
    var bass: Int {
        get { _bass }
        set { _bass = min(max(newValue, 0), 100) }
    }

    private var _treble: Int = 50
    var treble: Int {
        get { _treble }
        set { _treble = min(max(newValue, 0), 100) }
    }
}
```

---

### SW-08: Use Typed Errors

**Severity:** Error
**Rule:** Define domain-specific error types as enums conforming to `Error` with associated values — never throw `NSError` or untyped `Error` instances.
**Why:** Typed errors enable exhaustive `do-catch` pattern matching, carry structured context, and make failure modes part of the API contract. See also the common error handling standards for cross-cutting error principles.

**Compliant:**

```swift
enum OrderError: Error {
    case notFound(id: String)
    case insufficientStock(productID: String, requested: Int, available: Int)
    case paymentDeclined(reason: String)
    case expired(orderID: String, expiredAt: Date)
}

func fulfillOrder(_ orderID: String) throws -> Shipment {
    guard let order = repository.find(orderID) else {
        throw OrderError.notFound(id: orderID)
    }

    for item in order.items {
        let stock = inventory.available(item.productID)
        guard stock >= item.quantity else {
            throw OrderError.insufficientStock(
                productID: item.productID,
                requested: item.quantity,
                available: stock
            )
        }
    }

    return try shipmentService.create(for: order)
}

// Caller handles specific cases with pattern matching
do {
    let shipment = try fulfillOrder(orderID)
} catch OrderError.notFound(let id) {
    logger.warning("Order not found", metadata: ["orderID": "\(id)"])
} catch OrderError.insufficientStock(let productID, let requested, let available) {
    logger.error("Stock shortage", metadata: [
        "productID": "\(productID)",
        "requested": "\(requested)",
        "available": "\(available)",
    ])
} catch {
    logger.error("Unexpected error fulfilling order", metadata: ["error": "\(error)"])
}
```

**Non-compliant:**

```swift
// Untyped NSError — no structured context, no exhaustive matching
func fulfillOrder(_ orderID: String) throws -> Shipment {
    guard let order = repository.find(orderID) else {
        throw NSError(domain: "OrderDomain", code: 404, userInfo: [
            NSLocalizedDescriptionKey: "Order not found",
        ])
    }
    // ...
}

// Caller resorts to string matching or error code guessing
do {
    let shipment = try fulfillOrder(orderID)
} catch let error as NSError {
    if error.code == 404 {
        // fragile — what if another 404 error comes from a different domain?
    }
}
```

---

### SW-09: Follow Apple Naming Guidelines

**Severity:** Warning
**Rule:** Use clear, grammatical method and parameter names — label all parameters except the first when natural, omit needless words, and name methods so that call sites read as English phrases.
**Why:** Consistent naming aligns with the Swift standard library and Apple frameworks, reducing cognitive load for every developer reading the code.

**Compliant:**

```swift
extension Array {
    func element(at index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}

struct OrderService {
    func placeOrder(for customer: Customer, with items: [OrderItem]) async throws -> Order {
        // ...
    }

    func cancel(_ order: Order, reason: CancellationReason) async throws {
        // ...
    }
}

// Call sites read naturally
let order = try await service.placeOrder(for: customer, with: cartItems)
try await service.cancel(order, reason: .customerRequest)
let third = items.element(at: 2)
```

**Non-compliant:**

```swift
struct OrderService {
    // Redundant type name in the method — "Order" appears twice at call site
    func placeOrderForCustomer(_ customer: Customer, orderItems: [OrderItem]) async throws -> Order {
        // ...
    }

    // Unclear abbreviation and missing argument labels
    func cxl(_ o: Order, _ r: Int) async throws {
        // ...
    }
}

// Call sites are unreadable
let order = try await service.placeOrderForCustomer(customer, orderItems: cartItems)
try await service.cxl(order, 3)
```

---

### SW-10: Use `let` by Default

**Severity:** Warning
**Rule:** Declare constants with `let`; use `var` only when the value must be mutated after initialization.
**Why:** Immutability by default communicates intent, prevents accidental mutation, and enables compiler optimizations.

**Compliant:**

```swift
func calculateTotal(for items: [OrderItem], taxRate: Decimal) -> Decimal {
    let subtotal = items.reduce(Decimal.zero) { $0 + $1.price * Decimal($1.quantity) }
    let tax = subtotal * taxRate
    let total = subtotal + tax
    return total
}

struct Route {
    let origin: Coordinate
    let destination: Coordinate
    let waypoints: [Coordinate]
}
```

**Non-compliant:**

```swift
func calculateTotal(for items: [OrderItem], taxRate: Decimal) -> Decimal {
    // All declared as var but never mutated
    var subtotal = items.reduce(Decimal.zero) { $0 + $1.price * Decimal($1.quantity) }
    var tax = subtotal * taxRate
    var total = subtotal + tax
    return total
}

struct Route {
    // var allows accidental mutation of what should be fixed data
    var origin: Coordinate
    var destination: Coordinate
    var waypoints: [Coordinate]
}
```

### SW-11: Use Code Formatting Tools

**Severity:** Convention
**Rule:** Configure **SwiftFormat** for auto-formatting and **SwiftLint** for style enforcement — run both in CI. Xcode 16+ bundles `swift-format` as an alternative to SwiftFormat.
**Why:** Automated formatting eliminates style debates in code review, ensures consistent output regardless of developer environment, and produces clean diffs.

**Compliant:**

```swift
// .swiftformat configuration
--swiftversion 5.9
--indent 4
--wraparguments before-first
--wrapparameters before-first
--stripunusedargs closure-only

// .swiftlint.yml
opt_in_rules:
  - force_unwrapping
  - implicitly_unwrapped_optional
disabled_rules:
  - trailing_whitespace
excluded:
  - Pods
  - .build
```

**Non-compliant:**

```swift
// No formatter configured — inconsistent style across contributors
func processOrder( order:Order)->Result<Receipt,Error>{  // inconsistent spacing
let items = order.items   // wrong indentation
    return .success(Receipt(items:items))  // no space after colon
}
```

---

### SW-12: Use Typed Throws

**Severity:** Convention
**Requires:** Swift 6.0+
**Rule:** Declare the error type in the function signature with `throws(ErrorType)` — the compiler enforces that only errors of that type are thrown and enables exhaustive `do-catch` matching.
**Why:** Untyped `throws` forces callers to catch `any Error`, losing the ability to exhaustively handle specific failure modes. Typed throws makes the error contract explicit and compiler-verified.

**Compliant:**

```swift
enum OrderError: Error {
    case notFound(id: String)
    case insufficientStock(productID: String, available: Int)
    case paymentDeclined(reason: String)
}

func fulfillOrder(_ id: String) throws(OrderError) -> Shipment {
    guard let order = repository.find(id) else {
        throw .notFound(id: id)
    }
    guard inventory.available(order.productID) >= order.quantity else {
        throw .insufficientStock(
            productID: order.productID,
            available: inventory.available(order.productID)
        )
    }
    return try shipmentService.create(for: order)
}

// Caller gets exhaustive matching — compiler verifies all cases handled
do {
    let shipment = try fulfillOrder(orderID)
} catch .notFound(let id) {
    logger.warning("Order not found: \(id)")
} catch .insufficientStock(let productID, let available) {
    logger.error("Stock shortage: \(productID), available: \(available)")
} catch .paymentDeclined(let reason) {
    logger.error("Payment declined: \(reason)")
}
```

**Non-compliant:**

```swift
// Untyped throws — caller must catch `any Error`
func fulfillOrder(_ id: String) throws -> Shipment {
    guard let order = repository.find(id) else {
        throw OrderError.notFound(id: id)
    }
    // ...
}

// Caller cannot exhaustively match — catch blocks are guesswork
do {
    let shipment = try fulfillOrder(orderID)
} catch {
    // What error types can this throw? No compiler help.
    print(error)
}
```

---

### SW-13: Use the Observation Framework

**Severity:** Convention
**Requires:** iOS 17+ / macOS 14+ (Swift 5.9+)
**Rule:** Use `@Observable` and `@Bindable` (Observation framework) for observable models in SwiftUI — prefer it over `ObservableObject` with `@Published` for new code targeting iOS 17+.
**Why:** The Observation framework provides more granular change tracking (per-property instead of per-object), eliminates boilerplate (`@Published` on every property), and avoids unnecessary view re-renders when unrelated properties change.

**Compliant:**

```swift
import Observation

@Observable
class OrderViewModel {
    var orders: [Order] = []
    var isLoading = false
    var errorMessage: String?

    func fetchOrders() async {
        isLoading = true
        defer { isLoading = false }

        do {
            orders = try await orderService.fetchAll()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

struct OrderListView: View {
    var viewModel = OrderViewModel()

    var body: some View {
        List(viewModel.orders) { order in
            OrderRow(order: order)
        }
        .overlay {
            if viewModel.isLoading { ProgressView() }
        }
        .task { await viewModel.fetchOrders() }
    }
}
```

**Non-compliant:**

```swift
// ObservableObject — entire object invalidates on any @Published change
class OrderViewModel: ObservableObject {
    @Published var orders: [Order] = []
    @Published var isLoading = false      // changing this re-evaluates views
    @Published var errorMessage: String?  // observing orders AND unrelated fields
}

struct OrderListView: View {
    @StateObject var viewModel = OrderViewModel()
    // View re-renders when isLoading changes, even if body only uses orders
}
```

---

## Customization

- **SW-12 (Typed throws)** requires Swift 6.0+. Projects on Swift 5.x should continue using untyped `throws` with enum error types and pattern matching in `catch` blocks (see SW-08). Adopt typed throws when the project's minimum Swift version reaches 6.0.

- **SW-13 (Observation framework)** requires iOS 17+ / macOS 14+. Projects supporting older deployment targets should continue using `ObservableObject` with `@Published` and adopt `@Observable` incrementally as minimum targets advance. Both approaches coexist in the same codebase during the transition.

- **SW-11 (Formatting tools)** — SwiftFormat and SwiftLint serve complementary roles: SwiftFormat auto-corrects formatting, SwiftLint enforces style rules and flags potential issues. Using both together is recommended but either alone is acceptable as long as it is configured project-wide and enforced in CI.

- **SW-03 (Swift Concurrency)** adoption depends on minimum deployment target. `async/await` requires iOS 15+ / macOS 12+. Projects supporting older OS versions may need to continue using GCD or Combine for concurrency, adopting Swift Concurrency incrementally as deployment targets advance.

- **SW-01 (Prefer value types)** may be relaxed when interoperating with Objective-C frameworks. Classes are required for `@objc` exposure, `NSObject` subclassing, and any type that must participate in Objective-C runtime features (KVO, selectors).

- **SW-04 (Protocol-oriented design)** is the idiomatic Swift approach, but protocol witnesses vs. existential types (`any Protocol` vs. `some Protocol`) is an advanced distinction. Teams should prefer concrete `some Protocol` for performance-sensitive code and `any Protocol` when runtime polymorphism is needed. This nuance can be deferred until the team encounters measurable performance differences.

- **SW-08 (Typed errors)** works in conjunction with the common error handling standards. The common standards define cross-cutting principles (never swallow errors, include context, fail fast); this rule specifies the Swift-idiomatic mechanism for implementing those principles using `enum` error types with associated values.
