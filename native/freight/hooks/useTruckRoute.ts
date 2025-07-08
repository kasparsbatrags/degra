import {TruckRouteDto} from '@/dto/TruckRouteDto'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOnlineStatus } from '@/hooks/useNetwork'
import { syncTruckRoutes } from '@/services/truckRouteSyncService';
import { saveTruckRouteLocally } from '@/utils/offlineDataManager';
import { markLocalRecordAsSynced } from '@/utils/localDataSync';
import { addOfflineOperation } from '@/utils/offlineQueue';
import { isRetryableError, getErrorMessage } from '@/utils/errorHandler';
import { TruckRouteDataManager } from '@/utils/data-managers/TruckRouteDataManager';
import freightAxios from '../config/freightAxios';

const truckRouteDataManager = new TruckRouteDataManager();

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
    return await truckRouteDataManager.getLastActiveRoute();
  };

  return {
    startRoute,
    endRoute,
    getLastActiveRoute,
    syncTruckRoutes
  };
}
