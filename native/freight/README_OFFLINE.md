# Offline Funkcionalitātes Sistēma

## 🎯 Pārskats

Šī ir pilnīga offline funkcionalitātes sistēma freight aplikācijai, kas nodrošina konsekventu, uzticamu un performantu offline pieredzi. Sistēma ir izstrādāta ar mērķi maksimāli samazināt koda dublēšanos un nodrošināt vienotu API visiem komponentiem.

## 🏗️ Arhitektūra

### Core Komponenti

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                         │
├─────────────────────────────────────────────────────────────┤
│                    React Hooks                             │
│  useOfflineData | useOfflineForm | useNetworkStatus       │
├─────────────────────────────────────────────────────────────┤
│                  Offline Manager                           │
│           (Koordinē cache un sync)                         │
├─────────────────────────────────────────────────────────────┤
│    Cache Manager    │         Sync Manager                │
│   (Datu kešošana)   │    (Sinhronizācija)                │
├─────────────────────────────────────────────────────────────┤
│                 AsyncStorage / NetInfo                     │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Ātrais Sākums

### 1. Datu Iegūšana

```typescript
import { useOfflineData } from '@/hooks/useOfflineData';
import { CACHE_KEYS } from '@/config/offlineConfig';

function MyComponent() {
  const {
    data: routes,
    isLoading,
    isFromCache,
    isStale,
    error,
    refetch
  } = useOfflineData(
    CACHE_KEYS.ROUTES,
    () => api.getRoutes(),
    { strategy: 'stale-while-revalidate' }
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <View>
      {isFromCache && <CacheIndicator isStale={isStale} />}
      <RoutesList routes={routes} />
    </View>
  );
}
```

### 2. Formu Apstrāde

```typescript
import { useTruckRouteForm } from '@/hooks/useOfflineForm';

function RouteForm() {
  const { submitForm, isSubmitting } = useTruckRouteForm();

  const handleSubmit = async (data) => {
    await submitForm(data, freightAxiosInstance);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Button loading={isSubmitting}>Saglabāt</Button>
    </Form>
  );
}
```

### 3. Network Status

```typescript
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

function NetworkIndicator() {
  const {
    isOnline,
    isOfflineMode,
    pendingOperations,
    connectionQuality
  } = useNetworkStatus();

  return (
    <StatusBar>
      {!isOnline && <OfflineIcon />}
      {pendingOperations > 0 && <SyncIcon count={pendingOperations} />}
    </StatusBar>
  );
}
```

## 📁 Failu Struktūra

```
native/freight/
├── config/
│   └── offlineConfig.ts          # Centralizēta konfigurācija
├── services/
│   ├── CacheManager.ts           # Cache pārvaldība
│   ├── SyncManager.ts            # Sinhronizācijas pārvaldība
│   └── OfflineManager.ts         # Galvenais koordinators
├── hooks/
│   ├── useOfflineData.ts         # Datu iegūšanas hook
│   ├── useOfflineForm.ts         # Formu apstrādes hook
│   └── useNetworkStatus.ts       # Network status hook
├── components/
│   └── GlobalOfflineIndicator.tsx # UI indikatori
├── app/(tabs)/
│   ├── index-improved.tsx        # Uzlabots HomeScreen
│   └── offline-data-improved.tsx # Offline pārvaldības ekrāns
├── docs/
│   ├── OFFLINE_ARCHITECTURE.md   # Arhitektūras dokumentācija
│   ├── MIGRATION_GUIDE.md        # Migrācijas ceļvedis
│   └── OFFLINE_IMPLEMENTATION_SUMMARY.md # Kopsavilkums
└── __tests__/
    ├── services/                 # Unit testi
    ├── hooks/                    # Hook testi
    ├── integration/              # Integration testi
    └── performance/              # Performance testi
```

## ⚙️ Konfigurācija

### Cache Stratēģijas

```typescript
// config/offlineConfig.ts
export const OFFLINE_CONFIG = {
  cache: {
    routes: {
      ttl: 24 * 60 * 60 * 1000,    // 24h
      maxSize: 100,
      strategy: 'stale-while-revalidate'
    },
    routeStatus: {
      ttl: 5 * 60 * 1000,          // 5min
      maxSize: 1,
      strategy: 'cache-first'
    },
    profile: {
      ttl: 30 * 60 * 1000,         // 30min
      maxSize: 1,
      strategy: 'network-first'
    }
  }
};
```

### Sync Konfigurācija

```typescript
sync: {
  maxRetries: 5,
  retryDelay: 1000,
  backoffMultiplier: 2,
  batchSize: 10,
  backgroundInterval: 5 * 60 * 1000  // 5min
}
```

## 🔄 Cache Stratēģijas

