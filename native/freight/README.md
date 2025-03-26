# Freight Android Aplikācijas Izveides Instrukcija

Šī instrukcija apraksta, kā uzģenerēt Android aplikāciju no React Native projekta "Freight".

## Projekta Konfigurācija

- Projekts izmanto Expo SDK 52 ar expo-router
- Android konfigurācija:
  - Aplikācijas ID: `lv.degra.accounting.freight`
  - Versija: 1.0.0 (versionCode 1)
  - Iespējots Hermes JavaScript dzinējs
  - Mērķa Android SDK 34 ar minimālo SDK 24
  - Java 17 ir konfigurēta būvēšanai

## Priekšnosacījumi

Lai veiksmīgi izveidotu Android aplikāciju, nepieciešams:

1. Java Development Kit (JDK) 17 (jau konfigurēts gradle.properties failā)
2. Android SDK ar build tools versiju 35.0.0
3. Android NDK versija 26.1.10909125
4. Gradle (tiks lejupielādēts automātiski)
5. Node.js un npm

## Izstrādes Versijas Izveide (Testēšanai)

Lai izveidotu izstrādes versiju, ko var instalēt ierīcē testēšanai:

```bash
# Pārejiet uz projekta direktoriju
cd native/freight

# Palaidiet Android būvēšanas komandu
npx expo run:android
```

Šī komanda:
- Izveidos JavaScript pakotni
- Kompilēs Android aplikāciju
- Instalēs to pievienotajā ierīcē vai emulatorā

## Izlaides Versijas Izveide (Izplatīšanai)

Lai izveidotu izlaides versiju, ko var izplatīt lietotājiem:

### 1. Izveidojiet parakstīšanas atslēgu (ja tādas vēl nav)

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Sekojiet norādījumiem, lai ievadītu paroli un informāciju par atslēgu.

### 2. Konfigurējiet parakstīšanu gradle failā

Rediģējiet `android/app/build.gradle` failu, lai pievienotu izlaides parakstīšanas konfigurāciju:

```gradle
signingConfigs {
    release {
        storeFile file('ceļš/uz/jūsu/keystore.keystore')
        storePassword 'jūsu-keystore-parole'
        keyAlias 'jūsu-atslēgas-alias'
        keyPassword 'jūsu-atslēgas-parole'
    }
}
```

Un atjauniniet release buildType, lai to izmantotu:

```gradle
buildTypes {
    release {
        signingConfig signingConfigs.release
        // citi iestatījumi...
    }
}
```

### 3. Ģenerējiet izlaides APK vai AAB

Lai izveidotu APK (instalējamu failu):

```bash
cd native/freight
npx expo run:android --variant release
```

Lai izveidotu Android App Bundle (Play Store publicēšanai):

```bash
cd native/freight
cd android
./gradlew bundleRelease
```

Izvades faili atradīsies:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## Būvējuma Testēšana

Jūs varat instalēt APK tieši savā ierīcē:

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Problēmu Novēršana

Ja saskaraties ar problēmām būvēšanas laikā:

1. Pārbaudiet, vai ir instalēti visi nepieciešamie rīki (JDK, Android SDK, NDK)
2. Pārliecinieties, ka Android SDK ceļš ir pareizi iestatīts
3. Mēģiniet notīrīt projektu un būvēt no jauna:

```bash
cd native/freight
cd android
./gradlew clean
cd ..
npx expo run:android
```

4. Pārbaudiet, vai nav kļūdu Metro bundler konsolē

## Offline Režīma Implementācijas Plāns

Šajā sadaļā aprakstīts plāns, kā implementēt offline režīma atbalstu mobilajā aplikācijā, izmantojot React Query ar AsyncStorage risinājumu.

### 1. Risinājuma Apraksts

React Query ar AsyncStorage risinājums nodrošina:
- Datu kešošanu un persistenci starp aplikācijas sesijām
- Automātisku datu sinhronizāciju, kad ir pieejams interneta savienojums
- Offline mutāciju rindu, kas ļauj veikt izmaiņas bez interneta savienojuma
- Efektīvu datu pārvaldību ar minimālām izmaiņām esošajā koda bāzē

### 2. Nepieciešamās Bibliotēkas

