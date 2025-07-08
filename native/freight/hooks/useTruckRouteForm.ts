import {TruckObjectDto} from '@/dto/TruckObjectDto'
import {TruckRouteDto} from '@/dto/TruckRouteDto'
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useObjectStore } from '@/hooks/useObjectStore';
import { format } from 'date-fns';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useOnlineStatus } from '@/hooks/useNetwork';
import { useTruckRoute } from '@/hooks/useTruckRoute';
import { FormState } from '@/types/truckRouteTypes';
import {
	getTrucks,
	getObjects,
	getLastActiveRoute,
	getLastFinishedRoute,
	checkRoutePageExists
} from '@/utils/offlineDataManager'
import { TruckRoutePageDto } from '@/dto/TruckRoutePageDto';

export function useTruckRouteForm(params: any) {
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
        uid: '',
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
    const { startRoute, endRoute } = useTruckRoute();

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
                    uid: truckRouteForm.outTruckObject,
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
                setOutTruckObjectDetails({ uid: outUid, name: newTruckObject.name });

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
                setOutTruckObjectDetails({ uid: objectId, name: objectName });

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
                            uid: lastRoute.uid?.toString() || '',
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

            const outTruckObjectValue = selectedOutTruckObject || form.outTruckObject;
            const inTruckObjectValue = selectedInTruckObject || form.inTruckObject;

            const now = new Date().toISOString();
            
            const routeDate = form.routeDate instanceof Date ? form.routeDate : new Date(form.routeDate);
            const dateFrom = form.dateFrom instanceof Date ? form.dateFrom : new Date(form.dateFrom);
            const dateTo = form.dateTo instanceof Date ? form.dateTo : new Date(form.dateTo);

			console.log("uuuuuuuuuuuuuuu: ",user)

            const truckRoutePage: TruckRoutePageDto = {
                uid: '',
                dateFrom: format(dateFrom, 'yyyy-MM-dd'),
                dateTo: format(dateTo, 'yyyy-MM-dd'),
                truck: { uid: form.routePageTruck || '0' },
                user: { id: user?.id || '0' },
                fuelBalanceAtStart: form.fuelBalanceAtStart ? parseFloat(form.fuelBalanceAtStart) : null,
				odometerAtRouteStart: form.odometerAtStart ? parseInt(form.odometerAtStart) : 0,
				odometerAtRouteFinish: form.odometerAtFinish ? parseInt(form.odometerAtFinish) : 0,
            };

            const outTruckObject = outTruckObjectValue ? {
                uid: outTruckObjectValue,
                name: outTruckObjectDetails?.name || ''
            } : { uid: '', name: '' };
            
            const inTruckObject = inTruckObjectValue ? {
                uid: inTruckObjectValue,
                name: inTruckObjectDetails?.name || ''
            } : { uid: '', name: '' };
            
            const payload: TruckRouteDto = {
                uid: form.uid,
                routeDate: format(routeDate, 'yyyy-MM-dd'),
                truckRoutePage: truckRoutePage,
                outTruckObject: outTruckObject,
                inTruckObject: inTruckObject,
                odometerAtStart: form.odometerAtStart ? parseInt(form.odometerAtStart) : 0,
                odometerAtFinish: form.odometerAtFinish ? parseInt(form.odometerAtFinish) : 0,
                cargoVolume: hasCargo && form.cargoVolume ? parseFloat(form.cargoVolume) : 0,
                unitType: hasCargo ? form.unitType : undefined,
                fuelBalanceAtStart: form.fuelBalanceAtStart 
                    ? parseFloat(form.fuelBalanceAtStart) 
                    : existingRoutePage?.fuelBalanceAtStart !== null 
                        ? existingRoutePage?.fuelBalanceAtStart 
                        : undefined,
                fuelBalanceAtFinish: undefined,
                fuelReceived: form.fuelReceived ? parseFloat(form.fuelReceived) : undefined,
                outDateTime: now,
                inDateTime: inTruckObjectValue && isItRouteFinish ? now : undefined
            };

            if (isItRouteFinish) {
                await endRoute.mutateAsync(payload);
            } else {
                await startRoute.mutateAsync(payload);
            }
            
            router.push('/(tabs)');
        } catch (error) {
            console.error('Failed to submit form:', error);
            
            Alert.alert(
                "Kļūda",
                "Neizdevās saglabāt brauciena datus!",
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
