import { Platform } from 'react-native';
import { useNetwork, setOfflineMode, checkOnlineStatus } from '../hooks/useNetwork';

/**
 * Apvienots hooks, kas nodrošina vienkāršotu tīkla statusa informāciju
 * @returns boolean - true, ja ierīce ir tiešsaistē un nav manuāli ieslēgts offline režīms
 */
export function useOnlineStatus(): boolean {
  const { isOnline } = useNetwork();
  return isOnline;
}

// Eksportējam pārējās funkcijas no useNetwork
export { 
  setOfflineMode as setForcedOfflineMode, 
  checkOnlineStatus as isDeviceOnline
};

// Saglabājam eksportu no useSyncStatus
export { useSyncStatus } from '../hooks/useSyncStatus';


// Konstantes, ja tās ir nepieciešamas citur
const isWeb = Platform.OS === 'web';
const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
