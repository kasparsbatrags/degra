import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useNetworkState } from '../utils/networkUtils';
import { COLORS } from '../constants/theme';
import { 
  isOfflineMode, 
  setForceOfflineMode, 
  getCurrentAppInfo,
  getOfflineConfig
} from '../services/offlineService';
import { hasPendingMutations, syncPendingMutations } from '../services/syncService';
import { hasPendingTruckRoutes } from '../services/truckRouteSyncService';

/**
 * Komponente, kas rāda offline kontroles (bez Expo Updates)
 */
export default function OfflineControls() {
  const { isConnected } = useNetworkState();
  const [isOffline, setIsOffline] = useState(false);
  const [hasPendingData, setHasPendingData] = useState(false);
  const [forceOffline, setForceOffline] = useState(false);
  const [appInfo, setAppInfo] = useState(getCurrentAppInfo());

  // Pārbauda offline statusu un gaidošos datus
  useEffect(() => {
    const checkStatus = async () => {
      const offline = await isOfflineMode();
      const config = await getOfflineConfig();
      const pendingMutations = await hasPendingMutations();
      const pendingRoutes = await hasPendingTruckRoutes();
      
      setIsOffline(offline);
      setForceOffline(config.forceOfflineMode);
      setHasPendingData(pendingMutations || pendingRoutes);
    };

    checkStatus();
    
    // Pārbauda statusu katras 10 sekundes
    const interval = setInterval(checkStatus, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Pārslēdz piespiedu offline režīmu
  const toggleForceOfflineMode = async () => {
    try {
      const newValue = !forceOffline;
      await setForceOfflineMode(newValue);
      setForceOffline(newValue);
      
      Alert.alert(
        'Offline režīms',
        newValue 
          ? 'Piespiedu offline režīms ieslēgts. Aplikācija neveiks tīkla pieprasījumus.'
          : 'Piespiedu offline režīms izslēgts. Aplikācija atkal veiks tīkla pieprasījumus.',
        [{ text: 'Labi' }]
      );
    } catch (error) {
      Alert.alert('Kļūda', 'Neizdevās mainīt offline režīmu');
    }
  };

  // Manuāli sinhronizē datus
  const handleSyncData = async () => {
    if (isOffline) {
      Alert.alert('Offline režīms', 'Datus nevar sinhronizēt offline režīmā');
      return;
    }

    try {
      const success = await syncPendingMutations();
      
      if (success) {
        Alert.alert('Sinhronizācija', 'Dati veiksmīgi sinhronizēti');
      } else {
        Alert.alert('Sinhronizācija', 'Daži dati netika sinhronizēti. Mēģināsim vēlāk.');
      }
    } catch (error) {
      Alert.alert('Kļūda', 'Neizdevās sinhronizēt datus');
    }
  };

  return (
    <View style={styles.container}>
      {/* Statusa indikators */}
      <View style={[styles.statusBar, isOffline ? styles.offlineStatus : styles.onlineStatus]}>
        <Text style={styles.statusText}>
          {isOffline ? 'Offline režīms' : 'Online režīms'}
          {hasPendingData && ' • Gaidošie dati'}
        </Text>
      </View>

      {/* Kontroles pogas */}
      <View style={styles.controls}>
        {/* Offline režīma pārslēgs */}
        <TouchableOpacity 
          style={[styles.button, forceOffline ? styles.activeButton : styles.inactiveButton]}
          onPress={toggleForceOfflineMode}
        >
          <Text style={styles.buttonText}>
            {forceOffline ? 'Izslēgt offline' : 'Ieslēgt offline'}
          </Text>
        </TouchableOpacity>

        {/* Datu sinhronizācija */}
        {!isOffline && hasPendingData && (
          <TouchableOpacity 
            style={[styles.button, styles.syncButton]}
            onPress={handleSyncData}
          >
            <Text style={styles.buttonText}>Sinhronizēt datus</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Aplikācijas informācija */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>
          Versija: {appInfo.version} | Build: {appInfo.buildVersion}
        </Text>
        <Text style={styles.appInfoText}>
          Platforma: {appInfo.platform} | Standalone aplikācija
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
    padding: 16,
  },
  statusBar: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
    alignItems: 'center',
  },
  offlineStatus: {
    backgroundColor: COLORS.warning,
  },
  onlineStatus: {
    backgroundColor: COLORS.success,
  },
  statusText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  controls: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 8,
    marginBottom: 12,
  },
  button: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    flex: Platform.OS === 'web' ? 1 : undefined,
  },
  activeButton: {
    backgroundColor: COLORS.warning,
  },
  inactiveButton: {
    backgroundColor: COLORS.gray,
  },
  syncButton: {
    backgroundColor: COLORS.success,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  appInfo: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
  },
  appInfoText: {
    color: COLORS.gray,
    fontSize: 12,
    textAlign: 'center',
  },
});
