# Android Platform Testing Standards

## Purpose

These standards define how to test Android applications effectively — covering Compose UI testing, View-based UI testing, fast JVM tests, dependency injection in tests, database testing, background work testing, and cross-app testing. They supplement the Kotlin language standards with Android-specific testing tools, frameworks, and practices that address the unique challenges of testing on a mobile platform with lifecycle, async operations, and hardware dependencies.

## Applicability

All Android applications targeting API 28+ with Jetpack Compose, Kotlin, and Hilt. Uses JUnit 5 (or JUnit 4 with AndroidX Test), Compose UI testing APIs, and Turbine for Flow testing.

## Rules

### ANDT-01: Use Compose Testing APIs

**Severity:** Error
**Rule:** Test Compose UI with `ComposeTestRule` using semantics-based finders and assertions — find nodes with `onNodeWithText()`, `onNodeWithContentDescription()`, or `onNodeWithTag()`, and assert with `assertIsDisplayed()`, `assertTextEquals()` — never assert on Compose internals or recomposition counts.
**Why:** Semantics-based testing mirrors how users and accessibility services interact with the UI, making tests resilient to implementation changes like refactoring composable structure or renaming internal state variables.

**Compliant:**

```kotlin
@HiltAndroidTest
class OrderListScreenTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<TestActivity>()

    @Test
    fun displayOrders_showsOrderNumberAndCustomerName() {
        val orders = listOf(
            Order(id = "1", number = "ORD-001", customerName = "Alice"),
            Order(id = "2", number = "ORD-002", customerName = "Bob"),
        )

        composeTestRule.setContent {
            AppTheme {
                OrderListContent(
                    orders = orders,
                    searchQuery = "",
                    onSearchQueryChanged = {},
                    onOrderClicked = {},
                )
            }
        }

        composeTestRule.onNodeWithText("ORD-001").assertIsDisplayed()
        composeTestRule.onNodeWithText("Alice").assertIsDisplayed()
        composeTestRule.onNodeWithText("ORD-002").assertIsDisplayed()
    }

    @Test
    fun clickOrder_invokesCallback() {
        var clickedOrderId: String? = null

        composeTestRule.setContent {
            AppTheme {
                OrderListContent(
                    orders = listOf(Order(id = "1", number = "ORD-001", customerName = "Alice")),
                    searchQuery = "",
                    onSearchQueryChanged = {},
                    onOrderClicked = { clickedOrderId = it },
                )
            }
        }

        composeTestRule.onNodeWithText("ORD-001").performClick()
        assertThat(clickedOrderId).isEqualTo("1")
    }
}
```

**Non-compliant:**

```kotlin
@Test
fun badTest_assertsOnRecompositionCount() {
    var recompositionCount = 0

    composeTestRule.setContent {
        recompositionCount++
        OrderListContent(orders = emptyList(), /* ... */)
    }

    // Asserting on recomposition count — brittle, implementation-dependent
    assertEquals(1, recompositionCount)
}

@Test
fun badTest_assertsOnInternalState() {
    // Reaching into ViewModel internals instead of testing visible behavior
    val viewModel = OrderListViewModel(fakeRepository, SavedStateHandle())
    viewModel.onSearchQueryChanged("test")
    assertEquals("test", viewModel._searchQuery.value) // Testing private state
}
```

---

### ANDT-02: Use Espresso for View-Based UI

**Severity:** Warning
**Rule:** Test View-based UI with Espresso using `ViewMatchers`, `ViewActions`, and `ViewAssertions` — register `IdlingResource` for async operations and use Test Workflow for test isolation; never use `Thread.sleep()` for synchronization.
**Why:** Espresso automatically synchronizes with the UI thread and registered idling resources, eliminating flaky timing-dependent tests; `Thread.sleep()` either wastes time or causes intermittent failures when the delay is too short.

**Compliant:**

```kotlin
@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class OrderDetailActivityTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(OrderDetailActivity::class.java)

    @get:Rule
    val hiltRule = HiltAndroidRule(this)

    private val networkIdlingResource = CountingIdlingResource("network")

    @Before
    fun setUp() {
        hiltRule.inject()
        IdlingRegistry.getInstance().register(networkIdlingResource)
    }

    @After
    fun tearDown() {
        IdlingRegistry.getInstance().unregister(networkIdlingResource)
    }

    @Test
    fun submitOrder_showsConfirmationMessage() {
        onView(withId(R.id.submitButton)).perform(click())

        onView(withText("Order submitted successfully"))
            .check(matches(isDisplayed()))
    }

    @Test
    fun orderDetail_displaysCustomerInfo() {
        onView(withId(R.id.customerName))
            .check(matches(withText("Alice Johnson")))

        onView(withId(R.id.orderTotal))
            .check(matches(withText("$42.99")))
    }
}
```

