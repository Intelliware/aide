# Android Platform Standards

## Purpose

These standards define how to build Android applications correctly — covering lifecycle management, UI composition, navigation, persistence, permissions, background work, and platform integration. They supplement the Kotlin language standards, which cover how to write Kotlin code; these rules cover how to use the Android platform APIs and Jetpack libraries to build robust, maintainable apps that handle the unique constraints of mobile: configuration changes, process death, runtime permissions, and background execution limits.

## Applicability

All Android applications targeting API 28+ (Android 9+) with Jetpack Compose, Kotlin, and Hilt for dependency injection. Projects using legacy XML views or Java should adapt the architectural patterns while following the Android XML / Java-specific guidance in the Customization section.

## Rules

### AND-01: Handle Lifecycle Correctly

**Severity:** Error
**Rule:** Use `ViewModel` to survive configuration changes and `SavedStateHandle` to survive process death — never put business logic in Activity or Fragment.
**Why:** Activities and Fragments are destroyed and recreated on configuration changes (rotation, locale change), so state held directly in them is lost, causing data loss and crashes.

**Compliant:**

```kotlin
class OrderListViewModel(
    private val repository: OrderRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel() {

    val searchQuery = savedStateHandle.getStateFlow("searchQuery", "")

    val orders = searchQuery
        .flatMapLatest { query -> repository.searchOrders(query) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun onSearchQueryChanged(query: String) {
        savedStateHandle["searchQuery"] = query
    }
}

class OrderListActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val viewModel: OrderListViewModel = hiltViewModel()
            OrderListScreen(viewModel)
        }
    }
}
```

**Non-compliant:**

```kotlin
class OrderListActivity : ComponentActivity() {
    // Business logic in Activity — lost on configuration change
    private var orders = mutableListOf<Order>()
    private var searchQuery = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Fetching data directly in Activity — re-fetches on every rotation
        lifecycleScope.launch {
            orders = repository.getOrders().toMutableList()
        }
    }
}
```

---

### AND-02: Use Jetpack Compose for New UI

**Severity:** Warning
**Rule:** Build all new screens with `@Composable` functions using unidirectional data flow — hoist state upward, collect Flows with `collectAsStateWithLifecycle()`, and never use XML layouts for new screens.
**Why:** Compose provides a declarative, type-safe UI framework that eliminates view binding boilerplate, reduces UI bugs through immutable state, and is Google's recommended modern UI toolkit.

**Compliant:**

```kotlin
@Composable
fun OrderListScreen(viewModel: OrderListViewModel = hiltViewModel()) {
    val orders by viewModel.orders.collectAsStateWithLifecycle()
    val searchQuery by viewModel.searchQuery.collectAsStateWithLifecycle()

    OrderListContent(
        orders = orders,
        searchQuery = searchQuery,
        onSearchQueryChanged = viewModel::onSearchQueryChanged,
        onOrderClicked = viewModel::onOrderSelected,
    )
}

@Composable
private fun OrderListContent(
    orders: List<Order>,
    searchQuery: String,
    onSearchQueryChanged: (String) -> Unit,
    onOrderClicked: (OrderId) -> Unit,
) {
    Column {
        SearchBar(query = searchQuery, onQueryChange = onSearchQueryChanged)
        LazyColumn {
            items(orders, key = { it.id.value }) { order ->
                OrderItem(order = order, onClick = { onOrderClicked(order.id) })
            }
        }
    }
}
```

**Non-compliant:**

```kotlin
// XML layout for a new screen
// res/layout/fragment_order_list.xml — should use Compose instead

class OrderListFragment : Fragment(R.layout.fragment_order_list) {
    private var _binding: FragmentOrderListBinding? = null
    private val binding get() = _binding!!

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentOrderListBinding.bind(view)
        // Manual view binding boilerplate
        binding.recyclerView.adapter = orderAdapter
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
```

---

### AND-03: Use Navigation Component for Routing

