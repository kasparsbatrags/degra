import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS, CONTAINER_WIDTH, FONT, SHADOWS } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { isRedirectingToLogin, redirectToLogin } from '@/config/axios';
import { isSessionActive } from '@/utils/sessionUtils';
import { startSessionTimeoutCheck, stopSessionTimeoutCheck } from '@/utils/sessionTimeoutHandler';
import { useOfflineData } from '@/hooks/useOfflineData';
import { offlineManager } from '@/services/OfflineManager';
import { CACHE_KEYS } from '@/config/offlineConfig';
import { useNetworkState } from '@/utils/networkUtils';
import freightAxiosInstance from '@/config/freightAxios';
import Button from '@/components/Button';

interface TruckRoutePage {
  id: number;
  dateFrom: string;
  dateTo: string;
  truckRegistrationNumber: string;
  fuelConsumptionNorm: number;
  fuelBalanceAtStart: number;
  totalFuelReceivedOnRoutes: number | null;
  totalFuelConsumedOnRoutes: number | null;
  fuelBalanceAtRoutesFinish: number | null;
  odometerAtRouteStart: number | null;
  odometerAtRouteFinish: number | null;
  computedTotalRoutesLength: number | null;
  activeTab?: 'basic' | 'odometer' | 'fuel';
}

const LAST_ROUTE_STATUS_KEY = 'lastRouteStatus';

