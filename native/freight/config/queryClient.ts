import AsyncStorage from '@react-native-async-storage/async-storage'
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister'
import {QueryClient} from '@tanstack/react-query'
import {persistQueryClient} from '@tanstack/react-query-persist-client'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1 stunda
      gcTime: 1000 * 60 * 60 * 24 * 7, // 1 nedēļa
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
