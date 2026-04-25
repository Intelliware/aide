# Kotlin Testing Standards

## Purpose

These standards define Kotlin-specific testing practices that leverage the language's features and testing ecosystem. They complement the common testing standards with rules for MockK, Kotest matchers, coroutine testing, Flow testing, and idiomatic Kotlin test patterns — ensuring tests are expressive, maintainable, and take full advantage of Kotlin's type system and DSL capabilities.

## Applicability

All Kotlin projects including Android applications, server-side services (Spring Boot, Ktor, Micronaut), shared KMP modules, and any codebase using JUnit 5 or Kotest as the test runner.

## Rules

### KTT-01: Use MockK Over Mockito

**Severity:** Warning
**Rule:** Use MockK for all mocking needs — never use Mockito's Java-centric API directly in Kotlin code.
**Why:** MockK is built for Kotlin and supports coroutines, extension functions, object mocking, and top-level function mocking natively — Mockito requires wrapper libraries and produces unidiomatic Kotlin.

**Compliant:**

```kotlin
val orderRepository = mockk<OrderRepository>()

every { orderRepository.findById("order-1") } returns Order(
    id = "order-1",
    status = Status.ACTIVE,
    total = BigDecimal("99.99"),
)

coEvery { orderRepository.save(any()) } returns Unit

val service = OrderService(orderRepository)
val result = service.findOrder("order-1")

verify(exactly = 1) { orderRepository.findById("order-1") }
coVerify { orderRepository.save(any()) }
```

**Non-compliant:**

```kotlin
// Mockito requires backtick-wrapped when() and explicit Answer types
val orderRepository = mock(OrderRepository::class.java)

`when`(orderRepository.findById("order-1"))
    .thenReturn(Order(id = "order-1", status = Status.ACTIVE, total = BigDecimal("99.99")))

// No native coroutine support — requires runBlocking wrapper and mockito-kotlin
runBlocking {
    `when`(orderRepository.save(any())).thenReturn(Unit)
}
```

---

### KTT-02: Use Kotest Matchers for Assertions

**Severity:** Convention
**Rule:** Use Kotest matchers (`shouldBe`, `shouldHaveSize`, `shouldBeInstanceOf`, `shouldThrow`) for assertions — they provide a fluent Kotlin DSL that reads naturally.
**Why:** Kotest matchers produce clear failure messages, chain naturally in Kotlin, and support type-safe assertions that JUnit's `assertEquals` and `assertTrue` cannot express as concisely.

**Compliant:**

```kotlin
result shouldBe expected
result.shouldBeInstanceOf<PaymentResult.Success>()

orders shouldHaveSize 3
orders.first().status shouldBe Status.ACTIVE

shouldThrow<OrderNotFoundError> {
    service.findOrder("nonexistent")
}.message shouldBe "Order not found: nonexistent"

price shouldBeGreaterThan BigDecimal.ZERO
name shouldStartWith "ORD-"
items shouldContainExactly listOf(item1, item2)
```

**Non-compliant:**

```kotlin
// JUnit assertions — verbose and less readable in Kotlin
assertEquals(expected, result)
assertTrue(result is PaymentResult.Success)
assertEquals(3, orders.size)
assertEquals(Status.ACTIVE, orders.first().status)
assertThrows<OrderNotFoundError> { service.findOrder("nonexistent") }
assertTrue(price > BigDecimal.ZERO)
```

---

### KTT-03: Test Coroutines with `runTest`

**Severity:** Error
**Rule:** Use `runTest` from `kotlinx-coroutines-test` for all coroutine test bodies — never use `runBlocking` in tests.
**Why:** `runTest` automatically advances virtual time, catches uncompleted coroutines, and fails on unhandled exceptions — `runBlocking` blocks the thread, doesn't handle `delay()` correctly, and masks timing-related bugs.

**Compliant:**

```kotlin
@Test
fun `processes order and sends notification`() = runTest {
    val orderService = OrderService(
        repository = mockk { coEvery { save(any()) } returns Unit },
        notifier = mockk { coEvery { send(any()) } returns Unit },
    )

    val result = orderService.processOrder(testOrder)

    result.shouldBeInstanceOf<OrderResult.Success>()
    coVerify { orderService.notifier.send(any()) }
}

@Test
fun `retries on transient failure`() = runTest {
    val service = mockk<ExternalService>()
    coEvery { service.call() } throws IOException() andThen "success"

    val result = retryWithDelay(maxRetries = 2) { service.call() }

    result shouldBe "success"
}
```

**Non-compliant:**

```kotlin
// runBlocking doesn't advance virtual time — delay(1000) actually waits
@Test
fun `processes order and sends notification`() = runBlocking {
    val result = orderService.processOrder(testOrder)
    assertEquals(OrderResult.Success, result)
}

// Thread.sleep in tests — slow and flaky
@Test
fun `retries on failure`() {
    service.call() // fails
    Thread.sleep(1000) // actually waits a full second
    val result = service.call()
    assertEquals("success", result)
}
```

---

### KTT-04: Use Turbine for Flow Testing

