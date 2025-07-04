import {useMutation, useQueryClient} from '@tanstack/react-query'
import uuid from 'react-native-uuid'
import {createFreight} from '../lib/api'
import {addPendingMutation, syncPendingMutations} from '../services/syncService'
import {throttleNetworkRequest, useNetworkState } from '../utils/networkUtils'
import {getMaxRetries} from '../config/environment'


export function useCreateFreight() {
  const queryClient = useQueryClient();
  const { isConnected, isStrongConnection } = useNetworkState();

  return useMutation({
    mutationFn: async (freightData: any) => {
      if (!isConnected) {
        const tempId = uuid.v4().toString();
        
        await addPendingMutation('createFreight', freightData, tempId);
        
        queryClient.setQueryData(['pendingFreights'], (oldData: any[] = []) => [
          { ...freightData, id: tempId, isPending: true },
          ...oldData
        ]);
        
        return { ...freightData, id: tempId, isPending: true };
      }
      
      return await throttleNetworkRequest(
        () => createFreight(freightData),
        {
          priorityLevel: 'high',
          retryCount: getMaxRetries(),
          timeout: isStrongConnection ? 10000 : 15000,
        }
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['freights'] });
      
      if (data.isPending) {
        queryClient.setQueryData(['pendingFreights'], (oldData: any[] = []) => 
          oldData.filter(item => item.id !== data.id)
        );
      }
      
      if (isConnected) {
        syncPendingMutations().catch(error => {
          console.error('Error syncing pending mutations:', error);
        });
      }
    },
    onError: (error) => {
      console.error('Kļūda izveidojot kravu:', error);
    },
    retry: (failureCount: number, error: any) => {
      if (!isConnected) return false;
      
      if (error?.response?.status && error.response.status >= 400) {
        return failureCount < 1;
      }
      
      return failureCount < 3;
    },
  });
}
