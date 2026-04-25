# Kotlin Standards

## Purpose

These standards codify idiomatic Kotlin patterns that leverage the language's type system, null safety, and concurrency model. They complement the common standards (error handling, naming, testing) with Kotlin-specific rules — covering immutability, sealed hierarchies, scope functions, coroutines, and other language features that distinguish well-written Kotlin from "Java written in .kt files."

## Applicability

All Kotlin projects (Kotlin 1.9+) including Android applications, server-side services (Spring Boot, Ktor, Micronaut), shared KMP modules, and CLI tools. Rules that require a specific Kotlin version are tagged with a **Requires** annotation — the codebase analysis step extracts the project's Kotlin version from `build.gradle.kts` or `gradle.properties` and applies only compatible rules.

## Rules

### KT-01: Use `val` Over `var`

**Severity:** Warning
**Rule:** Default to `val` for all declarations — use `var` only when mutation is genuinely necessary.
**Why:** Immutability prevents accidental state changes, simplifies reasoning about data flow, and eliminates an entire class of concurrency bugs.

**Compliant:**

```kotlin
val orderId = request.orderId
val items = fetchItems(orderId)
val total = items.sumOf { it.price }

// var is justified when accumulating in a loop without a functional alternative
var retryCount = 0
while (retryCount < maxRetries) {
    if (tryConnect()) break
    retryCount++
}
```

**Non-compliant:**

```kotlin
var orderId = request.orderId       // never reassigned — should be val
var items = fetchItems(orderId)     // never reassigned — should be val
var total = items.sumOf { it.price } // never reassigned — should be val
```

---

### KT-02: Use Data Classes for Value Objects

**Severity:** Warning
**Rule:** Model DTOs, value objects, and any type defined primarily by its data as a `data class` — never hand-write `equals`, `hashCode`, `copy`, or `toString`.
**Why:** Data classes auto-generate `equals`, `hashCode`, `copy`, and `toString` correctly, eliminating boilerplate and the bugs that come from maintaining these methods manually.

**Compliant:**

```kotlin
data class OrderDto(
    val id: String,
    val customerId: String,
    val total: BigDecimal,
    val status: OrderStatus,
)

val updated = order.copy(status = OrderStatus.SHIPPED)
```

**Non-compliant:**

```kotlin
class OrderDto(
    val id: String,
    val customerId: String,
    val total: BigDecimal,
    val status: OrderStatus,
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is OrderDto) return false
        return id == other.id && customerId == other.customerId
            && total == other.total && status == other.status
    }

    override fun hashCode() = Objects.hash(id, customerId, total, status)
    override fun toString() = "OrderDto(id=$id, status=$status)"
}
```

---

### KT-03: Use Sealed Classes/Interfaces for Closed Hierarchies

**Severity:** Error
**Rule:** Model fixed sets of related types as `sealed class` or `sealed interface` — never use enums that carry data or open class hierarchies for known-closed type sets.
**Why:** The compiler enforces exhaustive `when` expressions on sealed types, so adding a new variant produces compile errors everywhere it must be handled — enums cannot carry per-variant data and open hierarchies silently miss new cases.

**Compliant:**

```kotlin
sealed interface PaymentResult {
    data class Success(val transactionId: String, val amount: BigDecimal) : PaymentResult
    data class Declined(val reason: String) : PaymentResult
    data class GatewayError(val cause: Throwable) : PaymentResult
}

fun handle(result: PaymentResult): String = when (result) {
    is PaymentResult.Success -> "Paid: ${result.transactionId}"
    is PaymentResult.Declined -> "Declined: ${result.reason}"
    is PaymentResult.GatewayError -> "Error: ${result.cause.message}"
    // no else needed — compiler enforces exhaustiveness
}
```

**Non-compliant:**

```kotlin
enum class PaymentResult {
    SUCCESS, DECLINED, GATEWAY_ERROR
}

// Forced to pass data separately — the enum can't carry it
fun handle(result: PaymentResult, transactionId: String?, reason: String?) {
    when (result) {
        PaymentResult.SUCCESS -> println("Paid: $transactionId")
        PaymentResult.DECLINED -> println("Declined: $reason")
        PaymentResult.GATEWAY_ERROR -> println("Error")
    }
}
```

---

### KT-04: Use Extension Functions for Utility Operations

**Severity:** Convention
**Rule:** Add utility behavior to existing types via extension functions — never create `*Utils` companion classes with static-style methods.
**Why:** Extension functions are discoverable through IDE auto-complete on the receiver type, read naturally in call chains, and eliminate the need for callers to know which utility class holds the method.

**Compliant:**

```kotlin
fun String.toSlug(): String =
    lowercase()
        .replace(Regex("[^a-z0-9\\s-]"), "")
        .replace(Regex("\\s+"), "-")
        .trim('-')

fun Instant.toIsoDate(): String = DateTimeFormatter.ISO_DATE.format(this)

val slug = "Hello World!".toSlug() // "hello-world"
```