**Severity:** Warning
**Rule:** Use Turbine's `test` extension to assert on Flow emissions — never collect a Flow to a list and assert on the list.
**Why:** Turbine provides structured, sequential assertions on each emission with built-in timeout handling and completion verification — collecting to a list loses emission ordering guarantees and hangs on infinite Flows.

**Compliant:**

```kotlin
@Test
fun `emits order status updates`() = runTest {
    val flow = orderService.observeStatus("order-1")

    flow.test {
        awaitItem() shouldBe Status.PENDING
        awaitItem() shouldBe Status.PROCESSING
        awaitItem() shouldBe Status.SHIPPED
        awaitComplete()
    }
}

@Test
fun `emits error on invalid order`() = runTest {
    val flow = orderService.observeStatus("invalid")

    flow.test {
        awaitError().shouldBeInstanceOf<OrderNotFoundError>()
    }
}
```

**Non-compliant:**

```kotlin
// Collecting to a list — hangs on infinite Flows, loses emission timing
@Test
fun `emits order status updates`() = runTest {
    val statuses = orderService.observeStatus("order-1").toList()

    statuses shouldBe listOf(Status.PENDING, Status.PROCESSING, Status.SHIPPED)
}

// take() is fragile — silently passes if fewer items are emitted
@Test
fun `emits updates`() = runTest {
    val statuses = orderService.observeStatus("order-1").take(3).toList()
    assertEquals(3, statuses.size)
}
```

---

### KTT-05: Use Data Classes for Test Fixtures

**Severity:** Convention
**Rule:** Define test fixtures as data class instances and use `.copy()` to create variants — never use builder patterns or mutable fixture objects in tests.
**Why:** Data class `copy()` is the factory pattern for free — it creates readable, minimal test variations without boilerplate builders, and makes it obvious which fields differ from the baseline.

**Compliant:**

```kotlin
private val baseOrder = Order(
    id = "order-1",
    customerId = "cust-1",
    items = listOf(OrderItem(productId = "prod-1", quantity = 2, price = BigDecimal("25.00"))),
    status = Status.ACTIVE,
    total = BigDecimal("50.00"),
    createdAt = Instant.parse("2025-01-15T10:00:00Z"),
)

@Test
fun `cancels active order`() = runTest {
    val result = service.cancel(baseOrder)
    result.status shouldBe Status.CANCELLED
}

@Test
fun `rejects cancellation of shipped order`() = runTest {
    val shippedOrder = baseOrder.copy(status = Status.SHIPPED)

    shouldThrow<IllegalStateException> {
        service.cancel(shippedOrder)
    }
}

@Test
fun `applies discount to high-value orders`() = runTest {
    val highValueOrder = baseOrder.copy(total = BigDecimal("500.00"))
    val result = service.applyDiscount(highValueOrder)
    result.total shouldBeLessThan BigDecimal("500.00")
}
```

**Non-compliant:**

```kotlin
// Mutable builder — verbose and hides which fields matter for the test
class OrderBuilder {
    var id = "order-1"
    var status = Status.ACTIVE
    var total = BigDecimal("50.00")
    // ...20 more fields...
    fun build() = Order(id, customerId, items, status, total, createdAt)
}

@Test
fun `rejects cancellation of shipped order`() {
    val order = OrderBuilder().apply { status = Status.SHIPPED }.build()
    // reader must check OrderBuilder to know the defaults
}
```

---

### KTT-06: Test Sealed Class Branches Exhaustively

**Severity:** Warning
**Rule:** Write at least one test for each branch of a sealed class hierarchy — use `when` in test helper functions to catch missing branches at compile time when new variants are added.
**Why:** The compiler enforces exhaustive `when` in production code but not in tests — without deliberate test coverage for each branch, new sealed class variants can ship untested.

**Compliant:**

```kotlin
sealed interface PaymentResult {
    data class Success(val transactionId: String) : PaymentResult
    data class Declined(val reason: String) : PaymentResult
    data class GatewayError(val cause: Throwable) : PaymentResult
}

@Test
fun `handles successful payment`() = runTest {
    coEvery { gateway.charge(any()) } returns PaymentResult.Success("txn-123")
    val result = service.processPayment(order)
    result.shouldBeInstanceOf<PaymentResult.Success>()
    result.transactionId shouldBe "txn-123"
}

@Test
fun `handles declined payment`() = runTest {
    coEvery { gateway.charge(any()) } returns PaymentResult.Declined("insufficient_funds")
    val result = service.processPayment(order)
    result.shouldBeInstanceOf<PaymentResult.Declined>()
    result.reason shouldBe "insufficient_funds"
}

@Test
fun `handles gateway error`() = runTest {
    val error = IOException("timeout")
    coEvery { gateway.charge(any()) } returns PaymentResult.GatewayError(error)
    val result = service.processPayment(order)
    result.shouldBeInstanceOf<PaymentResult.GatewayError>()
    result.cause shouldBe error
}

// Compile-time safety net — forces updates when a new branch is added
private fun assertHandled(result: PaymentResult) = when (result) {
    is PaymentResult.Success -> result.transactionId
    is PaymentResult.Declined -> result.reason
    is PaymentResult.GatewayError -> result.cause.message
}
```

