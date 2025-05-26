import AsyncStorage from '@react-native-async-storage/async-storage'
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister'
import {QueryClient} from '@tanstack/react-query'
import {persistQueryClient} from '@tanstack/react-query-persist-client'
import {Platform} from 'react-native'
import {isConnected} from '../utils/networkUtils'

// Optimizēta konfigurācija atkarībā no platformas
const platformSpecificConfig = {
  // Web platformai
  web: {
    staleTime: 1000 * 60 * 5, // 5 minūtes
    gcTime: 1000 * 60 * 60 * 24, // 1 diena
    refetchOnWindowFocus: true,
  },
  // Mobilajām platformām
  mobile: {
    staleTime: 1000 * 60 * 60, // 1 stunda
    gcTime: 1000 * 60 * 60 * 24 * 7, // 1 nedēļa
    refetchOnWindowFocus: false,
  }
};

// Izvēlamies konfigurāciju atkarībā no platformas
const config = Platform.OS === 'web' 
  ? platformSpecificConfig.web 
  : platformSpecificConfig.mobile;

// Izveidojam QueryClient ar optimizētu konfigurāciju
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: config.staleTime,
      gcTime: config.gcTime,
      retry: (failureCount: number, error: any) => {
        // Vienkārša retry loģika bez async
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Svarīgi offline režīmam
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: config.refetchOnWindowFocus,
      // Offline režīmā izmanto kešotos datus
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Optimizēta konfigurācija mutācijām
      retry: (failureCount: number, error: any) => {
        return failureCount < (Platform.OS === 'web' ? 1 : 3);
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Offline režīmā mutācijas tiek pievienotas rindai
      networkMode: 'offlineFirst',
    }
  },
});

// Persistences konfigurācija ar timeout
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'freight-app-cache',
  // Serializācijas optimizācija
  serialize: data => JSON.stringify(data),
  deserialize: data => JSON.parse(data),
});

// Persistences aktivizēšana ar timeout un error handling
const initializePersistence = async () => {
  try {
    // Timeout pārbaude, lai neblokētu aplikācijas startēšanu
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Persistence initialization timeout')), 5000);
    });
    
    const persistPromise = persistQueryClient({
      queryClient,
      persister: asyncStoragePersister,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 nedēļa
      // Optimizēta dehydration/rehydration
      dehydrateOptions: {
        shouldDehydrateQuery: query => 
          // Saglabājam tikai svarīgos datus
          query.state.status !== 'error' && 
          !query.queryKey.includes('temp') &&
          query.state.data !== undefined,
      },
    });
    
    await Promise.race([persistPromise, timeoutPromise]);
    console.log('Query persistence initialized successfully');
  } catch (error) {
    console.warn('Query persistence initialization failed, continuing without persistence:', error);
    // Aplikācija turpina darboties bez persistences
  }
};

// Inicializē persistenci fonā, lai neblokētu aplikācijas startēšanu
if (!__DEV__ || Platform.OS !== 'web') {
  // Tikai production vai mobile platformās
  setTimeout(() => {
    initializePersistence();
  }, 100);
}

export default queryClient;
