import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import { getOfflineConfig } from '../services/offlineService';

// Eksportējam hooks no hooks mapes
export { useNetworkStatus, NetworkStatus, NetworkStatusResult } from '../hooks/useNetworkStatus';
export { useSyncStatus } from '../hooks/useSyncStatus';

// Konstantes
const isWeb = Platform.OS === 'web';

// ==================== UTILITY FUNKCIJAS ====================

/**
 * Pārbauda, vai ierīce ir pievienota internetam
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
 * Pārbauda, vai ierīcei ir spēcīgs interneta savienojums
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
 * Pārbauda, vai aplikācija ir offline režīmā
 */
export const isOfflineMode = async (): Promise<boolean> => {
  try {
    // Vispirms pārbaudām konfigurāciju
    const config = await getOfflineConfig();
    if (config.forceOfflineMode) {
      return true;
    }
    
    // Pārbaudām tīkla savienojumu
    const connected = await isConnected();
    return !connected;
  } catch (error) {
    console.error('Error checking offline mode:', error);
    return false;
  }
};

/**
 * Ierobežo tīkla pieprasījumus atkarībā no savienojuma kvalitātes
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
  
  const hasConnection = await isConnected();
  const strongConnection = await hasStrongConnection();
  
  if (!hasConnection) {
    throw new Error('No internet connection');
  }
  
  let actualTimeout = timeout;
  if (priorityLevel === 'low' && !strongConnection) {
    actualTimeout = timeout * 2;
  }
  
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), actualTimeout);
      });
      
      return await Promise.race([callback(), timeoutPromise]) as T;
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === retryCount - 1) {
        throw lastError;
      }
      
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }
  
  throw lastError || new Error('Unknown error');
};