**Severity:** Error
**Rule:** Define routes as sealed classes or `@Serializable` objects and navigate with `NavHost`/`NavController` — never use manual Fragment transactions for navigation.
**Why:** The Navigation Component provides type-safe routing, automatic back stack management, deep link handling, and argument passing without the error-prone complexity of manual Fragment transactions.

**Compliant:**

```kotlin
@Serializable sealed interface Route {
    @Serializable data object OrderList : Route
    @Serializable data class OrderDetail(val orderId: String) : Route
    @Serializable data class OrderEdit(val orderId: String) : Route
}

@Composable
fun AppNavHost(navController: NavHostController = rememberNavController()) {
    NavHost(navController = navController, startDestination = Route.OrderList) {
        composable<Route.OrderList> {
            OrderListScreen(
                onOrderClicked = { orderId ->
                    navController.navigate(Route.OrderDetail(orderId))
                },
            )
        }
        composable<Route.OrderDetail> { backStackEntry ->
            val route = backStackEntry.toRoute<Route.OrderDetail>()
            OrderDetailScreen(orderId = route.orderId)
        }
        composable<Route.OrderEdit> { backStackEntry ->
            val route = backStackEntry.toRoute<Route.OrderEdit>()
            OrderEditScreen(orderId = route.orderId)
        }
    }
}
```

**Non-compliant:**

```kotlin
// Manual Fragment transactions — no type safety, no automatic back stack
fun navigateToOrderDetail(orderId: String) {
    val fragment = OrderDetailFragment().apply {
        arguments = Bundle().apply {
            putString("orderId", orderId)
        }
    }
    supportFragmentManager.beginTransaction()
        .replace(R.id.container, fragment)
        .addToBackStack(null)
        .commit()
}
```

---

### AND-04: Choose the Right Persistence Layer

**Severity:** Error
**Rule:** Use Room for structured relational data, DataStore for key-value preferences, and `EncryptedSharedPreferences` for secrets — never store tokens in plain `SharedPreferences` and never use raw SQLite.
**Why:** Each persistence API is optimized for its use case: Room provides compile-time SQL verification and migration support, DataStore offers coroutine-based type-safe preferences, and EncryptedSharedPreferences protects sensitive data at rest.

**Compliant:**

```kotlin
// Room for structured data
@Entity(tableName = "orders")
data class OrderEntity(
    @PrimaryKey val id: String,
    val customerName: String,
    val totalCents: Long,
    val status: OrderStatus,
    val createdAt: Instant,
)

@Dao
interface OrderDao {
    @Query("SELECT * FROM orders WHERE status = :status ORDER BY createdAt DESC")
    fun getOrdersByStatus(status: OrderStatus): Flow<List<OrderEntity>>

    @Upsert
    suspend fun upsertOrders(orders: List<OrderEntity>)
}

// DataStore for preferences
val Context.settingsDataStore by preferencesDataStore(name = "settings")

suspend fun Context.setDarkMode(enabled: Boolean) {
    settingsDataStore.edit { prefs ->
        prefs[booleanPreferencesKey("dark_mode")] = enabled
    }
}

// EncryptedSharedPreferences for secrets
val securePrefs = EncryptedSharedPreferences.create(
    context,
    "secure_prefs",
    MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC),
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
)
securePrefs.edit().putString("auth_token", token).apply()
```

**Non-compliant:**

```kotlin
// Plain SharedPreferences for auth tokens — not encrypted
val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
prefs.edit().putString("auth_token", token).apply()

// Raw SQLite — no compile-time verification, manual cursor management
val db = SQLiteDatabase.openOrCreateDatabase(path, null)
val cursor = db.rawQuery("SELECT * FROM orders WHERE status = ?", arrayOf(status))
while (cursor.moveToNext()) {
    val name = cursor.getString(cursor.getColumnIndexOrThrow("customer_name"))
}
cursor.close()
```

---

