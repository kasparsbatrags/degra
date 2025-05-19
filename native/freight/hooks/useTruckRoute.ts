import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNetworkState } from '../utils/networkUtils';
import { saveTruckRouteLocally, syncTruckRoutes } from '../services/truckRouteSyncService';
import freightAxios from '../config/freightAxios';

/**
 * Hook for managing truck routes with offline support
 */
export function useTruckRoute() {
  const queryClient = useQueryClient();
  const { isConnected } = useNetworkState();
  
  /**
   * Start a new truck route
   */
  const startRoute = useMutation({
    mutationFn: async (routeData: any) => {
      if (!isConnected) {
        // Saglabāt lokāli, ja nav savienojuma
        const tempId = await saveTruckRouteLocally('startRoute', routeData);
        return { ...routeData, id: tempId, isPending: true };
      }
      
      // Nosūtīt uz serveri, ja ir savienojums
      const response = await freightAxios.post('/truck-routes', routeData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['truckRoutes'] });
      
      // Mēģināt sinhronizēt citus nesinhronizētos braucienus
      if (isConnected) {
        syncTruckRoutes().catch(console.error);
      }
    },
    onError: (error) => {
      console.error('Failed to start route:', error);
    }
  });
  
  /**
   * End an existing truck route
   */
  const endRoute = useMutation({
    mutationFn: async (routeData: any) => {
      if (!isConnected) {
        // Saglabāt lokāli, ja nav savienojuma
        const tempId = await saveTruckRouteLocally('endRoute', routeData);
        return { ...routeData, id: tempId, isPending: true };
      }
      
      // Nosūtīt uz serveri, ja ir savienojums
      const response = await freightAxios.put('/truck-routes', routeData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['truckRoutes'] });
      
      // Mēģināt sinhronizēt citus nesinhronizētos braucienus
      if (isConnected) {
        syncTruckRoutes().catch(console.error);
      }
    },
    onError: (error) => {
      console.error('Failed to end route:', error);
    }
  });
  
  /**
   * Get the last active route with offline support
   */
  const getLastActiveRoute = async () => {
    try {
      if (!isConnected) {
        // Ja nav savienojuma, meklējam lokāli saglabātos datus
        // Šeit varētu būt loģika, kas atgriež pēdējo aktīvo braucienu no lokālās glabātuves
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
