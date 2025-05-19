import React, { useState, useEffect, useLayoutEffect } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { commonStyles } from '@/constants/styles';
import { COLORS } from '@/constants/theme';
import { isSessionActive } from '@/utils/sessionUtils';
import { isRedirectingToLogin } from '@/config/axios';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import TabNavigation from './TabNavigation';
import RouteInfoTab from './RouteInfoTab';
import RouteAdditionalTab from './RouteAdditionalTab';
import RouteTopSection from './RouteTopSection';
import { useTruckRouteForm } from '@/hooks/useTruckRouteForm';
import { styles } from './styles';

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
    
    const [activeTab, setActiveTab] = useState(0);
    const navigation = useNavigation();
    const LAST_ROUTE_STATUS_KEY = 'lastRouteStatus';
    
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
        handleSubmit
    } = useTruckRouteForm(params);
    
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
    
    // Iestatīt sākotnējo virsrakstu, balstoties uz saglabāto statusu AsyncStorage
    useLayoutEffect(() => {
        const getInitialTitle = async () => {
            try {
                const localStatus = await AsyncStorage.getItem(LAST_ROUTE_STATUS_KEY);
                const initialIsRouteActive = localStatus === 'active';
                
                navigation.setOptions({
                    title: initialIsRouteActive ? 'Beigt braucienu' : 'Sākt braucienu'
                });
            } catch (error) {
                console.error('Failed to get route status from AsyncStorage:', error);
                navigation.setOptions({
                    title: isItRouteFinish ? 'Beigt braucienu' : 'Sākt braucienu'
                });
            }
        };
        
        getInitialTitle();
    }, [navigation]);

    // Atjaunināt virsrakstu, kad mainās isItRouteFinish vērtība
    useEffect(() => {
        navigation.setOptions({
            title: isItRouteFinish ? 'Beigt braucienu' : 'Sākt braucienu'
        });
    }, [isItRouteFinish, navigation]);
    
    if (isLoading) {
        return (
            <SafeAreaView style={commonStyles.container}>
                <View style={commonStyles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.secondary} />
                </View>
            </SafeAreaView>
        );
    }
    
    return (
        <SafeAreaView style={commonStyles.safeArea}>
            <ScrollView>
                <View style={[commonStyles.content, styles.webContainer]}>
                    {/* Augšējā daļa - vienmēr redzama */}
                    <RouteTopSection 
                        form={form}
                        setForm={setForm}
                        showRoutePageError={showRoutePageError}
                    />
                    
                    {/* Tab navigācija */}
                    <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
                    
                    {/* Tab saturs */}
                    {activeTab === 0 ? (
                        <RouteInfoTab
                            isItRouteFinish={isItRouteFinish}
                            form={form}
                            setForm={setForm}
                            hasCargo={hasCargo}
                            setHasCargo={setHasCargo}
                            showRoutePageError={showRoutePageError}
                            selectedOutTruckObject={selectedOutTruckObject}
                            selectedInTruckObject={selectedInTruckObject}
                            setSelectedOutTruckObject={setSelectedOutTruckObject}
                            setSelectedInTruckObject={setSelectedInTruckObject}
                            outTruckObjectDetails={outTruckObjectDetails}
                            inTruckObjectDetails={inTruckObjectDetails}
                            refreshDropdowns={refreshDropdowns}
                            router={router}
                            params={params}
                        />
                    ) : (
                        <RouteAdditionalTab
                            isItRouteFinish={isItRouteFinish}
                            form={form}
                            setForm={setForm}
                            hasCargo={hasCargo}
                            setHasCargo={setHasCargo}
                            selectedOutTruckObject={selectedOutTruckObject}
                            selectedInTruckObject={selectedInTruckObject}
                            setSelectedOutTruckObject={setSelectedOutTruckObject}
                            setSelectedInTruckObject={setSelectedInTruckObject}
                            outTruckObjectDetails={outTruckObjectDetails}
                            refreshDropdowns={refreshDropdowns}
                        />
                    )}
                    
                    <View style={[commonStyles.row, styles.buttonContainer]}>
                        <BackButton
                            onPress={() => router.push('/(tabs)')}
                            style={[styles.backButton, isSubmitting && commonStyles.buttonDisabled]}
                        />
                        <Button
                            title="Saglabāt"
                            onPress={handleSubmit}
                            style={[styles.submitButton, isSubmitting && commonStyles.buttonDisabled]}
                            disabled={isSubmitting}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
