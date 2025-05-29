import React, { useState, useEffect, useLayoutEffect } from 'react';
import { ActivityIndicator, ScrollView, View, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { commonStyles } from '@/constants/styles';
import { COLORS } from '@/constants/theme';
import { isSessionActive } from '@/utils/sessionUtils';
import { isRedirectingToLogin } from '@/config/axios';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import TabNavigation from './TabNavigation';
import RouteBasicTab from './RouteBasicTab';
import RouteOdometerTab from './RouteOdometerTab';
import RouteFuelTab from './RouteFuelTab';
import { useTruckRouteForm } from '@/hooks/useTruckRouteForm';
import { styles } from './styles';

// NEW: Import offline hooks and components
import { useOfflineData } from '@/hooks/useOfflineData';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { CACHE_KEYS } from '@/config/offlineConfig';
import GlobalOfflineIndicator from '@/components/GlobalOfflineIndicator';
import freightAxiosInstance from '@/config/freightAxios';

export default function TruckRouteScreen() {
    const params = useLocalSearchParams<{
        id: string;
        outTruckObject?: string;
        inTruckObject?: string;
        outTruckObjectName?: string;
        inTruckObjectName?: string;
        newObject?: string;
        isRouteActive?: string;
    }>();
    
    const [activeTab, setActiveTab] = useState<'basic' | 'odometer' | 'fuel'>('basic');
    const navigation = useNavigation();
    
    // NEW: Use offline data for route status instead of AsyncStorage
    const {
        data: routeStatus,
        isLoading: statusLoading,
        isFromCache: statusFromCache,
        isStale: statusStale,
        error: statusError,
        refetch: refetchStatus
    } = useOfflineData(
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
            strategy: 'cache-first',
            onError: (error) => {
                console.error('Failed to fetch route status:', error);
            }
        }
    );

    // NEW: Use network status hook
    const { isOnline, isOfflineMode } = useNetworkStatus();
    
    // Izmantojam pielāgoto hook
    const {
        isLoading,
        hasCargo,
        setHasCargo,
        showRoutePageError,
        isItRouteFinish,
        outTruckObjectDetails,
        inTruckObjectDetails,
        refreshDropdowns,
        selectedOutTruckObject,
        setSelectedOutTruckObject,
        selectedInTruckObject,
        setSelectedInTruckObject,
        form,
        setForm,
        isSubmitting,
        handleSubmit: originalHandleSubmit
    } = useTruckRouteForm(params);

    // NEW: Determine route finish status from offline data
    const isRouteFinish = routeStatus === 'active';
    
    // Check session status when component is loaded
    useEffect(() => {
        const checkSession = async () => {
            const sessionActive = await isSessionActive();
            if (!sessionActive && !isRedirectingToLogin) {
                router.replace('/login');
            }
        };

        checkSession();
    }, [router]);
    
    // NEW: Set title based on offline route status
    useLayoutEffect(() => {
        const title = isRouteFinish ? 'Beigt braucienu' : 'Sākt braucienu';
        navigation.setOptions({ title });
    }, [isRouteFinish, navigation]);

    // NEW: Update title when route status changes
    useEffect(() => {
        if (routeStatus) {
            const title = routeStatus === 'active' ? 'Beigt braucienu' : 'Sākt braucienu';
            navigation.setOptions({ title });
        }
    }, [routeStatus, navigation]);
    
    // Validācijas funkcija, kas pārbauda obligātos laukus un pārslēdz uz atbilstošo tabu, ja kāds lauks nav aizpildīts
    const validateForm = () => {
        // Pārbaudīt basic tab laukus
        if (!form.routePageTruck || !form.outTruckObject) {
            setActiveTab('basic');
            return false;
        }
        
        // Pārbaudīt odometer tab laukus
        if (!form.odometerAtStart || (isRouteFinish && !form.odometerAtFinish)) {
            setActiveTab('odometer');
            return false;
        }
        
        // Pārbaudīt fuel tab laukus
        if (!form.fuelBalanceAtStart) {
            setActiveTab('fuel');
            return false;
        }
        
        return true;
    };

    // NEW: Enhanced handleSubmit with offline support
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }
        
        // NEW: Check if we're offline and show appropriate message
        if (!isOnline) {
            Alert.alert(
                "Offline režīms", 
                "Dati tiks saglabāti lokāli un nosūtīti, kad būs pieejams internets.",
                [
                    { text: "Atcelt", style: "cancel" },
                    { 
                        text: "Saglabāt", 
                        onPress: async () => {
                            await originalHandleSubmit();
                            // Refresh route status after submit
                            await refetchStatus();
                        }
                    }
                ]
            );
        } else {
            await originalHandleSubmit();
            // Refresh route status after submit
            await refetchStatus();
        }
    };
    
    // NEW: Show loading if either form or status is loading
    if (isLoading || statusLoading) {
        return (
            <SafeAreaView style={commonStyles.container}>
                <View style={commonStyles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.secondary} />
                </View>
            </SafeAreaView>
        );
    }
    
    // Kopējie props, ko padot visām tab komponentēm
    const tabProps = {
        isItRouteFinish: isRouteFinish, // NEW: Use offline data
        form,
        setForm,
        hasCargo,
        setHasCargo,
        showRoutePageError,
        selectedOutTruckObject,
        selectedInTruckObject,
        setSelectedOutTruckObject,
        setSelectedInTruckObject,
        outTruckObjectDetails,
        inTruckObjectDetails,
        refreshDropdowns,
        router,
        params
    };
    
    return (
        <SafeAreaView style={commonStyles.safeArea}>
            <ScrollView>
                <View style={[commonStyles.content, styles.webContainer]}>
                    {/* NEW: Add offline indicator */}
                    <GlobalOfflineIndicator />

                    {/* NEW: Show cache status if data is from cache */}
                    {statusFromCache && (
                        <View style={{
                            backgroundColor: 'rgba(255, 193, 7, 0.1)',
                            borderRadius: 8,
                            padding: 12,
                            marginBottom: 16,
                        }}>
                            <Text style={{ fontSize: 12, color: COLORS.warning }}>
                                📱 Maršruta statuss no cache
                                {statusStale && ' (dati var būt novecojuši)'}
                            </Text>
                        </View>
                    )}

                    {/* NEW: Show error if status failed to load and no cache */}
                    {statusError && !statusFromCache && (
                        <View style={{
                            backgroundColor: 'rgba(255, 0, 0, 0.1)',
                            borderRadius: 8,
                            padding: 12,
                            marginBottom: 16,
                        }}>
                            <Text style={{
                                fontSize: 14,
                                color: '#FF6B6B',
                                textAlign: 'center',
                                marginBottom: 8,
                            }}>
                                ⚠️ Neizdevās ielādēt maršruta statusu
                            </Text>
                            <Button
                                title="Mēģināt vēlreiz"
                                onPress={() => refetchStatus()}
                                style={{
                                    backgroundColor: COLORS.secondary,
                                    borderRadius: 8,
                                    paddingVertical: 8,
                                }}
                            />
                        </View>
                    )}
                    
                    {/* Tab navigācija */}
                    <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
                    
                    {/* Tab saturs */}
                    {activeTab === 'basic' && <RouteBasicTab {...tabProps} />}
                    {activeTab === 'odometer' && <RouteOdometerTab {...tabProps} />}
                    {activeTab === 'fuel' && <RouteFuelTab {...tabProps} />}
                    
                    <View style={[commonStyles.row, styles.buttonContainer]}>
                        <BackButton
                            onPress={() => router.push('/(tabs)')}
                            style={[styles.backButton, isSubmitting && commonStyles.buttonDisabled]}
                        />
                        <Button
                            title={isOnline ? "Saglabāt" : "Saglabāt (Offline)"}
                            onPress={handleSubmit}
                            style={[
                                styles.submitButton, 
                                isSubmitting && commonStyles.buttonDisabled,
                                !isOnline && { backgroundColor: COLORS.warning }
                            ]}
                            disabled={isSubmitting}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