### 1. Cache-First
- **Izmantošana:** Objekti, trucks (dati, kas bieži nemainās)
- **Darbība:** Vispirms mēģina no cache, tad no network
- **Priekšrocības:** Ātra ielāde, mazs network traffic

### 2. Network-First
- **Izmantošana:** Lietotāja profils (kritiski dati)
- **Darbība:** Vispirms mēģina no network, tad no cache
- **Priekšrocības:** Vienmēr svaigi dati

### 3. Stale-While-Revalidate
- **Izmantošana:** Maršrutu saraksts (bieži atjaunināmi dati)
- **Darbība:** Atgriež cache uzreiz, atjaunina background
- **Priekšrocības:** Labākā user experience

## 📊 Datu Plūsma

### Online Režīms
```
User Request → OfflineManager.getData() → 
Network Request → Cache Update → UI Update
```

### Offline Režīms
```
User Request → OfflineManager.getData() → 
Cache Lookup → UI Update (ar indikatoriem)
```

### Offline Operācijas
```
User Action → SyncManager.addToQueue() → 
Local Storage → UI Update → 
Network Reconnect → Background Sync
```

## 🎨 UI Komponenti

### GlobalOfflineIndicator

```typescript
import GlobalOfflineIndicator from '@/components/GlobalOfflineIndicator';

// Pilns indikators ar detaļām
<GlobalOfflineIndicator />

// Kompakts indikators
<CompactOfflineIndicator />

// Floating indikators
<FloatingOfflineIndicator />
```

### Cache Indikatori

```typescript
{isFromCache && (
  <View style={styles.cacheIndicator}>
    <MaterialIcons name="offline-pin" size={16} color={COLORS.warning} />
    <Text>Rādīti saglabātie dati (pirms {getCacheAgeHours(age)}h)</Text>
    {isStale && <Text> - dati var būt novecojuši</Text>}
  </View>
)}
```

## 🧪 Testēšana

### Unit Tests
```bash
# Palaist visus testus
npm test

# Palaist tikai cache testus
npm test CacheManager

# Palaist performance testus
npm test performance
```

### Integration Tests
```bash
# Palaist integration testus
npm test integration

# Palaist offline flow testus
npm test offline-flow
```

### Manual Testing Checklist

- [ ] Offline datu ielāde
- [ ] Cache indikatori
- [ ] Sync funkcionalitāte
- [ ] Error handling
- [ ] Performance
- [ ] Network reconnection
- [ ] Background/foreground cycle

## 🔧 Debugging

### Cache Debugging
```typescript
import { cacheManager } from '@/services/CacheManager';

// Apskatīt cache statistiku
const stats = await cacheManager.getStats();
console.log('Cache stats:', stats);

// Notīrīt cache
await cacheManager.clear();

// Apskatīt konkrētu cache ierakstu
const result = await cacheManager.get('routes');
console.log('Routes cache:', result);
```

### Sync Debugging
```typescript
import { syncManager } from '@/services/SyncManager';

// Apskatīt pending operācijas
const hasPending = await syncManager.hasPendingOperations();
console.log('Has pending operations:', hasPending);

// Apskatīt queue statistiku
const stats = await syncManager.getQueueStats('truck_routes');
console.log('Queue stats:', stats);
```

### Network Debugging
```typescript
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const { isOnline, connectionQuality, pendingOperations } = useNetworkStatus();

console.log('Network status:', {
  isOnline,
  connectionQuality,
  pendingOperations
});
```

## 📈 Performance Optimizācijas

### Cache Optimizācijas
- Automātiska cleanup novecojušiem datiem
- Size enforcement ar LRU algoritmu
- Lazy loading ar background refresh
- Compression (plānots)

### Network Optimizācijas
- Request batching
- Exponential backoff retry
- Connection quality detection
- Background sync

### Memory Optimizācijas
- Automatic garbage collection
- Size limits enforcement
- Weak references (plānots)

## 🚨 Error Handling

### Network Errors
```typescript
// Automātiska fallback uz cache
const { data, error, isFromCache } = useOfflineData(
  'routes',
  fetchRoutes,
  {
    onError: (error) => {
      if (isFromCache) {
        showToast('Rādīti saglabātie dati');
      } else {
        showError('Neizdevās ielādēt datus');
      }
    }
  }
);
```

### Cache Errors
```typescript
// Graceful degradation
try {
  await cacheManager.set('key', data);
} catch (error) {
  console.warn('Cache write failed:', error);
  // Turpināt bez cache
}
```

### Sync Errors
```typescript
// Retry ar exponential backoff
const syncResult = await syncManager.syncAll();
if (!syncResult.success) {
  // Automātiska retry vēlāk
  console.log('Sync failed, will retry later');
}
```

## 🔄 Migrācijas Ceļvedis

### No Vecās Sistēmas

