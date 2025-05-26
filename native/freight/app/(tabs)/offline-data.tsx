import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles } from '@/constants/styles';
import { COLORS, CONTAINER_WIDTH, SHADOWS } from '@/constants/theme';
import { getPendingTruckRoutes, syncTruckRoutes, PendingTruckRoute } from '@/services/truckRouteSyncService';
import { getPendingMutations, syncPendingMutations, PendingMutation } from '@/services/syncService';
import { 
  isOfflineMode, 
  setForceOfflineMode, 
  getOfflineConfig, 
  clearOfflineCache,
  getCurrentAppInfo 
} from '@/services/offlineService';
import { useNetworkState } from '@/utils/networkUtils';
import Button from '@/components/Button';
import { format } from 'date-fns';
import { router } from 'expo-router';
import BackButton from '@/components/BackButton';
import OfflineControls from '@/components/OfflineControls';

export default function OfflineDataScreen() {
  const [pendingRoutes, setPendingRoutes] = useState<PendingTruckRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { isConnected } = useNetworkState();
  
  const loadPendingRoutes = async () => {
    setIsLoading(true);
    try {
      const routes = await getPendingTruckRoutes();
      setPendingRoutes(routes);
    } catch (error) {
      console.error('Failed to load pending routes:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadPendingRoutes();
  }, []);
  
  const handleSync = async () => {
    if (!isConnected) {
      alert('Nav interneta savienojuma. Lūdzu, mēģiniet vēlāk.');
      return;
    }
    
    setIsSyncing(true);
    try {
      await syncTruckRoutes();
      await loadPendingRoutes();
    } catch (error) {
      console.error('Failed to sync data:', error);
      alert('Kļūda sinhronizējot datus. Lūdzu, mēģiniet vēlāk.');
    } finally {
      setIsSyncing(false);
    }
  };
  
  const formatDate = (timestamp: number) => {
    try {
      return format(new Date(timestamp), 'dd.MM.yyyy HH:mm');
    } catch (error) {
      return 'Nezināms datums';
    }
  };
  
  const getRouteTypeText = (type: string) => {
    return type === 'startRoute' ? 'Brauciena sākums' : 'Brauciena beigas';
  };
  
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={[commonStyles.content, styles.webContainer]}>
        <View style={styles.header}>
          <Text style={styles.title}>Nesinhronizētie dati</Text>
          
          <View style={styles.connectionStatus}>
            <View style={[styles.statusIndicator, isConnected ? styles.connected : styles.disconnected]} />
            <Text style={styles.statusText}>
              {isConnected ? 'Savienojums ir aktīvs' : 'Nav savienojuma'}
            </Text>
          </View>
        </View>
        
        {isLoading ? (
          <View style={commonStyles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.secondary} />
          </View>
        ) : pendingRoutes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nav nesinhronizētu datu</Text>
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>
              {pendingRoutes.length} {pendingRoutes.length === 1 ? 'ieraksts gaida' : 'ieraksti gaida'} sinhronizāciju
            </Text>
            
            <FlatList
              data={pendingRoutes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <Text style={styles.itemType}>
                    {getRouteTypeText(item.type)}
                  </Text>
                  <Text style={styles.itemDate}>
                    {formatDate(item.timestamp)}
                  </Text>
                  <Text style={styles.itemRetries}>
                    Mēģinājumi: {item.retryCount}
                  </Text>
                </View>
              )}
              style={styles.list}
            />
            
            <Button
              title={isSyncing ? "Notiek sinhronizācija..." : "Sinhronizēt datus"}
              onPress={handleSync}
              disabled={!isConnected || isSyncing}
              style={[
                styles.syncButton,
                (!isConnected || isSyncing) && styles.disabledButton
              ]}
            />
          </>
        )}
        
        {/* Offline kontroles */}
        <OfflineControls />
        
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  connected: {
    backgroundColor: '#4CAF50', // Green
  },
  disconnected: {
    backgroundColor: '#F44336', // Red
  },
  statusText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    color: COLORS.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  list: {
    marginBottom: 16,
  },
  item: Platform.OS === 'web' ? {
    backgroundColor: COLORS.black100,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  } : {
    backgroundColor: COLORS.black100,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...SHADOWS.medium,
  },
  itemType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  itemDate: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  itemRetries: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  syncButton: Platform.OS === 'web' ? {
    marginTop: 16,
    ...SHADOWS.small,
  } : {
    marginTop: 16,
    ...SHADOWS.medium,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonContainer: {
    marginTop: 24,
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
