---
slug: local-storage-and-persistence
title: "Local Storage and Persistence"
applies-to: [re-mobile-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 200
---

## 10. Local Storage and Persistence

### 10.1 Data Persistence Strategy

**Approach:** [e.g., "Room for structured data, SharedPreferences for simple key-value, Keychain for secrets"]

### 10.2 Database Schema

<!-- Document database structure -->

**Users Table:**
```
- id: String (Primary Key)
- email: String (Unique)
- name: String
- avatarUrl: String
- createdAt: Long
- updatedAt: Long
```

**Items Table:**
```
- id: String (Primary Key)
- userId: String (Foreign Key → Users.id)
- title: String
- description: String
- createdAt: Long
- updatedAt: Long
```

### 10.3 Local Storage Implementation

**Android with Room:**
```kotlin
@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    val email: String,
    val name: String,
    @ColumnInfo(name = "avatar_url") val avatarUrl: String,
    val createdAt: Long,
)

@Dao
interface UserDao {
    @Query("SELECT * FROM users WHERE id = :id")
    fun getUser(id: String): Flow<UserEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity)
}
```

**iOS with CoreData:**
```swift
@NSManaged var id: String
@NSManaged var email: String
@NSManaged var name: String
@NSManaged var avatarUrl: String
@NSManaged var createdAt: Date
```

**React Native with SQLite/Realm:**
```typescript
const schema = {
  name: 'User',
  properties: {
    id: 'string',
    email: 'string',
    name: 'string',
    avatarUrl: 'string',
    createdAt: 'date',
  },
  primaryKey: 'id',
};
```

### 10.4 Caching Strategy

<!-- How is data cached and invalidated? -->

[Document cache invalidation, TTL, refresh patterns, etc.]
