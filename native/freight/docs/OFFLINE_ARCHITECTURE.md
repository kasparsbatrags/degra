# Offline Arhitektūras Dokumentācija

## Pārskats

Šis dokuments apraksta jauno offline funkcionalitātes arhitektūru, kas izveidota freight aplikācijai. Arhitektūra nodrošina konsekventu, skalējamu un uzticamu offline pieredzi visai aplikācijai.

## Arhitektūras Komponenti

### 1. Konfigurācija (`config/offlineConfig.ts`)

Centralizēta konfigurācijas sistēma, kas definē:

- **Cache stratēģijas** - TTL, maksimālie izmēri, cache stratēģijas katram datu tipam
- **Sync konfigurācija** - Retry loģika, batch izmēri, background sync intervāli
- **Storage konfigurācija** - Maksimālie izmēri, šifrēšana, kompresija
- **Network konfigurācija** - Timeout vērtības, offline threshold

```typescript
// Piemērs
const OFFLINE_CONFIG = {
  cache: {
    routes: {
      ttl: 24 * 60 * 60 * 1000, // 24 stundas
      maxSize: 100,
      strategy: 'stale-while-revalidate'
    }
  }
};
```

### 2. Cache Manager (`services/CacheManager.ts`)

Universāls cache pārvaldnieks ar šādām funkcijām:

- **Versioning** - Automātiska cache invalidation, kad mainās datu struktūra
- **TTL pārvaldība** - Automātiska novecojušo datu tīrīšana
- **Size enforcement** - Automātiska vecāko ierakstu dzēšana
- **Statistika** - Hit/miss rates, cache izmērs, vecākais/jaunākais ieraksts

```typescript
// Izmantošana
const result = await cacheManager.get<TruckRoutePage[]>('routes');
await cacheManager.set('routes', data, { ttl: 3600000 });
```

### 3. Sync Manager (`services/SyncManager.ts`)

Centralizēts sinhronizācijas pārvaldnieks:

- **Queue pārvaldība** - Prioritātes, dependencies, batch processing
- **Retry loģika** - Exponential backoff, maksimālie mēģinājumi
- **Background sync** - Automātiska sinhronizācija, kad atgriežas internets
- **Network monitoring** - Automātiska sync aktivizēšana

```typescript
// Pievienot operāciju queue
await syncManager.addToQueue('truck_routes', {
  type: 'startRoute',
  method: 'POST',
  endpoint: '/truck-routes',
  data: routeData,
  priority: 'high'
});
```

### 4. Offline Manager (`services/OfflineManager.ts`)

Galvenais koordinators, kas apvieno cache un sync funkcionalitāti:

- **Universāla getData API** - Vienots interface visiem datu tipiem
- **Cache stratēģijas** - cache-first, network-first, stale-while-revalidate
- **Offline operācijas** - Automātiska queue pievienošana offline režīmā
- **Status monitoring** - Offline/online status, pending operācijas

```typescript
// Universāla datu iegūšana
const result = await offlineManager.getData(
  'routes',
  () => api.getRoutes(),
  { strategy: 'stale-while-revalidate' }
);
```

### 5. React Hooks (`hooks/useOfflineData.ts`)

Ērti izmantojami React hooks:

- **useOfflineData** - Universāls hook ar offline atbalstu
- **Specializētie hooks** - useRoutes, useRouteStatus, useObjects, utt.
- **Automātiska refetch** - Kad atgriežas internets
- **Loading states** - isLoading, isRefetching, isFromCache

```typescript
// Hook izmantošana
const {
  data: routes,
  isLoading,
  isFromCache,
  isStale,
  refetch
} = useOfflineData(
  'routes',
  () => api.getRoutes(),
  { strategy: 'stale-while-revalidate' }
);
```

## Cache Stratēģijas

### 1. Cache-First
- Vispirms mēģina no cache
- Ja nav cache vai ir novecojis, iet uz network
- Ja network fails, izmanto cache (pat ja stale)

**Izmantošana:** Dati, kas bieži netiek mainīti (objekti, trucks)

### 2. Network-First
- Vispirms mēģina no network
- Ja network fails, izmanto cache
- Retry loģika ar exponential backoff

**Izmantošana:** Kritiski dati, kas jābūt aktuāliem (lietotāja profils)

### 3. Stale-While-Revalidate
- Atgriež cache datus uzreiz
- Background refresh, ja dati ir stale
- Labākā user experience