```bash
# Instalējiet nepieciešamās bibliotēkas
npm install @tanstack/react-query @tanstack/react-query-persist-client @tanstack/query-async-storage-persister @react-native-async-storage/async-storage @react-native-community/netinfo uuid
```

### 3. Implementācijas Soļi

#### 3.1. React Query Konfigurācija

```typescript
// config/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1 stunda
      cacheTime: 1000 * 60 * 60 * 24 * 7, // 1 nedēļa
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Svarīgi offline režīmam
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
  },
});

// Persistences konfigurācija
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'freight-app-cache',
});

// Persistences aktivizēšana
persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 1 nedēļa
});

export default queryClient;
```

#### 3.2. Datu Iegūšanas Hooks

```typescript
// hooks/useFreightList.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { getFreightList } from '../lib/api';
import { useNetInfo } from '@react-native-community/netinfo';

export function useFreightList(pageSize = 20) {
  const netInfo = useNetInfo();
  const isConnected = netInfo.isConnected;

  return useInfiniteQuery({
    queryKey: ['freights', pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      // Ja nav savienojuma, izmantojam kešotos datus
      if (!isConnected) {
        return null; // React Query automātiski izmantos kešotos datus
      }
      return getFreightList({ page: pageParam, pageSize });
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.items.length < pageSize) {
        return undefined; // Nav vairāk lapu
      }
      return lastPage.nextPage;
    },
    // Konfigurācija offline režīmam
    staleTime: Infinity, // Dati nekļūst "stale" offline režīmā
    cacheTime: Infinity, // Saglabā datus neierobežotu laiku
    refetchOnMount: isConnected, // Atjaunina tikai, ja ir savienojums
    refetchOnReconnect: true, // Atjaunina, kad atjaunojas savienojums
  });
}
```

#### 3.3. Offline Mutāciju Rinda

```typescript
// hooks/useCreateFreight.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFreight } from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from '@react-native-community/netinfo';
import { v4 as uuidv4 } from 'uuid';

export function useCreateFreight() {
  const queryClient = useQueryClient();
  const netInfo = useNetInfo();
  const isConnected = netInfo.isConnected;

  return useMutation({
    mutationFn: async (freightData) => {
      if (!isConnected) {
        // Saglabā mutāciju rindā
        const tempId = uuidv4();
        const pendingMutation = {
          id: tempId,
          type: 'createFreight',
          data: freightData,
          timestamp: Date.now(),
        };
        
        // Iegūst esošās gaidošās mutācijas
        const pendingMutationsJson = await AsyncStorage.getItem('pendingMutations');
        const pendingMutations = pendingMutationsJson ? JSON.parse(pendingMutationsJson) : [];
        
        // Pievieno jauno mutāciju un saglabā
        pendingMutations.push(pendingMutation);
        await AsyncStorage.setItem('pendingMutations', JSON.stringify(pendingMutations));
        
        // Atgriež lokālo objektu ar pagaidu ID
        return { ...freightData, id: tempId, isPending: true };
      }
      
      // Ja ir savienojums, izpilda mutāciju normāli
      return createFreight(freightData);
    },
    onSuccess: (data) => {
      // Atjaunina kešotos datus
      queryClient.invalidateQueries({ queryKey: ['freights'] });
    },
  });
}
```

#### 3.4. Sinhronizācijas Serviss

```typescript
// services/syncService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createFreight, updateFreightStatus } from '../lib/api';
import NetInfo from '@react-native-community/netinfo';

export async function syncPendingMutations() {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) return;

  try {
    // Iegūst gaidošās mutācijas
    const pendingMutationsJson = await AsyncStorage.getItem('pendingMutations');
    if (!pendingMutationsJson) return;
    
    const pendingMutations = JSON.parse(pendingMutationsJson);
    if (!pendingMutations.length) return;
    
    // Izpilda katru mutāciju secīgi
    const newPendingMutations = [...pendingMutations];
    
    for (let i = 0; i < pendingMutations.length; i++) {
      const mutation = pendingMutations[i];
      
      try {
        if (mutation.type === 'createFreight') {
          await createFreight(mutation.data);
        } else if (mutation.type === 'updateFreightStatus') {
          await updateFreightStatus(mutation.data.id, mutation.data.status);
        }
        
        // Ja veiksmīgi, noņem no rindas
        newPendingMutations.splice(newPendingMutations.indexOf(mutation), 1);
      } catch (error) {
        console.error('Failed to sync mutation:', error);
        // Turpina ar nākamo mutāciju
      }
    }
    
    // Saglabā atlikušās mutācijas
    await AsyncStorage.setItem('pendingMutations', JSON.stringify(newPendingMutations));
  } catch (error) {
    console.error('Error syncing mutations:', error);
  }
}

// Sinhronizācijas funkcija, ko izsaukt, kad atjaunojas savienojums
export function setupSyncListener() {
  NetInfo.addEventListener(state => {
    if (state.isConnected) {
      syncPendingMutations();
    }
  });
}
```

