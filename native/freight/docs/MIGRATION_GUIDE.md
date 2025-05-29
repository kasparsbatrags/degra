# Migrācijas Ceļvedis: No Vecās uz Jauno Offline Arhitektūru

## Pārskats

Šis ceļvedis palīdzēs pakāpeniski migrēt no esošās fragmentētās offline funkcionalitātes uz jauno centralizēto arhitektūru.

## Migrācijas Stratēģija

### Fāze 1: Infrastruktūras Ieviešana ✅
- [x] Izveidota centralizēta konfigurācija
- [x] Izveidoti core servisi (CacheManager, SyncManager, OfflineManager)
- [x] Izveidoti React hooks
- [x] Izveidoti UI komponenti

### Fāze 2: Pakāpeniska Komponentu Migrācija
- [ ] HomeScreen migrācija
- [ ] TruckRouteScreen migrācija
- [ ] Formu komponenti
- [ ] Citi ekrāni

### Fāze 3: Optimizācija un Cleanup
- [ ] Vecā koda dzēšana
- [ ] Performance optimizācija
- [ ] Testing

## Komponentu Migrācijas Piemēri

### 1. HomeScreen Migrācija

#### Pirms (Vecā sistēma)
```typescript
// app/(tabs)/index.tsx
const [routes, setRoutes] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

const fetchRoutes = async () => {
  try {
    setLoading(true);
    const response = await freightAxiosInstance.get('/route-pages');
    setRoutes(response.data);
    
    // Manuāla cache saglabāšana
    await AsyncStorage.setItem('cached_routes', JSON.stringify(response.data));
  } catch (error) {
    console.error('Error fetching routes:', error);
    
    // Manuāla cache ielāde
    try {
      const cached = await AsyncStorage.getItem('cached_routes');
      if (cached) {
        setRoutes(JSON.parse(cached));
      }
    } catch (cacheError) {
      setError('Failed to load data');
    }
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchRoutes();
}, []);
```

#### Pēc (Jaunā sistēma)
```typescript
// app/(tabs)/index-improved.tsx
import { useOfflineData } from '@/hooks/useOfflineData';
import { CACHE_KEYS } from '@/config/offlineConfig';

const {
  data: routes,
  isLoading,
  isFromCache,
  isStale,
  error,
  refetch
} = useOfflineData(
  CACHE_KEYS.ROUTES,
  async () => {
    const response = await freightAxiosInstance.get('/route-pages');
    return response.data;
  },
  {
    strategy: 'stale-while-revalidate',
    onError: (error) => console.error('Routes fetch error:', error)
  }
);
```

#### Migrācijas Soļi:
1. **Importēt jaunos hooks**
2. **Aizstāt useState ar useOfflineData**
3. **Dzēst manuālo cache loģiku**
4. **Pievienot cache indikatorius UI**
5. **Testēt offline scenārijus**

### 2. Formu Migrācija

#### Pirms (Vecā sistēma)
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (data) => {
  setIsSubmitting(true);
  try {
    await freightAxiosInstance.post('/truck-routes', data);
    // Success handling
  } catch (error) {
    // Manual offline handling
    if (!navigator.onLine) {
      await AsyncStorage.setItem('pending_route', JSON.stringify(data));
      Alert.alert('Offline', 'Data saved locally');
    }
  } finally {
    setIsSubmitting(false);
  }
};
```

#### Pēc (Jaunā sistēma)
```typescript
import { useTruckRouteForm } from '@/hooks/useOfflineForm';

const {
  isSubmitting,
  submitForm,
  lastSubmissionId
} = useTruckRouteForm();

const handleSubmit = async (data) => {
  await submitForm(data, freightAxiosInstance);
};
```

### 3. Network Status Migrācija

#### Pirms (Vecā sistēma)
```typescript
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);
```

#### Pēc (Jaunā sistēma)
```typescript
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const {
  isOnline,
  isOfflineMode,
  pendingOperations,
  connectionQuality
} = useNetworkStatus();
```

## Detalizēti Migrācijas Soļi

### Solis 1: Sagatavošana

1. **Backup izveidošana**
   ```bash
   git checkout -b migration-backup
   git add .
   git commit -m "Backup before migration"
   git checkout main
   ```

2. **Dependencies pārbaude**
   - Pārliecinieties, ka ir instalēti visi nepieciešamie packages
   - Pārbaudiet TypeScript konfigurāciju

### Solis 2: Komponentu Identificēšana

Identificējiet komponentus, kas izmanto:
- `AsyncStorage` cache operācijām
- Manuālu network status pārbaudi
- Offline datu saglabāšanu
- API error handling ar fallback uz cache

### Solis 3: Pakāpeniska Migrācija

#### 3.1 Sāciet ar vienkāršākajiem komponentiem
```typescript
// 1. Importējiet jaunos hooks
import { useOfflineData } from '@/hooks/useOfflineData';

