import { isOnline, setForcedOfflineMode } from '../services/networkService';
import { useOnlineStatus } from '../hooks/useNetwork';

export { useOnlineStatus };

export const isDeviceOnline = isOnline;
export { setForcedOfflineMode };

export const checkOnlineStatus = isOnline;
export const isConnected = isOnline;