### AND-05: Request Runtime Permissions Properly

**Severity:** Error
**Rule:** Check permission status, show rationale if needed, then request — use `rememberLauncherForActivityResult(RequestPermission())` in Compose and always handle denial gracefully.
**Why:** Android revokes permissions at any time, users can deny permanently, and assuming a permission is granted causes crashes or silent failures on restricted APIs.

**Compliant:**

```kotlin
@Composable
fun CameraScreen(onImageCaptured: (Uri) -> Unit) {
    val context = LocalContext.current
    var showRationale by remember { mutableStateOf(false) }

    val cameraPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
    ) { isGranted ->
        if (isGranted) {
            launchCamera(context, onImageCaptured)
        } else {
            showRationale = true
        }
    }

    Button(onClick = {
        when {
            ContextCompat.checkSelfPermission(
                context, Manifest.permission.CAMERA,
            ) == PackageManager.PERMISSION_GRANTED -> {
                launchCamera(context, onImageCaptured)
            }
            (context as? Activity)?.shouldShowRequestPermissionRationale(
                Manifest.permission.CAMERA,
            ) == true -> {
                showRationale = true
            }
            else -> {
                cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
            }
        }
    }) {
        Text("Take Photo")
    }

    if (showRationale) {
        PermissionRationaleDialog(
            onConfirm = { cameraPermissionLauncher.launch(Manifest.permission.CAMERA) },
            onDismiss = { showRationale = false },
        )
    }
}
```

**Non-compliant:**

```kotlin
// Assuming permission is granted — crashes on denial
fun takePhoto() {
    val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
    startActivityForResult(intent, REQUEST_CODE)
}

// No rationale, no denial handling
override fun onRequestPermissionsResult(
    requestCode: Int, permissions: Array<String>, grantResults: IntArray,
) {
    // Only handles the happy path
    if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
        takePhoto()
    }
}
```

---

### AND-06: Use WorkManager for Background Work

**Severity:** Error
**Rule:** Schedule deferrable background tasks with `WorkManager` using `OneTimeWorkRequest` or `PeriodicWorkRequest` with appropriate constraints — never use raw coroutines in a Service for work that must survive process death.
**Why:** WorkManager guarantees execution even after process death or device restart, handles battery optimization constraints, and provides retry policies — raw coroutines in a Service are killed when the process dies.

**Compliant:**

```kotlin
class OrderSyncWorker(
    appContext: Context,
    params: WorkerParameters,
    private val orderRepository: OrderRepository,
) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        return try {
            orderRepository.syncPendingOrders()
            Result.success()
        } catch (e: IOException) {
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }
}

fun scheduleOrderSync(workManager: WorkManager) {
    val constraints = Constraints.Builder()
        .setRequiredNetworkType(NetworkType.CONNECTED)
        .setRequiresBatteryNotLow(true)
        .build()

    val syncRequest = PeriodicWorkRequestBuilder<OrderSyncWorker>(1, TimeUnit.HOURS)
        .setConstraints(constraints)
        .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
        .build()

    workManager.enqueueUniquePeriodicWork(
        "order_sync",
        ExistingPeriodicWorkPolicy.KEEP,
        syncRequest,
    )
}
```

**Non-compliant:**

```kotlin
// Raw coroutine in Service — killed on process death
class SyncService : Service() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        CoroutineScope(Dispatchers.IO).launch {
            // This coroutine dies with the process
            repository.syncPendingOrders()
            stopSelf()
        }
        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
```

---

### AND-07: Implement App Links for Deep Linking

**Severity:** Warning
**Rule:** Configure verified App Links with `assetlinks.json`, set intent filters with `autoVerify="true"`, and handle deep links through the Navigation Component's deep link integration.
**Why:** Verified App Links open your app directly without a disambiguation dialog, provide a seamless user experience from web to app, and prevent other apps from intercepting your URLs.

**Compliant:**

