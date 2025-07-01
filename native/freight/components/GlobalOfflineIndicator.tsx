import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, Switch } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { COLORS, FONT, SHADOWS } from '@/constants/theme';
import { useNetwork } from '../hooks/useNetwork';
import { useSyncStatus } from '../hooks/useSyncStatus';
import { getOfflineQueueStats } from '@/utils/offlineQueue';
import { getOfflineConfig } from '../services/offlineService';

interface GlobalOfflineIndicatorProps {
  showDetails?: boolean;
  onPress?: () => void;
  style?: any;
}

export default function GlobalOfflineIndicator({ 
  showDetails = true, 
  onPress,
  style 
}: GlobalOfflineIndicatorProps) {
  const { isOnline, setForcedOfflineMode } = useNetwork();
  const isStrongConnection = isOnline;
  
  const [queueStats, setQueueStats] = useState({ pending: 0, failed: 0, total: 0 });
  const [forceOffline, setForceOffline] = useState(false);
  
  const {
    isSyncing,
    hasPendingData,
    lastSyncFormatted,
    performSync,
    canSync
  } = useSyncStatus();

  useEffect(() => {
    const fetchData = async () => {
      const stats = await getOfflineQueueStats();
      setQueueStats(stats);
      
      const config = await getOfflineConfig();
      setForceOffline(config.forceOfflineMode);
    };
    
    fetchData();
    
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleOfflineMode = async (value: boolean) => {
    setForceOffline(value);
    await setForcedOfflineMode(value);
  };

  if (isOnline && !hasPendingData && !isSyncing && queueStats.pending === 0 && queueStats.failed === 0 && !forceOffline) {
    return null;
  }

  const getIndicatorColor = () => {
    if (!isOnline || forceOffline) return COLORS.error;
    if (isSyncing) return COLORS.secondary;
    if (hasPendingData || queueStats.pending > 0) return COLORS.warning;
    if (queueStats.failed > 0) return COLORS.error;
    return COLORS.success;
  };

  const getIndicatorIcon = () => {
    if (isSyncing) return 'sync';
    if (!isOnline || forceOffline) return 'wifi-off';
    if (hasPendingData || queueStats.pending > 0) return 'cloud-upload';
    if (queueStats.failed > 0) return 'error-outline';
    return 'wifi';
  };

  const getStatusText = () => {
    if (isSyncing) return 'Sinhronizē...';
    if (!isOnline) return 'Nav savienojuma';
    if (forceOffline) return 'Offline režīms (manuāls)';
    if (queueStats.failed > 0) return `${queueStats.failed} kļūdas`;
    if (hasPendingData || queueStats.pending > 0) return `${queueStats.pending} nesinhronizēti`;
    return 'Online';
  };

  const getConnectionQualityText = () => {
    if (!isOnline || forceOffline) return 'Nav';
    if (isStrongConnection) return 'Labs';
    return 'Vājš';
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (canSync) {
      performSync();
    }
  };

  const Component = onPress || canSync ? Pressable : View;

  return (
    <Component
      style={[styles.container, style]}
      onPress={handlePress}
      disabled={!onPress && !canSync}
    >
      <View style={styles.mainRow}>
        <MaterialIcons 
          name={getIndicatorIcon()} 
          size={16} 
          color={getIndicatorColor()} 
        />
        <Text style={[styles.statusText, { color: getIndicatorColor() }]}>
          {getStatusText()}
        </Text>
        
        <Switch
          value={forceOffline}
          onValueChange={toggleOfflineMode}
          trackColor={{ false: COLORS.gray, true: COLORS.warning }}
          thumbColor={forceOffline ? COLORS.secondary : COLORS.white}
        />
      </View>

      {showDetails && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Savienojums:</Text>
            <Text style={styles.detailValue}>
              {getConnectionQualityText()}
            </Text>
          </View>
          
          {(hasPendingData || queueStats.pending > 0) && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nesinhronizēti:</Text>
              <Text style={styles.detailValue}>
                {queueStats.pending} ieraksti
              </Text>
            </View>
          )}
          
          {queueStats.failed > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Kļūdas:</Text>
              <Text style={styles.detailValue}>
                {queueStats.failed} ieraksti
              </Text>
            </View>
          )}
          
          {lastSyncFormatted && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pēdējā sync:</Text>
              <Text style={styles.detailValue}>
                {lastSyncFormatted}
              </Text>
            </View>
          )}
        </View>
      )}
    </Component>
  );
}

const styles = StyleSheet.create({
  container: Platform.OS === 'web' ? {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...SHADOWS.small,
  } : {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...SHADOWS.medium,
  },
  
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statusText: {
    fontSize: 14,
    fontFamily: FONT.medium,
    marginLeft: 8,
    flex: 1,
  },
  
  
  detailsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  detailLabel: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  
  detailValue: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.white,
  },
});
