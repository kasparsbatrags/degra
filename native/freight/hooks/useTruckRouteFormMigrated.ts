import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useObjectStore } from '@/hooks/useObjectStore';
import { format } from 'date-fns';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useNetworkState } from '@/utils/networkUtils';
import { useTruckRoute } from '@/hooks/useTruckRoute';
import freightAxios from '@/config/freightAxios';
import { FormState, TruckRoutePageDto, TruckRouteDto, TruckObjectDto, Page } from '@/types/truckRouteTypes';
import { getTrucks, getObjects, createObject, getLastActiveRoute, getLastFinishedRoute, checkRoutePageExists } from '@/utils/offlineDataManagerExtended';

export function useTruckRouteFormMigrated(params: any) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(() => !params?.newObject && !!params.id);
    const [hasCargo, setHasCargo] = useState(false);
    const [showRoutePageError, setShowRoutePageError] = useState(false);
    const [isItRouteFinish, setIsRouteFinish] = useState(false);
    const [existingRoutePage, setExistingRoutePage] = useState<TruckRoutePageDto | null>(null);
    const [outTruckObjectDetails, setOutTruckObjectDetails] = useState<TruckObjectDto | null>(null);
    const [inTruckObjectDetails, setInTruckObjectDetails] = useState<TruckObjectDto | null>(null);
    const [refreshDropdowns, setRefreshDropdowns] = useState(0);
    const [objectsList, setObjectsList] = useState<{id: string, name: string}[]>([]);
    const [selectedOutTruckObject, setSelectedOutTruckObject] = useState<string>('');
    const [selectedInTruckObject, setSelectedInTruckObject] = useState<string>('');
    const [form, setForm] = useState<FormState>({
        id: '',
        routeDate: new Date(),
        outDateTime: new Date(),
        dateFrom: new Date(),
        dateTo: new Date(),
        routePageTruck: '',
        odometerAtStart: '',
        odometerAtFinish: '',
        outTruckObject: '',
        inTruckObject: '',
        cargoType: '',
        cargoVolume: '',
        unitType: '',
        fuelBalanceAtStart: '',
        fuelReceived: '',
        notes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { newTruckObject, clearNewTruckObject, truckRouteForm, updateTruckRouteForm } = useObjectStore();
    const { isConnected } = useNetworkState();
    const { startRoute, endRoute } = useTruckRoute();

    // Konstante AsyncStorage atslēgai
    const LAST_ROUTE_STATUS_KEY = 'lastRouteStatus';

    // Function to fetch objects list (offline-first)
    const fetchObjectsList = useCallback(async () => {
        try {
            const objects = await getObjects();
            const formattedOptions = objects.map(item => ({
                id: String(item.uid || item.id || item.server_id),
                name: String(item.name || item)
            }));
            setObjectsList(formattedOptions);
            console.log('Loaded objects using offline-first approach:', formattedOptions.length);
        } catch (error) {
            console.error('Failed to fetch objects list:', error);
        }
    }, []);

    const checkRoutePage = useCallback((() => {
        let timeoutId: NodeJS.Timeout;
        return async (truckId: string, date: Date) => {
            if (!truckId || !date) return;

            // Clear previous timeout
            if (timeoutId) clearTimeout(timeoutId);

            // Set new timeout
            timeoutId = setTimeout(async () => {
                try {
                    const formattedDate = format(date, 'yyyy-MM-dd');
                    // Use offline-first route page check
                    const routePage = await checkRoutePageExists(truckId, formattedDate);
                    if (routePage) {
                        setExistingRoutePage(routePage);
                        setShowRoutePageError(false);
                    } else {
                        setExistingRoutePage(null);
                        setShowRoutePageError(true);
                    }
                } catch (error: any) {
                    console.error('Failed to check route page:', error);
                    setExistingRoutePage(null);
                    setShowRoutePageError(true);
                }
            }, 300);
        };
    })(), []);

    useEffect(() => {
        // If there is saved data in store, use it
        if (truckRouteForm.outTruckObject && !selectedOutTruckObject) {
            setSelectedOutTruckObject(truckRouteForm.outTruckObject);
            setForm(prev => ({
                ...prev,
                outTruckObject: truckRouteForm.outTruckObject
            }));

            if (truckRouteForm.outTruckObjectName) {
                setOutTruckObjectDetails({
                    id: parseInt(truckRouteForm.outTruckObject),
                    name: truckRouteForm.outTruckObjectName
                });
            }
        }

        if (truckRouteForm.inTruckObject && !selectedInTruckObject) {
            setSelectedInTruckObject(truckRouteForm.inTruckObject);
            setForm(prev => ({
                ...prev,
                inTruckObject: truckRouteForm.inTruckObject
            }));

            if (truckRouteForm.inTruckObjectName) {
                setInTruckObjectDetails({
                    uid: truckRouteForm.inTruckObject,
                    name: truckRouteForm.inTruckObjectName
                });
            }
        }
    }, []);

    // Update store when values change
    useEffect(() => {
        // Update store when values change
        if (selectedOutTruckObject || selectedInTruckObject) {
            updateTruckRouteForm({
                outTruckObject: selectedOutTruckObject,
                outTruckObjectName: outTruckObjectDetails?.name || '',
                inTruckObject: selectedInTruckObject,
                inTruckObjectName: inTruckObjectDetails?.name || ''
            });
        }
    }, [selectedOutTruckObject, selectedInTruckObject, outTruckObjectDetails, inTruckObjectDetails, updateTruckRouteForm]);

    useEffect(() => {
        if (newTruckObject) {
            setRefreshDropdowns(prev => prev + 1);

            if (newTruckObject.type === 'inTruckObject') {
                // Try to get UID from known fields
                const inUid = (typeof newTruckObject === 'object' && ('uid' in newTruckObject))
                    ? (newTruckObject as any).uid
                    : (newTruckObject.id || '');
                setSelectedInTruckObject(inUid);
                setForm(prev => ({ ...prev, inTruckObject: inUid }));
                setInTruckObjectDetails({ uid: inUid, name: newTruckObject.name });

                // Also update store
                updateTruckRouteForm({
                    inTruckObject: inUid,
                    inTruckObjectName: newTruckObject.name
                });
            } else if (newTruckObject.type === 'outTruckObject') {
                const outUid = (typeof newTruckObject === 'object' && ('uid' in newTruckObject))
                    ? (newTruckObject as any).uid
                    : (newTruckObject.id || '');
                setSelectedOutTruckObject(outUid);
                setForm(prev => ({ ...prev, outTruckObject: outUid }));
                setOutTruckObjectDetails({ id: outUid, name: newTruckObject.name });

                // Also update store
                updateTruckRouteForm({
                    outTruckObject: outUid,
                    outTruckObjectName: newTruckObject.name
                });
            }
            clearNewTruckObject();
        }
    }, [newTruckObject, updateTruckRouteForm, clearNewTruckObject]);

    // Fetch objects list when refreshDropdowns changes
    useEffect(() => {
        fetchObjectsList();
    }, [refreshDropdowns, fetchObjectsList]);

    useEffect(() => {
        if (params.newObject === 'true') {
            setRefreshDropdowns(prev => prev + 1);

            // Use data from store, not from params
            if (truckRouteForm.outTruckObject) {
                const objectId = truckRouteForm.outTruckObject;
                const objectName = truckRouteForm.outTruckObjectName || '';

                setSelectedOutTruckObject(objectId);
                setForm(prev => ({
                    ...prev,
                    outTruckObject: objectId
                }));
                setOutTruckObjectDetails({ id: parseInt(objectId), name: objectName });

                setObjectsList(prev => {
                    const exists = prev.some(obj => obj.id === objectId);
                    if (!exists) return [...prev, { id: objectId, name: objectName }];
                    return prev;
                });
            }

            if (truckRouteForm.inTruckObject) {
                const objectId = truckRouteForm.inTruckObject;
                const objectName = truckRouteForm.inTruckObjectName || '';

                setSelectedInTruckObject(objectId);
                setForm(prev => ({
                    ...prev,
                    inTruckObject: objectId
                }));
                setInTruckObjectDetails({ uid: objectId, name: objectName });

                setObjectsList(prev => {
                    const exists = prev.some(obj => obj.id === objectId);
                    if (!exists) return [...prev, { id: objectId, name: objectName }];
                    return prev;
                });
            }

            fetchObjectsList();
        }
    }, [params.newObject, truckRouteForm, fetchObjectsList]);

    useEffect(() => {
        // Skip initialization if we're handling a new object
        if (params.newObject === 'true') {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const initializeForm = async () => {
            try {
                // Get last active route using offline-first approach
                try {
                    const lastRoute = await getLastActiveRoute();
                    if (lastRoute) {
                        setIsRouteFinish(true);

                        // Set hasCargo based on whether cargoVolume exists
                        setHasCargo(!!lastRoute.cargoVolume);

                        // Convert dates from string to Date objects
                        const routeDate = lastRoute.routeDate ? new Date(lastRoute.routeDate) : new Date();
                        const outDateTime = lastRoute.outDateTime ? new Date(lastRoute.outDateTime) : new Date();

                        const outTruckObjectId = lastRoute.outTruckObject?.id?.toString() || '';
                        const inTruckObjectId = lastRoute.inTruckObject?.id?.toString() || '';

                        // Set the selected object state variables
                        setSelectedOutTruckObject(outTruckObjectId);
                        setSelectedInTruckObject(inTruckObjectId);

                        // Set the form state
                        setForm({
                            id: lastRoute.id?.toString() || '',
                            routeDate,
                            outDateTime,
                            dateFrom: lastRoute.truckRoutePage?.dateFrom ? new Date(lastRoute.truckRoutePage.dateFrom) : new Date(),
                            dateTo: lastRoute.truckRoutePage?.dateTo ? new Date(lastRoute.truckRoutePage.dateTo) : new Date(),
                            routePageTruck: lastRoute.truckRoutePage?.truck?.id?.toString() || '',
                            odometerAtStart: lastRoute.odometerAtStart?.toString() || '',
                            odometerAtFinish: lastRoute.odometerAtFinish?.toString() || '',
                            outTruckObject: outTruckObjectId,
                            inTruckObject: inTruckObjectId,
                            cargoType: '',  // Not provided in the response
                            cargoVolume: lastRoute.cargoVolume?.toString() || '',
                            unitType: lastRoute.unitType || '',
                            fuelBalanceAtStart: lastRoute.fuelBalanceAtStart?.toString() || '',
                            fuelReceived: lastRoute.fuelReceived?.toString() || '',
                            notes: '',  // Not provided in the response
                        });

                        // Set the object details
                        if (lastRoute.outTruckObject) {
                            setOutTruckObjectDetails(lastRoute.outTruckObject);
                        }
                        if (lastRoute.inTruckObject) {
                            setInTruckObjectDetails(lastRoute.inTruckObject);
                        }

                        console.log('Loaded last active route using offline-first approach');
                    } else {
                        // No active route found
                        setIsRouteFinish(false);
                        
                        // Get last finished route for odometer value using offline-first approach
                        const lastFinishedRoute = await getLastFinishedRoute();

                        // Get trucks using offline-first approach
                        const trucks = await getTrucks();
                        if (trucks && trucks.length > 0) {
                            const defaultTruck = trucks[0].uid?.toString() || trucks[0].server_id?.toString() || trucks[0].id?.toString() || '';
                            const currentDate = new Date();
                            const outTruckObjectId = lastFinishedRoute?.outTruckObject?.id?.toString() || '';

                            // Set the selected object state variables
                            setSelectedOutTruckObject(outTruckObjectId);

                            // Set the form state
                            setForm(prev => ({
                                ...prev,
                                routeDate: currentDate,
                                routePageTruck: defaultTruck,
                                odometerAtStart: lastFinishedRoute?.odometerAtFinish?.toString() || '',
                                outTruckObject: outTruckObjectId,
                                fuelBalanceAtStart: lastFinishedRoute?.fuelBalanceAtFinish?.toString() || ''
                            }));

                            // Set the object details
                            if (lastFinishedRoute?.outTruckObject) {
                                setOutTruckObjectDetails(lastFinishedRoute.outTruckObject);
                            }

                            console.log('Loaded default truck and last finished route using offline-first approach');
                        }
                    }
                } catch (error) {
                    console.error('Failed to initialize form with offline-first data:', error);
                }
            } catch (error) {
                console.error('Failed to initialize form:', error);
            } finally {
                setIsLoading(false);
            }
        };
        initializeForm();
    }, [checkRoutePage, params.newObject]);

    // Check route page when either truck or date changes, but not on initial mount
    useEffect(() => {
        const isInitialMount = !form.routePageTruck;
        if (!isInitialMount) {
            checkRoutePage(form.routePageTruck, form.routeDate);
        }
    }, [form.routePageTruck, form.routeDate, checkRoutePage]);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            // Make sure we're using the proper values from both state variables and form
            const outTruckObjectValue = selectedOutTruckObject || form.outTruckObject;
            const inTruckObjectValue = selectedInTruckObject || form.inTruckObject;

            const now = new Date().toISOString();
            const payload: TruckRouteDto = {
                uid: form.id || null,
                routeDate: format(form.routeDate, 'yyyy-MM-dd'),
                truckRoutePage: form.routePageTruck ? {
                    uid: form.routePageTruck,
                    dateFrom: format(form.dateFrom instanceof Date ? form.dateFrom : new Date(form.dateFrom), 'yyyy-MM-dd'),
                    dateTo: format(form.dateTo instanceof Date ? form.dateTo : new Date(form.dateTo), 'yyyy-MM-dd'),
                    truck: {uid: form.routePageTruck},
                    user: {uid: user?.id || '0'},
                    fuelBalanceAtStart: form.fuelBalanceAtStart ? parseFloat(form.fuelBalanceAtStart) : null,
                } : null,
                outTruckObject: outTruckObjectValue ?
                        (outTruckObjectDetails ? {uid: outTruckObjectValue, name: outTruckObjectDetails.name} : {uid: outTruckObjectValue}) : null,
                inTruckObject: inTruckObjectValue ?
                        (inTruckObjectDetails ? {uid: inTruckObjectValue, name: inTruckObjectDetails.name} : {uid: inTruckObjectValue}) : null,
                odometerAtStart: form.odometerAtStart ? parseInt(form.odometerAtStart) : null,
                odometerAtFinish: form.odometerAtFinish ? parseInt(form.odometerAtFinish) : null,
                cargoVolume: hasCargo && form.cargoVolume ? parseFloat(form.cargoVolume) : null,
                unitType: hasCargo ? form.unitType : null,
                fuelBalanceAtStart: form.fuelBalanceAtStart ? parseFloat(form.fuelBalanceAtStart) : existingRoutePage ? existingRoutePage.fuelBalanceAtStart : null,
                fuelBalanceAtFinish: null,
                fuelReceived: form.fuelReceived ? parseFloat(form.fuelReceived) : null,
                outDateTime: now,
                inDateTime: inTruckObjectValue && isItRouteFinish ? now : null
            };

            // Debug logging
            console.log('🚛 [DEBUG] Form routePageTruck value:', form.routePageTruck);
            console.log('🚛 [DEBUG] Payload truck UID:', payload.truckRoutePage?.truck?.uid);
			console.log('🚛 [DEBUG] Payload outTruckObject UID:', payload.outTruckObject?.uid);
			console.log('🚛 [DEBUG] Payload inTruckObject UID:', payload.inTruckObject?.uid);
            console.log('🚛 [DEBUG] Full payload:', JSON.stringify(payload, null, 2));

            if (isItRouteFinish) {
                // Izmantojam endRoute hook funkciju
                await endRoute.mutateAsync(payload);
                
                // Parādām paziņojumu, ja nav savienojuma
                if (!isConnected) {
                    Alert.alert(
                        "Offline režīms",
                        "Brauciena dati ir saglabāti lokāli un tiks sinhronizēti, kad būs pieejams internets.",
                        [{ text: "OK" }]
                    );
                }
            } else {
                // Izmantojam startRoute hook funkciju
                await startRoute.mutateAsync(payload);
                
                // Parādām paziņojumu, ja nav savienojuma
                if (!isConnected) {
                    Alert.alert(
                        "Offline režīms",
                        "Brauciena dati ir saglabāti lokāli un tiks sinhronizēti, kad būs pieejams internets.",
                        [{ text: "OK" }]
                    );
                }
            }
            
            // Saglabājam brauciena statusu lokāli
            await AsyncStorage.setItem(LAST_ROUTE_STATUS_KEY, isItRouteFinish ? 'inactive' : 'active');
            
            router.push('/(tabs)');
        } catch (error) {
            console.error('Failed to submit form:', error);
            
            // Parādām kļūdas paziņojumu
            Alert.alert(
                "Kļūda",
                "Neizdevās saglabāt brauciena datus. Lūdzu, mēģiniet vēlreiz.",
                [{ text: "OK" }]
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isLoading,
        hasCargo,
        setHasCargo,
        showRoutePageError,
        isItRouteFinish,
        existingRoutePage,
        outTruckObjectDetails,
        inTruckObjectDetails,
        refreshDropdowns,
        objectsList,
        selectedOutTruckObject,
        setSelectedOutTruckObject,
        selectedInTruckObject,
        setSelectedInTruckObject,
        form,
        setForm,
        isSubmitting,
        handleSubmit,
        checkRoutePage,
        fetchObjectsList
    };
}