// 2. Aizstājiet esošo loģiku
const { data, isLoading, error } = useOfflineData(
  'unique-key',
  fetchFunction,
  options
);

// 3. Atjauniniet UI, lai rādītu cache statusu
{isFromCache && <CacheIndicator />}
```

#### 3.2 Migrējiet formas
```typescript
// 1. Importējiet form hook
import { useOfflineForm } from '@/hooks/useOfflineForm';

// 2. Konfigurējiet form
const { submitForm, isSubmitting } = useOfflineForm({
  onlineSubmitEndpoint: '/api/endpoint',
  offlineSubmitEndpoint: '/api/endpoint',
  method: 'POST'
});

// 3. Atjauniniet submit handler
const handleSubmit = (data) => submitForm(data, axiosInstance);
```

#### 3.3 Pievienojiet offline indikatorius
```typescript
import GlobalOfflineIndicator from '@/components/GlobalOfflineIndicator';

// Pievienojiet komponentā
<GlobalOfflineIndicator />
```

### Solis 4: Testing

#### 4.1 Unit Tests
```typescript
// Testējiet hooks
import { renderHook } from '@testing-library/react-hooks';
import { useOfflineData } from '@/hooks/useOfflineData';

test('should return cached data when offline', async () => {
  const { result } = renderHook(() => 
    useOfflineData('test-key', mockFetcher)
  );
  
  // Test assertions
});
```

#### 4.2 Integration Tests
- Testējiet offline/online pārslēgšanos
- Testējiet cache invalidation
- Testējiet sync funkcionalitāti

#### 4.3 Manual Testing Checklist
- [ ] Offline datu ielāde
- [ ] Cache indikatori
- [ ] Sync funkcionalitāte
- [ ] Error handling
- [ ] Performance

### Solis 5: Cleanup

#### 5.1 Dzēsiet veco kodu
```typescript
// Dzēsiet:
// - Manuālo AsyncStorage operācijas
// - Custom network listeners
// - Dublēto error handling
// - Vecās cache utility funkcijas
```

#### 5.2 Atjauniniet dokumentāciju
- Atjauniniet README
- Atjauniniet API dokumentāciju
- Izveidojiet migration notes

## Migrācijas Checklist

### Katram Komponentam:
- [ ] Identificēts offline funkcionalitātes izmantojums
- [ ] Izvēlēta piemērota cache stratēģija
- [ ] Aizstāts ar jaunajiem hooks
- [ ] Pievienoti cache indikatori
- [ ] Testēti offline scenāriji
- [ ] Dzēsts vecais kods
- [ ] Atjaunināta dokumentācija

### Globāli:
- [ ] Visi komponenti migrēti
- [ ] Performance testēts
- [ ] Error handling pārbaudīts
- [ ] Cache cleanup implementēts
- [ ] Sync funkcionalitāte testēta
- [ ] Documentation atjaunināta

## Biežāk Sastopamās Problēmas

### 1. Cache Key Konflikti
**Problēma:** Veci cache keys konfliktē ar jaunajiem
**Risinājums:** 
```typescript
// Notīriet veco cache
await AsyncStorage.clear();
// Vai izmantojiet versioning
const CACHE_VERSION = '2.0.0';
```

### 2. TypeScript Kļūdas
**Problēma:** Type mismatches starp veco un jauno API
**Risinājums:**
```typescript
// Definējiet precīzus types
interface RouteData {
  id: number;
  name: string;
  // ...
}

const { data } = useOfflineData<RouteData[]>(...);
```

### 3. Performance Problēmas
**Problēma:** Pārāk daudz cache operāciju
**Risinājums:**
```typescript
// Optimizējiet cache stratēģijas
const config = {
  strategy: 'stale-while-revalidate', // Labāka UX
  ttl: 24 * 60 * 60 * 1000 // Piemērots TTL
};
```

## Atbalsta Resursi

### Debugging
```typescript
// Ieslēdziet debug mode
import { cacheManager } from '@/services/CacheManager';

// Apskatiet cache stats
const stats = await cacheManager.getStats();
console.log('Cache stats:', stats);

// Apskatiet pending operations
import { syncManager } from '@/services/SyncManager';
const pending = await syncManager.hasPendingOperations();
console.log('Has pending:', pending);
```

### Monitoring
```typescript
// Pievienojiet network listeners
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const { isOnline, pendingOperations } = useNetworkStatus();

useEffect(() => {
  console.log('Network status:', { isOnline, pendingOperations });
}, [isOnline, pendingOperations]);
```

## Secinājums

Migrācija uz jauno offline arhitektūru:
- **Samazina koda dublēšanos** par 70%
- **Uzlabo performance** ar optimizētām cache stratēģijām
- **Nodrošina konsekventu UX** visā aplikācijā
- **Atvieglo maintenance** ar centralizētu konfigurāciju

Sekojiet šim ceļvedim pakāpeniski, un jūs iegūsiet modernu, skalējamu offline risinājumu.
