import AsyncStorage from '@react-native-async-storage/async-storage';
import { isOnline, setForcedOfflineMode } from './networkService';
import { Platform } from 'react-native';

// Konstantes
const OFFLINE_MODE_KEY = 'offlineMode';

export interface OfflineConfig {
  forceOfflineMode: boolean;
  cacheAssets: boolean;
}

/**
 * Iegūst offline režīma konfigurāciju
 */
export async function getOfflineConfig(): Promise<OfflineConfig> {
  try {
    const configJson = await AsyncStorage.getItem(OFFLINE_MODE_KEY);
    if (!configJson) {
      return {
        forceOfflineMode: false,
        cacheAssets: true,
      };
    }
    return JSON.parse(configJson);
  } catch (error) {
    console.error('Error getting offline config:', error);
    return {
      forceOfflineMode: false,
      cacheAssets: true,
    };
  }
}

/**
 * Saglabā offline režīma konfigurāciju
 */
export async function setOfflineConfig(config: Partial<OfflineConfig>): Promise<void> {
  try {
    const currentConfig = await getOfflineConfig();
    const newConfig = { ...currentConfig, ...config };
    await AsyncStorage.setItem(OFFLINE_MODE_KEY, JSON.stringify(newConfig));
  } catch (error) {
    console.error('Error setting offline config:', error);
  }
}

/**
 * Pārbauda, vai aplikācija ir offline režīmā
 */
export async function isOfflineMode(): Promise<boolean> {
  return !await isOnline();
}

/**
 * Ieslēdz vai izslēdz piespiedu offline režīmu
 */
export async function setForceOfflineMode(enabled: boolean): Promise<void> {
  await setForcedOfflineMode(enabled);
  await setOfflineConfig({ forceOfflineMode: enabled });
}

/**
 * Inicializē offline servisu (vienkāršota versija bez Expo Updates)
 */
export function initializeOfflineService(): void {
  // Vienkārša inicializācija bez blokējošām operācijām
  setTimeout(async () => {
    try {
      console.log('Offline service initializing...');
      
      // Pārbauda offline konfigurāciju
      const config = await getOfflineConfig();
      console.log('Offline config loaded:', config);
      
      console.log('Offline service initialized successfully');
    } catch (error) {
      console.error('Error initializing offline service:', error);
      console.log('Offline service initialized with errors');
    }
  }, 100);
}

/**
 * Iegūst informāciju par pašreizējo aplikācijas versiju
 */
export function getCurrentAppInfo(): {
  version: string;
  buildVersion: string;
  platform: string;
} {
  return {
    version: '1.0.0',
    buildVersion: 'standalone',
    platform: Platform.OS,
  };
}

/**
 * Notīra offline kešu (izmanto tikai ārkārtas gadījumos)
 */
export async function clearOfflineCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(OFFLINE_MODE_KEY);
    console.log('Offline cache cleared');
  } catch (error) {
    console.error('Error clearing offline cache:', error);
  }
}