export default function ImprovedHomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { isConnected } = useNetworkState();
  
  // State
  const [buttonText, setButtonText] = useState('STARTS');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusCheckLoading, setStatusCheckLoading] = useState(false);

  // Offline data hooks
  const {
    data: routes,
    isLoading: routesLoading,
    isFromCache: routesFromCache,
    isStale: routesStale,
    error: routesError,
    age: routesAge,
    refetch: refetchRoutes,
    clearCache: clearRoutesCache
  } = useOfflineData<TruckRoutePage[]>(
    CACHE_KEYS.ROUTES,
    async () => {
      const response = await freightAxiosInstance.get<TruckRoutePage[]>('/route-pages');
      return response.data.map(route => ({ ...route, activeTab: 'basic' as const }));
    },
    {
      cacheKey: CACHE_KEYS.ROUTES,
      strategy: 'stale-while-revalidate',
      onError: (error) => {
        console.error('Routes fetch error:', error);
      }
    }
  );

  const {
    data: routeStatus,
    isLoading: statusLoading,
    isFromCache: statusFromCache,
    refetch: refetchStatus,
    clearCache: clearStatusCache
  } = useOfflineData<string>(
    CACHE_KEYS.ROUTE_STATUS,
    async () => {
      try {
        await freightAxiosInstance.get('/truck-routes/last-active');
        return 'active';
      } catch (error: any) {
        if (error.response?.status === 404) {
          return 'inactive';
        }
        throw error;
      }
    },
    {
      cacheKey: CACHE_KEYS.ROUTE_STATUS,
      strategy: 'cache-first',
      onSuccess: (status) => {
        setButtonText(status === 'active' ? 'FINIŠS' : 'STARTS');
        setErrorMessage(null);
      },
      onError: (error) => {
        setErrorMessage('Neizdevās pieslēgties - serveris neatbild. Lūdzu, mēģiniet vēlreiz mazliet vēlāk!');
      }
    }
  );

  // Session check
  useEffect(() => {
    const checkSession = async () => {
      const sessionActive = await isSessionActive();
      if (!sessionActive) {
        redirectToLogin();
        return;
      }
    };
    checkSession();
  }, []);

  // Session timeout monitoring
  useEffect(() => {
    startSessionTimeoutCheck();
    return () => {
      stopSessionTimeoutCheck();
    };
  }, []);

  // Update button text based on route status
  useEffect(() => {
    if (routeStatus) {
      setButtonText(routeStatus === 'active' ? 'FINIŠS' : 'STARTS');
      // Save to AsyncStorage for backward compatibility
      AsyncStorage.setItem(LAST_ROUTE_STATUS_KEY, routeStatus);
    }
  }, [routeStatus]);

  // Handle route status check
  const checkLastRouteStatus = useCallback(async () => {
    setStatusCheckLoading(true);
    setErrorMessage(null);

    if (isRedirectingToLogin) {
      setStatusCheckLoading(false);
      return;
    }

    try {
      const sessionActive = await isSessionActive();
      if (!sessionActive) {
        redirectToLogin();
        return;
      }

      await refetchStatus(true); // Force refresh
    } catch (error) {
      console.error('Error checking route status:', error);
      setErrorMessage('Neizdevās pieslēgties - serveris neatbild. Lūdzu, mēģiniet vēlreiz mazliet vēlāk!');
    } finally {
      setStatusCheckLoading(false);
    }
  }, [refetchStatus]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (isRedirectingToLogin) return;
    
    await Promise.all([
      refetchRoutes(true),
      refetchStatus(true)
    ]);
  }, [refetchRoutes, refetchStatus]);

  // Focus effect
  useFocusEffect(
    useCallback(() => {
      if (!isRedirectingToLogin) {
        // Trigger initial load if needed
        if (!routes && !routesLoading) {
          refetchRoutes();
        }
        if (!routeStatus && !statusLoading) {
          refetchStatus();
        }
      }
    }, [routes, routesLoading, routeStatus, statusLoading, refetchRoutes, refetchStatus])
  );

  // Handle tab change for routes
  const handleTabChange = useCallback((routeId: number, tab: 'basic' | 'odometer' | 'fuel') => {
    // This would need to be implemented with proper state management
    // For now, we'll keep it simple
    console.log(`Tab changed for route ${routeId} to ${tab}`);
  }, []);

  // Calculate cache age in hours
  const getCacheAgeHours = (age: number) => Math.floor(age / (1000 * 60 * 60));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Main action button */}
        <Button
          title={buttonText}
          onPress={() => router.push('/truck-route')}
          style={styles.startTripButton}
          disabled={errorMessage !== null || statusCheckLoading}
          loading={statusCheckLoading}
        />

        {/* Error message */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Button
              title="Pārbaudīt"
              onPress={checkLastRouteStatus}
              style={styles.refreshButton}
              loading={statusCheckLoading}
            />
          </View>
        )}

        {/* Cache indicators */}
        {(routesFromCache || statusFromCache) && (
          <View style={styles.cacheIndicator}>
            <MaterialIcons name="offline-pin" size={16} color={COLORS.warning} />
            <Text style={styles.cacheText}>
              Rādīti saglabātie dati
              {routesFromCache && routesAge && (
                <Text style={styles.cacheAge}>
                  {' '}(pirms {getCacheAgeHours(routesAge)}h)
                </Text>
              )}
            </Text>
            {routesStale && (
              <Text style={styles.staleText}> - dati var būt novecojuši</Text>
            )}
          </View>
        )}

        {/* Network status */}
        {!isConnected && (
          <View style={styles.offlineIndicator}>
            <MaterialIcons name="wifi-off" size={16} color={COLORS.error} />
            <Text style={styles.offlineText}>Offline režīms</Text>
          </View>
        )}

        {/* Routes list */}
        {routesLoading ? (
          <ActivityIndicator size="large" color={COLORS.secondary} style={styles.loader} />
        ) : (
          <FlatList
            refreshControl={
              <RefreshControl
                refreshing={routesLoading}
                onRefresh={handleRefresh}
              />
            }
            data={routes || []}
            keyExtractor={(item) => item.id.toString()}
            style={styles.list}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.routeCard,
                  pressed && styles.routeCardPressed
                ]}
                onPress={() => router.push({
                  pathname: '/(tabs)/truck-route-page',
                  params: { id: item.id }
                })}
              >
                <View style={styles.routeInfo}>
                  {/* Tab buttons */}
                  <View style={styles.tabContainer}>
                    <Pressable
                      style={[
                        styles.tabButton,
                        item.activeTab === 'basic' && styles.tabButtonActive
                      ]}
                      onPress={() => handleTabChange(item.id, 'basic')}
                    >
                      {Platform.OS === 'web' ? (
                        <Text style={[
                          styles.tabText,
                          item.activeTab === 'basic' && styles.tabTextActive
                        ]}>
                          Pamatinfo
                        </Text>
                      ) : (
                        <MaterialIcons
                          name="info"
                          size={24}
                          color={item.activeTab === 'basic' ? COLORS.white : COLORS.gray}
                        />
                      )}
                    </Pressable>
                    
                    <Pressable
                      style={[
                        styles.tabButton,
                        item.activeTab === 'odometer' && styles.tabButtonActive
                      ]}
                      onPress={() => handleTabChange(item.id, 'odometer')}
                    >
                      {Platform.OS === 'web' ? (
                        <Text style={[
                          styles.tabText,
                          item.activeTab === 'odometer' && styles.tabTextActive
                        ]}>
                          Odometrs
                        </Text>
                      ) : (
                        <MaterialIcons
                          name="speed"
                          size={24}
                          color={item.activeTab === 'odometer' ? COLORS.white : COLORS.gray}
                        />
                      )}
                    </Pressable>
                    
                    <Pressable
                      style={[
                        styles.tabButton,
                        item.activeTab === 'fuel' && styles.tabButtonActive
                      ]}
                      onPress={() => handleTabChange(item.id, 'fuel')}
                    >
                      {Platform.OS === 'web' ? (
                        <Text style={[
                          styles.tabText,
                          item.activeTab === 'fuel' && styles.tabTextActive
                        ]}>
                          Degviela
                        </Text>
                      ) : (
                        <MaterialIcons
                          name="local-gas-station"
                          size={24}
                          color={item.activeTab === 'fuel' ? COLORS.white : COLORS.gray}
                        />
                      )}
                    </Pressable>
                  </View>

                  {/* Tab content */}
                  {item.activeTab === 'basic' && (
                    <View style={[styles.tabContentContainer, styles.basicTabContent]}>
                      <View style={styles.routeRow}>
                        <Text style={styles.routeLabelInline}>Periods:</Text>
                        <Text style={styles.routeText}>
                          {new Date(item.dateFrom).toLocaleDateString('lv-LV', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })} - {new Date(item.dateTo).toLocaleDateString('lv-LV', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </Text>
                      </View>
                      <View style={styles.routeRow}>
                        <Text style={styles.routeLabelInline}>Auto:</Text>
                        <Text style={styles.routeText}>{item.truckRegistrationNumber}</Text>
                      </View>
                      <View style={styles.routeRow}>
                        <Text style={styles.routeLabelInline}>Vadītājs:</Text>
                        <Text style={styles.routeText}>
                          {[user?.firstName, user?.lastName].filter(Boolean).join(' ')}
                        </Text>
                      </View>
                    </View>
                  )}

                  {item.activeTab === 'odometer' && (
                    <View style={[styles.tabContentContainer, styles.odometerTabContent]}>
                      <View style={styles.routeRow}>
                        <Text style={styles.routeLabelInline}>Startā:</Text>
                        <Text style={styles.routeText}>
                          {item.odometerAtRouteStart?.toLocaleString() ?? '0'} km
                        </Text>
                      </View>
                      <View style={styles.routeRow}>
                        <Text style={styles.routeLabelInline}>Distance:</Text>
                        <Text style={[styles.routeText, styles.highlightedText]}>
                          {item.computedTotalRoutesLength?.toLocaleString() ?? '0'} km
                        </Text>
                      </View>
                      <View style={styles.routeRow}>
                        <Text style={styles.routeLabelInline}>Finišā:</Text>
                        <Text style={styles.routeText}>
                          {item.odometerAtRouteFinish?.toLocaleString() ?? '0'} km
                        </Text>
                      </View>
                    </View>
                  )}

                  {item.activeTab === 'fuel' && (
                    <View style={[styles.tabContentContainer, styles.fuelTabContent]}>
                      <View style={styles.routeRow}>
                        <Text style={styles.routeLabelInline}>Norma:</Text>
                        <Text style={styles.routeText}>
                          {item.fuelConsumptionNorm} L/100 Km
                        </Text>
                      </View>
                      <View style={styles.routeRow}>
                        <Text style={styles.routeLabelInline}>Sākumā:</Text>
                        <Text style={styles.routeText}>{item.fuelBalanceAtStart} L</Text>
                      </View>
                      <View style={styles.routeRow}>
                        <Text style={styles.routeLabelInline}>Saņemta:</Text>
                        <Text style={[styles.routeText, styles.highlightedText]}>
                          +{item.totalFuelReceivedOnRoutes ?? '0'} L
                        </Text>
                      </View>
                      <View style={styles.routeRow}>
                        <Text style={styles.routeLabelInline}>Patērēta:</Text>
                        <Text style={[styles.routeText, styles.highlightedText]}>
                          {item.totalFuelConsumedOnRoutes ?? '0'} L
                        </Text>
                      </View>
                      <View style={styles.routeRow}>
                        <Text style={styles.routeLabelInline}>Beigās:</Text>
                        <Text style={styles.routeText}>
                          {item.fuelBalanceAtRoutesFinish ?? '0'} L
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </Pressable>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nav pieejamu maršrutu lapu</Text>
                {routesError && (
                  <Text style={styles.errorText}>{routesError}</Text>
                )}
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: Platform.OS === 'web' ? {
    flex: 1,
    paddingHorizontal: 16,
    marginVertical: 24,
    width: '100%',
    maxWidth: CONTAINER_WIDTH.web,
    alignSelf: 'center',
  } : {
    flex: 1,
    paddingHorizontal: 16,
    marginVertical: 24,
    width: CONTAINER_WIDTH.mobile,
    alignSelf: 'center',
  },
  startTripButton: Platform.OS === 'web' ? {
    marginTop: 24,
  } : {
    marginTop: 24,
    ...SHADOWS.medium,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  errorText: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  refreshButton: {
    marginTop: 12,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cacheIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 6,
    padding: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  cacheText: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.warning,
    marginLeft: 6,
  },
  cacheAge: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  staleText: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: COLORS.error,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  offlineText: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.error,
    marginLeft: 6,
  },
  loader: {
    marginTop: 24,
  },
  list: {
    marginTop: 16,
  },
  routeCard: Platform.OS === 'web' ? {
    backgroundColor: COLORS.black100,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  } : {
    backgroundColor: COLORS.black100,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...SHADOWS.medium,
  },
  routeCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  routeInfo: {
    marginBottom: 8,
  },
  tabContainer: Platform.OS === 'web' ? {
    flexDirection: 'row',
    marginBottom: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.black200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomWidth: 0,
  } : {
    flexDirection: 'row',
    marginBottom: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.black200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomWidth: 0,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tabButtonActive: Platform.OS === 'web' ? {
    backgroundColor: COLORS.secondary,
    ...SHADOWS.small,
  } : {
    backgroundColor: COLORS.secondary,
    ...SHADOWS.medium,
  },
  tabText: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: COLORS.gray,
  },
  tabTextActive: {
    color: COLORS.white,
    fontFamily: FONT.semiBold,
  },
  tabContentContainer: Platform.OS === 'web' ? {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  } : {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...SHADOWS.medium,
  },
  basicTabContent: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  odometerTabContent: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.highlight,
  },
  fuelTabContent: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gray,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeLabelInline: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: COLORS.gray,
    marginRight: 8,
    flex: 0.33,
  },
  routeText: {
    fontSize: 16,
    fontFamily: FONT.semiBold,
    color: COLORS.white,
    flex: 0.67,
    textAlign: 'right',
  },
  highlightedText: {
    color: COLORS.highlight,
    fontFamily: FONT.semiBold,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
});
