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
