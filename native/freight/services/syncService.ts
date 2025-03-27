import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import {createFreight, updateFreightStatus} from '../lib/api'

// Definējam mutācijas tipu
interface PendingMutation {
  id: string;
  type: 'createFreight' | 'updateFreightStatus';
  data: any;
  timestamp: number;
}

/**
 * Sinhronizē gaidošās mutācijas ar serveri, kad ir pieejams interneta savienojums
 */
export async function syncPendingMutations() {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) return;

  try {
    // Iegūst gaidošās mutācijas
    const pendingMutationsJson = await AsyncStorage.getItem('pendingMutations');
    if (!pendingMutationsJson) return;
    
    const pendingMutations: PendingMutation[] = JSON.parse(pendingMutationsJson);
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
        const index = newPendingMutations.findIndex(m => m.id === mutation.id);
        if (index !== -1) {
          newPendingMutations.splice(index, 1);
        }
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

/**
 * Uzstāda tīkla savienojuma klausītāju, kas sinhronizē mutācijas, kad atjaunojas savienojums
 */
export function setupSyncListener() {
  const unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected) {
      syncPendingMutations();
    }
  });
  
  return unsubscribe;
}