**Non-compliant:**

```kotlin
object StringUtils {
    fun toSlug(input: String): String =
        input.lowercase()
            .replace(Regex("[^a-z0-9\\s-]"), "")
            .replace(Regex("\\s+"), "-")
            .trim('-')
}

val slug = StringUtils.toSlug("Hello World!") // caller must know about StringUtils
```

---

### KT-05: Use Scope Functions Idiomatically

**Severity:** Convention
**Rule:** Use `let` for null-safe transforms, `apply` for object configuration, `also` for side effects, and `run` for scoped computation — never nest more than two scope functions.
**Why:** Each scope function has a distinct semantic intent; using the right one communicates purpose, while nesting beyond two levels destroys readability.

**Compliant:**

```kotlin
// let: null-safe transformation
val displayName = user.middleName?.let { "$firstName $it $lastName" }
    ?: "$firstName $lastName"

// apply: configure an object after construction
val request = HttpRequest().apply {
    url = "https://api.example.com/orders"
    method = HttpMethod.POST
    headers["Authorization"] = "Bearer $token"
}

// also: side effects without changing the result
val order = orderRepository.save(newOrder).also {
    logger.info("Order created", mapOf("orderId" to it.id))
}

// run: scoped computation on a receiver
val report = reportBuilder.run {
    addHeader("Monthly Sales")
    addRows(salesData)
    build()
}
```

**Non-compliant:**

```kotlin
// Deeply nested scope functions — unreadable
val result = service.findOrder(id)?.let { order ->
    order.items.firstOrNull()?.let { item ->
        item.product?.let { product ->
            product.name
        }
    }
}

// Wrong scope function — apply used for computation instead of configuration
val total = order.apply {
    val subtotal = items.sumOf { it.price }
    val tax = subtotal * taxRate
}
```

---

### KT-06: Leverage Null Safety

**Severity:** Error
**Rule:** Use `?.`, `?:`, `let`, `require`, and `checkNotNull` to handle nullability — never use `!!` (not-null assertion) except in test code.
**Why:** `!!` throws `KotlinNullPointerException` at runtime with no context, defeating the entire purpose of Kotlin's compile-time null safety system.

**Compliant:**

```kotlin
// Safe call + elvis for default
val city = user.address?.city ?: "Unknown"

// let for null-safe transformation
val email = user.email?.let { Email.parse(it) }

// require/checkNotNull at boundaries with descriptive messages
fun processOrder(orderId: String?) {
    val id = requireNotNull(orderId) { "orderId must not be null" }
    val order = checkNotNull(orderRepository.findById(id)) {
        "Order not found: $id"
    }
    // proceed with non-null id and order
}
```

**Non-compliant:**

```kotlin
// !! crashes with no context if null
val city = user.address!!.city

// !! hiding a logic error — if user.email can be null, handle it
val parsed = Email.parse(user.email!!)

// Multiple !! in a chain — any one could crash
val zipCode = order.customer!!.address!!.postalCode!!
```

---

### KT-07: Use Coroutines for Async Operations

**Severity:** Error
**Rule:** Use `suspend` functions, `withContext`, and structured concurrency with `coroutineScope` for asynchronous work — never use raw threads, callbacks, or `Thread.sleep()`.
**Why:** Coroutines are lightweight, cancellable, and integrate with Kotlin's structured concurrency model, which ensures that child tasks are properly cancelled when a parent scope is cancelled — raw threads leak resources and callbacks create unmanageable nesting.

**Compliant:**

```kotlin
suspend fun fetchOrderWithDetails(orderId: String): OrderDetails =
    coroutineScope {
        val order = async { orderService.findById(orderId) }
        val payments = async { paymentService.findByOrderId(orderId) }

        OrderDetails(
            order = order.await(),
            payments = payments.await(),
        )
    }

suspend fun retryWithDelay(maxRetries: Int, block: suspend () -> Unit) {
    repeat(maxRetries) { attempt ->
        try {
            block()
            return
        } catch (e: Exception) {
            if (attempt == maxRetries - 1) throw e
            delay(1000L * (attempt + 1))
        }
    }
}
```

**Non-compliant:**

```kotlin
// Raw thread — no structured concurrency, no cancellation support
fun fetchOrderWithDetails(orderId: String): OrderDetails {
    var order: Order? = null
    var payments: List<Payment>? = null

    val t1 = Thread { order = orderService.findById(orderId) }
    val t2 = Thread { payments = paymentService.findByOrderId(orderId) }
    t1.start(); t2.start()
    t1.join(); t2.join()

    return OrderDetails(order!!, payments!!)
}

// Thread.sleep blocks the thread instead of suspending
fun retryWithDelay(block: () -> Unit) {
    Thread.sleep(1000) // blocks the entire thread
    block()
}
```