**Non-compliant:**

```kotlin
// Only tests the happy path — Declined and GatewayError are untested
@Test
fun `processes payment`() = runTest {
    coEvery { gateway.charge(any()) } returns PaymentResult.Success("txn-123")
    val result = service.processPayment(order)
    assertTrue(result is PaymentResult.Success)
}

// Uses else branch — adding a new variant won't trigger a compile error
private fun assertHandled(result: PaymentResult) = when (result) {
    is PaymentResult.Success -> "ok"
    else -> "not ok"
}
```

---

### KTT-07: Test Extension Functions on the Receiver Type

**Severity:** Convention
**Rule:** Test extension functions by invoking them directly on the receiver type — treat them like regular functions with the receiver as input context.
**Why:** Extension functions are syntactic sugar for static functions with the receiver as the first parameter — testing them directly on the receiver verifies both the logic and the ergonomics of the call site.

**Compliant:**

```kotlin
// Extension under test
fun String.toSlug(): String =
    lowercase().replace(Regex("[^a-z0-9\\s-]"), "").replace(Regex("\\s+"), "-").trim('-')

@Test
fun `converts title to URL slug`() {
    "Hello World".toSlug() shouldBe "hello-world"
}

@Test
fun `strips special characters from slug`() {
    "Price: \$19.99!".toSlug() shouldBe "price-1999"
}

@Test
fun `handles empty string`() {
    "".toSlug() shouldBe ""
}

@Test
fun `collapses multiple spaces into single hyphen`() {
    "too   many   spaces".toSlug() shouldBe "too-many-spaces"
}
```

**Non-compliant:**

```kotlin
// Calling as a static function — loses the extension syntax and readability
@Test
fun `converts to slug`() {
    val input = "Hello World"
    val result = toSlug(input) // this doesn't even compile — not how extensions work
    assertEquals("hello-world", result)
}

// Testing through an unrelated wrapper instead of directly
@Test
fun `converts to slug`() {
    val formatter = SlugFormatter()
    val result = formatter.format("Hello World")
    assertEquals("hello-world", result)
}
```

---

### KTT-08: Use Descriptive Test Names with Backticks

**Severity:** Convention
**Rule:** Name test functions using backtick-quoted descriptive sentences that state the expected behavior — never use camelCase test names or numeric suffixes.
**Why:** Backtick names read as plain English in test reports, making failures immediately understandable without reading the test body — `rejects refund when order is not delivered` is self-documenting in a way that `testRejectRefund` never can be.

**Compliant:**

```kotlin
@Test
fun `rejects refund when order is not yet delivered`() = runTest {
    val order = baseOrder.copy(status = Status.PROCESSING)
    shouldThrow<RefundNotAllowedError> { service.refund(order) }
}

@Test
fun `applies 10 percent discount for orders over 100 dollars`() = runTest {
    val order = baseOrder.copy(total = BigDecimal("150.00"))
    val result = service.applyDiscount(order)
    result.total shouldBe BigDecimal("135.00")
}

@Test
fun `returns empty list when no orders match filter`() = runTest {
    coEvery { repository.findByStatus(any()) } returns emptyList()
    service.getActiveOrders() shouldHaveSize 0
}
```

**Non-compliant:**

```kotlin
// camelCase — reads as code, not as behavior specification
@Test
fun testRejectRefund() { /* ... */ }

// Numeric suffix — meaningless without reading the body
@Test
fun testRefund1() { /* ... */ }

@Test
fun testRefund2() { /* ... */ }

// Abbreviated — what does "inv ord" mean?
@Test
fun testCancelInvOrd() { /* ... */ }
```

## Customization

- **KTT-01 (MockK vs Mockito)** is the most common point of divergence. Teams with existing Java codebases may standardize on Mockito with the `mockito-kotlin` wrapper library, which provides a reasonable Kotlin DSL. The rule strongly prefers MockK for greenfield Kotlin projects, but teams migrating from Java may adopt Mockito + mockito-kotlin as an intermediate step.

- **KTT-02 (Kotest vs JUnit assertions)** is largely team preference. JUnit 5 assertions are adequate and universally available. Kotest matchers add expressiveness and better failure messages but introduce an additional dependency. Teams that use Kotest as their test runner get matchers for free; teams using JUnit 5 as the runner can still add `kotest-assertions-core` independently.

- **KTT-04 (Turbine)** is essential for projects with heavy Flow usage (Android ViewModel layers, reactive server pipelines) but optional for projects that use coroutines primarily for one-shot suspend functions. If the project has no Flow-based APIs, this rule can be deferred until Flows are introduced.

- **KTT-03 (`runTest`)** requires `kotlinx-coroutines-test` as a test dependency. Ensure the coroutines test library version matches the production `kotlinx-coroutines-core` version to avoid binary compatibility issues.

- **KTT-08 (Backtick names)** is a Kotlin-specific convention that does not apply to shared multiplatform test targets compiled to JavaScript, where backtick function names are not supported. In KMP projects targeting JS, fall back to descriptive camelCase names.
