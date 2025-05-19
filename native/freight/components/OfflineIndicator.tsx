import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useNetworkState } from '../utils/networkUtils';
import { COLORS } from '../constants/theme';
import { hasPendingTruckRoutes } from '../services/truckRouteSyncService';
import { useEffect, useState } from 'react';

/**
 * Component that shows an indicator when the app is offline
 * or has pending data to sync
 */
export default function OfflineIndicator() {
  const { isConnected } = useNetworkState();
  const [hasPendingData, setHasPendingData] = useState(false);
  
  // Check for pending data
  useEffect(() => {
    const checkPendingData = async () => {
      const hasPending = await hasPendingTruckRoutes();
      setHasPendingData(hasPending);
    };
    
    checkPendingData();
    
    // Set up interval to check periodically
    const interval = setInterval(checkPendingData, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // If connected and no pending data, don't show anything
  if (isConnected && !hasPendingData) return null;
  
  return (
    <View style={styles.container}>
      {!isConnected ? (
        <Text style={styles.text}>
          Offline režīms - dati tiks sinhronizēti, kad būs pieejams internets
        </Text>
      ) : hasPendingData ? (
        <Text style={styles.text}>
          Notiek datu sinhronizācija...
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: Platform.OS === 'web' ? {
    backgroundColor: COLORS.warning,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  } : {
    backgroundColor: COLORS.warning,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  text: {
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
