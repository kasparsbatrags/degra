import AsyncStorage from '@react-native-async-storage/async-storage'
import {useNetInfo} from '@react-native-community/netinfo'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {v4 as uuidv4} from 'uuid'
import {createFreight} from '../lib/api'

// Definējam mutācijas tipu
interface PendingMutation {
  id: string;
  type: 'createFreight';
  data: any;
  timestamp: number;
}

export function useCreateFreight() {
  const queryClient = useQueryClient();
  const netInfo = useNetInfo();
  const isConnected = netInfo.isConnected;

  return useMutation({
    mutationFn: async (freightData: any) => {
      if (!isConnected) {
        // Saglabā mutāciju rindā
        const tempId = uuidv4();
        const pendingMutation: PendingMutation = {
          id: tempId,
          type: 'createFreight',
          data: freightData,
          timestamp: Date.now(),
        };
        
        // Iegūst esošās gaidošās mutācijas
        const pendingMutationsJson = await AsyncStorage.getItem('pendingMutations');
        const pendingMutations: PendingMutation[] = pendingMutationsJson 
          ? JSON.parse(pendingMutationsJson) 
          : [];
        
        // Pievieno jauno mutāciju un saglabā
        pendingMutations.push(pendingMutation);
        await AsyncStorage.setItem('pendingMutations', JSON.stringify(pendingMutations));
        
        // Atgriež lokālo objektu ar pagaidu ID
        return { ...freightData, id: tempId, isPending: true };
      }
      
      // Ja ir savienojums, izpilda mutāciju normāli
      return createFreight(freightData);
    },
    onSuccess: () => {
      // Atjaunina kešotos datus
      queryClient.invalidateQueries({ queryKey: ['freights'] });
    },
    onError: (error) => {
      console.error('Kļūda izveidojot kravu:', error);
    }
  });
}
