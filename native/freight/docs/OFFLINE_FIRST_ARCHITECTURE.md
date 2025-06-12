# Offline-First Architecture Documentation

## Pārskats

Freight aplikācija tagad ir pilnībā offline-first ar iespēju veikt visas CRUD operācijas offline režīmā. Sistēma automātiski sinhronizē datus, kad internets kļūst pieejams.

## Arhitektūras komponenti

### 1. **Database Layer** (`utils/database.ts`)
- **SQLite** mobile platformām
- **AsyncStorage** web platformai (fallback)
- Tabulas: `truck_routes`, `route_pages`, `fuel_entries`, `odometer_readings`, `offline_operations`
- Automātiska migrācija un health checks

### 2. **Offline Queue System** (`utils/offlineQueue.ts`)
- Pending operāciju rinda
- Automātiska retry loģika ar exponential backoff
- Batch processing
- Conflict resolution

### 3. **Data Manager** (`utils/offlineDataManager.ts`)
- Unified API visām CRUD operācijām
- Optimistic updates
- Hybrid online/offline loģika
- Automātiska cache invalidation

### 4. **Offline Context** (`context/OfflineContext.tsx`)
- Centralizēta offline sistēmas pārvaldība
- React hooks offline statusam
- Automātiska sinhronizācija
- Network monitoring

## Galvenās funkcijas

### ✅ Offline CRUD Operations
- **CREATE** - jaunu ierakstu izveide offline
- **READ** - datu lasīšana no cache/database
- **UPDATE** - esošo ierakstu modificēšana
- **DELETE** - ierakstu dzēšana (soft delete)

### ✅ Automatic Synchronization
- Background sync kad internets atgriežas
- Queue processing ar retry loģiku
- Conflict resolution
- Batch operations

### ✅ Data Persistence
- SQLite database mobile platformām
- Encrypted AsyncStorage web platformai
- Persistent offline sessions
- Cache management

### ✅ Network Awareness
- Automātiska network status detection
- Graceful degradation
- Smart fallbacks
- Connection monitoring

## Izmantošana

### 1. **Setup OfflineProvider**

```tsx
// App.tsx vai _layout.tsx
import { OfflineProvider } from '@/context/OfflineContext';

export default function App() {
  return (
    <OfflineProvider>
      <AuthProvider>
        {/* Your app components */}
      </AuthProvider>
    </OfflineProvider>
  );
}
```

### 2. **Offline Hooks**

```tsx
import { useOffline, useOfflineStatus, useConnectionStatus } from '@/context/OfflineContext';

function MyComponent() {
  const { isOnline, syncData, queueStats } = useOffline();
  const { isReady, hasOfflineData, syncNeeded } = useOfflineStatus();
  const isConnected = useConnectionStatus();

  return (
    <View>
      {!isOnline && <Text>Offline režīms</Text>}
      {syncNeeded && <Text>Sync nepieciešams: {queueStats.pending} operācijas</Text>}
    </View>
  );
}
```

### 3. **CRUD Operations**

```tsx
import { 
  getTruckRoutes, 
  createTruckRoute, 
  updateTruckRoute, 
  deleteTruckRoute 
} from '@/utils/offlineDataManager';

// Create (works offline)
const newRoute = await createTruckRoute({
  date_from: '2025-01-01',
  date_to: '2025-01-31',
  truck_registration_number: 'AB-1234',
  fuel_consumption_norm: 25.5,
  fuel_balance_at_start: 100
});

// Read (offline-first)
const routes = await getTruckRoutes();

// Update (works offline)
await updateTruckRoute(routeId, {
  fuel_balance_at_start: 120
});

// Delete (works offline)
await deleteTruckRoute(routeId);
```

## Database Schema

### TruckDto Routes
```sql
CREATE TABLE truck_routes (
  id INTEGER PRIMARY KEY,
  server_id INTEGER UNIQUE,
  date_from TEXT NOT NULL,
  date_to TEXT NOT NULL,
  truck_registration_number TEXT NOT NULL,
  fuel_consumption_norm REAL NOT NULL,
  fuel_balance_at_start REAL NOT NULL,
  -- ... other fields
  is_dirty INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  synced_at INTEGER
);
```

