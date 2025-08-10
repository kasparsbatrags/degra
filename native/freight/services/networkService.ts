import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const FORCED_OFFLINE_KEY = 'app_forced_offline_mode';

let listeners: ((isOnline: boolean) => void)[] = [];

async function checkInternetAccess(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
    
    clearTimeout(timeoutId);
    return response.status === 204;
  } catch (error) {
    return false;
  }
}

async function getForcedOfflineMode(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(FORCED_OFFLINE_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Kļūda offline režīma pārbaudē:', error);
    return false;
  }
}

export async function isOnline(): Promise<boolean> {
  // Web aplikācijā vienmēr atgriež true (nav nepieciešama offline pārbaude)
  if (Platform.OS === 'web') {
    return true;
  }
  
  const forcedOffline = await getForcedOfflineMode();
  if (forcedOffline) {
    return false;
  }
  
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    return false;
  }
  
  return await checkInternetAccess();
}

export async function setForcedOfflineMode(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(FORCED_OFFLINE_KEY, enabled ? 'true' : 'false');
    
    const newOnlineStatus = await isOnline();
    notifyListeners(newOnlineStatus);
  } catch (error) {
    console.error('Kļūda offline režīma iestatīšanā:', error);
  }
}

function notifyListeners(isOnline: boolean): void {
  listeners.forEach(listener => listener(isOnline));
}

export function addOnlineStatusListener(listener: (isOnline: boolean) => void): () => void {
  listeners.push(listener);
  
  isOnline().then(online => {
    listener(online);
  });
  
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

export async function checkNetworkStatus(): Promise<boolean> {
  // Web aplikācijā vienmēr atgriež true (nav nepieciešama offline pārbaude)
  if (Platform.OS === 'web') {
    return true;
  }
  
  const forcedOffline = await getForcedOfflineMode();
  if (forcedOffline) {
    return false;
  }
  
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    return false;
  }
  
  return await checkInternetAccess();
}

NetInfo.addEventListener(state => {
  isOnline().then(online => {
    notifyListeners(online);
  });
});
