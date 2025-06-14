import { useEffect, useState } from 'react';
import { isOfflineMode } from '../services/offlineService';
import { isConnected } from '../utils/networkUtils';

/**
 * Hook, kas atgriež tīkla statusu (online/offline) un offline režīma statusu,
 * kā arī placeholder laukus, lai nodrošinātu saderību ar esošajām komponentēm.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);

  // Placeholderi, lai novērstu TS kļūdas komponentēs
  const [connectionQuality] = useState<'excellent' | 'good' | 'poor' | 'offline' | 'unknown'>('unknown');
  const [pendingOperations] = useState<number>(0);
  const [cacheSize] = useState<number>(0);

  useEffect(() => {
    let mounted = true;

    const checkStatus = async () => {
      const connected = await isConnected();
      const offline = await isOfflineMode();
      if (mounted) {
        setIsOnline(connected && !offline);
        setOfflineMode(offline);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    isOfflineMode: offlineMode,
    connectionQuality,
    pendingOperations,
    cacheSize,
  };
}

/**
 * Pagaidu hooks, kas atgriež minimālu objektu, lai novērstu TS kļūdas komponentēs.
 */
export function useSyncStatus() {
  return {
    isSyncing: false,
    hasPendingData: false,
    lastSyncFormatted: '',
    performSync: () => {},
    canSync: false,
  };
}