**Izmantošana:** Maršrutu saraksts, dashboard dati

## Offline Operāciju Plūsma

### 1. Datu Iegūšana
```
User Request → OfflineManager.getData() → 
Cache Check → Network Request (ja nepieciešams) → 
Cache Update → Return Result
```

### 2. Datu Saglabāšana (Online)
```
User Action → API Request → 
Success → Cache Update → UI Update
```

### 3. Datu Saglabāšana (Offline)
```
User Action → SyncManager.addToQueue() → 
Local Storage → UI Update → 
Network Reconnect → Background Sync
```

## Implementācijas Piemērs

### Pirms (HomeScreen)
```typescript
// Fragmentēta loģika
const [routes, setRoutes] = useState([]);
const [loading, setLoading] = useState(true);

const fetchRoutes = async () => {
  try {
    const response = await api.get('/route-pages');
    setRoutes(response.data);
    // Manuāla cache saglabāšana
    await AsyncStorage.setItem('routes', JSON.stringify(response.data));
  } catch (error) {
    // Manuāla cache ielāde
    const cached = await AsyncStorage.getItem('routes');
    if (cached) setRoutes(JSON.parse(cached));
  }
};
```

### Pēc (ImprovedHomeScreen)
```typescript
// Vienkārša, konsekventā loģika
const {
  data: routes,
  isLoading,
  isFromCache,
  isStale,
  refetch
} = useOfflineData(
  CACHE_KEYS.ROUTES,
  () => freightAxiosInstance.get('/route-pages'),
  { strategy: 'stale-while-revalidate' }
);
```

## UI/UX Uzlabojumi

### 1. Cache Indikatori
- Parāda, kad dati ir no cache
- Rāda datu vecumu
- Brīdina par stale datiem

### 2. Offline Indikatori
- Skaidri parāda offline statusu
- Informē par pending operācijām
- Sync progress indikatori

### 3. Error Handling
- Graceful degradation
- Informatīvi error ziņojumi
- Retry opcijas

## Konfigurācijas Piemēri

### Cache Konfigurācija
```typescript
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
  }
}
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

## Migrācijas Ceļvedis

### 1. Esošo Komponentu Migrācija
1. Identificēt API izsaukumus
2. Aizstāt ar useOfflineData hook
3. Pievienot cache indikatorius
4. Testēt offline scenārijus

### 2. Jauno Komponentu Izstrāde
1. Izmantot useOfflineData no sākuma
2. Definēt cache stratēģiju
3. Pievienot error handling
4. Implementēt offline UI

### 3. Backward Compatibility
- Vecie komponenti turpina darboties
- Pakāpeniska migrācija
- AsyncStorage savietojamība

## Performance Optimizācijas

### 1. Cache Optimizācijas
- Lazy loading
- Selective invalidation
- Compression (plānots)

### 2. Network Optimizācijas
- Request batching
- Debounced requests
- Connection quality detection

### 3. Memory Optimizācijas
- Automatic cleanup
- Size enforcement
- Weak references (plānots)

## Testēšanas Stratēģija

### 1. Unit Tests
- Cache Manager funkcionalitāte
- Sync Manager loģika
- Hook behavior

### 2. Integration Tests
- End-to-end offline scenāriji
- Network reconnection
- Data consistency

### 3. Manual Testing
- Offline/online pārslēgšanās
- Cache invalidation
- Error scenarios

## Nākotnes Uzlabojumi

### 1. Papildu Funkcionalitāte
- Service Worker cache (web)
- IndexedDB atbalsts
- Background sync API

### 2. Performance
- Request deduplication
- Intelligent prefetching
- Compression algorithms

### 3. Developer Experience
- Debug tools
- Cache inspector
- Performance metrics

## Secinājums

Jaunā offline arhitektūra nodrošina:

✅ **Konsistenci** - Vienots API visiem komponentiem  
✅ **Skalējamību** - Viegli pievienot jaunus datu tipus  
✅ **Uzticamību** - Robust error handling un retry loģika  
✅ **Performance** - Optimizēta cache un sync stratēģija  
✅ **Maintainability** - DRY princips, centralizēta konfigurācija  
✅ **User Experience** - Smooth offline/online pārejas  

Arhitektūra ir gatava production izmantošanai un var tikt pakāpeniski ieviesta esošajā aplikācijā.