```kotlin
// AndroidManifest.xml intent filter
// <activity android:name=".MainActivity">
//     <intent-filter android:autoVerify="true">
//         <action android:name="android.intent.action.VIEW" />
//         <category android:name="android.intent.category.DEFAULT" />
//         <category android:name="android.intent.category.BROWSABLE" />
//         <data android:scheme="https" android:host="example.com"
//               android:pathPrefix="/orders" />
//     </intent-filter>
// </activity>

// Navigation component deep link integration
composable<Route.OrderDetail>(
    deepLinks = listOf(
        navDeepLink<Route.OrderDetail>(
            basePath = "https://example.com/orders",
        ),
    ),
) { backStackEntry ->
    val route = backStackEntry.toRoute<Route.OrderDetail>()
    OrderDetailScreen(orderId = route.orderId)
}

// .well-known/assetlinks.json on your domain
// [{
//   "relation": ["delegate_permission/common.handle_all_urls"],
//   "target": {
//     "namespace": "android_app",
//     "package_name": "com.example.app",
//     "sha256_cert_fingerprints": ["..."]
//   }
// }]
```

**Non-compliant:**

```kotlin
// Manually parsing deep links in Activity — bypasses Navigation Component
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val uri = intent.data
    if (uri != null && uri.path?.startsWith("/orders") == true) {
        val orderId = uri.lastPathSegment
        // Manual navigation — no type safety, duplicated routing logic
        supportFragmentManager.beginTransaction()
            .replace(R.id.container, OrderDetailFragment.newInstance(orderId!!))
            .commit()
    }
}
```

---

### AND-08: Handle Push Notifications with FCM

**Severity:** Warning
**Rule:** Use Firebase Cloud Messaging with notification channels — create a channel per notification type, and handle foreground, background, and cold-start launch from notification correctly.
**Why:** Notification channels are required on Android 8+ and give users granular control over notification behavior; handling all launch scenarios prevents missed data and broken navigation.

**Compliant:**

```kotlin
class AppNotificationManager @Inject constructor(
    private val context: Context,
) {
    fun createChannels() {
        val orderChannel = NotificationChannel(
            "orders",
            "Order Updates",
            NotificationManager.IMPORTANCE_HIGH,
        ).apply {
            description = "Notifications about order status changes"
        }

        val promoChannel = NotificationChannel(
            "promotions",
            "Promotions",
            NotificationManager.IMPORTANCE_DEFAULT,
        ).apply {
            description = "Promotional offers and deals"
        }

        val manager = context.getSystemService<NotificationManager>()
        manager?.createNotificationChannels(listOf(orderChannel, promoChannel))
    }
}

class AppFirebaseMessagingService : FirebaseMessagingService() {
    override fun onMessageReceived(message: RemoteMessage) {
        val channelId = message.data["channel"] ?: "orders"
        val pendingIntent = NavDeepLinkBuilder(this)
            .setGraph(R.navigation.app_nav_graph)
            .setDestination(R.id.orderDetailFragment)
            .setArguments(bundleOf("orderId" to message.data["orderId"]))
            .createPendingIntent()

        val notification = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(message.data["title"])
            .setContentText(message.data["body"])
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        NotificationManagerCompat.from(this).notify(
            message.data["orderId"].hashCode(),
            notification,
        )
    }

    override fun onNewToken(token: String) {
        CoroutineScope(Dispatchers.IO).launch {
            tokenRepository.updateFcmToken(token)
        }
    }
}
```

**Non-compliant:**

```kotlin
// No notification channel — silently fails on Android 8+
fun showNotification(title: String, body: String) {
    val notification = NotificationCompat.Builder(context, "")
        .setContentTitle(title)
        .setContentText(body)
        .build()
    NotificationManagerCompat.from(context).notify(0, notification)
}

// Single notification ID — overwrites previous notifications
// No PendingIntent — notification tap does nothing
```

---

### AND-09: Support TalkBack and Content Descriptions

