import {TruckRouteDto} from '@/dto/TruckRouteDto'
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

export async function saveTruckRouteLocally(type: 'startRoute' | 'endRoute', data: TruckRouteDto): Promise<string> {
  const tempId = data.uid || generateId();
  const endpoint = type === 'startRoute' ? '/truck-routes' : `/truck-routes/${data.uid}`;
  const operationType = type === 'startRoute' ? 'CREATE' : 'UPDATE';

  // Saglabājam operāciju offline_operations tabulā (esošā funkcionalitāte)
  await executeQuery(
    'INSERT INTO offline_operations (id, type, table_name, endpoint, data, timestamp, retries, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [tempId, operationType, 'truck_routes', endpoint, JSON.stringify(data), Date.now(), 0, 'pending']
  );

  // JAUNA FUNKCIONALITĀTE: Saglabājam datus arī truck_routes tabulā
  try {
    if (type === 'startRoute') {
      // Jauna brauciena sākums
      await executeQuery(`
        INSERT INTO truck_routes (
          uid, truck_route_page_uid, route_date, out_truck_object_uid, 
          odometer_at_start, out_date_time, cargo_volume, unit_type_id,
          fuel_balance_at_start, fuel_received, is_dirty, is_deleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
      `, [
        tempId,
        data.truckRoutePage?.uid,
        data.routeDate,
        data.outTruckObject?.uid,
        data.odometerAtStart,
        data.outDateTime,
        data.cargoVolume || 0,
        data.unitType,
        data.fuelBalanceAtStart,
        data.fuelReceived || null,
      ]);
    } else {
      // Brauciena beigas (atjauninām esošo ierakstu)
      await executeQuery(`
        UPDATE truck_routes 
        SET 
          in_truck_object_uid = ?,
          odometer_at_finish = ?,
          in_date_time = ?,
          route_length = ?,
          fuel_balance_at_finish = ?,
          is_dirty = 1
        WHERE uid = ?
      `, [
        data.inTruckObject?.uid,
        data.odometerAtFinish,
        data.inDateTime,
        data.odometerAtFinish - data.odometerAtStart, // Aprēķinām brauciena garumu
        data.fuelBalanceAtFinish,
        data.uid
      ]);
    }
    console.log(`Brauciena dati saglabāti SQLite datubāzē (${type})`);
  } catch (error) {
    console.error('Kļūda saglabājot brauciena datus SQLite datubāzē:', error);
    // Turpinām darbu pat ja ir kļūda, jo dati jau ir saglabāti offline_operations tabulā
  }

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
      let serverResponse;
      if (route.type === 'startRoute') {
        serverResponse = await freightAxios.post('/truck-routes', route.data);
      } else if (route.type === 'endRoute') {
        serverResponse = await freightAxios.put(`/truck-routes/${route.data.uid}`, route.data);
      }
      
      // Atzīmējam operāciju kā pabeigtu
      await executeQuery("UPDATE offline_operations SET status = 'completed' WHERE id = ?", [route.id]);
      
      // JAUNA FUNKCIONALITĀTE: Atjauninām arī truck_routes tabulu
      if (serverResponse?.data?.uid) {
        // Ja serveris atgrieza UID, atjauninām lokālo ierakstu ar servera UID
        await executeQuery(`
          UPDATE truck_routes 
          SET 
            uid = ?,
            is_dirty = 0,
            synced_at = ?
          WHERE uid = ?
        `, [
          serverResponse.data.uid,
          Date.now(),
          route.id
        ]);
      } else {
        // Ja nav servera UID, vienkārši atzīmējam kā sinhronizētu
        await executeQuery(`
          UPDATE truck_routes 
          SET 
            is_dirty = 0,
            synced_at = ?
          WHERE uid = ?
        `, [
          Date.now(),
          route.id
        ]);
      }
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