**Non-compliant:**

```kotlin
@Test
fun flaky_usesThreadSleep() {
    onView(withId(R.id.submitButton)).perform(click())

    // Thread.sleep is flaky — too short and it fails, too long and it wastes time
    Thread.sleep(3000)

    onView(withText("Order submitted successfully"))
        .check(matches(isDisplayed()))
}

@Test
fun flaky_noIdlingResource() {
    // Network call happens but Espresso doesn't wait for it
    onView(withId(R.id.loadButton)).perform(click())
    // This assertion races against the network response
    onView(withId(R.id.orderList)).check(matches(hasChildCount(5)))
}
```

---

### ANDT-03: Use Robolectric for Fast Android Unit Tests

**Severity:** Convention
**Rule:** Run Android-dependent unit tests on the JVM with Robolectric — test ViewModels, Repositories, and Android utilities without emulator startup time; place these in `src/test/` alongside pure unit tests.
**Why:** Robolectric runs Android framework code on the JVM in seconds rather than minutes, enabling fast feedback cycles during development without the overhead of deploying to a device or emulator.

**Compliant:**

```kotlin
// src/test/java/.../OrderViewModelTest.kt
@RunWith(RobolectricTestRunner::class)
class OrderViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private lateinit var viewModel: OrderListViewModel
    private val fakeRepository = FakeOrderRepository()

    @Before
    fun setUp() {
        viewModel = OrderListViewModel(fakeRepository, SavedStateHandle())
    }

    @Test
    fun `search query filters orders`() = runTest {
        fakeRepository.addOrders(
            Order(id = "1", number = "ORD-001", customerName = "Alice"),
            Order(id = "2", number = "ORD-002", customerName = "Bob"),
        )

        viewModel.onSearchQueryChanged("Alice")
        advanceUntilIdle()

        val orders = viewModel.orders.value
        assertThat(orders).hasSize(1)
        assertThat(orders.first().customerName).isEqualTo("Alice")
    }
}

// src/test/java/.../NotificationHelperTest.kt
@RunWith(RobolectricTestRunner::class)
class NotificationHelperTest {

    @Test
    fun `createChannel registers channel with correct importance`() {
        val context = ApplicationProvider.getApplicationContext<Application>()
        val helper = AppNotificationManager(context)

        helper.createChannels()

        val manager = context.getSystemService<NotificationManager>()!!
        val channel = manager.getNotificationChannel("orders")
        assertThat(channel).isNotNull()
        assertThat(channel.importance).isEqualTo(NotificationManager.IMPORTANCE_HIGH)
    }
}
```

**Non-compliant:**

```kotlin
// Running simple ViewModel tests as instrumented tests — unnecessarily slow
// src/androidTest/java/.../OrderViewModelTest.kt
@RunWith(AndroidJUnit4::class)
class OrderViewModelTest {
    @Test
    fun searchQueryFiltersOrders() {
        // This test doesn't need a real device — Robolectric can run it in seconds
        val viewModel = OrderListViewModel(FakeOrderRepository(), SavedStateHandle())
        viewModel.onSearchQueryChanged("Alice")
        // ...
    }
}
```

---

### ANDT-04: Separate Instrumented from Local Tests

**Severity:** Error
**Rule:** Place local JVM tests in `src/test/` and instrumented tests in `src/androidTest/` — use local tests for pure logic, ViewModel tests, and Robolectric tests; reserve instrumented tests for behavior that requires a real device or emulator.
**Why:** Local tests run 10-100x faster than instrumented tests and can execute in parallel during CI; mixing them causes unnecessary emulator spin-up for tests that don't need real hardware.

**Compliant:**