### Offline Operations Queue
```sql
CREATE TABLE offline_operations (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('CREATE', 'UPDATE', 'DELETE')),
  table_name TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  data TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  retries INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

## Sync Process

### 1. **Offline Operations**
```
User Action → Local Database → Offline Queue → Background Sync
```

### 2. **Queue Processing**
```
Pending Operations → Retry Logic → Server API → Update Local Records
```

### 3. **Data Sync**
```
Server Data → Local Database → Cache Update → UI Refresh
```

## Conflict Resolution

### Strategies:
1. **Last Write Wins** - pēdējā izmaiņa uzvar
2. **Server Authoritative** - serveris vienmēr ir pareizs
3. **Manual Resolution** - lietotājs izvēlas

### Implementation:
- `is_dirty` flag lokālām izmaiņām
- `synced_at` timestamp sinhronizācijas laikam
- `server_id` mapping starp lokālo un servera ID

## Error Handling

### Retry Logic:
- **Max retries**: 3
- **Exponential backoff**: 1s, 2s, 4s
- **Failed operations**: marķēti kā 'failed'

### Graceful Degradation:
- Online API fails → Cache fallback
- Database error → AsyncStorage fallback
- Network timeout → Retry queue

## Performance Optimizations

### 1. **Batch Operations**
- Process max 10 operations at once
- Reduce API calls
- Improve sync performance

### 2. **Smart Caching**
- Cache frequently accessed data
- Automatic cache invalidation
- Memory-efficient storage

### 3. **Background Processing**
- Non-blocking sync operations
- Queue processing in background
- Minimal UI impact

## Monitoring & Debugging

### Queue Statistics:
```tsx
const { queueStats } = useOffline();
// { pending: 5, failed: 1, completed: 10, total: 16 }
```

### Database Health:
```tsx
const { isDatabaseReady } = useOffline();
```

### Connection Status:
```tsx
const isOnline = useConnectionStatus();
```

### Logging:
- Console logs visām svarīgām operācijām
- Error tracking failed operations
- Performance metrics

## Migration Guide

### No esošās sistēmas:

1. **Install dependencies**:
```bash
npm install expo-sqlite uuid
```

2. **Wrap app ar OfflineProvider**:
```tsx
<OfflineProvider>
  <YourApp />
</OfflineProvider>
```

3. **Replace API calls**:
```tsx
// Old
const routes = await freightAxiosInstance.get('/truck-routes');

// New
const routes = await getTruckRoutes();
```

4. **Add offline indicators**:
```tsx
const { isOnline } = useOffline();
{!isOnline && <OfflineIndicator />}
```

## Best Practices

### 1. **Always use offline-first APIs**
```tsx
// ✅ Good
const routes = await getTruckRoutes();

// ❌ Avoid
const routes = await freightAxiosInstance.get('/truck-routes');
```

### 2. **Handle offline states**
```tsx
const { isOnline, syncNeeded } = useOfflineStatus();

if (!isOnline) {
  showOfflineIndicator();
}

if (syncNeeded) {
  showSyncPendingIndicator();
}
```

### 3. **Optimistic updates**
```tsx
// Update UI immediately
setRoutes(prev => [...prev, newRoute]);

// Then save to database
await createTruckRoute(newRoute);
```

### 4. **Error boundaries**
```tsx
try {
  await createTruckRoute(data);
} catch (error) {
  // Handle gracefully
  showErrorMessage('Dati saglabāti lokāli, sinhronizēsies vēlāk');
}
```

## Troubleshooting

### Common Issues:

1. **Database not initializing**
   - Check expo-sqlite installation
   - Verify platform compatibility
   - Check console logs

2. **Sync not working**
   - Verify network connectivity
   - Check queue stats
   - Review error messages

3. **Data not persisting**
   - Check database health
   - Verify write permissions
   - Review storage quotas

### Debug Commands:
```tsx
// Clear all offline data
await clearAllData();

// Force sync
await syncData();

// Check queue status
const stats = await getOfflineQueueStats();
```

## Future Enhancements

### Planned Features:
- [ ] Real-time sync with WebSockets
- [ ] Advanced conflict resolution UI
- [ ] Data compression
- [ ] Selective sync
- [ ] Offline analytics
- [ ] Background app refresh

### Performance Improvements:
- [ ] Virtual scrolling for large datasets
- [ ] Lazy loading
- [ ] Memory optimization
- [ ] Battery usage optimization

## Autors

Offline-First Architecture ieviesta: 2025-02-06
Versija: 1.0.0
