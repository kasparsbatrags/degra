import { useState, useEffect } from 'react';
import { isOnline, setForcedOfflineMode, addOnlineStatusListener } from '../services/networkService';

export function useNetwork() {
  const [isDeviceOnline, setIsDeviceOnline] = useState<boolean>(true);
  
  useEffect(() => {
    isOnline().then(online => {
      setIsDeviceOnline(online);
    });
    
    const removeListener = addOnlineStatusListener(online => {
      setIsDeviceOnline(online);
    });
    
    return removeListener;
  }, []);
  
  return { 
    isOnline: isDeviceOnline,
    setForcedOfflineMode,
    checkOnlineStatus: isOnline
  };
}

export function useOnlineStatus(): boolean {
  const { isOnline } = useNetwork();
  return isOnline;
}