**Severity:** Error
**Rule:** Provide `contentDescription` on all interactive and meaningful visual elements, use `semantics { }` blocks in Compose for custom accessibility actions, and test with TalkBack enabled.
**Why:** Accessibility is a legal requirement in many jurisdictions and approximately 15% of users have some form of disability — missing content descriptions make the app unusable for screen reader users.

**Compliant:**

```kotlin
@Composable
fun OrderItem(order: Order, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .semantics(mergeDescendants = true) {
                contentDescription =
                    "Order ${order.number} for ${order.customerName}, " +
                    "status ${order.status.label}, " +
                    "total ${order.formattedTotal}"
                customActions = listOf(
                    CustomAccessibilityAction("View details") {
                        onClick()
                        true
                    },
                )
            }
            .clickable(onClick = onClick),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = Icons.Default.ShoppingCart,
                contentDescription = null, // Decorative — parent has description
            )
            Column {
                Text(order.number)
                Text(order.customerName)
            }
            Spacer(Modifier.weight(1f))
            StatusBadge(status = order.status)
        }
    }
}

@Composable
fun DeleteButton(onDelete: () -> Unit) {
    IconButton(
        onClick = onDelete,
        modifier = Modifier.semantics {
            contentDescription = "Delete order"
            role = Role.Button
        },
    ) {
        Icon(Icons.Default.Delete, contentDescription = "Delete order")
    }
}
```

**Non-compliant:**

```kotlin
// Missing content descriptions — invisible to TalkBack
@Composable
fun OrderItem(order: Order, onClick: () -> Unit) {
    Card(modifier = Modifier.clickable(onClick = onClick)) {
        Row {
            Icon(Icons.Default.ShoppingCart, contentDescription = null)
            Text(order.number)
        }
    }
}

// Icon button with no accessibility label
IconButton(onClick = { deleteOrder() }) {
    Icon(Icons.Default.Delete, contentDescription = null)
}
```

---

### AND-10: Follow Material Design 3

**Severity:** Warning
**Rule:** Use Material 3 components with dynamic color support (`dynamicDarkColorScheme`/`dynamicLightColorScheme`) — apply consistent theming, proper elevation, and ripple effects; never use Material 2 components in new code.
**Why:** Material 3 provides a cohesive design language with dynamic color that adapts to the user's wallpaper, improving visual consistency and user experience across the Android ecosystem.

**Compliant:**

```kotlin
@Composable
fun AppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit,
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context)
            else dynamicLightColorScheme(context)
        }
        darkTheme -> darkColorScheme()
        else -> lightColorScheme()
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = AppTypography,
        content = content,
    )
}

// Using M3 components
@Composable
fun OrderActions() {
    FilledTonalButton(onClick = { /* ... */ }) {
        Text("Approve")
    }
    OutlinedButton(onClick = { /* ... */ }) {
        Text("Reject")
    }
}
```

**Non-compliant:**

```kotlin
// Material 2 imports in new code
import androidx.compose.material.Button
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text

@Composable
fun OrderActions() {
    // M2 Button — should use M3 equivalent
    Button(onClick = { /* ... */ }) {
        Text("Approve")
    }
}
```

---

### AND-11: Target Current SDK Requirements

**Severity:** Error
**Rule:** Set `targetSdk` to the current year's Google Play requirement, set `minSdk` based on user analytics, and guard API-level-specific calls with `Build.VERSION.SDK_INT` checks — never suppress API-level warnings without a runtime guard.
**Why:** Google Play requires targeting recent SDK versions for new submissions and updates; failing to check API levels causes `NoSuchMethodError` crashes on older devices.

**Compliant:**

