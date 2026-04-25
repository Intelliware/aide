---
slug: storage-internals
title: "Storage Internals"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect, security]
optional: false
order-hint: 220
---

## 12. Storage Internals

### 12.1 Storage Surfaces Provided

| Surface | Use Case | Backing (iOS) | Backing (Android) |
|---------|----------|---------------|--------------------|
| Key-value (sync) | Small prefs, flags | `NSUserDefaults` | `SharedPreferences` (or DataStore) |
| Key-value (async, large) | Bulk app data | `MMKV` / file-backed | `MMKV` / DataStore |
| Secure store | Tokens, secrets | `Keychain Services` | `EncryptedSharedPreferences` / Keystore |
| Document / file storage | Bigger blobs | `NSFileManager` | `Context.filesDir` |
| Cache directory | Reclaimable | `NSCachesDirectory` | `Context.cacheDir` |
| SQLite / relational | Structured data | `sqlite3` | `Room` / `SQLiteDatabase` |
| Object box / KV-store | NoSQL local DB | embedded | embedded |

### 12.2 API Shape

```ts
// Async key-value
await storage.set("flags", { darkMode: true });
const flags = await storage.get<FlagSet>("flags");

// Secure store
await secure.set("auth.token", jwt);
const jwt = await secure.get("auth.token");

// File
const path = await files.write("downloads/x.bin", data);
const data = await files.read("downloads/x.bin");

// SQL
await db.exec("CREATE TABLE IF NOT EXISTS ...");
const rows = await db.query<Row>("SELECT ...", [param]);
```

### 12.3 Threading Model

- All storage operations dispatch to a dedicated IO queue.
- KV operations use a writer-batched serial queue per partition; reads are concurrent.
- SQL operations use a single writer + concurrent readers (via WAL).

### 12.4 Encryption at Rest

| Surface | Encryption |
|---------|------------|
| Secure store | OS-managed (Keychain / Keystore + StrongBox where available) |
| KV / file | App-encrypted via key sealed in Keychain/Keystore (`{{key_alias}}`) |
| SQLite | SQLCipher / SQLCipher-equivalent, key derived from above sealed key |

> Encryption keys NEVER leave the device. Key rotation policy: re-encrypt on app upgrade if `{{algorithm_version}}` increases.

### 12.5 Migration Framework

```ts
storage.migrate({
  version: 5,
  migrations: {
    1: (s) => { /* ... */ },
    2: (s) => { /* ... */ },
    // ...
  },
});
```

- Migrations run sequentially during the first read of a new version.
- Failed migrations roll back to the previous version's snapshot (KV + file backup taken before migration).
- SQL: forward-only `up` migrations; downgrade is not supported.

### 12.6 Access Control / Sandboxing

- Per-feature partitions: storage handles can be scoped to a "namespace" so subsystems can't read each other's data.
- App-level data is not shared across apps unless explicitly enabled (App Group on iOS, content provider on Android).

### 12.7 Backup Behaviour

| Surface | iCloud Backup (iOS) | Auto Backup (Android) |
|---------|---------------------|------------------------|
| `NSUserDefaults` / `SharedPreferences` | included | included |
| Secure store | excluded (Keychain access group rules) | excluded |
| Files | per `NSURLIsExcludedFromBackupKey` flag | per `<include>` / `<exclude>` rules in backup XML |
| SQL DBs | included unless flagged | included unless flagged |

The framework defaults to **excluding regenerable caches** from backups.

### 12.8 Multi-Process Considerations

- KV stores must be written safely if widgets / extensions read the same data.
- Cross-process notification: `NSDistributedNotificationCenter` (limited on iOS), `BroadcastReceiver` on Android.
- The framework offers a `MultiProcessStorage` wrapper for these cases, with file-locking semantics.

### 12.9 Telemetry

- Per-op metrics: `key`, `partition`, `op`, `duration_ms`, `payload_bytes`.
- Errors categorised: `quota`, `corruption`, `permission`, `unknown`.

### 12.10 Where the Code Lives

```
{{repo}}/
├── packages/storage/                   # KV API, partition manager, migrations
├── packages/storage-secure/            # secure-store wrappers
├── packages/storage-sql/               # SQL wrappers + migration tooling
└── packages/storage-{ios,android}/     # native bridges
```
