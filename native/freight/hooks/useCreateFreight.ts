import {useMutation, useQueryClient} from '@tanstack/react-query'
import {v4 as uuidv4} from 'uuid'
import {createFreight} from '../lib/api'
import {addPendingMutation, syncPendingMutations} from '../services/syncService'
import {throttleNetworkRequest, useNetworkState} from '../utils/networkUtils'
import {getMaxRetries} from '../config/environment'

/**
 * Hook for creating freight entries with offline support
 */
export function useCreateFreight() {
  const queryClient = useQueryClient();
  const { isConnected, isStrongConnection } = useNetworkState();

  return useMutation({
    mutationFn: async (freightData: any) => {
      if (!isConnected) {
        // Ģenerējam pagaidu ID
        const tempId = uuidv4();
        
        // Saglabājam mutāciju rindā
        await addPendingMutation('createFreight', freightData, tempId);
        
        // Saglabājam arī lokāli, lai varētu parādīt UI
        queryClient.setQueryData(['pendingFreights'], (oldData: any[] = []) => [
          { ...freightData, id: tempId, isPending: true },
          ...oldData
        ]);
        
        // Atgriežam lokālo objektu ar pagaidu ID
        return { ...freightData, id: tempId, isPending: true };
      }
      
      // Ja ir savienojums, izpildām mutāciju ar tīkla optimizāciju
      return await throttleNetworkRequest(
        () => createFreight(freightData),
        {
          // Optimizējam pieprasījumu atkarībā no savienojuma kvalitātes
          priorityLevel: 'high', // Vienmēr augsta prioritāte, jo lietotājs gaida
          retryCount: getMaxRetries(),
          timeout: isStrongConnection ? 10000 : 15000,
        }
      );
    },
    onSuccess: (data) => {
      // Atjauninām kešotos datus
      queryClient.invalidateQueries({ queryKey: ['freights'] });
      
      // Notīrām pendingFreights, ja šis bija lokāls ieraksts
      if (data.isPending) {
        queryClient.setQueryData(['pendingFreights'], (oldData: any[] = []) => 
          oldData.filter(item => item.id !== data.id)
        );
      }
      
      // Ja ir savienojums, mēģinām sinhronizēt gaidošās mutācijas
      if (isConnected) {
        syncPendingMutations().catch(error => {
          console.error('Error syncing pending mutations:', error);
        });
      }
    },
    onError: (error) => {
      console.error('Kļūda izveidojot kravu:', error);
    },
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
  });
}
