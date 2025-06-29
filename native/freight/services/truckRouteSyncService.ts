import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import freightAxios from '../config/freightAxios';
import { generateId } from '../utils/idUtils';

const PENDING_TRUCK_ROUTES_KEY = 'pendingTruckRoutes';

export interface PendingTruckRoute {
  id: string;
  type: 'startRoute' | 'endRoute';
  data: any;
  timestamp: number;
  retryCount: number;
}

export async function saveTruckRouteLocally(type: 'startRoute' | 'endRoute', data: any): Promise<string> {
  const tempId = generateId();
  const pendingRoutes = await getPendingTruckRoutes();
  
  pendingRoutes.push({
    id: tempId,
    type,
    data,
    timestamp: Date.now(),
    retryCount: 0
  });
  
  await AsyncStorage.setItem(PENDING_TRUCK_ROUTES_KEY, JSON.stringify(pendingRoutes));
  return tempId;
}

export async function getPendingTruckRoutes(): Promise<PendingTruckRoute[]> {
  try {
    const data = await AsyncStorage.getItem(PENDING_TRUCK_ROUTES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting pending truck routes:', error);
    return [];
  }
}

export async function syncTruckRoutes(): Promise<boolean> {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) return false;
  
  const pendingRoutes = await getPendingTruckRoutes();
  if (!pendingRoutes.length) return true;
  
  let success = true;
  const remainingRoutes = [...pendingRoutes];
  
  for (const route of pendingRoutes) {
    try {
      if (route.type === 'startRoute') {
        await freightAxios.post('/truck-routes', route.data);
      } else if (route.type === 'endRoute') {
        await freightAxios.put('/truck-routes', route.data);
      }
      
      const index = remainingRoutes.findIndex(r => r.id === route.id);
      if (index !== -1) {
        remainingRoutes.splice(index, 1);
      }
    } catch (error) {
      console.error('Failed to sync truck route:', error);
      success = false;
      
      const index = remainingRoutes.findIndex(r => r.id === route.id);
      if (index !== -1) {
        remainingRoutes[index].retryCount++;
        if (remainingRoutes[index].retryCount > 5) {
          remainingRoutes.splice(index, 1);
        }
      }
    }
  }
  
  await AsyncStorage.setItem(PENDING_TRUCK_ROUTES_KEY, JSON.stringify(remainingRoutes));
  return success;
}

export function setupTruckRouteSyncListener() {
  let syncInProgress = false;
  
  return NetInfo.addEventListener(state => {
    if (state.isConnected && !syncInProgress) {
      syncInProgress = true;
      
      syncTruckRoutes()
        .finally(() => {
          syncInProgress = false;
        });
    }
  });
}

export async function hasPendingTruckRoutes(): Promise<boolean> {
  const routes = await getPendingTruckRoutes();
  return routes.length > 0;
}