---

### KT-08: Use Immutable Collections by Default

**Severity:** Warning
**Rule:** Use `listOf()`, `mapOf()`, and `setOf()` by default — use mutable variants only when mutation is required, and never expose `MutableList`, `MutableMap`, or `MutableSet` from public APIs.
**Why:** Immutable collections prevent callers from modifying shared state, eliminate defensive copying, and make function contracts explicit — a function returning `List<T>` guarantees the caller cannot corrupt internal state.

**Compliant:**

```kotlin
class OrderService(private val repository: OrderRepository) {

    fun getActiveOrders(): List<Order> {
        return repository.findByStatus(Status.ACTIVE) // returns List, not MutableList
    }

    fun categorizeOrders(orders: List<Order>): Map<Status, List<Order>> {
        return orders.groupBy { it.status } // returns immutable Map<Status, List<Order>>
    }
}

// Mutable collection justified for local accumulation
fun buildReport(data: List<RawEntry>): Report {
    val rows = mutableListOf<ReportRow>()
    for (entry in data) {
        if (entry.isValid()) {
            rows.add(entry.toRow())
        }
    }
    return Report(rows = rows.toList()) // expose as immutable
}
```

**Non-compliant:**

```kotlin
class OrderService(private val repository: OrderRepository) {

    // Exposes mutable list — callers can add/remove orders, corrupting internal state
    fun getActiveOrders(): MutableList<Order> {
        return repository.findByStatus(Status.ACTIVE).toMutableList()
    }

    // Internal mutable state leaked through public API
    private val cache = mutableMapOf<String, Order>()
    fun getCache(): MutableMap<String, Order> = cache
}
```

---

### KT-09: Use Expression Bodies for Single-Expression Functions

**Severity:** Convention
**Rule:** Use expression body syntax (`= expr`) for functions that contain a single expression — use block body when the function contains multiple statements or branching logic.
**Why:** Expression bodies reduce visual noise and make simple functions scannable at a glance, while block bodies signal that the function has non-trivial logic worth reading carefully.

**Compliant:**

```kotlin
fun isEligible(order: Order) = order.status == Status.ACTIVE && order.total > BigDecimal.ZERO

fun Order.toDto() = OrderDto(
    id = id,
    customerId = customerId,
    total = total,
    status = status,
)

fun calculateTax(subtotal: BigDecimal, rate: BigDecimal) = subtotal * rate
```

**Non-compliant:**

```kotlin
// Block body with a single return — unnecessary noise
fun isEligible(order: Order): Boolean {
    return order.status == Status.ACTIVE && order.total > BigDecimal.ZERO
}

// Block body for a trivial mapping — harder to scan
fun Order.toDto(): OrderDto {
    return OrderDto(
        id = id,
        customerId = customerId,
        total = total,
        status = status,
    )
}
```

---

### KT-10: Use Companion Objects for Factory Methods

**Severity:** Convention
**Rule:** Place factory methods and class-scoped constants in a `companion object` — never use top-level functions for creating instances of a specific class.
**Why:** Kotlin has no `static` keyword; companion objects are the idiomatic home for factory methods, keeping creation logic co-located with the class and discoverable via `ClassName.create()` syntax.

**Compliant:**

```kotlin
class Money private constructor(val amount: BigDecimal, val currency: Currency) {

    companion object {
        private val VALID_CURRENCIES = setOf("USD", "EUR", "GBP")

        fun of(amount: BigDecimal, currencyCode: String): Money {
            require(currencyCode in VALID_CURRENCIES) {
                "Unsupported currency: $currencyCode"
            }
            return Money(amount, Currency.getInstance(currencyCode))
        }

        fun zero(currencyCode: String) = of(BigDecimal.ZERO, currencyCode)
    }
}

val price = Money.of(BigDecimal("29.99"), "USD")
val zero = Money.zero("EUR")
```

**Non-compliant:**

```kotlin
class Money(val amount: BigDecimal, val currency: Currency)

// Top-level factory function — not discoverable as a Money creation method
fun createMoney(amount: BigDecimal, currencyCode: String): Money {
    return Money(amount, Currency.getInstance(currencyCode))
}

// Caller must know this function exists and where it lives
val price = createMoney(BigDecimal("29.99"), "USD")
```

### KT-11: Use Formatting Tools

**Severity:** Convention
**Rule:** Configure **ktfmt** or **ktlint** as the project formatter and enforce it in CI — never rely on manual formatting or IDE-only settings.
**Why:** Automated formatting eliminates style debates in code review, ensures consistent output regardless of IDE, and produces clean diffs by preventing accidental whitespace or indentation changes.

**Compliant:**

