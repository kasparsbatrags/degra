import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { format } from 'date-fns';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { commonStyles } from '@/constants/styles';
import { COLORS, CONTAINER_WIDTH, SHADOWS, FONT } from '@/constants/theme';
import { useNetworkStatus, useSyncStatus, useConnectionQuality } from '@/hooks/useNetworkStatus';
import { cacheManager } from '@/services/CacheManager';
import { syncManager } from '@/services/SyncManager';
import { SYNC_KEYS } from '@/config/offlineConfig';
import Button from '@/components/Button';
import BackButton from '@/components/BackButton';
import GlobalOfflineIndicator, { CompactOfflineIndicator } from '@/components/GlobalOfflineIndicator';

interface PendingOperation {
  id: string;
  type: string;
  method: string;
  endpoint: string;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: string;
}

export default function ImprovedOfflineDataScreen() {
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([]);
  const [isLoadingOperations, setIsLoadingOperations] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);

  // Network hooks
  const {
    isOnline,
    isOfflineMode,
    pendingOperations: pendingCount,
    cacheSize,
    lastSync,
    setOfflineMode,
    refreshStatus
  } = useNetworkStatus();

  const {
    isSyncing,
    hasPendingData,
    lastSyncFormatted,
    performSync,
    canSync
  } = useSyncStatus();

  const {
    connectionQuality,
    isGoodConnection,
    shouldShowOfflineWarning
  } = useConnectionQuality();

  // Load pending operations
  const loadPendingOperations = async () => {
    setIsLoadingOperations(true);
    try {
      const operations: PendingOperation[] = [];
      
      // Load from all sync queues
      for (const queueType of Object.values(SYNC_KEYS)) {
        try {
          const stats = await syncManager.getQueueStats(queueType);
          // This is a simplified version - in reality we'd need to expose
          // the actual operations from SyncManager
          if (stats.pendingOperations > 0) {
            operations.push({
              id: `${queueType}-${Date.now()}`,
              type: queueType,
              method: 'POST',
              endpoint: '/api/sync',
              timestamp: Date.now(),
              retryCount: 0,
              maxRetries: 5,
              priority: 'medium'
            });
          }
        } catch (error) {
          console.error(`Error loading queue ${queueType}:`, error);
        }
      }
      
      setPendingOperations(operations);
    } catch (error) {
      console.error('Failed to load pending operations:', error);
    } finally {
      setIsLoadingOperations(false);
    }
  };

  // Load cache statistics
  const loadCacheStats = async () => {
    try {
      const stats = await cacheManager.getStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    }
  };

  useEffect(() => {
    loadPendingOperations();
    loadCacheStats();
  }, []);

  // Refresh when sync status changes
  useEffect(() => {
    if (!isSyncing) {
      loadPendingOperations();
      loadCacheStats();
    }
  }, [isSyncing]);

  const handleSync = async () => {
    if (!canSync) {
      Alert.alert(
        'Nav iespējams sinhronizēt',
        isOnline ? 'Nav nesinhronizētu datu' : 'Nav interneta savienojuma',
        [{ text: 'OK' }]
      );
      return;
    }

    const success = await performSync();
    
    if (success) {
      Alert.alert(
        'Sinhronizācija pabeigta',
        'Visi dati ir veiksmīgi sinhronizēti',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Sinhronizācijas kļūda',
        'Daži dati netika sinhronizēti. Mēģiniet vēlreiz.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Notīrīt cache',
      'Vai tiešām vēlaties dzēst visus kešotos datus? Šī darbība ir neatgriezeniska.',
      [
        { text: 'Atcelt', style: 'cancel' },
        {
          text: 'Dzēst',
          style: 'destructive',
          onPress: async () => {
            try {
              await cacheManager.clear();
              await loadCacheStats();
              Alert.alert('Cache notīrīts', 'Visi kešotie dati ir dzēsti');
            } catch (error) {
              Alert.alert('Kļūda', 'Neizdevās notīrīt cache');
            }
          }
        }
      ]
    );
  };

  const handleToggleOfflineMode = async () => {
    try {
      await setOfflineMode(!isOfflineMode);
      Alert.alert(
        'Offline režīms',
        isOfflineMode ? 'Offline režīms izslēgts' : 'Offline režīms ieslēgts'
      );
    } catch (error) {
      Alert.alert('Kļūda', 'Neizdevās mainīt offline režīmu');
    }
  };

  const formatDate = (timestamp: number) => {
    try {
      return format(new Date(timestamp), 'dd.MM.yyyy HH:mm');
    } catch (error) {
      return 'Nezināms datums';
    }
  };

  const formatCacheSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent': return 'wifi';
      case 'good': return 'signal-cellular-4-bar';
      case 'poor': return 'signal-cellular-4-bar';
      case 'offline': return 'wifi-off';
      default: return 'help';
    }
  };

  const getConnectionColor = () => {
    switch (connectionQuality) {
      case 'excellent': return COLORS.success;
      case 'good': return COLORS.secondary;
      case 'poor': return COLORS.warning;
      case 'offline': return COLORS.error;
      default: return COLORS.gray;
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={[commonStyles.content, styles.webContainer]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Offline Datu Pārvaldība</Text>
        </View>

        {/* Global Status Indicator */}
        <GlobalOfflineIndicator 
          onPress={() => {
            // Navigate to detailed sync screen or perform sync
            if (canSync) {
              handleSync();
            }
          }}
        />

        {/* Connection Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <MaterialIcons 
              name={getConnectionIcon()} 
              size={24} 
              color={getConnectionColor()} 
            />
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Savienojuma kvalitāte</Text>
              <Text style={[styles.statusValue, { color: getConnectionColor() }]}>
                {connectionQuality === 'excellent' && 'Lieliska'}
                {connectionQuality === 'good' && 'Laba'}
                {connectionQuality === 'poor' && 'Vāja'}
                {connectionQuality === 'offline' && 'Nav savienojuma'}
              </Text>
            </View>
          </View>

          {shouldShowOfflineWarning && (
            <Text style={styles.warningText}>
              ⚠️ Vājš savienojums var ietekmēt sinhronizāciju
            </Text>
          )}
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Nesinhronizēti</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{formatCacheSize(cacheSize)}</Text>
            <Text style={styles.statLabel}>Cache izmērs</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {cacheStats?.totalEntries || 0}
            </Text>
            <Text style={styles.statLabel}>Cache ieraksti</Text>
          </View>
        </View>

        {/* Cache Statistics */}
        {cacheStats && (
          <View style={styles.cacheStatsCard}>
            <Text style={styles.cardTitle}>Cache Statistika</Text>
            <View style={styles.statRow}>
              <Text style={styles.statRowLabel}>Hit Rate:</Text>
              <Text style={styles.statRowValue}>
                {(cacheStats.hitRate * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statRowLabel}>Miss Rate:</Text>
              <Text style={styles.statRowValue}>
                {(cacheStats.missRate * 100).toFixed(1)}%
              </Text>
            </View>
            {cacheStats.oldestEntry && (
              <View style={styles.statRow}>
                <Text style={styles.statRowLabel}>Vecākais ieraksts:</Text>
                <Text style={styles.statRowValue}>
                  {formatDate(cacheStats.oldestEntry)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Last Sync Info */}
        {lastSyncFormatted && (
          <View style={styles.syncInfoCard}>
            <Text style={styles.cardTitle}>Pēdējā Sinhronizācija</Text>
            <Text style={styles.syncTime}>{lastSyncFormatted}</Text>
          </View>
        )}

        {/* Pending Operations List */}
        <View style={styles.operationsContainer}>
          <Text style={styles.sectionTitle}>
            Nesinhronizētās Operācijas ({pendingOperations.length})
          </Text>
          
          {isLoadingOperations ? (
            <ActivityIndicator size="large" color={COLORS.secondary} style={styles.loader} />
          ) : pendingOperations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="check-circle" size={48} color={COLORS.success} />
              <Text style={styles.emptyText}>Nav nesinhronizētu operāciju</Text>
            </View>
          ) : (
            <FlatList
              data={pendingOperations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.operationItem}>
                  <View style={styles.operationHeader}>
                    <Text style={styles.operationType}>{item.type}</Text>
                    <Text style={styles.operationMethod}>{item.method}</Text>
                  </View>
                  <Text style={styles.operationEndpoint}>{item.endpoint}</Text>
                  <View style={styles.operationFooter}>
                    <Text style={styles.operationDate}>
                      {formatDate(item.timestamp)}
                    </Text>
                    <Text style={styles.operationRetries}>
                      Mēģinājumi: {item.retryCount}/{item.maxRetries}
                    </Text>
                  </View>
                </View>
              )}
              style={styles.operationsList}
            />
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title={isSyncing ? "Notiek sinhronizācija..." : "Sinhronizēt datus"}
            onPress={handleSync}
            disabled={!canSync || isSyncing}
            style={[
              styles.actionButton,
              (!canSync || isSyncing) && styles.disabledButton
            ]}
            loading={isSyncing}
          />

          <Button
            title={isOfflineMode ? "Izslēgt Offline" : "Ieslēgt Offline"}
            onPress={handleToggleOfflineMode}
            style={[
              styles.actionButton,
              styles.secondaryButton,
              isOfflineMode && styles.offlineButton
            ]}
          />

          <Button
            title="Notīrīt Cache"
            onPress={handleClearCache}
            style={[styles.actionButton, styles.dangerButton]}
          />
        </View>

        {/* Back Button */}
        <View style={styles.buttonContainer}>
          <BackButton
            onPress={() => router.push('/(tabs)')}
            style={styles.backButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  webContainer: Platform.OS === 'web' ? {
    width: '100%',
    maxWidth: CONTAINER_WIDTH.web,
    alignSelf: 'center',
  } : {},
  
  header: {
    marginBottom: 16,
  },
  
  title: {
    fontSize: 24,
    fontFamily: FONT.bold,
    color: COLORS.white,
    textAlign: 'center',
  },
  
  statusCard: Platform.OS === 'web' ? {
    backgroundColor: COLORS.black100,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  } : {
    backgroundColor: COLORS.black100,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...SHADOWS.medium,
  },
  
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statusInfo: {
    marginLeft: 12,
    flex: 1,
  },
  
  statusTitle: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: COLORS.gray,
  },
  
  statusValue: {
    fontSize: 16,
    fontFamily: FONT.semiBold,
    marginTop: 2,
  },
  
  warningText: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: COLORS.warning,
    marginTop: 8,
    textAlign: 'center',
  },
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  
  statCard: Platform.OS === 'web' ? {
    flex: 1,
    backgroundColor: COLORS.black100,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  } : {
    flex: 1,
    backgroundColor: COLORS.black100,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...SHADOWS.medium,
  },
  
  statNumber: {
    fontSize: 20,
    fontFamily: FONT.bold,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    textAlign: 'center',
  },
  
  cacheStatsCard: Platform.OS === 'web' ? {
    backgroundColor: COLORS.black100,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  } : {
    backgroundColor: COLORS.black100,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...SHADOWS.medium,
  },
  
  syncInfoCard: Platform.OS === 'web' ? {
    backgroundColor: COLORS.black100,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  } : {
    backgroundColor: COLORS.black100,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...SHADOWS.medium,
  },
  
  cardTitle: {
    fontSize: 16,
    fontFamily: FONT.semiBold,
    color: COLORS.white,
    marginBottom: 12,
  },
  
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  statRowLabel: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  
  statRowValue: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: COLORS.white,
  },
  
  syncTime: {
    fontSize: 16,
    fontFamily: FONT.medium,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  
  operationsContainer: {
    flex: 1,
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONT.semiBold,
    color: COLORS.white,
    marginBottom: 12,
  },
  
  loader: {
    marginTop: 24,
  },
  
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  
  emptyText: {
    fontSize: 16,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginTop: 12,
    textAlign: 'center',
  },
  
  operationsList: {
    maxHeight: 200,
  },
  
  operationItem: Platform.OS === 'web' ? {
    backgroundColor: COLORS.black100,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  } : {
    backgroundColor: COLORS.black100,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...SHADOWS.medium,
  },
  
  operationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  operationType: {
    fontSize: 14,
    fontFamily: FONT.semiBold,
    color: COLORS.white,
  },
  
  operationMethod: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.secondary,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  operationEndpoint: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginBottom: 8,
  },
  
  operationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  operationDate: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  
  operationRetries: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: COLORS.warning,
  },
  
  actionsContainer: {
    marginBottom: 16,
  },
  
  actionButton: {
    marginBottom: 12,
  },
  
  secondaryButton: {
    backgroundColor: COLORS.black100,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  
  offlineButton: {
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warning,
  },
  
  dangerButton: {
    backgroundColor: COLORS.error,
  },
  
  disabledButton: {
    opacity: 0.5,
  },
  
  buttonContainer: {
    marginTop: 16,
  },
  
  backButton: Platform.OS === 'web' ? {
    backgroundColor: COLORS.black100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  } : {
    backgroundColor: COLORS.black100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...SHADOWS.medium,
  },
});
