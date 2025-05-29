import { useState, useEffect, useCallback } from 'react';
import { offlineManager, OfflineStatus } from '@/services/OfflineManager';
import { useNetworkState } from '@/utils/networkUtils';

/**
 * Network status hook rezultāts
 */
export interface UseNetworkStatusResult {
  isOnline: boolean;
  isOfflineMode: boolean;
  pendingOperations: number;
  cacheSize: number;
  lastSync: number | null;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  refreshStatus: () => Promise<void>;
  setOfflineMode: (enabled: boolean) => Promise<void>;
  syncPendingData: () => Promise<boolean>;
}

/**
 * Hook tīkla stāvokļa un offline statusa pārvaldībai
 */
export function useNetworkStatus(): UseNetworkStatusResult {
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus>({
    isOnline: false,
    isOfflineMode: false,
    pendingOperations: 0,
    cacheSize: 0,
    lastSync: null
  });
  
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'offline'>('offline');
  const { isConnected, isWifi, isCellular, isStrongConnection } = useNetworkState();

  // Atjaunināt connection quality
  useEffect(() => {
    if (!isConnected) {
      setConnectionQuality('offline');
    } else if (isWifi || isStrongConnection) {
      setConnectionQuality('excellent');
    } else if (isCellular) {
      setConnectionQuality('good');
    } else {
      setConnectionQuality('poor');
    }
  }, [isConnected, isWifi, isCellular, isStrongConnection]);

  // Ielādēt sākotnējo statusu
  const refreshStatus = useCallback(async () => {
    try {
      const status = await offlineManager.getOfflineStatus();
      setOfflineStatus(status);
    } catch (error) {
      console.error('Error refreshing network status:', error);
    }
  }, []);

  // Ieslēgt/izslēgt offline mode
  const setOfflineMode = useCallback(async (enabled: boolean) => {
    try {
      await offlineManager.setOfflineMode(enabled);
      await refreshStatus();
    } catch (error) {
      console.error('Error setting offline mode:', error);
    }
  }, [refreshStatus]);

  // Sinhronizēt pending datus
  const syncPendingData = useCallback(async (): Promise<boolean> => {
    try {
      return await offlineManager.syncPendingData();
    } catch (error) {
      console.error('Error syncing pending data:', error);
      return false;
    }
  }, []);

  // Klausīties network status izmaiņas
  useEffect(() => {
    const unsubscribe = offlineManager.addNetworkListener((status) => {
      setOfflineStatus(status);
    });

    // Ielādēt sākotnējo statusu
    refreshStatus();

    return unsubscribe;
  }, [refreshStatus]);

  return {
    isOnline: offlineStatus.isOnline,
    isOfflineMode: offlineStatus.isOfflineMode,
    pendingOperations: offlineStatus.pendingOperations,
    cacheSize: offlineStatus.cacheSize,
    lastSync: offlineStatus.lastSync,
    connectionQuality,
    refreshStatus,
    setOfflineMode,
    syncPendingData
  };
}

/**
 * Hook connection quality pārbaudei
 */
export function useConnectionQuality() {
  const { connectionQuality, isOnline } = useNetworkStatus();
  
  const isGoodConnection = connectionQuality === 'excellent' || connectionQuality === 'good';
  const isPoorConnection = connectionQuality === 'poor';
  const isOffline = connectionQuality === 'offline';
  
  return {
    connectionQuality,
    isOnline,
    isGoodConnection,
    isPoorConnection,
    isOffline,
    canSync: isGoodConnection,
    shouldShowOfflineWarning: isPoorConnection || isOffline
  };
}

/**
 * Hook offline mode pārvaldībai
 */
export function useOfflineMode() {
  const { isOfflineMode, setOfflineMode, pendingOperations, syncPendingData } = useNetworkStatus();
  
  const toggleOfflineMode = useCallback(async () => {
    await setOfflineMode(!isOfflineMode);
  }, [isOfflineMode, setOfflineMode]);
  
  const hasPendingData = pendingOperations > 0;
  
  return {
    isOfflineMode,
    setOfflineMode,
    toggleOfflineMode,
    hasPendingData,
    pendingOperations,
    syncPendingData
  };
}

/**
 * Hook sync status pārvaldībai
 */
export function useSyncStatus() {
  const { 
    pendingOperations, 
    lastSync, 
    isOnline, 
    syncPendingData, 
    refreshStatus 
  } = useNetworkStatus();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAttempt, setLastSyncAttempt] = useState<number | null>(null);
  
  const performSync = useCallback(async (): Promise<boolean> => {
    if (!isOnline || isSyncing) {
      return false;
    }
    
    setIsSyncing(true);
    setLastSyncAttempt(Date.now());
    
    try {
      const success = await syncPendingData();
      await refreshStatus();
      return success;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, syncPendingData, refreshStatus]);
  
  // Automātiska sync, kad atgriežas internets
  useEffect(() => {
    if (isOnline && pendingOperations > 0 && !isSyncing) {
      // Delay, lai nodrošinātu stabilu savienojumu
      const timer = setTimeout(() => {
        performSync();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingOperations, isSyncing, performSync]);
  
  const hasPendingData = pendingOperations > 0;
  const canSync = isOnline && hasPendingData && !isSyncing;
  
  // Aprēķināt laiku kopš pēdējās sync
  const timeSinceLastSync = lastSync ? Date.now() - lastSync : null;
  const lastSyncFormatted = lastSync 
    ? new Date(lastSync).toLocaleString('lv-LV')
    : null;
  
  return {
    isSyncing,
    hasPendingData,
    pendingOperations,
    canSync,
    lastSync,
    lastSyncFormatted,
    timeSinceLastSync,
    lastSyncAttempt,
    performSync,
    refreshStatus
  };
}
