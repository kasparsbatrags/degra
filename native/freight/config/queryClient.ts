import AsyncStorage from '@react-native-async-storage/async-storage'
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister'
import {QueryClient} from '@tanstack/react-query'
import {persistQueryClient} from '@tanstack/react-query-persist-client'
import {Platform} from 'react-native'

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
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Svarīgi offline režīmam
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: config.refetchOnWindowFocus,
    },
    mutations: {
      // Optimizēta konfigurācija mutācijām
      retry: Platform.OS === 'web' ? 1 : 3, // Mazāk mēģinājumu web platformai
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  },
});

// Persistences konfigurācija
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'freight-app-cache',
  // Serializācijas optimizācija
  serialize: data => JSON.stringify(data),
  deserialize: data => JSON.parse(data),
});

// Persistences aktivizēšana ar optimizētu konfigurāciju
persistQueryClient({
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

export default queryClient;
