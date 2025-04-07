import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import {createFreight, updateFreightStatus} from '../lib/api'

// Definējam mutācijas tipu
export interface PendingMutation {
  id: string;
  type: 'createFreight' | 'updateFreightStatus';
  data: any;
  timestamp: number;
  retryCount: number;
}

// Konstantes
const PENDING_MUTATIONS_KEY = 'pendingMutations';
const MAX_RETRY_COUNT = 5;
const RETRY_DELAY = 5000; // 5 sekundes

/**
 * Pievieno jaunu mutāciju rindai
 */
export async function addPendingMutation(
  type: 'createFreight' | 'updateFreightStatus',
  data: any,
  id: string
): Promise<void> {
  try {
    // Iegūst esošās gaidošās mutācijas
    const pendingMutations = await getPendingMutations();
    
    // Pievieno jauno mutāciju
    pendingMutations.push({
      id,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    });
    
    // Saglabā atjauninātās mutācijas
    await AsyncStorage.setItem(PENDING_MUTATIONS_KEY, JSON.stringify(pendingMutations));
  } catch (error) {
    console.error('Error adding pending mutation:', error);
    throw error;
  }
}

/**
 * Iegūst visas gaidošās mutācijas
 */
export async function getPendingMutations(): Promise<PendingMutation[]> {
  try {
    const pendingMutationsJson = await AsyncStorage.getItem(PENDING_MUTATIONS_KEY);
    if (!pendingMutationsJson) return [];
    return JSON.parse(pendingMutationsJson);
  } catch (error) {
    console.error('Error getting pending mutations:', error);
    return [];
  }
}

/**
 * Atjaunina gaidošās mutācijas
 */
async function updatePendingMutations(mutations: PendingMutation[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PENDING_MUTATIONS_KEY, JSON.stringify(mutations));
  } catch (error) {
    console.error('Error updating pending mutations:', error);
  }
}

/**
 * Sinhronizē gaidošās mutācijas ar serveri, kad ir pieejams interneta savienojums
 */
export async function syncPendingMutations(): Promise<boolean> {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) return false;

  try {
    // Iegūst gaidošās mutācijas
    const pendingMutations = await getPendingMutations();
    if (!pendingMutations.length) return true;
    
    // Izpilda katru mutāciju secīgi
    const newPendingMutations = [...pendingMutations];
    let allSuccessful = true;
    
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
        allSuccessful = false;
        
        // Atjaunina retry count
        const index = newPendingMutations.findIndex(m => m.id === mutation.id);
        if (index !== -1) {
          newPendingMutations[index].retryCount++;
          
          // Ja pārsniegts maksimālais mēģinājumu skaits, noņem no rindas
          if (newPendingMutations[index].retryCount > MAX_RETRY_COUNT) {
            console.warn(`Removing mutation after ${MAX_RETRY_COUNT} failed attempts:`, mutation);
            newPendingMutations.splice(index, 1);
          }
        }
      }
    }
    
    // Saglabā atlikušās mutācijas
    await updatePendingMutations(newPendingMutations);
    return allSuccessful;
  } catch (error) {
    console.error('Error syncing mutations:', error);
    return false;
  }
}

/**
 * Uzstāda tīkla savienojuma klausītāju, kas sinhronizē mutācijas, kad atjaunojas savienojums
 */
export function setupSyncListener() {
  let syncInProgress = false;
  
  const unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected && !syncInProgress) {
      syncInProgress = true;
      
      syncPendingMutations()
        .then(success => {
          syncInProgress = false;
          
          // Ja sinhronizācija nebija veiksmīga, mēģinām vēlreiz pēc noteikta laika
          if (!success) {
            setTimeout(() => {
              if (state.isConnected) {
                syncPendingMutations();
              }
            }, RETRY_DELAY);
          }
        })
        .catch(() => {
          syncInProgress = false;
        });
    }
  });
  
  return unsubscribe;
}

/**
 * Pārbauda, vai ir gaidošās mutācijas
 */
export async function hasPendingMutations(): Promise<boolean> {
  const mutations = await getPendingMutations();
  return mutations.length > 0;
}