```kotlin
// src/test/ — fast JVM tests
// ├── OrderViewModelTest.kt          (ViewModel with fakes)
// ├── OrderMapperTest.kt             (pure mapping functions)
// ├── PriceCalculatorTest.kt         (business logic)
// ├── NotificationHelperTest.kt      (Robolectric for Android APIs)
// └── OrderRepositoryTest.kt         (repository with fake data source)

// src/androidTest/ — instrumented tests that need real device
// ├── OrderListScreenTest.kt         (Compose UI tests)
// ├── OrderFlowE2ETest.kt            (end-to-end user flows)
// ├── DatabaseMigrationTest.kt       (Room migration on real SQLite)
// └── BiometricAuthTest.kt           (hardware-dependent features)

// build.gradle.kts
android {
    testOptions {
        unitTests {
            isIncludeAndroidResources = true  // Enable Robolectric resource loading
        }
    }
}

dependencies {
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.robolectric:robolectric:4.11")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")

    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}
```

**Non-compliant:**

```kotlin
// All tests in src/androidTest/ — even pure logic tests require emulator
// src/androidTest/
// ├── PriceCalculatorTest.kt         (pure math — doesn't need device)
// ├── OrderMapperTest.kt             (data mapping — doesn't need device)
// ├── OrderViewModelTest.kt          (ViewModel — Robolectric is sufficient)
// └── OrderListScreenTest.kt         (Compose UI — legitimately needs device)
```

---

### ANDT-05: Use Hilt Test Modules

**Severity:** Error
**Rule:** Annotate test classes with `@HiltAndroidTest` and replace production dependencies using `@TestInstallIn` or `@UninstallModules` — inject test doubles through the DI graph; never manually construct dependency trees in tests.
**Why:** Hilt test modules ensure the test dependency graph mirrors production wiring, catching configuration errors that manual construction misses while keeping test setup declarative and consistent.

**Compliant:**

```kotlin
@Module
@TestInstallIn(
    components = [SingletonComponent::class],
    replaces = [NetworkModule::class],
)
object FakeNetworkModule {

    @Provides
    @Singleton
    fun provideOrderApi(): OrderApi = FakeOrderApi()

    @Provides
    @Singleton
    fun provideHttpClient(): OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(MockInterceptor())
        .build()
}

@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class OrderFlowE2ETest {

    @get:Rule(order = 0)
    val hiltRule = HiltAndroidRule(this)

    @get:Rule(order = 1)
    val composeTestRule = createAndroidComposeRule<MainActivity>()

    @Inject
    lateinit var fakeOrderApi: OrderApi

    @Before
    fun setUp() {
        hiltRule.inject()
        (fakeOrderApi as FakeOrderApi).setOrders(testOrders)
    }

    @Test
    fun orderList_displaysOrdersFromApi() {
        composeTestRule.onNodeWithText("ORD-001").assertIsDisplayed()
        composeTestRule.onNodeWithText("ORD-002").assertIsDisplayed()
    }
}
```

**Non-compliant:**

```kotlin
// Manually constructing the entire dependency tree
@Test
fun orderList_displaysOrders() {
    val httpClient = OkHttpClient()
    val retrofit = Retrofit.Builder()
        .baseUrl("http://localhost:8080")
        .client(httpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    val api = retrofit.create(OrderApi::class.java)
    val repository = OrderRepositoryImpl(api, database.orderDao())
    val viewModel = OrderListViewModel(repository, SavedStateHandle())

    // Fragile — any constructor change breaks every test
    // Doesn't match production wiring — may miss DI configuration bugs
}
```

---

### ANDT-06: Test Room with In-Memory Database

**Severity:** Error
**Rule:** Test Room DAOs with `Room.inMemoryDatabaseBuilder()` — verify queries return correct results, constraints are enforced, and migrations run successfully against real SQL operations.
**Why:** In-memory databases run real SQLite operations without file I/O overhead, ensuring DAO queries and migrations are correct while keeping tests fast and isolated.

**Compliant:**

