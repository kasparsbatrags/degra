import {TruckRouteDto} from '@/dto/TruckRouteDto'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOnlineStatus } from '@/hooks/useNetwork'
import { syncTruckRoutes } from '@/services/truckRouteSyncService';
import { saveTruckRouteLocally } from '@/utils/offlineDataManager';
import { markLocalRecordAsSynced } from '@/utils/localDataSync';
import { addOfflineOperation } from '@/utils/offlineQueue';
import { isRetryableError, getErrorMessage } from '@/utils/errorHandler';
import freightAxios from '../config/freightAxios';

export function useTruckRoute() {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();

	const createRouteMutation = (endpoint: string, method: 'post' | 'put', offlineKey: 'startRoute' | 'endRoute') =>
			useMutation({
				mutationFn: async (routeData: TruckRouteDto) => {
					console.log(`🚀 Creating ${offlineKey} route:`, routeData);
					
					// 1. VIENMĒR saglabāt vispirms lokāli
					const uid = await saveTruckRouteLocally(offlineKey, routeData);
					
					// 2. Ja online - mēģināt nosūtīt uz serveri
					if (isOnline) {
						try {
							console.log(`🌐 Sending ${offlineKey} to server...`);
							const response = await freightAxios[method](endpoint, routeData);
							
							// 3. Servera pieprasījums izdevās - atzīmēt kā sinhronizētu
							await markLocalRecordAsSynced(uid);
							console.log(`✅ ${offlineKey} synced successfully`);
							
							return response.data;
						} catch (error) {
							console.error(`❌ Server request failed for ${offlineKey}:`, getErrorMessage(error));
							
							// 4. Pārbaudīt kļūdas tipu
							if (isRetryableError(error)) {
								// Retry-able kļūda - pievienot offline queue
								await addOfflineOperation(
									method === 'post' ? 'CREATE' : 'UPDATE',
									'truck_routes',
									endpoint,
									routeData,
									true // skipAutoProcess
								);
								console.log(`🔄 ${offlineKey} added to offline queue for retry`);
								return { ...routeData, uid, isPending: true };
							} else {
								// Non-retry-able kļūda - parādīt lietotājam
								console.error(`🚫 ${offlineKey} failed permanently:`, getErrorMessage(error));
								throw error;
							}
						}
					} else {
						// 5. Offline režīms - pievienot offline queue
						await addOfflineOperation(
							method === 'post' ? 'CREATE' : 'UPDATE',
							'truck_routes',
							endpoint,
							routeData,
							true // skipAutoProcess
						);
						console.log(`📴 ${offlineKey} saved offline, will sync later`);
						return { ...routeData, uid, isPending: true };
					}
				},
				onSuccess: (data) => {
					queryClient.invalidateQueries({ queryKey: ['truckRoutes'] });
					console.log(`🎉 ${offlineKey} completed successfully`);
				},
				onError: (error) => {
					console.error(`💥 ${offlineKey} failed:`, error);
				},
			});

	const startRoute = createRouteMutation('/truck-routes', 'post', 'startRoute');
	const endRoute = createRouteMutation('/truck-routes', 'put', 'endRoute');

  const getLastActiveRoute = async () => {
    try {
      if (!isOnline) {
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
