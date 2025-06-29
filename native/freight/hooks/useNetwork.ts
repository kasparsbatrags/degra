// hooks/useNetwork.ts
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Konstante offline režīma iestatījuma glabāšanai
const FORCED_OFFLINE_KEY = 'app_forced_offline_mode';

// Pārbaudām, vai esam mobilajā platformā
const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

// Funkcija, kas pārbauda piekļuvi internetam
const checkInternetAccess = async (): Promise<boolean> => {
  try {
    // Izmantojam fetch ar timeout, lai pārbaudītu piekļuvi google.com
    // Pievienojam timestamp, lai izvairītos no kešošanas
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sekunžu timeout
    
    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal,
      // Pievienojam timestamp, lai izvairītos no kešošanas
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
    
    clearTimeout(timeoutId);
    return response.status === 204; // Google atgriež 204 statusu, ja pieprasījums ir veiksmīgs
  } catch (error) {
    console.log('Internet access check failed:', error);
    return false;
  }
};

// Funkcija piespiedu offline režīma pārslēgšanai
export const setOfflineMode = async (enabled: boolean): Promise<void> => {
  if (!isMobile) return;
  
  try {
    await AsyncStorage.setItem(FORCED_OFFLINE_KEY, enabled ? 'true' : 'false');
  } catch (error) {
    console.error('Neizdevās saglabāt offline režīma iestatījumu:', error);
  }
};

// Funkcija, kas manuāli pārbauda interneta piekļuvi
export const checkOnlineStatus = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  const isDeviceConnected = !!state.isConnected;
  
  if (!isDeviceConnected) return false;
  
  const hasAccess = await checkInternetAccess();
  
  const value = await AsyncStorage.getItem(FORCED_OFFLINE_KEY);
  const isForcedOffline = value === 'true';
  
  return hasAccess && !isForcedOffline;
};

export const useNetwork = () => {
  const [isDeviceConnected, setIsDeviceConnected] = useState(true);
  const [hasInternetAccess, setHasInternetAccess] = useState(true);
  const [forcedOfflineMode, setForcedOfflineMode] = useState(false);
  const [lastChecked, setLastChecked] = useState(0);

  // Sekot tīkla stāvoklim
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsDeviceConnected(!!state.isConnected);
      
      // Ja ierīce nav savienota, uzreiz zinām, ka nav interneta
      if (!state.isConnected) {
        setHasInternetAccess(false);
      } 
      // Ja ierīce ir savienota, pārbaudām internetu tikai ja pagājis pietiekami daudz laika kopš pēdējās pārbaudes
      else if (Date.now() - lastChecked > 30000) { // Pārbaudām ne biežāk kā reizi 30 sekundēs
        checkInternetAccess().then(hasAccess => {
          setHasInternetAccess(hasAccess);
          setLastChecked(Date.now());
        });
      }
    });
    
    // Sākotnējā stāvokļa iegūšana
    NetInfo.fetch().then(state => {
      setIsDeviceConnected(!!state.isConnected);
      
      if (state.isConnected) {
        checkInternetAccess().then(hasAccess => {
          setHasInternetAccess(hasAccess);
          setLastChecked(Date.now());
        });
      }
    });
    
    return () => unsubscribe();
  }, [lastChecked]);

  // Pārbaudīt piespiedu offline režīmu
  useEffect(() => {
    const checkOfflineMode = async () => {
      if (isMobile) {
        try {
          const value = await AsyncStorage.getItem(FORCED_OFFLINE_KEY);
          setForcedOfflineMode(value === 'true');
        } catch (error) {
          console.error('Neizdevās ielādēt offline režīma iestatījumu:', error);
        }
      }
    };
    
    checkOfflineMode();
    const interval = setInterval(checkOfflineMode, 5000);
    return () => clearInterval(interval);
  }, []);

  // Kopējais online statuss
  const isOnline = isDeviceConnected && hasInternetAccess && !forcedOfflineMode;

  return { 
    isOnline,
    forcedOfflineMode,
    checkOnlineStatus
  };
};