```kotlin
// build.gradle.kts
android {
    compileSdk = 35
    defaultConfig {
        minSdk = 26
        targetSdk = 35
    }
}

// Runtime API level check
fun scheduleExactAlarm(context: Context, triggerTime: Long) {
    val alarmManager = context.getSystemService<AlarmManager>() ?: return

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        if (!alarmManager.canScheduleExactAlarms()) {
            val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
            context.startActivity(intent)
            return
        }
    }

    alarmManager.setExactAndAllowWhileIdle(
        AlarmManager.RTC_WAKEUP,
        triggerTime,
        createPendingIntent(context),
    )
}

// Guarded API usage with clear annotation
@RequiresApi(Build.VERSION_CODES.TIRAMISU)
fun requestNotificationPermission(activity: Activity) {
    activity.requestPermissions(
        arrayOf(Manifest.permission.POST_NOTIFICATIONS),
        REQUEST_CODE,
    )
}
```

**Non-compliant:**

```kotlin
// Suppressing lint without runtime check — crashes on older devices
@SuppressLint("NewApi")
fun scheduleExactAlarm(context: Context, triggerTime: Long) {
    val alarmManager = context.getSystemService<AlarmManager>()!!
    // canScheduleExactAlarms() doesn't exist before API 31 — crash!
    if (alarmManager.canScheduleExactAlarms()) {
        alarmManager.setExactAndAllowWhileIdle(
            AlarmManager.RTC_WAKEUP,
            triggerTime,
            createPendingIntent(context),
        )
    }
}
```

---

### AND-12: Structure Gradle Modules by Feature

**Severity:** Convention
**Rule:** Organize multi-module projects with feature modules (`:feature:orders`, `:feature:checkout`) and core modules (`:core:network`, `:core:data`, `:core:ui`) with clear API boundaries — use build variants for product flavors; never put everything in the `:app` module.
**Why:** Feature modules enforce separation of concerns, enable parallel compilation, reduce incremental build times, and make it possible to adopt dynamic feature delivery; a monolithic `:app` module becomes unmaintainable as the codebase grows.

**Compliant:**

```kotlin
// settings.gradle.kts
include(
    ":app",
    ":core:network",
    ":core:data",
    ":core:ui",
    ":core:testing",
    ":feature:orders",
    ":feature:checkout",
    ":feature:profile",
)

// :feature:orders/build.gradle.kts
plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
    id("com.google.dagger.hilt.android")
}

android {
    namespace = "com.example.feature.orders"
}

dependencies {
    implementation(project(":core:network"))
    implementation(project(":core:data"))
    implementation(project(":core:ui"))
    testImplementation(project(":core:testing"))
}

// :app/build.gradle.kts — only wires features together
dependencies {
    implementation(project(":feature:orders"))
    implementation(project(":feature:checkout"))
    implementation(project(":feature:profile"))
}
```

**Non-compliant:**

```kotlin
// Everything in :app — no module boundaries, slow builds
// settings.gradle.kts
include(":app")

// :app/build.gradle.kts with every dependency
dependencies {
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("androidx.room:room-runtime:2.6.0")
    // ... 50 more dependencies, all in one module
}

// All code in app/src/main/java/com/example/app/
// ├── activities/
// ├── fragments/
// ├── adapters/
// ├── models/
// ├── network/
// ├── database/
// └── utils/    ← everything coupled together
```

---

## Customization

- **AND-02:** XML-to-Compose migration may be gradual in existing projects. Interop via `ComposeView` in XML layouts or `AndroidView` in Compose is acceptable during migration, but all new screens must use Compose.
- **AND-03:** Alternative navigation frameworks (Voyager, Decompose, Appyx) are acceptable if they provide equivalent type-safe routing and deep link support. Document the chosen framework in the project's architecture decision records.
- **AND-10:** Dynamic color requires Android 12+ (API 31). Apps with lower `minSdk` must provide a static fallback color scheme. Material 2-to-3 migration in existing Compose code may be gradual.
- **AND-12:** Module granularity depends on project size. Small projects (fewer than 5 screens) may use a simplified structure with `:app` and `:core` only. The key principle is that the `:app` module should contain minimal code — primarily dependency injection wiring and the application entry point.
