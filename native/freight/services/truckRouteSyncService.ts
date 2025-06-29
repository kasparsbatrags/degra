import NetInfo from '@react-native-community/netinfo';
import freightAxios from '../config/freightAxios';
import { generateId } from '../utils/idUtils';
import { executeQuery, executeSelect } from '../utils/database';

export interface PendingTruckRoute {
  id: string;
  type: 'startRoute' | 'endRoute';
  data: any;
  timestamp: number;
  retryCount: number;
}

export async function saveTruckRouteLocally(type: 'startRoute' | 'endRoute', data: any): Promise<string> {
  const tempId = generateId();
  const endpoint = type === 'startRoute' ? '/truck-routes' : '/truck-routes';
  const operationType = type === 'startRoute' ? 'CREATE' : 'UPDATE';

  await executeQuery(
    'INSERT INTO offline_operations (id, type, table_name, endpoint, data, timestamp, retries, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [tempId, operationType, 'truck_routes', endpoint, JSON.stringify(data), Date.now(), 0, 'pending']
  );

  return tempId;
}

export async function getPendingTruckRoutes(): Promise<PendingTruckRoute[]> {
  try {
    const results = await executeSelect("SELECT id, type, data, timestamp, retries FROM offline_operations WHERE table_name = 'truck_routes' AND status = 'pending'");
    return results.map(row => ({
      id: row.id,
      type: row.type === 'CREATE' ? 'startRoute' : 'endRoute',
      data: JSON.parse(row.data),
      timestamp: row.timestamp,
      retryCount: row.retries,
    }));
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

  for (const route of pendingRoutes) {
    try {
      if (route.type === 'startRoute') {
        await freightAxios.post('/truck-routes', route.data);
      } else if (route.type === 'endRoute') {
        await freightAxios.put('/truck-routes', route.data);
      }
      await executeQuery("UPDATE offline_operations SET status = 'completed' WHERE id = ?", [route.id]);
    } catch (error) {
      console.error('Failed to sync truck route:', error);
      success = false;
      const newRetryCount = route.retryCount + 1;
      if (newRetryCount > 5) {
        await executeQuery("UPDATE offline_operations SET status = 'failed' WHERE id = ?", [route.id]);
      } else {
        await executeQuery('UPDATE offline_operations SET retries = ? WHERE id = ?', [newRetryCount, route.id]);
      }
    }
  }

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