```kotlin
class OrderDaoTest {

    private lateinit var database: AppDatabase
    private lateinit var orderDao: OrderDao

    @Before
    fun setUp() {
        val context = ApplicationProvider.getApplicationContext<Application>()
        database = Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java)
            .allowMainThreadQueries()
            .build()
        orderDao = database.orderDao()
    }

    @After
    fun tearDown() {
        database.close()
    }

    @Test
    fun `upsertOrders inserts new orders and updates existing ones`() = runTest {
        val order = OrderEntity(
            id = "1",
            customerName = "Alice",
            totalCents = 4299,
            status = OrderStatus.PENDING,
            createdAt = Instant.now(),
        )

        orderDao.upsertOrders(listOf(order))
        val result = orderDao.getOrdersByStatus(OrderStatus.PENDING).first()
        assertThat(result).hasSize(1)
        assertThat(result.first().customerName).isEqualTo("Alice")

        val updated = order.copy(customerName = "Alice Johnson")
        orderDao.upsertOrders(listOf(updated))
        val afterUpdate = orderDao.getOrdersByStatus(OrderStatus.PENDING).first()
        assertThat(afterUpdate.first().customerName).isEqualTo("Alice Johnson")
    }

    @Test
    fun `getOrdersByStatus filters correctly`() = runTest {
        orderDao.upsertOrders(listOf(
            createOrder("1", OrderStatus.PENDING),
            createOrder("2", OrderStatus.SHIPPED),
            createOrder("3", OrderStatus.PENDING),
        ))

        val pending = orderDao.getOrdersByStatus(OrderStatus.PENDING).first()
        assertThat(pending).hasSize(2)

        val shipped = orderDao.getOrdersByStatus(OrderStatus.SHIPPED).first()
        assertThat(shipped).hasSize(1)
    }
}

// Room migration test
@RunWith(AndroidJUnit4::class)
class MigrationTest {

    @get:Rule
    val migrationTestHelper = MigrationTestHelper(
        InstrumentationRegistry.getInstrumentation(),
        AppDatabase::class.java,
    )

    @Test
    fun migrate2To3_addsStatusColumn() {
        migrationTestHelper.createDatabase(TEST_DB, 2).close()
        val db = migrationTestHelper.runMigrationsAndValidate(TEST_DB, 3, true, MIGRATION_2_3)
        db.close()
    }
}
```

**Non-compliant:**

```kotlin
// Testing DAO with a real on-disk database — slow, state leaks between tests
@Test
fun testOrders() {
    val db = Room.databaseBuilder(context, AppDatabase::class.java, "test.db").build()
    // Previous test data may still exist
    // File I/O makes this unnecessarily slow
    // Database file left on device after test
}

// Mocking Room DAO — doesn't test actual SQL queries
@Test
fun testOrders() {
    val mockDao = mock<OrderDao>()
    whenever(mockDao.getOrdersByStatus(any())).thenReturn(flowOf(testOrders))
    // This doesn't verify the SQL query works correctly
}
```

---

### ANDT-07: Test WorkManager with Test Utilities

**Severity:** Warning
**Rule:** Test Worker logic in isolation with `TestListenableWorkerBuilder` — verify success/failure/retry results, input/output data, and constraint handling without actually scheduling work.
**Why:** `TestListenableWorkerBuilder` executes worker logic synchronously in tests, enabling fast and deterministic verification of retry policies, input processing, and error handling without WorkManager's scheduling infrastructure.

**Compliant:**

```kotlin
class OrderSyncWorkerTest {

    private val fakeRepository = FakeOrderRepository()

    @Test
    fun `returns success when sync completes`() = runTest {
        fakeRepository.setPendingOrders(listOf(testOrder))

        val worker = TestListenableWorkerBuilder<OrderSyncWorker>(
            context = ApplicationProvider.getApplicationContext(),
        )
            .setWorkerFactory(TestWorkerFactory(fakeRepository))
            .build()

        val result = worker.doWork()

        assertThat(result).isEqualTo(ListenableWorker.Result.success())
        assertThat(fakeRepository.syncedOrders).containsExactly(testOrder)
    }

    @Test
    fun `retries on network failure within attempt limit`() = runTest {
        fakeRepository.setShouldFail(true)

        val worker = TestListenableWorkerBuilder<OrderSyncWorker>(
            context = ApplicationProvider.getApplicationContext(),
        )
            .setWorkerFactory(TestWorkerFactory(fakeRepository))
            .setRunAttemptCount(1)
            .build()

        val result = worker.doWork()
        assertThat(result).isEqualTo(ListenableWorker.Result.retry())
    }

    @Test
    fun `returns failure after max retries`() = runTest {
        fakeRepository.setShouldFail(true)

        val worker = TestListenableWorkerBuilder<OrderSyncWorker>(
            context = ApplicationProvider.getApplicationContext(),
        )
            .setWorkerFactory(TestWorkerFactory(fakeRepository))
            .setRunAttemptCount(3)
            .build()

        val result = worker.doWork()
        assertThat(result).isEqualTo(ListenableWorker.Result.failure())
    }

    @Test
    fun `passes input data to worker`() = runTest {
        val inputData = workDataOf("orderId" to "ORD-001")

        val worker = TestListenableWorkerBuilder<OrderSyncWorker>(
            context = ApplicationProvider.getApplicationContext(),
        )
            .setInputData(inputData)
            .setWorkerFactory(TestWorkerFactory(fakeRepository))
            .build()

        val result = worker.doWork()
        assertThat(result).isEqualTo(ListenableWorker.Result.success())
        assertThat(fakeRepository.lastSyncedOrderId).isEqualTo("ORD-001")
    }
}
```