#### 3.5. Integrācija Aplikācijā

```typescript
// App.tsx vai _layout.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './config/queryClient';
import { setupSyncListener } from './services/syncService';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // Uzstāda sinhronizācijas klausītāju
    setupSyncListener();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      {/* Aplikācijas komponenti */}
    </QueryClientProvider>
  );
}
```

### 4. Web Aplikācijas Integrācija

Offline režīma implementācija daļēji skars arī Web aplikāciju, bet ar dažām atšķirībām:

#### 4.1. Kopīgās Komponentes

- React Query konfigurācija (pamata iestatījumi)
- API slānis
- Datu modeļi un transformācijas

#### 4.2. Atšķirības Web Aplikācijā

1. **Datu persistences mehānisms**:
   ```typescript
   // Web aplikācijai
   import { createWebStoragePersister } from '@tanstack/query-persist-client-core';
   
   const localStoragePersister = createWebStoragePersister({
     storage: window.localStorage,
     key: 'freight-web-cache',
   });
   ```

2. **Tīkla savienojuma noteikšana**:
   ```typescript
   // Web aplikācijai
   const isOnline = () => navigator.onLine;
   window.addEventListener('online', handleOnline);
   window.addEventListener('offline', handleOffline);
   ```

#### 4.3. Kopīgā Koda Abstrakcija

Lai minimizētu koda dublēšanos, ieteicams izveidot abstrakcijas slāni:

```typescript
// storage-adapter.ts
export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

// mobile-storage-adapter.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageAdapter } from './storage-adapter';

export const mobileStorageAdapter: StorageAdapter = {
  getItem: AsyncStorage.getItem,
  setItem: AsyncStorage.setItem,
  removeItem: AsyncStorage.removeItem,
};

// web-storage-adapter.ts
import { StorageAdapter } from './storage-adapter';

export const webStorageAdapter: StorageAdapter = {
  getItem: async (key) => localStorage.getItem(key),
  setItem: async (key, value) => localStorage.setItem(key, value),
  removeItem: async (key) => localStorage.removeItem(key),
};
```

### 5. Testēšanas Stratēģija

1. **Offline režīma testēšana**:
   - Ieslēdziet lidmašīnas režīmu ierīcē
   - Pārbaudiet, vai dati tiek parādīti no kešatmiņas
   - Veiciet izmaiņas offline režīmā
   - Izslēdziet lidmašīnas režīmu un pārbaudiet, vai izmaiņas tiek sinhronizētas

2. **Datu persistences testēšana**:
   - Aizveriet aplikāciju
   - Atveriet to no jauna un pārbaudiet, vai dati joprojām ir pieejami

3. **Sinhronizācijas testēšana**:
   - Veiciet izmaiņas offline režīmā
   - Atjaunojiet savienojumu un pārbaudiet, vai izmaiņas tiek sinhronizētas ar serveri

### 6. Ieviešanas Plāns

1. **1. fāze**: React Query integrācija ar pamata kešošanu
2. **2. fāze**: Offline mutāciju rindas implementācija
3. **3. fāze**: Sinhronizācijas servisa izveide
4. **4. fāze**: Web aplikācijas pielāgošana
5. **5. fāze**: Testēšana un optimizācija

## Papildu Resursi

- [React Native oficiālā dokumentācija](https://reactnative.dev/docs/signed-apk-android)
- [Expo dokumentācija](https://docs.expo.dev/build/setup/)
- [Android Developer dokumentācija](https://developer.android.com/studio/publish)
- [React Query dokumentācija](https://tanstack.com/query/latest/docs/react/overview)
- [AsyncStorage dokumentācija](https://react-native-async-storage.github.io/async-storage/docs/usage)
