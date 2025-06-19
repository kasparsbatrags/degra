import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { getOfflineConfig } from '../services/offlineService';
import { Platform } from 'react-native';

// Konstantes
const isWeb = Platform.OS === 'web';

// Tīkla statusa tipi
export type NetworkStatus = 'online' | 'offline' | 'forced-offline';

// Tīkla statusa atgriežamais objekta tips
export interface NetworkStatusResult {
  // Pamatstatuss
  status: NetworkStatus;
  isOnline: boolean;
  isOfflineMode: boolean;
  
  // Detalizēta tīkla informācija
  isWifi: boolean;
  isCellular: boolean;
  isInternetReachable: boolean;
  isStrongConnection: boolean;
  networkType: string | undefined;
  
  // Sinhronizācijas informācija
  pendingOperations: number;
  cacheSize: number;
  
  // Pilna tīkla informācija
  details: any;
}

/**
 * Apvienots hooks, kas nodrošina vienkāršotu tīkla statusa informāciju
 * @returns NetworkStatusResult - objekts ar tīkla statusa informāciju
 */
export function useNetworkStatus(): NetworkStatusResult {
  const [networkState, setNetworkState] = useState<NetInfoState | null>(null);
  const [forcedOfflineMode, setForcedOfflineMode] = useState(false);
  
  // Sinhronizācijas statuss
  const [pendingOperations, setPendingOperations] = useState(0);
  const [cacheSize, setCacheSize] = useState(0);
  
  // Uzstādām tīkla stāvokļa klausītāju
  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then(setNetworkState);
    
    // Set up listener for changes
    const unsubscribe = NetInfo.addEventListener(setNetworkState);
    
    // Clear listener when component is unmounted
    return () => unsubscribe();
  }, []);
  
  // Pārbaudām offline konfigurāciju
  useEffect(() => {
    const checkOfflineMode = async () => {
      try {
        const config = await getOfflineConfig();
        setForcedOfflineMode(config.forceOfflineMode);
        
        // Šeit varētu pievienot kodu, kas iegūst pendingOperations un cacheSize
        // no atbilstošiem servisiem
      } catch (error) {
        console.error('Failed to check offline mode:', error);
      }
    };
    
    checkOfflineMode();
    const interval = setInterval(checkOfflineMode, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const isConnected = networkState?.isConnected === true;
  const isWifi = networkState?.type === 'wifi';
  const isCellular = networkState?.type === 'cellular';
  const isInternetReachable = networkState?.isInternetReachable === true;
  
  // Determines if the connection is good enough for loading large data
  const isStrongConnection = useCallback(() => {
    if (!isConnected) return false;
    
    // For web platform, always return true if there is a connection
    if (isWeb) return true;
    
    // WiFi is usually a good connection
    if (isWifi) return true;
    
    // For mobile data, check strength
    if (isCellular) {
      const generation = networkState?.details?.cellularGeneration;
      return generation === '4g' || generation === '5g';
    }
    
    return false;
  }, [networkState, isConnected, isWifi, isCellular]);
  
  // Nosakām kopējo statusu
  const status: NetworkStatus = forcedOfflineMode 
    ? 'forced-offline' 
    : isConnected 
      ? 'online' 
      : 'offline';
  
  return {
    // Pamatstatuss
    status,
    isOnline: status === 'online',
    isOfflineMode: status === 'forced-offline',
    
    // Detalizēta tīkla informācija
    isWifi,
    isCellular,
    isInternetReachable,
    isStrongConnection: isStrongConnection(),
    networkType: networkState?.type,
    
    // Sinhronizācijas informācija
    pendingOperations,
    cacheSize,
    
    // Pilna tīkla informācija
    details: networkState?.details,
  };
}