1. **Identificēt komponentes** ar offline funkcionalitāti
2. **Aizstāt useState** ar useOfflineData
3. **Dzēst manuālo cache loģiku**
4. **Pievienot cache indikatorius**
5. **Testēt offline scenārijus**

### Detalizēts Ceļvedis
Skatīt: [MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md)

## 📚 API Reference

### useOfflineData Hook

```typescript
const {
  data,           // Iegūtie dati
  isLoading,      // Vai notiek ielāde
  isFromCache,    // Vai dati ir no cache
  isStale,        // Vai cache dati ir novecojuši
  error,          // Kļūdas ziņojums
  age,            // Cache datu vecums (ms)
  lastUpdated,    // Pēdējās atjaunināšanas laiks
  refetch,        // Funkcija datu atjaunināšanai
  clearCache,     // Funkcija cache tīrīšanai
  isRefetching    // Vai notiek refetch
} = useOfflineData(key, fetcher, options);
```

### useOfflineForm Hook

```typescript
const {
  isSubmitting,           // Vai notiek submit
  submitForm,             // Submit funkcija
  submitOffline,          // Offline submit funkcija
  hasPendingSubmissions,  // Vai ir pending submissions
  clearPendingSubmissions,// Notīrīt pending submissions
  lastSubmissionId        // Pēdējās submission ID
} = useOfflineForm(config);
```

### useNetworkStatus Hook

```typescript
const {
  isOnline,           // Vai ir online
  isOfflineMode,      // Vai ir force offline mode
  pendingOperations,  // Pending operāciju skaits
  cacheSize,          // Cache izmērs
  lastSync,           // Pēdējās sync laiks
  connectionQuality,  // Savienojuma kvalitāte
  refreshStatus,      // Atjaunināt statusu
  setOfflineMode,     // Ieslēgt/izslēgt offline mode
  syncPendingData     // Sinhronizēt pending datus
} = useNetworkStatus();
```

## 🎯 Best Practices

### 1. Cache Key Naming
```typescript
// Labi
CACHE_KEYS.ROUTES
CACHE_KEYS.ROUTE_STATUS

// Slikti
'routes'
'status'
```

### 2. Error Handling
```typescript
// Vienmēr apstrādāt kļūdas
const { data, error, isFromCache } = useOfflineData(
  key,
  fetcher,
  {
    onError: (error) => {
      if (!isFromCache) {
        showErrorToast(error);
      }
    }
  }
);
```

### 3. Loading States
```typescript
// Rādīt atbilstošus loading states
if (isLoading) return <LoadingSpinner />;
if (isRefetching) return <RefreshIndicator />;
```

### 4. Cache Indikatori
```typescript
// Vienmēr informēt par cache statusu
{isFromCache && <CacheIndicator isStale={isStale} age={age} />}
```

## 🔮 Nākotnes Plāni

### Fāze 1: Stabilizācija ✅
- [x] Core infrastruktūra
- [x] React hooks
- [x] UI komponenti
- [x] Dokumentācija

### Fāze 2: Migrācija (Nākamie soļi)
- [ ] HomeScreen migrācija
- [ ] TruckRouteScreen migrācija
- [ ] Formu komponenti
- [ ] Citi ekrāni

### Fāze 3: Uzlabojumi
- [ ] Service Worker cache (web)
- [ ] IndexedDB atbalsts
- [ ] Background sync API
- [ ] Push notifications
- [ ] Compression algorithms
- [ ] Debug tools

## 🤝 Atbalsts

### Problēmu Risināšana

1. **Pārbaudīt dokumentāciju** - [OFFLINE_ARCHITECTURE.md](./docs/OFFLINE_ARCHITECTURE.md)
2. **Apskatīt migrācijas ceļvedi** - [MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md)
3. **Palaist testus** - `npm test`
4. **Ieslēgt debug mode** - skatīt Debugging sadaļu

### Biežāk Sastopamās Problēmas

#### Cache nav atjaunināts
```typescript
// Piespiedu cache refresh
await refetch(true);

// Vai notīrīt cache
await clearCache();
```

#### Sync nedarbojas
```typescript
// Pārbaudīt network statusu
const { isOnline } = useNetworkStatus();

// Manuāli sinhronizēt
await syncPendingData();
```

#### Performance problēmas
```typescript
// Pārbaudīt cache statistiku
const stats = await cacheManager.getStats();
console.log('Cache hit rate:', stats.hitRate);

// Optimizēt cache stratēģiju
const config = getCacheConfig('routes');
```

## 📄 Licence

Šī offline sistēma ir izstrādāta freight aplikācijai un ir daļa no projekta koda bāzes.

---

**Izveidots ar ❤️ lai nodrošinātu labāko offline pieredzi freight aplikācijā**