```kotlin
// build.gradle.kts — ktfmt via Spotless
plugins {
    id("com.diffplug.spotless") version "6.25.0"
}

spotless {
    kotlin {
        ktfmt("0.47").kotlinlangStyle()
        target("src/**/*.kt")
    }
}

// CI step enforces: ./gradlew spotlessCheck
```

**Non-compliant:**

```kotlin
// No formatter configured — style depends on each developer's IDE settings
// Inconsistent formatting across files:
fun processOrder(order:Order):Result{  // no spaces around colons, before brace
    val items=order.items             // no spaces around =
    return Result.success( items )    // inconsistent spacing inside parens
}
```

---

### KT-12: Use Trailing Commas in Multiline Declarations

**Severity:** Convention
**Rule:** Include trailing commas in multiline parameter lists, argument lists, collection literals, and `when` entries.
**Why:** Trailing commas produce cleaner diffs (adding a parameter changes only one line, not two), reduce merge conflicts, and make reordering parameters trivial.

**Compliant:**

```kotlin
data class OrderDto(
    val id: String,
    val customerId: String,
    val total: BigDecimal,
    val status: OrderStatus,  // trailing comma
)

fun createOrder(
    customerId: String,
    items: List<LineItem>,
    shippingAddress: Address,  // trailing comma
): Order {
    // ...
}

val statuses = listOf(
    Status.PENDING,
    Status.SHIPPED,
    Status.DELIVERED,  // trailing comma
)
```

**Non-compliant:**

```kotlin
data class OrderDto(
    val id: String,
    val customerId: String,
    val total: BigDecimal,
    val status: OrderStatus  // no trailing comma — adding a field changes this line too
)
```

---

### KT-13: Use Value Classes for Type-Safe Wrappers

**Severity:** Convention
**Requires:** Kotlin 1.5+
**Rule:** Use `@JvmInline value class` to create zero-overhead type-safe wrappers for domain identifiers and single-value concepts — prevent accidental interchange of structurally identical but semantically different values.
**Why:** Value classes provide compile-time type safety without runtime allocation overhead. A `CustomerId` and an `OrderId` are both strings, but passing one where the other is expected is always a bug — value classes catch this at compile time.

**Compliant:**

```kotlin
@JvmInline
value class CustomerId(val value: String)

@JvmInline
value class OrderId(val value: String)

fun findOrder(orderId: OrderId): Order =
    repository.findById(orderId.value) ?: throw NotFoundException("Order ${orderId.value}")

val customerId = CustomerId("cust-123")
val orderId = OrderId("ord-456")

findOrder(orderId)     // compiles
findOrder(customerId)  // compile error — CustomerId ≠ OrderId
```

**Non-compliant:**

```kotlin
// Plain strings — nothing prevents mixing them up
fun findOrder(orderId: String): Order =
    repository.findById(orderId) ?: throw NotFoundException("Order $orderId")

val customerId = "cust-123"
val orderId = "ord-456"

findOrder(customerId)  // compiles — wrong ID used, silent data bug
```

---

## Customization

- **KT-11 (Formatting tools)** — ktfmt and ktlint produce slightly different output. Pick one and apply it consistently. ktfmt is opinionated with minimal configuration (similar to gofmt); ktlint is more configurable and closer to the Kotlin coding conventions. The key requirement is that a formatter is configured and enforced in CI.

- **KT-13 (Value classes)** require Kotlin 1.5+ and have some limitations: they cannot have `init` blocks with side effects, cannot participate in class hierarchies, and may not work seamlessly with all serialization frameworks. Use them selectively for identifiers and single-value wrappers where type safety matters most.

- **KT-06 (`!!` tolerance)** is the most commonly adjusted rule. Strict teams ban `!!` entirely including tests; pragmatic teams allow it in test code where the test will fail with a clear stack trace anyway. The rule as written permits `!!` in tests — teams that want a blanket ban should elevate this to a lint rule with no exceptions.

- **KT-05 (Scope functions)** style is partly preference. Some teams prefer `also` for logging while others use `apply`. The key constraint is the nesting limit of two — the specific scope function choice within that limit is flexible.

- **KT-07 (Coroutines)** dispatcher selection depends on the framework. Android teams typically use `Dispatchers.Main` for UI updates and `Dispatchers.IO` for disk/network. Server-side teams (Ktor, Spring WebFlux) often use `Dispatchers.Default` or framework-provided dispatchers. The rule enforces coroutines over threads — the specific dispatcher strategy is project-specific.

- **KT-09 (Expression bodies)** has a practical size limit. Functions with expression bodies that span more than 3–4 lines (e.g., a large `when` expression) may be clearer as block bodies. Use judgment — if the expression body requires horizontal scrolling or is hard to parse visually, switch to a block body.

- **KT-04 (Extension functions)** should not be overused. Extension functions are ideal for utility operations on types you don't own. For domain logic, prefer methods on your own classes to keep behavior co-located with state.
