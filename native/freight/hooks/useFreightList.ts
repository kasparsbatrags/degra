import {useQuery, useQueryClient} from '@tanstack/react-query'
import {useCallback, useEffect, useMemo} from 'react'
import {getFreightList} from '../lib/api'
import {hasPendingMutations} from '../services/syncService'
import {getCacheTime} from '../config/environment'
import {throttleNetworkRequest, useNetworkState} from '../utils/networkUtils'

// Definējam atbildes tipu, ko sagaidām no API
export interface FreightItem {
  id: string;
  status?: string;
  origin?: string;
  destination?: string;
  createdAt?: string;
  updatedAt?: string;
  isPending?: boolean;
  // Citi lauki
}

export interface FreightListResponse {
  items: FreightItem[];
  nextPage?: number;
  totalPages?: number;
  totalItems?: number;
}

export function useFreightList() {
  // Izmantojam mūsu jauno network state hook
  const { isConnected, isStrongConnection } = useNetworkState();
  const queryClient = useQueryClient();
  
  // Optimizēta queryFn ar memoizāciju un tīkla pieprasījumu optimizāciju
  const queryFn = useCallback(async () => {
    // Ja nav savienojuma, izmantojam kešotos datus
    if (!isConnected) {
      return { items: [] }; // Atgriežam tukšu sarakstu, React Query izmantos kešotos datus
    }
    
    try {
      // Izmantojam throttleNetworkRequest, lai optimizētu pieprasījumu
      return await throttleNetworkRequest(
        () => getFreightList(),
        {
          // Optimizējam pieprasījumu atkarībā no savienojuma kvalitātes
          priorityLevel: isStrongConnection ? 'high' : 'medium',
          retryCount: isStrongConnection ? 2 : 3,
          timeout: isStrongConnection ? 10000 : 15000,
        }
      );
    } catch (error) {
      console.error('Error fetching freight list:', error);
      throw error;
    }
  }, [isConnected, isStrongConnection]);
  
  // Optimizēta konfigurācija atkarībā no savienojuma statusa
  const queryConfig = useMemo(() => ({
    queryKey: ['freights'],
    queryFn,
    // Konfigurācija offline režīmam
    staleTime: isConnected ? 1000 * 60 * 5 : Infinity, // 5 minūtes online, bezgalība offline
    gcTime: getCacheTime(), // Izmantojam konfigurāciju no environment
    refetchOnMount: isConnected,
    refetchOnReconnect: isConnected,
    refetchOnWindowFocus: isConnected,
    // Optimizēta kļūdu apstrāde
    retry: (failureCount: number, error: any) => {
      // Ja nav savienojuma, nemēģinām atkārtot
      if (!isConnected) return false;
      
      // Ja ir HTTP kļūda, nemēģinām atkārtot vairāk par 1 reizi
      if (error?.response?.status && error.response.status >= 400) {
        return failureCount < 1;
      }
      
      // Citām kļūdām mēģinām 3 reizes
      return failureCount < 3;
    },
  }), [isConnected, queryFn]);
  
  const query = useQuery<FreightListResponse>(queryConfig);
  
  // Pārbaudam, vai ir gaidošās mutācijas, un ja ir, atjauninām datus, kad atjaunojas savienojums
  useEffect(() => {
    if (isConnected) {
      const checkPendingMutations = async () => {
        const hasPending = await hasPendingMutations();
        if (hasPending) {
          queryClient.invalidateQueries({ queryKey: ['freights'] });
        }
      };
      
      checkPendingMutations();
    }
  }, [isConnected, queryClient]);
  
  // Apvienojam datus ar gaidošajām mutācijām
  const data = query.data;
  const pendingItems = queryClient.getQueryData<FreightItem[]>(['pendingFreights']);
  
  // Ja ir dati un gaidošās mutācijas, apvienojam tos
  if (data && pendingItems && pendingItems.length > 0) {
    return {
      ...query,
      data: {
        ...data,
        items: [...pendingItems, ...(data.items || [])]
      } as FreightListResponse
    };
  }
  
  return query;
}
