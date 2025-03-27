import {useNetInfo} from '@react-native-community/netinfo'
import {useInfiniteQuery} from '@tanstack/react-query'
import {getFreightList} from '../lib/api'

// Definējam atbildes tipu, ko sagaidām no API
interface FreightItem {
  id: string;
  // Pievienojiet citus nepieciešamos laukus
}

interface FreightListResponse {
  items: FreightItem[];
  nextPage?: number;
  totalPages?: number;
  totalItems?: number;
}

export function useFreightList() {
  const netInfo = useNetInfo();
  const isConnected = netInfo.isConnected;

  return useInfiniteQuery<FreightListResponse, Error>({
    queryKey: ['freights'],
    queryFn: async () => {
      // Ja nav savienojuma, izmantojam kešotos datus
      if (!isConnected) {
        return { items: [] }; // Atgriežam tukšu sarakstu, React Query izmantos kešotos datus
      }
      
      // Izsaucam API bez parametriem, jo pašreizējā implementācija tos neatbalsta
      return getFreightList();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.nextPage) {
        return undefined; // Nav vairāk lapu
      }
      return lastPage.nextPage;
    },
    // Konfigurācija offline režīmam
    staleTime: Infinity, // Dati nekļūst "stale" offline režīmā
    gcTime: Infinity, // Saglabā datus neierobežotu laiku
    refetchOnMount: isConnected ? true : false, // Atjaunina tikai, ja ir savienojums
    refetchOnReconnect: true, // Atjaunina, kad atjaunojas savienojums
  });
}