**Non-compliant:**

```kotlin
// Actually scheduling work in tests — slow, non-deterministic
@Test
fun testSync() {
    val request = OneTimeWorkRequestBuilder<OrderSyncWorker>().build()
    WorkManager.getInstance(context).enqueue(request)

    // Polling for completion — flaky and slow
    Thread.sleep(5000)
    val info = WorkManager.getInstance(context).getWorkInfoById(request.id).get()
    assertEquals(WorkInfo.State.SUCCEEDED, info.state)
}
```

---

### ANDT-08: Use UI Automator for Cross-App Testing

**Severity:** Convention
**Rule:** Use UI Automator for test flows that leave your app — system permission dialogs, notification interactions, and settings screens — using `UiDevice.findObject(By.text(...))` or `By.res(...)` selectors; prefer Compose testing APIs or Espresso for all within-app testing.
**Why:** UI Automator can interact with any app on the device including system UI, making it the only option for testing cross-app flows; however, it is slower and more fragile than in-app testing frameworks, so it should be limited to scenarios that genuinely require it.

**Compliant:**

```kotlin
@RunWith(AndroidJUnit4::class)
class NotificationFlowTest {

    private lateinit var device: UiDevice

    @Before
    fun setUp() {
        device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
    }

    @Test
    fun notification_tap_opensOrderDetail() {
        triggerTestNotification(orderId = "ORD-001")

        device.openNotification()
        device.wait(Until.hasObject(By.text("Order Update")), 5000)

        val notification = device.findObject(By.text("Order Update"))
        notification.click()

        device.wait(Until.hasObject(By.text("ORD-001")), 5000)
        val orderDetail = device.findObject(By.text("ORD-001"))
        assertThat(orderDetail).isNotNull()
    }

    @Test
    fun permissionDialog_grantCamera() {
        val appPackage = "com.example.app"
        device.findObject(By.res(appPackage, "camera_button")).click()

        device.wait(Until.hasObject(By.text("Allow")), 3000)
        val allowButton = device.findObject(
            By.text(Pattern.compile("Allow|While using the app", Pattern.CASE_INSENSITIVE)),
        )
        allowButton.click()

        device.wait(Until.hasObject(By.res(appPackage, "camera_preview")), 5000)
        val preview = device.findObject(By.res(appPackage, "camera_preview"))
        assertThat(preview).isNotNull()
    }
}
```

**Non-compliant:**

```kotlin
// Using UI Automator for within-app testing — Compose/Espresso is faster and more reliable
@Test
fun badTest_uiAutomatorForInAppUi() {
    device.findObject(By.text("Submit Order")).click()
    device.wait(Until.hasObject(By.text("Order confirmed")), 5000)
    // This should use composeTestRule.onNodeWithText("Submit Order").performClick()
}

// Using Thread.sleep instead of UiDevice.wait
@Test
fun flakyTest_threadSleep() {
    device.openNotification()
    Thread.sleep(3000) // Flaky — use device.wait(Until.hasObject(...)) instead
    device.findObject(By.text("Order Update")).click()
}
```

---

## Customization

- **ANDT-03:** Robolectric has fidelity limits — it simulates the Android framework on the JVM but does not replicate all device-specific behaviors. Tests involving hardware sensors, Bluetooth, or complex graphics rendering need real emulators or devices.
- **ANDT-05:** Hilt test setup requires `kapt` or `ksp` annotation processing configuration in the test source set. Projects using Koin or manual DI should adapt the principle (swap modules in tests) to their framework.
- **ANDT-06:** Room migration testing requires exporting schemas by setting `room { schemaDirectory("$projectDir/schemas") }` in the Gradle configuration. Keep exported schemas in version control.
- **ANDT-08:** UI Automator tests are inherently slow (5-30 seconds each) and fragile across OS versions due to system UI differences. Limit their use to critical cross-app flows such as permission grants, notification handling, and deep link verification. Run them in a separate test suite with a longer timeout budget.
