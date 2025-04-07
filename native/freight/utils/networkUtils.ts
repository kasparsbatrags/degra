import NetInfo, {NetInfoState} from '@react-native-community/netinfo'
import {useCallback, useEffect, useState} from 'react'
import {Platform} from 'react-native'
import {isWeb} from './platformUtils'

/**
 * Utility functions for network operations
 */

/**
 * Checks if the device is currently connected to the internet
 * @returns Promise that resolves to a boolean indicating if the device is connected
 */
export const isConnected = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return !!state.isConnected;
};

/**
 * Checks if the device has a strong internet connection
 * @returns Promise that resolves to a boolean indicating if the connection is strong
 */
export const hasStrongConnection = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  
  // Web platformai vienmēr atgriežam true, jo nav iespējams precīzi noteikt savienojuma stiprumu
  if (isWeb) {
    return !!state.isConnected;
  }
  
  // Mobilajām platformām pārbaudam savienojuma tipu
  if (state.type === 'wifi' || state.type === 'ethernet') {
    return true;
  }
  
  // Mobilajiem datiem pārbaudam stiprumu
  if (state.type === 'cellular') {
    // Ja ir 4G vai labāks, uzskatām par stipru savienojumu
    if (state.details?.cellularGeneration && ['4g', '5g'].includes(state.details.cellularGeneration)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Hook that provides the current network state and connection status
 * @returns Object with network state information
 */
export const useNetworkState = () => {
  const [networkState, setNetworkState] = useState<NetInfoState | null>(null);
  
  useEffect(() => {
    // Sākotnējā stāvokļa iegūšana
    NetInfo.fetch().then(setNetworkState);
    
    // Uzstāda klausītāju izmaiņām
    const unsubscribe = NetInfo.addEventListener(setNetworkState);
    
    // Notīra klausītāju, kad komponents tiek noņemts
    return () => unsubscribe();
  }, []);
  
  const isConnected = networkState?.isConnected === true;
  const isWifi = networkState?.type === 'wifi';
  const isCellular = networkState?.type === 'cellular';
  const isInternetReachable = networkState?.isInternetReachable === true;
  
  // Nosaka, vai savienojums ir pietiekami labs lielu datu ielādei
  const isStrongConnection = useCallback(() => {
    if (!isConnected) return false;
    
    // Web platformai vienmēr atgriežam true, ja ir savienojums
    if (isWeb) return true;
    
    // WiFi parasti ir labs savienojums
    if (isWifi) return true;
    
    // Mobilajiem datiem pārbaudam stiprumu
    if (isCellular) {
      const generation = networkState?.details?.cellularGeneration;
      return generation === '4g' || generation === '5g';
    }
    
    return false;
  }, [networkState, isConnected, isWifi, isCellular]);
  
  return {
    isConnected,
    isWifi,
    isCellular,
    isInternetReachable,
    isStrongConnection: isStrongConnection(),
    networkType: networkState?.type,
    details: networkState?.details,
  };
};

/**
 * Throttles network requests based on connection quality
 * @param callback Function to execute
 * @param options Options for throttling
 * @returns Promise that resolves to the result of the callback
 */
export const throttleNetworkRequest = async <T>(
  callback: () => Promise<T>,
  options: {
    retryCount?: number;
    retryDelay?: number;
    timeout?: number;
    priorityLevel?: 'high' | 'medium' | 'low';
  } = {}
): Promise<T> => {
  const {
    retryCount = 3,
    retryDelay = 1000,
    timeout = 10000,
    priorityLevel = 'medium',
  } = options;
  
  // Pārbaudam savienojuma kvalitāti
  const hasConnection = await isConnected();
  const strongConnection = await hasStrongConnection();
  
  // Ja nav savienojuma, uzreiz atgriežam kļūdu
  if (!hasConnection) {
    throw new Error('No internet connection');
  }
  
  // Ja ir zema prioritāte un vājš savienojums, palielinām timeout
  let actualTimeout = timeout;
  if (priorityLevel === 'low' && !strongConnection) {
    actualTimeout = timeout * 2;
  }
  
  // Mēģinām izpildīt pieprasījumu
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      // Izveidojam promise ar timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), actualTimeout);
      });
      
      // Izpildām pieprasījumu ar timeout
      return await Promise.race([callback(), timeoutPromise]) as T;
    } catch (error) {
      lastError = error as Error;
      
      // Ja ir pēdējais mēģinājums, atgriežam kļūdu
      if (attempt === retryCount - 1) {
        throw lastError;
      }
      
      // Gaidām pirms nākamā mēģinājuma
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }
  
  // Ja nonākam šeit, atgriežam pēdējo kļūdu
  throw lastError || new Error('Unknown error');
};

/**
 * Detects if the app is running in offline mode
 * @returns Boolean indicating if the app is in offline mode
 */
export const isOfflineMode = async (): Promise<boolean> => {
  // Pārbaudam, vai ir savienojums
  const connected = await isConnected();
  if (!connected) return true;
  
  // Pārbaudam, vai ir pieejams internets
  const state = await NetInfo.fetch();
  return state.isInternetReachable === false;
};
