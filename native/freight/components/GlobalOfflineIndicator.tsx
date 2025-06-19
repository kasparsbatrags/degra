import React from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { COLORS, FONT, SHADOWS } from '@/constants/theme';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useSyncStatus } from '../hooks/useSyncStatus';

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
  const { 
    isOnline, 
    isOfflineMode, 
    isStrongConnection,
    pendingOperations,
    cacheSize 
  } = useNetworkStatus();
  
  const {
    isSyncing,
    hasPendingData,
    lastSyncFormatted,
    performSync,
    canSync
  } = useSyncStatus();

  // Ja ir online un nav pending datu, nerādīt indikatoru
  if (isOnline && !isOfflineMode && !hasPendingData && !isSyncing) {
    return null;
  }

  const getIndicatorColor = () => {
    if (isOfflineMode) return COLORS.warning;
    if (!isOnline) return COLORS.error;
    if (isSyncing) return COLORS.secondary;
    if (hasPendingData) return COLORS.warning;
    return COLORS.success;
  };

  const getIndicatorIcon = () => {
    if (isSyncing) return 'sync';
    if (isOfflineMode) return 'offline-pin';
    if (!isOnline) return 'wifi-off';
    if (hasPendingData) return 'cloud-upload';
    return 'wifi';
  };

  const getStatusText = () => {
    if (isSyncing) return 'Sinhronizē...';
    if (isOfflineMode) return 'Offline režīms';
    if (!isOnline) return 'Nav savienojuma';
    if (hasPendingData) return `${pendingOperations} nesinhronizēti`;
    return 'Online';
  };

  const getConnectionQualityText = () => {
    if (!isOnline) return 'Nav';
    if (isStrongConnection) return 'Labs';
    return 'Vājš';
  };

  const formatCacheSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
        
        {(onPress || canSync) && (
          <MaterialIcons 
            name="chevron-right" 
            size={16} 
            color={COLORS.gray} 
          />
        )}
      </View>

      {showDetails && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Savienojums:</Text>
            <Text style={styles.detailValue}>
              {getConnectionQualityText()}
            </Text>
          </View>
          
          {hasPendingData && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nesinhronizēti:</Text>
              <Text style={styles.detailValue}>
                {pendingOperations} ieraksti
              </Text>
            </View>
          )}
          
          {cacheSize > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cache:</Text>
              <Text style={styles.detailValue}>
                {formatCacheSize(cacheSize)}
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

/**
 * Kompakts offline indikators bez detaļām
 */
export function CompactOfflineIndicator({ onPress, style }: GlobalOfflineIndicatorProps) {
  return (
    <GlobalOfflineIndicator 
      showDetails={false} 
      onPress={onPress}
      style={[styles.compactContainer, style]}
    />
  );
}

/**
 * Floating offline indikators
 */
export function FloatingOfflineIndicator({ onPress }: { onPress?: () => void }) {
  const { isOnline, isOfflineMode, pendingOperations } = useNetworkStatus();
  const { isSyncing } = useSyncStatus();

  // Rādīt tikai, ja ir kāda problēma
  if (isOnline && !isOfflineMode && pendingOperations === 0 && !isSyncing) {
    return null;
  }

  return (
    <View style={styles.floatingContainer}>
      <GlobalOfflineIndicator 
        showDetails={false}
        onPress={onPress}
        style={styles.floatingIndicator}
      />
    </View>
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
  
  compactContainer: {
    padding: 8,
    marginVertical: 2,
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
  
  floatingContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 60, // Account for status bar on mobile
    right: 16,
    zIndex: 1000,
  },
  
  floatingIndicator: Platform.OS === 'web' ? {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...SHADOWS.medium,
  } : {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...SHADOWS.medium,
  },
});
