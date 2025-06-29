import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOnlineStatus } from '@/hooks/useNetwork'
import { saveTruckRouteLocally, syncTruckRoutes } from '../services/truckRouteSyncService';
import freightAxios from '../config/freightAxios';

export function useTruckRoute() {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  
  const startRoute = useMutation({
    mutationFn: async (routeData: any) => {
      if (!isOnline) {
        const tempId = await saveTruckRouteLocally('startRoute', routeData);
        return { ...routeData, id: tempId, isPending: true };
      }
      
      const response = await freightAxios.post('/truck-routes', routeData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['truckRoutes'] });
      
      if (isOnline) {
        syncTruckRoutes().catch(console.error);
      }
    },
    onError: (error) => {
      console.error('Failed to start route:', error);
    }
  });
  

  const endRoute = useMutation({
    mutationFn: async (routeData: any) => {
      if (!isOnline) {
        const tempId = await saveTruckRouteLocally('endRoute', routeData);
        return { ...routeData, id: tempId, isPending: true };
      }
      
      const response = await freightAxios.put('/truck-routes', routeData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['truckRoutes'] });
      
      if (isOnline) {
        syncTruckRoutes().catch(console.error);
      }
    },
    onError: (error) => {
      console.error('Failed to end route:', error);
    }
  });
  
  const getLastActiveRoute = async () => {
    try {
      if (!isOnline) {
        // Ja nav savienojuma, meklējam lokāli saglabātos datus
        const { executeSelectFirst } = require('@/utils/database');
        
        const lastActiveRoute = await executeSelectFirst(`
          SELECT tr.*,
                 trp.date_from,
                 trp.date_to,
                 trp.truck_uid,
                 t.registration_number,
                 t.truck_maker,
                 t.truck_model,
                 out_obj.name as out_object_name,
                 in_obj.name  as in_object_name
          FROM truck_routes tr
                   LEFT JOIN truck_route_page trp ON tr.truck_route_page_uid = trp.uid
                   LEFT JOIN truck t ON trp.truck_uid = t.uid
                   LEFT JOIN truck_object out_obj ON tr.out_truck_object_uid = out_obj.uid
                   LEFT JOIN truck_object in_obj ON tr.in_truck_object_uid = in_obj.uid
          WHERE tr.in_date_time IS NULL
            AND tr.is_deleted = 0
          ORDER BY tr.out_date_time DESC
          LIMIT 1
        `);
        
        if (lastActiveRoute) {
          // Pārveidojam SQLite datus uz API formātu
          return {
            uid: lastActiveRoute.uid,
            routeDate: lastActiveRoute.route_date,
            outDateTime: lastActiveRoute.out_date_time,
            odometerAtStart: lastActiveRoute.odometer_at_start,
            odometerAtFinish: lastActiveRoute.odometer_at_finish,
            cargoVolume: lastActiveRoute.cargo_volume,
            unitType: lastActiveRoute.unit_type_id,
            fuelBalanceAtStart: lastActiveRoute.fuel_balance_at_start,
            fuelReceived: lastActiveRoute.fuel_received,
            outTruckObject: {
              id: lastActiveRoute.out_truck_object_uid,
              name: lastActiveRoute.out_object_name
            },
            inTruckObject: lastActiveRoute.in_truck_object_uid ? {
              id: lastActiveRoute.in_truck_object_uid,
              name: lastActiveRoute.in_object_name
            } : null,
            truckRoutePage: {
              uid: lastActiveRoute.truck_route_page_uid,
              dateFrom: lastActiveRoute.date_from,
              dateTo: lastActiveRoute.date_to,
              truck: {
                id: lastActiveRoute.truck_uid,
                registrationNumber: lastActiveRoute.registration_number,
                truckMaker: lastActiveRoute.truck_maker,
                truckModel: lastActiveRoute.truck_model
              }
            }
          };
        }
        return null;
      }
      
      // Ja ir savienojums, pieprasām no servera
      const response = await freightAxios.get('/truck-routes/last-active');
      return response.data;
    } catch (error) {
      console.error('Failed to get last active route:', error);
      return null;
    }
  };
  
  return {
    startRoute,
    endRoute,
    getLastActiveRoute,
    syncTruckRoutes
  };
}
