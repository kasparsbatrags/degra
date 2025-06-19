import NetInfo, {NetInfoState} from '@react-native-community/netinfo'
import {useCallback, useEffect, useState} from 'react'
import {isWeb} from './platformUtils'

/**
 * Utility functions for network operations
 */

/**
 * Checks if the device is currently connected to the internet
 * @returns Promise that resolves to a boolean indicating if the device is connected
 */
export const isConnected = async (): Promise<boolean> => {
  try {
    const timeoutPromise = new Promise<NetInfoState>((_, reject) => {
      setTimeout(() => reject(new Error('Network check timeout')), 3000);
    });
    
    const state = await Promise.race([NetInfo.fetch(), timeoutPromise]);
    return !!state.isConnected;
  } catch (error) {
    console.warn('Network check failed, assuming offline:', error);
    return false;
  }
};

/**
 * Checks if the device has a strong internet connection
 * @returns Promise that resolves to a boolean indicating if the connection is strong
 */
export const hasStrongConnection = async (): Promise<boolean> => {
  try {
    // Timeout pārbaude, lai neblokētu ilgi
    const timeoutPromise = new Promise<NetInfoState>((_, reject) => {
      setTimeout(() => reject(new Error('Network check timeout')), 3000);
    });
    
    const state = await Promise.race([NetInfo.fetch(), timeoutPromise]);
    
    // For web platform, always return true, as it's not possible to accurately determine connection strength
    if (isWeb) {
      return !!state.isConnected;
    }
    
    // For mobile platforms, check connection type
    if (state.type === 'wifi' || state.type === 'ethernet') {
      return true;
    }
    
    // For mobile data, check strength
    if (state.type === 'cellular') {
      // If it's 4G or better, consider it a strong connection
      if (state.details?.cellularGeneration && ['4g', '5g'].includes(state.details.cellularGeneration)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.warn('Strong connection check failed, assuming weak connection:', error);
    return false;
  }
};

/**
 * Hook that provides the current network state and connection status
 * @returns Object with network state information
 */
export const useNetworkState = () => {
  const [networkState, setNetworkState] = useState<NetInfoState | null>(null);
  
  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then(setNetworkState);
    
    // Set up listener for changes
    const unsubscribe = NetInfo.addEventListener(setNetworkState);
    
    // Clear listener when component is unmounted
    return () => unsubscribe();
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
  
  // Check connection quality
  const hasConnection = await isConnected();
  const strongConnection = await hasStrongConnection();
  
  // If there's no connection, return error immediately
  if (!hasConnection) {
    throw new Error('No internet connection');
  }
  
  // If priority is low and connection is weak, increase timeout
  let actualTimeout = timeout;
  if (priorityLevel === 'low' && !strongConnection) {
    actualTimeout = timeout * 2;
  }
  
  // Try to execute the request
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      // Create promise with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), actualTimeout);
      });
      
      // Execute request with timeout
      return await Promise.race([callback(), timeoutPromise]) as T;
    } catch (error) {
      lastError = error as Error;
      
      // If it's the last attempt, return error
      if (attempt === retryCount - 1) {
        throw lastError;
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }
  
  // If we get here, return the last error
  throw lastError || new Error('Unknown error');
};

/**
 * Detects if the app is running in offline mode
 * @returns Boolean indicating if the app is in offline mode
 */
export const isOfflineMode = async (): Promise<boolean> => {
  try {
    // Check if there is a connection
    const connected = await isConnected();
    if (!connected) return true;
    
    // Check if internet is available with timeout
    const timeoutPromise = new Promise<NetInfoState>((_, reject) => {
      setTimeout(() => reject(new Error('Network check timeout')), 3000);
    });
    
    const state = await Promise.race([NetInfo.fetch(), timeoutPromise]);
    return state.isInternetReachable === false;
  } catch (error) {
    console.warn('Offline mode check failed, assuming offline:', error);
    return true; // Ja nevar pārbaudīt, pieņem ka ir offline
  }
};
